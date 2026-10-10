import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css', '.js':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.zip':'application/zip', '.png':'image/png', '.svg':'image/svg+xml', '.gb':'application/octet-stream', '.gbc':'application/octet-stream', '.nes':'application/octet-stream', '.sfc':'application/octet-stream', '.smc':'application/octet-stream', '.md':'application/octet-stream', '.gen':'application/octet-stream', '.smd':'application/octet-stream', '.bin':'application/octet-stream', '.iso':'application/octet-stream', '.chd':'application/octet-stream', '.pbp':'application/octet-stream' };
http.createServer(async (req,res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    const relative = path.relative(root,file);
    const isAsset = (relative.startsWith('roms' + path.sep) || relative.startsWith('images' + path.sep)) && Object.hasOwn(types,path.extname(file).toLowerCase());
    if (!file.startsWith(root + path.sep) || (!isAsset && !['index.html','style.css','app.js','player.html','player.js','rom-path.js','catalog.json'].includes(relative))) { res.writeHead(404).end(); return; }
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type':types[path.extname(file).toLowerCase()], 'X-Content-Type-Options':'nosniff', 'Cache-Control':'no-cache' }); res.end(data);
  } catch { res.writeHead(404).end('Arquivo não encontrado'); }
}).listen(3000,'127.0.0.1',()=>console.log('Retro Station: http://localhost:3000'));
