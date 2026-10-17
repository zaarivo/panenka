import { expect, test } from 'vitest'
import { formatGold } from '../lib/czech'

test('zlaťáky se skloňují podle počtu', () => {
  expect([0, 1, 2, 4, 5, 10, 21, 50].map(formatGold)).toEqual([
    '0 zlaťáků',
    '1 zlaťák',
    '2 zlaťáky',
    '4 zlaťáky',
    '5 zlaťáků',
    '10 zlaťáků',
    '21 zlaťáků',
    '50 zlaťáků',
  ])
})
