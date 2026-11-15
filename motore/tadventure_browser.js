'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('./pw.js');
(async()=>{
  fs.mkdirSync('shots',{recursive:true});
  const browser=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  try{
    const context=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true});
    const page=await context.newPage(),errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error(e.stack);});page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await page.goto('file://'+__dirname+'/dist/index.html');
    await page.waitForFunction(()=>window.__dite?.screen().screen==='lobby');
    await page.evaluate(()=>{const D=window.__dite;D.lockQ=true;D.setPreference('quality','performance');D.setPreference('muted',true);D.begin();document.getElementById('guideSkip').click();});
    const screen=name=>page.waitForFunction(name=>window.__dite.screen().screen===name,name);
    const pose=async(id,dx,dz,pitch=0)=>{
      await page.evaluate(({id,dx,dz,pitch})=>{
        const D=window.__dite,s=D.state(),p=s.player,site=s.adventure.sites[id];
        s.mobs=[];s.patrols=[];for(const t of s.turrets)t.state='friendly';s.shots=[];s.zones=[];s.quest=null;s.boss=null;s.teles=[];
        Object.assign(p,{x:site.x+dx,z:site.z+dz,hp:100,dead:0,invuln:999});Object.assign(p.cam,{x:p.x,y:1.7,z:p.z});D.setLook(Math.PI,pitch);D.begin();
      },{id,dx,dz,pitch});
      await screen('playing');
    };
    const interact=async(id,type,dx,dz)=>{
      await pose(id,dx,dz);
      await page.waitForFunction(key=>window.__dite.state().adventure.target?.id===key,id+':'+type);
      await page.locator('#useBtn').tap();await screen('dialogue');
    };
    const close=async()=>{await page.locator('#dialogueClose').tap();await screen('playing');};
    const cdp=await context.newCDPSession(page);
    for(const theme of ['dite','cocito','malebolge']){
      await page.evaluate(theme=>{window.__dite.loadCity(theme,14);window.__dite.begin();},theme);
      for(let id=0;id<3;id++){
        console.log('Luogo',theme,id);
        await pose(id,0,-13,.12);
        await page.waitForFunction(()=>window.__dite.state().t>.12);
        await page.screenshot({path:'shots/place-'+theme+'-'+id+'.png'});
        await interact(id,'keeper',-4,-6);
        assert.equal(await page.evaluate(()=>window.__dite.screen().playing),false);
        const before=await page.evaluate(()=>window.__dite.state().t);
        await page.locator('[data-adventure-action="ask"]').tap();
        assert.ok((await page.locator('#dialogueMessage').innerText()).length>40);
        assert.equal(await page.evaluate(()=>window.__dite.state().t),before,'Dialogue must pause simulation');
        await page.locator('[data-adventure-action="track"]').tap();
        if(theme==='dite'&&id===0){
          await page.screenshot({path:'shots/adventure-dialogue.png'});
          await page.evaluate(()=>{window.dispatchEvent(new Event('pagehide'));window.dispatchEvent(new Event('pageshow'));});
          assert.equal(await page.evaluate(()=>window.__dite.screen().screen),'dialogue');
          assert.equal(await page.evaluate(()=>window.__dite.screen().playing),false);
        }
        await close();
        await pose(id,0,-6);
        await page.evaluate(id=>{const D=window.__dite,s=D.state(),r=structuredClone(s.recipe);r.slots[0]={id:'dardo',el:s.adventure.sites[id].element,t:1};D.setRecipe(r);},id);
        const b=await page.locator('#b0').boundingBox();
        await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:b.x+b.width/2,y:b.y+b.height/2,id:1}]});
        await page.waitForFunction(id=>window.__dite.state().adventure.sites[id].progress.charged,id);
        await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        await interact(id,'lever',3,-3);
        await page.locator('[data-adventure-action="open"]').tap();await close();
        // Real keyboard movement crosses the newly opened collision gate.
        await pose(id,0,-1.4);await page.keyboard.down('w');
        await page.waitForFunction(id=>{const s=window.__dite.state();return s.player.z>s.adventure.sites[id].z+1;},id);
        await page.keyboard.up('w');
        await pose(id,0,1.5);
        await page.waitForFunction(id=>window.__dite.state().adventure.target?.id===id+':chest',id);
        await page.locator('#useBtn').tap();await screen('dialogue');
        const fame=await page.evaluate(()=>window.__dite.state().fame);
        await page.locator('[data-adventure-action="claim"]').tap();
        assert.equal(await page.evaluate(()=>window.__dite.state().fame),fame+18);
        assert.equal(await page.locator('[data-adventure-action="claim"]').count(),0);
        await close();
        await page.screenshot({path:'shots/place-'+theme+'-'+id+'-inside.png'});
        await interact(id,'herb',-4,1.5);await page.locator('[data-adventure-action="harvest"]').tap();await close();
      }
      await interact(2,'keeper',-4,-6);
      await page.locator('[data-adventure-action="share"]').tap();await close();
      assert.equal(await page.evaluate(()=>window.__dite.state().adventure.progress.cities[window.__dite.state().city.theme.id].ending),'share');
    }
    await page.locator('#menuBtn').tap();await page.locator('#menuAtlas').tap();await screen('atlas');
    assert.match(await page.locator('#atlasSummary').innerText(),/9\/9 luoghi.*9\/9 frammenti.*9 scorte/);
    for(const [width,height]of [[568,320],[667,375],[844,390],[1024,768]]){
      await page.setViewportSize({width,height});
      assert.ok(await page.locator('#atlas').evaluate(n=>n.scrollWidth<=n.clientWidth+1));
      assert.ok(await page.locator('.atlas-cartography').evaluate(n=>{const b=n.getBoundingClientRect(),h=n.querySelector('h3').getBoundingClientRect(),head=document.querySelector('#atlas .screen-head').getBoundingClientRect(),foot=document.querySelector('#atlasSaveStatus').getBoundingClientRect();return h.top>=b.top-1&&b.top>=head.bottom-1&&b.bottom<=foot.top+1;}),'Mappa, titolo e stato di salvataggio non devono sovrapporsi');
      for(const selector of ['#atlas .back-btn','[data-track-site="0"]','[data-travel-site="0"]']){
        const b=await page.locator(selector).boundingBox();assert.ok(b.width>=44&&b.height>=44,selector);
      }
      await page.screenshot({path:'shots/atlas-'+width+'.png'});
    }
    await page.setViewportSize({width:844,height:390});
    await page.evaluate(()=>window.__dite.state().player.flight={y:8,t:5});
    await page.locator('[data-travel-site="0"]').tap();await screen('atlas');assert.match(await page.locator('#atlasMessage').innerText(),/non disponibile/);
    await page.evaluate(()=>window.__dite.state().player.flight=null);
    await page.locator('[data-travel-site="0"]').tap();await screen('playing');
    await page.locator('#menuBtn').tap();await page.evaluate(()=>window.__dite.state().player.hp=40);await page.locator('#useRemedy').tap();
    assert.equal(await page.evaluate(()=>window.__dite.state().player.hp),75);
    await page.reload();await screen('lobby');
    const saved=await page.evaluate(()=>window.__dite.store.adventure);
    assert.equal(saved.supplies,8);assert.ok(Object.values(saved.cities).every(c=>c.ending==='share'&&c.sites.every(v=>v.claimed)));
    await interact(0,'keeper',-4,-6);
    await page.evaluate(()=>{window.__savedSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new DOMException('Quota test','QuotaExceededError');};});
    await page.locator('[data-adventure-action="track"]').tap();
    assert.match(await page.locator('#dialogueSaveStatus').innerText(),/temporanei/,'Il dialogo deve dichiarare un salvataggio fallito');
    await page.evaluate(()=>Storage.prototype.setItem=window.__savedSetItem);
    await page.locator('[data-adventure-action="track"]').tap();
    assert.match(await page.locator('#dialogueSaveStatus').innerText(),/Salvato sul dispositivo/);
    assert.deepEqual(errors,[]);
    console.log('GDR browser: nove luoghi, dialoghi sospesi, nove cast touch, grate attraversate, reperti, tre scelte, atlante mobile/tablet, viaggio e ricaricamento; nessun errore');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
