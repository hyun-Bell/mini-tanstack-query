import { QueryClient } from '../src/queryClient';

describe('QueryClient', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    // 각 테스트마다 새로운 QueryClient 인스턴스 생성
    queryClient = new QueryClient();
    // Jest 타이머 모의 객체 초기화
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  afterEach(() => {
    // 모든 mock 초기화
    jest.clearAllMocks();
  });

  describe('기본 기능', () => {
    it('인스턴스를 생성할 수 있어야 한다', () => {
      expect(queryClient).toBeInstanceOf(QueryClient);
    });
  });

  describe('setQueryData / getQueryData', () => {
    it('데이터를 저장하고 조회할 수 있어야 한다', () => {
      const testData = { id: 1, name: 'Test User' };

      queryClient.setQueryData(['user', 1], testData);
      const data = queryClient.getQueryData(['user', 1]);

      expect(data).toEqual(testData);
    });

    it('존재하지 않는 쿼리 데이터는 undefined를 반환해야 한다', () => {
      const data = queryClient.getQueryData(['nonexistent']);

      expect(data).toBeUndefined();
    });

    it('동일한 쿼리 키로 데이터를 덮어쓸 수 있어야 한다', () => {
      const oldData = { id: 1, name: 'Old User' };
      const newData = { id: 1, name: 'New User' };

      queryClient.setQueryData(['user', 1], oldData);
      queryClient.setQueryData(['user', 1], newData);
      const data = queryClient.getQueryData(['user', 1]);

      expect(data).toEqual(newData);
    });

    it('파라미터가 포함된 복잡한 쿼리 키를 처리할 수 있어야 한다', () => {
      const userData = { id: 1, name: 'John' };

      queryClient.setQueryData(['user', 1], userData);
      const data = queryClient.getQueryData(['user', 1]);

      expect(data).toEqual(userData);
    });

    it('객체가 포함된 쿼리 키를 처리할 수 있어야 한다', () => {
      const todosData = [{ id: 1, text: 'Learn TDD' }];

      queryClient.setQueryData(['todos', { status: 'done' }], todosData);
      const data = queryClient.getQueryData(['todos', { status: 'done' }]);

      expect(data).toEqual(todosData);
    });
  });

  describe('fetchQuery', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('데이터를 가져와서 캐시에 저장해야 한다', async () => {
      const mockData = { id: 1, title: 'Test Todo' };
      const queryFn = jest.fn().mockResolvedValue(mockData);

      const data = await queryClient.fetchQuery({
        queryKey: ['todo', 1],
        queryFn,
      });

      expect(queryFn).toHaveBeenCalledTimes(1);
      expect(data).toEqual(mockData);
      expect(queryClient.getQueryData(['todo', 1])).toEqual(mockData);
    });

    it('이미 fresh한 데이터가 있으면 queryFn을 호출하지 않아야 한다', async () => {
      const existingData = { id: 1, title: 'Existing Todo' };
      const queryFn = jest.fn();

      // 미리 데이터 설정 (현재 시간으로)
      queryClient.setQueryData(['todo', 1], existingData);

      // 시간이 지나지 않았다고 가정
      jest.advanceTimersByTime(0);

      const data = await queryClient.fetchQuery({
        queryKey: ['todo', 1],
        queryFn,
        staleTime: 1000 * 60, // 1분
      });

      expect(queryFn).not.toHaveBeenCalled();
      expect(data).toEqual(existingData);
    });

    it('stale한 데이터는 다시 fetch해야 한다', async () => {
      const existingData = { id: 1, title: 'Existing Todo' };
      const newData = { id: 1, title: 'New Todo' };
      const queryFn = jest.fn().mockResolvedValue(newData);

      // 미리 데이터 설정
      queryClient.setQueryData(['todo', 1], existingData);

      // 2분 경과
      jest.advanceTimersByTime(1000 * 60 * 2);

      const data = await queryClient.fetchQuery({
        queryKey: ['todo', 1],
        queryFn,
        staleTime: 1000 * 60, // 1분
      });

      expect(queryFn).toHaveBeenCalledTimes(1);
      expect(data).toEqual(newData);
    });
  });

  describe('중복 쿼리 방지', () => {
    it('동일한 쿼리가 동시에 여러 번 호출되어도 한 번만 실행해야 한다', async () => {
      const queryFn = jest
        .fn()
        .mockImplementation(
          () =>
            new Promise((resolve) => setTimeout(() => resolve({ id: 1 }), 100)),
        );

      // 동시에 3번 호출
      const promise1 = queryClient.fetchQuery({
        queryKey: ['duplicate'],
        queryFn,
      });
      const promise2 = queryClient.fetchQuery({
        queryKey: ['duplicate'],
        queryFn,
      });
      const promise3 = queryClient.fetchQuery({
        queryKey: ['duplicate'],
        queryFn,
      });

      const [data1, data2, data3] = await Promise.all([
        promise1,
        promise2,
        promise3,
      ]);

      // queryFn은 한 번만 호출되어야 함
      expect(queryFn).toHaveBeenCalledTimes(1);

      // 모두 같은 데이터를 받아야 함
      expect(data1).toEqual({ id: 1 });
      expect(data2).toEqual({ id: 1 });
      expect(data3).toEqual({ id: 1 });
    });

    it('진행 중인 쿼리가 완료되면 Promise를 정리해야 한다', async () => {
      let resolveQuery: (value: any) => void;
      const queryFn = jest.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveQuery = resolve;
          }),
      );

      // 첫 번째 쿼리 시작
      const promise1 = queryClient.fetchQuery({
        queryKey: ['cleanup'],
        queryFn,
      });

      expect(queryFn).toHaveBeenCalledTimes(1);

      // 쿼리 완료
      resolveQuery!({ id: 1 });
      await promise1;

      // 두 번째 쿼리 - 새로운 queryFn 호출이 되어야 함
      queryFn.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveQuery = resolve;
          }),
      );

      const promise2 = queryClient.fetchQuery({
        queryKey: ['cleanup'],
        queryFn,
      });

      resolveQuery!({ id: 2 });
      await promise2;

      expect(queryFn).toHaveBeenCalledTimes(2);
    });
  });
});
