const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
for (const script of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) new vm.Script(script[1]);
const ids = ['missile','ring','triad','aegis','astral','ember','vortex','mend','spark','hook'];
const context = {SIGIL_DEFS: Object.fromEntries(ids.map(id => [id, {}])), SIGIL_ID_MIGRATIONS: {}, gestureDirection: () => 0, trianglePointDirection: () => 0, arcBulgeDirection: () => 0};
vm.createContext(context);
vm.runInContext(html.slice(html.indexOf('function analyzeRune('), html.indexOf('function angleDelta(')), context);
let checks = 0;
for (const turns of [1.4,1.5,1.8,2,2.2,2.6,2.8]) {
  for (const direction of [-1,1]) for (const reverse of [false,true]) for (const count of [40,90,180]) {
    const points = Array.from({length: count}, (_,i) => {
      const t = (i/(count-1))**1.4, a = t*Math.PI*2*turns*direction+.7;
      const r = 8+85*t+1.2*Math.sin(t*47);
      return {x:250+Math.cos(a)*r*1.15,y:200+Math.sin(a)*r*.9};
    });
    if(reverse)points.reverse();
    assert.equal(context.inferRune(points,ids)?.id,'vortex', `spiral ${turns}, direction ${direction}, reverse ${reverse}, samples ${count}`);
    checks++;
  }
}
for(const id of ids.filter(id => id !== 'vortex')) {
  const points = context.runeTemplatePoints(id).map(p=>({x:200+p.x*85,y:200+p.y*85}));
  assert.notEqual(context.inferRune(points,ids)?.id,'vortex',`${id} must not become vortex`);
  assert.notEqual(context.inferRune(points,['vortex'])?.id,'vortex',`${id} must fail with only vortex equipped`);
}
const circle = context.runeTemplatePoints('ring').map(p=>({x:200+p.x*85,y:200+p.y*85}));
assert.equal(context.inferRune(circle,['ring','vortex'])?.id,'ring','circle remains Ring beside Vortex');
const spiral = context.runeTemplatePoints('vortex').map(p=>({x:200+p.x*85,y:200+p.y*85}));
assert.notEqual(context.inferRune(spiral,['missile','ring','ember'])?.id,'vortex','unequipped Vortex cannot cast');
console.log(`Passed ${checks} spiral variations and non-spiral rejection checks; script syntax valid.`);
