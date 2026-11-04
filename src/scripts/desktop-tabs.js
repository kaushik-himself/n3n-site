// Published build notes are rendered by Astro from the GitHub-backed collection.
const page=document.querySelector('.n-products-page');
const buttons=page.querySelectorAll('[data-agents-tab]');
function selectTab(name){
 buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.agentsTab===name)));
 page.querySelectorAll('[data-agents-panel]').forEach(panel=>panel.hidden=panel.dataset.agentsPanel!==name);
 page.closest('.n-site-content').scrollTop=0;
}
buttons.forEach(button=>button.addEventListener('click',()=>{
 selectTab(button.dataset.agentsTab);
 window.history.replaceState({},'',location.pathname+(button.dataset.agentsTab==='making'?'#how-its-made':''));
}));
if(location.hash==='#how-its-made')selectTab('making');
window.addEventListener('popstate',()=>selectTab(location.hash==='#how-its-made'?'making':'skills'));
