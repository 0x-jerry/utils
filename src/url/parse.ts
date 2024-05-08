export function parseURL(input: string | URL, base?: string) {
  // @ts-ignore
  if (URL.canParse) {
    // @ts-ignore
    return URL.canParse(input, base) ? new URL(input, base) : false
  }

  try {
    return new URL(input, base)
  } catch (error) {
    return false
  }
}
