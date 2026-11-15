'use strict';
const assert=require('node:assert/strict'),C=require('./core.js'),A=require('./adventure.js'),B=require('./bricks.js'),O=require('./onboarding.js'),S=require('./storage.js');
const create=(theme,seed=14,raw)=>{const s=C.create({theme,seed,recipe:O.introRecipe()});A.attach(s,raw);s.mobs=[];s.npcs=[];s.turrets=[];s.patrols=[];return s;};
const step=(s,extra={})=>{const input={mx:0,my:0,yaw:s.player.yaw,pitch:0,fire:false,b:[false,false,false,false,false],use:false,...extra};s.events=[];C.step(s,1/60,input);A.tick(s,s.events.slice(),C);};
const place=(s,x,z,yaw=Math.PI)=>{Object.assign(s.player,{x,z,yaw,pitch:0});s.player.cam.x=x;s.player.cam.z=z;};
let locations=0;
for(const theme of Object.keys(A.BOOK))for(let seed=1;seed<=100;seed++){
  const s=create(theme,seed);assert.equal(s.adventure.sites.length,3);assert.equal(s.adventure.objects.length,21);
  for(const site of s.adventure.sites){assert.ok(!C.solidAt(s,site.x,site.z-6));assert.ok(C.pathCells(s,s.player.x,s.player.z,site.x,site.z-6));assert.equal(s.city.props.filter(p=>p===site.gate).length,1);locations++;}
}
for(const theme of Object.keys(A.BOOK)){
  const s=create(theme);
  for(const site of s.adventure.sites){
    // Collisione reale della grata, prima della soluzione.
    place(s,site.x,site.z-1.2);for(let n=0;n<30;n++)step(s,{my:1});assert.ok(s.player.z<=site.z-.94,'Grata chiusa attraversata');
    place(s,site.x-4,site.z-6);step(s);
    assert.equal(site.progress.discovered,true);assert.equal(A.nearest(s,C).id,site.id+':keeper');
    assert.ok(A.act(s,site.id+':keeper','ask',C).ok);assert.equal(site.progress.read,true);
    assert.equal(A.act(s,site.id+':keeper','share',C).ok,false,'Finale prima dei frammenti');
    place(s,site.x,site.z-6);
    const recipe=O.introRecipe();recipe.slots[0].el=site.element==='fuoco'?'gelo':'fuoco';C.setRecipe(s,recipe);
    step(s,{fire:true});assert.equal(site.progress.charged,false,'Elemento sbagliato accettato');
    recipe.slots[0].el=site.element;C.setRecipe(s,recipe);
    place(s,site.x,site.z-6,0);step(s,{fire:true});assert.equal(site.progress.charged,false,'Cast rivolto altrove accettato');
    place(s,site.x,site.z-6);s.player.cd[0]=0;step(s,{fire:true});assert.equal(site.progress.charged,true,'Cast reale non riconosciuto');
    place(s,site.x+3,site.z-3);assert.ok(A.act(s,site.id+':lever','open',C).ok);assert.ok(!s.city.props.includes(site.gate));
    place(s,site.x,site.z-1.2);for(let n=0;n<30;n++)step(s,{my:1});assert.ok(s.player.z>site.z+2,'Il passaggio aperto non e percorribile');
    const fame=s.fame;assert.ok(A.act(s,site.id+':chest','claim',C).ok);assert.equal(s.fame,fame+18);
    assert.equal(A.act(s,site.id+':chest','claim',C).ok,false);assert.equal(s.fame,fame+18);
    place(s,site.x-4,site.z+2);assert.ok(A.act(s,site.id+':herb','harvest',C).ok);assert.equal(A.act(s,site.id+':herb','harvest',C).ok,false);
    const supplies=s.adventure.progress.supplies;s.player.hp=50;assert.ok(A.remedy(s).ok);assert.equal(s.player.hp,85);assert.equal(s.adventure.progress.supplies,supplies-1);
    place(s,site.x+4,site.z+2);assert.ok(A.act(s,site.id+':rest','rest',C).ok);assert.equal(s.player.hp,100);assert.equal(A.act(s,site.id+':rest','rest',C).ok,false);
    s.adventure.restUntil=0;
  }
  const site=s.adventure.sites[2];place(s,site.x-4,site.z-6);
  assert.ok(A.act(s,'2:keeper','share',C).ok);assert.equal(s.fame,84);assert.equal(A.act(s,'2:keeper','preserve',C).ok,false);
  const raw=A.snapshot(s),snapshot=S.normalize({recipe:s.recipe,fame:s.fame,adventure:raw},B);
  const rebuilt=create(theme,812,JSON.parse(JSON.stringify(snapshot.adventure)));
  assert.equal(rebuilt.adventure.progress.cities[theme].ending,'share');assert.ok(rebuilt.adventure.sites.every(v=>v.progress.claimed&&!rebuilt.city.props.includes(v.gate)));
  assert.deepEqual(A.snapshot(rebuilt),raw);
  place(rebuilt,rebuilt.adventure.sites[0].x,rebuilt.adventure.sites[0].z+2);assert.equal(A.act(rebuilt,'0:chest','claim',C).ok,false);
}
const bad=A.normalize({version:1,cities:{dite:{ending:'share',sites:[{claimed:'yes',opened:1}]},evil:{}},supplies:Infinity,tracked:{theme:'dite',site:99}});
assert.equal(bad.cities.dite.ending,'');assert.equal(bad.cities.dite.sites[0].claimed,false);assert.equal(bad.supplies,0);assert.equal(bad.tracked,null);
const s=create('dite');s.adventure.progress.supplies=2;s.player.hp=30;s.mobs.push({team:'e',x:s.player.x+3,z:s.player.z,dead:false});assert.equal(A.remedy(s).ok,false);assert.equal(s.adventure.progress.supplies,2);s.mobs=[];
s.player.dead=1;assert.equal(A.remedy(s).ok,false);assert.equal(A.nearest(s,C),null);
// Interactions cannot reach through chamber walls, and travel cannot move a live power body.
const travel=create('cocito'),dest=travel.adventure.sites[1],first=travel.adventure.sites[0];
place(travel,first.x-7,first.z+2.5,Math.PI*1.5);
assert.equal(A.act(travel,'0:herb','harvest',C).ok,false,'Raccolta attraverso il muro');
dest.progress.discovered=true;place(travel,first.x,first.z-6);
const start={x:travel.player.x,z:travel.player.z};
for(const key of ['flight','form','dash','leap','ride','phase','possession','grab','anchor','mem','captive']){
  travel.player[key]={};assert.equal(A.travel(travel,1).ok,false,key);assert.equal(travel.player.x,start.x);travel.player[key]=null;
}
travel.mobs.push({team:'e',dead:false,x:dest.x,z:dest.z-6});assert.equal(A.travel(travel,1).ok,false,'Arrivo pericoloso');travel.mobs=[];
assert.equal(A.travel(travel,0).ok,false,'Luogo non scoperto');
assert.ok(A.travel(travel,1).ok);assert.equal(travel.player.x,dest.x);assert.equal(travel.player.z,dest.z-6);
// Ranged resonance uses the successful cast and exact range/line of sight, including continuous primaries.
for(const primary of ['raggio','soffio']){
  const q=create('dite'),site=q.adventure.sites[0],r=O.introRecipe();r.slots[0]={id:primary,el:site.element,t:1};
  assert.ok(C.setRecipe(q,r));place(q,site.x,site.z-10);step(q,{fire:true});assert.equal(site.progress.charged,false,'Risonanza oltre portata');
  place(q,site.x,site.z-6);q.player.cd[0]=0;for(let i=0;i<10;i++)step(q,{fire:true});assert.equal(site.progress.charged,true,primary);
}
console.log('Esplorazione: '+locations+' luoghi raggiungibili su 300 mondi; nove cicli cast/grata/reperto, tre finali, ricompense uniche, rimedi e persistenza verificati');
