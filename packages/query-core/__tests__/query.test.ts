import { Query } from '../src/query';
import { QueryClient } from '../src/queryClient';

describe('Query', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
  });

  describe('기본 생성', () => {
    it('Query 인스턴스를 생성할 수 있어야 한다', () => {
      const query = new Query({
        queryClient,
        queryKey: ['test'],
        queryFn: async () => 'data',
      });

      expect(query).toBeInstanceOf(Query);
      expect(query.queryKey).toEqual(['test']);
      expect(query.queryHash).toBe(JSON.stringify(['test']));
    });

    it('초기 상태는 pending이어야 한다', () => {
      const query = new Query({
        queryClient,
        queryKey: ['test'],
        queryFn: async () => 'data',
      });

      expect(query.state).toEqual({
        data: undefined,
        error: null,
        status: 'pending',
        fetchStatus: 'idle',
        dataUpdatedAt: 0,
        errorUpdatedAt: 0,
        isInvalidated: false,
        isPaused: false,
      });
    });

    it('옵션을 통해 초기 데이터를 설정할 수 있어야 한다', () => {
      const initialData = { id: 1, name: 'Initial' };
      const query = new Query({
        queryClient,
        queryKey: ['test'],
        queryFn: async () => ({ id: 2, name: 'Data' }),
        initialData,
      });

      expect(query.state.status).toBe('success');
      expect(query.state.data).toEqual(initialData);
      expect(query.state.dataUpdatedAt).toBeGreaterThan(0);
    });
  });

  describe('fetch 실행', () => {
    it('성공적으로 데이터를 가져와야 한다', async () => {
      const queryFn = jest.fn().mockResolvedValue('test data');
      const query = new Query({
        queryClient,
        queryKey: ['test'],
        queryFn,
      });

      const result = await query.fetch();

      expect(result).toBe('test data');
      expect(query.state).toMatchObject({
        status: 'success',
        data: 'test data',
        error: null,
        fetchStatus: 'idle',
      });
      expect(query.state.dataUpdatedAt).toBeGreaterThan(0);
      expect(queryFn).toHaveBeenCalledTimes(1);
    });

    it('에러가 발생하면 error 상태가 되어야 한다', async () => {
      const error = new Error('fetch failed');
      const queryFn = jest.fn().mockRejectedValue(error);
      const query = new Query({
        queryClient,
        queryKey: ['test'],
        queryFn,
      });

      await expect(query.fetch()).rejects.toThrow('fetch failed');

      expect(query.state).toMatchObject({
        status: 'error',
        error,
        data: undefined,
        fetchStatus: 'idle',
      });
      expect(query.state.errorUpdatedAt).toBeGreaterThan(0);
    });

    it('fetch 중에는 fetchStatus가 fetching이어야 한다', async () => {
      let resolveFetch: (value: string) => void;
      const queryFn = jest.fn().mockImplementation(
        () =>
          new Promise<string>((resolve) => {
            resolveFetch = resolve;
          }),
      );

      const query = new Query({
        queryClient,
        queryKey: ['test'],
        queryFn,
      });

      const fetchPromise = query.fetch();

      // fetch 시작 직후 상태 확인
      expect(query.state.fetchStatus).toBe('fetching');
      expect(query.state.status).toBe('pending');

      // fetch 완료
      resolveFetch!('data');
      await fetchPromise;

      expect(query.state.fetchStatus).toBe('idle');
      expect(query.state.status).toBe('success');
    });
  });

  describe('중복 fetch 방지', () => {
    it('이미 fetch 중이면 동일한 Promise를 반환해야 한다', async () => {
      const queryFn = jest
        .fn()
        .mockImplementation(
          () =>
            new Promise((resolve) => setTimeout(() => resolve('data'), 100)),
        );

      const query = new Query({
        queryClient,
        queryKey: ['test'],
        queryFn,
      });

      const promise1 = query.fetch();
      const promise2 = query.fetch();
      const promise3 = query.fetch();

      expect(promise1).toBe(promise2);
      expect(promise2).toBe(promise3);
      expect(queryFn).toHaveBeenCalledTimes(1);

      await Promise.all([promise1, promise2, promise3]);
    });
  });
});
