import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, ReferenceArea } from "recharts";

const T = {
  bg:"#f5f6fa", surface:"#ffffff", accent:"#4f63d2",
  text:"#1a1f36", muted:"#8892b0", border:"#e2e8f0",
  pph:"#e84a4a", pmi:"#2b6cb0",
};

function hexPath(cx, cy, rx, ry) {
  if (rx === undefined) rx = 32;
  if (ry === undefined) ry = 24;
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * 60 * i;
    pts.push((cx + rx * Math.cos(a)).toFixed(1) + "," + (cy + ry * Math.sin(a)).toFixed(1));
  }
  return "M " + pts.join(" L ") + " Z";
}

const DISTRICTS = [
  { id:"yangcheon_gap",    name:"양천갑",    sub:"황희",    pph:false, oseh:false, cx:110, cy:258, rx:32, ry:24, grade:1,  note:"후보격차 -1.6%p / 비례+11.8%p",
    j9:{p:49.2,m:48.5,pp:47.9,mp:52.1}, d21:{p:41.3,m:48.3}, g22:{p:48.2,m:49.8,pp:37.0,mp:25.2}, j8:{p:58.8,m:39.7,pp:55.3,mp:44.7}, d20:{p:50.1,m:46.4} },
  { id:"ydeungpo_gap",     name:"영등포갑",  sub:"채현일",  pph:false, oseh:false, cx:178, cy:258, rx:32, ry:24, grade:3,  note:"후보격차 -12.8%p / 비례+10.9%p",
    j9:{p:50.5,m:46.7,pp:49.0,mp:51.0}, d21:{p:41.5,m:45.9}, g22:{p:41.7,m:54.5,pp:37.1,mp:26.2}, j8:{p:60.1,m:38.2,pp:null,mp:null}, d20:{p:51.6,m:44.6} },
  { id:"ydeungpo_eul",     name:"영등포을",  sub:"김민석",  pph:false, oseh:false, cx:246, cy:258, rx:32, ry:24, grade:1,  note:"후보격차 -1.2%p / 비례+10.9%p",
    j9:{p:50.5,m:46.7,pp:49.0,mp:51.0}, d21:{p:41.5,m:45.9}, g22:{p:49.0,m:50.2,pp:37.1,mp:26.2}, j8:{p:60.1,m:38.2,pp:null,mp:null}, d20:{p:51.6,m:44.6} },
  { id:"mapo_gap",         name:"마포갑",    sub:"조정훈",  pph:true,  oseh:false, cx:230, cy:130, rx:32, ry:24, grade:0,  note:"22대 국힘 조정훈 당선",
    j9:{p:49.9,m:49.6,pp:45.8,mp:54.2}, d21:{p:39.1,m:48.4}, g22:{p:48.3,m:47.7,pp:34.6,mp:25.2}, j8:{p:56.6,m:40.8,pp:52.2,mp:47.8}, d20:{p:49.0,m:46.5} },
  { id:"yongsan",          name:"용산",      sub:"권영세",  pph:true,  oseh:true,  cx:300, cy:130, rx:32, ry:24, grade:-1, note:"22대 국힘 현역",
    j9:{p:57.1,m:40.2,pp:55.3,mp:44.7}, d21:{p:47.6,m:41.1}, g22:{p:51.8,m:47.0,pp:42.3,mp:22.2}, j8:{p:64.9,m:33.3,pp:null,mp:null}, d20:{p:56.4,m:39.9} },
  { id:"jsd_eul",          name:"중성동을",  sub:"박성준",  pph:false, oseh:false, cx:340, cy:75,  rx:32, ry:24, grade:1,  note:"후보격차 -2.3%p / 비례+14.0%p",
    j9:{p:49.6,m:47.9,pp:48.6,mp:51.4}, d21:{p:42.0,m:46.8}, g22:{p:48.5,m:50.8,pp:38.8,mp:24.8}, j8:{p:58.5,m:39.9,pp:54.5,mp:45.5}, d20:{p:51.0,m:45.4} },
  { id:"jsd_gap",          name:"중성동갑",  sub:"전현희",  pph:false, oseh:false, cx:400, cy:180, rx:32, ry:24, grade:2,  note:"후보격차 -5.2%p / 비례+14.0%p",
    j9:{p:49.6,m:47.9,pp:48.6,mp:51.4}, d21:{p:42.0,m:46.8}, g22:{p:47.4,m:52.6,pp:38.8,mp:24.8}, j8:{p:58.5,m:39.9,pp:54.5,mp:45.5}, d20:{p:51.0,m:45.4} },
  { id:"gwj_gap",          name:"광진갑",    sub:"이정헌",  pph:false, oseh:false, cx:470, cy:75,  rx:32, ry:24, grade:2,  note:"후보격차 -5.0%p / 비례+7.2%p",
    j9:{p:48.7,m:48.6,pp:47.3,mp:52.6}, d21:{p:39.9,m:48.1}, g22:{p:47.5,m:52.5,pp:35.8,mp:28.6}, j8:{p:58.3,m:40.0,pp:53.6,mp:46.4}, d20:{p:48.8,m:47.2} },
  { id:"gwj_eul",          name:"광진을",    sub:"고민정",  pph:false, oseh:false, cx:470, cy:180, rx:32, ry:24, grade:2,  note:"후보격차 -3.9%p / 비례+7.2%p",
    j9:{p:48.7,m:48.6,pp:47.3,mp:52.6}, d21:{p:39.9,m:48.1}, g22:{p:47.6,m:51.5,pp:35.8,mp:28.6}, j8:{p:58.3,m:40.0,pp:53.6,mp:46.4}, d20:{p:48.8,m:47.2} },
  { id:"gdd_gap",          name:"강동갑",    sub:"진선미",  pph:false, oseh:false, cx:660, cy:165, rx:32, ry:24, grade:1,  note:"후보격차 -2.2%p / 비례+12.1%p",
    j9:{p:50.6,m:46.9,pp:49.9,mp:50.1}, d21:{p:43.0,m:46.2}, g22:{p:47.9,m:50.1,pp:38.1,mp:26.0}, j8:{p:60.6,m:37.9,pp:56.0,mp:40.1}, d20:{p:51.7,m:44.8} },
  { id:"gdd_eul",          name:"강동을",    sub:"이해식",  pph:false, oseh:false, cx:595, cy:258, rx:32, ry:24, grade:3,  note:"후보격차 -8.8%p / 비례+12.1%p",
    j9:{p:50.6,m:46.9,pp:49.9,mp:50.1}, d21:{p:43.0,m:46.2}, g22:{p:44.7,m:53.5,pp:38.1,mp:26.0}, j8:{p:60.6,m:37.9,pp:56.0,mp:40.1}, d20:{p:51.7,m:44.8} },
  { id:"hanam",            name:"하남갑",    sub:"이광재",  pph:false, oseh:false, cx:660, cy:258, rx:38, ry:28, grade:1,  note:"후보격차 -1.2%p / 비례+9.7%p",
    j9:{p:39.4,m:55.0,pp:45.5,mp:54.5}, d21:{p:39.5,m:50.7}, g22:{p:49.4,m:50.6,pp:35.7,mp:26.0}, j8:{p:50.5,m:47.9,pp:52.9,mp:47.1}, d20:{p:48.3,m:48.7} },
  { id:"dja_gap",          name:"동작갑",    sub:"김병기",  pph:false, oseh:false, cx:265, cy:312, rx:32, ry:24, grade:2,  note:"후보격차 -5.5%p / 비례+10.8%p",
    j9:{p:49.6,m:47.2,pp:43.4,mp:49.4}, d21:{p:40.9,m:46.9}, g22:{p:45.0,m:50.5,pp:36.4,mp:25.6}, j8:{p:58.1,m:40.1,pp:null,mp:null}, d20:{p:50.5,m:45.7} },
  { id:"dja_eul",          name:"동작을",    sub:"나경원",  pph:true,  oseh:true,  cx:330, cy:360, rx:32, ry:24, grade:-1, note:"22대 국힘 현역",
    j9:{p:49.6,m:47.2,pp:43.4,mp:49.4}, d21:{p:40.9,m:46.9}, g22:{p:54.0,m:46.0,pp:36.4,mp:25.6}, j8:{p:58.1,m:40.1,pp:null,mp:null}, d20:{p:50.5,m:45.7} },
  { id:"gnm_gap",          name:"강남갑",    sub:"서명옥",  pph:true,  oseh:true,  cx:460, cy:258, rx:32, ry:24, grade:-1, note:"강남 텃밭",
    j9:{p:66.0,m:31.9,pp:66.1,mp:33.9}, d21:{p:56.6,m:32.2}, g22:{p:64.2,m:35.8,pp:50.3,mp:14.9}, j8:{p:74.4,m:24.5,pp:72.2,mp:27.8}, d20:{p:67.0,m:30.3} },
  { id:"gnm_byung",        name:"강남병",    sub:"고동진",  pph:true,  oseh:true,  cx:460, cy:312, rx:32, ry:24, grade:-1, note:"강남 텃밭",
    j9:{p:66.0,m:31.9,pp:66.1,mp:33.9}, d21:{p:56.6,m:32.2}, g22:{p:66.3,m:32.8,pp:50.3,mp:14.9}, j8:{p:74.4,m:24.5,pp:72.2,mp:27.8}, d20:{p:67.0,m:30.3} },
  { id:"gnm_eul",          name:"강남을",    sub:"박수민",  pph:true,  oseh:true,  cx:460, cy:372, rx:32, ry:24, grade:-1, note:"강남 텃밭",
    j9:{p:66.0,m:31.9,pp:66.1,mp:33.9}, d21:{p:56.6,m:32.2}, g22:{p:58.6,m:41.4,pp:50.3,mp:14.9}, j8:{p:74.4,m:24.5,pp:72.2,mp:27.8}, d20:{p:67.0,m:30.3} },
  { id:"seocho_gap",       name:"서초갑",    sub:"조온희",  pph:true,  oseh:true,  cx:390, cy:312, rx:32, ry:24, grade:-1, note:"22대 국힘 현역",
    j9:{p:66.1,m:33.9,pp:66.1,mp:33.9}, d21:{p:66.0,m:31.9}, g22:{p:65.96,m:31.92,pp:50.3,mp:14.9}, j8:{p:74.4,m:24.5,pp:72.2,mp:27.8}, d20:{p:67.0,m:30.3} },
  { id:"spg",              name:"송파갑",    sub:"박정훈",  pph:true,  oseh:true,  cx:530, cy:258, rx:32, ry:24, grade:-1, note:"22대 국힘 현역",
    j9:{p:54.8,m:46.9,pp:54.0,mp:43.0}, d21:{p:46.6,m:42.1}, g22:{p:47.38,m:52.61,pp:41.9,mp:22.1}, j8:{p:64.7,m:34.0,pp:60.9,mp:37.7}, d20:{p:56.8,m:40.2} },
  { id:"spe",              name:"송파을",    sub:"배현진",  pph:true,  oseh:true,  cx:530, cy:312, rx:32, ry:24, grade:-1, note:"22대 국힘 현역",
    j9:{p:54.8,m:46.9,pp:54.0,mp:43.0}, d21:{p:46.6,m:42.1}, g22:{p:44.68,m:53.55,pp:38.08,mp:26.01}, j8:{p:55.95,m:40.07,pp:55.95,mp:40.07}, d20:{p:51.7,m:44.8} },
  { id:"spb",              name:"송파병",    sub:"남인순",  pph:false, oseh:false, cx:595, cy:312, rx:32, ry:24, grade:1,  note:"후보격차 -2.1%p / 비례+19.8%p ★",
    j9:{p:54.8,m:46.9,pp:54.0,mp:43.0}, d21:{p:46.6,m:42.1}, g22:{p:48.9,m:51.0,pp:41.9,mp:22.1}, j8:{p:64.7,m:34.0,pp:60.9,mp:37.7}, d20:{p:56.8,m:40.2} },
];

const GM = {
  "1": {label:"★★★ 1순위",color:"#b91c1c",fill:"#fee2e2",stroke:"#ef4444"},
  "2": {label:"★★ 2순위", color:"#1d4ed8",fill:"#dbeafe",stroke:"#3b82f6"},
  "3": {label:"★ 3순위",  color:"#92400e",fill:"#fef3c7",stroke:"#f59e0b"},
  "-1":{label:"국힘 현역", color:"#6d28d9",fill:"#f3e8ff",stroke:"#8b5cf6"},
  "0": {label:"참고",      color:"#374151",fill:"#f9fafb",stroke:"#d1d5db"},
};

const APPROVAL = [
  {q:"08Q1",lb:"'08①",mb:52},{q:"08Q2",lb:"'08②",mb:24},{q:"08Q3",lb:"'08③",mb:26},{q:"08Q4",lb:"'08④",mb:29},
  {q:"09Q1",lb:"'09①",mb:35},{q:"09Q2",lb:"'09②",mb:40},{q:"09Q3",lb:"'09③",mb:48},{q:"09Q4",lb:"'09④",mb:47},
  {q:"10Q1",lb:"'10①",mb:49},{q:"10Q2",lb:"'10②",mb:44},{q:"10Q3",lb:"'10③",mb:46},{q:"10Q4",lb:"'10④",mb:47},
  {q:"11Q1",lb:"'11①",mb:45},{q:"11Q2",lb:"'11②",mb:38},{q:"11Q3",lb:"'11③",mb:33},{q:"11Q4",lb:"'11④",mb:30},
  {q:"12Q1",lb:"'12①",mb:27},{q:"12Q2",lb:"'12②",mb:24},{q:"12Q3",lb:"'12③",mb:21},{q:"12Q4",lb:"'12④",mb:24},
  {q:"13Q1",lb:"'13①",pk:56},{q:"13Q2",lb:"'13②",pk:61},{q:"13Q3",lb:"'13③",pk:67},{q:"13Q4",lb:"'13④",pk:55},
  {q:"14Q1",lb:"'14①",pk:57},{q:"14Q2",lb:"'14②",pk:43},{q:"14Q3",lb:"'14③",pk:47},{q:"14Q4",lb:"'14④",pk:46},
  {q:"15Q1",lb:"'15①",pk:31},{q:"15Q2",lb:"'15②",pk:33},{q:"15Q3",lb:"'15③",pk:42},{q:"15Q4",lb:"'15④",pk:45},
  {q:"16Q1",lb:"'16①",pk:40},{q:"16Q2",lb:"'16②",pk:31},{q:"16Q3",lb:"'16③",pk:35},{q:"16Q4",lb:"'16④",pk:7},
  {q:"17Q2",lb:"'17②",mn:84},{q:"17Q3",lb:"'17③",mn:77},{q:"17Q4",lb:"'17④",mn:72},
  {q:"18Q1",lb:"'18①",mn:70},{q:"18Q2",lb:"'18②",mn:72},{q:"18Q3",lb:"'18③",mn:59},{q:"18Q4",lb:"'18④",mn:52},
  {q:"19Q1",lb:"'19①",mn:47},{q:"19Q2",lb:"'19②",mn:46},{q:"19Q3",lb:"'19③",mn:47},{q:"19Q4",lb:"'19④",mn:44},
  {q:"20Q1",lb:"'20①",mn:51},{q:"20Q2",lb:"'20②",mn:57},{q:"20Q3",lb:"'20③",mn:50},{q:"20Q4",lb:"'20④",mn:43},
  {q:"21Q1",lb:"'21①",mn:37},{q:"21Q2",lb:"'21②",mn:34},{q:"21Q3",lb:"'21③",mn:36},{q:"21Q4",lb:"'21④",mn:38},
  {q:"22Q1",lb:"'22①",mn:38},
  {q:"22Q2",lb:"'22②",ys:45},{q:"22Q3",lb:"'22③",ys:28},{q:"22Q4",lb:"'22④",ys:32},
  {q:"23Q1",lb:"'23①",ys:35},{q:"23Q2",lb:"'23②",ys:33},{q:"23Q3",lb:"'23③",ys:33},{q:"23Q4",lb:"'23④",ys:34},
  {q:"24Q1",lb:"'24①",ys:38},{q:"24Q2",lb:"'24②",ys:24},{q:"24Q3",lb:"'24③",ys:24},{q:"24Q4",lb:"'24④",ys:20},
  {q:"25Q2",lb:"'25②",lj:58},{q:"25Q3",lb:"'25③",lj:63},{q:"25Q4",lb:"'25④",lj:65},{q:"26Q1",lb:"'26①",lj:63},
  {q:"26Q2",lb:"'26②",lj_b:55,lj_o:60,lj_w:48},{q:"26Q3",lb:"'26③",lj_b:52,lj_o:57,lj_w:44},
  {q:"26Q4",lb:"'26④",lj_b:50,lj_o:55,lj_w:41},{q:"27Q1",lb:"'27①",lj_b:48,lj_o:53,lj_w:39},
  {q:"27Q2",lb:"'27②",lj_b:46,lj_o:51,lj_w:37},{q:"27Q3",lb:"'27③",lj_b:44,lj_o:49,lj_w:35},
  {q:"27Q4",lb:"'27④",lj_b:42,lj_o:47,lj_w:33},{q:"28Q1",lb:"'28①",lj_b:39,lj_o:45,lj_w:30},
  {q:"28Q2",lb:"'28②",lj_b:37,lj_o:43,lj_w:28},
];
const PC = {mb:"#e84a4a",pk:"#8b5cf6",mn:"#2b6cb0",ys:"#f97316",lj:"#059669"};
const PL = {mb:"이명박",pk:"박근혜",mn:"문재인",ys:"윤석열",lj:"이재명(실측)"};

function CTip(props) {
  const active = props.active;
  const payload = props.payload;
  if (!active || !payload || !payload.length) return null;
  const d = payload[0] && payload[0].payload;
  return (
    <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,padding:"8px 12px",fontSize:11}}>
      <b style={{color:T.text}}>{d ? d.lb : ""}</b>
      {payload.filter(function(p){ return p.value != null; }).map(function(p,i){
        return <div key={i} style={{color:PC[p.dataKey]||T.muted}}>{PL[p.dataKey]||p.dataKey}: <b>{p.value}%</b></div>;
      })}
    </div>
  );
}

export default function ElectionTab(){
  const [tab,setTab]=useState("map");
  const [sel,setSel]=useState(null);
  const [scenario,setScenario]=useState(true);

  const selD = DISTRICTS.find(function(d){ return d.id===sel; });
  const targets = DISTRICTS.filter(function(d){ return d.grade>0; }).sort(function(a,b){ return a.grade-b.grade; });

  return(
    <div style={{background:T.bg,minHeight:"100vh",fontFamily:"'Apple SD Gothic Neo','Pretendard',sans-serif",color:T.text}}>
      <div style={{background:T.surface,borderBottom:"1px solid "+T.border,padding:"10px 20px",display:"flex",gap:4}}>
        {[["map","🗺️ 한강벨트 분석"],["ash","📡 23ASH"]].map(function(pair){
          const k = pair[0];
          const lb = pair[1];
          return (
            <button key={k} onClick={function(){ setTab(k); }}
              style={{padding:"7px 22px",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,fontWeight:tab===k?700:400,
                background:tab===k?T.accent:"transparent",color:tab===k?"#fff":T.muted,transition:"all .15s"}}>{lb}</button>
          );
        })}
      </div>

      {tab==="map"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 360px",height:"calc(100vh - 118px)"}}>
          <div style={{background:"#f8fafd",display:"flex",flexDirection:"column",overflow:"hidden",borderRight:"1px solid "+T.border}}>
            <div style={{padding:"7px 16px",fontSize:11,color:"#64748b",borderBottom:"1px solid "+T.border,background:"#fffbeb",flexShrink:0}}>
              🔴 빨간 테두리 = 9회 지선 오세훈(국힘) 승리 지역구 &nbsp;|&nbsp; 클릭 → 우측 상세 데이터
            </div>

            <div style={{flex:1,overflow:"auto",display:"flex",alignItems:"center",justifyContent:"center",padding:"12px"}}>
              <svg viewBox="0 0 760 430" style={{width:"100%",maxWidth:780}}>
                <ellipse cx={390} cy={250} rx={350} ry={195} fill="#eef2ff" stroke="#c7d2fe" strokeWidth={1.5}/>

                <path d="M40,205 Q150,195 280,200 Q360,205 420,210 Q470,212 510,200 Q555,186 600,165 Q650,143 700,120"
                  stroke="#93c5fd" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.5}/>
                <text x={300} y={208} fill="#3b82f6" fontSize={9} textAnchor="middle" opacity={0.7}>한 강</text>

                <path d="M712,108 L692,118" stroke="#94a3b8" strokeWidth={1.2} strokeDasharray="4 3"/>
                <text x={714} y={104} fill="#64748b" fontSize={9}>경기도</text>

                {DISTRICTS.map(function(d){
                  const path = hexPath(d.cx, d.cy, d.rx, d.ry);
                  const isSel = sel===d.id;
                  const fillBase = d.pph ? (isSel?"#ef4444":"#fca5a5") : (isSel?"#3b82f6":"#93c5fd");
                  const strokeC = d.oseh ? "#ef4444" : (d.pph?"#f87171":"#60a5fa");
                  const strokeW = d.oseh ? 2.5 : (isSel?2.5:1.5);
                  return (
                    <g key={d.id} style={{cursor:"pointer"}} onClick={function(){ setSel(d.id===sel?null:d.id); }}>
                      <path d={hexPath(d.cx+2, d.cy+3, d.rx, d.ry)} fill="rgba(0,0,0,0.08)" style={{pointerEvents:"none"}}/>
                      <path d={path} fill={fillBase} stroke={strokeC} strokeWidth={strokeW} style={{transition:"all .15s"}}/>
                    </g>
                  );
                })}

                {DISTRICTS.map(function(d){
                  const isSel = sel===d.id;
                  const textC = d.pph ? "#7f1d1d" : "#1e3a5f";
                  return (
                    <g key={d.id+"_lb"} style={{pointerEvents:"none"}}>
                      <text x={d.cx} y={d.cy-4} textAnchor="middle" dominantBaseline="middle"
                        fontSize={8.5} fontWeight={700} fill={isSel?"#fff":textC}>{d.name}</text>
                      <text x={d.cx} y={d.cy+7} textAnchor="middle" dominantBaseline="middle"
                        fontSize={7.5} fontWeight={400} fill={isSel?"rgba(255,255,255,0.9)":textC}>{d.sub}</text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div style={{padding:"8px 14px",borderTop:"1px solid "+T.border,background:T.surface,flexShrink:0}}>
              <div style={{fontSize:11,fontWeight:700,color:T.muted,marginBottom:5}}>
                🎯 탈환 가능 지역구 — 22대 패배 + 비례 국힘 우세
              </div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                {targets.map(function(d){
                  const c = GM[d.grade].stroke;
                  return (
                    <button key={d.id} onClick={function(){ setSel(d.id); }}
                      style={{padding:"3px 10px",borderRadius:14,border:"1.5px solid "+c,fontSize:11,fontWeight:600,
                        background:sel===d.id?c:"transparent",color:sel===d.id?"#fff":c,cursor:"pointer",transition:"all .15s"}}>
                      {GM[d.grade].label.split(" ")[0]} {d.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{background:T.surface,overflowY:"auto"}}>
            {!selD ? (
              <div style={{padding:24,textAlign:"center",color:T.muted}}>
                <div style={{fontSize:48,opacity:0.15,marginBottom:12}}>🗺️</div>
                <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:4}}>지역구를 선택하세요</div>
                <div style={{fontSize:12,marginBottom:18}}>지도 클릭 또는 아래 버튼</div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {targets.map(function(d){
                    const c = GM[d.grade].stroke;
                    return (
                      <button key={d.id} onClick={function(){ setSel(d.id); }}
                        style={{padding:"9px 14px",borderRadius:10,border:"1px solid "+T.border,background:T.bg,
                          cursor:"pointer",fontSize:13,textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontWeight:700}}>{d.name}</span>
                        <span style={{fontSize:11,color:c,fontWeight:600}}>{GM[d.grade].label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{padding:"15px 16px"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:12}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:22,fontWeight:800}}>{selD.name}</div>
                    <div style={{fontSize:12,color:T.muted,marginTop:2}}>{selD.pph?"국힘":"민주"} ({selD.sub})</div>
                  </div>
                  {selD.grade!==0&&(
                    <div style={{padding:"4px 10px",borderRadius:16,fontSize:11,fontWeight:700,
                      background:GM[selD.grade].fill,color:GM[selD.grade].color,
                      border:"1px solid "+GM[selD.grade].stroke+"44",whiteSpace:"nowrap"}}>
                      {GM[selD.grade].label}
                    </div>
                  )}
                  <button onClick={function(){ setSel(null); }}
                    style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:T.muted}}>×</button>
                </div>

                {selD.grade>0&&<div style={{padding:"7px 11px",borderRadius:8,marginBottom:11,fontSize:12,
                  background:GM[selD.grade].stroke+"11",border:"1px solid "+GM[selD.grade].stroke+"33",
                  color:GM[selD.grade].color}}>💡 {selD.note}</div>}
                {selD.oseh&&<div style={{padding:"5px 11px",borderRadius:6,background:"#fee2e2",border:"1px solid #fca5a5",
                  marginBottom:11,fontSize:11,color:"#b91c1c"}}>🔴 9회 지선 오세훈(국힘) 승리 지역</div>}

                {[
                  {label:"제20대 대선 (2022.3)",   p:selD.d20.p,m:selD.d20.m},
                  {label:"제8회 지방선거 (2022.6)", p:selD.j8.p,m:selD.j8.m,pp:selD.j8.pp,mp:selD.j8.mp},
                  {label:"제22대 총선 (2024.4)",    p:selD.g22.p,m:selD.g22.m,pp:selD.g22.pp,mp:selD.g22.mp},
                  {label:"제21대 대선 (2025.6)",    p:selD.d21.p,m:selD.d21.m},
                  {label:"제9회 지방선거 (2026.6)", p:selD.j9.p,m:selD.j9.m,pp:selD.j9.pp,mp:selD.j9.mp},
                ].map(function(row,ri){
                  const diff = row.p - row.m;
                  return (
                    <div key={ri} style={{marginBottom:13}}>
                      <div style={{fontSize:11,fontWeight:700,color:T.muted,marginBottom:5}}>{row.label}</div>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                        <span style={{color:T.pph,fontWeight:700}}>국힘 {row.p}%</span>
                        <span style={{fontSize:10,color:diff>0?"#16a34a":"#dc2626",fontWeight:700}}>
                          {diff>0?("+"+diff.toFixed(1)):diff.toFixed(1)}%p
                        </span>
                        <span style={{color:T.pmi,fontWeight:700}}>{row.m}% 민주</span>
                      </div>
                      <div style={{position:"relative",height:10,borderRadius:5,overflow:"hidden",background:T.pmi}}>
                        <div style={{position:"absolute",left:0,top:0,bottom:0,width:row.p+"%",background:T.pph,borderRadius:"5px 0 0 5px"}}/>
                        <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:1.5,background:"rgba(255,255,255,0.6)"}}/>
                      </div>
                      {row.pp!=null&&(
                        <div style={{marginTop:4}}>
                          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:T.muted,marginBottom:2}}>
                            <span>비례 국힘 {row.pp}%</span><span>비례 민주 {row.mp}%</span>
                          </div>
                          <div style={{position:"relative",height:6,borderRadius:3,overflow:"hidden",background:"#93c5fd",opacity:0.8}}>
                            <div style={{position:"absolute",left:0,top:0,bottom:0,width:row.pp+"%",background:"#fca5a5",borderRadius:"3px 0 0 3px"}}/>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {selD.grade>0&&(
                  <div style={{background:T.bg,borderRadius:10,padding:13,border:"1px solid "+T.border}}>
                    <div style={{fontSize:12,fontWeight:700,marginBottom:9}}>📊 탈환 핵심 지표</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                      {[
                        {lb:"22대 후보 격차",v:(selD.g22.p-selD.g22.m).toFixed(1)+"%p",c:(selD.g22.p-selD.g22.m)>0?"#16a34a":"#dc2626"},
                        {lb:"22대 비례 격차",v:selD.g22.pp!=null?("+"+(selD.g22.pp-selD.g22.mp).toFixed(1)+"%p"):"N/A",c:"#16a34a"},
                        {lb:"9회 지선 격차",v:(selD.j9.p-selD.j9.m).toFixed(1)+"%p",c:(selD.j9.p-selD.j9.m)>0?"#16a34a":"#dc2626"},
                        {lb:"21대 대선 격차",v:(selD.d21.p-selD.d21.m).toFixed(1)+"%p",c:(selD.d21.p-selD.d21.m)>0?"#16a34a":"#dc2626"},
                      ].map(function(m,i){
                        return (
                          <div key={i} style={{background:T.surface,borderRadius:8,padding:"9px 11px",border:"1px solid "+T.border}}>
                            <div style={{fontSize:10,color:T.muted,marginBottom:3}}>{m.lb}</div>
                            <div style={{fontSize:18,fontWeight:800,color:m.c}}>{m.v}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {tab==="ash"&&(
        <div style={{padding:"18px 22px",overflowY:"auto",maxHeight:"calc(100vh-118px)"}}>
          <div style={{background:T.surface,borderRadius:14,padding:"18px 8px 14px",border:"1px solid "+T.border,marginBottom:18}}>
            <div style={{paddingLeft:14,marginBottom:12,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <span style={{fontSize:14,fontWeight:700}}>📡 역대 대통령 지지율 + 이재명 정부 시나리오 (2008~2028)</span>
              <button onClick={function(){ setScenario(function(s){ return !s; }); }}
                style={{marginLeft:"auto",padding:"4px 13px",borderRadius:16,border:"1px solid "+T.border,
                  background:scenario?T.accent:"transparent",color:scenario?"#fff":T.muted,cursor:"pointer",fontSize:11}}>
                {scenario?"✅ 예측 ON":"예측 OFF"}
              </button>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={APPROVAL} margin={{top:8,right:20,left:-10,bottom:8}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                <XAxis dataKey="lb" tick={{fontSize:8,fill:T.muted}} interval={3}/>
                <YAxis domain={[0,90]} tickFormatter={function(v){ return v+"%"; }} tick={{fontSize:10,fill:T.muted}}/>
                <Tooltip content={<CTip/>}/>
                <ReferenceLine y={50} stroke="#e2e8f0" strokeDasharray="4 3"/>
                <ReferenceLine y={30} stroke="#fecaca" strokeDasharray="3 2"/>
                {scenario&&<ReferenceArea x1="'26②" x2="'28②" fill="#f0f4ff" fillOpacity={0.5}/>}
                {["mb","pk","mn","ys","lj"].map(function(k){
                  return <Line key={k} type="monotone" dataKey={k} stroke={PC[k]} strokeWidth={2.5} dot={false} connectNulls={false}/>;
                })}
                {scenario&&<>
                  <Line type="monotone" dataKey="lj_b" stroke="#059669" strokeWidth={2} strokeDasharray="7 3" dot={false} connectNulls={false}/>
                  <Line type="monotone" dataKey="lj_o" stroke="#6ee7b7" strokeWidth={1.5} strokeDasharray="4 4" dot={false} connectNulls={false}/>
                  <Line type="monotone" dataKey="lj_w" stroke="#f87171" strokeWidth={1.5} strokeDasharray="4 4" dot={false} connectNulls={false}/>
                </>}
              </LineChart>
            </ResponsiveContainer>
            <div style={{display:"flex",gap:14,paddingLeft:16,flexWrap:"wrap",marginTop:4}}>
              {["이명박","박근혜","문재인","윤석열","이재명(실측)"].map(function(n,i){
                const cols = ["#e84a4a","#8b5cf6","#2b6cb0","#f97316","#059669"];
                return (
                  <div key={n} style={{display:"flex",alignItems:"center",gap:4,fontSize:11}}>
                    <div style={{width:18,height:3,background:cols[i],borderRadius:2}}/><span style={{color:cols[i],fontWeight:600}}>{n}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
