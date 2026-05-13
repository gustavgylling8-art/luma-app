import { useState, useEffect, useRef } from "react";

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
  comm:    { h:"#8AAFD2", hl:"#EBF1F8", hll:"#F6FAFD", hb:"#F4F9FD", soft:"#BFD3E6", deep:"#587FA8" },
  stories: { h:"#C9A875", hl:"#FAF2E4", hll:"#FDF9F0", hb:"#FCF7EC", soft:"#E5CEA0", deep:"#8C7038" },
  calm:    { h:"#A8C9B0", hl:"#EFF5F0", hll:"#F8FBF8", hb:"#F4F9F4", soft:"#CFDED2", deep:"#688D72" },
  idcard:  { h:"#D88B8B", hl:"#FAEAEA", hll:"#FDF5F5", hb:"#FCF3F3", soft:"#EDB8B8", deep:"#A35858" },
  tools:   { h:"#D9886B", hl:"#F8ECE5", hll:"#FCF7F3", hb:"#FBF5EE", soft:"#EDC1AE", deep:"#A2604A" },
};

const G = {
  ink:"#1F1B2E", ink2:"#6E6882", ink3:"#A8A4BB",
  white:"#FFFFFF", cream:"#FCFBFE", border:"#EEEAF5", border2:"#E0DBEF",
  font:"'Inter',system-ui,sans-serif",
  serif:"'General Sans','Inter',system-ui,sans-serif",
};

const sh = {
  xs:"0 1px 2px rgba(31,27,46,0.04), 0 1px 1px rgba(31,27,46,0.03)",
  sm:"0 1px 3px rgba(31,27,46,0.04), 0 4px 12px rgba(31,27,46,0.05)",
  md:"0 2px 6px rgba(31,27,46,0.04), 0 12px 30px rgba(31,27,46,0.09), 0 4px 10px rgba(31,27,46,0.04)",
  lg:"0 4px 12px rgba(31,27,46,0.06), 0 24px 60px rgba(31,27,46,0.12), 0 8px 20px rgba(31,27,46,0.06)",
  c: col=>`0 2px 5px ${col}1A, 0 10px 26px ${col}3D, 0 4px 10px ${col}22`,
};

const ACT_C=["#E89B89","#C2607A","#8FBFA1","#9683C2","#D9B868","#8AAFD2","#B58CD0","#E89A9A","#7CB8A0","#8E92D2"];
const TMR_C=["#E89B89","#C2607A","#D9B868","#8FBFA1","#9683C2","#8AAFD2","#B58CD0","#E89A9A","#1F1B2E"];

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

const CFG0={cardStyle:"normal",schedView:"both",showSigvard:true,tools:{timer:true,emotion:true,comm:true,stories:true,calm:true,idcard:true,tools:true},timerCfg:{allowedTypes:["sector","ring","dots","wave","sun","lava"],defaultType:"sector",defaultMin:5,defaultColor:"#8AAFD2"},visibleEmotions:[1,2,3,4,5],calmTools:{breath:true,grounding:true},idCard:{name:"",photo:null,age:"",condition:"",triggers:"",helpful:"",contacts:[]},toolsVisible:{firstthen:true,choices:true,rewards:true,recipes:true}};

const TR={
  sv:{other:"EN",myDay:"Min dag",editorOpen:"Redaktör",editorClose:"Stäng",list:"Lista",card:"Kort",noActs:"Inga aktiviteter – öppna Redaktör",addAct:"+ Ny aktivitet",save:"Spara",cancel:"Avbryt",actName:"Aktivitetsnamn",actTime:"Tid",pickEmoji:"Välj emoji",pickColor:"Färg",steps:"Checklista",stepPH:"t.ex. Ta på skorna",timerAct:"Timer – aktivitet",timerType:"Timertyp",timerMin:"Minuter",timerColor:"Timerfärg",sector:"Time Timer",ring:"Ring",dots:"Timstock",wave:"Våg",sun:"Sol",lava:"Lava",pause:"Paus",resume:"Starta",reset:"Nollställ",next:"Nästa",prev:"Tillbaka",min:"min",settings:"Inställningar",cardStyle:"Kortstil",styleNormal:"Normal",styleCompact:"Kompakt",styleBig:"Stor",syncTitle:"Delning",sameDevice:"Samma enhet",syncMode:"Via kod",sameDeviceDesc:"Redaktör & användarvy på samma enhet.",syncModeDesc:"Dela schema via kod.",yourCode:"Din kod",codeHint:"Ge koden till användaren",enterCode:"Ange kod",connect:"Anslut",wrongCode:"Hittade inget.",copied:"Kopierad ✓",openTimer:"Starta timer",allDoneMsg:"Bra jobbat! 🌟",emotions:"Hur mår du?",emotionSaved:"Sparat! ✓",emotionReason:"Varför?",emotionHistory:"Historik",noHistory:"Ingen historik",toolsTimer:"Timer",toolsEmotion:"Känsla",home:"Hem",comm:"Tala",sigvardOn:"Sigvard-lampor",visibleTools:"Synliga verktyg",schedView:"Schemavy",viewBoth:"Lista + Kort",viewList:"Endast lista",viewCard:"Endast kort",addCard:"+ Nytt kort",addCat:"+ Ny kategori",catName:"Kategorinamn",autoTimer:"Synkas med starttid",preview:"Förhandsgranskning",startTimer:"Starta",timerSettings:"Timerinst. för användarvyn",allowedTimers:"Tillåtna timers",defaultTimer:"Standardtimer",visibleEmotions:"Synliga känslor",enlarge:"Förstora",cardImage:"Bild",uploadPhoto:"Ladda upp foto",useEmoji:"Använd emoji istället",stories:"Berättelser",newStory:"Ny berättelse",storyTitle:"Titel",pages:"Sidor",addPage:"+ Lägg till sida",pageNum:"Sida",storyText:"Text på sidan",noStories:"Inga berättelser – öppna Redaktör för att skapa",renameCat:"Byt namn på kategori",calm:"Lugn",calmTitle:"Hitta lugnet",breathing:"Andas",grounding:"54321",breathIn:"Andas in",breathHold:"Håll",breathOut:"Andas ut",breathDone:"Bra jobbat 🌿",groundIntro:"Stanna upp. Vi gör det här tillsammans.",groundStart:"Börja",see5:"5 saker du kan se",hear4:"4 saker du kan höra",touch3:"3 saker du kan röra",smell2:"2 saker du kan lukta",taste1:"1 sak du kan smaka",iAmHere:"Jag är här. Jag är trygg.",roundsDone:"Klar",calmSettings:"Lugn – övningar",idcard:"Mitt kort",myName:"Mitt namn",myAge:"Ålder",aboutMe:"Om mig",myTriggers:"Det här kan vara svårt",whatHelps:"Det här hjälper mig",emergencyContacts:"Ring",contactName:"Namn",contactPhone:"Telefon",contactRelation:"Relation",addContact:"+ Lägg till kontakt",call:"Ring",idHint:"Visa det här till någon som vill hjälpa","editCard":"Redigera mitt kort",tools:"Verktyg",firstthen:"Först-Sedan",choices:"Val",rewards:"Belöning",recipes:"Recept",first:"Först",then:"Sedan",ftDone:"Klart!",chQuestion:"Vad vill du?",chTap:"Tryck för att välja",stars:"stjärnor",goalReached:"Du har tjänat din belöning! 🎉",reward:"Belöning",starsGoal:"Mål – antal stjärnor",addChoice:"+ Nytt val",newCategory:"+ Ny kategori",rewardEmoji:"Emoji",rewardText:"Belöning",ingredients:"Ingredienser",instructions:"Så gör du",servings:"Portioner",time:"Tid",newRecipe:"Nytt recept",step:"Steg",addStep:"+ Lägg till steg",useReward:"Ge stjärna när klar",resetStars:"Nollställ stjärnor",starsEarned:"Stjärnor intjänade",bannerNowOngoing:"Pågår nu",bannerNextUp:"Nästa aktivitet",bannerDayLabel:"Dagen",bannerNoActsLeft:"Inga aktiviteter kvar",close:"Stäng"},
  en:{other:"SV",myDay:"My Day",editorOpen:"Editor",editorClose:"Close",list:"List",card:"Cards",noActs:"No activities – open Editor",addAct:"+ New activity",save:"Save",cancel:"Cancel",actName:"Activity name",actTime:"Time",pickEmoji:"Pick emoji",pickColor:"Colour",steps:"Checklist",stepPH:"e.g. Put on shoes",timerAct:"Timer – activity",timerType:"Timer type",timerMin:"Minutes",timerColor:"Timer colour",sector:"Time Timer",ring:"Ring",dots:"Dot timer",wave:"Wave",sun:"Sun",lava:"Lava",pause:"Pause",resume:"Start",reset:"Reset",next:"Next",prev:"Back",min:"min",settings:"Settings",cardStyle:"Card style",styleNormal:"Normal",styleCompact:"Compact",styleBig:"Large",syncTitle:"Sharing",sameDevice:"Same device",syncMode:"Via code",sameDeviceDesc:"Editor & user view on same device.",syncModeDesc:"Share schedule via code.",yourCode:"Your code",codeHint:"Give this code to the user",enterCode:"Enter code",connect:"Connect",wrongCode:"Not found.",copied:"Copied ✓",openTimer:"Start timer",allDoneMsg:"Great job! 🌟",emotions:"How are you?",emotionSaved:"Saved! ✓",emotionReason:"Why?",emotionHistory:"History",noHistory:"No history",toolsTimer:"Timer",toolsEmotion:"Mood",home:"Home",comm:"Talk",sigvardOn:"Sigvard lamps",visibleTools:"Visible tools",schedView:"Schedule view",viewBoth:"List + Cards",viewList:"List only",viewCard:"Cards only",addCard:"+ New card",addCat:"+ New category",catName:"Category name",autoTimer:"Syncs with start time",preview:"Preview",startTimer:"Start",timerSettings:"Timer settings for user view",allowedTimers:"Allowed timers",defaultTimer:"Default timer",visibleEmotions:"Visible emotions",enlarge:"Enlarge",cardImage:"Image",uploadPhoto:"Upload photo",useEmoji:"Use emoji instead",stories:"Stories",newStory:"New story",storyTitle:"Title",pages:"Pages",addPage:"+ Add page",pageNum:"Page",storyText:"Page text",noStories:"No stories – open Editor to create",renameCat:"Rename category",calm:"Calm",calmTitle:"Find calm",breathing:"Breathe",grounding:"54321",breathIn:"Breathe in",breathHold:"Hold",breathOut:"Breathe out",breathDone:"Well done 🌿",groundIntro:"Pause. Let's do this together.",groundStart:"Begin",see5:"5 things you can see",hear4:"4 things you can hear",touch3:"3 things you can touch",smell2:"2 things you can smell",taste1:"1 thing you can taste",iAmHere:"I am here. I am safe.",roundsDone:"Done",calmSettings:"Calm – exercises",idcard:"My card",myName:"My name",myAge:"Age",aboutMe:"About me",myTriggers:"This can be hard",whatHelps:"This helps me",emergencyContacts:"Call",contactName:"Name",contactPhone:"Phone",contactRelation:"Relation",addContact:"+ Add contact",call:"Call",idHint:"Show this to someone who wants to help","editCard":"Edit my card",tools:"Tools",firstthen:"First-Then",choices:"Choices",rewards:"Reward",recipes:"Recipes",first:"First",then:"Then",ftDone:"Done!",chQuestion:"What do you want?",chTap:"Tap to choose",stars:"stars",goalReached:"You've earned your reward! 🎉",reward:"Reward",starsGoal:"Goal – number of stars",addChoice:"+ New choice",newCategory:"+ New category",rewardEmoji:"Emoji",rewardText:"Reward",ingredients:"Ingredients",instructions:"How to make it",servings:"Servings",time:"Time",newRecipe:"New recipe",step:"Step",addStep:"+ Add step",useReward:"Give star when done",resetStars:"Reset stars",starsEarned:"Stars earned",bannerNowOngoing:"Happening now",bannerNextUp:"Next up",bannerDayLabel:"Today",bannerNoActsLeft:"Nothing left today",close:"Close"},
};

const TTYPES=["sector","ring","dots","wave","sun","lava"];
const TICON={sector:"🕐",ring:"⭕",dots:"⚫",wave:"🌊",sun:"☀️",lava:"🌋"};
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

function TCtrl({c,color,t}){
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,width:"100%",maxWidth:280,marginTop:20}}>
      <style>{`@keyframes runPulse{0%,100%{box-shadow:0 8px 24px ${color}55, 0 2px 6px ${color}33}50%{box-shadow:0 12px 36px ${color}77, 0 4px 12px ${color}44}}`}</style>
      {!c.done&&<button onClick={()=>c.setRun(r=>!r)} onMouseDown={e=>e.currentTarget.style.transform="scale(0.97)"} onMouseUp={e=>e.currentTarget.style.transform=""} onMouseLeave={e=>e.currentTarget.style.transform=""} style={{width:"100%",padding:"15px 0",borderRadius:16,border:"none",fontFamily:G.font,fontWeight:700,fontSize:15,cursor:"pointer",background:c.run?`linear-gradient(135deg,${color},${color}DC)`:G.ink,color:"#fff",boxShadow:c.run?sh.c(color):sh.sm,transition:"transform .15s, background .25s",animation:c.run?"runPulse 2.6s ease-in-out infinite":"none"}}>{c.run?`⏸ ${t.pause}`:`▶ ${t.resume}`}</button>}
      <button onClick={c.reset} onMouseDown={e=>e.currentTarget.style.transform="scale(0.97)"} onMouseUp={e=>e.currentTarget.style.transform=""} onMouseLeave={e=>e.currentTarget.style.transform=""} style={{width:"100%",padding:"12px 0",borderRadius:16,border:`1px solid ${G.border}`,background:G.white,color:G.ink2,fontFamily:G.font,fontWeight:600,fontSize:13,cursor:"pointer",transition:"transform .15s, background .2s, border-color .2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=`${color}66`;e.currentTarget.style.color=color;}}>↺ {t.reset}</button>
    </div>
  );
}

function DoneBadge({color}){return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:18,padding:"40px 0"}}><style>{`@keyframes scUp{from{transform:scale(.2);opacity:0}to{transform:scale(1);opacity:1}}@keyframes dsh{from{stroke-dashoffset:302}to{stroke-dashoffset:0}}@keyframes chk{from{stroke-dashoffset:70}to{stroke-dashoffset:0}}@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}`}</style><svg width={120} height={120} style={{animation:"scUp .5s cubic-bezier(.34,1.56,.64,1),pulse 2s ease-in-out .6s infinite"}}><defs><radialGradient id="dg"><stop offset="0%" stopColor={`${color}26`}/><stop offset="100%" stopColor={`${color}08`}/></radialGradient></defs><circle cx={60} cy={60} r={56} fill="url(#dg)"/><circle cx={60} cy={60} r={48} fill="none" stroke={color} strokeWidth={2.5} strokeDasharray={302} style={{animation:"dsh .7s ease forwards"}}/><path d="M38,60 L52,75 L82,42" stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray={70} style={{animation:"chk .45s .25s ease forwards"}}/></svg><div style={{fontFamily:G.serif,fontWeight:600,fontSize:26,color}}>Klar! 🎉</div></div>);}

/* ═══ SECTOR TIME TIMER (numbers CCW from top — like a real Time Timer) ═══ */
function SectorTimer({totalSec,color,t,autoRun=false,size=240,showCtrl=true}){
  const c=useTimer(totalSec,autoRun);
  if(c.done) return <DoneBadge color={color}/>;
  const cx=size/2, cy=size/2, R=size/2-24;
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
      {showCtrl&&<TCtrl c={c} color={color} t={t}/>}
    </div>
  );
}

/* ═══ RING (Minee-style donut) ═══ */
function RingTimer({totalSec,color,t,autoRun=false,size=240,showCtrl=true}){
  const c=useTimer(totalSec,autoRun);
  if(c.done) return <DoneBadge color={color}/>;
  const cx=size/2, cy=size/2;
  const Ro=size/2-22;       // outer radius
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
      {showCtrl&&<TCtrl c={c} color={color} t={t}/>}
    </div>
  );
}

/* ═══ DOTS / Timstock 2.0 — premium horizontal LED row, color from user ═══ */
function DotsTimer({totalSec,color,t,autoRun=false,size=240,showCtrl=true}){
  const c=useTimer(totalSec,autoRun);
  if(c.done) return <DoneBadge color={color}/>;
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
  const lampLabel = mpl===1 ? "1 lampa = 1 minut" : `1 lampa = ${mpl} minuter`;

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
      {showCtrl&&<TCtrl c={c} color={color} t={t}/>}
    </div>
  );
}

/* ═══ WAVE ═══ */
function WaveTimer({totalSec,color,t,autoRun=false,size=240,showCtrl=true}){
  const c=useTimer(totalSec,autoRun);
  if(c.done) return <DoneBadge color={color}/>;
  const W=size, H=Math.round(size*0.65);
  const fillY=H*(1-c.pct);
  const phase=useRef(0);
  const[,tick]=useState(0);
  useEffect(()=>{if(!c.run)return;const id=setInterval(()=>{phase.current+=0.08;tick(x=>x+1);},50);return()=>clearInterval(id);},[c.run]);
  const wave=(o,a)=>{let d=`M0,${fillY+o}`;for(let x=0;x<=W;x+=3)d+=` L${x},${fillY+o+Math.sin(x*0.05+phase.current+o*0.1)*a}`;return d+` L${W},${H} L0,${H} Z`;};
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:18}}>
      <div style={{position:"relative",borderRadius:24,overflow:"hidden",width:W,height:H,background:`linear-gradient(180deg,${color}08,${color}14)`,border:`1px solid ${color}30`,boxShadow:sh.md}}>
        <svg width={W} height={H} style={{position:"absolute",inset:0}}>
          <defs>
            <linearGradient id={`wg${size}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.5"/><stop offset="100%" stopColor={color} stopOpacity="0.9"/></linearGradient>
            <linearGradient id={`wg2${size}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3"/><stop offset="100%" stopColor={color} stopOpacity="0.7"/></linearGradient>
          </defs>
          <path d={wave(6,8)} fill={`url(#wg2${size})`}/>
          <path d={wave(0,9)} fill={`url(#wg${size})`}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontFamily:G.serif,fontWeight:600,fontSize:size*0.14,color:c.pct>0.38?"#fff":G.ink,textShadow:c.pct>0.38?"0 2px 8px rgba(0,0,0,.2)":"none",fontVariantNumeric:"tabular-nums"}}>{c.label}</span>
        </div>
      </div>
      {showCtrl&&<TCtrl c={c} color={color} t={t}/>}
    </div>
  );
}

/* ═══ SUN ═══ */
function SunTimer({totalSec,color,t,autoRun=false,size=240,showCtrl=true}){
  const c=useTimer(totalSec,autoRun);
  // Smooth animation tick via rAF so the sun moves continuously, not stepwise
  const[,tick]=useState(0);
  const rafRef=useRef(null);
  useEffect(()=>{
    if(c.done){if(rafRef.current)cancelAnimationFrame(rafRef.current);return;}
    const loop=()=>{tick(x=>x+1);rafRef.current=requestAnimationFrame(loop);};
    rafRef.current=requestAnimationFrame(loop);
    return()=>{if(rafRef.current)cancelAnimationFrame(rafRef.current);};
  },[c.done]);
  if(c.done) return <DoneBadge color={color}/>;

  const W=size, H=Math.round(size*0.85);
  const gY=H-Math.round(H*0.14); // horizon line

  // ease the pct curve so the sun drops faster at the end
  const raw=c.pct; // 1 → 0
  // Most of time: gentle descent. Final 8%: rapid plunge.
  const elapsed=1-raw;
  let progress;
  if(elapsed<0.92){
    // gentle phase: ease-in-out cubic
    const e=elapsed/0.92;
    progress=e*e*(3-2*e)*0.85;
  } else {
    // plunge phase — last 8% takes sun the remaining 15% of the screen
    const e=(elapsed-0.92)/0.08;
    progress=0.85+Math.pow(e,1.5)*0.15;
  }

  const sunR=Math.round(size*0.13);
  // Sun position: starts above near top, ends well below horizon
  const skyTopMargin=Math.round(size*0.10);
  const horizonY=gY;
  // sun centre travels from skyTopMargin to (horizonY + sunR*1.8) — disappears under horizon
  const sunCenterY=skyTopMargin+progress*(horizonY+sunR*1.8-skyTopMargin);
  // visible sun portion (clipped at horizon)
  const sunVisible=sunCenterY<horizonY+sunR;

  // Sun color warms as it descends (yellow → orange → red)
  const warmth=Math.min(1,Math.max(0,(progress-0.4)/0.5));
  // Sun core stays bright, edge warms up
  const sunCenterColor="#FFF6D8";
  const sunMidColor=`rgb(${255},${Math.round(220-warmth*70)},${Math.round(140-warmth*100)})`;
  const sunEdgeColor=`rgb(${255-Math.round(warmth*20)},${Math.round(170-warmth*70)},${Math.round(80-warmth*60)})`;

  // Sky gradient transitions through the day
  // 0 (start, full day): light blue → soft blue
  // 0.4 (afternoon): warm yellow tint → blue
  // 0.7 (sunset): orange → pink → purple
  // 0.95+ (night): deep blue → indigo
  const skyTopHue=(()=>{
    if(progress<0.4) return `hsl(208,70%,${72-progress*8}%)`;
    if(progress<0.7) return `hsl(${Math.round(208-(progress-0.4)*180)},75%,${68-progress*15}%)`;
    if(progress<0.92) return `hsl(${Math.round(28-(progress-0.7)*60)},75%,${58-(progress-0.7)*30}%)`;
    return `hsl(${Math.round(265-progress*20)},55%,${28-progress*15}%)`;
  })();
  const skyBotHue=(()=>{
    if(progress<0.4) return `hsl(${Math.round(38-progress*10)},90%,${85-progress*5}%)`;
    if(progress<0.7) return `hsl(${Math.round(32-(progress-0.4)*10)},92%,${82-(progress-0.4)*25}%)`;
    if(progress<0.92) return `hsl(${Math.round(20-(progress-0.7)*15)},88%,${68-(progress-0.7)*40}%)`;
    return `hsl(${Math.round(280-progress*20)},45%,${35-progress*15}%)`;
  })();

  // Water (instead of grass) — calm sea reflecting sky
  const waterTop=progress<0.7
    ?`hsl(${200-progress*5},55%,${52-progress*10}%)`
    :`hsl(${Math.round(220-progress*10)},45%,${30-(progress-0.7)*55}%)`;
  const waterBot=progress<0.7
    ?`hsl(${210-progress*5},65%,${38-progress*15}%)`
    :`hsl(${Math.round(225-progress*5)},55%,${15-(progress-0.7)*40}%)`;

  // Glow around sun — gets warmer/larger as it descends
  const glowR=sunR*(2.4+warmth*1.0);
  const glowOpacity=Math.max(0.18,(1-progress*0.35)*0.8);

  // Stars appear in the final phase
  const starOpacity=Math.max(0,(progress-0.78)/0.22);
  const stars=[
    {x:0.12,y:0.10},{x:0.22,y:0.22},{x:0.35,y:0.08},{x:0.48,y:0.18},
    {x:0.62,y:0.10},{x:0.74,y:0.24},{x:0.85,y:0.12},{x:0.92,y:0.30},
    {x:0.18,y:0.36},{x:0.55,y:0.30},{x:0.78,y:0.42},
  ];

  // Sun's reflection on water — a vertical shimmering streak from horizon to bottom
  const showReflection=sunCenterY>horizonY-sunR*3 && progress<0.96;
  // Reflection grows brighter as sun nears horizon
  const reflectionStrength=showReflection
    ?Math.min(1,Math.max(0,1-Math.abs(sunCenterY-horizonY)/(sunR*4)))
    :0;

  // Clouds — soft horizontal wisps that drift through the sky
  // We use sin-waves to subtly animate position
  const now=Date.now()/1000;
  const cloudColor=progress<0.45
    ?"rgba(255,255,255,0.85)"
    :progress<0.75
      ?`hsla(${Math.round(30-(progress-0.45)*15)},75%,80%,0.82)`
      :`hsla(${Math.round(285-progress*15)},25%,55%,0.45)`;

  // Subtle horizon shimmer (orange band)
  const horizonGlow=progress>0.5&&progress<0.95?Math.min(1,(progress-0.5)/0.25)*(1-(progress-0.85)/0.1):0;

  const uid=`s${size}`;
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
      <svg width={W} height={H} style={{borderRadius:24,overflow:"hidden",boxShadow:sh.md,border:`1px solid ${G.border}`}}>
        <defs>
          <linearGradient id={`sky${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={skyTopHue}/>
            <stop offset="55%" stopColor={skyTopHue}/>
            <stop offset="100%" stopColor={skyBotHue}/>
          </linearGradient>
          <linearGradient id={`gnd${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={waterTop}/>
            <stop offset="100%" stopColor={waterBot}/>
          </linearGradient>
          <radialGradient id={`sun${uid}`}>
            <stop offset="0%" stopColor={sunCenterColor} stopOpacity="1"/>
            <stop offset="45%" stopColor={sunMidColor} stopOpacity="1"/>
            <stop offset="100%" stopColor={sunEdgeColor} stopOpacity="1"/>
          </radialGradient>
          <radialGradient id={`glow${uid}`}>
            <stop offset="0%" stopColor={sunMidColor} stopOpacity={glowOpacity}/>
            <stop offset="40%" stopColor={sunEdgeColor} stopOpacity={glowOpacity*0.5}/>
            <stop offset="100%" stopColor={sunEdgeColor} stopOpacity="0"/>
          </radialGradient>
          <linearGradient id={`hg${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(28,90%,70%)" stopOpacity="0"/>
            <stop offset="100%" stopColor="hsl(20,95%,65%)" stopOpacity={horizonGlow*0.6}/>
          </linearGradient>
          <linearGradient id={`reflect${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={sunMidColor} stopOpacity={reflectionStrength*0.55}/>
            <stop offset="100%" stopColor={sunMidColor} stopOpacity="0"/>
          </linearGradient>
          <clipPath id={`sc${uid}`}>
            <rect x={0} y={0} width={W} height={horizonY}/>
          </clipPath>
          <clipPath id={`wc${uid}`}>
            <rect x={0} y={horizonY} width={W} height={H-horizonY}/>
          </clipPath>
          <filter id={`blur${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={Math.max(2,size*0.012)}/>
          </filter>
        </defs>

        {/* Sky */}
        <rect x={0} y={0} width={W} height={horizonY} fill={`url(#sky${uid})`}/>

        {/* Horizon glow band */}
        {horizonGlow>0&&<rect x={0} y={horizonY-Math.round(H*0.22)} width={W} height={Math.round(H*0.22)} fill={`url(#hg${uid})`}/>}

        {/* Soft drifting clouds */}
        <g clipPath={`url(#sc${uid})`} opacity={Math.max(0.35,1-progress*0.6)}>
          {[
            {y:0.18,w:0.45,h:0.045,seed:0.3,speed:0.015},
            {y:0.28,w:0.32,h:0.038,seed:0.7,speed:0.022},
            {y:0.42,w:0.38,h:0.042,seed:0.15,speed:0.018},
          ].map((c,i)=>{
            const driftX=((now*c.speed+c.seed)%1.4-0.2);
            const cx=driftX*W;
            const cy=c.y*horizonY;
            const cw=c.w*W, ch=c.h*horizonY;
            return(
              <g key={i} fill={cloudColor} filter={`url(#blur${uid})`}>
                <ellipse cx={cx} cy={cy} rx={cw*0.35} ry={ch}/>
                <ellipse cx={cx+cw*0.25} cy={cy-ch*0.2} rx={cw*0.3} ry={ch*0.9}/>
                <ellipse cx={cx+cw*0.5} cy={cy+ch*0.1} rx={cw*0.32} ry={ch*0.85}/>
                <ellipse cx={cx+cw*0.7} cy={cy-ch*0.1} rx={cw*0.25} ry={ch*0.8}/>
              </g>
            );
          })}
        </g>

        {/* Stars (above horizon) */}
        {starOpacity>0&&stars.map((s,i)=>(
          <circle key={i} cx={s.x*W} cy={s.y*horizonY} r={0.9+((i*7)%3)*0.4} fill="#FFFFFF" opacity={starOpacity*(0.5+((i*13)%5)/10)}/>
        ))}

        {/* Sun glow halo (clipped to sky for clean horizon) */}
        <g clipPath={`url(#sc${uid})`}>
          <circle cx={W/2} cy={sunCenterY} r={glowR} fill={`url(#glow${uid})`}/>
        </g>

        {/* Water */}
        <rect x={0} y={horizonY} width={W} height={H-horizonY} fill={`url(#gnd${uid})`}/>

        {/* Sun's reflection on water — a shimmering vertical streak from horizon downwards */}
        {reflectionStrength>0&&(
          <g clipPath={`url(#wc${uid})`}>
            <rect x={W/2-sunR*1.3} y={horizonY} width={sunR*2.6} height={H-horizonY} fill={`url(#reflect${uid})`}/>
            {/* Horizontal water shimmer lines */}
            {Array.from({length:7}).map((_,i)=>{
              const yy=horizonY+(i+1)*((H-horizonY)/8);
              const width=sunR*2.2*(1+i*0.18);
              const shimmerOffset=Math.sin(now*1.5+i)*sunR*0.15;
              return <line key={i} x1={W/2-width/2+shimmerOffset} y1={yy} x2={W/2+width/2+shimmerOffset} y2={yy} stroke={sunCenterColor} strokeWidth={0.8+i*0.1} strokeLinecap="round" opacity={reflectionStrength*(0.45-i*0.045)}/>;
            })}
          </g>
        )}

        {/* Sun rays — subtle radial lines around sun */}
        {progress<0.85&&sunVisible&&(
          <g clipPath={`url(#sc${uid})`} opacity={Math.max(0.25,(1-progress*0.6))*0.55}>
            {Array.from({length:12}).map((_,i)=>{
              const ang=(i/12)*Math.PI*2+(now*0.05);
              const r1=sunR*1.3, r2=sunR*(1.9+Math.sin(now*0.8+i)*0.08);
              return <line key={i} x1={W/2+r1*Math.cos(ang)} y1={sunCenterY+r1*Math.sin(ang)} x2={W/2+r2*Math.cos(ang)} y2={sunCenterY+r2*Math.sin(ang)} stroke={sunMidColor} strokeWidth={1.5} strokeLinecap="round"/>;
            })}
          </g>
        )}

        {/* Sun itself */}
        <g clipPath={`url(#sc${uid})`}>
          {sunVisible&&<circle cx={W/2} cy={sunCenterY} r={sunR} fill={`url(#sun${uid})`}/>}
        </g>

        {/* Slim horizon line — a hint of where water meets sky */}
        <line x1={0} y1={horizonY} x2={W} y2={horizonY} stroke="rgba(0,0,0,0.10)" strokeWidth={0.6}/>

        {/* Time label — adapts color so it's always readable */}
        <text x={W/2} y={H-10} textAnchor="middle" style={{fontSize:Math.round(size*0.062),fontWeight:600,fill:progress<0.65?"#1F1B2E":"#FFFFFF",fontFamily:G.serif,fontVariantNumeric:"tabular-nums"}}>{c.label}</text>
      </svg>
      {showCtrl&&<TCtrl c={c} color={color} t={t}/>}
    </div>
  );
}

/* ═══ LAVA ═══ */
function LavaTimer({totalSec,color,t,autoRun=false,size=240,showCtrl=true}){
  const c=useTimer(totalSec,autoRun);
  if(c.done) return <DoneBadge color={color}/>;
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
      {showCtrl&&<TCtrl c={c} color={color} t={t}/>}
    </div>
  );
}

function TimerComp({type,totalSec,color,t,autoRun=false,size=240,showCtrl=true}){
  const M={sector:SectorTimer,ring:RingTimer,dots:DotsTimer,wave:WaveTimer,sun:SunTimer,lava:LavaTimer};
  const Comp=M[type]||SectorTimer;
  return <Comp totalSec={totalSec} color={color} t={t} autoRun={autoRun} size={size} showCtrl={showCtrl}/>;
}

function FullTimer({type,totalSec,color,t,autoRun,onClose}){
  return(
    <div style={{position:"fixed",inset:0,zIndex:9000,background:"#FFFFFF",backgroundImage:`linear-gradient(165deg,${SCREENS.timer.hb} 0%,#FFFFFF 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,gap:28,animation:"ftIn .25s ease"}}>
      <style>{`@keyframes ftIn{from{opacity:0}to{opacity:1}}`}</style>
      <button onClick={onClose} style={{position:"absolute",top:24,right:24,width:48,height:48,borderRadius:24,border:`1px solid ${G.border}`,background:G.white,color:G.ink2,fontSize:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:sh.sm}}>✕</button>
      <TimerComp type={type} totalSec={totalSec} color={color} t={t} autoRun={autoRun} size={300}/>
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
    const gY=H-Math.round(H*0.16);
    const sunR=Math.round(size*0.1), sunY=Math.round(size*0.32);
    return(
      <svg width={W} height={H} style={{borderRadius:18,overflow:"hidden",border:`1px solid ${G.border}`}}>
        <defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(220,65%,72%)"/><stop offset="100%" stopColor="hsl(245,55%,82%)"/></linearGradient><radialGradient id="sn"><stop offset="0%" stopColor="#FFF8E0"/><stop offset="100%" stopColor="#F5B040"/></radialGradient></defs>
        <rect x={0} y={0} width={W} height={gY} fill="url(#sk)"/>
        <rect x={0} y={gY} width={W} height={H-gY} fill="#94CFA8"/>
        {Array.from({length:10}).map((_,i)=>{const a=(i/10)*Math.PI*2;return <line key={i} x1={W/2+sunR*1.3*Math.cos(a)} y1={sunY+sunR*1.3*Math.sin(a)} x2={W/2+sunR*1.8*Math.cos(a)} y2={sunY+sunR*1.8*Math.sin(a)} stroke="#FFE38A" strokeWidth={2} strokeLinecap="round"/>;})}
        <circle cx={W/2} cy={sunY} r={sunR} fill="url(#sn)"/>
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
/* ═══ Sigvard timeline lamps ═══
   Simple model:
   - Lamp count adapts to available height
   - All lamps in the column lit RED = upcoming time, mörka = passerad tid
   - As time passes, the topmost lit lamps go dark one by one
   - This means: at the start of the day all lamps lit; as time ticks down, the column "drains" from the top
*/
/* ═══ Sigvard timeline — 24h day clock ═══
   - Always shows full day 00:00 → 24:00
   - One lamp per fixed interval (default 30 min = 48 lamps, or 1h = 24 lamps)
   - Black = past, red = future, brighter red at "now"
   - Independent of activities — it's a day clock
*/
const SIGVARD_MIN_PER_LAMP=30; // 30 minutes per lamp → 48 lamps total
const SIGVARD_LAMP=8, SIGVARD_GAP=42, SIGVARD_PAD_V=14;
const SIGVARD_STEP=SIGVARD_LAMP+SIGVARD_GAP;
const SIGVARD_TOTAL_LAMPS=Math.ceil(24*60/SIGVARD_MIN_PER_LAMP);
// Vertical center of lamp i (relative to lamps container top) in px
const yForLamp=(i)=>SIGVARD_PAD_V+i*SIGVARD_STEP+SIGVARD_LAMP/2;
// Vertical center for any time (minutes-of-day)
const yForTime=(min)=>{
  const lampIdx=min/SIGVARD_MIN_PER_LAMP;
  return SIGVARD_PAD_V+lampIdx*SIGVARD_STEP+SIGVARD_LAMP/2;
};
const SIGVARD_TOTAL_HEIGHT=SIGVARD_PAD_V*2+SIGVARD_TOTAL_LAMPS*SIGVARD_LAMP+(SIGVARD_TOTAL_LAMPS-1)*SIGVARD_GAP;

function SigvardTimeline({now}){
  const nowM=now.getHours()*60+now.getMinutes();
  return(
    <div style={{display:"flex",alignItems:"stretch",gap:4,flexShrink:0,alignSelf:"flex-start"}}>
      <style>{`@keyframes lampNow{0%,100%{box-shadow:0 0 10px #FF4848AA, 0 0 20px #FF484866;transform:scale(1)}50%{box-shadow:0 0 18px #FF4848DD, 0 0 32px #FF484899, 0 0 48px #FF484844;transform:scale(1.18)}}`}</style>
      <div style={{
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
          const isPast=lampMin+SIGVARD_MIN_PER_LAMP<=nowM;
          const isNow=lampMin<=nowM && nowM<lampMin+SIGVARD_MIN_PER_LAMP;
          return <div key={i} style={{
            width:SIGVARD_LAMP,height:SIGVARD_LAMP,borderRadius:"50%",
            marginBottom:i===SIGVARD_TOTAL_LAMPS-1?0:SIGVARD_GAP,
            background:isPast?"radial-gradient(circle at 30% 30%, #4A4258, #1F1B2E)":(isNow?"radial-gradient(circle at 30% 30%, #FF6A6A, #E62525)":"radial-gradient(circle at 30% 30%, #FF6060, #C92020)"),
            boxShadow:isPast
              ?"inset 0 1px 2px rgba(0,0,0,.6), 0 0 0 1px rgba(0,0,0,.1)"
              :(isNow?undefined:"0 0 6px #E9404099, inset 0 -1px 1px rgba(0,0,0,0.15)"),
            border:`1px solid ${isPast?"#2C2640":"#E9404055"}`,
            transition:"all .4s",
            animation:isNow?"lampNow 2.4s ease-in-out infinite":undefined,
          }}/>;
        })}
      </div>
    </div>
  );
}

// Legacy alias for backward compatibility
function SigvardLamps(props){
  const[now,setNow]=useState(new Date());
  useEffect(()=>{const id=setInterval(()=>setNow(new Date()),15000);return()=>clearInterval(id);},[]);
  return <SigvardTimeline now={now}/>;
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

  // Banner is fully visible at top of scroll, dims away when scrolled down at all
  const[scrolled,setScrolled]=useState(false);
  useEffect(()=>{
    if(!scrollRef.current) return;
    const scroller=scrollRef.current;
    const check=()=>setScrolled(scroller.scrollTop>20);
    check();
    scroller.addEventListener("scroll",check,{passive:true});
    return()=>scroller.removeEventListener("scroll",check);
  },[]);

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",position:"relative",minHeight:0}}>
      {/* Sticky "Nu" banner */}
      {!isEd&&(
        <div style={{position:"sticky",top:0,zIndex:10,maxHeight:scrolled?0:90,opacity:scrolled?0:1,overflow:"hidden",transition:"max-height 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease",pointerEvents:scrolled?"none":"auto"}}>
        <button onClick={jumpToTarget} style={{margin:"10px 14px 0",padding:"10px 14px",borderRadius:14,border:`1px solid ${G.border}`,background:"linear-gradient(135deg,#FFFFFF 0%, #FCFAFE 60%, #F8F5FC 100%)",boxShadow:"0 4px 14px rgba(31,27,46,0.05), inset 0 1px 0 rgba(255,255,255,0.95)",display:"flex",alignItems:"center",gap:10,cursor:"pointer",textAlign:"left",transition:"transform .15s ease, box-shadow .2s",overflow:"hidden",width:"calc(100% - 28px)"}} onMouseDown={e=>e.currentTarget.style.transform="scale(0.985)"} onMouseUp={e=>e.currentTarget.style.transform=""} onMouseLeave={e=>e.currentTarget.style.transform=""}>
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
          <div style={{fontFamily:G.font,fontWeight:500,fontSize:11,color:G.ink3,flexShrink:0,opacity:.5,position:"relative",zIndex:1}}>↓</div>
        </button>
        </div>
      )}
      <div ref={scrollRef} style={{flex:1,display:"flex",overflowY:"auto",padding:"14px 14px 30px 6px",position:"relative"}}>
      {!isEd&&(
        <div style={{flexShrink:0,position:"relative",width:38,height:totalContentH}}>
          {positions.map(({item,y})=>(
            <div key={`tl-${item.id}`} style={{position:"absolute",top:y+2,right:6,fontFamily:G.font,fontWeight:700,fontSize:11,color:item.color,letterSpacing:0.3,fontVariantNumeric:"tabular-nums",whiteSpace:"nowrap",lineHeight:1}}>
              {item.time}
            </div>
          ))}
        </div>
      )}
      {cfg.showSigvard&&!isEd&&(
        <div style={{flexShrink:0,position:"relative",zIndex:5}}>
          <SigvardTimeline now={now}/>
        </div>
      )}
      <div style={{flex:1,position:"relative",height:totalContentH,marginLeft:cfg.showSigvard&&!isEd?10:0}}>
        {!isEd&&(
          <>
            {/* Pulsing now-line */}
            <div style={{position:"absolute",top:yForTime(nowM)-1,left:-12,right:0,height:2,background:"linear-gradient(90deg,#FF3030 0%, #FF6060 40%, #FF303033 100%)",borderRadius:1,zIndex:1,pointerEvents:"none",animation:"nowPulse 2.4s ease-in-out infinite"}}/>
            <style>{`@keyframes nowPulse{0%,100%{box-shadow:0 0 6px #FF303055;opacity:.85}50%{box-shadow:0 0 14px #FF3030AA, 0 0 22px #FF303044;opacity:1}}`}</style>
          </>
        )}
        {positions.map(({item,y,naturalY,h},i)=>{
          const startM=hm(item.time);
          const endM=item.endTime?hm(item.endTime):null;
          const yBot=endM?yForTime(endM):yForTime(startM);
          const barH=Math.max(0,yBot-yForTime(startM));
          const offset=y-naturalY;
          return(
            <div key={item.id}>
              <div ref={el=>{cardRefs.current[item.id]=el; if(el) el.setAttribute("data-act-id",item.id);}} style={{position:"absolute",top:y,left:0,right:0,zIndex:2+i}}>
                <ActRow item={item} cardStyle={cfg.cardStyle||"normal"} isEditor={isEd} onEdit={onEdit} onTap={onTap} onMarkDone={onMarkDone} idx={i}/>
                {barH>20&&offset<=14&&<div style={{position:"absolute",left:-8,top:4,width:3,height:barH,background:`linear-gradient(180deg,${item.color},${item.color}66)`,borderRadius:2,opacity:0.7}}/>}
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
        <span style={{fontSize:13}}>{TICON[timer.type]}</span>
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
function ActivityDetail({item,onClose,onCheck,t}){
  const[local,setLocal]=useState(item.stepsDone||{});
  const[showTmr,setShowTmr]=useState(false);
  const[fullTmr,setFullTmr]=useState(false);
  const[celebrate,setCelebrate]=useState(false);
  const tmrRef=useRef(null);
  const tc=item.timer?.color||"#E89B89";
  const secsLeft=item.timer?.on?clockLeft(item.time,item.timer.min):(item.timer?.min||5)*60;
  const autoRun=item.timer?.on&&secsLeft<item.timer?.min*60;
  const allDone=item.steps.length>0&&item.steps.every(s=>local[s.id]);
  useEffect(()=>{if(allDone&&item.steps.length>0){setCelebrate(true);setTimeout(()=>setCelebrate(false),2800);}},[allDone]);
  useEffect(()=>{if(showTmr&&tmrRef.current){setTimeout(()=>tmrRef.current?.scrollIntoView({behavior:"smooth",block:"center"}),60);}},[showTmr]);
  const toggle=id=>{const n={...local,[id]:!local[id]};setLocal(n);onCheck&&onCheck(item.id,n);};
  return(
    <>
      {celebrate&&<Confetti/>}
      {fullTmr&&<FullTimer type={item.timer.type} totalSec={secsLeft} color={tc} t={t} autoRun={autoRun} onClose={()=>setFullTmr(false)}/>}
      <Overlay onClose={onClose}>
        <Sheet scroll>
          <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:18}}>
            <div style={{fontSize:46,lineHeight:1,padding:14,borderRadius:18,background:`linear-gradient(140deg,${item.color}1A,${item.color}30)`,border:`1px solid ${item.color}25`}}>{item.emoji}</div>
            <div style={{flex:1,paddingTop:4}}>
              <div style={{fontFamily:G.serif,fontWeight:600,fontSize:23,color:G.ink,lineHeight:1.1,letterSpacing:-.3}}>{item.name}</div>
              <div style={{fontFamily:G.font,fontWeight:600,fontSize:13,color:item.color,marginTop:6}}>{item.time}</div>
            </div>
            <button onClick={onClose} style={{width:36,height:36,borderRadius:12,border:`1px solid ${G.border}`,background:G.cream,color:G.ink2,fontSize:16,cursor:"pointer"}}>✕</button>
          </div>
          {item.steps.length>0&&(
            <div style={{marginBottom:22}}>
              <SLabel>📋 {t.steps}</SLabel>
              {item.steps.map(s=>{const done=!!local[s.id];return(
                <div key={s.id} onClick={()=>toggle(s.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderRadius:14,cursor:"pointer",marginBottom:8,transition:"all .22s",background:done?`${item.color}10`:G.cream,border:`1px solid ${done?item.color:G.border}`}}>
                  <div style={{width:26,height:26,borderRadius:"50%",flexShrink:0,border:`2px solid ${done?item.color:G.ink3}`,background:done?item.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .22s"}}>{done&&<span style={{color:"#fff",fontSize:13,fontWeight:900}}>✓</span>}</div>
                  <span style={{fontSize:20}}>{s.emoji}</span>
                  <span style={{fontFamily:G.font,fontWeight:600,fontSize:15,flex:1,color:done?item.color:G.ink,textDecoration:done?"line-through":"none"}}>{s.text}</span>
                </div>
              );})}
              {allDone&&<div style={{padding:16,borderRadius:14,textAlign:"center",background:`linear-gradient(135deg,${SCREENS.home.hl},${SCREENS.emotion.hl})`,border:`1px solid ${SCREENS.emotion.h}44`}}><div style={{fontSize:38}}>🌟</div><div style={{fontFamily:G.serif,fontWeight:600,fontSize:18,color:SCREENS.emotion.deep,marginTop:6}}>{t.allDoneMsg}</div></div>}
            </div>
          )}
          {item.timer?.on&&(<>
            <div style={{height:1,background:G.border,marginBottom:18}}/>
            {!showTmr?(
              <button onClick={()=>setShowTmr(true)} style={{width:"100%",padding:"16px 0",borderRadius:16,border:"none",background:`linear-gradient(140deg,${tc},${tc}DC)`,color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:15,cursor:"pointer",boxShadow:sh.c(tc)}}>{TICON[item.timer.type]} &nbsp;{t.openTimer} · {item.timer.min} {t.min}</button>
            ):(
              <div ref={tmrRef} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
                <TimerComp type={item.timer.type} totalSec={secsLeft} color={tc} t={t} autoRun={autoRun} size={210}/>
                <button onClick={()=>setFullTmr(true)} style={{padding:"10px 28px",borderRadius:14,border:`1px solid ${G.border}`,background:G.cream,color:G.ink2,fontFamily:G.font,fontWeight:600,fontSize:13,cursor:"pointer"}}>⤢ {t.enlarge}</button>
              </div>
            )}
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
  const[sepage,setSEpage]=useState(0);
  const[epage,setEpage]=useState(0);
  const pp=40, esl=EMOJIS.slice(epage*pp,(epage+1)*pp);
  const addStep=()=>{if(!stepTxt.trim())return;setSteps(s=>[...s,{id:Date.now(),emoji:stepEmoji,text:stepTxt.trim()}]);setStepTxt("");};
  const buildSaved=()=>({id:item?.id||Date.now(),name:name||"(Utan namn)",time,endTime:endTime||undefined,emoji,photo,color,done:false,stepsDone:{},steps,timer:{on:timerOn,type:timerType,min:timerMin,color:timerCol},repeat});
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
  const DAYS_SV=["sön","mån","tis","ons","tor","fre","lör"];
  const S=SCREENS.home;
  return(
    <Overlay onClose={onClose}>
      <Sheet scroll>
        <div style={{fontFamily:G.serif,fontWeight:600,fontSize:21,color:G.ink,marginBottom:22}}>{item?.id?"Redigera aktivitet":"Ny aktivitet"}</div>

        <SLabel>{t.cardImage}</SLabel>
        <div style={{display:"flex",gap:12,marginBottom:18,alignItems:"flex-start"}}>
          <div style={{width:72,height:72,borderRadius:16,background:photo?"#000":`linear-gradient(140deg,${color}1A,${color}30)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,overflow:"hidden",border:`1px solid ${color}25`,flexShrink:0}}>
            {photo?<img src={photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:emoji}
          </div>
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:7}}>
            <label style={{padding:"9px 13px",borderRadius:11,background:G.white,border:`1px solid ${G.border}`,fontFamily:G.font,fontSize:12,color:G.ink,cursor:"pointer",fontWeight:600,textAlign:"center"}}>
              📷 {photo?"Byt foto":t.uploadPhoto}
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
        <input value={name} onChange={e=>setName(e.target.value)} style={INP} placeholder="t.ex. Frukost"/>
        <SLabel>{t.actTime}</SLabel>
        <div style={{display:"flex",gap:10,marginBottom:16}}>
          <div style={{flex:1}}>
            <div style={{fontFamily:G.font,fontWeight:500,fontSize:10,color:G.ink3,letterSpacing:.5,marginBottom:4}}>Start</div>
            <input type="time" value={time} onChange={e=>setTime(e.target.value)} style={{...INP,marginBottom:0}}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:G.font,fontWeight:500,fontSize:10,color:G.ink3,letterSpacing:.5,marginBottom:4}}>Slut (frivilligt)</div>
            <input type="time" value={endTime} onChange={e=>setEndTime(e.target.value)} style={{...INP,marginBottom:0}}/>
          </div>
        </div>
        <SLabel>{t.pickColor}</SLabel>
        <div style={{display:"flex",gap:9,marginBottom:22,flexWrap:"wrap"}}>
          {ACT_C.map(col=><div key={col} onClick={()=>setColor(col)} style={{width:32,height:32,borderRadius:"50%",background:col,cursor:"pointer",outline:color===col?`3px solid ${col}`:"none",outlineOffset:2,boxShadow:color===col?sh.c(col):"none"}}/>)}
        </div>
        <SLabel>🔁 Upprepa</SLabel>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:7,marginBottom:10}}>
          {[
            {k:"none",l:"Endast idag"},
            {k:"daily",l:"Varje dag"},
            {k:"weekdays",l:"Vardagar"},
            {k:"weekend",l:"Helger"},
          ].map(opt=>(
            <button key={opt.k} onClick={()=>setRepeat({type:opt.k,days:[]})} style={{padding:"10px 8px",borderRadius:12,border:`1px solid ${repeat.type===opt.k?S.h:G.border}`,background:repeat.type===opt.k?S.hl:G.white,color:repeat.type===opt.k?S.deep:G.ink2,fontFamily:G.font,fontWeight:600,fontSize:12,cursor:"pointer",transition:"all .15s"}}>{opt.l}</button>
          ))}
          <button onClick={()=>setRepeat(r=>r.type==="custom"?r:{type:"custom",days:[]})} style={{gridColumn:"1 / -1",padding:"10px 8px",borderRadius:12,border:`1px solid ${repeat.type==="custom"?S.h:G.border}`,background:repeat.type==="custom"?S.hl:G.white,color:repeat.type==="custom"?S.deep:G.ink2,fontFamily:G.font,fontWeight:600,fontSize:12,cursor:"pointer"}}>Välj veckodagar</button>
        </div>
        {repeat.type==="custom"&&(
          <div style={{display:"flex",gap:5,marginBottom:18,justifyContent:"space-between"}}>
            {DAYS_SV.map((d,i)=>{const on=(repeat.days||[]).includes(i);return(
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
            <button onClick={()=>setSteps(ss=>ss.filter(x=>x.id!==s.id))} style={{background:"none",border:"none",color:G.ink3,cursor:"pointer",fontSize:16}}>✕</button>
          </div>
        ))}
        <div style={{display:"flex",gap:7,marginBottom:22}}>
          <button onClick={()=>setShowStepE(true)} style={{fontSize:22,border:`1px solid ${G.border}`,borderRadius:11,padding:"6px 12px",background:G.white,cursor:"pointer",minWidth:50}}>{stepEmoji}</button>
          <input value={stepTxt} onChange={e=>setStepTxt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addStep()} style={{...INP,marginBottom:0,flex:1}} placeholder={t.stepPH}/>
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
            <div style={{fontFamily:G.font,fontSize:12,color:SCREENS.timer.deep,background:SCREENS.timer.hl,borderRadius:10,padding:"8px 12px",marginBottom:14}}>⏰ {t.autoTimer}</div>
            <SLabel>{t.timerType}</SLabel>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
              {TTYPES.map(k=><button key={k} onClick={()=>setTType(k)} style={{padding:"12px 4px",borderRadius:13,border:"1px solid",fontFamily:G.font,fontWeight:600,fontSize:11,cursor:"pointer",borderColor:timerType===k?timerCol:G.border,background:timerType===k?timerCol:"transparent",color:timerType===k?"#fff":G.ink2}}><div style={{fontSize:18}}>{TICON[k]}</div><div style={{marginTop:4}}>{tlbl(k,t)}</div></button>)}
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
          {item?.id&&<button onClick={()=>{onDel(item.id);onClose();}} style={{padding:"14px 16px",borderRadius:14,border:"none",background:"#FEF2F2",color:"#EF4444",cursor:"pointer",fontSize:17}}>🗑</button>}
          <button onClick={onClose} style={{flex:1,...GHOST}}>{t.cancel}</button>
          <button onClick={doSave} style={{flex:2,padding:"15px 0",borderRadius:14,border:"none",background:S.h,color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:15,cursor:"pointer",boxShadow:sh.c(S.h)}}>{t.save}</button>
        </div>
        {conflicts&&(
          <Overlay onClose={()=>setConflicts(null)}>
            <Sheet>
              <div style={{textAlign:"center",marginBottom:18}}>
                <div style={{width:64,height:64,borderRadius:20,background:"linear-gradient(140deg,#FEF3E7,#FDE6D0)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,margin:"0 auto 14px"}}>⚠️</div>
                <div style={{fontFamily:G.serif,fontWeight:600,fontSize:21,color:G.ink,letterSpacing:-.2,marginBottom:6}}>Tidskrock</div>
                <div style={{fontFamily:G.font,fontSize:14,color:G.ink2,lineHeight:1.45,maxWidth:320,margin:"0 auto"}}>Den nya aktiviteten {time}{endTime?` – ${endTime}`:""} överlappar:</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:18}}>
                {conflicts.map(a=>(
                  <div key={a.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:`${a.color}10`,borderRadius:14,border:`1px solid ${a.color}30`}}>
                    <div style={{width:42,height:42,borderRadius:12,background:`linear-gradient(140deg,${a.color}25,${a.color}40)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{a.emoji}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:G.serif,fontWeight:600,fontSize:15,color:G.ink,lineHeight:1.2}}>{a.name}</div>
                      <div style={{fontFamily:G.font,fontSize:12,color:a.color,fontWeight:600,marginTop:2,letterSpacing:.3}}>{a.time}{a.endTime?` – ${a.endTime}`:""}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setConflicts(null)} style={{flex:1,...GHOST}}>Gå tillbaka</button>
                <button onClick={confirmConflictSave} style={{flex:1,padding:"13px 0",borderRadius:14,border:"none",background:"#F59E42",color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:14,cursor:"pointer",boxShadow:"0 4px 12px rgba(245,158,66,0.35)"}}>Spara ändå</button>
              </div>
            </Sheet>
          </Overlay>
        )}
      </Sheet>
    </Overlay>
  );
}

/* ═══ Settings ═══ */
function SettingsModal({cfg,setCfg,shareCode,onClose,t,lang,onOpenSupervisor}){
  const[cs,setCs]=useState(cfg.cardStyle);
  const[sv,setSv]=useState(cfg.schedView);
  const[sig,setSig]=useState(cfg.showSigvard);
  const[tools,setTools]=useState({...cfg.tools});
  const[tc,setTc]=useState({...cfg.timerCfg});
  const[vEmos,setVEmos]=useState([...(cfg.visibleEmotions||[1,2,3,4,5])]);
  const[sm,setSm]=useState(false);
  const[code,setCode]=useState("");
  const[cp,setCp]=useState(false);
  const[err,setErr]=useState("");
  const copy=()=>{navigator.clipboard?.writeText(shareCode).catch(()=>{});setCp(true);setTimeout(()=>setCp(false),2200);};
  const conn=()=>{const c=code.toUpperCase().trim();if(SYNC_DB[c]){setCfg(x=>({...x,childCode:c,isChild:true}));onClose();}else setErr(t.wrongCode);};
  const save=()=>{setCfg(x=>({...x,cardStyle:cs,schedView:sv,showSigvard:sig,tools,timerCfg:tc,visibleEmotions:vEmos}));onClose();};
  const S=SCREENS.home;
  const TOOLLIST=[{k:"timer",i:"⏱",l:t.toolsTimer,s:SCREENS.timer},{k:"stories",i:"📖",l:t.stories,s:SCREENS.stories},{k:"emotion",i:"😊",l:t.toolsEmotion,s:SCREENS.emotion},{k:"calm",i:"🌿",l:t.calm,s:SCREENS.calm},{k:"comm",i:"💬",l:t.comm,s:SCREENS.comm},{k:"idcard",i:"🪪",l:t.idcard,s:SCREENS.idcard}];
  return(
    <Overlay onClose={save}>
      <Sheet scroll>
        <div style={{fontFamily:G.serif,fontWeight:600,fontSize:21,color:G.ink,marginBottom:24}}>⚙️ {t.settings}</div>
        <SLabel>{t.cardStyle}</SLabel>
        <div style={{display:"flex",gap:7,marginBottom:22}}>
          {[["normal",t.styleNormal],["compact",t.styleCompact],["big",t.styleBig]].map(([k,lb])=><button key={k} onClick={()=>setCs(k)} style={{flex:1,padding:"12px 0",borderRadius:13,border:`1px solid ${cs===k?S.h:G.border}`,background:cs===k?S.h:"transparent",color:cs===k?"#fff":G.ink2,fontFamily:G.font,fontWeight:600,cursor:"pointer",fontSize:13}}>{lb}</button>)}
        </div>
        <SLabel>{t.schedView}</SLabel>
        <div style={{display:"flex",gap:7,marginBottom:22}}>
          {[["both",t.viewBoth],["list",t.viewList],["card",t.viewCard]].map(([k,lb])=><button key={k} onClick={()=>setSv(k)} style={{flex:1,padding:"10px 4px",borderRadius:13,border:`1px solid ${sv===k?S.h:G.border}`,background:sv===k?S.h:"transparent",color:sv===k?"#fff":G.ink2,fontFamily:G.font,fontWeight:600,cursor:"pointer",fontSize:11}}>{lb}</button>)}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",background:S.hll,borderRadius:14,border:`1px solid ${S.hl}`,marginBottom:18}}>
          <Toggle on={sig} onChange={()=>setSig(s=>!s)} color="#E94040"/>
          <div><div style={{fontFamily:G.font,fontWeight:700,fontSize:14,color:G.ink}}>💡 {t.sigvardOn}</div><div style={{fontFamily:G.font,fontSize:12,color:G.ink2,marginTop:2}}>Röda lampor · tid till nästa aktivitet</div></div>
        </div>
        <div style={{background:G.cream,borderRadius:16,padding:18,border:`1px solid ${G.border}`,marginBottom:18}}>
          <SLabel>{t.visibleTools}</SLabel>
          {TOOLLIST.map(tool=>(
            <div key={tool.k} style={{display:"flex",alignItems:"center",gap:12,paddingBottom:11,marginBottom:11,borderBottom:`1px solid ${G.border}`}}>
              <Toggle on={tools[tool.k]} color={tool.s.h} onChange={()=>setTools(tv=>({...tv,[tool.k]:!tv[tool.k]}))}/>
              <span style={{fontFamily:G.font,fontWeight:600,color:G.ink,fontSize:14}}>{tool.i} {tool.l}</span>
            </div>
          ))}
        </div>
        {tools.timer&&(
          <div style={{background:SCREENS.timer.hll,borderRadius:16,padding:18,border:`1px solid ${SCREENS.timer.hl}`,marginBottom:18}}>
            <SLabel>{t.timerSettings}</SLabel>
            <SLabel>{t.allowedTimers}</SLabel>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
              {TTYPES.map(k=>{const on=tc.allowedTypes.includes(k);return <button key={k} onClick={()=>setTc(x=>({...x,allowedTypes:on?x.allowedTypes.filter(a=>a!==k):[...x.allowedTypes,k]}))} style={{padding:"12px 4px",borderRadius:13,border:"1px solid",fontFamily:G.font,fontWeight:600,fontSize:11,cursor:"pointer",borderColor:on?SCREENS.timer.h:G.border,background:on?SCREENS.timer.hl:"transparent",color:on?SCREENS.timer.deep:G.ink2}}><div style={{fontSize:18}}>{TICON[k]}</div><div style={{marginTop:4}}>{tlbl(k,t)}</div></button>;})}
            </div>
            <SLabel>{t.defaultTimer}</SLabel>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              {tc.allowedTypes.map(k=><button key={k} onClick={()=>setTc(x=>({...x,defaultType:k}))} style={{padding:"7px 13px",borderRadius:11,border:"1px solid",fontFamily:G.font,fontWeight:600,fontSize:12,cursor:"pointer",borderColor:tc.defaultType===k?SCREENS.timer.h:G.border,background:tc.defaultType===k?SCREENS.timer.h:"transparent",color:tc.defaultType===k?"#fff":G.ink2}}>{TICON[k]} {tlbl(k,t)}</button>)}
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
        {[[false,"📱 "+t.sameDevice,t.sameDeviceDesc],[true,"🔗 "+t.syncMode,t.syncModeDesc]].map(([v,title,desc])=>(
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
              <button onClick={copy} style={{...GHOST,padding:"10px 13px"}}>{cp?t.copied:"📋"}</button>
            </div>
            <div style={{fontFamily:G.font,fontSize:12,color:G.ink2,marginBottom:14}}>{t.codeHint}</div>
            <SLabel>{t.enterCode}</SLabel>
            <div style={{display:"flex",gap:7}}>
              <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} maxLength={4} placeholder="AB3X" style={{...INP,marginBottom:0,textAlign:"center",fontFamily:G.serif,fontWeight:600,fontSize:20,letterSpacing:4,flex:1}}/>
              <button onClick={conn} style={{padding:"0 16px",borderRadius:12,border:"none",background:SCREENS.emotion.h,color:"#fff",fontFamily:G.font,fontWeight:700,cursor:"pointer"}}>{t.connect}</button>
            </div>
            {err&&<div style={{color:"#EF4444",fontFamily:G.font,fontSize:12,marginTop:6}}>{err}</div>}
          </div>
        )}
        <button onClick={save} style={{marginTop:20,width:"100%",padding:"15px 0",borderRadius:14,border:"none",background:S.h,color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:15,cursor:"pointer",boxShadow:sh.c(S.h)}}>{t.save}</button>

        {/* Caregiver demo entry */}
        {onOpenSupervisor&&(
          <div style={{marginTop:32,paddingTop:24,borderTop:`1px solid ${G.border}`}}>
            <SLabel>{lang==="sv"?"Stödperson":"Caregiver"}</SLabel>
            <div style={{fontFamily:G.font,fontSize:12,color:G.ink2,marginBottom:10,lineHeight:1.4}}>
              {lang==="sv"?"Förhandstitt på webbredaktören där pedagoger hanterar flera klienter på distans.":"Preview of the web editor where caregivers manage multiple clients remotely."}
            </div>
            <button onClick={onOpenSupervisor} style={{width:"100%",padding:"13px 0",borderRadius:13,border:"none",background:`linear-gradient(135deg,${S.h},${S.deep})`,color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:14,cursor:"pointer",boxShadow:sh.c(S.h),display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              🧑‍⚕️ {lang==="sv"?"Öppna stödpersonsvy":"Open caregiver view"}
              <span style={{fontFamily:G.font,fontWeight:600,fontSize:10,padding:"2px 7px",borderRadius:5,background:"rgba(255,255,255,0.25)",letterSpacing:1}}>DEMO</span>
            </button>
          </div>
        )}

        {/* Reset all data — destructive action at the bottom */}
        <div style={{marginTop:32,paddingTop:24,borderTop:`1px solid ${G.border}`}}>
          <SLabel>Återställ</SLabel>
          <div style={{fontFamily:G.font,fontSize:12,color:G.ink2,marginBottom:10,lineHeight:1.4}}>Rensar alla aktiviteter, berättelser, känslohistorik och inställningar. Kan inte ångras.</div>
          <button onClick={()=>{
            if(typeof window!=="undefined"&&window.confirm("Är du säker? Allt data raderas och kan inte återskapas.")){
              try{
                Object.keys(localStorage).forEach(k=>{if(k.startsWith("luma_v1_"))localStorage.removeItem(k);});
                window.location.reload();
              }catch(_){}
            }
          }} style={{width:"100%",padding:"12px 0",borderRadius:12,border:`1px solid #EF444433`,background:"#FEF2F2",color:"#EF4444",fontFamily:G.font,fontWeight:600,fontSize:13,cursor:"pointer"}}>🗑 Rensa all data</button>
        </div>
      </Sheet>
    </Overlay>
  );
}

/* ═══ Communication board ═══ */
function CommBoard({lang,t,isEditor}){
  const[cats,setCats]=usePersistentState("commCats",COMM0);
  const[sel,setSel]=useState(0);
  const[spoken,setSpoken]=useState(null);
  const[addC,setAddC]=useState(false);
  const[addK,setAddK]=useState(false);
  const[editCatId,setEditCatId]=useState(null);
  const[editCatName,setEditCatName]=useState("");
  const[newCN,setNewCN]=useState("");
  const[newKE,setNewKE]=useState("😊");
  const[newKT,setNewKT]=useState("");
  const[newKP,setNewKP]=useState(null);
  const[cepage,setCEpage]=useState(0);
  const pp=40;
  const fileRef=useRef(null);
  const S=SCREENS.comm;
  const onPhoto=e=>{
    const f=e.target.files?.[0];
    if(!f) return;
    const r=new FileReader();
    r.onload=()=>{
      // Downscale to keep state size reasonable
      const img=new Image();
      img.onload=()=>{
        const max=400;
        const scale=Math.min(1,max/Math.max(img.width,img.height));
        const w=img.width*scale, h=img.height*scale;
        const cv=document.createElement("canvas");
        cv.width=w; cv.height=h;
        cv.getContext("2d").drawImage(img,0,0,w,h);
        setNewKP(cv.toDataURL("image/jpeg",0.82));
      };
      img.src=r.result;
    };
    r.readAsDataURL(f);
  };
  const speak=card=>{setSpoken(card.id);setTimeout(()=>setSpoken(null),1400);if(window.speechSynthesis){const u=new SpeechSynthesisUtterance(lang==="sv"?card.sv:card.en);u.lang=lang==="sv"?"sv-SE":"en-US";window.speechSynthesis.speak(u);}};
  const cat=cats[sel];
  if(!cat) return null;
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",background:S.hb}}>
      <div style={{padding:"16px 16px 0",display:"flex",gap:8,overflowX:"auto",alignItems:"center"}}>
        {cats.map((c,i)=>{
          const active=sel===i;
          return(
            <div key={c.id} style={{position:"relative",flexShrink:0,paddingTop:isEditor?6:0}}>
              <button onClick={()=>{if(active&&isEditor){setEditCatId(c.id);setEditCatName(lang==="sv"?c.sv:c.en);}else{setSel(i);}}} style={{padding:"9px 18px",borderRadius:22,border:"1px solid",borderColor:active?c.color:G.border,background:active?c.color:G.white,color:active?"#fff":G.ink2,fontFamily:G.font,fontWeight:700,fontSize:13,cursor:"pointer",whiteSpace:"nowrap",boxShadow:active?sh.c(c.color):sh.xs}}>
                {lang==="sv"?c.sv:c.en}
                {active&&isEditor&&<span style={{marginLeft:7,opacity:.75,fontSize:11}}>✏️</span>}
              </button>
              {isEditor&&cats.length>1&&(
                <button onClick={()=>{setCats(cs=>cs.filter(x=>x.id!==c.id));if(sel>=i&&sel>0)setSel(s=>Math.max(0,s-1));}} style={{position:"absolute",top:0,right:-4,width:20,height:20,borderRadius:"50%",border:`1.5px solid ${G.white}`,background:"#1F1B2E",color:"#fff",fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0,zIndex:2}}>✕</button>
              )}
            </div>
          );
        })}
        {isEditor&&<button onClick={()=>setAddC(true)} style={{padding:"8px 14px",borderRadius:22,border:`1px dashed ${G.border2}`,background:"transparent",color:G.ink3,fontFamily:G.font,fontWeight:600,fontSize:13,cursor:"pointer",flexShrink:0}}>+</button>}
      </div>
      <div style={{flex:1,padding:14,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,overflowY:"auto",alignContent:"start"}}>
        {cat.cards.map(card=>{const active=spoken===card.id;return(
          <div key={card.id} style={{position:"relative"}}>
            <div onClick={()=>speak(card)} style={{background:active?cat.color:G.white,borderRadius:20,padding:card.photo?"6px 6px 12px":"20px 8px 16px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:card.photo?6:10,border:`1px solid ${active?cat.color:G.border}`,boxShadow:active?sh.c(cat.color):sh.xs,transform:active?"scale(0.94)":"scale(1)",transition:"all .18s ease"}}>
              {card.photo
                ? <img src={card.photo} alt="" style={{width:"100%",aspectRatio:"1/1",objectFit:"cover",borderRadius:14,display:"block"}}/>
                : <span style={{fontSize:38}}>{card.emoji}</span>}
              <span style={{fontFamily:G.font,fontWeight:700,fontSize:12,textAlign:"center",color:active?"#fff":G.ink,lineHeight:1.2}}>{lang==="sv"?card.sv:card.en}</span>
            </div>
            {isEditor&&<button onClick={()=>setCats(cs=>cs.map((c,i)=>i!==sel?c:{...c,cards:c.cards.filter(x=>x.id!==card.id)}))} style={{position:"absolute",top:4,right:4,width:22,height:22,borderRadius:"50%",border:"none",background:"rgba(0,0,0,.42)",color:"#fff",fontSize:10,cursor:"pointer"}}>✕</button>}
          </div>
        );})}
        {isEditor&&<div onClick={()=>{setNewKE("😊");setNewKT("");setNewKP(null);setAddK(true);}} style={{borderRadius:20,padding:"20px 8px 16px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:10,border:`1px dashed ${G.border2}`}}><span style={{fontSize:30,color:G.ink3}}>+</span><span style={{fontFamily:G.font,fontWeight:600,fontSize:11,color:G.ink3}}>{t.addCard}</span></div>}
      </div>
      {editCatId&&(
        <Overlay onClose={()=>setEditCatId(null)}>
          <Sheet>
            <div style={{fontFamily:G.serif,fontWeight:600,fontSize:19,color:G.ink,marginBottom:18}}>{t.renameCat}</div>
            <SLabel>{t.catName}</SLabel>
            <input value={editCatName} onChange={e=>setEditCatName(e.target.value)} style={INP} autoFocus/>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setEditCatId(null)} style={{flex:1,...GHOST}}>{t.cancel}</button>
              <button onClick={()=>{if(!editCatName.trim())return;setCats(cs=>cs.map(c=>c.id!==editCatId?c:{...c,sv:editCatName,en:editCatName}));setEditCatId(null);}} style={{flex:2,padding:"13px 0",borderRadius:13,border:"none",background:S.h,color:"#fff",fontFamily:G.font,fontWeight:700,cursor:"pointer"}}>{t.save}</button>
            </div>
          </Sheet>
        </Overlay>
      )}
      {addC&&(
        <Overlay onClose={()=>setAddC(false)}>
          <Sheet>
            <div style={{fontFamily:G.serif,fontWeight:600,fontSize:19,color:G.ink,marginBottom:18}}>{t.addCat}</div>
            <SLabel>{t.catName}</SLabel>
            <input value={newCN} onChange={e=>setNewCN(e.target.value)} style={INP} placeholder="t.ex. Mat"/>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setAddC(false)} style={{flex:1,...GHOST}}>{t.cancel}</button>
              <button onClick={()=>{if(!newCN.trim())return;setCats(cs=>[...cs,{id:"c"+Date.now(),sv:newCN,en:newCN,color:ACT_C[cs.length%ACT_C.length],cards:[]}]);setSel(cats.length);setNewCN("");setAddC(false);}} style={{flex:2,padding:"13px 0",borderRadius:13,border:"none",background:S.h,color:"#fff",fontFamily:G.font,fontWeight:700,cursor:"pointer"}}>{t.save}</button>
            </div>
          </Sheet>
        </Overlay>
      )}
      {addK&&(
        <Overlay onClose={()=>setAddK(false)}>
          <Sheet scroll>
            <div style={{fontFamily:G.serif,fontWeight:600,fontSize:19,color:G.ink,marginBottom:18}}>{t.addCard}</div>
            <SLabel>{t.cardImage}</SLabel>
            <div style={{display:"flex",gap:10,marginBottom:14}}>
              {/* Preview */}
              <div style={{width:72,height:72,borderRadius:14,background:newKP?"transparent":S.hll,border:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0}}>
                {newKP ? <img src={newKP} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : <span style={{fontSize:32}}>{newKE}</span>}
              </div>
              <div style={{flex:1,display:"flex",flexDirection:"column",gap:7}}>
                <input ref={fileRef} type="file" accept="image/*" onChange={onPhoto} style={{display:"none"}}/>
                <button onClick={()=>fileRef.current?.click()} style={{padding:"10px 14px",borderRadius:11,border:`1px solid ${S.h}`,background:S.hl,color:S.deep,fontFamily:G.font,fontWeight:600,fontSize:13,cursor:"pointer"}}>📷 {t.uploadPhoto}</button>
                {newKP && <button onClick={()=>setNewKP(null)} style={{padding:"8px 12px",borderRadius:11,border:`1px solid ${G.border}`,background:G.white,color:G.ink2,fontFamily:G.font,fontWeight:600,fontSize:12,cursor:"pointer"}}>↺ {t.useEmoji}</button>}
              </div>
            </div>
            {!newKP&&(<>
              <SLabel>{t.pickEmoji}</SLabel>
              <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>
                {EMOJIS.slice(cepage*pp,(cepage+1)*pp).map(e=><button key={e} onClick={()=>setNewKE(e)} style={{fontSize:22,background:newKE===e?S.hl:"transparent",border:newKE===e?`1px solid ${S.h}`:"1px solid transparent",borderRadius:8,padding:"2px 4px",cursor:"pointer"}}>{e}</button>)}
              </div>
              <div style={{display:"flex",gap:5,marginBottom:16}}>
                {Array.from({length:Math.ceil(EMOJIS.length/pp)}).map((_,i)=><button key={i} onClick={()=>setCEpage(i)} style={{padding:"3px 10px",borderRadius:8,fontFamily:G.font,fontWeight:600,fontSize:11,cursor:"pointer",border:`1px solid ${i===cepage?S.h:G.border}`,background:i===cepage?S.h:"transparent",color:i===cepage?"#fff":G.ink2}}>{i+1}</button>)}
              </div>
            </>)}
            <SLabel>Text</SLabel>
            <input value={newKT} onChange={e=>setNewKT(e.target.value)} style={INP} placeholder="t.ex. Vatten"/>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setAddK(false)} style={{flex:1,...GHOST}}>{t.cancel}</button>
              <button onClick={()=>{if(!newKT.trim())return;setCats(cs=>cs.map((c,i)=>i!==sel?c:{...c,cards:[...c.cards,{id:"cc"+Date.now(),emoji:newKE,photo:newKP,sv:newKT,en:newKT}]}));setNewKT("");setNewKP(null);setAddK(false);}} style={{flex:2,padding:"13px 0",borderRadius:13,border:"none",background:S.h,color:"#fff",fontFamily:G.font,fontWeight:700,cursor:"pointer"}}>{t.save}</button>
            </div>
          </Sheet>
        </Overlay>
      )}
    </div>
  );
}

/* ═══ Emotion screen ═══ */
function EmotionScreen({lang,t,cfg}){
  const[sel,setSel]=useState(null);
  const[reason,setReason]=useState("");
  const[saved,setSaved]=useState(false);
  const[hist,setHist]=usePersistentState("emotionHist",[]);
  const[showH,setShowH]=useState(false);
  const S=SCREENS.emotion;
  const visibleEmos=EMOS.filter(e=>(cfg.visibleEmotions||[1,2,3,4,5]).includes(e.id));
  const doSave=()=>{if(!sel)return;const e={...sel,reason,time:new Date().toLocaleTimeString("sv-SE",{hour:"2-digit",minute:"2-digit"}),date:new Date().toLocaleDateString("sv-SE")};setHist(h=>[e,...h].slice(0,20));setSaved(true);setTimeout(()=>{setSaved(false);setSel(null);setReason("");},2200);};
  const R2=78, cx=120, cy=115;
  const ap=a=>({x:cx+R2*Math.cos(a),y:cy-R2*Math.sin(a)});
  const N=Math.max(1,visibleEmos.length);
  const arcs=visibleEmos.map((e,i)=>{const s=Math.PI-(i/N)*Math.PI,en=Math.PI-((i+1)/N)*Math.PI;const p1=ap(s),p2=ap(en);return{i,d:`M${p1.x},${p1.y} A${R2},${R2} 0 0,1 ${p2.x},${p2.y}`,col:e.color};});
  const selIdx=sel?visibleEmos.findIndex(e=>e.id===sel.id):-1;
  const needleA=selIdx>=0?Math.PI-(selIdx+0.5)/N*Math.PI:Math.PI/2;
  const np=ap(needleA);
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto",background:S.hb}}>
      <div style={{padding:"20px 20px 4px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div style={{fontFamily:G.serif,fontWeight:600,fontSize:22,color:G.ink}}>{t.emotions}</div>
        <button onClick={()=>setShowH(h=>!h)} style={{padding:"8px 16px",borderRadius:22,border:`1px solid ${G.border}`,background:showH?S.hl:G.white,color:showH?S.deep:G.ink2,fontFamily:G.font,fontWeight:600,cursor:"pointer",fontSize:13,boxShadow:sh.xs}}>📋 {t.emotionHistory}</button>
      </div>
      <div style={{flex:1,padding:"0 20px 20px",overflowY:"auto"}}>
        {showH?(hist.length===0?<div style={{color:G.ink3,fontFamily:G.font,textAlign:"center",marginTop:40}}>{t.noHistory}</div>:hist.map((e,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",background:G.white,borderRadius:16,marginBottom:10,border:`1px solid ${e.color}22`,boxShadow:sh.xs}}>
            <span style={{fontSize:28}}>{e.emoji}</span>
            <div style={{flex:1}}><div style={{fontFamily:G.font,fontWeight:700,color:e.color,fontSize:15}}>{lang==="sv"?e.sv:e.en}</div>{e.reason&&<div style={{fontFamily:G.font,fontSize:13,color:G.ink2,marginTop:2}}>{e.reason}</div>}</div>
            <div style={{fontFamily:G.font,fontSize:11,color:G.ink3,textAlign:"right"}}><div>{e.time}</div><div>{e.date}</div></div>
          </div>
        ))):(<>
          <div style={{display:"flex",justifyContent:"center",marginBottom:14,background:G.white,borderRadius:24,padding:18,boxShadow:sh.sm,border:`1px solid ${G.border}`}}>
            <svg width={240} height={128}>
              {arcs.map(arc=><path key={arc.i} d={arc.d} fill="none" stroke={arc.col} strokeWidth={20} strokeLinecap="butt"/>)}
              <line x1={cx} y1={cy} x2={np.x} y2={np.y} stroke={sel?sel.color:G.ink3} strokeWidth={4} strokeLinecap="round" style={{transition:"all .55s cubic-bezier(.34,1.56,.64,1)"}}/>
              <circle cx={cx} cy={cy} r={11} fill={sel?sel.color:G.ink3}/>
              <circle cx={cx} cy={cy} r={5} fill="#fff"/>
            </svg>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:24,flexWrap:"wrap"}}>
            {visibleEmos.map(e=>(
              <div key={e.id} onClick={()=>setSel(e)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,cursor:"pointer",padding:"14px 10px",borderRadius:18,background:sel?.id===e.id?`${e.color}18`:G.white,border:`1px solid ${sel?.id===e.id?e.color:G.border}`,boxShadow:sel?.id===e.id?sh.c(e.color):sh.xs,transform:sel?.id===e.id?"scale(1.06)":"scale(1)",transition:"all .22s ease",minWidth:62}}>
                <span style={{fontSize:32}}>{e.emoji}</span>
                <span style={{fontFamily:G.font,fontWeight:700,fontSize:9,color:e.color,whiteSpace:"nowrap"}}>{lang==="sv"?e.sv:e.en}</span>
              </div>
            ))}
          </div>
          {sel&&!saved&&(<>
            <SLabel>{t.emotionReason}</SLabel>
            <input value={reason} onChange={e=>setReason(e.target.value)} style={INP} placeholder="..."/>
            <button onClick={doSave} style={{width:"100%",padding:"16px 0",borderRadius:16,border:"none",background:sel.color,color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:15,cursor:"pointer",boxShadow:sh.c(sel.color)}}>💾 {t.save}</button>
          </>)}
          {saved&&<div style={{textAlign:"center",padding:28,fontFamily:G.serif,fontWeight:600,fontSize:24,color:S.deep}}>{t.emotionSaved}</div>}
        </>)}
      </div>
    </div>
  );
}

/* ═══ Timer screen ═══ */
function TimerScreen({t,cfg}){
  const S=SCREENS.timer;
  const tc=cfg.timerCfg;
  const allowed=tc.allowedTypes.length>0?tc.allowedTypes:["sector"];
  const[type,setType]=useState(allowed.includes(tc.defaultType)?tc.defaultType:allowed[0]);
  const[min,setMin]=useState(tc.defaultMin);
  const[color,setColor]=useState(tc.defaultColor);
  const[full,setFull]=useState(false);
  const[key,setKey]=useState(0);
  const start=()=>{setKey(k=>k+1);setFull(true);};
  return(
    <>
      {full&&<FullTimer key={key} type={type} totalSec={min*60} color={color} t={t} autoRun={true} onClose={()=>setFull(false)}/>}
      <div style={{flex:1,overflowY:"auto",padding:"16px 18px 20px",display:"flex",flexDirection:"column",gap:18,background:S.hb}}>
        {/* Preview + start — compact, at the top */}
        <div style={{background:G.white,borderRadius:24,padding:"22px 22px 20px",boxShadow:sh.md,display:"flex",flexDirection:"column",alignItems:"center",gap:14,border:`1px solid ${G.border}`}}>
          <TimerThumb type={type} color={color} size={130} min={min}/>
          <div style={{fontFamily:G.font,fontWeight:600,fontSize:13,color:G.ink2}}>{min} {t.min} · {tlbl(type,t)}</div>
          <button onClick={start} style={{width:"100%",maxWidth:300,padding:"15px 0",borderRadius:16,border:"none",background:`linear-gradient(135deg,${color},${color}DC)`,color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:16,cursor:"pointer",boxShadow:sh.c(color)}}>▶ &nbsp;{t.startTimer}</button>
        </div>
        {/* Minutes */}
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <SLabel>{t.timerMin}</SLabel>
            <span style={{fontFamily:G.serif,fontWeight:600,fontSize:22,color:G.ink}}>{min} {t.min}</span>
          </div>
          <input type="range" min={1} max={120} value={min} onChange={e=>setMin(+e.target.value)} style={{width:"100%",accentColor:color}}/>
          <div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap"}}>
            {[1,5,10,15,20,30,45,60].map(v=><button key={v} onClick={()=>setMin(v)} style={{padding:"7px 12px",borderRadius:11,fontFamily:G.font,fontWeight:600,fontSize:12,cursor:"pointer",border:`1px solid ${min===v?color:G.border}`,background:min===v?color:G.white,color:min===v?"#fff":G.ink2}}>{v}</button>)}
          </div>
        </div>
        {/* Type */}
        {allowed.length>1&&(
          <div>
            <SLabel>{t.timerType}</SLabel>
            <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(allowed.length,3)},1fr)`,gap:8}}>
              {allowed.map(k=><button key={k} onClick={()=>setType(k)} style={{padding:"14px 6px",borderRadius:16,border:"1px solid",fontFamily:G.font,fontWeight:700,fontSize:11,cursor:"pointer",transition:"all .2s",borderColor:type===k?color:G.border,background:type===k?`${color}12`:G.white,color:type===k?color:G.ink2,boxShadow:type===k?sh.c(color):sh.xs}}><div style={{fontSize:22,marginBottom:4}}>{TICON[k]}</div>{tlbl(k,t)}</button>)}
            </div>
          </div>
        )}
        {/* Color */}
        <div>
          <SLabel>{t.timerColor}</SLabel>
          <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>
            {TMR_C.map(col=><div key={col} onClick={()=>setColor(col)} style={{width:32,height:32,borderRadius:"50%",background:col,cursor:"pointer",outline:color===col?`3px solid ${col}`:"none",outlineOffset:2,boxShadow:color===col?sh.c(col):"none",transition:"all .15s"}}/>)}
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══ Activity row ═══ */
function ActRow({item,cardStyle,isEditor,onEdit,onTap,onMarkDone,idx}){
  const[anim,setAnim]=useState("in");
  const big=cardStyle==="big", compact=cardStyle==="compact";
  if(anim==="exit") return null;
  const handleClick=()=>{
    if(isEditor)onEdit(item);else onTap(item);
  };
  return(
    <div style={{animation:anim==="in"?`rIn .35s cubic-bezier(.2,.7,.2,1) both`:`rExit .8s cubic-bezier(.4,0,.2,1) forwards`,animationDelay:anim==="in"?`${idx*0.04}s`:"0s"}}>
      <style>{`@keyframes rIn{from{opacity:0;transform:translateY(14px) scale(.985)}to{opacity:1;transform:none}}@keyframes rExit{0%{opacity:1;transform:scale(1);filter:none}40%{opacity:1;transform:scale(1.015);filter:brightness(1.04)}100%{opacity:0;transform:scale(.92) translateY(8px);filter:brightness(1.1)}}`}</style>
      <div
        onClick={handleClick}
        style={{
          background:G.white,
          borderRadius:big?22:18,
          overflow:"hidden",
          position:"relative",
          boxShadow:sh.sm,
          border:`1px solid ${G.border}`,
          cursor:"pointer",
          transition:"box-shadow .35s cubic-bezier(.2,.7,.2,1), border-color .25s, transform .2s cubic-bezier(.2,.7,.2,1)",
          userSelect:"none",
          WebkitUserSelect:"none",
          WebkitTouchCallout:"none",
        }}
        onMouseEnter={e=>{e.currentTarget.style.boxShadow=sh.md;e.currentTarget.style.borderColor=`${item.color}40`;e.currentTarget.style.transform="translateY(-1px)";}}
        onMouseLeave={e=>{e.currentTarget.style.boxShadow=sh.sm;e.currentTarget.style.borderColor=G.border;e.currentTarget.style.transform="";}}>
        {big&&<div style={{height:92,background:item.photo?"#000":`linear-gradient(135deg,${item.color}1F,${item.color}38)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:60,position:"relative",overflow:"hidden"}}>{item.photo?<img src={item.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:item.emoji}</div>}
        <div style={{display:"flex",alignItems:"center",gap:compact?10:13,padding:compact?"12px 14px":"16px 18px",position:"relative"}}>
          <div style={{position:"absolute",left:0,top:0,bottom:0,width:4,background:`linear-gradient(180deg,${item.color},${item.color}80)`,borderRadius:"18px 0 0 18px"}}/>
          <div style={{marginLeft:4}}/>
          {!big&&<div style={{fontSize:compact?30:38,lineHeight:1,minWidth:compact?44:54,height:compact?44:54,borderRadius:compact?12:14,background:item.photo?"#000":`linear-gradient(140deg,${item.color}18,${item.color}30)`,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${item.color}25`,flexShrink:0,overflow:"hidden"}}>{item.photo?<img src={item.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:item.emoji}</div>}
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:G.serif,fontWeight:400,fontSize:compact?16:19,color:G.ink,lineHeight:1.2,letterSpacing:-.3}}>{item.name}</div>
            <div style={{display:"flex",alignItems:"center",gap:7,marginTop:5,flexWrap:"wrap"}}>
              <span style={{fontFamily:G.font,fontWeight:600,fontSize:12,color:item.color,letterSpacing:.4}}>{item.time}{item.endTime?` – ${item.endTime}`:""}</span>
              {item.repeat&&item.repeat.type&&item.repeat.type!=="none"&&(
                <Tag col={item.color}>🔁 {item.repeat.type==="daily"?"Dagligen":item.repeat.type==="weekdays"?"Vardagar":item.repeat.type==="weekend"?"Helger":(item.repeat.days||[]).length+" dagar"}</Tag>
              )}
              {item.steps?.length>0&&<Tag col={item.color}>📋 {item.steps.length}</Tag>}
              {item.timer?.on&&<Tag col={item.timer.color||"#E89B89"}>{TICON[item.timer.type]} {item.timer.min}m</Tag>}
            </div>
          </div>
          {isEditor&&<button onClick={e=>{e.stopPropagation();onEdit(item);}} style={{background:SCREENS.home.hl,border:"none",borderRadius:11,width:36,height:36,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>✏️</button>}
        </div>
      </div>
    </div>
  );
}

/* ═══ Card view ═══ */
function CardView({acts,onTap,t,isEditor,onEdit,onMarkDone}){
  const[idx,setIdx]=useState(0);
  const[anim,setAnim]=useState(null);
  const[holdPct,setHoldPct]=useState(0);
  const startPt=useRef(null);
  const holdTimer=useRef(null);
  const holdStart=useRef(null);
  const isHolding=useRef(false);
  const movedOut=useRef(false);
  const item=acts[idx];
  const HOLD_MS=1100;
  useEffect(()=>{if(idx>=acts.length&&acts.length>0) setIdx(Math.max(0,acts.length-1));},[acts.length,idx]);
  useEffect(()=>()=>{if(holdTimer.current)clearInterval(holdTimer.current);},[]);
  if(!item) return <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,padding:40}}><div style={{fontSize:64}}>🌟</div><div style={{fontFamily:G.serif,fontWeight:600,fontSize:24,color:G.ink}}>Bra jobbat!</div><div style={{fontFamily:G.font,fontSize:14,color:G.ink2}}>Alla aktiviteter är klara!</div></div>;

  const cancelHold=()=>{
    if(holdTimer.current){clearInterval(holdTimer.current);holdTimer.current=null;}
    holdStart.current=null;
    isHolding.current=false;
    setHoldPct(0);
  };

  const startHold=()=>{
    if(isEditor) return;
    holdStart.current=Date.now();
    isHolding.current=true;
    movedOut.current=false;
    holdTimer.current=setInterval(()=>{
      if(!holdStart.current) return;
      const p=Math.min(1,(Date.now()-holdStart.current)/HOLD_MS);
      setHoldPct(p);
      if(p>=1){
        cancelHold();
        chime();
        setAnim("out");
        setTimeout(()=>{onMarkDone(item.id);setAnim(null);},520);
      }
    },30);
  };

  const onTS=e=>{
    const x=e.touches?.[0]?.clientX??e.clientX;
    const y=e.touches?.[0]?.clientY??e.clientY;
    startPt.current={x,y,t:Date.now()};
    startHold();
  };
  const onTM=e=>{
    if(!startPt.current) return;
    const x=e.touches?.[0]?.clientX??e.clientX;
    const y=e.touches?.[0]?.clientY??e.clientY;
    const dx=x-startPt.current.x, dy=y-startPt.current.y;
    if(Math.abs(dx)>8||Math.abs(dy)>8){
      movedOut.current=true;
      cancelHold();
    }
  };
  const onTE=e=>{
    if(!startPt.current) return;
    const x=e.changedTouches?.[0]?.clientX??e.clientX;
    const y=e.changedTouches?.[0]?.clientY??e.clientY;
    const dx=x-startPt.current.x, dy=y-startPt.current.y;
    const dur=Date.now()-startPt.current.t;
    cancelHold();
    startPt.current=null;
    // Horizontal swipe to navigate
    if(Math.abs(dx)>40 && Math.abs(dx)>Math.abs(dy)){
      setIdx(i=>dx<0?Math.min(acts.length-1,i+1):Math.max(0,i-1));
      return;
    }
    // Quick tap → open detail (or edit)
    if(dur<300 && Math.abs(dx)<8 && Math.abs(dy)<8 && !movedOut.current){
      isEditor ? onEdit(item) : onTap(item);
    }
  };

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:18,padding:"0 20px",userSelect:"none",position:"relative"}}>
      <style>{`@keyframes cOut{0%{opacity:1;transform:scale(1) translateY(0)}100%{opacity:0;transform:scale(.85) translateY(-120px)}}`}</style>

      {/* Hold hint */}
      {holdPct>0.05 && (
        <div style={{position:"absolute",top:"8%",left:"50%",transform:"translateX(-50%)",padding:"10px 22px",borderRadius:20,background:holdPct>=1?item.color:G.white,border:`2px solid ${item.color}`,color:holdPct>=1?"#fff":item.color,fontFamily:G.font,fontWeight:700,fontSize:13,boxShadow:sh.sm,display:"flex",alignItems:"center",gap:8,pointerEvents:"none",zIndex:5}}>
          <span style={{fontSize:16}}>✓</span>
          {holdPct>=1?"Klar!":"Håll kvar för att slutföra"}
        </div>
      )}

      <div
        onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE} onTouchCancel={cancelHold}
        onMouseDown={onTS} onMouseMove={onTM} onMouseUp={onTE} onMouseLeave={cancelHold}
        onContextMenu={e=>e.preventDefault()}
        draggable={false}
        style={{
          width:"100%",maxWidth:340,
          background:G.white,borderRadius:30,padding:"34px 26px 28px",textAlign:"center",cursor:"pointer",
          boxShadow: holdPct>0 ? `0 18px 60px ${item.color}44, 0 0 0 2px ${item.color}AA` : `0 18px 60px ${item.color}1F`,
          border:`1px solid ${item.color}25`,
          transform: holdPct>0 ? `scale(${1+holdPct*0.025})` : "none",
          transition: "transform .2s ease, box-shadow .2s ease",
          animation:anim==="out"?"cOut .55s ease forwards":"none",
          position:"relative",overflow:"hidden",
          touchAction:"pan-x",
          willChange:"transform",
          WebkitUserSelect:"none",userSelect:"none",WebkitTouchCallout:"none",
        }}>
        {/* Hold progress fill — fills the card from bottom up */}
        {holdPct>0 && (
          <div style={{position:"absolute",inset:0,background:`linear-gradient(0deg, ${item.color}22 0%, ${item.color}22 ${holdPct*100}%, transparent ${holdPct*100}%)`,pointerEvents:"none",transition:"background .03s linear"}}/>
        )}
        {item.photo?(
          <div style={{width:140,height:140,borderRadius:24,overflow:"hidden",margin:"0 auto 14px",position:"relative",background:"#000",boxShadow:`0 8px 24px ${item.color}33`}}>
            <img src={item.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          </div>
        ):(
          <div style={{fontSize:76,lineHeight:1,marginBottom:14,display:"inline-block",padding:18,borderRadius:24,background:`linear-gradient(140deg,${item.color}1A,${item.color}30)`,pointerEvents:"none",position:"relative"}}>{item.emoji}</div>
        )}
        <div style={{fontFamily:G.font,fontWeight:600,fontSize:11,color:item.color,letterSpacing:2.5,textTransform:"uppercase",marginBottom:6,pointerEvents:"none",position:"relative"}}>{item.time}</div>
        <div style={{fontFamily:G.serif,fontWeight:600,fontSize:24,color:G.ink,lineHeight:1.2,letterSpacing:-.4,pointerEvents:"none",position:"relative"}}>{item.name}</div>
        {item.steps?.length>0&&<div style={{display:"flex",gap:8,justifyContent:"center",marginTop:14,flexWrap:"wrap",pointerEvents:"none",position:"relative"}}>{item.steps.slice(0,5).map(s=><span key={s.id} style={{fontSize:22}}>{s.emoji}</span>)}{item.steps.length>5&&<span style={{fontFamily:G.font,fontSize:13,color:G.ink2}}>+{item.steps.length-5}</span>}</div>}
      </div>

      {/* Pagination dots */}
      <div style={{display:"flex",gap:8}}>{acts.map((_,i)=><div key={i} onClick={()=>setIdx(i)} style={{height:8,width:i===idx?24:8,borderRadius:5,background:i===idx?item.color:G.border,cursor:"pointer",transition:"all .3s"}}/>)}</div>

      {/* Subtle navigation row */}
      <div style={{display:"flex",gap:10,alignItems:"center"}}>
        <button onClick={()=>setIdx(i=>Math.max(0,i-1))} disabled={idx===0} style={{padding:"8px 18px",borderRadius:12,border:"none",fontFamily:G.font,fontWeight:600,fontSize:12,cursor:idx===0?"default":"pointer",background:idx===0?G.cream:SCREENS.home.hl,color:idx===0?G.ink3:SCREENS.home.deep}}>←</button>
        <div style={{fontFamily:G.font,fontWeight:500,fontSize:11,color:G.ink3,letterSpacing:.5,minWidth:36,textAlign:"center"}}>{idx+1} / {acts.length}</div>
        <button onClick={()=>setIdx(i=>Math.min(acts.length-1,i+1))} disabled={idx===acts.length-1} style={{padding:"8px 18px",borderRadius:12,border:"none",fontFamily:G.font,fontWeight:600,fontSize:12,cursor:idx===acts.length-1?"default":"pointer",background:idx===acts.length-1?G.cream:SCREENS.home.hl,color:idx===acts.length-1?G.ink3:SCREENS.home.deep}}>→</button>
      </div>
    </div>
  );
}

/* ═══ Shared UI primitives ═══ */
function Overlay({children,onClose}){return(<div style={{position:"fixed",inset:0,background:"rgba(31,27,46,0.42)",backdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:500}} onClick={onClose}><div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:480}}>{children}</div></div>);}
function Sheet({children,scroll}){return(<div style={{background:G.white,borderRadius:"28px 28px 0 0",padding:"28px 22px 48px",maxHeight:"90vh",overflowY:scroll?"auto":"hidden",boxShadow:"0 -24px 60px rgba(31,27,46,0.18)"}}>{children}</div>);}
function Toggle({on,onChange,color}){return(<div onClick={onChange} style={{width:52,height:30,borderRadius:15,background:on?color:G.border2,cursor:"pointer",position:"relative",transition:"background .3s",flexShrink:0}}><div style={{width:24,height:24,borderRadius:"50%",background:G.white,position:"absolute",top:3,left:on?25:3,transition:"left .3s",boxShadow:"0 2px 6px rgba(0,0,0,.18)"}}/></div>);}
function SLabel({children}){return <div style={{fontFamily:G.font,fontWeight:600,fontSize:11,color:G.ink3,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>{children}</div>;}
function Tag({col,children}){return <span style={{fontFamily:G.font,fontSize:11,color:col,background:`${col}14`,borderRadius:8,padding:"3px 9px"}}>{children}</span>;}
const INP={width:"100%",padding:"13px 16px",borderRadius:14,border:`1px solid ${G.border}`,fontSize:15,outline:"none",fontFamily:G.font,color:G.ink,boxSizing:"border-box",marginBottom:16,background:G.cream};
const GHOST={padding:"13px 20px",borderRadius:14,border:`1px solid ${G.border}`,background:G.white,color:G.ink2,fontFamily:G.font,fontWeight:600,fontSize:14,cursor:"pointer"};

function TabB({active,gold,children,onClick,color,deep,flex=1}){
  return(
    <button onClick={onClick} onMouseDown={e=>e.currentTarget.style.transform="scale(0.96)"} onMouseUp={e=>e.currentTarget.style.transform=""} onMouseLeave={e=>e.currentTarget.style.transform=""} style={{flex,padding:"9px 0",borderRadius:11,border:"none",fontFamily:G.font,fontWeight:700,fontSize:12,cursor:"pointer",transition:"transform .15s, background .25s, box-shadow .25s, color .2s",background:gold?"linear-gradient(135deg,#FDE68A,#F4C95C)":active?`linear-gradient(135deg,${color},${color}E5)`:"transparent",color:gold?"#78350F":active?"#fff":G.ink2,boxShadow:active?`0 4px 14px ${color}55, 0 1px 3px ${color}33`:gold?"0 3px 10px #FDE68A88":"none"}}>{children}</button>
  );
}

/* ═══ Story viewer (fullscreen page-by-page) ═══ */
function StoryViewer({story,lang,t,onClose}){
  const[idx,setIdx]=useState(0);
  const startX=useRef(null);
  const isFT=story.type==="firstthen";
  const page=story.pages[idx];
  if(!page) return null;
  const onTS=e=>{startX.current=e.touches?.[0]?.clientX??e.clientX;};
  const onTE=e=>{if(startX.current===null)return;const dx=(e.changedTouches?.[0]?.clientX??e.clientX)-startX.current;if(Math.abs(dx)>40){if(dx<0&&idx<story.pages.length-1)setIdx(i=>i+1);else if(dx>0&&idx>0)setIdx(i=>i-1);}startX.current=null;};

  // FIRST-THEN: special two-card contract layout
  if(isFT){
    const firstPage=story.pages[0], thenPage=story.pages[1];
    return(
      <div style={{position:"fixed",inset:0,zIndex:9000,background:"#FFFFFF",backgroundImage:`linear-gradient(165deg,${story.color}12 0%,#FFFFFF 70%)`,display:"flex",flexDirection:"column",userSelect:"none",animation:"ftIn .25s ease"}}>
        <style>{`@keyframes ftArrow{0%{transform:translateX(0)}50%{transform:translateX(8px)}100%{transform:translateX(0)}}`}</style>
        <div style={{padding:"22px 22px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:22}}>{story.emoji}</span>
            <div style={{fontFamily:G.serif,fontWeight:600,fontSize:16,color:story.color,letterSpacing:-.2}}>{lang==="sv"?story.sv:story.en}</div>
          </div>
          <button onClick={onClose} style={{width:44,height:44,borderRadius:22,border:`1px solid ${G.border}`,background:G.white,color:G.ink2,fontSize:20,cursor:"pointer",boxShadow:sh.sm}}>✕</button>
        </div>
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px 18px",gap:10}}>
          {/* FIRST */}
          <div style={{flex:1,background:G.white,borderRadius:26,padding:"18px 12px 22px",boxShadow:`0 16px 40px ${story.color}26`,border:`1px solid ${story.color}30`,textAlign:"center"}}>
            <div style={{fontFamily:G.font,fontWeight:700,fontSize:11,color:story.color,letterSpacing:2.5,textTransform:"uppercase",marginBottom:12}}>{story.firstLabel?.trim()||t.first||"Först"}</div>
            <div style={{width:"100%",aspectRatio:"1",borderRadius:20,background:firstPage?.photo?"#000":`linear-gradient(140deg,${story.color}1A,${story.color}3A)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:72,marginBottom:12,overflow:"hidden"}}>
              {firstPage?.photo?<img src={firstPage.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:firstPage?.emoji}
            </div>
            <div style={{fontFamily:G.serif,fontWeight:600,fontSize:17,color:G.ink,lineHeight:1.2,letterSpacing:-.2}}>{lang==="sv"?firstPage?.sv:firstPage?.en}</div>
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
            <div style={{fontFamily:G.serif,fontWeight:600,fontSize:17,color:G.ink,lineHeight:1.2,letterSpacing:-.2}}>{lang==="sv"?thenPage?.sv:thenPage?.en}</div>
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
      <div style={{padding:"22px 22px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:22}}>{story.emoji}</span>
          <div style={{fontFamily:G.serif,fontWeight:600,fontSize:16,color:story.color,letterSpacing:-.2}}>{lang==="sv"?story.sv:story.en}</div>
        </div>
        <button onClick={onClose} style={{width:44,height:44,borderRadius:22,border:`1px solid ${G.border}`,background:G.white,color:G.ink2,fontSize:20,cursor:"pointer",boxShadow:sh.sm}}>✕</button>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 30px",gap:32}}>
        <div style={{width:220,height:220,borderRadius:36,background:page.photo?"transparent":`linear-gradient(140deg,${story.color}1A,${story.color}38)`,border:`1px solid ${story.color}30`,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",fontSize:120,boxShadow:`0 20px 50px ${story.color}26`}}>
          {page.photo?<img src={page.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:page.emoji}
        </div>
        <div style={{fontFamily:G.serif,fontWeight:600,fontSize:22,color:G.ink,textAlign:"center",lineHeight:1.35,maxWidth:340,letterSpacing:-.3}}>{lang==="sv"?page.sv:page.en}</div>
      </div>
      <div style={{padding:"0 24px 32px"}}>
        <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:22}}>
          {story.pages.map((_,i)=><div key={i} onClick={()=>setIdx(i)} style={{height:9,width:i===idx?28:9,borderRadius:5,background:i===idx?story.color:`${story.color}33`,cursor:"pointer",transition:"all .3s"}}/>)}
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"center"}}>
          <button onClick={()=>setIdx(i=>Math.max(0,i-1))} disabled={idx===0} style={{padding:"13px 22px",borderRadius:16,border:"none",fontFamily:G.font,fontWeight:600,fontSize:14,cursor:idx===0?"default":"pointer",background:idx===0?G.cream:`${story.color}18`,color:idx===0?G.ink3:story.color}}>{t.prev}</button>
          <button onClick={()=>{if(idx<story.pages.length-1)setIdx(i=>i+1);else onClose();}} style={{padding:"13px 28px",borderRadius:16,border:"none",fontFamily:G.font,fontWeight:700,fontSize:14,background:`linear-gradient(135deg,${story.color},${story.color}DC)`,color:"#fff",cursor:"pointer",boxShadow:sh.c(story.color)}}>{idx<story.pages.length-1?t.next:"✓ Klar"}</button>
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
    <div style={{background:G.cream,borderRadius:16,padding:14,marginBottom:10,border:`1px solid ${G.border}`}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:11}}>
        <span style={{fontFamily:G.font,fontWeight:600,fontSize:11,color:G.ink3,letterSpacing:.8}}>{t.pageNum} {idx+1}</span>
        <div style={{flex:1}}/>
        <button onClick={onMoveUp} disabled={idx===0} style={{padding:"4px 9px",borderRadius:8,border:"none",background:idx===0?G.white:G.border,color:idx===0?G.ink3:G.ink2,cursor:idx===0?"default":"pointer",fontSize:11}}>↑</button>
        <button onClick={onMoveDown} disabled={idx===total-1} style={{padding:"4px 9px",borderRadius:8,border:"none",background:idx===total-1?G.white:G.border,color:idx===total-1?G.ink3:G.ink2,cursor:idx===total-1?"default":"pointer",fontSize:11}}>↓</button>
        <button onClick={onRemove} style={{padding:"4px 9px",borderRadius:8,border:"none",background:"#FEF2F2",color:"#EF4444",cursor:"pointer",fontSize:11}}>✕</button>
      </div>
      <div style={{display:"flex",gap:10}}>
        <div onClick={()=>setShowE(true)} style={{width:64,height:64,borderRadius:14,background:page.photo?"transparent":G.white,border:`1px solid ${G.border}`,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,flexShrink:0,cursor:"pointer"}}>
          {page.photo?<img src={page.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:page.emoji}
        </div>
        <div style={{flex:1,display:"flex",flexDirection:"column",gap:6}}>
          <textarea value={page.sv} onChange={e=>onUpdate("sv",e.target.value)} placeholder="t.ex. Jag bäddar sängen" style={{...INP,marginBottom:0,minHeight:42,resize:"vertical",fontSize:14,fontFamily:G.font}}/>
          <div style={{display:"flex",gap:6}}>
            <input ref={fileRef} type="file" accept="image/*" onChange={onPhoto} style={{display:"none"}}/>
            <button onClick={()=>fileRef.current?.click()} style={{flex:1,padding:"7px",borderRadius:9,border:`1px solid ${G.border}`,background:G.white,color:G.ink2,fontFamily:G.font,fontWeight:600,fontSize:11,cursor:"pointer"}}>📷 Foto</button>
            <button onClick={()=>setShowE(true)} style={{flex:1,padding:"7px",borderRadius:9,border:`1px solid ${G.border}`,background:G.white,color:G.ink2,fontFamily:G.font,fontWeight:600,fontSize:11,cursor:"pointer"}}>😊 Emoji</button>
            {page.photo&&<button onClick={()=>onUpdate("photo",null)} style={{padding:"7px 10px",borderRadius:9,border:"none",background:"#FEF2F2",color:"#EF4444",cursor:"pointer",fontSize:11}}>↺</button>}
          </div>
        </div>
      </div>
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
function StoryEditor({story,onSave,onDel,onClose,t}){
  const[type,setType]=useState(story?.type||"sequence");
  const[title,setTitle]=useState(story?.sv||"");
  const[emoji,setEmoji]=useState(story?.emoji||(story?.type==="firstthen"?"📋":"📖"));
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
    onSave({id:story?.id||"s"+Date.now(),type,sv:title,en:title,emoji,color,pages,firstLabel:firstLabel.trim(),thenLabel:thenLabel.trim()});
    onClose();
  };
  return(
    <Overlay onClose={onClose}>
      <Sheet scroll>
        <div style={{fontFamily:G.serif,fontWeight:600,fontSize:21,color:G.ink,marginBottom:18}}>{story?.id?"Redigera berättelse":t.newStory}</div>

        {/* Type selector */}
        <SLabel>Typ</SLabel>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
          <button onClick={()=>switchType("sequence")} style={{padding:"14px 10px",borderRadius:14,border:`1.5px solid ${type==="sequence"?S.h:G.border}`,background:type==="sequence"?S.hl:G.white,color:type==="sequence"?S.deep:G.ink2,fontFamily:G.font,fontWeight:600,cursor:"pointer",fontSize:13,textAlign:"center",lineHeight:1.3}}>
            <div style={{fontSize:22,marginBottom:4}}>📖</div>
            <div>Steg-för-steg</div>
            <div style={{fontSize:10,opacity:.7,marginTop:3,fontWeight:500}}>Flera sidor</div>
          </button>
          <button onClick={()=>switchType("firstthen")} style={{padding:"14px 10px",borderRadius:14,border:`1.5px solid ${type==="firstthen"?S.h:G.border}`,background:type==="firstthen"?S.hl:G.white,color:type==="firstthen"?S.deep:G.ink2,fontFamily:G.font,fontWeight:600,cursor:"pointer",fontSize:13,textAlign:"center",lineHeight:1.3}}>
            <div style={{fontSize:22,marginBottom:4}}>📋</div>
            <div>Först-Sedan</div>
            <div style={{fontSize:10,opacity:.7,marginTop:3,fontWeight:500}}>Först → Sedan</div>
          </button>
        </div>

        <SLabel>{t.pickEmoji}</SLabel>
        <button onClick={()=>setShowE(true)} style={{fontSize:32,padding:"10px 22px",borderRadius:14,border:`1px solid ${G.border}`,background:G.white,cursor:"pointer",marginBottom:16}}>{emoji}</button>
        <SLabel>{t.storyTitle}</SLabel>
        <input value={title} onChange={e=>setTitle(e.target.value)} style={INP} placeholder={isFT?"t.ex. Först läxor, sedan TV":"t.ex. Städa rummet"}/>
        <SLabel>{t.pickColor}</SLabel>
        <div style={{display:"flex",gap:9,marginBottom:22,flexWrap:"wrap"}}>
          {ACT_C.map(col=><div key={col} onClick={()=>setColor(col)} style={{width:32,height:32,borderRadius:"50%",background:col,cursor:"pointer",outline:color===col?`3px solid ${col}`:"none",outlineOffset:2}}/>)}
        </div>
        <SLabel>{isFT?"Först och Sedan":`${t.pages} · ${pages.length}`}</SLabel>
        {isFT?(
          <>
            <div style={{padding:"12px 14px",borderRadius:14,background:`${color}0C`,border:`1px solid ${color}28`,marginBottom:18}}>
              <div style={{fontFamily:G.font,fontWeight:600,fontSize:11,color:G.ink3,letterSpacing:0.8,textTransform:"uppercase",marginBottom:8}}>Etiketter (visas över korten)</div>
              <div style={{display:"flex",gap:8}}>
                <input value={firstLabel} onChange={e=>setFirstLabel(e.target.value)} placeholder={t.first||"Först"} maxLength={20} style={{...INP,flex:1,marginBottom:0,fontSize:14}}/>
                <input value={thenLabel} onChange={e=>setThenLabel(e.target.value)} placeholder={t.then||"Sedan"} maxLength={20} style={{...INP,flex:1,marginBottom:0,fontSize:14}}/>
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
        <div style={{display:"flex",gap:8,marginTop:isFT?20:0}}>
          {story?.id&&<button onClick={()=>{onDel(story.id);onClose();}} style={{padding:"14px 16px",borderRadius:14,border:"none",background:"#FEF2F2",color:"#EF4444",cursor:"pointer",fontSize:17}}>🗑</button>}
          <button onClick={onClose} style={{flex:1,...GHOST}}>{t.cancel}</button>
          <button onClick={doSave} style={{flex:2,padding:"15px 0",borderRadius:14,border:"none",background:S.h,color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:15,cursor:"pointer",boxShadow:sh.c(S.h)}}>{t.save}</button>
        </div>
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
function StoryScreen({lang,t,isEditor,stories,setStories}){
  const[viewer,setViewer]=useState(null);
  const[editor,setEditor]=useState(null);
  const S=SCREENS.stories;
  return(
    <div style={{flex:1,overflowY:"auto",background:S.hb}}>
      {viewer&&<StoryViewer story={viewer} lang={lang} t={t} onClose={()=>setViewer(null)}/>}
      {editor&&<StoryEditor story={editor.id?editor:null} t={t} onSave={s=>setStories(ss=>editor.id?ss.map(x=>x.id===s.id?s:x):[...ss,s])} onDel={id=>setStories(ss=>ss.filter(x=>x.id!==id))} onClose={()=>setEditor(null)}/>}
      <div style={{padding:"20px 20px 120px"}}>
        <div style={{fontFamily:G.serif,fontWeight:600,fontSize:22,color:G.ink,marginBottom:18,letterSpacing:-.2}}>{t.stories}</div>
        {stories.length===0&&!isEditor?(
          <div style={{textAlign:"center",marginTop:60,color:G.ink3,fontFamily:G.font}}>{t.noStories}</div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
            {stories.map(s=>(
              <div key={s.id} style={{position:"relative"}}>
                <div onClick={()=>isEditor?setEditor(s):setViewer(s)} onMouseDown={e=>e.currentTarget.style.transform="scale(0.97)"} onMouseUp={e=>e.currentTarget.style.transform=""} onMouseLeave={e=>e.currentTarget.style.transform=""} onTouchStart={e=>e.currentTarget.style.transform="scale(0.97)"} onTouchEnd={e=>e.currentTarget.style.transform=""} style={{background:G.white,borderRadius:20,padding:"22px 14px 18px",cursor:"pointer",border:`1px solid ${s.color}25`,boxShadow:`0 6px 20px ${s.color}14`,transition:"transform .15s ease, box-shadow .2s ease"}}>
                  <div style={{width:84,height:84,margin:"0 auto 12px",borderRadius:20,background:`linear-gradient(140deg,${s.color}1F,${s.color}3A)`,border:`1px solid ${s.color}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:46}}>{s.emoji}</div>
                  <div style={{fontFamily:G.serif,fontWeight:600,fontSize:15,color:G.ink,textAlign:"center",lineHeight:1.2,letterSpacing:-.2}}>{lang==="sv"?s.sv:s.en}</div>
                  <div style={{fontFamily:G.font,fontWeight:600,fontSize:10,color:s.color,textAlign:"center",marginTop:7,letterSpacing:.5,display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                    {s.type==="firstthen"?<><span>📋</span><span>{lang==="sv"?"Först-Sedan":"First-Then"}</span></>:<><span>{s.pages.length}</span><span>{t.pages.toLowerCase()}</span></>}
                  </div>
                </div>
                {isEditor&&<div style={{position:"absolute",top:8,right:8,padding:"4px 8px",borderRadius:10,background:G.white,boxShadow:sh.sm,fontSize:11,color:s.color,fontFamily:G.font,fontWeight:600}}>✏️</div>}
              </div>
            ))}
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
      <div style={{position:"fixed",inset:0,zIndex:9000,background:"#FFFFFF",backgroundImage:`linear-gradient(165deg,${BLUE}14,#FFFFFF)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:30,gap:24,animation:"ftIn .4s ease"}}>
        <div style={{fontSize:80}}>🌿</div>
        <div style={{fontFamily:G.serif,fontWeight:600,fontSize:28,color:DEEP,textAlign:"center",letterSpacing:-.3}}>{t.breathDone}</div>
        <button onClick={onClose} style={{padding:"15px 40px",borderRadius:18,border:"none",background:`linear-gradient(135deg,${BLUE},${DEEP})`,color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:16,cursor:"pointer",boxShadow:sh.c(BLUE),marginTop:10}}>{t.close}</button>
      </div>
    );
  }
  return(
    <div style={{position:"fixed",inset:0,zIndex:9000,background:"#FFFFFF",backgroundImage:`linear-gradient(165deg,${BLUE}14 0%,#FFFFFF 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,animation:"ftIn .25s ease"}}>
      <button onClick={onClose} style={{position:"absolute",top:24,right:24,width:44,height:44,borderRadius:22,border:`1px solid ${G.border}`,background:G.white,color:G.ink2,fontSize:20,cursor:"pointer",boxShadow:sh.sm,zIndex:5}}>✕</button>
      {!started?(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:24,padding:30,textAlign:"center"}}>
          {/* Preview bubble */}
          <div style={{width:160,height:160,borderRadius:"50%",background:`radial-gradient(circle at 35% 30%, ${BLUE}88 0%, ${BLUE}55 50%, ${DEEP}33 100%)`,boxShadow:`0 18px 50px ${BLUE}55, inset 0 -12px 28px ${DEEP}33, inset 0 10px 22px rgba(255,255,255,0.5)`,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",width:60,height:36,top:24,left:32,borderRadius:"50%",background:"radial-gradient(ellipse, rgba(255,255,255,0.7), transparent 70%)",filter:"blur(2px)"}}/>
          </div>
          <div style={{fontFamily:G.serif,fontWeight:600,fontSize:26,color:G.ink,letterSpacing:-.3}}>{t.breathing}</div>
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
        <button onClick={onClose} style={{position:"absolute",top:24,right:24,width:44,height:44,borderRadius:22,border:`1px solid ${G.border}`,background:G.white,color:G.ink2,fontSize:20,cursor:"pointer",boxShadow:sh.sm}}>✕</button>
        <div style={{fontSize:80}}>🌱</div>
        <div style={{fontFamily:G.serif,fontWeight:600,fontSize:26,color:G.ink,textAlign:"center",letterSpacing:-.3}}>{t.groundIntro}</div>
        <div style={{fontFamily:G.font,fontSize:15,color:G.ink2,textAlign:"center",maxWidth:280,lineHeight:1.5}}>Vi går igenom fem sinnen, ett i taget. Du behöver inte säga något högt.</div>
        <button onClick={()=>{setIdx(0);setChecked(0);}} style={{padding:"16px 42px",borderRadius:18,border:"none",background:`linear-gradient(135deg,${S.h},${S.h}DC)`,color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:16,cursor:"pointer",boxShadow:sh.c(S.h),marginTop:8}}>▶ {t.groundStart}</button>
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
        <button onClick={onClose} style={{width:40,height:40,borderRadius:20,border:`1px solid ${G.border}`,background:G.white,color:G.ink2,fontSize:18,cursor:"pointer",boxShadow:sh.sm}}>✕</button>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:36,padding:"0 20px"}}>
        <GroundIcon type={cur.type} color={cur.color} size={140}/>
        <div style={{fontFamily:G.serif,fontWeight:600,fontSize:26,color:G.ink,textAlign:"center",lineHeight:1.25,letterSpacing:-.3}}>{cur.label}</div>
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

/* ═══ Calm screen — pick exercise ═══ */
function CalmScreen({t,cfg}){
  const S=SCREENS.calm;
  const[active,setActive]=useState(null);
  const exercises=[
    cfg.calmTools?.breath!==false&&{key:"breath",emoji:"🫧",title:t.breathing,desc:"Andas lugnt i 4 omgångar",color:S.h,gradFrom:S.h,gradTo:"#B6D4E5"},
    cfg.calmTools?.grounding!==false&&{key:"grounding",emoji:"🌱",title:t.grounding,desc:"5 sinnen, ett i taget",color:"#A5C9B5",gradFrom:"#A5C9B5",gradTo:"#C5DBC9"},
  ].filter(Boolean);
  return(
    <div style={{flex:1,overflowY:"auto",background:S.hb}}>
      {active==="breath"&&<BreathingExercise onClose={()=>setActive(null)} t={t}/>}
      {active==="grounding"&&<GroundingExercise onClose={()=>setActive(null)} t={t}/>}
      <div style={{padding:"24px 20px 120px"}}>
        <div style={{fontFamily:G.serif,fontWeight:600,fontSize:22,color:G.ink,marginBottom:6,letterSpacing:-.3}}>{t.calmTitle}</div>
        <div style={{fontFamily:G.font,fontSize:14,color:G.ink2,marginBottom:24}}>Välj en övning som passar dig nu.</div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {exercises.map(ex=>(
            <div key={ex.key} onClick={()=>setActive(ex.key)} style={{background:G.white,borderRadius:24,padding:"24px 22px",cursor:"pointer",border:`1px solid ${ex.color}25`,boxShadow:`0 10px 30px ${ex.color}1F`,display:"flex",alignItems:"center",gap:18,transition:"transform .15s ease"}}>
              <div style={{width:74,height:74,borderRadius:22,background:`linear-gradient(140deg,${ex.gradFrom}40,${ex.gradTo}55)`,border:`1px solid ${ex.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:38,flexShrink:0,boxShadow:`inset 0 1px 0 rgba(255,255,255,0.6)`}}>{ex.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:G.serif,fontWeight:600,fontSize:18,color:G.ink,letterSpacing:-.2}}>{ex.title}</div>
                <div style={{fontFamily:G.font,fontSize:13,color:G.ink2,marginTop:4}}>{ex.desc}</div>
              </div>
              <div style={{fontSize:22,color:ex.color,opacity:.6}}>›</div>
            </div>
          ))}
          {exercises.length===0&&<div style={{textAlign:"center",color:G.ink3,fontFamily:G.font,marginTop:40}}>Aktivera övningar i Inställningar</div>}
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
          <div style={{fontFamily:G.font,fontWeight:600,fontSize:big?11:10,color:S.deep,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Hej, jag heter</div>
          <div style={{fontFamily:G.serif,fontWeight:600,fontSize:big?30:24,color:G.ink,lineHeight:1.1,letterSpacing:-.4,wordBreak:"break-word"}}>{c.name||"—"}</div>
          {c.age&&<div style={{fontFamily:G.font,fontWeight:500,fontSize:big?15:13,color:G.ink2,marginTop:3}}>{c.age} år</div>}
        </div>
      </div>
      <div style={{padding:big?"22px 28px 28px":"18px 22px 22px"}}>
        {c.condition&&(<>
          <div style={{fontFamily:G.font,fontWeight:600,fontSize:big?11:10,color:S.deep,letterSpacing:2,textTransform:"uppercase",marginTop:14,marginBottom:6}}>{t.aboutMe}</div>
          <div style={{fontFamily:G.serif,fontWeight:500,fontSize:big?18:16,color:G.ink,lineHeight:1.4,letterSpacing:-.1}}>{c.condition}</div>
        </>)}
        {c.triggers&&(<>
          <div style={{fontFamily:G.font,fontWeight:600,fontSize:big?11:10,color:S.deep,letterSpacing:2,textTransform:"uppercase",marginTop:18,marginBottom:6}}>⚠️ {t.myTriggers}</div>
          <div style={{fontFamily:G.font,fontWeight:500,fontSize:big?16:14,color:G.ink,lineHeight:1.4,background:S.hll,borderRadius:big?14:12,padding:big?"12px 15px":"10px 13px",border:`1px solid ${S.hl}`}}>{c.triggers}</div>
        </>)}
        {c.helpful&&(<>
          <div style={{fontFamily:G.font,fontWeight:600,fontSize:big?11:10,color:S.deep,letterSpacing:2,textTransform:"uppercase",marginTop:14,marginBottom:6}}>💚 {t.whatHelps}</div>
          <div style={{fontFamily:G.font,fontWeight:500,fontSize:big?16:14,color:G.ink,lineHeight:1.4,background:SCREENS.emotion.hll,borderRadius:big?14:12,padding:big?"12px 15px":"10px 13px",border:`1px solid ${SCREENS.emotion.hl}`}}>{c.helpful}</div>
        </>)}
        {contacts.filter(k=>k.name&&k.phone).length>0&&(<>
          <div style={{fontFamily:G.font,fontWeight:600,fontSize:big?11:10,color:S.deep,letterSpacing:2,textTransform:"uppercase",marginTop:18,marginBottom:8}}>📞 {t.emergencyContacts}</div>
          <div style={{display:"flex",flexDirection:"column",gap:big?10:8}}>
            {contacts.filter(k=>k.name&&k.phone).map(k=>(
              <a key={k.id} href={`tel:${k.phone.replace(/\s/g,"")}`} style={{textDecoration:"none",display:"flex",alignItems:"center",gap:12,padding:big?"15px 16px":"13px 14px",borderRadius:big?16:14,background:`linear-gradient(135deg,${S.h}EE,${S.h}DC)`,boxShadow:sh.c(S.h),color:"#fff"}}>
                <div style={{width:big?44:38,height:big?44:38,borderRadius:"50%",background:"rgba(255,255,255,0.22)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:big?20:18}}>📞</div>
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
        <button onClick={()=>setShowMode(false)} style={{position:"absolute",top:18,right:18,width:42,height:42,borderRadius:21,border:`1px solid ${G.border}`,background:G.white,color:G.ink2,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:sh.sm,zIndex:2}}>✕</button>
        <div style={{maxWidth:440,margin:"32px auto 24px",width:"100%"}}><Card big/></div>
      </div>
    );
  }

  return(
    <div style={{flex:1,overflowY:"auto",background:S.hb}}>
      {showEdit&&<IdCardEditor cfg={cfg} setCfg={setCfg} onClose={()=>setShowEdit(false)} t={t}/>}
      <div style={{padding:"22px 18px 120px"}}>
        {isEditor&&(
          <button onClick={()=>setShowEdit(true)} style={{width:"100%",padding:"13px 0",borderRadius:14,border:`1px solid ${S.h}`,background:S.hl,color:S.deep,fontFamily:G.font,fontWeight:700,fontSize:14,cursor:"pointer",marginBottom:16}}>✏️ {t.editCard}</button>
        )}
        {isEmpty&&!isEditor?(
          <div style={{textAlign:"center",padding:"60px 24px"}}>
            <div style={{fontSize:64,marginBottom:18}}>🪪</div>
            <div style={{fontFamily:G.serif,fontWeight:600,fontSize:22,color:G.ink,letterSpacing:-.3,marginBottom:8}}>Kortet är inte ifyllt än</div>
            <div style={{fontFamily:G.font,fontSize:14,color:G.ink2,lineHeight:1.5,maxWidth:300,margin:"0 auto"}}>Mitt-mig-kortet visar viktig information som kan vara värdefull i situationer där du behöver hjälp. Öppna Redaktör för att fylla i det.</div>
          </div>
        ):isEmpty&&isEditor?(
          <div style={{textAlign:"center",padding:"40px 24px",background:G.white,borderRadius:24,border:`1px dashed ${S.h}66`}}>
            <div style={{fontSize:48,marginBottom:14}}>🪪</div>
            <div style={{fontFamily:G.serif,fontWeight:600,fontSize:18,color:G.ink,marginBottom:6}}>Skapa mitt-mig-kortet</div>
            <div style={{fontFamily:G.font,fontSize:13,color:G.ink2,lineHeight:1.5,marginBottom:18,maxWidth:300,margin:"0 auto 18px"}}>Sammanfattar viktig information — namn, kontaktpersoner, och vad som hjälper i pressade situationer. Visas vid behov.</div>
            <button onClick={()=>setShowEdit(true)} style={{padding:"13px 28px",borderRadius:14,border:"none",background:S.h,color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:14,cursor:"pointer",boxShadow:sh.c(S.h)}}>+ {t.editCard}</button>
          </div>
        ):(<>
          <div style={{fontFamily:G.font,fontWeight:500,fontSize:11,color:G.ink3,letterSpacing:1,textTransform:"uppercase",textAlign:"center",marginBottom:10}}>{t.idHint}</div>
          <Card/>
          {!isEditor&&(
            <button onClick={()=>setShowMode(true)} style={{width:"100%",padding:"15px 0",borderRadius:16,border:"none",background:`linear-gradient(135deg,${S.h},${S.h}DC)`,color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:15,cursor:"pointer",boxShadow:sh.c(S.h),marginTop:18,letterSpacing:.3}}>⤢ Visa stort</button>
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
        <div style={{fontFamily:G.serif,fontWeight:600,fontSize:21,color:G.ink,marginBottom:22,letterSpacing:-.2}}>{t.editCard}</div>
        <div style={{display:"flex",gap:14,marginBottom:18,alignItems:"center"}}>
          <div style={{width:78,height:78,borderRadius:22,background:c.photo?"transparent":S.hll,border:`1px solid ${G.border}`,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,flexShrink:0}}>
            {c.photo?<img src={c.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"🙂"}
          </div>
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:7}}>
            <input ref={fileRef} type="file" accept="image/*" onChange={onPhoto} style={{display:"none"}}/>
            <button onClick={()=>fileRef.current?.click()} style={{padding:"10px 14px",borderRadius:11,border:`1px solid ${S.h}`,background:S.hl,color:S.deep,fontFamily:G.font,fontWeight:600,fontSize:13,cursor:"pointer"}}>📷 {t.uploadPhoto}</button>
            {c.photo&&<button onClick={()=>setC(x=>({...x,photo:null}))} style={{padding:"8px 12px",borderRadius:11,border:`1px solid ${G.border}`,background:G.white,color:G.ink2,fontFamily:G.font,fontWeight:600,fontSize:12,cursor:"pointer"}}>↺ Ta bort</button>}
          </div>
        </div>
        <SLabel>{t.myName}</SLabel>
        <input value={c.name} onChange={e=>setC(x=>({...x,name:e.target.value}))} style={INP} placeholder="t.ex. Elin Andersson"/>
        <SLabel>{t.myAge}</SLabel>
        <input value={c.age} onChange={e=>setC(x=>({...x,age:e.target.value}))} style={INP} placeholder="t.ex. 9" inputMode="numeric"/>
        <SLabel>{t.aboutMe}</SLabel>
        <textarea value={c.condition} onChange={e=>setC(x=>({...x,condition:e.target.value}))} style={{...INP,minHeight:64,resize:"vertical"}} placeholder="t.ex. Jag har autism och kan behöva extra tid"/>
        <SLabel>⚠️ {t.myTriggers}</SLabel>
        <textarea value={c.triggers} onChange={e=>setC(x=>({...x,triggers:e.target.value}))} style={{...INP,minHeight:64,resize:"vertical"}} placeholder="t.ex. Höga ljud, mycket folk"/>
        <SLabel>💚 {t.whatHelps}</SLabel>
        <textarea value={c.helpful} onChange={e=>setC(x=>({...x,helpful:e.target.value}))} style={{...INP,minHeight:64,resize:"vertical"}} placeholder="t.ex. Lugn röst, tid att tänka"/>
        <SLabel>📞 {t.emergencyContacts}</SLabel>
        {c.contacts.map(k=>(
          <div key={k.id} style={{background:S.hll,borderRadius:14,padding:13,marginBottom:10,border:`1px solid ${S.hl}`}}>
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              <input value={k.name} onChange={e=>updC(k.id,"name",e.target.value)} style={{...INP,marginBottom:0,flex:1}} placeholder={t.contactName}/>
              <button onClick={()=>rmC(k.id)} style={{padding:"0 13px",borderRadius:12,border:"none",background:"#FEF2F2",color:"#EF4444",cursor:"pointer",fontSize:15}}>✕</button>
            </div>
            <input value={k.phone} onChange={e=>updC(k.id,"phone",e.target.value)} style={{...INP,marginBottom:8}} placeholder={t.contactPhone} inputMode="tel"/>
            <input value={k.relation} onChange={e=>updC(k.id,"relation",e.target.value)} style={{...INP,marginBottom:0}} placeholder={t.contactRelation+" (t.ex. Mamma)"}/>
          </div>
        ))}
        <button onClick={addContact} style={{width:"100%",padding:"12px 0",borderRadius:13,border:`1.5px dashed ${S.h}66`,background:G.white,color:S.deep,fontFamily:G.font,fontWeight:700,fontSize:14,cursor:"pointer",marginBottom:22}}>{t.addContact}</button>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onClose} style={{flex:1,...GHOST}}>{t.cancel}</button>
          <button onClick={doSave} style={{flex:2,padding:"15px 0",borderRadius:14,border:"none",background:S.h,color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:15,cursor:"pointer",boxShadow:sh.c(S.h)}}>{t.save}</button>
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
        <button onClick={onClose} style={{width:38,height:38,borderRadius:19,border:`1px solid ${G.border}`,background:G.white,color:G.ink2,fontSize:18,cursor:"pointer",boxShadow:sh.xs}}>✕</button>
      </div>

      {stage==="login"&&(
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:32,animation:"svFade .35s ease"}}>
          <div style={{maxWidth:380,width:"100%",background:G.white,borderRadius:24,padding:"32px 28px",boxShadow:"0 18px 50px rgba(31,27,46,0.10)",border:`1px solid ${G.border}`}}>
            <div style={{fontFamily:G.serif,fontWeight:600,fontSize:22,color:G.ink,marginBottom:6,letterSpacing:-.3}}>{lang==="sv"?"Logga in":"Sign in"}</div>
            <div style={{fontFamily:G.font,fontSize:13,color:G.ink2,marginBottom:24,lineHeight:1.5}}>{lang==="sv"?"Hantera dina klienters scheman, berättelser och verktyg. Ändringar synkas direkt till deras enheter.":"Manage your clients' schedules, stories and tools. Changes sync directly to their devices."}</div>

            <SLabel>{lang==="sv"?"E-post":"Email"}</SLabel>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="namn@habilitering.se" style={INP}/>
            <SLabel>{lang==="sv"?"Lösenord":"Password"}</SLabel>
            <input type="password" value={pwd} onChange={e=>setPwd(e.target.value)} placeholder="••••••••" style={INP}/>

            <button onClick={doLogin} style={{width:"100%",padding:"14px 0",borderRadius:14,border:"none",background:`linear-gradient(135deg,${S.h},${S.deep})`,color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:15,cursor:"pointer",boxShadow:sh.c(S.h),marginTop:8,marginBottom:14}}>{lang==="sv"?"Logga in":"Sign in"}</button>

            <button onClick={()=>setShowHint(s=>!s)} style={{width:"100%",padding:"10px 0",borderRadius:11,border:`1px dashed ${G.border2}`,background:"transparent",color:G.ink3,fontFamily:G.font,fontWeight:600,fontSize:12,cursor:"pointer"}}>{showHint?"↑ Dölj":lang==="sv"?"💡 Hur funkar demon?":"💡 How does the demo work?"}</button>
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
              <div key={c.id} onClick={()=>onOpenClient(c)} style={{background:G.white,borderRadius:20,padding:"20px 18px",boxShadow:`0 10px 28px ${c.color}1A`,border:`1px solid ${c.color}25`,cursor:"pointer",transition:"transform .15s ease,box-shadow .2s ease",animation:`svIn .35s ease ${i*0.06}s both`}}
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
            <span style={{fontSize:14,flexShrink:0}}>💡</span>
            <span>{lang==="sv"?"Detta är en demo. I skarpt läge synkas alla ändringar direkt till klientens enhet. Klicka på en klient för att öppna deras app — du redigerar samma data som klienten ser.":"This is a demo. In production, all changes sync directly to the client's device. Click a client to open their app — you'll edit the same data the client sees."}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════ */
export default function App(){
  const[lang,setLang]=usePersistentState("lang","sv");
  const t=TR[lang];
  const[acts,setActs]=usePersistentState("acts",()=>ACTS0.map(a=>({...a,steps:[...a.steps],stepsDone:{}})));
  const[stories,setStories]=usePersistentState("stories",()=>STORIES0.map(s=>({...s,pages:s.pages.map(p=>({...p}))})));
  const[screen,setScreen]=useState("home");
  const[isEd,setIsEd]=useState(false);
  const[view,setView]=useState("list");
  const[detail,setDetail]=useState(null);
  const[editAct,setEditAct]=useState(null);
  const[showEd,setShowEd]=useState(false);
  const[showSet,setShowSet]=useState(false);
  const[cfg,setCfg]=usePersistentState("cfg",CFG0);
  const[shareCode]=useState(genCode);
  const[hasOnboarded,setHasOnboarded]=usePersistentState("hasOnboarded",false);
  const[showOnboarding,setShowOnboarding]=useState(false);
  const[showSupervisor,setShowSupervisor]=useState(false);
  const[supervisorClient,setSupervisorClient]=useState(null);
  useEffect(()=>{
    // Show onboarding once on first visit, after mount so layout settles
    if(!hasOnboarded){
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
  const finishOnboarding=()=>{setShowOnboarding(false);setHasOnboarded(true);};
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
  const[now,setNow]=useState(()=>new Date());
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
    if(a.done) return false;
    // If activity has an endTime, keep it visible until that time passes.
    // Otherwise disappear when the start time passes.
    const cutoff=a.endTime?hm(a.endTime):hm(a.time);
    return cutoff>nowMin;
  });
  const dateStr=now.toLocaleDateString(lang==="sv"?"sv-SE":"en-GB",{weekday:"long",day:"numeric",month:"long"});
  const effView=cfg.schedView==="card"?"card":cfg.schedView==="list"?"list":view;
  const handleSave=item=>setActs(a=>a.find(x=>x.id===item.id)?a.map(x=>x.id===item.id?item:x):[...a,item]);
  const handleDel=id=>setActs(a=>a.filter(x=>x.id!==id));
  const handleCheck=(aid,sd)=>setActs(a=>a.map(x=>x.id===aid?{...x,stepsDone:sd}:x));
  const[undoToast,setUndoToast]=useState(null);
  const undoTimerRef=useRef(null);
  const handleDone=id=>{
    setActs(a=>a.map(x=>x.id===id?{...x,done:true}:x));
    const act=acts.find(x=>x.id===id);
    if(act){
      setUndoToast({id,name:act.name,color:act.color});
      if(undoTimerRef.current)clearTimeout(undoTimerRef.current);
      undoTimerRef.current=setTimeout(()=>setUndoToast(null),5000);
    }
  };
  const handleUndo=()=>{
    if(!undoToast) return;
    setActs(a=>a.map(x=>x.id===undoToast.id?{...x,done:false}:x));
    setUndoToast(null);
    if(undoTimerRef.current)clearTimeout(undoTimerRef.current);
  };
  const navItems=[
    {key:"home",icon:"🏠",label:t.home,always:true,S:SCREENS.home},
    {key:"timer",icon:"⏱",label:t.toolsTimer,always:false,S:SCREENS.timer},
    {key:"stories",icon:"📖",label:t.stories,always:false,S:SCREENS.stories},
    {key:"emotion",icon:"😊",label:t.toolsEmotion,always:false,S:SCREENS.emotion},
    {key:"calm",icon:"🌿",label:t.calm,always:false,S:SCREENS.calm},
    {key:"comm",icon:"💬",label:t.comm,always:false,S:SCREENS.comm},
    {key:"idcard",icon:"🪪",label:t.idcard,always:false,S:SCREENS.idcard},
  ].filter(n=>n.always||cfg.tools[n.key]||isEd);
  const curS=SCREENS[screen]||SCREENS.home;
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
    <div style={{height:"100vh",background:curS.hb,fontFamily:G.font,display:"flex",flexDirection:"column",maxWidth:480,margin:"0 auto",overflow:"hidden",position:"relative",transition:"background .4s",color:G.ink}}>
      {/* Ambient time-of-day overlay — extremely subtle, sits above background */}
      <div style={{position:"absolute",inset:0,background:`linear-gradient(180deg, ${ambientTint} 0%, transparent 60%)`,pointerEvents:"none",zIndex:0,transition:"background 2s ease"}}/>
      {/* HEADER */}
      <div style={{background:`linear-gradient(170deg,${curS.hl} 0%,${G.white} 100%)`,padding:"14px 22px 12px",borderBottom:`1px solid ${G.border}`,flexShrink:0,position:"relative",overflow:"hidden",transition:"background .4s"}}>
        <div style={{position:"absolute",top:-50,right:-30,width:140,height:140,borderRadius:"50%",background:`radial-gradient(circle,${curS.soft}44,transparent 70%)`,pointerEvents:"none"}}/>
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
                <stop offset="55%" stopColor={curS.h}/>
                <stop offset="100%" stopColor={curS.deep}/>
              </radialGradient>
              <radialGradient id="lumaOuterGlow" cx="50%" cy="50%" r="50%">
                <stop offset="40%" stopColor={curS.h} stopOpacity="0"/>
                <stop offset="70%" stopColor={curS.h} stopOpacity="0.18"/>
                <stop offset="100%" stopColor={curS.h} stopOpacity="0"/>
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
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={curS.h} strokeWidth={isLong?1.6:1.1} strokeLinecap="round" style={{animation:`${i%2===0?"rayFade1":"rayFade2"} ${3+i*0.18}s ease-in-out infinite`}}/>;
              })}
            </g>
            {/* Core orb */}
            <g style={{transformOrigin:"13px 13px",animation:"lumaCoreBreath 3.4s ease-in-out infinite"}}>
              <circle cx="13" cy="13" r="6.5" fill="url(#lumaCore)"/>
              <circle cx="11" cy="11" r="1.5" fill="#FFFFFF" opacity="0.7"/>
            </g>
          </svg>
          <span style={{fontFamily:G.serif,fontWeight:600,fontSize:16,color:curS.deep,letterSpacing:0.8,lineHeight:1}}>Luma</span>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,position:"relative",gap:12}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:G.font,fontWeight:500,fontSize:10,color:G.ink2,textTransform:"capitalize",letterSpacing:.4,marginBottom:1}}>{dateStr}</div>
            <div style={{fontFamily:G.serif,fontWeight:600,fontSize:20,color:G.ink,lineHeight:1.15,letterSpacing:-.3}}>{screen==="home"?t.myDay:navItems.find(n=>n.key===screen)?.label||""}</div>
          </div>
          <button onClick={()=>setLang(l=>l==="sv"?"en":"sv")} style={{background:G.white,border:`1px solid ${G.border}`,borderRadius:10,padding:"6px 11px",color:curS.deep,fontFamily:G.font,fontWeight:700,cursor:"pointer",fontSize:11,boxShadow:sh.xs,flexShrink:0}}>{lang.toUpperCase()}</button>
          {isEd&&<button onClick={()=>setShowSet(true)} style={{background:G.white,border:`1px solid ${G.border}`,borderRadius:10,padding:"6px 10px",color:curS.deep,cursor:"pointer",fontSize:13,boxShadow:sh.xs,flexShrink:0}}>⚙️</button>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{display:"flex",gap:4,flex:1,background:G.white,borderRadius:12,padding:3,border:`1px solid ${G.border}`,boxShadow:sh.xs}}>
            {screen==="home"&&!isEd&&cfg.schedView!=="card"&&<TabB active={effView==="list"} onClick={()=>setView("list")} color={curS.h} deep={curS.deep}>☰ {t.list}</TabB>}
            {screen==="home"&&!isEd&&cfg.schedView!=="list"&&<TabB active={effView==="card"} onClick={()=>setView("card")} color={curS.h} deep={curS.deep}>⊞ {t.card}</TabB>}
            {screen==="home"&&<TabB active={isEd} gold={isEd} onClick={()=>setIsEd(e=>!e)} color={curS.h} deep={curS.deep} flex={isEd?2:1}>{isEd?`✓ ${t.editorClose}`:`✏️ ${t.editorOpen}`}</TabB>}
            {screen!=="home"&&!isEd&&<div style={{flex:1,padding:"6px 12px",fontFamily:G.font,fontWeight:600,fontSize:11,color:curS.deep,display:"flex",alignItems:"center",gap:7}}><span style={{width:7,height:7,borderRadius:"50%",background:curS.h,boxShadow:`0 0 6px ${curS.h}88`}}/>{navItems.find(n=>n.key===screen)?.label}</div>}
            {screen!=="home"&&isEd&&<TabB active={true} gold={true} onClick={()=>setIsEd(false)} color={curS.h} deep={curS.deep} flex={1}>{`✓ ${t.editorClose}`}</TabB>}
          </div>
        </div>
      </div>
      {/* BODY */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {screen==="home"&&(
          <div style={{flex:1,display:"flex",overflow:"hidden"}}>
            {sorted.length===0?(
              <div style={{flex:1,textAlign:"center",marginTop:80}}>
                <div style={{fontSize:52}}>📋</div>
                <div style={{fontFamily:G.font,fontWeight:600,fontSize:16,marginTop:14,color:G.ink2}}>{t.noActs}</div>
              </div>
            ):!isEd&&active.length===0?(
              <div style={{flex:1,textAlign:"center",marginTop:60}}>
                <div style={{fontSize:72}}>🌟</div>
                <div style={{fontFamily:G.serif,fontWeight:600,fontSize:24,color:G.ink,marginTop:12}}>Bra jobbat!</div>
                <div style={{fontFamily:G.font,fontSize:15,color:G.ink2,marginTop:6}}>Alla aktiviteter är klara!</div>
              </div>
            ):effView==="card"&&!isEd?(
              <div style={{flex:1,overflowY:"auto",padding:"14px 14px 0 10px"}}>
                <CardView acts={active} onTap={setDetail} t={t} isEditor={isEd} onEdit={item=>{setEditAct(item);setShowEd(true);}} onMarkDone={handleDone}/>
              </div>
            ):(
              // Timeline view: Sigvard lamps + activities positioned at their times.
              // Whole timeline scrolls together so lamps stay aligned with activities.
              <TimelineView
                acts={isEd?sorted:active}
                isEd={isEd}
                cfg={cfg}
                t={t}
                onTap={setDetail}
                onEdit={item=>{setEditAct(item);setShowEd(true);}}
                onMarkDone={handleDone}
                now={now}
              />
            )}
          </div>
        )}
        {screen==="timer"&&<TimerScreen t={t} cfg={cfg}/>}
        {screen==="stories"&&<StoryScreen lang={lang} t={t} isEditor={isEd} stories={stories} setStories={setStories}/>}
        {screen==="emotion"&&<EmotionScreen lang={lang} t={t} cfg={cfg}/>}
        {screen==="calm"&&<CalmScreen t={t} cfg={cfg}/>}
        {screen==="idcard"&&<IdCardScreen t={t} lang={lang} cfg={cfg} setCfg={setCfg} isEditor={isEd}/>}
        {screen==="comm"&&<CommBoard lang={lang} t={t} isEditor={isEd}/>}
      </div>
      {/* ADD BUTTON */}
      {screen==="home"&&isEd&&(
        <div style={{position:"absolute",bottom:84,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 28px)",maxWidth:452,zIndex:10}}>
          <button onClick={()=>{setEditAct(null);setShowEd(true);}} style={{width:"100%",padding:"15px 0",borderRadius:18,border:`1.5px dashed ${curS.h}80`,background:G.white,color:curS.deep,fontFamily:G.font,fontWeight:700,fontSize:15,cursor:"pointer",boxShadow:`0 6px 20px ${curS.h}1F`}}>{t.addAct}</button>
        </div>
      )}
      {/* UNDO TOAST */}
      {undoToast&&(
        <div style={{position:"absolute",bottom:96,left:"50%",transform:"translateX(-50%)",zIndex:50,animation:"ftIn .25s ease",width:"calc(100% - 32px)",maxWidth:380}}>
          <div style={{display:"flex",alignItems:"center",gap:12,background:G.ink,borderRadius:18,padding:"12px 12px 12px 18px",boxShadow:"0 14px 40px rgba(0,0,0,0.30)"}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:`${undoToast.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:"#fff",flexShrink:0,boxShadow:`0 4px 12px ${undoToast.color}88`}}>✓</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:G.font,fontWeight:600,fontSize:14,color:"#fff",lineHeight:1.2}}>Klart!</div>
              <div style={{fontFamily:G.font,fontSize:12,color:"rgba(255,255,255,0.7)",marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{undoToast.name}</div>
            </div>
            <button onClick={handleUndo} style={{padding:"10px 16px",borderRadius:13,border:"none",background:"#fff",color:G.ink,fontFamily:G.font,fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
              <span style={{fontSize:14}}>↺</span>Ångra
            </button>
          </div>
        </div>
      )}
      {/* BOTTOM NAV */}
      <div style={{background:G.white,borderTop:`1px solid ${G.border}`,display:"flex",padding:"10px 0 26px",boxShadow:"0 -6px 24px rgba(31,27,46,0.06)",flexShrink:0,zIndex:20,overflowX:"auto"}}>
        <style>{`@keyframes navUnder{from{transform:scaleX(0);opacity:0}to{transform:scaleX(1);opacity:1}}@keyframes navIcon{from{transform:scale(.92) translateY(2px)}to{transform:scale(1) translateY(0)}}`}</style>
        {navItems.map(({key,icon,label,S})=>{const on=screen===key;return(
          <button key={key} onClick={()=>{setScreen(key);}} style={{flex:navItems.length<=5?1:"0 0 auto",minWidth:navItems.length<=5?0:72,border:"none",background:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"6px 6px",position:"relative",transition:"transform .15s"}} onMouseDown={e=>e.currentTarget.style.transform="scale(0.92)"} onMouseUp={e=>e.currentTarget.style.transform=""} onMouseLeave={e=>e.currentTarget.style.transform=""}>
            {/* Glow halo behind icon when active */}
            {on&&<div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:42,height:42,borderRadius:21,background:`radial-gradient(circle, ${S.h}28 0%, ${S.h}00 70%)`,pointerEvents:"none"}}/>}
            <span style={{fontSize:on?24:21,opacity:on?1:0.5,transition:"opacity .25s, font-size .25s, filter .25s",filter:on?`drop-shadow(0 2px 4px ${S.h}66)`:"none",animation:on?"navIcon .25s ease":"none",position:"relative"}}>{icon}</span>
            <span style={{fontFamily:G.font,fontWeight:on?700:600,fontSize:11,color:on?S.deep:G.ink3,transition:"color .25s, font-weight .25s",whiteSpace:"nowrap",position:"relative"}}>{label}</span>
            {on&&<div style={{width:24,height:3,borderRadius:2,background:`linear-gradient(90deg,${S.h},${S.deep})`,marginTop:2,boxShadow:`0 2px 8px ${S.h}80`,animation:"navUnder .3s cubic-bezier(.2,.7,.2,1) both",transformOrigin:"center"}}/>}
          </button>
        );})}
      </div>
      {/* MODALS */}
      {detail&&<ActivityDetail item={detail} onClose={()=>setDetail(null)} onCheck={handleCheck} t={t}/>}
      {showEd&&<EditModal item={editAct} onSave={handleSave} onDel={handleDel} onClose={()=>setShowEd(false)} t={t} existingActs={acts}/>}
      {showSet&&<SettingsModal cfg={cfg} setCfg={setCfg} shareCode={shareCode} onClose={()=>setShowSet(false)} t={t} lang={lang} onOpenSupervisor={openSupervisor}/>}
      {showOnboarding&&(
        <div style={{position:"fixed",inset:0,zIndex:9500,background:"rgba(31,27,46,0.5)",backdropFilter:"blur(10px)",display:"flex",alignItems:"center",justifyContent:"center",padding:24,animation:"ftIn .3s ease"}} onClick={finishOnboarding}>
          <div onClick={e=>e.stopPropagation()} style={{maxWidth:380,width:"100%",background:G.white,borderRadius:28,padding:"32px 26px 26px",boxShadow:"0 24px 60px rgba(0,0,0,0.25)",border:`1px solid ${G.border}`,position:"relative"}}>
            {/* Luma mark — animated sun */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:13,marginBottom:18}}>
              <svg width={48} height={48} viewBox="0 0 26 26" style={{overflow:"visible"}}>
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
              <span style={{fontFamily:G.serif,fontWeight:600,fontSize:30,color:G.ink,letterSpacing:0.6}}>Luma</span>
            </div>
            <div style={{fontFamily:G.serif,fontWeight:600,fontSize:20,color:G.ink,textAlign:"center",letterSpacing:-.3,marginBottom:8,lineHeight:1.25}}>{lang==="sv"?"Välkommen":"Welcome"}</div>
            <div style={{fontFamily:G.font,fontSize:14,color:G.ink2,textAlign:"center",lineHeight:1.5,marginBottom:22}}>
              {lang==="sv"
                ?"Luma är en lugn, anpassbar dagsapp. Stödpersonen anpassar — användaren följer."
                :"Luma is a calm, customizable daily app. The supporter sets it up — the user follows."}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:11,marginBottom:24}}>
              {[
                {icon:"✏️",sv:"Tryck Redaktör för att skapa schema, berättelser och kort",en:"Tap Editor to create schedule, stories and cards"},
                {icon:"🏠",sv:"Stäng redaktören — så ser användaren bara sitt schema",en:"Close the editor — the user only sees their schedule"},
                {icon:"⚙️",sv:"Inställningar finns under kugghjulet i redaktörsläget",en:"Settings live behind the gear in editor mode"},
              ].map((item,i)=>(
                <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"10px 12px",background:SCREENS.home.hb,borderRadius:13}}>
                  <div style={{width:32,height:32,borderRadius:10,background:G.white,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0,boxShadow:sh.xs}}>{item.icon}</div>
                  <div style={{flex:1,fontFamily:G.font,fontSize:13,color:G.ink,lineHeight:1.4,paddingTop:7}}>{lang==="sv"?item.sv:item.en}</div>
                </div>
              ))}
            </div>
            <button onClick={finishOnboarding} style={{width:"100%",padding:"14px 0",borderRadius:14,border:"none",background:`linear-gradient(135deg,${SCREENS.home.h},${SCREENS.home.deep})`,color:"#fff",fontFamily:G.font,fontWeight:700,fontSize:15,cursor:"pointer",boxShadow:sh.c(SCREENS.home.h),letterSpacing:0.2}}>
              {lang==="sv"?"Kom igång":"Get started"}
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
  );
}
