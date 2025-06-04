export type QueryKey = readonly unknown[];

export type QueryFunction<TData> = () => Promise<TData>;

export interface QueryOptions<TData> {
  queryKey: QueryKey;
  queryFn: QueryFunction<TData>;
  staleTime?: number; // 데이터가 신선한 상태로 유지되는 시간 (ms)
  gcTime?: number; // 캐시에서 제거되기까지의 시간 (ms)
  retry?: number | boolean; // 재시도 횟수 또는 활성화 여부
}
