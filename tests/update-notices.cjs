const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const storage = new Map();
const nodes = new Map();
let closeListener;
const node = id => {
  if (!nodes.has(id)) nodes.set(id, {
    open: false, innerHTML: '', scrollTop: 100,
    style: {setProperty() {}},
    showModal() {this.open = true;},
    close() {this.open = false; closeListener();},
    addEventListener(type, listener) {if (type === 'close') closeListener = listener;}
  });
  return nodes.get(id);
};
const focus = {isConnected: true, restored: false, focus() {this.restored = true;}};
const context = vm.createContext({
  $: node, document: {activeElement: focus},
  localStorage: {getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value)},
  performance: {now: () => 1234}, paused: false, last: 0,
  cancelDrag() {context.cancelled = true;},
  keys: {KeyW: true}, drawing: true, activeDrawingPointer: 3,
  rune: [1], touchMove: {x: 1, y: 0, pointerId: 4}
});
vm.runInContext(html.slice(html.indexOf('const GAME_RELEASES='), html.indexOf('async function toggleFullscreen(')), context);
assert.equal(context.releaseSeen(), false);
context.openUpdates();
assert.equal(node('#updatesDialog').open, true);
assert.equal(context.paused, true);
assert.equal(context.cancelled, true);
assert.equal(context.drawing, false);
assert.equal(context.touchMove.pointerId, null);
assert.equal(Object.keys(context.keys).length, 0);
assert.equal(storage.size, 0, 'opening does not acknowledge a release');
context.openUpdates(); // Repeated opening must preserve the original pause state.
context.closeUpdates();
assert.equal(context.paused, false, 'active run resumes');
assert.equal(context.last, 1234);
assert.equal(focus.restored, true);
assert.equal(context.releaseSeen(), true);
storage.set('wizard-outlaw:last-seen-release', 'older-release');
assert.equal(context.releaseSeen(), false, 'a different release triggers notice');
context.paused = true;
context.openUpdates();
context.closeUpdates();
assert.equal(context.paused, true, 'setup and other paused screens stay paused');
context.localStorage = {getItem() {throw Error('blocked');}, setItem() {throw Error('blocked');}};
assert.equal(context.releaseSeen(), false);
context.openUpdates();
assert.doesNotThrow(() => context.closeUpdates());
assert.equal(context.paused, true);
const releases = vm.runInContext('GAME_RELEASES', context);
assert.equal(new Set(releases.map(release => release.version)).size, releases.length);
const changelog = fs.readFileSync(path.join(__dirname, '../CHANGELOG.md'), 'utf8');
for (const release of releases) {
  assert.ok(changelog.includes(`## ${release.version} — ${release.title}`));
  for (const change of release.changes) assert.ok(changelog.includes(change));
}
console.log('Passed update notice persistence, pause restoration, input cleanup, blocked storage, and changelog consistency checks.');
