import { QueryKey } from "./types";

export class QueryClient<TData = unknown> {
  private queryCache: Map<string, TData | undefined>;

  constructor() {
    this.queryCache = new Map();
  }

  setQueryData(queryKey: QueryKey, data: TData): void {
    const key = JSON.stringify(queryKey);

    this.queryCache.set(key, data);

  }

  getQueryData(queryKey: QueryKey): TData | undefined {
    const key = JSON.stringify(queryKey);
    return this.queryCache.get(key);
  }
}