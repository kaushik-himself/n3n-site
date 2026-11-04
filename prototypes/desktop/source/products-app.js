(()=>{
 const page=document.querySelector('#n3n-desktop .n-products-page');
 const content=page.closest('.n-site-content');
 const base='https://raw.githubusercontent.com/kaushik-himself/n3n-site/a1560392092bd8656da1d432520d5ef94d33f3bd/';
 const sourceBase='https://github.com/kaushik-himself/n3n-site/blob/a1560392092bd8656da1d432520d5ef94d33f3bd/';
 const listView=page.querySelector('[data-blog-list-view]');
 const readerView=page.querySelector('[data-blog-reader-view]');
 const list=page.querySelector('[data-blog-list]');
 const status=page.querySelector('[data-blog-list-status]');
 const retry=page.querySelector('[data-blog-retry]');
 const header=page.querySelector('[data-blog-header]');
 const body=page.querySelector('[data-blog-body]');
 const outline=page.querySelector('[data-blog-outline]');
 let entries=null, loading=false, readerVersion=0;
 const articleCache=new Map();
 function el(tag,text,className){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;}
 function external(text,url){const a=el('a',text);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;}
 function dateLabel(date){return new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));}
 async function fetchText(path){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
  try{const response=await fetch(base+path,{credentials:'omit',cache:'no-cache',signal:controller.signal});if(!response.ok)throw Error('GitHub returned '+response.status);return await response.text();}finally{clearTimeout(timer);}
 }
 function showList(){page.dispatchEvent(new CustomEvent('n3n-page-title',{bubbles:true,detail:{title:'How it’s made',description:'Build notes by Neha Nupoor: the drawings, design, and code behind the things I make.'}}));page.classList.remove('n-blog-reading');readerVersion++;readerView.hidden=true;listView.hidden=false;content.scrollTop=0;loadList();}
 async function loadList(){
  if(entries||loading)return;loading=true;retry.hidden=true;status.hidden=false;status.textContent='Loading articles from GitHub…';
  try{
   const manifest=JSON.parse(await fetchText('content/how-its-made/index.json'));
   if(manifest.version!==1||!Array.isArray(manifest.articles))throw Error('Invalid article index');
   entries=manifest.articles.filter(item=>item&&typeof item.title==='string'&&typeof item.description==='string'&&/^src\/content\/blog\/[a-z0-9-]+\.md$/.test(item.path)&&/^\d{4}-\d{2}-\d{2}$/.test(item.date)&&!Number.isNaN(Date.parse(item.date+'T12:00:00Z')));
   list.replaceChildren();
   entries.forEach(item=>{
    const row=el('div',undefined,'n-blog-row');row.setAttribute('role','listitem');
    const link=el('a',undefined,'n-blog-open');link.href='#build-note-'+item.path.split('/').pop().replace('.md','');link.setAttribute('aria-label','Read article: '+item.title);
    const date=el('time',dateLabel(item.date),'n-blog-date');date.dateTime=item.date;
    const title=el('h3');title.append(el('span',item.title,'n-blog-link-title'));
    const arrow=el('span','→','n-blog-link-arrow');arrow.setAttribute('aria-hidden','true');title.append(arrow);
    link.append(date,title,el('p',item.description));
    link.addEventListener('click',event=>{event.preventDefault();openArticle(item);});row.append(link);list.append(row);
   });
   status.textContent=entries.length?'Articles loaded from GitHub.':'No build notes yet.';status.hidden=entries.length>0;list.dataset.source=base+'content/how-its-made/index.json';
  }catch(error){status.replaceChildren(el('span','The articles could not load. '),external('Read them on GitHub ↗',sourceBase+'src/content/blog/'));retry.hidden=false;}
  finally{loading=false;}
 }
 // Render a small Markdown subset as DOM nodes. Raw HTML is text, never executable.
 function inline(parent,text){
  const pattern=/\[([^\]]+)\]\((https:\/\/[^\s)]+|#[a-zA-Z0-9_-]+)\)|`([^`]+)`|\*\*([^*]+)\*\*/g;let start=0,match;
  while((match=pattern.exec(text))){parent.append(document.createTextNode(text.slice(start,match.index)));if(match[1]){const link=match[2].startsWith('https:')?external(match[1],match[2]):el('a',match[1]);if(!link.href)link.href=match[2];parent.append(link);}else parent.append(el(match[3]?'code':'strong',match[3]||match[4]));start=pattern.lastIndex;}
  parent.append(document.createTextNode(text.slice(start)));
 }
 function renderMarkdown(markdown){
  body.replaceChildren();outline.replaceChildren();outline.hidden=true;
  const lines=markdown.replace(/^\uFEFF/,'').replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/,'').split(/\r?\n/);
  let paragraph=[],code=null,bullets=null,headingCount=0;
  function flush(){if(paragraph.length){const p=el('p');inline(p,paragraph.join(' '));body.append(p);paragraph=[];}bullets=null;}
  for(const line of lines){
   if(/^```/.test(line)){flush();if(code!==null){const pre=el('pre');pre.append(el('code',code.join('\n')));body.append(pre);code=null;}else code=[];continue;}
   if(code!==null){code.push(line);continue;}
   const heading=line.match(/^(#{1,4})\s+(.+)$/);
   if(heading){flush();const h=el(heading[1].length>2?'h4':'h3',heading[2]);h.id='n-build-section-'+(++headingCount);body.append(h);const a=el('a',heading[2]);a.href='#'+h.id;a.addEventListener('click',event=>{event.preventDefault();h.scrollIntoView({block:'start'});});outline.append(a);continue;}
   if(!line.trim()){flush();continue;}
   if(/^[-*] /.test(line)){if(paragraph.length)flush();if(!bullets){bullets=el('ul');body.append(bullets);}const li=el('li');inline(li,line.slice(2));bullets.append(li);continue;}
   paragraph.push(line.trim());
  }
  flush();if(code!==null){const pre=el('pre');pre.append(el('code',code.join('\n')));body.append(pre);}
  outline.hidden=headingCount===0;
 }
 async function openArticle(item){
  page.dispatchEvent(new CustomEvent('n3n-page-title',{bubbles:true,detail:{title:item.title,description:item.description,article:true}}));const version=++readerVersion;page.classList.add('n-blog-reading');listView.hidden=true;readerView.hidden=false;content.scrollTop=0;page.querySelector('[data-blog-back]').focus({preventScroll:true});
  const title=el('h2',item.title);title.id='n-github-article-title';
  const date=el('time',dateLabel(item.date));date.dateTime=item.date;
  const meta=el('p',undefined,'n-blog-meta');meta.append(date,document.createTextNode(' · '),external('Source on GitHub ↗',sourceBase+item.path));
  header.replaceChildren(el('p','How it’s made','n-eyebrow'),title,el('p',item.description,'n-article-deck'),meta);
  outline.hidden=true;body.replaceChildren(el('p','Loading the article from GitHub…'));body.removeAttribute('data-source');
  try{
   const markdown=articleCache.has(item.path)?articleCache.get(item.path):await fetchText(item.path);articleCache.set(item.path,markdown);
   if(version!==readerVersion)return;renderMarkdown(markdown);body.dataset.source=base+item.path;
  }catch(error){if(version!==readerVersion)return;const retryArticle=el('button','Try again','n-blog-retry');retryArticle.type='button';retryArticle.addEventListener('click',()=>openArticle(item));body.replaceChildren(el('p','The article could not load from GitHub.'),external('Read the source ↗',sourceBase+item.path),retryArticle);}
 }
 page.querySelector('[data-blog-back]').addEventListener('click',showList);
 retry.addEventListener('click',loadList);
 page.querySelectorAll('[data-agents-tab]').forEach(button=>button.addEventListener('click',()=>{
  page.querySelectorAll('[data-agents-tab]').forEach(option=>option.setAttribute('aria-pressed',String(option===button)));
  page.querySelectorAll('[data-agents-panel]').forEach(panel=>panel.hidden=panel.dataset.agentsPanel!==button.dataset.agentsTab);
  content.scrollTop=0;if(button.dataset.agentsTab==='making')showList();else page.dispatchEvent(new CustomEvent('n3n-page-title',{bubbles:true,detail:{title:'Agents & Skills'}}));
 }));
})();
