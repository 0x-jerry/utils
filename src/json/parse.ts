export type TransformJsonData<T> = (data?: unknown) => T

export interface ParesJsonOption<T> {
  transform?: TransformJsonData<T>
}

export function parseJson<T>(jsonContent: string, opt: Required<ParesJsonOption<T>>): T
export function parseJson<T>(jsonContent: string, opt?: ParesJsonOption<T>): T | undefined
/**
 * @returns Undefined if parse failed
 */
export function parseJson<T>(jsonContent: string, opt?: ParesJsonOption<T>): T | undefined {
  try {
    const result = JSON.parse(jsonContent)
    return opt?.transform ? opt.transform(result) : result
  } catch (_error) {
    // ignore error
    return opt?.transform?.(undefined)
  }
}
