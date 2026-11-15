// Nove luoghi originali; geometria statica unita per materiale, stato dinamico minimo.
G.buildAdventure = function (s) {
  const a=s.adventure, scene=G.scene, groups=[];
  const cube=new THREE.BoxGeometry(1,1,1), cylinder=new THREE.CylinderGeometry(1,1,1,10), sphere=new THREE.IcosahedronGeometry(1,1), ring=new THREE.TorusGeometry(1,.045,5,32), roof=new THREE.ConeGeometry(1,1,4),arch=new THREE.TorusGeometry(1,.12,6,20,Math.PI);
  const allGeo=[cube,cylinder,sphere,ring,roof,arch], staticByMaterial=new Map();
  const materials=[];
  function mat(color, glow=false) { const m=glow?new THREE.MeshBasicMaterial({color}):new THREE.MeshStandardMaterial({color,roughness:.8,metalness:.18}); materials.push(m);return m; }
  const stone=mat('#667078'), dark=mat('#222b31'), gold=mat('#ad8551'), wood=mat('#58463c'), paper=mat('#c8b690');
  function put(parent,geo,m,x,y,z,sx,sy,sz,staticMesh=true,rotation=0) {
    const mesh=new THREE.Mesh(geo,m);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);if(typeof rotation==='object')mesh.rotation.set(rotation.x||0,rotation.y||0,rotation.z||0);else mesh.rotation.y=rotation;
    if(staticMesh){mesh.updateMatrix();const copy=(geo.index?geo.toNonIndexed():geo.clone()).applyMatrix4(mesh.matrix);if(!staticByMaterial.has(m))staticByMaterial.set(m,[]);staticByMaterial.get(m).push(copy);}
    else parent.add(mesh);return mesh;
  }
  function label(text,x,y,z,color,width=7) {
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;const ctx=canvas.getContext('2d');
    ctx.fillStyle='#12171ee8';ctx.fillRect(0,0,512,96);ctx.strokeStyle=color;ctx.lineWidth=3;ctx.strokeRect(2,2,508,92);
    ctx.fillStyle='#f5ebd5';ctx.font='600 27px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,48,490);
    const texture=G.ownTexture(new THREE.CanvasTexture(canvas)),m=new THREE.SpriteMaterial({map:texture,depthTest:true});
    const sp=new THREE.Sprite(m);sp.position.set(x,y,z);sp.scale.set(width,width*96/512,1);scene.add(sp);return sp;
  }
  for(const site of a.sites){
    const x=site.x,z=site.z, tint=mat(site.color), glow=mat(site.color,true), group=new THREE.Group();group.position.set(x,0,z);scene.add(group);
    const box=(m,dx,y,dz,w,h,d,rot=0)=>put(scene,cube,m,x+dx,y,z+dz,w,h,d,true,rot);
    const col=(m,dx,y,dz,r,h)=>put(scene,cylinder,m,x+dx,y,z+dz,r,h,r);
    box(dark,0,.035,1,15,.07,14); // pavimento a livello della strada, nessun gradino fittizio
    for(const dx of [-6,6])for(const dz of [0,6]){col(stone,dx,2.5,dz,.45,5);box(gold,dx,5,dz,1.2,.22,1.2);}
    box(stone,0,5.2,0,13,.45,.85);box(stone,0,5.2,6,13,.45,.85);
    for(const dx of [-4,0,4])box(dark,dx,1.4,6,4,2.8,.8);
    for(const dx of [-6,6])box(dark,dx,1.4,3,.8,2.8,6);
    for(const dx of [-4,4])box(stone,dx,1.4,0,4,2.8,.7);
    for(const dx of [-6,6])box(glow,dx,4.2,0,.1,.7,.95);
    label(site.name,x,5.9,z-5,site.color);
    // Ogni sagoma ha una funzione riconoscibile dalla strada.
    if(site.kind==='forge'){
      for(const dx of [-4,4]){col(dark,dx,5,5,1.1,10);col(gold,dx,8.7,5,1.25,.3);col(tint,dx,10,5,1.3,.35);box(glow,dx,1.3,4.1,.5,1.2,.05);for(let h=2;h<9;h+=2)box(gold,dx,h,3.9,1.2,.15,.1);}
      for(const dx of [-4,4]){box(wood,dx,3.7,0,3.5,1,.9);box(glow,dx,3.7,-.49,2.8,.08,.05);}
      col(dark,0,.5,-3,1.3,.8);col(glow,0,.96,-3,1.05,.08);
    }else if(site.kind==='archive'){
      put(scene,roof,dark,x,7.2,z+3,10,3.5,6,true,Math.PI/4);
      for(const dx of [-4,4])for(let j=0;j<7;j++)box(j%2?paper:tint,dx-1.1+j*.35,3.8,-.44,.23,1.6,.15);
      for(const dx of [-5,5])for(let row=0;row<3;row++){
        box(wood,dx,1+row*.8,3,1,.12,4.7);
        for(let j=0;j<9;j++)box(j%2?paper:tint,dx,1.35+row*.8,1+j*.45,.7,.6,.25,(j%3-1)*.08);
      }
      box(gold,0,5.7,3,4,.15,4);col(glow,0,5.3,3,.16,.8);
    }else if(site.kind==='observatory'){
      const orbit=new THREE.Group();orbit.position.set(0,8.5,3);group.add(orbit);
      for(let i=0;i<3;i++){const m=put(orbit,ring,glow,0,0,0,2+i*.4,2+i*.4,2+i*.4,false);m.rotation.x=i*.7;m.rotation.z=i*.8;}
      put(orbit,sphere,tint,0,0,0,.5,.5,.5,false);group.userData.orbit=orbit;
      col(stone,0,4,5,.45,8);box(gold,0,6,3,7,.18,5);
    }else if(site.kind==='garden'){
      for(const dx of [-4,4])for(const dz of [1.6,4.6]){
        col(wood,dx,2,dz,.2,4);put(scene,sphere,tint,x+dx,4.3,z+dz,1.5,2,1.5);
        box(stone,dx,.25,dz,2.2,.5,1.8);
      }
      for(let i=0;i<4;i++)put(scene,arch,gold,x,4.5,z+i*2,6,3.5,1);
      if(s.city.theme.id==='malebolge')for(const dx of [-4,4]){col(tint,dx,6.8,3,.6,1.7);col(gold,dx,7.8,3,.25,.5);}
    }else if(site.kind==='cloister'){
      for(const dx of [-1.6,1.6])col(paper,dx,7.2,3,.2,5);
      put(scene,roof,dark,x,10,z+3,3.4,2,3.4,true,Math.PI/4);
      put(scene,arch,paper,x,4.1,z-.5,2.2,2,1);
      for(const dx of [-4,4])for(const dz of [1,3,5]){col(stone,dx,2,dz,.25,4);box(paper,dx,4,dz,.8,.15,.8);}
      const bell=put(group,cylinder,gold,0,8,3,.9,1.1,.9,false);group.userData.bell=bell;
      for(const dx of [-2,2])box(glow,dx,2.5,5.5,.3,2,.1);
    }else if(site.kind==='docks'){
      box(tint,0,.09,4,9,.1,2.5);
      for(let i=0;i<10;i++)box(wood,-4.5+i,.2,2.5,.7,.2,5);
      for(const dx of [-4,4]){box(wood,dx,.7,4,1.3,.8,3.1);col(gold,dx,5,4,.12,10);box(paper,dx+.6,7.6,4,2.5,3,.06);box(gold,dx+.6,9.2,4,3,.1,.1);}
      if(s.city.theme.id==='malebolge')for(const dx of [-4,4]){box(tint,dx,4.5,-1,3.5,.2,3);for(let i=0;i<5;i++)box(paper,dx-1.4+i*.7,4.52,-1,.3,.2,3);}
    }else{
      box(tint,0,6.5,1,12,1.8,2);box(gold,0,7.5,1,13,.2,2.5);
      for(const dx of [-3,3]){put(scene,sphere,paper,x+dx,6.6,z-.1,.75,.8,.25);box(dark,dx-.25,6.8,-.35,.12,.12,.05);box(dark,dx+.25,6.8,-.35,.12,.12,.05);box(dark,dx,6.3,-.35,.3,.1,.05);}
      box(wood,0,.1,4,10,.2,3);
      for(const dx of [-4,4]){box(tint,dx,3.2,5,2,4,.12);put(scene,sphere,paper,x+dx,3,z+4.8,.5,.7,.2);}
      for(const dx of [-3,0,3])box(wood,dx,.45,1.8,1.8,.9,.6);
    }
    const gate=new THREE.Group();group.add(gate);
    for(let i=-3;i<=3;i++)put(gate,cube,gold,i*.55,1.7,0,.09,3.4,.16,false);
    for(const y of [.3,3.1])put(gate,cube,gold,0,y,0,3.8,.15,.2,false);
    // Nine bars move as one gate: one draw per chamber, not nine.
    const bars=gate.children.map(mesh=>{mesh.updateMatrix();return mesh.geometry.clone().applyMatrix4(mesh.matrix);});
    const gateGeometry=THREE.BufferGeometryUtils.mergeBufferGeometries(bars,false);
    gate.clear();gate.add(new THREE.Mesh(gateGeometry,gold));for(const geo of bars)geo.dispose();
    const rune=new THREE.Group();rune.position.set(0,1,-2.5);group.add(rune);
    put(rune,cylinder,dark,0,-.5,0,.65,.8,.65,false);
    const gem=put(rune,sphere,glow,0,.4,0,.36,.5,.36,false);
    const chest=new THREE.Group();chest.position.set(0,.5,3);group.add(chest);
    put(chest,cube,wood,0,0,0,1.6,.85,.8,false);
    const lid=put(chest,cube,gold,0,.5,0,1.7,.15,.9,false);
    const herb=put(group,sphere,tint,-4,.4,2.5,.55,.7,.55,false);
    box(wood,4,.65,2.5,2,.18,.65);for(const dx of [3.3,4.7])box(gold,dx,.3,2.5,.15,.6,.5);
    box(stone,4,.7,-4,1,.9,.7);box(paper,4,1.2,-4,1.05,.08,.8);
    col(dark,3,.4,-1.5,.25,.8);const lever=put(group,cube,gold,3,1,-1.5,.12,.9,.12,false);lever.rotation.z=.5;
    // Abitante dedicato: vesti, volto e cappuccio originali, senza texture remote.
    put(scene,cylinder,tint,x-4,.85,z-4,.35,1.5,.35);put(scene,sphere,paper,x-4,1.8,z-4,.28,.32,.28);
    put(scene,sphere,dark,x-4,1.98,z-3.94,.36,.22,.34);
    for(const dx of [-.42,.42])put(scene,cylinder,tint,x-4+dx,1,z-4,.1,.8,.1);
    label(site.keeper,x-4,2.65,z-4,site.color,2.6);
    groups.push({site,group,gate,gem,lid,herb,lever,glow});
  }
  for(const [material,list]of staticByMaterial){const merged=THREE.BufferGeometryUtils.mergeBufferGeometries(list,false);scene.add(new THREE.Mesh(merged,material));for(const g of list)g.dispose();}
  // Le primitive degli oggetti dinamici appartengono a questa scena.
  for(const geo of allGeo)if(!groups.some(g=>{let used=false;g.group.traverse(o=>{if(o.geometry===geo)used=true;});return used;}))geo.dispose();
  G.adventureViews=groups;
};
G.syncAdventure = function (s,dt,t) {
  if(!G.adventureViews)return;
  for(const v of G.adventureViews){const p=v.site.progress,ending=s.adventure.progress.cities[s.city.theme.id].ending;
    v.gate.position.y=p.opened?3.7:0;v.gem.scale.set(.36,.5,.36).multiplyScalar(p.charged?1.25:1);if(!G.renderPrefs.reducedMotion)v.gem.rotation.y=t*.35;
    v.lid.rotation.x=p.claimed?-1.1:0;v.herb.visible=!p.harvested;v.lever.rotation.z=p.opened?-.5:.5;
    v.glow.color.set(ending==='share'?'#82dabb':ending==='preserve'?'#b7a1ee':p.charged?'#e8d8aa':v.site.color);
    if(v.group.userData.orbit&&!G.renderPrefs.reducedMotion)v.group.userData.orbit.rotation.y=t*.12;
  }
};
