import { useState, useRef, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, ReferenceArea
} from "recharts";

// ══════════════════════════════════════════════════════════════
// ASH 디자인 토큰 (globals.css 기반)
// ══════════════════════════════════════════════════════════════
const T = {
  bg: "#f5f6fa",
  surface: "#ffffff",
  accent: "#4f63d2",
  accent2: "#7c4dff",
  pos: "#16a34a",
  neg: "#dc2626",
  text: "#1a1f36",
  muted: "#8892b0",
  border: "#e2e8f0",
  pph: "#ef4444",  // 국민의힘 빨강
  pmi: "#2563eb",  // 민주당 파랑
};

// ══════════════════════════════════════════════════════════════
// 한강벨트 선거구 데이터 (이미지에서 추출)
// ══════════════════════════════════════════════════════════════
const DISTRICTS = [
  {
    id:"yangcheon_gap", name:"양천갑", winner22:"민주(황희)", oseh_won:false,
    d20:{ pph:50.13, pmi:46.39 },
    j8:{ pph:58.77, pmi:39.73, pph_p:55.28, pmi_p:44.71 },
    g22:{ pph:48.16, pmi:49.78, pph_p:36.99, pmi_p:25.21, hsin:25.21, gsin:4.38 },
    d21:{ pph:41.28, pmi:48.28 },
    j9:{ pph:49.22, pmi:48.48, pph_p:47.86, pmi_p:52.13 },
    note:"후보격차 -1.6%p / 비례+11.8%p", grade:1,
    x:120, y:200,
  },
  {
    id:"ydeungpo_gap", name:"영등포갑", winner22:"민주(채현일)", oseh_won:false,
    d20:{ pph:51.64, pmi:44.60 },
    j8:{ pph:60.06, pmi:38.22, pph_p:null, pmi_p:null },
    g22:{ pph:41.67, pmi:54.53, pph_p:37.07, pmi_p:26.17, hsin:22.33, gsin:5.30 },
    d21:{ pph:41.55, pmi:45.91 },
    j9:{ pph:50.50, pmi:46.68, pph_p:48.97, pmi_p:51.02 },
    note:"후보격차 -12.8%p / 비례+10.9%p", grade:3,
    x:145, y:218,
  },
  {
    id:"ydeungpo_eul", name:"영등포을", winner22:"민주(김민석)", oseh_won:false,
    d20:{ pph:51.64, pmi:44.60 },
    j8:{ pph:60.06, pmi:38.22, pph_p:null, pmi_p:null },
    g22:{ pph:49.03, pmi:50.18, pph_p:37.07, pmi_p:26.17, hsin:22.33, gsin:5.30 },
    d21:{ pph:41.55, pmi:45.91 },
    j9:{ pph:50.50, pmi:46.68, pph_p:48.97, pmi_p:51.02 },
    note:"후보격차 -1.2%p / 비례+10.9%p", grade:1,
    x:162, y:218,
  },
  {
    id:"mapo_gap", name:"마포갑", winner22:"민주(이지은)", oseh_won:false,
    d20:{ pph:49.03, pmi:46.50 },
    j8:{ pph:56.57, pmi:40.83, pph_p:52.22, pmi_p:47.77 },
    g22:{ pph:48.30, pmi:47.70, pph_p:34.62, pmi_p:25.17, hsin:24.25, gsin:4.45 },
    d21:{ pph:39.11, pmi:48.41 },
    j9:{ pph:49.88, pmi:49.61, pph_p:45.81, pmi_p:54.18 },
    note:"국힘 후보 勝 (조정훈→이지은 민주승)", grade:0,
    x:180, y:175,
  },
  {
    id:"yongsan", name:"용산", winner22:"국힘(권영세)", oseh_won:true,
    d20:{ pph:56.44, pmi:39.86 },
    j8:{ pph:64.93, pmi:33.26, pph_p:null, pmi_p:null },
    g22:{ pph:51.77, pmi:47.02, pph_p:42.35, pmi_p:22.16, hsin:20.95, gsin:4.61 },
    d21:{ pph:47.60, pmi:41.14 },
    j9:{ pph:57.09, pmi:40.22, pph_p:55.32, pmi_p:44.67 },
    note:"국힘 현역 지역구", grade:-1,
    x:222, y:200,
  },
  {
    id:"jungseongdong_gap", name:"중성동갑", winner22:"민주(전현희)", oseh_won:false,
    d20:{ pph:50.96, pmi:45.42 },
    j8:{ pph:58.45, pmi:39.92, pph_p:54.53, pmi_p:45.46 },
    g22:{ pph:47.38, pmi:52.61, pph_p:38.81, pmi_p:24.78, hsin:22.61, gsin:4.33 },
    d21:{ pph:42.00, pmi:46.84 },
    j9:{ pph:49.60, pmi:47.92, pph_p:48.56, pmi_p:51.43 },
    note:"후보격차 -5.2%p / 비례+14.0%p", grade:2,
    x:258, y:185,
  },
  {
    id:"jungseongdong_eul", name:"중성동을", winner22:"민주(박성준)", oseh_won:false,
    d20:{ pph:50.96, pmi:45.42 },
    j8:{ pph:58.45, pmi:39.92, pph_p:54.53, pmi_p:45.46 },
    g22:{ pph:48.53, pmi:50.81, pph_p:38.81, pmi_p:24.78, hsin:22.61, gsin:4.33 },
    d21:{ pph:42.00, pmi:46.84 },
    j9:{ pph:49.60, pmi:47.92, pph_p:48.56, pmi_p:51.43 },
    note:"후보격차 -2.3%p / 비례+14.0%p", grade:1,
    x:272, y:185,
  },
  {
    id:"gwangjin_gap", name:"광진갑", winner22:"민주(이정헌)", oseh_won:false,
    d20:{ pph:48.82, pmi:47.19 },
    j8:{ pph:58.31, pmi:39.98, pph_p:53.59, pmi_p:46.40 },
    g22:{ pph:47.46, pmi:52.53, pph_p:35.85, pmi_p:28.64, hsin:22.30, gsin:4.02 },
    d21:{ pph:39.86, pmi:48.09 },
    j9:{ pph:48.68, pmi:48.64, pph_p:47.34, pmi_p:52.65 },
    note:"후보격차 -5.0%p / 비례+7.2%p", grade:2,
    x:308, y:175,
  },
  {
    id:"gwangjin_eul", name:"광진을", winner22:"민주(고민정)", oseh_won:false,
    d20:{ pph:48.82, pmi:47.19 },
    j8:{ pph:58.31, pmi:39.98, pph_p:53.59, pmi_p:46.40 },
    g22:{ pph:47.60, pmi:51.47, pph_p:35.85, pmi_p:28.64, hsin:22.30, gsin:4.02 },
    d21:{ pph:39.86, pmi:48.09 },
    j9:{ pph:48.48, pmi:48.64, pph_p:47.34, pmi_p:52.65 },
    note:"후보격차 -3.9%p / 비례+7.2%p", grade:2,
    x:322, y:182,
  },
  {
    id:"dongja_gap", name:"동작갑", winner22:"민주(김병기)", oseh_won:false,
    d20:{ pph:50.51, pmi:45.74 },
    j8:{ pph:58.11, pmi:40.13, pph_p:null, pmi_p:null },
    g22:{ pph:45.01, pmi:50.49, pph_p:36.42, pmi_p:25.55, hsin:23.45, gsin:4.36 },
    d21:{ pph:40.94, pmi:46.91 },
    j9:{ pph:49.56, pmi:47.23, pph_p:43.23, pmi_p:49.38 },
    note:"후보격차 -5.5%p / 비례+10.8%p", grade:2,
    x:200, y:230,
  },
  {
    id:"dongja_eul", name:"동작을", winner22:"국힘(나경원)", oseh_won:true,
    d20:{ pph:50.51, pmi:45.74 },
    j8:{ pph:58.11, pmi:40.13, pph_p:null, pmi_p:null },
    g22:{ pph:54.01, pmi:45.98, pph_p:36.42, pmi_p:25.55, hsin:23.45, gsin:4.36 },
    d21:{ pph:40.94, pmi:46.91 },
    j9:{ pph:49.56, pmi:47.23, pph_p:43.23, pmi_p:49.38 },
    note:"22대 국힘 승리 지역구", grade:-1,
    x:216, y:236,
  },
  {
    id:"gangnam_gap", name:"강남갑", winner22:"국힘(서명옥)", oseh_won:true,
    d20:{ pph:67.01, pmi:30.35 },
    j8:{ pph:74.38, pmi:24.45, pph_p:72.23, pmi_p:27.76 },
    g22:{ pph:64.18, pmi:35.81, pph_p:50.32, pmi_p:14.91, hsin:19.25, gsin:6.65 },
    d21:{ pph:56.58, pmi:32.23 },
    j9:{ pph:65.96, pmi:31.92, pph_p:66.08, pmi_p:33.91 },
    note:"강남 텃밭 — 국힘 압도", grade:-1,
    x:255, y:255,
  },
  {
    id:"gangnam_eul", name:"강남을", winner22:"국힘(박수민)", oseh_won:true,
    d20:{ pph:67.01, pmi:30.35 },
    j8:{ pph:74.38, pmi:24.45, pph_p:72.23, pmi_p:27.76 },
    g22:{ pph:58.57, pmi:41.42, pph_p:50.32, pmi_p:14.91, hsin:19.25, gsin:6.65 },
    d21:{ pph:56.58, pmi:32.23 },
    j9:{ pph:65.96, pmi:31.92, pph_p:66.08, pmi_p:33.91 },
    note:"강남 텃밭 — 국힘 압도", grade:-1,
    x:268, y:260,
  },
  {
    id:"gangnam_byung", name:"강남병", winner22:"국힘(고동진)", oseh_won:true,
    d20:{ pph:67.01, pmi:30.35 },
    j8:{ pph:74.38, pmi:24.45, pph_p:72.23, pmi_p:27.76 },
    g22:{ pph:66.28, pmi:32.75, pph_p:50.32, pmi_p:14.91, hsin:19.25, gsin:6.65 },
    d21:{ pph:56.58, pmi:32.23 },
    j9:{ pph:65.96, pmi:31.92, pph_p:66.08, pmi_p:33.91 },
    note:"강남 텃밭 — 국힘 압도", grade:-1,
    x:280, y:255,
  },
  {
    id:"gangdong_gap", name:"강동갑", winner22:"민주(진선미)", oseh_won:false,
    d20:{ pph:51.70, pmi:44.80 },
    j8:{ pph:60.56, pmi:37.85, pph_p:55.95, pmi_p:40.07 },
    g22:{ pph:47.88, pmi:50.12, pph_p:38.08, pmi_p:26.01, hsin:22.48, gsin:4.52 },
    d21:{ pph:42.99, pmi:46.18 },
    j9:{ pph:50.65, pmi:46.95, pph_p:49.86, pmi_p:50.13 },
    note:"후보격차 -2.2%p / 비례+12.1%p", grade:1,
    x:350, y:190,
  },
  {
    id:"gangdong_eul", name:"강동을", winner22:"민주(이해식)", oseh_won:false,
    d20:{ pph:51.70, pmi:44.80 },
    j8:{ pph:60.56, pmi:37.85, pph_p:55.95, pmi_p:40.07 },
    g22:{ pph:44.68, pmi:53.55, pph_p:38.08, pmi_p:26.01, hsin:22.48, gsin:4.52 },
    d21:{ pph:42.99, pmi:46.18 },
    j9:{ pph:50.65, pmi:46.95, pph_p:49.86, pmi_p:50.13 },
    note:"후보격차 -8.8%p / 비례+12.1%p", grade:3,
    x:364, y:197,
  },
  {
    id:"songpa_byung", name:"송파병", winner22:"민주(남인순)", oseh_won:false,
    d20:{ pph:56.76, pmi:40.15 },
    j8:{ pph:64.69, pmi:34.04, pph_p:60.85, pmi_p:37.65 },
    g22:{ pph:48.95, pmi:51.04, pph_p:41.88, pmi_p:22.05, hsin:21.85, gsin:5.24 },
    d21:{ pph:46.59, pmi:42.11 },
    j9:{ pph:54.77, pmi:46.95, pph_p:54.03, pmi_p:42.99 },
    note:"후보격차 -2.1%p / 비례+19.8%p ★최고갭", grade:1,
    x:318, y:240,
  },
  {
    id:"hanam_gap", name:"하남갑", winner22:"민주(추미애)", oseh_won:false,
    d20:{ pph:48.26, pmi:48.75 },
    j8:{ pph:50.46, pmi:47.88, pph_p:52.89, pmi_p:47.10 },
    g22:{ pph:49.41, pmi:50.58, pph_p:35.72, pmi_p:26.03, hsin:26.90, gsin:3.69 },
    d21:{ pph:39.54, pmi:50.68 },
    j9:{ pph:39.37, pmi:55.04, pph_p:49.86, pmi_p:50.13 },
    note:"후보격차 -1.2%p / 비례+9.7%p", grade:1,
    x:400, y:195,
  },
];

// 탈환 가능성 등급
const GRADE_INFO = {
  1: { label:"★★★ 1순위", color:"#10b981", bg:"#dcfce7", desc:"후보격차 3%p 이내 + 비례우위" },
  2: { label:"★★ 2순위",  color:"#3b82f6", bg:"#dbeafe", desc:"후보격차 3~6%p 범위" },
  3: { label:"★ 3순위",   color:"#f59e0b", bg:"#fef3c7", desc:"후보격차 6%p 초과" },
 "-1":{ label:"국힘 현역", color:"#8b5cf6", bg:"#ede9fe", desc:"22대 국힘이 이긴 지역구" },
  0:  { label:"분석 제외", color:"#94a3b8", bg:"#f1f5f9", desc:"현역 구도 상이" },
};

// ══════════════════════════════════════════════════════════════
// 지지율 + 정치 이벤트 데이터 (23ASH 탭)
// ══════════════════════════════════════════════════════════════
const APPROVAL_DATA = [
  // 이명박
  { q:"08Q1", lb:"'08①", mb:52 },{ q:"08Q2", lb:"'08②", mb:24 },{ q:"08Q3", lb:"'08③", mb:26 },{ q:"08Q4", lb:"'08④", mb:29 },
  { q:"09Q1", lb:"'09①", mb:35 },{ q:"09Q2", lb:"'09②", mb:40 },{ q:"09Q3", lb:"'09③", mb:48 },{ q:"09Q4", lb:"'09④", mb:47 },
  { q:"10Q1", lb:"'10①", mb:49 },{ q:"10Q2", lb:"'10②", mb:44 },{ q:"10Q3", lb:"'10③", mb:46 },{ q:"10Q4", lb:"'10④", mb:47 },
  { q:"11Q1", lb:"'11①", mb:45 },{ q:"11Q2", lb:"'11②", mb:38 },{ q:"11Q3", lb:"'11③", mb:33 },{ q:"11Q4", lb:"'11④", mb:30 },
  { q:"12Q1", lb:"'12①", mb:27 },{ q:"12Q2", lb:"'12②", mb:24 },{ q:"12Q3", lb:"'12③", mb:21 },{ q:"12Q4", lb:"'12④", mb:24 },
  // 박근혜
  { q:"13Q1", lb:"'13①", pk:56 },{ q:"13Q2", lb:"'13②", pk:61 },{ q:"13Q3", lb:"'13③", pk:67 },{ q:"13Q4", lb:"'13④", pk:55 },
  { q:"14Q1", lb:"'14①", pk:57 },{ q:"14Q2", lb:"'14②", pk:43 },{ q:"14Q3", lb:"'14③", pk:47 },{ q:"14Q4", lb:"'14④", pk:46 },
  { q:"15Q1", lb:"'15①", pk:31 },{ q:"15Q2", lb:"'15②", pk:33 },{ q:"15Q3", lb:"'15③", pk:42 },{ q:"15Q4", lb:"'15④", pk:45 },
  { q:"16Q1", lb:"'16①", pk:40 },{ q:"16Q2", lb:"'16②", pk:31 },{ q:"16Q3", lb:"'16③", pk:35 },{ q:"16Q4", lb:"'16④", pk:7 },
  // 문재인
  { q:"17Q2", lb:"'17②", mn:84 },{ q:"17Q3", lb:"'17③", mn:77 },{ q:"17Q4", lb:"'17④", mn:72 },
  { q:"18Q1", lb:"'18①", mn:70 },{ q:"18Q2", lb:"'18②", mn:72 },{ q:"18Q3", lb:"'18③", mn:59 },{ q:"18Q4", lb:"'18④", mn:52 },
  { q:"19Q1", lb:"'19①", mn:47 },{ q:"19Q2", lb:"'19②", mn:46 },{ q:"19Q3", lb:"'19③", mn:47 },{ q:"19Q4", lb:"'19④", mn:44 },
  { q:"20Q1", lb:"'20①", mn:51 },{ q:"20Q2", lb:"'20②", mn:57 },{ q:"20Q3", lb:"'20③", mn:50 },{ q:"20Q4", lb:"'20④", mn:43 },
  { q:"21Q1", lb:"'21①", mn:37 },{ q:"21Q2", lb:"'21②", mn:34 },{ q:"21Q3", lb:"'21③", mn:36 },{ q:"21Q4", lb:"'21④", mn:38 },
  { q:"22Q1", lb:"'22①", mn:38 },
  // 윤석열
  { q:"22Q2", lb:"'22②", ys:45 },{ q:"22Q3", lb:"'22③", ys:28 },{ q:"22Q4", lb:"'22④", ys:32 },
  { q:"23Q1", lb:"'23①", ys:35 },{ q:"23Q2", lb:"'23②", ys:33 },{ q:"23Q3", lb:"'23③", ys:33 },{ q:"23Q4", lb:"'23④", ys:34 },
  { q:"24Q1", lb:"'24①", ys:38 },{ q:"24Q2", lb:"'24②", ys:24 },{ q:"24Q3", lb:"'24③", ys:24 },{ q:"24Q4", lb:"'24④", ys:20 },
  // 이재명 실측
  { q:"25Q2", lb:"'25②", lj:58 },{ q:"25Q3", lb:"'25③", lj:63 },{ q:"25Q4", lb:"'25④", lj:65 },{ q:"26Q1", lb:"'26①", lj:63 },
  // 이재명 예측
  { q:"26Q2", lb:"'26②", lj_b:55, lj_o:60, lj_w:48 },
  { q:"26Q3", lb:"'26③", lj_b:52, lj_o:57, lj_w:44 },
  { q:"26Q4", lb:"'26④", lj_b:50, lj_o:55, lj_w:41 },
  { q:"27Q1", lb:"'27①", lj_b:48, lj_o:53, lj_w:39 },
  { q:"27Q2", lb:"'27②", lj_b:46, lj_o:51, lj_w:37 },
  { q:"27Q3", lb:"'27③", lj_b:44, lj_o:49, lj_w:35 },
  { q:"27Q4", lb:"'27④", lj_b:42, lj_o:47, lj_w:33 },
  { q:"28Q1", lb:"'28①", lj_b:39, lj_o:45, lj_w:30 },
  { q:"28Q2", lb:"'28②", lj_b:37, lj_o:43, lj_w:28 },
];

const EVENTS = [
  { q:"08Q2", icon:"🚨", txt:"광우병 촛불집회", who:"이명박", c:"#ef4444" },
  { q:"10Q2", icon:"🗳️", txt:"5회 지선 패배", who:"이명박", c:"#f97316" },
  { q:"12Q2", icon:"🗳️", txt:"19대 총선", who:"이명박", c:"#f97316" },
  { q:"13Q3", icon:"📈", txt:"G20 외교 성과", who:"박근혜", c:"#10b981" },
  { q:"14Q2", icon:"🚨", txt:"세월호 참사", who:"박근혜", c:"#dc2626" },
  { q:"16Q2", icon:"🗳️", txt:"20대 총선 참패", who:"박근혜", c:"#dc2626" },
  { q:"16Q4", icon:"💥", txt:"최순실 게이트·탄핵", who:"박근혜", c:"#7f1d1d" },
  { q:"18Q2", icon:"🕊️", txt:"남북정상회담", who:"문재인", c:"#10b981" },
  { q:"19Q4", icon:"💥", txt:"조국 사태", who:"문재인", c:"#dc2626" },
  { q:"20Q1", icon:"🗳️", txt:"21대 총선 압승", who:"문재인", c:"#3b82f6" },
  { q:"20Q4", icon:"🚨", txt:"부동산 폭등·LH", who:"문재인", c:"#dc2626" },
  { q:"21Q1", icon:"🗳️", txt:"4·7 재보선 참패", who:"문재인", c:"#dc2626" },
  { q:"24Q2", icon:"🗳️", txt:"22대 총선 참패", who:"윤석열", c:"#dc2626" },
  { q:"24Q4", icon:"💥", txt:"비상계엄·탄핵", who:"윤석열", c:"#7f1d1d" },
  // 미래
  { q:"26Q2", icon:"⏳", txt:"9회 지방선거 (6·3)", who:"이재명(예측)", c:"#f59e0b", future:true },
  { q:"27Q1", icon:"⏳", txt:"비례→당협 2년 활동 중반", who:"전략", c:"#6366f1", future:true },
  { q:"28Q2", icon:"🏆", txt:"23대 총선 (4월)", who:"이재명(예측)", c:"#f59e0b", future:true },
];

// 당협 로드맵
const PHASES = [
  {
    period:"지금 ~ 2026.06",
    title:"Phase 1 — 타겟 지역 선정·포지셔닝",
    color:"#ef4444",
    badge:"🔴 NOW",
    items:[
      { icon:"🎯", t:"타겟 지역구 확정", d:"12개 후보지 중 1순위(영등포을·양천갑·송파병·강동갑·중성동을) 좁히기. 비례 의원 이력·전문분야와 지역 특성 매칭." },
      { icon:"📋", t:"사고당협 공모 모니터링", d:"현재 수도권 36곳 공석. 당 조강특위 공고 사이트 구독 필수. 2025년 10월 기준 공모 중." },
      { icon:"🗳️", t:"9회 지선(2026.6) 지원 유세", d:"목표 지역구 기초단체장·시의원 후보 집중 지원. 지역 주민 얼굴 알리기 + 당내 기여도 점수 동시에." },
      { icon:"🤝", t:"지역 네트워크 구축", d:"시민단체·상인회·주민자치위 접촉 시작. 지역 현안 파악 → 내 이름으로 해결해주기 루틴." },
    ]
  },
  {
    period:"2026.07 ~ 2026.12",
    title:"Phase 2 — 당협위원장 공모·확보",
    color:"#f97316",
    badge:"🟠 골든타임",
    items:[
      { icon:"📢", t:"지선 직후 공모 신청", d:"역대 패턴: 지선 종료 1~2개월 내 공석 당협 공모 공고. 2022년 6·1 지선 후 47개 공모가 사례. 이 타이밍이 경쟁 가장 낮음." },
      { icon:"📝", t:"조강특위 면접 대비", d:"지역 활동 실적 + 당 기여도 + 지역 민심 파악 수준이 핵심. 현역 비례대표 신분 = 역량 가점 적용됨." },
      { icon:"🏛️", t:"당원협의회 구성", d:"조직위원장 임명 후 60일 내 창당대회 → 당협위원장 정식 추대. 운영위원 30인 이상 확보 필수." },
      { icon:"💰", t:"후원회·예산 준비", d:"사무실·행사비·인건비 자체 부담. 최소 월 300~500만원. 후원회 설립으로 합법적 자금 조달." },
    ]
  },
  {
    period:"2027.01 ~ 2027.12",
    title:"Phase 3 — 지역 밀착 브랜딩",
    color:"#eab308",
    badge:"🟡 핵심 2년",
    items:[
      { icon:"🏘️", t:"지역 민원 해결사", d:"국회의원 보좌진 활용 민원 적극 처리. '이 사람이 우리 지역 챙긴다'는 인식이 공천보다 먼저." },
      { icon:"📰", t:"지역 언론 정기 노출", d:"지역 신문·유튜브 채널 월 1회 이상 인터뷰. 지역 이슈 논평 발표. SNS 지역 콘텐츠 병행." },
      { icon:"📊", t:"자체 여론조사 실시", d:"총선 1년 전(2027 상반기) 자체 조사. 30% 이상 = 공천 경쟁력 있음. 수치 기반 전략 수정." },
      { icon:"⚡", t:"당원 관리 시스템 구축", d:"모바일 당원 투표 독려 시스템. 경선 시 당원 투표 비중 크므로 책임당원 확보가 승패 좌우." },
    ]
  },
  {
    period:"2028.01 ~ 2028.04",
    title:"Phase 4 — 공천 확보 & 총선",
    color:"#10b981",
    badge:"🟢 결전",
    items:[
      { icon:"🗳️", t:"공천 신청·경선 준비", d:"당협위원장 출신 = 지역 관리 실적 가점. 공천심사위원회에 제출할 의정보고서·지역활동 실적집·여론조사 결과 준비." },
      { icon:"🎯", t:"전략공천 vs 경선 판단", d:"당 지도부와 사전 조율 필수. 전략공천 지역 지정 시 절차 상이. 경선 시 여론조사 50%+당원 50% 혼합 방식." },
      { icon:"🏆", t:"23대 총선 본선", d:"2028년 4월. 후보 등록 D-60부터 공식 선거운동. 당협 2년간 구축한 조직·인지도가 최종 자산." },
      { icon:"📌", t:"비례 임기 중 주의사항", d:"22대 국회 임기 만료 2028년 5월. 비례 임기 중 당협위원장 겸직 불가 → 조직위원장 자격으로 활동." },
    ]
  },
];

// ══════════════════════════════════════════════════════════════
// SVG 지도 (한강벨트 지역구 다각형 — 간략화)
// ══════════════════════════════════════════════════════════════
// 좌표계: viewBox="0 0 520 320"
const DISTRICT_PATHS = {
  yangcheon_gap:    "M95,185 L130,185 L135,210 L120,225 L95,220 Z",
  ydeungpo_gap:     "M130,200 L158,200 L162,218 L145,228 L130,220 Z",
  ydeungpo_eul:     "M158,200 L185,200 L188,218 L162,218 Z",
  mapo_gap:         "M168,158 L200,155 L205,180 L185,185 L168,178 Z",
  yongsan:          "M200,175 L240,168 L248,200 L220,208 L200,198 Z",
  jungseongdong_gap:"M248,168 L278,165 L282,190 L258,195 L248,185 Z",
  jungseongdong_eul:"M278,165 L308,162 L312,188 L282,190 Z",
  gwangjin_gap:     "M308,162 L338,160 L340,185 L312,188 Z",
  gwangjin_eul:     "M338,160 L366,162 L364,190 L340,185 Z",
  dongja_gap:       "M185,208 L220,208 L218,240 L188,242 Z",
  dongja_eul:       "M220,208 L248,205 L245,238 L218,240 Z",
  gangnam_gap:      "M240,230 L268,228 L270,262 L242,265 Z",
  gangnam_eul:      "M268,228 L298,228 L298,262 L270,262 Z",
  gangnam_byung:    "M298,228 L325,230 L322,262 L298,262 Z",
  gangdong_gap:     "M366,162 L398,160 L398,195 L364,195 Z",
  gangdong_eul:     "M364,195 L398,195 L396,222 L360,222 Z",
  songpa_byung:     "M325,230 L360,225 L360,262 L325,262 Z",
  hanam_gap:        "M398,160 L435,158 L435,210 L398,210 Z",
};

const PCOLOR = { mb:"#ef4444", pk:"#8b5cf6", mn:"#3b82f6", ys:"#f97316", lj:"#10b981" };
const PLABEL = { mb:"이명박", pk:"박근혜", mn:"문재인", ys:"윤석열", lj:"이재명(실측)" };

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  const evts = EVENTS.filter(e => e.q === d?.q);
  return (
    <div style={{ background:"#fff", border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 14px",
      boxShadow:"0 4px 16px #0001", maxWidth:240, fontSize:12 }}>
      <div style={{ fontWeight:700, fontSize:13, color:T.text, marginBottom:6 }}>{d?.lb}</div>
      {payload.filter(p=>p.value!=null).map((p,i)=>(
        <div key={i} style={{ color:PCOLOR[p.dataKey]||T.muted, marginBottom:2 }}>
          {PLABEL[p.dataKey]||p.dataKey}: <b>{p.value}%</b>
        </div>
      ))}
      {evts.length>0 && <div style={{ marginTop:6, borderTop:`1px solid ${T.border}`, paddingTop:6 }}>
        {evts.map((e,i)=><div key={i} style={{ color:e.c, fontSize:11, marginBottom:2 }}>{e.icon} {e.txt}</div>)}
      </div>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 메인 컴포넌트
// ══════════════════════════════════════════════════════════════
export default function App() {
  const [miniTab, setMiniTab] = useState("hangang");
  const [selected, setSelected] = useState(null);
  const [hovId, setHovId] = useState(null);
  const [showScenario, setShowScenario] = useState(true);

  const selData = DISTRICTS.find(d=>d.id===selected);
  const gradeTargets = DISTRICTS.filter(d=>d.grade>0).sort((a,b)=>a.grade-b.grade);

  const ginfo = selData ? GRADE_INFO[String(selData.grade)] : null;

  return (
    <div style={{ background:T.bg, minHeight:"100vh", fontFamily:"'Apple SD Gothic Neo','Pretendard',sans-serif", color:T.text }}>
      {/* ── 탭 헤더 ── */}
      <div style={{ background:T.surface, borderBottom:`1px solid ${T.border}`, padding:"10px 20px",
        display:"flex", gap:6 }}>
        {[["hangang","🗺️ 한강벨트 분석"],["ash23","📡 23ASH"]].map(([k,lb])=>(
          <button key={k} onClick={()=>setMiniTab(k)}
            style={{ padding:"7px 20px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13,
              fontWeight:miniTab===k?700:400,
              background:miniTab===k?T.accent:"transparent",
              color:miniTab===k?"#fff":T.muted,
              transition:"all .15s" }}>
            {lb}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════
          미니탭 1: 한강벨트 분석
      ════════════════════════════════════════════════════ */}
      {miniTab==="hangang" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:0, height:"calc(100vh - 120px)" }}>

          {/* 좌: SVG 지도 */}
          <div style={{ background:T.surface, overflow:"hidden", position:"relative", borderRight:`1px solid ${T.border}` }}>
            <div style={{ padding:"12px 16px 8px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:14, fontWeight:700, color:T.text }}>🗺️ 한강벨트 선거구 지도</span>
              <div style={{ display:"flex", gap:6, marginLeft:"auto" }}>
                {[
                  { color:"#ef4444", label:"탈환 1순위" },
                  { color:"#3b82f6", label:"2순위" },
                  { color:"#f59e0b", label:"3순위" },
                  { color:"#8b5cf6", label:"국힘 현역" },
                  { color:"#94a3b8", label:"기타" },
                ].map((l,i)=>(
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:4, fontSize:11 }}>
                    <div style={{ width:10, height:10, borderRadius:2, background:l.color }} />
                    <span style={{ color:T.muted }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 범례 */}
            <div style={{ padding:"6px 16px", background:"#f8f9fc", borderBottom:`1px solid ${T.border}`,
              display:"flex", gap:12, fontSize:11, color:T.muted }}>
              <span>🔴 붉은 테두리 = 9회 지선 오세훈(국힘) 승리 지역구</span>
              <span>클릭 → 우측 상세 데이터</span>
            </div>

            {/* SVG 지도 */}
            <div style={{ padding:16, overflow:"auto" }}>
              <svg viewBox="0 0 520 310" style={{ width:"100%", maxWidth:700, display:"block", margin:"0 auto" }}>
                {/* 한강 */}
                <path d="M80,195 Q200,175 320,185 Q400,190 450,182" stroke="#93c5fd" strokeWidth="12"
                  fill="none" strokeLinecap="round" opacity={0.4} />
                <text x="280" y="183" fill="#60a5fa" fontSize="9" textAnchor="middle" opacity={0.7}>한강</text>

                {DISTRICTS.map(d=>{
                  const path = DISTRICT_PATHS[d.id];
                  if(!path) return null;
                  const gradeColor = d.grade===1?"#fecaca":d.grade===2?"#dbeafe":d.grade===3?"#fef3c7":
                                     d.grade===-1?"#ede9fe":"#f1f5f9";
                  const isHov = hovId===d.id;
                  const isSel = selected===d.id;
                  return (
                    <g key={d.id} style={{ cursor:"pointer" }}
                      onMouseEnter={()=>setHovId(d.id)}
                      onMouseLeave={()=>setHovId(null)}
                      onClick={()=>setSelected(d.id===selected?null:d.id)}>
                      <path d={path}
                        fill={isSel?"#4f63d2":isHov?"#e0e7ff":gradeColor}
                        stroke={d.oseh_won?"#ef4444":isSel?"#4f63d2":"#cbd5e0"}
                        strokeWidth={d.oseh_won?2.5:isSel?2:1}
                        style={{ transition:"all .15s", filter:isSel?"drop-shadow(0 2px 6px #4f63d244)":"none" }}
                      />
                      {/* 3D 측면 효과 */}
                      <path d={path}
                        fill="rgba(0,0,0,0.06)"
                        transform="translate(3,4)"
                        style={{ pointerEvents:"none" }}
                      />
                    </g>
                  );
                })}

                {/* 지역구 이름 라벨 */}
                {DISTRICTS.map(d=>{
                  const isSel = selected===d.id;
                  const isTarget = d.grade>0;
                  return (
                    <g key={d.id+"_lb"} style={{ pointerEvents:"none" }}>
                      {d.oseh_won && (
                        <rect x={d.x-18} y={d.y-9} width={36} height={12} rx={2}
                          fill="#ef4444" opacity={0.9} />
                      )}
                      <text x={d.x} y={d.y} textAnchor="middle" dominantBaseline="middle"
                        fontSize={9} fontWeight={isSel||isTarget?700:500}
                        fill={d.oseh_won?"#fff":isSel?"#fff":isTarget?T.text:"#64748b"}>
                        {d.name}
                      </text>
                      {isTarget && !d.oseh_won && (
                        <text x={d.x} y={d.y+9} textAnchor="middle" fontSize={7} fill="#ef4444">
                          ★{d.grade}순위
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* 하남갑 화살표 */}
                <path d="M415,185 L440,170" stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 2"
                  markerEnd="url(#arr)" />
                <defs>
                  <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8" />
                  </marker>
                </defs>
                <text x={444} y={168} fontSize={8} fill="#94a3b8">경기 하남</text>
              </svg>
            </div>

            {/* 하단 탈환 가능 요약 */}
            <div style={{ padding:"10px 16px", borderTop:`1px solid ${T.border}` }}>
              <div style={{ fontSize:12, fontWeight:700, color:T.text, marginBottom:8 }}>
                🎯 탈환 가능 지역구 요약 (22대 패배 + 비례 국힘 우세)
              </div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {gradeTargets.map(d=>(
                  <button key={d.id} onClick={()=>setSelected(d.id)}
                    style={{ padding:"4px 10px", borderRadius:16, border:`1.5px solid ${GRADE_INFO[d.grade].color}`,
                      background:selected===d.id?GRADE_INFO[d.grade].color:"transparent",
                      color:selected===d.id?"#fff":GRADE_INFO[d.grade].color,
                      cursor:"pointer", fontSize:11, fontWeight:600 }}>
                    {GRADE_INFO[d.grade].label.split(" ")[0]} {d.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 우: 상세 패널 */}
          <div style={{ background:T.surface, overflowY:"auto" }}>
            {!selData ? (
              <div style={{ padding:24, textAlign:"center", color:T.muted }}>
                <div style={{ fontSize:40, marginBottom:12 }}>🗺️</div>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:6 }}>지역구를 선택하세요</div>
                <div style={{ fontSize:12 }}>지도에서 클릭하거나<br/>아래 버튼을 눌러보세요</div>
                <div style={{ marginTop:20, display:"flex", flexDirection:"column", gap:6 }}>
                  {gradeTargets.slice(0,5).map(d=>(
                    <button key={d.id} onClick={()=>setSelected(d.id)}
                      style={{ padding:"8px 12px", borderRadius:8, border:`1px solid ${T.border}`,
                        background:T.bg, cursor:"pointer", fontSize:12, textAlign:"left",
                        display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ fontWeight:600 }}>{d.name}</span>
                      <span style={{ color:GRADE_INFO[d.grade].color, fontSize:11 }}>{GRADE_INFO[d.grade].label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ padding:16 }}>
                {/* 헤더 */}
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:18, fontWeight:800, color:T.text }}>{selData.name}</div>
                    <div style={{ fontSize:12, color:T.muted }}>{selData.winner22}</div>
                  </div>
                  {ginfo && (
                    <div style={{ padding:"4px 10px", borderRadius:20, fontSize:12, fontWeight:700,
                      background:ginfo.bg, color:ginfo.color }}>{ginfo.label}</div>
                  )}
                  <button onClick={()=>setSelected(null)}
                    style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:T.muted }}>×</button>
                </div>

                {selData.grade>0 && (
                  <div style={{ padding:"8px 12px", borderRadius:8, background:ginfo.bg,
                    border:`1px solid ${ginfo.color}33`, marginBottom:12, fontSize:12, color:ginfo.color }}>
                    💡 {selData.note}
                  </div>
                )}

                {selData.oseh_won && (
                  <div style={{ padding:"6px 10px", borderRadius:6, background:"#fee2e2",
                    border:"1px solid #fca5a5", marginBottom:12, fontSize:11, color:"#b91c1c" }}>
                    🔴 9회 지방선거 — 오세훈(국힘) 승리 지역
                  </div>
                )}

                {/* 선거별 득표율 */}
                {[
                  { label:"제20대 대선 (2022)", data:selData.d20, keys:["pph(윤석열)","pmi(이재명)"], vals:[selData.d20.pph,selData.d20.pmi] },
                  { label:"제8회 지방선거 (2022)", data:selData.j8, keys:["후보","비례"], vals:[selData.j8.pph,selData.j8.pmi], sub:[selData.j8.pph_p,selData.j8.pmi_p] },
                  { label:"제22대 총선 (2024)", data:selData.g22, keys:["후보","비례"], vals:[selData.g22.pph,selData.g22.pmi], sub:[selData.g22.pph_p,selData.g22.pmi_p] },
                  { label:"제21대 대선 (2025)", data:selData.d21, keys:["pph(김문수)","pmi(이재명)"], vals:[selData.d21.pph,selData.d21.pmi] },
                  { label:"제9회 지방선거 (2026)", data:selData.j9, keys:["후보","비례"], vals:[selData.j9.pph,selData.j9.pmi], sub:[selData.j9.pph_p,selData.j9.pmi_p] },
                ].map((row,ri)=>(
                  <div key={ri} style={{ marginBottom:12 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:T.muted, marginBottom:6 }}>{row.label}</div>
                    {/* 후보 득표율 바 */}
                    <div style={{ marginBottom:4 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, marginBottom:2 }}>
                        <span style={{ color:T.pph, fontWeight:600 }}>국민의힘 {row.vals[0]}%</span>
                        <span style={{ color:T.pmi, fontWeight:600 }}>민주당 {row.vals[1]}%</span>
                      </div>
                      <div style={{ display:"flex", height:8, borderRadius:4, overflow:"hidden", background:T.border }}>
                        <div style={{ width:`${row.vals[0]}%`, background:T.pph, transition:"width .4s" }} />
                        <div style={{ flex:1, background:T.pmi }} />
                      </div>
                    </div>
                    {/* 비례 */}
                    {row.sub && row.sub[0] && (
                      <div>
                        <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:T.muted, marginBottom:2 }}>
                          <span>비례 국힘 {row.sub[0]}%</span>
                          <span>비례 민주 {row.sub[1]}%</span>
                        </div>
                        <div style={{ display:"flex", height:5, borderRadius:3, overflow:"hidden", background:T.border, opacity:0.7 }}>
                          <div style={{ width:`${row.sub[0]}%`, background:"#fca5a5" }} />
                          <div style={{ flex:1, background:"#93c5fd" }} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* 핵심 지표 요약 */}
                {selData.grade>0 && (
                  <div style={{ background:T.bg, borderRadius:8, padding:12, marginTop:4 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:T.text, marginBottom:8 }}>📊 탈환 전략 핵심 지표</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                      {[
                        { label:"22대 후보 격차", val:`${(selData.g22.pph-selData.g22.pmi).toFixed(1)}%p`,
                          color:(selData.g22.pph-selData.g22.pmi)>0?T.pos:T.neg },
                        { label:"22대 비례 격차", val:`+${(selData.g22.pph_p-selData.g22.pmi_p).toFixed(1)}%p`, color:T.pos },
                        { label:"9회 지선 후보 격차", val:`${(selData.j9.pph-selData.j9.pmi).toFixed(1)}%p`,
                          color:(selData.j9.pph-selData.j9.pmi)>0?T.pos:T.neg },
                        { label:"21대 대선 격차", val:`${(selData.d21.pph-selData.d21.pmi).toFixed(1)}%p`,
                          color:(selData.d21.pph-selData.d21.pmi)>0?T.pos:T.neg },
                      ].map((m,i)=>(
                        <div key={i} style={{ background:T.surface, borderRadius:6, padding:"8px 10px",
                          border:`1px solid ${T.border}` }}>
                          <div style={{ fontSize:10, color:T.muted }}>{m.label}</div>
                          <div style={{ fontSize:16, fontWeight:800, color:m.color }}>{m.val}</div>
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

      {/* ════════════════════════════════════════════════════
          미니탭 2: 23ASH
      ════════════════════════════════════════════════════ */}
      {miniTab==="ash23" && (
        <div style={{ padding:"16px 20px", overflowY:"auto", height:"calc(100vh-120px)" }}>

          {/* 차트 */}
          <div style={{ background:T.surface, borderRadius:14, padding:"16px 8px 12px",
            boxShadow:"0 1px 6px #0001", border:`1px solid ${T.border}`, marginBottom:16 }}>
            <div style={{ paddingLeft:14, marginBottom:10, display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
              <span style={{ fontSize:14, fontWeight:700, color:T.text }}>
                📡 역대 대통령 지지율 + 이재명 정부 시나리오 (2008~2028)
              </span>
              <button onClick={()=>setShowScenario(!showScenario)}
                style={{ marginLeft:"auto", padding:"4px 12px", borderRadius:16, border:`1px solid ${T.border}`,
                  background:showScenario?T.accent:"transparent", color:showScenario?"#fff":T.muted,
                  cursor:"pointer", fontSize:11 }}>
                {showScenario?"✅ 예측 시나리오":"◻️ 시나리오"}
              </button>
            </div>

            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={APPROVAL_DATA} margin={{ top:8, right:20, left:-10, bottom:8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="lb" tick={{ fontSize:8, fill:T.muted }} interval={3} />
                <YAxis domain={[0,90]} tickFormatter={v=>`${v}%`} tick={{ fontSize:10, fill:T.muted }} />
                <Tooltip content={<ChartTooltip />} />
                <ReferenceLine y={50} stroke="#cbd5e0" strokeDasharray="4 3" />
                <ReferenceLine y={30} stroke="#fca5a5" strokeDasharray="3 2" />
                {/* 미래 영역 */}
                {showScenario && <ReferenceArea x1="'26②" x2="'28②" fill="#f8f9fc" fillOpacity={0.6} />}
                {/* 이벤트 수직선 */}
                {EVENTS.filter(e=>e.future===showScenario||!e.future).map((e,i)=>{
                  const idx=APPROVAL_DATA.findIndex(d=>d.q===e.q);
                  if(idx<0) return null;
                  return <ReferenceLine key={i} x={APPROVAL_DATA[idx].lb}
                    stroke={e.c} strokeWidth={e.future?1.5:1} strokeOpacity={0.6}
                    strokeDasharray={e.future?"5 3":"none"} />;
                })}
                {/* 실측선 */}
                {[["mb",T.pph],["pk","#8b5cf6"],["mn",T.pmi],["ys","#f97316"],["lj","#10b981"]].map(([k,c])=>(
                  <Line key={k} type="monotone" dataKey={k} stroke={c} strokeWidth={2}
                    dot={false} connectNulls={false} />
                ))}
                {/* 예측선 */}
                {showScenario && <>
                  <Line type="monotone" dataKey="lj_b" stroke="#10b981" strokeWidth={2}
                    strokeDasharray="6 3" dot={false} connectNulls={false} />
                  <Line type="monotone" dataKey="lj_o" stroke="#6ee7b7" strokeWidth={1.5}
                    strokeDasharray="4 4" dot={false} connectNulls={false} />
                  <Line type="monotone" dataKey="lj_w" stroke="#f87171" strokeWidth={1.5}
                    strokeDasharray="4 4" dot={false} connectNulls={false} />
                </>}
              </LineChart>
            </ResponsiveContainer>

            {/* 레전드 */}
            <div style={{ display:"flex", gap:14, paddingLeft:18, flexWrap:"wrap", marginTop:6 }}>
              {[["이명박",T.pph],["박근혜","#8b5cf6"],["문재인",T.pmi],["윤석열","#f97316"],["이재명(실측)","#10b981"]].map(([n,c])=>(
                <div key={n} style={{ display:"flex", alignItems:"center", gap:4, fontSize:11 }}>
                  <div style={{ width:18, height:3, background:c, borderRadius:2 }} />
                  <span style={{ color:c, fontWeight:600 }}>{n}</span>
                </div>
              ))}
              {showScenario && <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:11 }}>
                <div style={{ width:18, height:2, borderTop:"2px dashed #10b981" }} />
                <span style={{ color:T.muted }}>이재명 예측(기본/낙관/비관)</span>
              </div>}
            </div>
          </div>

          {/* 변곡점 + 총선 패턴 */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:12, marginBottom:16 }}>
            {[
              { date:"2026.06.03", title:"9회 지방선거", icon:"🗳️", color:T.accent,
                desc:"이재명 정부 1주년 민심 심판. 허니문 여권 강세 예상. 국힘 수도권 수성이 핵심.",
                tip:"국힘 패배 시 지지율 추가 하락 → 역설적으로 새 인물 등판 기회" },
              { date:"2026.07 ~ 2027.06", title:"당협 골든타임", icon:"🏛️", color:"#f97316",
                desc:"지선 직후 공석 당협 공모 대거 발생. 역대 47개 동시 공모 사례.",
                tip:"경쟁이 가장 낮은 타이밍 = 지선 종료 1~2개월 내" },
              { date:"2027 상반기", title:"이재명 지지율 변곡", icon:"📉", color:"#8b5cf6",
                desc:"역대 패턴: 취임 2년차부터 부동산·경제 이슈로 하락 시작. 야당 기회 열림.",
                tip:"지역구 인지도 극대화 타이밍. 지역 이슈 선점 집중." },
              { date:"2028.04", title:"23대 총선 D-day", icon:"🏆", color:"#10b981",
                desc:"이재명 정부 3년차. 패턴상 40~47% 예상. 국힘 유리 환경.",
                tip:"당협 2년 활동 + 후보 개인 브랜드 = 탈환 가능" },
            ].map((c,i)=>(
              <div key={i} style={{ background:T.surface, borderRadius:12, padding:14,
                border:`1px solid ${c.color}33`, boxShadow:"0 1px 4px #0001" }}>
                <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8 }}>
                  <span style={{ fontSize:22 }}>{c.icon}</span>
                  <div>
                    <div style={{ fontSize:10, color:T.muted }}>{c.date}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:c.color }}>{c.title}</div>
                  </div>
                </div>
                <div style={{ fontSize:12, color:T.text, lineHeight:1.6, marginBottom:8 }}>{c.desc}</div>
                <div style={{ fontSize:11, background:T.bg, borderRadius:6, padding:"6px 10px",
                  color:T.text, lineHeight:1.5 }}>💡 {c.tip}</div>
              </div>
            ))}
          </div>

          {/* 당협 로드맵 */}
          <div style={{ background:T.surface, borderRadius:14, padding:16,
            border:`1px solid ${T.border}`, boxShadow:"0 1px 6px #0001", marginBottom:16 }}>
            <div style={{ fontSize:14, fontWeight:700, color:T.text, marginBottom:12 }}>
              🗺️ 비례대표 → 지역구 전환 로드맵 (2025~2028)
            </div>
            {/* 타임라인 바 */}
            <div style={{ display:"flex", overflowX:"auto", gap:2, marginBottom:16, paddingBottom:4 }}>
              {[
                { p:"2025 하반기", lb:"타겟 선정", c:"#ef4444", note:"NOW" },
                { p:"2026 상반기", lb:"지선 지원", c:"#f97316", note:"6·3지선" },
                { p:"2026 하반기", lb:"당협 공모", c:"#eab308", note:"골든타임" },
                { p:"2027 상반기", lb:"당협 활동", c:"#10b981", note:"2년 플랜" },
                { p:"2027 하반기", lb:"여론조사", c:"#3b82f6", note:"D-1년" },
                { p:"2028 Q1",    lb:"공천 신청", c:"#8b5cf6", note:"결전" },
                { p:"2028 Q2",    lb:"🏆 23대 총선", c:"#f59e0b", note:"4월" },
              ].map((s,i,arr)=>(
                <div key={i} style={{ display:"flex", alignItems:"center", minWidth:90, flex:1 }}>
                  <div style={{ flex:1, background:s.c, borderRadius:8, padding:"8px 6px", textAlign:"center" }}>
                    <div style={{ fontSize:9, color:"rgba(255,255,255,0.8)" }}>{s.p}</div>
                    <div style={{ fontSize:11, fontWeight:700, color:"#fff", lineHeight:1.3 }}>{s.lb}</div>
                    <div style={{ fontSize:9, color:"rgba(255,255,255,0.7)", marginTop:2,
                      background:"rgba(0,0,0,0.2)", borderRadius:4, padding:"1px 4px" }}>{s.note}</div>
                  </div>
                  {i<arr.length-1 && <div style={{ width:14, textAlign:"center", color:T.muted, fontSize:14, flexShrink:0 }}>→</div>}
                </div>
              ))}
            </div>

            {/* Phase 카드 */}
            {PHASES.map((ph,pi)=>(
              <div key={pi} style={{ marginBottom:12, border:`1px solid ${ph.color}33`, borderRadius:12, overflow:"hidden" }}>
                <div style={{ background:ph.color, padding:"8px 14px", display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ color:"#fff", fontWeight:700, fontSize:13 }}>{ph.title}</span>
                  <span style={{ marginLeft:"auto", fontSize:11, color:"rgba(255,255,255,0.9)", background:"rgba(0,0,0,0.2)",
                    borderRadius:10, padding:"2px 8px" }}>{ph.period}</span>
                  <span style={{ fontSize:12 }}>{ph.badge}</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:0 }}>
                  {ph.items.map((it,ii)=>(
                    <div key={ii} style={{ padding:"10px 14px", borderRight:ii<ph.items.length-1?`1px solid ${T.border}`:"none",
                      borderTop:`1px solid ${T.border}` }}>
                      <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:4 }}>
                        <span style={{ fontSize:16 }}>{it.icon}</span>
                        <span style={{ fontSize:12, fontWeight:700, color:T.text }}>{it.t}</span>
                      </div>
                      <div style={{ fontSize:11, color:T.muted, lineHeight:1.6 }}>{it.d}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* 주의사항 */}
            <div style={{ background:T.bg, borderRadius:8, padding:12, display:"grid",
              gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:8, fontSize:11, color:T.muted, lineHeight:1.7 }}>
              <div>⚠️ <b style={{color:T.text}}>비례 임기 중 당협위원장 겸직 불가</b> — 조직위원장 자격으로만 활동</div>
              <div>⚠️ <b style={{color:T.text}}>강남 본적 활용</b> — '강남 출신이 한강벨트를 돌아본다' 스토리</div>
              <div>⚠️ <b style={{color:T.text}}>현역 텃세 주의</b> — 현역 없는 공석 지역구 우선 타겟</div>
              <div>⚠️ <b style={{color:T.text}}>당협 ≠ 자동 공천</b> — 여론조사 경쟁력 관리 필수</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
