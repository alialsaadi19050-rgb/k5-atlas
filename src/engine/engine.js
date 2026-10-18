/* ===== Motor: tema, effekter och hjälpfunktioner (delas av alla kapitel) ===== */
(function(){try{var t=localStorage.getItem("k5atlas_theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})();
var RM=false;try{RM=matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){}
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var store={get:function(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
var NS="http://www.w3.org/2000/svg";
function el(tag,attrs,parent){var e=document.createElementNS(NS,tag);for(var k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e}
function txt(parent,x,y,s,attrs){var a={x:x,y:y};for(var k in attrs||{})a[k]=attrs[k];var t=el("text",a,parent);t.textContent=s;return t}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function shuffled(n){var a=[];for(var i=0;i<n;i++)a.push(i);for(i=n-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
function cssv(v){try{return getComputedStyle(document.documentElement).getPropertyValue(v).trim()}catch(e){return ""}}

/* ---------- effekter ---------- */
var FX=(function(){
  var canAnim=!RM&&typeof Element!=="undefined"&&!!Element.prototype.animate;
  if(canAnim&&"IntersectionObserver" in window)document.documentElement.classList.add("fx-on");
  var EO="cubic-bezier(.22,1,.36,1)",EI="cubic-bezier(.55,0,1,.45)",SPR="cubic-bezier(.34,1.4,.55,1)";
  var busy=null;
  var OUT={next:"translateX(-70px) rotate(-5deg)",prev:"translateX(70px) rotate(5deg)",know:"translate(90px,-14px) rotate(8deg)",again:"translate(-90px,10px) rotate(-8deg)",restart:"translateY(26px) scale(.86)",shuffle:"scale(.9) rotate(-3deg)",mode:"translateY(10px) scale(.96)"};
  var IN={next:"translateX(70px) rotate(4deg)",prev:"translateX(-70px) rotate(-4deg)",know:"translateX(70px) rotate(4deg)",again:"translateX(70px) rotate(4deg)",restart:"translateY(-30px) scale(.9)",shuffle:"scale(.9) rotate(3deg)",mode:"translateY(10px) scale(.96)"};
  function resetFlip(f){f.style.transition="none";f.classList.remove("flip");void f.offsetWidth;f.style.transition=""}
  function swap(flash,dir,update){
    var box=flash.parentElement;if(!canAnim){update();return}
    if(busy){busy.cancel();busy=null}
    var glow=dir==="know"?cssv("--green"):dir==="again"?cssv("--red-btn"):"";
    var k0={transform:"none",opacity:1},k1={transform:OUT[dir]||OUT.next,opacity:0};
    if(glow){k0.boxShadow="0 0 0 0 transparent";k1.boxShadow="0 0 0 6px "+glow}
    var a=box.animate([k0,k1],{duration:dir==="restart"?240:190,easing:EI});busy=a;var done=false;
    function fin(){if(done)return;done=true;busy=null;resetFlip(flash);update();box.animate([{transform:IN[dir]||IN.next,opacity:0},{transform:"none",opacity:1}],{duration:dir==="restart"?620:460,easing:SPR})}
    a.onfinish=fin;a.oncancel=fin;
  }
  function confetti(elm){
    if(!canAnim||!elm)return;
    var r=elm.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
    var layer=document.createElement("div");layer.className="fx-confetti";document.body.appendChild(layer);
    var cols=["--gold","--blue","--green","--red"].map(cssv).filter(Boolean);
    for(var i=0;i<36;i++){
      var p=document.createElement("i");p.style.left=cx+"px";p.style.top=cy+"px";p.style.background=cols[i%cols.length];
      if(i%3===0){p.style.borderRadius="50%";p.style.width=p.style.height="9px"}
      layer.appendChild(p);
      var ang=Math.random()*Math.PI*2,sp=120+Math.random()*220,dx=Math.cos(ang)*sp,dy=Math.sin(ang)*sp-140,rot=(Math.random()*720-360);
      p.animate([{transform:"translate(-50%,-50%) rotate(0)",opacity:1},{transform:"translate(calc(-50% + "+dx*.7+"px),calc(-50% + "+dy*.7+"px)) rotate("+rot*.6+"deg)",opacity:1,offset:.45},{transform:"translate(calc(-50% + "+dx+"px),calc(-50% + "+(dy+260)+"px)) rotate("+rot+"deg)",opacity:0}],{duration:1300+Math.random()*700,easing:"cubic-bezier(.2,.7,.4,1)",fill:"forwards"});
    }
    setTimeout(function(){layer.remove()},2300);
  }
  function menu(btn,box,choose){
    function close(focus){box.hidden=true;btn.setAttribute("aria-expanded","false");if(focus)btn.focus()}
    function open(){box.hidden=false;btn.setAttribute("aria-expanded","true");var f=box.querySelector("button");if(f)f.focus()}
    btn.addEventListener("click",function(e){e.stopPropagation();box.hidden?open():close()});
    box.addEventListener("click",function(e){var b=e.target.closest("button[data-r]");if(!b)return;close(false);choose(b.dataset.r)});
    document.addEventListener("click",function(e){if(!box.hidden&&!box.contains(e.target)&&e.target!==btn)close(false)});
    box.addEventListener("keydown",function(e){var bs=$$("button",box),i=bs.indexOf(document.activeElement);
      if(e.key==="Escape"){e.preventDefault();close(true)}else if(e.key==="ArrowDown"){e.preventDefault();bs[(i+1)%bs.length].focus()}else if(e.key==="ArrowUp"){e.preventDefault();bs[(i-1+bs.length)%bs.length].focus()}});
  }
  function prog(v){var i=$("#fcProg i");if(i)i.style.width=Math.max(0,Math.min(1,v))*100+"%"}
  var wasDone=false,t0=Date.now();
  function finish(on,text){var row=$("#fcDone");if(!row)return;if(text){var p=row.querySelector("p");if(p)p.textContent=text}row.hidden=!on;if(on&&!wasDone&&Date.now()-t0>1200)confetti($("#flash"));wasDone=on}
  function pulse(e){if(canAnim&&e)e.animate([{transform:"scale(1)"},{transform:"scale(1.08)"},{transform:"scale(1)"}],{duration:420,easing:SPR})}
  function pop(e){if(canAnim&&e&&e.animate)e.animate([{opacity:0,transform:"translateY(8px)"},{opacity:1,transform:"none"}],{duration:420,easing:EO})}
  function ready(){
    if(!canAnim)return;
    if("IntersectionObserver" in window){
      var SEL="section.ch>.head,header.hero>*,.howto>div,.stats>*,figure,.key,.trick,.xbox,.obs,.cheat>div,.journey>.step,.panel,.qq,table.cmp,.tree>li,.card3d,.fcbar,dl.gl>div,details.qa,.grid3>*";
      var els=$$(SEL).filter(function(e){var p=e.parentElement;while(p){if(p.classList&&p.classList.contains("rv"))return false;p=p.parentElement}e.classList.add("rv");return true});
      var io=new IntersectionObserver(function(ents){
        var batch=ents.filter(function(e){return e.isIntersecting}).map(function(e){return e.target});
        batch.sort(function(a,b){var r1=a.getBoundingClientRect(),r2=b.getBoundingClientRect();return (r1.top-r2.top)||(r1.left-r2.left)});
        batch.forEach(function(e,i){io.unobserve(e);e.style.setProperty("--d",Math.min(i*.07,.42)+"s");e.classList.add("in");setTimeout(function(){e.classList.remove("rv","in");e.style.removeProperty("--d")},1500+i*70)});
      },{rootMargin:"0px 0px -8% 0px",threshold:.08});
      els.forEach(function(e){io.observe(e)});
    }
    var mo=new MutationObserver(function(ms){ms.forEach(function(m){
      var t=m.target;
      if(m.type==="attributes"){
        var old=m.oldValue||"",had=function(c){return (" "+old+" ").indexOf(" "+c+" ")>-1};
        if(t.classList.contains("right")&&!had("right")){t.animate([{transform:"scale(1)",boxShadow:"0 0 0 0 transparent"},{transform:"scale(1.04)",boxShadow:"0 0 0 5px "+cssv("--green-soft")},{transform:"scale(1)",boxShadow:"0 0 0 0 transparent"}],{duration:520,easing:SPR})}
        else if(t.classList.contains("wrong")&&!had("wrong")){t.animate([{transform:"translateX(0)"},{transform:"translateX(-8px)"},{transform:"translateX(7px)"},{transform:"translateX(-5px)"},{transform:"translateX(3px)"},{transform:"translateX(0)"}],{duration:460,easing:"ease-out"})}
      }else if(m.type==="childList"){
        var live=t.closest&&t.closest("[aria-live]");
        if(live&&!live._fxT){live._fxT=1;requestAnimationFrame(function(){live._fxT=0;pop(live)})}
        if(t.classList&&t.classList.contains("score"))pulse(t);
      }
    })});
    mo.observe(document.body,{subtree:true,attributes:true,attributeFilter:["class"],attributeOldValue:true,childList:true});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",ready);else ready();
  return {swap:swap,confetti:confetti,menu:menu,prog:prog,finish:finish,pulse:pulse,pop:pop,can:canAnim};
})();

/* ---------- utforskare: klickbar SVG + panel + knappar ---------- */
function explorer(svgSel,panelSel,chipsSel,DATA,first,tag,onShow){
  var panel=$(panelSel),chips=$(chipsSel),svg=$(svgSel);
  function show(id){
    var d=DATA[id];
    panel.innerHTML='<span class="mono">'+tag+'</span><h3>'+d[0]+'</h3><p>'+d[1]+'</p>';
    $$(".org",svg).forEach(function(o){o.classList.toggle("sel",o.dataset.id===id)});
    $$("button",chips).forEach(function(b){b.classList.toggle("on",b.dataset.id===id);b.setAttribute("aria-pressed",b.dataset.id===id)});
    if(onShow)onShow(id);
  }
  Object.keys(DATA).forEach(function(id){var b=document.createElement("button");b.type="button";b.dataset.id=id;b.textContent=DATA[id][0].replace(/<[^>]+>/g,"");b.onclick=function(){show(id)};chips.appendChild(b)});
  $$(".org",svg).forEach(function(o){
    if(!DATA[o.dataset.id])return;
    o.setAttribute("role","button");o.setAttribute("tabindex","0");o.setAttribute("aria-label",DATA[o.dataset.id][0].replace(/<[^>]+>/g,""));
    o.addEventListener("click",function(e){e.stopPropagation();show(o.dataset.id)});
    o.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();show(o.dataset.id)}});
  });
  show(first);
  return show;
}

/* ---------- stegtrappa ---------- */
function stepper(boxSel,nextSel,resetSel,countSel,STEPS,onStep){
  var box=$(boxSel),i=-1;box.innerHTML="";
  STEPS.forEach(function(s,k){var d=document.createElement("div");d.className="step";d.innerHTML='<span class="n">Steg '+(k+1)+'</span><b>'+s[0]+'</b><span class="d" hidden>'+s[1]+'</span>';d.onclick=function(){i=k;upd()};box.appendChild(d)});
  var all=$$(".step",box);
  function upd(){
    all.forEach(function(d,k){d.classList.toggle("on",k===i);d.classList.toggle("past",k<i);d.querySelector(".d").hidden=k>i});
    $(countSel).textContent=i<0?"Tryck på Nästa steg":(i+1)+" / "+STEPS.length;
    $(nextSel).textContent=i>=STEPS.length-1?"Klart ✓":(i<0?"Starta":"Nästa steg");
    if(onStep)onStep(i);
  }
  $(nextSel).onclick=function(){if(i<STEPS.length-1)i++;upd()};
  $(resetSel).onclick=function(){i=-1;upd()};
  upd();
  return function(k){i=k;upd()};
}

/* ---------- lägesknappar ---------- */
function segment(sel,fn,first){
  var bs=$$(sel+" button");
  function set(v){bs.forEach(function(b){b.setAttribute("aria-pressed",b.dataset.v===v)});fn(v)}
  bs.forEach(function(b){b.type="button";b.onclick=function(){set(b.dataset.v)}});
  set(first||bs[0].dataset.v);
  return set;
}

/* ---------- spela/pausa för CSS-animerade SVG ---------- */
function player(btnSel,svgSel,startPaused){
  var b=$(btnSel),s=$(svgSel);var paused=RM||!!startPaused;
  function upd(){s.classList.toggle("paused",paused);b.textContent=paused?"▶ Spela":"❚❚ Pausa";b.setAttribute("aria-pressed",String(!paused))}
  b.onclick=function(){paused=!paused;upd()};upd();
  return function(p){paused=p;upd()};
}

/* ---------- sorteringsspel ---------- */
function sorter(prefix,GROUPS,ROWS){
  var order=shuffled(ROWS.length),pos=0,right=0,done=0;
  function show(){
    var r=ROWS[order[pos]],ans=r[1];
    $("#"+prefix+"Count").textContent="Påstående "+(pos+1)+" av "+ROWS.length;$("#"+prefix+"Q").textContent=r[0];
    var box=$("#"+prefix+"Opts");box.innerHTML="";$("#"+prefix+"Why").hidden=true;
    GROUPS.forEach(function(g,gi){var b=document.createElement("button");b.type="button";b.textContent=g;b.onclick=function(){
      $$("button",box).forEach(function(x,xi){x.disabled=true;if(xi===ans)x.classList.add("right")});
      if(gi!==ans)b.classList.add("wrong");else right++;done++;
      var w=$("#"+prefix+"Why");w.hidden=false;w.textContent=(gi===ans?"Rätt! ":"Inte riktigt. ")+r[2];
      $("#"+prefix+"Score").textContent=right+" / "+done;
    };box.appendChild(b)});
    $("#"+prefix+"Next").textContent=pos>=ROWS.length-1?"Börja om":"Nästa påstående";
  }
  $("#"+prefix+"Next").onclick=function(){if(pos>=ROWS.length-1){pos=0;right=0;done=0;order=shuffled(ROWS.length);$("#"+prefix+"Score").textContent=""}else pos++;show()};
  show();
}

/* ---------- övningsdelen (studiefrågor, spel, översikt, ordlista, kort, quiz) ---------- */
function practice(D,KEY){
  /* studiefrågor */
  var qa=$("#qaList");
  if(qa)D.qa.forEach(function(q){var d=document.createElement("details");d.className="qa";d.innerHTML='<summary>'+esc(q[0])+(q[2]?'<span class="src f">'+esc(q[2])+'</span>':'')+'</summary><div class="ans"><span class="mono">Svarsförslag</span>'+q[1]+'</div>';qa.appendChild(d)});
  /* sorteringsspel */
  (D.sort||[]).forEach(function(s,i){sorter("srt"+i,s.groups,s.rows)});
  /* snabböversikt */
  var ch=$("#cheatList");
  if(ch)D.cheat.forEach(function(c){var d=document.createElement("div");d.innerHTML='<b>'+c[0]+'</b>'+c[1];ch.appendChild(d)});
  /* ordlista */
  var GLOSS=D.gloss.slice().sort(function(a,b){return a[0].localeCompare(b[0],"sv")});
  (function(){
    var list=$("#glList");
    function render(){
      var q=$("#glSearch").value.trim().toLowerCase();list.innerHTML="";var n=0;
      GLOSS.forEach(function(g){if(q&&!(g[0].toLowerCase().indexOf(q)>-1||g[2].toLowerCase().indexOf(q)>-1))return;n++;var div=document.createElement("div");div.innerHTML='<dt>'+esc(g[0])+'<span>'+esc(g[1])+'</span></dt><dd>'+esc(g[2])+'</dd>';list.appendChild(div)});
      $("#glCount").textContent=q?n+" av "+GLOSS.length+" ord":GLOSS.length+" ord";
    }
    $("#glSearch").addEventListener("input",render);render();
  })();
  flashcards(D.cards,KEY);
  quiz(D.quiz);
}

function flashcards(CARDS,KEY){
  var known=new Set(store.get(KEY,[])),star=new Set(store.get(KEY+"_star",[])),round=1;
  var order=CARDS.map(function(_,i){return i}),pos=0,mode="all",type="",src=store.get(KEY+"_src","")||"";
  var flash=$("#flash");
  function deck(){return order.filter(function(i){var c=CARDS[i];return (!type||c[1]===type)&&(!src||c[4]===src)&&(mode==="all"||(mode==="star"?star.has(i):!known.has(i)))})}
  function setSeg(id,v){$$(id+" button").forEach(function(o){o.setAttribute("aria-pressed",o.dataset.v===v)})}
  setSeg("#deckSrc",src);
  var SRCN={F:"Föreläsning",A:"Anteckningar",X:"Extra"};
  function render(){
    var d=deck();
    $("#fcStat").textContent="Kan: "+known.size+" av "+CARDS.length+" · ★ "+star.size;
    flash.classList.remove("flip");starUI(-1);
    $("#fcDoneLeft").hidden=mode!=="all"||known.size===CARDS.length;
    if(!d.length&&mode==="star"){$("#fcTag").textContent="";$("#fcQ").textContent="Inga markerade kort än.";$("#fcA").textContent="Tryck på ☆ Markera (eller M) på ett kort du vill plugga senare.";FX.prog(0);FX.finish(false);return}
    if(!d.length){$("#fcTag").textContent="";$("#fcQ").textContent=mode==="all"?"Inga kort med de här filtren.":"Du kan alla kort här!";$("#fcA").textContent="Byt filter, tryck på Börja om eller gör quizet.";FX.prog(1);FX.finish(mode!=="all","Du kan alla kort här!");return}
    if(pos<0)pos=d.length-1;
    if(pos>=d.length&&mode==="until"){round++;pos=0;mix();return render()}
    if(pos>=d.length){pos=d.length;$("#fcTag").textContent="Klart";$("#fcQ").textContent="Varvet är klart!";$("#fcA").textContent="Du har gått igenom alla "+d.length+" kort. Kan: "+known.size+" av "+CARDS.length+".";FX.prog(1);FX.finish(true,"Varvet klart! Kan: "+known.size+" av "+CARDS.length);return}
    FX.finish(false);
    var c=CARDS[d[pos]];
    $("#fcTag").textContent=c[0]+" · "+c[1]+" · "+(SRCN[c[4]]||"")+" · "+(pos+1)+"/"+d.length+(known.has(d[pos])?" · ✓":"")+(mode==="until"?" · Varv "+round:"");
    $("#fcQ").textContent=c[2];$("#fcA").textContent=c[3];
    FX.prog((pos+1)/d.length);starUI(d[pos]);
  }
  function atEnd(){return pos>=deck().length}
  function mix(){for(var i=order.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=order[i];order[i]=order[j];order[j]=t}}
  function starUI(i){var b=$("#fcStar");b.disabled=i<0;var on=star.has(i);b.textContent=on?"★ Markerad":"☆ Markera";b.setAttribute("aria-pressed",String(on))}
  function toggleStar(){var d=deck();if(!d.length||pos<0||pos>=d.length)return;var i=d[pos];if(star.has(i))star.delete(i);else star.add(i);store.set(KEY+"_star",Array.from(star));
    if(mode==="star"&&!star.has(i))FX.swap(flash,"next",render);else{starUI(i);$("#fcStat").textContent="Kan: "+known.size+" av "+CARDS.length+" · ★ "+star.size}}
  $("#fcStar").onclick=toggleStar;
  function restart(hard){FX.swap(flash,"restart",function(){order=CARDS.map(function(_,i){return i});pos=0;round=1;if(hard){known.clear();store.set(KEY,[]);mode="all";type="";src="";store.set(KEY+"_src","");setSeg("#deckMode","all");setSeg("#deckType","");setSeg("#deckSrc","")}render()})}
  function next(){if(atEnd())return restart(false);FX.swap(flash,"next",function(){pos++;render()})}
  function prev(){FX.swap(flash,"prev",function(){pos--;render()})}
  function flip(){if(!atEnd()&&deck().length)flash.classList.toggle("flip")}
  flash.addEventListener("click",flip);
  flash.addEventListener("keydown",function(e){if(e.key===" "||e.key==="Enter"){e.preventDefault();flip()}else if(e.key==="ArrowRight"){e.preventDefault();next()}else if(e.key==="ArrowLeft"){e.preventDefault();prev()}else if(e.key==="m"||e.key==="M"){e.preventDefault();toggleStar()}else if(e.key==="r"||e.key==="R"){e.preventDefault();restart(false)}});
  $("#fcNext").onclick=next;$("#fcPrev").onclick=prev;
  $("#fcKnow").onclick=function(){if(atEnd())return;FX.swap(flash,"know",function(){var d=deck();known.add(d[pos]);store.set(KEY,Array.from(known));if(mode==="all"||mode==="star")pos++;render()})};
  $("#fcAgain").onclick=function(){if(atEnd())return;FX.swap(flash,"again",function(){var d=deck();known.delete(d[pos]);store.set(KEY,Array.from(known));pos++;render()})};
  $("#fcShuffle").onclick=function(){FX.swap(flash,"shuffle",function(){mix();pos=0;render()})};
  function seg(id,set){$$(id+" button").forEach(function(b){b.onclick=function(){FX.swap(flash,"mode",function(){setSeg(id,b.dataset.v);set(b.dataset.v);pos=0;render()})}})}
  seg("#deckMode",function(v){mode=v;round=1;if(v==="until")mix()});seg("#deckType",function(v){type=v});seg("#deckSrc",function(v){src=v;store.set(KEY+"_src",v)});
  FX.menu($("#fcRestart"),$("#fcRestartMenu"),function(r){restart(r==="hard")});
  $("#fcDoneRestart").onclick=function(){restart(false)};
  $("#fcDoneLeft").onclick=function(){FX.swap(flash,"mode",function(){mode="until";round=1;mix();setSeg("#deckMode","until");pos=0;render()})};
  window.__fcFlipAll=function(){CARDS.forEach(function(c){var q=c[2];c[2]=c[3];c[3]=q});render()};
  render();
}

function quiz(QUIZ){
  var list=$("#qList"),right=0,done=0;
  function upd(){$("#qScore").textContent=right+" rätt av "+done+(done===QUIZ.length?" · klart!":" · "+(QUIZ.length-done)+" kvar");if(done===QUIZ.length&&right===QUIZ.length)FX.confetti($("#qScore"))}
  function build(){
    list.innerHTML="";right=0;done=0;upd();
    QUIZ.forEach(function(q,qi){
      var box=document.createElement("div");box.className="qq";
      box.innerHTML='<p class="t">'+(qi+1)+'. '+esc(q[0])+'</p><div class="opts"></div><div class="why" aria-live="polite" hidden></div>';
      var opts=box.querySelector(".opts");
      q[1].forEach(function(o,oi){var b=document.createElement("button");b.type="button";b.textContent=o;b.onclick=function(){
        $$("button",opts).forEach(function(x,xi){x.disabled=true;if(xi===q[2])x.classList.add("right")});
        if(oi!==q[2])b.classList.add("wrong");else right++;done++;
        var w=box.querySelector(".why");w.hidden=false;w.textContent=(oi===q[2]?"Rätt! ":"Inte riktigt. ")+q[3];upd();
      };opts.appendChild(b)});
      list.appendChild(box);
    });
  }
  $("#qReset").onclick=build;build();
}

/* ---------- aktiv rubrik i menyn ---------- */
function railSpy(){
  var links=$$("#rail a"),secs=links.map(function(a){return document.querySelector(a.getAttribute("href"))});
  function on(){var cur=0;secs.forEach(function(s,i){if(s&&s.getBoundingClientRect().top<140)cur=i});links.forEach(function(a,i){var o=i===cur;if(o!==a.classList.contains("on")){a.classList.toggle("on",o);if(o&&a.scrollIntoView&&innerWidth<=900){var r=a.parentElement;r.scrollTo({left:a.offsetLeft-20,behavior:"smooth"})}}})}
  addEventListener("scroll",on,{passive:true});on();
  document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;var t=document.getElementById(a.getAttribute("href").slice(1));if(!t)return;e.preventDefault();t.scrollIntoView({behavior:RM?"auto":"smooth"})},true);
}

/* "/" i ett kapitel fokuserar sökrutan i skalet */
document.addEventListener("keydown",function(e){
  if(e.key!=="/"||/input|textarea/i.test(document.activeElement.tagName))return;
  try{var g=window.parent.document.getElementById("gq");if(g&&window.parent!==window){e.preventDefault();g.focus();g.select()}}catch(err){}
});

/* ---------- länkar till andra flikar: <a data-tab="virus" data-sec="hsv"> ---------- */
document.addEventListener("click",function(e){
  var a=e.target.closest&&e.target.closest("a[data-tab]");if(!a)return;e.preventDefault();
  try{if(window.parent&&window.parent!==window&&window.parent.K5go){window.parent.K5go(a.dataset.tab,a.dataset.sec||"")}}catch(err){}
});
