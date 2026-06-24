import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, ReferenceArea
} from "recharts";

// ══════════════════════════════════════════════════════════════
// ASH 디자인 토큰
// ══════════════════════════════════════════════════════════════
const C = {
  bg: "#f5f6fa", surface: "#ffffff", accent: "#4f63d2",
  text: "#1a1f36", muted: "#8892b0", border: "#e2e8f0",
  pph: "#e84a4a", pmi: "#2563eb",
  g1: "#ef4444", g2: "#3b82f6", g3: "#f59e0b",
  win: "#8b5cf6", other: "#94a3b8",
};

// ══════════════════════════════════════════════════════════════
// 실제 지리 기반 SVG 경로 (서울 지도 형태 기반)
// viewBox="0 0 900 700"
// ══════════════════════════════════════════════════════════════
const GEO = [
  // 한강 이북 서쪽
  { id:"mapo_gap",   name:"마포갑",   x:290, y:255, w:72, h:54, candidate:"조정훈", winner22:"민주", grade:0, oseh:false,
    d20:{p:49.0,m:46.5}, j8:{p:56.6,m:40.8,pp:52.2,mp:47.8}, g22:{p:48.3,m:47.7,pp:34.6,mp:25.2}, d21:{p:39.1,m:48.4}, j9:{p:49.9,m:49.6,pp:45.8,mp:54.2} },
  { id:"yongsan",    name:"용산",     x:388, y:285, w:74, h:62, candidate:"권영세", winner22:"국힘", grade:-1, oseh:true,
    d20:{p:56.4,m:39.9}, j8:{p:64.9,m:33.3,pp:null,mp:null}, g22:{p:51.8,m:47.0,pp:42.3,mp:22.2}, d21:{p:47.6,m:41.1}, j9:{p:57.1,m:40.2,pp:55.3,mp:44.7} },

  // 한강 이북 동쪽
  { id:"jsd_gap",    name:"중성동갑", x:500, y:248, w:68, h:50, candidate:"전현희", winner22:"민주", grade:2, oseh:false,
    d20:{p:51.0,m:45.4}, j8:{p:58.5,m:39.9,pp:54.5,mp:45.5}, g22:{p:47.4,m:52.6,pp:38.8,mp:24.8}, d21:{p:42.0,m:46.8}, j9:{p:49.6,m:47.9,pp:48.6,mp:51.4} },
  { id:"jsd_eul",    name:"중성동을", x:500, y:200, w:68, h:50, candidate:"박성준", winner22:"민주", grade:1, oseh:false,
    d20:{p:51.0,m:45.4}, j8:{p:58.5,m:39.9,pp:54.5,mp:45.5}, g22:{p:48.5,m:50.8,pp:38.8,mp:24.8}, d21:{p:42.0,m:46.8}, j9:{p:49.6,m:47.9,pp:48.6,mp:51.4} },
  { id:"gwj_gap",    name:"광진갑",   x:590, y:228, w:62, h:48, candidate:"이정헌", winner22:"민주", grade:2, oseh:false,
    d20:{p:48.8,m:47.2}, j8:{p:58.3,m:40.0,pp:53.6,mp:46.4}, g22:{p:47.5,m:52.5,pp:35.8,mp:28.6}, d21:{p:39.9,m:48.1}, j9:{p:48.7,m:48.6,pp:47.3,mp:52.6} },
  { id:"gwj_eul",    name:"광진을",   x:590, y:278, w:62, h:48, candidate:"고민정", winner22:"민주", grade:2, oseh:false,
    d20:{p:48.8,m:47.2}, j8:{p:58.3,m:40.0,pp:53.6,mp:46.4}, g22:{p:47.6,m:51.5,pp:35.8,mp:28.6}, d21:{p:39.9,m:48.1}, j9:{p:48.5,m:48.6,pp:47.3,mp:52.6} },

  // 한강 이북 동북쪽
  { id:"gdd_gap",    name:"강동갑",   x:676, y:228, w:66, h:52, candidate:"진선미", winner22:"민주", grade:1, oseh:false,
    d20:{p:51.7,m:44.8}, j8:{p:60.6,m:37.9,pp:56.0,mp:40.1}, g22:{p:47.9,m:50.1,pp:38.1,mp:26.0}, d21:{p:43.0,m:46.2}, j9:{p:50.6,m:46.9,pp:49.9,mp:50.1} },
  { id:"gdd_eul",    name:"강동을",   x:676, y:282, w:66, h:52, candidate:"이해식", winner22:"민주", grade:3, oseh:false,
    d20:{p:51.7,m:44.8}, j8:{p:60.6,m:37.9,pp:56.0,mp:40.1}, g22:{p:44.7,m:53.5,pp:38.1,mp:26.0}, d21:{p:43.0,m:46.2}, j9:{p:50.6,m:46.9,pp:49.9,mp:50.1} },
  { id:"hanam",      name:"하남갑",   x:762, y:248, w:72, h:56, candidate:"추미애", winner22:"민주", grade:1, oseh:false,
    d20:{p:48.3,m:48.7}, j8:{p:50.5,m:47.9,pp:52.9,mp:47.1}, g22:{p:49.4,m:50.6,pp:35.7,mp:26.0}, d21:{p:39.5,m:50.7}, j9:{p:39.4,m:55.0,pp:45.5,mp:54.5} },

  // 한강 이남 서쪽
  { id:"yangcheon",  name:"양천갑",   x:164, y:328, w:78, h:56, candidate:"황희",   winner22:"민주", grade:1, oseh:false,
    d20:{p:50.1,m:46.4}, j8:{p:58.8,m:39.7,pp:55.3,mp:44.7}, g22:{p:48.2,m:49.8,pp:37.0,mp:25.2}, d21:{p:41.3,m:48.3}, j9:{p:49.2,m:48.5,pp:47.9,mp:52.1} },
  { id:"ydf_gap",    name:"영등포갑", x:258, y:328, w:72, h:56, candidate:"채현일", winner22:"민주", grade:3, oseh:false,
    d20:{p:51.6,m:44.6}, j8:{p:60.1,m:38.2,pp:null,mp:null}, g22:{p:41.7,m:54.5,pp:37.1,mp:26.2}, d21:{p:41.5,m:45.9}, j9:{p:50.5,m:46.7,pp:49.0,mp:51.0} },
  { id:"ydf_eul",    name:"영등포을", x:340, y:328, w:72, h:56, candidate:"김민석", winner22:"민주", grade:1, oseh:false,
    d20:{p:51.6,m:44.6}, j8:{p:60.1,m:38.2,pp:null,mp:null}, g22:{p:49.0,m:50.2,pp:37.1,mp:26.2}, d21:{p:41.5,m:45.9}, j9:{p:50.5,m:46.7,pp:49.0,mp:51.0} },
  { id:"dja_gap",    name:"동작갑",   x:340, y:388, w:72, h:54, candidate:"김병기", winner22:"민주", grade:2, oseh:false,
    d20:{p:50.5,m:45.7}, j8:{p:58.1,m:40.1,pp:null,mp:null}, g22:{p:45.0,m:50.5,pp:36.4,mp:25.6}, d21:{p:40.9,m:46.9}, j9:{p:49.6,m:47.2,pp:43.4,mp:49.4} },
  { id:"dja_eul",    name:"동작을",   x:418, y:388, w:72, h:54, candidate:"나경원", winner22:"국힘", grade:-1, oseh:true,
    d20:{p:50.5,m:45.7}, j8:{p:58.1,m:40.1,pp:null,mp:null}, g22:{p:54.0,m:46.0,pp:36.4,mp:25.6}, d21:{p:40.9,m:46.9}, j9:{p:49.6,m:47.2,pp:43.4,mp:49.4} },

  // 강남권
  { id:"gnm_gap",    name:"강남갑",   x:478, y:388, w:66, h:54, candidate:"서명옥", winner22:"국힘", grade:-1, oseh:true,
    d20:{p:67.0,m:30.3}, j8:{p:74.4,m:24.5,pp:72.2,mp:27.8}, g22:{p:64.2,m:35.8,pp:50.3,mp:14.9}, d21:{p:56.6,m:32.2}, j9:{p:66.0,m:31.9,pp:66.1,mp:33.9} },
  { id:"gnm_eul",    name:"강남을",   x:548, y:388, w:66, h:54, candidate:"박수민", winner22:"국힘", grade:-1, oseh:true,
    d20:{p:67.0,m:30.3}, j8:{p:74.4,m:24.5,pp:72.2,mp:27.8}, g22:{p:58.6,m:41.4,pp:50.3,mp:14.9}, d21:{p:56.6,m:32.2}, j9:{p:66.0,m:31.9,pp:66.1,mp:33.9} },
  { id:"gnm_byung",  name:"강남병",   x:478, y:446, w:66, h:54, candidate:"고동진", winner22:"국힘", grade:-1, oseh:true,
    d20:{p:67.0,m:30.3}, j8:{p:74.4,m:24.5,pp:72.2,mp:27.8}, g22:{p:66.3,m:32.8,pp:50.3,mp:14.9}, d21:{p:56.6,m:32.2}, j9:{p:66.0,m:31.9,pp:66.1,mp:33.9} },
  { id:"spb",        name:"송파병",   x:618, y:388, w:66, h:54, candidate:"남인순", winner22:"민주", grade:1, oseh:false,
    d20:{p:56.8,m:40.2}, j8:{p:64.7,m:34.0,pp:60.9,mp:37.7}, g22:{p:48.9,m:51.0,pp:41.9,mp:22.1}, d21:{p:46.6,m:42.1}, j9:{p:54.8,m:46.9,pp:54.0,mp:43.0} },
];

const GRADE_META: Record<string, {label:string,color:string,bg:string}> = {
  "1":  {label:"★★★ 1순위", color:"#ef4444", bg:"#fee2e2"},
  "2":  {label:"★★ 2순위",  color:"#3b82f6", bg:"#dbeafe"},
  "3":  {label:"★ 3순위",   color:"#f59e0b", bg:"#fef3c7"},
  "-1": {label:"국힘 현역",  color:"#8b5cf6", bg:"#ede9fe"},
  "0":  {label:"참고",       color:"#94a3b8", bg:"#f1f5f9"},
};

// 지역구 색상
function distColor(d: typeof GEO[0], selected: boolean, hovered: boolean) {
  if (selected) return C.accent;
  if (hovered) return "#c7d2fe";
  if (d.grade === -1) return "#fde8ff";
  if (d.grade === 1) return "#fee2e2";
  if (d.grade === 2) return "#dbeafe";
  if (d.grade === 3) return "#fef9c3";
  return "#f3f4f6";
}

// ── 지지율 데이터 ──────────────────────────────────────────────
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
  {q:"26Q2",lb:"'26②",lj_b:55,lj_o:60,lj_w:48},
  {q:"26Q3",lb:"'26③",lj_b:52,lj_o:57,lj_w:44},
  {q:"26Q4",lb:"'26④",lj_b:50,lj_o:55,lj_w:41},
  {q:"27Q1",lb:"'27①",lj_b:48,lj_o:53,lj_w:39},
  {q:"27Q2",lb:"'27②",lj_b:46,lj_o:51,lj_w:37},
  {q:"27Q3",lb:"'27③",lj_b:44,lj_o:49,lj_w:35},
  {q:"27Q4",lb:"'27④",lj_b:42,lj_o:47,lj_w:33},
  {q:"28Q1",lb:"'28①",lj_b:39,lj_o:45,lj_w:30},
  {q:"28Q2",lb:"'28②",lj_b:37,lj_o:43,lj_w:28},
];

const EVTS = [
  {q:"08Q2",icon:"🚨",txt:"광우병 촛불",c:"#ef4444"},
  {q:"10Q2",icon:"🗳️",txt:"5회 지선 패배",c:"#f97316"},
  {q:"12Q2",icon:"🗳️",txt:"19대 총선",c:"#f97316"},
  {q:"13Q3",icon:"📈",txt:"G20 성과",c:"#10b981"},
  {q:"14Q2",icon:"🚨",txt:"세월호",c:"#dc2626"},
  {q:"16Q2",icon:"🗳️",txt:"20대 총선 참패",c:"#dc2626"},
  {q:"16Q4",icon:"💥",txt:"최순실·탄핵",c:"#7f1d1d"},
  {q:"18Q2",icon:"🕊️",txt:"남북정상회담",c:"#10b981"},
  {q:"19Q4",icon:"💥",txt:"조국 사태",c:"#dc2626"},
  {q:"20Q1",icon:"🗳️",txt:"21대 총선 대승",c:"#3b82f6"},
  {q:"20Q4",icon:"🚨",txt:"부동산 폭등",c:"#dc2626"},
  {q:"21Q1",icon:"🗳️",txt:"4·7 재보선 참패",c:"#dc2626"},
  {q:"24Q2",icon:"🗳️",txt:"22대 총선 참패",c:"#dc2626"},
  {q:"24Q4",icon:"💥",txt:"비상계엄·탄핵",c:"#7f1d1d"},
  {q:"26Q2",icon:"⏳",txt:"9회 지방선거",c:"#f59e0b",future:true},
  {q:"28Q2",icon:"🏆",txt:"23대 총선",c:"#f59e0b",future:true},
];

const PCOLOR: Record<string,string> = {mb:"#ef4444",pk:"#8b5cf6",mn:"#3b82f6",ys:"#f97316",lj:"#10b981"};
const PLABEL: Record<string,string> = {mb:"이명박",pk:"박근혜",mn:"문재인",ys:"윤석열",lj:"이재명(실측)"};

function ChartTip({active,payload}: any) {
  if (!active||!payload?.length) return null;
  const d = payload[0]?.payload;
  const evts = EVTS.filter(e=>e.q===d?.q);
  return (
    <div style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px",
      boxShadow:"0 4px 20px #0002",maxWidth:230,fontSize:12}}>
      <div style={{fontWeight:700,color:C.text,marginBottom:5}}>{d?.lb}</div>
      {payload.filter((p:any)=>p.value!=null).map((p:any,i:number)=>(
        <div key={i} style={{color:PCOLOR[p.dataKey]||C.muted,marginBottom:2}}>
          {PLABEL[p.dataKey]||p.dataKey}: <b>{p.value}%</b>
        </div>
      ))}
      {evts.length>0 && <div style={{marginTop:6,borderTop:`1px solid ${C.border}`,paddingTop:6}}>
        {evts.map((e,i)=><div key={i} style={{color:e.c,fontSize:11,marginBottom:2}}>{e.icon} {e.txt}</div>)}
      </div>}
    </div>
  );
}

const PHASES = [
  {period:"지금 ~ 2026.06",title:"Phase 1 — 타겟 선정·포지셔닝",color:"#ef4444",badge:"🔴 NOW",
    items:[
      {icon:"🎯",t:"타겟 지역구 확정",d:"1순위(영등포을·양천갑·송파병·강동갑·하남갑·중성동을) 중 2~3개로 좁히기"},
      {icon:"📋",t:"사고당협 모니터링",d:"현재 수도권 36곳 공석. 당 조강특위 공고 수시 확인 필수"},
      {icon:"🗳️",t:"9회 지선 지원 유세",d:"목표 지역구 기초단체장 집중 지원 — 지역 얼굴 알리기 + 당내 기여 점수"},
      {icon:"🤝",t:"지역 네트워크 구축",d:"시민단체·상인회 접촉 시작. 지역 현안 파악 → 해결해주기 루틴 구축"},
    ]},
  {period:"2026.07 ~ 2026.12",title:"Phase 2 — 당협위원장 공모·확보",color:"#f97316",badge:"🟠 골든타임",
    items:[
      {icon:"📢",t:"지선 직후 공모 신청",d:"역대 패턴: 지선 후 1~2개월 내 대거 공모. 2022년 6·1지선 후 47개 동시 공모 사례. 이때가 경쟁 최저"},
      {icon:"📝",t:"조강특위 면접 대비",d:"지역 활동 실적 + 당 기여도 + 지역 민심 파악 수준. 현역 비례대표 = 역량 가점 적용"},
      {icon:"🏛️",t:"당원협의회 구성",d:"임명 후 60일 내 창당대회 → 당협위원장 추대. 운영위원 30인 이상 확보 필수"},
      {icon:"💰",t:"후원회·예산 준비",d:"사무실·행사비 자체 부담. 월 300~500만원 수준. 후원회 통한 합법적 자금 조달"},
    ]},
  {period:"2027.01 ~ 2027.12",title:"Phase 3 — 지역 밀착 브랜딩",color:"#eab308",badge:"🟡 핵심 2년",
    items:[
      {icon:"🏘️",t:"지역 민원 해결사",d:"보좌진 활용 민원 적극 처리. '이 사람이 우리 지역 챙긴다' 인식이 공천보다 먼저"},
      {icon:"📰",t:"지역 언론 정기 노출",d:"지역 신문·유튜브 월 1회 이상 인터뷰. 지역 이슈 논평 + SNS 병행"},
      {icon:"📊",t:"자체 여론조사",d:"총선 1년 전 자체 조사 실시. 30% 이상 = 공천 경쟁력 있음 기준"},
      {icon:"⚡",t:"당원 관리",d:"책임당원 확보 시스템 구축. 경선 시 당원 투표 비중이 승패 좌우"},
    ]},
  {period:"2028.01 ~ 2028.04",title:"Phase 4 — 공천 확보 & 총선",color:"#10b981",badge:"🟢 결전",
    items:[
      {icon:"🗳️",t:"공천 신청·경선 준비",d:"당협위원장 출신 = 지역 관리 실적 가점. 의정보고서·활동실적집·여론조사 결과 준비"},
      {icon:"🎯",t:"공천 전략",d:"전략공천 vs 경선 당 지도부와 사전 조율 필수. 여론조사 50%+당원 50% 혼합 방식"},
      {icon:"🏆",t:"23대 총선 본선",d:"2028년 4월. D-60 공식 선거운동 시작. 당협 2년 조직·인지도가 최종 자산"},
      {icon:"📌",t:"비례 임기 주의",d:"22대 국회 임기 2028년 5월 만료. 임기 중 당협위원장 겸직 불가 → 조직위원장으로 활동"},
    ]},
];

// ══════════════════════════════════════════════════════════════
// 메인
// ══════════════════════════════════════════════════════════════
export default function ElectionTab() {
  const [mini, setMini] = useState<"hangang"|"ash23">("hangang");
  const [sel, setSel] = useState<string|null>(null);
  const [hov, setHov] = useState<string|null>(null);
  const [scenario, setScenario] = useState(true);

  const selD = GEO.find(d=>d.id===sel);
  const targets = GEO.filter(d=>d.grade>0).sort((a,b)=>a.grade-b.grade);

  return (
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Apple SD Gothic Neo','Pretendard',sans-serif",color:C.text}}>
      {/* 미니탭 헤더 */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"10px 20px",display:"flex",gap:4}}>
        {([["hangang","🗺️ 한강벨트 분석"],["ash23","📡 23ASH"]] as const).map(([k,lb])=>(
          <button key={k} onClick={()=>setMini(k)}
            style={{padding:"7px 22px",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,
              fontWeight:mini===k?700:400,background:mini===k?C.accent:"transparent",
              color:mini===k?"#fff":C.muted,transition:"all .15s"}}>
            {lb}
          </button>
        ))}
      </div>

      {/* ── 한강벨트 분석 ── */}
      {mini==="hangang" && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 360px",height:"calc(100vh - 120px)"}}>

          {/* 좌: 지도 */}
          <div style={{background:C.surface,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column"}}>
            {/* 범례 헤더 */}
            <div style={{padding:"10px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",
              alignItems:"center",flexWrap:"wrap",gap:8}}>
              <span style={{fontSize:14,fontWeight:700,color:C.text}}>🗺️ 한강벨트 선거구 지도</span>
              <div style={{display:"flex",gap:10,marginLeft:"auto",flexWrap:"wrap"}}>
                {[
                  {c:C.g1,lb:"1순위 탈환"},{c:C.g2,lb:"2순위"},{c:C.g3,lb:"3순위"},
                  {c:"#8b5cf6",lb:"국힘 현역"},{c:"#94a3b8",lb:"기타"},
                ].map((l,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:4,fontSize:11}}>
                    <div style={{width:11,height:11,borderRadius:3,background:l.c,opacity:0.8}}/>
                    <span style={{color:C.muted}}>{l.lb}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{padding:"6px 18px",background:"#fef9f0",borderBottom:`1px solid ${C.border}`,
              fontSize:11,color:"#b45309"}}>
              🔴 붉은 테두리 = 9회 지선 오세훈(국힘) 승리 지역구 &nbsp;|&nbsp; 클릭하면 우측에 데이터가 표시됩니다
            </div>

            {/* SVG 지도 */}
            <div style={{flex:1,overflow:"auto",padding:"12px 16px"}}>
              <svg viewBox="0 0 880 530" style={{width:"100%",maxWidth:860,display:"block",margin:"0 auto",
                filter:"drop-shadow(0 2px 8px rgba(0,0,0,0.06))"}}>

                {/* 배경 서울 윤곽 (둥근 불규칙 형태) */}
                <path d="M60,160 Q80,80 180,60 Q280,40 400,50 Q520,45 620,70 Q720,90 800,140 Q860,180 860,260 Q860,340 820,400 Q780,460 700,490 Q620,520 500,520 Q380,525 300,510 Q200,490 140,440 Q80,390 60,320 Q40,260 60,160 Z"
                  fill="#f0f4ff" stroke="#c7d2fe" strokeWidth="2" opacity={0.5}/>

                {/* 한강 */}
                <path d="M120,318 Q200,295 310,300 Q400,305 490,295 Q580,285 680,290 Q750,292 820,285"
                  stroke="#93c5fd" strokeWidth="22" fill="none" strokeLinecap="round" opacity={0.55}/>
                <path d="M120,318 Q200,295 310,300 Q400,305 490,295 Q580,285 680,290 Q750,292 820,285"
                  stroke="#bfdbfe" strokeWidth="16" fill="none" strokeLinecap="round" opacity={0.4}/>
                <text x="460" y="292" fill="#3b82f6" fontSize="13" textAnchor="middle" fontWeight="600" opacity={0.7}>한강 Han River</text>

                {/* 지역구 블록 */}
                {GEO.map(d=>{
                  const fill = distColor(d, sel===d.id, hov===d.id);
                  const stroke = d.oseh ? "#ef4444" : sel===d.id ? C.accent : "#d1d5db";
                  const sw = d.oseh ? 2.5 : sel===d.id ? 2 : 1;
                  const isTarget = d.grade > 0;
                  // 3D 효과용 그림자 오프셋
                  return (
                    <g key={d.id} style={{cursor:"pointer"}}
                      onMouseEnter={()=>setHov(d.id)}
                      onMouseLeave={()=>setHov(null)}
                      onClick={()=>setSel(sel===d.id?null:d.id)}>
                      {/* 3D 측면 그림자 */}
                      <rect x={d.x+4} y={d.y+5} width={d.w} height={d.h} rx={8}
                        fill="rgba(0,0,0,0.09)" style={{pointerEvents:"none"}}/>
                      {/* 본체 */}
                      <rect x={d.x} y={d.y} width={d.w} height={d.h} rx={8}
                        fill={fill} stroke={stroke} strokeWidth={sw}
                        style={{transition:"all .18s",filter:sel===d.id?"drop-shadow(0 3px 10px #4f63d255)":"none"}}/>
                      {/* 상단 하이라이트 */}
                      <rect x={d.x+2} y={d.y+2} width={d.w-4} height={8} rx={6}
                        fill="rgba(255,255,255,0.45)" style={{pointerEvents:"none"}}/>
                      {/* 지역명 */}
                      <text x={d.x+d.w/2} y={d.y+d.h/2-5} textAnchor="middle"
                        fontSize={11} fontWeight={700}
                        fill={sel===d.id?"#fff":d.grade===-1?"#6d28d9":isTarget?"#111827":"#374151"}
                        style={{pointerEvents:"none"}}>
                        {d.name}
                      </text>
                      {/* 후보명 */}
                      <text x={d.x+d.w/2} y={d.y+d.h/2+9} textAnchor="middle"
                        fontSize={9.5} fill={sel===d.id?"rgba(255,255,255,0.85)":C.muted}
                        style={{pointerEvents:"none"}}>
                        {d.candidate}
                      </text>
                      {/* 등급 뱃지 */}
                      {isTarget && (
                        <text x={d.x+d.w/2} y={d.y+d.h-7} textAnchor="middle"
                          fontSize={8.5} fontWeight={700}
                          fill={d.grade===1?"#b91c1c":d.grade===2?"#1d4ed8":"#92400e"}
                          style={{pointerEvents:"none"}}>
                          {d.grade===1?"★★★":d.grade===2?"★★":"★"} {d.grade}순위
                        </text>
                      )}
                      {/* 오세훈 승리 표시 */}
                      {d.oseh && (
                        <circle cx={d.x+d.w-10} cy={d.y+10} r={5}
                          fill="#ef4444" style={{pointerEvents:"none"}}/>
                      )}
                    </g>
                  );
                })}

                {/* 방향 레이블 */}
                <text x={50} y={200} fontSize={10} fill={C.muted} transform="rotate(-20,50,200)">← 강서·구로</text>
                <text x={840} y={250} fontSize={10} fill={C.muted}>경기→</text>

              </svg>
            </div>

            {/* 하단 타겟 버튼 */}
            <div style={{padding:"10px 16px",borderTop:`1px solid ${C.border}`,background:"#fafbff"}}>
              <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:8}}>
                🎯 탈환 가능 지역구 (22대 패배 + 비례 국힘 우세)
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {targets.map(d=>{
                  const gm = GRADE_META[String(d.grade)];
                  return (
                    <button key={d.id} onClick={()=>setSel(d.id)}
                      style={{padding:"4px 11px",borderRadius:20,border:`1.5px solid ${gm.color}`,
                        background:sel===d.id?gm.color:gm.bg,
                        color:sel===d.id?"#fff":gm.color,
                        cursor:"pointer",fontSize:11,fontWeight:600,transition:"all .15s"}}>
                      {gm.label.split(" ")[0]} {d.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 우: 상세 패널 */}
          <div style={{background:C.surface,overflowY:"auto",borderLeft:`1px solid ${C.border}`}}>
            {!selD ? (
              <div style={{padding:28,textAlign:"center",color:C.muted}}>
                <div style={{fontSize:48,marginBottom:14}}>🗺️</div>
                <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:6}}>지역구를 선택하세요</div>
                <div style={{fontSize:12,lineHeight:1.7}}>지도에서 블록을 클릭하거나<br/>아래 버튼을 눌러보세요</div>
                <div style={{marginTop:20,display:"flex",flexDirection:"column",gap:8}}>
                  {targets.slice(0,6).map(d=>{
                    const gm = GRADE_META[String(d.grade)];
                    return (
                      <button key={d.id} onClick={()=>setSel(d.id)}
                        style={{padding:"10px 14px",borderRadius:10,border:`1px solid ${C.border}`,
                          background:C.bg,cursor:"pointer",fontSize:13,textAlign:"left",
                          display:"flex",justifyContent:"space-between",alignItems:"center",
                          transition:"background .15s"}}>
                        <span style={{fontWeight:700,color:C.text}}>{d.name}</span>
                        <span style={{fontSize:11,color:gm.color,fontWeight:600}}>{gm.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{padding:"16px 18px"}}>
                {/* 타이틀 */}
                <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:14}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:22,fontWeight:800,color:C.text}}>{selD.name}</div>
                    <div style={{fontSize:12,color:C.muted,marginTop:2}}>{selD.winner22} ({selD.candidate})</div>
                  </div>
                  {(() => {
                    const gm = GRADE_META[String(selD.grade)];
                    return (
                      <div style={{padding:"4px 12px",borderRadius:20,fontSize:12,fontWeight:700,
                        background:gm.bg,color:gm.color}}>{gm.label}</div>
                    );
                  })()}
                  <button onClick={()=>setSel(null)}
                    style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:C.muted,lineHeight:1}}>×</button>
                </div>

                {selD.grade>0 && (
                  <div style={{padding:"8px 12px",borderRadius:8,
                    background:GRADE_META[String(selD.grade)].bg,
                    border:`1px solid ${GRADE_META[String(selD.grade)].color}44`,
                    marginBottom:12,fontSize:12,color:GRADE_META[String(selD.grade)].color}}>
                    💡 {selD.grade===1?"후보격차 3%p 이내 + 비례 국힘 우세 — 후보 교체만으로도 탈환 가능":
                         selD.grade===2?"후보격차 3~6%p — 인물론 + 지역 활동으로 극복 가능":
                         "후보격차 6%p 초과 — 중장기 지역 관리 필수"}
                  </div>
                )}
                {selD.oseh && (
                  <div style={{padding:"6px 12px",borderRadius:6,background:"#fee2e2",
                    border:"1px solid #fca5a5",marginBottom:12,fontSize:11,color:"#b91c1c"}}>
                    🔴 9회 지방선거 — 오세훈(국힘) 승리 지역
                  </div>
                )}

                {/* 선거별 득표율 */}
                {[
                  {label:"제20대 대선 (2022.3)",  ph:selD.d20.p, pm:selD.d20.m},
                  {label:"제8회 지방선거 후보 (2022.6)", ph:selD.j8.p, pm:selD.j8.m, pph:selD.j8.pp, ppm:selD.j8.mp},
                  {label:"제22대 총선 (2024.4)",  ph:selD.g22.p, pm:selD.g22.m, pph:selD.g22.pp, ppm:selD.g22.mp},
                  {label:"제21대 대선 (2025.6)",  ph:selD.d21.p, pm:selD.d21.m},
                  {label:"제9회 지방선거 (2026.6)", ph:selD.j9.p, pm:selD.j9.m, pph:selD.j9.pp, ppm:selD.j9.mp},
                ].map((row,ri)=>(
                  <div key={ri} style={{marginBottom:14}}>
                    <div style={{fontSize:11,fontWeight:700,color:C.muted,marginBottom:7}}>{row.label}</div>
                    <div style={{marginBottom:5}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                        <span style={{color:C.pph,fontWeight:700}}>국민의힘 {row.ph}%</span>
                        <span style={{fontSize:11,color:C.muted}}>후보</span>
                        <span style={{color:C.pmi,fontWeight:700}}>{row.pm}% 민주당</span>
                      </div>
                      <div style={{display:"flex",height:10,borderRadius:5,overflow:"hidden",background:C.border}}>
                        <div style={{width:`${row.ph}%`,background:C.pph,transition:"width .5s"}}/>
                        <div style={{flex:1,background:C.pmi}}/>
                      </div>
                      <div style={{textAlign:"center",fontSize:10,color:C.muted,marginTop:2}}>
                        격차: <b style={{color:(row.ph-row.pm)>0?C.pph:C.pmi}}>{(row.ph-row.pm)>0?"+":""}{(row.ph-row.pm).toFixed(1)}%p</b>
                      </div>
                    </div>
                    {row.pph!=null && row.pph!=undefined && (
                      <div>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted,marginBottom:2}}>
                          <span>비례 국힘 {row.pph}%</span><span>비례 민주 {row.ppm}%</span>
                        </div>
                        <div style={{display:"flex",height:6,borderRadius:3,overflow:"hidden",background:C.border,opacity:0.75}}>
                          <div style={{width:`${row.pph}%`,background:"#fca5a5"}}/>
                          <div style={{flex:1,background:"#93c5fd"}}/>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* 핵심 지표 그리드 */}
                {selD.grade>0 && (
                  <div style={{background:C.bg,borderRadius:10,padding:14,marginTop:4,border:`1px solid ${C.border}`}}>
                    <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:10}}>📊 탈환 전략 핵심 지표</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                      {[
                        {lb:"22대 후보 격차",v:`${(selD.g22.p-selD.g22.m).toFixed(1)}%p`,c:(selD.g22.p-selD.g22.m)>0?"#16a34a":"#dc2626"},
                        {lb:"22대 비례 격차",v:`+${selD.g22.pp!=null?(selD.g22.pp-selD.g22.mp!).toFixed(1):"N/A"}%p`,c:"#16a34a"},
                        {lb:"9회 지선 후보",v:`${(selD.j9.p-selD.j9.m).toFixed(1)}%p`,c:(selD.j9.p-selD.j9.m)>0?"#16a34a":"#dc2626"},
                        {lb:"21대 대선 격차",v:`${(selD.d21.p-selD.d21.m).toFixed(1)}%p`,c:(selD.d21.p-selD.d21.m)>0?"#16a34a":"#dc2626"},
                      ].map((m,i)=>(
                        <div key={i} style={{background:C.surface,borderRadius:8,padding:"10px 12px",
                          border:`1px solid ${C.border}`}}>
                          <div style={{fontSize:10,color:C.muted,marginBottom:4}}>{m.lb}</div>
                          <div style={{fontSize:18,fontWeight:800,color:m.c}}>{m.v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 23ASH ── */}
      {mini==="ash23" && (
        <div style={{padding:"16px 22px",overflowY:"auto",maxHeight:"calc(100vh - 120px)"}}>

          {/* 차트 카드 */}
          <div style={{background:C.surface,borderRadius:14,padding:"18px 10px 14px",
            boxShadow:"0 1px 8px #0001",border:`1px solid ${C.border}`,marginBottom:18}}>
            <div style={{paddingLeft:14,marginBottom:12,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <span style={{fontSize:14,fontWeight:700,color:C.text}}>
                📡 역대 대통령 지지율 + 이재명 정부 시나리오 (2008~2028)
              </span>
              <button onClick={()=>setScenario(s=>!s)}
                style={{marginLeft:"auto",padding:"4px 14px",borderRadius:16,
                  border:`1px solid ${C.border}`,background:scenario?C.accent:"transparent",
                  color:scenario?"#fff":C.muted,cursor:"pointer",fontSize:11}}>
                {scenario?"✅ 예측 시나리오 ON":"예측 시나리오 OFF"}
              </button>
            </div>
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={APPROVAL} margin={{top:8,right:20,left:-10,bottom:8}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                <XAxis dataKey="lb" tick={{fontSize:8,fill:C.muted}} interval={3}/>
                <YAxis domain={[0,90]} tickFormatter={v=>`${v}%`} tick={{fontSize:10,fill:C.muted}}/>
                <Tooltip content={<ChartTip/>}/>
                <ReferenceLine y={50} stroke="#e2e8f0" strokeDasharray="4 3"/>
                <ReferenceLine y={30} stroke="#fecaca" strokeDasharray="3 2"/>
                {scenario && <ReferenceArea x1="'26②" x2="'28②" fill="#fafbff" fillOpacity={0.7}/>}
                {EVTS.filter(e=>!e.future||scenario).map((e,i)=>{
                  const idx=APPROVAL.findIndex(d=>d.q===e.q);
                  if(idx<0) return null;
                  return <ReferenceLine key={i} x={APPROVAL[idx].lb}
                    stroke={e.c} strokeWidth={e.future?1.5:1.2} strokeOpacity={0.65}
                    strokeDasharray={e.future?"6 3":"none"}/>;
                })}
                {(["mb","pk","mn","ys","lj"] as const).map(k=>(
                  <Line key={k} type="monotone" dataKey={k} stroke={PCOLOR[k]} strokeWidth={2.5}
                    dot={false} connectNulls={false}/>
                ))}
                {scenario && <>
                  <Line type="monotone" dataKey="lj_b" stroke="#10b981" strokeWidth={2}
                    strokeDasharray="7 3" dot={false} connectNulls={false}/>
                  <Line type="monotone" dataKey="lj_o" stroke="#6ee7b7" strokeWidth={1.5}
                    strokeDasharray="4 4" dot={false} connectNulls={false}/>
                  <Line type="monotone" dataKey="lj_w" stroke="#f87171" strokeWidth={1.5}
                    strokeDasharray="4 4" dot={false} connectNulls={false}/>
                </>}
              </LineChart>
            </ResponsiveContainer>
            <div style={{display:"flex",gap:16,paddingLeft:16,flexWrap:"wrap",marginTop:6}}>
              {(["이명박","박근혜","문재인","윤석열","이재명(실측)"] as const).map((n,i)=>{
                const colors = [C.pph,"#8b5cf6",C.pmi,"#f97316","#10b981"];
                return (
                  <div key={n} style={{display:"flex",alignItems:"center",gap:5,fontSize:11}}>
                    <div style={{width:20,height:3,background:colors[i],borderRadius:2}}/>
                    <span style={{color:colors[i],fontWeight:600}}>{n}</span>
                  </div>
                );
              })}
              {scenario && <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11}}>
                <div style={{width:20,height:2,borderTop:"2px dashed #10b981"}}/>
                <span style={{color:C.muted}}>이재명 예측(기본/낙관/비관)</span>
              </div>}
            </div>
          </div>

          {/* 변곡점 카드 */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:12,marginBottom:18}}>
            {[
              {date:"2026.06.03",title:"9회 지방선거",icon:"🗳️",color:C.accent,
               desc:"이재명 정부 1주년 민심 심판. 허니문 여권 강세 예상.",
               tip:"국힘 패배 시 지지율 하락 → 역설적으로 새 인물 등판 기회"},
              {date:"2026.07~12",title:"당협 골든타임",icon:"🏛️",color:"#f97316",
               desc:"지선 직후 공석 당협 대거 발생. 경쟁이 가장 낮은 타이밍.",
               tip:"지선 후 1~2개월 내 공모 공고 — 역대 47개 동시 공모 사례"},
              {date:"2027 상반기",title:"이재명 지지율 변곡",icon:"📉",color:"#8b5cf6",
               desc:"역대 패턴: 취임 2년차부터 부동산·경제 이슈로 하락 시작.",
               tip:"야당 기회 열림 — 지역 인지도 극대화 집중 타이밍"},
              {date:"2028.04",title:"23대 총선",icon:"🏆",color:"#10b981",
               desc:"이재명 3년차. 패턴상 40~47% 지지율 예상. 국힘 유리 환경.",
               tip:"당협 2년 활동 + 후보 개인 브랜드 = 탈환 가능"},
            ].map((c,i)=>(
              <div key={i} style={{background:C.surface,borderRadius:12,padding:14,
                border:`1px solid ${c.color}33`,boxShadow:"0 1px 4px #0001"}}>
                <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
                  <span style={{fontSize:22}}>{c.icon}</span>
                  <div>
                    <div style={{fontSize:10,color:C.muted}}>{c.date}</div>
                    <div style={{fontSize:13,fontWeight:700,color:c.color}}>{c.title}</div>
                  </div>
                </div>
                <div style={{fontSize:12,color:C.text,lineHeight:1.6,marginBottom:8}}>{c.desc}</div>
                <div style={{fontSize:11,background:C.bg,borderRadius:6,padding:"6px 10px",
                  color:C.text,lineHeight:1.5}}>💡 {c.tip}</div>
              </div>
            ))}
          </div>

          {/* 로드맵 */}
          <div style={{background:C.surface,borderRadius:14,padding:18,
            border:`1px solid ${C.border}`,boxShadow:"0 1px 6px #0001"}}>
            <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:14}}>
              🗺️ 비례대표 → 지역구 전환 로드맵
            </div>
            {/* 타임라인 */}
            <div style={{display:"flex",overflowX:"auto",gap:2,marginBottom:18,paddingBottom:4}}>
              {[
                {p:"2025 하반기",lb:"타겟 선정",c:"#ef4444",n:"NOW"},
                {p:"2026 상반기",lb:"지선 지원",c:"#f97316",n:"6·3지선"},
                {p:"2026 하반기",lb:"당협 공모",c:"#eab308",n:"골든타임"},
                {p:"2027 상반기",lb:"당협 활동",c:"#10b981",n:"2년 플랜"},
                {p:"2027 하반기",lb:"여론조사",c:"#3b82f6",n:"D-1년"},
                {p:"2028 Q1",   lb:"공천 신청",c:"#8b5cf6",n:"결전"},
                {p:"2028 Q2",   lb:"🏆 23대 총선",c:"#f59e0b",n:"4월"},
              ].map((s,i,arr)=>(
                <div key={i} style={{display:"flex",alignItems:"center",flex:1,minWidth:88}}>
                  <div style={{flex:1,background:s.c,borderRadius:10,padding:"8px 6px",textAlign:"center",
                    boxShadow:"0 2px 6px rgba(0,0,0,0.15)"}}>
                    <div style={{fontSize:9,color:"rgba(255,255,255,0.8)",marginBottom:2}}>{s.p}</div>
                    <div style={{fontSize:11,fontWeight:700,color:"#fff",lineHeight:1.3}}>{s.lb}</div>
                    <div style={{fontSize:9,color:"rgba(255,255,255,0.75)",marginTop:3,
                      background:"rgba(0,0,0,0.18)",borderRadius:4,padding:"1px 5px",display:"inline-block"}}>{s.n}</div>
                  </div>
                  {i<arr.length-1 && <div style={{width:16,textAlign:"center",color:C.muted,fontSize:16,flexShrink:0}}>→</div>}
                </div>
              ))}
            </div>

            {PHASES.map((ph,pi)=>(
              <div key={pi} style={{marginBottom:14,borderRadius:12,overflow:"hidden",
                border:`1px solid ${ph.color}33`}}>
                <div style={{background:`linear-gradient(135deg,${ph.color},${ph.color}cc)`,
                  padding:"9px 16px",display:"flex",alignItems:"center",gap:8}}>
                  <span style={{color:"#fff",fontWeight:700,fontSize:13}}>{ph.title}</span>
                  <span style={{marginLeft:"auto",fontSize:11,color:"rgba(255,255,255,0.9)",
                    background:"rgba(0,0,0,0.18)",borderRadius:10,padding:"2px 9px"}}>{ph.period}</span>
                  <span style={{fontSize:13}}>{ph.badge}</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))"}}>
                  {ph.items.map((it,ii)=>(
                    <div key={ii} style={{padding:"11px 14px",
                      borderRight:ii<ph.items.length-1?`1px solid ${C.border}`:"none",
                      borderTop:`1px solid ${C.border}`}}>
                      <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:5}}>
                        <span style={{fontSize:17}}>{it.icon}</span>
                        <span style={{fontSize:12,fontWeight:700,color:C.text}}>{it.t}</span>
                      </div>
                      <div style={{fontSize:11,color:C.muted,lineHeight:1.65}}>{it.d}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div style={{background:"#fffbeb",borderRadius:8,padding:"10px 14px",
              border:"1px solid #fde68a",display:"grid",
              gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:6,
              fontSize:11,color:"#92400e",lineHeight:1.7}}>
              <div>⚠️ <b>비례 임기 중 당협위원장 겸직 불가</b> — 조직위원장 자격으로만 활동</div>
              <div>⚠️ <b>현역 없는 공석 지역구 우선</b> — 현역 의원 재출마 지역은 경선 불리</div>
              <div>⚠️ <b>당협 ≠ 자동 공천</b> — 여론조사 경쟁력 관리 필수. 30% 이상이 기준</div>
              <div>⚠️ <b>강남 본적 스토리</b> — '강남 출신이 한강벨트 돌아본다' 내러티브 활용</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
