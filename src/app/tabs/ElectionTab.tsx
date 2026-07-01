// @ts-nocheck
import { useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip as RTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line, ReferenceLine, ReferenceArea,
} from "recharts";

const T = {
  bg:"#f5f6fa", surface:"#ffffff", accent:"#4f63d2",
  text:"#1a1f36", muted:"#8892b0", border:"#e2e8f0",
  pph:"#e84a4a", pmi:"#2b6cb0",
};

function hexPath(cx, cy, rx=32, ry=24) {
  const pts = [];
  for(let i=0;i<6;i++){
    const a=(Math.PI/180)*60*i;
    pts.push((cx+rx*Math.cos(a)).toFixed(1)+","+(cy+ry*Math.sin(a)).toFixed(1));
  }
  return "M "+pts.join(" L ")+" Z";
}

const DONG_DATA = {
  yangcheon_gap: {
    chairman: "함인경",
    dongVotes: {
    "목1동": {e:21239,v:15397,m:6889,p:8018,mr:46.2,pr:53.8},
    "목2동": {e:23446,v:15759,m:8491,p:6710,mr:55.9,pr:44.1},
    "목3동": {e:17080,v:11118,m:5746,p:5037,mr:53.3,pr:46.7},
    "목4동": {e:19791,v:13419,m:7255,p:5775,mr:55.7,pr:44.3},
    "목5동": {e:28603,v:21564,m:9046,p:11944,mr:43.1,pr:56.9},
    "신정1동": {e:13442,v:9750,m:4313,p:5169,mr:45.5,pr:54.5},
    "신정2동": {e:15810,v:11922,m:6470,p:5090,mr:56.0,pr:44.0},
    "신정6동": {e:18898,v:14718,m:6552,p:7757,mr:45.8,pr:54.2},
    "신정7동": {e:20052,v:14172,m:6669,p:7070,mr:48.5,pr:51.5}
    },
    dongPop: {
    "목1동": {pop:29804,hh:10304},
    "목2동": {pop:27711,hh:13236},
    "목3동": {pop:20500,hh:10081},
    "목4동": {pop:23502,hh:9894},
    "목5동": {pop:40419,hh:13540},
    "신정1동": {pop:19384,hh:6960},
    "신정2동": {pop:18598,hh:6875},
    "신정6동": {pop:23802,hh:8209},
    "신정7동": {pop:27596,hh:11439}
    },
  },
  ydeungpo_gap: {
    chairman: "김영주",
    dongVotes: {
    "영등포본동": {e:17389,v:11961,m:6410,p:5085,mr:55.8,pr:44.2},
    "영등포동": {e:24176,v:13375,m:6960,p:5616,mr:55.3,pr:44.7},
    "당산제1동": {e:19615,v:13902,m:7448,p:5729,mr:56.5,pr:43.5},
    "당산제2동": {e:28432,v:19578,m:9488,p:9022,mr:51.3,pr:48.7},
    "도림동": {e:14613,v:9386,m:5153,p:3835,mr:57.3,pr:42.7},
    "문래동": {e:24889,v:18274,m:9765,p:7705,mr:55.9,pr:44.1},
    "양평제1동": {e:15432,v:10540,m:5896,p:4042,mr:59.3,pr:40.7},
    "양평제2동": {e:18005,v:12364,m:6778,p:5046,mr:57.3,pr:42.7},
    "신길제3동": {e:12338,v:8132,m:4094,p:3716,mr:52.4,pr:47.6}
    },
    dongPop: {
    "영등포본동": {pop:20282,hh:10417},
    "영등포동": {pop:31168,hh:22359},
    "당산제1동": {pop:21048,hh:11991},
    "당산제2동": {pop:36397,hh:19047},
    "도림동": {pop:17571,hh:9980},
    "문래동": {pop:31039,hh:12952},
    "양평제1동": {pop:19283,hh:10531},
    "양평제2동": {pop:22404,hh:11334},
    "신길제3동": {pop:16010,hh:7837}
    },
  },
  ydeungpo_eul: {
    chairman: "박용찬",
    dongVotes: {
    "여의동": {e:26415,v:18822,m:6048,p:12511,mr:32.6,pr:67.4},
    "신길제1동": {e:15568,v:9639,m:5212,p:4168,mr:55.6,pr:44.4},
    "신길제4동": {e:9816,v:6832,m:3607,p:3100,mr:53.8,pr:46.2},
    "신길제5동": {e:7905,v:5381,m:2856,p:2413,mr:54.2,pr:45.8},
    "신길제6동": {e:15276,v:10805,m:5615,p:4970,mr:53.0,pr:47.0},
    "신길제7동": {e:14199,v:10209,m:4912,p:5141,mr:48.9,pr:51.1},
    "대림제1동": {e:11611,v:7745,m:4167,p:3426,mr:54.9,pr:45.1},
    "대림제2동": {e:10274,v:6400,m:3503,p:2755,mr:56.0,pr:44.0},
    "대림제3동": {e:17027,v:11120,m:5983,p:4913,mr:54.9,pr:45.1}
    },
    dongPop: {
    "여의동": {pop:33960,hh:14228},
    "신길제1동": {pop:18937,hh:11716},
    "신길제4동": {pop:11749,hh:5704},
    "신길제5동": {pop:9488,hh:4438},
    "신길제6동": {pop:17706,hh:9206},
    "신길제7동": {pop:19382,hh:7865},
    "대림제1동": {pop:13179,hh:6795},
    "대림제2동": {pop:11464,hh:6861},
    "대림제3동": {pop:20705,hh:10281}
    },
  },
  mapo_gap: {
    chairman: "조정훈",
    dongVotes: {
    "공덕동": {e:27041,v:17130,m:8191,p:8061,mr:50.4,pr:49.6},
    "아현동": {e:22094,v:15850,m:6951,p:8172,mr:46.0,pr:54.0},
    "도화동": {e:17863,v:13194,m:5825,p:6754,mr:46.3,pr:53.7},
    "용강동": {e:16062,v:11675,m:5138,p:6034,mr:46.0,pr:54.0},
    "대흥동": {e:11839,v:7512,m:3578,p:3488,mr:50.6,pr:49.4},
    "염리동": {e:13404,v:9587,m:4648,p:4423,mr:51.2,pr:48.8},
    "신수동": {e:16721,v:11455,m:5274,p:5642,mr:48.3,pr:51.7}
    },
    dongPop: {
    "공덕동": {pop:35847,hh:18486},
    "아현동": {pop:28592,hh:12140},
    "도화동": {pop:20190,hh:9272},
    "용강동": {pop:21238,hh:9301},
    "대흥동": {pop:14242,hh:8694},
    "염리동": {pop:16737,hh:7714},
    "신수동": {pop:21947,hh:10101}
    },
  },
  yongsan: {
    chairman: "권영세",
    dongVotes: {
    "후암동": {e:12667,v:8349,m:4606,p:3544,mr:56.5,pr:43.5},
    "용산2가동": {e:7601,v:4724,m:2536,p:2055,mr:55.2,pr:44.8},
    "남영동": {e:6093,v:3520,m:1805,p:1595,mr:53.1,pr:46.9},
    "청파동": {e:15281,v:9356,m:5499,p:3584,mr:60.5,pr:39.5},
    "원효로제1동": {e:14012,v:9675,m:4910,p:4508,mr:52.1,pr:47.9},
    "원효로제2동": {e:10628,v:7300,m:3599,p:3528,mr:50.5,pr:49.5},
    "효창동": {e:8665,v:6232,m:3220,p:2848,mr:53.1,pr:46.9},
    "용문동": {e:9567,v:6906,m:3588,p:3143,mr:53.3,pr:46.7},
    "한강로동": {e:16229,v:10623,m:4054,p:6345,mr:39.0,pr:61.0},
    "이촌제1동": {e:19605,v:14472,m:4426,p:9791,mr:31.1,pr:68.9},
    "이촌제2동": {e:6489,v:4704,m:2029,p:2570,mr:44.1,pr:55.9},
    "이태원제1동": {e:5691,v:3569,m:1477,p:1993,mr:42.6,pr:57.4},
    "이태원제2동": {e:7353,v:4371,m:1991,p:2269,mr:46.7,pr:53.3},
    "한남동": {e:12853,v:7208,m:2522,p:4517,mr:35.8,pr:64.2},
    "서빙고동": {e:9156,v:6061,m:2002,p:3899,mr:33.9,pr:66.1},
    "보광동": {e:8834,v:5285,m:2516,p:2659,mr:48.6,pr:51.4}
    },
    dongPop: {
    "후암동": {pop:15601,hh:8323},
    "용산2가동": {pop:8444,hh:4974},
    "남영동": {pop:7012,hh:5008},
    "청파동": {pop:18767,hh:11523},
    "원효로제1동": {pop:17016,hh:9367},
    "원효로제2동": {pop:13346,hh:6318},
    "효창동": {pop:10379,hh:4704},
    "용문동": {pop:11013,hh:5312},
    "한강로동": {pop:20833,hh:11189},
    "이촌제1동": {pop:24900,hh:9130},
    "이촌제2동": {pop:7724,hh:3566},
    "이태원제1동": {pop:5442,hh:3114},
    "이태원제2동": {pop:8352,hh:4676},
    "한남동": {pop:13674,hh:6951},
    "서빙고동": {pop:12203,hh:5072},
    "보광동": {pop:5104,hh:2848}
    },
  },
  jsd_gap: {
    chairman: "윤희숙",
    dongVotes: {
    "왕십리도선동": {e:20522,v:13742,m:6696,p:6861,mr:49.4,pr:50.6},
    "왕십리제2동": {e:13405,v:9249,m:5099,p:4042,mr:55.8,pr:44.2},
    "행당제1동": {e:11780,v:8306,m:4185,p:4004,mr:51.1,pr:48.9},
    "행당제2동": {e:17516,v:12534,m:6346,p:6041,mr:51.2,pr:48.8},
    "마장동": {e:17597,v:11808,m:6330,p:5290,mr:54.5,pr:45.5},
    "사근동": {e:9735,v:5642,m:2997,p:2481,mr:54.7,pr:45.3},
    "송정동": {e:8164,v:5208,m:2837,p:2282,mr:55.4,pr:44.6},
    "용답동": {e:10280,v:5985,m:3434,p:2442,mr:58.4,pr:41.6},
    "응봉동": {e:12119,v:8616,m:4333,p:4202,mr:50.8,pr:49.2},
    "성수1가제1동": {e:11981,v:7663,m:3488,p:4079,mr:46.1,pr:53.9},
    "성수1가제2동": {e:10915,v:7890,m:3810,p:3966,mr:49.0,pr:51.0},
    "성수2가제1동": {e:12504,v:8020,m:3884,p:4041,mr:49.0,pr:51.0},
    "성수2가제3동": {e:8611,v:5877,m:2778,p:3028,mr:47.8,pr:52.2}
    },
    dongPop: {
    "왕십리도선동": {pop:25497,hh:12001},
    "왕십리제2동": {pop:15665,hh:7339},
    "행당제1동": {pop:15678,hh:7352},
    "행당제2동": {pop:22270,hh:9109},
    "마장동": {pop:21389,hh:11124},
    "사근동": {pop:12169,hh:8506},
    "송정동": {pop:8985,hh:5108},
    "용답동": {pop:13151,hh:8354},
    "응봉동": {pop:14340,hh:5833},
    "성수1가제1동": {pop:14806,hh:7264},
    "성수1가제2동": {pop:14289,hh:7083},
    "성수2가제1동": {pop:13360,hh:7132},
    "성수2가제3동": {pop:9366,hh:4900}
    },
  },
  jsd_eul: {
    chairman: "최수진",
    dongVotes: {
    "소공동": {e:1818,v:1227,m:577,p:637,mr:47.5,pr:52.5},
    "회현동": {e:3709,v:2289,m:919,p:1326,mr:40.9,pr:59.1},
    "명동": {e:2116,v:1323,m:606,p:696,mr:46.5,pr:53.5},
    "필동": {e:4288,v:2950,m:1526,p:1342,mr:53.2,pr:46.8},
    "장충동": {e:4112,v:2640,m:1374,p:1189,mr:53.6,pr:46.4},
    "광희동": {e:4328,v:2418,m:1078,p:1281,mr:45.7,pr:54.3},
    "을지로동": {e:2726,v:1794,m:890,p:873,mr:50.5,pr:49.5},
    "신당동": {e:6958,v:4414,m:2380,p:1928,mr:55.2,pr:44.8},
    "다산동": {e:10396,v:6435,m:3386,p:2895,mr:53.9,pr:46.1},
    "약수동": {e:13692,v:9633,m:4622,p:4815,mr:49.0,pr:51.0},
    "청구동": {e:10525,v:7391,m:3643,p:3589,mr:50.4,pr:49.6},
    "신당제5동": {e:8765,v:5497,m:3020,p:2362,mr:56.1,pr:43.9},
    "동화동": {e:8194,v:5860,m:2885,p:2887,mr:50.0,pr:50.0},
    "황학동": {e:10653,v:6491,m:3489,p:2859,mr:55.0,pr:45.0},
    "중림동": {e:9538,v:6596,m:3336,p:3132,mr:51.6,pr:48.4},
    "금호1가동": {e:11237,v:7450,m:3739,p:3595,mr:51.0,pr:49.0},
    "금호2·3가동": {e:17199,v:11372,m:5782,p:5391,mr:51.7,pr:48.3},
    "금호4가동": {e:11746,v:8246,m:3940,p:4156,mr:48.7,pr:51.3},
    "옥수동": {e:19976,v:13874,m:5761,p:7916,mr:42.1,pr:57.9}
    },
    dongPop: {
    "소공동": {pop:2218,hh:1250},
    "회현동": {pop:4044,hh:2287},
    "명동": {pop:2490,hh:1320},
    "필동": {pop:4329,hh:2838},
    "장충동": {pop:4578,hh:2952},
    "광희동": {pop:5739,hh:3976},
    "을지로동": {pop:3048,hh:2072},
    "신당동": {pop:7341,hh:4714},
    "다산동": {pop:12902,hh:6725},
    "약수동": {pop:15648,hh:7679},
    "청구동": {pop:10645,hh:5034},
    "신당제5동": {pop:9959,hh:5419},
    "동화동": {pop:9764,hh:3955},
    "황학동": {pop:13189,hh:7892},
    "중림동": {pop:11871,hh:5866},
    "금호1가동": {pop:14237,hh:6326},
    "금호4가동": {pop:13759,hh:6305},
    "옥수동": {pop:25150,hh:10714}
    },
  },
  gwj_gap: {
    chairman: "공석",
    dongVotes: {
    "중곡제1동": {e:12745,v:8173,m:4418,p:3628,mr:54.9,pr:45.1},
    "중곡제2동": {e:17043,v:10945,m:5788,p:5021,mr:53.5,pr:46.5},
    "중곡제3동": {e:13311,v:8512,m:4299,p:4121,mr:51.1,pr:48.9},
    "중곡제4동": {e:23539,v:15807,m:8093,p:7531,mr:51.8,pr:48.2},
    "능동": {e:9593,v:6316,m:3434,p:2770,mr:55.4,pr:44.6},
    "구의제2동": {e:20558,v:13721,m:7237,p:6318,mr:53.4,pr:46.6},
    "광장동": {e:24254,v:17949,m:7745,p:10036,mr:43.6,pr:56.4},
    "군자동": {e:15925,v:9843,m:5181,p:4499,mr:53.5,pr:46.5}
    },
    dongPop: {
    "중곡제1동": {pop:14782,hh:8598},
    "중곡제2동": {pop:19705,hh:10510},
    "중곡제3동": {pop:15198,hh:8449},
    "중곡제4동": {pop:26804,hh:13176},
    "능동": {pop:10649,hh:6351},
    "구의제2동": {pop:24819,hh:11543},
    "광장동": {pop:32861,hh:11709},
    "군자동": {pop:18542,hh:11280}
    },
  },
  gwj_eul: {
    chairman: "오신환",
    dongVotes: {
    "구의제1동": {e:19621,v:12774,m:6863,p:5625,mr:55.0,pr:45.0},
    "구의제3동": {e:22078,v:16072,m:7334,p:8448,mr:46.5,pr:53.5},
    "자양제1동": {e:19035,v:12469,m:6607,p:5573,mr:54.2,pr:45.8},
    "자양제2동": {e:18139,v:12131,m:6108,p:5816,mr:51.2,pr:48.8},
    "자양제3동": {e:21886,v:16254,m:7220,p:8736,mr:45.2,pr:54.8},
    "자양제4동": {e:17015,v:11244,m:5467,p:5552,mr:49.6,pr:50.4},
    "화양동": {e:20498,v:11022,m:6028,p:4586,mr:56.8,pr:43.2}
    },
    dongPop: {
    "구의제1동": {pop:23152,hh:13561},
    "구의제3동": {pop:27431,hh:12052},
    "자양제1동": {pop:21443,hh:12128},
    "자양제2동": {pop:26266,hh:12183},
    "자양제3동": {pop:26605,hh:10958},
    "자양제4동": {pop:19864,hh:11372},
    "화양동": {pop:23015,hh:18279}
    },
  },
  dja_gap: {
    chairman: "장진영",
    dongVotes: {
    "노량진제1동": {e:24603,v:16111,m:7141,p:8040,mr:47.0,pr:53.0},
    "노량진제2동": {e:10662,v:7295,m:3559,p:3276,mr:52.1,pr:47.9},
    "상도제2동": {e:20809,v:14484,m:6643,p:7163,mr:48.1,pr:51.9},
    "상도제3동": {e:22553,v:15624,m:8149,p:6514,mr:55.6,pr:44.4},
    "상도제4동": {e:21389,v:13194,m:6717,p:5671,mr:54.2,pr:45.8},
    "대방동": {e:25956,v:17396,m:8430,p:7952,mr:51.5,pr:48.5},
    "신대방제1동": {e:18000,v:12405,m:5797,p:5955,mr:49.3,pr:50.7},
    "신대방제2동": {e:18254,v:12857,m:6480,p:5622,mr:53.5,pr:46.5}
    },
    dongPop: {
    "노량진제1동": {pop:33533,hh:18550},
    "노량진제2동": {pop:7679,hh:5492},
    "상도제2동": {pop:26784,hh:12362},
    "상도제3동": {pop:23300,hh:12226},
    "상도제4동": {pop:28665,hh:14770},
    "대방동": {pop:33513,hh:16084},
    "신대방제1동": {pop:22774,hh:10456},
    "신대방제2동": {pop:21982,hh:11060}
    },
  },
  dja_eul: {
    chairman: "나경원",
    dongVotes: {
    "상도제1동": {e:34852,v:24252,m:10779,p:13104,mr:45.1,pr:54.9},
    "흑석동": {e:23477,v:17278,m:6633,p:10456,mr:38.8,pr:61.2},
    "사당제1동": {e:18786,v:12318,m:6089,p:6008,mr:50.3,pr:49.7},
    "사당제2동": {e:23260,v:17376,m:7218,p:9960,mr:42.0,pr:58.0},
    "사당제3동": {e:17042,v:12112,m:4891,p:7073,mr:40.9,pr:59.1},
    "사당제4동": {e:11967,v:8526,m:4292,p:4156,mr:50.8,pr:49.2},
    "사당제5동": {e:12128,v:8971,m:4199,p:4690,mr:47.2,pr:52.8}
    },
    dongPop: {
    "상도제1동": {pop:43965,hh:23245},
    "흑석동": {pop:29907,hh:13049},
    "사당제1동": {pop:22147,hh:14013},
    "사당제2동": {pop:27607,hh:12503},
    "사당제3동": {pop:23173,hh:10420},
    "사당제4동": {pop:13546,hh:7313},
    "사당제5동": {pop:13752,hh:6645}
    },
  },
  seocho_gap: {
    chairman: "조은희",
    dongVotes: {},
    dongPop: {},
  },
  gnm_gap: {
    chairman: "서명옥",
    dongVotes: {
    "신사동": {e:12764,v:8341,m:2200,p:6040,mr:26.7,pr:73.3},
    "논현1동": {e:18097,v:8805,m:3782,p:4862,mr:43.8,pr:56.2},
    "논현2동": {e:16707,v:9189,m:3266,p:5806,mr:36.0,pr:64.0},
    "압구정동": {e:19663,v:13247,m:2359,p:10682,mr:18.1,pr:81.9},
    "청담동": {e:19200,v:11653,m:3088,p:8408,mr:26.9,pr:73.1},
    "역삼1동": {e:28414,v:13404,m:5950,p:7188,mr:45.3,pr:54.7},
    "역삼2동": {e:26672,v:16884,m:6318,p:10327,mr:38.0,pr:62.0}
    },
    dongPop: {
    "신사동": {pop:14985,hh:6550},
    "논현1동": {pop:20696,hh:13505},
    "논현2동": {pop:20072,hh:11131},
    "압구정동": {pop:25429,hh:9956},
    "청담동": {pop:26255,hh:11491},
    "역삼1동": {pop:34205,hh:23851},
    "역삼2동": {pop:35918,hh:15590}
    },
  },
  gnm_eul: {
    chairman: "박수민",
    dongVotes: {
    "개포1동": {e:17006,v:12684,m:3765,p:8737,mr:30.1,pr:69.9},
    "개포2동": {e:28443,v:20549,m:6879,p:13407,mr:33.9,pr:66.1},
    "개포3동": {e:15118,v:11434,m:4831,p:6457,mr:42.8,pr:57.2},
    "개포4동": {e:17854,v:11861,m:4881,p:6839,mr:41.6,pr:58.4},
    "일원본동": {e:16901,v:12558,m:4822,p:7574,mr:38.9,pr:61.1},
    "일원1동": {e:11545,v:7504,m:3337,p:4058,mr:45.1,pr:54.9},
    "수서동": {e:12439,v:8919,m:3581,p:5179,mr:40.9,pr:59.1},
    "세곡동": {e:32924,v:22727,m:10744,p:11690,mr:47.9,pr:52.1}
    },
    dongPop: {
    "개포1동": {pop:26487,hh:9142},
    "개포2동": {pop:39995,hh:14179},
    "개포3동": {pop:15465,hh:6956},
    "개포4동": {pop:22988,hh:10061},
    "일원본동": {pop:22259,hh:7931},
    "일원1동": {pop:14071,hh:7474},
    "수서동": {pop:13468,hh:7571},
    "세곡동": {pop:45678,hh:20183}
    },
  },
  gnm_byung: {
    chairman: "고동진",
    dongVotes: {
    "삼성1동": {e:9632,v:6199,m:1757,p:4347,mr:28.8,pr:71.2},
    "삼성2동": {e:23061,v:14498,m:4963,p:9243,mr:34.9,pr:65.1},
    "대치1동": {e:17206,v:12734,m:3563,p:8797,mr:28.8,pr:71.2},
    "대치2동": {e:26291,v:18519,m:5379,p:12786,mr:29.6,pr:70.4},
    "대치4동": {e:15216,v:8913,m:3910,p:4793,mr:44.9,pr:55.1},
    "도곡1동": {e:15405,v:11013,m:3775,p:7052,mr:34.9,pr:65.1},
    "도곡2동": {e:23037,v:16087,m:3747,p:12018,mr:23.8,pr:76.2}
    },
    dongPop: {
    "삼성1동": {pop:12727,hh:5551},
    "삼성2동": {pop:30189,hh:13801},
    "대치1동": {pop:23507,hh:7189},
    "대치2동": {pop:38232,hh:13390},
    "대치4동": {pop:17995,hh:9569},
    "도곡1동": {pop:20760,hh:8483},
    "도곡2동": {pop:31581,hh:11287}
    },
  },
  spg: {
    chairman: "박정훈",
    dongVotes: {},
    dongPop: {},
  },
  spe: {
    chairman: "배현진",
    dongVotes: {},
    dongPop: {},
  },
  spb: {
    chairman: "김근식",
    dongVotes: {
    "거여1동": {e:10222,v:7058,m:3677,p:3292,mr:52.8,pr:47.2},
    "거여2동": {e:18843,v:13647,m:6897,p:6517,mr:51.4,pr:48.6},
    "마천1동": {e:14906,v:9741,m:4970,p:4619,mr:51.8,pr:48.2},
    "마천2동": {e:15705,v:10541,m:5491,p:4892,mr:52.9,pr:47.1},
    "오금동": {e:29663,v:20508,m:9469,p:10777,mr:46.8,pr:53.2},
    "가락본동": {e:19750,v:13235,m:6225,p:6785,mr:47.8,pr:52.2},
    "가락2동": {e:23536,v:16697,m:7753,p:8763,mr:46.9,pr:53.1},
    "문정1동": {e:16499,v:11525,m:5427,p:5945,mr:47.7,pr:52.3},
    "장지동": {e:23236,v:16578,m:8623,p:7721,mr:52.8,pr:47.2},
    "위례동": {e:29020,v:20763,m:10738,p:9824,mr:52.2,pr:47.8}
    },
    dongPop: {
    "거여1동": {pop:11738,hh:5657},
    "거여2동": {pop:22909,hh:10055},
    "마천1동": {pop:15057,hh:7255},
    "마천2동": {pop:16930,hh:8404},
    "오금동": {pop:36885,hh:15733},
    "가락본동": {pop:24506,hh:11715},
    "가락2동": {pop:28362,hh:11715},
    "문정1동": {pop:19628,hh:8987},
    "장지동": {pop:30635,hh:13203},
    "위례동": {pop:44847,hh:15024}
    },
  },
  gdd_gap: {
    chairman: "전주혜",
    dongVotes: {
    "강일동": {e:25664,v:18352,m:10157,p:7713,mr:56.8,pr:43.2},
    "상일제1동": {e:27351,v:20472,m:9199,p:10697,mr:46.2,pr:53.8},
    "상일제2동": {e:9421,v:6754,m:3940,p:2627,mr:60.0,pr:40.0},
    "명일제1동": {e:19905,v:14492,m:6514,p:7559,mr:46.3,pr:53.7},
    "명일제2동": {e:12906,v:9784,m:4147,p:5406,mr:43.4,pr:56.6},
    "고덕제1동": {e:17010,v:12817,m:6097,p:6373,mr:48.9,pr:51.1},
    "고덕제2동": {e:17278,v:12591,m:5528,p:6705,mr:45.2,pr:54.8},
    "암사제1동": {e:26080,v:16217,m:8484,p:7231,mr:54.0,pr:46.0},
    "암사제2동": {e:12896,v:9701,m:5024,p:4421,mr:53.2,pr:46.8},
    "암사제3동": {e:13785,v:10621,m:4967,p:5400,mr:47.9,pr:52.1}
    },
    dongPop: {
    "강일동": {pop:34219,hh:13872},
    "상일제1동": {pop:38831,hh:13526},
    "상일제2동": {pop:13147,hh:5265},
    "명일제1동": {pop:24709,hh:10023},
    "명일제2동": {pop:16788,hh:6425},
    "고덕제1동": {pop:23615,hh:8144},
    "고덕제2동": {pop:26148,hh:10345},
    "암사제1동": {pop:32527,hh:15869},
    "암사제2동": {pop:14427,hh:6400},
    "암사제3동": {pop:16854,hh:6043}
    },
  },
  gdd_eul: {
    chairman: "이재영",
    dongVotes: {
    "천호제1동": {e:21782,v:13932,m:7324,p:6224,mr:54.1,pr:45.9},
    "천호제2동": {e:27208,v:16931,m:8905,p:7552,mr:54.1,pr:45.9},
    "천호제3동": {e:22359,v:14057,m:7360,p:6260,mr:54.0,pr:46.0},
    "성내제1동": {e:15422,v:10841,m:5669,p:4871,mr:53.8,pr:46.2},
    "성내제2동": {e:19552,v:12318,m:6457,p:5479,mr:54.1,pr:45.9},
    "성내제3동": {e:18962,v:12670,m:6630,p:5667,mr:53.9,pr:46.1},
    "길동": {e:35884,v:22705,m:11318,p:10795,mr:51.2,pr:48.8},
    "둔촌제2동": {e:19221,v:13294,m:6560,p:6379,mr:50.7,pr:49.3}
    },
    dongPop: {
    "천호제1동": {pop:24067,hh:12519},
    "천호제2동": {pop:35981,hh:19294},
    "천호제3동": {pop:27608,hh:15796},
    "성내제1동": {pop:18827,hh:8232},
    "성내제2동": {pop:23890,hh:13948},
    "성내제3동": {pop:21508,hh:10635},
    "길동": {pop:47916,hh:24345},
    "둔촌제2동": {pop:25158,hh:10973}
    },
  },
  hanam: {
    chairman: "이용",
    dongVotes: {
    "천현동": {e:5256,v:3157,m:1262,p:1864,mr:40.4,pr:59.6},
    "신장1동": {e:7179,v:4719,m:2323,p:2348,mr:49.7,pr:50.3},
    "신장2동": {e:34837,v:23794,m:11080,p:12495,mr:47.0,pr:53.0},
    "덕풍1동": {e:11741,v:7872,m:3859,p:3941,mr:49.5,pr:50.5},
    "덕풍2동": {e:14634,v:9188,m:4500,p:4584,mr:49.5,pr:50.5},
    "감북동": {e:2620,v:1779,m:779,p:985,mr:44.2,pr:55.8},
    "감일동": {e:26572,v:18502,m:10472,p:7845,mr:57.2,pr:42.8},
    "위례동": {e:22793,v:16074,m:7561,p:8375,mr:47.4,pr:52.6},
    "춘궁동": {e:1760,v:1216,m:500,p:709,mr:41.4,pr:58.6},
    "초이동": {e:2548,v:1594,m:630,p:949,mr:39.9,pr:60.1}
    },
    dongPop: {
    "천현동": {pop:5687,hh:3172},
    "신장1동": {pop:7003,hh:3997},
    "신장2동": {pop:44704,hh:18732},
    "덕풍1동": {pop:13901,hh:6280},
    "덕풍2동": {pop:17142,hh:8407},
    "감북동": {pop:3218,hh:1785},
    "감일동": {pop:39576,hh:14764},
    "위례동": {pop:35225,hh:12258},
    "춘궁동": {pop:751,hh:511},
    "초이동": {pop:2852,hh:1667}
    },
  },
};

const DISTRICTS = [
  { id:"yangcheon_gap",  name:"양천갑",   sub:"황희",    pph:false, oseh:false, cx:100, cy:228, rx:32, ry:24, grade:1,  note:"후보격차 -1.6%p / 비례+11.8%p",
    j9:{p:49.2,m:48.5,pp:47.9,mp:52.1}, d21:{p:41.3,m:48.3}, g22:{p:48.2,m:49.8,pp:37.0,mp:25.2}, j8:{p:58.8,m:39.7,pp:55.3,mp:44.7}, d20:{p:50.1,m:46.4} },
  { id:"ydeungpo_gap",   name:"영등포갑", sub:"채현일",  pph:false, oseh:false, cx:170, cy:228, rx:32, ry:24, grade:3,  note:"후보격차 -12.8%p / 비례+10.9%p",
    j9:{p:50.5,m:46.7,pp:49.0,mp:51.0}, d21:{p:41.5,m:45.9}, g22:{p:41.7,m:54.5,pp:37.1,mp:26.2}, j8:{p:60.1,m:38.2,pp:null,mp:null}, d20:{p:51.6,m:44.6} },
  { id:"ydeungpo_eul",   name:"영등포을", sub:"김민석",  pph:false, oseh:false, cx:240, cy:228, rx:32, ry:24, grade:1,  note:"후보격차 -1.2%p / 비례+10.9%p",
    j9:{p:50.5,m:46.7,pp:49.0,mp:51.0}, d21:{p:41.5,m:45.9}, g22:{p:49.0,m:50.2,pp:37.1,mp:26.2}, j8:{p:60.1,m:38.2,pp:null,mp:null}, d20:{p:51.6,m:44.6} },
  { id:"mapo_gap",       name:"마포갑",   sub:"조정훈",  pph:true,  oseh:false, cx:240, cy:162, rx:32, ry:24, grade:0,  note:"22대 국힘 조정훈 당선",
    j9:{p:49.9,m:49.6,pp:45.8,mp:54.2}, d21:{p:39.1,m:48.4}, g22:{p:48.3,m:47.7,pp:34.6,mp:25.2}, j8:{p:56.6,m:40.8,pp:52.2,mp:47.8}, d20:{p:49.0,m:46.5} },
  { id:"yongsan",        name:"용산",     sub:"권영세",  pph:true,  oseh:true,  cx:318, cy:162, rx:32, ry:24, grade:-1, note:"22대 국힘 현역",
    j9:{p:57.1,m:40.2,pp:55.3,mp:44.7}, d21:{p:47.6,m:41.1}, g22:{p:51.8,m:47.0,pp:42.3,mp:22.2}, j8:{p:64.9,m:33.3,pp:null,mp:null}, d20:{p:56.4,m:39.9} },
  { id:"jsd_eul",        name:"중성동을", sub:"박성준",  pph:false, oseh:false, cx:450, cy:145,  rx:32, ry:24, grade:1,  note:"후보격차 -2.3%p / 비례+14.0%p",
    j9:{p:49.6,m:47.9,pp:48.6,mp:51.4}, d21:{p:42.0,m:46.8}, g22:{p:48.5,m:50.8,pp:38.8,mp:24.8}, j8:{p:58.5,m:39.9,pp:54.5,mp:45.5}, d20:{p:51.0,m:45.4} },
  { id:"jsd_gap",        name:"중성동갑", sub:"전현희",  pph:false, oseh:false, cx:410, cy:108, rx:32, ry:24, grade:2,  note:"후보격차 -5.2%p / 비례+14.0%p",
    j9:{p:49.6,m:47.9,pp:48.6,mp:51.4}, d21:{p:42.0,m:46.8}, g22:{p:47.4,m:52.6,pp:38.8,mp:24.8}, j8:{p:58.5,m:39.9,pp:54.5,mp:45.5}, d20:{p:51.0,m:45.4} },
  { id:"gwj_gap",        name:"광진갑",   sub:"이정헌",  pph:false, oseh:false, cx:500, cy:108,  rx:32, ry:24, grade:2,  note:"후보격차 -5.0%p / 비례+7.2%p",
    j9:{p:48.7,m:48.6,pp:47.3,mp:52.6}, d21:{p:39.9,m:48.1}, g22:{p:47.5,m:52.5,pp:35.8,mp:28.6}, j8:{p:58.3,m:40.0,pp:53.6,mp:46.4}, d20:{p:48.8,m:47.2} },
  { id:"gwj_eul",        name:"광진을",   sub:"고민정",  pph:false, oseh:false, cx:550, cy:165, rx:32, ry:24, grade:2,  note:"후보격차 -3.9%p / 비례+7.2%p",
    j9:{p:48.7,m:48.6,pp:47.3,mp:52.6}, d21:{p:39.9,m:48.1}, g22:{p:47.6,m:51.5,pp:35.8,mp:28.6}, j8:{p:58.3,m:40.0,pp:53.6,mp:46.4}, d20:{p:48.8,m:47.2} },
  { id:"gdd_gap",        name:"강동갑",   sub:"진선미",  pph:false, oseh:false, cx:700, cy:185, rx:32, ry:24, grade:1,  note:"후보격차 -2.2%p / 비례+12.1%p",
    j9:{p:50.6,m:46.9,pp:49.9,mp:50.1}, d21:{p:43.0,m:46.2}, g22:{p:47.9,m:50.1,pp:38.1,mp:26.0}, j8:{p:60.6,m:37.9,pp:56.0,mp:40.1}, d20:{p:51.7,m:44.8} },
  { id:"gdd_eul",        name:"강동을",   sub:"이해식",  pph:false, oseh:false, cx:700, cy:248, rx:32, ry:24, grade:3,  note:"후보격차 -8.8%p / 비례+12.1%p",
    j9:{p:50.6,m:46.9,pp:49.9,mp:50.1}, d21:{p:43.0,m:46.2}, g22:{p:44.7,m:53.5,pp:38.1,mp:26.0}, j8:{p:60.6,m:37.9,pp:56.0,mp:40.1}, d20:{p:51.7,m:44.8} },
  { id:"hanam",          name:"하남갑",   sub:"이광재",  pph:false, oseh:false, cx:780, cy:215, rx:38, ry:28, grade:1,  note:"후보격차 -1.2%p / 비례+9.7%p",
    j9:{p:39.4,m:55.0,pp:45.5,mp:54.5}, d21:{p:39.5,m:50.7}, g22:{p:49.4,m:50.6,pp:35.7,mp:26.0}, j8:{p:50.5,m:47.9,pp:52.9,mp:47.1}, d20:{p:48.3,m:48.7} },
  { id:"dja_gap",        name:"동작갑",   sub:"김병기",  pph:false, oseh:false, cx:270, cy:280, rx:32, ry:24, grade:2,  note:"후보격차 -5.5%p / 비례+10.8%p",
    j9:{p:49.6,m:47.2,pp:43.4,mp:49.4}, d21:{p:40.9,m:46.9}, g22:{p:45.0,m:50.5,pp:36.4,mp:25.6}, j8:{p:58.1,m:40.1,pp:null,mp:null}, d20:{p:50.5,m:45.7} },
  { id:"dja_eul",        name:"동작을",   sub:"나경원",  pph:true,  oseh:true,  cx:340, cy:280, rx:32, ry:24, grade:-1, note:"22대 국힘 현역",
    j9:{p:49.6,m:47.2,pp:43.4,mp:49.4}, d21:{p:40.9,m:46.9}, g22:{p:54.0,m:46.0,pp:36.4,mp:25.6}, j8:{p:58.1,m:40.1,pp:null,mp:null}, d20:{p:50.5,m:45.7} },
  { id:"gnm_gap",        name:"강남갑",   sub:"서명옥",  pph:true,  oseh:true,  cx:420, cy:228, rx:32, ry:24, grade:-1, note:"강남 텃밭",
    j9:{p:66.0,m:31.9,pp:66.1,mp:33.9}, d21:{p:56.6,m:32.2}, g22:{p:64.2,m:35.8,pp:50.3,mp:14.9}, j8:{p:74.4,m:24.5,pp:72.2,mp:27.8}, d20:{p:67.0,m:30.3} },
  { id:"gnm_byung",      name:"강남병",   sub:"고동진",  pph:true,  oseh:true,  cx:470, cy:345, rx:32, ry:24, grade:-1, note:"강남 텃밭",
    j9:{p:66.0,m:31.9,pp:66.1,mp:33.9}, d21:{p:56.6,m:32.2}, g22:{p:66.3,m:32.8,pp:50.3,mp:14.9}, j8:{p:74.4,m:24.5,pp:72.2,mp:27.8}, d20:{p:67.0,m:30.3} },
  { id:"gnm_eul",        name:"강남을",   sub:"박수민",  pph:true,  oseh:true,  cx:470, cy:288, rx:32, ry:24, grade:-1, note:"강남 텃밭",
    j9:{p:66.0,m:31.9,pp:66.1,mp:33.9}, d21:{p:56.6,m:32.2}, g22:{p:58.6,m:41.4,pp:50.3,mp:14.9}, j8:{p:74.4,m:24.5,pp:72.2,mp:27.8}, d20:{p:67.0,m:30.3} },
  { id:"seocho_gap",     name:"서초갑",   sub:"조온희",  pph:true,  oseh:true,  cx:370, cy:228, rx:32, ry:24, grade:-1, note:"22대 국힘 현역",
    j9:{p:66.1,m:33.9,pp:66.1,mp:33.9}, d21:{p:66.0,m:31.9}, g22:{p:65.96,m:31.92,pp:50.3,mp:14.9}, j8:{p:74.4,m:24.5,pp:72.2,mp:27.8}, d20:{p:67.0,m:30.3} },
  { id:"spg",            name:"송파갑",   sub:"박정훈",  pph:true,  oseh:true,  cx:560, cy:228, rx:32, ry:24, grade:-1, note:"22대 국힘 현역",
    j9:{p:54.8,m:46.9,pp:54.0,mp:43.0}, d21:{p:46.6,m:42.1}, g22:{p:47.38,m:52.61,pp:41.9,mp:22.1}, j8:{p:64.7,m:34.0,pp:60.9,mp:37.7}, d20:{p:56.8,m:40.2} },
  { id:"spe",            name:"송파을",   sub:"배현진",  pph:true,  oseh:true,  cx:510, cy:228, rx:32, ry:24, grade:-1, note:"22대 국힘 현역",
    j9:{p:54.8,m:46.9,pp:54.0,mp:43.0}, d21:{p:46.6,m:42.1}, g22:{p:44.68,m:53.55,pp:38.08,mp:26.01}, j8:{p:55.95,m:40.07,pp:55.95,mp:40.07}, d20:{p:51.7,m:44.8} },
  { id:"spb",            name:"송파병",   sub:"남인순",  pph:false, oseh:false, cx:630, cy:228, rx:32, ry:24, grade:1,  note:"후보격차 -2.1%p / 비례+19.8%p ★",
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
  const active=props.active; const payload=props.payload;
  if(!active||!payload||!payload.length) return null;
  const d=payload[0]&&payload[0].payload;
  return(
    <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,padding:"8px 12px",fontSize:11}}>
      <b style={{color:T.text}}>{d?d.lb:""}</b>
      {payload.filter(function(p){return p.value!=null;}).map(function(p,i){
        return <div key={i} style={{color:PC[p.dataKey]||T.muted}}>{PL[p.dataKey]||p.dataKey}: <b>{p.value}%</b></div>;
      })}
    </div>
  );
}

// 원형 그래프 커스텀 레이블
function PieLabel(props) {
  const {cx,cy,midAngle,outerRadius,percent,name,value}=props;
  if(percent<0.05) return null;
  const RADIAN=Math.PI/180;
  const r=outerRadius+18;
  const x=cx+r*Math.cos(-midAngle*RADIAN);
  const y=cy+r*Math.sin(-midAngle*RADIAN);
  return(
    <text x={x} y={y} fill={props.fill||"#444"} textAnchor={x>cx?"start":"end"}
      dominantBaseline="central" fontSize={10} fontWeight={600}>
      {value}%
    </text>
  );
}

export default function ElectionTab(){
  const [tab,setTab]=useState("map");
  const [sel,setSel]=useState(null);
  const [scenario,setScenario]=useState(true);

  const selD=DISTRICTS.find(function(d){return d.id===sel;});
  const targets=DISTRICTS.filter(function(d){return d.grade>0;}).sort(function(a,b){return a.grade-b.grade;});
  const dd=sel?DONG_DATA[sel]:null;

  // 동별 득표율 기준으로 정렬된 동 목록
  const sortedDongs=dd&&dd.dongVotes?Object.keys(dd.dongVotes).sort(function(a,b){
    return dd.dongVotes[b].mr - dd.dongVotes[a].mr;
  }):[];

  // 동별 득표율 BarChart 데이터
  const dongVoteChartData=sortedDongs.map(function(dong){
    const v=dd.dongVotes[dong];
    return {name:dong,민주:v.mr,국힘:v.pr};
  });

  // 동별 인구 BarChart 데이터 (득표율과 동일 순서)
  const dongPopChartData=sortedDongs.filter(function(d){return dd.dongPop&&dd.dongPop[d];}).map(function(dong){
    const p=dd.dongPop[dong];
    return {name:dong,인구:Math.round(p.pop/1000*10)/10};
  });

  // 선거 결과 원형 그래프 데이터
  function pieData(p,m){
    const etc=Math.max(0,100-p-m);
    const arr=[{name:"국힘",value:p},{name:"민주",value:m}];
    if(etc>0.5) arr.push({name:"기타",value:Math.round(etc*10)/10});
    return arr;
  }
  const PIE_COLORS=["#e84a4a","#2b6cb0","#94a3b8"];
  const elecRows=selD?[
    {label:"20대 대선 (2022.3)",  data:pieData(selD.d20.p,selD.d20.m), pp:null,mp:null},
    {label:"8회 지선 (2022.6)",   data:pieData(selD.j8.p,selD.j8.m),  pp:selD.j8.pp,mp:selD.j8.mp},
    {label:"22대 총선 (2024.4)",  data:pieData(selD.g22.p,selD.g22.m),pp:selD.g22.pp,mp:selD.g22.mp},
    {label:"21대 대선 (2025.6)",  data:pieData(selD.d21.p,selD.d21.m),pp:null,mp:null},
    {label:"9회 지선 (2026.6)",   data:pieData(selD.j9.p,selD.j9.m),  pp:selD.j9.pp,mp:selD.j9.mp},
  ]:[];

  return(
    <div style={{background:T.bg,minHeight:"100vh",fontFamily:"'Apple SD Gothic Neo','Pretendard',sans-serif",color:T.text}}>
      {/* 탭 바 */}
      <div style={{background:T.surface,borderBottom:"1px solid "+T.border,padding:"10px 20px",display:"flex",gap:4}}>
        {[["map","🗺️ 한강벨트 분석"],["ash","📡 23ASH"]].map(function(pair){
          const k=pair[0],lb=pair[1];
          return(
            <button key={k} onClick={function(){setTab(k); if(k==="map") setSel(null);}}
              style={{padding:"7px 22px",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,fontWeight:tab===k?700:400,
                background:tab===k?T.accent:"transparent",color:tab===k?"#fff":T.muted,transition:"all .15s"}}>{lb}</button>
          );
        })}
      </div>

      {tab==="map"&&(
        <div>
          {/* 지도 헤더 */}
          <div style={{padding:"6px 16px",fontSize:11,color:"#64748b",background:"#fffbeb",borderBottom:"1px solid "+T.border}}>
            🔴 빨간 테두리 = 9회 지선 오세훈(국힘) 승리 지역구 &nbsp;|&nbsp; 클릭 → 하단 상세 데이터
          </div>

          {/* SVG 지도 — 전체 너비 */}
          <div style={{background:"#f8fafd",padding:"8px 16px"}}>
            <svg viewBox="0 0 900 430" style={{width:"100%",display:"block"}}>
              <ellipse cx={460} cy={255} rx={440} ry={205} fill="#eef2ff" stroke="#c7d2fe" strokeWidth={1.5}/>

              {/* 한강 */}
              <path d="M40,188 Q120,182 200,186 Q280,190 340,185 Q370,178 400,162 Q430,148 470,130 Q510,148 550,168 Q580,175 620,162 Q660,148 700,128 Q740,115 820,102"
                stroke="#93c5fd" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.5}/>
              <text x={450} y={148} fill="#3b82f6" fontSize={9} textAnchor="middle" opacity={0.7}>한 강</text>

              {/* 경기도 */}
              <path d="M830,104 L812,112" stroke="#94a3b8" strokeWidth={1.2} strokeDasharray="4 3"/>
              <text x={832} y={100} fill="#64748b" fontSize={9}>경기도</text>

              {/* hexagon 본체 */}
              {DISTRICTS.map(function(d){
                const path=hexPath(d.cx,d.cy,d.rx,d.ry);
                const isSel=sel===d.id;
                const fillBase=d.pph?(isSel?"#ef4444":"#fca5a5"):(isSel?"#3b82f6":"#93c5fd");
                const strokeC=d.oseh?"#ef4444":(d.pph?"#f87171":"#60a5fa");
                const strokeW=d.oseh?2.5:(isSel?2.5:1.5);
                return(
                  <g key={d.id} style={{cursor:"pointer"}} onClick={function(){setSel(d.id===sel?null:d.id);}}>
                    <path d={hexPath(d.cx+2,d.cy+3,d.rx,d.ry)} fill="rgba(0,0,0,0.08)" style={{pointerEvents:"none"}}/>
                    <path d={path} fill={fillBase} stroke={strokeC} strokeWidth={strokeW} style={{transition:"all .15s"}}/>
                  </g>
                );
              })}

              {/* 레이블 */}
              {DISTRICTS.map(function(d){
                const isSel=sel===d.id;
                const textC=d.pph?"#7f1d1d":"#1e3a5f";
                return(
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

          {/* 탈환 타겟 버튼 */}
          <div style={{padding:"8px 16px",background:T.surface,borderTop:"1px solid "+T.border,borderBottom:"1px solid "+T.border}}>
            <span style={{fontSize:11,fontWeight:700,color:T.muted,marginRight:8}}>🎯 탈환 가능 지역구</span>
            {targets.map(function(d){
              const c=GM[d.grade].stroke;
              return(
                <button key={d.id} onClick={function(){setSel(d.id);}}
                  style={{padding:"3px 10px",borderRadius:14,border:"1.5px solid "+c,fontSize:11,fontWeight:600,marginRight:5,marginBottom:3,
                    background:sel===d.id?c:"transparent",color:sel===d.id?"#fff":c,cursor:"pointer"}}>
                  {GM[d.grade].label.split(" ")[0]} {d.name}
                </button>
              );
            })}
          </div>

          {/* 하단 상세 패널 */}
          {selD&&(
            <div style={{padding:"16px",background:T.bg,borderTop:"2px solid "+T.accent}}>
              {/* 헤더 */}
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,flexWrap:"wrap"}}>
                <div>
                  <span style={{fontSize:22,fontWeight:800}}>{selD.name}</span>
                  <span style={{fontSize:14,color:T.muted,marginLeft:8}}>{selD.pph?"국힘":"민주"} ({selD.sub})</span>
                </div>
                {dd&&dd.chairman&&(
                  <div style={{padding:"5px 14px",borderRadius:20,background:"#f0f4ff",border:"1px solid #c7d2fe",fontSize:13,color:"#4338ca",fontWeight:700}}>
                    🏛 당협위원장: {dd.chairman}
                  </div>
                )}
                {selD.grade!==0&&(
                  <div style={{padding:"4px 12px",borderRadius:16,fontSize:12,fontWeight:700,
                    background:GM[selD.grade].fill,color:GM[selD.grade].color,border:"1px solid "+GM[selD.grade].stroke+"44"}}>
                    {GM[selD.grade].label}
                  </div>
                )}
                {selD.oseh&&(
                  <div style={{padding:"4px 12px",borderRadius:16,background:"#fee2e2",border:"1px solid #fca5a5",fontSize:12,color:"#b91c1c"}}>
                    🔴 9회 지선 오세훈(국힘) 승리
                  </div>
                )}
                <button onClick={function(){setSel(null);}}
                  style={{marginLeft:"auto",background:"none",border:"1px solid "+T.border,borderRadius:8,cursor:"pointer",fontSize:14,color:T.muted,padding:"4px 12px"}}>
                  닫기 ×
                </button>
              </div>

              {/* 메인 그리드: 선거결과(원형) | 탈환지표 | 동별그래프 */}
              <div style={{display:"grid",gridTemplateColumns:"3fr 1fr 2fr 2fr",gap:16,alignItems:"start"}}>

                {/* 1. 선거 결과 원형 그래프 5개 — 가로로 */}
                <div style={{background:T.surface,borderRadius:12,padding:14,border:"1px solid "+T.border}}>
                  <div style={{fontSize:12,fontWeight:700,marginBottom:10,color:T.text}}>📊 선거 결과</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"space-between"}}>
                    {elecRows.map(function(row,ri){
                      return(
                        <div key={ri} style={{flex:"1 1 80px",minWidth:75}}>
                          <div style={{fontSize:9,fontWeight:700,color:T.muted,textAlign:"center",marginBottom:2}}>{row.label}</div>
                          <ResponsiveContainer width="100%" height={110}>
                            <PieChart>
                              <Pie data={row.data} cx="50%" cy="50%" innerRadius={24} outerRadius={40}
                                startAngle={90} endAngle={-270} dataKey="value" labelLine={false}>
                                {row.data.map(function(entry,i){
                                  return <Cell key={i} fill={PIE_COLORS[i]||"#cbd5e1"}/>;
                                })}
                              </Pie>
                              <RTooltip formatter={function(v,n){return [v+"%",n];}}/>
                            </PieChart>
                          </ResponsiveContainer>
                          <div style={{display:"flex",justifyContent:"center",gap:6,flexWrap:"wrap"}}>
                            {row.data.map(function(entry,i){
                              return(
                                <div key={i} style={{fontSize:9,fontWeight:700,color:PIE_COLORS[i]}}>
                                  {entry.name} {entry.value}%
                                </div>
                              );
                            })}
                          </div>
                          {row.pp!=null&&(
                            <div style={{fontSize:8,color:T.muted,textAlign:"center",marginTop:3}}>
                              비례 국힘{row.pp}% / 민주{row.mp}%
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. 탈환 핵심 지표 */}
                <div style={{background:T.surface,borderRadius:12,padding:14,border:"1px solid "+T.border}}>
                  <div style={{fontSize:12,fontWeight:700,marginBottom:10,color:T.text}}>🎯 탈환 핵심 지표</div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {[
                      {lb:"22대 후보 격차",v:(selD.g22.p-selD.g22.m).toFixed(1)+"%p",c:(selD.g22.p-selD.g22.m)>0?"#16a34a":"#dc2626"},
                      {lb:"22대 비례 격차",v:selD.g22.pp!=null?("+"+(selD.g22.pp-selD.g22.mp).toFixed(1)+"%p"):"N/A",c:"#16a34a"},
                      {lb:"9회 지선 격차",v:(selD.j9.p-selD.j9.m).toFixed(1)+"%p",c:(selD.j9.p-selD.j9.m)>0?"#16a34a":"#dc2626"},
                      {lb:"21대 대선 격차",v:(selD.d21.p-selD.d21.m).toFixed(1)+"%p",c:(selD.d21.p-selD.d21.m)>0?"#16a34a":"#dc2626"},
                    ].map(function(m,i){
                      return(
                        <div key={i} style={{background:T.bg,borderRadius:8,padding:"8px 10px",border:"1px solid "+T.border}}>
                          <div style={{fontSize:10,color:T.muted,marginBottom:2}}>{m.lb}</div>
                          <div style={{fontSize:20,fontWeight:800,color:m.c}}>{m.v}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. 동별 득표율 세로 막대 */}
                <div style={{background:T.surface,borderRadius:12,padding:14,border:"1px solid "+T.border}}>
                  <div style={{fontSize:12,fontWeight:700,marginBottom:10,color:T.text}}>📊 동별 득표율 (22대 총선)</div>
                  {dongVoteChartData.length>0?(
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={dongVoteChartData} margin={{top:4,right:4,left:-20,bottom:50}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                        <XAxis dataKey="name" tick={{fontSize:8,fill:T.muted}} angle={-45} textAnchor="end" interval={0}/>
                        <YAxis tick={{fontSize:9}} domain={[0,100]} tickFormatter={function(v){return v+"%";}}/>
                        <RTooltip formatter={function(v,n){return [v+"%",n];}}/>
                        <Legend wrapperStyle={{fontSize:10}} verticalAlign="top"/>
                        <Bar dataKey="민주" fill={T.pmi} radius={[2,2,0,0]}/>
                        <Bar dataKey="국힘" fill={T.pph} radius={[2,2,0,0]}/>
                      </BarChart>
                    </ResponsiveContainer>
                  ):(
                    <div style={{color:T.muted,fontSize:12,padding:20,textAlign:"center"}}>데이터 없음</div>
                  )}
                </div>

                {/* 4. 동별 인구 세로 막대 (득표율과 동일 순서) */}
                <div style={{background:T.surface,borderRadius:12,padding:14,border:"1px solid "+T.border}}>
                  <div style={{fontSize:12,fontWeight:700,marginBottom:10,color:T.text}}>👥 동별 인구 (26.5. 기준, 천명)</div>
                  {dongPopChartData.length>0?(
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={dongPopChartData} margin={{top:4,right:4,left:-20,bottom:50}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                        <XAxis dataKey="name" tick={{fontSize:8,fill:T.muted}} angle={-45} textAnchor="end" interval={0}/>
                        <YAxis tick={{fontSize:9}} tickFormatter={function(v){return v+"k";}}/>
                        <RTooltip formatter={function(v){return [v+"천명","인구"];}}/>
                        <Bar dataKey="인구" fill="#6366f1" radius={[2,2,0,0]}/>
                      </BarChart>
                    </ResponsiveContainer>
                  ):(
                    <div style={{color:T.muted,fontSize:12,padding:20,textAlign:"center"}}>데이터 없음</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 23ASH 탭 */}
      {tab==="ash"&&(
        <div style={{padding:"18px 22px",overflowY:"auto"}}>
          <div style={{background:T.surface,borderRadius:14,padding:"18px 8px 14px",border:"1px solid "+T.border}}>
            <div style={{paddingLeft:14,marginBottom:12,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <span style={{fontSize:14,fontWeight:700}}>📡 역대 대통령 지지율 + 이재명 정부 시나리오 (2008~2028)</span>
              <button onClick={function(){setScenario(function(s){return !s;});}}
                style={{marginLeft:"auto",padding:"4px 13px",borderRadius:16,border:"1px solid "+T.border,
                  background:scenario?T.accent:"transparent",color:scenario?"#fff":T.muted,cursor:"pointer",fontSize:11}}>
                {scenario?"✅ 예측 ON":"예측 OFF"}
              </button>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={APPROVAL} margin={{top:8,right:20,left:-10,bottom:8}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                <XAxis dataKey="lb" tick={{fontSize:8,fill:T.muted}} interval={3}/>
                <YAxis domain={[0,90]} tickFormatter={function(v){return v+"%";}} tick={{fontSize:10,fill:T.muted}}/>
                <RTooltip content={<CTip/>}/>
                <ReferenceLine y={50} stroke="#e2e8f0" strokeDasharray="4 3"/>
                <ReferenceLine y={30} stroke="#fecaca" strokeDasharray="3 2"/>
                {scenario&&<ReferenceArea x1="'26②" x2="'28②" fill="#f0f4ff" fillOpacity={0.5}/>}
                {["mb","pk","mn","ys","lj"].map(function(k){
                  return <Line key={k} type="monotone" dataKey={k} stroke={PC[k]} strokeWidth={2.5} dot={false} connectNulls={false}/>;
                })}
                {scenario&&(
                  <Line type="monotone" dataKey="lj_b" stroke="#059669" strokeWidth={2} strokeDasharray="7 3" dot={false} connectNulls={false}/>
                )}
              </LineChart>
            </ResponsiveContainer>
            <div style={{display:"flex",gap:14,paddingLeft:16,flexWrap:"wrap",marginTop:4}}>
              {["이명박","박근혜","문재인","윤석열","이재명(실측)"].map(function(n,i){
                const cols=["#e84a4a","#8b5cf6","#2b6cb0","#f97316","#059669"];
                return(
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
