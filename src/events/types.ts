export type Listener<T extends unknown[] = unknown[]> = (...value: T) => void
