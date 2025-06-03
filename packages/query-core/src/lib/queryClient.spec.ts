import { QueryClient } from './queryClient';

describe('QueryClient', () => {
  describe('생성자', () => {
    it('QueryClient 인스턴스를 생성할 수 있어야 한다', () => {
      const queryClient = new QueryClient();
      expect(queryClient).toBeInstanceOf(QueryClient);
    });

    it('기본 옵션을 설정할 수 있어야 한다', () => {
      const defaultOptions = {
        queries: {
          staleTime: 5 * 60 * 1000, // 5분
          cacheTime: 10 * 60 * 1000, // 10분
        }
      };
      
      const queryClient = new QueryClient({ defaultOptions });
      expect(queryClient.getDefaultOptions()).toEqual(defaultOptions);
    });
  });

  describe('fetchQuery', () => {
    it('쿼리 함수를 실행하고 결과를 반환해야 한다', async () => {
      const queryClient = new QueryClient();
      const mockData = { id: 1, name: 'Test' };
      const queryFn = jest.fn().mockResolvedValue(mockData);

      const result = await queryClient.fetchQuery({
        queryKey: ['test'],
        queryFn,
      });

      expect(queryFn).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockData);
    });

    it('동일한 queryKey로 캐시된 데이터를 반환해야 한다', async () => {
      const queryClient = new QueryClient();
      const queryFn = jest.fn().mockResolvedValue({ data: 'test' });

      // 첫 번째 호출
      await queryClient.fetchQuery({
        queryKey: ['test'],
        queryFn,
      });

      // 두 번째 호출 (캐시에서)
      const cachedResult = await queryClient.fetchQuery({
        queryKey: ['test'],
        queryFn,
      });

      expect(queryFn).toHaveBeenCalledTimes(1); // 한 번만 호출되어야 함
      expect(cachedResult).toEqual({ data: 'test' });
    });
  });
});