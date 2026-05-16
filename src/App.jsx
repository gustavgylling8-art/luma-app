import { useState, useEffect, useRef, useMemo, Fragment } from "react";

(() => {
  // Inter from Google Fonts
  const l1 = document.createElement("link");
  l1.rel = "stylesheet";
  l1.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
  document.head.appendChild(l1);
  // General Sans from Fontshare
  const l2 = document.createElement("link");
  l2.rel = "stylesheet";
  l2.href = "https://api.fontshare.com/v2/css?f[]=general-sans@500,600,700&display=swap";
  document.head.appendChild(l2);
})();

/* ══ Per-screen pastel palette (light & premium) ══ */
const SCREENS = {
  home:    { h:"#9DC4D8", hl:"#EDF4F8", hll:"#F7FBFD", hb:"#F4FAFC", soft:"#C5DCE7", deep:"#5A8AA3" },
  timer:   { h:"#E89B89", hl:"#FBEDE7", hll:"#FEF7F3", hb:"#FEF7F2", soft:"#F5CDBC", deep:"#B36B57" },
  emotion: { h:"#B89DC4", hl:"#F2EBF6", hll:"#FAF7FC", hb:"#F8F4FB", soft:"#D5C5DD", deep:"#7B5D8C" },
  // comm/Tala — was a cool steel-blue that read too similar to the week
  // screen. Shifted toward a warmer dusty mineral-blue with a hint of green
  // undertone, so it sits between aqua-home and cool-week without competing
  // with either.
  comm:    { h:"#8FB8B2", hl:"#EBF3F1", hll:"#F6FAF9", hb:"#F2F8F6", soft:"#BBD3CD", deep:"#557D78" },
  stories: { h:"#C9A875", hl:"#FAF2E4", hll:"#FDF9F0", hb:"#FCF7EC", soft:"#E5CEA0", deep:"#8C7038" },
  calm:    { h:"#A8C9B0", hl:"#EFF5F0", hll:"#F8FBF8", hb:"#F4F9F4", soft:"#CFDED2", deep:"#688D72" },
  idcard:  { h:"#D88B8B", hl:"#FAEAEA", hll:"#FDF5F5", hb:"#FCF3F3", soft:"#EDB8B8", deep:"#A35858" },
  tools:   { h:"#D9886B", hl:"#F8ECE5", hll:"#FCF7F3", hb:"#FBF5EE", soft:"#EDC1AE", deep:"#A2604A" },
  // week — page tones lean toward home's aqua family but with a clearer
  // cool-blue note throughout. Earlier the silver-gray (#F5F6FA) felt
  // disconnected from the rest of the app. The new tones are visibly blue
  // but slightly deeper/cooler than home so the screen still reads as
  // distinct without feeling like an entirely different product.
  week:    { h:"#9DAFCE", hl:"#E7EEF7", hll:"#F3F7FB", hb:"#EEF4F9", soft:"#BDCCDF", deep:"#576B8A" },
};

const G = {
  ink:"#1F1B2E", ink2:"#6E6882", ink3:"#A8A4BB",
  // inkSoft — used for large display headings (h1/h2) so screen titles don't
  // feel heavy on a calm app. Hue stays in the same aubergine family as ink,
  // but lifted enough that pure-black weight is gone. Tested for WCAG AAA
  // contrast on white (~6.8:1) so headings remain readable for low-vision
  // users while losing the heavy "shouting" feel at full ink strength.
  inkSoft:"#524D6B",
  white:"#FFFFFF", cream:"#FCFBFE", border:"#EEEAF5", border2:"#E0DBEF",
  font:"'Inter',system-ui,sans-serif",
  // Nunito — humanist sans with softly rounded terminals. Rhymes with Luma's
  // round visual language (12-20px radii everywhere, circular sun logo, soft
  // toggles). Stays warm without becoming juvenile when used at weight 500+.
  // Loaded via @import at the App root (see global <style> block).
  serif:"'Nunito','Inter',system-ui,sans-serif",
};

const sh = {
  xs:"0 1px 2px rgba(31,27,46,0.04), 0 1px 1px rgba(31,27,46,0.03)",
  sm:"0 1px 3px rgba(31,27,46,0.04), 0 4px 12px rgba(31,27,46,0.05)",
  md:"0 2px 6px rgba(31,27,46,0.04), 0 12px 30px rgba(31,27,46,0.09), 0 4px 10px rgba(31,27,46,0.04)",
  lg:"0 4px 12px rgba(31,27,46,0.06), 0 24px 60px rgba(31,27,46,0.12), 0 8px 20px rgba(31,27,46,0.06)",
  c: col=>`0 2px 5px ${col}1A, 0 10px 26px ${col}3D, 0 4px 10px ${col}22`,
};

/* ═══════════════════════════════════════════════════════════════════════
   DESIGN SYSTEM TOKENS
   These are intentionally NEW and used in NEW code. Legacy callsites
   can migrate incrementally — both can coexist until the migration completes.
═══════════════════════════════════════════════════════════════════════ */

// Type scale — modular, 6 sizes. Each value pairs with its conventional
// letter-spacing so headings feel composed instead of hand-tuned per spot.
const TYPO = {
  caption:  { size: 11, tracking:  0.4, weight: 500 },  // aria-style, uppercase labels with caps tracking
  small:    { size: 12, tracking:  0.1, weight: 500 },  // helper text, hints
  body:     { size: 14, tracking:  0.1, weight: 500 },  // default UI text
  bodyLg:   { size: 16, tracking:  0,   weight: 500 },  // inputs, primary buttons
  h3:       { size: 18, tracking: -0.2, weight: 600 },  // tile titles, section headers in cards
  h2:       { size: 22, tracking: -0.3, weight: 500 },  // sub-screen headings (serif)
  h1:       { size: 28, tracking: -0.5, weight: 500 },  // screen titles (serif)
};

// Spacing grid — strict 4px multiples. Use these for paddings, gaps, margins.
// Discourages the 7/11/13/22 fractional values that have crept in over time.
const SPACE = { xs:4, sm:8, md:12, lg:16, xl:20, xxl:24, x3:32, x4:40, x5:48 };

/* ═══════════════════════════════════════════════════════════════════════
   ICON COMPONENTS — shared SVG vocabulary
   All UI icons (not content emoji) come from here. One source of truth for
   each glyph, plus consistent stroke, line-cap and joining behaviour.
═══════════════════════════════════════════════════════════════════════ */

// Pencil — used on every edit affordance. Animates via .lumaPen class when
// wrapped in a .lumaPenBtn parent (hover/press tilts the tip toward writing).
const IconPencil = ({size=16, className="lumaPen"})=>(
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4 H4 a2 2 0 0 0 -2 2 v14 a2 2 0 0 0 2 2 h14 a2 2 0 0 0 2 -2 v-7"/>
    <path d="M18.5 2.5 a2.121 2.121 0 0 1 3 3 L12 15 l-4 1 1 -4 z"/>
  </svg>
);

// Trash — destructive action across editors. Stroke matches pencil weight.
const IconTrash = ({size=16})=>(
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6 h18"/>
    <path d="M8 6 V4 a2 2 0 0 1 2-2 h4 a2 2 0 0 1 2 2 v2"/>
    <path d="M19 6 l-1 14 a2 2 0 0 1 -2 2 H8 a2 2 0 0 1 -2 -2 L5 6"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);

// X — close/cancel affordance. Slightly thicker stroke (2.2) for visibility at small sizes.
const IconX = ({size=14, strokeWidth=2.2})=>(
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round">
    <path d="M3 3 L11 11 M11 3 L3 11"/>
  </svg>
);

// Check — save confirmation, "done" markers. Has the .saveTick class so the
// stroke animates when first rendered (drawn in, then springs on hover).
const IconCheck = ({size=15, className="saveTick", strokeWidth=2.4})=>(
  <svg className={className} width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 7.2 L5.8 10.5 L11.5 3.5"/>
  </svg>
);

// Chevron — directional navigation (next/prev, drilldown).
const IconChevron = ({dir="right", size=14, strokeWidth=2.2})=>{
  const points = dir==="left" ? "15 18 9 12 15 6"
              : dir==="right" ? "9 18 15 12 9 6"
              : dir==="up"    ? "18 15 12 9 6 15"
              : "6 9 12 15 18 9"; // down
  return(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <polyline points={points}/>
    </svg>
  );
};

// Camera — photo upload affordances. Used across editors (activity, emotion,
// ID card) so it deserves a shared component for consistency.
const IconCamera = ({size=15})=>(
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19 a2 2 0 0 1 -2 2 H3 a2 2 0 0 1 -2 -2 V8 a2 2 0 0 1 2 -2 h4 l2 -3 h6 l2 3 h4 a2 2 0 0 1 2 2 z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const ACT_C=["#E89B89","#C2607A","#8FBFA1","#9683C2","#D9B868","#8AAFD2","#B58CD0","#E89A9A","#7CB8A0","#8E92D2","#F0B5C8"];
const TMR_C=["#E89B89","#C2607A","#D9B868","#8FBFA1","#9683C2","#8AAFD2","#B58CD0","#E89A9A","#F0B5C8","#1F1B2E"];

const EMOJIS=["🌅","🍳","🥐","🥪","🍎","🍕","🎒","🚌","✈️","🚲","📚","✏️","🎨","💻","⚽","🏊","🏃","🚴","🎵","🎸","🎮","🛁","🛏️","🌙","💊","🐶","🐱","🐻","🦁","🐼","🌺","🌈","⭐","🎉","🎁","💧","☕","🧁","🎂","👟","👕","🔑","🏠","🏫","🌳","🌻","🎯","🧩","🏋️","🤸","🧘","🍜","🥗","📝","📱","🎹","🎭","🎬","🦋","🌸","🏖️","🌲","🌟","✨","🍓","🍌","🍊","🧃","🥤","🍦","🍫","🏀","🎾","🚗","🛵","🐸","🐨","🦊","🥞","🧇","🫐"];
const STEP_E=["👟","👕","👖","🧴","🎒","💧","🧹","📖","✅","🍌","🎵","🛁","🛏️","🪥","🧦","🔑","🏃","🍳","🥤","📋","🖊️","🎯","⭐","☀️","🌙"];

const EMOS=[
  {id:1,emoji:"😄",sv:"Jättebra",en:"Great",color:"#7CB8A0",v:5},
  {id:2,emoji:"🙂",sv:"Bra",en:"Good",color:"#A8CFAF",v:4},
  {id:3,emoji:"😐",sv:"Okej",en:"Okay",color:"#D9B868",v:3},
  {id:4,emoji:"😕",sv:"Inte bra",en:"Not good",color:"#E89B89",v:2},
  {id:5,emoji:"😢",sv:"Dåligt",en:"Bad",color:"#C2607A",v:1},
];

const COMM0=[
  {id:"c1",sv:"Jag vill",en:"I want",color:"#9683C2",cards:[{id:"cc1",emoji:"💧",sv:"Vatten",en:"Water"},{id:"cc2",emoji:"🍎",sv:"Mat",en:"Food"},{id:"cc3",emoji:"🚽",sv:"Toalett",en:"Toilet"},{id:"cc4",emoji:"😴",sv:"Sova",en:"Sleep"},{id:"cc5",emoji:"🏃",sv:"Röra",en:"Move"},{id:"cc6",emoji:"🤗",sv:"Kram",en:"Hug"}]},
  {id:"c2",sv:"Jag känner",en:"I feel",color:"#E89B89",cards:[{id:"cf1",emoji:"😄",sv:"Glad",en:"Happy"},{id:"cf2",emoji:"😢",sv:"Ledsen",en:"Sad"},{id:"cf3",emoji:"😡",sv:"Arg",en:"Angry"},{id:"cf4",emoji:"😨",sv:"Rädd",en:"Scared"},{id:"cf5",emoji:"😴",sv:"Trött",en:"Tired"},{id:"cf6",emoji:"🤢",sv:"Illa",en:"Sick"}]},
  {id:"c3",sv:"Aktivitet",en:"Activity",color:"#8FBFA1",cards:[{id:"ca1",emoji:"📚",sv:"Läsa",en:"Read"},{id:"ca2",emoji:"🎮",sv:"Spela",en:"Play"},{id:"ca3",emoji:"🎨",sv:"Rita",en:"Draw"},{id:"ca4",emoji:"🎵",sv:"Musik",en:"Music"},{id:"ca5",emoji:"📺",sv:"TV",en:"TV"},{id:"ca6",emoji:"🌳",sv:"Ute",en:"Outside"}]},
  {id:"c4",sv:"Svar",en:"Reply",color:"#8AAFD2",cards:[{id:"ch1",emoji:"🛑",sv:"Stopp",en:"Stop"},{id:"ch2",emoji:"✅",sv:"Ja",en:"Yes"},{id:"ch3",emoji:"❌",sv:"Nej",en:"No"},{id:"ch4",emoji:"❓",sv:"Vet ej",en:"Don't know"},{id:"ch5",emoji:"🙏",sv:"Snälla",en:"Please"},{id:"ch6",emoji:"👋",sv:"Hej",en:"Hello"}]},
];

const STORIES0=[
  {id:"s1",type:"sequence",sv:"Städa rummet",en:"Clean the room",emoji:"🧹",color:"#C9A875",pages:[
    {id:"p1",emoji:"🛏️",photo:null,sv:"Först bäddar jag sängen.",en:"First, I make the bed."},
    {id:"p2",emoji:"🧸",photo:null,sv:"Sedan ställer jag leksakerna på plats.",en:"Then I put my toys away."},
    {id:"p3",emoji:"👕",photo:null,sv:"Jag lägger smutsiga kläder i tvättkorgen.",en:"I put dirty clothes in the laundry basket."},
    {id:"p4",emoji:"📚",photo:null,sv:"Jag sätter böckerna i hyllan.",en:"I put my books on the shelf."},
    {id:"p5",emoji:"🌟",photo:null,sv:"Mitt rum är städat. Bra jobbat!",en:"My room is clean. Good job!"},
  ]},
  {id:"s2",type:"sequence",sv:"Borsta tänderna",en:"Brush my teeth",emoji:"🪥",color:"#8AAFD2",pages:[
    {id:"p1",emoji:"🪥",photo:null,sv:"Jag tar fram min tandborste.",en:"I get my toothbrush."},
    {id:"p2",emoji:"🧴",photo:null,sv:"Jag trycker ut lite tandkräm.",en:"I squeeze on a little toothpaste."},
    {id:"p3",emoji:"😁",photo:null,sv:"Jag borstar uppe, nere, framifrån och bakifrån. I 2 minuter.",en:"I brush top, bottom, front and back. For 2 minutes."},
    {id:"p4",emoji:"💧",photo:null,sv:"Jag spottar ut och sköljer munnen.",en:"I spit out and rinse my mouth."},
    {id:"p5",emoji:"✨",photo:null,sv:"Tänderna är rena!",en:"My teeth are clean!"},
  ]},
  {id:"s3",type:"sequence",sv:"Gå till skolan",en:"Go to school",emoji:"🎒",color:"#8FBFA1",pages:[
    {id:"p1",emoji:"👕",photo:null,sv:"Jag klär på mig.",en:"I get dressed."},
    {id:"p2",emoji:"🥐",photo:null,sv:"Jag äter frukost.",en:"I eat breakfast."},
    {id:"p3",emoji:"🎒",photo:null,sv:"Jag tar min ryggsäck.",en:"I get my backpack."},
    {id:"p4",emoji:"👟",photo:null,sv:"Jag tar på mig skorna.",en:"I put on my shoes."},
    {id:"p5",emoji:"🚌",photo:null,sv:"Jag går till skolan.",en:"I go to school."},
  ]},
  // First-Then contracts as type:"firstthen"
  {id:"ft1",type:"firstthen",sv:"Först läxor, sedan TV",en:"First homework, then TV",emoji:"📋",color:"#D9886B",pages:[
    {id:"first",emoji:"📚",photo:null,sv:"Läxor",en:"Homework"},
    {id:"then",emoji:"📺",photo:null,sv:"TV",en:"TV"},
  ]},
  {id:"ft2",type:"firstthen",sv:"Först tandborstning, sedan saga",en:"First brushing, then story",emoji:"📋",color:"#D9886B",pages:[
    {id:"first",emoji:"🪥",photo:null,sv:"Borsta tänder",en:"Brush teeth"},
    {id:"then",emoji:"📖",photo:null,sv:"Saga",en:"Story"},
  ]},
];


const ACTS0=[
  {id:1,time:"08:00",endTime:"08:30",name:"Frukost",emoji:"🍳",color:ACT_C[0],done:false,stepsDone:{},steps:[{id:101,emoji:"🧴",text:"Tvätta händerna"},{id:102,emoji:"🍳",text:"Ät frukost"},{id:103,emoji:"💧",text:"Drick vatten"}],timer:{on:true,type:"sector",min:15,color:"#E89B89"}},
  {id:2,time:"09:00",endTime:"11:30",name:"Skolan",emoji:"🚌",color:ACT_C[3],done:false,stepsDone:{},steps:[{id:201,emoji:"🎒",text:"Ta ryggsäcken"},{id:202,emoji:"👟",text:"Ta på skorna"}],timer:{on:false,type:"ring",min:5,color:"#9683C2"}},
  {id:3,time:"11:30",endTime:"12:00",name:"Lunch",emoji:"🥪",color:ACT_C[2],done:false,stepsDone:{},steps:[],timer:{on:true,type:"dots",min:20,color:"#8FBFA1"}},
  {id:4,time:"15:00",endTime:"15:45",name:"Gymma",emoji:"🏃",color:ACT_C[1],done:false,stepsDone:{},steps:[{id:401,emoji:"👟",text:"Gympaskor"},{id:402,emoji:"👕",text:"T-shirt"},{id:403,emoji:"👖",text:"Byxor"},{id:404,emoji:"💧",text:"Vattenflaska"}],timer:{on:true,type:"wave",min:45,color:"#8AAFD2"}},
  {id:5,time:"18:00",endTime:"18:30",name:"Middag",emoji:"🍽️",color:ACT_C[0],done:false,stepsDone:{},steps:[],timer:{on:false,type:"sector",min:20,color:"#E89B89"}},
  {id:6,time:"21:00",endTime:"21:30",name:"Läggdags",emoji:"🌙",color:"#8E92D2",done:false,stepsDone:{},steps:[{id:601,emoji:"🪥",text:"Borsta tänderna"},{id:602,emoji:"🛁",text:"Duscha"},{id:603,emoji:"🛏️",text:"Sängen"}],timer:{on:false,type:"lava",min:10,color:"#9683C2"}},
];

// FT0 kept for back-compat — empty since data merged into STORIES0
const FT0=[];

// Choice board default categories
const CH0=[
  {id:"ch1",sv:"Vad vill du göra?",en:"What do you want to do?",color:"#D9B86B",choices:[
    {id:"c1",emoji:"🎨",photo:null,sv:"Rita",en:"Draw"},
    {id:"c2",emoji:"🧩",photo:null,sv:"Pussel",en:"Puzzle"},
    {id:"c3",emoji:"🎵",photo:null,sv:"Musik",en:"Music"},
    {id:"c4",emoji:"📖",photo:null,sv:"Bok",en:"Book"},
  ]},
  {id:"ch2",sv:"Vad vill du äta?",en:"What do you want to eat?",color:"#E89B89",choices:[
    {id:"c5",emoji:"🍎",photo:null,sv:"Äpple",en:"Apple"},
    {id:"c6",emoji:"🥪",photo:null,sv:"Smörgås",en:"Sandwich"},
    {id:"c7",emoji:"🍌",photo:null,sv:"Banan",en:"Banana"},
    {id:"c8",emoji:"🧁",photo:null,sv:"Bulle",en:"Bun"},
  ]},
];

// Reward system default config
const RW0={enabled:true,goal:10,stars:0,history:[],reward:{emoji:"🍦",sv:"Glass",en:"Ice cream"},autoActivities:{}};

// Recipe default
const RP0=[
  {id:"rp1",sv:"Pannkakor",en:"Pancakes",emoji:"🥞",color:"#D9B86B",servings:"4 portioner",time:"20 min",steps:[
    {id:"s1",emoji:"🥣",photo:null,sv:"Vispa 4 ägg, 6 dl mjölk och 2,5 dl mjöl i en skål.",en:"Whisk 4 eggs, 600ml milk and 250ml flour in a bowl."},
    {id:"s2",emoji:"🧈",photo:null,sv:"Smält lite smör i en stekpanna på medelvärme.",en:"Melt some butter in a pan on medium heat."},
    {id:"s3",emoji:"🥞",photo:null,sv:"Häll i en slev smet. Vänd när det bubblar.",en:"Pour in one ladle of batter. Flip when it bubbles."},
    {id:"s4",emoji:"🍯",photo:null,sv:"Ät med sylt eller socker.",en:"Eat with jam or sugar."},
  ]},
];

// Sigvard weekday colors — index by JS day (0=Sun ... 6=Sat).
// Classic Swedish standard: Mon green, Tue light blue, Wed brown, Thu white,
// Fri yellow, Sat pink, Sun red. Slightly desaturated for app palette harmony
// but kept identifiably classic.
const SIGVARD0=["#E26B6B","#7AC178","#82BFD6","#A87E58","#FFFFFF","#F5E26B","#F5B7CC"];

// Curated palette for weekday color editor — classics first, then alternates
const DAY_PALETTE=[
  // Classic Sigvard hues
  "#E26B6B","#7AC178","#82BFD6","#A87E58","#FFFFFF","#F5E26B","#F5B7CC",
  // Warm reds + corals
  "#D88B8B","#E89B89","#D9886B",
  // Yellows + honeys
  "#E8D178","#D9B868","#C9A875",
  // Greens
  "#8FBFA1","#A8C9B0",
  // Blues
  "#9DC4D8","#8AAFD2","#A8B5C9",
  // Purples + pinks
  "#B89DC4","#E0AFC7","#D8B0C7",
  // Neutrals
  "#F5F2EE",
];

/* ─── Color utilities (used by Sigvard lamps + now-line) ─── */
// Parse "#RRGGBB" → [r,g,b]. Returns null for invalid input.
function hexToRgb(hex){
  if(typeof hex!=="string") return null;
  const h=hex.replace("#","").trim();
  if(h.length!==6) return null;
  const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);
  if(isNaN(r)||isNaN(g)||isNaN(b)) return null;
  return[r,g,b];
}
// Mix color toward white (amt>0) or black (amt<0). amt in [-1, +1].
function shade(hex,amt){
  const rgb=hexToRgb(hex); if(!rgb) return hex;
  const target=amt>=0?255:0, t=Math.abs(amt);
  const[r,g,b]=rgb.map(c=>Math.round(c+(target-c)*t));
  return`rgb(${r},${g},${b})`;
}
// Hex with alpha suffix — for shadow/border tints. alpha in [0,1].
function withAlpha(hex,alpha){
  const a=Math.max(0,Math.min(1,alpha));
  const hh=Math.round(a*255).toString(16).padStart(2,"0").toUpperCase();
  return`${hex}${hh}`;
}

// Curated palette for Sigvard lamps — warm/visible glow colors only.
const SIGVARD_LAMP_PALETTE=[
  "#FF4848", // classic red (default)
  "#FF7A3D", // orange
  "#F5B400", // amber
  "#7AC178", // green
  "#3DB5E0", // cyan
  "#5B7CE0", // blue
  "#A87BD8", // purple
  "#E66BB5", // pink
];

const CFG0={cardStyle:"normal",schedView:"both",showSigvard:true,sigvardColor:"#FF4848",showBanner:true,showNowLine:true,nowLineColor:"",weekColors:SIGVARD0,tools:{timer:true,emotion:true,comm:true,stories:true,calm:true,idcard:true,tools:true,week:true},timerCfg:{allowedTypes:["sector","ring","dots","wave","sun","lava"],defaultType:"wave",defaultMin:5,defaultColor:"#8AAFD2"},visibleEmotions:[1,2,3,4,5],customEmotions:[],emotionOverrides:{},deletedBuiltinEmotions:[],emotionStyle:"arc",emotionReasonEnabled:true,emotionReasonLabel:"",calmTools:{breath:true,grounding:true,skylight:true},idCard:{name:"",photo:null,age:"",condition:"",triggers:"",helpful:"",contacts:[]},toolsVisible:{firstthen:true,choices:true,rewards:true,recipes:true}};

const TR={
  sv:{other:"EN",myDay:"Min dag",editorOpen:"Redigera",editorClose:"Stäng",list:"Lista",card:"Kort",noActs:"Inga aktiviteter – tryck Redigera",addAct:"+ Ny aktivitet",save:"Spara",cancel:"Avbryt",actName:"Aktivitetsnamn",actTime:"Tid",pickEmoji:"Välj emoji",pickColor:"Färg",steps:"Checklista",stepPH:"t.ex. Ta på skorna",timerAct:"Timer – aktivitet",timerType:"Timertyp",timerMin:"Minuter",timerColor:"Timerfärg",sector:"Time Timer",ring:"Ring",dots:"Timstock",wave:"Våg",sun:"Solnedgång",lava:"Lava",pause:"Paus",resume:"Starta",reset:"Nollställ",next:"Nästa",prev:"Tillbaka",min:"min",settings:"Inställningar",cardStyle:"Kortstil",styleNormal:"Normal",styleCompact:"Kompakt",styleBig:"Stor",syncTitle:"Delning",sameDevice:"Samma enhet",syncMode:"Via kod",sameDeviceDesc:"Redigering & användarvy på samma enhet.",syncModeDesc:"Dela schema via kod.",yourCode:"Din kod",codeHint:"Ge koden till användaren",enterCode:"Ange kod",connect:"Anslut",wrongCode:"Hittade inget.",copied:"Kopierad ✓",openTimer:"Starta timer",allDoneMsg:"Bra jobbat! 🌟",emotions:"Hur mår du?",emotionSaved:"Sparat! ✓",emotionReason:"Varför?",emotionHistory:"Historik",noHistory:"Ingen historik",toolsTimer:"Timer",toolsEmotion:"Känsla",home:"Hem",comm:"Tala",sigvardOn:"Sigvard-lampor",sigvardColor:"Färg på lampor",sigvardColorHint:"Tidslinjen följer samma färg",schedVisuals:"Visa i schemat",schedVisualsHint:"Slå av om det blir för mycket – båda kan användas, en av dem, eller inget alls.",bannerLabel:"\"Pågår nu\"-rad",bannerHint:"Liten rad högst upp som visar pågående eller nästa aktivitet.",nowLineLabel:"Tidsstreck",nowLineHint:"Linjen som följer aktuell tid genom dagen.",nowLineColor:"Färg på strecket",nowLineSameAsSig:"Samma som lamporna",visibleTools:"Synliga verktyg",schedView:"Schemavy",viewBoth:"Lista + Kort",viewList:"Endast lista",viewCard:"Endast kort",addCard:"+ Nytt kort",addCat:"+ Ny kategori",catName:"Kategorinamn",autoTimer:"Synkas med starttid",preview:"Förhandsgranskning",startTimer:"Starta",timerSettings:"Timerinst. för användarvyn",allowedTimers:"Tillåtna timers",defaultTimer:"Standardtimer",visibleEmotions:"Synliga känslor",barometerStyle:"Mätarens stil",barometerStyleHint:"Hur känslorna visas för användaren.",styleArc:"Bågformad",styleVertical:"Lodrät",addEmotion:"+ Lägg till känsla",editEmotion:"Redigera känsla",emotionName:"Namn",emotionNamePH:"t.ex. Stressad",customLabel:"Egen",changePhoto:"Byt foto",resetEmotions:"Återställ förvalda",resetEmotionsHint:"Sätter tillbaka standardkänslorna till sina ursprungliga namn, emojis och färger.",confirmDeleteEmotion:"Ta bort?",reasonField:"Anteckningsfält",reasonFieldHint:"Användaren får skriva några ord om sin känsla. Stäng av om det är för mycket.",reasonLabelPH:"t.ex. Varför? eller Vad hände?",enlarge:"Förstora",cardImage:"Bild",uploadPhoto:"Ladda upp foto",useEmoji:"Använd emoji istället",stories:"Berättelser",newStory:"Ny berättelse",storyTitle:"Titel",pages:"Sidor",addPage:"+ Lägg till sida",pageNum:"Sida",storyText:"Text på sidan",noStories:"Inga berättelser – tryck Redigera för att skapa",renameCat:"Byt namn på kategori",calm:"Lugn",calmTitle:"Hitta lugnet",breathing:"Andas",grounding:"54321",breathIn:"Andas in",breathHold:"Håll",breathOut:"Andas ut",breathDone:"Bra jobbat",groundIntro:"Stanna upp. Vi gör det här tillsammans.",groundStart:"Börja",see5:"5 saker du kan se",hear4:"4 saker du kan höra",touch3:"3 saker du kan röra",smell2:"2 saker du kan lukta",taste1:"1 sak du kan smaka",iAmHere:"Jag är här. Jag är trygg.",roundsDone:"Klar",calmSettings:"Lugn – övningar",idcard:"Mitt kort",myName:"Mitt namn",myAge:"Ålder",aboutMe:"Om mig",myTriggers:"Det här kan vara svårt",whatHelps:"Det här hjälper mig",emergencyContacts:"Ring",contactName:"Namn",contactPhone:"Telefon",contactRelation:"Relation",addContact:"+ Lägg till kontakt",call:"Ring",idHint:"Visa det här till någon som vill hjälpa","editCard":"Redigera mitt kort",helloMyNameIs:"Hej, jag heter",yearsOld:"år",emptyCardTitle:"Kortet är inte ifyllt än",emptyCardDesc:"Mitt-mig-kortet visar viktig information som kan vara värdefull i situationer där du behöver hjälp. Tryck Redigera för att fylla i det.",createCardTitle:"Skapa mitt-mig-kortet",createCardDesc:"Sammanfattar viktig information — namn, kontaktpersoner, och vad som hjälper i pressade situationer. Visas vid behov.",showLarge:"Visa stort",tools:"Verktyg",firstthen:"Först-Sedan",choices:"Val",rewards:"Belöning",recipes:"Recept",first:"Först",then:"Sedan",ftDone:"Klart!",chQuestion:"Vad vill du?",chTap:"Tryck för att välja",stars:"stjärnor",goalReached:"Du har tjänat din belöning! 🎉",reward:"Belöning",starsGoal:"Mål – antal stjärnor",addChoice:"+ Nytt val",newCategory:"+ Ny kategori",rewardEmoji:"Emoji",rewardText:"Belöning",ingredients:"Ingredienser",instructions:"Så gör du",servings:"Portioner",time:"Tid",newRecipe:"Nytt recept",step:"Steg",addStep:"+ Lägg till steg",useReward:"Ge stjärna när klar",resetStars:"Nollställ stjärnor",starsEarned:"Stjärnor intjänade",bannerNowOngoing:"Pågår nu",bannerNextUp:"Nästa aktivitet",bannerDayLabel:"Dagen",bannerNoActsLeft:"Inga aktiviteter kvar",close:"Stäng",week:"Vecka",myWeek:"Min vecka",weekEmpty:"Inga aktiviteter den här veckan",weekAdd:"Lägg till aktivitet",dayColors:"Veckodagsfärger",dayColorsHint:"Tryck på en dag för att välja färg",resetColors:"Återställ till standard",monday:"Måndag",tuesday:"Tisdag",wednesday:"Onsdag",thursday:"Torsdag",friday:"Fredag",saturday:"Lördag",sunday:"Söndag",skylight:"Himmel",skyHint:"Låt blicken vila",notTodayHint:"Du tittar på en annan dag. Stegen kan inte bockas av nu.",editStory:"Redigera berättelse",storyType:"Typ",typeSeq:"Steg-för-steg",typeSeqDesc:"Flera sidor",typeFT:"Först-Sedan",typeFTDesc:"Först → Sedan",coverImage:"Huvudbild",camera:"Kamera",gallery:"Galleri",emoji:"Emoji",removePhoto:"Ta bort foto",storyPlacehSeq:"t.ex. Städa rummet",storyPlacehFT:"t.ex. Först läxor, sedan TV",ftLabels:"Etiketter (visas över korten)",ftSection:"Först och Sedan",pageImage:"Bild på sidan",pageTextPH:"Skriv vad som händer på sidan…",pageTimer:"Timer på sidan",off:"Av",sunset:"Solnedgång",editingLabel:"Redigerar",duEditing:"Du redigerar",cover:"Huvudbild",schedule:"Schema",doneTitle:"Klart",doneSub:"Du kan vila en stund.",dayOpen:"Din dag är öppen",allActsDoneTitle:"Alla aktiviteter är klara",allActsDoneSub:"Du kan vila resten av dagen.",windDown:"Vi byter snart",lampOne:"1 lampa = 1 minut",lampMany:"1 lampa = {n} minuter",stepCountOne:"1 steg",stepCountMany:"{n} steg",noName:"(Utan namn)",unsavedTitle:"Osparade ändringar",unsavedDesc:"Vill du spara innan du stänger?",discardChanges:"Släng",keepEditing:"Fortsätt redigera",overlapTitle:"Tidskrock",overlapDesc:"Den nya aktiviteten {t} överlappar:",goBack:"Gå tillbaka",saveAnyway:"Spara ändå",editAct:"Redigera aktivitet",newAct:"Ny aktivitet",actNamePH:"t.ex. Frukost",timeStart:"Start",timeEnd:"Slut (frivilligt)",repeat:"Upprepa",repNone:"Endast idag",repDaily:"Varje dag",repWeekdays:"Vardagar",repWeekend:"Helger",repPickDays:"Välj veckodagar",repDailyShort:"Dagligen",repDaysSuffix:"dagar",daysShort:["sön","mån","tis","ons","tor","fre","lör"],resetSection:"Återställ",resetDataDesc:"Rensar alla aktiviteter, berättelser, känslohistorik och inställningar. Kan inte ångras.",resetDataBtn:"Rensa all data",resetDataConfirm:"Är du säker? Allt data raderas och kan inte återskapas."},
  en:{other:"SV",myDay:"My Day",editorOpen:"Edit",editorClose:"Close",list:"List",card:"Cards",noActs:"No activities – tap Edit",addAct:"+ New activity",save:"Save",cancel:"Cancel",actName:"Activity name",actTime:"Time",pickEmoji:"Pick emoji",pickColor:"Colour",steps:"Checklist",stepPH:"e.g. Put on shoes",timerAct:"Timer – activity",timerType:"Timer type",timerMin:"Minutes",timerColor:"Timer colour",sector:"Time Timer",ring:"Ring",dots:"Dot timer",wave:"Wave",sun:"Sunset",lava:"Lava",pause:"Pause",resume:"Start",reset:"Reset",next:"Next",prev:"Back",min:"min",settings:"Settings",cardStyle:"Card style",styleNormal:"Normal",styleCompact:"Compact",styleBig:"Large",syncTitle:"Sharing",sameDevice:"Same device",syncMode:"Via code",sameDeviceDesc:"Edit & user view on same device.",syncModeDesc:"Share schedule via code.",yourCode:"Your code",codeHint:"Give this code to the user",enterCode:"Enter code",connect:"Connect",wrongCode:"Not found.",copied:"Copied ✓",openTimer:"Start timer",allDoneMsg:"Great job! 🌟",emotions:"How are you?",emotionSaved:"Saved! ✓",emotionReason:"Why?",emotionHistory:"History",noHistory:"No history",toolsTimer:"Timer",toolsEmotion:"Mood",home:"Home",comm:"Talk",sigvardOn:"Sigvard lamps",sigvardColor:"Lamp colour",sigvardColorHint:"The time line follows the same colour",schedVisuals:"Show in schedule",schedVisualsHint:"Turn off if it gets noisy – use both, one of them, or neither.",bannerLabel:"\"Happening now\" bar",bannerHint:"Small bar at the top showing the current or upcoming activity.",nowLineLabel:"Time line",nowLineHint:"The line that follows the current time through the day.",nowLineColor:"Line colour",nowLineSameAsSig:"Same as lamps",visibleTools:"Visible tools",schedView:"Schedule view",viewBoth:"List + Cards",viewList:"List only",viewCard:"Cards only",addCard:"+ New card",addCat:"+ New category",catName:"Category name",autoTimer:"Syncs with start time",preview:"Preview",startTimer:"Start",timerSettings:"Timer settings for user view",allowedTimers:"Allowed timers",defaultTimer:"Default timer",visibleEmotions:"Visible emotions",barometerStyle:"Barometer style",barometerStyleHint:"How feelings are shown to the user.",styleArc:"Arc",styleVertical:"Vertical",addEmotion:"+ Add feeling",editEmotion:"Edit feeling",emotionName:"Name",emotionNamePH:"e.g. Stressed",customLabel:"Custom",changePhoto:"Change photo",resetEmotions:"Reset defaults",resetEmotionsHint:"Restores the standard feelings to their original names, emojis and colours.",confirmDeleteEmotion:"Remove?",reasonField:"Notes field",reasonFieldHint:"User can write a few words about their feeling. Turn off if it's too much.",reasonLabelPH:"e.g. Why? or What happened?",enlarge:"Enlarge",cardImage:"Image",uploadPhoto:"Upload photo",useEmoji:"Use emoji instead",stories:"Stories",newStory:"New story",storyTitle:"Title",pages:"Pages",addPage:"+ Add page",pageNum:"Page",storyText:"Page text",noStories:"No stories – tap Edit to create",renameCat:"Rename category",calm:"Calm",calmTitle:"Find calm",breathing:"Breathe",grounding:"54321",breathIn:"Breathe in",breathHold:"Hold",breathOut:"Breathe out",breathDone:"Well done",groundIntro:"Pause. Let's do this together.",groundStart:"Begin",see5:"5 things you can see",hear4:"4 things you can hear",touch3:"3 things you can touch",smell2:"2 things you can smell",taste1:"1 thing you can taste",iAmHere:"I am here. I am safe.",roundsDone:"Done",calmSettings:"Calm – exercises",idcard:"My card",myName:"My name",myAge:"Age",aboutMe:"About me",myTriggers:"This can be hard",whatHelps:"This helps me",emergencyContacts:"Call",contactName:"Name",contactPhone:"Phone",contactRelation:"Relation",addContact:"+ Add contact",call:"Call",idHint:"Show this to someone who wants to help","editCard":"Edit my card",helloMyNameIs:"Hi, my name is",yearsOld:"years old",emptyCardTitle:"The card isn't filled in yet",emptyCardDesc:"My card shows important information that can be valuable in situations where you need help. Tap Edit to fill it in.",createCardTitle:"Create your card",createCardDesc:"A summary of important information — name, contacts, and what helps in stressful moments. Shown when needed.",showLarge:"Show large",tools:"Tools",firstthen:"First-Then",choices:"Choices",rewards:"Reward",recipes:"Recipes",first:"First",then:"Then",ftDone:"Done!",chQuestion:"What do you want?",chTap:"Tap to choose",stars:"stars",goalReached:"You've earned your reward! 🎉",reward:"Reward",starsGoal:"Goal – number of stars",addChoice:"+ New choice",newCategory:"+ New category",rewardEmoji:"Emoji",rewardText:"Reward",ingredients:"Ingredients",instructions:"How to make it",servings:"Servings",time:"Time",newRecipe:"New recipe",step:"Step",addStep:"+ Add step",useReward:"Give star when done",resetStars:"Reset stars",starsEarned:"Stars earned",bannerNowOngoing:"Happening now",bannerNextUp:"Next up",bannerDayLabel:"Today",bannerNoActsLeft:"Nothing left today",close:"Close",week:"Week",myWeek:"My week",weekEmpty:"No activities this week",weekAdd:"Add activity",dayColors:"Day colours",dayColorsHint:"Tap a day to pick a colour",resetColors:"Reset to default",monday:"Monday",tuesday:"Tuesday",wednesday:"Wednesday",thursday:"Thursday",friday:"Friday",saturday:"Saturday",sunday:"Sunday",skylight:"Sky",skyHint:"Let your gaze rest",notTodayHint:"You're viewing a different day. Steps can't be checked off now.",editStory:"Edit story",storyType:"Type",typeSeq:"Step-by-step",typeSeqDesc:"Multiple pages",typeFT:"First-Then",typeFTDesc:"First → Then",coverImage:"Cover image",camera:"Camera",gallery:"Gallery",emoji:"Emoji",removePhoto:"Remove photo",storyPlacehSeq:"e.g. Clean the room",storyPlacehFT:"e.g. First homework, then TV",ftLabels:"Labels (shown above the cards)",ftSection:"First and Then",pageImage:"Page image",pageTextPH:"Write what happens on this page…",pageTimer:"Page timer",off:"Off",sunset:"Sunset",editingLabel:"Editing",duEditing:"Editing",cover:"Cover",schedule:"Schedule",doneTitle:"Done",doneSub:"Take a moment to rest.",dayOpen:"Your day is open",allActsDoneTitle:"All activities done",allActsDoneSub:"You can rest the rest of the day.",windDown:"Almost done",lampOne:"1 lamp = 1 minute",lampMany:"1 lamp = {n} minutes",stepCountOne:"1 step",stepCountMany:"{n} steps",noName:"(No name)",unsavedTitle:"Unsaved changes",unsavedDesc:"Save before closing?",discardChanges:"Discard",keepEditing:"Keep editing",overlapTitle:"Time conflict",overlapDesc:"The new activity {t} overlaps:",goBack:"Go back",saveAnyway:"Save anyway",editAct:"Edit activity",newAct:"New activity",actNamePH:"e.g. Breakfast",timeStart:"Start",timeEnd:"End (optional)",repeat:"Repeat",repNone:"Today only",repDaily:"Every day",repWeekdays:"Weekdays",repWeekend:"Weekends",repPickDays:"Pick days of week",repDailyShort:"Daily",repDaysSuffix:"days",daysShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],resetSection:"Reset",resetDataDesc:"Clears all activities, stories, mood history and settings. Cannot be undone.",resetDataBtn:"Clear all data",resetDataConfirm:"Are you sure? All data will be erased and cannot be recovered."},
};

const TTYPES=["sector","ring","dots","wave","sun","lava"];

// Get localized story/page text — falls back to whichever language has content
const lsText=(obj,lang)=>{
  if(!obj) return "";
  if(lang==="en") return obj.en||obj.sv||"";
  return obj.sv||obj.en||"";
};

const TICON={sector:"🕐",ring:"⭕",dots:"⚫",wave:"🌊",sun:"☀️",lava:"🌋"};
// Clean SVG icons for timer types — replace emoji in UI menus.
// Stroke-based for consistency, accepts color and size props.
function TimerIcon({type,size=22,color="currentColor"}){
  const s={width:size,height:size,display:"block"};
  const sw=1.6;
  switch(type){
    case "sector": return(
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={s}>
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 12L12 6" />
        <path d="M12 12L16 12" />
      </svg>
    );
    case "ring": return(
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw+0.4} strokeLinecap="round" style={s}>
        <circle cx="12" cy="12" r="8.5"/>
      </svg>
    );
    case "dots": return(
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" style={s}>
        <rect x="9" y="4" width="6" height="4" rx="1" fill={color}/>
        <rect x="9" y="16" width="6" height="4" rx="1" fill={color}/>
        <path d="M10 8 L10 11 L14 13 L14 16 M14 8 L14 11 L10 13 L10 16"/>
      </svg>
    );
    case "wave": return(
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={s}>
        <path d="M2 13 Q5 9 8 13 T14 13 T20 13 T22 13"/>
        <path d="M2 17 Q5 13 8 17 T14 17 T20 17 T22 17" opacity="0.55"/>
      </svg>
    );
    case "sun": return(
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={s}>
        {/* Sun half-disk sitting on horizon */}
        <path d="M6 16 Q6 11 12 11 Q18 11 18 16 Z" fill={color} fillOpacity="0.18"/>
        <path d="M6 16 Q6 11 12 11 Q18 11 18 16"/>
        {/* Rays going up */}
        <path d="M12 8 L12 6.5" opacity="0.7"/>
        <path d="M7 10 L6 9" opacity="0.7"/>
        <path d="M17 10 L18 9" opacity="0.7"/>
        <path d="M4.5 12.5 L3 12.5" opacity="0.5"/>
        <path d="M19.5 12.5 L21 12.5" opacity="0.5"/>
        {/* Horizon line */}
        <path d="M3 16 L21 16"/>
        {/* Reflection line below */}
        <path d="M7 19 L17 19" opacity="0.4"/>
      </svg>
    );
    case "lava": return(
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={s}>
        <path d="M8 4 L8 9 Q5 14 5 17 Q5 20 8 20 L16 20 Q19 20 19 17 Q19 14 16 9 L16 4 Z"/>
        <path d="M8 4 L16 4" strokeWidth={sw+0.2}/>
        <circle cx="11" cy="15" r="1.3" fill={color} stroke="none"/>
        <circle cx="14" cy="13" r="0.9" fill={color} stroke="none"/>
      </svg>
    );
    default: return(
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" style={s}>
        <circle cx="12" cy="13" r="8"/>
        <path d="M12 13 L12 8"/>
      </svg>
    );
  }
}
const tlbl=(k,t)=>({sector:t.sector,ring:t.ring,dots:t.dots,wave:t.wave,sun:t.sun,lava:t.lava}[k]||k);

const SYNC_DB={};
const genCode=()=>Math.random().toString(36).slice(2,6).toUpperCase();

// Persistent state — saves to localStorage, restores on mount.
// Falls back gracefully if storage is unavailable.
const LS_PREFIX="luma_v1_";
function usePersistentState(key,initial){
  const fullKey=LS_PREFIX+key;
  const[value,setValue]=useState(()=>{
    try{
      const raw=typeof localStorage!=="undefined"?localStorage.getItem(fullKey):null;
      if(raw!=null){
        const parsed=JSON.parse(raw);
        return parsed;
      }
    }catch(_){}
    return typeof initial==="function"?initial():initial;
  });
  useEffect(()=>{
    try{
      if(typeof localStorage!=="undefined") localStorage.setItem(fullKey,JSON.stringify(value));
    }catch(_){}
  },[fullKey,value]);
  return[value,setValue];
}

const hm=s=>parseInt(s)*60+parseInt(s.split(":")[1]);
// Format a "HH:MM" string for display. English uses 12-hour am/pm; Swedish keeps 24-hour.
// Accepts either a lang string ("en"/"sv") or the t translation object.
const fmtT=(s,langOrT)=>{
  if(!s||typeof s!=="string"||!s.includes(":")) return s||"";
  const isEn=typeof langOrT==="string"
    ? langOrT==="en"
    : (langOrT&&langOrT.myDay==="My Day");
  if(!isEn) return s;
  const[hStr,mStr]=s.split(":");
  const h=parseInt(hStr,10), m=parseInt(mStr,10);
  if(isNaN(h)||isNaN(m)) return s;
  const period=h<12?"AM":"PM";
  const h12=h===0?12:h>12?h-12:h;
  return`${h12}:${String(m).padStart(2,"0")} ${period}`;
};
const clockLeft=(at,m)=>{const n=new Date(),e=(n.getHours()*60+n.getMinutes()-hm(at))*60+n.getSeconds();return e<0?m*60:Math.max(0,m*60-e);};

function chime(){try{const ctx=new(window.AudioContext||window.webkitAudioContext)();[[523,0],[659,.2],[784,.38],[1047,.56]].forEach(([f,d])=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=f;o.type="sine";g.gain.setValueAtTime(0,ctx.currentTime+d);g.gain.linearRampToValueAtTime(.13,ctx.currentTime+d+.07);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+d+.7);o.start(ctx.currentTime+d);o.stop(ctx.currentTime+d+.8);});}catch(_){}}

function useTimer(initSec,autoRun=false){
  const[secs,setSecs]=useState(initSec);
  const[run,setRun]=useState(autoRun);
  const[rang,setRang]=useState(false);
  const total=useRef(initSec);
  useEffect(()=>{setSecs(initSec);total.current=initSec;setRun(autoRun);setRang(false);},[initSec,autoRun]);
  useEffect(()=>{if(!run||secs<=0)return;const id=setTimeout(()=>setSecs(s=>s-1),1000);return()=>clearTimeout(id);},[secs,run]);
  useEffect(()=>{if(secs===0&&!rang){chime();setRang(true);setRun(false);}},[secs,rang]);
  const mm=String(Math.floor(secs/60)).padStart(2,"0"),ss=String(secs%60).padStart(2,"0");
  return{secs,run,setRun,label:`${mm}:${ss}`,done:secs<=0,pct:total.current>0?secs/total.current:0,reset:()=>{setSecs(total.current);setRun(autoRun);setRang(false);}};
}

function WindDownHint({secs,color,t}){
  // Visible during last 15s, breathing slow to soften the approach to zero
  if(secs<=0||secs>15) return null;
  const label=t?.windDown||"Vi byter snart";
  return(
    <div style={{
      display:"flex",alignItems:"center",justifyContent:"center",gap:8,
      marginTop:-6,marginBottom:2,
      opacity:0,
      animation:"wdHintIn 0.9s cubic-bezier(0.32, 0.72, 0, 1) forwards",
      pointerEvents:"none",
    }}>
      <style>{`
        @keyframes wdHintIn{0%{opacity:0;transform:translateY(4px)}100%{opacity:0.85;transform:translateY(0)}}
        @keyframes wdDotBreath{0%,100%{opacity:0.35;transform:scale(0.85)}50%{opacity:0.85;transform:scale(1)}}
      `}</style>
      <span style={{width:6,height:6,borderRadius:"50%",background:color,opacity:0.7,animation:"wdDotBreath 2.4s ease-in-out infinite",display:"inline-block"}}/>
      <span style={{fontFamily:G.font,fontWeight:500,fontSize:12.5,color:G.ink2,letterSpacing:.4}}>{label}</span>
    </div>
  );
}

function TCtrl({c,color,t}){
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,width:"100%",maxWidth:280,marginTop:20}}>
      <style>{`@keyframes runPulse{0%,100%{box-shadow:0 8px 24px ${color}55, 0 2px 6px ${color}33}50%{box-shadow:0 12px 36px ${color}77, 0 4px 12px ${color}44}}`}</style>
      {!c.done&&(
        <button onClick={()=>c.setRun(r=>!r)} className="lt-press" style={{width:"100%",padding:"15px 0",borderRadius:16,border:"none",fontFamily:G.font,fontWeight:700,fontSize:15,cursor:"pointer",background:c.run?`linear-gradient(135deg,${color},${color}DC)`:G.ink,color:"#fff",boxShadow:c.run?sh.c(color):sh.sm,transition:"transform .26s cubic-bezier(0.32, 0.72, 0, 1), background .25s",animation:c.run?"runPulse 2.6s ease-in-out infinite":"none",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {c.run?(
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>
              <span>{t.pause}</span>
            </>
          ):(
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5 L19 12 L8 19 Z"/></svg>
              <span>{t.resume}</span>
            </>
          )}
        </button>
      )}
      <button onClick={c.reset} className="lt-press" style={{width:"100%",padding:"12px 0",borderRadius:16,border:`1px solid ${G.border}`,background:G.white,color:G.ink2,fontFamily:G.font,fontWeight:600,fontSize:13,cursor:"pointer",transition:"transform .26s cubic-bezier(0.32, 0.72, 0, 1), background .2s, border-color .2s",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:7}} onMouseEnter={e=>{e.currentTarget.style.borderColor=`${color}66`;e.currentTarget.style.color=color;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=G.border;e.currentTarget.style.color=G.ink2;}}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><polyline points="3 4 3 9 8 9"/></svg>
        <span>{t.reset}</span>
      </button>
    </div>
  );
}

function DoneBadge({color,t}){
  // Fallback strings if no translation context — keeps DoneBadge useful in any caller
  const doneTxt=t?.doneTitle||"Klart";
  const restTxt=t?.doneSub||"Du kan vila en stund.";
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14,padding:"40px 0"}}>
      <style>{`
        @keyframes dbCircleIn{0%{opacity:0;transform:scale(0.92)}100%{opacity:1;transform:scale(1)}}
        @keyframes dbBreath{0%,100%{transform:scale(1)}50%{transform:scale(1.022)}}
        @keyframes dbCheckDraw{from{stroke-dashoffset:70}to{stroke-dashoffset:0}}
        @keyframes dbTextIn{0%{opacity:0;transform:translateY(6px)}100%{opacity:1;transform:translateY(0)}}
      `}</style>
      {/* Soft breathing circle — no rays, no pulse glow */}
      <div style={{animation:"dbCircleIn 1.1s cubic-bezier(0.32, 0.72, 0, 1) both"}}>
        <svg width={110} height={110} style={{display:"block",animation:"dbBreath 4.2s ease-in-out 0.9s infinite"}}>
          <defs>
            <radialGradient id="dbFace" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FFFFFF"/>
              <stop offset="55%" stopColor={`${color}1A`}/>
              <stop offset="100%" stopColor={`${color}33`}/>
            </radialGradient>
          </defs>
          {/* Subtle outer ring — very thin, low contrast */}
          <circle cx={55} cy={55} r={52} fill="none" stroke={`${color}30`} strokeWidth={1}/>
          {/* Soft inner face */}
          <circle cx={55} cy={55} r={48} fill="url(#dbFace)"/>
          {/* Quiet checkmark — drawn slow */}
          <path d="M36,55 L49,68 L74,40" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray={70} style={{animation:"dbCheckDraw 0.9s 0.5s cubic-bezier(0.32, 0.72, 0, 1) forwards",strokeDashoffset:70,opacity:0.85}}/>
        </svg>
      </div>
      {/* Primary text — settled, no exclamation */}
      <div style={{fontFamily:G.serif,fontWeight:500,fontSize:22,color:G.inkSoft,letterSpacing:-.2,animation:"dbTextIn 0.7s 0.7s cubic-bezier(0.32, 0.72, 0, 1) both"}}>{doneTxt}</div>
      {/* Subtitle — a gentle handover to whatever's next */}
      <div style={{fontFamily:G.font,fontWeight:500,fontSize:13,color:G.ink3,letterSpacing:.3,animation:"dbTextIn 0.7s 1.1s cubic-bezier(0.32, 0.72, 0, 1) both"}}>{restTxt}</div>
    </div>
  );
}

/* ═══ SECTOR TIME TIMER (numbers CCW from top — like a real Time Timer) ═══ */
function SectorTimer({totalSec,color,t,autoRun=false,size=240,showCtrl=true}){
  const c=useTimer(totalSec,autoRun);
  if(c.done) return <DoneBadge color={color} t={t}/>;
  const cx=size/2, cy=size/2, R=size/2-38;
  // Time Timer behavior: sector shrinks counter-clockwise (matches the red disc
  // that disappears as time passes). c.pct = remaining.
  // Number scale: pick clean step based on duration
  const totalMin=Math.max(1,Math.round(totalSec/60));
  let step;
  if(totalMin<=5) step=1;
  else if(totalMin<=15) step=3;
  else if(totalMin<=30) step=5;
  else if(totalMin<=60) step=10;
  else step=15;
  const nums=[];
  for(let m=step; m<totalMin; m+=step) nums.push(m);
  // Minor ticks every minute (or every 5 min for longer durations)
  const minorStep = totalMin<=15 ? 1 : totalMin<=60 ? 1 : 5;
  const minorTicks=[];
  for(let m=0;m<totalMin;m+=minorStep) if(!nums.includes(m) && m!==0) minorTicks.push(m);

  // New layout (inside-out):
  //   1. Sector (innermost, 0 → R*0.62)
  //   2. Buffer
  //   3. Ticks (just outside sector, R*0.67 to R*0.75)
  //   4. Buffer
  //   5. Numbers (outermost, centered at R-9, aligned with ticks)
  const sectorR=R*0.62;
  const tickInnerR=R*0.67;
  const tickOuterR=R*0.75;
  const numR=R-9;
  const theta=c.pct*2*Math.PI;
  const ex=cx-sectorR*Math.sin(theta), ey=cy-sectorR*Math.cos(theta);
  const lg=c.pct>0.5?1:0;
  const handX=cx-sectorR*Math.sin(theta), handY=cy-sectorR*Math.cos(theta);

  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
      <style>{`@keyframes timerIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}@keyframes ttPulse{0%,100%{box-shadow:0 14px 40px ${color}40, 0 4px 12px ${color}33, inset 0 1.5px 0 rgba(255,255,255,.5)}50%{box-shadow:0 18px 50px ${color}55, 0 6px 16px ${color}44, inset 0 1.5px 0 rgba(255,255,255,.5)}}`}</style>
      <div style={{padding:14,borderRadius:size*0.13,background:`linear-gradient(155deg,${color},${color}D8)`,animation:"timerIn .35s ease, ttPulse 3.6s ease-in-out infinite"}}>
        <div style={{padding:10,borderRadius:size*0.105,background:"#fff",boxShadow:"inset 0 0 0 1px rgba(0,0,0,.05), inset 0 2px 4px rgba(0,0,0,.04)"}}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{display:"block"}}>
            <defs>
              <radialGradient id={`stSect${size}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={color} stopOpacity="0.96"/>
                <stop offset="100%" stopColor={color} stopOpacity="0.85"/>
              </radialGradient>
            </defs>
            <circle cx={cx} cy={cy} r={R} fill="#FEFEFE"/>
            {/* Inner sector — innermost element */}
            {c.pct>=0.9995 ? <circle cx={cx} cy={cy} r={sectorR} fill={`url(#stSect${size})`}/>
              : c.pct>0.002 ? <path d={`M${cx},${cy} L${cx},${cy-sectorR} A${sectorR},${sectorR} 0 ${lg},0 ${ex},${ey} Z`} fill={`url(#stSect${size})`}/>
              : null}
            {/* Minor ticks — just outside sector, short */}
            {minorTicks.map(m=>{
              const th=(m/totalMin)*2*Math.PI;
              const x1=cx-tickInnerR*Math.sin(th), y1=cy-tickInnerR*Math.cos(th);
              const x2=cx-(tickInnerR+(tickOuterR-tickInnerR)*0.55)*Math.sin(th), y2=cy-(tickInnerR+(tickOuterR-tickInnerR)*0.55)*Math.cos(th);
              return <line key={'mn'+m} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#A8A0B8" strokeWidth={1} strokeLinecap="round"/>;
            })}
            {/* Major ticks — at each numbered position, aligned with numbers radially */}
            {nums.map(m=>{
              const th=(m/totalMin)*2*Math.PI;
              const x1=cx-tickInnerR*Math.sin(th), y1=cy-tickInnerR*Math.cos(th);
              const x2=cx-tickOuterR*Math.sin(th), y2=cy-tickOuterR*Math.cos(th);
              return <line key={'mj'+m} x1={x1} y1={y1} x2={x2} y2={y2} stroke={G.ink} strokeWidth={2} strokeLinecap="round"/>;
            })}
            {/* Numbers — OUTERMOST, aligned radially with major ticks */}
            {nums.map(m=>{
              const th=(m/totalMin)*2*Math.PI;
              const x=cx-numR*Math.sin(th), y=cy-numR*Math.cos(th);
              return <text key={'n'+m} x={x} y={y} textAnchor="middle" dominantBaseline="central" style={{fontSize:Math.round(size*0.07),fontWeight:700,fill:G.ink,fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',letterSpacing:0,fontVariantNumeric:"tabular-nums",fontStyle:"normal"}}>{m}</text>;
            })}
            {/* Hand */}
            {c.pct>0.002&&c.pct<0.9995&&<line x1={cx} y1={cy} x2={handX} y2={handY} stroke={G.ink} strokeWidth={2.5} strokeLinecap="round"/>}
            {/* Spindle */}
            <circle cx={cx} cy={cy} r={size*0.052} fill="#FFFFFF" stroke={G.ink} strokeWidth={1.5}/>
            <circle cx={cx} cy={cy} r={size*0.024} fill={G.ink}/>
          </svg>
        </div>
      </div>
      <div style={{fontFamily:G.serif,fontWeight:600,fontSize:size*0.11,color:G.ink,letterSpacing:1,fontVariantNumeric:"tabular-nums"}}>{c.label}</div>
      <WindDownHint secs={c.secs} color={color} t={t}/>
      {showCtrl&&<TCtrl c={c} color={color} t={t}/>}
    </div>
  );
}

/* ═══ RING (Minee-style donut) ═══ */
function RingTimer({totalSec,color,t,autoRun=false,size=240,showCtrl=true}){
  const c=useTimer(totalSec,autoRun);
  if(c.done) return <DoneBadge color={color} t={t}/>;
  const cx=size/2, cy=size/2;
  const Ro=size/2-38;       // outer radius (extra padding for end-marker dot to stay inside)
  const Ri=Ro*0.58;         // inner radius (hollow center)
  // Time Timer behavior: donut starts FULL and shrinks counter-clockwise (matches SectorTimer).
  // c.pct = remaining (1 → 0). End point is on the LEFT side (counter-clockwise from 12).
  const angle=c.pct*2*Math.PI;
  const exO=cx-Ro*Math.sin(angle), eyO=cy-Ro*Math.cos(angle);
  const exI=cx-Ri*Math.sin(angle), eyI=cy-Ri*Math.cos(angle);
  const lg=c.pct>0.5?1:0;
  let donutPath="";
  if(c.pct>0.002 && c.pct<0.9998){
    // Annular sector: outer arc counter-clockwise, line in, inner arc back, line out
    donutPath = `M${cx},${cy-Ro} A${Ro},${Ro} 0 ${lg},0 ${exO},${eyO} L${exI},${eyI} A${Ri},${Ri} 0 ${lg},1 ${cx},${cy-Ri} Z`;
  }
  // End-marker position (dot at the boundary where colored region ends)
  const midR=(Ro+Ri)/2;
  const markX=cx-midR*Math.sin(angle), markY=cy-midR*Math.cos(angle);

  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:18}}>
      <style>{`@keyframes timerPulse{0%,100%{box-shadow:0 20px 50px rgba(31,27,46,.14), 0 6px 14px rgba(31,27,46,.06), inset 0 2px 0 rgba(255,255,255,.95)}50%{box-shadow:0 24px 60px rgba(31,27,46,.18), 0 8px 20px rgba(31,27,46,.08), inset 0 2px 0 rgba(255,255,255,.95)}}`}</style>
      <div style={{padding:14,borderRadius:"50%",background:"radial-gradient(circle at 30% 25%, #FFFFFF 0%, #F5F2FA 100%)",border:`1px solid ${G.border}`,animation:"timerPulse 3.6s ease-in-out infinite"}}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{display:"block"}}>
          <defs>
            <radialGradient id="rtFace" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FFFFFF"/>
              <stop offset="100%" stopColor="#FAFAFE"/>
            </radialGradient>
            <linearGradient id="rtSector" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="1"/>
              <stop offset="100%" stopColor={color} stopOpacity="0.9"/>
            </linearGradient>
          </defs>
          {/* Outer face circle */}
          <circle cx={cx} cy={cy} r={Ro} fill="url(#rtFace)" stroke={G.border} strokeWidth={1}/>
          {/* Donut: full ring when pct≈1, annular wedge when partial */}
          {c.pct>=0.9998 ? (
            <>
              <circle cx={cx} cy={cy} r={Ro} fill="url(#rtSector)"/>
              <circle cx={cx} cy={cy} r={Ri} fill="url(#rtFace)"/>
            </>
          ) : donutPath ? (
            <>
              <path d={donutPath} fill="url(#rtSector)"/>
              <circle cx={cx} cy={cy} r={Ri} fill="url(#rtFace)" stroke={G.border} strokeWidth={0.5}/>
            </>
          ) : (
            <circle cx={cx} cy={cy} r={Ri} fill="url(#rtFace)" stroke={G.border} strokeWidth={0.5}/>
          )}
          {/* End-marker dot — sits at the boundary where peach currently ends */}
          {c.pct>0.002&&c.pct<0.9998&&(
            <circle cx={markX} cy={markY} r={3.5} fill={G.ink}/>
          )}
        </svg>
      </div>
      <div style={{fontFamily:G.serif,fontWeight:600,fontSize:size*0.11,color:G.ink,letterSpacing:1,fontVariantNumeric:"tabular-nums"}}>{c.label}</div>
      <WindDownHint secs={c.secs} color={color} t={t}/>
      {showCtrl&&<TCtrl c={c} color={color} t={t}/>}
    </div>
  );
}

/* ═══ DOTS / Timstock 2.0 — premium horizontal LED row, color from user ═══ */
function DotsTimer({totalSec,color,t,autoRun=false,size=240,showCtrl=true}){
  const c=useTimer(totalSec,autoRun);
  if(c.done) return <DoneBadge color={color} t={t}/>;
  const totalMin=Math.max(1,Math.round(totalSec/60));
  // Adaptive minutes-per-lamp
  let mpl;
  if(totalMin<=10) mpl=1;
  else if(totalMin<=30) mpl=2;
  else if(totalMin<=60) mpl=5;
  else mpl=10;
  const tot=Math.max(2,Math.ceil(totalMin/mpl));
  const elapsedMin=(totalSec/60)*(1-c.pct);
  const remainingMin=totalMin-elapsedMin;
  const lit=Math.max(0,Math.ceil(remainingMin/mpl));

  // Dynamic sizing: shrink dots as count grows so they always fit
  // Available width: assume ~340px usable inside frame after padding
  const availableW = 340;
  const minLed = 12;
  const maxLed = size>280?32:size>200?26:22;
  // Solve: tot*led + (tot-1)*gap = availableW where gap = led*0.5
  // → led * (tot + (tot-1)*0.5) = availableW
  // → led = availableW / (1.5*tot - 0.5)
  const idealLed = Math.floor(availableW / (1.5*tot - 0.5));
  const led = Math.max(minLed, Math.min(maxLed, idealLed));
  const gap = Math.max(4, Math.round(led*0.45));
  const padV=Math.max(14, Math.round(led*0.7)), padH=Math.max(14, Math.round(led*0.7));
  const lampLabel = mpl===1
    ? (t?.lampOne||"1 lampa = 1 minut")
    : (t?.lampMany||"1 lampa = {n} minuter").replace("{n}", String(mpl));

  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:18,width:"100%"}}>
      <style>{`@keyframes dotBreath{0%,100%{transform:scale(1);filter:brightness(1)}50%{transform:scale(1.045);filter:brightness(1.08)}}@keyframes dotFadeOut{from{opacity:1;transform:scale(1)}to{opacity:0.4;transform:scale(0.85)}}`}</style>
      {/* Clean lamp row — flat, premium "panel light" design */}
      <div style={{
        display:"flex",flexDirection:"row",alignItems:"center",justifyContent:"center",gap,
        padding:`${padV}px ${padH}px`,
        background:`linear-gradient(180deg, #FCFAFD 0%, #F4F1F8 50%, #FCFAFD 100%)`,
        borderRadius:Math.round(led*0.95),
        boxShadow:`0 10px 28px ${color}18, 0 2px 6px rgba(31,27,46,0.05), inset 0 1.5px 0 rgba(255,255,255,1), inset 0 -1px 0 ${color}10`,
        border:`1px solid ${color}1A`,
        maxWidth:"100%",
        flexWrap:"nowrap",
      }}>
        {Array.from({length:tot}).map((_,i)=>{
          const on=i<lit;
          // Stagger delay creates wave-like motion across lamps
          const delay = (i*0.18) % 3.2;
          return(
            <div key={i} style={{
              width:led,height:led,
              borderRadius:"50%",
              flexShrink:0,
              background: on
                ? `radial-gradient(circle at 38% 26%, #FFFFFF 0%, ${color}FA 16%, ${color} 58%, ${color}C8 100%)`
                : `radial-gradient(circle at 50% 50%, ${color}14 0%, ${color}08 100%)`,
              boxShadow: on
                ? `0 ${led*0.12}px ${led*0.45}px ${color}55, 0 ${led*0.04}px ${led*0.1}px ${color}80, inset 0 -${led*0.18}px ${led*0.22}px ${color}A0, inset 0 ${led*0.10}px ${led*0.14}px rgba(255,255,255,0.55)`
                : `inset 0 1.5px 2px rgba(31,27,46,0.04), inset 0 -1px 1px ${color}12`,
              border: on ? "none" : `1px solid ${color}25`,
              transition:"background 0.6s ease, box-shadow 0.6s ease, border 0.6s ease",
              animation: on ? `dotBreath 3.2s ease-in-out ${delay}s infinite` : "none",
              transformOrigin:"center",
            }}/>
          );
        })}
      </div>
      {/* Diskret label */}
      <div style={{fontFamily:G.font,fontWeight:500,fontSize:11,color:G.ink3,letterSpacing:.8,textTransform:"uppercase"}}>{lampLabel}</div>
      {/* Tid kvar */}
      <div style={{fontFamily:G.serif,fontWeight:600,fontSize:size*0.11,color:G.ink,letterSpacing:1,fontVariantNumeric:"tabular-nums"}}>{c.label}</div>
      <WindDownHint secs={c.secs} color={color} t={t}/>
      {showCtrl&&<TCtrl c={c} color={color} t={t}/>}
    </div>
  );
}

/* ═══ WAVE ═══ */
function WaveTimer({totalSec,color,t,autoRun=false,size=240,showCtrl=true}){
  const c=useTimer(totalSec,autoRun);
  const W=size, H=Math.round(size*0.65);
  const fillY=c.done?H*0.05:H*(1-c.pct);

  // Wave frequencies — each layer has its own wavelength.
  // Critical: animation shift distance MUST equal the wavelength (2π/freq)
  // so the path returns to identical position → seamless loop, no jumps.
  const freqBack=0.024, freqMid=0.042, freqFront=0.05;
  const waveLenBack=Math.round(2*Math.PI/freqBack);    // ≈ 262px
  const waveLenMid=Math.round(2*Math.PI/freqMid);      // ≈ 150px
  const waveLenFront=Math.round(2*Math.PI/freqFront);  // ≈ 126px

  // Bubble configuration — bubbles emerge from the bottom and rise harmoniously.
  // Deterministic seed (not Math.random) keeps positions stable between renders.
  const bubbles=useMemo(()=>Array.from({length:12}).map((_,i)=>{
    const seed=i*97;
    // Distribute starting X positions evenly across the width with some jitter,
    // so bubbles emerge from many points along the floor — not clustered
    const xJitter=((seed*13)%80)/80; // 0..1
    const xSegment=W/12;
    return {
      x: Math.round(xSegment*i+xSegment*0.5+xJitter*xSegment*0.6-xSegment*0.3),
      r: 1.8+((seed*7)%14)/14*2.4,    // 1.8–4.2 px — varied but never tiny
      duration: 7+((seed*11)%55)/10,  // 7–12.5s rise — slow & calming
      // Stagger starts evenly so bubbles emerge in a rhythm, not all at once.
      // Negative delays mean some are already mid-rise when timer starts.
      delay: -((i*1.2+((seed*17)%30)/10)),
      swayDur: 3+((seed*5)%24)/10,    // 3–5.4s sway period
      swayAmp: 2.5+((seed*3)%30)/10,  // 2.5–5.5 px horizontal sway
    };
  }),[W]);

  if(c.done) return <DoneBadge color={color} t={t}/>;

  // Build a wave path wide enough to span >2× viewport so when we shift it left
  // by exactly one wavelength, the remaining visible section is identical.
  // Path extends from x=-W to x=2W (total width 3W) covering all visible positions.
  const makeWavePath=(amp,freq,phaseOff,detail=0.3)=>{
    const xStart=-W, xEnd=2*W;
    let d=`M${xStart},0`;
    for(let x=xStart;x<=xEnd;x+=2){
      const y=Math.sin(x*freq+phaseOff)*amp
        +Math.sin(x*freq*2.4+phaseOff*1.3)*amp*detail;
      d+=` L${x},${y}`;
    }
    return d+` L${xEnd},${H*1.5} L${xStart},${H*1.5} Z`;
  };
  const makeCrestPath=()=>{
    const xStart=-W, xEnd=2*W;
    let d="";
    for(let x=xStart;x<=xEnd;x+=2){
      const y=Math.sin(x*freqFront)*9+Math.sin(x*freqFront*2.4)*2.7-2;
      d+=`${x===xStart?'M':'L'}${x},${y}`;
    }
    return d;
  };

  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:18}}>
      <style>{`
        @keyframes waveShiftBack${size} {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-${waveLenBack}px, 0, 0); }
        }
        @keyframes waveShiftMid${size} {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-${waveLenMid}px, 0, 0); }
        }
        @keyframes waveShiftFront${size} {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-${waveLenFront}px, 0, 0); }
        }
        @keyframes waveBubbleRise${size} {
          0% { transform: translate3d(0, ${H-4}px, 0); opacity: 0; }
          10% { opacity: 0.7; }
          90% { opacity: 0.7; }
          100% { transform: translate3d(0, ${H*0.05}px, 0); opacity: 0; }
        }
        @keyframes waveBubbleSwayA${size} {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(var(--sway-amp, 3px), 0, 0); }
        }
        @keyframes waveBubbleSwayB${size} {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(calc(var(--sway-amp, 3px) * -1), 0, 0); }
        }
        @keyframes waveSwell${size} {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -2.5px, 0); }
        }
      `}</style>
      <div style={{position:"relative",borderRadius:28,overflow:"hidden",width:W,height:H,background:`linear-gradient(180deg, ${color}06 0%, ${color}12 50%, ${color}1F 100%)`,border:`1px solid ${color}33`,boxShadow:`${sh.md}, inset 0 2px 5px rgba(255,255,255,0.55), inset 0 -3px 8px ${color}22`}}>
        <svg width={W} height={H} style={{position:"absolute",inset:0,overflow:"hidden"}}>
          <defs>
            <linearGradient id={`wgBack${size}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.22"/>
              <stop offset="100%" stopColor={color} stopOpacity="0.45"/>
            </linearGradient>
            <linearGradient id={`wgMid${size}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.42"/>
              <stop offset="100%" stopColor={color} stopOpacity="0.72"/>
            </linearGradient>
            <linearGradient id={`wgFront${size}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.7"/>
              <stop offset="55%" stopColor={color} stopOpacity="0.92"/>
              <stop offset="100%" stopColor={color}/>
            </linearGradient>
            <linearGradient id={`wgCrest${size}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.15"/>
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.15"/>
            </linearGradient>
            {/* Premium bubble — multi-stop radial with highlight, soft edge */}
            <radialGradient id={`wgBubble${size}`} cx="32%" cy="28%" r="68%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.98"/>
              <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.75"/>
              <stop offset="75%" stopColor="#FFFFFF" stopOpacity="0.35"/>
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.12"/>
            </radialGradient>
            {/* Bubble rim — subtle outer highlight for 3D feel */}
            <radialGradient id={`wgBubbleRim${size}`} cx="50%" cy="50%" r="50%">
              <stop offset="80%" stopColor="#FFFFFF" stopOpacity="0"/>
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.4"/>
            </radialGradient>
          </defs>

          {/* Water level — moves down smoothly as timer ticks (1s transition between integer ticks).
              Inner wrapper adds gentle vertical "swell" — barely-perceptible 2.5px breath that makes
              the water feel alive without distraction. */}
          <g style={{transform:`translate3d(0, ${fillY}px, 0)`,transition:"transform 1s linear",willChange:"transform"}}>
            <g style={{animation:c.run?`waveSwell${size} 6.5s ease-in-out infinite`:"none",willChange:"transform"}}>
              {/* Back wave — slowest, deepest */}
              <g style={{animation:c.run?`waveShiftBack${size} 22s linear infinite`:"none",willChange:"transform"}}>
                <path d={makeWavePath(7,freqBack,0.4)} fill={`url(#wgBack${size})`} transform={`translate(0, 14)`}/>
              </g>
              {/* Mid wave */}
              <g style={{animation:c.run?`waveShiftMid${size} 13s linear infinite`:"none",willChange:"transform"}}>
                <path d={makeWavePath(8.5,freqMid,1.7)} fill={`url(#wgMid${size})`} transform={`translate(0, 7)`}/>
              </g>
              {/* Front wave (visible top edge) */}
              <g style={{animation:c.run?`waveShiftFront${size} 9s linear infinite`:"none",willChange:"transform"}}>
                <path d={makeWavePath(9,freqFront,0)} fill={`url(#wgFront${size})`}/>
                {/* Glossy crest highlight follows the front wave exactly */}
                <path d={makeCrestPath()} fill="none" stroke={`url(#wgCrest${size})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
            </g>
          </g>

          {/* Bubbles — three-layer structure so animations don't fight each other:
              Layer 1 (outer): static X position
              Layer 2 (middle): rise animation — translateY from bottom (H-4) up to (H*0.05)
              Layer 3 (inner): horizontal sway for organic motion
              All on GPU via translate3d + will-change. */}
          {bubbles.map((b,i)=>(
            <g key={i} transform={`translate(${b.x}, 0)`}>
              <g
                style={{
                  animation:`waveBubbleRise${size} ${b.duration}s linear ${b.delay}s infinite`,
                  willChange:"transform, opacity",
                }}
              >
                <g
                  style={{
                    "--sway-amp":`${b.swayAmp}px`,
                    animation:`${i%2===0?`waveBubbleSwayA${size}`:`waveBubbleSwayB${size}`} ${b.swayDur}s ease-in-out infinite`,
                    willChange:"transform",
                  }}
                >
                  {/* Main soft sphere */}
                  <circle cx={0} cy={0} r={b.r} fill={`url(#wgBubble${size})`}/>
                  {/* Subtle outer rim for depth */}
                  <circle cx={0} cy={0} r={b.r} fill={`url(#wgBubbleRim${size})`}/>
                  {/* Soft highlight dot — much gentler now (was rgba 0.95) so bubbles read as gentle, not jarring */}
                  <circle cx={-b.r*0.34} cy={-b.r*0.40} r={b.r*0.22} fill="rgba(255,255,255,0.65)"/>
                </g>
              </g>
            </g>
          ))}
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontFamily:G.serif,fontWeight:600,fontSize:size*0.14,color:c.pct>0.42?"#fff":G.ink,textShadow:c.pct>0.42?"0 2px 14px rgba(0,0,0,.28)":"0 1px 3px rgba(255,255,255,0.6)",fontVariantNumeric:"tabular-nums",transition:"color .6s ease"}}>{c.label}</span>
        </div>
      </div>
      <WindDownHint secs={c.secs} color={color} t={t}/>
      {showCtrl&&<TCtrl c={c} color={color} t={t}/>}
    </div>
  );
}

/* ═══ SUN — Pastel clean sunset ═══
   Minimal aesthetic: soft pastel gradients, no clouds/birds/stars clutter.
   Just sky + sun + horizon + water + gentle reflection.
   All motion via CSS keyframes on GPU; React state updates only at timer ticks.
═══ */
function SunTimer({totalSec,color,t,autoRun=false,size=240,showCtrl=true}){
  const c=useTimer(totalSec,autoRun);

  if(c.done) return <DoneBadge color={color} t={t}/>;

  const W=size, H=Math.round(size*0.85);
  const horizonY=Math.round(H*0.62);

  // Progress: 0 → 1 across full duration
  const elapsed = 1 - c.pct;
  let progress;
  if(elapsed<0.94){
    const e=elapsed/0.94;
    progress=e*e*(3-2*e)*0.88;
  } else {
    const e=(elapsed-0.94)/0.06;
    progress=0.88+Math.pow(e,1.4)*0.12;
  }

  const lerp=(a,b,t)=>a+(b-a)*t;
  const phaseT=(start,end)=>Math.max(0,Math.min(1,(progress-start)/(end-start)));

  // PASTEL palette — soft, muted, never saturated.
  // Phases: pale day → soft peach → dusty rose → lavender dusk → indigo night
  // Sky top color
  let skyTopH, skyTopS, skyTopL;
  if(progress<0.30){
    const p=progress/0.30;
    skyTopH=lerp(210,32,p); skyTopS=lerp(45,40,p); skyTopL=lerp(91,90,p);
  } else if(progress<0.55){
    const p=phaseT(0.30,0.55);
    skyTopH=lerp(32,18,p); skyTopS=lerp(40,42,p); skyTopL=lerp(90,86,p);
  } else if(progress<0.78){
    const p=phaseT(0.55,0.78);
    skyTopH=lerp(18,340,p); skyTopS=lerp(42,38,p); skyTopL=lerp(86,78,p);
  } else if(progress<0.92){
    const p=phaseT(0.78,0.92);
    skyTopH=lerp(340,260,p); skyTopS=lerp(38,32,p); skyTopL=lerp(78,55,p);
  } else {
    const p=phaseT(0.92,1.0);
    skyTopH=lerp(260,235,p); skyTopS=lerp(32,38,p); skyTopL=lerp(55,28,p);
  }

  // Sky bottom (near horizon) — always slightly warmer/lighter than top
  let skyBotH, skyBotS, skyBotL;
  if(progress<0.30){
    const p=progress/0.30;
    skyBotH=lerp(38,28,p); skyBotS=lerp(55,60,p); skyBotL=lerp(92,90,p);
  } else if(progress<0.55){
    const p=phaseT(0.30,0.55);
    skyBotH=lerp(28,18,p); skyBotS=lerp(60,68,p); skyBotL=lerp(90,84,p);
  } else if(progress<0.78){
    const p=phaseT(0.55,0.78);
    skyBotH=lerp(18,8,p); skyBotS=lerp(68,55,p); skyBotL=lerp(84,72,p);
  } else if(progress<0.92){
    const p=phaseT(0.78,0.92);
    skyBotH=lerp(8,310,p); skyBotS=lerp(55,40,p); skyBotL=lerp(72,50,p);
  } else {
    const p=phaseT(0.92,1.0);
    skyBotH=lerp(310,250,p); skyBotS=lerp(40,38,p); skyBotL=lerp(50,30,p);
  }

  const skyTop=`hsl(${skyTopH},${skyTopS}%,${skyTopL}%)`;
  const skyBot=`hsl(${skyBotH},${skyBotS}%,${skyBotL}%)`;

  // Water — blue ocean at start, transitions to warmer reflective tones as sun sets
  // Phases: blue → soft teal → muted peach → dusky rose → indigo night
  let waterH, waterS, waterL;
  if(progress<0.30){
    const p=progress/0.30;
    // Start: clear cool blue ocean
    waterH=lerp(205,200,p); waterS=lerp(58,52,p); waterL=lerp(62,60,p);
  } else if(progress<0.55){
    const p=phaseT(0.30,0.55);
    // Afternoon: blue softening toward teal
    waterH=lerp(200,190,p); waterS=lerp(52,42,p); waterL=lerp(60,55,p);
  } else if(progress<0.78){
    const p=phaseT(0.55,0.78);
    // Sunset: teal warms to muted peach as sky reflects
    waterH=lerp(190,20,p); waterS=lerp(42,38,p); waterL=lerp(55,50,p);
  } else if(progress<0.92){
    const p=phaseT(0.78,0.92);
    // Dusk: muted peach into rose-violet
    waterH=lerp(20,290,p); waterS=lerp(38,32,p); waterL=lerp(50,38,p);
  } else {
    const p=phaseT(0.92,1.0);
    // Night: deep indigo
    waterH=lerp(290,235,p); waterS=lerp(32,38,p); waterL=lerp(38,22,p);
  }
  const waterTop=`hsl(${waterH},${waterS}%,${waterL}%)`;
  const waterBot=`hsl(${waterH-5},${Math.max(20,waterS-10)}%,${Math.max(15,waterL-18)}%)`;

  // Sun — soft and pastel, never harsh yellow
  const sunR=Math.round(size*0.13);
  const skyTopMargin=Math.round(size*0.12);
  const sunCenterY=skyTopMargin+progress*(horizonY+sunR*1.4-skyTopMargin);
  const sunVisible=sunCenterY<horizonY+sunR;

  // Soft pastel sun: pale cream → peach → rose
  const warmth=Math.min(1,Math.max(0,(progress-0.35)/0.45));
  const sunCenter=`hsl(${42-warmth*8},${60+warmth*15}%,${96-warmth*4}%)`;
  const sunMid=`hsl(${32-warmth*12},${55+warmth*15}%,${86-warmth*12}%)`;
  const sunEdge=`hsl(${22-warmth*10},${50+warmth*10}%,${72-warmth*14}%)`;

  // Glow halo — soft, large, never burning
  const glowR=sunR*(2.2+warmth*0.6);
  const glowOpacity=Math.max(0.12,(1-progress*0.5)*0.55);

  // Reflection on water — only when sun is near horizon
  const showReflection=sunCenterY>horizonY-sunR*3 && progress<0.94;
  const reflectionStrength=showReflection?Math.min(1,Math.max(0,1-Math.abs(sunCenterY-horizonY)/(sunR*3.5))):0;

  // Subtle horizon glow band — peaks at sunset
  const horizonGlow=progress>0.45&&progress<0.94?Math.min(1,(progress-0.45)/0.25)*(1-(progress-0.85)/0.09):0;

  // Birds fade with day progress — visible while sun is high
  const birdOpacity=Math.max(0,1-progress*1.4)*0.55;

  // Sun rays — visible during the day, soft pastel pulse
  const raysOpacity=progress<0.78?Math.max(0,(1-progress*0.85))*0.65:0;

  // A few quiet stars only at deep dusk — minimal
  const starOpacity=Math.max(0,(progress-0.82)/0.18);
  const stars=starOpacity>0.05?[
    {x:0.12,y:0.14,br:0.85},{x:0.28,y:0.08,br:1.0},{x:0.42,y:0.16,br:0.7},
    {x:0.58,y:0.10,br:0.9},{x:0.72,y:0.18,br:0.75},{x:0.86,y:0.12,br:1.0},
    {x:0.20,y:0.30,br:0.7},{x:0.50,y:0.34,br:0.85},{x:0.78,y:0.32,br:0.7},
  ]:[];

  const uid=`s${size}`;
  // 1Hz color/position transitions — smooths the gap between timer ticks
  const tCol="fill 1s linear, stroke 1s linear, opacity 1s linear, stop-color 1s linear";

  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
      <style>{`
        @keyframes sunPastelBreath { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.03); } }
        @keyframes sunPastelHalo { 0%, 100% { transform: scale(1); opacity: 0.95; } 50% { transform: scale(1.08); opacity: 1; } }
        @keyframes sunPastelTwinkle { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        @keyframes sunPastelRipple0 { 0%, 100% { transform: translate3d(0, 0, 0); } 50% { transform: translate3d(2px, 0, 0); } }
        @keyframes sunPastelRipple1 { 0%, 100% { transform: translate3d(0, 0, 0); } 50% { transform: translate3d(-2px, 0, 0); } }
        @keyframes sunPastelRefl { 0%, 100% { transform: scaleX(1); opacity: 1; } 50% { transform: scaleX(1.05); opacity: 0.92; } }
        @keyframes sunRaysSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes sunRaysPulse { 0%, 100% { opacity: 0.55; } 50% { opacity: 0.85; } }
        @keyframes sunBirdGlide0 { from { transform: translateX(-12%); } to { transform: translateX(112%); } }
        @keyframes sunBirdGlide1 { from { transform: translateX(-18%); } to { transform: translateX(108%); } }
        @keyframes sunBirdGlide2 { from { transform: translateX(-8%); } to { transform: translateX(116%); } }
        @keyframes sunBirdBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2.5px); } }
      `}</style>

      <svg width={W} height={H} style={{borderRadius:24,overflow:"hidden",boxShadow:"0 12px 40px rgba(31,27,46,0.08), 0 2px 8px rgba(31,27,46,0.04)",border:`1px solid ${G.border}`,display:"block"}}>
        <defs>
          {/* Sky gradient — soft pastel transition */}
          <linearGradient id={`sky${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={skyTop} style={{transition:"stop-color 1s linear"}}/>
            <stop offset="100%" stopColor={skyBot} style={{transition:"stop-color 1s linear"}}/>
          </linearGradient>
          {/* Water gradient */}
          <linearGradient id={`wtr${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={waterTop} style={{transition:"stop-color 1s linear"}}/>
            <stop offset="100%" stopColor={waterBot} style={{transition:"stop-color 1s linear"}}/>
          </linearGradient>
          {/* Sun — radial with off-center highlight for soft 3D */}
          <radialGradient id={`sun${uid}`} cx="42%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95"/>
            <stop offset="35%" stopColor={sunCenter}/>
            <stop offset="75%" stopColor={sunMid}/>
            <stop offset="100%" stopColor={sunEdge}/>
          </radialGradient>
          {/* Halo — pure soft glow */}
          <radialGradient id={`glow${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={sunMid} stopOpacity={glowOpacity}/>
            <stop offset="50%" stopColor={sunEdge} stopOpacity={glowOpacity*0.4}/>
            <stop offset="100%" stopColor={sunEdge} stopOpacity="0"/>
          </radialGradient>
          {/* Horizon glow strip */}
          <linearGradient id={`hg${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={`hsl(${skyBotH+6},${Math.max(35,skyBotS-15)}%,${Math.min(92,skyBotL+8)}%)`} stopOpacity="0"/>
            <stop offset="100%" stopColor={`hsl(${skyBotH},${Math.max(45,skyBotS-5)}%,${Math.min(85,skyBotL+2)}%)`} stopOpacity={horizonGlow*0.65}/>
          </linearGradient>
          {/* Reflection gradient */}
          <linearGradient id={`refl${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={sunMid} stopOpacity={reflectionStrength*0.5}/>
            <stop offset="100%" stopColor={sunMid} stopOpacity="0"/>
          </linearGradient>
          <clipPath id={`sc${uid}`}><rect x={0} y={0} width={W} height={horizonY}/></clipPath>
          <clipPath id={`wc${uid}`}><rect x={0} y={horizonY} width={W} height={H-horizonY}/></clipPath>
        </defs>

        {/* Sky — solid pastel gradient */}
        <rect x={0} y={0} width={W} height={horizonY} fill={`url(#sky${uid})`} style={{transition:tCol}}/>

        {/* Horizon glow band — subtle peach near horizon during sunset */}
        {horizonGlow>0&&(
          <rect x={0} y={horizonY-Math.round(H*0.22)} width={W} height={Math.round(H*0.22)} fill={`url(#hg${uid})`} style={{transition:"opacity 1s linear"}}/>
        )}

        {/* Quiet stars at deep dusk only */}
        {starOpacity>0&&(
          <g style={{opacity:starOpacity,transition:"opacity 1s linear"}}>
            {stars.map((s,i)=>{
              const baseR=0.9*s.br;
              const dur=3+(i%4)*0.5;
              const delay=-(i*0.4)%dur;
              return(
                <circle
                  key={i}
                  cx={s.x*W}
                  cy={s.y*horizonY}
                  r={baseR}
                  fill="#FFFFFF"
                  opacity={s.br*0.85}
                  style={{
                    animation:`sunPastelTwinkle ${dur}s ease-in-out ${delay}s infinite`,
                    willChange:"opacity",
                  }}
                />
              );
            })}
          </g>
        )}

        {/* Birds — gentle silhouettes gliding across the sky during the day */}
        {birdOpacity>0.05&&(
          <g clipPath={`url(#sc${uid})`} style={{opacity:birdOpacity,transition:"opacity 1s linear"}}>
            {[
              {dur:62,delay:-12,y:0.26,sz:7,glide:0,bobDelay:0},
              {dur:78,delay:-38,y:0.34,sz:6,glide:1,bobDelay:-1.2},
              {dur:54,delay:-26,y:0.20,sz:8,glide:2,bobDelay:-0.5},
            ].map((b,i)=>{
              const by=b.y*horizonY;
              return(
                <g key={i} style={{animation:`sunBirdGlide${b.glide} ${b.dur}s linear ${b.delay}s infinite`,willChange:"transform"}}>
                  <g style={{animation:`sunBirdBob 5s ease-in-out ${b.bobDelay}s infinite`,willChange:"transform"}}>
                    <path
                      d={`M${-b.sz},${by} Q${-b.sz*0.5},${by-b.sz*0.42} 0,${by} Q${b.sz*0.5},${by-b.sz*0.42} ${b.sz},${by}`}
                      fill="none"
                      stroke="rgba(40,30,60,0.55)"
                      strokeWidth={1.3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                </g>
              );
            })}
          </g>
        )}

        {/* Sun system — rays + halo + disc all positioned via transform on wrapper.
            Solving position changes by translating wrapper group means SVG attributes
            (cx, cy, x1, y1, etc.) stay static — they never need CSS transitions, which
            iOS Safari does not reliably support on SVG geometry attributes. */}
        <g clipPath={`url(#sc${uid})`}>
          <g style={{
            transform:`translate(${W/2}px, ${sunCenterY}px)`,
            transition:"transform 1s linear",
            willChange:"transform",
          }}>
            {/* Sun rays — clear visible beams radiating from the sun */}
            {raysOpacity>0&&sunVisible&&(
              <g style={{opacity:raysOpacity,transition:"opacity 1s linear"}}>
                <g style={{
                  animation:"sunRaysSlow 280s linear infinite, sunRaysPulse 6s ease-in-out infinite",
                  transformOrigin:"0 0",
                  willChange:"transform, opacity",
                }}>
                  {Array.from({length:12}).map((_,i)=>{
                    const ang=(i/12)*Math.PI*2;
                    const r1=sunR*1.35;
                    const r2=sunR*(2.55+(i%3)*0.25);
                    return(
                      <line
                        key={i}
                        x1={r1*Math.cos(ang)}
                        y1={r1*Math.sin(ang)}
                        x2={r2*Math.cos(ang)}
                        y2={r2*Math.sin(ang)}
                        stroke={sunMid}
                        strokeWidth={i%2===0?2:1.4}
                        strokeLinecap="round"
                        opacity={0.85}
                      />
                    );
                  })}
                </g>
              </g>
            )}

            {/* Sun halo — soft breathing */}
            <g style={{animation:"sunPastelHalo 7s ease-in-out infinite",transformOrigin:"0 0",willChange:"transform, opacity"}}>
              <circle cx={0} cy={0} r={glowR} fill={`url(#glow${uid})`}/>
            </g>

            {/* Sun disc — quiet breathing */}
            {sunVisible&&(
              <g style={{animation:"sunPastelBreath 8s ease-in-out infinite",transformOrigin:"0 0",willChange:"transform"}}>
                <circle cx={0} cy={0} r={sunR} fill={`url(#sun${uid})`}/>
              </g>
            )}
          </g>
        </g>

        {/* Water — clean gradient */}
        <rect x={0} y={horizonY} width={W} height={H-horizonY} fill={`url(#wtr${uid})`} style={{transition:tCol}}/>

        {/* Three minimal horizontal ripple lines — barely-there texture */}
        <g clipPath={`url(#wc${uid})`} opacity={0.35}>
          {[0.25, 0.50, 0.75].map((y,i)=>{
            const yy=horizonY+(H-horizonY)*y;
            return(
              <line
                key={i}
                x1={W*0.08}
                y1={yy}
                x2={W*0.92}
                y2={yy}
                stroke={progress<0.78?"rgba(255,255,255,0.55)":"rgba(220,225,240,0.4)"}
                strokeWidth={0.6}
                strokeLinecap="round"
                opacity={0.7-i*0.18}
                style={{
                  animation:`${i%2===0?"sunPastelRipple0":"sunPastelRipple1"} ${5+i*0.6}s ease-in-out ${-i*0.4}s infinite`,
                  willChange:"transform",
                  transition:"stroke 1s linear",
                }}
              />
            );
          })}
        </g>

        {/* Sun reflection on water — appears when sun nears horizon */}
        {reflectionStrength>0&&(
          <g clipPath={`url(#wc${uid})`} style={{opacity:reflectionStrength,transition:"opacity 1s linear"}}>
            <g style={{animation:"sunPastelRefl 4s ease-in-out infinite",transformOrigin:`${W/2}px ${horizonY+sunR}px`,willChange:"transform, opacity"}}>
              {/* Vertical reflection column — soft and clean */}
              <ellipse
                cx={W/2}
                cy={horizonY+sunR*0.9}
                rx={sunR*0.85}
                ry={sunR*1.2}
                fill={`url(#refl${uid})`}
              />
              {/* Two soft horizontal shimmers within the reflection */}
              <line
                x1={W/2-sunR*0.8}
                y1={horizonY+sunR*0.5}
                x2={W/2+sunR*0.8}
                y2={horizonY+sunR*0.5}
                stroke={sunCenter}
                strokeWidth={1.2}
                strokeLinecap="round"
                opacity={0.55}
                style={{transition:"stroke 1s linear"}}
              />
              <line
                x1={W/2-sunR*0.6}
                y1={horizonY+sunR*1.0}
                x2={W/2+sunR*0.6}
                y2={horizonY+sunR*1.0}
                stroke={sunCenter}
                strokeWidth={0.9}
                strokeLinecap="round"
                opacity={0.35}
                style={{transition:"stroke 1s linear"}}
              />
            </g>
          </g>
        )}

        {/* Soft horizon hairline — barely visible separator */}
        <line x1={0} y1={horizonY} x2={W} y2={horizonY} stroke="rgba(31,27,46,0.06)" strokeWidth={0.5}/>

        {/* Time label */}
        <text
          x={W/2} y={H-12}
          textAnchor="middle"
          style={{
            fontSize:Math.round(size*0.065),
            fontWeight:500,
            fill:progress<0.7?"rgba(31,27,46,0.55)":"rgba(255,255,255,0.85)",
            fontFamily:G.serif,
            fontVariantNumeric:"tabular-nums",
            letterSpacing:0.5,
            transition:"fill 1s linear",
          }}
        >{c.label}</text>
      </svg>
      {showCtrl&&<TCtrl c={c} color={color} t={t}/>}
    </div>
  );
}

/* ═══ LAVA ═══ */
function LavaTimer({totalSec,color,t,autoRun=false,size=240,showCtrl=true}){
  const c=useTimer(totalSec,autoRun);
  if(c.done) return <DoneBadge color={color} t={t}/>;
  const W=Math.round(size*0.52), H=size;
  const lavaTop=H*(1-c.pct);
  const[blobs,setBlobs]=useState([{id:1,x:.5,y:.72,r:.2,vx:.003,vy:-.004},{id:2,x:.32,y:.55,r:.16,vx:.004,vy:.003},{id:3,x:.68,y:.62,r:.13,vx:-.003,vy:-.003},{id:4,x:.5,y:.86,r:.11,vx:.002,vy:-.002}]);
  const[,tick]=useState(0);
  useEffect(()=>{if(!c.run)return;const id=setInterval(()=>{setBlobs(bs=>bs.map(b=>{let nx=b.x+b.vx,ny=b.y+b.vy,vx=b.vx,vy=b.vy;if(nx<.14||nx>.86){vx=-vx;nx=Math.max(.14,Math.min(.86,nx));}const mn=1-c.pct+0.04;if(ny<mn||ny>.93){vy=-vy;ny=Math.max(mn,Math.min(.93,ny));}return{...b,x:nx,y:ny,vx,vy};}));tick(x=>x+1);},80);return()=>clearInterval(id);},[c.run,c.pct]);
  const bottle=`M${W*.22},${H*.05} Q${W*.5},${H*.02} ${W*.78},${H*.05} L${W*.74},${H*.2} Q${W*.9},${H*.32} ${W*.9},${H*.52} L${W*.84},${H*.82} Q${W*.78},${H*.93} ${W*.5},${H*.96} Q${W*.22},${H*.93} ${W*.16},${H*.82} L${W*.1},${H*.52} Q${W*.1},${H*.32} ${W*.26},${H*.2} Z`;
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <clipPath id={`lc${size}`}><path d={bottle}/></clipPath>
          <linearGradient id={`lg${size}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.45"/><stop offset="100%" stopColor={color} stopOpacity="0.92"/></linearGradient>
          <linearGradient id={`bg${size}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9"/><stop offset="50%" stopColor="#FAF8FE"/><stop offset="100%" stopColor="#F0EDF8" stopOpacity="0.85"/></linearGradient>
        </defs>
        <path d={bottle} fill={`url(#bg${size})`} stroke={`${color}66`} strokeWidth={2}/>
        <g clipPath={`url(#lc${size})`}>
          <rect x={0} y={lavaTop} width={W} height={H-lavaTop} fill={`url(#lg${size})`}/>
          {blobs.map(b=><ellipse key={b.id} cx={b.x*W} cy={b.y*H} rx={b.r*W} ry={b.r*W*1.3} fill={color} opacity={0.7}/>)}
          <ellipse cx={W*.28} cy={H*.4} rx={W*.05} ry={H*.12} fill="rgba(255,255,255,.25)" transform={`rotate(-12,${W*.28},${H*.4})`}/>
        </g>
        <rect x={W*.27} y={H*.01} width={W*.46} height={H*.06} rx={4} fill="#C4BFDB"/>
        <rect x={W*.27} y={H*.92} width={W*.46} height={H*.06} rx={4} fill="#C4BFDB"/>
      </svg>
      <div style={{fontFamily:G.serif,fontWeight:600,fontSize:size*0.085,color:G.ink,letterSpacing:1,fontVariantNumeric:"tabular-nums"}}>{c.label}</div>
      <WindDownHint secs={c.secs} color={color} t={t}/>
      {showCtrl&&<TCtrl c={c} color={color} t={t}/>}
    </div>
  );
}

function TimerComp({type,totalSec,color,t,autoRun=false,size=240,showCtrl=true}){
  const M={sector:SectorTimer,ring:RingTimer,dots:DotsTimer,wave:WaveTimer,sun:SunTimer,lava:LavaTimer};
  const Comp=M[type]||SectorTimer;
  return <Comp totalSec={totalSec} color={color} t={t} autoRun={autoRun} size={size} showCtrl={showCtrl}/>;
}

function FullTimer({type,totalSec,color,t,autoRun,onClose,activity}){
  // Compute size from actual rendered viewport — if FullTimer's fixed positioning
  // is constrained by a parent with transform/will-change, it inherits that container.
  // Be defensive: measure actual viewport AND deduct header/nav heights generously.
  // When activity header is shown, deduct extra ~80px for emoji + name + spacing.
  const headerSpace=activity?80:0;
  const[size,setSize]=useState(()=>{
    if(typeof window==="undefined") return 220;
    const vw=Math.min(window.innerWidth, 480); // app is capped at 480
    const vh=window.innerHeight;
    // Reservations: header (~110) + digits (~70) + controls (~110) + paddings (~80) + optional activity card
    const maxByHeight=Math.max(160,vh-380-headerSpace);
    const maxByWidth=Math.max(160,vw-72);
    return Math.min(300, Math.min(maxByHeight,maxByWidth));
  });
  useEffect(()=>{
    const onResize=()=>{
      const vw=Math.min(window.innerWidth, 480);
      const vh=window.innerHeight;
      const maxByHeight=Math.max(160,vh-380-headerSpace);
      const maxByWidth=Math.max(160,vw-72);
      setSize(Math.min(300, Math.min(maxByHeight,maxByWidth)));
    };
    window.addEventListener("resize",onResize);
    window.addEventListener("orientationchange",onResize);
    return()=>{
      window.removeEventListener("resize",onResize);
      window.removeEventListener("orientationchange",onResize);
    };
  },[headerSpace]);
  return(
    <div style={{position:"fixed",inset:0,zIndex:9700,background:"#FFFFFF",backgroundImage:`linear-gradient(165deg,${SCREENS.timer.hb} 0%,#FFFFFF 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 20px 36px",gap:22,animation:"ftIn .25s ease"}}>
      <style>{`
        @keyframes ftIn{from{opacity:0}to{opacity:1}}
        @keyframes ftActIn{0%{opacity:0;transform:translateY(-8px) scale(0.96)}100%{opacity:1;transform:translateY(0) scale(1)}}
      `}</style>
      <button onClick={onClose} style={{position:"absolute",top:20,right:20,width:42,height:42,borderRadius:21,border:`1px solid ${G.border}`,background:G.white,color:G.ink2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:sh.sm,zIndex:2}}><IconX size={14}/></button>
      {/* Activity context — emoji + name shown above the timer so the user always knows what they're timing */}
      {activity&&(
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 18px 12px 14px",background:G.white,borderRadius:22,boxShadow:`0 8px 22px ${activity.color}1F, 0 2px 6px rgba(31,27,46,0.06)`,border:`1px solid ${activity.color}30`,maxWidth:"calc(100% - 40px)",animation:"ftActIn 0.5s 0.15s cubic-bezier(0.32, 0.72, 0, 1) both"}}>
          <div style={{
            width:42,height:42,borderRadius:13,
            background:activity.photo?"transparent":`linear-gradient(140deg,${activity.color}25,${activity.color}45)`,
            border:`1px solid ${activity.color}30`,
            overflow:"hidden",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:24,flexShrink:0,
          }}>
            {activity.photo?<img src={activity.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:activity.emoji}
          </div>
          <div style={{minWidth:0,flex:1}}>
            <div style={{fontFamily:G.serif,fontWeight:600,fontSize:15,color:G.ink,letterSpacing:-.2,lineHeight:1.15,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{activity.name}</div>
            <div style={{fontFamily:G.font,fontWeight:500,fontSize:11,color:activity.color,marginTop:2,letterSpacing:.3}}>{fmtT(activity.time,t)}</div>
          </div>
        </div>
      )}
      <TimerComp type={type} totalSec={totalSec} color={color} t={t} autoRun={autoRun} size={size}/>
    </div>
  );
}

/* ═══ Thumbnail (static, for previews) — shows FULL state for clean look ═══ */
function TimerThumb({type,color,size=120,min=30}){
  if(type==="sector"){
    const cx=size/2, cy=size/2, R=size/2-8;
    // Match the live timer's layout: sector innermost, ticks middle, numbers outer
    const sectorR=R*0.62;
    const tickInnerR=R*0.67, tickOuterR=R*0.75;
    const numR=R-9;
    const totalMin=Math.max(1,Math.round(min));
    let step;
    if(totalMin<=5) step=1;
    else if(totalMin<=15) step=3;
    else if(totalMin<=30) step=5;
    else if(totalMin<=60) step=10;
    else step=15;
    const nums=[];
    for(let m=step; m<totalMin; m+=step) nums.push(m);
    return(
      <div style={{padding:8,borderRadius:size*0.13,background:`linear-gradient(155deg,${color},${color}D0)`,boxShadow:`0 6px 18px ${color}40`}}>
        <div style={{padding:6,borderRadius:size*0.105,background:"#fff"}}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <defs>
              <radialGradient id={`thumbSect${size}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={color} stopOpacity="0.96"/>
                <stop offset="100%" stopColor={color} stopOpacity="0.85"/>
              </radialGradient>
            </defs>
            <circle cx={cx} cy={cy} r={R} fill="#FEFEFE"/>
            {/* FULL sector — always at 100% in preview */}
            <circle cx={cx} cy={cy} r={sectorR} fill={`url(#thumbSect${size})`}/>
            {/* Major ticks aligned with numbers */}
            {nums.map(m=>{
              const th=(m/totalMin)*2*Math.PI;
              const x1=cx-tickInnerR*Math.sin(th), y1=cy-tickInnerR*Math.cos(th);
              const x2=cx-tickOuterR*Math.sin(th), y2=cy-tickOuterR*Math.cos(th);
              return <line key={'mj'+m} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1F1B2E" strokeWidth={1.5} strokeLinecap="round"/>;
            })}
            {/* Numbers at outer edge */}
            {nums.map(m=>{
              const th=(m/totalMin)*2*Math.PI;
              const x=cx-numR*Math.sin(th), y=cy-numR*Math.cos(th);
              return <text key={'n'+m} x={x} y={y} textAnchor="middle" dominantBaseline="central" style={{fontSize:Math.round(size*0.085),fontWeight:700,fill:"#1F1B2E",fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',fontStyle:"normal"}}>{m}</text>;
            })}
            {/* Spindle */}
            <circle cx={cx} cy={cy} r={size*0.05} fill="#FFFFFF" stroke="#1F1B2E" strokeWidth={1.2}/>
            <circle cx={cx} cy={cy} r={size*0.022} fill="#1F1B2E"/>
          </svg>
        </div>
      </div>
    );
  }
  if(type==="ring"){
    // Match donut style: full ring with hollow center
    const cx=size/2, cy=size/2;
    const Ro=size/2-6;
    const Ri=Ro*0.58;
    return(
      <div style={{padding:5,borderRadius:"50%",background:"linear-gradient(160deg,#FBFAFE,#F0EEF8)",boxShadow:"0 6px 18px rgba(31,27,46,.08)",border:`1px solid ${G.border}`}}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={cx} cy={cy} r={Ro} fill="#FFFFFF" stroke={G.border} strokeWidth={1}/>
          <circle cx={cx} cy={cy} r={Ro} fill={color} opacity="0.94"/>
          <circle cx={cx} cy={cy} r={Ri} fill="#FFFFFF" stroke={G.border} strokeWidth={0.5}/>
        </svg>
      </div>
    );
  }
  if(type==="dots"){
    const tot=10, active=7;
    const led=size>140?14:11, gap=Math.max(3,Math.round(led*0.45));
    const padV=Math.max(10,Math.round(led*0.7)), padH=Math.max(12,Math.round(led*0.8));
    return(
      <div style={{display:"flex",flexDirection:"row",alignItems:"center",justifyContent:"center",gap,padding:`${padV}px ${padH}px`,background:`linear-gradient(180deg, #FCFAFD 0%, #F4F1F8 50%, #FCFAFD 100%)`,borderRadius:Math.round(led*0.95),boxShadow:`0 6px 18px ${color}18, 0 1.5px 4px rgba(31,27,46,0.04), inset 0 1.5px 0 rgba(255,255,255,1), inset 0 -1px 0 ${color}10`,border:`1px solid ${color}1A`}}>
        {Array.from({length:tot}).map((_,i)=>{
          const on=i<active;
          return(
            <div key={i} style={{
              width:led,height:led,borderRadius:"50%",flexShrink:0,
              background: on
                ? `radial-gradient(circle at 38% 26%, #FFFFFF 0%, ${color}FA 16%, ${color} 58%, ${color}C8 100%)`
                : `radial-gradient(circle at 50% 50%, ${color}14 0%, ${color}08 100%)`,
              boxShadow: on
                ? `0 ${led*0.10}px ${led*0.35}px ${color}55, 0 ${led*0.03}px ${led*0.08}px ${color}80, inset 0 -${led*0.16}px ${led*0.20}px ${color}A0, inset 0 ${led*0.08}px ${led*0.12}px rgba(255,255,255,0.55)`
                : `inset 0 1px 1.5px rgba(31,27,46,0.04), inset 0 -1px 1px ${color}12`,
              border: on ? "none" : `1px solid ${color}25`,
            }}/>
          );
        })}
      </div>
    );
  }
  if(type==="wave"){
    const W=size, H=Math.round(size*0.65);
    return(<div style={{borderRadius:18,overflow:"hidden",width:W,height:H,background:`${color}10`,border:`1px solid ${color}30`}}><svg width={W} height={H}><defs><linearGradient id="wt" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.5"/><stop offset="100%" stopColor={color} stopOpacity="0.9"/></linearGradient></defs><path d={`M0,${H*0.35} ${Array.from({length:W+1}).map((_,x)=>`L${x},${H*0.35+Math.sin(x*0.1)*7}`).join(" ")} L${W},${H} L0,${H} Z`} fill="url(#wt)"/></svg></div>);
  }
  if(type==="sun"){
    const W=size, H=Math.round(size*0.78);
    const horizonY=Math.round(H*0.62);
    const sunR=Math.round(size*0.13);
    const sunY=Math.round(H*0.46);
    return(
      <svg width={W} height={H} style={{borderRadius:18,overflow:"hidden",border:`1px solid ${G.border}`,boxShadow:"0 8px 24px rgba(31,27,46,0.08), 0 2px 6px rgba(31,27,46,0.04)"}}>
        <defs>
          {/* Soft pastel sky — peach to dusty rose */}
          <linearGradient id={`thumbSky${size}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(30, 50%, 88%)"/>
            <stop offset="60%" stopColor="hsl(20, 55%, 82%)"/>
            <stop offset="100%" stopColor="hsl(10, 50%, 76%)"/>
          </linearGradient>
          {/* Sun — soft pastel disc */}
          <radialGradient id={`thumbSun${size}`} cx="42%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95"/>
            <stop offset="35%" stopColor="hsl(38, 70%, 92%)"/>
            <stop offset="75%" stopColor="hsl(28, 62%, 80%)"/>
            <stop offset="100%" stopColor="hsl(18, 55%, 68%)"/>
          </radialGradient>
          {/* Halo — pure soft glow */}
          <radialGradient id={`thumbGlow${size}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(28, 62%, 80%)" stopOpacity="0.4"/>
            <stop offset="50%" stopColor="hsl(18, 55%, 68%)" stopOpacity="0.15"/>
            <stop offset="100%" stopColor="hsl(18, 55%, 68%)" stopOpacity="0"/>
          </radialGradient>
          {/* Water — desaturated pastel */}
          <linearGradient id={`thumbWater${size}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(10, 30%, 60%)"/>
            <stop offset="100%" stopColor="hsl(15, 25%, 42%)"/>
          </linearGradient>
          {/* Reflection */}
          <linearGradient id={`thumbRefl${size}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(28, 62%, 80%)" stopOpacity="0.5"/>
            <stop offset="100%" stopColor="hsl(28, 62%, 80%)" stopOpacity="0"/>
          </linearGradient>
          {/* Subtle horizon glow */}
          <linearGradient id={`thumbHGlow${size}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(20, 60%, 82%)" stopOpacity="0"/>
            <stop offset="100%" stopColor="hsl(14, 65%, 76%)" stopOpacity="0.55"/>
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect x={0} y={0} width={W} height={horizonY} fill={`url(#thumbSky${size})`}/>

        {/* Horizon glow band */}
        <rect x={0} y={horizonY-H*0.18} width={W} height={H*0.18} fill={`url(#thumbHGlow${size})`}/>

        {/* Sun glow halo */}
        <circle cx={W/2} cy={sunY} r={sunR*2.2} fill={`url(#thumbGlow${size})`}/>

        {/* The sun — minimal, clean disc */}
        <circle cx={W/2} cy={sunY} r={sunR} fill={`url(#thumbSun${size})`}/>

        {/* Water */}
        <rect x={0} y={horizonY} width={W} height={H-horizonY} fill={`url(#thumbWater${size})`}/>

        {/* Sun reflection — soft column */}
        <ellipse cx={W/2} cy={horizonY+H*0.06} rx={sunR*0.85} ry={H*0.07} fill={`url(#thumbRefl${size})`}/>

        {/* Three minimal water ripple lines */}
        <line x1={W*0.20} y1={horizonY+H*0.10} x2={W*0.80} y2={horizonY+H*0.10} stroke="rgba(255,255,255,0.4)" strokeWidth={0.6} strokeLinecap="round"/>
        <line x1={W*0.15} y1={horizonY+H*0.17} x2={W*0.85} y2={horizonY+H*0.17} stroke="rgba(255,255,255,0.3)" strokeWidth={0.6} strokeLinecap="round"/>
        <line x1={W*0.25} y1={horizonY+H*0.24} x2={W*0.75} y2={horizonY+H*0.24} stroke="rgba(255,255,255,0.2)" strokeWidth={0.6} strokeLinecap="round"/>

        {/* Soft horizon hairline */}
        <line x1={0} y1={horizonY} x2={W} y2={horizonY} stroke="rgba(31,27,46,0.06)" strokeWidth={0.5}/>
      </svg>
    );
  }
  if(type==="lava"){
    const W=Math.round(size*0.52), H=size;
    const bot=`M${W*0.22},${H*0.05} Q${W*0.5},${H*0.02} ${W*0.78},${H*0.05} L${W*0.74},${H*0.2} Q${W*0.9},${H*0.32} ${W*0.9},${H*0.52} L${W*0.84},${H*0.82} Q${W*0.78},${H*0.93} ${W*0.5},${H*0.96} Q${W*0.22},${H*0.93} ${W*0.16},${H*0.82} L${W*0.1},${H*0.52} Q${W*0.1},${H*0.32} ${W*0.26},${H*0.2} Z`;
    return(<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}><defs><clipPath id="lt"><path d={bot}/></clipPath><linearGradient id="ll" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.45"/><stop offset="100%" stopColor={color} stopOpacity="0.9"/></linearGradient></defs><path d={bot} fill="#FAF8FE" stroke={`${color}66`} strokeWidth={2}/><g clipPath="url(#lt)"><rect x={0} y={H*0.4} width={W} height={H*0.56} fill="url(#ll)"/><ellipse cx={W*0.5} cy={H*0.62} rx={W*0.2} ry={H*0.07} fill={color} opacity={0.7}/></g><rect x={W*0.27} y={H*0.01} width={W*0.46} height={H*0.06} rx={4} fill="#C4BFDB"/><rect x={W*0.27} y={H*0.92} width={W*0.46} height={H*0.06} rx={4} fill="#C4BFDB"/></svg>);
  }
  return <div style={{fontSize:size*0.36,textAlign:"center"}}>{TICON[type]||"⏱"}</div>;
}

/* ═══ Sigvard lamps ═══ */
/* ═══ Sigvard timeline — 24h day clock ═══
   Tick model (strict):
   - 48 lamps, one per 30-min tick across the full day (00:00 … 23:30)
   - yForLamp(i) = vertical center of the lamp marking minute i*30
   - yForTime(min) = where the now-line sits for any minute of the day
   - By construction: yForTime(i*SIGVARD_MIN_PER_LAMP) === yForLamp(i)
     so the line and lamp positions are pixel-locked.

   Lit/dark logic — strict tick boundary:
   - Past (dark): the moment the line crosses the lamp's centre, the lamp
     goes dark. No lit lamp ever sits ABOVE the descending line.
   - Now (bright + pulsing): the lamp the line is APPROACHING from above —
     within ½ step (15 min) of the lamp's centre. Signals what's coming next.
   - Future (calm lit): everything below the "approaching" window.
*/
const SIGVARD_MIN_PER_LAMP=30; // 30 minutes per lamp → 48 lamps total
const SIGVARD_LAMP=8, SIGVARD_GAP=42, SIGVARD_PAD_V=14;
const SIGVARD_STEP=SIGVARD_LAMP+SIGVARD_GAP;
const SIGVARD_TOTAL_LAMPS=Math.ceil(24*60/SIGVARD_MIN_PER_LAMP);
const SIGVARD_HALF_STEP_MIN=SIGVARD_MIN_PER_LAMP/2;
// Vertical center of lamp i (relative to lamps container top) in px
const yForLamp=(i)=>SIGVARD_PAD_V+i*SIGVARD_STEP+SIGVARD_LAMP/2;
// Vertical center for any time (minutes-of-day) — clamped to the lamp column.
// At minute i*30 this equals yForLamp(i) exactly.
const yForTime=(min)=>{
  const clamped=Math.max(0,Math.min(24*60,min));
  const lampIdx=clamped/SIGVARD_MIN_PER_LAMP;
  return SIGVARD_PAD_V+lampIdx*SIGVARD_STEP+SIGVARD_LAMP/2;
};
const SIGVARD_TOTAL_HEIGHT=SIGVARD_PAD_V*2+SIGVARD_TOTAL_LAMPS*SIGVARD_LAMP+(SIGVARD_TOTAL_LAMPS-1)*SIGVARD_GAP;

function SigvardTimeline({now,color="#FF4848"}){
  const nowM=now.getHours()*60+now.getMinutes()+now.getSeconds()/60;
  // Pre-compute color variants once per render — used for all 48 lamps.
  const cLight=shade(color,0.18); // inner highlight of the radial gradient
  const cDeep =shade(color,-0.45); // outer/edge of the lit gradient
  const cBorder=withAlpha(color,0.35);
  // Unique animation name so multiple Sigvard columns with different colors don't fight
  const animId=`lampNow_${color.replace("#","")}`;
  // a11y: announce current time once, since the lamps themselves are decorative
  const hh=String(now.getHours()).padStart(2,"0");
  const mm=String(now.getMinutes()).padStart(2,"0");
  return(
    <div role="img" aria-label={`Tidslinje, klockan är ${hh}:${mm}`} style={{display:"flex",alignItems:"stretch",gap:4,flexShrink:0,alignSelf:"flex-start"}}>
      <style>{`@keyframes ${animId}{0%,100%{box-shadow:0 0 10px ${withAlpha(color,0.67)}, 0 0 20px ${withAlpha(color,0.4)};transform:scale(1)}50%{box-shadow:0 0 18px ${withAlpha(color,0.87)}, 0 0 32px ${withAlpha(color,0.6)}, 0 0 48px ${withAlpha(color,0.27)};transform:scale(1.18)}}`}</style>
      <div aria-hidden="true" style={{
        display:"flex",flexDirection:"column",alignItems:"center",
        padding:`${SIGVARD_PAD_V}px 6px`,
        background:`linear-gradient(180deg, ${G.white} 0%, #FBFAFE 100%)`,
        borderRadius:14,
        boxShadow:"0 4px 18px rgba(31,27,46,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
        border:`1px solid ${G.border}`,
        minWidth:28,flexShrink:0,
      }}>
        {Array.from({length:SIGVARD_TOTAL_LAMPS}).map((_,i)=>{
          const lampMin=i*SIGVARD_MIN_PER_LAMP;
          // Strict tick model — the user's mental model:
          //   • Past: line has crossed the lamp's centre, even by a fraction
          //     of a minute → lamp goes DARK immediately. No lit lamp above
          //     the descending line, ever.
          //   • Now: line is APPROACHING this lamp (within ½ step below it)
          //     → lamp pulses brightly, signalling what's coming next.
          //   • Future: everything else → calm lit.
          const isPast=nowM > lampMin;
          const isNow =!isPast && (lampMin - nowM) <= SIGVARD_HALF_STEP_MIN;
          return <div key={i} style={{
            width:SIGVARD_LAMP,height:SIGVARD_LAMP,borderRadius:"50%",
            marginBottom:i===SIGVARD_TOTAL_LAMPS-1?0:SIGVARD_GAP,
            background:isPast
              ?"radial-gradient(circle at 30% 30%, #4A4258, #1F1B2E)"
              :(isNow
                ?`radial-gradient(circle at 30% 30%, ${cLight}, ${color})`
                :`radial-gradient(circle at 30% 30%, ${color}, ${cDeep})`),
            boxShadow:isPast
              ?"inset 0 1px 2px rgba(0,0,0,.6), 0 0 0 1px rgba(0,0,0,.1)"
              :(isNow?undefined:`0 0 6px ${withAlpha(color,0.6)}, inset 0 -1px 1px rgba(0,0,0,0.15)`),
            border:`1px solid ${isPast?"#2C2640":cBorder}`,
            transition:"background .4s, box-shadow .4s, border-color .4s",
            animation:isNow?`${animId} 2.4s ease-in-out infinite`:undefined,
          }}/>;
        })}
      </div>
    </div>
  );
}

/* ═══ Timeline view: Sigvard + activities scroll together, auto-scroll to "now" ═══ */
function TimelineView({acts,isEd,cfg,t,onTap,onEdit,onMarkDone,now}){
  const scrollRef=useRef(null);
  const cardRefs=useRef({});
  const[measured,setMeasured]=useState({});
  const nowM=now.getHours()*60+now.getMinutes();

  useEffect(()=>{
    if(!scrollRef.current) return;
    const nowY=yForTime(nowM);
    const viewH=scrollRef.current.clientHeight;
    const targetScroll=Math.max(0,nowY-viewH/3);
    scrollRef.current.scrollTop=targetScroll;
  // eslint-disable-next-line
  },[]);

  // Measure each card's actual rendered height with ResizeObserver
  useEffect(()=>{
    const ro=new ResizeObserver(entries=>{
      const updates={};
      entries.forEach(e=>{
        const id=e.target.getAttribute("data-act-id");
        if(id) updates[id]=e.contentRect.height;
      });
      if(Object.keys(updates).length){
        setMeasured(m=>({...m,...updates}));
      }
    });
    Object.values(cardRefs.current).forEach(el=>el&&ro.observe(el));
    return()=>ro.disconnect();
  },[acts,cfg.cardStyle]);

  const sorted=[...acts].sort((a,b)=>hm(a.time)-hm(b.time));
  const fallbackH=cfg.cardStyle==="compact"?68:cfg.cardStyle==="big"?180:84;
  const MIN_GAP=10;
  const positions=[];
  let prevBottom=-Infinity;
  for(const item of sorted){
    const startM=hm(item.time);
    // Card TOP aligns with start time (small offset so first row of text matches the time)
    const naturalY=yForTime(startM)-4;
    const y=Math.max(naturalY,prevBottom+MIN_GAP);
    const h=measured[item.id]||fallbackH;
    positions.push({item,y,naturalY,h});
    prevBottom=y+h;
  }
  const totalContentH=Math.max(SIGVARD_TOTAL_HEIGHT,prevBottom+30);

  // Find next upcoming activity for the banner
  const upcoming=sorted.filter(a=>{
    const start=hm(a.time), end=a.endTime?hm(a.endTime):start+30;
    return end>nowM;
  });
  const currentAct=upcoming.find(a=>{
    const start=hm(a.time), end=a.endTime?hm(a.endTime):start+30;
    return start<=nowM && nowM<end;
  });
  const nextAct=currentAct ? upcoming.find(a=>hm(a.time)>nowM) : upcoming[0];
  const hh=String(now.getHours()).padStart(2,"0");
  const mm=String(now.getMinutes()).padStart(2,"0");
  const target = currentAct || nextAct;
  const jumpToTarget=()=>{
    if(!scrollRef.current||!target) return;
    const targetY=yForTime(hm(target.time))-4;
    scrollRef.current.scrollTo({top:Math.max(0,targetY-80),behavior:"smooth"});
  };

  /* ───────── Viewport-vs-target tracking ─────────
     Two independent UI signals derived from scroll + target position:

     (1) targetInView — is the target activity currently visible on screen?
         Drives the compact "Nästa"-pill: it should appear ONLY when the
         user is looking at an empty stretch of the day (target off-screen)
         and offer a shortcut to jump to it. Once they've scrolled to where
         the activity is, the pill must disappear — otherwise it visually
         overlaps the actual activity tile (the bug we're fixing).

     (2) bannerCollide — would the full top banner visually overlap the
         target activity tile? The banner is sticky-positioned at the top
         of the scroller, so a tile that has scrolled up to the top edge
         is essentially "under" the banner. When that happens, the banner
         dims away so the tile breathes — but it returns once the user
         scrolls past again, keeping it as a standing presence. */
  const[targetInView,setTargetInView]=useState(false);
  // Target is BELOW the current viewport — the user hasn't scrolled to it yet.
  // The smart-shortcut banner only appears in this case: its purpose is to
  // help the user navigate DOWN to the schedule. If the target is above the
  // viewport (user has consciously scrolled past it), the banner stays quiet
  // — popping back up would feel like the app second-guessing the user.
  const[targetBelow,setTargetBelow]=useState(false);
  const[bannerCollide,setBannerCollide]=useState(false);
  // Latest target position kept in a ref so the scroll listener (set up once)
  // can read current values without re-attaching on every render.
  const targetMetaRef=useRef({y:-99999,h:0});
  useEffect(()=>{
    const pos=target?positions.find(p=>p.item.id===target.id):null;
    targetMetaRef.current={y:pos?.y??-99999,h:pos?.h??0};
  });
  useEffect(()=>{
    if(!scrollRef.current) return;
    const scroller=scrollRef.current;
    const BANNER_H=110; // banner zone at top of scroller (sticky banner ~90 + margin)
    const check=()=>{
      const{y,h}=targetMetaRef.current;
      if(y<-9000){setTargetInView(false);setTargetBelow(false);setBannerCollide(false);return;}
      const top=scroller.scrollTop;
      const viewH=scroller.clientHeight;
      // Target activity overlaps the comfortable visible band of the viewport.
      // Comfortable band excludes the banner zone at top and a small bottom margin.
      const inView=(y+h)>top+50 && y<(top+viewH-30);
      setTargetInView(inView);
      // Target is positioned BELOW the visible viewport — user needs to scroll
      // down to reach it. Only this case warrants the smart-shortcut banner.
      setTargetBelow(y>=top+viewH-30);
      // Target overlaps the banner's sticky zone (top of the scroller).
      // When the activity tile crosses into the banner area, the banner dims.
      const collide=(y-top)<BANNER_H && (y+h-top)>0;
      setBannerCollide(collide);
    };
    check();
    scroller.addEventListener("scroll",check,{passive:true});
    window.addEventListener("resize",check);
    return()=>{
      scroller.removeEventListener("scroll",check);
      window.removeEventListener("resize",check);
    };
  },[]);

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",position:"relative",minHeight:0}}>
      {/* ═══════════════ Mode A: SMART SHORTCUT (default — banner toggle OFF) ═══════════════
          The wide top banner here acts as a directional pop-up: visible only
          when the target activity is BELOW the viewport, i.e. the user needs
          to scroll DOWN to reach it. Once the target is in view (or above,
          meaning the user has consciously scrolled past), the banner stays
          quiet. Popping back up after the user has passed something would
          feel like the app second-guessing the user. */}
      {!isEd&&cfg.showBanner===false&&target&&(()=>{
        const show=targetBelow;
        return(
        <div style={{position:"sticky",top:0,zIndex:10,maxHeight:show?90:0,opacity:show?1:0,overflow:"hidden",transition:"max-height 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease",pointerEvents:show?"auto":"none"}}>
        <button onClick={jumpToTarget} className="lt-press-soft" style={{margin:"10px 14px 0",padding:"10px 14px",borderRadius:14,border:`1px solid ${G.border}`,background:"linear-gradient(135deg,#FFFFFF 0%, #FCFAFE 60%, #F8F5FC 100%)",boxShadow:"0 4px 14px rgba(31,27,46,0.05), inset 0 1px 0 rgba(255,255,255,0.95)",display:"flex",alignItems:"center",gap:10,cursor:"pointer",textAlign:"left",transition:"transform .26s cubic-bezier(0.32, 0.72, 0, 1), box-shadow .2s",overflow:"hidden",width:"calc(100% - 28px)",position:"relative"}}>
          <style>{`@keyframes bannerSweep{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}`}</style>
          {/* Subtle shimmer overlay */}
          <div style={{position:"absolute",inset:0,background:`linear-gradient(105deg, transparent 30%, ${SCREENS.home.h}0D 50%, transparent 70%)`,animation:"bannerSweep 6s ease-in-out infinite",pointerEvents:"none"}}/>
          <div style={{flex:1,minWidth:0,position:"relative",zIndex:1}}>
            {currentAct ? (
              <>
                <div style={{fontFamily:G.font,fontWeight:500,fontSize:9.5,color:G.ink3,letterSpacing:1.4,textTransform:"uppercase",lineHeight:1,opacity:.7}}>{t.bannerNowOngoing}</div>
                <div style={{fontFamily:G.serif,fontWeight:600,fontSize:15,color:G.ink2,letterSpacing:0.1,marginTop:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",lineHeight:1.15}}>{currentAct.name}</div>
              </>
            ) : nextAct ? (
              <>
                <div style={{fontFamily:G.font,fontWeight:500,fontSize:9.5,color:G.ink3,letterSpacing:1.4,textTransform:"uppercase",lineHeight:1,opacity:.7}}>{t.bannerNextUp}</div>
                <div style={{fontFamily:G.serif,fontWeight:600,fontSize:15,color:G.ink2,letterSpacing:0.1,marginTop:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",lineHeight:1.15}}>{nextAct.name}</div>
              </>
            ) : (
              <>
                <div style={{fontFamily:G.font,fontWeight:500,fontSize:9.5,color:G.ink3,letterSpacing:1.4,textTransform:"uppercase",lineHeight:1,opacity:.7}}>{t.bannerDayLabel}</div>
                <div style={{fontFamily:G.serif,fontWeight:600,fontSize:14,color:G.ink3,marginTop:4,lineHeight:1.15}}>{t.bannerNoActsLeft}</div>
              </>
            )}
          </div>
          <span style={{color:G.ink3,flexShrink:0,position:"relative",zIndex:1,opacity:.7,display:"inline-flex",alignItems:"center",animation:"bannerChev 2.6s ease-in-out infinite"}}>
            <IconChevron dir="down" size={13} strokeWidth={2.2}/>
          </span>
          <style>{`@keyframes bannerChev{0%,100%{transform:translateY(0);opacity:0.65}50%{transform:translateY(2px);opacity:1}}`}</style>
        </button>
        </div>
        );
      })()}
      {/* ═══════════════ Mode B: CONFIGURABLE BANNER (toggle ON) ═══════════════
          The compact pill is the persistent presence the user opted into.
          Always shown when banner toggle is enabled; dims away only when an
          activity tile reaches the banner zone at top (to avoid overlapping
          the actual tile content). Returns once the tile scrolls past. */}
      {!isEd&&cfg.showBanner!==false&&target&&(()=>{
        const isEn=t?.myDay==="My Day";
        const show=!bannerCollide;
        return(
        <button onClick={jumpToTarget} aria-label={isEn?"Back to now":"Tillbaka till nu"} className="lt-press-soft" style={{
          position:"absolute",top:14,left:"50%",zIndex:11,
          transform:show?"translate(-50%,0) scale(1)":"translate(-50%,-12px) scale(0.92)",
          opacity:show?1:0,
          pointerEvents:show?"auto":"none",
          padding:"8px 14px 8px 12px",borderRadius:999,
          border:`1px solid ${G.border}`,
          background:"linear-gradient(135deg, rgba(255,255,255,0.96), rgba(252,250,254,0.96))",
          backdropFilter:"saturate(180%) blur(14px)",
          WebkitBackdropFilter:"saturate(180%) blur(14px)",
          boxShadow:"0 6px 20px rgba(31,27,46,0.12), inset 0 1px 0 rgba(255,255,255,0.9)",
          display:"flex",alignItems:"center",gap:7,cursor:"pointer",
          fontFamily:G.font,fontWeight:600,fontSize:12,color:G.ink,letterSpacing:.2,
          transition:"opacity 0.32s ease, transform 0.36s cubic-bezier(0.32, 0.72, 0, 1)",
          whiteSpace:"nowrap",maxWidth:"calc(100% - 28px)",
        }}>
          <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:8,height:8,borderRadius:"50%",background:target.color,boxShadow:`0 0 8px ${target.color}AA, 0 0 0 2px ${target.color}22`,animation:"pillDot 2.2s ease-in-out infinite",flexShrink:0}}/>
          <style>{`@keyframes pillDot{0%,100%{box-shadow:0 0 6px ${target.color}99, 0 0 0 2px ${target.color}1F;transform:scale(1)}50%{box-shadow:0 0 12px ${target.color}EE, 0 0 0 3px ${target.color}33;transform:scale(1.18)}}`}</style>
          <span style={{overflow:"hidden",textOverflow:"ellipsis",flex:1,minWidth:0}}>
            {currentAct
              ? (isEn?"Now":"Pågår nu")
              : (isEn?"Next":"Nästa")}
            <span style={{color:G.ink2,fontWeight:500,marginLeft:6}}>· {target.name}</span>
          </span>
          {/* Subtle chevron — signals "tappable, jumps down". Matches week-pill
              vocabulary. Animation only when target is below the viewport;
              otherwise stays static so it doesn't imply a direction that isn't
              currently true. */}
          <span style={{color:G.ink3,flexShrink:0,marginLeft:2,display:"inline-flex",alignItems:"center",opacity:.7,animation:targetBelow?"dayPillChev 2.6s ease-in-out infinite":"none"}}>
            <IconChevron dir="down" size={12} strokeWidth={2.2}/>
          </span>
          <style>{`@keyframes dayPillChev{0%,100%{transform:translateY(0);opacity:0.6}50%{transform:translateY(1.5px);opacity:1}}`}</style>
        </button>
        );
      })()}
      <div ref={scrollRef} style={{flex:1,display:"flex",overflowY:"auto",padding:"14px 14px 30px 6px",position:"relative"}}>
      {!isEd&&(
        // Time-of-day column on the far left, only used in user (non-editor) view.
        // Width is locale-sensitive — "12 PM" needs more room than "06:00".
        <div style={{flexShrink:0,position:"relative",width:t?.myDay==="My Day"?56:38,height:totalContentH}}>
          {/* Hour anchors — discrete time markers every hour give the empty
              space a steady rhythm even when no activity sits at that hour.
              Only shown when Sigvard lamps are OFF (when on, the lamps already
              provide continuous time-of-day reference). Aligned to the activity
              time labels so the column feels coherent when both kinds coexist. */}
          {!cfg.showSigvard&&Array.from({length:25}).map((_,h)=>{
            const yLine=yForTime(h*60);
            // Skip hours where an activity starts within 12 minutes — the
            // activity's vivid time label would clash with the gray marker.
            const tooClose=positions.some(p=>{
              const startM=hm(p.item.time);
              return Math.abs(startM-h*60)<12;
            });
            if(tooClose) return null;
            // Format consistently with activity labels (HH:MM in SV, h AM/PM in EN)
            const lbl=t?.myDay==="My Day"
              ? (h===0?"12 AM":h<12?`${h} AM`:h===12?"12 PM":h===24?"12 AM":`${h-12} PM`)
              : String(h).padStart(2,"0")+":00";
            return(
              <div key={`hr-${h}`} style={{position:"absolute",top:yLine-5,right:6,fontFamily:G.font,fontWeight:500,fontSize:9.5,color:"#B5B0C2",letterSpacing:.4,fontVariantNumeric:"tabular-nums",whiteSpace:"nowrap",lineHeight:1,pointerEvents:"none"}}>
                {lbl}
              </div>
            );
          })}
          {/* Activity start times — primary, in the activity's own color */}
          {positions.map(({item,y})=>(
            <div key={`tl-${item.id}`} style={{position:"absolute",top:y+2,right:6,fontFamily:G.font,fontWeight:700,fontSize:11,color:item.color,letterSpacing:0.3,fontVariantNumeric:"tabular-nums",whiteSpace:"nowrap",lineHeight:1}}>
              {fmtT(item.time,t)}
            </div>
          ))}
        </div>
      )}
      {cfg.showSigvard&&!isEd&&(
        <div style={{flexShrink:0,position:"relative",zIndex:5}}>
          <SigvardTimeline now={now} color={cfg.sigvardColor||"#FF4848"}/>
        </div>
      )}
      {/* Activity cards container.
          marginLeft handles the gap between the schedule content and what
          sits to its left. Sigvard ON → small 10px gap from the lamp pole.
          Sigvard OFF → larger 16px gap from the time labels, because the
          activity's coloured edge stripe (left:-8) would otherwise crowd
          the time text. With Sigvard on, the lamp column itself separates
          the two visually. */}
      <div style={{flex:1,position:"relative",height:totalContentH,marginLeft:cfg.showSigvard&&!isEd?10:!isEd?16:0}}>
        {!isEd&&cfg.showNowLine!==false&&(()=>{
          // Horizontal "now" line — independently toggleable, with its own colour.
          // If cfg.nowLineColor is empty/falsy, falls back to the Sigvard lamp colour
          // for visual cohesion (the historical behaviour). Setting any colour breaks
          // the link and the line uses that colour instead.
          const lineColor=cfg.nowLineColor||cfg.sigvardColor||"#FF4848";
          const lineMin=now.getHours()*60+now.getMinutes()+now.getSeconds()/60;
          const lineY=yForTime(lineMin);
          // Unique keyframe id per color (avoids clashes if multiple lines existed)
          const pulseId=`nowPulse_${lineColor.replace("#","")}`;
          return(
            <>
              <div style={{position:"absolute",top:lineY-1,left:-12,right:0,height:2,background:`linear-gradient(90deg, ${shade(lineColor,-0.1)} 0%, ${shade(lineColor,0.1)} 40%, ${withAlpha(lineColor,0.2)} 100%)`,borderRadius:1,zIndex:1,pointerEvents:"none",animation:`${pulseId} 2.4s ease-in-out infinite`,transition:"top .5s cubic-bezier(0.32, 0.72, 0, 1)"}}/>
              <style>{`@keyframes ${pulseId}{0%,100%{box-shadow:0 0 6px ${withAlpha(lineColor,0.33)};opacity:.85}50%{box-shadow:0 0 14px ${withAlpha(lineColor,0.67)}, 0 0 22px ${withAlpha(lineColor,0.27)};opacity:1}}`}</style>
            </>
          );
        })()}
        {positions.map(({item,y,naturalY,h},i)=>{
          const startM=hm(item.time);
          const endM=item.endTime?hm(item.endTime):null;
          const yBot=endM?yForTime(endM):yForTime(startM);
          const barH=Math.max(0,yBot-yForTime(startM));
          const offset=y-naturalY;
          // Compute lifeState: past (finished) | now (current) | future (later today)
          const itemEnd=endM||startM+30;
          const lifeState = itemEnd<=nowM ? "past"
                          : startM<=nowM ? "now"
                          : "future";
          return(
            <div key={item.id}>
              <div ref={el=>{cardRefs.current[item.id]=el; if(el) el.setAttribute("data-act-id",item.id);}} style={{position:"absolute",top:y,left:0,right:0,zIndex:lifeState==="now"?20:2+i,transition:"z-index 0s"}}>
                <ActRow item={item} cardStyle={cfg.cardStyle||"normal"} isEditor={isEd} onEdit={onEdit} onTap={onTap} onMarkDone={onMarkDone} idx={i} lifeState={lifeState} t={t}/>
                {barH>20&&offset<=14&&<div style={{position:"absolute",left:-8,top:4,width:3,height:barH,background:`linear-gradient(180deg,${item.color},${item.color}66)`,borderRadius:2,opacity:lifeState==="past"?0.25:0.7,transition:"opacity .6s cubic-bezier(0.32, 0.72, 0, 1)"}}/>}
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}

function TimerSep({timer,isEditor,onOpen,t}){
  if(!timer?.on) return null;
  const tc=timer.color||"#E89B89";
  return(
    <div onClick={!isEditor?onOpen:undefined} style={{display:"flex",alignItems:"center",gap:10,padding:"4px 0",cursor:isEditor?"default":"pointer"}}>
      <div style={{flex:1,height:1,background:`${tc}25`}}/>
      <div style={{display:"flex",alignItems:"center",gap:7,background:G.white,borderRadius:20,padding:"7px 16px",boxShadow:sh.xs,border:`1px solid ${tc}30`}}>
        <TimerIcon type={timer.type} size={13} color={tc}/>
        <span style={{fontFamily:G.font,fontWeight:600,fontSize:12,color:tc}}>{tlbl(timer.type,t)} · {timer.min} {t.min}</span>
        {!isEditor&&<span style={{color:tc,opacity:0.5,fontSize:11}}>▶</span>}
      </div>
      <div style={{flex:1,height:1,background:`${tc}25`}}/>
    </div>
  );
}

function Confetti(){
  const cols=["#E89B89","#C2607A","#9683C2","#8FBFA1","#8AAFD2","#D9B868"];
  return(<div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:8000,overflow:"hidden"}}><style>{`@keyframes cf{0%{transform:translateY(-20px) rotate(0);opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:0}}`}</style>{Array.from({length:32}).map((_,i)=><div key={i} style={{position:"absolute",left:`${Math.random()*100}%`,top:0,width:7+Math.random()*8,height:7+Math.random()*8,borderRadius:Math.random()>0.5?"50%":"3px",background:cols[i%cols.length],animation:`cf ${1.2+Math.random()*1.5}s ease-in ${Math.random()*0.8}s forwards`}}/>)}</div>);
}

/* ═══ Activity detail ═══ */
function ActivityDetail({item,stepsDone,readOnly,onClose,onCheck,t}){
  const[local,setLocal]=useState(stepsDone||{});
  const[fullTmr,setFullTmr]=useState(false);
  const[celebrate,setCelebrate]=useState(false);
  const tc=item.timer?.color||"#E89B89";
  const secsLeft=item.timer?.on?clockLeft(item.time,item.timer.min):(item.timer?.min||5)*60;
  const allDone=item.steps.length>0&&item.steps.every(s=>local[s.id]);
  useEffect(()=>{setLocal(stepsDone||{});},[stepsDone]);
  useEffect(()=>{if(allDone&&item.steps.length>0&&!readOnly){setCelebrate(true);setTimeout(()=>setCelebrate(false),2800);}},[allDone,readOnly]);
  const toggle=id=>{
    if(readOnly) return;
    const n={...local,[id]:!local[id]};
    setLocal(n);
    onCheck&&onCheck(item.id,n);
  };
  return(
    <>
      {celebrate&&<Confetti/>}
      {fullTmr&&<FullTimer type={item.timer.type} totalSec={secsLeft} color={tc} t={t} autoRun={true} onClose={()=>setFullTmr(false)} activity={item}/>}
      <Overlay onClose={onClose}>
        <Sheet scroll>
          <style>{`
            @keyframes adSection{0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)}}
          `}</style>
          <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:26,animation:"adSection 0.5s 0.08s cubic-bezier(0.32, 0.72, 0, 1) both"}}>
            <div style={{fontSize:46,lineHeight:1,padding:14,borderRadius:18,background:`linear-gradient(140deg,${item.color}1A,${item.color}30)`,border:`1px solid ${item.color}25`}}>{item.emoji}</div>
            <div style={{flex:1,paddingTop:4}}>
              <div style={{fontFamily:G.serif,fontWeight:500,fontSize:25,color:G.inkSoft,lineHeight:1.05,letterSpacing:-.5}}>{item.name}</div>
              <div style={{fontFamily:G.font,fontWeight:500,fontSize:12,color:item.color,marginTop:7,letterSpacing:.4}}>{fmtT(item.time,t)}</div>
            </div>
            <button onClick={onClose} className="lt-press" style={{width:36,height:36,borderRadius:12,border:`1px solid ${G.border}`,background:G.cream,color:G.ink2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><IconX size={14}/></button>
          </div>
          {readOnly&&(
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:12,background:`${item.color}10`,border:`1px solid ${item.color}25`,marginBottom:18,animation:"adSection 0.5s 0.16s cubic-bezier(0.32, 0.72, 0, 1) both"}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:item.color,flexShrink:0}}/>
              <span style={{fontFamily:G.font,fontWeight:500,fontSize:12.5,color:G.ink2,letterSpacing:.2,lineHeight:1.3}}>{t.notTodayHint}</span>
            </div>
          )}
          {item.steps.length>0&&(
            <div style={{marginBottom:22,animation:"adSection 0.5s 0.22s cubic-bezier(0.32, 0.72, 0, 1) both"}}>
              <SLabel>{t.steps}</SLabel>
              {item.steps.map((s,si)=>{const done=!!local[s.id];return(
                <div key={s.id} onClick={()=>toggle(s.id)} className={readOnly?"":"lt-press-soft"} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderRadius:14,cursor:readOnly?"default":"pointer",marginBottom:8,transition:"background .28s cubic-bezier(0.32, 0.72, 0, 1), border-color .28s cubic-bezier(0.32, 0.72, 0, 1), transform .26s cubic-bezier(0.32, 0.72, 0, 1)",background:done?`${item.color}10`:G.cream,border:`1px solid ${done?item.color:G.border}`,opacity:readOnly?0.72:1,animation:`adSection 0.45s ${0.28+si*0.06}s cubic-bezier(0.32, 0.72, 0, 1) both`}}>
                  <div style={{width:26,height:26,borderRadius:"50%",flexShrink:0,border:`2px solid ${done?item.color:G.ink3}`,background:done?item.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .3s cubic-bezier(0.34, 1.56, 0.64, 1)"}}>{done&&<span style={{color:"#fff",fontSize:13,fontWeight:900}}>✓</span>}</div>
                  <span style={{fontSize:20}}>{s.emoji}</span>
                  <span style={{fontFamily:G.font,fontWeight:600,fontSize:15,flex:1,color:done?item.color:G.ink,textDecoration:done?"line-through":"none",transition:"color .25s ease"}}>{s.text}</span>
                </div>
              );})}
              {allDone&&!readOnly&&(
                <div style={{display:"flex",justifyContent:"center",padding:"4px 0 8px"}}>
                  <style>{`
                    @keyframes ckStarBounce{0%{opacity:0;transform:scale(0) translateY(-10px)}55%{opacity:1;transform:scale(1.15) translateY(0)}75%{transform:scale(0.96) translateY(0)}100%{transform:scale(1) translateY(0)}}
                  `}</style>
                  <div style={{width:78,height:78,animation:"ckStarBounce 0.7s cubic-bezier(.34,1.56,.64,1) both",filter:`drop-shadow(0 8px 18px ${item.color}55) drop-shadow(0 2px 5px rgba(31,27,46,0.12))`}}>
                    <svg width="78" height="78" viewBox="0 0 88 88" style={{display:"block"}}>
                      <defs>
                        <radialGradient id="ckStarFill" cx="38%" cy="28%" r="80%">
                          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75"/>
                          <stop offset="30%" stopColor={item.color}/>
                          <stop offset="100%" stopColor={item.color}/>
                        </radialGradient>
                      </defs>
                      <path
                        d="M 44,14 L 51.64,33.49 L 72.53,34.73 L 56.36,48.02 L 61.63,68.27 L 44,57 L 26.37,68.27 L 31.64,48.02 L 15.47,34.73 L 36.36,33.49 Z"
                        fill="url(#ckStarFill)"
                        stroke={item.color}
                        strokeWidth="8"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          )}
          {item.timer?.on&&(<>
            <div style={{height:1,background:G.border,marginBottom:18,animation:"adSection 0.5s 0.42s cubic-bezier(0.32, 0.72, 0, 1) both"}}/>
            <button onClick={()=>!readOnly&&setFullTmr(true)} disabled={readOnly} className={readOnly?"":"lt-press-soft"} style={{width:"100%",padding:"16px 0",borderRadius:16,border:"none",background:readOnly?`linear-gradient(140deg,${tc}50,${tc}38)`:`linear-gradient(140deg,${tc},${tc}DC)`,color:readOnly?"rgba(255,255,255,0.7)":"#fff",fontFamily:G.font,fontWeight:700,fontSize:15,cursor:readOnly?"default":"pointer",boxShadow:readOnly?"none":sh.c(tc),opacity:readOnly?0.65:1,animation:"adSection 0.55s 0.5s cubic-bezier(0.32, 0.72, 0, 1) both",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:9}}><TimerIcon type={item.timer.type} size={18} color={readOnly?"rgba(255,255,255,0.7)":"#fff"}/><span>{t.openTimer} · {item.timer.min} {t.min}</span></button>
          </>)}
        </Sheet>
      </Overlay>
    </>
  );
}

/* ═══ Activity editor ═══ */
function EditModal({item,onSave,onDel,onClose,t,existingActs=[]}){
  const[name,setName]=useState(item?.name||"");
  const[time,setTime]=useState(item?.time||"09:00");
  const[endTime,setEndTime]=useState(item?.endTime||"");
  const[emoji,setEmoji]=useState(item?.emoji||"🌅");
  const[photo,setPhoto]=useState(item?.photo||null);
  const[color,setColor]=useState(item?.color||ACT_C[0]);
  const[steps,setSteps]=useState(()=>item?.steps?[...item.steps]:[]);
  const[timerOn,setTimerOn]=useState(item?.timer?.on||false);
  const[timerType,setTType]=useState(item?.timer?.type||"sector");
  const[timerMin,setTMin]=useState(item?.timer?.min||10);
  const[timerCol,setTCol]=useState(item?.timer?.color||"#E89B89");
  const[stepTxt,setStepTxt]=useState("");
  const[stepEmoji,setStepEmoji]=useState("✅");
  const[showStepE,setShowStepE]=useState(false);
  const[repeat,setRepeat]=useState(item?.repeat||{type:"none",days:[]});
  const[conflicts,setConflicts]=useState(null); // array of overlapping activities or null
  const[discardOpen,setDiscardOpen]=useState(false); // "Spara ändringar?"-dialog
  const[sepage,setSEpage]=useState(0);
  const[epage,setEpage]=useState(0);
  // Snapshot the initial field values once, on mount. We compare against this
  // to know whether the modal has unsaved changes when the user tries to close.
  const initial=useRef({
    name:item?.name||"",
    time:item?.time||"09:00",
    endTime:item?.endTime||"",
    emoji:item?.emoji||"🌅",
    photo:item?.photo||null,
    color:item?.color||ACT_C[0],
    steps:JSON.stringify(item?.steps||[]),
    timerOn:item?.timer?.on||false,
    timerType:item?.timer?.type||"sector",
    timerMin:item?.timer?.min||10,
    timerCol:item?.timer?.color||"#E89B89",
    repeat:JSON.stringify(item?.repeat||{type:"none",days:[]}),
  });
  const isDirty=()=>{
    const v=initial.current;
    return name!==v.name||time!==v.time||endTime!==v.endTime||emoji!==v.emoji
      ||photo!==v.photo||color!==v.color||JSON.stringify(steps)!==v.steps
      ||timerOn!==v.timerOn||timerType!==v.timerType||timerMin!==v.timerMin||timerCol!==v.timerCol
      ||JSON.stringify(repeat)!==v.repeat;
  };
  // Intercepts every "close" path (overlay tap, cancel button, back gesture).
  // If there are unsaved edits, ask before throwing them away.
  const attemptClose=()=>{ if(isDirty()) setDiscardOpen(true); else onClose(); };
  const pp=40, esl=EMOJIS.slice(epage*pp,(epage+1)*pp);
  const addStep=()=>{if(!stepTxt.trim())return;setSteps(s=>[...s,{id:Date.now(),emoji:stepEmoji,text:stepTxt.trim()}]);setStepTxt("");};
  const buildSaved=()=>({id:item?.id||Date.now(),name:name||(t?.noName||"(Utan namn)"),time,endTime:endTime||undefined,emoji,photo,color,done:false,stepsDone:{},steps,timer:{on:timerOn,type:timerType,min:timerMin,color:timerCol},repeat});
  const findConflicts=()=>{
    const newStart=hm(time);
    const newEnd=endTime?hm(endTime):newStart;
    const myId=item?.id;
    return existingActs.filter(a=>{
      if(a.id===myId) return false;
      const aStart=hm(a.time);
      const aEnd=a.endTime?hm(a.endTime):aStart;
      // Overlap: not (new ends before a starts OR new starts after a ends)
      // For point-times treat as 1-minute span to detect exact-time collisions
      const nE=newEnd===newStart?newStart+1:newEnd;
      const aE=aEnd===aStart?aStart+1:aEnd;
      return !(nE<=aStart || newStart>=aE);
    });
  };
  const doSave=()=>{
    const conf=findConflicts();
    if(conf.length>0){setConflicts(conf);return;}
    onSave(buildSaved());onClose();
  };
  const confirmConflictSave=()=>{onSave(buildSaved());setConflicts(null);onClose();};
  const toggleDay=d=>setRepeat(r=>{const days=r.days||[];return{type:"custom",days:days.includes(d)?days.filter(x=>x!==d):[...days,d].sort()};});
  const DAYS=t.daysShort||["sön","mån","tis","ons","tor","fre","lör"];
  const S=SCREENS.home;
  return(
    <Overlay onClose={attemptClose}>
      <Sheet scroll>
        <div style={{fontFamily:G.serif,fontWeight:500,fontSize:26,color:G.inkSoft,marginBottom:28,letterSpacing:-.5,lineHeight:1.1}}>{item?.id?t.editAct:t.newAct}</div>

        <SLabel>{t.cardImage}</SLabel>
        <div style={{display:"flex",gap:12,marginBottom:18,alignItems:"flex-start"}}>
          <div style={{width:72,height:72,borderRadius:16,background:photo?"#000":`linear-gradient(140deg,${color}1A,${color}30)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,overflow:"hidden",border:`1px solid ${color}25`,flexShrink:0}}>
            {photo?<img src={photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:emoji}
          </div>
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:7}}>
            <label style={{padding:"9px 13px",borderRadius:11,background:G.white,border:`1px solid ${G.border}`,fontFamily:G.font,fontSize:12,color:G.ink,cursor:"pointer",fontWeight:600,textAlign:"center",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:7}}>
              <IconCamera size={14}/> {photo?(lang==="sv"?"Byt foto":"Change photo"):t.uploadPhoto}
              <input type="file" accept="image/*" onChange={e=>{
                const f=e.target.files?.[0]; if(!f) return;
                const r=new FileReader();
                r.onload=()=>{
                  const img=new Image();
                  img.onload=()=>{
                    const c=document.createElement("canvas");
                    const max=500;
                    const s=Math.min(1,max/Math.max(img.width,img.height));
                    c.width=img.width*s; c.height=img.height*s;
                    c.getContext("2d").drawImage(img,0,0,c.width,c.height);
                    setPhoto(c.toDataURL("image/jpeg",0.75));
                  };
                  img.src=r.result;
                };
                r.readAsDataURL(f);
              }} style={{display:"none"}}/>
            </label>
            {photo&&<button onClick={()=>setPhoto(null)} style={{padding:"7px 12px",borderRadius:10,background:"#FEF2F2",border:"none",color:"#EF4444",fontFamily:G.font,fontSize:11,fontWeight:600,cursor:"pointer"}}>Ta bort foto</button>}
          </div>
        </div>

        <SLabel>{t.pickEmoji}</SLabel>
        <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>
          {esl.map(e=><button key={e} onClick={()=>setEmoji(e)} style={{fontSize:22,background:emoji===e?S.hl:"transparent",border:emoji===e?`1.5px solid ${S.h}`:"1.5px solid transparent",borderRadius:9,padding:"2px 4px",cursor:"pointer"}}>{e}</button>)}
        </div>
        <div style={{display:"flex",gap:5,marginBottom:16}}>
          {Array.from({length:Math.ceil(EMOJIS.length/pp)}).map((_,i)=><button key={i} onClick={()=>setEpage(i)} style={{padding:"3px 10px",borderRadius:8,fontFamily:G.font,fontWeight:600,fontSize:11,cursor:"pointer",border:`1px solid ${i===epage?S.h:G.border}`,background:i===epage?S.h:"transparent",color:i===epage?"#fff":G.ink2}}>{i+1}</button>)}
        </div>
        <SLabel>{t.actName}</SLabel>
        <input value={name} onChange={e=>setName(e.target.value)} className="lt-input" style={INP} placeholder={t.actNamePH}/>
        <SLabel>{t.actTime}</SLabel>
        <div style={{display:"flex",gap:10,marginBottom:16}}>
          <div style={{flex:1}}>
            <div style={{fontFamily:G.font,fontWeight:500,fontSize:10,color:G.ink3,letterSpacing:.5,marginBottom:4}}>{t.timeStart}</div>
            <input type="time" value={time} onChange={e=>setTime(e.target.value)} className="lt-input" style={{...INP,marginBottom:0}}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:G.font,fontWeight:500,fontSize:10,color:G.ink3,letterSpacing:.5,marginBottom:4}}>{t.timeEnd}</div>
            <input type="time" value={endTime} onChange={e=>setEndTime(e.target.value)} className="lt-input" style={{...INP,marginBottom:0}}/>
          </div>
        </div>
        <SLabel>{t.pickColor}</SLabel>
        <div style={{display:"flex",gap:9,marginBottom:22,flexWrap:"wrap"}}>
          {ACT_C.map(col=><div key={col} onClick={()=>setColor(col)} style={{width:32,height:32,borderRadius:"50%",background:col,cursor:"pointer",outline:color===col?`3px solid ${col}`:"none",outlineOffset:2,boxShadow:color===col?sh.c(col):"none"}}/>)}
        </div>
        <SLabel>{t.repeat}</SLabel>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:7,marginBottom:10}}>
          {[
            {k:"none",l:t.repNone},
            {k:"daily",l:t.repDaily},
            {k:"weekdays",l:t.repWeekdays},
            {k:"weekend",l:t.repWeekend},
          ].map(opt=>(
            <button key={opt.k} onClick={()=>setRepeat({type:opt.k,days:[]})} style={{padding:"10px 8px",borderRadius:12,border:`1px solid ${repeat.type===opt.k?S.h:G.border}`,background:repeat.type===opt.k?S.hl:G.white,color:repeat.type===opt.k?S.deep:G.ink2,fontFamily:G.font,fontWeight:600,fontSize:12,cursor:"pointer",transition:"all .15s"}}>{opt.l}</button>
          ))}
          <button onClick={()=>setRepeat(r=>r.type==="custom"?r:{type:"custom",days:[]})} style={{gridColumn:"1 / -1",padding:"10px 8px",borderRadius:12,border:`1px solid ${repeat.type==="custom"?S.h:G.border}`,background:repeat.type==="custom"?S.hl:G.white,color:repeat.type==="custom"?S.deep:G.ink2,fontFamily:G.font,fontWeight:600,fontSize:12,cursor:"pointer"}}>{t.repPickDays}</button>
        </div>
        {repeat.type==="custom"&&(
          <div style={{display:"flex",gap:5,marginBottom:18,justifyContent:"space-between"}}>
            {DAYS.map((d,i)=>{const on=(repeat.days||[]).includes(i);return(
              <button key={i} onClick={()=>toggleDay(i)} style={{flex:1,padding:"10px 0",borderRadius:10,border:`1px solid ${on?S.h:G.border}`,background:on?S.h:G.white,color:on?"#fff":G.ink2,fontFamily:G.font,fontWeight:700,fontSize:11,cursor:"pointer",textTransform:"capitalize"}}>{d}</button>
            );})}
          </div>
        )}
        {repeat.type!=="custom"&&<div style={{height:18}}/>}
        <SLabel>{t.steps}</SLabel>
        {steps.map(s=>(
          <div key={s.id} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",background:S.hll,borderRadius:12,border:`1px solid ${G.border}`,marginBottom:8}}>
            <span style={{fontSize:17}}>{s.emoji}</span>
            <span style={{fontFamily:G.font,fontWeight:500,color:G.ink,flex:1,fontSize:14}}>{s.text}</span>
            <button onClick={()=>setSteps(ss=>ss.filter(x=>x.id!==s.id))} aria-label="Ta bort steg" style={{background:"none",border:"none",color:G.ink3,cursor:"pointer",padding:6,display:"inline-flex",alignItems:"center",justifyContent:"center"}}><IconX size={13}/></button>
          </div>
        ))}
        <div style={{display:"flex",gap:7,marginBottom:22}}>
          <button onClick={()=>setShowStepE(true)} style={{fontSize:22,border:`1px solid ${G.border}`,borderRadius:11,padding:"6px 12px",background:G.white,cursor:"pointer",minWidth:50}}>{stepEmoji}</button>
          <input value={stepTxt} onChange={e=>setStepTxt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addStep()} className="lt-input" style={{...INP,marginBottom:0,flex:1}} placeholder={t.stepPH}/>
          <button onClick={addStep} style={{padding:"0 16px",borderRadius:12,border:"none",background:S.h,color:"#fff",fontFamily:G.font,fontWeight:700,cursor:"pointer",fontSize:18}}>+</button>
        </div>
        {showStepE&&(
          <Overlay onClose={()=>setShowStepE(false)}>
            <Sheet scroll>
              <div style={{fontFamily:G.serif,fontWeight:600,fontSize:19,color:G.ink,marginBottom:14}}>{t.pickEmoji}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:14}}>
                {EMOJIS.slice(sepage*pp,(sepage+1)*pp).map(e=><button key={e} onClick={()=>{setStepEmoji(e);setShowStepE(false);}} style={{fontSize:24,background:stepEmoji===e?S.hl:"transparent",border:stepEmoji===e?`1.5px solid ${S.h}`:"1.5px solid transparent",borderRadius:10,padding:"3px 6px",cursor:"pointer"}}>{e}</button>)}
              </div>
              <div style={{display:"flex",gap:5,marginBottom:8}}>
                {Array.from({length:Math.ceil(EMOJIS.length/pp)}).map((_,i)=><button key={i} onClick={()=>setSEpage(i)} style={{padding:"3px 10px",borderRadius:8,fontFamily:G.font,fontWeight:600,fontSize:11,cursor:"pointer",border:`1px solid ${i===sepage?S.h:G.border}`,background:i===sepage?S.h:"transparent",color:i===sepage?"#fff":G.ink2}}>{i+1}</button>)}
              </div>
            </Sheet>
          </Overlay>
        )}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:timerOn?16:22}}>
          <Toggle on={timerOn} onChange={()=>setTimerOn(x=>!x)} color={S.h}/>
          <span style={{fontFamily:G.font,fontWeight:600,color:G.ink,fontSize:14}}>{t.timerAct}</span>
        </div>
        {timerOn&&(
          <div style={{background:SCREENS.timer.hll,borderRadius:18,padding:18,marginBottom:20,border:`1px solid ${SCREENS.timer.hl}`}}>
            <div style={{fontFamily:G.font,fontSize:12,color:SCREENS.timer.deep,background:SCREENS.timer.hl,borderRadius:10,padding:"8px 12px",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,opacity:0.85}}>
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              {t.autoTimer}
            </div>
            <SLabel>{t.timerType}</SLabel>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
              {TTYPES.map(k=><button key={k} onClick={()=>setTType(k)} style={{padding:"14px 4px 10px",borderRadius:13,border:"1px solid",fontFamily:G.font,fontWeight:600,fontSize:11,cursor:"pointer",borderColor:timerType===k?timerCol:G.border,background:timerType===k?timerCol:"transparent",color:timerType===k?"#fff":G.ink2,display:"flex",flexDirection:"column",alignItems:"center",gap:6,transition:"all .2s"}}><TimerIcon type={k} size={18} color={timerType===k?"#fff":G.ink2}/><div>{tlbl(k,t)}</div></button>)}
            </div>
            <SLabel>{t.timerMin}</SLabel>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
              <input type="range" min={1} max={120} value={timerMin} onChange={e=>setTMin(+e.target.value)} style={{flex:1,accentColor:timerCol}}/>
              <span style={{fontFamily:G.serif,fontWeight:600,fontSize:20,color:G.ink,minWidth:48}}>{timerMin}m</span>
            </div>
            <SLabel>{t.timerColor}</SLabel>
            <div style={{display:"flex",gap:9,flexWrap:"wrap",marginBottom:16}}>
              {TMR_C.map(col=><div key={col} onClick={()=>setTCol(col)} style={{width:28,height:28,borderRadius:"50%",background:col,cursor:"pointer",outline:timerCol===col?`3px solid ${col}`:"none",outlineOffset:2}}/>)}
            </div>
            <div style={{background:G.white,borderRadius:16,padding:18,display:"flex",justifyContent:"center",boxShadow:sh.xs,border:`1px solid ${G.border}`}}>
              <TimerThumb type={timerType} color={timerCol} size={110} min={timerMin}/>
            </div>
          </div>
        )}
        <div style={{display:"flex",gap:8}}>
          {item?.id&&(
            <button onClick={()=>{onDel(item.id);onClose();}} aria-label={t.cancel} className="lt-press" style={{padding:"14px 16px",borderRadius:14,border:"none",background:"#FEF2F2",color:"#EF4444",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6 h18"/>
                <path d="M8 6 V4 a2 2 0 0 1 2-2 h4 a2 2 0 0 1 2 2 v2"/>
                <path d="M19 6 l-1 14 a2 2 0 0 1 -2 2 H8 a2 2 0 0 1 -2 -2 L5 6"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            </button>
          )}
          <button onClick={attemptClose} style={{flex:1,...GHOST}}>{t.cancel}</button>
          <button onClick={doSave} className="lt-press saveBtn" style={{flex:2,padding:"15px 0",borderRadius:14,border:"none",background:S.h,color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:15,cursor:"pointer",boxShadow:sh.c(S.h),display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <svg className="saveTick" width="15" height="15" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
              <path d="M2.5 7.2 L5.8 10.5 L11.5 3.5"/>
            </svg>
            {t.save}
          </button>
        </div>
        {conflicts&&(
          <Overlay onClose={()=>setConflicts(null)}>
            <Sheet>
              <div style={{textAlign:"center",marginBottom:18}}>
                <div style={{width:64,height:64,borderRadius:20,background:"linear-gradient(140deg,#FEF3E7,#FDE6D0)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,margin:"0 auto 14px"}}>⚠️</div>
                <div style={{fontFamily:G.serif,fontWeight:500,fontSize:24,color:G.ink,letterSpacing:-.4,marginBottom:8,lineHeight:1.1}}>{t.overlapTitle}</div>
                <div style={{fontFamily:G.font,fontSize:14,color:G.ink2,lineHeight:1.45,maxWidth:320,margin:"0 auto"}}>{(t.overlapDesc||"Den nya aktiviteten {t} överlappar:").replace("{t}",`${fmtT(time,t)}${endTime?` – ${fmtT(endTime,t)}`:""}`)}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:18}}>
                {conflicts.map(a=>(
                  <div key={a.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:`${a.color}10`,borderRadius:14,border:`1px solid ${a.color}30`}}>
                    <div style={{width:42,height:42,borderRadius:12,background:`linear-gradient(140deg,${a.color}25,${a.color}40)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{a.emoji}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:G.serif,fontWeight:600,fontSize:15,color:G.ink,lineHeight:1.2}}>{a.name}</div>
                      <div style={{fontFamily:G.font,fontSize:12,color:a.color,fontWeight:600,marginTop:2,letterSpacing:.3}}>{fmtT(a.time,t)}{a.endTime?` – ${fmtT(a.endTime,t)}`:""}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setConflicts(null)} style={{flex:1,...GHOST}}>{t.goBack}</button>
                <button onClick={confirmConflictSave} style={{flex:1,padding:"13px 0",borderRadius:14,border:"none",background:"#F59E42",color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:14,cursor:"pointer",boxShadow:"0 4px 12px rgba(245,158,66,0.35)"}}>{t.saveAnyway}</button>
              </div>
            </Sheet>
          </Overlay>
        )}
        {discardOpen&&(
          <Overlay onClose={()=>setDiscardOpen(false)}>
            <Sheet>
              <div style={{textAlign:"center",marginBottom:22}}>
                <div style={{width:64,height:64,borderRadius:20,background:`linear-gradient(140deg,${S.hll},${S.hl})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,margin:"0 auto 14px"}}>💾</div>
                <div style={{fontFamily:G.serif,fontWeight:500,fontSize:24,color:G.ink,letterSpacing:-.4,marginBottom:8,lineHeight:1.15}}>{t.unsavedTitle}</div>
                <div style={{fontFamily:G.font,fontSize:14,color:G.ink2,lineHeight:1.45,maxWidth:300,margin:"0 auto"}}>{t.unsavedDesc}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <button onClick={()=>{setDiscardOpen(false);doSave();}} style={{padding:"14px 0",borderRadius:14,border:"none",background:S.h,color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:15,cursor:"pointer",boxShadow:sh.c(S.h),letterSpacing:.2}}>{t.save}</button>
                <button onClick={()=>{setDiscardOpen(false);onClose();}} style={{padding:"13px 0",borderRadius:14,border:`1px solid ${G.border}`,background:"transparent",color:"#EF4444",fontFamily:G.font,fontWeight:600,fontSize:14,cursor:"pointer",letterSpacing:.2}}>{t.discardChanges}</button>
                <button onClick={()=>setDiscardOpen(false)} style={{padding:"12px 0",borderRadius:14,border:"none",background:"transparent",color:G.ink2,fontFamily:G.font,fontWeight:500,fontSize:13,cursor:"pointer",letterSpacing:.2}}>{t.keepEditing}</button>
              </div>
            </Sheet>
          </Overlay>
        )}
      </Sheet>
    </Overlay>
  );
}

/* ═══ Settings ═══ */
function SettingsModal({cfg,setCfg,shareCode,onClose,t,lang,onOpenSupervisor,onOpenDemo,onOpenWelcomeTour}){
  const[cs,setCs]=useState(cfg.cardStyle);
  const[sv,setSv]=useState(cfg.schedView);
  const[sig,setSig]=useState(cfg.showSigvard);
  const[sigC,setSigC]=useState(cfg.sigvardColor||"#FF4848");
  const[banner,setBanner]=useState(cfg.showBanner!==false);
  const[nowLn,setNowLn]=useState(cfg.showNowLine!==false);
  const[nowLnC,setNowLnC]=useState(cfg.nowLineColor||"");
  const[wc,setWc]=useState(()=>{
    const base=Array.isArray(cfg.weekColors)?cfg.weekColors:SIGVARD0;
    // Ensure 7 entries — fall back to SIGVARD0 for any missing index
    return [0,1,2,3,4,5,6].map(i=>base[i]||SIGVARD0[i]);
  });
  const[expDay,setExpDay]=useState(null);
  const[tools,setTools]=useState({...cfg.tools});
  const[tc,setTc]=useState({...cfg.timerCfg});
  const[vEmos,setVEmos]=useState([...(cfg.visibleEmotions||[1,2,3,4,5])]);
  const[sm,setSm]=useState(false);
  const[code,setCode]=useState("");
  const[cp,setCp]=useState(false);
  const[err,setErr]=useState("");
  const copy=()=>{navigator.clipboard?.writeText(shareCode).catch(()=>{});setCp(true);setTimeout(()=>setCp(false),2200);};
  const conn=()=>{const c=code.toUpperCase().trim();if(SYNC_DB[c]){setCfg(x=>({...x,childCode:c,isChild:true}));onClose();}else setErr(t.wrongCode);};
  const save=()=>{setCfg(x=>({...x,cardStyle:cs,schedView:sv,showSigvard:sig,sigvardColor:sigC,showBanner:banner,showNowLine:nowLn,nowLineColor:nowLnC,weekColors:wc,tools,timerCfg:tc,visibleEmotions:vEmos}));onClose();};
  // Display order Mon→Sun mapped to JS day index (0=Sun)
  const DAY_ORDER=[1,2,3,4,5,6,0];
  const dayLabel=jsDay=>{const map=["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];return t[map[jsDay]];};
  const S=SCREENS.home;
  const TOOLLIST=[{k:"week",t:"week",l:t.week,s:SCREENS.week},{k:"timer",t:"timer",l:t.toolsTimer,s:SCREENS.timer},{k:"stories",t:"stories",l:t.stories,s:SCREENS.stories},{k:"emotion",t:"emotion",l:t.toolsEmotion,s:SCREENS.emotion},{k:"calm",t:"calm",l:t.calm,s:SCREENS.calm},{k:"comm",t:"comm",l:t.comm,s:SCREENS.comm},{k:"idcard",t:"idcard",l:t.idcard,s:SCREENS.idcard}];
  return(
    <Overlay onClose={save}>
      <Sheet scroll>
        <div style={{fontFamily:G.serif,fontWeight:500,fontSize:26,color:G.inkSoft,marginBottom:30,letterSpacing:-.5,lineHeight:1.05}}>{t.settings}</div>
        <SLabel>{t.cardStyle}</SLabel>
        <div style={{display:"flex",gap:7,marginBottom:22}}>
          {[["normal",t.styleNormal],["compact",t.styleCompact],["big",t.styleBig]].map(([k,lb])=><button key={k} onClick={()=>setCs(k)} style={{flex:1,padding:"12px 0",borderRadius:13,border:`1px solid ${cs===k?S.h:G.border}`,background:cs===k?S.h:"transparent",color:cs===k?"#fff":G.ink2,fontFamily:G.font,fontWeight:600,cursor:"pointer",fontSize:13}}>{lb}</button>)}
        </div>
        <SLabel>{t.schedView}</SLabel>
        <div style={{display:"flex",gap:7,marginBottom:22}}>
          {[["both",t.viewBoth],["list",t.viewList],["card",t.viewCard]].map(([k,lb])=><button key={k} onClick={()=>setSv(k)} style={{flex:1,padding:"10px 4px",borderRadius:13,border:`1px solid ${sv===k?S.h:G.border}`,background:sv===k?S.h:"transparent",color:sv===k?"#fff":G.ink2,fontFamily:G.font,fontWeight:600,cursor:"pointer",fontSize:11}}>{lb}</button>)}
        </div>
        {/* ─────────── Visa i schemat ───────────
            Three visual signals competing for attention in the schedule view.
            Layout: each tool is a flex row with the toggle in a fixed left
            column and ALL its content (title + hint + own colour picker) in
            the right column — so colour pickers visually "belong to" their
            parent toggle through indentation alone. Hairline separators
            between tools start at the content column, not under the toggle. */}
        <div style={{padding:SPACE.lg,background:S.hll,borderRadius:SPACE.lg,border:`1px solid ${S.hl}`,marginBottom:SPACE.lg}}>
          <div style={{fontFamily:G.font,fontWeight:600,fontSize:TYPO.body.size,color:S.deep,letterSpacing:TYPO.body.tracking,marginBottom:SPACE.xs}}>{t.schedVisuals}</div>
          <div style={{fontFamily:G.font,fontWeight:TYPO.small.weight,fontSize:TYPO.small.size,color:G.ink2,lineHeight:1.45,letterSpacing:TYPO.small.tracking,marginBottom:SPACE.lg}}>{t.schedVisualsHint}</div>

          {/* ── Verktyg 1: Bannret ── */}
          <div style={{display:"flex",alignItems:"flex-start",gap:SPACE.md,paddingBottom:SPACE.lg}}>
            <div style={{flexShrink:0,paddingTop:2}}>
              <Toggle on={banner} onChange={()=>setBanner(b=>!b)} color={S.h}/>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:G.font,fontWeight:600,fontSize:TYPO.body.size,color:G.ink,letterSpacing:TYPO.body.tracking,opacity:banner?1:0.55,transition:"opacity .3s ease"}}>{t.bannerLabel}</div>
              <div style={{fontFamily:G.font,fontWeight:TYPO.small.weight,fontSize:TYPO.small.size,color:G.ink2,marginTop:SPACE.xs/2,lineHeight:1.45,letterSpacing:TYPO.small.tracking,opacity:banner?1:0.65,transition:"opacity .3s ease"}}>{t.bannerHint}</div>
            </div>
          </div>

          {/* ── Verktyg 2: Sigvard-lampor — färgväljare nestlad i höger­kolumn ── */}
          <div style={{display:"flex",alignItems:"flex-start",gap:SPACE.md,paddingTop:SPACE.lg,paddingBottom:SPACE.lg,borderTop:`1px solid ${S.hl}`}}>
            <div style={{flexShrink:0,paddingTop:2}}>
              <Toggle on={sig} onChange={()=>setSig(s=>!s)} color={sigC}/>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:G.font,fontWeight:600,fontSize:TYPO.body.size,color:G.ink,letterSpacing:TYPO.body.tracking,opacity:sig?1:0.55,transition:"opacity .3s ease"}}>{t.sigvardOn}</div>
              <div style={{fontFamily:G.font,fontWeight:TYPO.small.weight,fontSize:TYPO.small.size,color:G.ink2,marginTop:SPACE.xs/2,lineHeight:1.45,letterSpacing:TYPO.small.tracking,opacity:sig?1:0.65,transition:"opacity .3s ease"}}>{t.sigvardColorHint}</div>
              {sig&&(
                <div style={{marginTop:SPACE.md,padding:SPACE.md,background:G.white,borderRadius:SPACE.sm+2,border:`1px solid ${S.hl}`,animation:"adSection 0.35s cubic-bezier(0.32, 0.72, 0, 1) both"}}>
                  <div style={{fontFamily:G.font,fontWeight:TYPO.caption.weight,fontSize:TYPO.caption.size,color:G.ink3,letterSpacing:TYPO.caption.tracking,textTransform:"uppercase",marginBottom:SPACE.sm}}>{t.sigvardColor}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:SPACE.sm}}>
                    {SIGVARD_LAMP_PALETTE.map(c=>{
                      const selected=c.toLowerCase()===sigC.toLowerCase();
                      return(
                        <button key={c} onClick={()=>setSigC(c)} className="lt-press" aria-label={c} style={{
                          width:32,height:32,borderRadius:16,
                          background:`radial-gradient(circle at 30% 30%, ${shade(c,0.2)}, ${c})`,
                          border:selected?`2px solid ${G.ink}`:`1px solid ${withAlpha(c,0.4)}`,
                          boxShadow:selected
                            ?`0 4px 14px ${withAlpha(c,0.55)}, 0 0 0 3px ${G.white}, 0 0 0 4px ${G.ink}`
                            :`0 2px 8px ${withAlpha(c,0.35)}, inset 0 1px 0 rgba(255,255,255,0.4)`,
                          cursor:"pointer",padding:0,
                          transition:"transform .2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow .2s ease",
                          transform:selected?"scale(1.06)":"scale(1)",
                        }}/>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Verktyg 3: Tidsstrecket — färgväljare med AUTO-länk ── */}
          <div style={{display:"flex",alignItems:"flex-start",gap:SPACE.md,paddingTop:SPACE.lg,borderTop:`1px solid ${S.hl}`}}>
            <div style={{flexShrink:0,paddingTop:2}}>
              <Toggle on={nowLn} onChange={()=>setNowLn(n=>!n)} color={nowLnC||sigC}/>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:G.font,fontWeight:600,fontSize:TYPO.body.size,color:G.ink,letterSpacing:TYPO.body.tracking,opacity:nowLn?1:0.55,transition:"opacity .3s ease"}}>{t.nowLineLabel}</div>
              <div style={{fontFamily:G.font,fontWeight:TYPO.small.weight,fontSize:TYPO.small.size,color:G.ink2,marginTop:SPACE.xs/2,lineHeight:1.45,letterSpacing:TYPO.small.tracking,opacity:nowLn?1:0.65,transition:"opacity .3s ease"}}>{t.nowLineHint}</div>
              {nowLn&&(
                <div style={{marginTop:SPACE.md,padding:SPACE.md,background:G.white,borderRadius:SPACE.sm+2,border:`1px solid ${S.hl}`,animation:"adSection 0.35s cubic-bezier(0.32, 0.72, 0, 1) both"}}>
                  <div style={{fontFamily:G.font,fontWeight:TYPO.caption.weight,fontSize:TYPO.caption.size,color:G.ink3,letterSpacing:TYPO.caption.tracking,textTransform:"uppercase",marginBottom:SPACE.sm}}>{t.nowLineColor}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:SPACE.sm,alignItems:"center"}}>
                    <button onClick={()=>setNowLnC("")} className="lt-press" aria-label={t.nowLineSameAsSig} style={{
                      width:32,height:32,borderRadius:16,padding:0,
                      background:G.white,
                      border:nowLnC===""?`2px solid ${G.ink}`:`1px dashed ${G.ink3}`,
                      boxShadow:nowLnC===""
                        ?`0 4px 14px rgba(31,27,46,0.18), 0 0 0 3px ${G.white}, 0 0 0 4px ${G.ink}`
                        :`0 2px 8px rgba(31,27,46,0.06)`,
                      cursor:"pointer",
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontFamily:G.font,fontSize:8.5,fontWeight:700,color:G.ink2,letterSpacing:.4,
                      transition:"transform .2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow .2s ease",
                      transform:nowLnC===""?"scale(1.06)":"scale(1)",
                    }}>AUTO</button>
                    {SIGVARD_LAMP_PALETTE.map(c=>{
                      const selected=c.toLowerCase()===nowLnC.toLowerCase();
                      return(
                        <button key={c} onClick={()=>setNowLnC(c)} className="lt-press" aria-label={c} style={{
                          width:32,height:32,borderRadius:16,
                          background:`radial-gradient(circle at 30% 30%, ${shade(c,0.2)}, ${c})`,
                          border:selected?`2px solid ${G.ink}`:`1px solid ${withAlpha(c,0.4)}`,
                          boxShadow:selected
                            ?`0 4px 14px ${withAlpha(c,0.55)}, 0 0 0 3px ${G.white}, 0 0 0 4px ${G.ink}`
                            :`0 2px 8px ${withAlpha(c,0.35)}, inset 0 1px 0 rgba(255,255,255,0.4)`,
                          cursor:"pointer",padding:0,
                          transition:"transform .2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow .2s ease",
                          transform:selected?"scale(1.06)":"scale(1)",
                        }}/>
                      );
                    })}
                  </div>
                  {nowLnC===""&&(
                    <div style={{fontFamily:G.font,fontSize:TYPO.caption.size,color:G.ink3,marginTop:SPACE.sm,letterSpacing:TYPO.caption.tracking,fontStyle:"italic"}}>{t.nowLineSameAsSig}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Day color editor — Sigvard weekday colours */}
        <div style={{marginBottom:24}}>
          <SLabel>{t.dayColors}</SLabel>
          <div style={{fontFamily:G.font,fontWeight:400,fontSize:12,color:"#9892AA",marginTop:-8,marginBottom:14,letterSpacing:.1,lineHeight:1.4}}>{t.dayColorsHint}</div>
          <div style={{background:G.cream,borderRadius:16,border:`1px solid ${G.border}`,overflow:"hidden"}}>
            {DAY_ORDER.map((jsDay,idx)=>{
              const isOpen=expDay===jsDay;
              const color=wc[jsDay]||SIGVARD0[jsDay];
              return(
                <div key={jsDay} style={{borderBottom:idx===6?"none":`1px solid ${G.border}`,background:isOpen?G.white:"transparent",transition:"background .3s ease"}}>
                  <div onClick={()=>setExpDay(isOpen?null:jsDay)} className="lt-press-soft" style={{display:"flex",alignItems:"center",gap:14,padding:"12px 14px",cursor:"pointer"}}>
                    <div style={{width:28,height:28,borderRadius:14,background:color,border:`1px solid ${color==="#FFFFFF"||color==="#F5F2EE"?"rgba(31,27,46,0.18)":"rgba(31,27,46,0.08)"}`,boxShadow:"inset 0 1px 0 rgba(255,255,255,0.5)",flexShrink:0,transition:"transform .25s cubic-bezier(0.34, 1.56, 0.64, 1)",transform:isOpen?"scale(1.08)":"scale(1)"}}/>
                    <span style={{flex:1,fontFamily:G.font,fontWeight:500,fontSize:14,color:G.ink,letterSpacing:.1}}>{dayLabel(jsDay)}</span>
                    <span style={{fontFamily:G.font,fontSize:11,color:"#9892AA",transition:"transform .3s ease",transform:isOpen?"rotate(180deg)":"rotate(0deg)",display:"inline-block"}}>⌄</span>
                  </div>
                  {isOpen&&(
                    <div style={{padding:"4px 14px 14px",animation:"adSection 0.35s cubic-bezier(0.32, 0.72, 0, 1) both"}}>
                      <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                        {DAY_PALETTE.map(c=>{
                          const selected=c.toLowerCase()===color.toLowerCase();
                          const isLight=c==="#FFFFFF"||c==="#F5F2EE";
                          return(
                            <button key={c} onClick={()=>{setWc(prev=>prev.map((x,i)=>i===jsDay?c:x));setTimeout(()=>setExpDay(null),200);}} className="lt-press" style={{width:34,height:34,borderRadius:17,background:c,border:selected?`2px solid ${G.ink}`:`1px solid ${isLight?"rgba(31,27,46,0.22)":"rgba(31,27,46,0.1)"}`,boxShadow:selected?`0 4px 12px ${c}66, inset 0 1px 0 rgba(255,255,255,0.5)`:"inset 0 1px 0 rgba(255,255,255,0.5)",cursor:"pointer",padding:0,transition:"transform .2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow .2s ease, border .2s ease"}}/>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <button onClick={()=>{setWc([...SIGVARD0]);setExpDay(null);}} className="lt-press" style={{marginTop:12,padding:"8px 14px",borderRadius:11,border:`1px solid ${G.border}`,background:"transparent",color:G.ink2,fontFamily:G.font,fontWeight:500,fontSize:12,cursor:"pointer",letterSpacing:.2}}>{t.resetColors}</button>
        </div>
        <div style={{background:G.cream,borderRadius:16,padding:18,border:`1px solid ${G.border}`,marginBottom:18}}>
          <SLabel>{t.visibleTools}</SLabel>
          {TOOLLIST.map((tool,idx)=>(
            <div key={tool.k} style={{display:"flex",alignItems:"center",gap:14,paddingBottom:13,marginBottom:13,borderBottom:idx===TOOLLIST.length-1?"none":`1px solid ${G.border}`}}>
              <Toggle on={tools[tool.k]} color={tool.s.h} onChange={()=>setTools(tv=>({...tv,[tool.k]:!tv[tool.k]}))}/>
              <div style={{width:34,height:34,borderRadius:11,background:`linear-gradient(140deg, ${tool.s.h}1F, ${tool.s.h}33)`,border:`1px solid ${tool.s.h}30`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`inset 0 1px 0 rgba(255,255,255,0.5)`}}>
                <NavIcon type={tool.t} active={true} color={tool.s.deep} size={20}/>
              </div>
              <span style={{fontFamily:G.font,fontWeight:500,color:G.ink,fontSize:14,letterSpacing:.1,flex:1}}>{tool.l}</span>
            </div>
          ))}
        </div>
        {tools.timer&&(
          <div style={{background:SCREENS.timer.hll,borderRadius:16,padding:18,border:`1px solid ${SCREENS.timer.hl}`,marginBottom:18}}>
            <SLabel>{t.timerSettings}</SLabel>
            <SLabel>{t.allowedTimers}</SLabel>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
              {TTYPES.map(k=>{const on=tc.allowedTypes.includes(k);return <button key={k} onClick={()=>setTc(x=>({...x,allowedTypes:on?x.allowedTypes.filter(a=>a!==k):[...x.allowedTypes,k]}))} style={{padding:"14px 4px 10px",borderRadius:13,border:"1px solid",fontFamily:G.font,fontWeight:600,fontSize:11,cursor:"pointer",borderColor:on?SCREENS.timer.h:G.border,background:on?SCREENS.timer.hl:"transparent",color:on?SCREENS.timer.deep:G.ink2,display:"flex",flexDirection:"column",alignItems:"center",gap:6,transition:"all .2s"}}><TimerIcon type={k} size={20} color={on?SCREENS.timer.deep:G.ink2}/><div>{tlbl(k,t)}</div></button>;})}
            </div>
            <SLabel>{t.defaultTimer}</SLabel>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              {tc.allowedTypes.map(k=><button key={k} onClick={()=>setTc(x=>({...x,defaultType:k}))} style={{padding:"7px 12px 7px 10px",borderRadius:11,border:"1px solid",fontFamily:G.font,fontWeight:600,fontSize:12,cursor:"pointer",borderColor:tc.defaultType===k?SCREENS.timer.h:G.border,background:tc.defaultType===k?SCREENS.timer.h:"transparent",color:tc.defaultType===k?"#fff":G.ink2,display:"flex",alignItems:"center",gap:6,transition:"all .2s"}}><TimerIcon type={k} size={14} color={tc.defaultType===k?"#fff":G.ink2}/>{tlbl(k,t)}</button>)}
            </div>
          </div>
        )}
        {tools.emotion&&(
          <div style={{background:SCREENS.emotion.hll,borderRadius:16,padding:18,border:`1px solid ${SCREENS.emotion.hl}`,marginBottom:18}}>
            <SLabel>{t.visibleEmotions}</SLabel>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {EMOS.map(e=>{const on=vEmos.includes(e.id);return <button key={e.id} onClick={()=>setVEmos(v=>on?v.filter(i=>i!==e.id):[...v,e.id])} style={{padding:"10px 12px",borderRadius:14,border:`1px solid ${on?e.color:G.border}`,background:on?`${e.color}15`:"transparent",cursor:"pointer",display:"flex",alignItems:"center",gap:7,fontFamily:G.font,fontWeight:600,fontSize:12,color:on?e.color:G.ink3}}><span style={{fontSize:18}}>{e.emoji}</span>{lang==="sv"?e.sv:e.en}</button>;})}
            </div>
          </div>
        )}
        <div style={{height:1,background:G.border,marginBottom:20}}/>
        <SLabel>{t.syncTitle}</SLabel>
        {[[false,t.sameDevice,t.sameDeviceDesc],[true,t.syncMode,t.syncModeDesc]].map(([v,title,desc])=>(
          <div key={String(v)} onClick={()=>setSm(v)} style={{borderRadius:14,border:`1px solid ${sm===v?S.h:G.border}`,background:sm===v?S.hll:"transparent",padding:"13px 16px",marginBottom:10,cursor:"pointer"}}>
            <div style={{fontFamily:G.font,fontWeight:700,fontSize:14,color:sm===v?S.h:G.ink,marginBottom:2}}>{title}</div>
            <div style={{fontFamily:G.font,fontSize:12,color:G.ink2}}>{desc}</div>
          </div>
        ))}
        {sm&&(
          <div style={{background:S.hll,borderRadius:14,padding:16,border:`1px solid ${S.hl}`}}>
            <SLabel>{t.yourCode}</SLabel>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
              <div style={{fontFamily:G.serif,fontWeight:600,fontSize:26,color:S.h,letterSpacing:5,background:G.white,padding:"10px 22px",borderRadius:12,border:`1px solid ${S.hl}`}}>{shareCode}</div>
              <button onClick={copy} className="lt-press-soft" style={{...GHOST,padding:"10px 13px",display:"flex",alignItems:"center",gap:6}}>
                {cp?(
                  <><IconCheck size={14} className="" strokeWidth={2.4}/><span>{t.copied.replace(" ✓","")}</span></>
                ):(
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                    <path d="M5 15 H4 a2 2 0 0 1 -2 -2 V4 a2 2 0 0 1 2 -2 h9 a2 2 0 0 1 2 2 v1"/>
                  </svg>
                )}
              </button>
            </div>
            <div style={{fontFamily:G.font,fontSize:12,color:G.ink2,marginBottom:14}}>{t.codeHint}</div>
            <SLabel>{t.enterCode}</SLabel>
            <div style={{display:"flex",gap:7}}>
              <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} maxLength={4} placeholder="AB3X" className="lt-input" style={{...INP,marginBottom:0,textAlign:"center",fontFamily:G.serif,fontWeight:600,fontSize:20,letterSpacing:4,flex:1}}/>
              <button onClick={conn} style={{padding:"0 16px",borderRadius:12,border:"none",background:SCREENS.emotion.h,color:"#fff",fontFamily:G.font,fontWeight:700,cursor:"pointer"}}>{t.connect}</button>
            </div>
            {err&&<div style={{color:"#EF4444",fontFamily:G.font,fontSize:12,marginTop:6}}>{err}</div>}
          </div>
        )}
        <button onClick={save} className="lt-press saveBtn" style={{marginTop:20,width:"100%",padding:"15px 0",borderRadius:14,border:"none",background:S.h,color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:15,cursor:"pointer",boxShadow:sh.c(S.h),display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          <svg className="saveTick" width="15" height="15" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
            <path d="M2.5 7.2 L5.8 10.5 L11.5 3.5"/>
          </svg>
          {t.save}
        </button>

        {/* Caregiver demo entry */}
        {onOpenDemo&&(
          <div style={{marginTop:32,paddingTop:24,borderTop:`1px solid ${G.border}`}}>
            <SLabel>{lang==="sv"?"Demo":"Demo"}</SLabel>
            <div style={{fontFamily:G.font,fontSize:12,color:G.ink2,marginBottom:10,lineHeight:1.4}}>
              {lang==="sv"?"En filmisk rundtur av Lumas verktyg. ~60 sekunder.":"A cinematic tour of Luma's features. ~60 seconds."}
            </div>
            <button onClick={onOpenDemo} style={{width:"100%",padding:"13px 0",borderRadius:13,border:"none",background:"linear-gradient(135deg,#1F1B2E,#3A3450)",color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:14,cursor:"pointer",boxShadow:"0 8px 18px rgba(31,27,46,0.18)",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              ▶ {lang==="sv"?"Visa demo":"Play demo"}
            </button>
            {/* Replay welcome → demo as if first-run, without wiping any data */}
            {onOpenWelcomeTour&&(
              <button onClick={onOpenWelcomeTour} className="lt-press-soft" style={{width:"100%",marginTop:8,padding:"11px 0",borderRadius:12,border:`1px solid ${G.border}`,background:"transparent",color:G.ink2,fontFamily:G.font,fontWeight:500,fontSize:13,cursor:"pointer",letterSpacing:.2,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 12 a9 9 0 1 0 3 -6.7 L3 8"/>
                  <polyline points="3 3 3 8 8 8"/>
                </svg>
                {lang==="sv"?"Visa rundtur från början":"Replay welcome tour"}
              </button>
            )}
          </div>
        )}

        {onOpenSupervisor&&(
          <div style={{marginTop:32,paddingTop:24,borderTop:`1px solid ${G.border}`}}>
            <SLabel>{lang==="sv"?"Stödperson":"Caregiver"}</SLabel>
            <div style={{fontFamily:G.font,fontSize:12,color:G.ink2,marginBottom:10,lineHeight:1.4}}>
              {lang==="sv"?"Förhandstitt på webbverktyget där pedagoger hanterar flera klienter på distans.":"Preview of the web tool where caregivers manage multiple clients remotely."}
            </div>
            <button onClick={onOpenSupervisor} style={{width:"100%",padding:"13px 0",borderRadius:13,border:"none",background:`linear-gradient(135deg,${S.h},${S.deep})`,color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:14,cursor:"pointer",boxShadow:sh.c(S.h),display:"flex",alignItems:"center",justifyContent:"center",gap:9}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17 21 v-2 a4 4 0 0 0 -4 -4 H5 a4 4 0 0 0 -4 4 v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21 v-2 a4 4 0 0 0 -3 -3.87"/>
                <path d="M16 3.13 a4 4 0 0 1 0 7.75"/>
              </svg>
              {lang==="sv"?"Öppna stödpersonsvy":"Open caregiver view"}
              <span style={{fontFamily:G.font,fontWeight:600,fontSize:10,padding:"2px 7px",borderRadius:5,background:"rgba(255,255,255,0.25)",letterSpacing:1}}>DEMO</span>
            </button>
          </div>
        )}

        {/* Reset all data — destructive action at the bottom */}
        <div style={{marginTop:32,paddingTop:24,borderTop:`1px solid ${G.border}`}}>
          <SLabel>{t.resetSection}</SLabel>
          <div style={{fontFamily:G.font,fontSize:12,color:G.ink2,marginBottom:10,lineHeight:1.4}}>{t.resetDataDesc}</div>
          <button onClick={()=>{
            if(typeof window!=="undefined"&&window.confirm(t.resetDataConfirm)){
              try{
                Object.keys(localStorage).forEach(k=>{if(k.startsWith("luma_v1_"))localStorage.removeItem(k);});
                window.location.reload();
              }catch(_){}
            }
          }} className="lt-press-soft" style={{width:"100%",padding:"12px 0",borderRadius:12,border:`1px solid #EF444433`,background:"#FEF2F2",color:"#EF4444",fontFamily:G.font,fontWeight:600,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6 h18"/>
              <path d="M8 6 V4 a2 2 0 0 1 2-2 h4 a2 2 0 0 1 2 2 v2"/>
              <path d="M19 6 l-1 14 a2 2 0 0 1 -2 2 H8 a2 2 0 0 1 -2 -2 L5 6"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
            {t.resetDataBtn}
          </button>
        </div>
      </Sheet>
    </Overlay>
  );
}

/* ═══ Communication board ═══ */
function CommBoard({lang,t,isEditor,cats,setCats,sel,setSel,openModal}){
  const[spoken,setSpoken]=useState(null);
  const tabBarRef=useRef(null);
  /* Drag-to-reorder state for category pills (editor only).
     Long-press a pill to "pick it up", then drag horizontally over neighbours
     to swap their positions live. Release to drop. Tap (no drag) still works
     normally for selecting / opening the edit modal. */
  const[dragId,setDragId]=useState(null);     // id of pill being dragged, null = idle
  const dragRef=useRef({
    id:null,        // pill being dragged
    startX:0,       // initial pointer X
    startIdx:0,     // initial array index
    pillRects:[],   // {id, left, right, width} for all pills at drag start
    pressTimer:0,   // long-press timer
  });
  // When selection changes (e.g. after adding a new category), scroll the tab-bar
  // horizontally so the active category is visible — otherwise new cats hide off-screen.
  // Skipped while a pill is actively being dragged: selection often follows the
  // dragged pill, which would cause the scroll to fight the drag motion.
  useEffect(()=>{
    if(!tabBarRef.current) return;
    if(dragId) return; // mid-drag: don't compete with the user's gesture
    const bar=tabBarRef.current;
    const activeBtn=bar.children[sel];
    if(!activeBtn) return;
    const left=activeBtn.offsetLeft;
    const right=left+activeBtn.offsetWidth;
    const viewLeft=bar.scrollLeft;
    const viewRight=viewLeft+bar.clientWidth;
    if(right>viewRight) bar.scrollTo({left:right-bar.clientWidth+12,behavior:"smooth"});
    else if(left<viewLeft) bar.scrollTo({left:Math.max(0,left-12),behavior:"smooth"});
  },[sel,cats.length,dragId]);

  // When entering editor mode, scroll the tab bar to its end so the "+"
  // (Lägg till / Add) button immediately reveals itself. This makes the
  // affordance discoverable — otherwise users with many categories would
  // never see that adding more is possible. Small delay so the bar has
  // re-rendered with the new editor-mode children before we scroll.
  useEffect(()=>{
    if(!isEditor||!tabBarRef.current) return;
    const bar=tabBarRef.current;
    const id=setTimeout(()=>{
      bar.scrollTo({left:bar.scrollWidth-bar.clientWidth,behavior:"smooth"});
    },180);
    return()=>clearTimeout(id);
  },[isEditor]);
  const S=SCREENS.comm;
  const speak=card=>{setSpoken(card.id);setTimeout(()=>setSpoken(null),1400);if(window.speechSynthesis){const u=new SpeechSynthesisUtterance(lang==="sv"?card.sv:card.en);u.lang=lang==="sv"?"sv-SE":"en-US";window.speechSynthesis.speak(u);}};

  /* ─── Category reorder via drag (editor mode only) ───
     Architecture notes (key to making this smooth):
     1. The dragged pill's translateX is mutated DIRECTLY on the DOM element
        via a ref, not through React state. setState per pointermove caused
        re-renders that fought the gesture on iOS. The dragId state still
        flips to set up CSS (z-index, shadow) but offset is pure DOM mutation.
     2. The cats array is read from a ref inside the move handler. React state
        captured in closure goes stale after the first swap.
     3. Swap rule uses pill centres + hysteresis: a swap fires only when the
        dragged centre crosses the neighbour's centre by 18%. Without this the
        pill flickers back and forth when held exactly at a boundary. */
  const catsRef=useRef(cats);
  useEffect(()=>{catsRef.current=cats;},[cats]);
  const draggedElRef=useRef(null); // live DOM node of the dragged pill
  const startDrag=(ev,catId,idx,el)=>{
    if(!isEditor) return;
    const pointerX=ev.touches?ev.touches[0].clientX:ev.clientX;
    const pointerY0=ev.touches?ev.touches[0].clientY:ev.clientY;
    let cancelled=false;
    let movedBeforeTimer=false;
    const onPreMove=(e)=>{
      const px=e.touches?e.touches[0].clientX:e.clientX;
      const py=e.touches?e.touches[0].clientY:e.clientY;
      if(Math.abs(px-pointerX)>6||Math.abs(py-pointerY0)>6){
        movedBeforeTimer=true;
        cleanup();
      }
    };
    const cleanup=()=>{
      cancelled=true;
      clearTimeout(dragRef.current.pressTimer);
      window.removeEventListener("pointermove",onPreMove);
      window.removeEventListener("touchmove",onPreMove);
      window.removeEventListener("pointerup",cleanup);
      window.removeEventListener("touchend",cleanup);
    };
    window.addEventListener("pointermove",onPreMove,{passive:true});
    window.addEventListener("touchmove",onPreMove,{passive:true});
    window.addEventListener("pointerup",cleanup,{passive:true});
    window.addEventListener("touchend",cleanup,{passive:true});

    dragRef.current.pressTimer=setTimeout(()=>{
      if(cancelled||movedBeforeTimer) return;
      window.removeEventListener("pointermove",onPreMove);
      window.removeEventListener("touchmove",onPreMove);
      window.removeEventListener("pointerup",cleanup);
      window.removeEventListener("touchend",cleanup);
      if(!tabBarRef.current||!el) return;
      // Snapshot the rectangles of all pills at pickup time. These are used
      // as fixed anchor points for hit-testing during the drag — we never
      // re-measure during the gesture (re-measuring while sibling layout
      // shifts causes the kind of jitter we're trying to eliminate).
      const bar=tabBarRef.current;
      const rects=[];
      Array.from(bar.children).forEach((child,childIdx)=>{
        if(childIdx>=catsRef.current.length) return; // skip "+" add button
        const r=child.getBoundingClientRect();
        rects.push({id:catsRef.current[childIdx].id,left:r.left,right:r.right,centre:(r.left+r.right)/2,width:r.width});
      });
      dragRef.current.id=catId;
      dragRef.current.startX=pointerX;
      dragRef.current.startIdx=idx;
      dragRef.current.pillRects=rects;
      dragRef.current.lastTargetIdx=idx;
      draggedElRef.current=el;
      setDragId(catId);
      if(navigator.vibrate) navigator.vibrate(8);
      window.addEventListener("pointermove",onDragMove,{passive:false});
      window.addEventListener("touchmove",onDragMove,{passive:false});
      window.addEventListener("pointerup",endDrag,{passive:true});
      window.addEventListener("touchend",endDrag,{passive:true});
      window.addEventListener("pointercancel",endDrag,{passive:true});
    },280);
  };
  const onDragMove=(e)=>{
    e.preventDefault?.();
    const px=e.touches?e.touches[0].clientX:e.clientX;
    const dx=px-dragRef.current.startX;
    // Direct DOM mutation — no React re-render. The transform follows the
    // finger at native compositor speed regardless of how fast you move.
    const el=draggedElRef.current;
    if(el) el.style.transform=`translateX(${dx}px) scale(1.04)`;
    // Hit-test against frozen pickup-time rectangles. The dragged pill's
    // VISUAL centre = its original centre + dx. We then ask: which neighbour
    // does our visual centre fall inside, with hysteresis to avoid flicker.
    const rects=dragRef.current.pillRects;
    const cs=catsRef.current;
    const idxNow=cs.findIndex(c=>c.id===dragRef.current.id);
    if(idxNow<0) return;
    const myRect=rects.find(rt=>rt.id===dragRef.current.id);
    if(!myRect) return;
    const myCentreNow=myRect.centre+dx;
    // Decide target index: scan from current position outward. A swap fires
    // when our centre passes a neighbour's centre by HYSTERESIS_PX — small
    // enough to feel responsive, large enough that holding near a boundary
    // doesn't oscillate.
    const HYSTERESIS=12;
    let targetIdx=dragRef.current.lastTargetIdx;
    if(dx>0){
      // Moving right — check pills to the right of current position
      for(let i=targetIdx+1;i<rects.length;i++){
        if(myCentreNow > rects[i].centre + HYSTERESIS){
          targetIdx=i;
        } else break;
      }
      // Also allow stepping back left (one pill) if user reverses
      if(targetIdx>0 && myCentreNow < rects[targetIdx].centre - HYSTERESIS){
        targetIdx--;
      }
    } else {
      // Moving left — check pills to the left
      for(let i=targetIdx-1;i>=0;i--){
        if(myCentreNow < rects[i].centre - HYSTERESIS){
          targetIdx=i;
        } else break;
      }
      if(targetIdx<rects.length-1 && myCentreNow > rects[targetIdx].centre + HYSTERESIS){
        targetIdx++;
      }
    }
    if(targetIdx!==idxNow){
      dragRef.current.lastTargetIdx=targetIdx;
      // Swap in the cats array via setCats. catsRef updates next render via
      // its useEffect, so subsequent move handlers see the new order.
      const newCats=[...cs];
      const[moved]=newCats.splice(idxNow,1);
      newCats.splice(targetIdx,0,moved);
      setCats(newCats);
      if(sel===idxNow) setSel(targetIdx);
      // After React commits and DOM reorders, the dragged pill jumps to a new
      // slot. Compensate visually so it looks like it never moved: reset
      // startX so dx represents offset from the NEW slot rather than old.
      requestAnimationFrame(()=>{
        if(!tabBarRef.current||!draggedElRef.current) return;
        const bar=tabBarRef.current;
        // Refresh rects so future swap decisions use new layout positions
        const refreshed=[];
        Array.from(bar.children).forEach((child,childIdx)=>{
          if(childIdx>=newCats.length) return;
          const r=child.getBoundingClientRect();
          refreshed.push({id:newCats[childIdx].id,left:r.left,right:r.right,centre:(r.left+r.right)/2,width:r.width});
        });
        dragRef.current.pillRects=refreshed;
        // Visual correction: figure out where the pill should be visually
        // (at the finger) given its NEW base slot, and reset startX so dx
        // produces that offset. This avoids any visible jump.
        const myNew=refreshed.find(rt=>rt.id===dragRef.current.id);
        if(myNew){
          // The pill's natural centre is now myNew.centre. We want visual
          // centre at the finger (px). So dx should be (px - myNew.centre).
          dragRef.current.startX=px-(px-myNew.centre);
          // Apply the new transform immediately to avoid a 1-frame flash
          const newDx=px-dragRef.current.startX;
          if(draggedElRef.current) draggedElRef.current.style.transform=`translateX(${newDx}px) scale(1.04)`;
        }
      });
    }
  };
  const endDrag=()=>{
    const el=draggedElRef.current;
    if(el){
      // Smoothly release the pill back to its slot — transform falls back to
      // the static "translateX(0) scale(1)" applied via React style, but we
      // also briefly enable a transition so the snap is animated.
      el.style.transition="transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)";
      el.style.transform="translateX(0) scale(1)";
      // Clear the transition after it completes so it doesn't interfere with
      // the next pickup (which needs immediate response).
      setTimeout(()=>{
        if(el){el.style.transition="";el.style.transform="";}
      },300);
    }
    draggedElRef.current=null;
    setDragId(null);
    dragRef.current.id=null;
    window.removeEventListener("pointermove",onDragMove);
    window.removeEventListener("touchmove",onDragMove);
    window.removeEventListener("pointerup",endDrag);
    window.removeEventListener("touchend",endDrag);
    window.removeEventListener("pointercancel",endDrag);
  };
  // Cleanup any dangling listeners if the component unmounts mid-drag
  useEffect(()=>()=>{
    clearTimeout(dragRef.current.pressTimer);
    window.removeEventListener("pointermove",onDragMove);
    window.removeEventListener("touchmove",onDragMove);
    window.removeEventListener("pointerup",endDrag);
    window.removeEventListener("touchend",endDrag);
    window.removeEventListener("pointercancel",endDrag);
  // eslint-disable-next-line
  },[]);

  const cat=cats[sel];
  if(!cat) return null;
  return(
    <>
    {/* Background adapts to the active category's color.
        A very soft radial tint at the top of the screen fades down into
        the neutral S.hb base, so switching categories feels like the screen
        gently warming/cooling rather than jumping. 0.5s ease so the change
        is perceived but never abrupt. The tint stays light enough that
        contrast against cards is preserved. */}
    <div style={{
      flex:1,display:"flex",flexDirection:"column",overflow:"hidden",
      background:`radial-gradient(ellipse 140% 70% at 50% 0%, ${cat.color}26 0%, ${cat.color}10 35%, ${S.hb} 75%)`,
      transition:"background 0.5s ease",
    }}>
      {/* Tab bar — pills + "+" button all live inside the same scroll
          container as flex children. The + button is just the rightmost
          item, so it's always reachable by scrolling.

          To make it discoverable, we auto-scroll to the end whenever the
          user enters editor mode (see effect below). overflowX switches to
          hidden during drag-reorder. */}
      <div ref={tabBarRef} style={{padding:"18px 16px 10px",display:"flex",gap:8,overflowX:dragId?"hidden":"auto",alignItems:"center",scrollBehavior:"smooth",flexShrink:0}}>
        {cats.map((c,i)=>{
          const active=sel===i;
          const isDragging=dragId===c.id;
          // Other pills slide aside subtly during drag — handled implicitly by
          // their natural flex layout shifting as the array reorders. The
          // dragged pill's transform is mutated directly on the DOM (see
          // drag handlers) rather than via React style — this is what keeps
          // the gesture smooth.
          return(
            <div key={c.id} ref={el=>{if(isDragging) draggedElRef.current=el;}} style={{
              position:"relative",flexShrink:0,paddingTop:isEditor?6:0,
              transition:isDragging?"none":"transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)",
              zIndex:isDragging?10:1,
              touchAction:isEditor?"none":"auto",
              willChange:isDragging?"transform":"auto",
            }}>
              <button
                onPointerDown={isEditor?(e)=>startDrag(e,c.id,i,e.currentTarget.parentElement):undefined}
                onClick={()=>{
                  // Ignore the click if a drag just ended (the pointerup that
                  // ended the drag also fires a click — suppress if we'd just
                  // been dragging this pill).
                  if(dragId===c.id) return;
                  if(active&&isEditor){openModal({type:"editCat",catId:c.id});}else{setSel(i);}
                }}
                style={{
                  padding:"9px 18px",borderRadius:22,border:"1px solid",
                  borderColor:active?c.color:isDragging?c.color:G.border,
                  background:active?c.color:G.white,
                  color:active?"#fff":G.ink2,
                  fontFamily:G.font,fontWeight:600,fontSize:13.5,
                  cursor:isEditor?"grab":"pointer",
                  whiteSpace:"nowrap",
                  // Dragged: neutral compact shadow + colored ring. Stays small
                  // enough to not bleed past the tab-bar's bottom edge into
                  // the cards grid below. The colored ring (border) signals
                  // identity, the neutral shadow signals depth/lift.
                  boxShadow:isDragging
                    ?`0 4px 10px rgba(31,27,46,0.14), 0 0 0 3px ${c.color}22`
                    :active?sh.c(c.color):sh.xs,
                  display:"inline-flex",alignItems:"center",gap:active&&isEditor?6:0,
                  userSelect:"none",WebkitUserSelect:"none",
                  transition:isDragging?"none":"box-shadow .22s ease, border-color .22s ease",
                }}>
                <span>{lang==="sv"?c.sv:c.en}</span>
                {active&&isEditor&&(
                  <span style={{opacity:0.85,display:"inline-flex",alignItems:"center"}}>
                    <IconPencil size={11}/>
                  </span>
                )}
              </button>
              {isEditor&&cats.length>1&&(
                <button onClick={e=>{e.stopPropagation();openModal({type:"confirmDel",catId:c.id});}} aria-label="Ta bort kategori" className="lt-press-soft" style={{position:"absolute",top:-2,right:-6,width:22,height:22,borderRadius:"50%",border:`1.5px solid ${G.white}`,background:"rgba(31,27,46,0.72)",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0,zIndex:2,boxShadow:"0 2px 6px rgba(31,27,46,0.18)"}}>
                  <IconX size={9}/>
                </button>
              )}
            </div>
          );
        })}
        {isEditor&&(
          <button
            type="button"
            onClick={()=>openModal({type:"addCat"})}
            className="lt-press-soft"
            aria-label={t.addCat}
            style={{
              flexShrink:0,
              padding:"7px 14px",borderRadius:22,
              border:`1.5px dashed ${cat.color?withAlpha(cat.color,0.45):G.border2}`,
              background:cat.color?withAlpha(cat.color,0.05):"transparent",
              color:cat.color?shade(cat.color,-0.25):G.ink2,
              fontFamily:G.font,fontWeight:600,fontSize:13,
              cursor:"pointer",
              display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,
              height:34,touchAction:"manipulation",
              whiteSpace:"nowrap",
              transition:"background .25s ease, border-color .25s ease, color .25s ease",
            }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>{lang==="sv"?"Lägg till":"Add"}</span>
          </button>
        )}
      </div>
      <div style={{flex:1,padding:14,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,overflowY:"auto",alignContent:"start"}}>
        {cat.cards.length===0&&!isEditor&&(
          <div style={{gridColumn:"1 / -1",padding:"50px 24px",textAlign:"center"}}>
            <style>{`@keyframes commEmpty{0%,100%{transform:translateY(0);opacity:0.85}50%{transform:translateY(-3px);opacity:1}}`}</style>
            <svg width="56" height="56" viewBox="0 0 64 64" style={{display:"block",margin:"0 auto 14px",animation:"commEmpty 4.6s ease-in-out infinite"}}>
              <rect x="13" y="18" width="38" height="28" rx="6" fill={`${cat.color}14`} stroke={`${cat.color}55`} strokeWidth="1.4"/>
              <circle cx="22" cy="29" r="3" fill={`${cat.color}99`}/>
              <path d="M16 40 l8-8 l6 5 l8-10 l8 13" fill="none" stroke={`${cat.color}99`} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div style={{fontFamily:G.serif,fontWeight:500,fontSize:18,color:G.ink,letterSpacing:-.3,lineHeight:1.2,marginBottom:6}}>
              {lang==="sv"?"Inga kort än":"No cards yet"}
            </div>
            <div style={{fontFamily:G.font,fontWeight:400,fontSize:13,color:"#9892AA",lineHeight:1.4}}>
              {lang==="sv"?`Aktivera redigering för att lägga till kort i "${cat.sv}".`:`Enable editing to add cards to "${cat.en}".`}
            </div>
          </div>
        )}
        {cat.cards.map(card=>{const active=spoken===card.id;return(
          <div key={card.id} style={{position:"relative"}}>
            <div onClick={()=>speak(card)} style={{background:active?cat.color:G.white,borderRadius:20,padding:card.photo?"6px 6px 12px":"20px 8px 16px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:card.photo?6:10,border:`1px solid ${active?cat.color:G.border}`,boxShadow:active?sh.c(cat.color):sh.xs,transform:active?"scale(0.94)":"scale(1)",transition:"all .18s ease"}}>
              {card.photo
                ? <img src={card.photo} alt="" style={{width:"100%",aspectRatio:"1/1",objectFit:"cover",borderRadius:14,display:"block"}}/>
                : <span style={{fontSize:38}}>{card.emoji}</span>}
              <span style={{fontFamily:G.font,fontWeight:600,fontSize:13,textAlign:"center",color:active?"#fff":G.ink,lineHeight:1.2,letterSpacing:-0.1}}>{lang==="sv"?card.sv:card.en}</span>
            </div>
            {isEditor&&<button onClick={()=>setCats(cs=>cs.map((c,i)=>i!==sel?c:{...c,cards:c.cards.filter(x=>x.id!==card.id)}))} aria-label="Ta bort kort" className="lt-press-soft" style={{position:"absolute",top:5,right:5,width:24,height:24,borderRadius:"50%",border:`1.5px solid ${G.white}`,background:"rgba(31,27,46,0.55)",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0,zIndex:2,boxShadow:"0 2px 6px rgba(31,27,46,0.18)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)"}}>
              <IconX size={10}/>
            </button>}
          </div>
        );})}
        {isEditor&&(
          <button onClick={()=>openModal({type:"addCard",catIdx:sel})} className="lt-press-soft" style={{borderRadius:20,padding:"22px 8px 18px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:10,border:`1.5px dashed ${cat.color}55`,background:`linear-gradient(140deg, ${cat.color}06, ${cat.color}10)`,color:cat.color,fontFamily:G.font}}>
            <div style={{width:34,height:34,borderRadius:"50%",background:`${cat.color}1A`,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={cat.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </div>
            <span style={{fontWeight:600,fontSize:12,letterSpacing:.1,color:cat.color}}>{lang==="sv"?"Nytt kort":"New card"}</span>
          </button>
        )}
      </div>
      </div>
    </>
  );
}

/* ═══ Comm modals — rendered at App level to escape body wrapper's overflow:hidden clip ═══ */
function CommModals({modal,onClose,cats,setCats,lang,t,setSel}){
  const S=SCREENS.comm;
  const[name,setName]=useState("");
  const[color,setColor]=useState(ACT_C[0]);
  const[cardEmoji,setCardEmoji]=useState("😊");
  const[cardText,setCardText]=useState("");
  const[cardPhoto,setCardPhoto]=useState(null);
  const[ePage,setEPage]=useState(0);
  const fileRef=useRef(null);
  const pp=40;

  // Initialize fields when modal opens
  useEffect(()=>{
    if(!modal) return;
    if(modal.type==="addCat"){setName("");setColor(ACT_C[0]);}
    else if(modal.type==="editCat"){
      const c=cats.find(x=>x.id===modal.catId);
      if(c){setName(lang==="sv"?c.sv:c.en);setColor(c.color);}
    }
    else if(modal.type==="addCard"){
      setCardEmoji("😊");setCardText("");setCardPhoto(null);setEPage(0);
    }
  // eslint-disable-next-line
  },[modal]);

  if(!modal) return null;
  const cat=modal.catIdx!=null?cats[modal.catIdx]:(modal.catId?cats.find(c=>c.id===modal.catId):null);

  const onPhoto=e=>{
    const f=e.target.files?.[0];
    if(!f) return;
    const r=new FileReader();
    r.onload=()=>{
      const img=new Image();
      img.onload=()=>{
        const max=400;
        const scale=Math.min(1,max/Math.max(img.width,img.height));
        const w=img.width*scale, h=img.height*scale;
        const cv=document.createElement("canvas");
        cv.width=w; cv.height=h;
        cv.getContext("2d").drawImage(img,0,0,w,h);
        setCardPhoto(cv.toDataURL("image/jpeg",0.82));
      };
      img.src=r.result;
    };
    r.readAsDataURL(f);
  };

  if(modal.type==="confirmDel"){
    const delCat=cats.find(c=>c.id===modal.catId);
    if(!delCat) return null;
    const delIdx=cats.findIndex(c=>c.id===modal.catId);
    const cardCount=delCat.cards.length;
    return(
      <div onClick={onClose} style={{
        position:"fixed",inset:0,
        background:"rgba(31,27,46,0.55)",
        display:"flex",alignItems:"center",justifyContent:"center",
        zIndex:9700,padding:24,
        animation:"ovlIn 0.32s cubic-bezier(0.32, 0.72, 0, 1) both",
      }}>
        <div onClick={e=>e.stopPropagation()} style={{
          maxWidth:360,width:"100%",
          background:G.white,borderRadius:24,
          padding:"28px 24px 22px",
          boxShadow:"0 24px 60px rgba(31,27,46,0.28), 0 6px 16px rgba(31,27,46,0.12)",
          border:`1px solid ${G.border}`,
          animation:"asaPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both",
          textAlign:"center",
        }}>
          <style>{`@keyframes asaPop{0%{opacity:0;transform:scale(0.85)}100%{opacity:1;transform:scale(1)}}`}</style>
          <div style={{
            width:54,height:54,borderRadius:"50%",
            background:`linear-gradient(140deg, ${delCat.color}22, ${delCat.color}44)`,
            border:`1px solid ${delCat.color}55`,
            display:"flex",alignItems:"center",justifyContent:"center",
            margin:"0 auto 16px",
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={delCat.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"/>
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <path d="M19 6l-1.2 14a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 6"/>
            </svg>
          </div>
          <div style={{fontFamily:G.serif,fontWeight:500,fontSize:22,color:G.ink,letterSpacing:-.3,lineHeight:1.2,marginBottom:8}}>
            {lang==="sv"?"Radera kategori?":"Delete category?"}
          </div>
          <div style={{fontFamily:G.font,fontWeight:400,fontSize:14,color:G.ink2,lineHeight:1.45,marginBottom:22}}>
            {lang==="sv"
              ? <>Är du säker på att du vill radera <strong style={{color:G.ink,fontWeight:600}}>"{delCat.sv}"</strong>?{cardCount>0&&<> Detta tar också bort {cardCount} {cardCount===1?"kort":"kort"}.</>}</>
              : <>Are you sure you want to delete <strong style={{color:G.ink,fontWeight:600}}>"{delCat.en}"</strong>?{cardCount>0&&<> This will also remove {cardCount} {cardCount===1?"card":"cards"}.</>}</>}
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={onClose} className="lt-press-soft" style={{flex:1,padding:"13px 0",borderRadius:13,border:`1px solid ${G.border}`,background:G.white,color:G.ink2,fontFamily:G.font,fontWeight:600,fontSize:14,cursor:"pointer"}}>
              {t.cancel}
            </button>
            <button onClick={()=>{
              setCats(cs=>cs.filter(x=>x.id!==modal.catId));
              setSel(s=>{if(s>=delIdx&&s>0)return Math.max(0,s-1);return s;});
              onClose();
            }} className="lt-press" style={{flex:1.2,padding:"13px 0",borderRadius:13,border:"none",background:"#D45A5A",color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:14,cursor:"pointer",boxShadow:"0 8px 20px rgba(212,90,90,0.45), 0 2px 6px rgba(212,90,90,0.25)"}}>
              {lang==="sv"?"Radera":"Delete"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // editCat
  if(modal.type==="editCat"){
    return(
      <Overlay onClose={onClose}>
        <Sheet scroll>
          <div style={{fontFamily:G.serif,fontWeight:500,fontSize:26,color:G.inkSoft,marginBottom:6,letterSpacing:-.5}}>{t.renameCat}</div>
          <div style={{fontFamily:G.font,fontWeight:400,fontSize:13,color:G.ink3,marginBottom:24,lineHeight:1.4}}>{lang==="sv"?"Ändra namn och färg.":"Change name and color."}</div>
          <SLabel>{t.catName}</SLabel>
          <input value={name} onChange={e=>setName(e.target.value)} className="lt-input" style={INP} autoFocus/>
          <div style={{height:18}}/>
          <SLabel>{t.pickColor}</SLabel>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(46px, 1fr))",gap:10,marginBottom:24}}>
            {ACT_C.map(col=>{
              const active=color===col;
              return(
                <button key={col} onClick={()=>setColor(col)} className="lt-press-soft" style={{
                  aspectRatio:"1/1",borderRadius:14,background:col,
                  border:active?`3px solid ${G.ink}`:`1px solid ${col}55`,
                  boxShadow:active?`0 6px 16px ${col}66`:`0 2px 6px ${col}22`,
                  cursor:"pointer",
                  transition:"transform .25s cubic-bezier(0.34, 1.56, 0.64, 1), border-width .2s, box-shadow .2s",
                  transform:active?"scale(1.05)":"scale(1)",
                  padding:0,position:"relative",
                }}>
                  {active&&(
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",filter:"drop-shadow(0 1px 2px rgba(0,0,0,0.3))"}}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
          <div style={{display:"flex",gap:10,marginTop:8}}>
            <button onClick={onClose} className="lt-press-soft" style={{flex:1,...GHOST}}>{t.cancel}</button>
            <button onClick={()=>{
              if(!name.trim())return;
              setCats(cs=>cs.map(c=>c.id!==modal.catId?c:{...c,sv:name,en:name,color}));
              onClose();
            }} className="lt-press" style={{flex:2,padding:"14px 0",borderRadius:14,border:"none",background:color,color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:15,cursor:"pointer",boxShadow:`0 8px 20px ${color}55, 0 2px 6px ${color}33`}}>{t.save}</button>
          </div>
        </Sheet>
      </Overlay>
    );
  }

  // addCat
  if(modal.type==="addCat"){
    return(
      <Overlay onClose={onClose}>
        <Sheet scroll>
          <div style={{fontFamily:G.serif,fontWeight:500,fontSize:26,color:G.inkSoft,marginBottom:6,letterSpacing:-.5}}>{t.addCat}</div>
          <div style={{fontFamily:G.font,fontWeight:400,fontSize:13,color:G.ink3,marginBottom:24,lineHeight:1.4}}>{lang==="sv"?"Skapa en ny kategori för dina kort.":"Create a new category for your cards."}</div>
          <SLabel>{t.catName}</SLabel>
          <input value={name} onChange={e=>setName(e.target.value)} className="lt-input" style={INP} placeholder="t.ex. Mat" autoFocus/>
          <div style={{height:18}}/>
          <SLabel>{t.pickColor}</SLabel>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(46px, 1fr))",gap:10,marginBottom:24}}>
            {ACT_C.map(col=>{
              const active=color===col;
              return(
                <button key={col} onClick={()=>setColor(col)} className="lt-press-soft" style={{
                  aspectRatio:"1/1",borderRadius:14,background:col,
                  border:active?`3px solid ${G.ink}`:`1px solid ${col}55`,
                  boxShadow:active?`0 6px 16px ${col}66`:`0 2px 6px ${col}22`,
                  cursor:"pointer",
                  transition:"transform .25s cubic-bezier(0.34, 1.56, 0.64, 1), border-width .2s, box-shadow .2s",
                  transform:active?"scale(1.05)":"scale(1)",
                  padding:0,position:"relative",
                }}>
                  {active&&(
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",filter:"drop-shadow(0 1px 2px rgba(0,0,0,0.3))"}}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
          <div style={{display:"flex",gap:10,marginTop:8}}>
            <button onClick={onClose} className="lt-press-soft" style={{flex:1,...GHOST}}>{t.cancel}</button>
            <button onClick={()=>{
              const n=name.trim();
              if(!n)return;
              const newId="c"+Date.now();
              const newCat={id:newId,sv:n,en:n,color,cards:[]};
              // Use functional updater for cats but call setSel separately —
              // calling setState inside another setState's updater is fragile.
              setCats(cs=>[...cs,newCat]);
              // Select the new category — its index is the current length
              // (before the add), but since we're using a functional updater
              // we need to fall back to reading the parent's cats prop.
              setSel(cats.length);
              onClose();
            }} className="lt-press" style={{flex:2,padding:"14px 0",borderRadius:14,border:"none",background:color,color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:15,cursor:"pointer",boxShadow:`0 8px 20px ${color}55, 0 2px 6px ${color}33`}}>{t.save}</button>
          </div>
        </Sheet>
      </Overlay>
    );
  }

  // addCard
  if(modal.type==="addCard"){
    if(!cat) return null;
    return(
      <Overlay onClose={onClose}>
        <Sheet scroll>
          <div style={{fontFamily:G.serif,fontWeight:500,fontSize:26,color:G.inkSoft,marginBottom:6,letterSpacing:-.5}}>{t.addCard}</div>
          <div style={{fontFamily:G.font,fontWeight:400,fontSize:13,color:G.ink3,marginBottom:24,lineHeight:1.4}}>{lang==="sv"?`Skapa ett nytt kort i "${cat.sv}".`:`Add a new card to "${cat.en}".`}</div>

          <SLabel>{t.cardImage}</SLabel>
          <div style={{display:"flex",gap:12,marginBottom:22,alignItems:"flex-start"}}>
            <div style={{
              width:96,height:96,borderRadius:18,
              background:cardPhoto?"transparent":`linear-gradient(140deg, ${cat.color}1A, ${cat.color}33)`,
              border:`1px solid ${cat.color}30`,
              display:"flex",alignItems:"center",justifyContent:"center",
              overflow:"hidden",flexShrink:0,
              boxShadow:`0 4px 14px ${cat.color}1F`,
            }}>
              {cardPhoto ? <img src={cardPhoto} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : <span style={{fontSize:48}}>{cardEmoji}</span>}
            </div>
            <div style={{flex:1,display:"flex",flexDirection:"column",gap:8}}>
              <input ref={fileRef} type="file" accept="image/*" onChange={onPhoto} style={{display:"none"}}/>
              <button onClick={()=>fileRef.current?.click()} className="lt-press-soft" style={{padding:"11px 14px",borderRadius:12,border:`1px solid ${cat.color}66`,background:`${cat.color}10`,color:cat.color,fontFamily:G.font,fontWeight:600,fontSize:13,cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:7}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <span>{t.uploadPhoto}</span>
              </button>
              {cardPhoto&&(
                <button onClick={()=>setCardPhoto(null)} className="lt-press-soft" style={{padding:"10px 12px",borderRadius:12,border:`1px solid ${G.border}`,background:G.white,color:G.ink2,fontFamily:G.font,fontWeight:600,fontSize:12,cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><polyline points="3 4 3 9 8 9"/></svg>
                  <span>{t.useEmoji}</span>
                </button>
              )}
            </div>
          </div>

          {!cardPhoto&&(<>
            <SLabel>{t.pickEmoji}</SLabel>
            <div style={{display:"grid",gridTemplateColumns:"repeat(8, 1fr)",gap:6,marginBottom:12}}>
              {EMOJIS.slice(ePage*pp,(ePage+1)*pp).map(e=>{
                const active=cardEmoji===e;
                return(
                  <button key={e} onClick={()=>setCardEmoji(e)} className="lt-press-soft" style={{
                    fontSize:24,
                    background:active?cat.color:"transparent",
                    border:active?`2px solid ${cat.color}`:"1px solid transparent",
                    borderRadius:11,padding:"6px 4px",cursor:"pointer",
                    aspectRatio:"1/1",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    transition:"all .2s",
                    boxShadow:active?`0 4px 12px ${cat.color}44`:"none",
                  }}>{e}</button>
                );
              })}
            </div>
            <div style={{display:"flex",gap:6,marginBottom:24,justifyContent:"center"}}>
              {Array.from({length:Math.ceil(EMOJIS.length/pp)}).map((_,i)=>(
                <button key={i} onClick={()=>setEPage(i)} className="lt-press-soft" style={{
                  minWidth:34,padding:"6px 10px",borderRadius:10,
                  fontFamily:G.font,fontWeight:600,fontSize:12,cursor:"pointer",
                  border:`1px solid ${i===ePage?cat.color:G.border}`,
                  background:i===ePage?cat.color:G.white,
                  color:i===ePage?"#fff":G.ink2,
                  transition:"all .2s",
                }}>{i+1}</button>
              ))}
            </div>
          </>)}

          <SLabel>{lang==="sv"?"Vad ska kortet säga?":"What should the card say?"}</SLabel>
          <input value={cardText} onChange={e=>setCardText(e.target.value)} className="lt-input" style={INP} placeholder={lang==="sv"?"t.ex. Vatten":"e.g. Water"}/>

          <div style={{display:"flex",gap:10,marginTop:24}}>
            <button onClick={onClose} className="lt-press-soft" style={{flex:1,...GHOST}}>{t.cancel}</button>
            <button onClick={()=>{
              if(!cardText.trim())return;
              setCats(cs=>cs.map((c,i)=>i!==modal.catIdx?c:{...c,cards:[...c.cards,{id:"cc"+Date.now(),emoji:cardEmoji,photo:cardPhoto,sv:cardText,en:cardText}]}));
              onClose();
            }} className="lt-press" style={{flex:2,padding:"14px 0",borderRadius:14,border:"none",background:cat.color,color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:15,cursor:"pointer",boxShadow:`0 8px 20px ${cat.color}55, 0 2px 6px ${cat.color}33`}}>{t.save}</button>
          </div>
        </Sheet>
      </Overlay>
    );
  }

  return null;
}

/* ═══ Emotion screen ═══ */
function EmotionScreen({lang,t,cfg,isEditor,setCfg,onInputFocusChange}){
  const[sel,setSel]=useState(null);
  const[reason,setReason]=useState("");
  const[saved,setSaved]=useState(false);
  const[hist,setHist]=usePersistentState("emotionHist",[]);
  const[showH,setShowH]=useState(false);
  const[editingEmo,setEditingEmo]=useState(null); // null | "new" | emotion-being-edited
  const S=SCREENS.emotion;
  // Safety net: if user navigates away mid-focus (without onBlur firing) make
  // sure the nav comes back. Cleans up on unmount.
  useEffect(()=>{
    return()=>onInputFocusChange?.(false);
  // eslint-disable-next-line
  },[]);

  // Combined emotion list, with full editability of built-ins:
  //   • cfg.emotionOverrides[id] = {name, emoji, photo, color} merges on top of EMOS[id]
  //   • cfg.deletedBuiltinEmotions = [id, …] filters built-ins out completely
  //   • cfg.customEmotions = user-added ones, IDs are "c_<ts>"
  const overrides=cfg.emotionOverrides||{};
  const deleted=cfg.deletedBuiltinEmotions||[];
  const customEmos=cfg.customEmotions||[];
  const allEmos=useMemo(()=>{
    const builtins=EMOS
      .filter(e=>!deleted.includes(e.id))
      .map(e=>overrides[e.id]?{...e,...overrides[e.id]}:e);
    return[...builtins,...customEmos];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[JSON.stringify(overrides),JSON.stringify(deleted),customEmos]);
  const isBuiltin=e=>typeof e.id==="number";
  const isCustom=e=>typeof e.id==="string"&&e.id.startsWith("c_");
  const isOverridden=e=>isBuiltin(e)&&overrides[e.id];
  // Built-ins have sv/en pairs; once overridden they have `name` instead.
  const labelFor=e=>e.name||(lang==="sv"?e.sv:e.en);

  // Inline panel scrolls itself into view when an emotion is selected, so the
  // save button & notes field are never hidden below the fold. The ref + effect
  // sit at the top of the component (before any conditional return) to comply
  // with the Rules of Hooks — the ref is only consumed in the user-view path
  // and harmlessly unused in editor mode.
  const inlinePanelRef=useRef(null);
  useEffect(()=>{
    if(!sel||!inlinePanelRef.current) return;
    const id=setTimeout(()=>{
      inlinePanelRef.current?.scrollIntoView({behavior:"smooth",block:"nearest"});
    },120);
    return()=>clearTimeout(id);
  },[sel?.id]);

  // ─── Editor view ───────────────────────────────────────────────────
  if(isEditor){
    const visible=cfg.visibleEmotions||[1,2,3,4,5];
    const toggle=id=>{
      const has=visible.includes(id);
      const next=has?visible.filter(x=>x!==id):[...visible,id];
      if(next.length===0) return;
      setCfg(x=>({...x,visibleEmotions:next}));
    };
    const setStyle=style=>setCfg(x=>({...x,emotionStyle:style}));

    // Save: routes to overrides for built-ins, customEmotions for custom IDs, or a new custom entry.
    const saveEmo=emo=>{
      if(typeof emo.id==="number"){
        // Built-in: write an override
        setCfg(x=>({
          ...x,
          emotionOverrides:{
            ...(x.emotionOverrides||{}),
            [emo.id]:{name:emo.name,emoji:emo.emoji,photo:emo.photo,color:emo.color},
          },
        }));
      } else if(typeof emo.id==="string"&&emo.id.startsWith("c_")){
        // Custom: update existing
        setCfg(x=>({
          ...x,
          customEmotions:(x.customEmotions||[]).map(e=>e.id===emo.id?{...e,...emo}:e),
        }));
      } else {
        // New custom
        const newId=`c_${Date.now()}`;
        setCfg(x=>({
          ...x,
          customEmotions:[...(x.customEmotions||[]),{...emo,id:newId}],
          visibleEmotions:[...(x.visibleEmotions||[]),newId],
        }));
      }
      setEditingEmo(null);
    };

    // Delete: built-ins go into deletedBuiltinEmotions; customs are removed entirely.
    // Either way, ensure visibleEmotions stays non-empty.
    const deleteEmo=id=>{
      setCfg(x=>{
        let nextCustom=x.customEmotions||[];
        let nextDeleted=x.deletedBuiltinEmotions||[];
        let nextOverrides=x.emotionOverrides||{};
        if(typeof id==="number"){
          nextDeleted=[...nextDeleted,id];
          // Strip its override too — no point keeping it
          if(nextOverrides[id]){
            nextOverrides={...nextOverrides};
            delete nextOverrides[id];
          }
        } else {
          nextCustom=nextCustom.filter(e=>e.id!==id);
        }
        const availIds=[
          ...EMOS.filter(e=>!nextDeleted.includes(e.id)).map(e=>e.id),
          ...nextCustom.map(e=>e.id),
        ];
        let nextVisible=(x.visibleEmotions||[]).filter(v=>v!==id&&availIds.includes(v));
        if(nextVisible.length===0) nextVisible=availIds;
        return{...x,customEmotions:nextCustom,deletedBuiltinEmotions:nextDeleted,emotionOverrides:nextOverrides,visibleEmotions:nextVisible};
      });
      setEditingEmo(null);
    };

    // Reset: brings back all default built-ins and clears all overrides.
    // Custom emotions are NOT touched.
    const resetDefaults=()=>{
      setCfg(x=>{
        const restoredVisible=[1,2,3,4,5];
        // Preserve any visible custom IDs the user had
        const customVisible=(x.visibleEmotions||[]).filter(v=>typeof v==="string");
        return{
          ...x,
          emotionOverrides:{},
          deletedBuiltinEmotions:[],
          visibleEmotions:[...restoredVisible,...customVisible],
        };
      });
    };

    const currentStyle=cfg.emotionStyle||"arc";
    const hasAnyEdits=Object.keys(overrides).length>0||deleted.length>0;

    return(
      <div style={{flex:1,overflowY:"auto",background:S.hb,padding:"24px 22px 120px",display:"flex",flexDirection:"column",gap:18}}>
        {/* Style picker — arc vs vertical */}
        <div style={{background:G.white,borderRadius:22,padding:"18px 20px",border:`1px solid ${G.border}`,boxShadow:"0 8px 24px rgba(31,27,46,0.04)"}}>
          <div style={{fontFamily:G.font,fontWeight:600,fontSize:13,color:S.deep,marginBottom:6,letterSpacing:.2}}>{t.barometerStyle}</div>
          <div style={{fontFamily:G.font,fontWeight:400,fontSize:12,color:G.ink2,lineHeight:1.5,marginBottom:14}}>{t.barometerStyleHint}</div>
          <div style={{display:"flex",gap:8}}>
            {[
              ["arc",t.styleArc,(
                <svg width={26} height={18} viewBox="0 0 26 18" fill="none">
                  <path d="M2 16 Q13 -2 24 16" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round"/>
                  <line x1={13} y1={16} x2={17} y2={6} stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"/>
                  <circle cx={13} cy={16} r={1.5} fill="currentColor"/>
                </svg>
              )],
              ["vertical",t.styleVertical,(
                <svg width={26} height={18} viewBox="0 0 22 18" fill="none">
                  <rect x={3} y={2} width={16} height={3} rx={1.5} stroke="currentColor" strokeWidth={1.4}/>
                  <rect x={3} y={7.5} width={16} height={3} rx={1.5} stroke="currentColor" strokeWidth={1.4}/>
                  <rect x={3} y={13} width={16} height={3} rx={1.5} stroke="currentColor" strokeWidth={1.4}/>
                </svg>
              )],
            ].map(([k,lb,icon])=>{
              const on=currentStyle===k;
              return(
                <button key={k} onClick={()=>setStyle(k)} className="lt-press" style={{flex:1,padding:"14px 6px",borderRadius:13,border:`1px solid ${on?S.h:G.border}`,background:on?S.hl:"transparent",color:on?S.deep:G.ink2,fontFamily:G.font,fontWeight:600,fontSize:13,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:6,transition:"all .2s ease"}}>
                  {icon}
                  {lb}
                </button>
              );
            })}
          </div>
        </div>

        {/* Visible emotions intro */}
        <div style={{background:G.white,borderRadius:22,padding:"20px 20px 18px",border:`1px solid ${G.border}`,boxShadow:"0 8px 24px rgba(31,27,46,0.04)"}}>
          <div style={{fontFamily:G.font,fontWeight:600,fontSize:13,color:S.deep,marginBottom:6,letterSpacing:.2}}>{t.visibleEmotions}</div>
          <div style={{fontFamily:G.font,fontWeight:400,fontSize:12,color:G.ink2,lineHeight:1.5}}>{lang==="en"?"Choose which feelings the user can pick. Add your own — with a photo or emoji.":"Välj vilka känslor användaren kan välja mellan. Lägg till egna — med foto eller emoji."}</div>
        </div>

        {/* Emotions list — built-in + custom, all editable */}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {allEmos.map(e=>{
            const on=visible.includes(e.id);
            const custom=isCustom(e);
            const edited=isOverridden(e);
            return(
              <div key={e.id} className="lt-press-soft" onClick={()=>toggle(e.id)} style={{
                // Dov bas: a soft, very low-saturation wash of the emotion's own colour
                // even when off. On = the same gradient at higher intensity. No harsh
                // outlines anywhere — just colour and shadow speak for themselves.
                background:on
                  ?`linear-gradient(135deg, ${e.color}26 0%, ${e.color}12 100%)`
                  :`linear-gradient(135deg, ${e.color}10 0%, ${e.color}06 100%)`,
                borderRadius:18,padding:"14px 16px",
                border:"none",
                boxShadow:on
                  ?`0 8px 22px ${e.color}33, inset 0 1px 0 rgba(255,255,255,0.5)`
                  :"0 1px 3px rgba(31,27,46,0.04)",
                display:"flex",alignItems:"center",gap:14,
                opacity:on?1:0.5,
                cursor:"pointer",
                transform:on?"scale(1)":"scale(0.99)",
                transition:"background .4s cubic-bezier(0.32, 0.72, 0, 1), box-shadow .4s cubic-bezier(0.32, 0.72, 0, 1), opacity .35s ease, transform .4s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}>
                <div style={{
                  width:48,height:48,borderRadius:14,
                  background:e.photo?"#000":`linear-gradient(140deg,${e.color}55,${e.color}33)`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:26,flexShrink:0,
                  filter:on?"none":"saturate(0.7)",
                  overflow:"hidden",
                  boxShadow:on?`inset 0 1px 0 rgba(255,255,255,0.4)`:"none",
                  transition:"filter .35s ease, box-shadow .35s ease",
                }}>
                  {e.photo?<img src={e.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:e.emoji}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:G.serif,fontWeight:500,fontSize:16,color:G.ink,letterSpacing:-.1}}>{labelFor(e)}</div>
                  {(custom||edited)&&(
                    <span style={{display:"inline-block",fontFamily:G.font,fontSize:9,fontWeight:700,color:on?e.color:G.ink3,marginTop:5,letterSpacing:.9,textTransform:"uppercase",padding:"2px 8px",borderRadius:6,background:on?`${e.color}28`:"rgba(31,27,46,0.06)"}}>{t.customLabel}</span>
                  )}
                </div>
                {/* Edit pencil — same outline-icon vocabulary used elsewhere in
                    the app (IdCard, schedule edit). Tilts and lifts on hover/press
                    via the lumaPen class — defined once in a <style> block at the
                    top of the editor below. */}
                <button onClick={(ev)=>{ev.stopPropagation();setEditingEmo(e);}} aria-label={t.editEmotion} className="lt-press-soft lumaPenBtn" style={{padding:"8px 10px",borderRadius:10,border:"none",background:"transparent",color:G.ink2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg className="lumaPen" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4 H4 a2 2 0 0 0 -2 2 v14 a2 2 0 0 0 2 2 h14 a2 2 0 0 0 2 -2 v-7"/>
                    <path d="M18.5 2.5 a2.121 2.121 0 0 1 3 3 L12 15 l-4 1 1 -4 z"/>
                  </svg>
                </button>
                <Toggle on={on} onChange={()=>toggle(e.id)} color={e.color}/>
              </div>
            );
          })}
        </div>

        {/* Add custom emotion */}
        <button onClick={()=>setEditingEmo("new")} className="lt-press" style={{
          padding:"15px 0",borderRadius:16,
          border:`1.5px dashed ${S.h}77`,background:"transparent",color:S.deep,
          fontFamily:G.font,fontWeight:600,fontSize:14,cursor:"pointer",
          display:"flex",alignItems:"center",justifyContent:"center",gap:6,
          letterSpacing:.2,
        }}>{t.addEmotion}</button>

        {/* Reason-field config — toggle the notes field on/off and customise its label */}
        {(()=>{
          const reasonOn=cfg.emotionReasonEnabled!==false;
          const customLabel=cfg.emotionReasonLabel||"";
          const setReasonOn=v=>setCfg(x=>({...x,emotionReasonEnabled:v}));
          const setReasonLabel=v=>setCfg(x=>({...x,emotionReasonLabel:v}));
          return(
            <div style={{background:G.white,borderRadius:22,padding:"18px 20px",border:`1px solid ${G.border}`,boxShadow:"0 8px 24px rgba(31,27,46,0.04)"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:reasonOn?14:0,transition:"margin-bottom .3s ease"}}>
                <Toggle on={reasonOn} onChange={()=>setReasonOn(!reasonOn)} color={S.h}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:G.font,fontWeight:600,fontSize:13,color:S.deep,letterSpacing:.2}}>{t.reasonField}</div>
                  <div style={{fontFamily:G.font,fontSize:11.5,color:G.ink2,marginTop:3,lineHeight:1.45}}>{t.reasonFieldHint}</div>
                </div>
              </div>
              {reasonOn&&(
                <div style={{animation:"adSection 0.32s cubic-bezier(0.32, 0.72, 0, 1) both"}}>
                  <input
                    value={customLabel}
                    onChange={ev=>setReasonLabel(ev.target.value)}
                    placeholder={t.emotionReason||t.reasonLabelPH}
                    className="lt-input"
                    style={{...INP,marginBottom:0,background:S.hll,borderColor:S.hl}}
                  />
                </div>
              )}
            </div>
          );
        })()}

        {/* Reset to defaults — only shown if user has edited or deleted built-ins */}
        {hasAnyEdits&&(
          <div style={{marginTop:8,paddingTop:18,borderTop:`1px solid ${G.border}`,animation:"adSection 0.35s cubic-bezier(0.32, 0.72, 0, 1) both"}}>
            <div style={{fontFamily:G.font,fontSize:11.5,color:G.ink2,marginBottom:10,lineHeight:1.5,letterSpacing:.1}}>{t.resetEmotionsHint}</div>
            <button onClick={resetDefaults} className="lt-press-soft" style={{width:"100%",padding:"11px 0",borderRadius:12,border:`1px solid ${G.border}`,background:"transparent",color:G.ink2,fontFamily:G.font,fontWeight:500,fontSize:13,cursor:"pointer",letterSpacing:.2}}>↺ {t.resetEmotions}</button>
          </div>
        )}

        {editingEmo&&<CustomEmotionEditor existing={editingEmo==="new"?null:editingEmo} onSave={saveEmo} onDelete={deleteEmo} onClose={()=>setEditingEmo(null)} t={t} lang={lang}/>}
      </div>
    );
  }

  // ─── User view ─────────────────────────────────────────────────────
  const visibleEmos=allEmos.filter(e=>(cfg.visibleEmotions||[1,2,3,4,5]).includes(e.id));
  const doSave=()=>{
    if(!sel)return;
    const e={
      id:sel.id,emoji:sel.emoji,photo:sel.photo||null,color:sel.color,
      // Normalise label for history rendering across both languages
      sv:sel.sv||sel.name||"",
      en:sel.en||sel.name||"",
      reason,
      time:new Date().toLocaleTimeString("sv-SE",{hour:"2-digit",minute:"2-digit"}),
      date:new Date().toLocaleDateString("sv-SE"),
    };
    setHist(h=>[e,...h].slice(0,20));
    setSaved(true);
    setTimeout(()=>{setSaved(false);setSel(null);setReason("");},2200);
  };
  // Arc gauge geometry — used only when style==="arc"
  const R2=78,cx=120,cy=115;
  const ap=a=>({x:cx+R2*Math.cos(a),y:cy-R2*Math.sin(a)});
  const N=Math.max(1,visibleEmos.length);
  const arcs=visibleEmos.map((e,i)=>{const s=Math.PI-(i/N)*Math.PI,en=Math.PI-((i+1)/N)*Math.PI;const p1=ap(s),p2=ap(en);return{i,d:`M${p1.x},${p1.y} A${R2},${R2} 0 0,1 ${p2.x},${p2.y}`,col:e.color};});
  const selIdx=sel?visibleEmos.findIndex(e=>e.id===sel.id):-1;
  const needleA=selIdx>=0?Math.PI-(selIdx+0.5)/N*Math.PI:Math.PI/2;
  const np=ap(needleA);

  const style=cfg.emotionStyle||"arc";

  // The reason input + save button (or the saved-celebration once doSave fires)
  // — rendered once, placed in two different positions depending on layout:
  // inline under the selected tile in vertical mode; below the gauge row in arc.
  const reasonOn=cfg.emotionReasonEnabled!==false;
  const reasonLabel=(cfg.emotionReasonLabel&&cfg.emotionReasonLabel.trim())||t.emotionReason;
  const InlinePanel=sel?(
    <div ref={inlinePanelRef} style={{animation:"emoReasonIn .42s cubic-bezier(0.32, 0.72, 0, 1) both"}}>
      <style>{`@keyframes emoReasonIn{0%{opacity:0;transform:translateY(-6px)}100%{opacity:1;transform:translateY(0)}}`}</style>
      {!saved?(
        <>
          {reasonOn&&(<>
            <div style={{height:3,width:42,borderRadius:2,background:`linear-gradient(90deg,${sel.color},${sel.color}55)`,marginBottom:14,boxShadow:`0 0 8px ${sel.color}55`}}/>
            <SLabel>{reasonLabel}</SLabel>
            <input
              value={reason}
              onChange={e=>setReason(e.target.value)}
              onFocus={()=>onInputFocusChange?.(true)}
              onBlur={()=>onInputFocusChange?.(false)}
              className="lt-input"
              style={{...INP,borderColor:`${sel.color}44`,background:`${sel.color}08`}}
              placeholder=""
            />
          </>)}
          {/* Action row: dismiss (X) + primary save. The dismiss button gives an
              escape route if the user tapped a feeling by mistake — clears sel
              and reason so the panel collapses back to the default list. */}
          <div style={{display:"flex",gap:8,alignItems:"stretch"}}>
            <button onClick={()=>{setSel(null);setReason("");}} aria-label={t.cancel} className="lt-press-soft" style={{
              width:54,padding:0,borderRadius:16,border:"none",
              background:"rgba(31,27,46,0.05)",color:G.ink2,
              cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
              transition:"background .25s ease, color .25s ease",
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M3 3 L11 11 M11 3 L3 11"/>
              </svg>
            </button>
            <button onClick={doSave} className="lt-press saveBtn" style={{flex:1,padding:"16px 0",borderRadius:16,border:"none",background:sel.color,color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:15,cursor:"pointer",boxShadow:sh.c(sel.color),letterSpacing:.3,display:"flex",alignItems:"center",justifyContent:"center",gap:9}}>
              <svg className="saveTick" width="15" height="15" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                <path d="M2.5 7.2 L5.8 10.5 L11.5 3.5"/>
              </svg>
              {t.save}
            </button>
          </div>
        </>
      ):(
        <div style={{position:"relative",textAlign:"center",padding:"36px 20px 28px",animation:"emoSavedIn .55s cubic-bezier(0.34, 1.56, 0.64, 1) both"}}>
          <style>{`
            @keyframes emoSavedIn{0%{opacity:0;transform:translateY(8px) scale(0.96)}100%{opacity:1;transform:translateY(0) scale(1)}}
            @keyframes emoSavedBubble{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
            @keyframes emoSavedRipple{0%{transform:scale(0.7);opacity:0.45}100%{transform:scale(2.6);opacity:0}}
          `}</style>
          <div style={{position:"relative",display:"inline-flex",alignItems:"center",justifyContent:"center",width:118,height:118,marginBottom:16}}>
            <div style={{position:"absolute",inset:9,borderRadius:"50%",background:sel.color,animation:"emoSavedRipple 1.8s ease-out infinite",pointerEvents:"none"}}/>
            <div style={{position:"relative",width:100,height:100,borderRadius:"50%",background:`linear-gradient(135deg,${sel.color}66,${sel.color}3D)`,boxShadow:`0 14px 36px ${sel.color}55, inset 0 1px 0 rgba(255,255,255,0.55)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:54,overflow:"hidden",animation:"emoSavedBubble 2s ease-in-out infinite"}}>
              {sel.photo?<img src={sel.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:sel.emoji}
            </div>
          </div>
          <div style={{fontFamily:G.serif,fontWeight:600,fontSize:24,color:G.inkSoft,letterSpacing:-.3,marginBottom:6,lineHeight:1.1}}>{t.emotionSaved}</div>
          <div style={{fontFamily:G.font,fontSize:13,color:sel.color,fontWeight:600,letterSpacing:.3}}>{labelFor(sel)}</div>
        </div>
      )}
    </div>
  ):null;

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto",background:S.hb}}>
      <div style={{padding:"24px 22px 4px",display:"flex",justifyContent:"flex-end",alignItems:"center",marginBottom:18,gap:14}}>
        <button onClick={()=>setShowH(h=>!h)} className="lt-press" style={{padding:"8px 14px",borderRadius:20,border:`1px solid ${G.border}`,background:showH?S.hl:"transparent",color:showH?S.deep:G.ink2,fontFamily:G.font,fontWeight:500,cursor:"pointer",fontSize:12,letterSpacing:.2}}>{t.emotionHistory}</button>
      </div>
      <div style={{flex:1,padding:"0 20px 20px",overflowY:"auto"}}>
        {showH?(hist.length===0?(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"50px 30px 30px",gap:14}}>
            <style>{`@keyframes empHistFloat{0%,100%{transform:translateY(0);opacity:0.85}50%{transform:translateY(-3px);opacity:1}}`}</style>
            <svg width="64" height="64" viewBox="0 0 64 64" style={{animation:"empHistFloat 4s ease-in-out infinite"}}>
              <rect x="12" y="14" width="40" height="40" rx="4" fill={`${SCREENS.emotion.h}18`} stroke={`${SCREENS.emotion.h}66`} strokeWidth="1.5"/>
              <line x1="20" y1="10" x2="20" y2="18" stroke={`${SCREENS.emotion.h}88`} strokeWidth="2" strokeLinecap="round"/>
              <line x1="44" y1="10" x2="44" y2="18" stroke={`${SCREENS.emotion.h}88`} strokeWidth="2" strokeLinecap="round"/>
              <line x1="12" y1="22" x2="52" y2="22" stroke={`${SCREENS.emotion.h}44`} strokeWidth="1.2"/>
              <circle cx="22" cy="32" r="2.5" fill={`${SCREENS.emotion.h}55`}/>
              <circle cx="32" cy="32" r="2.5" fill={`${SCREENS.emotion.h}33`}/>
              <circle cx="42" cy="32" r="2.5" fill={`${SCREENS.emotion.h}22`}/>
              <circle cx="22" cy="42" r="2.5" fill={`${SCREENS.emotion.h}22`}/>
            </svg>
            <div style={{fontFamily:G.serif,fontWeight:500,fontSize:18,color:G.ink,letterSpacing:-.3,textAlign:"center"}}>{t.noHistory}</div>
            <div style={{fontFamily:G.font,fontSize:12,color:"#9892AA",textAlign:"center",lineHeight:1.4,maxWidth:240}}>{lang==="sv"?"Dina känslor sparas här när du registrerar dem.":"Your feelings will appear here once you log them."}</div>
          </div>
        ):hist.map((e,i)=>(
          <div key={i} style={{
            display:"flex",alignItems:"center",gap:12,padding:"14px 16px",
            background:`linear-gradient(125deg, ${G.white} 0%, ${G.white} 35%, ${e.color}0E 80%, ${e.color}1A 100%)`,
            borderRadius:16,marginBottom:10,
            border:`1px solid ${e.color}33`,
            boxShadow:`0 4px 12px ${e.color}14, inset 0 1px 0 rgba(255,255,255,0.5)`,
          }}>
            <div style={{width:42,height:42,borderRadius:12,background:e.photo?"#000":`linear-gradient(140deg,${e.color}26,${e.color}3A)`,border:`1px solid ${e.color}33`,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>
              {e.photo?<img src={e.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:e.emoji}
            </div>
            <div style={{flex:1,minWidth:0}}><div style={{fontFamily:G.font,fontWeight:700,color:e.color,fontSize:15}}>{lang==="sv"?e.sv:e.en}</div>{e.reason&&<div style={{fontFamily:G.font,fontSize:13,color:G.ink2,marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{e.reason}</div>}</div>
            <div style={{fontFamily:G.font,fontSize:11,color:G.ink3,textAlign:"right",flexShrink:0,fontVariantNumeric:"tabular-nums"}}><div>{fmtT(e.time,lang)}</div><div>{e.date}</div></div>
          </div>
        ))):(<>
          {style==="arc"?(<>
            <div style={{display:"flex",justifyContent:"center",marginBottom:14,background:G.white,borderRadius:24,padding:18,boxShadow:sh.sm,border:`1px solid ${G.border}`}}>
              <svg width={240} height={128}>
                {arcs.map(arc=><path key={arc.i} d={arc.d} fill="none" stroke={arc.col} strokeWidth={20} strokeLinecap="butt"/>)}
                <line x1={cx} y1={cy} x2={np.x} y2={np.y} stroke={sel?sel.color:G.ink3} strokeWidth={4} strokeLinecap="round" style={{transition:"all .55s cubic-bezier(.34,1.56,.64,1)"}}/>
                <circle cx={cx} cy={cy} r={11} fill={sel?sel.color:G.ink3}/>
                <circle cx={cx} cy={cy} r={5} fill="#fff"/>
              </svg>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:24,flexWrap:"wrap"}}>
              {visibleEmos.map(e=>{
                const on=sel?.id===e.id;
                return(
                  <div key={e.id} onClick={()=>setSel(e)} style={{
                    display:"flex",flexDirection:"column",alignItems:"center",gap:6,
                    cursor:"pointer",padding:"14px 10px",borderRadius:18,
                    background:on
                      ?`linear-gradient(160deg, ${e.color}66 0%, ${e.color}3D 100%)`
                      :`linear-gradient(160deg, ${e.color}1F 0%, ${e.color}11 100%)`,
                    border:"none",
                    boxShadow:on
                      ?`0 12px 26px ${e.color}55, 0 3px 8px ${e.color}33, inset 0 1px 0 rgba(255,255,255,0.45)`
                      :`0 2px 6px ${e.color}14`,
                    transform:on?"scale(1.06)":"scale(1)",
                    transition:"transform .42s cubic-bezier(0.34, 1.56, 0.64, 1), background .45s cubic-bezier(0.32, 0.72, 0, 1), box-shadow .45s cubic-bezier(0.32, 0.72, 0, 1)",
                    minWidth:62,
                  }}>
                    <div style={{width:42,height:42,borderRadius:12,background:e.photo?"#000":"transparent",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,flexShrink:0}}>
                      {e.photo?<img src={e.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:e.emoji}
                    </div>
                    <span style={{fontFamily:G.font,fontWeight:700,fontSize:9,color:on?G.ink:e.color,whiteSpace:"nowrap",transition:"color .35s ease"}}>{labelFor(e)}</span>
                  </div>
                );
              })}
            </div>
          </>):(
            // Vertical layout: full-width stacked tiles, larger touch targets.
            // The reason+save panel expands inline RIGHT UNDER the selected tile
            // so the user never has to scroll down to find the save button.
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
              {visibleEmos.map(e=>{
                const on=sel?.id===e.id;
                return(
                  <Fragment key={e.id}>
                    <div onClick={()=>setSel(e)} className="lt-press-soft" style={{
                      display:"flex",alignItems:"center",gap:14,
                      padding:"16px 18px",borderRadius:20,
                      // Each tile lives in its emotion's own muted hue. Unselected = dov,
                      // selected = saturated. No outlines anywhere; colour + shadow do all
                      // the work. Two stops in the gradient keep it from looking flat.
                      background:on
                        ?`linear-gradient(135deg, ${e.color}66 0%, ${e.color}3D 100%)`
                        :`linear-gradient(135deg, ${e.color}1F 0%, ${e.color}11 100%)`,
                      border:"none",
                      boxShadow:on
                        ?`0 14px 32px ${e.color}55, 0 4px 10px ${e.color}33, inset 0 1px 0 rgba(255,255,255,0.45)`
                        :`0 2px 6px ${e.color}14`,
                      cursor:"pointer",
                      transform:on?"scale(1.025)":"scale(1)",
                      // Bouncy back-out on the scale (slight overshoot), longer crossfade on colour + shadow
                      transition:"transform .42s cubic-bezier(0.34, 1.56, 0.64, 1), background .5s cubic-bezier(0.32, 0.72, 0, 1), box-shadow .5s cubic-bezier(0.32, 0.72, 0, 1)",
                    }}>
                      <div style={{
                        width:54,height:54,borderRadius:16,
                        background:e.photo?"#000":`linear-gradient(140deg,${e.color}AA,${e.color}77)`,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:30,flexShrink:0,overflow:"hidden",
                        boxShadow:on?"inset 0 1px 0 rgba(255,255,255,0.45), 0 2px 6px rgba(31,27,46,0.08)":"inset 0 1px 0 rgba(255,255,255,0.25)",
                        transition:"box-shadow .4s ease",
                      }}>
                        {e.photo?<img src={e.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:e.emoji}
                      </div>
                      <div style={{flex:1,minWidth:0,fontFamily:G.serif,fontWeight:600,fontSize:18,color:G.ink,letterSpacing:-.2}}>{labelFor(e)}</div>
                      {/* Checkmark fades + scales in on selection — no jump */}
                      <div style={{
                        width:30,height:30,borderRadius:"50%",
                        background:e.color,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        color:"#fff",fontSize:15,fontWeight:700,
                        boxShadow:`0 4px 12px ${e.color}77`,
                        opacity:on?1:0,
                        transform:on?"scale(1)":"scale(0.4)",
                        transition:"opacity .35s ease, transform .42s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      }}>✓</div>
                    </div>
                    {/* Inline expansion: panel slides in right under the selected tile */}
                    {on&&(
                      <div style={{padding:"4px 4px 8px"}}>
                        {InlinePanel}
                      </div>
                    )}
                  </Fragment>
                );
              })}
            </div>
          )}
          {/* Arc layout: panel below the tiles row (no inline expansion since the
              gauge + tiles are a horizontal cluster, not a vertical list) */}
          {style==="arc"&&InlinePanel}
        </>)}
      </div>
    </div>
  );
}

/* ═══ Custom emotion editor — add/edit/delete a user-defined feeling ═══ */
function CustomEmotionEditor({existing,onSave,onDelete,onClose,t,lang}){
  // For built-ins (no .name yet), seed with the current-language label so the user
  // doesn't have to retype it just to change the colour or photo.
  const initialName=existing?.name||(existing&&(lang==="sv"?existing.sv:existing.en))||"";
  const[name,setName]=useState(initialName);
  const[emoji,setEmoji]=useState(existing?.emoji||"😊");
  const[photo,setPhoto]=useState(existing?.photo||null);
  const[color,setColor]=useState(existing?.color||ACT_C[0]);
  const[showEmojiPicker,setShowEmojiPicker]=useState(false);
  const[confirmDel,setConfirmDel]=useState(false); // two-tap delete confirmation
  const Sc=SCREENS.emotion;

  const handlePhoto=ev=>{
    const f=ev.target.files?.[0]; if(!f) return;
    const r=new FileReader();
    r.onload=()=>{
      const img=new Image();
      img.onload=()=>{
        const c=document.createElement("canvas");
        const max=500;
        const s=Math.min(1,max/Math.max(img.width,img.height));
        c.width=img.width*s; c.height=img.height*s;
        c.getContext("2d").drawImage(img,0,0,c.width,c.height);
        setPhoto(c.toDataURL("image/jpeg",0.75));
      };
      img.src=r.result;
    };
    r.readAsDataURL(f);
  };

  const save=()=>{
    const finalName=name.trim()||(lang==="sv"?"Min känsla":"My feeling");
    onSave({id:existing?.id,name:finalName,emoji,photo,color});
  };

  return(
    <Overlay onClose={onClose}>
      <Sheet scroll>
        <div style={{fontFamily:G.serif,fontWeight:500,fontSize:24,color:G.ink,marginBottom:24,letterSpacing:-.4,lineHeight:1.1}}>
          {existing?t.editEmotion:t.addEmotion}
        </div>

        {/* Image/emoji preview + actions */}
        <SLabel>{t.cardImage}</SLabel>
        <div style={{display:"flex",gap:12,marginBottom:18,alignItems:"flex-start"}}>
          <div style={{width:84,height:84,borderRadius:18,background:photo?"#000":`linear-gradient(140deg,${color}25,${color}45)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:44,overflow:"hidden",border:`1px solid ${color}40`,flexShrink:0}}>
            {photo?<img src={photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:emoji}
          </div>
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:7}}>
            <label style={{padding:"10px 13px",borderRadius:11,background:G.white,border:`1px solid ${G.border}`,fontFamily:G.font,fontSize:12,color:G.ink,cursor:"pointer",fontWeight:600,textAlign:"center",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:7}}>
              <IconCamera size={14}/> {photo?t.changePhoto:t.uploadPhoto}
              <input type="file" accept="image/*" onChange={handlePhoto} style={{display:"none"}}/>
            </label>
            {photo
              ?<button onClick={()=>setPhoto(null)} style={{padding:"9px 13px",borderRadius:11,background:"transparent",border:`1px solid ${G.border}`,fontFamily:G.font,fontSize:12,color:G.ink2,cursor:"pointer",fontWeight:500}}>{t.removePhoto}</button>
              :<button onClick={()=>setShowEmojiPicker(p=>!p)} style={{padding:"9px 13px",borderRadius:11,background:showEmojiPicker?Sc.hl:"transparent",border:`1px solid ${showEmojiPicker?Sc.h:G.border}`,fontFamily:G.font,fontSize:12,color:showEmojiPicker?Sc.deep:G.ink2,cursor:"pointer",fontWeight:500}}>{t.pickEmoji}</button>
            }
          </div>
        </div>

        {showEmojiPicker&&!photo&&(
          <div style={{background:G.cream,borderRadius:14,padding:12,marginBottom:18,maxHeight:200,overflowY:"auto",border:`1px solid ${G.border}`}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {EMOJIS.map(em=>(
                <button key={em} onClick={()=>{setEmoji(em);setShowEmojiPicker(false);}} style={{width:38,height:38,borderRadius:10,border:emoji===em?`2px solid ${color}`:"1px solid transparent",background:emoji===em?`${color}22`:"transparent",fontSize:20,cursor:"pointer",padding:0}}>{em}</button>
              ))}
            </div>
          </div>
        )}

        {/* Name */}
        <SLabel>{t.emotionName}</SLabel>
        <input value={name} onChange={ev=>setName(ev.target.value)} className="lt-input" style={INP} placeholder={t.emotionNamePH}/>

        {/* Color picker */}
        <SLabel>{t.pickColor}</SLabel>
        <div style={{display:"flex",gap:9,flexWrap:"wrap",marginBottom:24}}>
          {ACT_C.map(c=>(
            <div key={c} onClick={()=>setColor(c)} style={{width:32,height:32,borderRadius:"50%",background:c,cursor:"pointer",outline:color===c?`3px solid ${c}`:"none",outlineOffset:2,boxShadow:color===c?`0 4px 12px ${c}66`:"none",transition:"box-shadow .2s ease"}}/>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{display:"flex",gap:8,alignItems:"stretch"}}>
          {existing&&(
            // Two-tap delete: first tap expands to red confirm pill ("Ta bort?"),
            // second tap commits. Animates smoothly so it feels intentional, not jarring.
            <button onClick={()=>{
              if(confirmDel){onDelete(existing.id);onClose();}
              else{
                setConfirmDel(true);
                // Auto-cancel after 3.5s so the destructive state doesn't linger
                setTimeout(()=>setConfirmDel(false),3500);
              }
            }} style={{
              padding:confirmDel?"14px 18px":"14px 16px",
              borderRadius:14,border:"none",
              background:confirmDel?"#EF4444":"#FEF2F2",
              color:confirmDel?"#fff":"#EF4444",
              cursor:"pointer",fontSize:confirmDel?13:17,
              fontFamily:G.font,fontWeight:700,
              boxShadow:confirmDel?"0 6px 16px rgba(239,68,68,0.35)":"none",
              transition:"all .35s cubic-bezier(0.32, 0.72, 0, 1)",
              whiteSpace:"nowrap",display:"flex",alignItems:"center",justifyContent:"center",
            }}>{confirmDel?t.confirmDeleteEmotion:(
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6 h18"/>
                <path d="M8 6 V4 a2 2 0 0 1 2-2 h4 a2 2 0 0 1 2 2 v2"/>
                <path d="M19 6 l-1 14 a2 2 0 0 1 -2 2 H8 a2 2 0 0 1 -2 -2 L5 6"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            )}</button>
          )}
          <button onClick={onClose} style={{flex:1,...GHOST}}>{t.cancel}</button>
          <button onClick={save} className="lt-press saveBtn" style={{flex:2,padding:"15px 0",borderRadius:14,border:"none",background:Sc.h,color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:15,cursor:"pointer",boxShadow:sh.c(Sc.h),display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <svg className="saveTick" width="15" height="15" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
              <path d="M2.5 7.2 L5.8 10.5 L11.5 3.5"/>
            </svg>
            {t.save}
          </button>
        </div>
      </Sheet>
    </Overlay>
  );
}

/* ═══ Timer screen ═══ */
function TimerScreen({t,cfg,isEditor,setCfg,lang}){
  const S=SCREENS.timer;
  const tc=cfg.timerCfg;
  const allowed=tc.allowedTypes.length>0?tc.allowedTypes:["sector"];
  const[type,setType]=useState(allowed.includes(tc.defaultType)?tc.defaultType:allowed[0]);
  const[min,setMin]=useState(tc.defaultMin);
  const[color,setColor]=useState(tc.defaultColor);
  const[full,setFull]=useState(false);
  const[key,setKey]=useState(0);
  const start=()=>{setKey(k=>k+1);setFull(true);};

  // Editor view — configure which timer types are allowed + defaults
  if(isEditor){
    const upd=(field,val)=>setCfg(x=>({...x,timerCfg:{...x.timerCfg,[field]:val}}));
    const toggleType=(k)=>{
      const cur=tc.allowedTypes;
      const next=cur.includes(k)?cur.filter(a=>a!==k):[...cur,k];
      if(next.length===0) return; // keep at least one
      upd("allowedTypes",next);
      // If we just disabled the default, switch default to the first remaining
      if(!next.includes(tc.defaultType)) upd("defaultType",next[0]);
    };
    return(
      <div style={{flex:1,overflowY:"auto",padding:"16px 18px 24px",display:"flex",flexDirection:"column",gap:22,background:S.hb}}>
        <div style={{background:G.white,borderRadius:22,padding:"20px 20px 18px",border:`1px solid ${G.border}`,boxShadow:"0 8px 24px rgba(31,27,46,0.04)"}}>
          <div style={{fontFamily:G.font,fontWeight:600,fontSize:13,color:S.deep,marginBottom:6,letterSpacing:.2}}>{lang==="en"?"What user sees":"Vad användaren ser"}</div>
          <div style={{fontFamily:G.font,fontWeight:400,fontSize:12,color:G.ink2,lineHeight:1.5,marginBottom:0}}>{lang==="en"?"Choose which timer types are available, and which one starts selected.":"Välj vilka timertyper som är tillgängliga, och vilken som är förvald."}</div>
        </div>
        <div>
          <SLabel>{t.allowedTimers}</SLabel>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
            {TTYPES.map(k=>{
              const on=tc.allowedTypes.includes(k);
              return(
                <button key={k} onClick={()=>toggleType(k)} className="lt-press-soft" style={{
                  padding:"16px 6px 12px",borderRadius:16,border:"1px solid",
                  fontFamily:G.font,fontWeight:600,fontSize:11.5,cursor:"pointer",
                  borderColor:on?S.h:"rgba(31,27,46,0.08)",
                  background:on?`${S.h}10`:G.white,
                  color:on?S.deep:G.ink3,
                  boxShadow:on?`0 8px 22px ${S.h}22`:"0 1px 2px rgba(31,27,46,0.03)",
                  display:"flex",flexDirection:"column",alignItems:"center",gap:7,
                  transition:"all .25s ease",
                  opacity:on?1:0.55,
                }}>
                  <TimerIcon type={k} size={22} color={on?S.deep:G.ink3}/>
                  <span>{tlbl(k,t)}</span>
                  {on&&<span style={{fontSize:9,color:S.h,fontWeight:700,letterSpacing:.6,marginTop:-2}}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <SLabel>{t.defaultTimer}</SLabel>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            {tc.allowedTypes.map(k=>{
              const sel=tc.defaultType===k;
              return(
                <button key={k} onClick={()=>upd("defaultType",k)} className="lt-press-soft" style={{
                  padding:"8px 14px 8px 11px",borderRadius:13,border:"1px solid",
                  fontFamily:G.font,fontWeight:600,fontSize:12,cursor:"pointer",
                  borderColor:sel?S.h:"rgba(31,27,46,0.08)",
                  background:sel?S.h:G.white,
                  color:sel?"#fff":G.ink2,
                  display:"flex",alignItems:"center",gap:7,
                  boxShadow:sel?`0 6px 16px ${S.h}40`:"0 1px 2px rgba(31,27,46,0.03)",
                  transition:"all .2s ease",
                }}>
                  <TimerIcon type={k} size={14} color={sel?"#fff":G.ink2}/>
                  {tlbl(k,t)}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:10}}>
            <SLabel>{lang==="en"?"Default minutes":"Standard minuter"}</SLabel>
            <span style={{fontFamily:G.serif,fontWeight:600,fontSize:18,color:G.ink}}>{tc.defaultMin} {t.min}</span>
          </div>
          <input type="range" min={1} max={60} value={tc.defaultMin} onChange={e=>upd("defaultMin",+e.target.value)} style={{width:"100%",accentColor:S.h}}/>
          <div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap"}}>
            {[1,5,10,15,20,30,45].map(v=>{
              const sel=tc.defaultMin===v;
              return(
                <button key={v} onClick={()=>upd("defaultMin",v)} className="lt-press-soft" style={{
                  padding:"7px 12px",borderRadius:11,
                  border:`1px solid ${sel?S.h:"rgba(31,27,46,0.08)"}`,
                  background:sel?S.h:G.white,
                  color:sel?"#fff":G.ink2,
                  fontFamily:G.font,fontWeight:600,fontSize:12,cursor:"pointer",
                  transition:"all .2s ease",
                }}>{v}</button>
              );
            })}
          </div>
        </div>
        <div>
          <SLabel>{lang==="en"?"Default colour":"Standardfärg"}</SLabel>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {TMR_C.map(col=>{
              const sel=tc.defaultColor===col;
              return(
                <div key={col} onClick={()=>upd("defaultColor",col)} className="lt-press-soft" style={{
                  width:36,height:36,borderRadius:"50%",
                  background:col,cursor:"pointer",position:"relative",
                  transform:sel?"scale(1.1)":"scale(1)",
                  boxShadow:sel?`0 0 0 3px ${G.white}, 0 0 0 5px ${col}, 0 8px 20px ${col}55`:`0 2px 6px ${col}33`,
                  transition:"transform .25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow .25s ease",
                }}>
                  {sel&&(
                    <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{position:"absolute",inset:0,width:"100%",height:"100%",padding:8}}>
                      <path d="M5 12l5 5L20 7"/>
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return(
    <>
      {full&&<FullTimer key={key} type={type} totalSec={min*60} color={color} t={t} autoRun={true} onClose={()=>setFull(false)}/>}
      <div style={{flex:1,overflowY:"auto",padding:"16px 18px 24px",display:"flex",flexDirection:"column",gap:20,background:S.hb}}>
        {/* Preview + start — compact, at the top */}
        <div style={{background:G.white,borderRadius:26,padding:"24px 22px 22px",boxShadow:"0 12px 32px rgba(31,27,46,0.06), 0 2px 6px rgba(31,27,46,0.04)",display:"flex",flexDirection:"column",alignItems:"center",gap:16,border:"1px solid rgba(31,27,46,0.04)"}}>
          <TimerThumb type={type} color={color} size={130} min={min}/>
          <div style={{fontFamily:G.font,fontWeight:500,fontSize:13,color:G.ink2,letterSpacing:.2}}>{min} {t.min} · {tlbl(type,t)}</div>
          <button onClick={start} className="lt-press" style={{width:"100%",maxWidth:300,padding:"16px 0",borderRadius:18,border:"none",background:`linear-gradient(135deg,${color},${color}D8)`,color:"#fff",fontFamily:G.font,fontWeight:600,fontSize:15,letterSpacing:.3,cursor:"pointer",boxShadow:`0 14px 30px ${color}45, 0 3px 8px ${color}28`,display:"flex",alignItems:"center",justifyContent:"center",gap:9}}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3 2 L11 7 L3 12 Z"/></svg>
            {t.startTimer}
          </button>
        </div>
        {/* Minutes */}
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <SLabel>{t.timerMin}</SLabel>
            <span style={{fontFamily:G.serif,fontWeight:600,fontSize:22,color:G.ink}}>{min} {t.min}</span>
          </div>
          <input type="range" min={1} max={120} value={min} onChange={e=>setMin(+e.target.value)} style={{width:"100%",accentColor:color}}/>
          <div style={{display:"flex",gap:7,marginTop:12,flexWrap:"wrap"}}>
            {[1,5,10,15,20,30,45,60].map(v=>{
              const sel=min===v;
              return(
                <button
                  key={v}
                  onClick={()=>setMin(v)}
                  className="lt-press-soft"
                  style={{
                    padding:"9px 14px",borderRadius:13,
                    fontFamily:G.font,fontWeight:600,fontSize:13,cursor:"pointer",
                    border:`1px solid ${sel?color:"rgba(31,27,46,0.08)"}`,
                    background:sel?color:G.white,
                    color:sel?"#fff":G.ink2,
                    boxShadow:sel?`0 6px 16px ${color}40`:"0 1px 2px rgba(31,27,46,0.04)",
                    transition:"background .2s ease, color .2s ease, border-color .2s ease, box-shadow .2s ease",
                  }}>{v}</button>
              );
            })}
          </div>
        </div>
        {/* Type */}
        {allowed.length>1&&(
          <div>
            <SLabel>{t.timerType}</SLabel>
            <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(allowed.length,3)},1fr)`,gap:10}}>
              {allowed.map(k=>{
                const selected=type===k;
                return(
                  <button
                    key={k}
                    onClick={()=>setType(k)}
                    className="lt-press-soft"
                    style={{
                      padding:"18px 8px 14px",borderRadius:18,border:"1px solid",
                      fontFamily:G.font,fontWeight:600,fontSize:12,cursor:"pointer",
                      transition:"border-color .25s ease, background .25s ease, color .25s ease, box-shadow .3s ease",
                      borderColor:selected?color:"rgba(31,27,46,0.08)",
                      background:selected?`${color}10`:G.white,
                      color:selected?color:G.ink2,
                      boxShadow:selected?`0 12px 28px ${color}25, 0 2px 6px ${color}18`:`0 1px 3px rgba(31,27,46,0.04)`,
                      display:"flex",flexDirection:"column",alignItems:"center",gap:8,
                    }}>
                    <TimerIcon type={k} size={26} color={selected?color:G.ink2}/>
                    <span style={{letterSpacing:.2}}>{tlbl(k,t)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {/* Color */}
        <div>
          <SLabel>{t.timerColor}</SLabel>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {TMR_C.map(col=>{
              const selected=color===col;
              return(
                <div
                  key={col}
                  onClick={()=>setColor(col)}
                  className="lt-press-soft"
                  style={{
                    width:36,height:36,borderRadius:"50%",
                    background:col,cursor:"pointer",
                    position:"relative",
                    transform:selected?"scale(1.1)":"scale(1)",
                    boxShadow:selected?`0 0 0 3px ${G.white}, 0 0 0 5px ${col}, 0 8px 20px ${col}55`:`0 2px 6px ${col}33`,
                    transition:"transform .25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow .25s ease",
                  }}>
                  {selected&&(
                    <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{position:"absolute",inset:0,width:"100%",height:"100%",padding:8}}>
                      <path d="M5 12l5 5L20 7"/>
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══ Activity row ═══ */
function ActRow({item,cardStyle,isEditor,onEdit,onTap,onMarkDone,idx,lifeState="future",t}){
  const[anim,setAnim]=useState("in");
  const big=cardStyle==="big", compact=cardStyle==="compact";
  if(anim==="exit") return null;
  const handleClick=()=>{
    if(isEditor)onEdit(item);else onTap(item);
  };
  // Adaptive visual weight — past recedes, now is centered/full, future waits quietly
  const isPast = lifeState==="past";
  const isNow  = lifeState==="now";
  const wrapOpacity = isPast?0.42:1;
  const wrapSaturate = isPast?0.6:1;
  return(
    <div style={{animation:anim==="in"?`rIn .35s cubic-bezier(.2,.7,.2,1) both`:`rExit .8s cubic-bezier(.4,0,.2,1) forwards`,animationDelay:anim==="in"?`${idx*0.04}s`:"0s",opacity:wrapOpacity,filter:`saturate(${wrapSaturate})`,transition:"opacity .8s cubic-bezier(0.32, 0.72, 0, 1), filter .8s cubic-bezier(0.32, 0.72, 0, 1)"}}>
      <style>{`@keyframes rIn{from{opacity:0;transform:translateY(14px) scale(.985)}to{opacity:1;transform:none}}@keyframes rExit{0%{opacity:1;transform:scale(1);filter:none}40%{opacity:1;transform:scale(1.015);filter:brightness(1.04)}100%{opacity:0;transform:scale(.92) translateY(8px);filter:brightness(1.1)}}`}</style>
      <div
        onClick={handleClick}
        className="lt-press-soft"
        style={{
          background:G.white,
          borderRadius:big?22:18,
          overflow:"hidden",
          position:"relative",
          boxShadow: isNow?`0 14px 36px ${item.color}26, 0 4px 10px ${item.color}14`:sh.sm,
          border:`1px solid ${isNow?`${item.color}55`:G.border}`,
          cursor:"pointer",
          transition:"box-shadow .55s cubic-bezier(0.32, 0.72, 0, 1), border-color .55s cubic-bezier(0.32, 0.72, 0, 1), transform .26s cubic-bezier(0.32, 0.72, 0, 1)",
          userSelect:"none",
          WebkitUserSelect:"none",
          WebkitTouchCallout:"none",
        }}
        onMouseEnter={e=>{if(!isNow){e.currentTarget.style.boxShadow=sh.md;e.currentTarget.style.borderColor=`${item.color}40`;}}}
        onMouseLeave={e=>{if(!isNow){e.currentTarget.style.boxShadow=sh.sm;e.currentTarget.style.borderColor=G.border;}}}>
        {big&&<div style={{height:92,background:item.photo?"#000":`linear-gradient(135deg,${item.color}1F,${item.color}38)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:60,position:"relative",overflow:"hidden"}}>{item.photo?<img src={item.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:item.emoji}</div>}
        <div style={{display:"flex",alignItems:"center",gap:compact?10:13,padding:compact?"12px 14px":"16px 18px",position:"relative"}}>
          <div style={{position:"absolute",left:0,top:0,bottom:0,width:4,background:`linear-gradient(180deg,${item.color},${item.color}80)`,borderRadius:"18px 0 0 18px"}}/>
          <div style={{marginLeft:4}}/>
          {!big&&<div style={{fontSize:compact?30:38,lineHeight:1,minWidth:compact?44:54,height:compact?44:54,borderRadius:compact?12:14,background:item.photo?"#000":`linear-gradient(140deg,${item.color}18,${item.color}30)`,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${item.color}25`,flexShrink:0,overflow:"hidden"}}>{item.photo?<img src={item.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:item.emoji}</div>}
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:G.serif,fontWeight:500,fontSize:compact?16:19,color:G.ink,lineHeight:1.2,letterSpacing:-.3}}>{item.name}</div>
            <div style={{display:"flex",alignItems:"center",gap:7,marginTop:6,flexWrap:"wrap"}}>
              <span style={{fontFamily:G.font,fontWeight:500,fontSize:11.5,color:item.color,letterSpacing:.5}}>{fmtT(item.time,t)}{item.endTime?` – ${fmtT(item.endTime,t)}`:""}</span>
              {item.repeat&&item.repeat.type&&item.repeat.type!=="none"&&(
                <Tag col={item.color}>{item.repeat.type==="daily"?(t?.repDailyShort||"Dagligen"):item.repeat.type==="weekdays"?(t?.repWeekdays||"Vardagar"):item.repeat.type==="weekend"?(t?.repWeekend||"Helger"):(item.repeat.days||[]).length+" "+(t?.repDaysSuffix||"dagar")}</Tag>
              )}
              {item.steps?.length>0&&<Tag col={item.color}>{item.steps.length===1?(t?.stepCountOne||"1 steg"):(t?.stepCountMany||"{n} steg").replace("{n}",item.steps.length)}</Tag>}
              {item.timer?.on&&<Tag col={item.timer.color||"#E89B89"}>{item.timer.min} min</Tag>}
            </div>
          </div>
          {isEditor&&(
            <button onClick={e=>{e.stopPropagation();onEdit(item);}} aria-label={t?.edit||"Edit"} className="lt-press lumaPenBtn" style={{background:"transparent",border:`1px solid ${G.border}`,borderRadius:12,width:40,height:40,cursor:"pointer",color:G.ink2,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"border-color .25s ease, color .25s ease"}}>
              <IconPencil size={15}/>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══ Card view ═══ */
function CardView({acts,onTap,t,isEditor,onEdit,onMarkDone}){
  const[idx,setIdx]=useState(0);
  // pickState: idle | touching | swiping | picked | dropping | returning
  const[pickState,setPickState]=useState("idle");
  const[drag,setDrag]=useState({x:0,y:0});
  const[overTrash,setOverTrash]=useState(false);
  const startPt=useRef(null);
  const pickTimer=useRef(null);
  const trashRef=useRef(null);
  const imgRef=useRef(null);
  const item=acts[idx];
  const HOLD_MS=420;
  useEffect(()=>{if(idx>=acts.length&&acts.length>0) setIdx(Math.max(0,acts.length-1));},[acts.length,idx]);
  useEffect(()=>()=>{if(pickTimer.current)clearTimeout(pickTimer.current);},[]);
  if(!item) return <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:18,padding:40}}>
    <style>{`@keyframes emptyBreath{0%,100%{transform:scale(1);opacity:0.85}50%{transform:scale(1.03);opacity:1}}`}</style>
    <svg width="64" height="64" viewBox="0 0 64 64" style={{animation:"emptyBreath 4.2s ease-in-out infinite"}}>
      <defs>
        <radialGradient id="emFace" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF"/>
          <stop offset="100%" stopColor={`${SCREENS.home.h}33`}/>
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill="url(#emFace)" stroke={`${SCREENS.home.h}40`} strokeWidth="1"/>
      <path d="M22,32 L29,40 L43,24" stroke={SCREENS.home.deep} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.75"/>
    </svg>
    <div style={{fontFamily:G.serif,fontWeight:500,fontSize:22,color:G.inkSoft,letterSpacing:-.4,lineHeight:1.1}}>Alla aktiviteter är klara</div>
    <div style={{fontFamily:G.font,fontWeight:400,fontSize:13,color:"#9892AA",marginTop:-4,letterSpacing:.1}}>Du kan vila resten av dagen.</div>
  </div>;

  const cancelPickTimer=()=>{
    if(pickTimer.current){clearTimeout(pickTimer.current);pickTimer.current=null;}
  };
  const resetAll=()=>{
    cancelPickTimer();
    setPickState("idle");
    setDrag({x:0,y:0});
    setOverTrash(false);
    startPt.current=null;
  };

  const handleStart=(x,y)=>{
    if(isEditor) return;
    startPt.current={x,y,t:Date.now()};
    setPickState("touching");
    cancelPickTimer();
    pickTimer.current=setTimeout(()=>{
      setPickState("picked");
      if(typeof navigator!=="undefined"&&navigator.vibrate) navigator.vibrate(18);
    },HOLD_MS);
  };
  const handleMove=(x,y)=>{
    if(!startPt.current) return;
    const dx=x-startPt.current.x, dy=y-startPt.current.y;
    if(pickState==="touching"){
      if(Math.abs(dx)>10||Math.abs(dy)>10){
        cancelPickTimer();
        setPickState("swiping");
      }
    } else if(pickState==="picked"){
      setDrag({x:dx,y:dy});
      if(trashRef.current){
        const r=trashRef.current.getBoundingClientRect();
        const over=x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;
        if(over!==overTrash) setOverTrash(over);
      }
    }
  };
  const handleEnd=(x,y)=>{
    if(!startPt.current){cancelPickTimer();return;}
    const dx=x-startPt.current.x, dy=y-startPt.current.y;
    const dur=Date.now()-startPt.current.t;
    cancelPickTimer();
    if(pickState==="picked"){
      if(overTrash){
        setPickState("dropping");
        if(typeof navigator!=="undefined"&&navigator.vibrate) navigator.vibrate(35);
        setTimeout(()=>{
          chime();
          onMarkDone(item.id);
          setIdx(prev=>Math.min(prev,acts.length-2));
          resetAll();
        },420);
      } else {
        setPickState("returning");
        setDrag({x:0,y:0});
        setOverTrash(false);
        setTimeout(()=>setPickState("idle"),340);
      }
      startPt.current=null;
      return;
    }
    if(pickState==="swiping"){
      if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)){
        setIdx(i=>dx<0?Math.min(acts.length-1,i+1):Math.max(0,i-1));
      }
    } else if(pickState==="touching"&&dur<300&&Math.abs(dx)<8&&Math.abs(dy)<8){
      isEditor?onEdit(item):onTap(item);
    }
    resetAll();
  };

  // Window listeners while picked — track drag globally so user can move freely
  useEffect(()=>{
    if(pickState!=="picked") return;
    const onMM=(e)=>{
      const x=e.touches?.[0]?.clientX??e.clientX;
      const y=e.touches?.[0]?.clientY??e.clientY;
      handleMove(x,y);
      if(e.cancelable) e.preventDefault();
    };
    const onMU=(e)=>{
      const x=e.changedTouches?.[0]?.clientX??e.clientX;
      const y=e.changedTouches?.[0]?.clientY??e.clientY;
      handleEnd(x,y);
    };
    window.addEventListener("mousemove",onMM);
    window.addEventListener("mouseup",onMU);
    window.addEventListener("touchmove",onMM,{passive:false});
    window.addEventListener("touchend",onMU);
    window.addEventListener("touchcancel",onMU);
    return()=>{
      window.removeEventListener("mousemove",onMM);
      window.removeEventListener("mouseup",onMU);
      window.removeEventListener("touchmove",onMM);
      window.removeEventListener("touchend",onMU);
      window.removeEventListener("touchcancel",onMU);
    };
    // eslint-disable-next-line
  },[pickState,overTrash]);

  const onTS=e=>{
    const x=e.touches?.[0]?.clientX??e.clientX;
    const y=e.touches?.[0]?.clientY??e.clientY;
    handleStart(x,y);
  };
  const onTM=e=>{
    if(pickState==="picked") return; // window listener handles it
    const x=e.touches?.[0]?.clientX??e.clientX;
    const y=e.touches?.[0]?.clientY??e.clientY;
    handleMove(x,y);
  };
  const onTE=e=>{
    if(pickState==="picked") return;
    const x=e.changedTouches?.[0]?.clientX??e.clientX;
    const y=e.changedTouches?.[0]?.clientY??e.clientY;
    handleEnd(x,y);
  };

  const cardLifted = pickState==="picked"||pickState==="dropping";
  const showTrash = cardLifted||pickState==="returning";
  // Smooth dim of background during pickup — fades in over 300ms, out over 400ms.
  // The card and trash sit above via higher z-index, so only the rest of the UI dims.
  const showDim = cardLifted||pickState==="returning";

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:18,padding:"0 20px",userSelect:"none",position:"relative"}}>
      <style>{`
        @keyframes trashIn{from{opacity:0;transform:translateX(-50%) translateY(30px) scale(0.7)}to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}
        @keyframes trashOut{from{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}to{opacity:0;transform:translateX(-50%) translateY(30px) scale(0.7)}}
      `}</style>

      {/* Background dim — soft veil over everything except the lifted card and trash */}
      {showDim && (
        <div style={{
          position:"fixed",
          inset:0,
          background:"rgba(31,27,46,0.32)",
          backdropFilter:"blur(6px)",
          WebkitBackdropFilter:"blur(6px)",
          opacity: pickState==="returning"?0:1,
          transition: pickState==="returning"
            ? "opacity 0.4s cubic-bezier(0.32, 0.72, 0, 1), backdrop-filter 0.4s ease"
            : "opacity 0.3s cubic-bezier(0.32, 0.72, 0, 1), backdrop-filter 0.3s ease",
          zIndex:40,
          pointerEvents:"none",
        }}/>
      )}

      <div
        onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE} onTouchCancel={resetAll}
        onMouseDown={onTS} onMouseMove={onTM} onMouseUp={onTE} onMouseLeave={()=>{if(pickState!=="picked")resetAll();}}
        onContextMenu={e=>e.preventDefault()}
        draggable={false}
        style={{
          width:"100%",maxWidth:340,
          background: cardLifted
            ? `linear-gradient(180deg, ${G.white}, ${G.cream})`
            : G.white,
          borderRadius:30,padding:"34px 26px 28px",textAlign:"center",
          cursor:cardLifted?"grabbing":"pointer",
          boxShadow: cardLifted
            ? `0 18px 44px ${item.color}1F, 0 4px 10px rgba(31,27,46,0.08)`
            : `0 18px 60px ${item.color}1F`,
          border:`1px solid ${item.color}25`,
          transition:"box-shadow .35s ease, background .35s ease",
          position:"relative",
          overflow:"visible",
          touchAction: pickState==="picked"?"none":"pan-x",
          zIndex: cardLifted?50:1,
          WebkitUserSelect:"none",userSelect:"none",WebkitTouchCallout:"none",
        }}>
        {/* Image wrapper — gets the offset transform during pickup so only the image drags.
            Same proven offset-pattern that worked on the whole card, just applied here. */}
        <div ref={imgRef} style={{
          display:"inline-block",
          transform:
            pickState==="picked"
              ? `translate(${drag.x}px, ${drag.y}px) scale(${overTrash?0.55:1.08}) rotate(${Math.max(-6,Math.min(6,drag.x*0.04))}deg)`
            : pickState==="dropping"
              ? `translate(${drag.x}px, ${drag.y}px) scale(0.15) rotate(12deg)`
            : pickState==="returning"
              ? "translate(0,0) scale(1) rotate(0deg)"
            : "none",
          transition:
            pickState==="picked"
              ? "transform 0.06s linear"
            : pickState==="dropping"
              ? "transform 0.46s cubic-bezier(.5,0,.75,0), opacity 0.42s ease"
            : pickState==="returning"
              ? "transform 0.42s cubic-bezier(.34,1.56,.64,1)"
            : "transform 0.2s ease",
          opacity: pickState==="dropping"?0:1,
          willChange:"transform",
          position:"relative",
          zIndex:5,
        }}>
          {item.photo?(
            <div style={{
              width:140,height:140,borderRadius:24,overflow:"hidden",margin:"0 auto 14px",
              position:"relative",background:"#FFFFFF",
              boxShadow: cardLifted
                ? `0 28px 48px rgba(31,27,46,0.38), 0 10px 20px rgba(31,27,46,0.22), 0 2px 6px rgba(31,27,46,0.14), 0 0 0 3px #FFFFFF, 0 0 0 4px ${item.color}30`
                : `0 8px 24px ${item.color}33`,
              transition:"box-shadow 0.4s cubic-bezier(0.32, 0.72, 0, 1)",
            }}>
              <img src={item.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover",display:"block",opacity:1}}/>
            </div>
          ):(
            <div style={{
              fontSize:76,lineHeight:1,marginBottom:14,display:"inline-block",padding:18,borderRadius:24,
              background:cardLifted
                ? `linear-gradient(140deg, #FFFFFF, ${item.color}14)`
                : `linear-gradient(140deg,${item.color}1A,${item.color}30)`,
              pointerEvents:"none",position:"relative",
              boxShadow: cardLifted
                ? `0 28px 48px rgba(31,27,46,0.28), 0 10px 20px rgba(31,27,46,0.18), 0 2px 6px rgba(31,27,46,0.10), 0 0 0 3px #FFFFFF, 0 0 0 4px ${item.color}30`
                : "none",
              transition:"box-shadow 0.4s cubic-bezier(0.32, 0.72, 0, 1), background 0.32s ease",
            }}>{item.emoji}</div>
          )}
        </div>
        {/* Text content fades together as a unit when card is lifted — image stays bright */}
        <div style={{
          opacity: cardLifted?0.28:1,
          transition:"opacity 0.32s cubic-bezier(0.32, 0.72, 0, 1)",
        }}>
          <div style={{fontFamily:G.font,fontWeight:600,fontSize:11,color:item.color,letterSpacing:2.5,textTransform:"uppercase",marginBottom:6,pointerEvents:"none",position:"relative"}}>{fmtT(item.time,t)}</div>
          <div style={{fontFamily:G.serif,fontWeight:600,fontSize:24,color:G.inkSoft,lineHeight:1.2,letterSpacing:-.4,pointerEvents:"none",position:"relative"}}>{item.name}</div>
          {item.steps?.length>0&&<div style={{display:"flex",gap:8,justifyContent:"center",marginTop:14,flexWrap:"wrap",pointerEvents:"none",position:"relative"}}>{item.steps.slice(0,5).map(s=><span key={s.id} style={{fontSize:22}}>{s.emoji}</span>)}{item.steps.length>5&&<span style={{fontFamily:G.font,fontSize:13,color:G.ink2}}>+{item.steps.length-5}</span>}</div>}
        </div>
      </div>

      {/* Trash drop target — appears when card is picked up */}
      {showTrash&&(
        <div
          ref={trashRef}
          style={{
            position:"absolute",bottom:22,left:"50%",
            transform:`translateX(-50%) scale(${overTrash?1.28:1})`,
            width:80,height:80,borderRadius:26,
            background: overTrash
              ? `linear-gradient(135deg, ${item.color}, ${item.color}D0)`
              : "rgba(255,255,255,0.92)",
            backdropFilter:"blur(16px)",
            WebkitBackdropFilter:"blur(16px)",
            border:`1.5px solid ${overTrash?`${item.color}`:"rgba(31,27,46,0.08)"}`,
            display:"flex",alignItems:"center",justifyContent:"center",
            color: overTrash?"#fff":G.ink2,
            transition:"transform .28s cubic-bezier(.34,1.56,.64,1), background .25s ease, border-color .25s ease, color .25s ease, box-shadow .3s ease",
            pointerEvents:"none",
            zIndex:100,
            animation: pickState==="returning"
              ? "trashOut 0.32s cubic-bezier(.4,0,.6,1) forwards"
              : "trashIn 0.46s cubic-bezier(.34,1.56,.64,1) both",
            boxShadow: overTrash
              ? `0 28px 60px ${item.color}55, 0 8px 18px ${item.color}33, inset 0 1px 0 rgba(255,255,255,0.30)`
              : "0 18px 40px rgba(31,27,46,0.10), 0 4px 10px rgba(31,27,46,0.06), inset 0 1px 0 rgba(255,255,255,0.95)",
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{transition:"transform .25s cubic-bezier(.34,1.56,.64,1)",transform:overTrash?"scale(1.08)":"scale(1)"}}>
            <path d="M3 6h18"/>
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            <path d="M19 6l-1.2 14a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 6"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
          </svg>
        </div>
      )}

      {/* Pagination dots — hidden when picked */}
      <div style={{display:"flex",gap:8,opacity:cardLifted?0:1,transition:"opacity .25s ease"}}>{acts.map((_,i)=><div key={i} onClick={()=>setIdx(i)} style={{height:8,width:i===idx?24:8,borderRadius:5,background:i===idx?item.color:G.border,cursor:"pointer",transition:"all .3s"}}/>)}</div>

      {/* Subtle navigation row — hidden when picked */}
      <div style={{display:"flex",gap:10,alignItems:"center",opacity:cardLifted?0:1,transition:"opacity .25s ease",pointerEvents:cardLifted?"none":"auto"}}>
        <button onClick={()=>setIdx(i=>Math.max(0,i-1))} disabled={idx===0} style={{padding:"8px 18px",borderRadius:12,border:"none",fontFamily:G.font,fontWeight:600,fontSize:12,cursor:idx===0?"default":"pointer",background:idx===0?G.cream:SCREENS.home.hl,color:idx===0?G.ink3:SCREENS.home.deep}}>←</button>
        <div style={{fontFamily:G.font,fontWeight:500,fontSize:11,color:G.ink3,letterSpacing:.5,minWidth:36,textAlign:"center"}}>{idx+1} / {acts.length}</div>
        <button onClick={()=>setIdx(i=>Math.min(acts.length-1,i+1))} disabled={idx===acts.length-1} style={{padding:"8px 18px",borderRadius:12,border:"none",fontFamily:G.font,fontWeight:600,fontSize:12,cursor:idx===acts.length-1?"default":"pointer",background:idx===acts.length-1?G.cream:SCREENS.home.hl,color:idx===acts.length-1?G.ink3:SCREENS.home.deep}}>→</button>
      </div>
    </div>
  );
}


/* ═══ Shared UI primitives ═══ */
function Overlay({children,onClose}){
  // Track the visual viewport (the part of the screen NOT covered by the keyboard).
  // This is the only reliable way to handle iOS keyboard — dvh doesn't always work,
  // and CSS-only solutions fail across iOS Safari versions.
  const[vv,setVv]=useState(()=>{
    if(typeof window==="undefined") return{h:800,offsetTop:0};
    const v=window.visualViewport;
    return v?{h:v.height,offsetTop:v.offsetTop}:{h:window.innerHeight,offsetTop:0};
  });
  useEffect(()=>{
    if(typeof document==="undefined") return;
    const body=document.body;
    const scrollY=window.scrollY;
    const prevPosition=body.style.position;
    const prevTop=body.style.top;
    const prevWidth=body.style.width;
    const prevOverflow=body.style.overflow;
    body.style.position="fixed";
    body.style.top=`-${scrollY}px`;
    body.style.width="100%";
    body.style.overflow="hidden";

    // Watch visual viewport — updates when keyboard opens/closes
    const updateVv=()=>{
      const v=window.visualViewport;
      if(!v) return;
      setVv({h:v.height,offsetTop:v.offsetTop});
    };
    if(window.visualViewport){
      window.visualViewport.addEventListener("resize",updateVv);
      window.visualViewport.addEventListener("scroll",updateVv);
      updateVv();
    }

    return()=>{
      body.style.position=prevPosition;
      body.style.top=prevTop;
      body.style.width=prevWidth;
      body.style.overflow=prevOverflow;
      window.scrollTo(0,scrollY);
      if(window.visualViewport){
        window.visualViewport.removeEventListener("resize",updateVv);
        window.visualViewport.removeEventListener("scroll",updateVv);
      }
    };
  },[]);
  return(
    <div onClick={onClose} style={{
      position:"fixed",
      // Anchor to the VISIBLE viewport — when keyboard opens, this shrinks
      top:vv.offsetTop,left:0,right:0,
      height:vv.h, // explicit pixel height — bypasses CSS vh quirks
      background:"rgba(31,27,46,0.55)",
      display:"flex",alignItems:"flex-end",justifyContent:"center",
      zIndex:9500,
      animation:"ovlIn 0.32s cubic-bezier(0.32, 0.72, 0, 1) both",
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        width:"100%",maxWidth:480,
        // ALWAYS fill 92% of visible viewport — no conditional, no detection.
        // When keyboard is open, vv.h shrinks → Sheet shrinks with it but still fills available space.
        // When keyboard is closed, Sheet is tall and shows all content directly.
        // This means input fields always appear high on screen, never hidden behind keyboard.
        height:Math.floor(vv.h*0.92),
        display:"flex",flexDirection:"column",
        animation:"shtIn 0.5s cubic-bezier(0.32, 0.72, 0, 1) both",
      }}>
        {children}
      </div>
    </div>
  );
}
function Sheet({children,scroll}){
  // Sheet fills available space within its Overlay parent (which is sized to visual viewport).
  // Content scrolls within Sheet — keyboard never hides Save buttons because Sheet always
  // fits within the visible area above the keyboard.
  return(<div style={{
    background:G.white,
    borderRadius:"28px 28px 0 0",
    padding:"28px 22px max(28px, env(safe-area-inset-bottom, 12px))",
    flex:1,
    minHeight:0, // critical for flex children to allow scroll
    overflowY:"auto",
    WebkitOverflowScrolling:"touch",
    overscrollBehavior:"contain",
    boxShadow:"0 -24px 60px rgba(31,27,46,0.18)",
  }}>{children}</div>);
}
function Toggle({on,onChange,color}){return(<div onClick={onChange} className="lt-press-soft" style={{width:52,height:30,borderRadius:15,background:on?color:G.border2,cursor:"pointer",position:"relative",transition:"background .3s cubic-bezier(0.32, 0.72, 0, 1)",flexShrink:0}}><div style={{width:24,height:24,borderRadius:"50%",background:G.white,position:"absolute",top:3,left:on?25:3,transition:"left .35s cubic-bezier(0.34, 1.56, 0.64, 1)",boxShadow:"0 2px 6px rgba(0,0,0,.18)"}}/></div>);}
function SLabel({children}){return <div style={{fontFamily:G.font,fontWeight:500,fontSize:10.5,color:"#9892AA",letterSpacing:1.4,textTransform:"uppercase",marginBottom:14}}>{children}</div>;}
function Tag({col,children}){return <span style={{fontFamily:G.font,fontWeight:600,fontSize:10.5,color:col,background:`${col}1F`,borderRadius:7,padding:"3px 8px",letterSpacing:.3,whiteSpace:"nowrap"}}>{children}</span>;}
const INP={width:"100%",padding:"13px 16px",borderRadius:14,border:`1px solid ${G.border}`,fontSize:15,outline:"none",fontFamily:G.font,color:G.ink,boxSizing:"border-box",marginBottom:16,background:G.cream};
const GHOST={padding:"13px 20px",borderRadius:14,border:`1px solid ${G.border}`,background:G.white,color:G.ink2,fontFamily:G.font,fontWeight:600,fontSize:14,cursor:"pointer"};

function TabB({active,gold,children,onClick,color,deep,flex=1}){
  return(
    <button onClick={onClick} className="lt-press-soft" style={{flex,padding:"9px 0",borderRadius:11,border:"none",fontFamily:G.font,fontWeight:active||gold?600:500,fontSize:12,letterSpacing:.3,cursor:"pointer",transition:"transform .22s cubic-bezier(0.32, 0.72, 0, 1), background .28s cubic-bezier(0.32, 0.72, 0, 1), box-shadow .28s ease, color .22s ease",background:gold?"linear-gradient(135deg,#FDE68A,#F4C95C)":active?`linear-gradient(135deg,${color},${color}E5)`:"transparent",color:gold?"#78350F":active?"#fff":G.ink2,boxShadow:active?`0 4px 14px ${color}55, 0 1px 3px ${color}33`:gold?"0 3px 10px #FDE68A88":"none"}}>{children}</button>
  );
}

/* ═══ Story viewer (fullscreen page-by-page) ═══ */
function StoryViewer({story,lang,t,onClose}){
  const[idx,setIdx]=useState(0);
  const[showTimer,setShowTimer]=useState(false);
  const startX=useRef(null);
  const isFT=story.type==="firstthen";
  const page=story.pages[idx];
  if(!page) return null;
  const onTS=e=>{startX.current=e.touches?.[0]?.clientX??e.clientX;};
  const onTE=e=>{if(startX.current===null)return;const dx=(e.changedTouches?.[0]?.clientX??e.clientX)-startX.current;if(Math.abs(dx)>40){if(dx<0&&idx<story.pages.length-1)setIdx(i=>i+1);else if(dx>0&&idx>0)setIdx(i=>i-1);}startX.current=null;};
  // Per-page timer — appears underneath the current page's content card
  const pt=page.timer;
  const hasTimer=pt?.on;
  // Auto-close timer when navigating between pages
  useEffect(()=>{setShowTimer(false);},[idx]);

  // FIRST-THEN: special two-card contract layout
  if(isFT){
    const firstPage=story.pages[0], thenPage=story.pages[1];
    const firstHasTimer=firstPage?.timer?.on;
    const thenHasTimer=thenPage?.timer?.on;
    return(
      <div style={{position:"fixed",inset:0,zIndex:9000,background:"#FFFFFF",backgroundImage:`linear-gradient(165deg,${story.color}12 0%,#FFFFFF 70%)`,display:"flex",flexDirection:"column",userSelect:"none",animation:"ftIn .25s ease"}}>
        {showTimer&&hasTimer&&<FullTimer type={pt.type} totalSec={pt.min*60} color={pt.color} t={t} autoRun={true} onClose={()=>setShowTimer(false)}/>}
        <style>{`@keyframes ftArrow{0%{transform:translateX(0)}50%{transform:translateX(8px)}100%{transform:translateX(0)}}`}</style>
        <div style={{padding:"22px 22px 0",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10,flex:1,minWidth:0}}>
            {story.photo?(
              <div style={{width:32,height:32,borderRadius:10,overflow:"hidden",flexShrink:0}}>
                <img src={story.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              </div>
            ):(
              <span style={{fontSize:22}}>{story.emoji}</span>
            )}
            <div style={{fontFamily:G.serif,fontWeight:600,fontSize:16,color:story.color,letterSpacing:-.2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lsText(story,lang)}</div>
          </div>
          <button onClick={onClose} style={{width:44,height:44,borderRadius:22,border:`1px solid ${G.border}`,background:G.white,color:G.ink2,cursor:"pointer",boxShadow:sh.sm,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><IconX size={16}/></button>
        </div>
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px 18px",gap:10}}>
          {/* FIRST */}
          <div style={{flex:1,background:G.white,borderRadius:26,padding:"18px 12px 22px",boxShadow:`0 16px 40px ${story.color}26`,border:`1px solid ${story.color}30`,textAlign:"center"}}>
            <div style={{fontFamily:G.font,fontWeight:700,fontSize:11,color:story.color,letterSpacing:2.5,textTransform:"uppercase",marginBottom:12}}>{story.firstLabel?.trim()||t.first||"Först"}</div>
            <div style={{width:"100%",aspectRatio:"1",borderRadius:20,background:firstPage?.photo?"#000":`linear-gradient(140deg,${story.color}1A,${story.color}3A)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:72,marginBottom:12,overflow:"hidden"}}>
              {firstPage?.photo?<img src={firstPage.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:firstPage?.emoji}
            </div>
            <div style={{fontFamily:G.serif,fontWeight:600,fontSize:17,color:G.ink,lineHeight:1.2,letterSpacing:-.2}}>{lsText(firstPage,lang)}</div>
            {firstHasTimer&&(
              <button onClick={()=>{setIdx(0);setShowTimer(true);}} className="lt-press-soft" style={{
                marginTop:12,display:"inline-flex",alignItems:"center",gap:6,
                padding:"8px 12px",borderRadius:12,
                background:`${firstPage.timer.color}10`,
                border:`1px solid ${firstPage.timer.color}40`,
                color:firstPage.timer.color,
                fontFamily:G.font,fontWeight:600,fontSize:11,cursor:"pointer",
                boxShadow:`0 4px 12px ${firstPage.timer.color}22`,
              }}>
                <TimerIcon type={firstPage.timer.type} size={13} color={firstPage.timer.color}/>
                <span>{firstPage.timer.min} {t.min}</span>
              </button>
            )}
          </div>
          {/* Arrow — elegant SVG with subtle drawn animation */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",animation:"ftArrow 2s ease infinite",flexShrink:0,padding:"0 4px"}}>
            <svg width="36" height="20" viewBox="0 0 36 20" style={{overflow:"visible"}}>
              <defs>
                <linearGradient id={`ftArrG${story.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={story.color} stopOpacity="0.5"/>
                  <stop offset="60%" stopColor={story.color} stopOpacity="0.95"/>
                  <stop offset="100%" stopColor={story.color} stopOpacity="1"/>
                </linearGradient>
              </defs>
              <path d="M 3 10 L 28 10 M 22 4 L 28 10 L 22 16"
                stroke={`url(#ftArrG${story.id})`} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {/* THEN */}
          <div style={{flex:1,background:G.white,borderRadius:26,padding:"18px 12px 22px",boxShadow:`0 16px 40px ${story.color}26`,border:`1px solid ${story.color}30`,textAlign:"center"}}>
            <div style={{fontFamily:G.font,fontWeight:700,fontSize:11,color:story.color,letterSpacing:2.5,textTransform:"uppercase",marginBottom:12}}>{story.thenLabel?.trim()||t.then||"Sedan"}</div>
            <div style={{width:"100%",aspectRatio:"1",borderRadius:20,background:thenPage?.photo?"#000":`linear-gradient(140deg,${story.color}1A,${story.color}3A)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:72,marginBottom:12,overflow:"hidden"}}>
              {thenPage?.photo?<img src={thenPage.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:thenPage?.emoji}
            </div>
            <div style={{fontFamily:G.serif,fontWeight:600,fontSize:17,color:G.ink,lineHeight:1.2,letterSpacing:-.2}}>{lsText(thenPage,lang)}</div>
            {thenHasTimer&&(
              <button onClick={()=>{setIdx(1);setShowTimer(true);}} className="lt-press-soft" style={{
                marginTop:12,display:"inline-flex",alignItems:"center",gap:6,
                padding:"8px 12px",borderRadius:12,
                background:`${thenPage.timer.color}10`,
                border:`1px solid ${thenPage.timer.color}40`,
                color:thenPage.timer.color,
                fontFamily:G.font,fontWeight:600,fontSize:11,cursor:"pointer",
                boxShadow:`0 4px 12px ${thenPage.timer.color}22`,
              }}>
                <TimerIcon type={thenPage.timer.type} size={13} color={thenPage.timer.color}/>
                <span>{thenPage.timer.min} {t.min}</span>
              </button>
            )}
          </div>
        </div>
        <div style={{padding:"0 24px 32px"}}>
          <button onClick={onClose} style={{width:"100%",padding:"15px 0",borderRadius:18,border:"none",background:`linear-gradient(135deg,${story.color},${story.color}DC)`,color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:15,cursor:"pointer",boxShadow:sh.c(story.color)}}>✓ {t.ftDone||"Klart!"}</button>
        </div>
      </div>
    );
  }

  // SEQUENCE: normal page-by-page viewer
  return(
    <div onTouchStart={onTS} onTouchEnd={onTE} onMouseDown={onTS} onMouseUp={onTE} style={{position:"fixed",inset:0,zIndex:9000,background:"#FFFFFF",backgroundImage:`linear-gradient(165deg,${story.color}10 0%,#FFFFFF 70%)`,display:"flex",flexDirection:"column",userSelect:"none",animation:"ftIn .25s ease"}}>
      <div style={{padding:"22px 22px 0",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10,flex:1,minWidth:0}}>
          {story.photo?(
            <div style={{width:32,height:32,borderRadius:10,overflow:"hidden",flexShrink:0}}>
              <img src={story.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            </div>
          ):(
            <span style={{fontSize:22}}>{story.emoji}</span>
          )}
          <div style={{fontFamily:G.serif,fontWeight:600,fontSize:16,color:story.color,letterSpacing:-.2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lsText(story,lang)}</div>
        </div>
        <button onClick={onClose} style={{width:44,height:44,borderRadius:22,border:`1px solid ${G.border}`,background:G.white,color:G.ink2,cursor:"pointer",boxShadow:sh.sm,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><IconX size={16}/></button>
      </div>
      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:showTimer?"flex-start":"center",padding:"20px 30px",gap:20,transition:"justify-content .4s ease"}}>
        {/* Page image — shrinks when timer is active so both fit */}
        <div style={{
          width:showTimer?140:220,
          height:showTimer?140:220,
          borderRadius:showTimer?28:36,
          background:page.photo?"transparent":`linear-gradient(140deg,${story.color}1A,${story.color}38)`,
          border:`1px solid ${story.color}30`,
          overflow:"hidden",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:showTimer?76:120,
          boxShadow:`0 ${showTimer?12:20}px ${showTimer?30:50}px ${story.color}26`,
          flexShrink:0,
          transition:"width .45s cubic-bezier(0.32, 0.72, 0, 1), height .45s cubic-bezier(0.32, 0.72, 0, 1), border-radius .45s, font-size .45s, box-shadow .45s",
        }}>
          {page.photo?<img src={page.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:page.emoji}
        </div>
        <div style={{
          fontFamily:G.serif,
          fontWeight:600,
          fontSize:showTimer?16:22,
          color:G.ink,
          textAlign:"center",
          lineHeight:1.35,
          maxWidth:340,
          letterSpacing:-.3,
          transition:"font-size .45s",
        }}>{lsText(page,lang)}</div>

        {/* Timer — pill (idle) or live inline animation (running) */}
        {hasTimer&&!showTimer&&(
          <button onClick={()=>setShowTimer(true)} className="lt-press-soft" style={{
            display:"inline-flex",alignItems:"center",gap:9,
            padding:"11px 18px 11px 14px",borderRadius:18,
            background:G.white,
            border:`1px solid ${pt.color}40`,
            color:pt.color,
            fontFamily:G.font,fontWeight:600,fontSize:13,cursor:"pointer",
            boxShadow:`0 10px 28px ${pt.color}28, 0 2px 6px ${pt.color}22`,
            letterSpacing:.1,
            animation:"timerPillIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both",
          }}>
            <style>{`@keyframes timerPillIn{0%{opacity:0;transform:translateY(8px) scale(0.92)}100%{opacity:1;transform:translateY(0) scale(1)}}`}</style>
            <TimerIcon type={pt.type} size={16} color={pt.color}/>
            <span>{pt.min} {t.min}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.7,marginLeft:2}}>
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </button>
        )}

        {/* Inline running timer — appears under the card */}
        {hasTimer&&showTimer&&(
          <div style={{
            width:"100%",
            display:"flex",
            flexDirection:"column",
            alignItems:"center",
            gap:14,
            animation:"timerInlineIn 0.55s cubic-bezier(0.32, 0.72, 0, 1) both",
          }}>
            <style>{`@keyframes timerInlineIn{0%{opacity:0;transform:translateY(14px) scale(0.95)}100%{opacity:1;transform:translateY(0) scale(1)}}`}</style>
            <TimerComp type={pt.type} totalSec={pt.min*60} color={pt.color} t={t} autoRun={true} size={Math.min(240, typeof window!=="undefined"?Math.min(window.innerWidth,480)-72:240)} showCtrl={true}/>
            <button onClick={()=>setShowTimer(false)} className="lt-press-soft" style={{
              padding:"8px 16px",borderRadius:12,
              border:`1px solid ${G.border}`,
              background:G.white,
              color:G.ink2,
              fontFamily:G.font,fontWeight:600,fontSize:12,
              cursor:"pointer",
              letterSpacing:.2,
            }}>{lang==="sv"?"Dölj timer":"Hide timer"}</button>
          </div>
        )}
      </div>
      <div style={{padding:"0 18px 32px"}}>
        {/* Navigation row — large circular arrow buttons flanking the page dots.
            Sized for accessibility (56px minimum tap target), high-contrast in the
            story's own colour, impossible to miss for users with cognitive or
            motor limitations. The "done" state on the last page swaps the right
            arrow for a checkmark. */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}}>
          {/* Previous — disabled visual when at first page but still visible */}
          <button
            onClick={()=>setIdx(i=>Math.max(0,i-1))}
            disabled={idx===0}
            aria-label={t.prev}
            className="lt-press"
            style={{
              width:60,height:60,borderRadius:"50%",border:"none",flexShrink:0,
              background:idx===0?G.cream:G.white,
              color:idx===0?G.ink3:story.color,
              cursor:idx===0?"default":"pointer",
              boxShadow:idx===0?"none":`0 6px 18px ${story.color}33, 0 2px 6px ${story.color}1A`,
              display:"flex",alignItems:"center",justifyContent:"center",
              opacity:idx===0?0.4:1,
              transition:"opacity .3s ease, box-shadow .3s ease, background .3s ease",
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          {/* Page indicators — also serve as direct jump-to */}
          <div style={{display:"flex",gap:6,justifyContent:"center",alignItems:"center",flex:1,flexWrap:"wrap"}}>
            {story.pages.map((_,i)=>(
              <button key={i} onClick={()=>setIdx(i)} aria-label={`${t.pageNum} ${i+1}`} className="lt-press-soft" style={{
                padding:"10px 4px",border:"none",background:"transparent",cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"center",
              }}>
                <div style={{height:9,width:i===idx?28:9,borderRadius:5,background:i===idx?story.color:`${story.color}44`,transition:"all .3s cubic-bezier(0.32, 0.72, 0, 1)"}}/>
              </button>
            ))}
          </div>

          {/* Next / Done — primary action, filled with story colour for emphasis */}
          <button
            onClick={()=>{if(idx<story.pages.length-1)setIdx(i=>i+1);else onClose();}}
            aria-label={idx<story.pages.length-1?t.next:(t.ftDone||(lang==="sv"?"Klar":"Done"))}
            className="lt-press"
            style={{
              width:60,height:60,borderRadius:"50%",border:"none",flexShrink:0,
              background:`linear-gradient(135deg,${story.color},${story.color}DC)`,
              color:"#fff",cursor:"pointer",
              boxShadow:`0 10px 26px ${story.color}55, 0 3px 8px ${story.color}33, inset 0 1px 0 rgba(255,255,255,0.25)`,
              display:"flex",alignItems:"center",justifyContent:"center",
            }}
          >
            {idx<story.pages.length-1?(
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            ):(
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══ Single page editor row ═══ */
function PageEditor({page,idx,total,onUpdate,onRemove,onMoveUp,onMoveDown,color,t}){
  const[showE,setShowE]=useState(false);
  const[epage,setEpage]=useState(0);
  const pp=40;
  const fileRef=useRef(null);
  const cameraRef=useRef(null);
  const onPhoto=e=>{
    const f=e.target.files?.[0]; if(!f) return;
    const r=new FileReader();
    r.onload=()=>{
      const img=new Image();
      img.onload=()=>{
        const max=500, scale=Math.min(1,max/Math.max(img.width,img.height));
        const w=img.width*scale, h=img.height*scale;
        const cv=document.createElement("canvas");
        cv.width=w; cv.height=h;
        cv.getContext("2d").drawImage(img,0,0,w,h);
        onUpdate("photo",cv.toDataURL("image/jpeg",0.82));
      };
      img.src=r.result;
    };
    r.readAsDataURL(f);
  };
  return(
    <div style={{background:G.cream,borderRadius:16,padding:16,marginBottom:12,border:`1px solid ${G.border}`,animation:`pageEditorIn 0.45s cubic-bezier(0.32, 0.72, 0, 1) ${Math.min(idx*0.04, 0.3)}s both`}}>
      <style>{`@keyframes pageEditorIn{0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
        <span style={{fontFamily:G.font,fontWeight:600,fontSize:11,color:G.ink3,letterSpacing:.8}}>{t.pageNum} {idx+1}</span>
        <div style={{flex:1}}/>
        <button onClick={onMoveUp} disabled={idx===0} style={{padding:"4px 9px",borderRadius:8,border:"none",background:idx===0?G.white:G.border,color:idx===0?G.ink3:G.ink2,cursor:idx===0?"default":"pointer",fontSize:11}}>↑</button>
        <button onClick={onMoveDown} disabled={idx===total-1} style={{padding:"4px 9px",borderRadius:8,border:"none",background:idx===total-1?G.white:G.border,color:idx===total-1?G.ink3:G.ink2,cursor:idx===total-1?"default":"pointer",fontSize:11}}>↓</button>
        <button onClick={onRemove} aria-label="Ta bort" style={{padding:"6px 9px",borderRadius:8,border:"none",background:"#FEF2F2",color:"#EF4444",cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center"}}><IconX size={11}/></button>
      </div>

      {/* Top row — bild + textfält */}
      <div style={{display:"flex",gap:12,marginBottom:12}}>
        <div onClick={()=>{if(!page.photo)setShowE(true);}} style={{width:80,height:80,borderRadius:14,background:page.photo?"transparent":G.white,border:`1px solid ${G.border}`,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,flexShrink:0,cursor:"pointer"}}>
          {page.photo?<img src={page.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:page.emoji}
        </div>
        <textarea value={page.sv} onChange={e=>onUpdate("sv",e.target.value)} placeholder={t.pageTextPH} className="lt-input" style={{...INP,marginBottom:0,minHeight:80,resize:"vertical",fontSize:14,fontFamily:G.font,flex:1}}/>
      </div>

      {/* Visual media controls — labelled section like schemat */}
      <div style={{fontFamily:G.font,fontWeight:500,fontSize:10,color:"#9892AA",letterSpacing:1.2,textTransform:"uppercase",marginBottom:8}}>{t.pageImage}</div>
      <input ref={fileRef} type="file" accept="image/*" onChange={onPhoto} style={{display:"none"}}/>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={onPhoto} style={{display:"none"}}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
        <button onClick={()=>cameraRef.current?.click()} className="lt-press-soft" style={{padding:"10px 6px",borderRadius:11,border:`1px solid ${G.border}`,background:G.white,color:G.ink2,fontFamily:G.font,fontWeight:600,fontSize:12,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          <span>{t.camera}</span>
        </button>
        <button onClick={()=>fileRef.current?.click()} className="lt-press-soft" style={{padding:"10px 6px",borderRadius:11,border:`1px solid ${G.border}`,background:G.white,color:G.ink2,fontFamily:G.font,fontWeight:600,fontSize:12,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="9" cy="10" r="1.5"/>
            <path d="M21 15l-4-4-9 9"/>
          </svg>
          <span>{t.gallery}</span>
        </button>
        <button onClick={()=>{setShowE(true);}} className="lt-press-soft" style={{padding:"10px 6px",borderRadius:11,border:`1px solid ${!page.photo?color:G.border}`,background:!page.photo?`${color}10`:G.white,color:!page.photo?color:G.ink2,fontFamily:G.font,fontWeight:600,fontSize:12,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
            <line x1="9" y1="9" x2="9.01" y2="9"/>
            <line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
          <span>{t.emoji}</span>
        </button>
      </div>
      {page.photo&&(
        <button onClick={()=>onUpdate("photo",null)} className="lt-press-soft" style={{marginTop:8,width:"100%",padding:"8px",borderRadius:10,border:"none",background:"#FEF2F2",color:"#EF4444",fontFamily:G.font,fontSize:12,fontWeight:600,cursor:"pointer"}}>{t.removePhoto}</button>
      )}

      {/* Timer section — optional countdown for this specific page */}
      {(()=>{
        const pt=page.timer||{on:false,type:"sector",min:15,color:"#8AAFD2"};
        const setT=(field,val)=>onUpdate("timer",{...pt,[field]:val});
        return(
          <div style={{marginTop:14,padding:14,borderRadius:14,background:pt.on?`${pt.color}0C`:G.white,border:`1px solid ${pt.on?pt.color+"30":G.border}`,transition:"all .3s ease"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
              <div style={{display:"flex",alignItems:"center",gap:10,flex:1,minWidth:0}}>
                <TimerIcon type={pt.type} size={18} color={pt.on?pt.color:G.ink3}/>
                <div style={{minWidth:0}}>
                  <div style={{fontFamily:G.font,fontWeight:600,fontSize:12,color:pt.on?G.ink:G.ink2,letterSpacing:.1}}>{t.pageTimer}</div>
                  <div style={{fontFamily:G.font,fontWeight:400,fontSize:10.5,color:G.ink3,marginTop:1}}>
                    {pt.on?`${pt.min} min · ${tlbl(pt.type,t)}`:t.off}
                  </div>
                </div>
              </div>
              <Toggle on={pt.on} onChange={()=>setT("on",!pt.on)} color={pt.color}/>
            </div>
            {pt.on&&(
              <div style={{display:"flex",flexDirection:"column",gap:12,marginTop:14,animation:"pSect 0.32s cubic-bezier(0.32, 0.72, 0, 1) both"}}>
                <style>{`@keyframes pSect{0%{opacity:0;transform:translateY(5px)}100%{opacity:1;transform:translateY(0)}}`}</style>
                {/* Type */}
                <div>
                  <div style={{fontFamily:G.font,fontWeight:500,fontSize:9.5,color:"#9892AA",letterSpacing:1.2,textTransform:"uppercase",marginBottom:7}}>{t.timerType}</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:5}}>
                    {TTYPES.map(k=>{
                      const sel=pt.type===k;
                      return(
                        <button key={k} onClick={()=>setT("type",k)} className="lt-press-soft" style={{
                          padding:"8px 3px 7px",borderRadius:10,border:"1px solid",
                          fontFamily:G.font,fontWeight:600,fontSize:10,cursor:"pointer",
                          borderColor:sel?pt.color:"rgba(31,27,46,0.08)",
                          background:sel?pt.color:G.white,
                          color:sel?"#fff":G.ink2,
                          display:"flex",flexDirection:"column",alignItems:"center",gap:4,
                          transition:"all .2s ease",
                        }}>
                          <TimerIcon type={k} size={14} color={sel?"#fff":G.ink2}/>
                          <span>{tlbl(k,t)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Minutes */}
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:5}}>
                    <div style={{fontFamily:G.font,fontWeight:500,fontSize:9.5,color:"#9892AA",letterSpacing:1.2,textTransform:"uppercase"}}>{t.timerMin}</div>
                    <span style={{fontFamily:G.serif,fontWeight:600,fontSize:14,color:G.ink}}>{pt.min} {t.min}</span>
                  </div>
                  <input type="range" min={1} max={60} value={pt.min} onChange={e=>setT("min",+e.target.value)} style={{width:"100%",accentColor:pt.color}}/>
                  <div style={{display:"flex",gap:4,marginTop:6,flexWrap:"wrap"}}>
                    {[5,10,15,20,30,45].map(v=>{
                      const sel=pt.min===v;
                      return(
                        <button key={v} onClick={()=>setT("min",v)} className="lt-press-soft" style={{
                          padding:"5px 9px",borderRadius:9,
                          border:`1px solid ${sel?pt.color:"rgba(31,27,46,0.08)"}`,
                          background:sel?pt.color:G.white,
                          color:sel?"#fff":G.ink2,
                          fontFamily:G.font,fontWeight:600,fontSize:10.5,cursor:"pointer",
                          transition:"all .2s ease",
                        }}>{v}</button>
                      );
                    })}
                  </div>
                </div>
                {/* Color */}
                <div>
                  <div style={{fontFamily:G.font,fontWeight:500,fontSize:9.5,color:"#9892AA",letterSpacing:1.2,textTransform:"uppercase",marginBottom:7}}>{t.timerColor}</div>
                  <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                    {TMR_C.map(col=>{
                      const sel=pt.color===col;
                      return(
                        <div key={col} onClick={()=>setT("color",col)} className="lt-press-soft" style={{
                          width:26,height:26,borderRadius:"50%",
                          background:col,cursor:"pointer",position:"relative",
                          transform:sel?"scale(1.1)":"scale(1)",
                          boxShadow:sel?`0 0 0 2px ${G.white}, 0 0 0 4px ${col}, 0 4px 10px ${col}55`:`0 2px 5px ${col}33`,
                          transition:"transform .25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow .25s ease",
                        }}>
                          {sel&&(
                            <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{position:"absolute",inset:0,width:"100%",height:"100%",padding:6}}>
                              <path d="M5 12l5 5L20 7"/>
                            </svg>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {showE&&(
        <Overlay onClose={()=>setShowE(false)}>
          <Sheet scroll>
            <div style={{fontFamily:G.serif,fontWeight:600,fontSize:19,color:G.ink,marginBottom:14}}>{t.pickEmoji}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:14}}>
              {EMOJIS.slice(epage*pp,(epage+1)*pp).map(e=><button key={e} onClick={()=>{onUpdate("emoji",e);onUpdate("photo",null);setShowE(false);}} style={{fontSize:24,background:page.emoji===e?`${color}22`:"transparent",border:page.emoji===e?`1.5px solid ${color}`:"1.5px solid transparent",borderRadius:10,padding:"3px 6px",cursor:"pointer"}}>{e}</button>)}
            </div>
            <div style={{display:"flex",gap:5}}>
              {Array.from({length:Math.ceil(EMOJIS.length/pp)}).map((_,i)=><button key={i} onClick={()=>setEpage(i)} style={{padding:"3px 10px",borderRadius:8,fontFamily:G.font,fontWeight:600,fontSize:11,cursor:"pointer",border:`1px solid ${i===epage?color:G.border}`,background:i===epage?color:"transparent",color:i===epage?"#fff":G.ink2}}>{i+1}</button>)}
            </div>
          </Sheet>
        </Overlay>
      )}
    </div>
  );
}

/* ═══ Story editor ═══ */
function StoryEditor({story,onSave,onDel,onClose,t,lang}){
  const[type,setType]=useState(story?.type||"sequence");
  const[title,setTitle]=useState(story?.sv||"");
  const[emoji,setEmoji]=useState(story?.emoji||(story?.type==="firstthen"?"📋":"📖"));
  const[photo,setPhoto]=useState(story?.photo||null);
  const[color,setColor]=useState(story?.color||(story?.type==="firstthen"?"#D9886B":"#C9A875"));
  const[firstLabel,setFirstLabel]=useState(story?.firstLabel||"");
  const[thenLabel,setThenLabel]=useState(story?.thenLabel||"");
  const[pages,setPages]=useState(()=>{
    if(story?.pages) return story.pages.map(p=>({...p}));
    // Defaults based on type
    if(story?.type==="firstthen") return [
      {id:"first",emoji:"📚",photo:null,sv:"",en:""},
      {id:"then",emoji:"🎉",photo:null,sv:"",en:""},
    ];
    return [];
  });
  const[showE,setShowE]=useState(false);
  const[epage,setEpage]=useState(0);
  const pp=40;
  const S=SCREENS.stories;
  const isFT=type==="firstthen";
  // Photo upload for the story cover image
  const fileRef=useRef(null);
  const cameraRef=useRef(null);
  const onCoverPhoto=e=>{
    const f=e.target.files?.[0]; if(!f) return;
    const r=new FileReader();
    r.onload=()=>{
      const img=new Image();
      img.onload=()=>{
        const max=500, scale=Math.min(1,max/Math.max(img.width,img.height));
        const w=img.width*scale, h=img.height*scale;
        const cv=document.createElement("canvas");
        cv.width=w; cv.height=h;
        cv.getContext("2d").drawImage(img,0,0,w,h);
        setPhoto(cv.toDataURL("image/jpeg",0.82));
      };
      img.src=r.result;
    };
    r.readAsDataURL(f);
  };
  const addPage=()=>setPages(p=>[...p,{id:"p"+Date.now()+Math.random(),emoji:"⭐",photo:null,sv:"",en:""}]);
  const updPage=(id,field,val)=>setPages(p=>p.map(pg=>pg.id===id?{...pg,[field]:val}:pg));
  const rmPage=id=>setPages(p=>p.filter(pg=>pg.id!==id));
  const movePage=(id,dir)=>setPages(p=>{const i=p.findIndex(pg=>pg.id===id);if(i<0)return p;const ni=i+dir;if(ni<0||ni>=p.length)return p;const a=[...p];[a[i],a[ni]]=[a[ni],a[i]];return a;});
  // When switching to firstthen with no pages, seed with two
  const switchType=(newType)=>{
    setType(newType);
    if(newType==="firstthen"){
      if(pages.length<2){
        setPages([
          {id:"first",emoji:pages[0]?.emoji||"📚",photo:pages[0]?.photo||null,sv:pages[0]?.sv||"",en:pages[0]?.en||""},
          {id:"then",emoji:pages[1]?.emoji||"🎉",photo:pages[1]?.photo||null,sv:pages[1]?.sv||"",en:pages[1]?.en||""},
        ]);
      } else if(pages.length>2){
        setPages(pages.slice(0,2));
      }
      if(emoji==="📖") setEmoji("📋");
      if(color==="#C9A875") setColor("#D9886B");
    } else {
      if(emoji==="📋") setEmoji("📖");
      if(color==="#D9886B") setColor("#C9A875");
    }
  };
  const doSave=()=>{
    if(!title.trim()) return;
    if(isFT && pages.length!==2) return;
    if(!isFT && pages.length===0) return;
    onSave({id:story?.id||"s"+Date.now(),type,sv:title,en:title,emoji,photo,color,pages,firstLabel:firstLabel.trim(),thenLabel:thenLabel.trim()});
    onClose();
  };
  return(
    <Overlay onClose={onClose}>
      <Sheet scroll>
        <div style={{fontFamily:G.serif,fontWeight:500,fontSize:26,color:G.inkSoft,marginBottom:24,letterSpacing:-.5,lineHeight:1.1}}>{story?.id?t.editStory:t.newStory}</div>

        {/* Type selector */}
        <SLabel>{t.storyType}</SLabel>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
          <button onClick={()=>switchType("sequence")} style={{padding:"14px 10px",borderRadius:14,border:`1.5px solid ${type==="sequence"?S.h:G.border}`,background:type==="sequence"?S.hl:G.white,color:type==="sequence"?S.deep:G.ink2,fontFamily:G.font,fontWeight:600,cursor:"pointer",fontSize:13,textAlign:"center",lineHeight:1.3}}>
            <div style={{fontSize:22,marginBottom:4}}>📖</div>
            <div>{t.typeSeq}</div>
            <div style={{fontSize:10,opacity:.7,marginTop:3,fontWeight:500}}>{t.typeSeqDesc}</div>
          </button>
          <button onClick={()=>switchType("firstthen")} style={{padding:"14px 10px",borderRadius:14,border:`1.5px solid ${type==="firstthen"?S.h:G.border}`,background:type==="firstthen"?S.hl:G.white,color:type==="firstthen"?S.deep:G.ink2,fontFamily:G.font,fontWeight:600,cursor:"pointer",fontSize:13,textAlign:"center",lineHeight:1.3}}>
            <div style={{fontSize:22,marginBottom:4}}>📋</div>
            <div>{t.typeFT}</div>
            <div style={{fontSize:10,opacity:.7,marginTop:3,fontWeight:500}}>{t.typeFTDesc}</div>
          </button>
        </div>

        <SLabel>{t.cover}</SLabel>
        <input ref={fileRef} type="file" accept="image/*" onChange={onCoverPhoto} style={{display:"none"}}/>
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={onCoverPhoto} style={{display:"none"}}/>
        <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:18}}>
          <div onClick={()=>{if(!photo)setShowE(true);}} style={{
            width:72,height:72,borderRadius:18,
            background:photo?"transparent":G.white,
            border:`1px solid ${G.border}`,
            overflow:"hidden",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:36,flexShrink:0,cursor:"pointer",
          }}>
            {photo?<img src={photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:emoji}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,flex:1}}>
            <button onClick={()=>cameraRef.current?.click()} className="lt-press-soft" style={{padding:"9px 4px",borderRadius:11,border:`1px solid ${G.border}`,background:G.white,color:G.ink2,fontFamily:G.font,fontWeight:600,fontSize:11,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <span>{t.camera}</span>
            </button>
            <button onClick={()=>fileRef.current?.click()} className="lt-press-soft" style={{padding:"9px 4px",borderRadius:11,border:`1px solid ${G.border}`,background:G.white,color:G.ink2,fontFamily:G.font,fontWeight:600,fontSize:11,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="9" cy="10" r="1.5"/>
                <path d="M21 15l-4-4-9 9"/>
              </svg>
              <span>{t.gallery}</span>
            </button>
            <button onClick={()=>{setShowE(true);}} className="lt-press-soft" style={{padding:"9px 4px",borderRadius:11,border:`1px solid ${!photo?color:G.border}`,background:!photo?`${color}10`:G.white,color:!photo?color:G.ink2,fontFamily:G.font,fontWeight:600,fontSize:11,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/>
                <line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
              <span>{t.emoji}</span>
            </button>
          </div>
        </div>
        {photo&&(
          <button onClick={()=>setPhoto(null)} className="lt-press-soft" style={{marginTop:-8,marginBottom:14,padding:"7px 12px",borderRadius:10,border:"none",background:"#FEF2F2",color:"#EF4444",fontFamily:G.font,fontSize:11,fontWeight:600,cursor:"pointer",alignSelf:"flex-start"}}>{t.removePhoto}</button>
        )}
        <SLabel>{t.storyTitle}</SLabel>
        <input value={title} onChange={e=>setTitle(e.target.value)} className="lt-input" style={INP} placeholder={isFT?t.storyPlacehFT:t.storyPlacehSeq}/>
        <SLabel>{t.pickColor}</SLabel>
        <div style={{display:"flex",gap:9,marginBottom:22,flexWrap:"wrap"}}>
          {ACT_C.map(col=><div key={col} onClick={()=>setColor(col)} style={{width:32,height:32,borderRadius:"50%",background:col,cursor:"pointer",outline:color===col?`3px solid ${col}`:"none",outlineOffset:2}}/>)}
        </div>
        <SLabel>{isFT?t.ftSection:`${t.pages} · ${pages.length}`}</SLabel>
        {isFT?(
          <>
            <div style={{padding:"12px 14px",borderRadius:14,background:`${color}0C`,border:`1px solid ${color}28`,marginBottom:18}}>
              <div style={{fontFamily:G.font,fontWeight:600,fontSize:11,color:G.ink3,letterSpacing:0.8,textTransform:"uppercase",marginBottom:8}}>{t.ftLabels}</div>
              <div style={{display:"flex",gap:8}}>
                <input value={firstLabel} onChange={e=>setFirstLabel(e.target.value)} placeholder={t.first||"Först"} maxLength={20} className="lt-input" style={{...INP,flex:1,marginBottom:0,fontSize:14}}/>
                <input value={thenLabel} onChange={e=>setThenLabel(e.target.value)} placeholder={t.then||"Sedan"} maxLength={20} className="lt-input" style={{...INP,flex:1,marginBottom:0,fontSize:14}}/>
              </div>
            </div>
            <div style={{fontFamily:G.font,fontWeight:700,fontSize:11,color:color,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>{firstLabel.trim()||t.first||"Först"}</div>
            {pages[0]&&<PageEditor key={pages[0].id} page={pages[0]} idx={0} total={2} onUpdate={(f,v)=>updPage(pages[0].id,f,v)} onRemove={()=>{}} onMoveUp={()=>{}} onMoveDown={()=>{}} color={color} t={t}/>}
            <div style={{fontFamily:G.font,fontWeight:700,fontSize:11,color:color,letterSpacing:2,textTransform:"uppercase",marginBottom:8,marginTop:12}}>{thenLabel.trim()||t.then||"Sedan"}</div>
            {pages[1]&&<PageEditor key={pages[1].id} page={pages[1]} idx={1} total={2} onUpdate={(f,v)=>updPage(pages[1].id,f,v)} onRemove={()=>{}} onMoveUp={()=>{}} onMoveDown={()=>{}} color={color} t={t}/>}
          </>
        ):(
          <>
            {pages.map((pg,idx)=><PageEditor key={pg.id} page={pg} idx={idx} total={pages.length} onUpdate={(f,v)=>updPage(pg.id,f,v)} onRemove={()=>rmPage(pg.id)} onMoveUp={()=>movePage(pg.id,-1)} onMoveDown={()=>movePage(pg.id,1)} color={color} t={t}/>)}
            <button onClick={addPage} style={{width:"100%",padding:"13px 0",borderRadius:14,border:`1.5px dashed ${color}66`,background:G.white,color,fontFamily:G.font,fontWeight:700,fontSize:14,cursor:"pointer",marginBottom:20}}>{t.addPage}</button>
          </>
        )}

        {/* Save / Cancel / Delete row */}
        <div style={{display:"flex",gap:8,marginTop:isFT?20:0,marginBottom:20}}>
          {story?.id&&(
            <button onClick={()=>{onDel(story.id);onClose();}} aria-label={t.cancel} className="lt-press" style={{padding:"14px 16px",borderRadius:14,border:"none",background:"#FEF2F2",color:"#EF4444",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6 h18"/>
                <path d="M8 6 V4 a2 2 0 0 1 2-2 h4 a2 2 0 0 1 2 2 v2"/>
                <path d="M19 6 l-1 14 a2 2 0 0 1 -2 2 H8 a2 2 0 0 1 -2 -2 L5 6"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            </button>
          )}
          <button onClick={onClose} style={{flex:1,...GHOST}}>{t.cancel}</button>
          <button onClick={doSave} className="lt-press saveBtn" style={{flex:2,padding:"15px 0",borderRadius:14,border:"none",background:S.h,color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:15,cursor:"pointer",boxShadow:sh.c(S.h),display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <svg className="saveTick" width="15" height="15" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
              <path d="M2.5 7.2 L5.8 10.5 L11.5 3.5"/>
            </svg>
            {t.save}
          </button>
        </div>
        {/* Extra spacer at the very bottom so Save row clears any bottom nav overlap on iOS */}
        <div style={{height:80}}/>
        {showE&&(
          <Overlay onClose={()=>setShowE(false)}>
            <Sheet scroll>
              <div style={{fontFamily:G.serif,fontWeight:600,fontSize:19,color:G.ink,marginBottom:14}}>{t.pickEmoji}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:14}}>
                {EMOJIS.slice(epage*pp,(epage+1)*pp).map(e=><button key={e} onClick={()=>{setEmoji(e);setShowE(false);}} style={{fontSize:24,background:emoji===e?S.hl:"transparent",border:emoji===e?`1.5px solid ${S.h}`:"1.5px solid transparent",borderRadius:10,padding:"3px 6px",cursor:"pointer"}}>{e}</button>)}
              </div>
              <div style={{display:"flex",gap:5}}>
                {Array.from({length:Math.ceil(EMOJIS.length/pp)}).map((_,i)=><button key={i} onClick={()=>setEpage(i)} style={{padding:"3px 10px",borderRadius:8,fontFamily:G.font,fontWeight:600,fontSize:11,cursor:"pointer",border:`1px solid ${i===epage?S.h:G.border}`,background:i===epage?S.h:"transparent",color:i===epage?"#fff":G.ink2}}>{i+1}</button>)}
              </div>
            </Sheet>
          </Overlay>
        )}
      </Sheet>
    </Overlay>
  );
}

/* ═══ Story list screen ═══ */
function StoryScreen({lang,t,isEditor,stories,setStories,onOpenStory}){
  const[editor,setEditor]=useState(null);
  const S=SCREENS.stories;
  return(
    <div style={{flex:1,overflowY:"auto",background:S.hb}}>
      {editor&&<StoryEditor story={editor.id?editor:null} t={t} lang={lang} onSave={s=>setStories(ss=>editor.id?ss.map(x=>x.id===s.id?s:x):[...ss,s])} onDel={id=>setStories(ss=>ss.filter(x=>x.id!==id))} onClose={()=>setEditor(null)}/>}
      <div style={{padding:"32px 22px 120px"}}>
        {stories.length===0&&!isEditor?(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 30px 60px",gap:18}}>
            <style>{`@keyframes empStoryBreath{0%,100%{transform:scale(1);opacity:0.85}50%{transform:scale(1.025);opacity:1}}`}</style>
            <svg width="72" height="72" viewBox="0 0 64 64" style={{animation:"empStoryBreath 4.2s ease-in-out infinite"}}>
              <defs>
                <linearGradient id="empStoryBook" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={`${S.h}30`}/>
                  <stop offset="100%" stopColor={`${S.h}66`}/>
                </linearGradient>
              </defs>
              {/* Open book illustration */}
              <path d="M10 18 Q10 14 14 14 L30 16 Q32 16 32 18 L32 50 Q32 52 30 52 L14 50 Q10 50 10 46 Z" fill="url(#empStoryBook)" stroke={`${S.h}88`} strokeWidth="1.4"/>
              <path d="M54 18 Q54 14 50 14 L34 16 Q32 16 32 18 L32 50 Q32 52 34 52 L50 50 Q54 50 54 46 Z" fill="url(#empStoryBook)" stroke={`${S.h}88`} strokeWidth="1.4"/>
              <line x1="16" y1="24" x2="28" y2="25" stroke={`${S.h}aa`} strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="16" y1="30" x2="26" y2="31" stroke={`${S.h}88`} strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="36" y1="25" x2="48" y2="24" stroke={`${S.h}aa`} strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="36" y1="31" x2="46" y2="30" stroke={`${S.h}88`} strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="36" y1="37" x2="44" y2="36" stroke={`${S.h}66`} strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <div style={{fontFamily:G.serif,fontWeight:500,fontSize:22,color:G.inkSoft,letterSpacing:-.4,lineHeight:1.1,textAlign:"center",marginTop:2}}>{lang==="sv"?"Inga berättelser än":"No stories yet"}</div>
            <div style={{fontFamily:G.font,fontWeight:400,fontSize:13,color:"#9892AA",letterSpacing:.1,textAlign:"center",lineHeight:1.4,maxWidth:240}}>{t.noStories}</div>
          </div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
            <style>{`@keyframes storyCardIn{0%{opacity:0;transform:translateY(10px) scale(0.97)}100%{opacity:1;transform:translateY(0) scale(1)}}`}</style>
            {stories.map((s,i)=>{
              const timerCount=(s.pages||[]).filter(p=>p.timer?.on).length;
              return(
              <div key={s.id} style={{position:"relative",animation:`storyCardIn 0.5s cubic-bezier(0.32, 0.72, 0, 1) ${i*0.05}s both`}}>
                <div onClick={()=>isEditor?setEditor(s):onOpenStory(s)} className="lt-press-soft" style={{background:G.white,borderRadius:20,padding:"22px 14px 18px",cursor:"pointer",border:`1px solid ${s.color}25`,boxShadow:`0 6px 20px ${s.color}14`,transition:"transform .26s cubic-bezier(0.32, 0.72, 0, 1), box-shadow .2s ease"}}>
                  <div style={{width:84,height:84,margin:"0 auto 12px",borderRadius:20,background:s.photo?"transparent":`linear-gradient(140deg,${s.color}1F,${s.color}3A)`,border:`1px solid ${s.color}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:46,overflow:"hidden"}}>
                    {s.photo?<img src={s.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:s.emoji}
                  </div>
                  <div style={{fontFamily:G.serif,fontWeight:500,fontSize:15,color:G.ink,textAlign:"center",lineHeight:1.2,letterSpacing:-.3}}>{lsText(s,lang)}</div>
                  <div style={{fontFamily:G.font,fontWeight:500,fontSize:10.5,color:"#9892AA",textAlign:"center",marginTop:8,letterSpacing:.6,textTransform:"uppercase"}}>
                    {s.type==="firstthen"?(lang==="sv"?"Först-Sedan":"First-Then"):`${s.pages.length} ${t.pages.toLowerCase()}`}
                  </div>
                  {/* Timer badge — shows if any page has a timer */}
                  {timerCount>0&&(
                    <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,marginTop:8,padding:"4px 10px",borderRadius:10,background:`${s.color}14`,border:`1px solid ${s.color}28`}}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="13" r="8"/>
                        <path d="M12 13 L12 8" strokeLinejoin="round"/>
                      </svg>
                      <span style={{fontFamily:G.font,fontWeight:600,fontSize:10.5,color:s.color,letterSpacing:.2}}>{timerCount===1?(lang==="sv"?"1 timer":"1 timer"):`${timerCount} ${lang==="sv"?"timers":"timers"}`}</span>
                    </div>
                  )}
                </div>
                {isEditor&&(
                  <div style={{position:"absolute",top:8,right:8,width:24,height:24,borderRadius:8,background:G.white,boxShadow:sh.sm,color:s.color,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4 H4 a2 2 0 0 0 -2 2 v14 a2 2 0 0 0 2 2 h14 a2 2 0 0 0 2 -2 v-7"/>
                      <path d="M18.5 2.5 a2.121 2.121 0 0 1 3 3 L12 15 l-4 1 1 -4 z"/>
                    </svg>
                  </div>
                )}
              </div>
              );
            })}
            {isEditor&&(
              <div onClick={()=>setEditor({})} style={{borderRadius:20,padding:"22px 14px 18px",cursor:"pointer",border:`1.5px dashed ${G.border2}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,minHeight:172}}>
                <div style={{width:60,height:60,borderRadius:18,background:S.hll,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontSize:30,color:S.h}}>+</span>
                </div>
                <span style={{fontFamily:G.font,fontWeight:600,fontSize:12,color:G.ink3,textAlign:"center"}}>{t.newStory}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══ Breathing exercise (4-2-6) ═══ */
function BreathingExercise({onClose,t}){
  const BLUE="#9DC4D8", DEEP="#5A8AA3";
  const phases=[
    {name:t.breathIn,dur:4,from:0.4,to:1},
    {name:t.breathHold,dur:2,from:1,to:1},
    {name:t.breathOut,dur:6,from:1,to:0.4},
  ];
  const[phase,setPhase]=useState(0);
  const[round,setRound]=useState(0);
  const[t0,setT0]=useState(()=>Date.now());
  const[startedAt,setStartedAt]=useState(0); // continuous clock for blob motion, unaffected by phase resets
  const[now,setNow]=useState(()=>Date.now());
  const[started,setStarted]=useState(false);
  useEffect(()=>{
    if(!started)return;
    const id=setInterval(()=>setNow(Date.now()),50);
    return()=>clearInterval(id);
  },[started]);
  const cur=phases[phase];
  const elapsed=Math.max(0,(now-t0)/1000);
  const prog=Math.min(1,elapsed/cur.dur);
  // Ease in-out cubic for natural breath rhythm
  const eased = prog<0.5 ? 4*prog*prog*prog : 1-Math.pow(-2*prog+2,3)/2;
  const scale = cur.from + (cur.to - cur.from) * eased;
  const secLeft=Math.max(1,Math.ceil(cur.dur-elapsed));
  // Continuous blob time — never resets between phases
  const blobTime = started ? (now - startedAt) / 1000 : 0;
  useEffect(()=>{
    if(!started)return;
    if(elapsed>=cur.dur){
      const np=(phase+1)%3;
      setPhase(np);
      if(np===0)setRound(r=>r+1);
      setT0(Date.now());
    }
  },[elapsed,started]);
  if(round>=4){
    return(
      <div style={{position:"fixed",inset:0,zIndex:9000,background:"#FFFFFF",backgroundImage:`linear-gradient(165deg,${BLUE}14,#FFFFFF)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:30,animation:"ftIn .4s ease"}}>
        <style>{`
          @keyframes bdRingExpand{0%{transform:scale(0.6);opacity:0}40%{opacity:0.55}100%{transform:scale(2.6);opacity:0}}
          @keyframes bdBubbleSettle{0%{opacity:0;transform:scale(0.7)}40%{opacity:1;transform:scale(1.06)}70%{transform:scale(0.98)}100%{transform:scale(1)}}
          @keyframes bdBreath{0%,100%{transform:scale(1)}50%{transform:scale(1.025)}}
          @keyframes bdCheckDraw{from{stroke-dashoffset:80}to{stroke-dashoffset:0}}
          @keyframes bdDotFloat{0%{opacity:0;transform:translateY(20px) scale(0.5)}30%{opacity:0.7}100%{opacity:0;transform:translateY(-60px) scale(1)}}
          @keyframes bdHaloPulse{0%,100%{opacity:0.18;transform:scale(0.94)}50%{opacity:0.36;transform:scale(1.04)}}
        `}</style>

        {/* Stage: bubble + radiating rings + ambient particles */}
        <div style={{position:"relative",width:200,height:200,display:"flex",alignItems:"center",justifyContent:"center"}}>
          {/* Soft outer halo — slow pulse */}
          <div style={{position:"absolute",width:200,height:200,borderRadius:"50%",background:`radial-gradient(circle, ${BLUE}33 0%, ${BLUE}00 70%)`,animation:"bdHaloPulse 4.8s ease-in-out infinite"}}/>

          {/* Two outward ripple rings — staggered, fade as they expand */}
          <div style={{position:"absolute",width:140,height:140,borderRadius:"50%",border:`1.5px solid ${BLUE}`,animation:"bdRingExpand 3.4s cubic-bezier(0.32, 0.72, 0, 1) 0.4s infinite"}}/>
          <div style={{position:"absolute",width:140,height:140,borderRadius:"50%",border:`1.5px solid ${BLUE}`,animation:"bdRingExpand 3.4s cubic-bezier(0.32, 0.72, 0, 1) 1.9s infinite"}}/>

          {/* Floating bubble particles — drift upward */}
          {[
            {x:30,y:140,delay:0.8,size:6},
            {x:155,y:130,delay:1.4,size:5},
            {x:60,y:160,delay:2.1,size:4},
            {x:140,y:155,delay:2.8,size:5},
            {x:90,y:170,delay:3.5,size:4},
          ].map((p,i)=>(
            <div key={i} style={{position:"absolute",left:p.x,top:p.y,width:p.size,height:p.size,borderRadius:"50%",background:BLUE,animation:`bdDotFloat 3.6s ease-out ${p.delay}s infinite`}}/>
          ))}

          {/* Central bubble — settle in, then gentle breath forever */}
          <div style={{width:130,height:130,borderRadius:"50%",animation:"bdBubbleSettle 1.2s cubic-bezier(0.32, 0.72, 0, 1) both",position:"relative"}}>
            <div style={{
              width:"100%",height:"100%",borderRadius:"50%",
              background:`radial-gradient(circle at 35% 28%, #FFFFFF 0%, ${BLUE}AA 32%, ${BLUE}88 62%, ${DEEP}55 100%)`,
              boxShadow:`0 28px 64px ${BLUE}55, inset 0 -16px 32px ${DEEP}33, inset 0 14px 28px rgba(255,255,255,0.55)`,
              position:"relative",overflow:"hidden",
              animation:"bdBreath 5.4s ease-in-out 1.2s infinite",
            }}>
              {/* Specular highlights */}
              <div style={{position:"absolute",top:22,left:28,width:44,height:28,borderRadius:"50%",background:"radial-gradient(ellipse, rgba(255,255,255,0.75) 0%, transparent 70%)",filter:"blur(2px)"}}/>
              <div style={{position:"absolute",top:26,left:32,width:20,height:13,borderRadius:"50%",background:"rgba(255,255,255,0.92)",filter:"blur(1px)"}}/>

              {/* Quiet check — drawn slow once bubble has settled */}
              <svg width="130" height="130" style={{position:"absolute",top:0,left:0,pointerEvents:"none"}} viewBox="0 0 130 130">
                <path d="M44,68 L58,82 L88,50" stroke="rgba(255,255,255,0.92)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray="80" style={{strokeDashoffset:80,animation:"bdCheckDraw 1s 1.6s cubic-bezier(0.32, 0.72, 0, 1) forwards",filter:`drop-shadow(0 1px 2px ${DEEP}44)`}}/>
              </svg>
            </div>
          </div>
        </div>

        {/* Close button — soft entry, isolated below the stage with generous breathing room */}
        <button onClick={onClose} className="lt-press" style={{marginTop:64,padding:"14px 36px",borderRadius:20,border:"none",background:`linear-gradient(135deg,${BLUE},${DEEP})`,color:"#fff",fontFamily:G.font,fontWeight:600,fontSize:15,letterSpacing:.3,cursor:"pointer",boxShadow:sh.c(BLUE),opacity:0,animation:"adSection 0.8s 2.6s cubic-bezier(0.32, 0.72, 0, 1) forwards"}}>{t.close}</button>
      </div>
    );
  }
  return(
    <div style={{position:"fixed",inset:0,zIndex:9000,background:"#FFFFFF",backgroundImage:`linear-gradient(165deg,${BLUE}14 0%,#FFFFFF 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,animation:"ftIn .25s ease"}}>
      <button onClick={onClose} style={{position:"absolute",top:24,right:24,width:44,height:44,borderRadius:22,border:`1px solid ${G.border}`,background:G.white,color:G.ink2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:sh.sm,zIndex:5}}><IconX size={16}/></button>
      {!started?(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:24,padding:30,textAlign:"center"}}>
          <style>{`@keyframes bePreviewBreath{0%,100%{transform:scale(0.92)}50%{transform:scale(1.04)}}`}</style>
          {/* Preview bubble — gently breathes to invite */}
          <div style={{width:160,height:160,borderRadius:"50%",background:`radial-gradient(circle at 35% 30%, ${BLUE}AA 0%, ${BLUE}66 50%, ${DEEP}44 100%)`,boxShadow:`0 18px 50px ${BLUE}55, inset 0 -12px 28px ${DEEP}33, inset 0 10px 22px rgba(255,255,255,0.5)`,position:"relative",overflow:"hidden",animation:"bePreviewBreath 4.5s ease-in-out infinite"}}>
            <div style={{position:"absolute",width:60,height:36,top:24,left:32,borderRadius:"50%",background:"radial-gradient(ellipse, rgba(255,255,255,0.7), transparent 70%)",filter:"blur(2px)"}}/>
            <div style={{position:"absolute",width:24,height:14,top:30,left:40,borderRadius:"50%",background:"rgba(255,255,255,0.9)",filter:"blur(1px)"}}/>
          </div>
          <div style={{fontFamily:G.serif,fontWeight:600,fontSize:26,color:G.inkSoft,letterSpacing:-.3}}>{t.breathing}</div>
          <div style={{fontFamily:G.font,fontSize:15,color:G.ink2,maxWidth:280,lineHeight:1.5}}>Följ bubblan. Andas in när den växer, håll, andas ut när den krymper.</div>
          <button onClick={()=>{const t=Date.now();setT0(t);setStartedAt(t);setStarted(true);}} style={{padding:"16px 42px",borderRadius:18,border:"none",background:`linear-gradient(135deg,${BLUE},${DEEP})`,color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:16,cursor:"pointer",boxShadow:sh.c(BLUE),marginTop:8}}>▶ {t.groundStart}</button>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:28}}>
          {/* Round counter */}
          <div style={{display:"flex",gap:8}}>
            {[0,1,2,3].map(i=><div key={i} style={{width:i===round?28:10,height:10,borderRadius:5,background:i<=round?BLUE:`${BLUE}33`,transition:"all .3s"}}/>)}
          </div>
          {/* Glass orb with lava-like blobs — clean, no text inside */}
          <div style={{width:300,height:300,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",transform:`scale(${scale})`,transition:"transform 0.1s linear"}}>
            <svg width={280} height={280} viewBox="0 0 280 280" style={{position:"absolute",overflow:"visible"}}>
              <defs>
                <radialGradient id="bubbleFill" cx="38%" cy="32%">
                  <stop offset="0%" stopColor={`${BLUE}AA`}/>
                  <stop offset="55%" stopColor={`${BLUE}66`}/>
                  <stop offset="100%" stopColor={`${DEEP}44`}/>
                </radialGradient>
                <radialGradient id="bubbleEdge" cx="50%" cy="50%">
                  <stop offset="85%" stopColor="rgba(255,255,255,0)"/>
                  <stop offset="100%" stopColor="rgba(255,255,255,0.55)"/>
                </radialGradient>
                <clipPath id="orbClip"><circle cx={140} cy={140} r={130}/></clipPath>
                <filter id="goo">
                  <feGaussianBlur stdDeviation="6"/>
                  <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"/>
                </filter>
              </defs>
              {/* Glass body */}
              <circle cx={140} cy={140} r={130} fill="url(#bubbleFill)"/>
              {/* Floating blobs inside — gooey merge effect */}
              <g clipPath="url(#orbClip)" filter="url(#goo)">
                {[
                  {ox:0,oy:0,r:40,sx:0.8,sy:1.1,sp:0.7},
                  {ox:55,oy:-30,r:30,sx:1.3,sy:0.9,sp:0.5},
                  {ox:-50,oy:40,r:34,sx:0.6,sy:1.4,sp:0.9},
                  {ox:30,oy:55,r:26,sx:1.1,sy:0.7,sp:1.2},
                  {ox:-40,oy:-50,r:28,sx:0.9,sy:1.0,sp:0.8},
                ].map((b,i)=>{
                  const a=blobTime*b.sp+i*1.7;
                  const cx=140+b.ox+Math.sin(a)*32*b.sx;
                  const cy=140+b.oy+Math.cos(a*0.9)*32*b.sy;
                  return <circle key={i} cx={cx} cy={cy} r={b.r} fill={DEEP} opacity={0.7}/>;
                })}
              </g>
              {/* Outer rim highlight */}
              <circle cx={140} cy={140} r={130} fill="url(#bubbleEdge)"/>
              {/* Specular highlight */}
              <ellipse cx={100} cy={88} rx={32} ry={20} fill="rgba(255,255,255,0.65)" style={{filter:"blur(2px)"}}/>
              <ellipse cx={92} cy={80} rx={14} ry={9} fill="rgba(255,255,255,0.9)" style={{filter:"blur(1px)"}}/>
              {/* Outer border */}
              <circle cx={140} cy={140} r={130} fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth={1.5}/>
            </svg>
          </div>
          {/* Text BELOW bubble — calm, clear, no text-shadow */}
          <div style={{textAlign:"center",marginTop:-4}}>
            <div style={{fontFamily:G.serif,fontWeight:500,fontSize:28,color:DEEP,letterSpacing:-.3,lineHeight:1}}>{cur.name}</div>
            <div style={{fontFamily:G.serif,fontWeight:500,fontSize:64,color:G.ink,marginTop:10,fontVariantNumeric:"tabular-nums",lineHeight:1,letterSpacing:-1}}>{secLeft}</div>
          </div>
          <div style={{fontFamily:G.font,fontWeight:500,fontSize:12,color:G.ink3,letterSpacing:1.2,textTransform:"uppercase"}}>Omgång {round+1} av 4</div>
        </div>
      )}
    </div>
  );
}

/* ═══ 5-4-3-2-1 grounding ═══ */
/* ═══ Grounding sense illustrations — hand-drawn, animated ═══ */
function GroundIcon({type,color,size=140}){
  const st=2.8, lt=2.2;
  return(
    <div style={{width:size,height:size,borderRadius:36,background:`linear-gradient(140deg,${color}1A,${color}33)`,border:`1px solid ${color}40`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 12px 40px ${color}25`,overflow:"hidden",position:"relative"}}>
      <style>{`
        @keyframes gEyeBlink{0%,82%,100%{transform:scaleY(1)}88%,90%{transform:scaleY(0.08)}}
        @keyframes gIrisLook{0%,25%,100%{transform:translateX(0)}45%{transform:translateX(-5px)}65%,75%{transform:translateX(5px)}}
        @keyframes gWaveIn{0%{opacity:0;transform:translateX(-6px) scale(0.85)}35%{opacity:0.95;transform:translateX(0) scale(1)}100%{opacity:0;transform:translateX(6px) scale(1.05)}}
        @keyframes gEarListen{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-3deg)}}
        @keyframes gHandTap{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-4px) rotate(2deg)}}
        @keyframes gTouchRipple{0%{opacity:0;transform:scale(0.3)}40%{opacity:0.9;transform:scale(1)}100%{opacity:0;transform:scale(1.8)}}
        @keyframes gSniff{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
        @keyframes gFragRise{0%{opacity:0;transform:translateY(10px) scale(0.85)}25%{opacity:0.9;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-22px) scale(1.1)}}
        @keyframes gMouthYum{0%,100%{transform:scale(1) rotate(0deg)}50%{transform:scale(1.06) rotate(-1deg)}}
      `}</style>
      <svg width={size*0.72} height={size*0.72} viewBox="0 0 100 100" style={{overflow:"visible"}}>
        {type==="see"&&(<>
          {/* Eyelashes — delicate, slightly curved */}
          <g stroke={color} strokeWidth={lt-0.2} strokeLinecap="round" fill="none" opacity="0.8">
            <path d="M 22 34 Q 20 28 17 22"/>
            <path d="M 36 22 Q 35 16 33 9"/>
            <path d="M 50 18 L 50 4"/>
            <path d="M 64 22 Q 65 16 67 9"/>
            <path d="M 78 34 Q 80 28 83 22"/>
          </g>
          {/* Eye — blinks slowly, deliberately */}
          <g style={{transformOrigin:"50px 50px",animation:"gEyeBlink 4.5s ease-in-out infinite"}}>
            {/* Almond shape */}
            <path d="M 10 50 Q 50 18 90 50 Q 50 82 10 50 Z" fill="white" stroke={color} strokeWidth={st} strokeLinejoin="round"/>
            {/* Iris — looks around */}
            <g style={{transformOrigin:"50px 50px",animation:"gIrisLook 5s ease-in-out infinite"}}>
              {/* Iris circle */}
              <circle cx="50" cy="50" r="17" fill={color} opacity="0.85"/>
              {/* Pupil */}
              <circle cx="50" cy="50" r="7" fill="#1F1B2E"/>
              {/* Highlight */}
              <circle cx="45" cy="45" r="3" fill="white" opacity="0.95"/>
            </g>
          </g>
        </>)}

        {type==="hear"&&(<>
          {/* Sound waves coming TOWARD ear — incoming */}
          <g stroke={color} fill="none" strokeWidth={lt+0.3} strokeLinecap="round">
            {/* Smallest, closest to ear */}
            <path d="M 25 50 Q 19 50 19 44 Q 19 38 25 38"
              style={{transformOrigin:"22px 44px",animation:"gWaveIn 2.4s ease-in-out infinite"}}/>
            {/* Medium */}
            <path d="M 17 58 Q 8 58 8 47 Q 8 36 17 36"
              style={{transformOrigin:"12px 47px",animation:"gWaveIn 2.4s ease-in-out 0.5s infinite"}}/>
            {/* Largest */}
            <path d="M 11 68 Q -2 68 -2 50 Q -2 32 11 32"
              style={{transformOrigin:"4px 50px",animation:"gWaveIn 2.4s ease-in-out 1s infinite"}}/>
          </g>
          {/* Ear — subtly tilts toward sound (listening posture) */}
          <g style={{transformOrigin:"50px 90px",animation:"gEarListen 3.6s ease-in-out infinite"}}>
            <path d="M 52 16 Q 78 16 78 42 Q 78 56 70 64 Q 60 70 60 80 Q 60 90 50 90 Q 36 90 32 78 Q 28 66 38 58 Q 50 52 50 42 Q 50 26 46 22 Q 49 16 52 16 Z" fill="white" stroke={color} strokeWidth={st} strokeLinejoin="round"/>
            <path d="M 55 40 Q 65 40 65 52 Q 65 62 55 62" fill="none" stroke={color} strokeWidth={lt} strokeLinecap="round"/>
            <circle cx="50" cy="82" r="2" fill={color} opacity="0.5"/>
          </g>
        </>)}

        {type==="touch"&&(<>
          {/* Touch surface — small circle at fingertip with ripple */}
          <g>
            {/* Ripple */}
            <circle cx="55" cy="9" r="5" fill="none" stroke={color} strokeWidth={lt}
              style={{transformOrigin:"55px 9px",animation:"gTouchRipple 2.4s ease-out infinite"}}/>
            {/* Inner dot */}
            <circle cx="55" cy="9" r="2.5" fill={color} opacity="0.5"/>
          </g>
          {/* Hand — gentle tap motion */}
          <g style={{transformOrigin:"50px 88px",animation:"gHandTap 2.4s ease-in-out infinite"}}>
            <path d="M 22 60
                     L 22 38 Q 22 32 28 32 Q 34 32 34 38
                     L 34 22 Q 34 14 41 14 Q 48 14 48 22
                     L 48 16 Q 48 8 55 8 Q 62 8 62 16
                     L 62 22 Q 62 14 69 14 Q 76 14 76 22
                     L 76 38 Q 76 30 82 30 Q 88 30 88 36
                     L 88 60 Q 88 78 74 88 L 38 88 Q 22 80 22 60 Z"
              fill="white" stroke={color} strokeWidth={st} strokeLinejoin="round"/>
            <path d="M 38 60 Q 48 65 60 60" fill="none" stroke={color} strokeWidth={1.2} strokeLinecap="round" opacity="0.4"/>
          </g>
        </>)}

        {type==="smell"&&(<>
          {/* Three clear curly fragrance lines rising — recognizable as scent */}
          <g fill="none" stroke={color} strokeWidth={lt+0.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M 32 45 Q 28 39 32 33 Q 36 27 32 21 Q 28 15 32 9"
              style={{transformOrigin:"32px 27px",animation:"gFragRise 3.2s ease-out infinite"}}/>
            <path d="M 50 45 Q 46 39 50 33 Q 54 27 50 21 Q 46 15 50 9"
              style={{transformOrigin:"50px 27px",animation:"gFragRise 3.2s ease-out 1.06s infinite"}}/>
            <path d="M 68 45 Q 64 39 68 33 Q 72 27 68 21 Q 64 15 68 9"
              style={{transformOrigin:"68px 27px",animation:"gFragRise 3.2s ease-out 2.12s infinite"}}/>
          </g>
          {/* Friendly cartoon nose — large, clear, rounded */}
          <g style={{transformOrigin:"50px 78px",animation:"gSniff 3.2s ease-in-out infinite"}}>
            {/* Main nose shape — rounded teardrop */}
            <path d="M 50 50
                     Q 42 50 38 62
                     Q 34 76 36 84
                     Q 38 92 44 93
                     Q 50 94 56 93
                     Q 62 92 64 84
                     Q 66 76 62 62
                     Q 58 50 50 50 Z"
              fill="white" stroke={color} strokeWidth={st} strokeLinejoin="round" strokeLinecap="round"/>
            {/* Nostrils — clear ovals */}
            <ellipse cx="44" cy="83" rx="3.2" ry="4" fill={color} opacity="0.78"/>
            <ellipse cx="56" cy="83" rx="3.2" ry="4" fill={color} opacity="0.78"/>
            {/* Bridge highlight */}
            <path d="M 48 60 Q 50 70 52 60" fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round" opacity="0.35"/>
            {/* Tip highlight (cute cartoon detail) */}
            <ellipse cx="46" cy="73" rx="2.5" ry="3" fill="white" opacity="0.5"/>
          </g>
        </>)}

        {type==="taste"&&(
          <g style={{transformOrigin:"50px 55px",animation:"gMouthYum 3.2s ease-in-out infinite"}}>
            {/* Upper lip with clear cupid's bow */}
            <path d="M 14 48
                     Q 24 32 34 44
                     Q 42 32 50 44
                     Q 58 32 66 44
                     Q 76 32 86 48"
              fill="white" stroke={color} strokeWidth={st+0.2} strokeLinecap="round" strokeLinejoin="round"/>
            {/* Lower lip — full, filled */}
            <path d="M 14 48
                     Q 30 82 50 84
                     Q 70 82 86 48
                     Q 50 64 14 48 Z"
              fill={color} fillOpacity="0.42" stroke={color} strokeWidth={st+0.2} strokeLinecap="round" strokeLinejoin="round"/>
            {/* Center line between lips */}
            <path d="M 14 48 Q 50 58 86 48" fill="none" stroke={color} strokeWidth={lt} strokeLinecap="round" opacity="0.55"/>
            {/* Lip line highlights for depth */}
            <path d="M 22 50 Q 30 48 38 50" fill="none" stroke="white" strokeWidth={1.2} strokeLinecap="round" opacity="0.55"/>
            <path d="M 62 50 Q 70 48 78 50" fill="none" stroke="white" strokeWidth={1.2} strokeLinecap="round" opacity="0.55"/>
            {/* Lower lip highlight */}
            <ellipse cx="50" cy="65" rx="14" ry="3" fill="white" opacity="0.3"/>
          </g>
        )}
      </svg>
    </div>
  );
}

function GroundingExercise({onClose,t}){
  const S=SCREENS.calm;
  const steps=[
    {type:"see",label:t.see5,count:5,color:S.h},
    {type:"hear",label:t.hear4,count:4,color:"#A5C9B5"},
    {type:"touch",label:t.touch3,count:3,color:"#D4B468"},
    {type:"smell",label:t.smell2,count:2,color:"#D8A4C2"},
    {type:"taste",label:t.taste1,count:1,color:"#C295D8"},
  ];
  const[idx,setIdx]=useState(-1); // -1 = intro
  const[checked,setChecked]=useState(0);
  const cur=steps[idx];
  if(idx>=steps.length){
    return(
      <div style={{position:"fixed",inset:0,zIndex:9000,background:`#FFFFFF linear-gradient(165deg,${S.hb},#FFFFFF)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:30,gap:24,animation:"ftIn .4s ease"}}>
        <style>{`
          @keyframes calmRipple{0%{transform:scale(0.3);opacity:0.7}80%{opacity:0.05}100%{transform:scale(2.4);opacity:0}}
          @keyframes calmBreath{0%,100%{transform:scale(1);filter:brightness(1)}50%{transform:scale(1.06);filter:brightness(1.1)}}
          @keyframes calmRotate{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
          @keyframes calmRotateRev{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
          @keyframes calmPetalFade1{0%,100%{opacity:.65}50%{opacity:.35}}
          @keyframes calmPetalFade2{0%,100%{opacity:.35}50%{opacity:.7}}
          @keyframes calmTextFade{0%,30%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)}}
          @keyframes calmButtonFade{0%,50%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}
        `}</style>
        <div style={{width:140,height:140,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width={140} height={140} viewBox="0 0 100 100" style={{overflow:"visible"}}>
            <defs>
              <radialGradient id="calmHalo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={S.h} stopOpacity="0.4"/>
                <stop offset="60%" stopColor={S.h} stopOpacity="0.12"/>
                <stop offset="100%" stopColor={S.h} stopOpacity="0"/>
              </radialGradient>
              <radialGradient id="calmCore" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#FFFFFF"/>
                <stop offset="22%" stopColor="#FFFAF0" stopOpacity="0.95"/>
                <stop offset="58%" stopColor={S.h}/>
                <stop offset="100%" stopColor={S.deep}/>
              </radialGradient>
            </defs>
            {/* Outer soft halo */}
            <circle cx="50" cy="50" r="45" fill="url(#calmHalo)"/>
            {/* Three concentric ripples expanding outward */}
            <circle cx="50" cy="50" r="18" fill="none" stroke={S.h} strokeWidth="1.5" opacity="0.55"
              style={{transformOrigin:"50px 50px",animation:"calmRipple 4.5s ease-out infinite"}}/>
            <circle cx="50" cy="50" r="18" fill="none" stroke={S.h} strokeWidth="1.5" opacity="0.55"
              style={{transformOrigin:"50px 50px",animation:"calmRipple 4.5s ease-out 1.5s infinite"}}/>
            <circle cx="50" cy="50" r="18" fill="none" stroke={S.h} strokeWidth="1.5" opacity="0.55"
              style={{transformOrigin:"50px 50px",animation:"calmRipple 4.5s ease-out 3s infinite"}}/>
            {/* Outer petals — slowly rotating clockwise */}
            <g style={{transformOrigin:"50px 50px",animation:"calmRotate 28s linear infinite"}}>
              {Array.from({length:8}).map((_,i)=>{
                const ang=(i/8)*2*Math.PI;
                const isLong=i%2===0;
                const r1=20, r2=isLong?29:25;
                const x1=50+r1*Math.sin(ang), y1=50-r1*Math.cos(ang);
                const x2=50+r2*Math.sin(ang), y2=50-r2*Math.cos(ang);
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={S.h} strokeWidth={isLong?2:1.4} strokeLinecap="round"
                  style={{animation:`${i%2===0?"calmPetalFade1":"calmPetalFade2"} ${3+i*0.2}s ease-in-out infinite`}}/>;
              })}
            </g>
            {/* Inner ring of small dots — counter-rotating (creates depth) */}
            <g style={{transformOrigin:"50px 50px",animation:"calmRotateRev 22s linear infinite"}}>
              {Array.from({length:6}).map((_,i)=>{
                const ang=((i+0.5)/6)*2*Math.PI;
                const r=17.5;
                const x=50+r*Math.sin(ang), y=50-r*Math.cos(ang);
                return <circle key={i} cx={x} cy={y} r="1.4" fill={S.h} opacity="0.5"
                  style={{animation:`calmPetalFade1 ${4+i*0.3}s ease-in-out ${i*0.4}s infinite`}}/>;
              })}
            </g>
            {/* Inner breathing orb */}
            <g style={{transformOrigin:"50px 50px",animation:"calmBreath 3.6s ease-in-out infinite"}}>
              <circle cx="50" cy="50" r="13" fill="url(#calmCore)"/>
              <circle cx="46" cy="46" r="3.2" fill="#FFFFFF" opacity="0.85"/>
            </g>
          </svg>
        </div>
        <div style={{fontFamily:G.serif,fontWeight:600,fontSize:26,color:S.deep,textAlign:"center",letterSpacing:-.3,maxWidth:300,lineHeight:1.3,animation:"calmTextFade 1.4s ease-out both"}}>{t.iAmHere}</div>
        <button onClick={onClose} style={{padding:"15px 40px",borderRadius:18,border:"none",background:`linear-gradient(135deg,${S.h},${S.h}DC)`,color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:16,cursor:"pointer",boxShadow:sh.c(S.h),marginTop:10,animation:"calmButtonFade 1.8s ease-out both"}}>{t.close}</button>
      </div>
    );
  }
  if(idx<0){
    return(
      <div style={{position:"fixed",inset:0,zIndex:9000,background:"#FFFFFF",backgroundImage:`linear-gradient(165deg,${S.hb} 0%,#FFFFFF 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:30,gap:24,animation:"ftIn .25s ease"}}>
        <style>{`
          @keyframes gIntroIn{from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}
          @keyframes gIntroRipple{0%{transform:scale(0.4);opacity:0.7}100%{transform:scale(2.2);opacity:0}}
          @keyframes gIntroBreathe{0%,100%{transform:scale(1);filter:brightness(1)}50%{transform:scale(1.07);filter:brightness(1.1)}}
          @keyframes gIntroTextIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        `}</style>
        <button onClick={onClose} style={{position:"absolute",top:24,right:24,width:44,height:44,borderRadius:22,border:`1px solid ${G.border}`,background:G.white,color:G.ink2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:sh.sm}}><IconX size={16}/></button>
        {/* Breathing mandala — slimmer than completion screen, sets the calm tone */}
        <div style={{width:100,height:100,display:"flex",alignItems:"center",justifyContent:"center",animation:"gIntroIn 1s cubic-bezier(0.22,1,0.36,1) both"}}>
          <svg width={100} height={100} viewBox="0 0 100 100" style={{overflow:"visible"}}>
            <defs>
              <radialGradient id="gIntroHalo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={S.h} stopOpacity="0.35"/>
                <stop offset="60%" stopColor={S.h} stopOpacity="0.1"/>
                <stop offset="100%" stopColor={S.h} stopOpacity="0"/>
              </radialGradient>
              <radialGradient id="gIntroCore" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#FFFFFF"/>
                <stop offset="22%" stopColor="#FFFAF0"/>
                <stop offset="58%" stopColor={S.h}/>
                <stop offset="100%" stopColor={S.deep}/>
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill="url(#gIntroHalo)"/>
            <circle cx="50" cy="50" r="20" fill="none" stroke={S.h} strokeWidth="1.4" opacity="0.55"
              style={{transformOrigin:"50px 50px",animation:"gIntroRipple 4s ease-out infinite"}}/>
            <circle cx="50" cy="50" r="20" fill="none" stroke={S.h} strokeWidth="1.4" opacity="0.55"
              style={{transformOrigin:"50px 50px",animation:"gIntroRipple 4s ease-out 2s infinite"}}/>
            <g style={{transformOrigin:"50px 50px",animation:"gIntroBreathe 3.6s ease-in-out infinite"}}>
              <circle cx="50" cy="50" r="14" fill="url(#gIntroCore)"/>
              <circle cx="46" cy="46" r="3.4" fill="#FFFFFF" opacity="0.85"/>
            </g>
          </svg>
        </div>
        <div style={{fontFamily:G.serif,fontWeight:600,fontSize:24,color:G.ink,textAlign:"center",letterSpacing:-.3,maxWidth:320,lineHeight:1.25,animation:"gIntroTextIn 0.9s 0.4s cubic-bezier(0.22,1,0.36,1) both"}}>{t.groundIntro}</div>
        <div style={{fontFamily:G.font,fontSize:14,color:G.ink2,textAlign:"center",maxWidth:280,lineHeight:1.55,animation:"gIntroTextIn 0.9s 0.6s cubic-bezier(0.22,1,0.36,1) both"}}>Vi går igenom fem sinnen, ett i taget. Du behöver inte säga något högt.</div>
        <button onClick={()=>{setIdx(0);setChecked(0);}} style={{padding:"16px 42px",borderRadius:18,border:"none",background:`linear-gradient(135deg,${S.h},${S.h}DC)`,color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:16,cursor:"pointer",boxShadow:sh.c(S.h),marginTop:8,animation:"gIntroTextIn 0.9s 0.85s cubic-bezier(0.22,1,0.36,1) both"}}>▶ {t.groundStart}</button>
      </div>
    );
  }
  const allChecked=checked>=cur.count;
  return(
    <div style={{position:"fixed",inset:0,zIndex:9000,background:"#FFFFFF",backgroundImage:`linear-gradient(165deg,${cur.color}10 0%,#FFFFFF 70%)`,display:"flex",flexDirection:"column",padding:24,animation:"ftIn .3s ease"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",gap:6}}>
          {steps.map((s,i)=><div key={i} style={{width:i===idx?28:10,height:8,borderRadius:4,background:i<=idx?s.color:`${s.color}44`,transition:"all .3s"}}/>)}
        </div>
        <button onClick={onClose} style={{width:40,height:40,borderRadius:20,border:`1px solid ${G.border}`,background:G.white,color:G.ink2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:sh.sm}}><IconX size={14}/></button>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:36,padding:"0 20px"}}>
        <GroundIcon type={cur.type} color={cur.color} size={140}/>
        <div style={{fontFamily:G.serif,fontWeight:600,fontSize:26,color:G.inkSoft,textAlign:"center",lineHeight:1.25,letterSpacing:-.3}}>{cur.label}</div>
        {/* Counter dots — tappa för att kryssa av */}
        <div style={{display:"flex",gap:14,flexWrap:"wrap",justifyContent:"center",maxWidth:300}}>
          {Array.from({length:cur.count}).map((_,i)=>{
            const on=i<checked;
            return(
              <div key={i} onClick={()=>setChecked(c=>i<c?i:i+1)} style={{width:54,height:54,borderRadius:18,background:on?cur.color:G.white,border:`2px solid ${on?cur.color:`${cur.color}44`}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:G.serif,fontWeight:600,fontSize:22,color:on?"#fff":cur.color,transition:"all .25s",boxShadow:on?`0 6px 16px ${cur.color}55`:sh.xs,transform:on?"scale(1.04)":"scale(1)"}}>
                {on?"✓":i+1}
              </div>
            );
          })}
        </div>
        {allChecked&&<button onClick={()=>{setIdx(i=>i+1);setChecked(0);}} style={{padding:"15px 42px",borderRadius:18,border:"none",background:`linear-gradient(135deg,${cur.color},${cur.color}DC)`,color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:16,cursor:"pointer",boxShadow:sh.c(cur.color),animation:"ftIn .25s ease"}}>{t.next} →</button>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SKYLIGHT — passive visual meditation. Watch clouds
   drift across an evolving sky. No breathing prompts,
   no counting. Just rest the gaze. Calms nervous
   system through soft motion + slow color shift.
═══════════════════════════════════════════════════ */
function SkylightExercise({onClose,t,lang}){
  // Phase progression: dawn → day → dusk → starry → done
  // Total: ~90 seconds. Each phase ~22s with crossfade between
  const[elapsed,setElapsed]=useState(0);
  const[done,setDone]=useState(false);
  const[shootingStars,setShootingStars]=useState([]);
  const[tappedStars,setTappedStars]=useState({});
  const[bouncedClouds,setBouncedClouds]=useState({});
  // Cloud drift offsets — when tapped, cloud nudges along a new vertical path
  const[cloudDrifts,setCloudDrifts]=useState({});
  const DURATION=90; // seconds
  const startRef=useRef(Date.now());
  const shootingIdRef=useRef(0);
  useEffect(()=>{
    const id=setInterval(()=>{
      const e=(Date.now()-startRef.current)/1000;
      if(e>=DURATION){setDone(true);clearInterval(id);return;}
      setElapsed(e);
    },200);
    return()=>clearInterval(id);
  },[]);
  // Clean up shooting stars after their animation completes
  useEffect(()=>{
    if(shootingStars.length===0) return;
    const id=setTimeout(()=>{
      setShootingStars(prev=>prev.filter(s=>Date.now()-s.t<2400));
    },2400);
    return()=>clearTimeout(id);
  },[shootingStars]);
  // Trigger a shooting star from a tapped star position
  const handleStarTap=(starIdx,sx,sy)=>{
    if(tappedStars[starIdx]) return; // prevent rapid double-tap
    setTappedStars(prev=>({...prev,[starIdx]:Date.now()}));
    setTimeout(()=>setTappedStars(prev=>{const next={...prev};delete next[starIdx];return next;}),1800);
    if(typeof navigator!=="undefined"&&navigator.vibrate) navigator.vibrate(8);
    // Add a shooting star from this position, drifting diagonally
    const id=++shootingIdRef.current;
    // Pick a diagonal direction: down-right (most common), down-left, or steep
    const dirs=[
      {dx:42,dy:38,len:140},   // gentle down-right
      {dx:-38,dy:42,len:135},  // gentle down-left
      {dx:35,dy:55,len:155},   // steeper down-right
      {dx:-30,dy:50,len:140},  // steeper down-left
    ];
    const dir=dirs[Math.floor(Math.random()*dirs.length)];
    setShootingStars(prev=>[...prev,{id,sx,sy,...dir,t:Date.now()}]);
  };
  const handleCloudTap=(idx)=>{
    if(bouncedClouds[idx]) return;
    setBouncedClouds(prev=>({...prev,[idx]:Date.now()}));
    setTimeout(()=>setBouncedClouds(prev=>{const next={...prev};delete next[idx];return next;}),1400);
    // Drift offset — small random vertical nudge that accumulates with each tap
    // Cloud gracefully glides to a new path while continuing to drift horizontally
    const dyNudge = (Math.random()-0.5) * 18; // -9 to +9 px
    setCloudDrifts(prev=>{
      const cur=prev[idx]||0;
      // Clamp total drift so cloud doesn't wander off screen
      const next=Math.max(-30,Math.min(30,cur+dyNudge));
      return{...prev,[idx]:next};
    });
    if(typeof navigator!=="undefined"&&navigator.vibrate) navigator.vibrate(6);
  };

  // Color phases — soft pastel sky transitions
  // dawn = warm pink/peach, day = bright blue, dusk = lavender/coral, starry = deep indigo
  const phases=[
    {top:"#F5D5C8",mid:"#E8C5D5",bot:"#D5BCD8"},   // dawn
    {top:"#C5DCE5",mid:"#9DC4D8",bot:"#82AEC8"},   // day
    {top:"#E8C5D5",mid:"#C8A5C5",bot:"#9D85B5"},   // dusk
    {top:"#3D3854",mid:"#2A2640",bot:"#1F1B2E"},   // starry night
  ];
  const phaseIdx=Math.min(3,Math.floor(elapsed/(DURATION/4)));
  const phaseProgress=(elapsed%(DURATION/4))/(DURATION/4);
  const nextIdx=Math.min(3,phaseIdx+1);
  // Interpolate between current and next phase
  const lerp=(a,b,t)=>{
    const hex2rgb=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
    const rgb2hex=([r,g,b])=>`#${[r,g,b].map(x=>Math.round(x).toString(16).padStart(2,"0")).join("")}`;
    const ca=hex2rgb(a),cb=hex2rgb(b);
    return rgb2hex(ca.map((x,i)=>x+(cb[i]-x)*t));
  };
  const skyTop=lerp(phases[phaseIdx].top,phases[nextIdx].top,phaseProgress);
  const skyMid=lerp(phases[phaseIdx].mid,phases[nextIdx].mid,phaseProgress);
  const skyBot=lerp(phases[phaseIdx].bot,phases[nextIdx].bot,phaseProgress);
  const isDark=phaseIdx>=3||(phaseIdx===2&&phaseProgress>0.7);

  // Generate cloud positions — fixed positions but drift across via animation
  const clouds=[
    {y:18,size:1.0,speed:42,delay:0,opacity:0.85},
    {y:32,size:0.75,speed:55,delay:-12,opacity:0.7},
    {y:48,size:1.15,speed:68,delay:-28,opacity:0.9},
    {y:62,size:0.85,speed:48,delay:-8,opacity:0.75},
    {y:78,size:1.0,speed:60,delay:-22,opacity:0.8},
  ];

  // Stars — only visible in starry phase
  const stars=[
    {x:12,y:14,size:1.4,delay:0},
    {x:28,y:22,size:0.9,delay:1.2},
    {x:48,y:10,size:1.6,delay:0.4},
    {x:72,y:18,size:1.1,delay:2.1},
    {x:88,y:28,size:1.3,delay:0.8},
    {x:22,y:38,size:0.8,delay:1.6},
    {x:62,y:32,size:1.0,delay:2.8},
    {x:84,y:46,size:0.7,delay:0.6},
    {x:18,y:52,size:1.2,delay:2.3},
    {x:42,y:48,size:0.9,delay:1.0},
  ];

  if(done){
    const restart=()=>{
      setDone(false);
      setElapsed(0);
      setShootingStars([]);
      setTappedStars({});
      setBouncedClouds({});
      setCloudDrifts({});
      startRef.current=Date.now();
    };
    return(
      <div style={{position:"fixed",inset:0,zIndex:9000,background:`linear-gradient(180deg, ${skyTop} 0%, ${skyMid} 55%, ${skyBot} 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:30,animation:"ftIn .4s ease"}}>
        <style>{`
          @keyframes skyDoneCircle{0%{opacity:0;transform:scale(0.85)}100%{opacity:1;transform:scale(1)}}
          @keyframes skyDoneBreath{0%,100%{transform:scale(1)}50%{transform:scale(1.025)}}
          @keyframes skyDoneTwinkle{0%,100%{opacity:0.3}50%{opacity:0.95}}
          @keyframes skyDoneTextIn{0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)}}
        `}</style>
        {/* Twinkling stars on the dark sky */}
        {stars.map((s,i)=>(
          <div key={i} style={{position:"absolute",left:`${s.x}%`,top:`${s.y}%`,width:s.size*2.5,height:s.size*2.5,borderRadius:"50%",background:"#FFFFFF",boxShadow:`0 0 ${s.size*3}px rgba(255,255,255,0.6)`,animation:`skyDoneTwinkle ${2.5+i*0.2}s ease-in-out ${s.delay}s infinite`}}/>
        ))}
        {/* Central moon-like orb */}
        <div style={{animation:"skyDoneCircle 1.2s cubic-bezier(0.32, 0.72, 0, 1) both",zIndex:2}}>
          <svg width={130} height={130} style={{display:"block",animation:"skyDoneBreath 5s ease-in-out 1s infinite"}}>
            <defs>
              <radialGradient id="skyMoonFace" cx="40%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#FFFFFF"/>
                <stop offset="55%" stopColor="#E8DCF0"/>
                <stop offset="100%" stopColor="#B89DC4"/>
              </radialGradient>
            </defs>
            <circle cx={65} cy={65} r={58} fill="rgba(255,255,255,0.06)"/>
            <circle cx={65} cy={65} r={50} fill="url(#skyMoonFace)"/>
            {/* Subtle craters / texture */}
            <circle cx={52} cy={56} r={4} fill="rgba(184,157,196,0.18)"/>
            <circle cx={75} cy={68} r={3} fill="rgba(184,157,196,0.15)"/>
            <circle cx={62} cy={78} r={2.5} fill="rgba(184,157,196,0.13)"/>
          </svg>
        </div>
        <div style={{fontFamily:G.serif,fontWeight:500,fontSize:22,color:"#FFFFFF",letterSpacing:-.2,marginTop:24,animation:"skyDoneTextIn 0.7s 0.7s cubic-bezier(0.32, 0.72, 0, 1) both",textShadow:"0 2px 12px rgba(0,0,0,0.4)",zIndex:2}}>Klart</div>
        {/* Tappable restart hint — tap to begin again */}
        <button
          onClick={restart}
          className="lt-press"
          style={{
            marginTop:8,
            padding:"10px 18px",
            borderRadius:14,
            border:"none",
            background:"transparent",
            fontFamily:G.font,fontWeight:500,fontSize:13,color:"rgba(255,255,255,0.78)",letterSpacing:.3,
            cursor:"pointer",
            animation:"skyDoneTextIn 0.7s 1.1s cubic-bezier(0.32, 0.72, 0, 1) both",
            textShadow:"0 1px 8px rgba(0,0,0,0.4)",
            zIndex:2,
            display:"flex",alignItems:"center",gap:7,
          }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.7}}>
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          <span>Stanna kvar en stund till</span>
        </button>
        <button onClick={onClose} className="lt-press" style={{marginTop:32,padding:"13px 32px",borderRadius:18,border:"1px solid rgba(255,255,255,0.3)",background:"rgba(255,255,255,0.15)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",color:"#FFFFFF",fontFamily:G.font,fontWeight:500,fontSize:14,letterSpacing:.3,cursor:"pointer",opacity:0,animation:"skyDoneTextIn 0.8s 1.8s cubic-bezier(0.32, 0.72, 0, 1) forwards",zIndex:2}}>{t.close}</button>
      </div>
    );
  }

  return(
    <div style={{position:"fixed",inset:0,zIndex:9000,background:`linear-gradient(180deg, ${skyTop} 0%, ${skyMid} 55%, ${skyBot} 100%)`,transition:"background 1.5s ease",overflow:"hidden",animation:"ftIn .4s ease",display:"flex",flexDirection:"column"}}>
      <style>{`
        @keyframes skyCloudDrift{from{transform:translateX(-25%)}to{transform:translateX(125%)}}
        @keyframes skyStarTwinkle{0%,100%{opacity:0.3;transform:scale(0.9)}50%{opacity:0.95;transform:scale(1.05)}}
        @keyframes skyHorizonGlow{0%,100%{opacity:0.4}50%{opacity:0.7}}
        @keyframes skyStarBurst{0%{transform:scale(1);opacity:1}40%{transform:scale(2.6);opacity:0.85}100%{transform:scale(4);opacity:0}}
        @keyframes skyStarRipple{0%{transform:scale(0.5);opacity:0.8}100%{transform:scale(3.5);opacity:0}}
        @keyframes skyShootFly{
          0%{opacity:0;transform:translate3d(0,0,0) scale(0.3)}
          12%{opacity:1;transform:translate3d(calc(var(--shoot-end-x)*0.12), calc(var(--shoot-end-y)*0.12), 0) scale(1)}
          82%{opacity:1;transform:translate3d(calc(var(--shoot-end-x)*0.85), calc(var(--shoot-end-y)*0.85), 0) scale(1)}
          100%{opacity:0;transform:translate3d(var(--shoot-end-x), var(--shoot-end-y), 0) scale(0.5)}
        }
        @keyframes skyShootGlowPulse{
          0%,100%{filter:brightness(1)}
          50%{filter:brightness(1.4)}
        }
        @keyframes skyShootFlash{
          0%{opacity:0;transform:scale(0.2)}
          30%{opacity:0.95;transform:scale(1.2)}
          100%{opacity:0;transform:scale(2.4)}
        }
        @keyframes skySparkle{
          0%{opacity:0;transform:scale(0)}
          40%{opacity:1;transform:scale(1)}
          100%{opacity:0;transform:scale(0.3) translate(var(--spark-dx),var(--spark-dy))}
        }
        @keyframes skyCloudBob{
          0%,100%{transform:translate(0,0) scale(1)}
          25%{transform:translate(0,-3px) scale(1.02)}
          55%{transform:translate(0,-1px) scale(1.015)}
          75%{transform:translate(0,2px) scale(0.995)}
        }
        @keyframes skyCloudSquish{
          0%{transform:translate(0,0) scale(1,1)}
          18%{transform:translate(0,-4px) scale(1.12,0.86)}
          40%{transform:translate(0,3px) scale(0.92,1.08)}
          62%{transform:translate(0,-2px) scale(1.05,0.95)}
          82%{transform:translate(0,1px) scale(0.98,1.02)}
          100%{transform:translate(0,0) scale(1,1)}
        }
        @keyframes skyCloudPuff{
          0%{opacity:0;transform:scale(0.6) translateY(0)}
          40%{opacity:0.8;transform:scale(1.4) translateY(-8px)}
          100%{opacity:0;transform:scale(2.2) translateY(-20px)}
        }
      `}</style>

      {/* Stars layer — only visible during dusk and night, tappable for shooting stars */}
      {(phaseIdx>=2)&&stars.map((s,i)=>{
        const starOpacity=phaseIdx===2?phaseProgress*0.6:1;
        const isTapped=!!tappedStars[i];
        return(
          <div key={i}
            onClick={e=>{
              e.stopPropagation();
              const rect=e.currentTarget.getBoundingClientRect();
              const sx=rect.left+rect.width/2;
              const sy=rect.top+rect.height/2;
              handleStarTap(i,sx,sy);
            }}
            style={{
              position:"absolute",left:`${s.x}%`,top:`${s.y}%`,
              width:Math.max(18,s.size*2.5),height:Math.max(18,s.size*2.5),
              marginLeft:`-${Math.max(9,s.size*1.25)}px`,
              marginTop:`-${Math.max(9,s.size*1.25)}px`,
              borderRadius:"50%",
              display:"flex",alignItems:"center",justifyContent:"center",
              cursor:"pointer",
              opacity:starOpacity,
              transition:"opacity 2s ease",
              zIndex:2,
              WebkitTapHighlightColor:"transparent",
            }}>
            {/* Star core */}
            <div style={{
              width:s.size*2.5,height:s.size*2.5,borderRadius:"50%",
              background:"#FFFFFF",
              boxShadow:`0 0 ${s.size*4}px rgba(255,255,255,0.7), 0 0 ${s.size*8}px rgba(255,255,255,0.3)`,
              animation:isTapped
                ?`skyStarBurst 1.6s cubic-bezier(0.32, 0.72, 0, 1) forwards`
                :`skyStarTwinkle ${2.6+i*0.18}s ease-in-out ${s.delay}s infinite`,
              pointerEvents:"none",
            }}/>
            {/* Ripple when tapped */}
            {isTapped&&(
              <div style={{
                position:"absolute",left:"50%",top:"50%",
                marginLeft:`-${s.size*2.5}px`,marginTop:`-${s.size*2.5}px`,
                width:s.size*5,height:s.size*5,borderRadius:"50%",
                border:"1.5px solid rgba(255,255,255,0.8)",
                animation:"skyStarRipple 1.4s cubic-bezier(0.32, 0.72, 0, 1) forwards",
                pointerEvents:"none",
              }}/>
            )}
          </div>
        );
      })}

      {/* Shooting stars — beautiful multi-layer comets with sparkle trails */}
      {shootingStars.map(ss=>{
        const vw=typeof window!=="undefined"?window.innerWidth:400;
        const vh=typeof window!=="undefined"?window.innerHeight:800;
        const endX=ss.dx*vw/100;
        const endY=ss.dy*vh/100;
        const angle=Math.atan2(ss.dy,ss.dx)*180/Math.PI;
        const tailLen=ss.len*1.4;
        // Sparkles along the tail — keep light, 3 particles for crisp performance
        const sparkles=[
          {pos:0.25,size:2,delay:0.10,dx:8,dy:-10},
          {pos:0.50,size:2.2,delay:0.22,dx:-10,dy:8},
          {pos:0.75,size:1.6,delay:0.36,dx:10,dy:-6},
        ];
        return(
          <Fragment key={ss.id}>
            {/* End-flash burst — soft glow at impact point */}
            <div style={{
              position:"fixed",
              left:ss.sx+endX-28, top:ss.sy+endY-28,
              width:56,height:56,borderRadius:"50%",
              background:"radial-gradient(circle, rgba(255,255,250,0.9) 0%, rgba(255,240,200,0.4) 35%, rgba(255,220,160,0) 70%)",
              pointerEvents:"none",
              zIndex:5,
              animation:"skyShootFlash 1s cubic-bezier(0.32, 0.72, 0, 1) 1.9s forwards",
              opacity:0,
            }}/>
            {/* Comet body */}
            <div style={{
              position:"fixed",
              left:ss.sx,top:ss.sy,
              width:0,height:0,
              pointerEvents:"none",
              zIndex:6,
              "--shoot-end-x":`${endX}px`,
              "--shoot-end-y":`${endY}px`,
              animation:"skyShootFly 2.8s cubic-bezier(0.22, 0.61, 0.36, 1) forwards",
              willChange:"transform, opacity",
            }}>
            {/* Comet body: rotated container holding the tail behind the head */}
            <div style={{position:"absolute",left:0,top:0,width:0,height:0,transform:`rotate(${angle}deg)`}}>
              {/* Outer glow halo — single soft gradient, no blur filter */}
              <div style={{
                position:"absolute",left:-24,top:-24,width:48,height:48,borderRadius:"50%",
                background:"radial-gradient(circle, rgba(255,250,220,0.8) 0%, rgba(255,240,190,0.3) 35%, rgba(255,220,160,0) 70%)",
              }}/>
              {/* Tail — single layer with gradient, no blur for GPU smoothness */}
              <div style={{
                position:"absolute",
                left:-tailLen,top:-3,
                width:tailLen,height:6,
                background:"linear-gradient(90deg, rgba(255,250,220,0) 0%, rgba(255,250,220,0.25) 35%, rgba(255,250,225,0.7) 75%, #FFFFFF 100%)",
                borderRadius:"50%",
              }}/>
              {/* Inner bright tail line — sharp core */}
              <div style={{
                position:"absolute",
                left:-tailLen*0.7,top:-0.75,
                width:tailLen*0.7,height:1.5,
                background:"linear-gradient(90deg, rgba(255,255,250,0) 0%, rgba(255,255,250,0.6) 60%, #FFFFFF 100%)",
                borderRadius:"50%",
              }}/>
              {/* Comet head — clean nucleus with single layered shadow */}
              <div style={{
                position:"absolute",left:-4,top:-4,width:8,height:8,borderRadius:"50%",
                background:"radial-gradient(circle, #FFFFFF 0%, #FFFEF0 50%, rgba(255,240,180,0) 80%)",
                boxShadow:"0 0 12px rgba(255,250,220,0.9), 0 0 32px rgba(255,240,180,0.5)",
              }}/>
              {/* Tiny sparkle particles along the tail */}
              {sparkles.map((sp,si)=>(
                <div key={si} style={{
                  position:"absolute",
                  left:-tailLen*sp.pos,top:-sp.size/2,
                  width:sp.size,height:sp.size,borderRadius:"50%",
                  background:"#FFFFFF",
                  boxShadow:`0 0 ${sp.size*4}px rgba(255,250,220,0.9)`,
                  "--spark-dx":`${sp.dx}px`,
                  "--spark-dy":`${sp.dy}px`,
                  animation:`skySparkle 1.4s cubic-bezier(0.32, 0.72, 0, 1) ${sp.delay}s forwards`,
                  opacity:0,
                }}/>
              ))}
            </div>
          </div>
          </Fragment>
        );
      })}

      {/* Soft horizon glow band */}
      <div style={{position:"absolute",left:0,right:0,bottom:0,height:"35%",background:`linear-gradient(180deg, transparent 0%, ${isDark?"rgba(255,200,170,0.0)":"rgba(255,220,200,0.18)"} 60%, ${isDark?"rgba(255,180,200,0.0)":"rgba(255,200,210,0.25)"} 100%)`,animation:"skyHorizonGlow 8s ease-in-out infinite",pointerEvents:"none",transition:"background 2s ease",zIndex:1}}/>

      {/* Cloud layers — drift horizontally, tap to bounce + nudge vertical path */}
      {clouds.map((c,i)=>{
        // Clouds fade out as night approaches
        const cloudOp = phaseIdx===3 ? c.opacity*0.15 : phaseIdx===2 ? c.opacity*(1-phaseProgress*0.7) : c.opacity;
        const isBounced=!!bouncedClouds[i];
        const driftY=cloudDrifts[i]||0;
        return(
          <div key={i} style={{
            position:"absolute",
            top:`${c.y}%`,
            left:0,right:0,
            transform:"translateX(0)",
            animation:`skyCloudDrift ${c.speed}s linear ${c.delay}s infinite`,
            pointerEvents:"none",
            opacity:cloudOp,
            transition:"opacity 2s ease",
            zIndex:2,
          }}>
            {/* Vertical drift wrapper — smoothly glides to new path when tapped */}
            <div style={{
              transform:`translateY(${driftY}px)`,
              transition:"transform 2.4s cubic-bezier(0.32, 0.72, 0, 1)",
              display:"inline-block",
            }}>
            {/* Tap target wraps the cloud SVG and handles bounce */}
            <div
              onClick={e=>{e.stopPropagation();handleCloudTap(i);}}
              style={{
                display:"inline-block",
                cursor:"pointer",
                pointerEvents:"auto",
                animation:isBounced?"skyCloudSquish 1.4s cubic-bezier(0.32, 0.72, 0, 1)":"none",
                WebkitTapHighlightColor:"transparent",
              }}>
              <svg width={120*c.size} height={42*c.size} viewBox="0 0 120 42" style={{display:"block",filter:`drop-shadow(0 4px 12px rgba(255,255,255,0.15))${isBounced?" brightness(1.15)":""}`,transition:"filter 0.4s ease"}}>
                <defs>
                  <radialGradient id={`cloudGrad${i}`} cx="40%" cy="40%" r="70%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95"/>
                    <stop offset="80%" stopColor="#FFFFFF" stopOpacity="0.7"/>
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.4"/>
                  </radialGradient>
                </defs>
                <ellipse cx="35" cy="24" rx="22" ry="11" fill={`url(#cloudGrad${i})`}/>
                <ellipse cx="55" cy="20" rx="20" ry="13" fill={`url(#cloudGrad${i})`}/>
                <ellipse cx="78" cy="22" rx="24" ry="12" fill={`url(#cloudGrad${i})`}/>
                <ellipse cx="95" cy="26" rx="16" ry="9" fill={`url(#cloudGrad${i})`}/>
              </svg>
              {/* Puff particles when bounced — three soft puffs escape upward */}
              {isBounced&&[0,1,2].map(pi=>(
                <div key={pi} style={{
                  position:"absolute",
                  left:`${30+pi*25}%`,top:"40%",
                  width:14,height:14,borderRadius:"50%",
                  background:"radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 70%)",
                  pointerEvents:"none",
                  animation:`skyCloudPuff 1.2s cubic-bezier(0.32, 0.72, 0, 1) ${pi*0.08}s forwards`,
                  opacity:0,
                  filter:"blur(1px)",
                }}/>
              ))}
            </div>
            </div>
          </div>
        );
      })}

      {/* Subtle close button — top-right, glassmorphic */}
      <button onClick={onClose} className="lt-press" style={{position:"absolute",top:22,right:22,width:38,height:38,borderRadius:19,border:`1px solid ${isDark?"rgba(255,255,255,0.25)":"rgba(31,27,46,0.12)"}`,background:isDark?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.45)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",color:isDark?"#FFFFFF":G.ink,cursor:"pointer",zIndex:10,fontWeight:500,transition:"background .8s ease, color .8s ease, border-color .8s ease",display:"flex",alignItems:"center",justifyContent:"center"}}><IconX size={14}/></button>

      {/* Minimal guidance text — bottom center, fades in and out */}
      <div style={{position:"absolute",bottom:48,left:0,right:0,textAlign:"center",pointerEvents:"none",zIndex:5}}>
        <div style={{fontFamily:G.serif,fontWeight:500,fontSize:18,color:isDark?"rgba(255,255,255,0.92)":"rgba(31,27,46,0.78)",letterSpacing:-.2,textShadow:isDark?"0 2px 8px rgba(0,0,0,0.4)":"0 1px 2px rgba(255,255,255,0.4)",transition:"color 1.5s ease, text-shadow 1.5s ease"}}>{phaseIdx>=3?(lang==="sv"?"Tryck på en stjärna":"Tap a star"):t.skyHint}</div>
      </div>

      {/* Progress ring — bottom-right, very subtle */}
      <div style={{position:"absolute",bottom:22,right:22,zIndex:10,pointerEvents:"none"}}>
        <svg width={38} height={38} viewBox="0 0 38 38">
          <circle cx="19" cy="19" r="16" fill="none" stroke={isDark?"rgba(255,255,255,0.18)":"rgba(31,27,46,0.12)"} strokeWidth="1.5"/>
          <circle cx="19" cy="19" r="16" fill="none" stroke={isDark?"rgba(255,255,255,0.65)":"rgba(31,27,46,0.45)"} strokeWidth="1.5" strokeLinecap="round" strokeDasharray={`${2*Math.PI*16}`} strokeDashoffset={`${2*Math.PI*16*(1-elapsed/DURATION)}`} transform="rotate(-90 19 19)" style={{transition:"stroke .8s ease, stroke-dashoffset .25s linear"}}/>
        </svg>
      </div>
    </div>
  );
}

/* ═══ Calm screen — pick exercise ═══ */
function CalmScreen({t,lang,cfg,isEditor,setCfg,onImmersiveChange}){
  const S=SCREENS.calm;
  const[active,setActive]=useState(null);

  // Tell App when an immersive exercise is running so it can hide bottom nav.
  // Exercises are full-screen, calming experiences — chrome (the tab bar) would
  // break immersion and steal attention. Cleanup ensures nav comes back even
  // if the user navigates away while in an exercise.
  useEffect(()=>{
    onImmersiveChange?.(!!active);
    return()=>onImmersiveChange?.(false);
  // eslint-disable-next-line
  },[active]);

  // Editor view — toggle exercises on/off
  if(isEditor){
    const calmTools=cfg.calmTools||{breath:true,grounding:true,skylight:true};
    const toggle=(k)=>{
      const cur=calmTools[k]!==false;
      const next={...calmTools,[k]:!cur};
      // Keep at least one enabled
      const any=Object.values(next).some(v=>v!==false);
      if(!any) return;
      setCfg(x=>({...x,calmTools:next}));
    };
    const items=[
      {key:"breath",icon:"🫧",title:t.breathing,desc:lang==="en"?"4 calming breath cycles":"Andas lugnt i 4 omgångar",color:"#9DC4D8"},
      {key:"grounding",icon:"🌱",title:t.grounding,desc:lang==="en"?"5 senses, one at a time":"5 sinnen, ett i taget",color:"#A5C9B5"},
      {key:"skylight",icon:"☁️",title:t.skylight,desc:lang==="en"?"Rest your gaze on the sky":"Vila blicken mot himlen",color:"#B89DC4"},
    ];
    return(
      <div style={{flex:1,overflowY:"auto",background:S.hb,padding:"24px 22px 120px",display:"flex",flexDirection:"column",gap:18}}>
        <div style={{background:G.white,borderRadius:22,padding:"20px 20px 18px",border:`1px solid ${G.border}`,boxShadow:"0 8px 24px rgba(31,27,46,0.04)"}}>
          <div style={{fontFamily:G.font,fontWeight:600,fontSize:13,color:S.deep,marginBottom:6,letterSpacing:.2}}>{lang==="en"?"Available exercises":"Tillgängliga övningar"}</div>
          <div style={{fontFamily:G.font,fontWeight:400,fontSize:12,color:G.ink2,lineHeight:1.5}}>{lang==="en"?"Choose which exercises the user can see. At least one must be enabled.":"Välj vilka övningar som syns för användaren. Minst en måste vara aktiv."}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {items.map(ex=>{
            const on=calmTools[ex.key]!==false;
            return(
              <div key={ex.key} onClick={()=>toggle(ex.key)} className="lt-press-soft" style={{
                background:G.white,borderRadius:18,padding:"16px 18px",cursor:"pointer",
                border:`1px solid ${on?ex.color+"66":"rgba(31,27,46,0.06)"}`,
                boxShadow:on?`0 6px 18px ${ex.color}22`:"0 1px 3px rgba(31,27,46,0.04)",
                display:"flex",alignItems:"center",gap:14,
                opacity:on?1:0.6,
                transition:"all .25s ease",
              }}>
                <div style={{width:52,height:52,borderRadius:14,background:on?`linear-gradient(140deg,${ex.color}40,${ex.color}28)`:"#F4F2F8",border:`1px solid ${on?ex.color+"33":"rgba(31,27,46,0.06)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0,filter:on?"none":"grayscale(0.7)"}}>{ex.icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:G.serif,fontWeight:500,fontSize:17,color:G.ink,marginBottom:2,letterSpacing:-.1}}>{ex.title}</div>
                  <div style={{fontFamily:G.font,fontWeight:400,fontSize:12,color:G.ink2,lineHeight:1.3}}>{ex.desc}</div>
                </div>
                <Toggle on={on} onChange={()=>toggle(ex.key)} color={ex.color}/>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const exercises=[
    cfg.calmTools?.breath!==false&&{key:"breath",emoji:"🫧",title:t.breathing,desc:"Andas lugnt i 4 omgångar",color:"#9DC4D8",gradFrom:"#9DC4D8",gradTo:"#C5DCE5"},
    cfg.calmTools?.grounding!==false&&{key:"grounding",emoji:"🌱",title:t.grounding,desc:"5 sinnen, ett i taget",color:"#A5C9B5",gradFrom:"#A5C9B5",gradTo:"#C5DBC9"},
    cfg.calmTools?.skylight!==false&&{key:"skylight",emoji:"☁️",title:t.skylight,desc:"Vila blicken mot himlen",color:"#B89DC4",gradFrom:"#B89DC4",gradTo:"#D5C5DD"},
  ].filter(Boolean);
  return(
    <div style={{flex:1,overflowY:"auto",background:S.hb}}>
      {active==="breath"&&<BreathingExercise onClose={()=>setActive(null)} t={t}/>}
      {active==="grounding"&&<GroundingExercise onClose={()=>setActive(null)} t={t}/>}
      {active==="skylight"&&<SkylightExercise onClose={()=>setActive(null)} t={t} lang={lang}/>}
      <div style={{padding:"32px 22px 120px"}}>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {exercises.map(ex=>(
            <div key={ex.key} onClick={()=>setActive(ex.key)} className="lt-press-soft" style={{background:G.white,borderRadius:24,padding:"24px 22px",cursor:"pointer",border:`1px solid ${ex.color}25`,boxShadow:`0 10px 30px ${ex.color}1F`,display:"flex",alignItems:"center",gap:18}}>
              <div style={{width:74,height:74,borderRadius:22,background:`linear-gradient(140deg,${ex.gradFrom}40,${ex.gradTo}55)`,border:`1px solid ${ex.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:38,flexShrink:0,boxShadow:`inset 0 1px 0 rgba(255,255,255,0.6)`,overflow:"hidden"}}>
                {ex.key==="grounding"?(
                  <svg width={54} height={54} viewBox="0 0 100 100" style={{overflow:"visible"}}>
                    <style>{`
                      @keyframes gIconRipple{0%{transform:scale(0.4);opacity:0.65}100%{transform:scale(1.9);opacity:0}}
                      @keyframes gIconBreathe{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}
                    `}</style>
                    <defs>
                      <radialGradient id="gIconCore" cx="35%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#FFFFFF"/>
                        <stop offset="22%" stopColor="#FFFAF0"/>
                        <stop offset="58%" stopColor={ex.color}/>
                        <stop offset="100%" stopColor="#6E9779"/>
                      </radialGradient>
                    </defs>
                    <circle cx="50" cy="50" r="20" fill="none" stroke={ex.color} strokeWidth="2" opacity="0.65" style={{transformOrigin:"50px 50px",animation:"gIconRipple 3.6s ease-out infinite"}}/>
                    <circle cx="50" cy="50" r="20" fill="none" stroke={ex.color} strokeWidth="2" opacity="0.65" style={{transformOrigin:"50px 50px",animation:"gIconRipple 3.6s ease-out 1.8s infinite"}}/>
                    <g style={{transformOrigin:"50px 50px",animation:"gIconBreathe 3.2s ease-in-out infinite"}}>
                      <circle cx="50" cy="50" r="17" fill="url(#gIconCore)"/>
                      <circle cx="45" cy="45" r="4.2" fill="#FFFFFF" opacity="0.85"/>
                    </g>
                  </svg>
                ):ex.key==="breath"?(
                  <svg width={54} height={54} viewBox="0 0 100 100" style={{overflow:"visible"}}>
                    <style>{`
                      @keyframes bIconBreath{0%,100%{transform:scale(0.62)}33%{transform:scale(1)}50%{transform:scale(1)}}
                      @keyframes bIconHaloPulse{0%,100%{opacity:0.28;transform:scale(0.88)}50%{opacity:0.5;transform:scale(1.02)}}
                    `}</style>
                    <defs>
                      <radialGradient id="bIconCore" cx="35%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#FFFFFF"/>
                        <stop offset="22%" stopColor="#F4FAFD"/>
                        <stop offset="58%" stopColor={ex.color}/>
                        <stop offset="100%" stopColor="#4E7398"/>
                      </radialGradient>
                      <radialGradient id="bIconHalo" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={ex.color} stopOpacity="0.4"/>
                        <stop offset="70%" stopColor={ex.color} stopOpacity="0.08"/>
                        <stop offset="100%" stopColor={ex.color} stopOpacity="0"/>
                      </radialGradient>
                    </defs>
                    {/* Soft halo — pulses in sync with breath */}
                    <circle cx="50" cy="50" r="44" fill="url(#bIconHalo)" style={{transformOrigin:"50px 50px",animation:"bIconHaloPulse 5.5s ease-in-out infinite"}}/>
                    {/* Outer breath ring — slowly pulses */}
                    <circle cx="50" cy="50" r="36" fill="none" stroke={ex.color} strokeWidth="1.5" opacity="0.35" style={{transformOrigin:"50px 50px",animation:"bIconHaloPulse 5.5s ease-in-out infinite"}}/>
                    {/* Breathing orb — main element */}
                    <g style={{transformOrigin:"50px 50px",animation:"bIconBreath 5.5s ease-in-out infinite"}}>
                      <circle cx="50" cy="50" r="28" fill="url(#bIconCore)"/>
                      <circle cx="42" cy="42" r="6" fill="#FFFFFF" opacity="0.85"/>
                    </g>
                  </svg>
                ):ex.key==="skylight"?(
                  <svg width={54} height={54} viewBox="0 0 100 100" style={{overflow:"hidden",borderRadius:"50%"}}>
                    <style>{`
                      @keyframes skIconCloudA{0%{transform:translateX(-30px)}100%{transform:translateX(120px)}}
                      @keyframes skIconCloudB{0%{transform:translateX(-50px)}100%{transform:translateX(110px)}}
                      @keyframes skIconShimmer{0%,100%{opacity:0.6}50%{opacity:1}}
                    `}</style>
                    <defs>
                      <radialGradient id="skIconSky" cx="50%" cy="35%" r="80%">
                        <stop offset="0%" stopColor="#F5EEFA"/>
                        <stop offset="55%" stopColor="#D8C6E0"/>
                        <stop offset="100%" stopColor="#B89DC4"/>
                      </radialGradient>
                      <radialGradient id="skIconCloud" cx="40%" cy="40%" r="70%">
                        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95"/>
                        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.55"/>
                      </radialGradient>
                    </defs>
                    {/* Sky background */}
                    <circle cx="50" cy="50" r="50" fill="url(#skIconSky)"/>
                    {/* Tiny star shimmer */}
                    <circle cx="22" cy="28" r="1.2" fill="#FFFFFF" style={{animation:"skIconShimmer 3s ease-in-out infinite"}}/>
                    <circle cx="76" cy="20" r="0.9" fill="#FFFFFF" style={{animation:"skIconShimmer 3s ease-in-out 1.5s infinite"}}/>
                    <circle cx="82" cy="38" r="0.7" fill="#FFFFFF" opacity="0.7" style={{animation:"skIconShimmer 3s ease-in-out 2.2s infinite"}}/>
                    {/* Drifting clouds */}
                    <g style={{animation:"skIconCloudA 7s linear infinite"}}>
                      <ellipse cx="0" cy="58" rx="14" ry="6" fill="url(#skIconCloud)"/>
                      <ellipse cx="-6" cy="60" rx="10" ry="5" fill="url(#skIconCloud)"/>
                      <ellipse cx="6" cy="60" rx="9" ry="5" fill="url(#skIconCloud)"/>
                    </g>
                    <g style={{animation:"skIconCloudB 11s linear infinite",animationDelay:"-3s"}}>
                      <ellipse cx="0" cy="38" rx="10" ry="4" fill="url(#skIconCloud)" opacity="0.7"/>
                      <ellipse cx="-5" cy="39" rx="7" ry="3.5" fill="url(#skIconCloud)" opacity="0.7"/>
                    </g>
                  </svg>
                ):ex.emoji}
              </div>
              <div style={{flex:1}}>
                <div style={{fontFamily:G.serif,fontWeight:500,fontSize:19,color:G.inkSoft,letterSpacing:-.3,lineHeight:1.15}}>{ex.title}</div>
                <div style={{fontFamily:G.font,fontWeight:400,fontSize:13,color:"#9892AA",marginTop:5,letterSpacing:.1}}>{ex.desc}</div>
              </div>
              <span style={{color:ex.color,opacity:.5,display:"inline-flex",alignItems:"center"}}><IconChevron dir="right" size={14}/></span>
            </div>
          ))}
          {exercises.length===0&&<div style={{textAlign:"center",color:G.ink3,fontFamily:G.font,marginTop:40}}>Aktivera övningar i Inställningar</div>}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   WEEK VIEW — calm planning surface with adaptive
   visual weight. Today prominent, past tones down,
   future waits quietly. Edit mode = tap to edit.
═══════════════════════════════════════════════════ */
function WeekScreen({acts,dailyState,isEd,t,lang,now,cfg,onTap,onEdit,onAdd,headerTapCount}){
  const S=SCREENS.week;
  const weekColors=(cfg?.weekColors&&cfg.weekColors.length===7)?cfg.weekColors:SIGVARD0;
  // focusedDay = jsDay user has tapped to "peek" at, or null = default (today is strong)
  const[focusedDay,setFocusedDay]=useState(null);
  // When the app header is tapped, reset peek focus to today
  useEffect(()=>{
    if(headerTapCount>0) setFocusedDay(null);
  },[headerTapCount]);
  // Build per-day date key for state lookup
  const dKey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  const HOUR_H=58;
  // Full 24-hour day — midnight to midnight. Earlier this started at 06:00 to
  // save vertical space, but that hid early-morning activities entirely. With
  // initial scroll positioned to "now" (or first activity) the user still
  // lands somewhere relevant — they can simply scroll up to see earlier hours.
  const HOUR_START=0;
  const HOUR_END=24; // extends to midnight so day-column color reaches the actual day boundary
  const HOURS=Array.from({length:HOUR_END-HOUR_START},(_,i)=>HOUR_START+i);
  const TOTAL_H=HOURS.length*HOUR_H;
  // Extra room so the day-column color reaches and fully encloses the midnight marker
  // (the "00" label sits at the very bottom and the colored bar must visually reach it).
  const MIDNIGHT_PAD=14;
  const TIME_W=lang==="en"?44:34;
  const scrollRef=useRef(null);
  // Pill is only relevant when the target activity is BELOW the visible
  // viewport. Single state, only toggled when value changes — minimal renders.
  const[targetBelow,setTargetBelow]=useState(false);
  // Refs for direct DOM manipulation of collapse-driven elements. We avoid
  // React state for the collapse value entirely because re-rendering the
  // entire WeekScreen (7 day columns × N activities × hour grid) on every
  // scroll frame caused stutter on iOS even with rAF throttling. Imperative
  // style mutation on a handful of targeted elements is ~50× cheaper per frame.
  const titleAreaRef=useRef(null);
  const weekRangeRef=useRef(null);
  const dayHeaderRowRef=useRef(null);

  // Current week's Monday → Sunday
  const today=new Date(now);
  today.setHours(0,0,0,0);
  const todayJS=today.getDay();
  const offsetFromMon=todayJS===0?-6:-(todayJS-1);
  const monday=new Date(today);
  monday.setDate(today.getDate()+offsetFromMon);
  const weekDays=[0,1,2,3,4,5,6].map(i=>{
    const d=new Date(monday);
    d.setDate(monday.getDate()+i);
    return{date:d,day:d.getDate(),jsDay:d.getDay(),isToday:d.getTime()===today.getTime(),isPast:d.getTime()<today.getTime()};
  });
  const DAY_LABELS={sv:["MÅN","TIS","ONS","TOR","FRE","LÖR","SÖN"],en:["MON","TUE","WED","THU","FRI","SAT","SUN"]};
  const labels=DAY_LABELS[lang==="sv"?"sv":"en"];

  // Auto-scroll to bring "now" hour into view (or 8am if before)
  useEffect(()=>{
    if(!scrollRef.current) return;
    const nowMin=now.getHours()*60+now.getMinutes();
    const scrollH=scrollRef.current.clientHeight;
    const focusY=Math.max(0,((nowMin/60)-HOUR_START)*HOUR_H - scrollH/3);
    scrollRef.current.scrollTop=focusY;
  // eslint-disable-next-line
  },[]);

  // Does activity belong on a day with this jsDay?
  const onJsDay=(a,jsDay)=>{
    if(!a.repeat||a.repeat.type==="none") return true;
    if(a.repeat.type==="daily") return true;
    if(a.repeat.type==="weekdays") return jsDay>=1&&jsDay<=5;
    if(a.repeat.type==="weekend") return jsDay===0||jsDay===6;
    if(a.repeat.type==="custom") return (a.repeat.days||[]).includes(jsDay);
    return true;
  };
  const yForAct=a=>Math.max(0,((hm(a.time)/60)-HOUR_START)*HOUR_H);
  const hForAct=a=>{
    if(a.endTime){
      const dur=hm(a.endTime)-hm(a.time);
      return Math.max(40,(dur/60)*HOUR_H);
    }
    return 54;
  };

  const monthLabel=monday.toLocaleString(lang==="sv"?"sv-SE":"en-GB",{month:"short"});
  const sundayMonth=weekDays[6].date.toLocaleString(lang==="sv"?"sv-SE":"en-GB",{month:"short"});
  const sameMonth=monday.getMonth()===weekDays[6].date.getMonth();
  const weekRange=sameMonth
    ? `${monday.getDate()} – ${weekDays[6].day} ${monthLabel}`
    : `${monday.getDate()} ${monthLabel} – ${weekDays[6].day} ${sundayMonth}`;

  const nowMin=now.getHours()*60+now.getMinutes();
  const nowY=((nowMin/60)-HOUR_START)*HOUR_H;
  const showNowLine=nowMin>=HOUR_START*60&&nowMin<=HOUR_END*60;

  // Any activity at all on the current week's days?
  const anyActs=acts.some(a=>weekDays.some(d=>onJsDay(a,d.jsDay)));

  /* ─────────── "Nästa aktivitet" pill target ───────────
     Mirrors the day-view pill: shows the currently-happening activity, or the
     next upcoming one today. Falls back to nothing once today's activities are
     all in the past — at which point the pill simply doesn't render. Editor
     mode hides this entirely (no need for navigation aids while authoring). */
  const todayJsDay=now.getDay();
  const todayDateKey=dKey(now);
  const todayActsForPill=isEd ? [] : acts.filter(a=>{
    if(!onJsDay(a,todayJsDay)) return false;
    if(dailyState?.[todayDateKey]?.[a.id]?.done) return false;
    const endM=a.endTime?hm(a.endTime):hm(a.time)+30;
    return endM>nowMin; // Future end → still in play
  }).sort((x,y)=>hm(x.time)-hm(y.time));
  // Prefer the in-progress one if any; otherwise the next upcoming.
  const pillCurrent=todayActsForPill.find(a=>{
    const sM=hm(a.time);
    const eM=a.endTime?hm(a.endTime):sM+30;
    return sM<=nowMin&&eM>nowMin;
  });
  const pillNext=todayActsForPill.find(a=>hm(a.time)>nowMin);
  const pillTarget=pillCurrent||pillNext||null;

  /* Tap → jump to target. Two effects:
     1. If user has another day "peeked" (focused), clear it so today's column
        becomes wide and the user actually sees what they tapped.
     2. Scroll the timeline so the target activity lands ~1/3 down the viewport,
        same composition rule as the day view's auto-scroll. */
  const jumpToPillTarget=()=>{
    if(!pillTarget||!scrollRef.current) return;
    setFocusedDay(null);
    const y=yForAct(pillTarget);
    const viewH=scrollRef.current.clientHeight;
    scrollRef.current.scrollTo({top:Math.max(0,y-viewH/3),behavior:"smooth"});
  };

  /* Watch scroll position. Two effects:
     1. Pill visibility — only setState when boolean changes (≤2 renders total)
     2. Header collapse — IMPERATIVE DOM mutation, zero React re-renders.

     React state for the collapse value caused stutter on iOS during fast
     scrolling because each scroll frame re-rendered the entire WeekScreen
     tree (7 day-columns, hour grid, activity tiles, all absolute-positioned
     with transitions). Even rAF throttling couldn't compensate for the cost
     of those re-renders. Direct style mutation via refs is what scroll-driven
     UI is supposed to use; collapse now updates at native scroll speed. */
  useEffect(()=>{
    const el=scrollRef.current;
    if(!el) return;
    const targetY=pillTarget?yForAct(pillTarget):null;
    let lastBelow=null;
    let rafPending=false;
    let pendingTop=0;
    /* Single frame of work — runs at most 60Hz. Reads the latest scrollTop
       (captured at scroll-event time) and applies styles directly to DOM. */
    const applyFrame=()=>{
      rafPending=false;
      const top=pendingTop;
      const raw=top<0?0:top>120?1:top/120;
      const eased=raw*raw*(3-2*raw); // smoothstep — gentle at both ends
      // Title area — paddings, max-height, opacity on its inner range label
      const ta=titleAreaRef.current;
      if(ta){
        ta.style.paddingTop=(24-eased*22)+"px";
        ta.style.paddingBottom=(14-eased*12)+"px";
        ta.style.maxHeight=eased>0.9?"0px":"60px";
      }
      const wr=weekRangeRef.current;
      if(wr) wr.style.opacity=String(1-eased);
      // Day-header row paddings (the row that contains MÅN/TIS/.../SÖN discs)
      const dh=dayHeaderRowRef.current;
      if(dh){
        dh.style.paddingTop=(18-eased*10)+"px";
        dh.style.paddingBottom=(12-eased*6)+"px";
        // CSS variable lets day-tile children read collapse via inheritance.
        // No re-render needed: tiles read this in their style via calc()/var().
        dh.style.setProperty("--collapse",String(eased));
      }
    };
    const onScroll=()=>{
      const top=el.scrollTop;
      pendingTop=top;
      // Pill below-state — cheap check, only setState on real transitions
      if(targetY!==null){
        const visibleBot=top+el.clientHeight-80;
        const below=targetY>visibleBot;
        if(below!==lastBelow){
          lastBelow=below;
          setTargetBelow(below);
        }
      }
      if(!rafPending){
        rafPending=true;
        requestAnimationFrame(applyFrame);
      }
    };
    onScroll(); // initial
    el.addEventListener("scroll",onScroll,{passive:true});
    window.addEventListener("resize",onScroll);
    return()=>{
      el.removeEventListener("scroll",onScroll);
      window.removeEventListener("resize",onScroll);
    };
  // eslint-disable-next-line
  },[pillTarget?.id,pillTarget?.time,pillTarget?.endTime]);

  return(
    <div
      style={{flex:1,display:"flex",flexDirection:"column",background:S.hb,overflow:"hidden",position:"relative"}}
      onClick={e=>{
        // Tapping anywhere outside a day-tile/header resets focus to today.
        // Day-headers and tiles stop propagation, so this fires for everything else:
        // title area, hour-grid background, day-column empty areas (for today's column).
        setFocusedDay(null);
      }}
    >
      <style>{`
        @keyframes wkTileIn{0%{opacity:0;transform:translateY(6px)}100%{opacity:1;transform:translateY(0)}}
        @keyframes wkNowPulse{0%,100%{opacity:1}50%{opacity:0.55}}
      `}</style>

      {/* Title area — collapses on scroll via direct DOM mutation (see
          scroll effect above). Style values are initial; the scroll handler
          rewrites padding/maxHeight imperatively without triggering React
          re-renders. The "Idag" pill lives separately to avoid clipping. */}
      <div ref={titleAreaRef} style={{padding:"24px 22px 14px",flexShrink:0,maxHeight:60,overflow:"hidden"}}>
        <div ref={weekRangeRef} style={{fontFamily:G.font,fontWeight:400,fontSize:11,color:"#9892AA",letterSpacing:.6,textTransform:"capitalize"}}>{weekRange}</div>
      </div>

      {/* "Idag" pill — lifted out into its own absolute overlay so it can stay
          visible and intact regardless of the title-area's collapse. Lives in
          the top-right corner; only shown when peeking at another day. Tap to
          return focus to today's column. */}
      <div
        onClick={e=>{e.stopPropagation();setFocusedDay(null);}}
        className="lt-press-soft"
        style={{
          position:"absolute",top:14,right:14,zIndex:25,
          opacity:focusedDay!==null?1:0,
          transform:focusedDay!==null?"translateY(0)":"translateY(-4px)",
          transition:"opacity 0.32s cubic-bezier(0.32, 0.72, 0, 1), transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)",
          pointerEvents:focusedDay!==null?"auto":"none",
          display:"flex",alignItems:"center",gap:5,
          padding:"6px 10px 6px 8px",borderRadius:14,
          background:"rgba(255,255,255,0.85)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",
          border:"1px solid rgba(31,27,46,0.06)",
          boxShadow:"0 2px 8px rgba(31,27,46,0.06)",
          fontFamily:G.font,fontWeight:500,fontSize:11,color:G.ink2,letterSpacing:.2,
          cursor:"pointer",
        }}>
        <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11L5 7l4-4"/>
        </svg>
        <span>{lang==="sv"?"Idag":"Today"}</span>
      </div>

      {/* Day-header row — sticky context, today header extends upward like a bookmark.
          Padding collapses via direct DOM mutation in the scroll handler. */}
      <div ref={dayHeaderRowRef} style={{display:"flex",padding:"18px 6px 12px 6px",flexShrink:0,position:"relative",alignItems:"flex-end"}}>
        <div style={{width:TIME_W,flexShrink:0}}/>
        {weekDays.map((d,i)=>{
          const dCol=weekColors[d.jsDay]||S.h;
          // Three-state: today (strongest, default), peeked (medium, on tap), other (quiet)
          const isPeeked=focusedDay===d.jsDay&&!d.isToday;
          const showStrong=d.isToday&&focusedDay===null;
          const showMedium=isPeeked;
          // Today stays identifiable even when peeking another day — softer than strong, stronger than quiet
          const todaySofter=d.isToday&&focusedDay!==null;
          const isLight=dCol==="#FFFFFF"||dCol==="#F5F2EE";
          // Match column flex widths EXACTLY so the disc centers over the colored strip.
          // These must mirror the colFlex logic in the day-column rendering below.
          const headerFlex = showStrong ? 1.85 : todaySofter ? 1.50 : showMedium ? 1.00 : d.isPast ? 0.5 : 0.7;
          // Base sizes — actual rendered size scales via CSS variable
          // --collapse (set on the dayHeaderRow by the scroll handler).
          // Using transform:scale ensures GPU compositing; no layout/paint
          // cost per frame. Today's bookmark extension uses the same var.
          const discBase = showStrong ? 46 : todaySofter ? 36 : showMedium ? 34 : d.isPast ? 18 : 30;
          const numBase  = showStrong ? 21 : todaySofter ? 17 : showMedium ? 16 : d.isPast ? 9 : 13.5;
          return(
            <div key={i}
              onClick={e=>{
                e.stopPropagation();
                // Tap on today always returns to default (today big again).
                // Tap on another day toggles peek-focus.
                if(d.isToday){
                  setFocusedDay(null);
                } else {
                  setFocusedDay(prev=>prev===d.jsDay?null:d.jsDay);
                }
              }}
              className="lt-press-soft"
              style={{flex:headerFlex,textAlign:"center",padding:"4px 0 6px",
                marginTop:d.isToday?`calc(-16px * (1 - var(--collapse, 0)))`:0,
                opacity:d.isPast?0.28:1,filter:d.isPast?"saturate(0.4)":"none",
                transition:"flex .5s cubic-bezier(0.32, 0.72, 0, 1), opacity .6s cubic-bezier(0.32, 0.72, 0, 1), filter .6s cubic-bezier(0.32, 0.72, 0, 1)",
                position:"relative",cursor:"pointer"}}>
              {/* Day label — quiet */}
              <div style={{fontFamily:G.font,fontWeight:500,fontSize:9.5,color:showStrong||showMedium||todaySofter?G.ink:"#9892AA",letterSpacing:.7,marginBottom:5,transition:"color .35s ease"}}>{labels[i]}</div>
              {/* Date number — wrapped in color disc. transform:scale driven by
                  --collapse CSS variable on the parent row so the shrink happens
                  on the compositor thread, not in JS. willChange tells the
                  browser to keep this on its own layer for cheap repaints. */}
              <div style={{
                width:discBase,height:discBase,borderRadius:"50%",margin:"0 auto",
                display:"flex",alignItems:"center",justifyContent:"center",
                background:showStrong||showMedium||todaySofter?dCol:`${dCol}33`,
                border:`1px solid ${isLight?"rgba(31,27,46,0.18)":"rgba(31,27,46,0.04)"}`,
                boxShadow:showStrong
                  ?`0 6px 16px ${dCol}77, 0 2px 4px ${dCol}55, inset 0 1px 0 rgba(255,255,255,0.5)`
                  :showMedium
                  ?`0 3px 8px ${dCol}44, inset 0 1px 0 rgba(255,255,255,0.4)`
                  :todaySofter
                  ?`0 3px 8px ${dCol}44, inset 0 1px 0 rgba(255,255,255,0.45)`
                  :"inset 0 1px 0 rgba(255,255,255,0.35)",
                transition:"background .4s ease, box-shadow .4s ease",
                transform:`scale(${showMedium?1.04:1}) scale(calc(1 - 0.30 * var(--collapse, 0)))`,
                willChange:"transform",
              }}>
                <span style={{fontFamily:G.serif,fontWeight:showStrong||showMedium||todaySofter?600:500,fontSize:numBase,color:showStrong||showMedium||todaySofter?"#FFFFFF":G.ink,textShadow:(showStrong||showMedium||todaySofter)&&(isLight||dCol==="#F5E26B")?"0 1px 2px rgba(31,27,46,0.45), 0 0 1px rgba(31,27,46,0.35)":"none",lineHeight:1,letterSpacing:-.3,transition:"color .35s ease"}}>{d.day}</span>
              </div>
              {/* "Today" indicator — always visible under today's disc, regardless of focus */}
              {d.isToday&&(
                <div style={{marginTop:6,display:"flex",alignItems:"center",justifyContent:"center",gap:3}}>
                  <div style={{width:4,height:4,borderRadius:"50%",background:G.ink,opacity:0.7}}/>
                  <div style={{fontFamily:G.font,fontWeight:600,fontSize:8.5,color:G.ink,letterSpacing:.8,textTransform:"uppercase",opacity:0.7}}>{lang==="sv"?"Idag":"Today"}</div>
                </div>
              )}
            </div>
          );
        })}
        {/* Hairline divider beneath header — soft, full width edge-to-edge for visual binding */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:1,background:"linear-gradient(90deg, transparent 0%, rgba(31,27,46,0.07) 12%, rgba(31,27,46,0.07) 88%, transparent 100%)"}}/>
      </div>

      {/* Grid body — scrollable. paddingBottom gives clearance so the App-level "Add activity" button never overlaps the last hour at scroll-bottom. */}
      <div ref={scrollRef} style={{flex:1,overflowY:"auto",position:"relative",paddingBottom:140}}>
        {/* ───── "Nästa aktivitet" pill ─────
            Sticky at the top of the scroll viewport so it remains reachable
            no matter where the user has scrolled. Tap to jump the timeline to
            the target activity. Same visual vocabulary as the day-view pill
            (white glassmorphic, pulsing colored dot, ellipsised activity name).
            Hidden when there's no relevant target (editor mode, or all of
            today's activities have already ended). */}
        {pillTarget&&(()=>{
          const isEn=t?.myDay==="My Day";
          const isCurrent=!!pillCurrent;
          // Hidden when the target activity is visible in the viewport.
          // Pill is shown only when target activity is BELOW the viewport
          // (user needs to scroll down to reach it). Hidden when in view or
          // when user has scrolled past — popping back up after the user has
          // moved past feels like the app pulling them backwards.
          const visible=targetBelow;
          return(
            <div style={{position:"sticky",top:8,zIndex:20,display:"flex",justifyContent:"center",pointerEvents:"none",padding:"0 16px",marginBottom:-32}}>
              <button onClick={jumpToPillTarget} aria-label={isEn?"Jump to next activity":"Hoppa till nästa aktivitet"} className="lt-press-soft" style={{
                pointerEvents:visible?"auto":"none",
                opacity:visible?1:0,
                transform:visible?"translateY(0) scale(1)":"translateY(-10px) scale(0.94)",
                transition:"opacity 0.32s ease, transform 0.36s cubic-bezier(0.32, 0.72, 0, 1)",
                padding:"8px 14px 8px 12px",borderRadius:999,
                border:`1px solid ${G.border}`,
                background:"linear-gradient(135deg, rgba(255,255,255,0.96), rgba(252,250,254,0.96))",
                backdropFilter:"saturate(180%) blur(14px)",
                WebkitBackdropFilter:"saturate(180%) blur(14px)",
                boxShadow:"0 6px 20px rgba(31,27,46,0.12), inset 0 1px 0 rgba(255,255,255,0.9)",
                display:"flex",alignItems:"center",gap:7,cursor:"pointer",
                fontFamily:G.font,fontWeight:600,fontSize:12,color:G.ink,letterSpacing:.2,
                whiteSpace:"nowrap",maxWidth:"calc(100% - 16px)",
              }}>
                <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:8,height:8,borderRadius:"50%",background:pillTarget.color,boxShadow:`0 0 8px ${pillTarget.color}AA, 0 0 0 2px ${pillTarget.color}22`,animation:"wkPillDot 2.2s ease-in-out infinite",flexShrink:0}}/>
                <style>{`@keyframes wkPillDot{0%,100%{box-shadow:0 0 6px ${pillTarget.color}99, 0 0 0 2px ${pillTarget.color}1F;transform:scale(1)}50%{box-shadow:0 0 12px ${pillTarget.color}EE, 0 0 0 3px ${pillTarget.color}33;transform:scale(1.18)}}`}</style>
                <span style={{overflow:"hidden",textOverflow:"ellipsis",flex:1,minWidth:0}}>
                  {isCurrent ? (isEn?"Now":"Pågår nu") : (isEn?"Next":"Nästa")}
                  <span style={{color:G.ink2,fontWeight:500,marginLeft:6}}>· {pillTarget.name}</span>
                </span>
                {/* Down-chevron — quietly signals "tap to jump down to this".
                    Slightly dimmed so it doesn't pull focus from the activity
                    name; the pulse animation on the colour dot already draws
                    the eye. Hidden when target is currently in progress (no
                    jump needed — user is already there in time). */}
                {!isCurrent&&(
                  <span style={{color:G.ink3,flexShrink:0,marginLeft:2,display:"inline-flex",alignItems:"center",animation:"wkPillChev 2.6s ease-in-out infinite"}}>
                    <IconChevron dir="down" size={12} strokeWidth={2.2}/>
                  </span>
                )}
                <style>{`@keyframes wkPillChev{0%,100%{transform:translateY(0);opacity:0.7}50%{transform:translateY(1.5px);opacity:1}}`}</style>
              </button>
            </div>
          );
        })()}
        {!anyActs&&isEd?null:!anyActs?(
          <div style={{padding:"60px 30px",textAlign:"center"}}>
            <style>{`@keyframes wkEmpty{0%,100%{transform:scale(1);opacity:0.85}50%{transform:scale(1.025);opacity:1}}`}</style>
            <svg width="56" height="56" viewBox="0 0 64 64" style={{display:"block",margin:"0 auto 14px",animation:"wkEmpty 4.6s ease-in-out infinite"}}>
              <rect x="10" y="14" width="44" height="40" rx="6" fill={`${S.h}1A`} stroke={`${S.h}55`} strokeWidth="1.4"/>
              <line x1="10" y1="24" x2="54" y2="24" stroke={`${S.h}66`} strokeWidth="1.2"/>
              <line x1="24.6" y1="24" x2="24.6" y2="54" stroke={`${S.h}33`} strokeWidth="1"/>
              <line x1="39.4" y1="24" x2="39.4" y2="54" stroke={`${S.h}33`} strokeWidth="1"/>
              <path d="M22 10 v6 M42 10 v6" stroke={`${S.h}88`} strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            <div style={{fontFamily:G.serif,fontWeight:500,fontSize:21,color:G.inkSoft,letterSpacing:-.4,lineHeight:1.1,marginBottom:8}}>{t.weekEmpty}</div>
            <div style={{fontFamily:G.font,fontWeight:400,fontSize:13,color:"#9892AA",letterSpacing:.1,lineHeight:1.4}}>Lägg till aktiviteter via redigeringsläget.</div>
          </div>
        ):null}
        <div style={{position:"relative",height:TOTAL_H+MIDNIGHT_PAD,display:"flex",padding:"0 6px"}}>
          {/* Global horizontal hour-lines — span the whole grid edge-to-edge for a calmer rhythm */}
          {HOURS.map((_,i)=>i%2===0&&i!==0&&(
            <div key={`hl-${i}`} style={{position:"absolute",top:i*HOUR_H,left:TIME_W+6,right:6,height:1,background:"rgba(31,27,46,0.04)",pointerEvents:"none",zIndex:0}}/>
          ))}

          {/* Global now-line — warm tinted dark, spans across the whole grid */}
          {showNowLine&&(()=>{
            // Compute today's left-edge percentage given variable column widths.
            // IMPORTANT: these flex values must EXACTLY match the day-column flex logic
            // below (showStrong / todaySofter / showMedium / past / normal). Otherwise
            // the today-dot drifts off-center from today's column.
            const todayIdx=weekDays.findIndex(d=>d.isToday);
            if(todayIdx<0) return null;
            const flexFor=(d)=>{
              const isPeeked=focusedDay===d.jsDay&&!d.isToday;
              const showStrong=d.isToday&&focusedDay===null;
              const showMedium=isPeeked;
              const todaySofter=d.isToday&&focusedDay!==null;
              return showStrong?1.85:todaySofter?1.50:showMedium?1.00:d.isPast?0.5:0.7;
            };
            const totalFlex=weekDays.reduce((sum,d)=>sum+flexFor(d),0);
            const leftFlex=weekDays.slice(0,todayIdx).reduce((sum,d)=>sum+flexFor(d),0);
            const todayFlex=flexFor(weekDays[todayIdx]);
            const dotCenterPct=((leftFlex+todayFlex/2)/totalFlex)*100;
            return(
              <div style={{position:"absolute",top:nowY,left:TIME_W,right:6,height:1.5,background:`linear-gradient(90deg, transparent 0%, ${G.inkSoft}99 8%, ${G.inkSoft}99 92%, transparent 100%)`,boxShadow:`0 0 8px ${G.inkSoft}33`,zIndex:3,pointerEvents:"none",transition:"top .5s cubic-bezier(0.32, 0.72, 0, 1)"}}>
                <div style={{position:"absolute",left:`calc(${dotCenterPct}% - 4px)`,top:-3.5,width:8,height:8,borderRadius:"50%",background:G.inkSoft,boxShadow:`0 0 8px ${G.inkSoft}66`,animation:"wkNowPulse 2.6s ease-in-out infinite",transition:"left .5s cubic-bezier(0.32, 0.72, 0, 1)"}}/>
              </div>
            );
          })()}

          {/* Time column */}
          <div style={{width:TIME_W,flexShrink:0,position:"relative"}}>
            {HOURS.map((h,i)=>(
              <div key={h} style={{position:"absolute",top:i*HOUR_H-5,left:0,right:0,paddingRight:6,textAlign:"right"}}>
                <div style={{fontFamily:G.font,fontSize:9.5,fontWeight:500,color:"#A8A4BB",letterSpacing:.4}}>{lang==="sv"?String(h).padStart(2,"0"):(h===0?"12 AM":h<12?`${h} AM`:h===12?"12 PM":`${h-12} PM`)}</div>
              </div>
            ))}
            {/* End-of-day marker at the very bottom. Reads "24" in Swedish
                (24h convention for day-end) and "12 AM" in English. This is
                distinct from the "00" label at the top which marks day-start. */}
            <div style={{position:"absolute",top:HOURS.length*HOUR_H,left:0,right:0,paddingRight:6,textAlign:"right",transform:"translateY(-50%)"}}>
              <div style={{fontFamily:G.font,fontSize:9.5,fontWeight:500,color:"#A8A4BB",letterSpacing:.4}}>{lang==="sv"?"24":"12 AM"}</div>
            </div>
          </div>

          {/* Day columns */}
          {weekDays.map((d,dayIdx)=>{
            // Per-activity time filter: remove activities whose end time has already
            // passed in real terms, OR that have been marked done for this specific date.
            // Past days, today's past activities, and explicitly-completed activities all
            // disappear. Sigvard convention: completed = gone.
            const dayKey=dKey(d.date);
            const dayActs=acts.filter(a=>{
              if(!onJsDay(a,d.jsDay)) return false;
              // Check per-date done state (e.g. user tapped trash today → don't show again today)
              const dst=dailyState?.[dayKey]?.[a.id];
              if(dst?.done) return false;
              // Build the activity's actual datetime on this column's date
              const actDate=new Date(d.date);
              const startM=hm(a.time);
              const endM=a.endTime?hm(a.endTime):startM;
              actDate.setHours(Math.floor(endM/60),endM%60,0,0);
              // Activity is "gone" once its end time has passed
              return actDate.getTime()>now.getTime();
            }).sort((a,b)=>hm(a.time)-hm(b.time));
            const dCol=weekColors[d.jsDay]||S.h;
            const isLight=dCol==="#FFFFFF"||dCol==="#F5F2EE";
            // Four-state column rendering:
            //   strong       = today, default (nothing peeked)
            //   medium       = a different day user has tapped to peek at
            //   today-softer = today, when user is peeking another day (still distinguishable)
            //   quiet        = all other days
            const isPeeked=focusedDay===d.jsDay&&!d.isToday;
            const showStrong=d.isToday&&focusedDay===null;
            const showMedium=isPeeked;
            const todaySofter=d.isToday&&focusedDay!==null;
            // Column width: today always has the largest flex. Peeked column zooms up
            // but stays smaller than today. Past days shrink.
            // - showStrong (today, default)      → 1.85 (the biggest)
            // - todaySofter (today while peeking)→ 1.50 (still the biggest, keeps "you are here")
            // - showMedium (a non-today peek)   → 1.00 (zoom up, but smaller than today)
            // - past days                       → 0.5 (shrunk)
            // - normal days                     → 0.7 (quietly present)
            const colFlex = showStrong ? 1.85 : todaySofter ? 1.50 : showMedium ? 1.00 : d.isPast ? 0.5 : 0.7;
            // Color fills the full day-column from morning to midnight — strong at top, holding presence to bottom.
            // Not a fade-out: the day "owns" its space until 00:00, then the next day takes over.
            const strongBg = isLight
              ? `linear-gradient(180deg, ${dCol} 0%, ${dCol}F8 100%)`
              : `linear-gradient(180deg, ${dCol}77 0%, ${dCol}66 50%, ${dCol}5C 100%)`;
            const mediumBg = isLight
              ? `linear-gradient(180deg, ${dCol}E5 0%, ${dCol}D8 100%)`
              : `linear-gradient(180deg, ${dCol}44 0%, ${dCol}3D 50%, ${dCol}36 100%)`;
            // Today, when peeking elsewhere, retains a softer-but-still-clear tint —
            // never fully fades to "quiet" so users always see "here is today"
            const todaySoftBg = isLight
              ? `linear-gradient(180deg, ${dCol}F0 0%, ${dCol}E8 100%)`
              : `linear-gradient(180deg, ${dCol}3A 0%, ${dCol}33 50%, ${dCol}2C 100%)`;
            const quietBg = `linear-gradient(180deg, ${dCol}0F 0%, ${dCol}08 100%)`;
            const bg = showStrong ? strongBg : showMedium ? mediumBg : todaySofter ? todaySoftBg : quietBg;
            return(
              <div key={dayIdx}
                onClick={e=>{
                  if(isEd&&dayActs.length===0){onAdd();return;}
                  // Tap empty area of a non-today column → peek toggle
                  if(!d.isToday){
                    e.stopPropagation();
                    setFocusedDay(prev=>prev===d.jsDay?null:d.jsDay);
                  } else if(focusedDay!==null){
                    // Tap today's column while peeking elsewhere → return to default
                    e.stopPropagation();
                    setFocusedDay(null);
                  }
                }}
                style={{
                  flex:colFlex,position:"relative",
                  background:bg,
                  // Today's column extends upward by 14px to visually emphasize "you are here"
                  marginTop:d.isToday?-14:0,
                  borderRadius:d.isToday?"14px 14px 0 0":0,
                  opacity:d.isPast?0.3:1,
                  filter:d.isPast?"saturate(0.4)":"none",
                  transition:"flex .5s cubic-bezier(0.32, 0.72, 0, 1), margin-top .5s cubic-bezier(0.32, 0.72, 0, 1), background .45s cubic-bezier(0.32, 0.72, 0, 1), opacity .8s cubic-bezier(0.32, 0.72, 0, 1), filter .8s cubic-bezier(0.32, 0.72, 0, 1)",
                  cursor:isEd&&dayActs.length===0?"pointer":d.isToday&&focusedDay===null?"default":"pointer",
                }}>
                {/* Activity tiles */}
                {dayActs.map((a,ai)=>{
                  const y=yForAct(a);
                  const h=hForAct(a);
                  const endM=a.endTime?hm(a.endTime):hm(a.time)+30;
                  const startM=hm(a.time);
                  const isNowAct=d.isToday&&startM<=nowMin&&endM>nowMin;
                  // On any tinted column (strong, medium, or today-softer), tiles get white
                  // background with colored accent stripe — classic Sigvard look.
                  // On quiet columns, tiles stand on their own colored gradient.
                  const onTintedColumn = showStrong || showMedium || todaySofter;
                  const tileBg = onTintedColumn
                    ? (a.photo?"#000":"#FFFFFF")
                    : (a.photo?"#000":`linear-gradient(150deg, ${a.color}38, ${a.color}55)`);
                  const tileBorder = onTintedColumn
                    ? (isNowAct?`1.5px solid ${a.color}`:`1px solid rgba(31,27,46,0.08)`)
                    : (isNowAct?`1.5px solid ${a.color}`:`1px solid ${a.color}3A`);
                  const tileShadow = onTintedColumn
                    ? (isNowAct
                        ?`0 8px 20px ${a.color}40, 0 2px 6px rgba(31,27,46,0.18), inset 0 1px 0 rgba(255,255,255,0.5)`
                        :`0 3px 10px rgba(31,27,46,0.12), 0 1px 3px rgba(31,27,46,0.06), inset 0 1px 0 rgba(255,255,255,0.7)`)
                    : (isNowAct
                        ?`0 8px 20px ${a.color}40, 0 2px 6px ${a.color}28, inset 0 1px 0 rgba(255,255,255,0.35)`
                        :`0 2px 6px ${a.color}1F, inset 0 1px 0 rgba(255,255,255,0.4)`);
                  // Tile y-position must compensate for today's column being shifted up by 14px,
                  // otherwise activities appear above the time line they belong to (looking "past")
                  const tileY = d.isToday ? y+14 : y;
                  // Non-focused days dim their activities — they're context, not active focus.
                  // When user peeks a day (medium), it lights up. Today (strong) is always full opacity.
                  const tileOpacity = onTintedColumn ? 1 : 0.48;
                  // Tile padding inside the column edges — today gets slightly more inset because the
                  // column is wider, so tiles can breathe a bit more without losing emphasis
                  const tileInset = d.isToday ? 5 : 3;
                  return(
                    <div key={a.id}
                      onClick={e=>{e.stopPropagation(); isEd?onEdit(a):onTap(a,dayKey);}}
                      className="lt-press-soft"
                      style={{
                        position:"absolute",
                        top:tileY,left:tileInset,right:tileInset,height:h,
                        background:tileBg,
                        border:tileBorder,
                        borderRadius:d.isToday?13:11,
                        overflow:"hidden",
                        cursor:"pointer",
                        boxShadow:tileShadow,
                        opacity:tileOpacity,
                        transition:"top .5s cubic-bezier(0.32, 0.72, 0, 1), left .5s cubic-bezier(0.32, 0.72, 0, 1), right .5s cubic-bezier(0.32, 0.72, 0, 1), transform .26s cubic-bezier(0.32, 0.72, 0, 1), box-shadow .35s ease, opacity .55s cubic-bezier(0.32, 0.72, 0, 1), filter .55s ease, border .35s ease, background .45s ease",
                        animation:`wkTileIn .45s ${(ai*0.04+dayIdx*0.05).toFixed(2)}s cubic-bezier(0.32, 0.72, 0, 1) both`,
                        display:"flex",flexDirection:"column",alignItems:"center",justifyContent:h>50?"flex-start":"center",
                        padding:h>56?"6px 3px 5px":h>40?"4px 2px":"2px 2px",
                        zIndex:1,
                      }}>
                      {/* Color accent stripe on tinted column white tiles — classic Sigvard look */}
                      {onTintedColumn&&!a.photo&&(
                        <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:a.color,borderRadius:"11px 0 0 11px"}}/>
                      )}
                      {a.photo?(
                        <>
                          <img src={a.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover",position:"absolute",inset:0}}/>
                          {/* Bottom gradient overlay for photo tiles when name shows */}
                          {h>50&&<div style={{position:"absolute",left:0,right:0,bottom:0,height:"50%",background:"linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.55) 100%)",pointerEvents:"none"}}/>}
                          {h>50&&<span style={{position:"absolute",bottom:4,left:4,right:4,fontFamily:G.font,fontSize:8.5,fontWeight:500,color:"#FFFFFF",lineHeight:1.1,textAlign:"center",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",letterSpacing:.15,textShadow:"0 1px 2px rgba(0,0,0,0.6)",zIndex:2}}>{a.name}</span>}
                        </>
                      ):(
                        <>
                          <span style={{fontSize:h>60?22:h>44?19:h>30?16:14,lineHeight:1,marginBottom:h>56?3:0,filter:`drop-shadow(0 1px 1px ${a.color}55)`}}>{a.emoji}</span>
                          {h>50&&(
                            <span style={{fontFamily:G.font,fontSize:8.5,fontWeight:500,color:G.ink,lineHeight:1.1,textAlign:"center",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"100%",whiteSpace:"nowrap",letterSpacing:.15,padding:"0 2px",opacity:0.88}}>{a.name}</span>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
                {/* Subtle midnight marker — a soft inner shadow at the very bottom of the column,
                    showing visually where the day ends at 00:00 and the next begins. Only visible
                    on tinted (current/peeked) columns to keep quiet columns calm. */}
                {(showStrong||showMedium||todaySofter)&&(
                  <div style={{position:"absolute",bottom:0,left:0,right:0,height:24,background:`linear-gradient(180deg, transparent 0%, ${dCol}44 100%)`,pointerEvents:"none"}}/>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══ Identity card screen ═══ */
function IdCardScreen({t,lang,cfg,setCfg,isEditor}){
  const S=SCREENS.idcard;
  const[showEdit,setShowEdit]=useState(false);
  const[showMode,setShowMode]=useState(false);
  const c=cfg.idCard||{};
  const contacts=c.contacts||[];
  const isEmpty=!c.name&&!c.condition&&!c.triggers&&!c.helpful&&contacts.filter(k=>k.name&&k.phone).length===0;

  // Card render (reused in normal + show mode)
  const Card=({big})=>(
    <div style={{background:G.white,borderRadius:big?32:28,overflow:"hidden",boxShadow:big?`0 30px 80px ${S.h}33`:`0 20px 60px ${S.h}26`,border:`1px solid ${S.h}30`}}>
      <div style={{height:big?10:8,background:`linear-gradient(90deg,${S.h},${S.soft},${S.h})`}}/>
      <div style={{padding:big?"28px 28px 0":"22px 22px 0",display:"flex",alignItems:"center",gap:big?20:16}}>
        <div style={{width:big?104:86,height:big?104:86,borderRadius:big?28:24,background:c.photo?"transparent":`linear-gradient(140deg,${S.h}33,${S.h}55)`,border:`1px solid ${S.h}40`,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",fontSize:big?56:46,flexShrink:0}}>
          {c.photo?<img src={c.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"🙂"}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:G.font,fontWeight:600,fontSize:big?11:10,color:S.deep,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>{t.helloMyNameIs}</div>
          <div style={{fontFamily:G.serif,fontWeight:600,fontSize:big?30:24,color:G.ink,lineHeight:1.1,letterSpacing:-.4,wordBreak:"break-word"}}>{c.name||"—"}</div>
          {c.age&&<div style={{fontFamily:G.font,fontWeight:500,fontSize:big?15:13,color:G.ink2,marginTop:3}}>{c.age} {t.yearsOld}</div>}
        </div>
      </div>
      <div style={{padding:big?"22px 28px 28px":"18px 22px 22px"}}>
        {c.condition&&(<>
          <div style={{fontFamily:G.font,fontWeight:600,fontSize:big?11:10,color:S.deep,letterSpacing:2,textTransform:"uppercase",marginTop:14,marginBottom:6}}>{t.aboutMe}</div>
          <div style={{fontFamily:G.serif,fontWeight:500,fontSize:big?18:16,color:G.ink,lineHeight:1.4,letterSpacing:-.1}}>{c.condition}</div>
        </>)}
        {c.triggers&&(<>
          <div style={{fontFamily:G.font,fontWeight:600,fontSize:big?11:10,color:S.deep,letterSpacing:2,textTransform:"uppercase",marginTop:18,marginBottom:6}}>{t.myTriggers}</div>
          <div style={{fontFamily:G.font,fontWeight:500,fontSize:big?16:14,color:G.ink,lineHeight:1.4,background:S.hll,borderRadius:big?14:12,padding:big?"12px 15px":"10px 13px",border:`1px solid ${S.hl}`}}>{c.triggers}</div>
        </>)}
        {c.helpful&&(<>
          <div style={{fontFamily:G.font,fontWeight:600,fontSize:big?11:10,color:S.deep,letterSpacing:2,textTransform:"uppercase",marginTop:14,marginBottom:6}}>{t.whatHelps}</div>
          <div style={{fontFamily:G.font,fontWeight:500,fontSize:big?16:14,color:G.ink,lineHeight:1.4,background:SCREENS.emotion.hll,borderRadius:big?14:12,padding:big?"12px 15px":"10px 13px",border:`1px solid ${SCREENS.emotion.hl}`}}>{c.helpful}</div>
        </>)}
        {contacts.filter(k=>k.name&&k.phone).length>0&&(<>
          <div style={{fontFamily:G.font,fontWeight:600,fontSize:big?11:10,color:S.deep,letterSpacing:2,textTransform:"uppercase",marginTop:18,marginBottom:8}}>{t.emergencyContacts}</div>
          <div style={{display:"flex",flexDirection:"column",gap:big?10:8}}>
            {contacts.filter(k=>k.name&&k.phone).map(k=>(
              <a key={k.id} href={`tel:${k.phone.replace(/\s/g,"")}`} style={{textDecoration:"none",display:"flex",alignItems:"center",gap:12,padding:big?"15px 16px":"13px 14px",borderRadius:big?16:14,background:`linear-gradient(135deg,${S.h}EE,${S.h}DC)`,boxShadow:sh.c(S.h),color:"#fff"}}>
                <div style={{width:big?44:38,height:big?44:38,borderRadius:"50%",background:"rgba(255,255,255,0.22)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width={big?22:18} height={big?22:18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 16.92 v3 a2 2 0 0 1 -2.18 2 a19.79 19.79 0 0 1 -8.63 -3.07 a19.5 19.5 0 0 1 -6 -6 a19.79 19.79 0 0 1 -3.07 -8.67 A2 2 0 0 1 4.11 2 h3 a2 2 0 0 1 2 1.72 a12.84 12.84 0 0 0 0.7 2.81 a2 2 0 0 1 -0.45 2.11 L8.09 9.91 a16 16 0 0 0 6 6 l1.27 -1.27 a2 2 0 0 1 2.11 -0.45 a12.84 12.84 0 0 0 2.81 0.7 A2 2 0 0 1 22 16.92 z"/>
                  </svg>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:G.serif,fontWeight:600,fontSize:big?17:15,letterSpacing:-.1}}>{k.name}{k.relation?` · ${k.relation}`:""}</div>
                  <div style={{fontFamily:G.font,fontWeight:500,fontSize:big?15:13,opacity:.92,marginTop:2,fontVariantNumeric:"tabular-nums"}}>{k.phone}</div>
                </div>
                <span style={{fontSize:big?22:18,opacity:.8}}>›</span>
              </a>
            ))}
          </div>
        </>)}
      </div>
      <div style={{height:big?6:5,background:`linear-gradient(90deg,${S.h},${S.soft},${S.h})`,opacity:.6}}/>
    </div>
  );

  // Show mode — fullscreen, no chrome, optimised for handing phone to a stranger
  if(showMode){
    return(
      <div style={{position:"fixed",inset:0,zIndex:9000,background:"#FFFFFF",backgroundImage:`linear-gradient(165deg,${S.hb} 0%,#FFFFFF 100%)`,display:"flex",flexDirection:"column",padding:"20px 16px",animation:"ftIn .25s ease",overflowY:"auto"}}>
        <button onClick={()=>setShowMode(false)} style={{position:"absolute",top:18,right:18,width:42,height:42,borderRadius:21,border:`1px solid ${G.border}`,background:G.white,color:G.ink2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:sh.sm,zIndex:2}}><IconX size={14}/></button>
        <div style={{maxWidth:440,margin:"32px auto 24px",width:"100%"}}><Card big/></div>
      </div>
    );
  }

  return(
    <div style={{flex:1,overflowY:"auto",background:S.hb}}>
      {showEdit&&<IdCardEditor cfg={cfg} setCfg={setCfg} onClose={()=>setShowEdit(false)} t={t}/>}
      <div style={{padding:"22px 18px 120px"}}>
        {isEditor&&(
          <button onClick={()=>setShowEdit(true)} className="lt-press-soft" style={{width:"100%",padding:"13px 0",borderRadius:14,border:`1px solid ${S.h}`,background:S.hl,color:S.deep,fontFamily:G.font,fontWeight:700,fontSize:14,cursor:"pointer",marginBottom:16,display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4 H4 a2 2 0 0 0 -2 2 v14 a2 2 0 0 0 2 2 h14 a2 2 0 0 0 2 -2 v-7"/>
              <path d="M18.5 2.5 a2.121 2.121 0 0 1 3 3 L12 15 l-4 1 1 -4 z"/>
            </svg>
            <span>{t.editCard}</span>
          </button>
        )}
        {isEmpty&&!isEditor?(
          <div style={{textAlign:"center",padding:"60px 24px"}}>
            <div style={{fontSize:64,marginBottom:18}}>🪪</div>
            <div style={{fontFamily:G.serif,fontWeight:500,fontSize:23,color:G.ink,letterSpacing:-.4,marginBottom:10,lineHeight:1.15}}>{t.emptyCardTitle}</div>
            <div style={{fontFamily:G.font,fontSize:14,color:G.ink2,lineHeight:1.5,maxWidth:300,margin:"0 auto"}}>{t.emptyCardDesc}</div>
          </div>
        ):isEmpty&&isEditor?(
          <div style={{textAlign:"center",padding:"40px 24px",background:G.white,borderRadius:24,border:`1px dashed ${S.h}66`}}>
            <div style={{fontSize:48,marginBottom:14}}>🪪</div>
            <div style={{fontFamily:G.serif,fontWeight:600,fontSize:18,color:G.ink,marginBottom:6}}>{t.createCardTitle}</div>
            <div style={{fontFamily:G.font,fontSize:13,color:G.ink2,lineHeight:1.5,marginBottom:18,maxWidth:300,margin:"0 auto 18px"}}>{t.createCardDesc}</div>
            <button onClick={()=>setShowEdit(true)} style={{padding:"13px 28px",borderRadius:14,border:"none",background:S.h,color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:14,cursor:"pointer",boxShadow:sh.c(S.h)}}>+ {t.editCard}</button>
          </div>
        ):(<>
          <div style={{fontFamily:G.font,fontWeight:500,fontSize:11,color:G.ink3,letterSpacing:1,textTransform:"uppercase",textAlign:"center",marginBottom:10}}>{t.idHint}</div>
          <Card/>
          {!isEditor&&(
            <button onClick={()=>setShowMode(true)} style={{width:"100%",padding:"15px 0",borderRadius:16,border:"none",background:`linear-gradient(135deg,${S.h},${S.h}DC)`,color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:15,cursor:"pointer",boxShadow:sh.c(S.h),marginTop:18,letterSpacing:.3}}>⤢ {t.showLarge}</button>
          )}
        </>)}
      </div>
    </div>
  );
}

/* ═══ Identity card editor ═══ */
function IdCardEditor({cfg,setCfg,onClose,t}){
  const S=SCREENS.idcard;
  const init=cfg.idCard||{};
  const[c,setC]=useState({name:init.name||"",photo:init.photo||null,age:init.age||"",condition:init.condition||"",triggers:init.triggers||"",helpful:init.helpful||"",contacts:init.contacts?init.contacts.map(k=>({...k})):[]});
  const fileRef=useRef(null);
  const onPhoto=e=>{
    const f=e.target.files?.[0]; if(!f) return;
    const r=new FileReader();
    r.onload=()=>{
      const img=new Image();
      img.onload=()=>{
        const max=400, scale=Math.min(1,max/Math.max(img.width,img.height));
        const w=img.width*scale, h=img.height*scale;
        const cv=document.createElement("canvas");
        cv.width=w; cv.height=h;
        cv.getContext("2d").drawImage(img,0,0,w,h);
        setC(x=>({...x,photo:cv.toDataURL("image/jpeg",0.82)}));
      };
      img.src=r.result;
    };
    r.readAsDataURL(f);
  };
  const addContact=()=>setC(x=>({...x,contacts:[...x.contacts,{id:"k"+Date.now()+Math.random(),name:"",phone:"",relation:""}]}));
  const updC=(id,field,val)=>setC(x=>({...x,contacts:x.contacts.map(k=>k.id===id?{...k,[field]:val}:k)}));
  const rmC=id=>setC(x=>({...x,contacts:x.contacts.filter(k=>k.id!==id)}));
  const doSave=()=>{setCfg(x=>({...x,idCard:c}));onClose();};
  return(
    <Overlay onClose={onClose}>
      <Sheet scroll>
        <div style={{fontFamily:G.serif,fontWeight:500,fontSize:26,color:G.inkSoft,marginBottom:28,letterSpacing:-.5,lineHeight:1.05}}>{t.editCard}</div>
        <div style={{display:"flex",gap:14,marginBottom:18,alignItems:"center"}}>
          <div style={{width:78,height:78,borderRadius:22,background:c.photo?"transparent":S.hll,border:`1px solid ${G.border}`,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,flexShrink:0}}>
            {c.photo?<img src={c.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"🙂"}
          </div>
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:7}}>
            <input ref={fileRef} type="file" accept="image/*" onChange={onPhoto} style={{display:"none"}}/>
            <button onClick={()=>fileRef.current?.click()} style={{padding:"10px 14px",borderRadius:11,border:`1px solid ${S.h}`,background:S.hl,color:S.deep,fontFamily:G.font,fontWeight:600,fontSize:13,cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:7}}><IconCamera size={14}/> {t.uploadPhoto}</button>
            {c.photo&&<button onClick={()=>setC(x=>({...x,photo:null}))} style={{padding:"8px 12px",borderRadius:11,border:`1px solid ${G.border}`,background:G.white,color:G.ink2,fontFamily:G.font,fontWeight:600,fontSize:12,cursor:"pointer"}}>↺ Ta bort</button>}
          </div>
        </div>
        <SLabel>{t.myName}</SLabel>
        <input value={c.name} onChange={e=>setC(x=>({...x,name:e.target.value}))} className="lt-input" style={INP} placeholder="t.ex. Elin Andersson"/>
        <SLabel>{t.myAge}</SLabel>
        <input value={c.age} onChange={e=>setC(x=>({...x,age:e.target.value}))} className="lt-input" style={INP} placeholder="t.ex. 9" inputMode="numeric"/>
        <SLabel>{t.aboutMe}</SLabel>
        <textarea value={c.condition} onChange={e=>setC(x=>({...x,condition:e.target.value}))} className="lt-input" style={{...INP,minHeight:64,resize:"vertical"}} placeholder="t.ex. Jag har autism och kan behöva extra tid"/>
        <SLabel>{t.myTriggers}</SLabel>
        <textarea value={c.triggers} onChange={e=>setC(x=>({...x,triggers:e.target.value}))} className="lt-input" style={{...INP,minHeight:64,resize:"vertical"}} placeholder="t.ex. Höga ljud, mycket folk"/>
        <SLabel>{t.whatHelps}</SLabel>
        <textarea value={c.helpful} onChange={e=>setC(x=>({...x,helpful:e.target.value}))} className="lt-input" style={{...INP,minHeight:64,resize:"vertical"}} placeholder="t.ex. Lugn röst, tid att tänka"/>
        <SLabel>{t.emergencyContacts}</SLabel>
        {c.contacts.map(k=>(
          <div key={k.id} style={{background:S.hll,borderRadius:14,padding:13,marginBottom:10,border:`1px solid ${S.hl}`}}>
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              <input value={k.name} onChange={e=>updC(k.id,"name",e.target.value)} className="lt-input" style={{...INP,marginBottom:0,flex:1}} placeholder={t.contactName}/>
              <button onClick={()=>rmC(k.id)} aria-label="Ta bort" style={{padding:"0 13px",borderRadius:12,border:"none",background:"#FEF2F2",color:"#EF4444",cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center"}}><IconX size={13}/></button>
            </div>
            <input value={k.phone} onChange={e=>updC(k.id,"phone",e.target.value)} className="lt-input" style={{...INP,marginBottom:8}} placeholder={t.contactPhone} inputMode="tel"/>
            <input value={k.relation} onChange={e=>updC(k.id,"relation",e.target.value)} className="lt-input" style={{...INP,marginBottom:0}} placeholder={t.contactRelation+" (t.ex. Mamma)"}/>
          </div>
        ))}
        <button onClick={addContact} style={{width:"100%",padding:"12px 0",borderRadius:13,border:`1.5px dashed ${S.h}66`,background:G.white,color:S.deep,fontFamily:G.font,fontWeight:700,fontSize:14,cursor:"pointer",marginBottom:22}}>{t.addContact}</button>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onClose} style={{flex:1,...GHOST}}>{t.cancel}</button>
          <button onClick={doSave} className="lt-press saveBtn" style={{flex:2,padding:"15px 0",borderRadius:14,border:"none",background:S.h,color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:15,cursor:"pointer",boxShadow:sh.c(S.h),display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <svg className="saveTick" width="15" height="15" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
              <path d="M2.5 7.2 L5.8 10.5 L11.5 3.5"/>
            </svg>
            {t.save}
          </button>
        </div>
      </Sheet>
    </Overlay>
  );
}


/* ═══════════════════════════════════════════════════
   SUPERVISOR DEMO (web editor for caregivers)
═══════════════════════════════════════════════════ */

// Fake clients for demo
const DEMO_CLIENTS=[
  {id:"c1",name:"Anna Berg",age:8,emoji:"🌸",color:"#E89B89",org:"Habiliteringen Stockholm",lastEdit:"För 2 timmar sedan",lastEditEn:"2 hours ago",activitiesCount:6,storiesCount:4,note:"Behöver visuell struktur. Reagerar starkt på höga ljud.",noteEn:"Needs visual structure. Reacts strongly to loud sounds."},
  {id:"c2",name:"Marcus Lindgren",age:12,emoji:"🦊",color:"#8AAFD2",org:"Habiliteringen Stockholm",lastEdit:"Igår",lastEditEn:"Yesterday",activitiesCount:8,storiesCount:6,note:"Använder appen själv. Föräldrar uppdaterar kvällsrutiner.",noteEn:"Uses the app independently. Parents update evening routines."},
  {id:"c3",name:"Sofia Eriksson",age:16,emoji:"🌿",color:"#A8C9B0",org:"Habiliteringen Stockholm",lastEdit:"För 3 dagar sedan",lastEditEn:"3 days ago",activitiesCount:4,storiesCount:2,note:"Övergångsstöd inför vuxenliv. Fokus på självständighet.",noteEn:"Transition support before adult life. Focus on independence."},
];

function SupervisorDemo({onClose,onOpenClient,lang}){
  const[stage,setStage]=useState("login"); // login | dashboard
  const[email,setEmail]=useState("");
  const[pwd,setPwd]=useState("");
  const[showHint,setShowHint]=useState(false);
  const S=SCREENS.home;

  const doLogin=()=>{
    // Demo accepts anything — but show a tiny delay for realism
    setTimeout(()=>setStage("dashboard"),350);
  };

  return(
    <div style={{position:"fixed",inset:0,zIndex:9700,background:"linear-gradient(165deg,#F0F4F8 0%,#FFFFFF 60%,#F4F0F8 100%)",display:"flex",flexDirection:"column",overflow:"auto"}}>
      <style>{`@keyframes svIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}@keyframes svFade{from{opacity:0}to{opacity:1}}`}</style>

      {/* Top bar */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 28px",borderBottom:`1px solid ${G.border}`,background:G.white,boxShadow:sh.xs,position:"sticky",top:0,zIndex:5}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <svg width={28} height={28} viewBox="0 0 26 26" style={{overflow:"visible"}}>
            <defs>
              <radialGradient id="svCoreV2" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#FFFFFF"/>
                <stop offset="20%" stopColor="#FFFAF0" stopOpacity="0.95"/>
                <stop offset="55%" stopColor={S.h}/>
                <stop offset="100%" stopColor={S.deep}/>
              </radialGradient>
              <radialGradient id="svOuterV2" cx="50%" cy="50%" r="50%">
                <stop offset="40%" stopColor={S.h} stopOpacity="0"/>
                <stop offset="70%" stopColor={S.h} stopOpacity="0.18"/>
                <stop offset="100%" stopColor={S.h} stopOpacity="0"/>
              </radialGradient>
            </defs>
            <circle cx="13" cy="13" r="13" fill="url(#svOuterV2)"/>
            <g style={{transformOrigin:"13px 13px",animation:"lumaRotate 22s linear infinite"}}>
              {Array.from({length:8}).map((_,i)=>{
                const ang=(i/8)*2*Math.PI;
                const isLong=i%2===0;
                const r1=8.5, r2=isLong?12.2:11;
                const x1=13+r1*Math.sin(ang), y1=13-r1*Math.cos(ang);
                const x2=13+r2*Math.sin(ang), y2=13-r2*Math.cos(ang);
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={S.h} strokeWidth={isLong?1.6:1.1} strokeLinecap="round"/>;
              })}
            </g>
            <g style={{transformOrigin:"13px 13px",animation:"lumaCoreBreath 3.4s ease-in-out infinite"}}>
              <circle cx="13" cy="13" r="6.5" fill="url(#svCoreV2)"/>
              <circle cx="11" cy="11" r="1.5" fill="#FFFFFF" opacity="0.7"/>
            </g>
          </svg>
          <span style={{fontFamily:G.serif,fontWeight:600,fontSize:17,color:G.ink,letterSpacing:0.3}}>Luma</span>
          <span style={{fontFamily:G.font,fontWeight:600,fontSize:10,color:S.deep,background:S.hl,borderRadius:6,padding:"3px 8px",letterSpacing:1.2,textTransform:"uppercase"}}>{lang==="sv"?"Stödperson":"Caregiver"}</span>
          <span style={{fontFamily:G.font,fontWeight:600,fontSize:9,color:G.ink3,background:"#FEF3C7",border:"1px solid #FCD34D40",borderRadius:6,padding:"3px 8px",letterSpacing:1.2,textTransform:"uppercase"}}>Demo</span>
        </div>
        <button onClick={onClose} style={{width:38,height:38,borderRadius:19,border:`1px solid ${G.border}`,background:G.white,color:G.ink2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:sh.xs}}><IconX size={14}/></button>
      </div>

      {stage==="login"&&(
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:32,animation:"svFade .35s ease"}}>
          <div style={{maxWidth:380,width:"100%",background:G.white,borderRadius:24,padding:"32px 28px",boxShadow:"0 18px 50px rgba(31,27,46,0.10)",border:`1px solid ${G.border}`}}>
            <div style={{fontFamily:G.serif,fontWeight:600,fontSize:22,color:G.ink,marginBottom:6,letterSpacing:-.3}}>{lang==="sv"?"Logga in":"Sign in"}</div>
            <div style={{fontFamily:G.font,fontSize:13,color:G.ink2,marginBottom:24,lineHeight:1.5}}>{lang==="sv"?"Hantera dina klienters scheman, berättelser och verktyg. Ändringar synkas direkt till deras enheter.":"Manage your clients' schedules, stories and tools. Changes sync directly to their devices."}</div>

            <SLabel>{lang==="sv"?"E-post":"Email"}</SLabel>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="namn@habilitering.se" className="lt-input" style={INP}/>
            <SLabel>{lang==="sv"?"Lösenord":"Password"}</SLabel>
            <input type="password" value={pwd} onChange={e=>setPwd(e.target.value)} placeholder="••••••••" className="lt-input" style={INP}/>

            <button onClick={doLogin} style={{width:"100%",padding:"14px 0",borderRadius:14,border:"none",background:`linear-gradient(135deg,${S.h},${S.deep})`,color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:15,cursor:"pointer",boxShadow:sh.c(S.h),marginTop:8,marginBottom:14}}>{lang==="sv"?"Logga in":"Sign in"}</button>

            <button onClick={()=>setShowHint(s=>!s)} style={{width:"100%",padding:"10px 0",borderRadius:11,border:`1px dashed ${G.border2}`,background:"transparent",color:G.ink3,fontFamily:G.font,fontWeight:600,fontSize:12,cursor:"pointer"}}>{showHint?(lang==="sv"?"Dölj":"Hide"):(lang==="sv"?"Hur funkar demon?":"How does the demo work?")}</button>
            {showHint&&(
              <div style={{marginTop:14,padding:"12px 14px",background:S.hb,borderRadius:12,fontFamily:G.font,fontSize:12,color:G.ink2,lineHeight:1.55,border:`1px solid ${G.border}`}}>
                {lang==="sv"?"Detta är en visuell demo av hur stödpersonsvyn skulle fungera. Skriv vad du vill i fälten — vilket login som helst släpps in. I skarpt läge skulle pedagoger ha riktiga konton med säker inloggning, och ändringar synkas mot klienternas appar i realtid.":"This is a visual demo of the caregiver view. Type anything in the fields — any login is accepted. In production, caregivers would have real accounts with secure sign-in, and changes sync to clients' apps in real time."}
              </div>
            )}
          </div>
        </div>
      )}

      {stage==="dashboard"&&(
        <div style={{flex:1,padding:"32px 24px 60px",animation:"svFade .35s ease",maxWidth:780,width:"100%",margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:12}}>
            <div>
              <div style={{fontFamily:G.serif,fontWeight:600,fontSize:24,color:G.ink,letterSpacing:-.4,marginBottom:4}}>{lang==="sv"?"Mina klienter":"My clients"}</div>
              <div style={{fontFamily:G.font,fontSize:13,color:G.ink2}}>{DEMO_CLIENTS.length} {lang==="sv"?"aktiva":"active"} · {lang==="sv"?"Habiliteringen Stockholm":"Habilitering Stockholm"}</div>
            </div>
            <button style={{padding:"10px 16px",borderRadius:12,border:`1px solid ${S.h}`,background:S.hl,color:S.deep,fontFamily:G.font,fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
              <span>+</span> {lang==="sv"?"Lägg till klient":"Add client"}
            </button>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
            {DEMO_CLIENTS.map((c,i)=>(
              <div key={c.id} onClick={()=>onOpenClient(c)} className="lt-press-soft" style={{background:G.white,borderRadius:20,padding:"20px 18px",boxShadow:`0 10px 28px ${c.color}1A`,border:`1px solid ${c.color}25`,cursor:"pointer",transition:"transform .26s cubic-bezier(0.32, 0.72, 0, 1),box-shadow .2s ease",animation:`svIn .35s ease ${i*0.06}s both`}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 14px 36px ${c.color}26`;}}
                onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=`0 10px 28px ${c.color}1A`;}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                  <div style={{width:52,height:52,borderRadius:16,background:`linear-gradient(140deg,${c.color}1F,${c.color}40)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,border:`1px solid ${c.color}25`}}>{c.emoji}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:G.serif,fontWeight:600,fontSize:17,color:G.ink,letterSpacing:-.2,lineHeight:1.2}}>{c.name}</div>
                    <div style={{fontFamily:G.font,fontSize:11,color:c.color,fontWeight:600,marginTop:3,letterSpacing:.3}}>{c.age} {lang==="sv"?"år":"years"}</div>
                  </div>
                </div>
                <div style={{fontFamily:G.font,fontSize:12,color:G.ink2,lineHeight:1.45,marginBottom:14,minHeight:34}}>{lang==="sv"?c.note:c.noteEn}</div>
                <div style={{display:"flex",gap:14,paddingTop:12,borderTop:`1px solid ${G.border}`,fontFamily:G.font,fontSize:11,color:G.ink3}}>
                  <span>📅 {c.activitiesCount} {lang==="sv"?"akt.":"act."}</span>
                  <span>📖 {c.storiesCount}</span>
                  <span style={{marginLeft:"auto",color:G.ink3}}>{lang==="sv"?c.lastEdit:c.lastEditEn}</span>
                </div>
              </div>
            ))}

            {/* "Add client" placeholder card */}
            <div style={{borderRadius:20,padding:"32px 18px",border:`1.5px dashed ${G.border2}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,minHeight:180,cursor:"pointer",color:G.ink3,fontFamily:G.font,fontWeight:600,fontSize:13,animation:`svIn .35s ease ${DEMO_CLIENTS.length*0.06}s both`}}>
              <div style={{width:46,height:46,borderRadius:14,background:S.hl,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,color:S.h}}>+</div>
              {lang==="sv"?"Ny klient":"New client"}
            </div>
          </div>

          {/* Demo note */}
          <div style={{marginTop:32,padding:"14px 18px",background:"#FEF3C7",borderRadius:14,border:"1px solid #FCD34D40",fontFamily:G.font,fontSize:12,color:"#92400E",lineHeight:1.55,display:"flex",alignItems:"flex-start",gap:10}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:1}} aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{lang==="sv"?"Detta är en demo. I skarpt läge synkas alla ändringar direkt till klientens enhet. Klicka på en klient för att öppna deras app — du redigerar samma data som klienten ser.":"This is a demo. In production, all changes sync directly to the client's device. Click a client to open their app — you'll edit the same data the client sees."}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   ACTIVITY START ALERT — notification when activity begins
═══════════════════════════════════════════════════ */
function ActivityStartAlert({activity,onDismiss,onOpen,t,lang}){
  return(
    <div onClick={onDismiss} style={{position:"fixed",inset:0,zIndex:99000,background:"rgba(31,27,46,0.45)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:24,animation:"asaBackdrop 0.35s ease both"}}>
      <style>{`
        @keyframes asaBackdrop{from{opacity:0}to{opacity:1}}
        @keyframes asaPop{0%{opacity:0;transform:scale(0.7) translateY(20px)}55%{opacity:1;transform:scale(1.04) translateY(0)}80%{transform:scale(0.98)}100%{transform:scale(1)}}
        @keyframes asaEmojiPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
        @keyframes asaRingPulse{0%{box-shadow:0 0 0 0 ${activity.color}55,0 16px 40px ${activity.color}30}70%{box-shadow:0 0 0 22px ${activity.color}00,0 16px 40px ${activity.color}30}100%{box-shadow:0 0 0 0 ${activity.color}00,0 16px 40px ${activity.color}30}}
      `}</style>
      <div onClick={e=>e.stopPropagation()} style={{background:G.white,borderRadius:30,padding:"28px 28px 22px",maxWidth:380,width:"100%",textAlign:"center",boxShadow:"0 30px 70px rgba(31,27,46,0.22), 0 4px 12px rgba(31,27,46,0.08)",border:`1px solid ${G.border}`,animation:"asaPop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both"}}>
        <div style={{width:96,height:96,margin:"0 auto 18px",borderRadius:"50%",background:`linear-gradient(140deg, ${activity.color}30, ${activity.color}55)`,border:`2px solid ${activity.color}45`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:48,boxShadow:`inset 0 1px 0 rgba(255,255,255,0.7)`,animation:"asaRingPulse 2.2s ease-out infinite, asaEmojiPulse 2.6s ease-in-out infinite"}}>{activity.emoji}</div>
        <div style={{fontFamily:G.font,fontSize:11,color:G.ink3,letterSpacing:1.4,textTransform:"uppercase",fontWeight:600,marginBottom:6}}>{lang==="sv"?"Det är dags":"It's time"}</div>
        <div style={{fontFamily:G.serif,fontSize:26,fontWeight:600,color:G.ink,letterSpacing:-0.3,lineHeight:1.15,marginBottom:6}}>{activity.name}</div>
        <div style={{fontFamily:G.font,fontSize:14,fontWeight:600,color:activity.color,letterSpacing:0.3,marginBottom:22}}>{fmtT(activity.time,lang)}</div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onOpen} className="lt-press" style={{flex:1,padding:"14px 0",borderRadius:14,border:`1px solid ${G.border}`,background:G.cream,color:G.ink2,fontFamily:G.font,fontWeight:700,fontSize:14,cursor:"pointer"}}>{lang==="sv"?"Visa":"Show"}</button>
          <button onClick={onDismiss} className="lt-press" style={{flex:1.5,padding:"14px 0",borderRadius:14,border:"none",background:`linear-gradient(135deg, ${activity.color}, ${activity.color}DC)`,color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:14,cursor:"pointer",boxShadow:`0 8px 18px ${activity.color}55`}}>OK</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   DEMO TOUR — cinematic auto-play walkthrough
═══════════════════════════════════════════════════ */

function SceneIntro(){
  // Real Luma sun — same as the one in the app header, scaled up for hero presence.
  // Rotating rays + breathing core + outer glow + highlight dot.
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:28,padding:"40px 32px"}}>
      <style>{`
        @keyframes dILogoIn{0%{opacity:0;transform:scale(0.88)}100%{opacity:1;transform:scale(1)}}
        @keyframes dILumaRotate{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes dILumaCoreBreath{0%,100%{transform:scale(1);filter:brightness(1)}50%{transform:scale(1.05);filter:brightness(1.10)}}
        @keyframes dIRayFadeA{0%,100%{opacity:0.75}50%{opacity:0.45}}
        @keyframes dIRayFadeB{0%,100%{opacity:0.45}50%{opacity:0.8}}
        @keyframes dIWordmark{0%{opacity:0;letter-spacing:6px}100%{opacity:1;letter-spacing:2px}}
        @keyframes dIDot{0%,100%{opacity:0.6;transform:scale(1)}50%{opacity:1;transform:scale(1.4)}}
      `}</style>
      <div style={{width:140,height:140,position:"relative",animation:"dILogoIn 1.2s cubic-bezier(0.22,1,0.36,1) both"}}>
        <svg width={140} height={140} viewBox="0 0 26 26" style={{overflow:"visible"}}>
          <defs>
            <radialGradient id="dILumaCore" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF"/>
              <stop offset="20%" stopColor="#FFFAF0" stopOpacity="0.95"/>
              <stop offset="55%" stopColor="#E8A878"/>
              <stop offset="100%" stopColor="#C97548"/>
            </radialGradient>
            <radialGradient id="dILumaOuterGlow" cx="50%" cy="50%" r="50%">
              <stop offset="40%" stopColor="#E8A878" stopOpacity="0"/>
              <stop offset="70%" stopColor="#E8A878" stopOpacity="0.20"/>
              <stop offset="100%" stopColor="#E8A878" stopOpacity="0"/>
            </radialGradient>
          </defs>
          {/* Outer soft glow */}
          <circle cx="13" cy="13" r="13" fill="url(#dILumaOuterGlow)"/>
          {/* Rotating ray group — 8 rays, alternating long/short, same as header */}
          <g style={{transformOrigin:"13px 13px",animation:"dILumaRotate 22s linear infinite"}}>
            {Array.from({length:8}).map((_,i)=>{
              const ang=(i/8)*2*Math.PI;
              const isLong=i%2===0;
              const r1=8.5, r2=isLong?12.2:11;
              const x1=13+r1*Math.sin(ang), y1=13-r1*Math.cos(ang);
              const x2=13+r2*Math.sin(ang), y2=13-r2*Math.cos(ang);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#E8A878" strokeWidth={isLong?1.6:1.1} strokeLinecap="round" style={{animation:`${i%2===0?"dIRayFadeA":"dIRayFadeB"} ${3+i*0.18}s ease-in-out infinite`}}/>;
            })}
          </g>
          {/* Core orb with breath + highlight */}
          <g style={{transformOrigin:"13px 13px",animation:"dILumaCoreBreath 3.4s ease-in-out infinite"}}>
            <circle cx="13" cy="13" r="6.5" fill="url(#dILumaCore)"/>
            <circle cx="11" cy="11" r="1.5" fill="#FFFFFF" opacity="0.7"/>
          </g>
        </svg>
      </div>
      <div style={{fontFamily:'Georgia, serif',fontSize:52,fontWeight:500,color:"#1F1B2E",letterSpacing:2,animation:"dIWordmark 1.4s 0.4s cubic-bezier(0.22,1,0.36,1) both"}}>Luma</div>
      <div style={{width:5,height:5,borderRadius:"50%",background:"#E8A878",animation:"dIDot 2.5s 1.2s ease-in-out infinite"}}/>
    </div>
  );
}

function SceneSchedule(){
  // Schedule view — Sigvard lamps + a clean stack of activity cards
  return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",width:"100%",padding:"0 28px",boxSizing:"border-box"}}>
      <style>{`
        @keyframes dSchCardIn{0%{opacity:0;transform:translateY(14px)}100%{opacity:1;transform:translateY(0)}}
        @keyframes dSchLampOn{0%{opacity:0;transform:scale(0.5)}100%{opacity:1;transform:scale(1)}}
        @keyframes dSchPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.18);opacity:0.85}}
      `}</style>
      <div style={{display:"flex",gap:14,alignItems:"stretch",width:"100%",maxWidth:340}}>
        {/* Sigvard column */}
        <div style={{width:14,flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:8,paddingTop:8,paddingBottom:8}}>
          {[
            {dim:true,delay:0.05},{dim:true,delay:0.1},{dim:true,delay:0.15},
            {pulse:true,delay:0.2},
            {delay:0.35},{delay:0.45},{delay:0.55},{delay:0.65},{delay:0.75},
          ].map((l,i)=>(
            <div key={i} style={{
              width:8,height:8,borderRadius:"50%",
              background:l.dim?"rgba(31,27,46,0.20)":"#E89B89",
              boxShadow:!l.dim?"0 0 8px rgba(232,155,137,0.55)":"none",
              animation:`dSchLampOn 0.4s ${l.delay}s ease-out both${l.pulse?", dSchPulse 2.2s "+(l.delay+0.6)+"s ease-in-out infinite":""}`,
            }}/>
          ))}
        </div>
        {/* Cards */}
        <div style={{flex:1,display:"flex",flexDirection:"column",gap:10}}>
          {[
            {emoji:"🥣",name:"Frukost",time:"07:30",color:"#E89B89",done:true,delay:0.2},
            {emoji:"📚",name:"Läxor",time:"NU",color:"#E89B89",now:true,delay:0.4},
            {emoji:"🚶",name:"Promenad",time:"14:00",color:"#8FBFA1",delay:0.6},
            {emoji:"📖",name:"Läsa",time:"17:00",color:"#8AAFD2",delay:0.8},
          ].map((c,i)=>(
            <div key={i} style={{
              background:"#FFFFFF",
              borderRadius:13,
              padding:c.now?"13px 14px":"11px 14px",
              border:c.now?`1.5px solid ${c.color}`:`1px solid ${c.color}25`,
              display:"flex",alignItems:"center",gap:11,
              boxShadow:c.now?`0 8px 22px ${c.color}24`:`0 2px 8px ${c.color}10`,
              opacity:c.done?0.55:1,
              animation:`dSchCardIn 0.55s ${c.delay}s cubic-bezier(0.22,1,0.36,1) both`,
              position:"relative",
            }}>
              <div style={{width:c.now?34:30,height:c.now?34:30,borderRadius:9,background:`linear-gradient(140deg,${c.color}30,${c.color}55)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:c.now?17:15}}>{c.emoji}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:'Georgia, serif',fontWeight:600,fontSize:c.now?14:13,color:"#1F1B2E",letterSpacing:-0.2,textDecoration:c.done?"line-through":"none",textDecorationColor:"rgba(31,27,46,0.3)"}}>{c.name}</div>
                <div style={{fontFamily:"-apple-system, sans-serif",fontSize:c.now?10:9.5,color:c.now?c.color:"#9892AA",marginTop:2,letterSpacing:c.now?0.8:0.2,textTransform:c.now?"uppercase":"none",fontWeight:c.now?700:500,fontVariantNumeric:"tabular-nums"}}>{c.time}</div>
              </div>
              {c.now&&<div style={{width:6,height:6,borderRadius:"50%",background:c.color,boxShadow:`0 0 6px ${c.color}`,animation:"dSchPulse 2s ease-in-out infinite"}}/>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SceneTimer(){
  // Three different timers shown in a playful, asymmetric arrangement — varied heights,
  // slight rotations, and gentle floating to feel alive instead of lined up.
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,padding:"0 14px",boxSizing:"border-box"}}>
      <style>{`
        @keyframes dTmIn{0%{opacity:0;transform:scale(0.88) translateY(14px)}100%{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes dTmFloat1{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-7px) rotate(-1deg)}}
        @keyframes dTmFloat2{0%,100%{transform:translateY(-4px) rotate(2deg)}50%{transform:translateY(3px) rotate(4deg)}}
        @keyframes dTmFloat3{0%,100%{transform:translateY(-2px) rotate(-2deg)}50%{transform:translateY(-9px) rotate(1deg)}}
        @keyframes dTmWaveShift{from{transform:translateX(0)}to{transform:translateX(-126px)}}
        @keyframes dTmBubble{0%{transform:translate3d(0,90px,0);opacity:0}10%{opacity:0.65}90%{opacity:0.65}100%{transform:translate3d(0,5px,0);opacity:0}}
        @keyframes dTmSunRays{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes dTmSunBreath{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
        @keyframes dTmSectorSweep{from{transform:rotate(-122deg)}to{transform:rotate(238deg)}}
      `}</style>
      {/* Asymmetric arrangement — staggered heights, varied rotations */}
      <div style={{display:"flex",gap:6,alignItems:"center",justifyContent:"center",width:"100%",minHeight:130,paddingTop:14,paddingBottom:14}}>

        {/* 1. SECTOR TIMER — sits lowest, tilted slightly back */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:7,marginTop:36,opacity:0,animation:"dTmIn 0.8s 0.0s cubic-bezier(0.32, 0.72, 0, 1) both"}}>
          <div style={{animation:"dTmFloat1 6.5s ease-in-out 0s infinite",willChange:"transform"}}>
            <div style={{position:"relative",width:88,height:88}}>
              <svg width={88} height={88} viewBox="0 0 96 96">
                <circle cx={48} cy={48} r={42} fill="#FFFFFF" stroke="rgba(31,27,46,0.10)" strokeWidth={1.5}/>
                {/* Tick marks */}
                {Array.from({length:12}).map((_,i)=>{
                  const a=(i/12)*2*Math.PI-Math.PI/2;
                  const r1=37, r2=41;
                  return <line key={i} x1={48+r1*Math.cos(a)} y1={48+r1*Math.sin(a)} x2={48+r2*Math.cos(a)} y2={48+r2*Math.sin(a)} stroke="rgba(31,27,46,0.22)" strokeWidth={1.1} strokeLinecap="round"/>;
                })}
                {/* Sweeping red sector */}
                <g style={{transformOrigin:"48px 48px",animation:"dTmSectorSweep 7s linear infinite"}}>
                  <path d="M48,48 L48,10 A38,38 0 0,1 80.9,29 Z" fill="#E89B89" opacity="0.85"/>
                </g>
                <circle cx={48} cy={48} r={3.2} fill="#1F1B2E"/>
              </svg>
            </div>
          </div>
          <div style={{fontFamily:"-apple-system, sans-serif",fontSize:9.5,fontWeight:600,color:"#9892AA",letterSpacing:0.5,textTransform:"uppercase"}}>Time Timer</div>
        </div>

        {/* 2. WAVE TIMER — sits highest, larger, hero position */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:7,marginTop:-28,opacity:0,animation:"dTmIn 0.8s 0.16s cubic-bezier(0.32, 0.72, 0, 1) both"}}>
          <div style={{animation:"dTmFloat2 7.5s ease-in-out 0s infinite",willChange:"transform"}}>
            <div style={{position:"relative",width:104,height:104,borderRadius:20,overflow:"hidden",background:"linear-gradient(180deg, rgba(138,175,210,0.06) 0%, rgba(138,175,210,0.18) 100%)",border:"1px solid rgba(138,175,210,0.28)",boxShadow:"0 10px 24px rgba(138,175,210,0.22)"}}>
              <svg width={104} height={104} style={{position:"absolute",inset:0,overflow:"hidden"}}>
                <defs>
                  <linearGradient id="dTmFill2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8AAFD2" stopOpacity="0.7"/>
                    <stop offset="100%" stopColor="#8AAFD2"/>
                  </linearGradient>
                  <radialGradient id="dTmBub2" cx="32%" cy="28%" r="68%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95"/>
                    <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.45"/>
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.15"/>
                  </radialGradient>
                </defs>
                {/* Water fill — wave path now spans -208 to 312 (5× container) so animation shift of -126
                    always leaves the visible 0-104 region covered. No more right-edge gap. */}
                <g style={{transform:"translateY(42px)"}}>
                  <g style={{animation:"dTmWaveShift 8s linear infinite"}}>
                    <path d={(()=>{const f=0.08;let d="M-208,0";for(let x=-208;x<=312;x+=2){const y=Math.sin(x*f)*5+Math.sin(x*f*2.4)*1.6;d+=` L${x},${y}`;}return d+" L312,160 L-208,160 Z";})()} fill="url(#dTmFill2)"/>
                  </g>
                </g>
                {/* Bubbles rising harmoniously */}
                {[16,42,68,90].map((x,i)=>{
                  const r=1.7+(i%3)*0.4;
                  const dur=6+(i%3)*0.8;
                  return(
                    <g key={i} transform={`translate(${x},0)`}>
                      <g style={{animation:`dTmBubble ${dur}s linear ${-i*1.4}s infinite`}}>
                        <circle cx={0} cy={0} r={r} fill="url(#dTmBub2)"/>
                        <circle cx={-r*0.32} cy={-r*0.38} r={r*0.22} fill="rgba(255,255,255,0.7)"/>
                      </g>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
          <div style={{fontFamily:"-apple-system, sans-serif",fontSize:9.5,fontWeight:600,color:"#9892AA",letterSpacing:0.5,textTransform:"uppercase"}}>Våg</div>
        </div>

        {/* 3. SUNSET TIMER — sits mid-height between the other two */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:7,marginTop:14,opacity:0,animation:"dTmIn 0.8s 0.32s cubic-bezier(0.32, 0.72, 0, 1) both"}}>
          <div style={{animation:"dTmFloat3 6s ease-in-out 0s infinite",willChange:"transform"}}>
            <div style={{position:"relative",width:88,height:88,borderRadius:18,overflow:"hidden",border:"1px solid rgba(31,27,46,0.08)",boxShadow:"0 6px 16px rgba(31,27,46,0.08)"}}>
              <svg width={88} height={88} viewBox="0 0 96 96">
                <defs>
                  <linearGradient id="dTmSky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(30, 50%, 88%)"/>
                    <stop offset="60%" stopColor="hsl(20, 55%, 82%)"/>
                    <stop offset="100%" stopColor="hsl(10, 50%, 76%)"/>
                  </linearGradient>
                  <radialGradient id="dTmSun" cx="42%" cy="38%" r="62%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95"/>
                    <stop offset="35%" stopColor="hsl(38, 70%, 92%)"/>
                    <stop offset="75%" stopColor="hsl(28, 62%, 80%)"/>
                    <stop offset="100%" stopColor="hsl(18, 55%, 68%)"/>
                  </radialGradient>
                  <linearGradient id="dTmWater" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(205, 58%, 62%)"/>
                    <stop offset="100%" stopColor="hsl(200, 52%, 48%)"/>
                  </linearGradient>
                </defs>
                <rect width={96} height={60} fill="url(#dTmSky)"/>
                <rect y={60} width={96} height={36} fill="url(#dTmWater)"/>
                {/* Rotating sun rays */}
                <g style={{transformOrigin:"48px 38px",animation:"dTmSunRays 60s linear infinite"}}>
                  {Array.from({length:8}).map((_,i)=>{
                    const a=(i/8)*Math.PI*2;
                    const r1=14, r2=20;
                    return <line key={i} x1={48+r1*Math.cos(a)} y1={38+r1*Math.sin(a)} x2={48+r2*Math.cos(a)} y2={38+r2*Math.sin(a)} stroke="hsl(28, 62%, 78%)" strokeWidth={1.4} strokeLinecap="round" opacity={0.7}/>;
                  })}
                </g>
                <g style={{transformOrigin:"48px 38px",animation:"dTmSunBreath 6s ease-in-out infinite"}}>
                  <circle cx={48} cy={38} r={11} fill="url(#dTmSun)"/>
                </g>
                <ellipse cx={48} cy={66} rx={9} ry={5} fill="hsl(28, 62%, 78%)" opacity={0.45}/>
                <line x1={0} y1={60} x2={96} y2={60} stroke="rgba(31,27,46,0.10)" strokeWidth={0.6}/>
              </svg>
            </div>
          </div>
          <div style={{fontFamily:"-apple-system, sans-serif",fontSize:9.5,fontWeight:600,color:"#9892AA",letterSpacing:0.5,textTransform:"uppercase"}}>Solnedgång</div>
        </div>

      </div>
    </div>
  );
}

function SceneChecklist(){
  // Checklist — simple stack of steps, two checked, one pending
  return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",width:"100%",padding:"0 28px",boxSizing:"border-box"}}>
      <style>{`
        @keyframes dChkRow{0%{opacity:0;transform:translateX(-8px)}100%{opacity:1;transform:translateX(0)}}
        @keyframes dChkBox{0%{transform:scale(0.85)}100%{transform:scale(1)}}
        @keyframes dChkDraw{from{stroke-dashoffset:30}to{stroke-dashoffset:0}}
      `}</style>
      <div style={{background:"#FFFFFF",borderRadius:18,padding:"22px 22px",boxShadow:"0 12px 32px rgba(31,27,46,0.06), 0 2px 6px rgba(31,27,46,0.04)",border:"1px solid rgba(31,27,46,0.06)",width:"100%",maxWidth:320}}>
        <div style={{fontFamily:'Georgia, serif',fontWeight:600,fontSize:16,color:"#1F1B2E",letterSpacing:-0.2,marginBottom:18,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:22}}>🦷</span>
          <span>Morgon</span>
        </div>
        {[
          {label:"Borsta tänder",done:true,delay:0.15},
          {label:"Tvätta ansiktet",done:true,delay:0.35},
          {label:"Kamma håret",done:false,delay:0.55},
        ].map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:13,padding:"10px 0",borderBottom:i<2?"1px solid rgba(31,27,46,0.06)":"none",animation:`dChkRow 0.5s ${s.delay}s cubic-bezier(0.22,1,0.36,1) both`}}>
            <div style={{
              width:24,height:24,borderRadius:7,
              background:s.done?"#8FBFA1":"#FFFFFF",
              border:s.done?"none":"1.5px solid rgba(31,27,46,0.18)",
              display:"flex",alignItems:"center",justifyContent:"center",
              transition:"all 0.3s ease",
              animation:s.done?`dChkBox 0.4s ${s.delay+0.2}s cubic-bezier(0.34, 1.56, 0.64, 1) both`:"none",
            }}>
              {s.done&&(
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <path d="M5,12 L10,17 L19,7" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={30} style={{animation:`dChkDraw 0.4s ${s.delay+0.3}s cubic-bezier(0.22,1,0.36,1) forwards`}}/>
                </svg>
              )}
            </div>
            <span style={{fontFamily:"-apple-system, sans-serif",fontSize:14,fontWeight:500,color:s.done?"#9892AA":"#1F1B2E",textDecoration:s.done?"line-through":"none",textDecorationColor:"rgba(152,146,170,0.6)",letterSpacing:0.1,flex:1}}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SceneEmotion(){
  // Emotion picker — selection HOPS in a randomised order to feel playful and alive.
  // Sequence: 😢 → 😊 → 😡 → 😌 → 😟 → 😊 → 😢 → 😡 (cycles in 10s, never predictable left-to-right).
  // Each emotion has its own keyframe with active windows at different times in the cycle.
  return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",width:"100%",padding:"0 28px",boxSizing:"border-box"}}>
      <style>{`
        @keyframes dEmIn{0%{opacity:0;transform:translateY(12px) scale(0.92)}100%{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes dEmHopWiggle{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-4px) rotate(2deg)}}
        /* Randomised hop pattern — 10s cycle, each emotion has active windows at different positions.
           Sequence in cycle: 😢(0-10%) → 😊(13-23%) → 😡(26-36%) → 😌(39-49%) → 😟(52-62%) → 😊(65-75%) → 😢(78-88%) → 😡(91-100%)
           This means 😊 and 😢 and 😡 light up twice in a cycle, others once, creating organic variation. */
        @keyframes dEmSelect0{
          0%{transform:scale(1);box-shadow:0 2px 6px rgba(143,191,161,0.10)}
          /* Emotion 0 (😊) active at 13-23% */
          13%{transform:scale(1.22);box-shadow:0 12px 28px rgba(143,191,161,0.45)}
          18%{transform:scale(1.20);box-shadow:0 10px 24px rgba(143,191,161,0.40)}
          23%{transform:scale(1);box-shadow:0 2px 6px rgba(143,191,161,0.10)}
          /* Active again at 65-75% */
          65%{transform:scale(1.22);box-shadow:0 12px 28px rgba(143,191,161,0.45)}
          70%{transform:scale(1.20);box-shadow:0 10px 24px rgba(143,191,161,0.40)}
          75%,100%{transform:scale(1);box-shadow:0 2px 6px rgba(143,191,161,0.10)}
        }
        @keyframes dEmSelect1{
          /* 😌 active at 39-49% only */
          0%,39%,100%{transform:scale(1);box-shadow:0 2px 6px rgba(138,175,210,0.10)}
          42%{transform:scale(1.22);box-shadow:0 12px 28px rgba(138,175,210,0.45)}
          46%{transform:scale(1.20);box-shadow:0 10px 24px rgba(138,175,210,0.40)}
          49%{transform:scale(1);box-shadow:0 2px 6px rgba(138,175,210,0.10)}
        }
        @keyframes dEmSelect2{
          /* 😟 active at 52-62% only */
          0%,52%,100%{transform:scale(1);box-shadow:0 2px 6px rgba(194,96,122,0.10)}
          55%{transform:scale(1.22);box-shadow:0 12px 28px rgba(194,96,122,0.45)}
          59%{transform:scale(1.20);box-shadow:0 10px 24px rgba(194,96,122,0.40)}
          62%{transform:scale(1);box-shadow:0 2px 6px rgba(194,96,122,0.10)}
        }
        @keyframes dEmSelect3{
          /* 😡 active at 26-36% AND 91-100% (wraps around) */
          0%{transform:scale(1);box-shadow:0 2px 6px rgba(232,155,137,0.10)}
          26%{transform:scale(1);box-shadow:0 2px 6px rgba(232,155,137,0.10)}
          29%{transform:scale(1.22);box-shadow:0 12px 28px rgba(232,155,137,0.45)}
          33%{transform:scale(1.20);box-shadow:0 10px 24px rgba(232,155,137,0.40)}
          36%{transform:scale(1);box-shadow:0 2px 6px rgba(232,155,137,0.10)}
          91%{transform:scale(1);box-shadow:0 2px 6px rgba(232,155,137,0.10)}
          94%{transform:scale(1.22);box-shadow:0 12px 28px rgba(232,155,137,0.45)}
          98%{transform:scale(1.20);box-shadow:0 10px 24px rgba(232,155,137,0.40)}
          100%{transform:scale(1);box-shadow:0 2px 6px rgba(232,155,137,0.10)}
        }
        @keyframes dEmSelect4{
          /* 😢 active at 0-10% AND 78-88% */
          0%{transform:scale(1.22);box-shadow:0 12px 28px rgba(150,131,194,0.45)}
          6%{transform:scale(1.20);box-shadow:0 10px 24px rgba(150,131,194,0.40)}
          10%{transform:scale(1);box-shadow:0 2px 6px rgba(150,131,194,0.10)}
          78%{transform:scale(1);box-shadow:0 2px 6px rgba(150,131,194,0.10)}
          81%{transform:scale(1.22);box-shadow:0 12px 28px rgba(150,131,194,0.45)}
          85%{transform:scale(1.20);box-shadow:0 10px 24px rgba(150,131,194,0.40)}
          88%,100%{transform:scale(1);box-shadow:0 2px 6px rgba(150,131,194,0.10)}
        }
        /* Border + bg color also pulse with selection — same timing as scale */
        @keyframes dEmBorder0{
          0%,13%,23%,65%,75%,100%{border-color:rgba(143,191,161,0.30);background:#E8F1E8}
          14%,22%{border-color:#8FBFA1;background:#D8E8D8}
          66%,74%{border-color:#8FBFA1;background:#D8E8D8}
        }
        @keyframes dEmBorder1{
          0%,39%,49%,100%{border-color:rgba(138,175,210,0.30);background:#E4EEF7}
          40%,48%{border-color:#8AAFD2;background:#D4E4F0}
        }
        @keyframes dEmBorder2{
          0%,52%,62%,100%{border-color:rgba(194,96,122,0.30);background:#FAF5F6}
          53%,61%{border-color:#C2607A;background:#F0E0E5}
        }
        @keyframes dEmBorder3{
          0%,26%,36%,91%,100%{border-color:rgba(232,155,137,0.30);background:#FCE5DC}
          27%,35%{border-color:#E89B89;background:#F5D5C5}
          92%,99%{border-color:#E89B89;background:#F5D5C5}
        }
        @keyframes dEmBorder4{
          0%{border-color:#9683C2;background:#E0D8F0}
          11%,78%,88%,100%{border-color:rgba(150,131,194,0.30);background:#EFEBF8}
          79%,87%{border-color:#9683C2;background:#E0D8F0}
        }
      `}</style>
      <div style={{display:"flex",gap:12,alignItems:"center",justifyContent:"center",flexWrap:"wrap",maxWidth:340}}>
        {[
          {emoji:"😊",color:"#8FBFA1",bg:"#E8F1E8",delay:0.1,idx:0},
          {emoji:"😌",color:"#8AAFD2",bg:"#E4EEF7",delay:0.18,idx:1},
          {emoji:"😟",color:"#C2607A",bg:"#FAF5F6",delay:0.26,idx:2},
          {emoji:"😡",color:"#E89B89",bg:"#FCE5DC",delay:0.34,idx:3},
          {emoji:"😢",color:"#9683C2",bg:"#EFEBF8",delay:0.42,idx:4},
        ].map((e)=>(
          <div key={e.idx} style={{
            width:54,
            height:54,
            borderRadius:"50%",
            background:e.bg,
            border:`1.5px solid ${e.color}33`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:26,
            boxShadow:`0 2px 6px ${e.color}1A`,
            opacity:0,
            animation:`dEmIn 0.55s ${e.delay}s cubic-bezier(0.22,1,0.36,1) both, dEmSelect${e.idx} 10s ${e.delay+0.9}s cubic-bezier(0.34, 1.56, 0.64, 1) infinite, dEmBorder${e.idx} 10s ${e.delay+0.9}s linear infinite`,
            transformOrigin:"center",
            willChange:"transform, box-shadow",
          }}>
            <div style={{animation:`dEmHopWiggle 2.4s ${e.idx*0.5}s ease-in-out infinite`,willChange:"transform"}}>
              {e.emoji}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SceneCalm(){
  // Breathing bubble — exactly the same running orb as the real BreathingExercise during exercise:
  // glass body + 5 lava-like blobs flowing inside (goo filter) + specular highlights + outer rim.
  // Auto-cycles through breath-in (4s) → hold (2s) → breath-out (6s) phases.
  const BLUE="#9DC4D8", DEEP="#5A8AA3";
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:18,padding:"0 28px",boxSizing:"border-box"}}>
      <style>{`
        @keyframes dCaIn{0%{opacity:0;transform:scale(0.85)}100%{opacity:1;transform:scale(1)}}
        /* Breath cycle: in (4s) 0.4→1, hold (2s) 1→1, out (6s) 1→0.4. Total 12s. */
        @keyframes dCaBreath{
          0%{transform:scale(0.55)}
          33%{transform:scale(1)}
          50%{transform:scale(1)}
          100%{transform:scale(0.55)}
        }
        @keyframes dCaRing{
          0%{transform:scale(0.6);opacity:0.20}
          33%{transform:scale(1.10);opacity:0.50}
          50%{transform:scale(1.10);opacity:0.50}
          100%{transform:scale(0.6);opacity:0.20}
        }
        /* Lava blobs swim continuously regardless of breath phase — gives liveliness inside the orb */
        @keyframes dCaBlob0{0%,100%{transform:translate(0px,0px)}25%{transform:translate(22px,-15px)}50%{transform:translate(8px,18px)}75%{transform:translate(-18px,6px)}}
        @keyframes dCaBlob1{0%,100%{transform:translate(0px,0px)}25%{transform:translate(-20px,12px)}50%{transform:translate(-5px,-22px)}75%{transform:translate(16px,8px)}}
        @keyframes dCaBlob2{0%,100%{transform:translate(0px,0px)}30%{transform:translate(18px,16px)}60%{transform:translate(-22px,-8px)}90%{transform:translate(10px,-18px)}}
        @keyframes dCaBlob3{0%,100%{transform:translate(0px,0px)}30%{transform:translate(-14px,-18px)}60%{transform:translate(20px,10px)}90%{transform:translate(-8px,20px)}}
        @keyframes dCaBlob4{0%,100%{transform:translate(0px,0px)}40%{transform:translate(15px,15px)}80%{transform:translate(-18px,-12px)}}
      `}</style>
      <div style={{position:"relative",width:220,height:220,display:"flex",alignItems:"center",justifyContent:"center",animation:"dCaIn 1s cubic-bezier(0.22,1,0.36,1) both"}}>
        {/* Outer companion ring — breathes with the orb, slightly oversized for depth */}
        <div style={{
          position:"absolute",
          width:220,height:220,
          borderRadius:"50%",
          border:`1px solid ${BLUE}66`,
          animation:"dCaRing 12s ease-in-out infinite",
          willChange:"transform, opacity",
        }}/>
        {/* Glass orb with lava blobs — wrapper scales for breath cycle */}
        <div style={{
          width:180,height:180,
          display:"flex",alignItems:"center",justifyContent:"center",
          position:"relative",
          animation:"dCaBreath 12s ease-in-out infinite",
          willChange:"transform",
        }}>
          <svg width={180} height={180} viewBox="0 0 280 280" style={{position:"absolute",overflow:"visible"}}>
            <defs>
              <radialGradient id="dCaFill" cx="38%" cy="32%">
                <stop offset="0%" stopColor={`${BLUE}AA`}/>
                <stop offset="55%" stopColor={`${BLUE}66`}/>
                <stop offset="100%" stopColor={`${DEEP}44`}/>
              </radialGradient>
              <radialGradient id="dCaEdge" cx="50%" cy="50%">
                <stop offset="85%" stopColor="rgba(255,255,255,0)"/>
                <stop offset="100%" stopColor="rgba(255,255,255,0.55)"/>
              </radialGradient>
              <clipPath id="dCaClip"><circle cx={140} cy={140} r={130}/></clipPath>
              <filter id="dCaGoo">
                <feGaussianBlur stdDeviation="6"/>
                <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"/>
              </filter>
            </defs>
            {/* Glass body */}
            <circle cx={140} cy={140} r={130} fill="url(#dCaFill)"/>
            {/* Floating blobs inside — gooey merge effect, same as real BreathingExercise */}
            <g clipPath="url(#dCaClip)" filter="url(#dCaGoo)">
              {[
                {x:140,y:140,r:40,anim:0,delay:0},
                {x:195,y:110,r:30,anim:1,delay:-2},
                {x:90, y:180,r:34,anim:2,delay:-5},
                {x:170,y:195,r:26,anim:3,delay:-7},
                {x:100,y:90, r:28,anim:4,delay:-10},
              ].map((b,i)=>(
                <circle
                  key={i}
                  cx={b.x} cy={b.y} r={b.r}
                  fill={DEEP} opacity={0.7}
                  style={{animation:`dCaBlob${b.anim} ${14+b.anim*1.5}s ease-in-out ${b.delay}s infinite`,willChange:"transform"}}
                />
              ))}
            </g>
            {/* Outer rim highlight */}
            <circle cx={140} cy={140} r={130} fill="url(#dCaEdge)"/>
            {/* Specular highlights — same as real tool */}
            <ellipse cx={100} cy={88} rx={32} ry={20} fill="rgba(255,255,255,0.65)" style={{filter:"blur(2px)"}}/>
            <ellipse cx={92} cy={80} rx={14} ry={9} fill="rgba(255,255,255,0.9)" style={{filter:"blur(1px)"}}/>
            {/* Outer border — thin white ring */}
            <circle cx={140} cy={140} r={130} fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth={1.5}/>
          </svg>
        </div>
      </div>
    </div>
  );
}

function SceneIdCard(){
  // ID card — fuller preview with multiple sections: about, what helps, emergency contacts.
  return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",width:"100%",padding:"0 22px",boxSizing:"border-box"}}>
      <style>{`
        @keyframes dIdIn{0%{opacity:0;transform:translateY(14px) scale(0.96)}100%{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes dIdRowIn{0%{opacity:0;transform:translateX(-6px)}100%{opacity:1;transform:translateX(0)}}
        @keyframes dIdCallPulse{0%,100%{box-shadow:0 0 0 0 rgba(143,191,161,0.5)}50%{box-shadow:0 0 0 8px rgba(143,191,161,0)}}
      `}</style>
      <div style={{background:"#FFFFFF",borderRadius:20,padding:"20px 18px 18px",boxShadow:"0 16px 40px rgba(31,27,46,0.10), 0 2px 8px rgba(31,27,46,0.04)",border:"1px solid rgba(31,27,46,0.06)",width:"100%",maxWidth:320,animation:"dIdIn 0.9s cubic-bezier(0.22,1,0.36,1) both"}}>

        {/* Avatar + name header */}
        <div style={{display:"flex",alignItems:"center",gap:13,marginBottom:14,paddingBottom:14,borderBottom:"1px solid rgba(31,27,46,0.06)"}}>
          <div style={{width:50,height:50,borderRadius:"50%",background:"linear-gradient(140deg,#FCE5DC,#E89B89)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,boxShadow:"0 4px 12px rgba(232,155,137,0.3)",flexShrink:0}}>👧</div>
          <div style={{minWidth:0,flex:1}}>
            <div style={{fontFamily:'Georgia, serif',fontWeight:600,fontSize:17,color:"#1F1B2E",letterSpacing:-0.2}}>Maja Lindberg</div>
            <div style={{fontFamily:"-apple-system, sans-serif",fontSize:11,color:"#9892AA",marginTop:2,letterSpacing:0.2}}>8 år · Autism</div>
          </div>
        </div>

        {/* About me */}
        <div style={{marginBottom:11,animation:"dIdRowIn 0.45s 0.25s cubic-bezier(0.22,1,0.36,1) both"}}>
          <div style={{fontFamily:"-apple-system, sans-serif",fontSize:9.5,fontWeight:600,color:"#9892AA",letterSpacing:0.8,textTransform:"uppercase",marginBottom:3}}>Om mig</div>
          <div style={{fontFamily:"-apple-system, sans-serif",fontSize:12.5,color:"#1F1B2E",lineHeight:1.4}}>Jag pratar inte alltid. Jag tänker mycket.</div>
        </div>

        {/* What helps */}
        <div style={{marginBottom:11,animation:"dIdRowIn 0.45s 0.40s cubic-bezier(0.22,1,0.36,1) both"}}>
          <div style={{fontFamily:"-apple-system, sans-serif",fontSize:9.5,fontWeight:600,color:"#9892AA",letterSpacing:0.8,textTransform:"uppercase",marginBottom:3}}>Det här hjälper</div>
          <div style={{fontFamily:"-apple-system, sans-serif",fontSize:12.5,color:"#1F1B2E",lineHeight:1.4}}>Lugn musik · Vatten · Min nalle</div>
        </div>

        {/* What's hard */}
        <div style={{marginBottom:13,animation:"dIdRowIn 0.45s 0.55s cubic-bezier(0.22,1,0.36,1) both"}}>
          <div style={{fontFamily:"-apple-system, sans-serif",fontSize:9.5,fontWeight:600,color:"#9892AA",letterSpacing:0.8,textTransform:"uppercase",marginBottom:3}}>Det här är svårt</div>
          <div style={{fontFamily:"-apple-system, sans-serif",fontSize:12.5,color:"#1F1B2E",lineHeight:1.4}}>Höga ljud · Plötsliga ändringar</div>
        </div>

        {/* Emergency contacts */}
        <div style={{paddingTop:13,borderTop:"1px solid rgba(31,27,46,0.06)",animation:"dIdRowIn 0.45s 0.70s cubic-bezier(0.22,1,0.36,1) both"}}>
          <div style={{fontFamily:"-apple-system, sans-serif",fontSize:9.5,fontWeight:600,color:"#9892AA",letterSpacing:0.8,textTransform:"uppercase",marginBottom:7}}>Ring vid behov</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {[
              {who:"Mamma Anna",num:"070 123 45 67",emoji:"👩",pulse:true},
              {who:"Pappa Erik",num:"070 234 56 78",emoji:"👨"},
              {who:"Sjukvård 1177",num:"1177",emoji:"🏥"},
            ].map((c,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 9px",borderRadius:11,background:i===0?"rgba(143,191,161,0.10)":"rgba(31,27,46,0.03)",border:`1px solid ${i===0?"rgba(143,191,161,0.30)":"rgba(31,27,46,0.05)"}`}}>
                <div style={{width:26,height:26,borderRadius:"50%",background:"#FFFFFF",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0,border:"1px solid rgba(31,27,46,0.06)"}}>{c.emoji}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"-apple-system, sans-serif",fontSize:11.5,fontWeight:600,color:"#1F1B2E",letterSpacing:0.1}}>{c.who}</div>
                  <div style={{fontFamily:"-apple-system, sans-serif",fontSize:10.5,color:"#9892AA",fontVariantNumeric:"tabular-nums",marginTop:1}}>{c.num}</div>
                </div>
                <div style={{width:26,height:26,borderRadius:"50%",background:c.pulse?"#8FBFA1":"rgba(31,27,46,0.06)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,animation:c.pulse?"dIdCallPulse 2s ease-in-out infinite":"none"}}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={c.pulse?"#FFFFFF":"#9892AA"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

function SceneTalk(){
  // Comm board — grid of choice cards, one being "spoken"
  return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",width:"100%",padding:"0 28px",boxSizing:"border-box"}}>
      <style>{`
        @keyframes dTaIn{0%{opacity:0;transform:translateY(10px) scale(0.94)}100%{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes dTaPulse{0%,100%{box-shadow:0 0 0 0 rgba(138,175,210,0.4)}50%{box-shadow:0 0 0 14px rgba(138,175,210,0)}}
        @keyframes dTaWave{0%,100%{transform:scaleY(0.4)}50%{transform:scaleY(1)}}
      `}</style>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,maxWidth:300}}>
        {[
          {emoji:"💧",label:"Vatten",color:"#8AAFD2",bg:"#E4EEF7",delay:0.1,active:true},
          {emoji:"🍎",label:"Mat",color:"#E89B89",bg:"#FCE5DC",delay:0.2},
          {emoji:"🚽",label:"Toa",color:"#8FBFA1",bg:"#E8F1E8",delay:0.3},
          {emoji:"🛌",label:"Vila",color:"#9683C2",bg:"#EFEBF8",delay:0.4},
          {emoji:"📺",label:"TV",color:"#D9B868",bg:"#FAF1D9",delay:0.5},
          {emoji:"🎵",label:"Musik",color:"#B58CD0",bg:"#F1E9F6",delay:0.6},
        ].map((c,i)=>(
          <div key={i} style={{
            background:c.bg,
            borderRadius:14,
            padding:"14px 8px 10px",
            border:c.active?`2px solid ${c.color}`:`1px solid ${c.color}28`,
            display:"flex",flexDirection:"column",alignItems:"center",gap:6,
            boxShadow:c.active?`0 8px 22px ${c.color}33`:`0 2px 6px ${c.color}14`,
            position:"relative",
            animation:`dTaIn 0.55s ${c.delay}s cubic-bezier(0.22,1,0.36,1) both${c.active?", dTaPulse 2.2s "+(c.delay+0.7)+"s ease-in-out infinite":""}`,
          }}>
            <div style={{fontSize:24}}>{c.emoji}</div>
            <div style={{fontFamily:"-apple-system, sans-serif",fontSize:11,fontWeight:600,color:c.color,letterSpacing:0.2}}>{c.label}</div>
            {c.active&&(
              <div style={{display:"flex",gap:2,alignItems:"flex-end",height:7,marginTop:2}}>
                {[0,0.15,0.3,0.15,0].map((d,j)=>(
                  <div key={j} style={{width:2,height:6,borderRadius:1,background:c.color,transformOrigin:"center bottom",animation:`dTaWave 0.7s ${d}s ease-in-out infinite`}}/>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SceneOutro({onStart}){
  // Final — real Luma mark + start button, gentle gradient
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:30,padding:"30px 40px",width:"100%",boxSizing:"border-box"}}>
      <style>{`
        @keyframes dOLogoIn{0%{opacity:0;transform:scale(0.85)}100%{opacity:1;transform:scale(1)}}
        @keyframes dOLumaRotate{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes dOLumaBreath{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
        @keyframes dORayFadeA{0%,100%{opacity:0.75}50%{opacity:0.45}}
        @keyframes dORayFadeB{0%,100%{opacity:0.45}50%{opacity:0.8}}
        @keyframes dOTextIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}
        @keyframes dOBtnIn{0%{opacity:0;transform:translateY(14px) scale(0.94)}100%{opacity:1;transform:translateY(0) scale(1)}}
      `}</style>
      <div style={{width:100,height:100,position:"relative",animation:"dOLogoIn 1.2s cubic-bezier(0.22,1,0.36,1) both"}}>
        <svg width={100} height={100} viewBox="0 0 26 26" style={{overflow:"visible"}}>
          <defs>
            <radialGradient id="dOLumaCore" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF"/>
              <stop offset="20%" stopColor="#FFFAF0" stopOpacity="0.95"/>
              <stop offset="55%" stopColor="#E8A878"/>
              <stop offset="100%" stopColor="#C97548"/>
            </radialGradient>
            <radialGradient id="dOLumaGlow" cx="50%" cy="50%" r="50%">
              <stop offset="40%" stopColor="#E8A878" stopOpacity="0"/>
              <stop offset="70%" stopColor="#E8A878" stopOpacity="0.20"/>
              <stop offset="100%" stopColor="#E8A878" stopOpacity="0"/>
            </radialGradient>
          </defs>
          <circle cx="13" cy="13" r="13" fill="url(#dOLumaGlow)"/>
          <g style={{transformOrigin:"13px 13px",animation:"dOLumaRotate 22s linear infinite"}}>
            {Array.from({length:8}).map((_,i)=>{
              const ang=(i/8)*2*Math.PI;
              const isLong=i%2===0;
              const r1=8.5, r2=isLong?12.2:11;
              const x1=13+r1*Math.sin(ang), y1=13-r1*Math.cos(ang);
              const x2=13+r2*Math.sin(ang), y2=13-r2*Math.cos(ang);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#E8A878" strokeWidth={isLong?1.6:1.1} strokeLinecap="round" style={{animation:`${i%2===0?"dORayFadeA":"dORayFadeB"} ${3+i*0.18}s ease-in-out infinite`}}/>;
            })}
          </g>
          <g style={{transformOrigin:"13px 13px",animation:"dOLumaBreath 3.4s ease-in-out infinite"}}>
            <circle cx="13" cy="13" r="6.5" fill="url(#dOLumaCore)"/>
            <circle cx="11" cy="11" r="1.5" fill="#FFFFFF" opacity="0.7"/>
          </g>
        </svg>
      </div>
      <div style={{textAlign:"center",maxWidth:320}}>
        <div style={{fontFamily:'Georgia, serif',fontSize:36,fontWeight:500,color:"#1F1B2E",letterSpacing:1,marginBottom:14,animation:"dOTextIn 0.9s 0.3s cubic-bezier(0.22,1,0.36,1) both"}}>Luma</div>
        <div style={{fontFamily:"-apple-system, sans-serif",fontSize:14,color:"#9892AA",lineHeight:1.5,letterSpacing:0.2,animation:"dOTextIn 0.9s 0.55s cubic-bezier(0.22,1,0.36,1) both"}}>Ett schema. En rytm.<br/>En trygghet.</div>
      </div>
      <button onClick={onStart} style={{
        padding:"14px 36px",
        borderRadius:26,
        border:"none",
        background:"linear-gradient(135deg,#1F1B2E,#3A3450)",
        color:"#FFFFFF",
        fontFamily:"-apple-system, sans-serif",
        fontSize:14,
        fontWeight:600,
        letterSpacing:0.3,
        cursor:"pointer",
        boxShadow:"0 12px 30px rgba(31,27,46,0.28)",
        animation:"dOBtnIn 0.9s 0.85s cubic-bezier(0.34,1.56,0.64,1) both",
      }}>Börja använda Luma</button>
    </div>
  );
}

function DemoTour({onClose}){
  const scenes=[
    {C:SceneIntro,     bg:"linear-gradient(180deg,#FFFFFF 0%,#FCFAFE 100%)",     heading:"Luma",                       sub:"Ett schema. En rytm. En trygghet.",                                       dur:5500},
    {C:SceneSchedule,  bg:"linear-gradient(165deg,#FCF6F4 0%,#FFFFFF 100%)",     heading:"Dagen i ett ögonkast",       sub:"Sigvard-lamporna visar var i tiden vi är.",                               dur:7500},
    {C:SceneTimer,     bg:"linear-gradient(165deg,#EAF1F7 0%,#FFFFFF 100%)",     heading:"Tiden får form",             sub:"Du ser hur länge det är kvar.",                                           dur:7500},
    {C:SceneChecklist, bg:"linear-gradient(165deg,#F4F9F4 0%,#FFFFFF 100%)",     heading:"Steg för steg",              sub:"En sak i taget.",                                                         dur:6500},
    {C:SceneEmotion,   bg:"linear-gradient(165deg,#FAF5F6 0%,#FFFFFF 100%)",     heading:"Hur känns det idag?",        sub:"Sätt ord på det.",                                                        dur:6500},
    {C:SceneCalm,      bg:"linear-gradient(165deg,#EAF3F7 0%,#FFFFFF 100%)",     heading:"När det blir mycket",        sub:"Andas. Långsamt.",                                                        dur:8000},
    {C:SceneIdCard,    bg:"linear-gradient(165deg,#FCF3F3 0%,#FFFFFF 100%)",     heading:"Mitt kort",                  sub:"Det viktiga om mig.",                                                     dur:6500},
    {C:SceneTalk,      bg:"linear-gradient(165deg,#F4F9FD 0%,#FFFFFF 100%)",     heading:"Bilder istället för ord",    sub:"Tryck — appen pratar för dig.",                                           dur:6500},
    {C:SceneOutro,     bg:"linear-gradient(180deg,#FCFAFE 0%,#FFFFFF 100%)",     heading:"",                           sub:"",                                                                         dur:99999},
  ];
  const[idx,setIdx]=useState(0);
  const[playing,setPlaying]=useState(true);
  const[sceneProgress,setSceneProgress]=useState(0);
  const startRef=useRef(null);

  useEffect(()=>{
    if(!playing||idx>=scenes.length-1) return;
    let raf;
    startRef.current=performance.now()-sceneProgress*scenes[idx].dur;
    const tick=()=>{
      const elapsed=performance.now()-startRef.current;
      const p=Math.min(1,elapsed/scenes[idx].dur);
      setSceneProgress(p);
      if(p>=1){
        setIdx(i=>Math.min(scenes.length-1,i+1));
        setSceneProgress(0);
      } else {
        raf=requestAnimationFrame(tick);
      }
    };
    raf=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(raf);
    // eslint-disable-next-line
  },[idx,playing]);

  useEffect(()=>{
    const onKey=(e)=>{
      if(e.key==="Escape") onClose();
      if(e.key==="ArrowRight") setIdx(i=>Math.min(scenes.length-1,i+1));
      if(e.key==="ArrowLeft") setIdx(i=>Math.max(0,i-1));
      if(e.key===" "){ e.preventDefault(); setPlaying(p=>!p); }
    };
    window.addEventListener("keydown",onKey);
    return()=>window.removeEventListener("keydown",onKey);
    // eslint-disable-next-line
  },[]);

  const next=()=>{ setIdx(i=>Math.min(scenes.length-1,i+1)); setSceneProgress(0); };
  const prev=()=>{ setIdx(i=>Math.max(0,i-1)); setSceneProgress(0); };
  // Touch swipe navigation
  const touchStartX=useRef(null);
  const onTouchStart=(e)=>{touchStartX.current=e.touches[0].clientX;};
  const onTouchEnd=(e)=>{
    if(touchStartX.current===null) return;
    const dx=e.changedTouches[0].clientX-touchStartX.current;
    if(Math.abs(dx)>50){ if(dx<0) next(); else prev(); }
    touchStartX.current=null;
  };
  const scene=scenes[idx];
  const Scene=scene.C;
  const isOutro=idx===scenes.length-1;

  return(
    <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} style={{position:"fixed",inset:0,zIndex:99999,background:scene.bg,display:"flex",flexDirection:"column",transition:"background 0.7s ease",userSelect:"none",overflow:"hidden"}}>
      <style>{`@keyframes dSceneIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes dTextIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Progress dots */}
      <div style={{flexShrink:0,padding:"18px 24px 0",display:"flex",gap:5,zIndex:2}}>
        {scenes.map((s,i)=>(
          <div key={i} style={{flex:1,height:3,background:"rgba(31,27,46,0.08)",borderRadius:2,overflow:"hidden"}}>
            <div style={{
              height:"100%",
              width: i<idx?"100%":i===idx?`${sceneProgress*100}%`:"0%",
              background:"rgba(31,27,46,0.55)",
              transition:i===idx?"none":"width 0.3s",
            }}/>
          </div>
        ))}
      </div>

      {/* Header bar: scene counter + close */}
      <div style={{flexShrink:0,padding:"10px 24px 0",display:"flex",justifyContent:"space-between",alignItems:"center",zIndex:3}}>
        <div style={{fontFamily:G.font,fontSize:10,fontWeight:700,color:G.ink3,letterSpacing:1.4,textTransform:"uppercase"}}>{idx+1} / {scenes.length}</div>
        <button onClick={onClose} aria-label="Stäng demo" style={{width:38,height:38,borderRadius:19,border:`1px solid ${G.border}`,background:"rgba(255,255,255,0.95)",backdropFilter:"blur(10px)",color:G.ink2,cursor:"pointer",boxShadow:"0 4px 14px rgba(31,27,46,0.08)",display:"flex",alignItems:"center",justifyContent:"center"}}><IconX size={14}/></button>
      </div>

      {/* Scene canvas — strictly contained */}
      <div style={{flex:1,minHeight:0,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",padding:"10px 0"}}>
        <div key={idx} style={{animation:"dSceneIn 0.7s cubic-bezier(0.22,1,0.36,1) both",width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
          <Scene onStart={isOutro?onClose:undefined}/>
        </div>
      </div>

      {/* Text — fixed footprint, never grows */}
      {!isOutro&&(
        <div key={`txt${idx}`} style={{flexShrink:0,padding:"0 28px",textAlign:"center",maxWidth:540,margin:"0 auto",width:"100%",boxSizing:"border-box"}}>
          <h1 style={{fontFamily:G.serif,fontSize:24,fontWeight:600,color:G.ink,marginBottom:8,marginTop:0,letterSpacing:-0.3,lineHeight:1.15,animation:"dTextIn 0.9s 0.25s cubic-bezier(0.22,1,0.36,1) both"}}>{scene.heading}</h1>
          <p style={{fontFamily:G.font,fontSize:14,color:G.ink2,lineHeight:1.5,letterSpacing:0.1,margin:0,animation:"dTextIn 0.9s 0.45s cubic-bezier(0.22,1,0.36,1) both"}}>{scene.sub}</p>
        </div>
      )}

      {/* Controls — fixed footprint */}
      {!isOutro&&(
        <div style={{flexShrink:0,padding:"16px 24px 24px",display:"flex",justifyContent:"center",alignItems:"center",gap:10}}>
          <button onClick={prev} disabled={idx===0} style={{width:44,height:44,borderRadius:22,border:`1px solid ${G.border}`,background:idx===0?G.cream:"rgba(255,255,255,0.95)",backdropFilter:"blur(10px)",color:idx===0?G.ink3:G.ink2,fontSize:17,cursor:idx===0?"default":"pointer",opacity:idx===0?0.5:1,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 12px rgba(31,27,46,0.06)"}}>←</button>
          <button onClick={()=>setPlaying(p=>!p)} style={{width:52,height:52,borderRadius:26,border:"none",background:"linear-gradient(135deg,#1F1B2E,#3A3450)",color:"#fff",fontSize:17,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 8px 20px rgba(31,27,46,0.25)"}}>{playing?"⏸":"▶"}</button>
          <button onClick={next} style={{width:44,height:44,borderRadius:22,border:`1px solid ${G.border}`,background:"rgba(255,255,255,0.95)",backdropFilter:"blur(10px)",color:G.ink2,fontSize:17,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 12px rgba(31,27,46,0.06)"}}>→</button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════ */
function NavIcon({type,active,color,size=22}){
  // Single unified stroke language — 1.6 weight, rounded caps, soft fills
  // Designed to feel hand-drawn and calm, not iconographic / system-like
  const stroke = active ? color : "#9892AA";
  const sw = 1.6;
  const op = active ? 1 : 0.85;
  const fillOp = active ? 0.14 : 0;
  return(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{opacity:op,transition:"stroke 0.35s ease, opacity 0.35s ease"}}>
      {type==="home"&&(<>
        {/* Gentle sun above a horizon — represents "today" / the day's path */}
        <circle cx="12" cy="9" r="3.2" fill={color} fillOpacity={fillOp}/>
        <path d="M12 4 v1.4 M12 12.6 v1.4 M5.4 9 h1.4 M17.2 9 h1.4 M7.4 4.4 l1 1 M15.6 4.4 l-1 1 M7.4 13.6 l1-1 M15.6 13.6 l-1-1"/>
        <path d="M3.5 19 h17" strokeOpacity="0.4"/>
      </>)}
      {type==="timer"&&(<>
        {/* Quiet clock — no minute marks, single calm hand */}
        <circle cx="12" cy="13" r="7.2" fill={color} fillOpacity={fillOp}/>
        <path d="M12 6.5 v-2 M10.5 4.5 h3"/>
        <path d="M12 13 v-3.5" strokeWidth="1.8"/>
      </>)}
      {type==="stories"&&(<>
        {/* Open book — soft spine, gentle curve */}
        <path d="M4 6.5 Q4 5.5 5 5.5 H11 Q12 5.5 12 6.5 V18 Q12 17 11 17 H5 Q4 17 4 18 Z" fill={color} fillOpacity={fillOp}/>
        <path d="M20 6.5 Q20 5.5 19 5.5 H13 Q12 5.5 12 6.5 V18 Q12 17 13 17 H19 Q20 17 20 18 Z" fill={color} fillOpacity={fillOp}/>
      </>)}
      {type==="emotion"&&(<>
        {/* Soft face — abstract feeling, not a specific emotion */}
        <circle cx="12" cy="12" r="8" fill={color} fillOpacity={fillOp}/>
        <circle cx="9.3" cy="10.5" r="0.7" fill={stroke} stroke="none"/>
        <circle cx="14.7" cy="10.5" r="0.7" fill={stroke} stroke="none"/>
        <path d="M9.5 14.5 Q12 16 14.5 14.5"/>
      </>)}
      {type==="calm"&&(<>
        {/* Concentric breath rings — meditative, no leaf icon */}
        <circle cx="12" cy="12" r="3.2" fill={color} fillOpacity={fillOp}/>
        <circle cx="12" cy="12" r="6" strokeOpacity="0.55"/>
        <circle cx="12" cy="12" r="8.6" strokeOpacity="0.25"/>
      </>)}
      {type==="comm"&&(<>
        {/* Speech bubble — round, soft tail */}
        <path d="M5 7 Q5 5.5 6.5 5.5 H17.5 Q19 5.5 19 7 V14 Q19 15.5 17.5 15.5 H11 L7.5 18.5 V15.5 H6.5 Q5 15.5 5 14 Z" fill={color} fillOpacity={fillOp}/>
        <circle cx="9" cy="10.5" r="0.8" fill={stroke} stroke="none"/>
        <circle cx="12" cy="10.5" r="0.8" fill={stroke} stroke="none"/>
        <circle cx="15" cy="10.5" r="0.8" fill={stroke} stroke="none"/>
      </>)}
      {type==="idcard"&&(<>
        {/* Identity card — rounded, soft, with figure */}
        <rect x="3.5" y="6" width="17" height="12" rx="2.2" fill={color} fillOpacity={fillOp}/>
        <circle cx="8.5" cy="11" r="1.8"/>
        <path d="M5.5 15.5 Q5.5 13.2 8.5 13.2 Q11.5 13.2 11.5 15.5"/>
        <path d="M14 10 h4 M14 13 h3" strokeOpacity="0.6"/>
      </>)}
      {type==="week"&&(<>
        {/* Week / calendar — soft card with day columns and binding tabs */}
        <rect x="3.5" y="5.5" width="17" height="14.5" rx="2.2" fill={color} fillOpacity={fillOp}/>
        <line x1="3.5" y1="10" x2="20.5" y2="10" strokeOpacity="0.65"/>
        <line x1="9.2" y1="10" x2="9.2" y2="20" strokeOpacity="0.35"/>
        <line x1="14.8" y1="10" x2="14.8" y2="20" strokeOpacity="0.35"/>
        <path d="M8 3.5 v3.2 M16 3.5 v3.2" strokeWidth="1.8"/>
      </>)}
    </svg>
  );
}

export default function App(){
  const[lang,setLang]=usePersistentState("lang","sv");
  const[headerTapCount,setHeaderTapCount]=useState(0); // increments on header tap — used by WeekScreen to reset focus
  // Comm modals lifted to App level so they render outside the body-wrapper's overflow:hidden,
  // which would otherwise clip them on iOS Safari (same DOM level as EditModal which works).
  const[commCats,setCommCats]=usePersistentState("commCats",COMM0);
  const[commSel,setCommSel]=useState(0);
  const[commModal,setCommModal]=useState(null); // {type: "addCat"|"addCard"|"editCat"|"confirmDel", data?: ...}
  const t=TR[lang];
  const[now,setNow]=useState(()=>new Date());
  const[acts,setActs]=usePersistentState("acts",()=>ACTS0.map(a=>({...a,steps:[...a.steps],stepsDone:{}})));
  // Per-date state: { "2025-11-13": { actId: { stepsDone: {}, done: false } } }
  // This way recurring activities have independent state per day.
  const[dailyState,setDailyState]=usePersistentState("dailyState",{});
  const dateKey=d=>{
    const dt=d||new Date();
    return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
  };
  const todayKey=dateKey(now);
  // Read state for a given activity on a given date (defaults to today)
  const getDayState=(actId,dKey)=>{
    const key=dKey||todayKey;
    return dailyState[key]?.[actId]||{stepsDone:{},done:false};
  };
  // Update step done state for an activity on a specific date
  const setDayStepsDone=(actId,sd,dKey)=>{
    const key=dKey||todayKey;
    setDailyState(prev=>({
      ...prev,
      [key]:{
        ...(prev[key]||{}),
        [actId]:{
          ...(prev[key]?.[actId]||{stepsDone:{},done:false}),
          stepsDone:sd,
        },
      },
    }));
  };
  // Mark an activity done for a specific date
  const setDayDone=(actId,doneFlag,dKey)=>{
    const key=dKey||todayKey;
    setDailyState(prev=>({
      ...prev,
      [key]:{
        ...(prev[key]||{}),
        [actId]:{
          ...(prev[key]?.[actId]||{stepsDone:{},done:false}),
          done:doneFlag,
        },
      },
    }));
  };
  const[stories,setStories]=usePersistentState("stories",()=>STORIES0.map(s=>({...s,pages:s.pages.map(p=>({...p}))})));
  const[screen,setScreen]=useState("home");
  const[isEd,setIsEd]=useState(false);
  const[view,setView]=useState("list");
  const[detail,setDetail]=useState(null);
  // Open activity detail with optional date context (defaults to today)
  // Accepts: setDetail(item) → today, or openDetail(item, dKey) → specific date
  const openDetail=(item,dKey)=>setDetail({item,dKey:dKey||todayKey});
  const[editAct,setEditAct]=useState(null);
  const[showEd,setShowEd]=useState(false);
  const[showSet,setShowSet]=useState(false);
  const[cfgRaw,setCfg]=usePersistentState("cfg",CFG0);
  // Merge persisted cfg with current CFG0 defaults — ensures new tool keys
  // (e.g. tools.week added later) become available without resetting user prefs.
  const cfg=useMemo(()=>({
    ...CFG0,
    ...cfgRaw,
    tools:{...CFG0.tools,...(cfgRaw.tools||{})},
    timerCfg:{...CFG0.timerCfg,...(cfgRaw.timerCfg||{})},
    calmTools:{...CFG0.calmTools,...(cfgRaw.calmTools||{})},
    idCard:{...CFG0.idCard,...(cfgRaw.idCard||{})},
    toolsVisible:{...CFG0.toolsVisible,...(cfgRaw.toolsVisible||{})},
  }),[cfgRaw]);
  // One-time migration: existing users had defaultType:"sector" from old CFG0.
  // Now that wave is the new default, upgrade their stored config so they see it too.
  const[migrWaveDone,setMigrWaveDone]=usePersistentState("migr_wave_default",false);
  useEffect(()=>{
    if(!migrWaveDone){
      if(cfgRaw.timerCfg?.defaultType==="sector"){
        setCfg(x=>({...x,timerCfg:{...x.timerCfg,defaultType:"wave"}}));
      }
      setMigrWaveDone(true);
    }
  },[migrWaveDone,cfgRaw,setCfg,setMigrWaveDone]);
  // Keyboard handling — when iOS keyboard opens, scroll focused input into view.
  // Without this, the keyboard can cover Save buttons or the input itself in long forms.
  // Uses setTimeout(300) to let iOS Safari raise the keyboard before measuring viewport.
  useEffect(()=>{
    if(typeof document==="undefined") return;
    const onFocus=(e)=>{
      const el=e.target;
      if(!el||(el.tagName!=="INPUT"&&el.tagName!=="TEXTAREA")) return;
      // Skip if the input is already in a comfortable position (e.g. modal at top)
      setTimeout(()=>{
        try{el.scrollIntoView({behavior:"smooth",block:"center"});}catch(_){}
      },320);
    };
    document.addEventListener("focusin",onFocus);
    return()=>document.removeEventListener("focusin",onFocus);
  },[]);
  const[shareCode]=useState(genCode);
  const[hasOnboarded,setHasOnboarded]=usePersistentState("hasOnboarded",false);
  const[showOnboarding,setShowOnboarding]=useState(false);
  const[showSupervisor,setShowSupervisor]=useState(false);
  const[showDemo,setShowDemo]=useState(()=>typeof window!=="undefined"&&window.location.hash==="#demo");
  // Story viewer state lives at the App root (not inside StoryScreen) so the
  // viewer renders OUTSIDE the screen container and its animation-context.
  // Otherwise position:fixed would be constrained and the bottom nav arrows
  // would be hidden behind the main tab bar.
  const[storyViewer,setStoryViewer]=useState(null);
  // When an input is focused on certain screens (e.g. the emotion reason field),
  // the bottom nav slides away to give the user room to see both the form and
  // what they're typing without the keyboard squeezing the content.
  const[inputFocused,setInputFocused]=useState(false);
  // Set true while an immersive experience is running (breathing, grounding,
  // skylight exercises). Bottom nav slides away so the calming visuals get
  // the full screen and chrome doesn't break the moment.
  const[immersiveMode,setImmersiveMode]=useState(false);
  // Combined signal for hiding the bottom nav. Either reason qualifies.
  const navHidden=inputFocused||immersiveMode;
  const[notifShown,setNotifShown]=usePersistentState("notifShown",{});
  const[startAlert,setStartAlert]=useState(null);
  const[supervisorClient,setSupervisorClient]=useState(null);
  useEffect(()=>{
    // Show onboarding once on first visit, after mount so layout settles.
    // Also re-trigger if URL hash is #welcome — handy for testing or for
    // showing the welcome to someone on an already-onboarded device, without
    // wiping their saved schedule via "Rensa all data".
    const wantsWelcome=typeof window!=="undefined"&&window.location.hash==="#welcome";
    if(!hasOnboarded||wantsWelcome){
      const t=setTimeout(()=>setShowOnboarding(true),300);
      return()=>clearTimeout(t);
    }
  },[hasOnboarded]);
  // One-time migration: force old peach default timer color to new blue
  useEffect(()=>{
    if(cfg.timerCfg?.defaultColor==="#E89B89"){
      setCfg(c=>({...c,timerCfg:{...c.timerCfg,defaultColor:"#8AAFD2"}}));
    }
  // eslint-disable-next-line
  },[]);
  // Listen to URL hash to open demo (#demo) or replay welcome (#welcome).
  // Lets caregivers send "luma-app.vercel.app/#welcome" as a quick share link
  // and have the welcome+demo open even on already-onboarded devices.
  useEffect(()=>{
    const onHashChange=()=>{
      if(window.location.hash==="#demo") setShowDemo(true);
      else if(window.location.hash==="#welcome") setShowOnboarding(true);
      else setShowDemo(h=>h&&window.location.hash==="#demo"?h:false);
    };
    window.addEventListener("hashchange",onHashChange);
    return()=>window.removeEventListener("hashchange",onHashChange);
  },[]);
  // Detect activity start times — show notification when an activity begins
  useEffect(()=>{
    if(isEd||showOnboarding||showSupervisor||showDemo) return;
    const check=()=>{
      const now=new Date();
      const today=now.toDateString();
      const nowMin=now.getHours()*60+now.getMinutes();
      // Clean up old day's keys (keep only today's)
      const todayKeys=Object.keys(notifShown).filter(k=>k.startsWith(today+"::"));
      if(todayKeys.length!==Object.keys(notifShown).length){
        const fresh={};
        todayKeys.forEach(k=>{fresh[k]=true;});
        setNotifShown(fresh);
      }
      // Find activity that just started (within 0-3 minutes of start, not yet notified, not done)
      for(const act of acts){
        if(dailyState[todayKey]?.[act.id]?.done) continue;
        const [h,m]=String(act.time).split(":").map(Number);
        const actMin=h*60+m;
        const key=`${today}::${act.id}`;
        if(nowMin>=actMin && nowMin<actMin+3 && !notifShown[key]){
          setStartAlert(act);
          setNotifShown(prev=>({...prev,[key]:true}));
          break;
        }
      }
    };
    check();
    const id=setInterval(check,20000);
    return()=>clearInterval(id);
  },[acts,notifShown,isEd,showOnboarding,showSupervisor,showDemo]);
  const dismissStartAlert=()=>setStartAlert(null);
  const openStartAlertActivity=()=>{ if(startAlert){openDetail(startAlert); setStartAlert(null);} };
  const closeDemo=()=>{
    setShowDemo(false);
    if(window.location.hash==="#demo") history.replaceState(null,"",window.location.pathname+window.location.search);
  };
  const openDemo=()=>{setShowSet(false);setShowDemo(true);};
  // Re-trigger the welcome + demo tour as if it's first run. Settings closes,
  // welcome appears, and tapping "Visa mig" hands off to the demo as usual.
  const openWelcomeTour=()=>{setShowSet(false);setShowOnboarding(true);};
  const finishOnboarding=()=>{setShowOnboarding(false);setHasOnboarded(true);setTimeout(()=>setShowDemo(true),400);};
  const openSupervisor=()=>{setShowSet(false);setShowSupervisor(true);};
  const openClient=(client)=>{
    // Demo: open the regular app but switch into editor mode pretending to edit this client
    setSupervisorClient(client);
    setShowSupervisor(false);
    setIsEd(true);
    setScreen("home");
  };
  const closeClient=()=>{
    setSupervisorClient(null);
    setIsEd(false);
    setShowSupervisor(true);
  };
  const listRef=useRef(null);
  const observersRef=useRef({ro:null,mo:null});
  const[listHeight,setListHeight]=useState(0);
  useEffect(()=>{SYNC_DB[shareCode]=acts;},[acts,shareCode]);
  useEffect(()=>{const id=setInterval(()=>setNow(new Date()),15000);return()=>clearInterval(id);},[]);
  // Callback ref — fires on every mount/unmount of the list element.
  const setListRef=(node)=>{
    if(observersRef.current.ro){observersRef.current.ro.disconnect();observersRef.current.ro=null;}
    if(observersRef.current.mo){observersRef.current.mo.disconnect();observersRef.current.mo=null;}
    listRef.current=node;
    if(!node){setListHeight(0);return;}
    const measure=()=>{
      if(!listRef.current) return;
      const n=listRef.current;
      // Find the last activity row (last child wrapper). Each wrapper contains [row, sep, spacer].
      // We want the bottom of the row itself (firstElementChild of the wrapper).
      const wrappers=Array.from(n.children);
      let h=0;
      for(let i=wrappers.length-1;i>=0;i--){
        const row=wrappers[i].firstElementChild;
        if(row){
          h=row.offsetTop+row.offsetHeight-n.offsetTop+wrappers[i].offsetTop-wrappers[i].offsetTop;
          // Simpler & more reliable: use wrapper's bounding rect bottom relative to container
          const wRect=wrappers[i].getBoundingClientRect();
          const rRect=row.getBoundingClientRect();
          const nRect=n.getBoundingClientRect();
          h=rRect.bottom-nRect.top;
          break;
        }
      }
      if(h>0) setListHeight(h);
    };
    requestAnimationFrame(()=>{measure();requestAnimationFrame(measure);});
    const ro=new ResizeObserver(measure);
    ro.observe(node);
    const mo=new MutationObserver(measure);
    mo.observe(node,{childList:true,subtree:true,attributes:true});
    observersRef.current={ro,mo};
  };
  const sorted=[...acts].sort((a,b)=>a.time.localeCompare(b.time));
  // User view shows ONLY activities whose start time is still in the future.
  // Exact disappearance when starttime passes. Editor sees all.
  const nowMin=now.getHours()*60+now.getMinutes();
  const todayDow=now.getDay(); // 0=Sun, 6=Sat
  const matchesToday=a=>{
    if(!a.repeat||a.repeat.type==="none") return true; // shows every day if no repeat rule
    if(a.repeat.type==="daily") return true;
    if(a.repeat.type==="weekdays") return todayDow>=1&&todayDow<=5;
    if(a.repeat.type==="weekend") return todayDow===0||todayDow===6;
    if(a.repeat.type==="custom") return (a.repeat.days||[]).includes(todayDow);
    return true;
  };
  const sortedToday=sorted.filter(matchesToday);
  const active=sortedToday.filter(a=>{
    // Check per-date done state (today's entry)
    const dst=dailyState[todayKey]?.[a.id];
    if(dst?.done) return false;
    // If activity has an endTime, keep it visible until that time passes.
    // Otherwise disappear when the start time passes.
    const cutoff=a.endTime?hm(a.endTime):hm(a.time);
    return cutoff>nowMin;
  });
  const dateStr=now.toLocaleDateString(lang==="sv"?"sv-SE":"en-GB",{weekday:"long",day:"numeric",month:"long"});
  const effView=cfg.schedView==="card"?"card":cfg.schedView==="list"?"list":view;
  const handleSave=item=>setActs(a=>a.find(x=>x.id===item.id)?a.map(x=>x.id===item.id?item:x):[...a,item]);
  const handleDel=id=>setActs(a=>a.filter(x=>x.id!==id));
  // Check/uncheck step — always writes to today's date entry
  const handleCheck=(aid,sd)=>setDayStepsDone(aid,sd,todayKey);
  const[undoToast,setUndoToast]=useState(null);
  const undoTimerRef=useRef(null);
  const handleDone=id=>{
    setDayDone(id,true,todayKey);
    const act=acts.find(x=>x.id===id);
    if(act){
      setUndoToast({id,name:act.name,color:act.color});
      if(undoTimerRef.current)clearTimeout(undoTimerRef.current);
      undoTimerRef.current=setTimeout(()=>setUndoToast(null),8000);
    }
  };
  const handleUndo=()=>{
    if(!undoToast) return;
    setDayDone(undoToast.id,false,todayKey);
    setUndoToast(null);
    if(undoTimerRef.current)clearTimeout(undoTimerRef.current);
  };
  const navItems=[
    {key:"home",icon:"home",label:t.home,always:true,S:SCREENS.home},
    {key:"week",icon:"week",label:t.week,always:false,S:SCREENS.week},
    {key:"timer",icon:"timer",label:t.toolsTimer,always:false,S:SCREENS.timer},
    {key:"stories",icon:"stories",label:t.stories,always:false,S:SCREENS.stories},
    {key:"emotion",icon:"emotion",label:t.toolsEmotion,always:false,S:SCREENS.emotion},
    {key:"calm",icon:"calm",label:t.calm,always:false,S:SCREENS.calm},
    {key:"comm",icon:"comm",label:t.comm,always:false,S:SCREENS.comm},
    {key:"idcard",icon:"idcard",label:t.idcard,always:false,S:SCREENS.idcard},
  ].filter(n=>n.always||cfg.tools[n.key]||isEd);
  const curS=SCREENS[screen]||SCREENS.home;
  /* On the Comm/Tala screen, the header palette adapts to the active
     category's colour — same idea as the screen background. We synthesise
     soft tints from the active colour and feed them where the header reads
     S.hl / S.h / S.soft / S.deep. Falls back to the base comm palette if
     anything's missing. The whole top of the app then warms/cools in sync
     with the category pills, instead of holding a constant green hue. */
  const effS=(()=>{
    if(screen!=="comm") return curS;
    const c=commCats?.[commSel]?.color;
    if(!c) return curS;
    return{
      ...curS,
      h:c,
      hl:withAlpha(c,0.14),   // soft tinted header gradient start
      soft:withAlpha(c,0.34), // ambient halo
      deep:shade(c,-0.35),    // Luma logo gradient bottom — darker variant
    };
  })();
  // Subtle time-of-day tint that gently blends with screen background.
  // Morning: cool sunrise hint. Day: neutral. Evening: warm amber. Night: deep dusk.
  const hour=now?.getHours?.()??new Date().getHours();
  const ambientTint=(()=>{
    if(hour>=5&&hour<9) return "rgba(255, 220, 180, 0.18)";   // sunrise warmth
    if(hour>=9&&hour<17) return "rgba(255, 255, 255, 0)";       // neutral day
    if(hour>=17&&hour<20) return "rgba(255, 180, 130, 0.22)";   // sunset
    if(hour>=20&&hour<23) return "rgba(120, 110, 180, 0.18)";   // dusk
    return "rgba(60, 70, 120, 0.22)";                            // night
  })();
  return(
    <div style={{position:"relative",minHeight:"100dvh",background:curS.hb,transition:"background .4s",color:G.ink,fontFamily:G.font}}>
      <div className="lt-app-root" style={{display:"flex",flexDirection:"column",margin:"0 auto",position:"relative"}}>
      {/* GLOBAL POLISH UTILITY STYLES — touch feedback, focus states, modal entrance */}
      <style>{`
        /* === UNIVERSAL DEVICE ADAPTATION ===
           - Dynamic viewport (dvh) — adapts to iOS Safari URL bar show/hide without layout jumps
           - Safe area insets — accounts for iPhone X+ notch and home indicator
           - Responsive max-width — wider on tablets, full-screen on desktop with clear "app frame"
           - Touch-action manipulation — disables double-tap zoom for snappier feel
        */
        :root {
          --app-vh: 100vh;
          --app-vh: 100dvh; /* dynamic — adjusts when iOS Safari URL bar shows/hides */
          --safe-top: env(safe-area-inset-top, 0px);
          --safe-bottom: env(safe-area-inset-bottom, 0px);
          --safe-left: env(safe-area-inset-left, 0px);
          --safe-right: env(safe-area-inset-right, 0px);
        }
        html, body {
          overscroll-behavior-y: contain; /* prevents pull-to-refresh on Android Chrome */
          -webkit-text-size-adjust: 100%;
          -webkit-tap-highlight-color: transparent;
        }
        .lt-app-root {
          height: var(--app-vh);
          max-width: 480px;
          padding-left: var(--safe-left);
          padding-right: var(--safe-right);
          /* No overflow:hidden here — would clip position:fixed overlays. Body has its own clipping. */
          isolation: isolate; /* Creates stacking context without clipping */
        }
        /* Tablet — slightly wider, still single-column for one-hand feel */
        @media (min-width: 700px) {
          .lt-app-root {
            max-width: 540px;
            box-shadow: 0 0 60px rgba(31, 27, 46, 0.10);
          }
        }
        /* Desktop / large tablet — distinct app frame so it doesn't look stretched.
           Border-radius needs overflow:hidden on the inner body, not root, so overlays escape. */
        @media (min-width: 900px) {
          .lt-app-root {
            max-width: 560px;
            margin-top: 24px;
            margin-bottom: 24px;
            border-radius: 28px;
            height: calc(var(--app-vh) - 48px);
            box-shadow: 0 24px 80px rgba(31, 27, 46, 0.18), 0 4px 12px rgba(31, 27, 46, 0.08);
            border: 1px solid rgba(31, 27, 46, 0.06);
            overflow: hidden; /* On desktop only, app frame needs clipping for border-radius */
          }
        }
        /* All interactive elements get snappy touch — disables 300ms tap delay on older Safari */
        button, [role="button"], .lt-press, .lt-press-soft, .lt-press-tight {
          touch-action: manipulation;
        }
        /* Touch / mouse press feedback — premium cubic-bezier */
        .lt-press { transition: transform .26s cubic-bezier(0.32, 0.72, 0, 1); }
        .lt-press:active { transform: scale(0.965); }
        .lt-press-soft { transition: transform .26s cubic-bezier(0.32, 0.72, 0, 1); }
        .lt-press-soft:active { transform: scale(0.985); }
        .lt-press-tight { transition: transform .22s cubic-bezier(0.32, 0.72, 0, 1); }
        .lt-press-tight:active { transform: scale(0.94); }
        /* Input focus state — subtle dark glow */
        .lt-input { transition: border-color .25s ease, background .25s ease, box-shadow .25s ease; }
        .lt-input:focus {
          outline: none;
          border-color: rgba(31,27,46,0.32);
          background: #FFFFFF;
          box-shadow: 0 0 0 4px rgba(31,27,46,0.05);
        }
        /* iOS Safari — prevents zoom-on-focus for text inputs (font-size >= 16px does this) */
        input, textarea, select {
          font-size: 16px;
        }
        /* Keyboard handling — when input gets focused, browser scrolls it into view.
           scroll-padding ensures inputs don't end up flush against the keyboard top edge. */
        html {
          scroll-padding-bottom: 30vh;
          scroll-behavior: smooth;
        }
        /* Accessibility — respect user's reduced-motion preference (iOS Settings > Accessibility >
           Motion > Reduce Motion, Android Settings > Accessibility > Remove Animations).
           Disables all decorative animations while preserving functional ones (timers still tick). */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
        /* Modal entrance */
        @keyframes ovlIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes shtIn { from { transform: translateY(102%); } to { transform: translateY(0); } }
        /* ───────── Webfont loading ─────────
           Nunito from Google Fonts. Variable weight for clean rendering
           across all heading scales. Loaded via @import (rather than <link>)
           so it travels with the artifact and works offline. */
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');

        /* Global type rendering — enables kerning, common ligatures, contextual
           alternates, and lets variable-font optical sizing follow the rendered
           size. Without these, even good fonts look slightly mechanical. */
        html, body {
          font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
          font-optical-sizing: auto;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        /* Pencil icon — sits in any "edit" affordance across the app (schedule
           row, emotion editor, ID card, etc). Idle = neutral. Hover/press =
           tilts toward the upper-left as if about to write, then springs back
           via bouncy back-out easing. */
        .lumaPen { transform-origin: 80% 80%; transition: transform .35s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .lumaPenBtn:hover .lumaPen, .lumaPenBtn:active .lumaPen { transform: rotate(-14deg) translateY(-1px) scale(1.08); }
        /* Save-button checkmark — draws itself in once when the panel appears
           (the stroke offset animates from full length to zero), then on hover/
           press does a satisfying bounce. Stays subtle: the visual confirmation
           lives in the post-save celebration. */
        .saveTick { stroke-dasharray: 22; stroke-dashoffset: 22; animation: saveTickDraw .55s cubic-bezier(0.32, 0.72, 0, 1) .15s forwards; transition: transform .35s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .saveBtn:hover .saveTick, .saveBtn:active .saveTick { transform: scale(1.2); }
        @keyframes saveTickDraw { from { stroke-dashoffset: 22; } to { stroke-dashoffset: 0; } }
      `}</style>
      {/* Ambient time-of-day overlay — extremely subtle, sits above background */}
      <div style={{position:"absolute",inset:0,background:`linear-gradient(180deg, ${ambientTint} 0%, transparent 60%)`,pointerEvents:"none",zIndex:0,transition:"background 2s ease"}}/>
      {/* HEADER — respects iPhone notch via safe-area-inset-top. Tapping the header signals subscreens (e.g. WeekScreen) to reset their internal focus. */}
      <div onClick={()=>setHeaderTapCount(c=>c+1)} style={{background:`linear-gradient(170deg,${effS.hl} 0%,${G.white} 100%)`,padding:"calc(14px + env(safe-area-inset-top, 0px)) 22px 12px",borderBottom:`1px solid ${G.border}`,flexShrink:0,position:"relative",overflow:"hidden",transition:"background .4s",cursor:"pointer"}}>
        <div style={{position:"absolute",top:-50,right:-30,width:140,height:140,borderRadius:"50%",background:`radial-gradient(circle,${effS.soft}44,transparent 70%)`,pointerEvents:"none"}}/>
        {/* Luma wordmark — stylized sun with rays */}
        <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:8,position:"relative"}}>
          <style>{`
            @keyframes lumaRotate{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
            @keyframes lumaCoreBreath{0%,100%{transform:scale(1);filter:brightness(1)}50%{transform:scale(1.04);filter:brightness(1.08)}}
            @keyframes rayFade1{0%,100%{opacity:.7}50%{opacity:.4}}
            @keyframes rayFade2{0%,100%{opacity:.4}50%{opacity:.75}}
          `}</style>
          <svg width={26} height={26} viewBox="0 0 26 26" style={{flexShrink:0,overflow:"visible"}}>
            <defs>
              <radialGradient id="lumaCore" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#FFFFFF"/>
                <stop offset="20%" stopColor="#FFFAF0" stopOpacity="0.95"/>
                <stop offset="55%" stopColor={effS.h}/>
                <stop offset="100%" stopColor={effS.deep}/>
              </radialGradient>
              <radialGradient id="lumaOuterGlow" cx="50%" cy="50%" r="50%">
                <stop offset="40%" stopColor={effS.h} stopOpacity="0"/>
                <stop offset="70%" stopColor={effS.h} stopOpacity="0.18"/>
                <stop offset="100%" stopColor={effS.h} stopOpacity="0"/>
              </radialGradient>
            </defs>
            {/* Outer soft glow */}
            <circle cx="13" cy="13" r="13" fill="url(#lumaOuterGlow)"/>
            {/* Rotating ray group — 8 rays, alternating long/short */}
            <g style={{transformOrigin:"13px 13px",animation:"lumaRotate 22s linear infinite"}}>
              {Array.from({length:8}).map((_,i)=>{
                const ang=(i/8)*2*Math.PI;
                const isLong=i%2===0;
                const r1=8.5, r2=isLong?12.2:11;
                const x1=13+r1*Math.sin(ang), y1=13-r1*Math.cos(ang);
                const x2=13+r2*Math.sin(ang), y2=13-r2*Math.cos(ang);
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={effS.h} strokeWidth={isLong?1.6:1.1} strokeLinecap="round" style={{animation:`${i%2===0?"rayFade1":"rayFade2"} ${3+i*0.18}s ease-in-out infinite`}}/>;
              })}
            </g>
            {/* Core orb */}
            <g style={{transformOrigin:"13px 13px",animation:"lumaCoreBreath 3.4s ease-in-out infinite"}}>
              <circle cx="13" cy="13" r="6.5" fill="url(#lumaCore)"/>
              <circle cx="11" cy="11" r="1.5" fill="#FFFFFF" opacity="0.7"/>
            </g>
          </svg>
          <span style={{fontFamily:G.serif,fontWeight:600,fontSize:16,color:effS.deep,letterSpacing:0.8,lineHeight:1}}>Luma</span>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,position:"relative",gap:12}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:G.font,fontWeight:400,fontSize:10.5,color:"#9892AA",textTransform:"capitalize",letterSpacing:.6,marginBottom:3}}>
              {isEd ? (screen==="home" ? t.schedule : navItems.find(n=>n.key===screen)?.label || "") : dateStr}
            </div>
            <div style={{fontFamily:G.serif,fontWeight:500,fontSize:26,color:G.inkSoft,lineHeight:1.05,letterSpacing:-.6,display:"flex",alignItems:"center",gap:10}}>
              {isEd ? (
                <>
                  <span>{lang==="sv"?"Redigerar":"Editing"}</span>
                  <span style={{
                    width:8,height:8,borderRadius:"50%",
                    background:effS.h,
                    boxShadow:`0 0 8px ${effS.h}88, 0 0 14px ${effS.h}44`,
                    animation:"editDot 2.4s ease-in-out infinite",
                    flexShrink:0,
                  }}/>
                  <style>{`@keyframes editDot{0%,100%{opacity:0.7;transform:scale(1)}50%{opacity:1;transform:scale(1.15)}}`}</style>
                </>
              ) : (
                screen==="home" ? t.myDay : navItems.find(n=>n.key===screen)?.label || ""
              )}
            </div>
          </div>
          <button onClick={e=>{e.stopPropagation();setLang(l=>l==="sv"?"en":"sv");}} aria-label="Toggle language" className="lt-press" style={{background:"transparent",border:`1px solid ${G.border}`,borderRadius:10,padding:"8px 12px",color:G.ink2,fontFamily:G.font,fontWeight:500,cursor:"pointer",fontSize:11,flexShrink:0,letterSpacing:.4,minHeight:36}}>{lang.toUpperCase()}</button>
          {isEd&&(
            <button onClick={e=>{e.stopPropagation();setShowSet(true);}} aria-label={t.settings} className="lt-gear-btn" style={{background:"transparent",border:`1px solid ${G.border}`,borderRadius:10,padding:"8px 10px",color:G.ink2,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",height:36,minWidth:36,transition:"background .25s ease, border-color .25s ease"}}>
              <style>{`
                @keyframes gearSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
                .lt-gear-btn:hover{background:${G.cream};border-color:${G.ink3}66}
                .lt-gear-btn:hover .lt-gear-svg{animation:gearSpin 4s linear infinite}
                .lt-gear-btn:active{transform:scale(0.94)}
                .lt-gear-btn:active .lt-gear-svg{animation:gearSpin 0.6s cubic-bezier(0.32, 0.72, 0, 1)}
              `}</style>
              <svg className="lt-gear-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{transformOrigin:"center",willChange:"transform"}}>
                {/* 8-tooth gear — symmetric, premium feel */}
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          )}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{display:"flex",gap:4,flex:1,background:G.white,borderRadius:12,padding:3,border:`1px solid ${G.border}`,boxShadow:sh.xs}}>
            {screen==="home"&&!isEd&&cfg.schedView!=="card"&&<TabB active={effView==="list"} onClick={()=>setView("list")} color={effS.h} deep={effS.deep}>{t.list}</TabB>}
            {screen==="home"&&!isEd&&cfg.schedView!=="list"&&<TabB active={effView==="card"} onClick={()=>setView("card")} color={effS.h} deep={effS.deep}>{t.card}</TabB>}
            {/* Screen label on non-home screens — shows current tool when NOT editing */}
            {screen!=="home"&&!isEd&&(
              <div style={{flex:1,padding:"6px 12px",fontFamily:G.font,fontWeight:500,fontSize:11,color:effS.deep,display:"flex",alignItems:"center",gap:7,letterSpacing:.3}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:effS.h,boxShadow:`0 0 6px ${effS.h}88`}}/>
                {navItems.find(n=>n.key===screen)?.label}
              </div>
            )}
            {/* In edit mode — show clear context "Du redigerar:" label */}
            {isEd&&(
              <div style={{flex:1,padding:"6px 12px",fontFamily:G.font,fontWeight:500,fontSize:11,color:effS.deep,display:"flex",alignItems:"center",gap:7,letterSpacing:.3,minWidth:0}}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,opacity:0.7}}>
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {lang==="sv"?"Du redigerar":"Editing"}
                </span>
              </div>
            )}
            {/* Redigera / Stäng tab — available on all screens, not just home */}
            <TabB active={isEd} gold={isEd} onClick={()=>setIsEd(e=>!e)} color={effS.h} deep={effS.deep} flex={isEd?1:1}>{isEd?t.editorClose:t.editorOpen}</TabB>
          </div>
        </div>
      </div>
      {/* BODY */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div key={screen} style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",animation:"scrIn 0.4s cubic-bezier(0.32, 0.72, 0, 1) both"}}>
          <style>{`@keyframes scrIn{0%{opacity:0}100%{opacity:1}}`}</style>
          {screen==="home"&&(
          <div style={{flex:1,display:"flex",overflow:"hidden"}}>
            {sorted.length===0?(
              <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 30px 100px",gap:14}}>
                <style>{`@keyframes empBreath{0%,100%{transform:scale(1);opacity:0.7}50%{transform:scale(1.04);opacity:0.95}}`}</style>
                <svg width="56" height="56" viewBox="0 0 64 64" style={{animation:"empBreath 4.8s ease-in-out infinite"}}>
                  <circle cx="32" cy="32" r="26" fill="none" stroke={`${effS.h}55`} strokeWidth="1.4"/>
                  <circle cx="32" cy="32" r="14" fill={`${effS.h}1A`} stroke={`${effS.h}66`} strokeWidth="1.4"/>
                </svg>
                <div style={{fontFamily:G.serif,fontWeight:500,fontSize:22,color:G.inkSoft,letterSpacing:-.4,lineHeight:1.1,textAlign:"center",marginTop:2}}>{t.dayOpen}</div>
                <div style={{fontFamily:G.font,fontWeight:400,fontSize:13,color:"#9892AA",letterSpacing:.1,textAlign:"center",lineHeight:1.4}}>{t.noActs}</div>
              </div>
            ):!isEd&&active.length===0?(
              <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 30px 100px",gap:18}}>
                <style>{`@keyframes empBreath2{0%,100%{transform:scale(1);opacity:0.85}50%{transform:scale(1.025);opacity:1}}`}</style>
                <svg width="72" height="72" viewBox="0 0 64 64" style={{animation:"empBreath2 4.2s ease-in-out infinite"}}>
                  <defs>
                    <radialGradient id="hmEm" cx="40%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#FFFFFF"/>
                      <stop offset="100%" stopColor={`${curS.h}33`}/>
                    </radialGradient>
                  </defs>
                  <circle cx="32" cy="32" r="28" fill="url(#hmEm)" stroke={`${curS.h}40`} strokeWidth="1"/>
                  <path d="M22,32 L29,40 L43,24" stroke={curS.deep} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.78"/>
                </svg>
                <div style={{fontFamily:G.serif,fontWeight:500,fontSize:23,color:G.inkSoft,letterSpacing:-.4,lineHeight:1.1,textAlign:"center"}}>{t.allActsDoneTitle}</div>
              </div>
            ):effView==="card"&&!isEd?(
              <div style={{flex:1,overflowY:"auto",padding:"14px 14px 0 10px"}}>
                <CardView acts={active} onTap={item=>openDetail(item)} t={t} isEditor={isEd} onEdit={item=>{setEditAct(item);setShowEd(true);}} onMarkDone={handleDone}/>
              </div>
            ):(
              // Timeline view: Sigvard lamps + activities positioned at their times.
              // Whole timeline scrolls together so lamps stay aligned with activities.
              <TimelineView
                acts={isEd?sorted:active}
                isEd={isEd}
                cfg={cfg}
                t={t}
                onTap={item=>openDetail(item)}
                onEdit={item=>{setEditAct(item);setShowEd(true);}}
                onMarkDone={handleDone}
                now={now}
              />
            )}
          </div>
        )}
        {screen==="week"&&<WeekScreen acts={acts} dailyState={dailyState} isEd={isEd} t={t} lang={lang} now={now} cfg={cfg} onTap={openDetail} onEdit={item=>{setEditAct(item);setShowEd(true);}} onAdd={()=>{setEditAct(null);setShowEd(true);}} headerTapCount={headerTapCount}/>}
        {screen==="timer"&&<TimerScreen t={t} cfg={cfg} isEditor={isEd} setCfg={setCfg} lang={lang}/>}
        {screen==="stories"&&<StoryScreen lang={lang} t={t} isEditor={isEd} stories={stories} setStories={setStories} onOpenStory={setStoryViewer}/>}
        {screen==="emotion"&&<EmotionScreen lang={lang} t={t} cfg={cfg} isEditor={isEd} setCfg={setCfg} onInputFocusChange={setInputFocused}/>}
        {screen==="calm"&&<CalmScreen t={t} lang={lang} cfg={cfg} isEditor={isEd} setCfg={setCfg} onImmersiveChange={setImmersiveMode}/>}
        {screen==="idcard"&&<IdCardScreen t={t} lang={lang} cfg={cfg} setCfg={setCfg} isEditor={isEd}/>}
        {screen==="comm"&&<CommBoard lang={lang} t={t} isEditor={isEd} cats={commCats} setCats={setCommCats} sel={commSel} setSel={setCommSel} openModal={setCommModal}/>}
        </div>
      </div>
      {/* ADD BUTTON — shown on both Home and Week in editor mode. Single component → identical position. */}
      {(screen==="home"||screen==="week")&&isEd&&(
        <div style={{position:"absolute",bottom:"calc(110px + env(safe-area-inset-bottom, 0px))",left:"50%",transform:"translateX(-50%)",width:"calc(100% - 28px)",maxWidth:452,zIndex:10}}>
          <button onClick={()=>{setEditAct(null);setShowEd(true);}} style={{width:"100%",padding:"15px 0",borderRadius:18,border:`1.5px dashed #9DC4D880`,background:G.white,color:"#5A8AA3",fontFamily:G.font,fontWeight:700,fontSize:15,cursor:"pointer",boxShadow:`0 6px 20px #9DC4D81F`,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.addAct}</button>
        </div>
      )}
      {/* UNDO TOAST */}
      {undoToast&&(
        <div style={{position:"absolute",bottom:"calc(132px + env(safe-area-inset-bottom, 0px))",left:"50%",transform:"translateX(-50%)",zIndex:50,width:"calc(100% - 32px)",maxWidth:380,animation:"undoToastIn .55s cubic-bezier(.34,1.56,.64,1) both"}}>
          <style>{`
            @keyframes undoToastIn{0%{opacity:0;transform:translateX(-50%) translateY(40px) scale(.92)}55%{opacity:1;transform:translateX(-50%) translateY(-4px) scale(1.02)}100%{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}
            @keyframes undoBtnPulse{0%,100%{box-shadow:0 4px 12px rgba(255,255,255,0.15), 0 0 0 0 rgba(255,255,255,0.25)}50%{box-shadow:0 4px 12px rgba(255,255,255,0.25), 0 0 0 6px rgba(255,255,255,0)}}
            @keyframes undoCountdown{from{transform:scaleX(1)}to{transform:scaleX(0)}}
          `}</style>
          <div style={{position:"relative",display:"flex",alignItems:"center",gap:12,background:G.ink,borderRadius:18,padding:"12px 12px 12px 18px",boxShadow:"0 18px 50px rgba(0,0,0,0.35), 0 4px 14px rgba(0,0,0,0.2)",overflow:"hidden"}}>
            {/* Countdown progress bar at top */}
            <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:"rgba(255,255,255,0.08)",overflow:"hidden"}}>
              <div style={{height:"100%",background:`linear-gradient(90deg, ${undoToast.color}, ${undoToast.color}AA)`,transformOrigin:"left",animation:"undoCountdown 8s linear forwards"}}/>
            </div>
            <div style={{width:32,height:32,borderRadius:"50%",background:`${undoToast.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:"#fff",flexShrink:0,boxShadow:`0 4px 12px ${undoToast.color}88`}}>✓</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:G.font,fontWeight:600,fontSize:14,color:"#fff",lineHeight:1.2}}>Klart!</div>
              <div style={{fontFamily:G.font,fontSize:12,color:"rgba(255,255,255,0.7)",marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{undoToast.name}</div>
            </div>
            <button onClick={handleUndo} className="lt-press" style={{padding:"10px 16px",borderRadius:13,border:"none",background:"#fff",color:G.ink,fontFamily:G.font,fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:6,flexShrink:0,animation:"undoBtnPulse 2s ease-in-out 1.2s infinite"}}>
              <span style={{fontSize:14}}>↺</span>Ångra
            </button>
          </div>
        </div>
      )}
      {/* BOTTOM NAV — floating, soft, no hard divisions. Respects iPhone home indicator.
          Slides down out of view when navHidden is true. Two triggers feed this:
          (1) an input is focused (e.g. emotion reason field) — gives the user
          vertical space to see the form + keyboard; (2) an immersive calm
          exercise is running — chrome would break the calm moment. Both reasons
          unmount the nav with the same animation; it comes back on blur/exit. */}
      <div style={{
        background:"rgba(255,255,255,0.96)",display:"flex",
        padding:"8px 0 calc(24px + env(safe-area-inset-bottom, 0px))",
        flexShrink:0,zIndex:20,overflowX:"auto",position:"relative",
        maxHeight:navHidden?0:300,
        opacity:navHidden?0:1,
        paddingTop:navHidden?0:8,
        paddingBottom:navHidden?0:"calc(24px + env(safe-area-inset-bottom, 0px))",
        overflow:navHidden?"hidden":"auto",
        pointerEvents:navHidden?"none":"auto",
        transition:"max-height .35s cubic-bezier(0.32, 0.72, 0, 1), opacity .25s ease, padding .35s cubic-bezier(0.32, 0.72, 0, 1)",
      }}>
        {/* Hairline gradient instead of solid border — softens the system edge */}
        <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg, transparent 0%, rgba(31,27,46,0.06) 50%, transparent 100%)",pointerEvents:"none"}}/>
        <style>{`@keyframes navUnderSoft{0%{transform:scaleX(0);opacity:0}100%{transform:scaleX(1);opacity:1}}`}</style>
        {navItems.map(({key,icon,label,S})=>{const on=screen===key;return(
          <button key={key} onClick={()=>{setScreen(key);}} className="lt-press" style={{flex:navItems.length<=5?1:"0 0 auto",minWidth:navItems.length<=5?0:64,border:"none",background:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"8px 6px 4px",position:"relative"}}>
            {/* Soft active halo — barely visible bloom, no hard ring */}
            {on&&<div style={{position:"absolute",top:2,left:"50%",transform:"translateX(-50%)",width:46,height:32,borderRadius:16,background:`radial-gradient(ellipse at center, ${S.h}1F 0%, ${S.h}00 70%)`,pointerEvents:"none",animation:"navHaloIn .45s cubic-bezier(0.32, 0.72, 0, 1) both"}}/>}
            <div style={{position:"relative",height:24,display:"flex",alignItems:"center",justifyContent:"center",transform:on?"scale(1.08)":"scale(1)",transition:"transform .4s cubic-bezier(0.34, 1.56, 0.64, 1)"}}>
              <NavIcon type={icon} active={on} color={S.deep} size={22}/>
            </div>
            <span style={{fontFamily:G.font,fontWeight:on?500:400,fontSize:10.5,color:on?S.deep:"#9892AA",transition:"color .35s ease, font-weight .35s ease",whiteSpace:"nowrap",position:"relative",letterSpacing:.2}}>{label}</span>
            {/* Subtle dot indicator instead of solid bar — quieter active state */}
            {on&&<div style={{width:4,height:4,borderRadius:"50%",background:S.h,marginTop:1,boxShadow:`0 0 4px ${S.h}88`,animation:"navUnderSoft .4s cubic-bezier(0.32, 0.72, 0, 1) both",transformOrigin:"center"}}/>}
            <style>{`@keyframes navHaloIn{0%{opacity:0;transform:translateX(-50%) scale(0.85)}100%{opacity:1;transform:translateX(-50%) scale(1)}}`}</style>
          </button>
        );})}
      </div>
      {/* MODALS */}
      {detail&&(()=>{
        const dKey=detail.dKey||todayKey;
        const item=detail.item;
        const dayState=getDayState(item.id,dKey);
        const isToday=dKey===todayKey;
        return(
          <ActivityDetail
            item={item}
            stepsDone={dayState.stepsDone}
            readOnly={!isToday}
            onClose={()=>setDetail(null)}
            onCheck={isToday?handleCheck:undefined}
            t={t}
          />
        );
      })()}
      {showEd&&<EditModal item={editAct} onSave={handleSave} onDel={handleDel} onClose={()=>setShowEd(false)} t={t} existingActs={acts}/>}
      {commModal&&<CommModals modal={commModal} onClose={()=>setCommModal(null)} cats={commCats} setCats={setCommCats} lang={lang} t={t} setSel={setCommSel}/>}
      {showSet&&<SettingsModal cfg={cfg} setCfg={setCfg} shareCode={shareCode} onClose={()=>setShowSet(false)} t={t} lang={lang} onOpenSupervisor={openSupervisor} onOpenDemo={openDemo} onOpenWelcomeTour={openWelcomeTour}/>}
      {showDemo&&<DemoTour onClose={closeDemo}/>}
      {/* StoryViewer rendered HERE at App root — not inside StoryScreen —
          so its position:fixed escapes the screen-container's animation context
          and truly covers the viewport including the bottom tab bar. */}
      {storyViewer&&<StoryViewer story={storyViewer} lang={lang} t={t} onClose={()=>setStoryViewer(null)}/>}
      {startAlert&&<ActivityStartAlert activity={startAlert} onDismiss={dismissStartAlert} onOpen={openStartAlertActivity} t={t} lang={lang}/>}
      {showOnboarding&&(
        <div style={{position:"fixed",inset:0,zIndex:9500,background:"rgba(31,27,46,0.5)",backdropFilter:"blur(10px)",display:"flex",alignItems:"center",justifyContent:"center",padding:24,animation:"ftIn .3s ease"}} onClick={finishOnboarding}>
          <div onClick={e=>e.stopPropagation()} style={{maxWidth:380,width:"100%",background:G.white,borderRadius:28,padding:"40px 30px 30px",boxShadow:"0 24px 60px rgba(0,0,0,0.25)",border:`1px solid ${G.border}`,position:"relative"}}>
            {/* Luma mark — animated sun, centered above brand name */}
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14,marginBottom:26}}>
              <svg width={64} height={64} viewBox="0 0 26 26" style={{overflow:"visible"}}>
                <defs>
                  <radialGradient id="onbCore" cx="35%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#FFFFFF"/>
                    <stop offset="20%" stopColor="#FFFAF0" stopOpacity="0.95"/>
                    <stop offset="55%" stopColor={SCREENS.home.h}/>
                    <stop offset="100%" stopColor={SCREENS.home.deep}/>
                  </radialGradient>
                  <radialGradient id="onbOuter" cx="50%" cy="50%" r="50%">
                    <stop offset="40%" stopColor={SCREENS.home.h} stopOpacity="0"/>
                    <stop offset="70%" stopColor={SCREENS.home.h} stopOpacity="0.18"/>
                    <stop offset="100%" stopColor={SCREENS.home.h} stopOpacity="0"/>
                  </radialGradient>
                </defs>
                <circle cx="13" cy="13" r="13" fill="url(#onbOuter)"/>
                <g style={{transformOrigin:"13px 13px",animation:"lumaRotate 22s linear infinite"}}>
                  {Array.from({length:8}).map((_,i)=>{
                    const ang=(i/8)*2*Math.PI;
                    const isLong=i%2===0;
                    const r1=8.5, r2=isLong?12.2:11;
                    const x1=13+r1*Math.sin(ang), y1=13-r1*Math.cos(ang);
                    const x2=13+r2*Math.sin(ang), y2=13-r2*Math.cos(ang);
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={SCREENS.home.h} strokeWidth={isLong?1.6:1.1} strokeLinecap="round" style={{animation:`${i%2===0?"rayFade1":"rayFade2"} ${3+i*0.18}s ease-in-out infinite`}}/>;
                  })}
                </g>
                <g style={{transformOrigin:"13px 13px",animation:"lumaCoreBreath 3.4s ease-in-out infinite"}}>
                  <circle cx="13" cy="13" r="6.5" fill="url(#onbCore)"/>
                  <circle cx="11" cy="11" r="1.5" fill="#FFFFFF" opacity="0.7"/>
                </g>
              </svg>
              <span style={{fontFamily:G.serif,fontWeight:600,fontSize:36,color:G.ink,letterSpacing:0.4,lineHeight:1}}>Luma</span>
            </div>
            {/* Soul of the app — one calm sentence. The interactive demo (next)
                takes care of teaching the user "where to tap". */}
            <div style={{fontFamily:G.serif,fontWeight:500,fontSize:19,color:G.ink,textAlign:"center",letterSpacing:-.3,marginBottom:10,lineHeight:1.3}}>
              {lang==="sv"?"En dag, ett steg i taget":"A day, one step at a time"}
            </div>
            <div style={{fontFamily:G.font,fontSize:14,color:G.ink2,textAlign:"center",lineHeight:1.55,marginBottom:30,maxWidth:300,marginLeft:"auto",marginRight:"auto"}}>
              {lang==="sv"
                ?"Anpassa själv — eller låt någon hjälpa till."
                :"Make it your own — or let someone help."}
            </div>
            <button onClick={finishOnboarding} className="lt-press" style={{width:"100%",padding:"15px 0",borderRadius:14,border:"none",background:`linear-gradient(135deg,${SCREENS.home.h},${SCREENS.home.deep})`,color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:15,cursor:"pointer",boxShadow:sh.c(SCREENS.home.h),letterSpacing:0.3}}>
              {lang==="sv"?"Visa mig":"Show me"}
            </button>
          </div>
        </div>
      )}
      {showSupervisor&&<SupervisorDemo onClose={()=>setShowSupervisor(false)} onOpenClient={openClient} lang={lang}/>}
      {/* Active client banner — shown when editing a client through supervisor view */}
      {supervisorClient&&!showSupervisor&&(
        <div style={{position:"fixed",top:0,left:0,right:0,zIndex:50,background:`linear-gradient(135deg,${supervisorClient.color},${supervisorClient.color}DC)`,color:"#fff",padding:"8px 16px",display:"flex",alignItems:"center",gap:10,boxShadow:"0 4px 14px rgba(0,0,0,0.15)",fontFamily:G.font,fontSize:12,fontWeight:600,letterSpacing:0.2}}>
          <span style={{fontSize:14}}>{supervisorClient.emoji}</span>
          <span style={{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lang==="sv"?"Redigerar":"Editing"}: <strong>{supervisorClient.name}</strong></span>
          <button onClick={closeClient} style={{padding:"5px 11px",borderRadius:9,border:"none",background:"rgba(255,255,255,0.22)",color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:11,cursor:"pointer",backdropFilter:"blur(4px)"}}>← {lang==="sv"?"Tillbaka":"Back"}</button>
        </div>
      )}
      </div>
    </div>
  );
}
