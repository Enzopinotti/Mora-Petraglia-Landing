import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('../src/cms/publicVisibility.ts', import.meta.url), 'utf8')
const javascript = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText
const { filterPublicProducts, filterPublicProjects, filterPublicEvents } = await import(
  `data:text/javascript;base64,${Buffer.from(javascript).toString('base64')}`
)

const items = [
  { id: 'draft', status: 'draft' },
  { id: 'published', status: 'published' },
  { id: 'hidden', status: 'hidden' },
  { id: 'sold', status: 'sold' },
  { id: 'out_of_stock', status: 'out_of_stock' },
  { id: 'archived', status: 'archived' },
]

test('landing: prints publicados, vendidos y sin stock; nunca borradores u ocultos', () => {
  assert.deepEqual(
    filterPublicProducts(items).map(({ id }) => id),
    ['published', 'sold', 'out_of_stock'],
  )
})

test('landing: murales y exhibiciones solo publicados', () => {
  assert.deepEqual(filterPublicProjects(items).map(({ id }) => id), ['published'])
  assert.deepEqual(filterPublicEvents(items).map(({ id }) => id), ['published'])
})

test('el filtro no modifica el bootstrap ni reemplaza colecciones vacías', () => {
  const frozenItems = Object.freeze(items.map((item) => Object.freeze(item)))
  assert.deepEqual(filterPublicProducts(frozenItems).map(({ id }) => id), [
    'published',
    'sold',
    'out_of_stock',
  ])
  assert.equal(frozenItems.length, 6)
  assert.deepEqual(filterPublicProducts([]), [])
  assert.deepEqual(filterPublicProjects([]), [])
  assert.deepEqual(filterPublicEvents([]), [])
})
