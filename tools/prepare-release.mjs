import {createHash} from 'node:crypto';
import {readdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const root=fileURLToPath(new URL('../dist/',import.meta.url));
const marker=/\n?\s*<!-- ENT release imports:start -->[\s\S]*?<!-- ENT release imports:end -->\n?/;

export function releasePlan(html,sources){
  const clean=html.replace(marker,'\n').replace(/\n?  <meta name="ent-release" content="[a-f0-9]+">/,'').replace(/((?:src|href)="\.\/(?:game|vendor)\/[^"?]+)\?v=[a-f0-9]+"/g,'$1"');
  const ordered=[...sources].sort(([a],[b])=>a.localeCompare(b));
  const hash=createHash('sha256').update(clean);
  for(const [path,content] of ordered)hash.update('\0'+path+'\0').update(content);
  const revision=hash.digest('hex').slice(0,12);
  // Map the entire ES module graph, including cycles, to one release. A query on
  // the entry script alone would still reuse previously cached child modules.
  const imports=Object.fromEntries(ordered.filter(([path])=>path.endsWith('.js')).map(([path])=>['./'+path,'./'+path+'?v='+revision]));
  const map='  <!-- ENT release imports:start -->\n  <script type="importmap" id="releaseImports">'+JSON.stringify({imports})+'</script>\n  <!-- ENT release imports:end -->\n';
  const output=clean.replace('<head>','<head>\n  <meta name="ent-release" content="'+revision+'">').replace(/((?:src|href)="\.\/(?:game|vendor)\/[^"?]+)"/g,'$1?v='+revision+'"').replace('  <script type="module"',map+'  <script type="module"');
  return{revision,imports,html:output};
}

export async function releaseInputs(directory=root){
  const sources=[];
  for(const folder of ['game','vendor'])for(const name of await readdir(resolve(directory,folder))){
    if(/\.(?:js|css)$/.test(name))sources.push([folder+'/'+name,await readFile(resolve(directory,folder,name))]);
  }
  return{html:await readFile(resolve(directory,'index.html'),'utf8'),sources};
}

export async function prepareRelease(directory=root){
  const {html,sources}=await releaseInputs(directory),plan=releasePlan(html,sources);
  if(plan.html!==html)await writeFile(resolve(directory,'index.html'),plan.html);
  return plan;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const plan=await prepareRelease();console.log('ENT release '+plan.revision+' · '+Object.keys(plan.imports).length+' versioned modules');
}
