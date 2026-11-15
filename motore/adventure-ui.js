G.adventureUI = (() => {
  const $=id=>document.getElementById(id), esc=G.esc;
  function portrait(s,id,color){
    const i=Number(id.split(':')[0]),skin=['#b98e72','#c3a28a','#ae877b'][i],hood=['#33313d','#283b40','#393040'][i];
    return '<svg class="keeper-portrait" viewBox="0 0 240 260" aria-hidden="true"><defs><linearGradient id="portraitLight" x2="0" y2="1"><stop stop-color="'+color+'" stop-opacity=".2"/><stop offset="1" stop-color="'+color+'" stop-opacity="0"/></linearGradient></defs><circle cx="120" cy="110" r="88" fill="url(#portraitLight)"/><circle cx="120" cy="110" r="85" fill="none" stroke="'+color+'" stroke-opacity=".45"/><path d="M30 254 45 194 82 172 70 125 73 77 120 32 167 77 170 125 158 172 195 194 210 254Z" fill="'+hood+'" stroke="'+color+'" stroke-opacity=".7"/><path d="M79 100 97 75 143 75 161 100 154 145 136 164 105 164 86 145Z" fill="'+skin+'"/><path d="M78 103 120 57 162 103 151 75 120 46 89 75Z" fill="#181d28"/><path d="m89 109 18-4m26 0 18 4m-34 7-4 18h13m-19 13q14 8 27 0" fill="none" stroke="#473c3c" stroke-width="3" stroke-linecap="round"/><path d="M46 196 84 171 120 205 156 171 194 196 177 254H63Z" fill="'+color+'" fill-opacity=".22"/><path d="m84 171 36 34 36-34m-36 34v49" fill="none" stroke="'+color+'" stroke-width="2"/><path d="m120 215 9 10-9 10-9-10Z" fill="'+color+'"/><circle cx="99" cy="114" r="2" fill="#1d2027"/><circle cx="141" cy="114" r="2" fill="#1d2027"/></svg>';
  }
  function dialog(s,id,message) {
    const v=DiteAdventure.view(s,id);if(!v)return;
    $('dialogueTitle').textContent=v.title;$('dialogueEyebrow').textContent=v.eyebrow;$('dialogueText').textContent=v.text;
    $('dialogueMessage').textContent=message||'';$('dialogue').style.setProperty('--place-color',v.color);
    $('dialogueChoices').innerHTML=v.choices.map(c=>'<button class="dialogue-choice" type="button" data-adventure-action="'+c.id+'">'+esc(c.label)+'<span aria-hidden="true">↗</span></button>').join('');
    const keeper=id.split(':')[1]==='keeper';$('dialogueEmblem').classList.toggle('has-portrait',keeper);
    $('dialogueEmblem').innerHTML=keeper?portrait(s,id,v.color):G.svg(({rune:'orb',chest:'crown',lore:'eye',herb:'heal',rest:'heal',lever:'release'})[id.split(':')[1]]);
  }
  function atlas(s) {
    const a=s.adventure, progress=a.progress, theme=s.city.theme.id;
    let discoveries=0,relics=0;for(const c of Object.values(progress.cities))for(const v of c.sites){discoveries+=Number(v.discovered);relics+=Number(v.claimed);}
    $('atlasSummary').textContent=discoveries+'/9 luoghi scoperti · '+relics+'/9 frammenti · '+progress.supplies+' scorte';
    $('atlasCity').textContent=s.city.nome;
    const map=$('atlasMap'),ctx=map.getContext('2d'),size=map.width,k=size/s.city.N,mm=v=>(v+s.city.HALF)/(s.city.HALF*2)*size;
    ctx.fillStyle='#111920';ctx.fillRect(0,0,size,size);
    for(let z=0;z<s.city.N;z++)for(let x=0;x<s.city.N;x++){const tile=s.city.map[z][x];ctx.fillStyle=tile==='#'?'#28343b':tile==='~'?'#395968':tile==='='?'#ab9975':'#172027';ctx.fillRect(x*k,z*k,k+.5,k+.5);}
    for(const site of a.sites){const tracked=progress.tracked&&progress.tracked.theme===theme&&progress.tracked.site===site.id;ctx.fillStyle=site.progress.claimed?'#8ddcb5':site.color;ctx.beginPath();ctx.arc(mm(site.x),mm(site.z),tracked?12:9,0,Math.PI*2);ctx.fill();ctx.fillStyle='#111';ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(site.id+1),mm(site.x),mm(site.z));}
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(mm(s.player.x),mm(s.player.z),5,0,7);ctx.fill();
    $('atlasPlaces').innerHTML=a.sites.map(site=>{
      const v=site.progress,tracked=progress.tracked&&progress.tracked.theme===theme&&progress.tracked.site===site.id;
      const state=v.claimed?'Frammento recuperato':v.opened?'Entra nella camera':v.charged?'Aziona la grata':v.discovered?'Accorda il sigillo · '+site.element:'Da esplorare';
      return '<article class="atlas-place" style="--place-color:'+site.color+'"><div class="place-number">0'+(site.id+1)+'</div><div><span class="eyebrow">'+esc(state)+'</span><h3>'+esc(site.name)+'</h3><p>'+esc(site.role)+' · '+esc(site.keeper)+'</p><button type="button" class="btn2" data-track-site="'+site.id+'" aria-pressed="'+!!tracked+'">'+(tracked?'Seguito':'Segui sulla mappa')+'</button>'+(v.discovered?'<button type="button" class="btn2" data-travel-site="'+site.id+'">Raggiungi il luogo</button>':'')+'</div></article>';
    }).join('');
    const notes=[];for(const [key,entries] of Object.entries(DiteAdventure.BOOK))entries.forEach((entry,i)=>{const v=progress.cities[key].sites[i];if(v.read)notes.push('<article><h3>'+esc(entry.name)+'</h3><p>'+esc(entry.lore)+'</p></article>');});
    $('atlasMemories').innerHTML=notes.length?notes.join(''):'<p class="atlas-empty">Leggi i reperti o ascolta i custodi per conservare qui le memorie dei nove luoghi.</p>';
    const endings=Object.entries(progress.cities).filter(([,c])=>c.ending);
    $('atlasEndings').textContent=endings.length?endings.map(([theme,c])=>City.THEMES[theme].nome+' · '+(c.ending==='share'?'Custode dei legami':'Custode della memoria')).join(' / '):'Tre frammenti per città. Poi torna da un custode per scegliere a chi affidarli.';
  }
  return {dialog,atlas};
})();
