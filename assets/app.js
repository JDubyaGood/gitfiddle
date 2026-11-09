/* Gitfiddle shared app: home page, song pages, play-along synth, practice tools, hard-part looper. */
(function(){
"use strict";
var DATA = window.GF_DATA || {SONGS:[],CHORDS:{},VIDEOS:{},TUNINGS:{}};
var SONGS = DATA.SONGS, CHORDS = DATA.CHORDS, VIDEOS = DATA.VIDEOS, TUNINGS = DATA.TUNINGS;
var DRILL_KEY = "gitfiddle.drillHistory.v1";     // unchanged from v1 index.html
var ROOT = document.body.getAttribute("data-root") || "";

/* ---------------- utils ---------------- */
function $(s, r){ return (r||document).querySelector(s); }
function $$(s, r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); }
function esc(str){ return String(str==null?"":str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function clamp(v,a,b){ return Math.min(b,Math.max(a,v)); }
function r2(v){ return Math.round(v*100)/100; }
function fmt(s){ s=Math.max(0,s||0); var m=Math.floor(s/60), r=s-m*60; var rs=(r%1)?r.toFixed(1):String(Math.round(r)); if(r<10) rs="0"+rs; return m+":"+rs; }
function songById(id){ for(var i=0;i<SONGS.length;i++) if(SONGS[i].id===id) return SONGS[i]; return null; }
function songHref(s){ return ROOT + "songs/" + s.slug + ".html"; }
function chordName(id){ return CHORDS[id] ? CHORDS[id].name : id; }
function dots(n){ var o=""; for(var i=0;i<5;i++) o+= i<n?"●":"○"; return o; }
function lsGet(k){ try{ return JSON.parse(localStorage.getItem(k)); }catch(e){ return null; } }
function lsSet(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
function todayISO(){ var d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function tuningOf(song){ return TUNINGS[song.tuning||"standard"] || TUNINGS.standard; }

/* ---------------- audio ---------------- */
var audio = { ctx:null };
function ensureAudio(){
  if(!audio.ctx){ var C=window.AudioContext||window.webkitAudioContext; audio.ctx=new C(); }
  if(audio.ctx.state==="suspended") audio.ctx.resume();
  return audio.ctx;
}
function midiHz(m){ return 440*Math.pow(2,(m-69)/12); }
function pluckString(freq, when, velocity, duration){
  var ctx=ensureAudio(), sr=ctx.sampleRate, dur=duration||2.2;
  var n=Math.max(2, Math.floor(sr/freq));
  var buf=ctx.createBuffer(1, Math.floor(sr*dur), sr), data=buf.getChannelData(0);
  var noise=new Float32Array(n), i, prev=0;
  for(i=0;i<n;i++) noise[i]=(Math.random()*2-1)*velocity;
  for(i=0;i<data.length;i++){ var idx=i%n, avg=0.496*(noise[idx]+prev); prev=noise[idx]; noise[idx]=avg; data[i]=avg; }
  var src=ctx.createBufferSource(); src.buffer=buf;
  var f=ctx.createBiquadFilter(); f.type="lowpass"; f.frequency.value=Math.min(4200,freq*8);
  var g=ctx.createGain(); g.gain.setValueAtTime(velocity,when); g.gain.exponentialRampToValueAtTime(0.001,when+dur);
  src.connect(f); f.connect(g); g.connect(ctx.destination); src.start(when); src.stop(when+dur+0.05);
}
function noteHz(song, s, fret){ return midiHz(tuningOf(song).midi[s] + fret); }
function playedStrings(c){ var o=[]; for(var s=0;s<6;s++) if(c.frets[s]>=0) o.push(s); return o; }
function strumChord(song, chordId, when, down, velocity){
  var c=CHORDS[chordId]; if(!c) return;
  var order=playedStrings(c); if(!down) order.reverse();
  var vel=velocity*(down?1:0.62);
  order.forEach(function(si,i){
    var k=i/Math.max(1,order.length-1);
    pluckString(noteHz(song,si,c.frets[si]), when+i*0.0045, vel*(0.75+0.25*(down?k:1-k))*0.55, 2.4);
  });
}
function resolveString(c, tok){
  var pl=playedStrings(c); if(!pl.length) return -1;
  var A=pl[0];
  if(tok==="A") return A;
  if(tok==="B"){ for(var i=0;i<pl.length;i++) if(pl[i]>=A+2 && pl[i]<=3) return pl[i]; return pl[Math.min(1,pl.length-1)]; }
  var want=tok; for(var s=want;s<6;s++) if(c.frets[s]>=0) return s; for(s=want;s>=0;s--) if(c.frets[s]>=0) return s; return -1;
}
function pluckChordStrings(song, chordId, toks, when, vel){
  var c=CHORDS[chordId]; if(!c) return;
  toks.forEach(function(t){ var s=resolveString(c,t); if(s>=0) pluckString(noteHz(song,s,c.frets[s]), when, vel*(t==="A"||t==="B"?0.6:0.45), 2.6); });
}
function click(time, accent){
  var ctx=ensureAudio(), o=ctx.createOscillator(), g=ctx.createGain();
  o.type="square"; o.frequency.value=accent?1400:900;
  g.gain.setValueAtTime(accent?0.16:0.1,time); g.gain.exponentialRampToValueAtTime(0.001,time+0.05);
  o.connect(g); g.connect(ctx.destination); o.start(time); o.stop(time+0.06);
}
function beep(freq){ try{ var ctx=ensureAudio(), o=ctx.createOscillator(), g=ctx.createGain(), t=ctx.currentTime; o.type="square"; o.frequency.value=freq||880; g.gain.setValueAtTime(0.06,t); g.gain.exponentialRampToValueAtTime(0.0001,t+0.07); o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t+0.09);}catch(e){} }

/* Patterns: 8 eighth-note slots per 4/4 bar. "D"/"U" = strum; arrays = pluck tokens (A=bass, B=alt bass, n=string index low→high). */
var PATTERNS = {
  downs:    { name:"All downs",       slots:["D",null,"D",null,"D",null,"D",null], show:["↓","↓","↓","↓"], showNote:"One down-strum per beat." },
  folk:     { name:"D-D-U-U-D-U",     slots:["D",null,"D","U","U",null,"D","U"], show:["↓","·","↓","↑","↑","·","↓","↑"], showNote:"On 1, 2, 2&, 3&, 4, 4&." },
  travis:   { name:"Travis (thumb bass)", slots:[["A"],[3],["B"],[4],["A"],[3],["B"],[4]], show:["T","i","T","m","T","i","T","m"], showNote:"T = thumb alternating the bass strings, i/m = fingers on the G and B strings." },
  arpeggio: { name:"Fingerpick (root-3-1-3)", slots:[["A"],null,[3],null,[5],null,[3],null], show:["T","i","r","i"], showNote:"T = thumb on the root, i = G string, r = high E (getcrackingguitar's pattern)." }
};

/* ---------------- chord diagram ---------------- */
function chordSVG(id){
  var c=CHORDS[id]; if(!c) return "";
  var w=92,h=124,left=20,top=30,right=74,bottom=104,frets=4;
  var pos=c.frets.filter(function(f){return f>0;}), maxF=Math.max.apply(null,pos.concat([0])), base=1;
  if(maxF>4) base=Math.min.apply(null,pos);
  function sx(i){ return left+i*(right-left)/5; } function sy(f){ return top+f*(bottom-top)/frets; }
  var p=['<svg width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+esc(c.name)+' chord">',
    '<rect width="'+w+'" height="'+h+'" rx="8" fill="#1e2430"/>',
    '<text x="'+(w/2)+'" y="15" text-anchor="middle" fill="#e8eaed" font-size="12" font-weight="700" font-family="system-ui,sans-serif">'+esc(c.name)+'</text>'];
  p.push('<line x1="'+left+'" y1="'+top+'" x2="'+right+'" y2="'+top+'" stroke="#e8eaed" stroke-width="'+(base===1?3:1)+'" stroke-linecap="round"/>');
  if(base>1) p.push('<text x="'+(right+4)+'" y="'+(top+12)+'" fill="#9aa0a6" font-size="9" font-family="system-ui,sans-serif">'+base+'fr</text>');
  for(var f=1;f<=frets;f++) p.push('<line x1="'+left+'" y1="'+sy(f)+'" x2="'+right+'" y2="'+sy(f)+'" stroke="#5a6270"/>');
  for(var s=0;s<6;s++){
    var x=sx(s), fr=c.frets[s];
    p.push('<line x1="'+x+'" y1="'+top+'" x2="'+x+'" y2="'+bottom+'" stroke="#9aa0a6" stroke-width="'+(s===0||s===5?1.6:1.2)+'"/>');
    if(fr===-1) p.push('<text x="'+x+'" y="'+(top-6)+'" text-anchor="middle" fill="#ff6b6b" font-size="10" font-weight="700" font-family="system-ui,sans-serif">×</text>');
    else if(fr===0) p.push('<circle cx="'+x+'" cy="'+(top-8)+'" r="3.2" fill="none" stroke="#3dd68c" stroke-width="1.5"/>');
    else { var rf=fr-base+1, cy=(sy(rf-1)+sy(rf))/2; p.push('<circle cx="'+x+'" cy="'+cy+'" r="6.5" fill="#5b9cff"/>');
      if(c.fingers[s]>0) p.push('<text x="'+x+'" y="'+(cy+3.5)+'" text-anchor="middle" fill="#061018" font-size="9" font-weight="700" font-family="system-ui,sans-serif">'+c.fingers[s]+'</text>'); }
  }
  if(c.tip) p.push('<text x="'+(w/2)+'" y="'+(h-5)+'" text-anchor="middle" fill="#9aa0a6" font-size="8" font-family="system-ui,sans-serif">'+esc(c.tip)+'</text>');
  p.push('</svg>'); return p.join("");
}

/* ---------------- lite YouTube embeds ---------------- */
function liteYT(v){
  var tag = v.tag ? '<div class="yt-tag '+esc(v.tagClass||"")+'">'+esc(v.tag)+'</div>' : "";
  return '<div class="yt-card">'+tag+'<div class="yt-title">'+esc(v.title)+'</div>'+
    '<div class="lite" role="button" tabindex="0" aria-label="Play '+esc(v.title)+'" data-yt="'+esc(v.id)+'" style="background-image:url(https://i.ytimg.com/vi/'+esc(v.id)+'/hqdefault.jpg)"><div class="play"></div></div>'+
    '<a class="yt-fallback" href="https://www.youtube.com/watch?v='+esc(v.id)+'" target="_blank" rel="noopener">Open on YouTube ↗</a></div>';
}
function activateLite(el){
  if(el.querySelector("iframe")) return;
  var f=document.createElement("iframe");
  f.src="https://www.youtube.com/embed/"+el.getAttribute("data-yt")+"?autoplay=1&rel=0&playsinline=1";
  f.setAttribute("allow","autoplay; encrypted-media; picture-in-picture; fullscreen; compute-pressure");
  f.setAttribute("allowfullscreen",""); f.setAttribute("referrerpolicy","strict-origin-when-cross-origin");
  f.title="YouTube video"; el.innerHTML=""; el.appendChild(f); el.style.cursor="default";
}
document.addEventListener("click", function(e){ var l=e.target.closest && e.target.closest(".lite[data-yt]"); if(l) activateLite(l); });
document.addEventListener("keydown", function(e){ if((e.key==="Enter"||e.key===" ") && e.target.classList && e.target.classList.contains("lite")){ e.preventDefault(); activateLite(e.target); } });

/* ---------------- drill history (shared key, unchanged format) ---------------- */
function loadHistory(){ var h=lsGet(DRILL_KEY); return Array.isArray(h)?h:[]; }
function addHistory(entry){ var all=loadHistory(); all.unshift(entry); if(all.length>200) all=all.slice(0,200); lsSet(DRILL_KEY, all); }
function historyFor(id){ return loadHistory().filter(function(e){ return e.songId===id; }); }

/* ---------------- nav ---------------- */
function topNav(song){
  var i=SONGS.indexOf(song), prev=null, next=null, j;
  for(j=i-1;j>=0;j--) if(SONGS[j].status==="ready"){ prev=SONGS[j]; break; }
  for(j=i+1;j<SONGS.length;j++) if(SONGS[j].status==="ready"){ next=SONGS[j]; break; }
  return '<nav class="topnav"><a class="home" href="'+ROOT+'index.html">← Gitfiddle</a><span class="title">'+(song?esc((i+1)+". "+song.title):"Setlist")+'</span>'+
    '<span class="pn">'+(prev?'<a href="'+songHref(prev)+'" title="'+esc(prev.title)+'">‹ Prev</a>':'')+(next?'<a href="'+songHref(next)+'" title="'+esc(next.title)+'">Next ›</a>':'')+'</span></nav>';
}

/* ================= LESSON TIER / DIFFICULTY / TECHNIQUES ================= */
var TECHNIQUES = DATA.TECHNIQUES || [];
var TIER_ORDER = ["S","A","B","C"];
var TIER_INFO = {
  S:{name:"S", blurb:"Tons of great lessons: big-name teachers, chapters, slow breakdowns."},
  A:{name:"A", blurb:"Solid lessons exist; the page has plenty of good clips to loop."},
  B:{name:"B", blurb:"A few decent lessons; some hard parts lean on general technique videos."},
  C:{name:"C", blurb:"Little or no song-specific material; the page relies on general lessons."}
};
var TIER_CUTS = { S:9, A:7, B:4 };          // score out of 10
/* Transparent rubric: every point comes from a raw number in song.lessonStats. */
function lessonTier(song){
  var st=song.lessonStats||{}, n=st.songLessons||0, v=st.topViews||0, parts=[];
  var p1 = n>=6?3 : n>=3?2 : n>=1?1 : 0;
  parts.push({k:"Song-specific lessons", raw:n+" found", pts:p1, max:3, rule:"0→0 · 1–2→1 · 3–5→2 · 6+→3"});
  var p2 = v>=1e6?3 : v>=1e5?2 : v>=1e4?1 : 0;
  parts.push({k:"Top lesson views", raw:fmtViews(v), pts:p2, max:3, rule:"<10K→0 · 10K+→1 · 100K+→2 · 1M+→3"});
  var p3 = (st.bigTeacherLessons||0)>=1?1:0;
  parts.push({k:"Big-name teacher", raw:(st.bigTeacherLessons||0)+" lesson(s)", pts:p3, max:1, rule:"lesson from a 1M+ sub channel (JustinGuitar, Marty Music, Andy Guitar, GuitarJamz…)"});
  var p4 = (st.withChapters||0)>=1?1:0;
  parts.push({k:"Chapters", raw:(st.withChapters||0)+" lesson(s)", pts:p4, max:1, rule:"≥1 song lesson has YouTube chapters"});
  var p5 = (st.withCaptions||0)>=1?1:0;
  parts.push({k:"Captions", raw:(st.withCaptions||0)+" lesson(s)", pts:p5, max:1, rule:"≥1 song lesson has captions"});
  var p6 = st.slowBreakdown?1:0;
  parts.push({k:"Slow hard-part breakdown", raw:st.slowBreakdown?"yes":"no", pts:p6, max:1, rule:"a lesson plays the tricky bits slowly, step by step"});
  var score=p1+p2+p3+p4+p5+p6;
  var tier = score>=TIER_CUTS.S?"S" : score>=TIER_CUTS.A?"A" : score>=TIER_CUTS.B?"B" : "C";
  return {tier:tier, score:score, max:10, parts:parts};
}
function fmtViews(v){ v=v||0; return v>=1e6?(v/1e6).toFixed(1).replace(/\.0$/,"")+"M" : v>=1e3?Math.round(v/1e3)+"K" : String(v); }
var DIFF_LABELS = ["","Beginner","Easy","Intermediate","Upper-intermediate","Advanced"];
function diffLabel(n){ return DIFF_LABELS[clamp(n||1,1,5)]; }
function tierBadge(song, big){
  var t=lessonTier(song);
  return '<span class="tierbadge t'+t.tier+(big?' big':'')+'" title="Lesson tier '+t.tier+': '+t.score+'/10. '+esc(TIER_INFO[t.tier].blurb)+'"><b>'+t.tier+'</b>'+(big?'<small>lesson tier<br>'+t.score+'/10</small>':'')+'</span>';
}
function techChips(song){ return (song.techTags||[]).map(function(t){ return '<span class="chip tech">'+esc(t)+'</span>'; }).join(""); }
function tierBreakdown(song){
  var t=lessonTier(song), st=song.lessonStats||{};
  return '<table class="tiertable"><tr><th>Factor</th><th>Raw</th><th>Pts</th></tr>'+t.parts.map(function(p){ return '<tr><td>'+esc(p.k)+'</td><td>'+esc(p.raw)+'</td><td>'+p.pts+'/'+p.max+'</td></tr>'; }).join("")+
    '<tr class="tot"><td>Total</td><td>Tier '+t.tier+'</td><td>'+t.score+'/10</td></tr></table>'+
    (st.topLesson?'<div class="tiny">Top lesson: '+esc(st.topLesson)+'</div>':'')+(st.note?'<div class="tiny">'+esc(st.note)+'</div>':'');
}

/* ================= HOME ================= */
var HOME_KEY="gitfiddle.home.v1";
var SORTS = { order:"Learning order", tier:"Lesson tier (S→C)", easy:"Difficulty: easy → hard", hard:"Difficulty: hard → easy" };
function homeState(){
  var s=lsGet(HOME_KEY)||{};
  if(!SORTS[s.sort]) s.sort="order";
  s.tech=(Array.isArray(s.tech)?s.tech:[]).filter(function(t){ return TECHNIQUES.indexOf(t)>=0; });
  if(s.view!=="tiers") s.view="list";
  return s;
}
function sortedSongs(st){
  var arr=SONGS.map(function(s,i){ return {s:s,i:i,t:TIER_ORDER.indexOf(lessonTier(s).tier),sc:lessonTier(s).score}; });
  if(st.tech.length) arr=arr.filter(function(o){ return st.tech.some(function(t){ return (o.s.techTags||[]).indexOf(t)>=0; }); });
  arr.sort(function(a,b){
    if(st.sort==="tier") return (a.t-b.t)||(b.sc-a.sc)||(a.i-b.i);
    if(st.sort==="easy") return (a.s.difficulty-b.s.difficulty)||(a.i-b.i);
    if(st.sort==="hard") return (b.s.difficulty-a.s.difficulty)||(a.i-b.i);
    return a.i-b.i;
  });
  return arr;
}
function songCard(s,i){
  var hist=historyFor(s.id), best=hist.reduce(function(m,e){ return Math.max(m,e.count||0); },0);
  var tune=tuningOf(s), ready=s.status==="ready";
  var inner='<div class="top"><div class="n" title="Learning order">'+(i+1)+'</div><div style="flex:1;min-width:0"><h2>'+esc(s.title)+'</h2>'+
    '<div class="meta">'+esc(s.artist)+(s.year?' · '+s.year:'')+' · Key: '+esc(s.key)+(s.capo&&s.capo!=="None"?' · Capo: '+esc(s.capo):'')+'</div>'+
    '<div class="diffline"><span class="chip diff d'+s.difficulty+'" title="Difficulty '+s.difficulty+'/5">'+dots(s.difficulty)+' '+esc(diffLabel(s.difficulty))+'</span> <span class="reason">'+esc(s.diffReason||"")+'</span></div>'+
    '<div class="chips">'+techChips(s)+'</div>'+
    '<div class="chips detail"><span class="chip lstage">'+esc(s.stageLabel||("Stage "+s.stage))+'</span>'+
    (s.tuning&&s.tuning!=="standard"?'<span class="chip tune">'+esc(tune.name)+' ('+esc(tune.notes)+')</span>':'')+
    (s.tags||[]).map(function(t){ return '<span class="chip">'+esc(t)+'</span>'; }).join("")+(ready?'':'<span class="chip soon">Coming soon</span>')+'</div>'+
    '<div class="meta" style="margin-top:6px">Chords: '+s.chords.map(chordName).map(esc).join(", ")+(ready&&s.hardParts?' · '+s.hardParts.parts.length+' hard parts':'')+'</div>'+
    (hist.length?'<div class="stats">'+hist.length+' drill'+(hist.length>1?'s':'')+' logged · best '+best+' changes/min · last '+esc(hist[0].date)+'</div>':'')+
    '</div>'+tierBadge(s,true)+'</div>';
  return ready ? '<a class="song-card" data-id="'+esc(s.id)+'" href="'+songHref(s)+'">'+inner+'</a>' : '<div class="song-card soon" data-id="'+esc(s.id)+'">'+inner+'</div>';
}
function renderHome(){
  document.title="Gitfiddle · Jake's Guitar App";
  var st=homeState();
  var h=[topNav(null).replace('<a class="home" href="'+ROOT+'index.html">← Gitfiddle</a>','<span class="home">Gitfiddle</span>')];
  h.push('<main class="narrow"><div class="hero"><h1>Jake\'s setlist</h1><div class="meta">Every song page has chord diagrams, a play-along, and <b>Hard Parts</b>: looping, slowed-down, zoomed-in clips from real YouTube lessons, plus practice tools. The <b>S/A/B/C badge</b> tells you how much good YouTube lesson material there is for that song, and so how strong its page is.</div></div>');
  h.push('<div class="homectl blk">'+
    '<div class="row"><label>Sort <select id="homeSort">'+Object.keys(SORTS).map(function(k){ return '<option value="'+k+'"'+(st.sort===k?' selected':'')+'>'+SORTS[k]+'</option>'; }).join("")+'</select></label>'+
    '<div class="seg" role="group" aria-label="View"><button type="button" data-view="list" class="'+(st.view==="list"?"on":"")+'" aria-pressed="'+(st.view==="list")+'">List</button><button type="button" data-view="tiers" class="'+(st.view==="tiers"?"on":"")+'" aria-pressed="'+(st.view==="tiers")+'">Tier list</button></div></div>'+
    '<div class="row techf"><span class="lbl">Technique</span>'+TECHNIQUES.map(function(t){ var on=st.tech.indexOf(t)>=0; return '<button type="button" class="tchip'+(on?' on':'')+'" aria-pressed="'+on+'" data-tech="'+esc(t)+'">'+esc(t)+'</button>'; }).join("")+
    (st.tech.length?'<button type="button" class="tclear" id="techClear">Clear</button>':'')+'</div>'+
    (st.tech.length?'<div class="tiny">Showing songs with <b>any</b> of: '+st.tech.map(esc).join(", ")+'</div>':'')+
    '</div>');
  var list=sortedSongs(st);
  if(!list.length) h.push('<div class="blk empty">No songs match those techniques yet.</div>');
  else if(st.view==="tiers"){
    h.push('<div class="tierlist">');
    TIER_ORDER.forEach(function(T){
      var row=list.filter(function(o){ return lessonTier(o.s).tier===T; });
      h.push('<div class="tierrow"><div class="tierlabel t'+T+'">'+T+'</div><div class="tieritems">'+
        (row.length?row.map(function(o){ var s=o.s, ready=s.status==="ready"; var b='<span class="n">'+(o.i+1)+'</span><b>'+esc(s.title)+'</b><small>'+esc(s.artist)+' · '+dots(s.difficulty)+' '+esc(diffLabel(s.difficulty))+' · '+lessonTier(s).score+'/10</small>';
          return ready?'<a class="tieritem" data-id="'+esc(s.id)+'" href="'+songHref(s)+'">'+b+'</a>':'<span class="tieritem soon" data-id="'+esc(s.id)+'">'+b+'</span>'; }).join(""):'<span class="tiny empty">—</span>')+
        '</div></div>');
    });
    h.push('</div>');
  } else {
    h.push('<div class="song-list">'+list.map(function(o){ return songCard(o.s,o.i); }).join("")+'</div>');
  }
  h.push('<details class="blk howtiers"><summary>How lesson tiers work</summary><p>Each song gets 0–10 points from raw numbers stored with its data (<code>lessonStats</code> in <code>assets/songs.js</code>). The tier is calculated, so adding a song or updating its numbers changes the tier automatically. <b>S</b> = '+TIER_CUTS.S+'+ · <b>A</b> = '+TIER_CUTS.A+'–'+(TIER_CUTS.S-1)+' · <b>B</b> = '+TIER_CUTS.B+'–'+(TIER_CUTS.A-1)+' · <b>C</b> = under '+TIER_CUTS.B+'.</p><ul>'+
    lessonTier({lessonStats:{}}).parts.map(function(p){ return '<li><b>'+esc(p.k)+'</b> (max '+p.max+'): '+esc(p.rule)+'</li>'; }).join("")+
    '</ul><p>The tier is about how good the <i>lessons</i> are, not how hard the song is. Difficulty (●○○○○ Beginner → ●●●●● Advanced) is a separate rating.</p>'+
    '<div class="tierbreak">'+SONGS.map(function(s){ return '<div><h4>'+tierBadge(s,false)+' '+esc(s.title)+'</h4>'+tierBreakdown(s)+'</div>'; }).join("")+'</div></details>');
  h.push('</main><footer class="tiny">Your progress and list settings are saved in this browser. YouTube clips need an internet connection and have to be served over http(s), not opened from a file.</footer>');
  $("#app").innerHTML=h.join("");
  var save=function(){ lsSet(HOME_KEY,st); renderHome(); };
  $("#homeSort").addEventListener("change",function(){ st.sort=this.value; save(); });
  $$(".homectl [data-view]").forEach(function(b){ b.addEventListener("click",function(){ st.view=b.getAttribute("data-view"); save(); }); });
  $$(".homectl [data-tech]").forEach(function(b){ b.addEventListener("click",function(){ var t=b.getAttribute("data-tech"), k=st.tech.indexOf(t); if(k>=0) st.tech.splice(k,1); else st.tech.push(t); save(); }); });
  var c=$("#techClear"); if(c) c.addEventListener("click",function(){ st.tech=[]; save(); });
}

/* ================= SONG PAGE ================= */
var play = { running:false, bpm:60, pattern:"downs", loop:true, events:[], cursor:0, timer:null, song:null, timeouts:[] };
var metro = { ticking:false, next:0, bpm:60, timer:null, beat:0 };
var drill = { running:false, left:60, timer:null, pair:null };

function flatten(song){ var out=[], g=0; song.progression.forEach(function(row,li){ row.chords.forEach(function(c,i){ out.push({chord:c,beats:row.beats[i],line:li,gi:g++}); }); }); return out; }
function buildEvents(song){
  var beat=60/play.bpm, ev=[], t=0, pat=PATTERNS[play.pattern]||PATTERNS.downs;
  for(var c=0;c<4;c++){ ev.push({type:"click",t:t,accent:c===0,beat:c+1,countIn:true}); t+=beat; }
  var abs=0;
  flatten(song).forEach(function(st){
    for(var b=0;b<st.beats;b++){
      var bib=abs%4;
      for(var e=0;e<2;e++){
        var slot=pat.slots[bib*2+e]; if(!slot) continue;
        var base={t:t+e*beat/2, chord:st.chord, gi:st.gi, beat:bib+1};
        if(slot==="D"||slot==="U"){ base.type="strum"; base.down=slot==="D"; base.label=slot==="D"?"↓":"↑"; }
        else { base.type="pluck"; base.toks=slot; base.label=pat.show[pat.show.length===4?bib:bib*2+e]||"•"; }
        ev.push(base);
      }
      t+=beat; abs++;
    }
  });
  ev.push({type:"end",t:t}); ev.sort(function(a,b){return a.t-b.t;}); return ev;
}
function hud(ev){
  var c=$("#hudChord"), a=$("#hudArrow"), b=$("#hudBeat"); if(!c) return;
  if(ev.countIn){ c.textContent="Count"; a.textContent="—"; b.textContent=ev.beat; return; }
  c.textContent=chordName(ev.chord); a.textContent=ev.label; b.textContent=ev.beat;
}
function highlight(i){ $$(".chord-box[data-ci]").forEach(function(x){ x.classList.toggle("active", +x.getAttribute("data-ci")===i); }); }
function later(when, fn){ var ms=Math.max(0,(when-ensureAudio().currentTime)*1000); play.timeouts.push(setTimeout(function(){ if(play.running) fn(); }, ms)); }
function stopPlay(){
  play.running=false; clearTimeout(play.timer); play.timeouts.forEach(clearTimeout); play.timeouts=[];
  var btn=$("#playToggle"); if(btn) btn.textContent="▶ Play along";
  highlight(-1); ["#hudChord","#hudArrow","#hudBeat"].forEach(function(s){ var e=$(s); if(e) e.textContent="—"; });
}
function startPlay(song){
  stopMetro(); stopPlay(); ensureAudio();
  play.song=song; play.running=true; play.events=buildEvents(song); play.cursor=0;
  var btn=$("#playToggle"); if(btn) btn.textContent="■ Stop";
  schedule(ensureAudio().currentTime+0.08);
}
function schedule(origin){
  if(!play.running) return;
  var ctx=ensureAudio(), song=play.song;
  while(play.cursor<play.events.length && play.events[play.cursor].t+origin < ctx.currentTime+0.12){
    var ev=play.events[play.cursor++], when=origin+ev.t;
    if(ev.type==="click"){ click(when, ev.accent); (function(e){ later(when,function(){ hud(e); }); })(ev); }
    else if(ev.type==="strum"||ev.type==="pluck"){
      if(ev.type==="strum") strumChord(song, ev.chord, when, ev.down, 0.9); else pluckChordStrings(song, ev.chord, ev.toks, when, 0.9);
      (function(e){ later(when,function(){ hud(e); highlight(e.gi); }); })(ev);
    } else if(ev.type==="end"){
      play.timer=setTimeout(function(){ if(!play.running) return; if(play.loop) startPlay(play.song); else stopPlay(); }, Math.max(0,(when-ctx.currentTime)*1000)+30);
      return;
    }
  }
  play.timer=setTimeout(function(){ schedule(origin); }, 25);
}
function setBpm(v, song){
  play.bpm=clamp(v,40,song.songTempo||160); metro.bpm=play.bpm;
  ["#playBpmRange","#bpmRange"].forEach(function(s){ var e=$(s); if(e) e.value=play.bpm; });
  ["#playBpmLabel","#bpmLabel"].forEach(function(s){ var e=$(s); if(e) e.textContent=play.bpm; });
}
function startMetro(){ ensureAudio(); metro.ticking=true; metro.beat=0; metro.next=audio.ctx.currentTime+0.05; $("#metroToggle").textContent="■ Stop"; metroLoop(); }
function metroLoop(){
  if(!metro.ticking) return; var ctx=audio.ctx, iv=60/metro.bpm;
  while(metro.next<ctx.currentTime+0.1){ click(metro.next, metro.beat%4===0); flash("#metroPulse"); metro.next+=iv; metro.beat++; }
  metro.timer=setTimeout(metroLoop,25);
}
function stopMetro(){ metro.ticking=false; clearTimeout(metro.timer); var b=$("#metroToggle"); if(b) b.textContent="▶ Start"; }
function flash(sel){ var e=$(sel); if(!e) return; e.classList.add("on"); setTimeout(function(){ e.classList.remove("on"); },80); }

function renderSong(song){
  document.title=song.title+" · Gitfiddle";
  var tune=tuningOf(song), ci=0, h=[];
  play.bpm=song.defaultBpm; metro.bpm=song.defaultBpm; play.pattern=(song.patterns||["downs"])[0];
  h.push(topNav(song));
  var secs=[["overview","Overview"],["listen","Listen"],["chords","Chords"],["playalong","Play-along"]];
  if(song.hardParts) secs.push(["hardparts","Hard parts"]);
  secs.push(["practice","Practice"],["tutorials","Tutorials"],["techniques","Techniques"]);
  h.push('<div class="secnav">'+secs.map(function(s){ return '<a href="#'+s[0]+'">'+s[1]+'</a>'; }).join("")+'</div>');
  h.push('<main>');
  if(location.protocol==="file:") h.push('<div class="banner"><b>Heads up:</b> YouTube usually won\'t play embedded videos on a page opened from a file (Error 153). Run <code>python3 -m http.server 8000</code> in the gitfiddle folder and open <code>http://localhost:8000/</code>.</div>');
  /* hero */
  h.push('<section class="blk hero" id="overview"><h1>'+esc(song.title)+'</h1><div class="meta">'+esc(song.artist)+(song.year?' · '+song.year:'')+' · Key: '+esc(song.key)+' · Capo: '+esc(song.capo)+' · Tuning: '+esc(tune.name)+' ('+esc(tune.notes)+')</div>'+
    '<div class="herotier">'+tierBadge(song,true)+'<div><div class="diffline"><span class="chip diff d'+song.difficulty+'">'+dots(song.difficulty)+' '+esc(diffLabel(song.difficulty))+'</span> <span class="reason">'+esc(song.diffReason||"")+'</span></div>'+
    '<div class="chips">'+techChips(song)+'</div><div class="chips detail"><span class="chip lstage">'+esc(song.stageLabel||"")+'</span>'+(song.tags||[]).map(function(t){return '<span class="chip">'+esc(t)+'</span>';}).join("")+'</div>'+
    '<details class="tierwhy"><summary>Why lesson tier '+lessonTier(song).tier+'?</summary>'+tierBreakdown(song)+'</details></div></div>'+
    (song.note?'<p>'+esc(song.note)+'</p>':'')+(song.tuningNote?'<p class="guess">🎛 '+esc(song.tuningNote)+'</p>':'')+(song.versionNote?'<p class="note">📀 '+esc(song.versionNote)+'</p>':'')+'</section>');
  /* listen */
  h.push('<section class="blk section" id="listen"><h2>Hear the original</h2><p class="note" style="margin:0 0 8px">Listen once for the rhythm before you play along.</p>'+liteYT({id:song.original.id,title:song.original.title,tag:song.original.label,tagClass:"orig"})+'</section>');
  /* chords + progression */
  h.push('<section class="blk" id="chords"><div class="cols twoone"><div class="section"><h2>Chord shapes'+(song.tuning&&song.tuning!=="standard"?' ('+esc(tune.notes)+')':'')+'</h2><div class="chord-row">'+song.chords.map(function(c){ return '<div class="chord-wrap">'+chordSVG(c)+'</div>'; }).join("")+'</div></div>');
  h.push('<div class="section"><h2>Progression</h2><div class="prog-lines">');
  song.progression.forEach(function(row){
    h.push('<div class="prog-line">'+row.chords.map(function(c,i){ return '<span class="chord-box" data-ci="'+(ci++)+'">'+esc(chordName(c))+'<small>'+row.beats[i]+' beats</small></span>'; }).join("")+(row.hook?'<div class="hook">'+esc(row.hook)+'</div>':'')+'</div>');
  });
  h.push('</div><p class="guess">'+esc(song.timingNote||"")+'</p></div></div></section>');
  /* play-along + strum */
  var pats=(song.patterns||["downs"]);
  h.push('<section class="blk" id="playalong"><div class="cols two"><div class="section"><h2>Play-along (synth guitar)</h2>'+
    '<div class="play-hud"><div><div class="lbl">Chord</div><div class="val" id="hudChord">—</div></div><div><div class="lbl">Stroke</div><div class="arrow" id="hudArrow">—</div></div><div><div class="lbl">Beat</div><div class="val" id="hudBeat">—</div></div></div>'+
    '<div class="controls"><button class="primary big" id="playToggle">▶ Play along</button><button id="patternToggle">Pattern: '+esc(PATTERNS[pats[0]].name)+'</button><button id="loopToggle" class="on">Loop: on</button></div>'+
    '<div class="bpm-row"><button id="playBpmDown">−</button><input type="range" id="playBpmRange" min="40" max="'+song.songTempo+'" value="'+song.defaultBpm+'"><button id="playBpmUp">+</button></div>'+
    '<div class="bpm-big"><span id="playBpmLabel">'+song.defaultBpm+'</span> BPM <span class="note">(original about '+song.songTempo+')</span></div>'+
    '<p class="note">4-beat count-in, then the chord you\'re on lights up. It plays the diagram voicings in '+esc(tune.name)+' tuning.</p></div>');
  h.push('<div class="section"><h2>Strum / picking patterns</h2>'+pats.map(function(k){ var p=PATTERNS[k]; return '<p class="note" style="margin-top:0"><b>'+esc(p.name)+'</b>: '+esc(p.showNote)+'</p><div class="strum">'+p.show.map(function(x){ return '<span class="strum-beat '+(x==="↑"?"up":x==="·"?"rest":"down")+'">'+esc(x)+'</span>'; }).join("")+'</div>'; }).join("")+
    '<h2 style="margin-top:14px">Tap-along</h2><div class="pulse" id="tapFlash"></div><button class="tap-big" id="tapBtn">Tap the beat</button><p class="note">Tap on every beat while the original plays, and feel the 1-2-3-4 before you fret anything.</p></div></div></section>');
  /* hard parts */
  if(song.hardParts){
    h.push('<section class="blk" id="hardparts"><h2 class="big">🔥 Hard parts</h2>'+(song.hardParts.intro?'<p class="note" style="margin-top:-4px">'+esc(song.hardParts.intro)+'</p>':'')+
      '<details class="howto"><summary>How the looper works</summary><p>Each card starts on the teacher\'s explanation and <b>loops it</b>. Slow it down, zoom in on the hand you need, and turn on <b>Ladder</b> to speed it up a little each loop. Everything you change is saved in this browser.</p>'+
      '<p>Shortcuts for the highlighted card: <kbd>Space</kbd> play/pause · <kbd>[</kbd> <kbd>]</kbd> slower/faster · <kbd>L</kbd> loop · <kbd>A</kbd>/<kbd>B</kbd> set loop start/end · <kbd>Z</kbd> zoom · <kbd>M</kbd> mirror · <kbd>F</kbd> full screen · <kbd>←</kbd>/<kbd>→</kbd> ±2s · <kbd>R</kbd> back to A</p>'+
      '<p>When you\'re zoomed in, drag the video to move the view. The YouTube controls are hidden so the zoom stays clean.</p></details>'+
      '<div class="jump" id="hpJump" style="display:flex;gap:6px;flex-wrap:wrap;margin:0 0 12px"></div><div id="hpCards"></div></section>');
  }
  /* practice tools */
  h.push('<section class="blk" id="practice"><div class="cols two"><div class="section"><h2>1-minute chord changes</h2>'+
    '<div class="controls"><label for="pairSelect">Pair</label><select id="pairSelect">'+song.drillPairs.map(function(p,i){ return '<option value="'+i+'">'+esc(chordName(p[0]))+' ↔ '+esc(chordName(p[1]))+'</option>'; }).join("")+'</select></div>'+
    '<div id="timerDisplay" class="timer-display">1:00</div><div class="controls"><button class="primary" id="drillStart">Start 60s</button><button id="drillReset">Reset</button></div>'+
    '<div id="drillResult" style="display:none"><div class="controls"><label for="changeCount">Clean changes</label><input type="number" id="changeCount" min="0" max="999" value="0" style="width:5rem"><button class="primary" id="saveDrill">Save</button></div></div>'+
    '<h2 style="margin-top:12px">Progress</h2><ul class="progress-list" id="progressList"></ul></div>'+
    '<div class="section"><h2>Metronome</h2><div class="pulse" id="metroPulse"></div><div class="bpm-big"><span id="bpmLabel">'+song.defaultBpm+'</span> BPM</div>'+
    '<div class="bpm-row"><button id="bpmDown">−</button><input type="range" id="bpmRange" min="40" max="'+song.songTempo+'" value="'+song.defaultBpm+'"><button id="bpmUp">+</button></div>'+
    '<div class="controls" style="justify-content:center"><button class="primary" id="metroToggle">▶ Start</button></div><p class="note">Click track only. Use the play-along when you want to hear the chords.</p></div></div></section>');
  /* tutorials + techniques */
  h.push('<section class="blk section" id="tutorials"><h2>Tutorials</h2><div class="yt-list">'+song.tutorials.map(liteYT).join("")+'</div></section>');
  h.push('<section class="blk section" id="techniques"><h2>Techniques</h2>'+song.techniques.map(function(t){ return '<div class="tech-block"><h3>'+esc(t.name)+'</h3><p class="where">'+esc(t.where)+'</p><div class="yt-list">'+t.videos.map(function(v){ return liteYT({id:v.id,title:v.title,tag:"Technique lesson",tagClass:"tech"}); }).join("")+'</div></div>'; }).join("")+'</section>');
  h.push('</main><footer class="tiny">Videos belong to their creators and play through YouTube\'s official player. Loop times came from each lesson\'s chapters and captions (±2s). Anything marked "approx — adjust" is a guess. Tab excerpts are short practice passages, and each card notes where its tab came from.</footer>');
  $("#app").innerHTML=h.join("");
  wireSong(song);
  if(song.hardParts) buildHardParts(song);
  if(location.hash){ var t=document.getElementById(location.hash.slice(1)); if(t) setTimeout(function(){ t.scrollIntoView(); },50); }
}

function wireSong(song){
  var pats=song.patterns||["downs"];
  $("#playToggle").onclick=function(){ if(play.running) stopPlay(); else startPlay(song); };
  $("#patternToggle").onclick=function(){ var i=(pats.indexOf(play.pattern)+1)%pats.length; play.pattern=pats[i]; this.textContent="Pattern: "+PATTERNS[play.pattern].name; if(play.running) startPlay(song); };
  $("#loopToggle").onclick=function(){ play.loop=!play.loop; this.textContent="Loop: "+(play.loop?"on":"off"); this.classList.toggle("on",play.loop); };
  $("#playBpmRange").oninput=function(e){ setBpm(+e.target.value,song); if(play.running) startPlay(song); };
  $("#playBpmDown").onclick=function(){ setBpm(play.bpm-2,song); if(play.running) startPlay(song); };
  $("#playBpmUp").onclick=function(){ setBpm(play.bpm+2,song); if(play.running) startPlay(song); };
  $("#tapBtn").onclick=function(){ var c=ensureAudio(); click(c.currentTime+0.01,true); flash("#tapFlash"); };
  $("#bpmRange").oninput=function(e){ setBpm(+e.target.value,song); };
  $("#bpmDown").onclick=function(){ setBpm(play.bpm-2,song); };
  $("#bpmUp").onclick=function(){ setBpm(play.bpm+2,song); };
  $("#metroToggle").onclick=function(){ if(metro.ticking) stopMetro(); else { stopPlay(); startMetro(); } };
  $("#drillStart").onclick=function(){ startDrill(song); };
  $("#drillReset").onclick=function(){ stopDrill(true); };
  $("#saveDrill").onclick=function(){ saveDrill(song); };
  renderProgress(song);
}
function renderProgress(song){
  var list=$("#progressList"), e=historyFor(song.id);
  list.innerHTML = e.length ? e.slice(0,12).map(function(x){ return '<li><span><b>'+esc(x.pair)+'</b> <span class="date">'+esc(x.date)+'</span></span><span class="count">'+x.count+'</span></li>'; }).join("") : '<li class="empty">No drills saved yet. Finish a 60-second run and log how many clean changes you made.</li>';
}
function startDrill(song){
  if(drill.running) return;
  var sel=$("#pairSelect"), d=$("#timerDisplay"); drill.pair=song.drillPairs[+sel.value]; drill.running=true; drill.left=60;
  $("#drillResult").style.display="none"; d.className="timer-display running"; d.textContent="1:00"; $("#drillStart").disabled=true; sel.disabled=true;
  drill.timer=setInterval(function(){
    drill.left--; d.textContent=Math.floor(drill.left/60)+":"+String(Math.max(0,drill.left)%60).padStart(2,"0");
    if(drill.left<=0){ clearInterval(drill.timer); drill.running=false; d.className="timer-display done"; d.textContent="0:00"; beep(1320);
      $("#drillResult").style.display="block"; $("#changeCount").value="0"; $("#changeCount").focus(); $("#drillStart").disabled=false; sel.disabled=false; }
  },1000);
}
function stopDrill(reset){
  clearInterval(drill.timer); drill.running=false; drill.left=60;
  var d=$("#timerDisplay"); if(d&&reset){ d.className="timer-display"; d.textContent="1:00"; }
  var r=$("#drillResult"); if(r) r.style.display="none"; var b=$("#drillStart"); if(b) b.disabled=false; var s=$("#pairSelect"); if(s) s.disabled=false;
}
function saveDrill(song){
  var n=parseInt($("#changeCount").value,10); if(isNaN(n)||n<0) n=0;
  var pair=drill.pair||song.drillPairs[+$("#pairSelect").value];
  addHistory({ songId:song.id, pair:chordName(pair[0])+" ↔ "+chordName(pair[1]), count:n, date:todayISO(), ts:Date.now() });
  renderProgress(song); stopDrill(true);
}

/* ================= HARD PARTS LOOPER ================= */
var ytResolve, ytReady=new Promise(function(r){ ytResolve=r; });
var prevYT=window.onYouTubeIframeAPIReady;
window.onYouTubeIframeAPIReady=function(){ if(prevYT) try{prevYT();}catch(e){} ytResolve(); };
if(window.YT && window.YT.Player) ytResolve();
var cards=[], activeCard=null;
function setActive(c){ if(activeCard===c) return; if(activeCard) activeCard.root.classList.remove("active"); activeCard=c; c.root.classList.add("active"); }
var DEFAULT_ZOOM={ fret:{s:2,x:.72,y:.5}, pick:{s:2,x:.25,y:.6} };
function vinfo(id){ return VIDEOS[id] || { teacher:"Lesson", title:id, zoom:DEFAULT_ZOOM }; }

function Card(part, idx, cfg){
  this.part=part; this.idx=idx; this.cfg=cfg; this.clipIdx=0; this.player=null; this.ready=false; this.inGap=false; this.loops=0; this.gapTimer=null;
  var sel=this.load("clipSel."+part.id); if(sel!=null && part.clips[sel]) this.clipIdx=sel;
  this.build(); this.selectClip(this.clipIdx,false);
}
Card.prototype.load=function(k){ return lsGet(this.cfg.storagePrefix+k); };
Card.prototype.save=function(k,v){ lsSet(this.cfg.storagePrefix+k, v); };
Card.prototype.key=function(){ var c=this.part.clips[this.clipIdx]; return this.part.id+"."+this.clipIdx+"."+c.v; };
Card.prototype.defaults=function(){
  var c=this.part.clips[this.clipIdx], z=(vinfo(c.v).zoom||DEFAULT_ZOOM);
  return { a:c.a, b:c.b, rate:0.75, loop:true, gap:2, beep:true, mirror:false, ladder:{on:false,start:0.5,target:1,step:0.1},
    zoom:{ mode:"full", fret:Object.assign({},z.fret), pick:Object.assign({},z.pick) } };
};
Card.prototype.loadState=function(){
  var d=this.defaults(), s=this.load(this.key());
  if(!s){ this.s=d; return; }
  var sz=s.zoom||{};
  this.s=Object.assign({},d,s,{ ladder:Object.assign({},d.ladder,s.ladder||{}), zoom:Object.assign({},d.zoom,sz,{ fret:Object.assign({},d.zoom.fret,sz.fret||{}), pick:Object.assign({},d.zoom.pick,sz.pick||{}) }) });
};
Card.prototype.persist=function(){ this.save(this.key(), this.s); };
Card.prototype.q=function(s){ return this.root.querySelector(s); };
Card.prototype.build=function(){
  var p=this.part, self=this, r=this.root=document.createElement("section");
  r.className="card"; r.id="part-"+p.id;
  r.innerHTML='<h3><span class="num">'+(this.idx+1)+'</span>'+esc(p.name)+' <span class="diffdots" title="difficulty">'+dots(p.diff)+'</span></h3>'+
   '<p class="why"><b>Why it\'s hard</b>'+esc(p.why)+'</p><p class="tip"><b>Tip</b>'+esc(p.tip)+'</p><div class="teachers"></div>'+
   '<div class="grid"><div class="vidCol"><div class="stageWrap"><div class="stage"><div class="zoomer"><div class="facade"><div class="play"></div><div class="cap"></div></div></div></div>'+
   '<div class="panLayer" title="Drag to move the view · tap to play/pause"></div><div class="overlay"><span></span></div><div class="hud"><span class="hRate"></span><span class="hLoop"></span></div>'+
   '<div class="err"><div><div class="errMsg"></div><p><a class="ytLink" target="_blank" rel="noopener">Open on YouTube at this spot ↗</a></p></div></div></div>'+
   '<div class="bar"><div class="range"></div><div class="head"></div><span class="lab lA"></span><span class="lab lB"></span></div>'+
   '<div class="row"><button class="big primary bPlay">▶ Play</button><button class="bRestart" title="Back to loop start (R)">⏮ A</button><button class="bLoop" title="Loop on/off (L)">🔁 Loop</button><span class="time tNow">0:00</span><span class="badge tBadge"></span></div>'+
   '<div class="row"><span class="lbl">Speed</span><button class="sm sp" data-r="0.25">0.25</button><button class="sm sp" data-r="0.5">0.5</button><button class="sm sp" data-r="0.75">0.75</button><button class="sm sp" data-r="1">1×</button><button class="sm bSlower" title="Slower ([)">−</button><button class="sm bFaster" title="Faster (])">+</button></div>'+
   '<div class="row"><span class="lbl">Ladder</span><button class="sm bLadder" title="Speeds up by the step each loop until it reaches the target">🪜 Slow → fast</button><label class="time">from <select class="lStart"></select></label><label class="time">to <select class="lTarget"></select></label><label class="time">step <select class="lStep"><option value="0.05">+0.05</option><option value="0.1">+0.1</option><option value="0.25">+0.25</option></select></label></div>'+
   '<div class="row"><span class="lbl">Loop</span><span class="abBox"><span class="k">A</span><button class="sm" data-ab="a" data-d="-1">−1s</button><span class="v vA"></span><button class="sm" data-ab="a" data-d="1">+1s</button><button class="sm" data-set="a" title="Set A to now (A)">now</button></span>'+
   '<span class="abBox"><span class="k">B</span><button class="sm" data-ab="b" data-d="-1">−1s</button><span class="v vB"></span><button class="sm" data-ab="b" data-d="1">+1s</button><button class="sm" data-set="b" title="Set B to now (B)">now</button></span></div>'+
   '<div class="row"><span class="lbl">Gap</span><label class="time">pause between loops <select class="gap"><option value="0">none</option><option value="1">1s</option><option value="2">2s</option><option value="3">3s</option><option value="4">4s</option></select></label><button class="sm bBeep" title="Count-in clicks during the gap">🔔 Count-in</button></div>'+
   '<div class="row"><span class="lbl">Zoom</span><button class="sm zm" data-z="full">Full</button><button class="sm zm" data-z="fret">✋ Fret hand</button><button class="sm zm" data-z="pick">🎸 Pick hand</button><button class="sm bMirror" title="Mirror (M)">⇋ Mirror</button><button class="sm bFs" title="Full screen (F)">⛶ Full screen</button></div>'+
   '<div class="row zoomTune"><span class="lbl">Adjust</span><button class="sm" data-zs="-0.2">−</button><input type="range" class="zRange" min="1" max="4" step="0.05"><button class="sm" data-zs="0.2">＋</button><button class="sm" data-pan="-1,0">←</button><button class="sm" data-pan="0,-1">↑</button><button class="sm" data-pan="0,1">↓</button><button class="sm" data-pan="1,0">→</button><button class="sm bZReset">reset</button></div>'+
   '<div class="status"></div><details class="more"><summary>Clip info / reset</summary><p class="time cInfo"></p><button class="sm bResetAll">Reset this clip to the default loop</button></details></div>'+
   '<aside class="tabPanel"><h4>'+esc(p.tabTitle||"Tab")+'</h4><pre>'+esc(p.tab||"")+'</pre><div class="legend">h = hammer-on · p = pull-off · x = muted / don\'t play</div><ul>'+(p.notes||[]).map(function(n){ return "<li>"+n+"</li>"; }).join("")+'</ul><div class="src">'+(this.cfg.tabSource||"")+'</div></aside></div>';
  var tw=this.q(".teachers");
  p.clips.forEach(function(c,i){ var b=document.createElement("button"); b.className="sm"; b.textContent=c.label||vinfo(c.v).teacher; b.onclick=function(){ self.selectClip(i,true); }; tw.appendChild(b); });
  var rates=[0.25,0.3,0.4,0.5,0.6,0.7,0.75,0.8,0.9,1,1.25,1.5];
  [this.q(".lStart"),this.q(".lTarget")].forEach(function(sel){ rates.forEach(function(v){ var o=document.createElement("option"); o.value=v; o.textContent=v+"x"; sel.appendChild(o); }); });
  r.addEventListener("pointerdown",function(){ setActive(self); }); r.addEventListener("focusin",function(){ setActive(self); });
  this.q(".facade").onclick=function(){ self.wantPlay=true; self.createPlayer(); };
  this.q(".bPlay").onclick=function(){ self.togglePlay(); };
  this.q(".bRestart").onclick=function(){ self.toA(true); };
  this.q(".bLoop").onclick=function(){ self.s.loop=!self.s.loop; self.persist(); self.refresh(); };
  $$(".sp",r).forEach(function(b){ b.onclick=function(){ self.stopLadder(); self.setRate(+b.getAttribute("data-r")); }; });
  this.q(".bSlower").onclick=function(){ self.stepRate(-1); }; this.q(".bFaster").onclick=function(){ self.stepRate(1); };
  this.q(".bLadder").onclick=function(){ self.toggleLadder(); };
  this.q(".lStart").onchange=function(e){ self.s.ladder.start=+e.target.value; self.persist(); };
  this.q(".lTarget").onchange=function(e){ self.s.ladder.target=+e.target.value; self.persist(); };
  this.q(".lStep").onchange=function(e){ self.s.ladder.step=+e.target.value; self.persist(); };
  $$("[data-ab]",r).forEach(function(b){ b.onclick=function(){ self.nudgeAB(b.getAttribute("data-ab"), +b.getAttribute("data-d")); }; });
  $$("[data-set]",r).forEach(function(b){ b.onclick=function(){ self.setABNow(b.getAttribute("data-set")); }; });
  this.q(".gap").onchange=function(e){ self.s.gap=+e.target.value; self.persist(); };
  this.q(".bBeep").onclick=function(){ self.s.beep=!self.s.beep; self.persist(); self.refresh(); };
  $$(".zm",r).forEach(function(b){ b.onclick=function(){ self.s.zoom.mode=b.getAttribute("data-z"); self.persist(); self.applyZoom(); self.refresh(); }; });
  this.q(".bMirror").onclick=function(){ self.toggleMirror(); };
  var fsOk=!!(document.fullscreenEnabled||document.webkitFullscreenEnabled); if(!fsOk) this.q(".bFs").style.display="none";
  this.q(".bFs").onclick=function(){ self.toggleFs(); };
  $$("[data-zs]",r).forEach(function(b){ b.onclick=function(){ self.adjustZoom(+b.getAttribute("data-zs"),0,0); }; });
  this.q(".zRange").oninput=function(e){ var z=self.curPreset(); if(!z) return; z.s=+e.target.value; self.persist(); self.applyZoom(); };
  $$("[data-pan]",r).forEach(function(b){ b.onclick=function(){ var d=b.getAttribute("data-pan").split(",").map(Number); self.adjustZoom(0,d[0]*0.03,d[1]*0.03); }; });
  this.q(".bZReset").onclick=function(){ var m=self.s.zoom.mode; if(m==="full") return; self.s.zoom[m]=Object.assign({},(vinfo(self.part.clips[self.clipIdx].v).zoom||DEFAULT_ZOOM)[m]); self.persist(); self.applyZoom(); self.refresh(); };
  this.q(".bResetAll").onclick=function(){ try{ localStorage.removeItem(self.cfg.storagePrefix+self.key()); }catch(e){} self.loadState(); self.applyZoom(); self.refresh(); if(self.ready){ self.player.setPlaybackRate(self.s.rate); self.toA(false); } };
  this.setupBar(); this.setupPan();
};
Card.prototype.toggleMirror=function(){ this.s.mirror=!this.s.mirror; this.persist(); this.applyZoom(); this.refresh(); };
Card.prototype.toggleFs=function(){ var w=this.q(".stageWrap"), cur=document.fullscreenElement||document.webkitFullscreenElement;
  if(cur) (document.exitFullscreen||document.webkitExitFullscreen).call(document); else (w.requestFullscreen||w.webkitRequestFullscreen).call(w); };
Card.prototype.selectClip=function(i, user){
  this.clipIdx=i; this.save("clipSel."+this.part.id, i); this.destroyPlayer(); this.loadState(); this.loops=0;
  var c=this.part.clips[i], v=vinfo(c.v);
  $$(".teachers button",this.root).forEach(function(b,j){ b.classList.toggle("on", j===i); });
  this.q(".facade").style.backgroundImage="url(https://i.ytimg.com/vi/"+c.v+"/hqdefault.jpg)";
  this.q(".cap").textContent=v.teacher+" · loop "+fmt(this.s.a)+"–"+fmt(this.s.b);
  this.q(".cInfo").innerHTML="<b>"+esc(v.title)+"</b> by "+esc(v.teacher)+"<br>"+esc(c.note)+"<br>Default loop "+fmt(c.a)+"–"+fmt(c.b)+" · "+(c.t==="captions"?"timed from the lesson's YouTube captions/chapters (±2s)":"approximate, so adjust it with the A/B buttons")+'<br><a href="https://www.youtube.com/watch?v='+c.v+"&t="+c.a+'s" target="_blank" rel="noopener">Open on YouTube ↗</a>';
  var b=this.q(".tBadge"); b.className="badge tBadge "+(c.t==="captions"?"cap":"approx"); b.textContent=c.t==="captions"?"⏱ timed from captions":"approx — adjust";
  this.applyZoom(); this.refresh();
  if(user){ this.wantPlay=true; this.createPlayer(); }
};
Card.prototype.destroyPlayer=function(){
  this.cancelGap(); if(this.player){ try{ this.player.destroy(); }catch(e){} this.player=null; }
  this.ready=false; $$("iframe",this.q(".zoomer")).forEach(function(n){ n.remove(); });
  this.q(".facade").style.display=""; this.q(".err").classList.remove("on");
};
Card.prototype.createPlayer=function(){
  if(this.player) return; var self=this; setActive(this);
  this.q(".facade").style.display="none"; this.status("Loading video…");
  this.player={ pending:true, destroy:function(){} };
  ytReady.then(function(){
    if(!self.player || !self.player.pending) return;
    var c=self.part.clips[self.clipIdx], ifr=document.createElement("iframe");
    var origin=location.protocol.indexOf("http")===0 ? "&origin="+encodeURIComponent(location.origin) : "";
    ifr.src="https://www.youtube.com/embed/"+c.v+"?enablejsapi=1&playsinline=1&controls=0&disablekb=1&fs=0&rel=0&modestbranding=1&iv_load_policy=3&start="+Math.floor(self.s.a)+origin;
    ifr.setAttribute("allow","autoplay; encrypted-media; picture-in-picture; fullscreen; compute-pressure");
    ifr.setAttribute("referrerpolicy","strict-origin-when-cross-origin"); ifr.title=vinfo(c.v).title;
    self.q(".zoomer").appendChild(ifr);
    self.player=new YT.Player(ifr,{ events:{
      onReady:function(){ self.ready=true; self.player.setPlaybackRate(self.s.rate); self.player.seekTo(self.s.a,true); if(self.wantPlay){ self.pauseOthers(); self.player.playVideo(); } self.status(""); self.refresh(); },
      onStateChange:function(e){ if(e.data===1) self.pauseOthers(); self.refresh(); },
      onPlaybackRateChange:function(){ self.refresh(); },
      onError:function(e){ var m={2:"Invalid video id.",5:"This video can't play in the HTML5 player.",100:"The video was removed or made private.",101:"The owner doesn't allow embedding.",150:"The owner doesn't allow embedding.",153:"YouTube needs the page served over http(s) (Error 153). Open it from http://localhost or a website."}[e.data]||("Player error "+e.data);
        self.q(".errMsg").textContent=m; self.q(".ytLink").href="https://www.youtube.com/watch?v="+c.v+"&t="+Math.floor(self.s.a)+"s"; self.q(".err").classList.add("on"); }
    }});
  });
};
Card.prototype.pauseOthers=function(){ var self=this; cards.forEach(function(c){ if(c!==self && c.playing()) c.player.pauseVideo(); }); stopPlay(); stopMetro(); };
Card.prototype.status=function(t){ this.q(".status").textContent=t; };
Card.prototype.now=function(){ return (this.ready && this.player.getCurrentTime) ? this.player.getCurrentTime() : this.s.a; };
Card.prototype.playing=function(){ return this.ready && this.player.getPlayerState && this.player.getPlayerState()===1; };
Card.prototype.togglePlay=function(){
  setActive(this);
  if(!this.player){ this.wantPlay=true; this.createPlayer(); return; }
  if(!this.ready) return;
  if(this.inGap){ this.cancelGap(); this.player.playVideo(); return; }
  if(this.playing()) this.player.pauseVideo();
  else { var t=this.now(); if(this.s.loop && (t<this.s.a-0.5 || t>=this.s.b-0.1)) this.player.seekTo(this.s.a,true); this.player.playVideo(); }
};
Card.prototype.toA=function(play){ if(!this.ready){ this.wantPlay=!!play; this.createPlayer(); return; } this.cancelGap(); this.player.seekTo(this.s.a,true); if(play) this.player.playVideo(); this.refresh(); };
Card.prototype.cancelGap=function(){ clearTimeout(this.gapTimer); this.inGap=false; var o=this.q(".overlay"); if(o) o.classList.remove("on"); };
Card.prototype.setRate=function(r, quiet){
  var self=this; r=clamp(r2(r),0.25,2); this.s.rate=r; this.persist();
  if(this.ready){ this.player.setPlaybackRate(r);
    setTimeout(function(){ if(!self.ready) return; var got=self.player.getPlaybackRate(); if(Math.abs(got-r)>0.01 && !quiet) self.status("YouTube rounded "+r+"x to "+got+"x (this video only allows certain speeds)"); else if(!quiet) self.status(""); self.refresh(); },350); }
  this.refresh();
};
Card.prototype.availRates=function(){ try{ var a=this.player.getAvailablePlaybackRates(); if(a&&a.length) return a; }catch(e){} return [0.25,0.5,0.75,1,1.25,1.5,1.75,2]; };
Card.prototype.stepRate=function(dir){
  this.stopLadder(); var cur=this.ready?this.player.getPlaybackRate():this.s.rate, av=this.availRates(), next;
  if(av.length>8) next=cur+dir*0.05;
  else { var c=av.filter(function(v){ return dir>0? v>cur+0.001 : v<cur-0.001; }); next=c.length?(dir>0?Math.min.apply(null,c):Math.max.apply(null,c)):cur; }
  this.setRate(next);
};
Card.prototype.ladderNext=function(){
  var L=this.s.ladder, cur=this.ready?this.player.getPlaybackRate():this.s.rate;
  if(cur>=L.target-0.001) return cur;
  var want=Math.min(L.target, r2(cur+L.step)), av=this.availRates();
  if(av.length<=8 && !av.some(function(v){ return Math.abs(v-want)<0.001; })){ var c=av.filter(function(v){ return v>cur+0.001 && v<=L.target+0.001; }); want=c.length?Math.min.apply(null,c):cur; }
  return want;
};
Card.prototype.toggleLadder=function(){
  var L=this.s.ladder; L.on=!L.on;
  if(L.on){ if(L.target<=L.start) L.target=Math.min(1.5,r2(L.start+0.5)); this.s.loop=true; this.loops=0; this.setRate(L.start,true); this.toA(true); this.status("Ladder: "+L.start+"x → "+L.target+"x, +"+L.step+" each loop"); }
  else this.status("");
  this.persist(); this.refresh();
};
Card.prototype.stopLadder=function(){ if(this.s.ladder.on){ this.s.ladder.on=false; this.persist(); this.refresh(); } };
Card.prototype.nudgeAB=function(w,d){
  var dur=this.ready&&this.player.getDuration?this.player.getDuration():99999;
  if(w==="a") this.s.a=clamp(r2(this.s.a+d),0,this.s.b-1); else this.s.b=clamp(r2(this.s.b+d),this.s.a+1,dur||99999);
  this.persist(); this.refresh(); if(w==="a" && this.ready && !this.playing()) this.player.seekTo(this.s.a,true);
};
Card.prototype.setABNow=function(w){
  if(!this.ready){ this.status("Start the video first"); return; }
  var t=r2(this.now()); if(w==="a") this.s.a=Math.min(t,this.s.b-1); else this.s.b=Math.max(t,this.s.a+1);
  this.persist(); this.refresh(); this.status(w.toUpperCase()+" set to "+fmt(t));
};
Card.prototype.tick=function(){
  if(!this.ready) return; var t=this.now();
  this.q(".tNow").textContent=fmt(t)+" / loop "+fmt(this.s.a)+"–"+fmt(this.s.b); this.drawBar(t);
  if(this.s.loop && this.playing() && !this.inGap && t>=this.s.b) this.loopEnd();
};
Card.prototype.loopEnd=function(){
  var self=this; this.loops++; var msg="Loop "+this.loops;
  if(this.s.ladder.on){ var nr=this.ladderNext(); if(nr!==this.s.rate) this.setRate(nr,true); msg+=" · "+r2(nr)+"x → "+this.s.ladder.target+"x"; if(nr>=this.s.ladder.target-0.001) msg+=" ✓ at target"; }
  this.status(msg);
  if(this.s.gap>0){
    this.inGap=true; this.player.pauseVideo(); this.player.seekTo(this.s.a,true);
    var ov=this.q(".overlay"), sp=ov.querySelector("span"), n=this.s.gap; ov.classList.add("on");
    var step=function(){ if(!self.inGap) return; if(n<=0){ ov.classList.remove("on"); self.inGap=false; self.player.playVideo(); return; }
      sp.textContent=n; if(self.s.beep) beep(n===1?1320:880); n--; self.gapTimer=setTimeout(step,1000); };
    step(); this.refresh();
  } else this.player.seekTo(this.s.a,true);
};
Card.prototype.setupBar=function(){
  var self=this, bar=this.q(".bar");
  var seek=function(e){ if(!self.ready) return; var r=bar.getBoundingClientRect(), rg=self.barRange(); self.cancelGap(); self.player.seekTo(rg[0]+(rg[1]-rg[0])*clamp((e.clientX-r.left)/r.width,0,1),true); };
  bar.addEventListener("pointerdown",function(e){ bar.setPointerCapture(e.pointerId); seek(e); bar._d=true; });
  bar.addEventListener("pointermove",function(e){ if(bar._d) seek(e); });
  bar.addEventListener("pointerup",function(){ bar._d=false; });
};
Card.prototype.barRange=function(){ var pad=Math.max(5,(this.s.b-this.s.a)*0.15); return [Math.max(0,this.s.a-pad), this.s.b+pad]; };
Card.prototype.drawBar=function(t){
  var rg=this.barRange(), lo=rg[0], w=rg[1]-lo, P=function(v){ return clamp((v-lo)/w*100,0,100); };
  var range=this.q(".range"); range.style.left=P(this.s.a)+"%"; range.style.width=((this.s.b-this.s.a)/w*100)+"%";
  this.q(".head").style.left=P(t==null?this.s.a:t)+"%";
  var la=this.q(".lA"), lb=this.q(".lB"), narrow=(this.s.b-this.s.a)/w<0.35;
  la.textContent="A "+fmt(this.s.a); la.style.left="calc("+P(this.s.a)+"% + 4px)";
  lb.textContent=fmt(this.s.b)+" B"; lb.style.right="calc("+(100-P(this.s.b))+"% + 4px)";
  la.style.display=lb.style.display=narrow?"none":"";
};
Card.prototype.curPreset=function(){ var m=this.s.zoom.mode; return m==="full"?null:this.s.zoom[m]; };
Card.prototype.adjustZoom=function(ds,dx,dy){
  if(this.s.zoom.mode==="full") this.s.zoom.mode="fret";
  var z=this.curPreset(); z.s=clamp(r2(z.s+ds),1,4); z.x=clamp(z.x+(this.s.mirror?-dx:dx),0,1); z.y=clamp(z.y+dy,0,1);
  this.persist(); this.applyZoom(); this.refresh();
};
Card.prototype.applyZoom=function(){
  var z=this.curPreset(), zm=this.q(".zoomer");
  if(!z) zm.style.transform="";
  else { var S=z.s, tx=clamp((0.5-z.x*S)*100,(1-S)*100,0), ty=clamp((0.5-z.y*S)*100,(1-S)*100,0); zm.style.transform="translate("+tx+"%,"+ty+"%) scale("+S+")"; }
  this.q(".stage").classList.toggle("mirror",!!this.s.mirror);
  this.q(".panLayer").classList.toggle("on",!!z && !!this.player);
};
Card.prototype.setupPan=function(){
  var self=this, pl=this.q(".panLayer"), st=null;
  pl.addEventListener("pointerdown",function(e){ var z=self.curPreset(); if(!z) return; pl.setPointerCapture(e.pointerId); st={x:e.clientX,y:e.clientY,zx:z.x,zy:z.y,moved:false}; self.q(".zoomer").style.transition="none"; });
  pl.addEventListener("pointermove",function(e){ if(!st) return; var z=self.curPreset(), r=pl.getBoundingClientRect(), dx=(e.clientX-st.x)/(r.width*z.s), dy=(e.clientY-st.y)/(r.height*z.s);
    if(Math.abs(e.clientX-st.x)+Math.abs(e.clientY-st.y)>6) st.moved=true; if(self.s.mirror) dx=-dx; z.x=clamp(st.zx-dx,0,1); z.y=clamp(st.zy-dy,0,1); self.applyZoom(); });
  var end=function(){ if(!st) return; self.q(".zoomer").style.transition=""; if(!st.moved) self.togglePlay(); else self.persist(); st=null; };
  pl.addEventListener("pointerup",end); pl.addEventListener("pointercancel",end);
};
Card.prototype.refresh=function(){
  var s=this.s, q=this.q.bind(this), playing=this.playing(), actual=this.ready?this.player.getPlaybackRate():s.rate;
  q(".bPlay").textContent=this.inGap?"■ Skip gap":(playing?"❚❚ Pause":"▶ Play");
  q(".bLoop").classList.toggle("on",s.loop);
  $$(".sp",this.root).forEach(function(b){ b.classList.toggle("on", Math.abs(+b.getAttribute("data-r")-actual)<0.001); });
  q(".hRate").textContent=r2(actual)+"x"; q(".hLoop").textContent=s.loop?("loop "+fmt(s.a)+"–"+fmt(s.b)):"loop off";
  q(".bLadder").classList.toggle("on",s.ladder.on);
  q(".lStart").value=String(s.ladder.start); q(".lTarget").value=String(s.ladder.target); q(".lStep").value=String(s.ladder.step);
  q(".vA").textContent=fmt(s.a); q(".vB").textContent=fmt(s.b); q(".gap").value=String(s.gap);
  q(".bBeep").classList.toggle("on",s.beep);
  $$(".zm",this.root).forEach(function(b){ b.classList.toggle("on", b.getAttribute("data-z")===s.zoom.mode); });
  q(".bMirror").classList.toggle("on",s.mirror);
  var z=this.curPreset(); q(".zoomTune").style.opacity=z?1:0.45; if(z) q(".zRange").value=z.s;
  q(".panLayer").classList.toggle("on",!!z && !!this.player);
  this.drawBar(this.ready?this.now():null);
};

function buildHardParts(song){
  var cfg=song.hardParts, wrap=$("#hpCards"), jump=$("#hpJump");
  cfg.parts.forEach(function(p,i){
    var c=new Card(p,i,cfg); cards.push(c); wrap.appendChild(c.root);
    var a=document.createElement("a"); a.href="#part-"+p.id; a.className="chip"; a.textContent=(i+1)+". "+p.name.split(" (")[0]; jump.appendChild(a);
  });
  if(cards.length) setActive(cards[0]);
  setInterval(function(){ cards.forEach(function(c){ c.tick(); }); },50);
  document.addEventListener("keydown",function(e){
    if(e.target.closest && e.target.closest("input,select,textarea")) return;
    if(e.metaKey||e.ctrlKey||e.altKey) return;
    var c=activeCard; if(!c) return;
    var map={ " ":function(){ c.togglePlay(); }, "[":function(){ c.stepRate(-1); }, "]":function(){ c.stepRate(1); },
      "l":function(){ c.s.loop=!c.s.loop; c.persist(); c.refresh(); }, "a":function(){ c.setABNow("a"); }, "b":function(){ c.setABNow("b"); },
      "r":function(){ c.toA(true); }, "f":function(){ c.toggleFs(); }, "m":function(){ c.toggleMirror(); },
      "z":function(){ var o=["full","fret","pick"]; c.s.zoom.mode=o[(o.indexOf(c.s.zoom.mode)+1)%3]; c.persist(); c.applyZoom(); c.refresh(); },
      "ArrowLeft":function(){ if(c.ready){ c.cancelGap(); c.player.seekTo(Math.max(0,c.now()-2),true); } },
      "ArrowRight":function(){ if(c.ready){ c.cancelGap(); c.player.seekTo(c.now()+2,true); } } };
    var f=map[e.key.length===1?e.key.toLowerCase():e.key];
    if(f && !(e.key===" " && e.target.closest && e.target.closest("button,.lite"))){ e.preventDefault(); f(); }
  });
}

/* ---------------- boot ---------------- */
window.Gitfiddle={ songs:SONGS, cards:cards, play:play, buildEvents:buildEvents };
var sid=document.body.getAttribute("data-song");
if(!sid){ var m=location.search.match(/[?&]id=([^&]+)/); if(m) sid=decodeURIComponent(m[1]); }
if(document.body.getAttribute("data-page")==="home") renderHome();
else { var song=songById(sid); if(song && song.status==="ready") renderSong(song); else $("#app").innerHTML=topNav(null)+'<main class="narrow"><div class="hero"><h1>Song not found</h1><p><a href="'+ROOT+'index.html">Back to the setlist</a></p></div></main>'; }
})();
