import { describe, expect, it } from 'vitest'
import { pluralize } from '../../src/utils/pluralize'

describe('pluralize', () => {
  it('uses the singular for exactly one', () => {
    expect(pluralize(1, 'file', 'files')).toBe('1 file')
  })

  it('uses the plural for zero and for many', () => {
    expect(pluralize(0, 'file', 'files')).toBe('0 files')
    expect(pluralize(7, 'file', 'files')).toBe('7 files')
  })
})
