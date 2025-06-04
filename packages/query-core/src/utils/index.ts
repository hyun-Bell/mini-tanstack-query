import { QueryKey } from '../types';

export function hashQueryKey(queryKey: QueryKey): string {
  return JSON.stringify(queryKey, (_, value) => {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const sortedKeys = Object.keys(value).sort();
        const sortedObject: Record<string, unknown> = {};
        for (const key of sortedKeys) {
          sortedObject[key] = value[key];
        }
        return sortedObject;
    }
    return value;
  });
}