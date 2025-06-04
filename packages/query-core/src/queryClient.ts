import { QueryKey } from "./types";
import { hashQueryKey } from "./utils";

export class QueryClient<TData = unknown> {
  private queryCache: Map<string, TData | undefined>;

  constructor() {
    this.queryCache = new Map();
  }

  setQueryData(queryKey: QueryKey, data: TData): void {
    const key = hashQueryKey(queryKey);

    this.queryCache.set(key, data);

  }

  getQueryData(queryKey: QueryKey): TData | undefined {
    const key = hashQueryKey(queryKey);
    return this.queryCache.get(key);
  }
}