import { QueryClient } from '../src/queryClient';

describe('QueryClient', () => {
  it('인스턴스를 생성할 수 있다', () => {
    const queryClient = new QueryClient();
    expect(queryClient).toBeInstanceOf(QueryClient);
  });

  it('쿼리 데이터를 저장하고 가져올 수 있다', () => {
    const queryClient = new QueryClient();
    const testData = { id: 1, name: 'Test' };

    queryClient.setQueryData(['test'], testData);
    const data = queryClient.getQueryData(['test']);

    expect(data).toEqual(testData);
  });

  it('존재하지 않는 쿼리 데이터는 undefined를 반환한다', () => {
    const queryClient = new QueryClient();

    const data = queryClient.getQueryData(['non-existent']);

    expect(data).toBeUndefined();
  });

  it('쿼리 상태를 업데이트할 수 있다', () => {
    const queryClient = new QueryClient();
    const initialData = { id: 1, name: 'Initial' };
    const updatedData = { id: 1, name: 'Updated' };

    queryClient.setQueryData(['test'], initialData);
    queryClient.setQueryData(['test'], updatedData);

    const data = queryClient.getQueryData(['test']);

    expect(data).toEqual(updatedData);
  });

  it('파라미터가 포함된 복잡한 쿼리 키를 처리할 수 있다', () => {
    const queryClient = new QueryClient();
    const userData = { id: 1, name: 'John' };

    queryClient.setQueryData(['user', 1], userData);
    const data = queryClient.getQueryData(['user', 1]);

    expect(data).toEqual(userData);
  });

  it('객체가 포함된 쿼리 키를 처리할 수 있다', () => {
    const queryClient = new QueryClient();
    const todosData = [{ id: 1, text: 'Learn TDD' }];

    queryClient.setQueryData(['todos', { status: 'done' }], todosData);
    const data = queryClient.getQueryData(['todos', { status: 'done' }]);

    expect(data).toEqual(todosData);
  });
});

describe('fetchQuery', () => {
  it('데이터를 가져와서 캐시에 저장해야 한다', async () => {
    const queryClient = new QueryClient();
    const mockData = { id: 1, title: 'Test Todo' };
    const queryFn = jest.fn().mockResolvedValue(mockData);

    const result = await queryClient.fetchQuery({
      queryKey: ['todo', 1],
      queryFn,
    });

    expect(queryFn).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockData);
    expect(queryClient.getQueryData(['todo', 1])).toEqual(mockData);
  });

  it('에러가 발생하면 에러를 throw해야 한다', async () => {
    const queryClient = new QueryClient();
    const mockError = new Error('Network error');
    const queryFn = jest.fn().mockRejectedValue(mockError);

    // 어떻게 테스트하시겠어요?
    const queryKey = ['todo', 1];
    await expect(queryClient.fetchQuery({ queryKey, queryFn })).rejects.toThrow(
      mockError,
    );
    expect(queryFn).toHaveBeenCalledWith();
    expect(queryClient.getQueryData(queryKey)).toBeUndefined();
  });

  it('이미 fresh한 데이터가 있으면 queryFn을 호출하지 않아야 한다', async () => {
    const queryClient = new QueryClient();
    const existingData = { id: 1, title: 'Existing Todo' };
    const queryFn = jest.fn();

    // 미리 데이터 설정
    queryClient.setQueryData(['todo', 1], existingData);

    const result = await queryClient.fetchQuery({
      queryKey: ['todo', 1],
      queryFn,
      staleTime: 1000 * 60, // 1분
    });

    expect(queryFn).not.toHaveBeenCalled();
    expect(result).toEqual(existingData);
  });
});
