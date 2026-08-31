import { chromium } from 'playwright-core';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import http from 'http';
// proxy minimal: serve dari ./ tapi tambahkan <script> di head untuk set localStorage theme=dark
const server = http.createServer((req, res) => {
  let p = req.url.split('?')[0];
  if (p === '/') p = '/index.html';
  const fp = path.join('.', p);
  fs.readFile(fp, (err, data) => {
    if (err) { res.statusCode=404; res.end('nf'); return; }
    let body = data.toString('utf8');
    if (p === '/index.html') {
      const inj = `<script>try{localStorage.setItem('theme','dark')}catch(e){}</script>`;
      body = body.replace('</head>', inj+'</head>');
    }
    res.setHeader('content-type', p.endsWith('.css')?'text/css':p.endsWith('.js')?'text/javascript':'text/html');
    res.end(body);
  });
});
server.listen(4599, async () => {
  const proc = spawn('node', [
    process.env.HOME+'/.claude/plugins/marketplaces/nateherk/plugins/nateherk-design/skills/scrollcraft/scripts/shoot.mjs',
    '--url','http://127.0.0.1:4599/',
    '--out','lab/final/L4-dark',
    '--per-act','6',
    '--width','1440','--height','900'
  ], {env: {...process.env, NODE_PATH:'/home/bang/node_modules'}, stdio:'inherit'});
  proc.on('exit', (code) => { server.close(); process.exit(code); });
});
