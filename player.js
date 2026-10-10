import {isRomPath} from './rom-path.js';
const params = new URLSearchParams(location.search);
const message=document.getElementById('message');
const cores=['nes','snes','segaMD','gb'];
const rom=params.get('rom') || '';
const validRom=isRomPath(rom);
if(!cores.includes(params.get('core')) || !validRom) {
  message.textContent='Jogo inválido. Volte à biblioteca e selecione uma ROM.';
} else {
  window.EJS_player='#game';
  window.EJS_core=params.get('core');
  window.EJS_gameUrl=params.get('rom');
  window.EJS_gameName=params.get('name');
  window.EJS_pathtodata='https://cdn.emulatorjs.org/stable/data/';
  window.EJS_biosUrl=params.get('bios') || '';
  window.EJS_color='#b8f568';
  window.EJS_startOnLoaded=true;
  window.EJS_onGameStart=()=>{message.hidden=true;};
  const loader=document.createElement('script');
  loader.src=window.EJS_pathtodata+'loader.js';
  loader.onerror=()=>{message.hidden=false;message.textContent='Não foi possível baixar o emulador. Verifique sua conexão e abra o jogo novamente.';};
  loader.onload=()=>{message.hidden=true;};
  document.body.append(loader);
}
