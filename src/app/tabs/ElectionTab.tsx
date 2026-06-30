import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, ReferenceArea
} from "recharts";

// ── ASH 디자인 토큰 ──────────────────────────────────────
const C = {
  bg:"#f5f6fa", surface:"#ffffff", accent:"#4f63d2",
  text:"#1a1f36", muted:"#8892b0", border:"#e2e8f0",
  pph:"#e84a4a", pmi:"#2b6cb0",
};

// ── 이미지에서 추출한 실제 SVG 경계 경로 (860×780 기준) ────────
const OUTER_PATH = "M583.5,707.3 L573.2,689.8 L552.7,675.3 L557.3,633.2 L547.1,613.1 L535.2,617.7 L534.2,628.6 L520.0,638.2 L505.4,637.5 L491.5,613.1 L469.0,613.1 L459.4,618.7 L458.4,628.9 L433.6,643.7 L433.6,653.6 L424.0,663.2 L414.1,663.2 L398.9,678.3 L379.1,678.3 L367.2,688.8 L350.3,664.2 L333.4,653.3 L293.1,693.4 L279.8,693.4 L269.6,679.3 L269.6,664.2 L249.1,637.8 L244.4,608.9 L234.5,599.0 L239.1,578.6 L229.2,558.2 L235.5,555.2 L206.4,548.0 L186.6,573.0 L171.3,573.0 L166.0,588.1 L117.1,592.7 L118.1,553.6 L105.5,537.1 L135.3,501.6 L128.0,493.0 L128.0,479.8 L137.9,470.0 L138.6,458.8 L123.4,433.8 L135.9,412.1 L127.0,409.7 L124.4,417.0 L116.4,417.0 L92.6,411.7 L79.7,431.8 L72.1,432.1 L62.2,412.4 L26.5,407.1 L12.9,389.7 L37.4,368.6 L51.9,334.4 L77.7,308.7 L83.0,269.9 L90.0,270.2 L123.0,305.7 L213.0,365.0 L218.3,378.8 L229.9,380.5 L232.2,382.1 L291.1,420.9 L296.7,434.4 L301.7,450.6 L314.9,472.9 L349.3,447.3 L354.9,453.5 L375.1,476.2 L432.0,507.2 L444.6,512.4 L488.9,488.7 L540.5,435.4 L590.8,451.2 L619.5,472.6 L675.4,474.9 L699.6,449.6 L736.6,370.6 L752.2,356.4 L809.7,341.3 L821.6,324.2 L842.5,366.0 L842.5,386.4 L852.4,404.8 L832.9,414.4 L802.4,414.4 L787.6,448.9 L762.4,509.5 L780.0,521.0 L802.8,521.3 L798.1,548.3 L788.2,563.4 L782.9,578.6 L764.1,592.1 L747.2,607.5 L712.5,632.2 L676.1,622.4 L654.9,585.5 L611.9,602.6 L584.8,596.7 L590.1,607.2 L654.9,586.8 L673.8,621.4 L660.5,658.9 L646.3,673.0 L631.1,668.4 L620.5,698.7 L583.5,707.3 Z";

// 빨간 영역 (국힘 지역: 강남·서초·송파 + 동작을 + 용산 등)
const RED_PATH_MAIN = "M584.8,706.6 L577.9,703.0 L572.6,688.5 L557.0,682.9 L552.7,674.7 L552.7,640.5 L557.3,633.2 L547.1,613.1 L534.2,618.7 L529.2,633.5 L506.7,638.2 L491.5,613.1 L469.0,613.1 L459.4,618.7 L458.4,628.9 L433.6,643.7 L433.6,653.6 L424.0,663.2 L414.1,663.2 L404.8,672.0 L414.1,504.6 L432.0,507.2 L444.6,512.4 L488.9,488.7 L540.5,435.4 L590.8,451.2 L619.5,472.6 L675.4,474.9 L762.4,509.5 L780.0,521.0 L802.8,521.3 L798.1,548.3 L788.2,563.4 L782.9,578.6 L764.1,592.1 L747.2,607.5 L712.5,632.2 L676.1,622.4 L654.9,585.5 L611.9,602.6 L584.8,596.7 L590.1,607.2 L654.9,586.8 L673.8,621.4 L660.5,658.9 L646.3,673.0 L631.1,668.4 L620.5,698.7 L584.8,706.6 Z";

// 도봉갑 작은 빨간 섬
const RED_PATH_DOBONG = "M566.9,189.9 L556.7,174.4 L557.0,153.7 L551.1,155.0 L541.8,157.6 L529.9,145.8 L511.0,139.5 L516.0,114.2 L526.6,131.3 L539.2,131.0 L554.0,120.1 L566.9,130.6 L572.2,157.3 L568.9,176.7 L566.9,189.9 Z";

// 한강 (흰색 띠)
const RIVER_PATH = "M65,340 Q130,328 195,338 Q260,348 320,348 Q380,348 440,342 Q500,336 560,334 Q620,332 680,338 Q740,344 800,338 L812,352 Q750,358 690,352 Q630,346 570,348 Q510,350 450,356 Q390,362 330,362 Q270,362 210,355 Q150,348 90,358 Q72,360 58,354 Z";

// ── 지역구 텍스트 레이블 위치 (이미지에서 측정, 860×780 스케일) ──
const LABELS = [
  // 강서·구로 (한강벨트 밖)
  { name:"강서갑\n강선우",    x:98,  y:480, c:"민주", hb:false },
  { name:"강서을\n진성준",    x:72,  y:438, c:"민주", hb:false },
  { name:"강서병\n한정애",    x:148, y:462, c:"민주", hb:false },
  { name:"양천갑\n황희",      x:192, y:512, c:"민주", hb:true  },
  { name:"양천을\n이용선",    x:170, y:555, c:"민주", hb:false },
  { name:"영등포갑\n채현일",  x:258, y:528, c:"민주", hb:true  },
  { name:"영등포을\n김민석",  x:318, y:510, c:"민주", hb:true  },
  { name:"구로갑\n이인영",    x:115, y:598, c:"민주", hb:false },
  { name:"구로을\n윤건영",    x:182, y:600, c:"민주", hb:false },
  { name:"금천\n최기상",      x:215, y:668, c:"민주", hb:false },
  { name:"관악갑\n박민규",    x:300, y:672, c:"민주", hb:false },
  { name:"관악을\n정태호",    x:255, y:645, c:"민주", hb:false },
  // 동작
  { name:"동작갑\n김병기",    x:332, y:580, c:"민주", hb:true  },
  { name:"동작을\n나경원",    x:398, y:570, c:"국힘", hb:true  },
  // 마포·용산
  { name:"마포갑\n조정훈",    x:355, y:408, c:"민주", hb:true  },
  { name:"마포을\n정청래",    x:305, y:438, c:"민주", hb:false },
  { name:"용산\n권영세",      x:462, y:488, c:"국힘", hb:true  },
  // 서대문·은평
  { name:"서대문갑\n김동아",  x:368, y:350, c:"민주", hb:false },
  { name:"서대문을\n김영흥",  x:326, y:378, c:"민주", hb:false },
  { name:"은평갑\n박주민",    x:268, y:340, c:"민주", hb:false },
  { name:"은평을\n김우영",    x:258, y:295, c:"민주", hb:false },
  // 종로·중구성동동
  { name:"종로\n곽상언",      x:458, y:358, c:"민주", hb:false },
  { name:"중성동갑\n전현희",  x:562, y:428, c:"민주", hb:true  },
  { name:"중성동을\n박성준",  x:548, y:388, c:"민주", hb:true  },
  // 성북·강북
  { name:"성북갑\n김영배",    x:518, y:312, c:"민주", hb:false },
  { name:"성북을\n김남근",    x:575, y:328, c:"민주", hb:false },
  { name:"강북갑\n천준호",    x:548, y:262, c:"민주", hb:false },
  { name:"강북을\n한민수",    x:612, y:285, c:"민주", hb:false },
  // 도봉·노원
  { name:"도봉갑\n김재섭",    x:602, y:218, c:"국힘", hb:false },
  { name:"도봉을\n오기형",    x:662, y:192, c:"민주", hb:false },
  { name:"노원갑\n우원식",    x:738, y:242, c:"민주", hb:false },
  { name:"노원을\n김성환",    x:798, y:195, c:"민주", hb:false },
  // 광진·강동
  { name:"광진갑\n이정헌",    x:678, y:430, c:"민주", hb:true  },
  { name:"광진을\n고민정",    x:662, y:472, c:"민주", hb:true  },
  { name:"강동갑\n진선미",    x:758, y:425, c:"민주", hb:true  },
  { name:"강동을\n이해식",    x:755, y:480, c:"민주", hb:true  },
  // 하남
  { name:"하남갑\n이광재",    x:822, y:455, c:"민주", hb:true  },
  // 중랑·동대문
  { name:"중랑갑\n서영교",    x:748, y:368, c:"민주", hb:false },
  { name:"중랑을\n박홍근",    x:785, y:338, c:"민주", hb:false },
  { name:"동대문갑\n안규백",  x:638, y:368, c:"민주", hb:false },
  { name:"동대문을\n장경태",  x:690, y:400, c:"민주", hb:false },
  // 강남·서초·송파
  { name:"강남갑\n서명옥",    x:548, y:545, c:"국힘", hb:true  },
  { name:"강남을\n박수민",    x:622, y:598, c:"국힘", hb:true  },
  { name:"강남병\n고동진",    x:580, y:598, c:"국힘", hb:true  },
  { name:"서초갑\n조온희",    x:492, y:558, c:"국힘", hb:false },
  { name:"서초을\n신동욱",    x:530, y:638, c:"국힘", hb:false },
  { name:"송파갑\n박정훈",    x:718, y:548, c:"국힘", hb:false },
  { name:"송파을\n배현진",    x:760, y:580, c:"민주", hb:false },
  { name:"송파병\n남인순",    x:752, y:632, c:"민주", hb:true  },
];

// ── 한강벨트 선거구 상세 데이터 ──────────────────────────────────
const DISTRICTS = [
  { id:"yangcheon_gap",  name:"양천갑",   candidate:"황희",   winner22:"민주", grade:1, oseh:false,
    d20:{p:50.1,m:46.4}, j8:{p:58.8,m:39.7,pp:55.3,mp:44.7}, g22:{p:48.2,m:49.8,pp:37.0,mp:25.2}, d21:{p:41.3,m:48.3}, j9:{p:49.2,m:48.5,pp:47.9,mp:52.1}, note:"후보격차 -1.6%p / 비례+11.8%p" },
  { id:"ydf_gap",        name:"영등포갑", candidate:"채현일", winner22:"민주", grade:3, oseh:false,
    d20:{p:51.6,m:44.6}, j8:{p:60.1,m:38.2,pp:null,mp:null}, g22:{p:41.7,m:54.5,pp:37.1,mp:26.2}, d21:{p:41.5,m:45.9}, j9:{p:50.5,m:46.7,pp:49.0,mp:51.0}, note:"후보격차 -12.8%p / 비례+10.9%p" },
  { id:"ydf_eul",        name:"영등포을", candidate:"김민석", winner22:"민주", grade:1, oseh:false,
    d20:{p:51.6,m:44.6}, j8:{p:60.1,m:38.2,pp:null,mp:null}, g22:{p:49.0,m:50.2,pp:37.1,mp:26.2}, d21:{p:41.5,m:45.9}, j9:{p:50.5,m:46.7,pp:49.0,mp:51.0}, note:"후보격차 -1.2%p / 비례+10.9%p" },
  { id:"mapo_gap",       name:"마포갑",   candidate:"조정훈", winner22:"국힘", grade:0, oseh:false,
    d20:{p:49.0,m:46.5}, j8:{p:56.6,m:40.8,pp:52.2,mp:47.8}, g22:{p:48.3,m:47.7,pp:34.6,mp:25.2}, d21:{p:39.1,m:48.4}, j9:{p:49.9,m:49.6,pp:45.8,mp:54.2}, note:"22대 조정훈(국힘) 당선" },
  { id:"yongsan",        name:"용산",     candidate:"권영세", winner22:"국힘", grade:-1, oseh:true,
    d20:{p:56.4,m:39.9}, j8:{p:64.9,m:33.3,pp:null,mp:null}, g22:{p:51.8,m:47.0,pp:42.3,mp:22.2}, d21:{p:47.6,m:41.1}, j9:{p:57.1,m:40.2,pp:55.3,mp:44.7}, note:"22대 국힘 현역" },
  { id:"jsd_gap",        name:"중성동갑", candidate:"전현희", winner22:"민주", grade:2, oseh:false,
    d20:{p:51.0,m:45.4}, j8:{p:58.5,m:39.9,pp:54.5,mp:45.5}, g22:{p:47.4,m:52.6,pp:38.8,mp:24.8}, d21:{p:42.0,m:46.8}, j9:{p:49.6,m:47.9,pp:48.6,mp:51.4}, note:"후보격차 -5.2%p / 비례+14.0%p" },
  { id:"jsd_eul",        name:"중성동을", candidate:"박성준", winner22:"민주", grade:1, oseh:false,
    d20:{p:51.0,m:45.4}, j8:{p:58.5,m:39.9,pp:54.5,mp:45.5}, g22:{p:48.5,m:50.8,pp:38.8,mp:24.8}, d21:{p:42.0,m:46.8}, j9:{p:49.6,m:47.9,pp:48.6,mp:51.4}, note:"후보격차 -2.3%p / 비례+14.0%p" },
  { id:"gwj_gap",        name:"광진갑",   candidate:"이정헌", winner22:"민주", grade:2, oseh:false,
    d20:{p:48.8,m:47.2}, j8:{p:58.3,m:40.0,pp:53.6,mp:46.4}, g22:{p:47.5,m:52.5,pp:35.8,mp:28.6}, d21:{p:39.9,m:48.1}, j9:{p:48.7,m:48.6,pp:47.3,mp:52.6}, note:"후보격차 -5.0%p / 비례+7.2%p" },
  { id:"gwj_eul",        name:"광진을",   candidate:"고민정", winner22:"민주", grade:2, oseh:false,
    d20:{p:48.8,m:47.2}, j8:{p:58.3,m:40.0,pp:53.6,mp:46.4}, g22:{p:47.6,m:51.5,pp:35.8,mp:28.6}, d21:{p:39.9,m:48.1}, j9:{p:48.5,m:48.6,pp:47.3,mp:52.6}, note:"후보격차 -3.9%p / 비례+7.2%p" },
  { id:"gdd_gap",        name:"강동갑",   candidate:"진선미", winner22:"민주", grade:1, oseh:false,
    d20:{p:51.7,m:44.8}, j8:{p:60.6,m:37.9,pp:56.0,mp:40.1}, g22:{p:47.9,m:50.1,pp:38.1,mp:26.0}, d21:{p:43.0,m:46.2}, j9:{p:50.6,m:46.9,pp:49.9,mp:50.1}, note:"후보격차 -2.2%p / 비례+12.1%p" },
  { id:"gdd_eul",        name:"강동을",   candidate:"이해식", winner22:"민주", grade:3, oseh:false,
    d20:{p:51.7,m:44.8}, j8:{p:60.6,m:37.9,pp:56.0,mp:40.1}, g22:{p:44.7,m:53.5,pp:38.1,mp:26.0}, d21:{p:43.0,m:46.2}, j9:{p:50.6,m:46.9,pp:49.9,mp:50.1}, note:"후보격차 -8.8%p / 비례+12.1%p" },
  { id:"hanam",          name:"하남갑",   candidate:"이광재", winner22:"민주", grade:1, oseh:false,
    d20:{p:48.3,m:48.7}, j8:{p:50.5,m:47.9,pp:52.9,mp:47.1}, g22:{p:49.4,m:50.6,pp:35.7,mp:26.0}, d21:{p:39.5,m:50.7}, j9:{p:39.4,m:55.0,pp:45.5,mp:54.5}, note:"후보격차 -1.2%p / 비례+9.7%p" },
  { id:"dja_gap",        name:"동작갑",   candidate:"김병기", winner22:"민주", grade:2, oseh:false,
    d20:{p:50.5,m:45.7}, j8:{p:58.1,m:40.1,pp:null,mp:null}, g22:{p:45.0,m:50.5,pp:36.4,mp:25.6}, d21:{p:40.9,m:46.9}, j9:{p:49.6,m:47.2,pp:43.4,mp:49.4}, note:"후보격차 -5.5%p / 비례+10.8%p" },
  { id:"dja_eul",        name:"동작을",   candidate:"나경원", winner22:"국힘", grade:-1, oseh:true,
    d20:{p:50.5,m:45.7}, j8:{p:58.1,m:40.1,pp:null,mp:null}, g22:{p:54.0,m:46.0,pp:36.4,mp:25.6}, d21:{p:40.9,m:46.9}, j9:{p:49.6,m:47.2,pp:43.4,mp:49.4}, note:"22대 국힘 현역" },
  { id:"gnm_gap",        name:"강남갑",   candidate:"서명옥", winner22:"국힘", grade:-1, oseh:true,
    d20:{p:67.0,m:30.3}, j8:{p:74.4,m:24.5,pp:72.2,mp:27.8}, g22:{p:64.2,m:35.8,pp:50.3,mp:14.9}, d21:{p:56.6,m:32.2}, j9:{p:66.0,m:31.9,pp:66.1,mp:33.9}, note:"강남 텃밭" },
  { id:"gnm_eul",        name:"강남을",   candidate:"박수민", winner22:"국힘", grade:-1, oseh:true,
    d20:{p:67.0,m:30.3}, j8:{p:74.4,m:24.5,pp:72.2,mp:27.8}, g22:{p:58.6,m:41.4,pp:50.3,mp:14.9}, d21:{p:56.6,m:32.2}, j9:{p:66.0,m:31.9,pp:66.1,mp:33.9}, note:"강남 텃밭" },
  { id:"gnm_byung",      name:"강남병",   candidate:"고동진", winner22:"국힘", grade:-1, oseh:true,
    d20:{p:67.0,m:30.3}, j8:{p:74.4,m:24.5,pp:72.2,mp:27.8}, g22:{p:66.3,m:32.8,pp:50.3,mp:14.9}, d21:{p:56.6,m:32.2}, j9:{p:66.0,m:31.9,pp:66.1,mp:33.9}, note:"강남 텃밭" },
  { id:"spb",            name:"송파병",   candidate:"남인순", winner22:"민주", grade:1, oseh:false,
    d20:{p:56.8,m:40.2}, j8:{p:64.7,m:34.0,pp:60.9,mp:37.7}, g22:{p:48.9,m:51.0,pp:41.9,mp:22.1}, d21:{p:46.6,m:42.1}, j9:{p:54.8,m:46.9,pp:54.0,mp:43.0}, note:"후보격차 -2.1%p / 비례+19.8%p ★" },
];

const GRADE_META: Record<string, {label:string,color:string,fill:string,stroke:string}> = {
  "1":  { label:"★★★ 1순위", color:"#b91c1c", fill:"#fee2e2", stroke:"#ef4444" },
  "2":  { label:"★★ 2순위",  color:"#1d4ed8", fill:"#dbeafe", stroke:"#3b82f6" },
  "3":  { label:"★ 3순위",   color:"#92400e", fill:"#fef3c7", stroke:"#f59e0b" },
  "-1": { label:"국힘 현역",  color:"#6d28d9", fill:"#f3e8ff", stroke:"#8b5cf6" },
  "0":  { label:"참고",       color:"#374151", fill:"#f9fafb", stroke:"#d1d5db" },
};

// ── 지지율 데이터 ──────────────────────────────────────────
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
  {q:"13Q3",icon:"📈",txt:"G20 성과",c:"#059669"},
  {q:"14Q2",icon:"🚨",txt:"세월호",c:"#dc2626"},
  {q:"16Q2",icon:"🗳️",txt:"20대 총선 참패",c:"#dc2626"},
  {q:"16Q4",icon:"💥",txt:"최순실·탄핵",c:"#7f1d1d"},
  {q:"18Q2",icon:"🕊️",txt:"남북정상회담",c:"#059669"},
  {q:"19Q4",icon:"💥",txt:"조국 사태",c:"#dc2626"},
  {q:"20Q1",icon:"🗳️",txt:"21대 총선 압승",c:"#2563eb"},
  {q:"20Q4",icon:"🚨",txt:"부동산 폭등",c:"#dc2626"},
  {q:"21Q1",icon:"🗳️",txt:"4·7 재보선 참패",c:"#dc2626"},
  {q:"24Q2",icon:"🗳️",txt:"22대 총선 참패",c:"#dc2626"},
  {q:"24Q4",icon:"💥",txt:"비상계엄·탄핵",c:"#7f1d1d"},
  {q:"26Q2",icon:"⏳",txt:"9회 지방선거",c:"#d97706",future:true},
  {q:"28Q2",icon:"🏆",txt:"23대 총선",c:"#d97706",future:true},
];

const PCOLOR: Record<string,string> = {mb:"#e84a4a",pk:"#8b5cf6",mn:"#2b6cb0",ys:"#f97316",lj:"#059669"};
const PLABEL: Record<string,string> = {mb:"이명박",pk:"박근혜",mn:"문재인",ys:"윤석열",lj:"이재명(실측)"};

function ChartTip({active,payload}: any) {
  if (!active||!payload?.length) return null;
  const d = payload[0]?.payload;
  const evts = EVTS.filter((e:any)=>e.q===d?.q);
  return (
    <div style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px",
      boxShadow:"0 4px 20px rgba(0,0,0,0.12)",maxWidth:230,fontSize:12}}>
      <div style={{fontWeight:700,color:C.text,marginBottom:5}}>{d?.lb}</div>
      {payload.filter((p:any)=>p.value!=null).map((p:any,i:number)=>(
        <div key={i} style={{color:PCOLOR[p.dataKey]||C.muted,marginBottom:2}}>
          {PLABEL[p.dataKey]||p.dataKey}: <b>{p.value}%</b>
        </div>
      ))}
      {evts.length>0 && <div style={{marginTop:6,borderTop:`1px solid ${C.border}`,paddingTop:6}}>
        {evts.map((e:any,i:number)=><div key={i} style={{color:e.c,fontSize:11,marginBottom:2}}>{e.icon} {e.txt}</div>)}
      </div>}
    </div>
  );
}

const PHASES = [
  {period:"지금 ~ 2026.06",title:"Phase 1 — 타겟 선정 & 포지셔닝",color:"#ef4444",badge:"🔴 NOW",items:[
    {icon:"🎯",t:"타겟 지역구 확정",d:"1순위(영등포을·양천갑·송파병·강동갑·하남갑·중성동을) 2~3개로 압축"},
    {icon:"📋",t:"사고당협 모니터링",d:"수도권 36곳 공석. 당 조강특위 공고 수시 확인. 지금도 공모 진행 중"},
    {icon:"🗳️",t:"9회 지선 지원 유세",d:"목표 지역구 기초단체장 집중 지원 → 지역 얼굴 알리기 + 당내 기여 점수"},
    {icon:"🤝",t:"지역 네트워크",d:"시민단체·상인회·주민자치위 접촉. 지역 현안 파악 → 해결 루틴 구축"},
  ]},
  {period:"2026.07 ~ 2026.12",title:"Phase 2 — 당협위원장 공모·확보",color:"#f97316",badge:"🟠 골든타임",items:[
    {icon:"📢",t:"지선 직후 공모 신청",d:"지선 후 1~2개월 내 공모 공고. 2022년 6·1지선 후 47개 동시 공모. 경쟁 최저"},
    {icon:"📝",t:"조강특위 면접 대비",d:"지역 활동 실적 + 당 기여도 + 민심 파악. 현역 비례 = 역량 가점"},
    {icon:"🏛️",t:"당원협의회 구성",d:"임명 후 60일 내 창당대회 → 당협위원장 추대. 운영위원 30인 이상"},
    {icon:"💰",t:"후원회·예산",d:"월 300~500만원 자체 부담. 후원회로 합법 자금 조달"},
  ]},
  {period:"2027.01 ~ 2027.12",title:"Phase 3 — 지역 밀착 브랜딩",color:"#d97706",badge:"🟡 핵심 2년",items:[
    {icon:"🏘️",t:"민원 해결사",d:"보좌진 활용 민원 처리. '이 사람이 우리 지역 챙긴다' 인식 구축"},
    {icon:"📰",t:"지역 언론 노출",d:"지역 신문·유튜브 월 1회 이상. 지역 이슈 논평 + SNS 병행"},
    {icon:"📊",t:"자체 여론조사",d:"총선 1년 전 실시. 30% 이상 = 공천 경쟁력 있음 기준"},
    {icon:"⚡",t:"당원 관리",d:"책임당원 확보 시스템 구축. 경선 시 당원 투표 비중이 승패 좌우"},
  ]},
  {period:"2028.01 ~ 2028.04",title:"Phase 4 — 공천 확보 & 총선",color:"#059669",badge:"🟢 결전",items:[
    {icon:"🗳️",t:"공천 신청·경선 준비",d:"당협위원장 출신 = 지역 관리 실적 가점. 의정보고서·활동실적집 준비"},
    {icon:"🎯",t:"공천 전략",d:"전략공천 vs 경선 당 지도부와 사전 조율. 여론조사50%+당원50% 혼합 방식"},
    {icon:"🏆",t:"23대 총선 본선",d:"2028년 4월. D-60 공식 선거운동. 당협 2년 조직이 최종 자산"},
    {icon:"📌",t:"비례 임기 주의",d:"22대 국회 임기 2028년 5월 만료. 임기 중 당협 겸직 불가 → 조직위원장"},
  ]},
];

// ══════════════════════════════════════════════════════════
// 메인
// ══════════════════════════════════════════════════════════
export default function ElectionTab() {
  const [mini, setMini] = useState<"hangang"|"ash23">("hangang");
  const [sel,  setSel]  = useState<string|null>(null);
  const [hov,  setHov]  = useState<string|null>(null);
  const [scenario, setScenario] = useState(true);

  const selD    = DISTRICTS.find(d=>d.id===sel);
  const targets = DISTRICTS.filter(d=>d.grade>0).sort((a,b)=>a.grade-b.grade);

  return (
    <div style={{background:C.bg,minHeight:"100vh",
      fontFamily:"'Apple SD Gothic Neo','Pretendard',sans-serif",color:C.text}}>

      {/* ── 미니탭 헤더 ── */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,
        padding:"10px 20px",display:"flex",gap:4}}>
        {([["hangang","🗺️ 한강벨트 분석"],["ash23","📡 23ASH"]] as const).map(([k,lb])=>(
          <button key={k} onClick={()=>setMini(k as any)}
            style={{padding:"7px 22px",borderRadius:8,border:"none",cursor:"pointer",
              fontSize:13,fontWeight:mini===k?700:400,
              background:mini===k?C.accent:"transparent",
              color:mini===k?"#fff":C.muted,transition:"all .15s"}}>
            {lb}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════
          한강벨트 분석
      ═══════════════════════════════════════ */}
      {mini==="hangang" && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 360px",
          height:"calc(100vh - 118px)"}}>

          {/* ── 좌: SVG 지도 ── */}
          <div style={{background:"#1a2744",borderRight:`1px solid ${C.border}`,
            display:"flex",flexDirection:"column",overflow:"hidden"}}>

            {/* 헤더 */}
            <div style={{padding:"10px 18px",borderBottom:"1px solid rgba(255,255,255,0.1)",
              display:"flex",alignItems:"center",flexWrap:"wrap",gap:8,background:"#1e2f5a"}}>
              <span style={{fontSize:14,fontWeight:700,color:"#e2e8f0"}}>
                🗺️ 서울 선거구 지도 (22대 총선 기준)
              </span>
              <div style={{display:"flex",gap:8,marginLeft:"auto",flexWrap:"wrap"}}>
                {[
                  {c:"#5b9bd5",lb:"민주당 승리"},
                  {c:"#e07070",lb:"국민의힘 승리"},
                ].map((l,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:4,fontSize:11}}>
                    <div style={{width:12,height:12,borderRadius:2,background:l.c}}/>
                    <span style={{color:"#94a3b8"}}>{l.lb}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{padding:"5px 18px",background:"rgba(239,68,68,0.15)",
              borderBottom:"1px solid rgba(239,68,68,0.3)",fontSize:11,color:"#fca5a5"}}>
              🔴 흰 테두리 강조 = 탈환 가능 지역구 | 클릭 → 우측 상세 데이터
            </div>

            {/* SVG 지도 본체 */}
            <div style={{flex:1,overflow:"hidden",position:"relative"}}>
              <svg viewBox="0 0 860 780" style={{width:"100%",height:"100%",display:"block"}}>
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                  <filter id="shadow">
                    <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.4"/>
                  </filter>
                </defs>

                {/* 배경 */}
                <rect width="860" height="780" fill="#1a2744"/>

                {/* 전체 서울 외곽 (파란 영역 = 민주) */}
                <path d={OUTER_PATH}
                  fill="#4a86c8"
                  stroke="#1a2744"
                  strokeWidth="2"
                  filter="url(#shadow)"/>

                {/* 국힘(빨간) 영역 — 강남·서초·송파·용산·동작을 */}
                <path d={RED_PATH_MAIN}
                  fill="#d97070"
                  stroke="#1a2744"
                  strokeWidth="1.5"/>

                {/* 도봉갑 작은 빨간 섬 */}
                <path d={RED_PATH_DOBONG}
                  fill="#d97070"
                  stroke="#1a2744"
                  strokeWidth="1.5"/>

                {/* 한강 */}
                <path d={RIVER_PATH}
                  fill="#e8f4ff"
                  stroke="#c0dff5"
                  strokeWidth="0.5"
                  opacity="0.9"/>
                <text x="400" y="348" textAnchor="middle" fontSize="11"
                  fill="#2b6cb0" fontWeight="600" letterSpacing="4" opacity="0.8">한  강</text>

                {/* 탈환 1순위 하이라이트 오버레이 */}
                {targets.filter(d=>d.grade===1).map(d=>{
                  const lb = LABELS.find(l=>l.name.split("\n")[0]===d.name);
                  if (!lb) return null;
                  const isSel = sel===d.id;
                  return (
                    <g key={d.id}>
                      <circle
                        cx={lb.x} cy={lb.y}
                        r={isSel ? 26 : 22}
                        fill={isSel ? "rgba(79,99,210,0.85)" : "rgba(255,255,255,0.18)"}
                        stroke="rgba(255,255,255,0.9)"
                        strokeWidth={isSel ? 2.5 : 1.8}
                        style={{cursor:"pointer",transition:"all .2s",filter:isSel?"url(#glow)":"none"}}
                        onClick={()=>setSel(sel===d.id?null:d.id)}
                        onMouseEnter={()=>setHov(d.id)}
                        onMouseLeave={()=>setHov(null)}/>
                    </g>
                  );
                })}

                {/* 지역구 텍스트 레이블 */}
                {LABELS.map((lb, i) => {
                  const dist = DISTRICTS.find(d=>d.name===lb.name.split("\n")[0]);
                  const isSel = dist && sel===dist.id;
                  const isHov = dist && hov===dist.id;
                  const isHB  = lb.hb;
                  const lines = lb.name.split("\n");
                  const isTarget = dist && dist.grade > 0;

                  return (
                    <g key={i}
                      style={{cursor:dist?"pointer":"default"}}
                      onClick={()=>dist && setSel(sel===dist.id?null:dist.id)}
                      onMouseEnter={()=>dist && setHov(dist.id)}
                      onMouseLeave={()=>setHov(null)}>
                      {(isSel||isHov) && dist && (
                        <rect x={lb.x-30} y={lb.y-16} width={60} height={32} rx={6}
                          fill={isSel?"rgba(79,99,210,0.8)":"rgba(255,255,255,0.15)"}
                          stroke={isSel?"rgba(255,255,255,0.9)":"none"}
                          strokeWidth={1.5}/>
                      )}
                      <text x={lb.x} y={lb.y-2} textAnchor="middle"
                        fontSize={isHB ? 10.5 : 9.5}
                        fontWeight={isHB ? 700 : 500}
                        fill={isSel ? "#fff" : isHB ? "#fff" : "rgba(255,255,255,0.85)"}
                        style={{userSelect:"none",
                          textShadow:isHB?"0 1px 3px rgba(0,0,0,0.8)":"0 1px 2px rgba(0,0,0,0.6)"}}>
                        {lines[0]}
                      </text>
                      {lines[1] && (
                        <text x={lb.x} y={lb.y+11} textAnchor="middle"
                          fontSize={isHB ? 10 : 9}
                          fontWeight={isHB ? 700 : 400}
                          fill={isSel ? "#fff" : isHB ? "#fff" : "rgba(255,255,255,0.75)"}
                          style={{userSelect:"none",
                            textShadow:isHB?"0 1px 3px rgba(0,0,0,0.8)":"0 1px 2px rgba(0,0,0,0.5)"}}>
                          {lines[1]}
                        </text>
                      )}
                      {isTarget && dist.grade === 1 && !isSel && (
                        <circle cx={lb.x+22} cy={lb.y-14} r={5}
                          fill="#fbbf24" stroke="#fff" strokeWidth={1}/>
                      )}
                    </g>
                  );
                })}

                {/* 경기도 화살표 */}
                <line x1="840" y1="455" x2="855" y2="440" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2"/>
                <text x="857" y="438" fontSize="9" fill="#94a3b8">경기</text>
              </svg>
            </div>

            {/* 하단 타겟 버튼 */}
            <div style={{padding:"10px 16px",borderTop:"1px solid rgba(255,255,255,0.1)",
              background:"#1e2f5a"}}>
              <div style={{fontSize:11,fontWeight:700,color:"#e2e8f0",marginBottom:7}}>
                🎯 탈환 가능 지역구 — 22대 패배 + 비례 국힘 우세
              </div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {targets.map(d=>{
                  const gm=GRADE_META[String(d.grade)];
                  return (
                    <button key={d.id} onClick={()=>setSel(d.id)}
                      style={{padding:"3px 10px",borderRadius:16,
                        border:`1.5px solid ${gm.stroke}`,
                        background:sel===d.id?gm.stroke:"rgba(255,255,255,0.08)",
                        color:sel===d.id?"#fff":gm.stroke,
                        cursor:"pointer",fontSize:11,fontWeight:600,transition:"all .15s"}}>
                      {gm.label.split(" ")[0]} {d.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── 우: 상세 패널 ── */}
          <div style={{background:C.surface,overflowY:"auto"}}>
            {!selD ? (
              <div style={{padding:24,textAlign:"center",color:C.muted}}>
                <div style={{fontSize:52,marginBottom:14,opacity:0.25}}>🗺️</div>
                <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:6}}>지역구를 선택하세요</div>
                <div style={{fontSize:12,lineHeight:1.8,marginBottom:20,color:C.muted}}>
                  지도에서 클릭하거나<br/>아래 버튼을 눌러보세요
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:7}}>
                  {targets.slice(0,7).map(d=>{
                    const gm=GRADE_META[String(d.grade)];
                    return (
                      <button key={d.id} onClick={()=>setSel(d.id)}
                        style={{padding:"10px 14px",borderRadius:10,
                          border:`1px solid ${C.border}`,background:C.bg,
                          cursor:"pointer",fontSize:13,textAlign:"left",
                          display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontWeight:700}}>{d.name}</span>
                        <span style={{fontSize:11,color:gm.color,fontWeight:600}}>{gm.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{padding:"16px 18px"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:12}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:22,fontWeight:800}}>{selD.name}</div>
                    <div style={{fontSize:12,color:C.muted,marginTop:2}}>
                      {selD.winner22} ({selD.candidate})
                    </div>
                  </div>
                  {(()=>{
                    const gm=GRADE_META[String(selD.grade)];
                    return <div style={{padding:"4px 12px",borderRadius:20,fontSize:12,
                      fontWeight:700,background:gm.fill,color:gm.color,
                      border:`1px solid ${gm.stroke}44`,whiteSpace:"nowrap"}}>{gm.label}</div>;
                  })()}
                  <button onClick={()=>setSel(null)}
                    style={{background:"none",border:"none",cursor:"pointer",
                      fontSize:20,color:C.muted,lineHeight:1,padding:"0 4px"}}>×</button>
                </div>

                {selD.grade>0 && (
                  <div style={{padding:"8px 12px",borderRadius:8,marginBottom:12,
                    background:GRADE_META[String(selD.grade)].fill,
                    border:`1px solid ${GRADE_META[String(selD.grade)].stroke}44`,
                    fontSize:12,color:GRADE_META[String(selD.grade)].color}}>
                    💡 {selD.note}
                  </div>
                )}
                {selD.oseh && (
                  <div style={{padding:"6px 12px",borderRadius:6,
                    background:"#fee2e2",border:"1px solid #fca5a5",
                    marginBottom:12,fontSize:11,color:"#b91c1c"}}>
                    🔴 9회 지방선거 — 오세훈(국힘) 승리 지역
                  </div>
                )}

                {[
                  {label:"제20대 대선 (2022.3)",   p:selD.d20.p, m:selD.d20.m},
                  {label:"제8회 지방선거 (2022.6)", p:selD.j8.p, m:selD.j8.m, pp:(selD.j8.pp as number|null), mp:(selD.j8.mp as number|null)},
                  {label:"제22대 총선 (2024.4)",    p:selD.g22.p, m:selD.g22.m, pp:(selD.g22.pp as number|null), mp:(selD.g22.mp as number|null)},
                  {label:"제21대 대선 (2025.6)",    p:selD.d21.p, m:selD.d21.m},
                  {label:"제9회 지방선거 (2026.6)", p:selD.j9.p, m:selD.j9.m, pp:(selD.j9.pp as number|null), mp:(selD.j9.mp as number|null)},
                ].map((row,ri)=>{
                  const diff = row.p - row.m;
                  return (
                    <div key={ri} style={{marginBottom:14}}>
                      <div style={{fontSize:11,fontWeight:700,color:C.muted,marginBottom:6}}>{row.label}</div>
                      <div>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                          <span style={{color:C.pph,fontWeight:700}}>국민의힘 {row.p}%</span>
                          <span style={{fontSize:10,color:diff>0?"#16a34a":"#dc2626",fontWeight:700}}>
                            {diff>0?`+${diff.toFixed(1)}`:diff.toFixed(1)}%p
                          </span>
                          <span style={{color:C.pmi,fontWeight:700}}>{row.m}% 민주당</span>
                        </div>
                        <div style={{position:"relative",height:11,borderRadius:6,overflow:"hidden",background:C.pmi}}>
                          <div style={{position:"absolute",left:0,top:0,bottom:0,
                            width:`${row.p}%`,background:C.pph,transition:"width .5s",
                            borderRadius:"6px 0 0 6px"}}/>
                          <div style={{position:"absolute",left:"50%",top:0,bottom:0,
                            width:2,background:"rgba(255,255,255,0.5)"}}/>
                        </div>
                      </div>
                      {row.pp!=null && (
                        <div style={{marginTop:4}}>
                          <div style={{display:"flex",justifyContent:"space-between",
                            fontSize:10,color:C.muted,marginBottom:2}}>
                            <span>비례 국힘 {row.pp}%</span><span>비례 민주 {row.mp}%</span>
                          </div>
                          <div style={{position:"relative",height:7,borderRadius:4,overflow:"hidden",background:"#93c5fd",opacity:0.8}}>
                            <div style={{position:"absolute",left:0,top:0,bottom:0,
                              width:`${row.pp}%`,background:"#fca5a5",borderRadius:"4px 0 0 4px"}}/>
                            <div style={{position:"absolute",left:"50%",top:0,bottom:0,
                              width:1.5,background:"rgba(255,255,255,0.6)"}}/>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {selD.grade>0 && (
                  <div style={{background:C.bg,borderRadius:10,padding:14,marginTop:4,border:`1px solid ${C.border}`}}>
                    <div style={{fontSize:12,fontWeight:700,marginBottom:10}}>📊 탈환 핵심 지표</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                      {[
                        {lb:"22대 후보 격차",v:`${(selD.g22.p-selD.g22.m).toFixed(1)}%p`,
                          c:(selD.g22.p-selD.g22.m)>0?"#16a34a":"#dc2626"},
                        {lb:"22대 비례 격차",
                          v:selD.g22.pp!=null?`+${((selD.g22.pp as number)-(selD.g22.mp as number)).toFixed(1)}%p`:"N/A",
                          c:"#16a34a"},
                        {lb:"9회 지선 격차",v:`${(selD.j9.p-selD.j9.m).toFixed(1)}%p`,
                          c:(selD.j9.p-selD.j9.m)>0?"#16a34a":"#dc2626"},
                        {lb:"21대 대선 격차",v:`${(selD.d21.p-selD.d21.m).toFixed(1)}%p`,
                          c:(selD.d21.p-selD.d21.m)>0?"#16a34a":"#dc2626"},
                      ].map((m,i)=>(
                        <div key={i} style={{background:C.surface,borderRadius:8,padding:"10px 12px",border:`1px solid ${C.border}`}}>
                          <div style={{fontSize:10,color:C.muted,marginBottom:4}}>{m.lb}</div>
                          <div style={{fontSize:20,fontWeight:800,color:m.c}}>{m.v}</div>
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

      {/* ═══════════════════════════════════════
          23ASH
      ═══════════════════════════════════════ */}
      {mini==="ash23" && (
        <div style={{padding:"18px 22px",overflowY:"auto",maxHeight:"calc(100vh - 118px)"}}>
          <div style={{background:C.surface,borderRadius:14,padding:"18px 8px 14px",
            boxShadow:"0 1px 8px rgba(0,0,0,0.06)",border:`1px solid ${C.border}`,marginBottom:18}}>
            <div style={{paddingLeft:14,marginBottom:12,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <span style={{fontSize:14,fontWeight:700}}>
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
                {scenario && <ReferenceArea x1="'26②" x2="'28②" fill="#f0f4ff" fillOpacity={0.6}/>}
                {EVTS.filter((e:any)=>!e.future||scenario).map((e:any,i:number)=>{
                  const idx=APPROVAL.findIndex(d=>d.q===e.q);
                  if(idx<0) return null;
                  return <ReferenceLine key={i} x={APPROVAL[idx].lb}
                    stroke={e.c} strokeWidth={e.future?1.5:1.2} strokeOpacity={0.7}
                    strokeDasharray={e.future?"6 3":"none"}/>;
                })}
                {(["mb","pk","mn","ys","lj"] as const).map(k=>(
                  <Line key={k} type="monotone" dataKey={k}
                    stroke={PCOLOR[k]} strokeWidth={2.5} dot={false} connectNulls={false}/>
                ))}
                {scenario && <>
                  <Line type="monotone" dataKey="lj_b" stroke="#059669" strokeWidth={2}
                    strokeDasharray="7 3" dot={false} connectNulls={false}/>
                  <Line type="monotone" dataKey="lj_o" stroke="#6ee7b7" strokeWidth={1.5}
                    strokeDasharray="4 4" dot={false} connectNulls={false}/>
                  <Line type="monotone" dataKey="lj_w" stroke="#f87171" strokeWidth={1.5}
                    strokeDasharray="4 4" dot={false} connectNulls={false}/>
                </>}
              </LineChart>
            </ResponsiveContainer>
            <div style={{display:"flex",gap:16,paddingLeft:16,flexWrap:"wrap",marginTop:6}}>
              {["이명박","박근혜","문재인","윤석열","이재명(실측)"].map((n,i)=>{
                const cols=["#e84a4a","#8b5cf6","#2b6cb0","#f97316","#059669"];
                return (
                  <div key={n} style={{display:"flex",alignItems:"center",gap:5,fontSize:11}}>
                    <div style={{width:20,height:3,background:cols[i],borderRadius:2}}/>
                    <span style={{color:cols[i],fontWeight:600}}>{n}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:12,marginBottom:18}}>
            {[
              {date:"2026.06.03",title:"9회 지방선거",icon:"🗳️",color:C.accent,
               desc:"이재명 1주년 민심 심판. 국힘 수도권 수성이 핵심.",tip:"지선 직후 = 당협 공모 골든타임"},
              {date:"2026.07~12",title:"당협 골든타임",icon:"🏛️",color:"#f97316",
               desc:"지선 후 공석 당협 대거 발생. 2022년 47개 동시 공모.",tip:"지선 후 1~2개월 내 공모 공고"},
              {date:"2027 상반기",title:"이재명 변곡점",icon:"📉",color:"#8b5cf6",
               desc:"취임 2년차 부동산·경제 이슈 하락 시작.",tip:"야당 기회 → 지역구 인지도 극대화"},
              {date:"2028.04",title:"23대 총선",icon:"🏆",color:"#059669",
               desc:"이재명 3년차. 40~47% 지지율. 국힘 유리.",tip:"당협 2년 + 개인 브랜드 = 탈환"},
            ].map((c,i)=>(
              <div key={i} style={{background:C.surface,borderRadius:12,padding:14,
                border:`1px solid ${c.color}33`,boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
                <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
                  <span style={{fontSize:22}}>{c.icon}</span>
                  <div>
                    <div style={{fontSize:10,color:C.muted}}>{c.date}</div>
                    <div style={{fontSize:13,fontWeight:700,color:c.color}}>{c.title}</div>
                  </div>
                </div>
                <div style={{fontSize:12,color:C.text,lineHeight:1.6,marginBottom:8}}>{c.desc}</div>
                <div style={{fontSize:11,background:C.bg,borderRadius:6,padding:"6px 10px"}}>💡 {c.tip}</div>
              </div>
            ))}
          </div>

          <div style={{background:C.surface,borderRadius:14,padding:18,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:14}}>🗺️ 비례대표 → 지역구 전환 로드맵</div>
            <div style={{display:"flex",overflowX:"auto",gap:2,marginBottom:18,paddingBottom:4}}>
              {[
                {p:"2025 하반기",lb:"타겟 선정",c:"#ef4444",n:"NOW"},
                {p:"2026 상반기",lb:"지선 지원",c:"#f97316",n:"6·3지선"},
                {p:"2026 하반기",lb:"당협 공모",c:"#d97706",n:"골든타임"},
                {p:"2027 상반기",lb:"당협 활동",c:"#059669",n:"2년 플랜"},
                {p:"2027 하반기",lb:"여론조사",c:"#2b6cb0",n:"D-1년"},
                {p:"2028 Q1",   lb:"공천 신청",c:"#7c3aed",n:"결전"},
                {p:"2028 Q2",   lb:"🏆 23대 총선",c:"#b45309",n:"4월"},
              ].map((s,i,arr)=>(
                <div key={i} style={{display:"flex",alignItems:"center",flex:1,minWidth:86}}>
                  <div style={{flex:1,background:s.c,borderRadius:10,padding:"8px 5px",textAlign:"center",
                    boxShadow:"0 2px 6px rgba(0,0,0,0.15)"}}>
                    <div style={{fontSize:9,color:"rgba(255,255,255,0.8)",marginBottom:2}}>{s.p}</div>
                    <div style={{fontSize:11,fontWeight:700,color:"#fff",lineHeight:1.3}}>{s.lb}</div>
                    <div style={{fontSize:9,color:"rgba(255,255,255,0.75)",marginTop:3,
                      background:"rgba(0,0,0,0.18)",borderRadius:4,padding:"1px 5px",display:"inline-block"}}>{s.n}</div>
                  </div>
                  {i<arr.length-1 && <div style={{width:14,textAlign:"center",color:C.muted,fontSize:14,flexShrink:0}}>→</div>}
                </div>
              ))}
            </div>
            {PHASES.map((ph,pi)=>(
              <div key={pi} style={{marginBottom:14,borderRadius:12,overflow:"hidden",border:`1px solid ${ph.color}33`}}>
                <div style={{background:`linear-gradient(135deg,${ph.color},${ph.color}dd)`,
                  padding:"9px 16px",display:"flex",alignItems:"center",gap:8}}>
                  <span style={{color:"#fff",fontWeight:700,fontSize:13}}>{ph.title}</span>
                  <span style={{marginLeft:"auto",fontSize:11,color:"rgba(255,255,255,0.9)",
                    background:"rgba(0,0,0,0.18)",borderRadius:10,padding:"2px 9px"}}>{ph.period}</span>
                  <span style={{fontSize:12}}>{ph.badge}</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))"}}>
                  {ph.items.map((it,ii)=>(
                    <div key={ii} style={{padding:"11px 14px",
                      borderRight:ii<ph.items.length-1?`1px solid ${C.border}`:"none",
                      borderTop:`1px solid ${C.border}`}}>
                      <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:5}}>
                        <span style={{fontSize:16}}>{it.icon}</span>
                        <span style={{fontSize:12,fontWeight:700}}>{it.t}</span>
                      </div>
                      <div style={{fontSize:11,color:C.muted,lineHeight:1.65}}>{it.d}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div style={{background:"#fffbeb",borderRadius:8,padding:"10px 14px",
              border:"1px solid #fde68a",display:"grid",
              gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
              gap:6,fontSize:11,color:"#92400e",lineHeight:1.8}}>
              <div>⚠️ <b>비례 임기 중 당협 겸직 불가</b> — 조직위원장 자격</div>
              <div>⚠️ <b>현역 없는 공석 우선</b> — 현역 재출마 경선 불리</div>
              <div>⚠️ <b>당협 ≠ 자동 공천</b> — 여론조사 30% 이상 기준</div>
              <div>⚠️ <b>강남 본적 스토리</b> — 한강벨트 내러티브 활용</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
