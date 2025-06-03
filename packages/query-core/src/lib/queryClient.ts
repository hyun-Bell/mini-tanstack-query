export interface QueryClientConfig {
  defaultOptions?: DefaultOptions;
}

export interface DefaultOptions {
  queries?: QueryOptions;
}

export interface QueryOptions {
  staleTime?: number;
  cacheTime?: number;
}

export interface FetchQueryOptions<TData = unknown> {
  queryKey: unknown[];
  queryFn: () => Promise<TData>;
}

export class QueryClient {
  private defaultOptions: DefaultOptions;
  private cache: Map<string, any> = new Map();

  constructor(config?: QueryClientConfig) {
    this.defaultOptions = config?.defaultOptions || {};
  }

  getDefaultOptions(): DefaultOptions {
    return this.defaultOptions;
  }

  async fetchQuery<TData>(options: FetchQueryOptions<TData>): Promise<TData> {
    const queryHash = this.hashQueryKey(options.queryKey);
    
    // 캐시 확인
    if (this.cache.has(queryHash)) {
      return this.cache.get(queryHash);
    }

    // 새로운 데이터 fetch
    const data = await options.queryFn();
    this.cache.set(queryHash, data);
    
    return data;
  }

  private hashQueryKey(queryKey: unknown[]): string {
    // 간단한 해시 함수 (실제로는 더 복잡해야 함)
    return JSON.stringify(queryKey);
  }
}