
// 쿼리 키는 뭘로 정의하면 좋을까요?
export type QueryKey = readonly unknown[];

// 쿼리 함수는 어떤 형태일까요?
export type QueryFunction<TData> = () => Promise<TData>;

// 쿼리 옵션은 어떤 속성들이 필요할까요?
export interface QueryOptions<TData> {
  queryKey: QueryKey;
  queryFn: QueryFunction<TData>;
  staleTime?: number;  // 데이터가 신선한 상태로 유지되는 시간 (ms)
  gcTime?: number;     // 캐시에서 제거되기까지의 시간 (ms)
  retry?: number | boolean;  // 재시도 횟수 또는 활성화 여부
}

export interface QueryState<TData> {
  data: TData | undefined;
  error: Error | null;
  status: 'pending' | 'error' | 'success';
  fetchStatus: 'idle' | 'fetching' | 'paused';
  dataUpdatedAt: number;  // 데이터가 마지막으로 업데이트된 시간
}