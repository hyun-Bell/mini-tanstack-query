import { QueryKey, QueryOptions } from './types';
import { hashQueryKey } from './utils';

interface CacheEntry<TData> {
  data: TData;
  dataUpdatedAt: number; // 저장된 시간
}

export class QueryClient {
  private queryCache: Map<string, CacheEntry<unknown>>;
  private fetchingQueries: Map<string, Promise<unknown>>;
  constructor() {
    this.queryCache = new Map();
    this.fetchingQueries = new Map();
  }

  setQueryData<TData = unknown>(queryKey: QueryKey, data: TData): void {
    const key = hashQueryKey(queryKey);

    this.queryCache.set(key, {
      data,
      dataUpdatedAt: Date.now(), // 현재 시간을 저장
    });
  }

  getQueryData<TData = unknown>(queryKey: QueryKey): TData | undefined {
    const key = hashQueryKey(queryKey);
    const cacheEntry = this.queryCache.get(key);
    return cacheEntry ? (cacheEntry.data as TData) : undefined;
  }

  async fetchQuery<TData = unknown>(
    options: QueryOptions<TData>,
  ): Promise<TData> {
    const { queryKey, queryFn, staleTime = 0 } = options;
    const key = hashQueryKey(queryKey);

    // 1. 캐시 확인
    const cached = this.queryCache.get(key);
    if (cached && Date.now() - cached.dataUpdatedAt < staleTime) {
      return cached.data as TData;
    }

    // 2. 진행 중인 쿼리 확인
    const existingFetch = this.fetchingQueries.get(key);
    if (existingFetch) {
      return existingFetch as Promise<TData>;
    }

    // 3. 새로운 fetch 시작

    const fetchPromise = this.executeFetch(key, queryFn);

    // 4. Promise 저장
    this.fetchingQueries.set(key, fetchPromise);

    // 5. 완료 후 정리
    fetchPromise.finally(() => {
      this.fetchingQueries.delete(key);
    });

    return fetchPromise;
  }

  private async executeFetch<TData = unknown>(
    key: string,
    queryFn: () => Promise<TData>,
  ): Promise<TData> {
    const data = await queryFn();

    // 캐시에 저장
    this.queryCache.set(key, {
      data,
      dataUpdatedAt: Date.now(),
    });

    return data;
  }
}
