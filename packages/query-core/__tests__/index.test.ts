import { hashQueryKey } from '../src/utils';

describe('hashQueryKey', () => {
  it('객체 속성 순서가 달라도 동일한 해시를 생성해야 한다', () => {
    const key1 = ['user', { id: 1, name: 'John' }];
    const key2 = ['user', { name: 'John', id: 1 }];

    const hash1 = hashQueryKey(key1);
    const hash2 = hashQueryKey(key2);

    expect(hash1).toEqual(hash2);
  });
});