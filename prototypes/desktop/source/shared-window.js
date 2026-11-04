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
function sharedLimits(){return {width:stage.clientWidth,height:stage.clientHeight,bottom:stage.clientHeight-(stage.clientWidth<700?98:106)};}
function boundSharedRect(rect){
 const area=sharedLimits(),minW=Math.min(300,area.width-16),minH=Math.min(270,area.bottom-20);
 const width=Math.max(minW,Math.min(area.width-16,rect.width)),height=Math.max(minH,Math.min(area.bottom-16,rect.height));
 return {x:Math.max(8,Math.min(area.width-width-8,rect.x)),y:Math.max(16,Math.min(area.bottom-height,rect.y)),width,height};
}
function defaultSharedRect(){
 const {width:w,height:h}=sharedLimits(),width=w<700?w-24:Math.min(1180,w-96),y=32;
 return boundSharedRect({x:(w-width)/2,y,width,height:h-y-(w<700?104:112)});
}
function applySharedRect(){
 if(!sharedWindow.rect)sharedWindow.rect=defaultSharedRect();
 const area=sharedLimits(),r=sharedWindow.maximized?{x:8,y:16,width:area.width-16,height:area.bottom-16}:boundSharedRect(sharedWindow.rect);
 for(const [key,value] of Object.entries(r))appWindow.style.setProperty('--app-'+key,value+'px');
 appWindow.dataset.maximized=String(sharedWindow.maximized);
 appWindow.querySelector('[data-window-action="maximize"]').setAttribute('aria-label',sharedWindow.maximized?'Restore window':'Maximize window');
 fitSharedReading();
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
