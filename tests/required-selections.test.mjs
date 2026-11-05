import { test } from 'node:test';
import assert from 'node:assert/strict';
import { missingSelection, selectionRequirements } from '../src/lib/requiredSelections.ts';
test('fabric first and included foam must be explicitly chosen', () => {
  const required = { fabric: true, foam: true };
  assert.equal(missingSelection(required, {}), 'fabric');
  assert.equal(missingSelection(required, { fabric: {} }), 'foam');
  assert.equal(missingSelection(required, { foam: { priceAdjustment: 0 } }), 'fabric');
  assert.equal(missingSelection(required, { fabric: {}, foam: { priceAdjustment: 0 } }), null);
});
test('requirements respect active model associations and unavailable choices', () => {
  const albums = [{ id: 'a', active: true, fabrics: [{ id: 'f' }] }, { id: 'inactive', active: false, fabrics: [{ id: 'f2' }] }];
  const foams = [{ id: 'included', active: true }, { id: 'inactive', active: false }];
  assert.deepEqual(selectionRequirements(undefined, albums, foams), { fabric: true, foam: true });
  assert.deepEqual(selectionRequirements({ allowedAlbumIds: [], allowedFoamIds: [] }, albums, foams), { fabric: false, foam: false });
  assert.deepEqual(selectionRequirements({ allowedFabricIds: [], allowedFoamIds: ['inactive'] }, albums, foams), { fabric: false, foam: false });
  assert.deepEqual(selectionRequirements({ allowedAlbumIds: ['inactive'] }, albums, []), { fabric: false, foam: false });
  assert.equal(missingSelection({ fabric: false, foam: false }, {}), null);
});
