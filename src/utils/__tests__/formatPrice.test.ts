import { formatPrice } from '../formatPrice'

describe('formatPrice', () => {
  test('formats USD with en-US locale', () => {
    const result = formatPrice(1234, 'USD', 'en-US')
    expect(result).toBe('$12.34')
  })

  test('formats EUR with en-US locale', () => {
    const result = formatPrice(1999, 'EUR', 'en-US')
    expect(result).toBe('€19.99')
  })

  test('formats with default locale when locale is not provided', () => {
    const result = formatPrice(2500, 'USD')
    // Default locale is typically en-US in Node environments
    // Accept either $25.00 or equivalent depending on environment
    expect(['$25.00', 'US$25.00']).toContain(result)
  })
})
