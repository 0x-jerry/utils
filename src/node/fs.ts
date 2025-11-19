import type { PathLike } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { type ParesJsonOption, parseJson } from '../json'

export function readText(path: PathLike) {
  return readFile(path, { encoding: 'utf8' })
}

export interface ReadJsonOption<T> extends ParesJsonOption<T> {}

/**
 * @returns Undefined if parse failed
 */
export async function readJson<T>(path: PathLike, opt?: ReadJsonOption<T>) {
  const text = await readText(path)

  return parseJson(text, opt)
}
