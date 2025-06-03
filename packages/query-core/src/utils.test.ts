import { hashQueryKey } from './utils'

describe('hashQueryKey', () => {
  it('같은 내용의 배열은 같은 해시를 반환해야 한다', () => {
    const key1 = ['todos']
    const key2 = ['todos']
    
    expect(hashQueryKey(key1)).toBe(hashQueryKey(key2))
  })

  it('다른 내용의 배열은 다른 해시를 반환해야 한다', () => {
    const key1 = ['todos']
    const key2 = ['posts']
    
    expect(hashQueryKey(key1)).not.toBe(hashQueryKey(key2))
  })

  it('복잡한 쿼리 키도 처리할 수 있어야 한다', () => {
    const key1 = ['todos', { status: 'done', userId: 1 }]
    const key2 = ['todos', { status: 'done', userId: 1 }]
    
    expect(hashQueryKey(key1)).toBe(hashQueryKey(key2))
  })

  it('객체의 키 순서가 달라도 같은 해시를 반환해야 한다', () => {
    const key1 = ['todos', { status: 'done', userId: 1 }]
    const key2 = ['todos', { userId: 1, status: 'done' }]
    
    expect(hashQueryKey(key1)).toBe(hashQueryKey(key2))
  })
})