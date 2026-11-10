import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('../src/cms/helpers.ts', import.meta.url), 'utf8')
const javascript = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText
const { parseArgentinePrice, formatPrice } = await import(
  `data:text/javascript;base64,${Buffer.from(javascript).toString('base64')}`
)

test('interpreta precios argentinos y valores numéricos', () => {
  for (const [input, expected] of [
    ['$85.000 ARS', 85000],
    ['90.000,00', 90000],
    ['1.234.567,89', 1234567.89],
    ['ARS $ 1.234,50', 1234.5],
    ['85000', 85000],
    ['90.5', 90.5],
    [82.5, 82.5],
    [0, 0],
  ]) {
    assert.equal(parseArgentinePrice(input), expected, String(input))
  }
})

test('rechaza entradas ambiguas o inválidas sin inventar precios', () => {
  for (const input of ['', 'A consultar', '12.34.56', '1,234', '-5', '12abc', null, Infinity]) {
    assert.equal(parseArgentinePrice(input), null, String(input))
  }
})

test('muestra el precio con separadores argentinos y conserva centavos', () => {
  assert.equal(formatPrice('$85.000 ARS'), '$ 85.000')
  assert.equal(formatPrice('90.000,50'), '$ 90.000,5')
  assert.equal(formatPrice(90000, 'USD'), '$ 90.000 USD')
  assert.equal(formatPrice('A consultar'), 'Consultar')
  assert.equal(formatPrice(0), 'Consultar')
})
