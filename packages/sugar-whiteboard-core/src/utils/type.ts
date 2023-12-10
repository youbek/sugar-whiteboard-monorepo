export type Constructor<TResult, TParams extends any[] = any[]> = new (
  ...params: TParams
) => TResult;
