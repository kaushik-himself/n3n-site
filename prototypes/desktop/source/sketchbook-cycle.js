(()=>{
 const root=document.getElementById('n3n-desktop'),figure=root.querySelector('[data-site-view="home"] .n-portrait');
 if(!figure)return;
 const original=figure.querySelector('.n-ink'),caption=figure.querySelector('figcaption');
 const stage=document.createElement('div');stage.className='n-sketchbook-stage';original.before(stage);stage.append(original);
 const names=['glasses-girl','coffee','pizza','cloud-large','pencil','paintbrush'];
 const art=names.map((name,index)=>{
  if(index===0)return original;
  const source=root.querySelector('svg.n-ink[data-doodle="'+name+'"]');if(!source)return null;
  const clone=source.cloneNode(true);clone.classList.remove('n-ink-playing');clone.dataset.drawState='complete';clone.dataset.featureState='complete';
  const ids=new Map();clone.querySelectorAll('[id]').forEach(node=>{ids.set(node.id,node.id+'-home-cycle');node.id=ids.get(node.id);});
  clone.querySelectorAll('*').forEach(node=>Array.from(node.attributes).forEach(attribute=>{let value=attribute.value;for(const [before,after]of ids)value=value.split('url(#'+before+')').join('url(#'+after+')').replace(new RegExp('^#'+before+'$'),'#'+after);if(value!==attribute.value)node.setAttribute(attribute.name,value);}));
  return clone;
 }).filter(Boolean);
 const pause=document.createElement('button');pause.type='button';pause.className='n-sketchbook-pause';caption.append(pause);
 const reduce=matchMedia('(prefers-reduced-motion:reduce)');let paused=false,index=0,pending=0;
 function controls(){pause.textContent=paused?'Play':'Pause';pause.setAttribute('aria-label',(paused?'Play':'Pause')+' sketchbook slideshow');pause.setAttribute('aria-pressed',String(paused));pause.disabled=reduce.matches;}
 pause.addEventListener('click',()=>{paused=!paused;controls();});
 reduce.addEventListener('change',()=>{clearTimeout(pending);stage.classList.remove('n-sketch-changing');controls();});controls();
 setInterval(()=>{
  if(paused||reduce.matches||document.hidden||!figure.getBoundingClientRect().width||root.querySelector('[data-window="about"]').hidden)return;
  stage.classList.add('n-sketch-changing');pending=setTimeout(()=>{
   index=(index+1)%art.length;stage.replaceChildren(art[index]);stage.dataset.doodle=names[index];stage.classList.remove('n-sketch-changing');
  },220);
 },6500);
})();
