export type ExtractObjectKeys<T extends {}, Condition> = {
  [key in keyof T]: T[key] extends Condition ? key : never
}[keyof T]
