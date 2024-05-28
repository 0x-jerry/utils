export function parseURL(input: string | URL, base?: string) {
  if (URL.canParse) {
    return URL.canParse(input, base) ? new URL(input, base) : false
  }

  try {
    return new URL(input, base)
  } catch (error) {
    return false
  }
}
