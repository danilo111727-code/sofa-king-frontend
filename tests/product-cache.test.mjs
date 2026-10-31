import {test, beforeEach, after} from 'node:test';
import assert from 'node:assert/strict';
import {fetchProducts,updateProduct} from '../src/lib/api.ts';
const originalFetch=globalThis.fetch;
const cacheKey='sfk_products_v1';let data;
const saved={id:'p',configuration:{allowedFoamIds:['a','b','c']}};
const stale={id:'p',configuration:{allowedFoamIds:['a','b','c','d','e']}};
function seed(){data.set(cacheKey,JSON.stringify({data:[stale],timestamp:Date.now()}));}
beforeEach(()=>{data=new Map();globalThis.localStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};});
after(()=>{globalThis.fetch=originalFetch;delete globalThis.localStorage;});
test('admin fresh read returns saved foam restrictions even with a fresh stale cache',async()=>{
 seed();let options;
 globalThis.fetch=async(_url,opts)=>{options=opts;return Response.json([saved]);};
 const products=await fetchProducts({fresh:true});
 assert.deepEqual(products[0].configuration.allowedFoamIds,['a','b','c']);
 assert.equal(options.cache,'no-store');
});
test('late background response cannot restore old checkboxes after product save',async()=>{
 seed();let completeBackground;let calls=0;
 globalThis.fetch=async(url,options)=>{
  if(options?.method==='PUT')return Response.json(saved);
  if(calls++===0)return new Promise(resolve=>{completeBackground=resolve;});
  return Response.json([saved]);
 };
 assert.deepEqual((await fetchProducts())[0],stale);
 await updateProduct('p',{configuration:saved.configuration});
 completeBackground(Response.json([stale]));
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(data.has(cacheKey),false,'stale in-flight response must not recreate cache');
 assert.deepEqual((await fetchProducts())[0].configuration.allowedFoamIds,['a','b','c']);
});
