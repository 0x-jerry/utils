export function sumOf(...iter: number[]): number {
  return iter.reduce((v, s) => v + s, 0)
}
