import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { supportsExtendedDepth } from '../src/lib/productConfigurator.ts';
import { createProduct, updateProduct, fetchProduct } from '../src/lib/api.ts';
const originalFetch = globalThis.fetch;
after(() => { globalThis.fetch = originalFetch; });

test('extended depth applies to reclining and chaise categories only, including accented category labels', () => {
  for (const category of ['retratil', 'chaise', 'Sofá Retrátil', 'sofa-chaise']) assert.ok(supportsExtendedDepth(category), category);
  for (const category of ['fixo', 'canto', 'living', 'sofa-cama', '', undefined]) assert.equal(supportsExtendedDepth(category), false, String(category));
});

test('API client preserves extended depth through create, edit and fresh read without changing price or other measurements', async () => {
  let stored;
  globalThis.fetch = async (_url, options) => {
    if (options?.method === 'POST') stored = { ...JSON.parse(options.body), id: 'qa-extended' };
    if (options?.method === 'PUT') stored = { ...stored, ...JSON.parse(options.body) };
    return Response.json(stored);
  };
  await createProduct({ name: 'QA extended depth', category: 'retratil', price: 1234, sizes: [{ label: '1,60 m', basePrice: 1234 }], configuration: { measurements: { totalDepth: 95, seatHeight: 45, extendedDepth: 145 }, allowedFoamIds: ['included'] } });
  const initial = await fetchProduct('qa-extended');
  assert.equal(initial.configuration.measurements.extendedDepth, 145);
  await updateProduct('qa-extended', { configuration: { ...initial.configuration, measurements: { ...initial.configuration.measurements, extendedDepth: 160 } } });
  const edited = await fetchProduct('qa-extended');
  assert.deepEqual(edited.configuration.measurements, { totalDepth: 95, seatHeight: 45, extendedDepth: 160 });
  assert.deepEqual(edited.configuration.allowedFoamIds, ['included']);
  assert.equal(edited.price, 1234);
  assert.deepEqual(edited.sizes, initial.sizes);
  await updateProduct('qa-extended', { category: 'fixo' });
  const fixed = await fetchProduct('qa-extended');
  assert.equal(supportsExtendedDepth(fixed.category), false);
  assert.equal(fixed.configuration.measurements.extendedDepth, 160);
});
