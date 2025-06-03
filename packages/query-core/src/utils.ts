export function hashQueryKey(queryKey: unknown[]): string {
  // 객체의 키를 정렬하여 일관된 문자열 생성
  return JSON.stringify(queryKey, (_, val) => {
    // 일반 객체인 경우에만 키 정렬
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      return Object.keys(val)
        .sort()
        .reduce((result, key) => {
          result[key] = val[key]
          return result
        }, {} as any)
    }
    return val
  })
}