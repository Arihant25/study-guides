(function(){
  // Colour theme: auto, light, dark (remembered in this browser if storage works)
  var btn=document.getElementById('themebtn');
  var ico=btn.querySelector('.ico'), lbl=btn.querySelector('.lbl');
  var ICONS={auto:'◐',light:'☀',dark:'☾'}, ORDER=['auto','light','dark'];
  function apply(mode){
    if(mode==='light'||mode==='dark') document.documentElement.setAttribute('data-theme',mode);
    else { document.documentElement.removeAttribute('data-theme'); mode='auto'; }
    ico.textContent=ICONS[mode]; lbl.textContent=mode.charAt(0).toUpperCase()+mode.slice(1);
    return mode;
  }
  var saved='auto'; try{ saved=localStorage.getItem('smai-theme')||'auto'; }catch(e){}
  var current=apply(saved);
  btn.addEventListener('click',function(){
    current=apply(ORDER[(ORDER.indexOf(current)+1)%ORDER.length]);
    try{ current==='auto' ? localStorage.removeItem('smai-theme') : localStorage.setItem('smai-theme',current); }catch(e){}
  });

  // Highlight the section being read in the sidebar
  var links=[].slice.call(document.querySelectorAll('#tocnav a'));
  var map={}; links.forEach(function(a){ map[a.getAttribute('href').slice(1)]=a; });
  if('IntersectionObserver' in window){
    var obs=new IntersectionObserver(function(es){
      es.forEach(function(en){ if(en.isIntersecting){
        links.forEach(function(l){l.classList.remove('active');});
        var a=map[en.target.id]; if(a){a.classList.add('active'); a.scrollIntoView({block:'nearest'});}
      }});
    },{rootMargin:'-8% 0px -80% 0px',threshold:0});
    document.querySelectorAll('main h2[id]').forEach(function(el){ if(map[el.id]) obs.observe(el); });
  }

  // Close the phone menu after a jump
  var mt=document.querySelector('details.mtoc');
  if(mt) mt.addEventListener('click',function(e){ if(e.target.closest('a')) mt.open=false; });

  // "Close all explanations" in each exam box, shown only while one is open
  document.querySelectorAll('.card.exam').forEach(function(card){
    var whys=card.querySelectorAll('details.linewhy');
    if(!whys.length) return;
    var b=document.createElement('button');
    b.type='button'; b.className='closeall'; b.textContent='Close all explanations';
    card.appendChild(b);
    function update(){ b.classList.toggle('show',[].some.call(whys,function(d){return d.open;})); }
    whys.forEach(function(d){ d.addEventListener('toggle',update); });
    b.addEventListener('click',function(){ whys.forEach(function(d){d.open=false;}); update(); card.scrollIntoView({block:'nearest'}); });
  });

  // Back to top
  var top=document.getElementById('totop');
  function onScroll(){ top.classList.toggle('show', window.scrollY>900); }
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
  top.addEventListener('click',function(){ window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}); });
})();
