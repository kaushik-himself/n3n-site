import test from 'node:test';
import assert from 'node:assert/strict';
import {handleRequest, FEED_URL} from './feed.js';

const xml = '<rss><channel><item><title>New post</title></item></channel></rss>';
function setup(upstream = async () => new Response(xml)) {
  const responses = new Map(), pending = [], calls = [];
  const cache = {match:async key => responses.get(key.url)?.clone(), put:async (key,response) => responses.set(key.url,response)};
  const env = {ASSETS:{fetch:async request => new Response('asset: '+new URL(request.url).pathname)}};
  const ctx = {waitUntil:promise => pending.push(promise)};
  return {calls, pending, run:(path, method='GET') => handleRequest(
    new Request('https://n3n.lol'+path,{method}), env, ctx,
    async (...args) => {calls.push(args);return upstream(...args);}, cache)};
}

test('static routes still use the asset binding', async () => {
  const state=setup();
  assert.equal(await (await state.run('/writing/')).text(), 'asset: /writing/');
  assert.equal(state.calls.length, 0);
});

test('fetches only the fixed public feed, caches for one minute, ignores query strings', async () => {
  const state=setup();
  const response=await state.run('/api/substack.xml?url=https://evil.test/');
  assert.equal(state.calls[0][0], FEED_URL);
  assert.equal(state.calls[0][1].redirect, 'manual');
  assert.equal(response.status, 200);
  assert.equal(await response.text(), xml);
  assert.equal(response.headers.get('Cache-Control'), 'public, max-age=60');
  assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff');
  await Promise.all(state.pending);
  assert.equal(await (await state.run('/api/substack.xml')).text(), xml);
  assert.equal(state.calls.length, 1);
  const head=await state.run('/api/substack.xml','HEAD');
  assert.equal(head.status,200);assert.equal(await head.text(),'');
});

test('rejects writes without contacting Substack', async () => {
  const state=setup();
  assert.equal((await state.run('/api/substack.xml','POST')).status,405);
  assert.equal(state.calls.length,0);
});

test('upstream errors, timeouts, HTML, entities, and oversize feeds fail without caching', async () => {
  for (const upstream of [
    async () => new Response('error',{status:503}),
    async () => new Response(null,{status:302,headers:{Location:'https://example.com/'}}),
    async () => {throw new Error('timeout');},
    async () => new Response('<html>login</html>'),
    async () => new Response('<!DOCTYPE rss><rss/>'),
    async () => new Response(xml,{headers:{'Content-Length':String(3*1024*1024)}}),
    async () => new Response('<rss>'+ 'x'.repeat(2*1024*1024)),
  ]) {
    const state=setup(upstream), response=await state.run('/api/substack.xml');
    assert.equal(response.status,502);
    assert.equal(response.headers.get('Cache-Control'),'no-store');
    assert.equal(state.pending.length,0);
  }
});
