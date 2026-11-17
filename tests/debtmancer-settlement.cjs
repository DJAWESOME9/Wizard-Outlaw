const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
const context = vm.createContext({
  time: 0, kills: 0, score: 0, relicKills: 0, combatText: [],
  ENEMY_DEFS: {husk: {score: 1, accent: '#fff'}},
  classSkillRank: () => 0, relicRank: () => 0, skillRank: () => 0,
  sourceCredit() {}, particle() {}, tone() {}, dropLoot() {}, spellScope: id => id
});
vm.runInContext(html.slice(html.indexOf('const DEBT_SETTLEMENT_CREDITS='), html.indexOf('function canPayMana(')), context);
vm.runInContext(html.slice(html.indexOf('function hurtEnemy('), html.indexOf('\nfunction ', html.indexOf('function hurtEnemy(') + 1)), context);
// Reuse the production reset initializer so stale burst/progress state cannot leak between runs.
const initializer = html.match(/manaModel=(\{kind:selectedClass,.*?\});let maxHp=/)[1];
function reset(kind = 'debtmancer', rank = 0) {
  Object.assign(context, {selectedClass: kind, wizard: kind === 'wizard', hex: kind === 'hexslinger', skillRank: () => 0,
    metaCapabilities: {overcasting: false}, time: 0, classSkillRank: () => rank,
    player: {hp: 30, maxHp: 125, mana: 0, maxMana: 75}, kills: 0, score: 0, relicKills: 0});
  vm.runInContext('manaModel=' + initializer, context);
}
function kill(dt = 1.1, summoned = false) {
  context.time += dt;
  const enemy = {hp: 1, max: 1, r: 10, x: 0, y: 0, role: 'husk', summoned};
  context.hurtEnemy(enemy, 999);
  return enemy;
}
reset();
for (let i = 0; i < 14; i++) kill();
assert.equal(context.player.mana, 0);
assert.equal(context.player.hp, 30);
const dead = kill();
assert.equal(context.player.mana, 4);
assert.equal(context.player.hp, 32);
assert.equal(context.manaModel.debtCredits, 0);
context.hurtEnemy(dead, 999);
assert.equal(context.kills, 15, 'dead targets cannot grant duplicate credit');
assert.equal(context.manaModel.debtCredits, 0);
for (let i = 0; i < 15; i++) kill();
assert.equal(context.player.mana, 8, 'settlements repeat');
reset();
for (let i = 0; i < 25; i++) kill(0);
assert.equal(context.player.mana, 0, '25 simultaneous kills do not settle');
assert.ok(context.manaModel.debtCredits > 8 && context.manaModel.debtCredits < 9);
const burstCredits = context.manaModel.debtCredits;
kill(1);
assert.equal(context.manaModel.debtCredits, burstCredits + 1, 'full credit resumes after burst window');
while (!context.player.mana) kill();
assert.ok(context.manaModel.debtCredits > 0 && context.manaModel.debtCredits < 1, 'fractional surplus carries forward');
reset();
for (let i = 0; i < 30; i++) kill(0, true);
assert.equal(context.manaModel.debtCredits, 0);
assert.equal(context.manaModel.debtBurstKills, 0, 'summons do not dilute genuine kill credit');
assert.equal(context.player.hp, 30);
reset('debtmancer', 3);
for (let i = 0; i < 15; i++) kill();
assert.equal(context.player.mana, 10);
assert.equal(context.player.hp, 35, 'Debt Collector improves payout');
context.player.mana = 74; context.player.hp = 124;
for (let i = 0; i < 15; i++) kill();
assert.equal(context.player.mana, 75);
assert.equal(context.player.hp, 125, 'payout respects resource caps');
reset();
assert.equal(context.manaModel.debtCredits, 0);
assert.equal(context.manaModel.debtBurstKills, 0);
kill(0);
assert.equal(context.manaModel.debtCredits, 1, 'new run first kill earns full credit');
for (const kind of ['wizard', 'hexslinger']) {
  reset(kind);
  for (let i = 0; i < 20; i++) kill();
  assert.equal(context.player.mana, 0);
  assert.equal(context.player.hp, 30);
}
console.log('Passed Debtmancer settlement cadence, burst discount, carryover, summons, duplicate kills, ranks, caps, run resets, and class isolation.');
