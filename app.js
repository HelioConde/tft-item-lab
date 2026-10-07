const RECENT_KEY = "tft-item-lab:recent:v1";
const LANGUAGE_KEY = "tft-item-lab:language";
const API_TIMEOUT_MS = 18000;
const VALID_PERIODS = new Set(["week","month","set"]);

const translations = {
  pt: {
    eyebrow:"TFT · ITEMIZAÇÃO PESSOAL",
    heroTitle:'Não é “qual item é melhor?”. <span>É “como eu realmente itemizo?”.</span>',
    heroText:"Use seu histórico recente para ver quais itens aparecem mais, em quais unidades você os colocou e como essas partidas terminaram.",
    riotId:"Riot ID",server:"Servidor",analyze:"Abrir meu Item Lab",
    privacy:"Consulta pública via backend gamer. Nenhuma chave Riot fica no navegador.",
    recent:"Buscas recentes",labLogic:"O QUE O LAB ORGANIZA",
    logic1:"Itens recorrentes",logic1Text:"O que aparece repetidamente na sua amostra.",
    logic2:"Unidades",logic2Text:"Em quais campeões cada item foi usado.",
    logic3:"Resultado",logic3Text:"Colocação média e Top 4 das partidas em que apareceu.",
    loadingTitle:"Consultando seu histórico TFT…",loadingText:"O backend pode completar a amostra em etapas.",
    analysis:"SEU LAB RECENTE",currentSet:"Set atual",games:"Partidas",gamesHelp:"no recorte",
    items:"Itens únicos",itemsHelp:"itens observados",mostUsed:"Mais usado",bestAvg:"Melhor média",
    bestAvgHelp:"mín. 2 partidas",library:"BIBLIOTECA",libraryTitle:"Itens do período",
    sortFreq:"Frequência",sortAvg:"Média",detailEyebrow:"DETALHE",selectItem:"Escolha um item",
    ad:"PUBLICIDADE",adNote:"espaço reservado · fora da análise principal",
    unitsEyebrow:"POR UNIDADE",unitsTitle:"Onde seus itens aparecem",methodEyebrow:"COMO LER",
    methodTitle:"Histórico pessoal não é recomendação universal.",
    methodText:"Um item pode aparecer em partidas boas porque combinou com aquela unidade, lobby, comp ou estágio. A média descreve a sua amostra e não prova causalidade.",
    riotDisclaimer:"Produto independente. Teamfight Tactics e Riot Games são marcas da Riot Games, Inc.",
    about:"Sobre",privacyLink:"Privacidade",terms:"Termos",
    invalid:"Use um Riot ID no formato Nome#TAG.",loading:"Consultando a Riot…",
    notFound:"Riot ID não encontrado. Confira nome, tag e servidor.",
    rate:"Limite temporário da Riot atingido. Tente novamente em instantes.",
    error:"Não foi possível consultar o histórico TFT agora.",
    live:"Dados Riot carregados.",stale:"Exibindo o último histórico real armazenado em cache.",
    empty:"Nenhum item disponível neste período. Algumas partidas podem não incluir detalhes de itens.",
    recentNone:"Nenhuma busca recente.",matches:"partidas com o item",occurrences:"cópias observadas",
    avg:"colocação média",top4:"Top 4",lastSeen:"Última partida",unitPartners:"Unidades que usaram",
    usage:"uso(s)",noUnits:"Nenhuma unidade identificada.",selectedPeriod:"partidas no período",
    sample:(games,withItems,unique)=>games+" partidas no período · "+withItems+" com itens · "+unique+" itens diferentes",
    numericNote:"ID de item retornado pela API. O nome não estava disponível na amostra.",
    validation:"Dados de itens podem estar incompletos em históricos antigos."
  },
  en: {
    eyebrow:"TFT · PERSONAL ITEMIZATION",
    heroTitle:'It is not “which item is best?”. <span>It is “how do I actually itemize?”.</span>',
    heroText:"Use your recent match history to see which items appear most, which units you equipped and how those games ended.",
    riotId:"Riot ID",server:"Server",analyze:"Open my Item Lab",
    privacy:"Public lookup through the gamer backend. No Riot key is exposed in the browser.",
    recent:"Recent searches",labLogic:"WHAT THE LAB ORGANIZES",
    logic1:"Recurring items",logic1Text:"What keeps appearing in your own sample.",
    logic2:"Units",logic2Text:"Which champions carried each item.",
    logic3:"Results",logic3Text:"Average placement and Top 4 of matches where it appeared.",
    loadingTitle:"Checking your TFT history…",loadingText:"The backend may complete the sample in stages.",
    analysis:"YOUR RECENT LAB",currentSet:"Current set",games:"Games",gamesHelp:"in the selected period",
    items:"Unique items",itemsHelp:"observed items",mostUsed:"Most used",bestAvg:"Best average",
    bestAvgHelp:"min. 2 games",library:"LIBRARY",libraryTitle:"Items in this period",
    sortFreq:"Frequency",sortAvg:"Average",detailEyebrow:"DETAIL",selectItem:"Choose an item",
    ad:"ADVERTISEMENT",adNote:"reserved space · outside the main analysis",
    unitsEyebrow:"BY UNIT",unitsTitle:"Where your items appear",methodEyebrow:"HOW TO READ",
    methodTitle:"Personal history is not a universal recommendation.",
    methodText:"An item may appear in successful games because it fits that unit, lobby, comp or stage. Average placement describes your sample and does not establish causality.",
    riotDisclaimer:"Independent product. Teamfight Tactics and Riot Games are trademarks of Riot Games, Inc.",
    about:"About",privacyLink:"Privacy",terms:"Terms",
    invalid:"Enter a Riot ID in Name#TAG format.",loading:"Checking Riot…",
    notFound:"Riot ID not found. Check name, tag and server.",
    rate:"Riot is temporarily rate-limiting requests. Try again shortly.",
    error:"Could not load TFT history right now.",
    live:"Riot data loaded.",stale:"Showing the most recent real history available in cache.",
    empty:"No item data is available in this period. Some matches may not contain item details.",
    recentNone:"No recent searches.",matches:"games with item",occurrences:"observed copies",
    avg:"average placement",top4:"Top 4",lastSeen:"Last game",unitPartners:"Units equipped",
    usage:"use(s)",noUnits:"No units identified.",selectedPeriod:"games in period",
    sample:(games,withItems,unique)=>games+" games in period · "+withItems+" with items · "+unique+" distinct items",
    numericNote:"Item ID returned by the API. A display name was not available in this sample.",
    validation:"Item details may be incomplete for older match histories."
  }
};

let lang = localStorage.getItem(LANGUAGE_KEY)==="en"?"en":"pt";
let liveMatches = [];
let currentPlayer = null;
let period = "month";
let sortMode = "count";
let selectedItem = "";
let report = {games:[],itemGames:0,items:[],units:[]};

const $ = (selector)=>document.querySelector(selector);
const t = (key)=>translations[lang][key] || key;
const escapeHtml = (value)=>String(value??"").replace(/[&<>"']/g,c=>({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
})[c]);

function parseRiotId(value){
  const raw=String(value||"").trim();
  const at=raw.lastIndexOf("#");
  if(at<=0)return null;
  const gameName=raw.slice(0,at).trim();
  const tagLine=raw.slice(at+1).trim();
  if(gameName.length<2||gameName.length>16||tagLine.length<2||tagLine.length>5)return null;
  return {gameName,tagLine};
}
function cleanName(raw,kind){
  let name=raw;
  if(raw&&typeof raw==="object"){
    name=raw.name||raw.displayName||raw.itemName||raw.item_name||raw.id||raw.itemId||raw.item_id||raw.characterId||raw.character_id;
  }
  if(name===null||name===undefined||String(name).trim()==="")return "";
  if(typeof name==="number"||/^\d+$/.test(String(name)))return (kind==="item"?"ID ":"#")+String(name);
  return String(name)
    .replace(/^.*[\\/]/,"")
    .replace(/^TFT\d*_Items?_/i,"")
    .replace(/^TFT_Items?_/i,"")
    .replace(/^TFT\d*_/i,"")
    .replace(/^TFT_/i,"")
    .replace(/_/g," ")
    .replace(/([a-z])([A-Z])/g,"$1 $2")
    .replace(/\s+/g," ").trim();
}
function normalizeItems(unit){
  // Riot match payloads may expose itemNames (preferred) or numeric item IDs.
  const raw = Array.isArray(unit.itemNames) && unit.itemNames.length ? unit.itemNames
    : Array.isArray(unit.item_names) && unit.item_names.length ? unit.item_names
    : Array.isArray(unit.items) && unit.items.length ? unit.items
    : Array.isArray(unit.itemIds) && unit.itemIds.length ? unit.itemIds
    : Array.isArray(unit.item_ids) ? unit.item_ids : [];
  return raw.map(item=>cleanName(item,"item")).filter(Boolean);
}
function normalizeUnits(match){
  const raw=Array.isArray(match.units)?match.units
    : Array.isArray(match.participant?.units)?match.participant.units:[];
  return raw.map(unit=>({
    name:cleanName(unit.characterId||unit.character_id||unit.name||unit.unitName||"","unit"),
    items:normalizeItems(unit)
  })).filter(unit=>unit.name||unit.items.length);
}
function validMatch(match){
  const placement=Number(match.placement);
  return match&&placement>=1&&placement<=8;
}
function periodMatches(){
  const matches=liveMatches.filter(validMatch).slice().sort((a,b)=>Number(b.playedAt||0)-Number(a.playedAt||0));
  if(period==="set"){
    const latestSet=matches.find(m=>Number(m.setNumber)>0);
    return latestSet?matches.filter(m=>Number(m.setNumber)===Number(latestSet.setNumber)):matches;
  }
  const days=period==="week"?7:30;
  const cutoff=Date.now()-days*86400000;
  return matches.filter(m=>Number(m.playedAt||0)>=cutoff);
}
function buildReport(matches){
  const itemMap=new Map();
  const unitMap=new Map();
  let withItems=0;
  matches.forEach((match,index)=>{
    const units=normalizeUnits(match);
    const equipped=units.some(u=>u.items.length);
    if(equipped)withItems++;
    const usedThisGame=new Map();
    units.forEach(unit=>{
      const unitName=unit.name||"—";
      let unitRow=unitMap.get(unitName);
      if(!unitRow){
        unitRow={name:unitName,copies:0,items:new Map(),games:new Set()};
        unitMap.set(unitName,unitRow);
      }
      if(unit.items.length)unitRow.games.add(index);
      unit.items.forEach(name=>{
        unitRow.copies++;
        unitRow.items.set(name,(unitRow.items.get(name)||0)+1);
        let instances=usedThisGame.get(name);
        if(!instances){instances=[];usedThisGame.set(name,instances);}
        instances.push(unitName);
      });
    });
    usedThisGame.forEach((unitNames,name)=>{
      let row=itemMap.get(name);
      if(!row){
        row={name,games:0,copies:0,placements:[],top4:0,lastSeen:0,units:new Map()};
        itemMap.set(name,row);
      }
      row.games++;
      row.copies+=unitNames.length;
      row.placements.push(Number(match.placement));
      if(Number(match.placement)<=4)row.top4++;
      row.lastSeen=Math.max(row.lastSeen,Number(match.playedAt||0));
      unitNames.forEach(unitName=>row.units.set(unitName,(row.units.get(unitName)||0)+1));
    });
  });
  const items=Array.from(itemMap.values()).map(row=>({
    ...row,
    avg:row.placements.reduce((a,b)=>a+b,0)/row.placements.length,
    top4Rate:Math.round(row.top4/row.games*100),
    units:Array.from(row.units.entries()).sort((a,b)=>b[1]-a[1])
  }));
  const unitRows=Array.from(unitMap.values()).filter(row=>row.copies>0).map(row=>({
    name:row.name,copies:row.copies,games:row.games.size,
    items:Array.from(row.items.entries()).sort((a,b)=>b[1]-a[1])
  })).sort((a,b)=>b.copies-a.copies);
  return {games:matches,itemGames:withItems,items,units:unitRows};
}
function recent(){
  try{
    const values=JSON.parse(localStorage.getItem(RECENT_KEY)||"[]");
    return Array.isArray(values)?values.slice(0,5):[];
  }catch{return [];}
}
function renderRecent(){
  const items=recent();
  $("#recent-searches").innerHTML=items.length?items.map((v,i)=>
    '<button class="recent-search" type="button" data-recent="'+i+'">'+escapeHtml(v.gameName+"#"+v.tagLine+" · "+v.platform.toUpperCase())+"</button>"
  ).join(""):'<span class="muted">'+escapeHtml(t("recentNone"))+'</span>';
}
function saveRecent(value){
  const key=(value.gameName+"#"+value.tagLine+"@"+value.platform).toLowerCase();
  localStorage.setItem(RECENT_KEY,JSON.stringify([value,...recent().filter(
    v=>(v.gameName+"#"+v.tagLine+"@"+v.platform).toLowerCase()!==key
  )].slice(0,5)));
  renderRecent();
}
function setStatus(type,message){
  $("#status").className="status"+(type?" "+type:"");
  $("#status").textContent=message||"";
}
function loading(value){
  $("#loading").hidden=!value;
  $("#lookup-form").querySelector("button[type=submit]").disabled=value;
  if(value)setStatus("",t("loading"));
}
function fmt(value,decimals=0){
  return Number(value||0).toLocaleString(lang==="pt"?"pt-BR":"en-US",{
    minimumFractionDigits:decimals,maximumFractionDigits:decimals
  });
}
function dateString(ts){
  return ts?new Date(ts).toLocaleDateString(lang==="pt"?"pt-BR":"en-US"):"—";
}
function sortedItems(){
  const items=report.items.slice();
  if(sortMode==="avg")return items.sort((a,b)=>a.avg-b.avg||b.games-a.games);
  if(sortMode==="top4")return items.sort((a,b)=>b.top4Rate-a.top4Rate||b.games-a.games);
  return items.sort((a,b)=>b.games-a.games||b.copies-a.copies);
}
function renderMetrics(){
  const most=sortedItems()[0];
  const best=report.items.filter(v=>v.games>=2).sort((a,b)=>a.avg-b.avg)[0];
  $("#metric-games").textContent=report.games.length;
  $("#metric-items").textContent=report.items.length;
  const byFreq=report.items.slice().sort((a,b)=>b.games-a.games||b.copies-a.copies)[0];
  $("#metric-most").textContent=byFreq?byFreq.name:"—";
  $("#metric-most-note").textContent=byFreq?byFreq.games+" "+t("matches"):"—";
  $("#metric-best").textContent=best?fmt(best.avg,1):"—";
  $("#sample-note").textContent=translations[lang].sample(report.games.length,report.itemGames,report.items.length);
}
function renderItems(){
  const rows=sortedItems();
  if(!rows.length){
    selectedItem="";
    $("#item-grid").innerHTML='<div class="detail-content empty">'+escapeHtml(t("empty"))+"</div>";
    return;
  }
  if(!rows.some(v=>v.name===selectedItem))selectedItem=rows[0].name;
  $("#item-grid").innerHTML=rows.map(row=>
    '<button class="item-card '+(selectedItem===row.name?"active":"")+'" type="button" data-item="'+escapeHtml(row.name)+'">'+
      '<div><strong>'+escapeHtml(row.name)+'</strong><span>'+row.games+" "+escapeHtml(t("matches"))+' · '+row.top4Rate+"% Top 4</span></div>"+
      '<small class="'+(row.avg<=4?"good":"bad")+'">'+escapeHtml(t("avg"))+" "+fmt(row.avg,1)+"</small>"+
    "</button>"
  ).join("");
}
function detailStat(label,value,small=""){
  return '<div class="detail-stat"><span>'+escapeHtml(label)+'</span><strong>'+escapeHtml(value)+'</strong>'+(small?'<small>'+escapeHtml(small)+"</small>":"")+"</div>";
}
function renderDetail(){
  const item=report.items.find(v=>v.name===selectedItem);
  $("#detail-title").textContent=item?item.name:t("selectItem");
  const target=$("#detail-content");
  if(!item){
    target.className="detail-content empty";
    target.textContent=t("selectItem");
    return;
  }
  target.className="detail-content";
  const chips=item.units.length
    ? '<div class="chip-list">'+item.units.slice(0,8).map(v=>"<b>"+escapeHtml(v[0])+" · "+v[1]+'x</b>').join("")+"</div>"
    : "<small>"+escapeHtml(t("noUnits"))+"</small>";
  target.innerHTML=[
    detailStat(t("matches"),String(item.games),t("occurrences")+" · "+item.copies),
    detailStat(t("avg"),fmt(item.avg,2),t("top4")+" · "+item.top4Rate+"%"),
    detailStat(t("lastSeen"),dateString(item.lastSeen)),
    '<div class="detail-stat"><span>'+escapeHtml(t("unitPartners"))+"</span>"+chips+"</div>",
    item.name.startsWith("ID ")?'<p class="muted">'+escapeHtml(t("numericNote"))+"</p>":""
  ].join("");
}
function renderUnits(){
  $("#unit-count").textContent=report.units.length+" "+t("unitsTitle").toLocaleLowerCase();
  $("#unit-grid").innerHTML=report.units.length?report.units.slice(0,18).map(unit=>
    '<article class="unit-card"><strong>'+escapeHtml(unit.name)+'</strong><span>'+unit.games+" "+escapeHtml(t("selectedPeriod"))+" · "+unit.copies+" "+escapeHtml(t("occurrences"))+"</span>"+
    '<div class="unit-items">'+unit.items.slice(0,5).map(v=>"<b>"+escapeHtml(v[0])+" · "+v[1]+'x</b>').join("")+"</div></article>"
  ).join(""):'<div class="detail-content empty">'+escapeHtml(t("empty"))+"</div>";
}
function render(){
  report=buildReport(periodMatches());
  $("#result").hidden=false;
  $("#player-name").textContent=currentPlayer?currentPlayer.gameName+"#"+currentPlayer.tagLine:"—";
  document.querySelectorAll("[data-period]").forEach(b=>b.classList.toggle("active",b.dataset.period===period));
  document.querySelectorAll("[data-sort]").forEach(b=>b.classList.toggle("active",b.dataset.sort===sortMode));
  renderMetrics();renderItems();renderDetail();renderUnits();
}
function applyLanguage(){
  document.documentElement.lang=lang==="pt"?"pt-BR":"en";
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const value=t(el.dataset.i18n);
    if(typeof value==="string"&&value.includes("<span>"))el.innerHTML=value;
    else if(typeof value==="string")el.textContent=value;
  });
  $("#language-toggle").textContent=lang==="pt"?"EN":"PT-BR";
  $("#source-pill").textContent=lang==="pt"?"DADOS RIOT":"RIOT DATA";
  localStorage.setItem(LANGUAGE_KEY,lang);
  renderRecent();
  if(currentPlayer)render();
}
function updateUrl(name,tag,platform){
  const url=new URL(location.href);
  url.searchParams.set("riot",name+"#"+tag);
  url.searchParams.set("server",platform);
  url.searchParams.set("period",period);
  url.searchParams.set("lang",lang==="en"?"en":"pt");
  history.replaceState(null,"",url.pathname+"?"+url.searchParams.toString());
}

function updateLanguageUrl(){
  const url=new URL(location.href);
  url.searchParams.set("lang",lang==="en"?"en":"pt");
  history.replaceState(null,"",url.pathname+(url.searchParams.toString()?"?"+url.searchParams.toString():""));
}
async function lookup(name,tag,platform){
  const endpoint=window.TFT_ITEM_LAB_BACKEND?.tftProfile;
  if(!endpoint){setStatus("error",t("error"));return;}
  loading(true);
  $("#result").hidden=true;
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),API_TIMEOUT_MS);
  try{
    const response=await fetch(endpoint,{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({gameName:name,tagLine:tag,platform}),signal:controller.signal
    });
    const payload=await response.json().catch(()=>({}));
    const err=payload._transportError;
    if(!response.ok||err||payload.error){
      const status=Number(err?.status||response.status);
      const code=String(err?.code||payload.error||"");
      if(status===404||code.includes("not_found"))throw {kind:"notFound"};
      if(status===429||code.includes("rate"))throw {kind:"rate"};
      throw {kind:"error"};
    }
    currentPlayer=payload.player||{gameName:name,tagLine:tag};
    liveMatches=Array.isArray(payload.matches)?payload.matches:[];
    selectedItem="";
    saveRecent({gameName:currentPlayer.gameName||name,tagLine:currentPlayer.tagLine||tag,platform});
    updateUrl(name,tag,platform);
    setStatus("success",payload.cacheMeta?.stale?t("stale"):t("live"));
    render();
    $("#result").scrollIntoView({behavior:"smooth",block:"start"});
  }catch(err){
    setStatus("error",t(err?.kind||"error"));
  }finally{
    clearTimeout(timer);loading(false);
  }
}
$("#lookup-form").addEventListener("submit",event=>{
  event.preventDefault();
  const id=parseRiotId($("#riot-id").value);
  if(!id){setStatus("error",t("invalid"));$("#riot-id").focus();return;}
  lookup(id.gameName,id.tagLine,$("#server").value);
});
$("#language-toggle").addEventListener("click",()=>{lang=lang==="pt"?"en":"pt";applyLanguage();updateLanguageUrl();});
$("#recent-toggle").addEventListener("click",()=>{$("#recent-searches").hidden=!$("#recent-searches").hidden;});
document.addEventListener("click",event=>{
  const previous=event.target.closest("[data-recent]");
  if(previous){
    const value=recent()[Number(previous.dataset.recent)];
    if(value){
      $("#riot-id").value=value.gameName+"#"+value.tagLine;
      $("#server").value=value.platform;
      $("#recent-searches").hidden=true;
      lookup(value.gameName,value.tagLine,value.platform);
    }
    return;
  }
  const periodButton=event.target.closest("[data-period]");
  if(periodButton){
    period=periodButton.dataset.period;
    selectedItem="";
    if(currentPlayer)updateUrl(currentPlayer.gameName,currentPlayer.tagLine,$("#server").value);
    if(currentPlayer)render();
    return;
  }
  const sortButton=event.target.closest("[data-sort]");
  if(sortButton){
    sortMode=sortButton.dataset.sort;
    if(currentPlayer)render();
    return;
  }
  const itemButton=event.target.closest("[data-item]");
  if(itemButton){
    selectedItem=itemButton.dataset.item;
    renderItems();renderDetail();
  }
});
(function boot(){
  const query=new URLSearchParams(location.search);
  const requestedLang=String(query.get("lang")||"").toLowerCase();
  if(requestedLang==="en")lang="en";
  if(requestedLang==="pt"||requestedLang==="pt-br")lang="pt";
  applyLanguage();
  const rawPeriod=query.get("period");
  if(VALID_PERIODS.has(rawPeriod))period=rawPeriod;
  const id=parseRiotId(query.get("riot"));
  const selectedServer=query.get("server")||"br1";
  if(id){
    $("#riot-id").value=id.gameName+"#"+id.tagLine;
    if(Array.from($("#server").options).some(v=>v.value===selectedServer))$("#server").value=selectedServer;
    lookup(id.gameName,id.tagLine,$("#server").value);
  }
})();