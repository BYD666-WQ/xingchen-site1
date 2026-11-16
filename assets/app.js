(function(global){
  'use strict';
  var MAIN='BYD666-WQ/xingchen-caixun';
  var SITE='BYD666-WQ/xingchen-site1';
  var SOURCES=[
    function(p){return 'https://byd666-wq.github.io/xingchen-caixun/'+p+'?t='+Date.now()},
    function(p){return 'https://cdn.jsdelivr.net/gh/'+MAIN+'@main/'+p+'?t='+Date.now()},
    function(p){return 'https://raw.githubusercontent.com/'+MAIN+'/main/'+p+'?t='+Date.now()},
    function(p){return p+'?t='+Date.now()}
  ];
  var KEY='Xc9vF2026';
  function pad(n){return (n<10?'0':'')+n}
  function p2(n){return String(n).padStart(2,'0')}
  function short(issue){return String(issue==null?'':issue).slice(-3)}
  function asNum(v){v=String(v==null?'':v).trim();return /^\d+$/.test(v)?p2(parseInt(v,10)):v}
  function vfDec(enc){try{var bin=atob(String(enc||'')),arr=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i)^KEY.charCodeAt(i%KEY.length);return JSON.parse(new TextDecoder('utf-8').decode(arr))}catch(e){return null}}
  function mdCompat(md){if(md&&md.current&&md.current.issue!==undefined){var c=md.current;return {name:md.name,issue:c.issue,nums:c.nums||[],numsEnc:c.numsEnc,visibleFrom:c.visibleFrom,publishedAt:c.publishedAt||'',history:md.history||[],updated:md.updated,drawTime:md.drawTime,dailyTime:c.dailyTime||md.dailyTime}}return md||{}}
  function norm(arr){return (Array.isArray(arr)?arr:[]).map(function(x){return {c:asNum(x&&x.c),z:String((x&&x.z)||''),color:String((x&&x.color)||'')}}).filter(function(x){return x.c&&/^\d{2}$/.test(x.c)})}
  function isVisible(md,now){var p=Date.parse(md.publishedAt||''),v=Date.parse(md.visibleFrom||'');return (isFinite(p)&&p<=now)||(isFinite(v)&&v<=now)}
  function numClass(n){n=parseInt(n,10);var R=[1,2,7,8,12,13,18,19,23,24,29,30,34,35,40,45,46],B=[3,4,9,10,14,15,20,25,26,31,36,37,41,42,47,48];return R.indexOf(n)>=0?'red':(B.indexOf(n)>=0?'blue':'green')}
  function nextAt(hm,days,from){var a=String(hm||'21:34').split(':'),h=parseInt(a[0],10),m=parseInt(a[1],10),now=from||new Date();if(isNaN(h))h=21;if(isNaN(m))m=34;var d=new Date(now.getFullYear(),now.getMonth(),now.getDate(),h,m,0,0);for(var i=0;i<15;i++){var ds=(Array.isArray(days)&&days.length)?days:[0,1,2,3,4,5,6];if(d.getTime()>now.getTime()&&ds.indexOf(d.getDay())>=0)return d;d.setDate(d.getDate()+1)}return d}
  function fmtDate(d){var w=['日','一','二','三','四','五','六'];return (d.getMonth()+1)+'月'+d.getDate()+'日 星期'+w[d.getDay()]}
  function fmtTime(d){return pad(d.getHours())+':'+pad(d.getMinutes())}
  function dateKey(issue){return String(issue==null?'':issue)}
  function fetchOne(p){var i=0;function go(){if(i>=SOURCES.length)return Promise.reject(new Error('load fail '+p));var k=i++,u=SOURCES[k](p);var AC=(typeof AbortController!=='undefined')?new AbortController():null;var timer=AC?setTimeout(function(){try{AC.abort()}catch(e){}},4500):null;return fetch(u,{cache:'no-store',signal:AC?AC.signal:undefined}).then(function(r){if(timer)clearTimeout(timer);if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}).catch(function(e){if(timer)clearTimeout(timer);return go()})}return go()}
  function fetchOwn(p){var SS=['','https://cdn.jsdelivr.net/gh/'+SITE+'@main/','https://raw.githubusercontent.com/'+SITE+'/main/'];var i=0;function go(){if(i>=SS.length)return Promise.reject(new Error('own fail '+p));var k=i++,u=SS[k]+p+'?t='+Date.now();var AC=(typeof AbortController!=='undefined')?new AbortController():null;var timer=AC?setTimeout(function(){try{AC.abort()}catch(e){}},4500):null;return fetch(u,{cache:'no-store',signal:AC?AC.signal:undefined}).then(function(r){if(timer)clearTimeout(timer);if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}).catch(function(e){if(timer)clearTimeout(timer);return go()})}return go()}
  var OWN_BOARDS={};
  function load(){return Promise.all([
    fetchOne('data/draw.json').catch(function(){return {games:[]}}),
    fetchOne('data/manual-draw.json').catch(function(){return {}}),
    fetchOwn('data/site-data.json').catch(function(){return {sections:[]}}),
    fetchOne('data/site-config.json').catch(function(){return {}})
  ]).then(function(a){
    var own=a[2]||{sections:[]},by={};(own.sections||[]).forEach(function(s){by[s.id]=s});
    function sec(id){return (by[id]&&by[id].rows)||[]}
    own.by=by;
    var d={draw:a[0]||{},manualRaw:mdCompat(a[1]||{}),config:a[3]||{},siteData:own,pick:{rows:sec('pick')},ziliao:{rows:sec('ziliao')},poems:{rows:sec('poems')},numAttrs:{rows:sec('numAttrs')}};
    d.config.drawTimes=d.config.drawTimes||{newhk:{time:'21:34',days:[0,1,2,3,4,5,6]},newmo:{time:'21:30',days:[0,1,2,3,4,5,6]},hk:{time:'21:30',days:[0]}};
    OWN_BOARDS={};['liuxiao','shuangbo','danshuang','santou','qiwei','wuxiao'].forEach(function(id){OWN_BOARDS[id]={rows:sec(id)}});
    d.__boards=OWN_BOARDS;
    d.games=build(d);
    return d;
  })}
  var BOARD_FILES=['wuxiao','santou','shuangbo','danshuang','liuxiao','qiwei','sisha','pingte','danshuangsixiao'];
  function loadBoards(){return Promise.resolve(OWN_BOARDS||{})}
  function drawGame(draw,rule){return (draw.games||[]).filter(function(g){return g.rule===rule||(rule==='Macau'&&g.name==='新澳彩')||(rule==='HongKong'&&g.name==='香港彩')})[0]||null}
  function viewFromDraw(g,name,key,cfg,now){if(!g)return null;var nums=norm(g.nums),hist=(g.history||[]).slice().map(function(h){return {issue:h.issue,nums:norm(h.nums)}}).sort(function(a,b){return (parseInt(b.issue,10)||0)-(parseInt(a.issue,10)||0)});var cur=hist[0];if(!nums.length&&cur&&cur.nums&&cur.nums.length)nums=cur.nums;var display=cur||{issue:g.issue,nums:nums};var issue=parseInt(g.issue,10)||parseInt(display.issue,10)||0;if(!nums.length&&display&&display.nums)nums=norm(display.nums);var t=cfg.drawTimes[key]||{};var next=nextAt(t.time,t.days,now);return {key:key,name:name,issue:issue,currentIssue:issue,nums:nums.length?nums:norm(display.nums),history:hist,state:nums.length?'已开奖':'待开奖',nextTime:next,nextIssue:issue+1,drawTime:t.time}}
  function build(d){
    var now=new Date(),cfg=d.config,md=d.manualRaw;
    // 新港：manual-draw；到点后解密 numsEnc，未到点回退到 history[0]
    var hn=norm(md.nums),curIssue=parseInt(md.issue,10)||0,hist=(md.history||[]).slice().map(function(h){var a=norm(h.nums);if(!a.length&&h.numsEnc)try{a=norm(vfDec(h.numsEnc))}catch(e){}return {issue:h.issue,nums:a,visibleFrom:h.visibleFrom,publishedAt:h.publishedAt}}).sort(function(a,b){return (parseInt(b.issue,10)||0)-(parseInt(a.issue,10)||0)});
    if(!hn.length&&md.numsEnc){var _dec=null;try{_dec=norm(vfDec(md.numsEnc))}catch(e){}if(_dec&&_dec.length===7&&isVisible(md,now.getTime()))hn=_dec}
    var hkView={key:'newhk',name:'新港',issue:curIssue,currentIssue:curIssue,nums:hn,history:hist,state:hn.length?'已开奖':'待开奖',drawTime:(cfg.drawTimes.newhk||{}).time||'21:34'};
    if(!hkView.nums.length&&hist[0]){hkView.issue=parseInt(hist[0].issue,10)||curIssue;hkView.nums=norm(hist[0].nums);hkView.state='上期开奖'}
    var visible=Date.parse(md.visibleFrom||'');var nextSched=nextAt(hkView.drawTime,(cfg.drawTimes.newhk||{}).days,now);
    var _pending=!hn.length&&curIssue&&curIssue>parseInt(hkView.issue,10);
    hkView.pendingIssue=_pending?curIssue:null;
    hkView.nextIssue=_pending?curIssue:((parseInt(hkView.issue,10)||curIssue)+1);
    hkView.nextTime=(_pending&&isFinite(visible))?new Date(visible):nextSched;
    hkView.currentIssue=curIssue;
    var newmo=drawGame(d.draw,'Macau'),hk=drawGame(d.draw,'HongKong');
    return {newhk:hkView,newmo:viewFromDraw(newmo,'新澳','newmo',cfg,now),hk:viewFromDraw(hk,'香港','hk',cfg,now)};
  }
  function fmtIssue(v){return short(v)+'期'}
  function ballHtml(nums,opts){opts=opts||{};var a=(nums||[]).slice(0,7);return a.map(function(x,i){var cls=numClass(x.c);return '<div class="nc '+cls+(i===6?' gold':'')+'"><b>'+x.c+'</b><i>'+(x.z||'')+'</i></div>'}).join('')}
  function histLine(h){var nums=norm(h.nums),n=nums.map(function(x){return x.c}),sp=nums[6]||{};return '<span class="iss">'+short(h.issue)+'期:</span> <span class="balltxt">'+n.slice(0,6).join(' ')+'</span> <span class="plus">+</span> <span class="'+numClass(sp.c)+'">'+sp.c+'</span> <span class="tag">特 '+(sp.z||'')+'</span>'}
  global.XC={load:load,loadBoards:loadBoards,pad:pad,p2:p2,short:short,asNum:asNum,vfDec:vfDec,mdCompat:mdCompat,norm:norm,numClass:numClass,nextAt:nextAt,fmtDate:fmtDate,fmtTime:fmtTime,ballHtml:ballHtml,histLine:histLine,fmtIssue:fmtIssue,drawGame:drawGame};
})(window);