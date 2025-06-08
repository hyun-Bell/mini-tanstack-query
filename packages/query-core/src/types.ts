export type QueryKey = readonly unknown[];

export type QueryFunction<TData> = () => Promise<TData>;

export interface QueryState<TData = unknown> {
  data: TData | undefined;
  error: Error | null;
  status: 'pending' | 'error' | 'success';
  fetchStatus: 'idle' | 'fetching' | 'paused';
  dataUpdatedAt: number;
  errorUpdatedAt: number;
  isInvalidated: boolean;
  isPaused: boolean;
}

export interface QueryOptions<TData = unknown> {
  queryKey: QueryKey;
  queryFn: QueryFunction<TData>;
  staleTime?: number;
  gcTime?: number;
  retry?: number | boolean;
  initialData?: TData;
}
