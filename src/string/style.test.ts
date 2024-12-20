import { PascalCase, camelCase, kebab$case, snake_case } from './style'

describe('string style conversion', () => {
  it('should convert to PascalCase', () => {
    expect(PascalCase('camelCase')).toBe('CamelCase')
    expect(PascalCase('snake_case')).toBe('SnakeCase')
    expect(PascalCase('kebab-case')).toBe('KebabCase')
  })

  it('should convert to camelCase', () => {
    expect(camelCase('PascalCase')).toBe('pascalCase')
    expect(camelCase('snake_case')).toBe('snakeCase')
    expect(camelCase('kebab-case')).toBe('kebabCase')
  })

  it('should convert to snake_case', () => {
    expect(snake_case('PascalCase')).toBe('pascal_case')
    expect(snake_case('camelCase')).toBe('camel_case')
    expect(snake_case('kebab-case')).toBe('kebab_case')
  })

  it('should convert to kebab-case', () => {
    expect(kebab$case('PascalCase')).toBe('pascal-case')
    expect(kebab$case('camelCase')).toBe('camel-case')
    expect(kebab$case('snake_case')).toBe('snake-case')
  })
})
