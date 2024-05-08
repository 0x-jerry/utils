export function parseURL(input: string | URL, base?: string) {
  return URL.canParse(input, base) ? new URL(input, base) : false
}
