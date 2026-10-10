import './generate-catalog.js';
import {mkdir,copyFile,cp,readFile,rm} from 'node:fs/promises';
import path from 'node:path';
const output=process.argv[2]==='dist'?'dist':'publicar';
await mkdir(output,{recursive:true});
for(const file of ['index.html','style.css','app.js','player.html','player.js','rom-path.js','catalog.json'])await copyFile(file,output+'/'+file);
const romOutput=path.resolve(output,'roms');
if(!romOutput.startsWith(path.resolve(output)+path.sep))throw Error('Destino inválido');
await rm(romOutput,{recursive:true,force:true});
const catalog=JSON.parse(await readFile('catalog.json','utf8'));
for(const game of catalog){
  const relative=decodeURIComponent(game.file).slice(1);
  const destination=path.join(output,relative);
  await mkdir(path.dirname(destination),{recursive:true});
  await copyFile(relative,destination);
}
await cp('images',output+'/images',{recursive:true});
console.log('Pasta '+output+' pronta para hospedagem estática.');
