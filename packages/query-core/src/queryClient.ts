/* eslint-disable no-useless-catch */
import { QueryKey, QueryOptions } from './types';
import { hashQueryKey } from './utils';

interface CacheEntry<TData = unknown> {
  data: TData;
  dataUpdatedAt: number;
}

/**
 * TanStack Query의 중앙 컨트롤러
 * 모든 쿼리의 캐싱, 동기화, 업데이트를 관리합니다.
 */
export class QueryClient {
  private cache: Map<string, CacheEntry<unknown>>;
  private fetchingQueries: Map<string, Promise<unknown>>;

  constructor() {
    this.cache = new Map();
    this.fetchingQueries = new Map();
  }

  /**
   * 쿼리 데이터를 수동으로 설정합니다.
   *
   * @param queryKey - 쿼리를 식별하는 키
   * @param data - 저장할 데이터
   *
   * @example
   * queryClient.setQueryData(['user', 1], { id: 1, name: 'John' })
   */
  setQueryData<TData = unknown>(queryKey: QueryKey, data: TData): void {
    const key = hashQueryKey(queryKey);
    this.cache.set(key, {
      data,
      dataUpdatedAt: Date.now(),
    });
  }

  /**
   * 캐시에서 쿼리 데이터를 조회합니다.
   *
   * @param queryKey - 쿼리를 식별하는 키
   * @returns 캐시된 데이터 또는 undefined
   */
  getQueryData<TData = unknown>(queryKey: QueryKey): TData | undefined {
    const key = hashQueryKey(queryKey);
    const entry = this.cache.get(key);
    return entry?.data as TData | undefined;
  }

  /**
   * 쿼리를 실행하고 결과를 캐시합니다.
   *
   * @param options - 쿼리 옵션
   * @returns 쿼리 결과 데이터
   */
  async fetchQuery<TData = unknown>(
    options: QueryOptions<TData>,
  ): Promise<TData> {
    const { queryKey, queryFn, staleTime = 0 } = options;
    const key = hashQueryKey(queryKey);

    // 이미 진행 중인 쿼리가 있으면 그 Promise 반환
    const existingFetch = this.fetchingQueries.get(key);
    if (existingFetch) {
      return existingFetch as Promise<TData>;
    }

    const cached = this.cache.get(key);

    // 캐시된 데이터가 있고 아직 fresh하면 캐시 반환
    if (cached && this.isFresh(cached.dataUpdatedAt, staleTime)) {
      return cached.data as TData;
    }

    // 새로운 fetch 시작
    const fetchPromise = this.executeFetch<TData>(key, queryFn);

    // Promise 저장
    this.fetchingQueries.set(key, fetchPromise);

    // 완료 후 Promise 제거
    fetchPromise.finally(() => {
      this.fetchingQueries.delete(key);
    });

    return fetchPromise;
  }

  private isFresh(dataUpdatedAt: number, staleTime: number): boolean {
    return Date.now() - dataUpdatedAt < staleTime;
  }

  private async executeFetch<TData>(
    key: string,
    queryFn: () => Promise<TData>,
  ): Promise<TData> {
    try {
      const data = await queryFn();

      // 캐시에 저장
      this.cache.set(key, {
        data,
        dataUpdatedAt: Date.now(),
      });

      return data;
    } catch (error) {
      // 에러는 그대로 전파
      throw error;
    }
  }
}
