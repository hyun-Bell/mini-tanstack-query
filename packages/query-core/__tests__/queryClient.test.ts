import { QueryClient } from '../src/queryClient';

describe('QueryClient', () => {
  it('should create an instance', () => {
    const queryClient = new QueryClient();
    expect(queryClient).toBeInstanceOf(QueryClient);
  });

  it('should set and get query data', () => {
    const queryClient = new QueryClient();
    const testData = { id: 1, name: 'Test' };
    
    queryClient.setQueryData(['test'], testData);
    const data = queryClient.getQueryData(['test']);
    
    expect(data).toEqual(testData);
  });

  it('should return undefined for non-existent query data', () => {
    const queryClient = new QueryClient();
    
    const data = queryClient.getQueryData(['non-existent']);
    
    expect(data).toBeUndefined();
  });

  it('should handle query state updates', () => {
    const queryClient = new QueryClient();
    const initialData = { id: 1, name: 'Initial' };
    const updatedData = { id: 1, name: 'Updated' };
    
    queryClient.setQueryData(['test'], initialData);
    queryClient.setQueryData(['test'], updatedData);
    
    const data = queryClient.getQueryData(['test']);
    
    expect(data).toEqual(updatedData);
  });

  it('should handle complex query keys with parameters', () => {
  const queryClient = new QueryClient();
  const userData = { id: 1, name: 'John' };
  
  queryClient.setQueryData(['user', 1], userData);
  const data = queryClient.getQueryData(['user', 1]);
  
  expect(data).toEqual(userData);
});

it('should handle query keys with objects', () => {
  const queryClient = new QueryClient();
  const todosData = [{ id: 1, text: 'Learn TDD' }];
  
  queryClient.setQueryData(['todos', { status: 'done' }], todosData);
  const data = queryClient.getQueryData(['todos', { status: 'done' }]);
  
  expect(data).toEqual(todosData);
});
});