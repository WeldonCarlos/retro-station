import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {isRomPath} from './rom-path.js';
test('Nomes de ROMs com pontuação e caracteres brasileiros',()=>{
  for(const name of ["Donkey Kong Country 2 - Diddy's Kong Quest (USA).zip",'Aaahh!!! Real Monsters (USA).zip','Futebol (Narração).ZIP','7th Saga, The (USA).zip']){
    const file='/roms/snes/'+encodeURIComponent(name);
    const params=new URLSearchParams({rom:file});
    assert.equal(isRomPath(new URLSearchParams(params.toString()).get('rom')),true,name);
  }
});
test('Todos os jogos presentes no catálogo são aceitos',async()=>{
  const catalog=JSON.parse((await readFile('catalog.json','utf8')).replace(/^\uFEFF/,''));
  for(const game of catalog)assert.equal(isRomPath(game.file),true,game.file);
});
test('Bloqueia caminhos fora de roms, escapes e extensões indevidas',()=>{
  for(const value of ['/roms/../index.html','/roms/%2e%2e/game.zip','/roms/%5c..%5cgame.zip','https://example.com/game.zip','/images/game.zip','/roms/game.js','/roms/%ZZ.zip','/roms/game.zip?x=1'])assert.equal(isRomPath(value),false,value);
});
