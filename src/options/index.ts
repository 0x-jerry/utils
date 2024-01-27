export interface SimpleOption<T = string> {
  label?: string
  value: T
  [key: string]: any
}

export function getOptionByLabel(options: SimpleOption[], label?: string) {
  return options.find((o) => o.label === label)
}

export function getOptionByValue<T>(options: SimpleOption<T>[], value?: T) {
  return options.find((o) => o.value === value)
}

export function getOptionLabelByValue<T>(options: SimpleOption<T>[], value?: T) {
  return getOptionByValue(options, value)?.label
}
