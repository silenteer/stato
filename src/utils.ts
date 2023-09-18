export type inferValueOrArrayValue<T> = T extends Array<infer V> ? V : T
export type valueOrPromiseValue<V> = V | Promise<V>
export type valueOrArrayValue<V> = V | Array<V>
export type ignoreFirstValue<T> = T extends [any, ...infer R] ? R : T