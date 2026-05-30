import { describe, expect, it } from 'vitest'
import { formatVolume } from '../lib/prediction-service'

describe('prediction formatting', () => {
  it('formats volume with pUSD wording', () => {
    expect(formatVolume(1_250_000)).toBe('1.3M pUSD')
    expect(formatVolume(900)).toBe('900 pUSD')
  })
})
