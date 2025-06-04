import { QueryFunction, QueryKey } from './types';
import { hashQueryKey } from './utils';

interface CacheEntry<TData> {
  data: TData;
  dataUpdatedAt: number; // 저장된 시간
}

export class QueryClient<TData = unknown> {
  private queryCache: Map<string, CacheEntry<TData>>;

  constructor() {
    this.queryCache = new Map();
  }

  setQueryData(queryKey: QueryKey, data: TData): void {
    const key = hashQueryKey(queryKey);

    this.queryCache.set(key, {
      data,
      dataUpdatedAt: Date.now(), // 현재 시간을 저장
    });
  }

  getQueryData(queryKey: QueryKey): TData | undefined {
    const key = hashQueryKey(queryKey);
    const cacheEntry = this.queryCache.get(key);
    if (cacheEntry) {
      return cacheEntry.data;
    }
    return undefined;
  }

  async fetchQuery({
    queryKey,
    queryFn,
    staleTime,
  }: {
    queryKey: QueryKey;
    queryFn: QueryFunction<TData>;
    staleTime?: number;
  }): Promise<TData> {
    const key = hashQueryKey(queryKey);
    const cacheEntry = this.queryCache.get(key);
    const now = Date.now();
    // 캐시된 데이터가 있고, staleTime이 설정되어 있으며, 아직 유효한 경우
    if (
      cacheEntry &&
      staleTime !== undefined &&
      now - cacheEntry.dataUpdatedAt < staleTime
    ) {
      return cacheEntry.data;
    }

    try {
      const data = await queryFn();
      this.setQueryData(queryKey, data);
      return data;
    } catch (error) {
      throw new Error(`Network error`);
    }
  }
}
