import { QueryKey, QueryFunction, QueryState, QueryOptions } from './types';
import { QueryClient } from './queryClient';
import { hashQueryKey } from './utils';

export interface QueryConfig<TData = unknown> extends QueryOptions<TData> {
  queryClient: QueryClient;
}

export class Query<TData = unknown> {
  queryClient: QueryClient;
  queryKey: QueryKey;
  queryHash: string;
  queryFn: QueryFunction<TData>;
  options: QueryOptions<TData>;
  state: QueryState<TData>;

  // 진행 중인 fetch Promise 추적
  private promise: Promise<TData> | null = null;

  constructor(config: QueryConfig<TData>) {
    // TODO: 구현하세요
    // 1. config에서 필요한 값들을 인스턴스 변수에 할당
    // 2. queryHash 생성 (hashQueryKey 유틸 사용)
    // 3. 초기 state 설정 (initialData 고려)
    this.queryClient = config.queryClient;
    this.queryKey = config.queryKey;
    this.queryHash = hashQueryKey(config.queryKey);
    this.queryFn = config.queryFn;
    this.options = config;
    this.state = this.getInitialState(config.initialData);
  }
  fetch(): Promise<TData> {
    // async 제거!
    // 이미 진행 중인 promise가 있으면 그것을 반환
    if (this.promise) {
      return this.promise;
    }

    // 새로운 promise 생성 및 저장
    this.promise = this.executeFetch();

    // promise가 완료되면 정리
    this.promise
      .then(() => {
        this.promise = null;
      })
      .catch(() => {
        this.promise = null;
      });

    // 동일한 promise 반환
    return this.promise;
  }

  private executeFetch(): Promise<TData> {
    this.state.fetchStatus = 'fetching';

    return this.queryFn()
      .then((data) => {
        this.state.data = data;
        this.state.status = 'success';
        this.state.fetchStatus = 'idle';
        this.state.dataUpdatedAt = Date.now();
        this.state.errorUpdatedAt = 0;
        this.state.isInvalidated = false;
        return data;
      })
      .catch((error) => {
        this.state.error = error as Error;
        this.state.status = 'error';
        this.state.fetchStatus = 'idle';
        this.state.errorUpdatedAt = Date.now();
        throw error;
      });
  }

  private getInitialState(initialData?: TData): QueryState<TData> {
    // TODO: 구현하세요
    // initialData가 있는지에 따라 적절한 초기 상태 반환

    if (initialData !== undefined) {
      return {
        data: initialData,
        error: null,
        status: 'success',
        fetchStatus: 'idle',
        dataUpdatedAt: Date.now(),
        errorUpdatedAt: 0,
        isInvalidated: false,
        isPaused: false,
      };
    }
    // initialData가 없으면 pending 상태로 초기화
    return {
      data: undefined,
      error: null,
      status: 'pending',
      fetchStatus: 'idle',
      dataUpdatedAt: 0,
      errorUpdatedAt: 0,
      isInvalidated: false,
      isPaused: false,
    };
  }
}
