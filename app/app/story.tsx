'use client';

import { useEffect, useRef, useState } from 'react';
import rows from './data.json';
import { registerSalesTool } from './webmcp';

const assetBase = process.env.NEXT_PUBLIC_BASE_PATH || '';

type Series = 'total' | 'spirits' | 'beer' | 'wine';
const series: {key: Series; name: string; color: string}[] = [
  {key:'total',name:'Total',color:'#242e2a'},
  {key:'spirits',name:'Spirits',color:'#6489a5'},
  {key:'beer',name:'Beer',color:'#b79850'},
  {key:'wine',name:'Wine',color:'#b87179'},
];
const chapters = [
  {id:'a-country-in-four-lines', eyebrow:'The long view', years:'1861—2006', title:'A country, in four lines.', text:'Over a century and a half, Sweden’s recorded alcohol sales rose, fell, and changed character. The biggest breaks tell one story. The changing mix tells another.', note:'Follow the total. Then look at what fills the glass.', domain:[1861,2006,12], focus:['total','spirits','beer','wine'], band:[1861,2006], event:null},
  {id:'the-age-of-spirits', eyebrow:'01 / A spirits culture', years:'1861—1913', title:'In the beginning, there was brännvin.', text:'Spirits dominated nineteenth-century Sweden. Economic conditions and harvests contributed to the swings; expanding local sales monopolies, beer taxes and other restrictions helped bring sales down towards the early 1900s.', note:'The spirits line closely follows the total. Beer and wine play smaller roles.', domain:[1861,1913,12], focus:['total','spirits'], band:[1861,1900], event:null},
  {id:'the-wartime-break', eyebrow:'02 / The sharp break', years:'1914—1918', title:'Neutrality did not prevent scarcity.', text:'Around 1917–18, recorded sales collapsed. First World War restrictions coincided with severe shortages of grain, potatoes and other basic foods, even though Sweden remained neutral.', note:'Restrictions and shortages overlapped. The graph cannot separate their effects.', domain:[1900,1930,8], focus:['total','spirits','beer'], band:[1914,1918], event:{year:1918,label:'Wartime low'}},
  {id:'a-rationed-glass', eyebrow:'03 / The ration book', years:'1919—1955', title:'For decades, the glass had a limit.', text:'The motbok rationing system was nationwide from 1919 until 1955. By restricting purchases, it helped keep recorded sales at comparatively low levels through the interwar years.', note:'The rebound after the war did not restore the peaks of the nineteenth century.', domain:[1910,1960,8], focus:['total','spirits'], band:[1919,1955], event:{year:1919,label:'Nationwide rationing'}},
  {id:'access-changes', eyebrow:'04 / Access changes', years:'1955—1977', title:'New freedoms. A familiar rise.', text:'Rationing ended in 1955. From 1965, medium-strength beer—mellanöl—could be bought in grocery stores, contributing to rising beer sales. Its removal in 1977 helps explain the decline that followed.', note:'Availability offers a plausible explanation for the turning points in beer sales.', domain:[1950,1985,9], focus:['total','beer'], band:[1965,1977], event:{year:1977,label:'Mellanöl leaves grocery stores'}},
  {id:'a-different-glass', eyebrow:'05 / A changing culture', years:'1957—2006', title:'Less spirits. More wine.', text:'In 1957, Systembolaget launched Operation Vin to encourage wine instead of spirits. It was one deliberate push within a much longer change in drinking preferences. By the end of the chart, wine had overtaken spirits.', note:'These are litres of pure alcohol. The shift is not an illusion of wine’s lower strength.', domain:[1950,2006,5], focus:['spirits','wine'], band:[1957,2006], event:{year:1957,label:'Operation Vin'}},
  {id:'what-the-lines-tell-us', eyebrow:'06 / Reading the evidence', years:'1861—2006', title:'Sharp breaks. Slow change.', text:'Restrictions helped shape the sudden changes. Drinking culture helped shape the longer trends. Together they offer a historical explanation—but these lines alone cannot establish the individual causal effects.', note:'Recorded sales tell us about the market. They do not tell us everything about drinking.', domain:[1861,2006,12], focus:['total','spirits','beer','wine'], band:[1861,2006], event:null},
];

function Chart({active}:{active:number}) {
  const [domain,setDomain]=useState([1861,2006,12]);
  const current=useRef(domain);
  const [selected,setSelected]=useState<Series|null>(null);
  const [hover,setHover]=useState<number|null>(null);
  const chapter=chapters[active];
  useEffect(()=>{
    setHover(null); setSelected(null);
    const start=[...current.current],end=chapters[active].domain;
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){current.current=end;setDomain(end);return;}
    let frame=0;const beginning=performance.now();
    const animate=(now:number)=>{const t=Math.min(1,(now-beginning)/950),ease=1-Math.pow(1-t,3);const next=start.map((v,i)=>v+(end[i]-v)*ease);current.current=next;setDomain(next);if(t<1)frame=requestAnimationFrame(animate);};
    frame=requestAnimationFrame(animate);return ()=>cancelAnimationFrame(frame);
  },[active]);
  const W=900,H=500,left=46,right=75,top=28,bottom=53;
  const x=(year:number)=>left+(year-domain[0])/(domain[1]-domain[0])*(W-left-right);
  const y=(value:number)=>H-bottom-value/domain[2]*(H-top-bottom);
  const line=(key:Series)=>rows.map((row,i)=>`${i?'L':'M'}${x(row.year).toFixed(2)},${y(row[key]).toFixed(2)}`).join(' ');
  const focused=(key:Series)=>selected?key===selected:chapter.focus.includes(key);
  const step=domain[1]-domain[0]>80?20:10;
  const ticks=Array.from({length:16},(_,i)=>1860+i*step).filter(n=>n>=domain[0]+2&&n<=domain[1]-2);
  // Generate decade ticks from the visible domain, including later zoomed ranges.
  const yearTicks=domain[1]-domain[0]>80?ticks:Array.from({length:Math.ceil((domain[1]-domain[0])/10)+1},(_,i)=>Math.ceil(domain[0]/10)*10+i*10).filter(n=>n<domain[1]-1);
  const datum=hover===null?null:rows.find(r=>r.year===hover);
  const last=rows[Math.max(0,Math.min(rows.length-1,Math.round(domain[1])-1861))];
  return <div className="chart-panel">
    <div className="chart-heading"><div><p className="kicker">Recorded alcohol sales · Sweden</p><div className="chart-years" aria-live="polite">{chapter.years}</div></div><span className="chart-index">{String(active+1).padStart(2,'0')}<span> / 07</span></span></div>
    <div className="legend" aria-label="Highlight a beverage">{series.map(s=><button key={s.key} aria-pressed={selected===s.key} onClick={()=>setSelected(selected===s.key?null:s.key)} className={!focused(s.key)?'muted':''}><i style={{background:s.color}}/>{s.name}</button>)}</div>
    <div className="chart-unit">Litres of pure alcohol per person aged 15+</div>
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="chart-title chart-desc" className="chart" tabIndex={0}
        onPointerMove={e=>{const rect=e.currentTarget.getBoundingClientRect();const drawnWidth=Math.min(rect.width,rect.height*W/H);const px=(e.clientX-rect.left-(rect.width-drawnWidth)/2)/drawnWidth*W;setHover(Math.max(Math.ceil(domain[0]),Math.min(Math.floor(domain[1]),Math.round(domain[0]+(px-left)/(W-left-right)*(domain[1]-domain[0])))));}}
        onPointerLeave={()=>setHover(null)} onBlur={()=>setHover(null)}
        onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();setHover(Math.max(Math.ceil(domain[0]),Math.min(Math.floor(domain[1]),(hover??Math.round(domain[0]))+(e.key==='ArrowRight'?1:-1))));}}}>
        <title id="chart-title">{`Sweden’s recorded alcohol sales, ${chapter.years}`}</title>
        <desc id="chart-desc">{chapter.note} Interactive values are approximate traces from the supplied graph. Focus the chart and use left and right arrow keys to inspect years.</desc>
        <defs><clipPath id="plot"><rect x={left} y={top} width={W-left-right} height={H-top-bottom+2}/></clipPath><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b7c7ba" stopOpacity=".25"/><stop offset="100%" stopColor="#b7c7ba" stopOpacity=".02"/></linearGradient></defs>
        {(domain[2]<=5?[0,1,2,3,4,5]:[0,3,6,9,12]).filter(v=>v<=domain[2]).map(v=><g key={v}><line x1={left} x2={W-right} y1={y(v)} y2={y(v)} stroke="#e5e8e5" strokeDasharray={v?'2 5':undefined}/><text x={left-16} y={y(v)+5} textAnchor="end" className="axis">{v}</text></g>)}
        <g clipPath="url(#plot)">
          {active>0&&active<6&&<rect x={x(chapter.band[0])} y={top} width={x(chapter.band[1])-x(chapter.band[0])} height={H-top-bottom} fill={active===5?'#f6edef':'#edf1ec'} className="era-band"/>}
          <path d={`${line('total')} L${x(2006)},${y(0)} L${x(1861)},${y(0)} Z`} fill="url(#area)" opacity={focused('total')?.9:.1}/>
          {series.map(s=><path key={s.key} d={line(s.key)} fill="none" stroke={s.color} strokeWidth={s.key==='total'?2.8:3.2} opacity={focused(s.key)?1:.13} className="data-line" strokeLinejoin="round" strokeLinecap="round"/>)}
          {chapter.event&&<line x1={x(chapter.event.year)} x2={x(chapter.event.year)} y1={top} y2={H-bottom} stroke="#69716b" strokeDasharray="4 6" opacity=".6"/>}
          {datum&&<g><line x1={x(datum.year)} x2={x(datum.year)} y1={top} y2={H-bottom} stroke="#252c29" opacity=".3"/>{series.filter(s=>focused(s.key)).map(s=><circle key={s.key} cx={x(datum.year)} cy={y(datum[s.key])} r={5} fill={s.color} stroke="white" strokeWidth="2"/>)}</g>}
        </g>
        {[Math.round(domain[0]),...yearTicks,Math.round(domain[1])].map((year,i)=><text key={`${i}`} x={x(year)} y={H-19} textAnchor="middle" className="axis">{year}</text>)}
        {series.filter(s=>focused(s.key)).map(s=><g key={s.key}><circle cx={x(last.year)} cy={y(last[s.key])} r="3" fill={s.color}/><text x={W-right+13} y={y(last[s.key])+5} fill={s.color} className="end-label">{s.name}</text></g>)}
      </svg>
      {datum&&<div className={`chart-tooltip ${x(datum.year)>W/2?'tooltip-left':'tooltip-right'}`}><strong>{datum.year} <span>approx.</span></strong>{series.filter(s=>focused(s.key)).map(s=><div key={s.key}><span><i style={{background:s.color}}/>{s.name}</span><b>{datum[s.key].toFixed(1)} L</b></div>)}</div>}
    </div>
    <div className="chart-caption"><span>{chapter.event?<><i className="event-dash"/>{chapter.event.year} · {chapter.event.label}</>:'1861–2006 · A history of a changing glass'}</span><span className="inspect-hint">Hover or use ← → to inspect</span></div>
    <p className="trace-note">Approximate traces from the supplied chart · CAN Report 113, Table 1</p>
  </div>;
}

export default function Home(){
  useEffect(registerSalesTool,[]);
  const [active,setActive]=useState(0);
  const [progress,setProgress]=useState(0);
  const sectionRefs=useRef<(HTMLElement|null)[]>([]);
  useEffect(()=>{
    let pending=false;
    const update=()=>{const middle=window.innerHeight*.58;let closest=0,distance=Infinity;sectionRefs.current.forEach((el,i)=>{if(!el)return;const r=el.getBoundingClientRect();const d=Math.abs(r.top+r.height/2-middle);if(d<distance){closest=i;distance=d;}});setActive(closest);setProgress(Math.min(1,Math.max(0,window.scrollY/(document.documentElement.scrollHeight-window.innerHeight))));pending=false;};
    const onScroll=()=>{if(!pending){pending=true;requestAnimationFrame(update);}};update();window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll);return()=>{window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',onScroll);};
  },[]);
  return <>
    <a className="skip-link" href="#story">Skip to the story</a>
    <header className="masthead"><a href="#top" className="wordmark"><span className="nord-mark">N.</span>NORD / DATA STORIES</a><span className="masthead-topic">Society & culture</span><a href="#sources">Notes & sources <span aria-hidden="true">↗</span></a><div className="reading-progress" style={{transform:`scaleX(${progress})`}}/></header>
    <main id="top">
      <section className="hero"><div className="hero-meta"><span className="kicker">Sweden · 1861—2006</span><span className="kicker">A visual history / 5 min read</span></div><div className="hero-grid"><h1>Sweden,<br/><span>in the glass.</span></h1><div className="hero-intro"><div className="four-lines"><i/><i/><i/><i/></div><p>A century and a half of alcohol sales. A story of restrictions, scarcity, and changing tastes.</p><a className="read-story" href="#story">Scroll to unfold the story <span aria-hidden="true">↓</span></a></div></div><div className="hero-footer"><span>Four lines. One changing society.</span><span>Based on CAN’s historical sales chart</span></div></section>
      <div id="story" className="story-layout"><div className="sticky-visual"><Chart active={active}/><nav className="chapter-nav" aria-label="Story chapters">{chapters.map((c,i)=><a key={c.id} href={`#${c.id}`} aria-label={c.eyebrow} aria-current={active===i?'step':undefined}><span className="nav-dot"/><span className="nav-name">{i===0?'Overview':i===6?'Perspective':c.years}</span></a>)}</nav></div><div className="narrative">{chapters.map((c,i)=><section id={c.id} key={c.id} ref={el=>{sectionRefs.current[i]=el;}} className={`story-step ${i===active?'is-active':''}`}><div className="step-content"><p className="kicker">{c.eyebrow}</p><span className="step-years">{c.years}</span><h2>{c.title}</h2><p className="step-body">{c.text}</p><div className="step-note"><span aria-hidden="true">↳</span><p>{c.note}</p></div>{i===0&&<span className="continue">Keep scrolling <span>↓</span></span>}</div></section>)}</div></div>
      <section className="closing"><p className="kicker">Beyond the chart</p><h2>Sales are a record.<br/><span>Not the whole story.</span></h2><div className="closing-columns"><p>Home distillation, smuggling and purchases abroad are not fully captured. A change in recorded sales is not necessarily the same change in total consumption.</p><p>These lines do not show who drank, how often, or how heavily. They cannot tell us how alcohol-related harm was distributed—or how it changed.</p></div></section>
      <section className="sources" id="sources"><div><p className="kicker">A note on the evidence</p><h2>Read the lines.<br/>Know their limits.</h2><p>This story adapts the supplied causal analysis. Historical explanations provide context, not isolated estimates of cause and effect.</p></div><div className="source-content"><h3>Data & method</h3><p>The original chart covers 1861–2006 and cites <em>Drogutvecklingen i Sverige 2008</em>, CAN Report 113, Table 1. It measures recorded sales in litres of pure alcohol per inhabitant aged 15 and older—not litres of each beverage.</p><p>The interactive curves were traced from the supplied PNG. Values shown on inspection are approximate readings, rounded to one decimal; they are not the original annual dataset. Gaps between visible pixels are interpolated.</p><details><summary>View the original chart <span>+</span></summary><figure><img src={`${assetBase}/graph.png`} alt="Original CAN chart of Swedish recorded alcohol sales, 1861–2006: total in green, spirits in blue, beer in yellow, and wine in red." width="489" height="420"/><figcaption>Original supplied chart. Colours have been adapted in the interactive version.</figcaption></figure></details><div className="source-links"><a href="https://nordicwelfare.org/popnad/en/artiklar/swedens-drinking-habits-162-years-of-bottoms-up-and-crackdowns/" target="_blank" rel="noreferrer"><span>01</span>CAN’s historical analysis of Swedish alcohol sales <b>↗</b></a><a href="https://encyclopedia.1914-1918-online.net/article/wartime-and-post-war-societies-sweden/" target="_blank" rel="noreferrer"><span>02</span>Sweden’s wartime society and food shortages <b>↗</b></a><a href="https://www.sciencedirect.com/org/science/article/pii/S1755750X24000025" target="_blank" rel="noreferrer"><span>03</span>Research on the state’s role in consumer culture <b>↗</b></a><a href={`${assetBase}/sweden-alcohol-sales-analysis.md`} download><span>04</span>Read the supplied causal analysis <b>↓</b></a></div></div></section>
    </main><footer><a className="wordmark" href="#top"><span className="nord-mark">N.</span>NORD / DATA STORIES</a><span>Sweden, in the glass · 1861–2006</span><a href="#top">Back to the beginning ↑</a></footer>
  </>;
}
