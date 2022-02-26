export function sleep(ts = 1000) {
  return new Promise<void>((resolve) => setTimeout(resolve, ts))
}
