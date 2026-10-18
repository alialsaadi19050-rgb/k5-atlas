/* Alla begrepp: DATA = [[term, "Kapitel · källa", förklaring, kapitel, F|A|X], ...] */
var ROWS=DATA;
var GLOSS=ROWS.map(function(r){return [r[0],r[1],r[2]]});
var CARDS=ROWS.map(function(r){return ["Begrepp",r[3],r[0],r[2],r[4]]});
function makeQuiz(){
  return shuffled(ROWS.length).slice(0,20).map(function(i){var r=ROWS[i];
    var pool=ROWS.filter(function(o,k){return k!==i&&o[3]===r[3]&&o[0]!==r[0]});if(pool.length<3)pool=ROWS.filter(function(o,k){return k!==i});
    var wrong=shuffled(pool.length).slice(0,3).map(function(k){return pool[k][0]});
    var opts=[r[0]].concat(wrong),ord=shuffled(4);
    return ["Vilket begrepp beskrivs? "+r[2],ord.map(function(k){return opts[k]}),ord.indexOf(0),r[0]+" · "+r[3]+"."]});
}
(function(){
  var list=$("#glList");
  function render(){var q=$("#glSearch").value.trim().toLowerCase();list.innerHTML="";var n=0;
    GLOSS.forEach(function(g){if(q&&!(g[0].toLowerCase().indexOf(q)>-1||g[2].toLowerCase().indexOf(q)>-1))return;n++;var d=document.createElement("div");d.innerHTML='<dt>'+esc(g[0])+'<span>'+esc(g[1])+'</span></dt><dd>'+esc(g[2])+'</dd>';list.appendChild(d)});
    $("#glCount").textContent=q?n+" av "+GLOSS.length+" ord":GLOSS.length+" ord"}
  $("#glSearch").addEventListener("input",render);render();
})();
var dir=store.get("k5_begrepp_dir","t");
if(dir==="d")CARDS.forEach(function(c){var q=c[2];c[2]=c[3];c[3]=q});
flashcards(CARDS,"k5_begrepp");
$$("#deckDir button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.v===dir);b.onclick=function(){if(b.dataset.v===dir)return;dir=b.dataset.v;store.set("k5_begrepp_dir",dir);$$("#deckDir button").forEach(function(o){o.setAttribute("aria-pressed",o===b)});FX.swap($("#flash"),"mode",function(){window.__fcFlipAll()})}});
function newQuiz(){quiz(makeQuiz());$("#qReset").onclick=newQuiz}
newQuiz();
