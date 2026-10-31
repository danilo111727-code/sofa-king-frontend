import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resolveApiEnvironment} from '../src/lib/apiEnvironment.mjs';
import {cartQuoteInput,cartNeedsReview} from '../src/lib/cartValidation.ts';
test('production uses relative API and preserves existing cart',()=>{
  const result=resolveApiEnvironment();assert.equal(result.base,'/api');assert.equal(result.cartKey,'sk_cart_v1');
});
test('production rejects accidental test API',()=>assert.throws(()=>resolveApiEnvironment({VITE_API_BASE_URL:'https://sofa-king-api-preview.onrender.com/api'})));
test('preview is isolated and cannot use the official API',()=>{
  assert.equal(resolveApiEnvironment({VITE_APP_ENV:'preview'}).cartKey,'sk_preview_cart_v2');
  assert.throws(()=>resolveApiEnvironment({VITE_APP_ENV:'preview',VITE_API_BASE_URL:'https://sofa-king.onrender.com/api'}));
});
const old={id:'c',productId:'p',productName:'Modelo',size:{label:'2 m',basePrice:1000},qty:1,unitPrice:1000,album:null,foam:null,fabric:null};
test('old production cart without variations remains quotable',()=>assert.deepEqual(cartQuoteInput([old]).items[0].selections,[]));
test('cart saves stable option identifiers and does not send client prices',()=>{
  const item={...old,configurationSelections:[{groupId:'catalog:arms',optionId:'wide',quantity:1}]};
  const input=cartQuoteInput([item]);assert.equal(input.items[0].selections[0].optionId,'wide');assert.equal('unitPrice' in input.items[0],false);
});
test('unidentifiable old variation requires reconfiguration',()=>assert.throws(()=>cartQuoteInput([{...old,variations:[{groupName:'Pés',optionName:'Madeira'}]}]),/novamente/));
test('changed prices or choice descriptions require review',()=>{
  assert.equal(cartNeedsReview([old],[{...old,unitPrice:1150}]),true);
  assert.equal(cartNeedsReview([old],[{...old}]),false);
});

test('Vercel production build rejects preview mode',()=>assert.throws(()=>resolveApiEnvironment({VERCEL_ENV:'production',VITE_APP_ENV:'preview'})));
