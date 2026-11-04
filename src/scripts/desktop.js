
(()=>{
 const root=document.getElementById('n3n-desktop');
 const stage=root.querySelector('.n-stage');
 const windows=Object.fromEntries([...root.querySelectorAll('[data-window]')].map(el=>[el.dataset.window,el]));
 const output=root.querySelector('.n-output');
 const form=root.querySelector('.n-terminal-form');
 const input=root.querySelector('.n-terminal-input');
 const body=root.querySelector('.n-terminal-body');
 const prompt=root.querySelector('.n-prompt');
 let activePage='home';
 let z=10,collection='projects',cwd='/',history=[],historyIndex=0,draft='',wallpaper='sketchbook',ambientMotion=true;
 const collections={
  projects:{title:'Projects',heading:'Things in the making.',subtitle:'A place for projects, small tools, and experiments.',items:[['Tools','Useful things for everyday work.'],['Experiments','Small ideas, made tangible.'],['Ideas','A space for what comes next.']]},
  writing:{title:'Writing',heading:'Thinking, out loud.',subtitle:'Notes, field guides, and things worth remembering.',items:[['Notes','Short thoughts and observations.'],['Essays','Room for a longer thought.'],['Field guides','Things learned by doing.']]},
  playground:{title:'Playground',heading:'Follow the curiosity.',subtitle:'A space to try things just to see what happens.',items:[['Tiny apps','Small tools with one clear purpose.'],['Visual experiments','Ideas explored through design.'],['Work in progress','The unfinished is welcome here.']]}
 };
 const files={
  '/about.md':'Hi, I’m Neha.\nThings I make. Ideas I’m exploring. Notes from the process.\n\nOpen projects, writing, or playground to explore.',
  '/projects/readme.md':'Projects\nA place for projects, small tools, and experiments.\nUse open projects to see the collection.',
  '/writing/readme.md':'Writing\nNotes, essays, and field guides.\nUse open writing to see the collection.',
  '/playground/readme.md':'Playground\nTiny apps, visual experiments, and work in progress.\nUse open playground to explore.'
 };
 const dirs=['/','/projects','/writing','/playground'];
 function persist(){

  if(!sharedRestored)return;const visible=appWindow.hidden?[]:['about'];
  const snapshot={modelContent:{concept:'n3n.lol website desktop app',activePage,wallpaper,ambientMotion,collection,visibleWindows:visible},privateContent:{cwd,collection,visible,wallpaper,ambientMotion,activePage,siteAppVersion:1,sharedWindowVersion:3,sharedWindow:{status:sharedWindow.status,maximized:sharedWindow.maximized,rect:sharedWindow.rect,userSized:sharedWindow.userSized}}};try{localStorage.setItem(sharedKey,JSON.stringify(snapshot));}catch{}window.openai?.setWidgetState?.(snapshot)?.catch(()=>{});
 }
 const sitePages=JSON.parse(document.getElementById('n3n-routes').textContent);
 function syncDock(){root.querySelectorAll('.n-dock-button').forEach(b=>{const selected=!windows.about.hidden&&(b.dataset.sitePage===activePage||(sitePages[activePage]?.published&&b.dataset.sitePage==='writing'));b.dataset.open=String(selected);b.setAttribute('aria-pressed',String(selected));});}
 function setSiteMetadata(name){
  const route=sitePages[name];if(!route)return;
  document.title=route.title;
  for(const selector of ['meta[name="description"]','meta[property="og:description"]','meta[name="twitter:description"]'])document.querySelector(selector)?.setAttribute('content',route.description);
  for(const selector of ['meta[property="og:title"]','meta[name="twitter:title"]'])document.querySelector(selector)?.setAttribute('content',route.title);
  document.querySelector('link[rel="canonical"]').href=new URL(route.path,location.origin).href.replace(location.origin,'https://n3n.lol');
  document.querySelector('meta[property="og:url"]').content='https://n3n.lol'+route.path;
  document.querySelector('meta[property="og:type"]').content=route.published?'article':'website';
  const schema=document.querySelector('script[type="application/ld+json"]'),data=JSON.parse(schema.textContent);
  const page=data['@graph'][2];
  for(const key of ['headline','author','image','mainEntityOfPage','datePublished','dateModified'])delete page[key];
  Object.assign(page,{'@type':route.published?'BlogPosting':'WebPage','@id':'https://n3n.lol'+route.path,url:'https://n3n.lol'+route.path,name:route.title,description:route.description});
  if(route.published)Object.assign(page,{headline:route.label,author:{'@id':'https://n3n.lol/#person'},image:'https://n3n.lol/brand/n3n-og.png',mainEntityOfPage:{'@id':page.url},datePublished:route.published,dateModified:route.modified||route.published});
  schema.textContent=JSON.stringify(data);
  for(const key of ['published','modified']){
   let meta=document.querySelector('meta[property="article:'+key+'_time"]');const value=key==='published'?route.published:route.modified||route.published;
   if(!value){meta?.remove();continue;}if(!meta){meta=document.createElement('meta');meta.setAttribute('property','article:'+key+'_time');document.head.append(meta);}meta.content=value;
  }
 }
 function historyPush(path){window.history.pushState({},"",path);}
 function showSitePage(name,save=true){
  if(!Object.hasOwn(sitePages,name))name='home';activePage=name;setSiteMetadata(name);
  if(save&&location.pathname!==sitePages[name].path)historyPush(sitePages[name].path);
  stage.classList.remove('n-art-only');const artButton=root.querySelector('.n-show-art');artButton.setAttribute('aria-pressed','false');artButton.textContent='View artwork without windows';
  openSharedWindow();windows.terminal.hidden=true;windows.library.hidden=true;
  root.querySelectorAll('[data-site-view]').forEach(page=>{page.hidden=page.dataset.siteView!==name;const heading=page.querySelector('.n-page-heading');if(heading){const tag=page.hidden?'h2':'h1';if(heading.tagName.toLowerCase()!==tag){const replacement=document.createElement(tag);replacement.className=heading.className;replacement.innerHTML=heading.innerHTML;heading.replaceWith(replacement);}}});
  root.querySelectorAll('[data-site-page]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.sitePage===name)));
  root.querySelector('.n-app-title').textContent='n3n.lol — '+sitePages[name].label;
  root.querySelector('.n-open-original').href=sitePages[name].path;
  const content=root.querySelector('.n-site-content'),live=name==='reading';
  content.classList.toggle('n-showing-live-app',live);content.classList.toggle('n-showing-home',name==='home');windows.about.classList.toggle('n-reading-active',live);
  if(live){const frame=root.querySelector('.n-reading-frame');if(!frame.hasAttribute('src'))frame.src=frame.dataset.src;}
  content.scrollTop=0;fitSharedReading();front(windows.about);syncDock();if(save)persist();
 }
 root.querySelectorAll('[data-site-page]').forEach(b=>b.addEventListener('click',event=>{if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;if(b.tagName==='A')event.preventDefault();showSitePage(b.dataset.sitePage);if(b.dataset.sitePage==='products')root.querySelector('[data-agents-tab="'+(b.dataset.agentsSection||'skills')+'"]').click();}));
 root.querySelector('.n-site-sidebar-toggle').addEventListener('click',e=>{const collapsed=windows.about.classList.toggle('n-sidebar-collapsed');e.currentTarget.setAttribute('aria-expanded',String(!collapsed));});

 function front(el){el.style.zIndex=String(++z);}
 function icons(){if(globalThis.lucide)globalThis.lucide.createIcons({attrs:{width:16,height:16}});}
 function renderCollection(name){
  collection=name;const c=collections[name];
  windows.library.setAttribute('aria-label',c.title+' window');
  root.querySelector('.n-library-title').textContent=c.title;
  root.querySelector('.n-library-heading').textContent=c.heading;
  root.querySelector('.n-library-subtitle').textContent=c.subtitle;
  const grid=root.querySelector('.n-file-grid');grid.replaceChildren();
  root.querySelector('.n-detail').textContent='';
  c.items.forEach(([title,description])=>{
   const b=document.createElement('button');b.type='button';b.className='n-file';
   const icon=document.createElement('i');icon.dataset.lucide=name==='writing'?'file-text':'folder';icon.setAttribute('aria-hidden','true');
   const label=document.createElement('span');label.textContent=title;
   const sub=document.createElement('small');sub.textContent=description;
   b.append(icon,label,sub);b.addEventListener('click',()=>{root.querySelector('.n-detail').textContent=title+' — '+description;});grid.append(b);
  });icons();
 }
 function launch(name,save=true){
  if(name==='about'||Object.hasOwn(sitePages,name)){showSitePage(name==='about'?'home':name,save);return;}
  stage.classList.remove('n-art-only');root.querySelector('.n-show-art').setAttribute('aria-pressed','false');root.querySelector('.n-show-art').textContent='View artwork without windows';
  if(collections[name]){renderCollection(name);windows.library.hidden=false;front(windows.library);}
  else if(windows[name]){windows[name].hidden=false;front(windows[name]);if(name==='terminal')setTimeout(()=>input.focus({preventScroll:true}),0);}
  syncDock();if(save)persist();
 }
 root.querySelectorAll('[data-launch]').forEach(b=>b.addEventListener('click',()=>launch(b.dataset.launch)));
const appWindow=windows.about;
appWindow.classList.add('n-app-window');appWindow.dataset.app='website';appWindow.dataset.focused='true';
appWindow.setAttribute('aria-label','n3n.lol app window');
const sharedWindow={status:'open',maximized:false,rect:null,userSized:false};
let sharedRestored=false,sharedGesture=null;
const sharedKey='n3n-shared-window-v3';
for(const action of ['close','minimize','maximize'])appWindow.querySelector('[data-window-action="'+action+'"]').setAttribute('aria-label',({close:'Close',minimize:'Minimize',maximize:'Maximize'})[action]+' window');
for(const edge of ['n','e','s','w','ne','nw','sw','se']){
 const handle=document.createElement(edge==='se'?'button':'div');handle.className='n-window-resize n-resize-'+edge;handle.dataset.resize=edge;
 if(edge==='se'){handle.type='button';handle.setAttribute('aria-label','Resize window');}else handle.setAttribute('aria-hidden','true');
 appWindow.append(handle);
}
root.querySelector('[data-site-view="reading"]').classList.add('n-reading-stage');
function sharedLimits(){return {width:stage.clientWidth,height:stage.clientHeight,top:stage.clientWidth<700?64:16,bottom:stage.clientHeight-(stage.clientWidth<700?98:106)};}
function boundSharedRect(rect){
 const area=sharedLimits(),minW=Math.min(300,area.width-16),minH=Math.min(270,area.bottom-20);
 const width=Math.max(minW,Math.min(area.width-16,rect.width)),height=Math.max(minH,Math.min(area.bottom-area.top,rect.height));
 return {x:Math.max(8,Math.min(area.width-width-8,rect.x)),y:Math.max(area.top,Math.min(area.bottom-height,rect.y)),width,height};
}
function defaultSharedRect(){
 const {width:w,height:h}=sharedLimits(),width=w<700?w-24:Math.min(1180,w-96),y=w<700?64:32;
 return boundSharedRect({x:(w-width)/2,y,width,height:h-y-(w<700?104:112)});
}
function applySharedRect(){
 if(!sharedWindow.rect)sharedWindow.rect=defaultSharedRect();
 const area=sharedLimits(),r=sharedWindow.maximized?{x:8,y:area.top,width:area.width-16,height:area.bottom-area.top}:boundSharedRect(sharedWindow.rect);
 for(const [key,value] of Object.entries(r))appWindow.style.setProperty('--app-'+key,value+'px');
 layoutDesktopArt(r);
 appWindow.dataset.maximized=String(sharedWindow.maximized);
 appWindow.querySelector('[data-window-action="maximize"]').setAttribute('aria-label',sharedWindow.maximized?'Restore window':'Maximize window');
 fitSharedReading();
}
// Fit the wallpaper to the current app, including after a drag or resize.
// Hide a drawing when no clear margin remains rather than crop a face in half.
function layoutDesktopArt(rect){
 const canvas=root.querySelector('.n-sketch-wallpaper');if(!canvas)return;
 const width=stage.clientWidth,height=stage.clientHeight,mobile=width<700;
 const left=rect.x,right=width-rect.x-rect.width;
 function place(selector,visible,x,y,w,h,angle=0){
  const drawing=canvas.querySelector(selector);if(!drawing)return;
  drawing.toggleAttribute('hidden',!visible);
  if(visible)Object.assign(drawing.style,{left:x+'px',right:'auto',top:y+'px',bottom:'auto',width:w+'px',height:h+'px',transform:angle?'rotate('+angle+'deg)':'none'});
 }
 const faceWidth=Math.min(142,left-28),faceHeight=faceWidth*1.32;
 place('[data-doodle="glasses-girl"]',!mobile&&faceWidth>=74,(left-faceWidth)/2,Math.max(72,Math.min(rect.y+65,height-faceHeight-24)),faceWidth,faceHeight);
 const cupWidth=Math.min(78,right-28);
 place('[data-doodle="coffee"]',!mobile&&cupWidth>=40,rect.x+rect.width+(right-cupWidth)/2,rect.y+64,cupWidth,cupWidth*1.1);
 // Cross the glass edge: most of the original ink stays sharp outside it.
 const pencilLength=Math.min(166,Math.max(0,(right-44)*2/.47));
 const brushLength=Math.min(174,Math.max(0,(left-40)*2/.85));
 place('[data-doodle="pencil"]',!mobile&&pencilLength>=110,rect.x+rect.width+22-10*pencilLength/166,rect.y+rect.height*.48-pencilLength/2,20*pencilLength/166,pencilLength,28);
 place('[data-doodle="paintbrush"]',!mobile&&brushLength>=110,rect.x-24-12*brushLength/174,rect.y+rect.height*.70-brushLength/2,24*brushLength/174,brushLength,-58);
 const below=height-rect.y-rect.height;
 place('[data-doodle="pizza"]',!mobile&&below>=82,Math.max(24,rect.x+rect.width*.12),rect.y+rect.height+12,118,60);
 const cloudWidth=mobile?112:Math.min(145,right-32);
 place('.n-cloud-pair',mobile||cloudWidth>=72,mobile?(width-cloudWidth)/2:rect.x+rect.width+(right-cloudWidth)/2,mobile?15:rect.y+rect.height-100,cloudWidth,mobile?32:64);
}
function fitSharedReading(){
 const viewport=root.querySelector('.n-reading-stage'),frame=root.querySelector('.n-reading-frame'),width=viewport.clientWidth,height=viewport.clientHeight;
 if(!width||!height)return;
 // Use the site's compact phone layout or full desktop layout, avoiding its large middle breakpoint.
 const virtualWidth=width>=1000?width:width>=600?1000:width>=450?590:width/.82,scale=width/virtualWidth;
 frame.style.setProperty('--reading-width',virtualWidth+'px');frame.style.setProperty('--reading-height',(height/scale)+'px');frame.style.setProperty('--reading-scale',String(scale));
}
function openSharedWindow(){sharedWindow.status='open';appWindow.hidden=false;applySharedRect();front(appWindow);}
function sharedAction(action){
 if(action==='maximize'){sharedWindow.maximized=!sharedWindow.maximized;applySharedRect();front(appWindow);}
 else{sharedWindow.status=action==='minimize'?'minimized':'closed';appWindow.hidden=true;}
 syncDock();persist();
}
appWindow.querySelectorAll('[data-window-action]').forEach(button=>button.addEventListener('click',()=>sharedAction(button.dataset.windowAction)));
appWindow.addEventListener('pointerdown',()=>front(appWindow));
const sharedTitle=appWindow.querySelector('.n-titlebar');
sharedTitle.addEventListener('dblclick',event=>{if(!event.target.closest('button,a'))sharedAction('maximize');});
sharedTitle.addEventListener('pointerdown',event=>startSharedGesture(event,'move',sharedTitle));
appWindow.querySelectorAll('[data-resize]').forEach(handle=>{
 handle.addEventListener('pointerdown',event=>startSharedGesture(event,handle.dataset.resize,handle));
 handle.addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)||sharedWindow.maximized)return;
  event.preventDefault();const r={...sharedWindow.rect},delta=event.shiftKey?25:10;
  if(event.key==='ArrowLeft')r.width-=delta;if(event.key==='ArrowRight')r.width+=delta;if(event.key==='ArrowUp')r.height-=delta;if(event.key==='ArrowDown')r.height+=delta;
  sharedWindow.userSized=true;sharedWindow.rect=boundSharedRect(r);applySharedRect();persist();
 });
});
function startSharedGesture(event,kind,handle){
 if(event.button!==0||sharedGesture||sharedWindow.maximized||(kind==='move'&&event.target.closest('button,a')))return;
 event.preventDefault();event.stopPropagation();front(appWindow);
 const start={...boundSharedRect(sharedWindow.rect)},startX=event.clientX,startY=event.clientY;sharedGesture=kind;
 stage.classList.add('n-window-gesture');handle.setPointerCapture(event.pointerId);
 function move(e){
  const dx=e.clientX-startX,dy=e.clientY-startY,r={...start},area=sharedLimits();
  if(kind==='move'){r.x+=dx;r.y+=dy;}
  else{
   const minW=Math.min(300,area.width-16),minH=Math.min(270,area.bottom-20);
   if(kind.includes('e'))r.width=Math.max(minW,Math.min(area.width-start.x-8,start.width+dx));
   if(kind.includes('s'))r.height=Math.max(minH,Math.min(area.bottom-start.y,start.height+dy));
   if(kind.includes('w')){r.x=Math.max(8,Math.min(start.x+start.width-minW,start.x+dx));r.width=start.width+start.x-r.x;}
   if(kind.includes('n')){r.y=Math.max(16,Math.min(start.y+start.height-minH,start.y+dy));r.height=start.height+start.y-r.y;}
  }
  sharedWindow.rect=boundSharedRect(r);applySharedRect();
 }
 function end(){handle.removeEventListener('pointermove',move);handle.removeEventListener('pointerup',end);handle.removeEventListener('pointercancel',end);handle.removeEventListener('lostpointercapture',end);sharedGesture=null;sharedWindow.userSized=true;stage.classList.remove('n-window-gesture');persist();}
 handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',end);handle.addEventListener('pointercancel',end);handle.addEventListener('lostpointercapture',end);
}
new ResizeObserver(fitSharedReading).observe(root.querySelector('.n-reading-stage'));
let sharedStageSize=stage.clientWidth+'x'+stage.clientHeight;
new ResizeObserver(()=>{const next=stage.clientWidth+'x'+stage.clientHeight;if(next===sharedStageSize)return;sharedStageSize=next;if(!sharedWindow.userSized)sharedWindow.rect=defaultSharedRect();applySharedRect();}).observe(stage);

 function line(text='',tone=''){
  const el=document.createElement('div');el.className='n-line'+(tone?' n-'+tone:'');el.textContent=text;output.append(el);
  while(output.children.length>180)output.firstElementChild.remove();
  body.scrollTop=body.scrollHeight;
 }
 function normalize(path){
  const base=path.startsWith('/')?[]:cwd.split('/').filter(Boolean);
  path.split('/').forEach(part=>{if(part==='..')base.pop();else if(part&&part!=='.'&&part!=='~')base.push(part);});
  return '/'+base.join('/');
 }
 function updatePrompt(){prompt.textContent=(cwd==='/'?'~':'~'+cwd)+' %';}
 function list(path){if(path==='/')return 'about.md  projects/  writing/  playground/';if(dirs.includes(path))return 'readme.md';return null;}
 function run(raw){
  const cmd=raw.trim();if(!cmd)return;
  history.push(cmd);if(history.length>60)history.shift();historyIndex=history.length;
  line(prompt.textContent+' '+cmd,'green');
  const words=cmd.split(/\s+/);const name=words.shift().toLowerCase();const arg=words.join(' ');
  switch(name){
   case 'help':line('Explore:  about · projects · writing · playground','cyan');line('Navigate: ls [path] · cd [folder] · pwd · cat [file]');line('Windows:  open about | projects | writing | playground');line('Other:    whoami · date · echo [text] · clear · exit');line('↑ / ↓ history    Tab complete    Ctrl+L clear','dim');break;
   case 'whoami':line('visitor@n3n.lol');break;
   case 'about':line(files['/about.md']);break;
   case 'projects':case 'writing':case 'playground':line(collections[name].title+' → opening collection','cyan');launch(name);break;
   case 'ls':{const path=arg?normalize(arg):cwd;const result=list(path);line(result||'ls: no such directory: '+arg,result?'cyan':'error');break;}
   case 'pwd':line('/home/visitor'+(cwd==='/'?'':cwd));break;
   case 'cd':{const path=!arg||arg==='~'?'/':normalize(arg);if(dirs.includes(path)){cwd=path;updatePrompt();}else line('cd: no such directory: '+arg,'error');break;}
   case 'cat':{const path=normalize(arg);if(!arg)line('Usage: cat about.md','dim');else if(Object.hasOwn(files,path))line(files[path]);else line('cat: no such file: '+arg,'error');break;}
   case 'open':{const target=arg.replace(/\/$/,'').replace(/^\.\//,'').toLowerCase();if(['about','about.md','projects','writing','playground','terminal'].includes(target)){launch(target==='about.md'?'about':target);line('Opened '+target,'cyan');}else line('Usage: open about | projects | writing | playground','dim');break;}
   case 'echo':line(arg);break;
   case 'date':line(new Date().toLocaleString('en-US',{timeZone:'America/Los_Angeles',dateStyle:'full',timeStyle:'short'})+' · Pacific time');break;
   case 'clear':output.replaceChildren();break;
   case 'exit':windows.terminal.hidden=true;input.blur();syncDock();break;
   default:line(name+': command not available. Type help.','error');
  }
  body.scrollTop=body.scrollHeight;persist();
 }
 function submitCommand(){const raw=input.value;input.value='';run(raw);}
 form.addEventListener('submit',e=>{e.preventDefault();submitCommand();});
 root.querySelector('.n-run').type='button';
 root.querySelector('.n-run').addEventListener('click',()=>submitCommand());
 input.addEventListener('keydown',e=>{
  if(e.key==='Enter'){e.preventDefault();submitCommand();}
  if(e.key==='ArrowUp'){e.preventDefault();if(historyIndex===history.length)draft=input.value;historyIndex=Math.max(0,historyIndex-1);input.value=history[historyIndex]||'';}
  if(e.key==='ArrowDown'){e.preventDefault();historyIndex=Math.min(history.length,historyIndex+1);input.value=historyIndex===history.length?draft:history[historyIndex]||'';}
  if(e.ctrlKey&&e.key.toLowerCase()==='l'){e.preventDefault();output.replaceChildren();}
  if(e.ctrlKey&&e.key.toLowerCase()==='c'){e.preventDefault();line(prompt.textContent+' '+input.value+' ^C','dim');input.value='';}
  if(e.key==='Tab'){
   e.preventDefault();const parts=input.value.split(/\s+/),last=parts[parts.length-1];
   const options=parts.length===1?['help','whoami','about','projects','writing','playground','ls','pwd','cd','cat','open','echo','date','clear','exit']:parts[0]==='open'?['about','projects','writing','playground','terminal']:cwd==='/'?['about.md','projects/','writing/','playground/']:['readme.md'];
   const matches=options.filter(v=>v.startsWith(last));if(matches.length===1){parts[parts.length-1]=matches[0];input.value=parts.join(' ');}else if(matches.length>1)line(matches.join('  '),'dim');
  }
 });
 body.addEventListener('click',e=>{if(!window.getSelection()?.toString()&&e.target!==input&&!e.target.closest('button'))input.focus({preventScroll:true});});
 new ResizeObserver(()=>{body.scrollTop=body.scrollHeight;}).observe(body);
 function restore(snapshot){
  if(sharedRestored)return;
  let saved=snapshot?.privateContent;
  try{const local=JSON.parse(localStorage.getItem(sharedKey)||'null');if(local?.privateContent?.sharedWindowVersion===3)saved=local.privateContent;}catch{}
  const own=saved?.sharedWindowVersion===3;
  if(own){
   const state=saved.sharedWindow;
   if(state&&['open','minimized','closed'].includes(state.status))sharedWindow.status=state.status;
   if(state){sharedWindow.maximized=!!state.maximized;sharedWindow.userSized=!!state.userSized;}
   const r=state?.rect;if(r&&['x','y','width','height'].every(k=>Number.isFinite(r[k])))sharedWindow.rect=sharedWindow.userSized?r:null;
   if(typeof saved.ambientMotion==='boolean'){ambientMotion=saved.ambientMotion;syncAmbientMotion();}
  }
  setWallpaper(own&&Object.hasOwn(paintings,saved.wallpaper)?saved.wallpaper:'sketchbook',false);
  const status='open';
  showSitePage(Object.hasOwn(sitePages,root.dataset.initialView)?root.dataset.initialView:'home',false);
  sharedWindow.status=status;appWindow.hidden=status!=='open';applySharedRect();sharedRestored=true;syncDock();
 }
 const picker=root.querySelector('.n-paper-picker'),paperLaunch=root.querySelector('.n-wallpaper-launch');
 const artBase='/art-assets/paintings/';
 const paintings={
  'sketchbook':{kind:'sketch',label:'Living sketchbook',title:'Drawings by Neha',artist:'Neha',date:'Animated ink'},
  'waves':{kind:'sketch',label:'Waves & clouds',title:'Waves & clouds',artist:'Neha',date:'Gentle waves'},
  'oise-valley':{label:'In the Oise Valley',title:'In the Oise Valley',artist:'Paul Cézanne',date:'1878–80',medium:'Graphite, gouache, and watercolor',object:334350,width:3811,height:2501,position:'50% 45%'},
  'arc-valley':{label:'The Arc River Valley',title:'Mont Sainte-Victoire and the Viaduct of the Arc River Valley',artist:'Paul Cézanne',date:'1882–85',medium:'Oil on canvas',object:435877,width:4000,height:3225,position:'50% 48%'},
  'sainte-victoire':{label:'Mont Sainte-Victoire',title:'Mont Sainte-Victoire',artist:'Paul Cézanne',date:'ca. 1902–6',medium:'Oil on canvas',object:435878,width:3001,height:1780,position:'50% 45%'},
  'fontainebleau':{label:'Rocks at Fontainebleau',title:'Rocks at Fontainebleau',artist:'Paul Cézanne',date:'1890s',medium:'Oil on canvas',object:435880,width:4000,height:3207,position:'50% 50%'},
  'saint-joseph':{label:'Domaine Saint-Joseph',title:'View of the Domaine Saint-Joseph',artist:'Paul Cézanne',date:'late 1880s',medium:'Oil on canvas',object:435885,width:3811,height:3049,position:'50% 50%'},
  'pontoise':{label:'Côte des Grouettes',title:'Côte des Grouettes, near Pontoise',artist:'Camille Pissarro',date:'probably 1878',medium:'Oil on canvas',object:437316,width:3042,height:3716,position:'50% 65%'}
 };
 let artRequest=0,sketchInk=[];
 const artLayer=root.querySelector('.n-wallpaper'),artStatus=root.querySelector('.n-picker-status');
 const backgroundReplay=root.querySelector('.n-background-replay');
 const ambientSetting=root.querySelector('.n-ambient-setting'),ambientInput=root.querySelector('.n-ambient-input');
 const options=root.querySelector('.n-paper-options');
 Object.entries(paintings).forEach(([id,work])=>{
  const button=document.createElement('button');button.type='button';button.className='n-paper-option';button.dataset.paper=id;
  button.setAttribute('aria-pressed',String(id===wallpaper));button.setAttribute('aria-label',work.label+' by '+work.artist);
  let thumb;
  if(work.kind==='sketch'){
   thumb=document.createElement('span');thumb.className='n-paper-thumb n-sketch-thumb';thumb.setAttribute('aria-hidden','true');
   (id==='waves'?['waves']:['glasses-girl','coffee']).forEach(name=>{const image=document.createElement('img'),art=root.querySelector('[data-doodle="'+name+'"]'),bitmap=art.querySelector('image');image.src=bitmap?bitmap.getAttribute('href'):'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(art.outerHTML);image.alt='';image.decoding='async';thumb.append(image);});
  }else{
   thumb=document.createElement('img');thumb.className='n-paper-thumb';thumb.src=artBase+id+'-thumb.webp';thumb.alt='';thumb.width=160;thumb.height=88;thumb.loading='lazy';thumb.decoding='async';
  }
  const text=document.createElement('span'),title=document.createElement('strong'),artist=document.createElement('small');title.textContent=work.label;artist.textContent=work.kind==='sketch'?(id==='waves'?'Neha · gentle waves':'Neha · floating ink'):work.artist;text.append(title,artist);
  const tick=document.createElement('span');tick.className='n-paper-tick';tick.setAttribute('aria-hidden','true');tick.textContent='✓';
  button.append(thumb,text,tick);button.addEventListener('click',()=>setWallpaper(id));options.append(button);
 });
 function imageSize(image,work){image.sizes=Math.ceil(Math.max(stage.clientWidth,stage.clientHeight*work.width/work.height))+'px';}
 function reflectPainting(name){
  const work=paintings[name],isSketch=work.kind==='sketch';root.dataset.wallpaper=name;
  root.querySelectorAll('[data-paper]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.paper===name)));
  const credit=root.querySelector('.n-art-credit');credit.querySelector('span').textContent=isSketch?'Drawings by Neha · '+work.label:work.title+' · '+work.date;
  const link=credit.querySelector('a');link.hidden=isSketch;if(backgroundReplay)backgroundReplay.hidden=!isSketch;
  ambientSetting.hidden=!isSketch;
  if(!isSketch){link.href='https://www.metmuseum.org/art/collection/search/'+work.object;link.textContent=work.artist+' · The Met ↗';link.setAttribute('aria-label',work.title+' by '+work.artist+' — view museum record');}
  artStatus.textContent='Selected: '+work.label;artStatus.setAttribute('aria-busy','false');
 }
 function clearSketchInk(){sketchInk.forEach(completeInk);sketchInk=[];}
 function addWaveMotion(art){
  const ns='http://www.w3.org/2000/svg',image=art.querySelector('image'),defs=art.querySelector('defs');
  const width=Number(image.getAttribute('width')),height=Number(image.getAttribute('height')),box=art.viewBox.baseVal;
  const element=(tag,attributes)=>{const el=document.createElementNS(ns,tag);Object.entries(attributes).forEach(([key,value])=>el.setAttribute(key,String(value)));return el;};
  const filter=element('filter',{id:'n-water-ripple',x:0,y:0,width,height,filterUnits:'userSpaceOnUse','color-interpolation-filters':'sRGB'});
  const noise=element('feTurbulence',{type:'fractalNoise',baseFrequency:'.014 .035',numOctaves:1,seed:4,result:'ripple'});
  noise.append(element('animate',{attributeName:'baseFrequency',values:'.014 .035;.018 .027;.014 .035',dur:'12s',repeatCount:'indefinite'}));
  const stillEnd=(box.y+box.height*.48)/height,waterStart=(box.y+box.height*.7)/height;
  const zone='<svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="'+height+'"><defs><linearGradient id="zone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="white" stop-opacity="0"/><stop offset="'+stillEnd+'" stop-color="white" stop-opacity="0"/><stop offset="'+waterStart+'" stop-color="white" stop-opacity="1"/><stop offset="1" stop-color="white" stop-opacity="1"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#zone)"/></svg>';
  filter.append(noise,element('feImage',{href:'data:image/svg+xml;base64,'+btoa(zone),x:0,y:0,width,height,preserveAspectRatio:'none',result:'waterZone'}),element('feComposite',{in:'ripple',in2:'waterZone',operator:'in',result:'movingWater'}),element('feFlood',{'flood-color':'#808080',result:'stillPeak'}),element('feComposite',{in:'movingWater',in2:'stillPeak',operator:'over',result:'motionMap'}),element('feDisplacementMap',{in:'SourceGraphic',in2:'motionMap',scale:6,xChannelSelector:'R',yChannelSelector:'G'}));
  defs.append(filter);image.style.filter='url(#n-water-ripple)';
 }
 function renderSketchbook(scene){
  clearSketchInk();const canvas=document.createElement('div');canvas.className='n-sketch-wallpaper';canvas.dataset.scene=scene;
  (scene==='waves'?['waves']:['glasses-girl','pencil','paintbrush','pizza','coffee']).forEach(name=>{
   const source=root.querySelector('.n-about [data-doodle="'+name+'"]')||root.querySelector('.n-doodle-sources [data-doodle="'+name+'"]');
   const art=source.cloneNode(true);
   art.classList.remove('n-ink-playing');art.classList.add(scene==='waves'?'n-wave-vignette':'n-background-drawing');if(name==='waves')art.classList.add('n-wave-vignette');art.dataset.drawState='complete';delete art.dataset.hasDrawn;
   const renamed=new Map();art.querySelectorAll('[id]').forEach(el=>{const old=el.id,next='n-background-'+old;el.id=next;renamed.set(old,next);});
   art.querySelectorAll('*').forEach(el=>{['mask','clip-path','fill'].forEach(attr=>{const value=el.getAttribute(attr);if(value)renamed.forEach((next,old)=>{if(value==='url(#'+old+')')el.setAttribute(attr,'url(#'+next+')');});});});
   if(name==='waves')addWaveMotion(art);
   canvas.append(art);sketchInk.push(art);
  });
  if(scene==='sketchbook'){
   const pair=document.createElement('div');pair.className='n-cloud-pair';
   ['cloud-large','cloud-small'].forEach(name=>{
    const cloud=root.querySelector('.n-doodle-sources [data-doodle="'+name+'"]').cloneNode(true);cloud.classList.add('n-paired-cloud');
    const renamed=new Map();cloud.querySelectorAll('[id]').forEach(el=>{const old=el.id,next='n-background-'+old;el.id=next;renamed.set(old,next);});
    cloud.querySelectorAll('*').forEach(el=>{['mask','clip-path','fill'].forEach(attr=>{const value=el.getAttribute(attr);if(value)renamed.forEach((next,old)=>{if(value==='url(#'+old+')')el.setAttribute(attr,'url(#'+next+')');});});});
    pair.append(cloud);sketchInk.push(cloud);
   });
   canvas.append(pair);
  }else{
   const cloud=document.createElement('div');cloud.className='n-ambient-cloud one';const image=document.createElement('img');image.className='n-floating-cloud';image.src='/art-assets/neha-cloud-preview.webp';image.alt='';image.width=360;image.height=135;cloud.append(image);canvas.append(cloud);
  }
  artLayer.replaceChildren(canvas);
  if(sharedWindow.rect)layoutDesktopArt(sharedWindow.rect);
  syncAmbientMotion();
  requestAnimationFrame(()=>{if(artLayer.contains(canvas))sketchInk.forEach(drawInk);});
 }
 async function setWallpaper(name,save=true){
  if(!Object.hasOwn(paintings,name))return;
  const work=paintings[name],request=++artRequest;
  if(work.kind==='sketch'){
   if(artLayer.querySelector('.n-sketch-wallpaper')?.dataset.scene!==name)renderSketchbook(name);
   wallpaper=name;reflectPainting(name);if(save)persist();return;
  }
  if(artLayer.querySelector('img')?.dataset.painting===name){wallpaper=name;reflectPainting(name);if(save)persist();return;}
  artStatus.textContent='Loading '+work.label+'…';artStatus.setAttribute('aria-busy','true');
  const image=new Image();image.className='n-wallpaper-image';image.alt='';image.decoding='async';image.width=work.width;image.height=work.height;image.dataset.painting=name;image.style.objectPosition=work.position;imageSize(image,work);
  image.srcset=[768,1440,2560].map(w=>artBase+name+'-'+w+'.webp '+w+'w').join(', ');image.src=artBase+name+'-fallback.jpg';
  try{await image.decode();}catch{
   image.removeAttribute('srcset');image.src=artBase+name+'-fallback.jpg';
   try{await image.decode();}catch{if(request===artRequest){artStatus.textContent='This painting could not load. Choose another.';artStatus.setAttribute('aria-busy','false');}return;}
  }
  if(request!==artRequest)return;
  clearSketchInk();artLayer.replaceChildren(image);wallpaper=name;reflectPainting(name);if(save)persist();
 }
 const firstImage=artLayer.querySelector('img');firstImage.dataset.painting='oise-valley';imageSize(firstImage,paintings['oise-valley']);reflectPainting('oise-valley');
 new ResizeObserver(()=>{const current=artLayer.querySelector('.n-wallpaper-image');if(current&&paintings[current.dataset.painting])imageSize(current,paintings[current.dataset.painting]);}).observe(stage);
 function closePicker(returnFocus=true){picker.hidden=true;paperLaunch?.setAttribute('aria-expanded','false');if(returnFocus)paperLaunch?.focus({preventScroll:true});}
 paperLaunch?.addEventListener('click',()=>{picker.hidden=!picker.hidden;paperLaunch?.setAttribute('aria-expanded',String(!picker.hidden));if(!picker.hidden)picker.querySelector('[aria-pressed=true]')?.focus({preventScroll:true});});
 root.querySelector('.n-picker-close').addEventListener('click',closePicker);
 root.querySelector('.n-show-art').addEventListener('click',e=>{const on=stage.classList.toggle('n-art-only');e.currentTarget.setAttribute('aria-pressed',String(on));e.currentTarget.textContent=on?'Bring the windows back':'View artwork without windows';});
 root.addEventListener('keydown',e=>{if(e.key==='Escape')closePicker();});
 root.addEventListener('click',e=>{if(!picker.hidden&&!e.target.closest('.n-paper-picker')&&!e.target.closest('.n-wallpaper-launch'))closePicker(false);});
 const inkArt=Array.from(root.querySelectorAll('.n-about .n-ink'));
 const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
 const inkTimers=new Map();
 function completeInk(art){clearTimeout(inkTimers.get(art));inkTimers.delete(art);art.classList.remove('n-ink-playing');art.dataset.drawState='complete';art.dataset.featureState='complete';}
 function drawInk(art){
  completeInk(art);art.dataset.hasDrawn='true';
  if(motionPreference.matches)return;
  // Reflow resets the one-shot mask animation without changing any artwork.
  void art.getBoundingClientRect();art.classList.add('n-ink-playing');art.dataset.drawState='drawing';
  const feature=art.querySelector('.n-ink-feature');if(feature){art.dataset.featureState='revealing';feature.onanimationend=()=>{art.dataset.featureState='complete';};}
  const finish=parseFloat(art.style.getPropertyValue('--ink-finish'))+.3;
  inkTimers.set(art,setTimeout(()=>completeInk(art),finish*1000));
 }
 function syncMotion(){
  if(motionPreference.matches){[...inkArt,...sketchInk].forEach(completeInk);}
  if(backgroundReplay)backgroundReplay.disabled=motionPreference.matches;
  if(backgroundReplay)backgroundReplay.querySelector('span').textContent=motionPreference.matches?'Still':'Replay';
  syncAmbientMotion();
 }
 function syncAmbientMotion(){
  const moving=ambientMotion&&!motionPreference.matches;root.dataset.ambientMotion=moving?'on':'off';
  ambientInput.checked=moving;ambientInput.disabled=motionPreference.matches;
  root.querySelectorAll('.n-wave-vignette').forEach(art=>{if(moving&&typeof art.unpauseAnimations==='function')art.unpauseAnimations();else if(typeof art.pauseAnimations==='function')art.pauseAnimations();});
 }
 backgroundReplay?.addEventListener('click',()=>sketchInk.forEach(drawInk));
 ambientInput.addEventListener('change',()=>{ambientMotion=ambientInput.checked;syncAmbientMotion();persist();});
 motionPreference.addEventListener('change',syncMotion);syncMotion();
 // Decode embedded artwork before tracing; each drawing plays once when visible.
 Promise.allSettled(inkArt.map(art=>{const source=art.querySelector('image');if(!source)return Promise.resolve();const image=new Image();image.src=source.getAttribute('href');return image.decode();})).then(()=>{
  const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting&&!entry.target.dataset.hasDrawn){drawInk(entry.target);observer.unobserve(entry.target);}});},{threshold:.35});
  inkArt.forEach(art=>observer.observe(art));
 });
 window.addEventListener('popstate',()=>{const key=Object.keys(sitePages).find(key=>sitePages[key].path===location.pathname)||'home';showSitePage(key,false);});
 restore(window.openai?.widgetState);
 window.addEventListener('openai:set_globals',e=>{if(e.detail?.globals?.widgetState)restore(e.detail.globals.widgetState);});
 windows.terminal.hidden=true;windows.library.hidden=true;
 const design={glass:70,corners:18};
 function applyDesign(){root.style.setProperty('--n-glass',String(design.glass/100));root.style.setProperty('--n-radius',design.corners+'px');}
 applyDesign();
 if(globalThis.Tweak){const tweak=new Tweak({container:root,onChange:applyDesign});tweak.addSlider(design,'glass',{label:'Glass tint',min:40,max:95,unit:'%',reference:'--n-glass'});tweak.addSlider(design,'corners',{label:'Window corners',min:10,max:26,unit:'px',reference:'--n-radius'});}
 syncDock();
})();


/* A small pointer light response. No filters or effects are applied to page content. */
(()=>{
 const root=document.getElementById('n3n-desktop');
 const reduceMotion=matchMedia('(prefers-reduced-motion:reduce)');
 const reduceTransparency=matchMedia('(prefers-reduced-transparency:reduce)');
 const increaseContrast=matchMedia('(prefers-contrast:more)');
 for(const surface of root.querySelectorAll('.n-site-dock,.n-app-window .n-titlebar')){
  let frame=0,nextX=50,nextY=0;
  function paint(){frame=0;surface.style.setProperty('--glass-x',nextX+'%');surface.style.setProperty('--glass-y',nextY+'%');}
  function reset(){if(frame)cancelAnimationFrame(frame);frame=0;surface.style.removeProperty('--glass-x');surface.style.removeProperty('--glass-y');}
  surface.addEventListener('pointermove',event=>{
   if(reduceMotion.matches||reduceTransparency.matches||increaseContrast.matches||event.pointerType==='touch')return;
   const rect=surface.getBoundingClientRect();
   nextX=Math.max(0,Math.min(100,(event.clientX-rect.left)/rect.width*100));
   nextY=Math.max(0,Math.min(100,(event.clientY-rect.top)/rect.height*100));
   if(!frame)frame=requestAnimationFrame(paint);
  },{passive:true});
  surface.addEventListener('pointerleave',reset);
  for(const preference of [reduceMotion,reduceTransparency,increaseContrast])preference.addEventListener('change',reset);
 }
})();


// Keep one original portrait in the same frame; no slideshow or repeat timer.
(()=>{
 const figure=document.querySelector('[data-site-view="home"] .n-portrait');
 if(!figure)return;
 const drawing=figure.querySelector('.n-ink');
 const stage=document.createElement('div');stage.className='n-sketchbook-stage';
 drawing.before(stage);stage.append(drawing);
})();
