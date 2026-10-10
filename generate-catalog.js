import {readdir,readFile,writeFile,stat,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=process.cwd();
await mkdir(path.join(root,'roms'),{recursive:true});
await mkdir(path.join(root,'images'),{recursive:true});
const previous=JSON.parse((await readFile('catalog.json','utf8').catch(()=>'[]')).replace(/^\uFEFF/,''));
const byFile=new Map(previous.map(game=>[decodeURIComponent(game.file),game]));
const aliases={nes:'nes',snes:'snes',genesis:'segaMD',megadrive:'segaMD',megadriver:'segaMD',segamd:'segaMD',gb:'gb',gbc:'gb',gameboy:'gb',psx:'psx',ps1:'psx',playstation:'psx'};
const extensions={'.nes':'nes','.sfc':'snes','.smc':'snes','.md':'segaMD','.gen':'segaMD','.smd':'segaMD','.gb':'gb','.gbc':'gb','.iso':'psx','.chd':'psx','.pbp':'psx'};
const catalog=[];
async function scan(folder){
  for(const item of await readdir(folder,{withFileTypes:true})){
    const file=path.join(folder,item.name);if(item.isDirectory()){await scan(file);continue;}if(!item.isFile())continue;
    const relative='/'+path.relative(root,file).replaceAll('\\','/');const known=byFile.get(relative);
    const ext=path.extname(file).toLowerCase();if(!extensions[ext]&&!['.zip','.bin'].includes(ext))continue;
    const prefix=path.basename(file).split('-')[0].toLowerCase();const folderName=path.basename(folder).toLowerCase();
    const core=known?.core||aliases[folderName]||aliases[prefix]||extensions[ext];
    if(core==='psx')continue;
    if(!core){console.warn('Console desconhecido, use uma subpasta por console: '+relative);continue;}
    const info=await stat(file);
    const game={...known,id:known?.id||'local-'+createHash('sha256').update(relative).digest('hex').slice(0,20),core,name:known?.name||path.basename(file,ext).replace(/^(nes|snes|genesis|megadrive|gb|gbc|psx|ps1)-/i,''),file:relative.split('/').map(segment=>encodeURIComponent(segment)).join('/'),size:info.size};
    const custom='/images/'+core+'/'+path.basename(file,ext)+'.png';
    if(await stat(path.join(root,custom)).then(info=>info.isFile()).catch(()=>false))game.cover=custom.split('/').map(encodeURIComponent).join('/');
    catalog.push(game);
  }
}
await scan(path.join(root,'roms'));
await writeFile('catalog.json',JSON.stringify(catalog,null,2)+'\n');
console.log(catalog.length+' jogos no catálogo.');
