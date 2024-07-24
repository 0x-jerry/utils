import {
  type SimpleOption,
  getOptionByLabel,
  getOptionByValue,
  getOptionLabelByValue,
} from './index.js'

describe('options', () => {
  const options: SimpleOption[] = [
    {
      label: '1',
      value: 'v1',
    },
    {
      label: '2',
      value: 'v2',
    },
    {
      label: '3',
      value: 'v3',
    },
  ]

  it('should get option by label', () => {
    const expected = options[0]
    let t = getOptionByLabel(options, '1')

    expect(t).toBe(expected)

    t = getOptionByLabel(options, '4')

    expect(t).toBe(undefined)
  })

  it('should get option by value', () => {
    const expected = options[0]
    let t = getOptionByValue(options, 'v1')

    expect(t).toBe(expected)

    t = getOptionByValue(options, 'v4')

    expect(t).toBe(undefined)
  })

  it('should get option label by value', () => {
    let t = getOptionLabelByValue(options, 'v1')

    expect(t).toBe('1')

    t = getOptionLabelByValue(options, 'v4')

    expect(t).toBe(undefined)
  })
})
