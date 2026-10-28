// A tiny static server for playing the game on this computer: `npm start`, then open the address
// it prints. No packages needed. ES modules need a server (a page opened as file:// cannot load
// them), and this one also sends the right types for .js, .png and .svg.
//
//   node tools/serve.mjs              http://127.0.0.1:8790/
//   node tools/serve.mjs --port 9000
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootArg = process.argv.indexOf('--root');
const ROOT = rootArg > -1 ? resolve(process.argv[rootArg + 1]) : resolve(fileURLToPath(new URL('..', import.meta.url)));
const arg = process.argv.indexOf('--port');
const PORT = Number(arg > -1 ? process.argv[arg + 1] : process.env.PORT) || 8790;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.m4a': 'audio/mp4', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.md': 'text/plain; charset=utf-8',
};

createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = normalize(join(ROOT, path));
    // nothing outside the project folder, and nothing hidden (.git and the like)
    if (!file.startsWith(ROOT) || file.slice(ROOT.length).split(sep).some(p => p.startsWith('.'))) throw Object.assign(new Error(), { code: 'ENOENT' });
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    const body = await readFile(file);
    const headers={'Content-Type':TYPES[extname(file).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store','Accept-Ranges':'bytes'};
    // Browsers request byte ranges to seek within a song before its download completes.
    const range=req.headers.range?.match(/^bytes=(\d*)-(\d*)$/);
    if(range&&(range[1]||range[2])){
      const start=range[1]?Number(range[1]):Math.max(0,body.length-Number(range[2]));
      const end=range[1]?(range[2]?Math.min(Number(range[2]),body.length-1):body.length-1):body.length-1;
      if(start>=body.length||start>end){res.writeHead(416,{...headers,'Content-Range':`bytes */${body.length}`});res.end();return;}
      res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${body.length}`,'Content-Length':end-start+1});res.end(req.method==='HEAD'?undefined:body.subarray(start,end+1));return;
    }
    res.writeHead(200,{...headers,'Content-Length':body.length});res.end(req.method==='HEAD'?undefined:body);
  } catch (err) {
    res.writeHead(err.code === 'ENOENT' || err.code === 'ENOTDIR' ? 404 : 500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(err.code === 'ENOENT' || err.code === 'ENOTDIR' ? 'not found' : 'error');
  }
}).listen(PORT, '127.0.0.1', () => console.log(`遊戲在 http://127.0.0.1:${PORT}/ （按 Ctrl+C 停止）`));
