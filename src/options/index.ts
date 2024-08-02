export interface SimpleOption<T = string> {
  label?: string
  value: T
  [key: string]: unknown
}

export type GetSimpleOptionValue<T> = T extends SimpleOption<infer V> ? V : unknown

export function getOptionByLabel<T extends SimpleOption>(options: T[], label?: string) {
  return options.find((o) => o.label === label)
}

export function getOptionByValue<T extends SimpleOption>(
  options: T[],
  value?: GetSimpleOptionValue<T>,
) {
  return options.find((o) => o.value === value)
}

export function getOptionLabelByValue<T extends SimpleOption>(
  options: T[],
  value?: GetSimpleOptionValue<T>,
) {
  return getOptionByValue(options, value)?.label
}
