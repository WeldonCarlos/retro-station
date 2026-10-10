const systems = {
  nes:{name:'Nintendo NES',short:'NES',maker:'NINTENDO',icon:'▣',color:'#ee6f6a'},
  snes:{name:'Super Nintendo',short:'SNES',maker:'NINTENDO',icon:'✣',color:'#bca0ff'},
  segaMD:{name:'Mega Drive',short:'MEGA DRIVE',maker:'SEGA',icon:'◈',color:'#56cdf5'},
  gb:{name:'Game Boy',short:'GAME BOY',maker:'NINTENDO',icon:'▥',color:'#c5ec70'}
};
const $=id=>document.getElementById(id);
let selected='all',games=[],featuredId=null,toastTimer;
function notify(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,7000);}
const entries=[['all',{name:'Todos os consoles',short:'TODOS',maker:'SUA COLEÇÃO',icon:'▦',color:'#c2ff63'}],...Object.entries(systems)];
for(const [id,system] of entries){
  const button=document.createElement('button');button.className='console-button';button.dataset.system=id;button.style.setProperty('--console-color',system.color);
  button.innerHTML=`<span class="console-symbol">${system.icon}</span><span class="console-name"><small>${system.maker}</small><strong>${system.short}</strong></span><span class="console-count">0</span>`;
  button.onclick=()=>{selected=id;featuredId=null;render();};$('systems').append(button);
}
function filteredGames(){const query=$('search').value.trim().toLocaleLowerCase();return games.filter(game=>(selected==='all'||game.core===selected)&&game.name.toLocaleLowerCase().includes(query));}
function render(){
  const filtered=filteredGames();$('heading').textContent=selected==='all'?'Todos os jogos':systems[selected].name;$('count').textContent=filtered.length;$('totalGames').textContent=games.length;
  document.querySelectorAll('.console-button').forEach(button=>{button.classList.toggle('active',button.dataset.system===selected);button.setAttribute('aria-pressed',String(button.dataset.system===selected));button.querySelector('.console-count').textContent=games.filter(game=>button.dataset.system==='all'||game.core===button.dataset.system).length;});
  $('games').replaceChildren();$('empty').hidden=filtered.length>0;
  $('emptyMessage').textContent=selected==='nes'&&!games.some(game=>game.core==='nes')?'Nenhum jogo de NES incluído nesta coleção ainda.':'Tente outro nome ou escolha outro console.';
  for(const game of filtered){
    const system=systems[game.core];const card=document.createElement('article');card.className='card';card.style.setProperty('--console-color',system.color);
    const cover=document.createElement('button');cover.className='cover';cover.setAttribute('aria-label','Destacar '+game.name);
    if(game.cover||game.image){const image=document.createElement('img');image.src=game.cover||game.image;image.alt='';image.loading='lazy';if(game.cover)image.className='boxart';image.onerror=()=>{image.remove();cover.classList.add('no-image');const symbol=document.createElement('span');symbol.textContent=system.icon;cover.prepend(symbol);};cover.append(image);}else{cover.classList.add('no-image');cover.textContent=system.icon;}
    const badge=document.createElement('span');badge.className='card-console';badge.textContent=system.short;cover.append(badge);cover.onclick=()=>{featuredId=game.id;renderFeature(filtered);document.querySelector('.showcase').scrollIntoView({behavior:'smooth',block:'start'});};
    const body=document.createElement('div');body.className='card-body';const title=document.createElement('h3');title.textContent=game.name;body.append(title);
    const actions=document.createElement('div');actions.className='card-actions';const playButton=document.createElement('button');playButton.className='card-play';playButton.textContent='▶ Jogar';playButton.onclick=()=>play(game);actions.append(playButton);
    if(game.source){const source=document.createElement('a');source.href=game.source;source.target='_blank';source.rel='noopener noreferrer';source.textContent='Créditos ↗';source.className='source-link';actions.append(source);}
    body.append(actions);card.append(cover,body);$('games').append(card);
  }
  renderFeature(filtered);
}
function renderFeature(filtered=filteredGames()){
  const game=filtered.find(game=>game.id===featuredId)||filtered.find(game=>game.core==='snes'&&game.image)||filtered[0];
  $('playFeatured').disabled=!game;$('shuffle').disabled=!game;$('previous').disabled=filtered.length<2;$('next').disabled=filtered.length<2;
  if(!game){featuredId=null;$('featuredName').textContent='A próxima aventura está por vir.';$('featuredSystem').textContent=selected==='all'?'RETRO STATION':systems[selected].short;$('featuredDescription').textContent='Escolha outro console ou ajuste sua busca.';$('featuredImage').hidden=true;$('featuredFallback').hidden=false;$('featuredIndex').textContent='00 / 00';$('screenConsole').textContent='RETRO STATION';return;}
  featuredId=game.id;const system=systems[game.core];document.querySelector('.showcase').style.setProperty('--feature-color',system.color);
  $('featuredName').textContent=game.name;$('featuredSystem').textContent=system.name;$('screenConsole').textContent=system.short;
  $('featuredDescription').textContent='Entre no jogo, descubra novos desafios e faça a próxima boa memória.';
  $('featuredIndex').textContent=String(filtered.indexOf(game)+1).padStart(2,'0')+' / '+String(filtered.length).padStart(2,'0');
  const artwork=game.image||game.cover;const image=$('featuredImage');image.hidden=!artwork;$('featuredFallback').hidden=!!artwork;image.classList.toggle('boxart',!game.image&&!!game.cover);if(artwork){image.onerror=()=>{image.hidden=true;$('featuredFallback').hidden=false;};image.src=artwork;}
  $('playFeatured').onclick=()=>play(game);
}
function step(amount){const list=filteredGames();if(!list.length)return;const index=list.findIndex(game=>game.id===featuredId);featuredId=list[(index+amount+list.length)%list.length].id;renderFeature(list);}
$('previous').onclick=()=>step(-1);$('next').onclick=()=>step(1);$('shuffle').onclick=()=>{const list=filteredGames().filter(game=>game.id!==featuredId);if(list.length){featuredId=list[Math.floor(Math.random()*list.length)].id;renderFeature();}};
$('search').oninput=render;$('browse').onclick=()=>$('library').scrollIntoView({behavior:'smooth'});
function release(){$('player').src='about:blank';}
function play(game){release();const params=new URLSearchParams({core:game.core,rom:game.file,name:game.name});if(game.bios)params.set('bios',game.bios);$('playingTitle').textContent=game.name;$('player').src='player.html?'+params;$('playDialog').showModal();}
$('closePlayer').onclick=()=>$('playDialog').close();$('playDialog').addEventListener('close',release);
$('fullscreen').onclick=()=>$('player').requestFullscreen().catch(()=>notify('Tela cheia indisponível neste navegador.'));
try{const response=await fetch('catalog.json');if(!response.ok)throw Error('HTTP '+response.status);games=(await response.json()).filter(game=>systems[game.core]&&game.file?.startsWith('/roms/'));}catch{notify('Não foi possível carregar a coleção. Recarregue a página.');}
render();
