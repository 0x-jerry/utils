import { assert } from './assert'

describe('assert', () => {
  it('test assert', () => {
    assert(true, '')

    expect(() => assert(false, 'not true')).toThrow('not true')
  })

  it('number', () => {
    assert.number(1)

    expect(() => assert.number('1')).toThrow('1 should be a number.')
    expect(() => assert.number('1', 'msg')).toThrow('msg')
  })

  it('string', () => {
    assert.string('1')

    expect(() => assert.string(1)).toThrow('1 should be a string.')
    expect(() => assert.string(1, 'msg')).toThrow('msg')
  })

  it('boolean', () => {
    assert.boolean(false)

    expect(() => assert.boolean(1)).toThrow('1 should be a boolean.')
    expect(() => assert.boolean(1, 'msg')).toThrow('msg')
  })

  it('function', () => {
    assert.fn(() => {})
    assert.fn(function () {})
    assert.fn(async () => {})
    assert.fn(async function () {})

    expect(() => assert.fn(1)).toThrow('1 should be a function.')
    expect(() => assert.fn(1, 'msg')).toThrow('msg')
  })
})
