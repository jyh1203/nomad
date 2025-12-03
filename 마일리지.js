const scriptName = "마일리지이벤트";
const Lw = '\u200b'.repeat(500); //전체보기화 문자
const fs = FileStream;
const sadmin = '간지용';
const admin = ['간지용', '용현', '방장봇','오픈채팅봇'];
const pathdb = 'https://raw.githubusercontent.com/jyh1203/nomad/main/data2.json';
let arrivaldata = JSON.parse(org.jsoup.Jsoup.connect(pathdb).ignoreContentType(true).get().text());


//보드게임 관련
const bgdb = 'https://raw.githubusercontent.com/jyh1203/nomad/main/bgrank.json';
let bgdata = JSON.parse(org.jsoup.Jsoup.connect(bgdb).ignoreContentType(true).get().text());

/* ============================================================
 *   📌 마일리지 시스템 통합 데이터 관리 모듈 (최종 완전체)
 * ============================================================ */

let DB = {
    userinfo:    'sdcard/bot/mileage/userinfo.txt',
    useritem:    'sdcard/bot/mileage/useritem.txt',
    actoritem:   'sdcard/bot/mileage/actoritem.txt',
    horserace:   'sdcard/bot/mileage/horserace.txt',
    mileage:     'sdcard/bot/mileage/mileage.txt',
    attendance:  'sdcard/bot/mileage/attendance.txt',
    attendlog:   'sdcard/bot/mileage/attendslog.txt',
    attendbonus: 'sdcard/bot/mileage/attendbonus.txt',
    saying:      'sdcard/bot/mileage/saying.txt',
    bgdata:      'sdcard/bot/mileage/bgdata.txt',
    funding:     'sdcard/bot/mileage/funding.txt',
};


/* ------------------------------------------------------------
 *  📦 공통 로더
 * ------------------------------------------------------------ */
function loadDB(path, def) {
    let txt = fs.read(path);
    if (!txt) {
        fs.write(path, JSON.stringify(def));
        return def;
    }

    try {
        return JSON.parse(txt);
    } catch (e) {
        fs.write(path + ".corrupt", txt);   // 손상 파일 백업
        fs.write(path, JSON.stringify(def));
        return def;
    }
}


/* ------------------------------------------------------------
 *  🔄 1개 백업만 유지하는 백업 시스템
 * ------------------------------------------------------------ */
function backupFile(path) {
    let content = fs.read(path);
    if (!content) return;

    let backupPath = path + ".bak";
    fs.write(backupPath, content);   // 기존 파일→bak 1개만 유지
}


/* ------------------------------------------------------------
 *  🧠 Data 모듈 (캐시 + get + update + 자동백업 save)
 * ------------------------------------------------------------ */
let Data = {
    cache: {},

    get: function (key, def) {
        if (!DB[key]) return null;

        if (!this.cache[key]) {
            this.cache[key] = loadDB(DB[key], def);
        }
        return this.cache[key];
    },

    save: function (key) {
        if (!DB[key]) return;

        let path = DB[key];

        // 1) 저장 전 백업
        backupFile(path);

        // 2) 실제 저장
        fs.write(path, JSON.stringify(this.cache[key], null, 4));
    },

    update: function (key, def, callback) {
        let obj = this.get(key, def);
        callback(obj);   // 데이터 수정
        this.save(key);  // 자동 저장
    }
};

/* ============================================================
 *   📌 명령어 라우터
 * ============================================================ */

let CMD = {};

function addCommand(cmd, func) {
    CMD[cmd] = func;
}

function runCommand(room, msg, sender, replier) {
    if (msg[0] !== "!") return;

    let command = msg.split(" ")[0];
    if (CMD[command]) {
        CMD[command](room, msg, sender, replier);
    }
}



const region_cost = {
  "아시아": 2500,
  "오세아니아": 5000,
  "중동": 6250,
  "유럽": 6875,
  "아프리카": 7500,
  "미주": 10000,
  "중남미": 12500
}


const item_cost = {
   "눈치": 20000,
   "랭커": 15000,
   "초성": 10000
};

const record_reward = {
   "평범": 2000,
   "히트": 5000,
   "메가히트": 10000,
   "레전드": 15000,
   "초대박": 30000
};

// 경마 관련
const animals = [
   ["(하트뿅)", "(하하)", "(우와)", "(심각)", "(힘듦)"],
   ["(찡긋)", "(아잉)", "(뿌듯)", "(깜짝)", "(빠직)"],
   ["(신나)", "(씨익)", "(제발)", "(헉)", "(열받아)"],
   ["(뽀뽀)", "(감동)", "(멘붕)", "(정색)", "(쑥스)"],
   ["(좋아)", "(꺄아)", "(훌쩍)", "(허걱)", "(부르르)"],
   ["(컴온)", "(발그레)", "(수줍)", "(졸려)", "(푸하하)"]
 ];
 
 const hnames = [
   "댜즈", "랑군", "뚜띤", "테오", "킁카", "아룡", "깜장", "감마", "린드", "송형",
   "치즈", "나무", "므쨍", "유켱", "세정", "랭커", "시랴", "은셔", "로시", "모누",
   "파도", "픽사", "선꾸", "이스", "포이", "유주", "요미", "구스", "레쟈", "보노"
 ];
 
 const features = [
   "강한 근육을 갖추고 있어 힘이 넘치는 주행이 가능합니다.",
   "강한 발걸음으로 지면을 단단히 지지하여 안정적인 주행을 보장합니다.",
   "강한 체력으로 오랜 시간 동안 주행이 가능해 지구력이 뛰어납니다.",
   "검고 단단한 발톱으로 모든 코스에서 신뢰감을 주고 뛰어난 안정성을 자랑합니다.",
   "검은 눈동자가 강렬한 인상을 주며 시선을 사로잡아 강한 존재감을 발휘합니다.",
   "긴 다리와 날렵한 체형을 가져 경주에서 뛰어난 속도를 자랑합니다.",
   "검은 털과 튼튼한 체형 덕분에 험한 지형에서도 안정적인 주행이 가능합니다.",
   "갈기가 길고 풍성하여 바람에 휘날리는 모습이 매우 아름답습니다.",
   "밝은 황갈색의 털을 가지고 있어 햇빛 아래에서 더욱 눈부십니다.",
   "큰 눈과 똑똑한 표정으로 인상 깊어 경주 중에도 집중력이 뛰어납니다.",
   "작은 체구에도 불구하고 놀라운 스피드를 발휘하며 강력한 경쟁력을 보입니다.",
   "검은색의 매끄러운 털이 고급스러움을 더하며 외모가 매우 뛰어납니다.",
   "단단한 발굽 덕분에 험한 지형에서도 안정감을 주며 뛰어난 체력을 자랑합니다.",
   "머리에 흰 반점이 있어 독특한 외모로 시선을 사로잡습니다.",
   "무게감 있는 체형 덕분에 긴 거리에서도 힘을 잃지 않고 지구력이 뛰어납니다.",
   "눈에 띄는 흰색의 다리 덕분에 쉽게 눈에 띄며 대중의 관심을 받습니다.",
   "침착한 성격으로 경주 중에도 안정감을 유지하며 경기를 잘 조절합니다.",
   "짧은 털 덕분에 더운 날씨에서도 시원하게 느껴지며 기후에 잘 적응합니다.",
   "빠른 반사신경을 가진 덕분에 순간적인 움직임이 매우 뛰어납니다.",
   "큰 귀와 날카로운 시선으로 경주에 집중하며 뛰어난 집중력을 보입니다.",
   "주름진 목덜미가 강인함을 더하며 힘이 넘치는 주행을 자랑합니다.",
   "바람에 맞서는 강한 호흡과 안정적인 호흡 패턴을 보이며 장거리 주행에 강합니다.",
   "높은 지능을 가지고 있어 훈련에 잘 반응하며 빠르게 배웁니다.",
   "몸통이 굵고 힘이 넘쳐서 견고한 주행이 가능하며 신뢰감을 줍니다.",
   "상반신이 발달하여 빠르고 강력한 출발을 하며 경쟁에서 우위를 점합니다.",
   "얼룩덜룩한 털 패턴이 개성 있는 매력을 더하며 시각적으로도 매력적입니다.",
   "검은 눈동자가 강렬한 인상을 주며 시선을 사로잡고 강한 존재감을 발휘합니다.",
   "균형 잡힌 체형으로 어떤 코스에서도 잘 적응하며 다재다능합니다.",
   "부드러운 발굽의 터치가 마찰을 줄여주며 안정적인 주행을 자랑합니다.",
   "짧은 코와 넓은 이마가 강한 인상을 주며 시각적으로도 뛰어난 매력을 갖추고 있습니다.",
   "고요한 성격으로 경주 중에도 침착함을 유지하며 정신적으로 안정적입니다.",
   "털색이 다양한 음영으로 변화하며 매력적이고 시각적으로도 흥미롭습니다.",
   "긴 꼬리로 균형을 잡으며 안정적인 주행을 하며 신뢰감과 안정감을 제공합니다.",
   "여유로운 발걸음으로 여유를 느끼게 하며 주행 중에도 안정감을 줍니다.",
   "뚜렷한 근육의 선이 선명하여 힘이 느껴지며 강한 체력을 자랑합니다.",
   "작은 코와 큰 입으로 독특한 매력을 가지며 주목받기 쉽습니다.",
   "빠른 반응 속도로 상대를 압도하며 뛰어난 경쟁력을 보입니다.",
   "튼튼한 발목이 험한 지형에서도 무난하게 주행할 수 있게 하며 다재다능합니다.",
   "대담한 눈빛으로 강한 의지를 보여주며 경기에 강한 집념을 보입니다.",
   "목이 길어 시야가 넓어 주변 상황을 잘 파악하며 주행 중에도 유리합니다.",
   "부드러운 털이 만지면 편안한 느낌을 주며 신체적 만족감을 제공합니다.",
   "몸의 길이가 길어 속도가 더해지며 장거리 경주에서 뛰어난 성능을 발휘합니다.",
   "넓은 가슴이 안정적인 호흡을 지원하며 장거리 주행에 유리합니다.",
   "귀가 작고 뾰족하여 경기에 집중하는 느낌을 주며 집중력이 뛰어납니다.",
   "특유의 박진감 넘치는 표정이 눈길을 끌며 강한 존재감을 발휘합니다.",
   "빠르게 움직일 때 근육이 유연하게 움직여 매끄럽고 뛰어난 운동 능력을 보입니다.",
   "눈 주위에 흰 반점이 있어 인상적인 외모를 가지며 독특한 매력을 가지고 있습니다.",
   "강한 발걸음으로 지면을 단단히 지지하며 안정적인 주행을 보장합니다.",
   "광대뼈가 도드라져 있어 강한 인상을 주며 시각적으로도 강렬합니다.",
   "털의 색이 변덕스러워 다양한 조명을 반사하며 시각적으로도 흥미롭습니다.",
   "빠른 속도로 주행할 때 안정된 자세를 유지하며 경주 중에도 균형을 잡습니다.",
   "유연한 몸놀림으로 곡선 코스에서 강점을 발휘하며 다양한 코스에 적합합니다.",
   "강한 체력으로 오랜 시간 동안 주행이 가능하며 지구력이 뛰어납니다.",
   "날카로운 눈빛이 경기를 향한 집중력을 보여주며 강한 경쟁력을 발휘합니다.",
   "검고 단단한 발톱으로 모든 코스에서 신뢰감을 주며 뛰어난 안정성을 자랑합니다."
 ];
 
 const commentary = [
   "빠르게 치고 나갑니다!",
   "속도를 내고 있습니다!",
   "뒤처지지 않으려 애쓰고 있습니다!",
   "선두를 유지하고 있습니다!",
   "다른 말을 추월하려고 합니다!",
   "지치지 않고 달리고 있습니다!",
   "힘차게 달리고 있습니다!",
   "속도를 유지하고 있습니다!",
   "다른 말을 따라잡고 있습니다!",
   "결승선을 향해 달리고 있습니다!"
 ];



 const hracefile = 'sdcard/bot/mileage/horserace.txt';
 if (!fs.read(hracefile)) fs.write(hracefile, '{}');
 let horserace = JSON.parse(fs.read(hracefile));


 const trackLength = 15;
 const numHorses = 5;
 let positions = Array(numHorses).fill(0);
 let finished = false;
 let raceStarted = false;
 let racePrepared = horserace.racePrepared || false;
 let selectedAnimals = [];
 let selectedNames = [];
 
 //경마 관련 종료


upoint = 'sdcard/bot/mileage/usepoint.txt'; //탕탕 게임 사망 순위
if(!fs.read(upoint)) fs.write(upoint, '{}');
let usepoint = JSON.parse(fs.read(upoint));


msay = 'sdcard/bot/mileage/saying.txt'; //명언
if(!fs.read(msay)) fs.write(msay, '{}');
let msays = JSON.parse(fs.read(msay));



let cinemaid = 0;
let count = 0;
let timer = 0;
const words = [];
let word = {};
let actorquiz = [];     // 배우 퀴즈 테스트
let mname = '아악 초기화 - 간죵';
let winnerlist = [];
var participants = [];
var counter = 10;
var counterd = 20;
var prevCounter = null;
var gameStarted = false;
var gameStartedd = false;
let luckyperson = 0;       // 눈치 행운의 사람
let timeover = 60;
let countStarted = 0;
//const pathdbcho = 'https://raw.githubusercontent.com/jyh1203/nomad/main/cinema.json';
//let data = JSON.parse(org.jsoup.Jsoup.connect(pathdbcho).ignoreContentType(true).get().text())
let data = JSON.parse(read('sdcard/bot/cinema.json'));



// 야바위 관련 설정
var winnercount = 1;
ydon = 'sdcard/bot/mileage/ydon.txt'; //야바위돈
if(!fs.read(ydon)) fs.write(ydon, '{}');
let yabawidon = JSON.parse(fs.read(ydon));

ymember = 'sdcard/bot/mileage/ymember.txt'; //야바위참여자순위
if(!fs.read(ymember)) fs.write(ymember, '{}');
let votelist = JSON.parse(fs.read(ymember));
if(yabawidon == undefined) yabawidon = {};
if(votelist['list'] == undefined) votelist['list'] = {};



var vips = "sdcard/bot/mileage/vip.txt";
if(!fs.read(vips)) fs.write(vips, '{}');
var userinfo = JSON.parse(fs.read(vips));

var vipi = "sdcard/bot/mileage/vipitem.txt";
if(!fs.read(vipi)) fs.write(vipi, '{}');
var useritem = JSON.parse(fs.read(vipi));

//배우 개수
var actori = "sdcard/bot/mileage/actoritem.txt";
if(!fs.read(actori)) fs.write(actori, '{}');
var actoritem = JSON.parse(fs.read(actori));

//성장형 배우
var g_actor = "sdcard/bot/mileage/actorgrowth.txt";
if(!fs.read(g_actor)) fs.write(g_actor, '{}');
var growthactor = JSON.parse(fs.read(g_actor));


//가르치기
let ph = "/sdcard/bot/mileage/teach.txt";
if(!fs.read(ph)) fs.write(ph, "{}");
let ar = JSON.parse(fs.read(ph));


// 랭커 업다운
let updownswitch = false;
let UDPoint = 0;
let UDCount = 0;
let rankerchat = 0;


// 러시안룰렛 게임
var players = [];
var Rmaxplayers = 8;
var Gstart = false;
var 탄환;
var m;
var 종료확인 = false;
var 종료확인자;
let randplayer = 0;


//돈뿌리기
let donadmin;
let doncount = false;
let dondon = 0;
let donroom = null;
let jijungdon = 0;
var sonplayers = [];



// 흑백 요리사게임
/*let bwteams = {};  // 각 방의 팀 정보를 저장
let bwscores = {}; // 각 방의 팀 점수를 저장
let bwdiceRolls = {}; // 각 플레이어가 주사위를 돌린 정보를 저장*/
let bwyorisa = 'sdcard/bot/mileage/bwchef.txt'; //요리사
if(!fs.read(bwyorisa)) fs.write(bwyorisa, '{}');
let bwchef = JSON.parse(fs.read(bwyorisa));
const whitepanel = ['최현석', '여경래', '정지선', '오세득', '김도윤', '조셉 리저우드', '파브리', '황진선', '방기수', '최강록', '박준우', '김승민', '이영숙', '조은주', '선경 롱게스트', '남정석', '안유성', '장호준', '최지형', '에드워드 리'];
const blackpanel = ['중식 여신', '히든 천재', '장사천재 조사장', '반찬 셰프', '영탉', '간귀', '원투쓰리', '트리플 스타', '이모카세 1호', '철가방 요리사', '만찢남', '고기 깡패', '셀럽의 셰프', '승우아빠', '야키토리왕', '키친 갱스터', '나폴리 맛피아', '요리하는 돌아이', '불꽃 남자', '급식 대가'];
const panelcomment1 = (["채소의 익힘 정도를 중시한다", "재료가 이븐(even)하게 구워졌다", "고기가 이븐(EVEN)하게 익지 않았어요", "간이 타이트하게 들어갔네요", "빠쓰네?","너무 짜요!", "완성도가 없는 테크닉은 테크닉은 아니다", "익힘을 저는 굉장히 중요시 여긴다", "재료가 제대로 익지 않았다", "맛의 기준점이 결코 낮지 않은 음식이다", "저에게 자유를 줬어요", "어렸을 때 그런 추억이 떠오른 것 같아요", "실패해도 괜찮아요. 다시 도전하면 되니까요", "제일 중요하게 생각하는 건 채소의 익힘 정도", "이 요리에서 셰프의 의도가 잘 드러났어요", "맛의 밸런스가 훌륭합니다","재료 본연의 맛을 잘 살렸네요", "플레이팅이 아름답습니다", "이 요리에서 셰프의 개성이 느껴져요", "조리 기술이 뛰어납니다", "요리에 대한 열정이 느껴집니다", "요리는 정직해야 합니다", "이 소스, 정확히 알겠어요", "맛으로 요리의 이름을 알아차렸습니다", "요리사가 요리한 의도가 맛으로 전해져야 돼요", "재료의 신선도가 돋보입니다", "맛의 조화가 훌륭합니다", "창의적인 접근이 돋보이는 요리네요", "전통과 현대를 잘 접목시켰습니다", "이 요리는 셰프의 정체성을 잘 보여줍니다"][generateScore(30,0)]);

const witeam = ["디아즈 ", "유주네므쨍이 ", "모누", "랭커", "구스", "캡틴메테오스", "캡틴킁카우스", "엉엉엉", "간지용", "IU", "유주네나무양", "캡틴빼미우스 ", "캡틴케로로스 ", "시리아o2", "왕자훈"];
const biteam = ['캡틴랑구누스','캡틴유주켱스','선꾸','뚜띤','gamma','뱌망베르치즈','아룡양','월드픽사','깜장','Lynd','Lo시네마','갓세정','소월','은서 Abby ','직쏘우'];


//그룹전
let smgroupfile = 'sdcard/bot/mileage/bwgroup.txt'; //그룹전
if(!fs.read(smgroupfile)) fs.write(smgroupfile, '{}');
let smgr = JSON.parse(fs.read(smgroupfile));




//영화촬영
let gaksaeklist = ['각색 없음','기대치 대박예감','시나리오 1성 증가','시나리오 2성 증가','4성 시나리오 확정','5성 시나리오 확정','출연진 1명 추가,','점수 1점 증가','점수 2점 증가','점수 3점 증가','시장 선호도 10% 증가','시장 선호도 20% 증가','시장 선호도 30% 증가'];
let ggidae = ['무관심','입소문','학수고대','기대중','대박예감','대박예감','대박예감','대박예감','대박예감','대박예감'];
let attend_sagae = ['시','네','마','를','부','탁','해',];
let attend_sinjun = ['새','해','복','많','이','받','아',];


// 그룹전
let mmaechool = ['평범','히트','메가히트','레전드','초대박']
let grouptypes = ['시','네','마']


// 슬롯머신
let slotitems = ["(축구)","(야구)","(농구)","(당구)","(골프)"];


// 📁 funding.js
let funding = {
  collect_fmember: null,
  funding_start: 0,
  selected_result: null,
  predictions: {}, // {user: {예측: 개수}}
  funded_users: [],
  confirmed_shooting: false
};

let fundingFile = 'sdcard/bot/mileage/funding.txt';
if (!fs.read(fundingFile)) fs.write(fundingFile, JSON.stringify(funding, null, 4));
funding = JSON.parse(fs.read(fundingFile));






// ✅ 출석 관련 경로 및 데이터 초기화
const path = 'sdcard/bot/mileage/attendance.txt';
const attendslog = 'sdcard/bot/mileage/attendslog.txt';
const attendb = 'sdcard/bot/mileage/attendbonus.txt';

if (!fs.read(path)) fs.write(path, JSON.stringify({ today: getToday(), list: {} }, null, 4));
let jsonattend = JSON.parse(fs.read(path));

if (!fs.read(attendslog)) fs.write(attendslog, JSON.stringify({}, null, 4));
let attendlog = JSON.parse(fs.read(attendslog));

if (!fs.read(attendb)) fs.write(attendb, JSON.stringify({}, null, 4));
let attendbonus = JSON.parse(fs.read(attendb));

if(jsonattend['today'] == undefined) jsonattend['today'] = new Date().getFullYear() + '.' + (new Date().getMonth() + 1) + '.' + new Date().getDate();
if(jsonattend['list'] == undefined) jsonattend['list'] = {};





//운세 관련


//그룹전
let idinfo = "sdcard/bot/mileage/fortune.txt";
if(!fs.read(idinfo)) fs.write(idinfo, '{}');
let userFortuneMap = JSON.parse(fs.read(idinfo));


/** ========= 유틸 ========= */
const formatDate = function (date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + d;
};

const getKoreanDateString = function (date) {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return m + "월 " + d + "일";
};

// 8자리 숫자 체크 + 간단한 날짜 유효성(윤년 포함)
const isValidYMD = function (yyyymmdd) {
  if (!yyyymmdd || yyyymmdd.length !== 8) return false;
  for (let i = 0; i < 8; i++) {
    const c = yyyymmdd.charAt(i);
    if (c < "0" || c > "9") return false;
  }
  const y = parseInt(yyyymmdd.substring(0, 4), 10);
  const m = parseInt(yyyymmdd.substring(4, 6), 10);
  const d = parseInt(yyyymmdd.substring(6, 8), 10);
  if (m < 1 || m > 12) return false;
  const mdays = [31,28,31,30,31,30,31,31,30,31,30,31];
  const isLeap = (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
  const maxd = (m === 2 && isLeap) ? 29 : mdays[m - 1];
  return d >= 1 && d <= maxd;
};

/** ========= 외부 API 호출 ========= */
const getFortune = function (name, birthDate, fortuneDate) {
  try {
    const encodedName = encodeURIComponent(name);
    const url =
      "https://lnif7s4nea.execute-api.ap-northeast-2.amazonaws.com/prod/fortune" +
      "?name=" + encodedName +
      "&birth_date=" + birthDate +
      "&fortune_date=" + fortuneDate;

    const responseText = org.jsoup.Jsoup
      .connect(url)
      .ignoreContentType(true)
      .timeout(7000) // 네트워크 타임아웃 7초
      .get()
      .text();

    return JSON.parse(responseText);
  } catch (e) {
    //logError("운세 API 호출 오류: " + e);
    return null;
  }
};

/** ========= 공통 응답 빌더 ========= */
const replyFortune = function (sender, replier, name, birthYYYYMMDD) {
  // YYYY-MM-DD 로 변환
  const year = birthYYYYMMDD.substring(0, 4);
  const month = birthYYYYMMDD.substring(4, 6);
  const day = birthYYYYMMDD.substring(6, 8);
  const formattedBirthDate = year + "-" + month + "-" + day;

  const today = new Date();
  const todayStr = formatDate(today);
  const todayKorDate = getKoreanDateString(today);

  //replier.reply("[" + sender + "]님의 운세를 확인 중입니다... AI가 열심히 분석하고 있어요! 🤖");

  const todayFortune = getFortune(name, formattedBirthDate, todayStr);
  if (!todayFortune) {
    replier.reply("⚠️ 운세 정보를 가져오는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
    return;
  }

  let replyText = "";
  //replyText += "✨ 당신의 오늘, AI가 미리 알려드려요\n";
  replyText += "━━━━━━━━━━━\n\n";
  replyText += "☀️ " + sender + "님의 " + todayKorDate + " 운세입니다 🥠\n\n";
  replyText += "‣ 오늘의 메시지\n" + todayFortune.message + "\n\n";
  replyText += "‣ Tip\n" + todayFortune.action_tip + "\n\n";
  replyText += "━━━━━━━━━━━\n";
  //replyText += "AI가 예측한 당신의 운세를 확인해보세요 ✨";

  replier.reply(replyText);
};



// ================================
// 🧳 방(room) 단위 잭팟 상태
// ================================
const travelPotFile = 'sdcard/bot/mileage/travelpot.txt';
if (!fs.read(travelPotFile)) fs.write(travelPotFile, '{}');
var travelPot = JSON.parse(fs.read(travelPotFile)); // { [room]: { pot:number, count:number } }

function getOrInitTravelPotRoom(room) {
  if (!travelPot[room]) travelPot[room] = { pot: 0, count: 0 };
  return travelPot[room]; // { pot, count }
}

// 확률 계산(카운트/누적이 클수록↑, 상한 60%)
function calcTravelWinProb(count, pot) {
  if (count < 10) return 0; // 10회 미만은 대상 아님
  var p = (count - 9) * 0.02 + (pot / 100000) * 0.05; // 회차보너스 + 금액보너스
  if (p > 0.60) p = 0.60;
  return p;
}

function roll(prob) {
  return Math.random() < prob;
}








//요일 이벤트를 위한 감별기
let yoil = new Date().getDay();
//월 ~ 금: 글자 제공
//월화수: 요리대전
//  흑백결과
//목,금: 슬롯 제공
//토: 경마 진행
// !경마선정, 경마시작
//일: 그룹전 진행
// !그룹전결과



function responseFix(room, msg, sender, isGroupChat, replier, imageDB, packageName) {

    runCommand(room, msg, sender, replier);


   count++; // 채팅할때마다 카운트
   
   //오스카 방 및 점수 보장
    ensureOscarRoom(room);

  // 🔤 사용자 이름 정리
  if (sender.includes('\u202E')) {
    sender = sender.replace(/\u202e/gi, '').split('').reverse().join('');
  }
  const index = sender.indexOf("/");
  if (index !== -1) {
    sender = sender.substring(0, index);
  }


  // 📆 날짜 갱신 및 출석 초기화
  const today = getToday();
  const specialScore = getSpecialScore()
  if (jsonattend['today'] !== today) {
    const yesterdayList = jsonattend['list']['사계'] || [];
    if (yesterdayList.length > 0) {
      const pick = yesterdayList[Math.floor(Math.random() * yesterdayList.length)];
      funding.collect_fmember = pick;
      funding.funding_start = 1;
      funding.predictions = {};
      funding.funded_users = [];
      funding.selected_result = null;
      funding.confirmed_shooting = false;
      fs.write(fundingFile, JSON.stringify(funding, null, 4));
      replier.reply("사계","금일 펀딩 영화 제작자는... \n"+funding.collect_fmember+"님 입니다.\n!펀딩 결과/횟수로 투자하세요.\n결과: 초대박, 대박, 레전드, 메가히트, 히트\n횟수: 1~3")
    }
    jsonattend['today'] = today;
    jsonattend['list'] = {};
    fs.write(path, JSON.stringify(jsonattend, null, 4));
  }
  

  // 출석 리스트 초기화
  if (!jsonattend['list'][room]) {
    jsonattend['list'][room] = [];
  }

   // 🟢 출첵 명령어 처리
if (msg === 'ㅊㅅ' || msg === '출첵' || msg === '출췍') {
   createUserAccount(room, sender);
   let attendmsg = [];
   let day = new Date();
   yoil = new Date().getDay();

    if (jsonattend['list'][room].includes(sender)) {
      modifypoint(room, sender, -300);
      replier.reply("찰싹 300포인트 차감\n" + sender + '님 잔여 포인트' + userinfo[room][sender][9] + '원');
      userinfo[room][sender][6]++;
      fs.write(vips, JSON.stringify(userinfo, null, 4));
      return;
    } else {

      let s;
      if (userinfo[room][sender][9] >= 1000000) {
        s = 1;
      } else {
        s = generateScore(2300, 300);
        if (jsonattend['list'][room].length === 0) {
          s += 1000;
          attendmsg.push('¡Felicidades por el primero!\nMil puntos más para ti.\n');
        }
      }



      if (userinfo[room][sender][9] >= 100000) {
        s = 1;
        attendmsg.push('[' + sender + '] 님 탈모빔 공격!\n► 순위: ' + (jsonattend['list'][room].length + 1) + "  (" + day.getHours() + "시" + day.getMinutes() + "분" + day.getSeconds() + "초)" + "\n\n" + s + '원 추가(구두쇠)\n포인트 ' + userinfo[room][sender][9] + '원(디버프)');
      } else {
        attendmsg.push('[' + sender + '] 님 출석체크 완료!\n► 내 순위: ' + (jsonattend['list'][room].length + 1) + "  (" + day.getHours() + "시" + day.getMinutes() + "분" + day.getSeconds() + "초)" + "\n\n" + s + '원 추가\n포인트 ' + userinfo[room][sender][9] + '원');
      }

      modifypoint(room, sender, s);

      if (actoritem[room][sender].length > 0) {
        attendmsg.push('\n배우(보겜) 보상: ' + useritem[room][sender][3] + '원');
        modifypoint(room, sender, useritem[room][sender][3]);
      }

      handleAttendanceByDay(room, sender, yoil, attendmsg);

      const infos = userFortuneMap[sender];
      if (infos) {
         replyFortune(sender, replier, infos.name, infos.birthYYYYMMDD);
      }
      

      replier.reply(attendmsg.join(''));
      jsonattend['list'][room].push(sender);
      fs.write(path, JSON.stringify(jsonattend, null, 4));
      attendlog[room][sender].push(today + ':' + s);
      fs.write(attendslog, JSON.stringify(attendlog, null, 4));
    }
  }

   if(msg=='!요일'){
      yoil = new Date().getDay();
   }


   if(msg=='!다이스'){
      //let resultMsg = [];
      replier.reply(generateScore(100,0)+"점"+yoil);
      /*if(biteam.includes(sender)){  
         resultMsg.push('\n'+sender + '님은 흑팀입니다!');
      }
      else if(witeam.includes(sender)){
         bwchef[room]['bwteams']['white'].push(sender);
         resultMsg.push('\n'+sender + '님은 백팀입니다!');
      }*/
      //resultMsg.push("백팀: "+witeam.length+"명\n흑팀: "+biteam.length+"명");
      //let wpanel = whitepanel[Math.random() * whitepanel.length|0];
      //let bpanel = blackpanel[Math.random() * blackpanel.length|0];
      //resultMsg.push("백팀패널: "+wpanel+"님\n흑팀패널: "+bpanel+"님");
      //replier.reply(resultMsg.join('\n'));
   }
   
   if (msg == "!흑백팀" && bwchef[room]['process'] == 1  && (yoil == 1 || yoil == 5)) {
      let blackTeam = bwchef[room]['bwteams']['black'].join('\n');
      let whiteTeam = bwchef[room]['bwteams']['white'].join('\n');
      let blackScore = bwchef[room]['bwscores']['black']; // 흑팀 총점
      let whiteScore = bwchef[room]['bwscores']['white']; // 백팀 총점  
      let blackTeamTable =[];      
      let whiteTeamTable =[];
      blackTeamTable.push(blackTeam);
      whiteTeamTable.push(whiteTeam);  
      // 결과를 replier로 출력
      replier.reply("[팀원 정보]"+Lw+'\n흑팀 멤버 목록:\n'+ blackTeamTable+'\n총점 평균: '+ (blackScore/ bwchef[room]['bwteamsattends']['black']).toFixed(2) +'점\n\n' + '백팀 멤버 목록:\n' + whiteTeamTable +'\n총점 평균: '+ (whiteScore/ bwchef[room]['bwteamsattends']['white']).toFixed(2) +'점'); 
   }

   if((msg == "!흑백순위" || msg == "!개인전순위") && bwchef[room]['process'] == 1) {
      let rankinglist = [];
      let resultMsg = [];
      for(i in bwchef[room]['bwdiceRolls']) rankinglist.push(i + ' : ' + (bwchef[room]['bwdiceRolls'][i]) + '점');
      resultMsg.push('[' + room + '] 의 요리 순위' + Lw + '\n\n' + rankinglist.sort((a, b) => b.split(' : ')[1].split('점')[0] - a.split(' : ')[1].split('점')[0]).map(e => (rankinglist.indexOf(e) + 1) + '위ㅣ' + e).join('\n'));
      if(yoil == 3){
         resultMsg.push('\n요리 카운트: '+ bwchef[room]['yoricount']+'회');
         resultMsg.push('1위 예상 포인트: '+ (bwchef[room]['yoricount']*250* 0.45).toFixed(0)+'포인트');
         resultMsg.push('2위 예상 포인트: '+ (bwchef[room]['yoricount']*250* 0.3).toFixed(0)+'포인트');
         resultMsg.push('3위 예상 포인트: '+ (bwchef[room]['yoricount']*250* 0.15).toFixed(0)+'포인트');
         resultMsg.push('4위 예상 포인트: '+ (bwchef[room]['yoricount']*250* 0.1).toFixed(0)+'포인트');
         resultMsg.push('5위 예상 포인트: '+ (bwchef[room]['yoricount']*250* 0.05).toFixed(0)+'포인트');
      }
      replier.reply(resultMsg.join('\n'))
   }



      // 주사위를 굴리는 명령
   if (msg.startsWith('!요리 ') || (msg.startsWith('!최고요리 ') && jsonattend['list'][room].includes(sender) && bwchef[room]['process'] === 1)) {
      const isPremium = msg.startsWith('!최고요리 ');
      const parts = msg.substr(isPremium ? 6 : 4).split('/');
      const yoriname = parts[0] ? parts[0].trim() : '';
      const iterations = isPremium ? parseInt(parts[1] || '1') : 1;
      const pointCost = 500 * iterations;

      if (!yoriname || yoriname.length < 3) {
         replier.reply(sender + '님 요리명이 성의가 없어!');
         return;
      }
      if (isPremium && (isNaN(iterations) || iterations <= 0)) {
         replier.reply(sender + '님 반복 횟수를 올바르게 입력해주세요.');
         return;
      }
      if (userinfo[room][sender][9] < pointCost) {
         replier.reply("요리 대회 참여비: " + pointCost + "포인트\n" + sender + "님의 포인트: " + userinfo[room][sender][9] + "포인트");
         return;
      }

      const isTeamBattle = (bwchef[room]['process'] === 1 && (yoil === 1 || yoil === 5));
      const isPersonalBattle = (bwchef[room]['process'] === 1 && yoil === 3);
      if (!isTeamBattle && !isPersonalBattle) return;

      let yoricomment = [];
      let bestScore = 0;
      let bestBlackScore = 0;
      let bestWhiteScore = 0;
      let yorilog = [];

      for (let i = 0; i < iterations; i++) {
         let rollb = generateScore(isTeamBattle ? 100 : 1000, 1);
         let rollw = generateScore(isTeamBattle ? 100 : 1000, 1);
         let diceRolls = rollb + rollw;
         yorilog.push("[" + (i + 1) + "회차]: " + rollb + "점 + " + rollw + "점 (총점: " + diceRolls + "점)");

         if (diceRolls > bestScore) {
            bestScore = diceRolls;
            bestBlackScore = rollb;
            bestWhiteScore = rollw;
         }
      }

      const rollb = bestBlackScore;
      const rollw = bestWhiteScore;
      const diceRolls = bestScore;

      let panelComment = "";
      if (diceRolls >= (isTeamBattle ? 180 : 1800)) {
         panelComment = yoriname + " 요리의 점수 완벽합니다.";
      } else if (diceRolls >= (isTeamBattle ? 120 : 1200)) {
         panelComment = yoriname + " 요리의 점수를 발표하겠습니다.";
      } else if (diceRolls >= (isTeamBattle ? 60 : 600)) {
         panelComment = yoriname + " 요리...\n우선 보류하겠습니다.";
      } else {
         panelComment = yoriname + " 의 요리는 탈락감";
      }

      const wpanel = whitepanel[Math.random() * whitepanel.length | 0];
      const bpanel = blackpanel[Math.random() * blackpanel.length | 0];

      if (isTeamBattle) {
         if(diceRolls == 100) {
            replier.reply("축하합니다! " + sender + "님, 100점 기념 랭커 1회 추가");
            useritem[room][sender][1] = useritem[room][sender][1]+1;
            fs.write(vipi, JSON.stringify(useritem, null, 4));
         }
         if(diceRolls == 200) {
            replier.reply("축하합니다! " + sender + "님, 200점 기념 눈치 1회 추가");
            useritem[room][sender][0] = useritem[room][sender][0]+1;
            fs.write(vipi, JSON.stringify(useritem, null, 4));
         }
         if (!bwchef[room]['bwteams']['black'].includes(sender) && !bwchef[room]['bwteams']['white'].includes(sender)) return;
         let team = bwchef[room]['bwteams']['black'].includes(sender) ? '흑팀' : '백팀';
         let teamKey = team === '흑팀' ? 'black' : 'white';

         yoricomment.push(team + ': ' + sender + "님\n" + panelComment + "\n------------------------------------\n");
         yoricomment.push(yoriname + " 요리를 " + iterations + "회 시도한 결과!\n");
         yoricomment.push(bpanel + ": " + rollb + "점\n" + wpanel + ": " + rollw + "점\n" + sender + "님 총점: " + diceRolls + "점\n------------------------------------\n");

         if (bwchef[room]['bwdiceRolls'].hasOwnProperty(sender)) {
            bwchef[room]['bwscores'][teamKey] -= bwchef[room]['bwdiceRolls'][sender];
         } else {
            bwchef[room]['bwteamsattends'][teamKey] += 1;
         }
         bwchef[room]['bwscores'][teamKey] += diceRolls;
         bwchef[room]['bwdiceRolls'][sender] = diceRolls;
         yoricomment.push(team + " 평균: " + (bwchef[room]['bwscores'][teamKey] / bwchef[room]['bwteamsattends'][teamKey]).toFixed(2) + "점입니다.");
      }

      if (isPersonalBattle) {
         if(diceRolls == specialScore) {
            replier.reply("축하합니다! " + sender + "님, 특별 보너스 점수 " + specialScore + "점을 획득했습니다!");
            modifypoint(room, sender, specialScore);
         }
         yoricomment.push(sender + "님\n" + panelComment + "\n------------------------------------\n");
         yoricomment.push(yoriname + " 요리를 " + iterations + "회 시도한 결과!\n");
         yoricomment.push(bpanel + ": " + rollb + "점\n" + wpanel + ": " + rollw + "점\n" + sender + "님 총점: " + diceRolls + "점\n------------------------------------\n");
         bwchef[room]['bwdiceRolls'][sender] = diceRolls;
      }

      modifypoint(room, sender, -pointCost);
      yoricomment.push("\n" + sender + "님 잔여 포인트: " + userinfo[room][sender][9] + "포인트");
      useritem[room][sender][12] += 1;
      fs.write(vipi, JSON.stringify(useritem, null, 4));
      fs.write(bwyorisa, JSON.stringify(bwchef, null, 4));

      // 공개 응답은 결과만, 로그는 별도 DM
      replier.reply(yoricomment.join('\n'));
      if(iterations > 1){
      replier.reply("테스티스트2", yorilog.join('\n'));
}
      if (room === '사계') {
         bwchef[room]['yoricount'] += iterations;
      }
      return;
   }


   if (msg == "!요리결과" && bwchef[room]['process'] == 1) {
      if (admin.includes(sender)) {
         if (!bwchef[room]) {
            replier.reply("요리 대전이 시작되지 않았습니다.");
            return;
         } else if (Object.keys(bwchef[room]['bwdiceRolls']).length <= 1) {
            replier.reply("요리 대전 참여자가 적어 게임 종료!");
            return;
         }

         if (yoil == 1 || yoil == 5) { // 팀전 요리 결과
            let blackp = Number(bwchef[room]['bwscores']['black']);
            let whitep = Number(bwchef[room]['bwscores']['white']);
            let blackn = bwchef[room]['bwteamsattends']['black'];
            let whiten = bwchef[room]['bwteamsattends']['white'];

            replier.reply("자 그럼 지금부터 결과를 공개하겠습니다.\n요리대전 참여자\n흑팀: " + blackn + "명\n백팀: " + whiten + "명");
            java.lang.Thread.sleep(2000);

            let list = [];
            let listattend = Object.keys(bwchef[room]['bwdiceRolls']);
            let winnerlist = [];

            if (blackp > whitep) {
               list = bwchef[room]['bwteams']['black'];
               list.forEach(member => {
                  if (listattend.includes(member)) {
                     modifypoint(room, member, whiten * 750);
                     winnerlist.push(member + ": " + (whiten * 750) + "포인트\n");
                  }
               });
               fs.write(vips, JSON.stringify(userinfo, null, 4));
               replier.reply('흑팀: ' + blackp + '점 백팀: ' + whitep + '점\n흑팀 승리입니다. 축하합니다.\n\n' + winnerlist.join(''));
            } else if (blackp < whitep) {
               list = bwchef[room]['bwteams']['white'];
               list.forEach(member => {
                  if (listattend.includes(member)) {
                     modifypoint(room, member, blackn * 750);
                     winnerlist.push(member + ": " + (blackn * 750) + "포인트\n");
                  }
               });
               fs.write(vips, JSON.stringify(userinfo, null, 4));
               replier.reply('흑팀: ' + blackp + '점 백팀: ' + whitep + '점\n백팀 승리입니다. 축하합니다.\n\n' + winnerlist.join(''));
            } else {
               replier.reply('흑팀: ' + blackp + '점 백팀: ' + whitep + '점\n무승부입니다. 내일 재대결을 진행합니다.');
            }

            // 초기화
            bwchef[room]['bwteams'] = { black: [], white: [] };
            bwchef[room]['bwscores'] = { black: 0, white: 0 };
            bwchef[room]['bwteamsattends'] = { black: 0, white: 0 };
            bwchef[room]['bwdiceRolls'] = {};
            bwchef[room]['process'] = 0;
            bwchef[room]['yoricount'] = 0;
            fs.write(bwyorisa, JSON.stringify(bwchef, null, 4));

         } else if (yoil == 3) { // 개인전 요리 결과
            let participantCount = Object.keys(bwchef[room]['bwdiceRolls']).length;
            let pointBase = bwchef[room]['yoricount'] * 250;
            let pointDistribution = [0.45, 0.30, 0.15, 0.10, 0.05];
            let sorted = Object.entries(bwchef[room]['bwdiceRolls']).sort((a, b) => b[1] - a[1]);

            replier.reply("자 그럼 지금부터 결과를 공개하겠습니다!\n요리대전 참여자: " + participantCount + "명\n금일 요리 횟수: " + bwchef[room]['yoricount'] + '회');
            java.lang.Thread.sleep(2000);

            let winnerlist = [];
            for (let i = 0; i < Math.min(sorted.length, 5); i++) {
               let member = sorted[i][0];
               let reward = Math.floor(pointBase * pointDistribution[i]);
               modifypoint(room, member, reward);
               winnerlist.push((i + 1) + "위: " + member + " - " + reward + "점\n");
            }
            fs.write(vips, JSON.stringify(userinfo, null, 4));
            replier.reply('요리 대전 결과 발표!\n총상금 포인트: ' + pointBase + '\n\n' + winnerlist.join(''));

            // 초기화
            bwchef[room]['bwdiceRolls'] = {};
            bwchef[room]['process'] = 0;
            bwchef[room]['yoricount'] = 0;
            fs.write(bwyorisa, JSON.stringify(bwchef, null, 4));
         }
      } else {
         replier.reply('권한이 없어!!');
         return;
      }
   }


   if(msg == "!흑백결과" && room == "테스티스트2"  &&  (yoil == 1 || yoil == 3 || yoil == 5)) {
      let room3 = ["사계"];
      if(yoil == 1 || yoil == 5){         // 팀전 결과
         for(let ri = 0; ri < room3.length; ri++){
            if(!bwchef[room3[ri]] || bwchef[room3[ri]]['process'] == 0) {
               replier.reply(room3[ri], "흑백 게임이 시작되지 않았습니다.");
               return;
            }
            else if(Object.keys(bwchef[room3[ri]]['bwdiceRolls']).length <= 1){
               replier.reply(room3[ri], "흑백 게임 참여자가 적어 게임 종료!");
               return;
            }
            let blackp = Number(bwchef[room3[ri]]['bwscores']['black']);
            let whitep = Number(bwchef[room3[ri]]['bwscores']['white']);
            let blackn = bwchef[room3[ri]]['bwteamsattends']['black'];       // 흑팀 요리 참전자
            let whiten = bwchef[room3[ri]]['bwteamsattends']['white'];       // 백팀 요리 참전자
            if(room3[ri] =='사계'){
               replier.reply(room3[ri], "자 그럼 지금부터 결과를 공개하겠습니다!\n요리대전 참여자\n흑팀: "+blackn+"명\n백팀: "+whiten+"명\n금일 요리 횟수: "+bwchef[room3[ri]]['yoricount']+'회');
            }
            else{
               replier.reply(room3[ri], "자 그럼 지금부터 결과를 공개하겠습니다.\n요리대전 참여자\n흑팀: "+blackn+"명\n백팀: "+whiten+"명");
            }
            java.lang.Thread.sleep(2000);
            let list = [];             //흑팀이나 백팀 전체 멤버
            let listattend = [];       //요리점수가 있는 참여자
            let winnerlist = [];       //승리자 멤버 텍스트 입력
            for(k in bwchef[room3[ri]]['bwdiceRolls']) listattend.push(k);       // 요리점수가 있는 참여자를 listattend에 추가
            if((blackp/blackn) > (whitep/whiten)){
               for(i in bwchef[room3[ri]]['bwteams']['black']) list.push(bwchef[room3[ri]]['bwteams']['black'][i]);         // list에 흑팀 멤버 전체를 넣는다
               for(let j = 0; j < list.length; j++) {                                                       //흑팀 멤버 전체를 1명씩 돌린다.
                  if(listattend.includes(list[j])){     //점수획득자가 흑팀에 속해있는 경우
                     modifypoint(room3[ri], list[j], ((blackn +whiten)/2) * 1000);
                     //userinfo[room3[ri]][list[j]][9] = userinfo[room3[ri]][list[j]][9] + (whiten * 500);
                     //let contribution = (Number(bwchef[room3[ri]]['bwdiceRolls'][list[j]]/blackp)*100);
                     winnerlist.push(list[j] + ": "+ (((blackn +whiten)/2) * 1000)+"\n");// +"포인트(기여도: "+contribution.toFixed(2) + "%)\n");
                  }               
               }
               fs.write(vips, JSON.stringify(userinfo, null, 4));
               replier.reply(room3[ri], '흑팀 평균: '+ (blackp/blackn).toFixed(2) +'점\n백팀 평균:'+ (whitep/whiten).toFixed(2) +'점\n흑팀 승리입니다. 축하합니다.\n\n'+winnerlist.join(''));
            }
            else if((blackp/blackn) < (whitep/whiten)){
               for(i in bwchef[room3[ri]]['bwteams']['white']) list.push(bwchef[room3[ri]]['bwteams']['white'][i]);
               for(let j = 0; j < list.length; j++) {
                  if(listattend.includes(list[j])){     //점수획득자가 백팀에 속해있는 경우
                     modifypoint(room3[ri], list[j], ((blackn +whiten)/2) * 1000);
                     //userinfo[room3[ri]][list[j]][9] = userinfo[room3[ri]][list[j]][9] + (blackn * 500);
                     //let contribution = (Number(bwchef[room3[ri]]['bwdiceRolls'][list[j]]/whitep)*100);
                     winnerlist.push(list[j] + ": "+ (((blackn +whiten)/2) * 1000)+"\n");// +"포인트(기여도: "+contribution.toFixed(2) + "%)\n");
                  }
               }
               fs.write(vips, JSON.stringify(userinfo, null, 4));
               replier.reply(room3[ri], '흑팀 평균: '+ (blackp/blackn).toFixed(2) +'점\n백팀 평균:'+ (whitep/whiten).toFixed(2) +'점\n백팀 승리입니다. 축하합니다.\n\n'+winnerlist.join(''));
            }
            else if((blackp/blackn) == (whitep/whiten)){
               replier.reply(room3[ri], '흑팀 평균: '+ (blackp/blackn).toFixed(2) +'점\n백팀 평균:'+ (whitep/whiten).toFixed(2) +'점\n무승부입니다. 내일 재대결을 진행합니다.');
            }
            else{
               replier.reply(room3[ri], '오류;;;;');
            }
            bwchef[room3[ri]]['bwteams'] = { black: [], white: [] };
            bwchef[room3[ri]]['bwscores'] = { black: 0, white: 0 };
            bwchef[room3[ri]]['bwteamsattends'] = { black: 0, white: 0 };
            bwchef[room3[ri]]['bwdiceRolls'] = {};
            bwchef[room3[ri]]['process'] = 0;
            bwchef[room3[ri]]['yoricount'] = 0;
            blackp = 0;
            whitep = 0;
            fs.write(bwyorisa, JSON.stringify(bwchef, null, 4));
         }
      }
      else if(yoil == 3 ){         // 개인전 결과
         for(let ri = 0; ri < room3.length; ri++){
            if(!bwchef[room3[ri]] || bwchef[room3[ri]]['process'] == 0) {
               replier.reply(room3[ri], "요리 대전이 시작되지 않았습니다.");
               return;
            }
            else if(Object.keys(bwchef[room3[ri]]['bwdiceRolls']).length <= 1){
               replier.reply(room3[ri], "요리 대전 참여자가 적어 게임 종료!");
               return;
            }
            replier.reply(room3[ri], "자 그럼 지금부터 결과를 공개하겠습니다!\n요리대전 참여자: "+Object.keys(bwchef[room3[ri]]['bwdiceRolls']).length+"명\n금일 요리 횟수: "+bwchef[room3[ri]]['yoricount']+'회');
            java.lang.Thread.sleep(2000);

            let participants = Object.keys(bwchef[room3[ri]]['bwdiceRolls']);
            let sortedParticipants = participants.sort((a, b) => bwchef[room3[ri]]['bwdiceRolls'][b] - bwchef[room3[ri]]['bwdiceRolls'][a]);
            let pointBase = bwchef[room3[ri]]['yoricount'] * 250;
            let pointDistribution = [0.45, 0.30, 0.15, 0.10, 0.05];

            let winnerlist = [];       //승리자 멤버 텍스트 입력

            for (let i = 0; i < Math.min(sortedParticipants.length, 5); i++) {
               let points = Number(Math.floor(pointBase * pointDistribution[i]).toFixed(0));
               modifypoint(room3[ri], sortedParticipants[i], points);
               winnerlist.push((i + 1) + "위: " + sortedParticipants[i] + " - " + points + "포인트\n");
            }
            fs.write(vips, JSON.stringify(userinfo, null, 4));
            replier.reply(room3[ri], '요리 대전 결과 발표!\n총상금 포인트' +pointBase+ '\n\n'+ winnerlist.join(''));
            bwchef[room3[ri]]['bwdiceRolls'] = {};
            bwchef[room3[ri]]['process'] = 0;
            bwchef[room3[ri]]['yoricount'] = 0;
            fs.write(bwyorisa, JSON.stringify(bwchef, null, 4));
         }
      }
   }
   

   if(msg == "!요리초기화" && admin.includes(sender)){
      bwchef[room]['bwteams'] = { black: [], white: [] };
      bwchef[room]['bwscores'] = { black: 0, white: 0 };
      bwchef[room]['bwteamsattends'] = { black: 0, white: 0 };
      bwchef[room]['bwdiceRolls'] = {};
      bwchef[room]['process'] = 0;
      bwchef[room]['yoricount'] = 0;
      fs.write(bwyorisa, JSON.stringify(bwchef, null, 4));
      replier.reply("초기화 완료");
   }

   if(msg.startsWith('!출석정보') && attendlog[room][sender] != undefined){
    createUserAccount(room, sender);      
      let attend_count = 0;
    
      let sumat = []; // 현재 멤버의 출석 포인트 전체 정보를 담을 배열
      let chooseat = []; // 현재 멤버가 설정한 평균을 낼 개수를 담을 배열
      let choicemsg = [];// 결과 메시지 구성
      let chooseday ="";
      if(msg == '!출석정보' || isNaN(msg.substr(5)) || msg.substr(5) >= attendlog[room][sender].length){
         attend_count = Number(attendlog[room][sender].length);
         chooseday = '전체 정보';
      }
      else{
        attend_count = Number(msg.substr(5));
         chooseday = attend_count+'일';
         
      }
      for(let i = 0; i < attendlog[room][sender].length; i++) {
         sumat.push(attendlog[room][sender][i].split(":")[1]);    //출석 전체 정보 값을 다 넣는다.
      }
      let k = 0;
      for(let j = sumat.length; j > 0; j--){          //역으로 출석값을 돌린다.
         if(k < attend_count){                        //입력한 정보 값만큼만 chooseat에 값을 넣는다.
            chooseat.push(Number(sumat[j-1]));
            k++;
         }
      }
      choicemsg.push(sender+'님의 출석 데이터\n');
      choicemsg.push('총 출석일: '+attendlog[room][sender].length+'일');
      choicemsg.push('지정 일자: '+chooseday);
      choicemsg.push('평균 값: '+Math.round(chooseat.reduce((a,b)=>a+b)/attend_count)+'포인트');
      choicemsg.push('최소 값: '+Math.min.apply(null,chooseat)+'포인트');
      choicemsg.push('최대 값: '+Math.max.apply(null,chooseat)+'포인트');
      choicemsg.push('총 합계: '+(chooseat.reduce((a,b)=>a+b)) +'포인트');
            if(attend_count <= 7){
         choicemsg.push('증감률')
         let l = 0;
         let dod = [];
         for(let j = attendlog[room][sender].length; j > 0; j--){          //전체값을 기준으로 역으로 출석값을 돌린다.
            if(l < attend_count){                        //입력한 정보 값만큼만 chooseat에 값을 넣는다.
                               if(attendlog[room][sender][j-1] && attendlog[room][sender][j-2]){          //이전값과의 비교( 증감 표현하기 위함)
                  if(attendlog[room][sender][j-1].split(':')[1] >= attendlog[room][sender][j-2].split(':')[1]){
                  let ll = attendlog[room][sender][j-1].split(':')[1] - attendlog[room][sender][j-2].split(':')[1];
                  dod.push('('+ll+'원▲)')
                  }
                  else{
                     let ll = attendlog[room][sender][j-1].split(':')[1] - attendlog[room][sender][j-2].split(':')[1];
                     dod.push('('+ll+'원▼)')
                  }
               }
               choicemsg.push(' - '+attendlog[room][sender][j-1].split(':')[0]+': '+attendlog[room][sender][j-1].split(':')[1]+'원'+dod);
               dod =[];
               l++;
            }
         }
      }
      replier.reply(choicemsg.join('\n'));      
   } 

  

   if(msg == "!글자정보" || msg == "!내글자정보") {
      createUserAccount(room, sender);
      let resultMessage = [];
      let all_count = 0;
      let all_count_atbonus =[];
      if(attendbonus[room][sender] != undefined){
      resultMessage.push('☆[' + sender + ']님 낱말 정보☆'+Lw+'\n');

      for(let k = 0; k < 7; k++){      // 0부터 6까지 돌아서 총 7개 슬롯 카운트
         if(room =='사계'){
            resultMessage.push(attend_sagae[k]+': '+ attendbonus[room][sender][k]+'개\n')
         }
         else {
            resultMessage.push(attend_sinjun[k]+': '+ attendbonus[room][sender][k]+'개\n')
         }         
         all_count = all_count + attendbonus[room][sender][k];
         all_count_atbonus.push(attendbonus[room][sender][k])
         }
      }
      //replier.reply(Math.min.apply(null,all_count_atbonus));
      attendbonus[room][sender][7] = Math.min.apply(null,all_count_atbonus);
      resultMessage.push('총 글자 개수는 '+all_count+'개 입니다.\n글자보너스: '+attendbonus[room][sender][7]+'개');
      replier.reply(resultMessage.join(''));
   }
   
 
   if(msg == "!글자보너스") {
      let resultMessage = [];
      let all_count_atbonus =[];       // 각 글자 7개의 개수를 하나씩 추가하는 배열
      for(let k = 0; k < 7; k++){      // 0부터 6까지 돌아서 총 7개 슬롯 카운트
         all_count_atbonus.push(attendbonus[room][sender][k])
      }
      attendbonus[room][sender][7] = Math.min.apply(null,all_count_atbonus);
      let abcnt = attendbonus[room][sender][7];
      if(abcnt > 0){
         if(attendbonus[room][sender] != undefined){
         for(let kk = 0; kk < abcnt; kk++){
            for(let k = 0; k < 7; k++){
               attendbonus[room][sender][k] = attendbonus[room][sender][k] - 1;
            }
            attendbonus[room][sender][7] = attendbonus[room][sender][7] - 1;
         }
         fs.write(attendb, JSON.stringify(attendbonus, null, 4));
         modifypoint(room, sender, 5000*abcnt);
         resultMessage.push("글자완성 보너스!\n"+sender+'님 '+5000*abcnt+ '포인트 획득\n'+sender+'님의 포인트'+userinfo[room][sender][9]+'원');
         }
      }
      else{
         resultMessage.push("보너스가 없어요.");
      }
      replier.reply(resultMessage.join(''));
   }


   //소원 연못 게임
   if(msg.startsWith('!소원')) {
      createUserAccount(room, sender);
      let searchword = msg.substr(4);
      if(searchword == "") {
         replier.reply(sender+'님이 보유 글자 전체를 기부하셨습니다.');
         return;
      }
      if(room =='사계' && attend_sagae.includes(searchword)){//사계방에서 서치워드가 제대로 입력되었을 경우
         for(let k = 0; k < 7; k++){      // 0부터 6까지 돌아서 총 7개 슬롯 카운트
            if(searchword == attend_sagae[k] && attendbonus[room][sender][k] > 0){
               attendbonus['list'][room].push(sender);
               attendbonus[room][sender][k]--;
               replier.reply(sender+'님 소원 연못에 글자 투척\n연못에 투척된 총 개수:'+attendbonus['list'][room].length+'개');
               if(attendbonus['list']['words'][room].includes(searchword)){
               return;
               }
               else{
                  attendbonus['list']['words'][room].push(searchword);
               }
            }
         }
         if(Object.keys(attendbonus['list']['words'][room]).length == 7){      ////7종류가 다 모이면 추첨 시작
            let victory = {};
            let rule = generateScore(attendbonus['list'][room].length,0);
            victory[room] = attendbonus['list'][room][rule];
            replier.reply("소원 연못 추첨 완료");
            java.lang.Thread.sleep(3000);
            modifypoint(room, victory[room], 5000);
         let sowoncount = attendbonus['list'][room].reduce((cnt, element) => cnt + (victory[room] == element), 0);    // 당첨자가 몇번 넣어는지 카운트
         let imsiattmember = attendbonus['list'][room];
         
         Array.prototype.filterDuplicated = function() {
            return Array.from(new Set(this));        
            }
            JSON.stringify(imsiattmember.filterDuplicated())
            //replier.reply('참여자: '+imsiattmember);
            for(let icon = 0; icon < imsiattmember.length; icon++) {
               if(imsiattmember == victory[room])  {
                  imsiattmember.splice(icon, 1);
               icon--;
               }
            }         
            replier.reply("🐷소원 연못 당첨자 축하합니다.🐷\n\n당첨자: " + victory[room] + '\n현재 포인트:' + userinfo[room][victory[room]][9] + '원(반영완료)\n\n당첨 확률: '+sowoncount+'/' + attendbonus['list'][room].length+'\n도움준 분들:\n'+attendbonus['list'][room].join('\n'));
         attendbonus['list']['words'][room] = [];
            attendbonus['list'][room] =[];
         }
         fs.write(attendb, JSON.stringify(attendbonus, null, 4));
      }
      
      /*
      if(room =='신전' && attend_sanbon.includes(searchword)){
         for(let k = 0; k < 7; k++){      // 0부터 6까지 돌아서 총 7개 슬롯 카운트
            if(searchword == attend_sanbon[k]  && attendbonus[room][sender][k] > 0){
               attendbonus['list'][room].push(sender);
               attendbonus[room][sender][k]--;
               replier.reply(sender+'님 소원 연못에 글자 투척\n연못에 투척된 총 개수:'+attendbonus['list'][room].length+'개');
               if(attendbonus['list']['words'][room].includes(searchword)){
               return;
               }
               else{
                  attendbonus['list']['words'][room].push(searchword);
               }
            }
         }
         if(attendbonus['list']['words'][room].length == 7){      ////7종류가 다 모이면 추첨 시작
            let victory = {};
            let rule = generateScore(attendbonus['list'][room].length,0);
            victory[room] = attendbonus['list'][room][rule];
            replier.reply("소원 연못 추첨 완료");
            java.lang.Thread.sleep(3000);
            modifypoint(room, victory[room], 5000);
         let sowoncount = attendbonus['list'][room].reduce((cnt, element) => cnt + (victory[room] == element), 0);
         let imsiattmember = attendbonus['list'][room];
         
         Array.prototype.filterDuplicated = function() {
            return Array.from(new Set(this));        
            }
            JSON.stringify(imsiattmember.filterDuplicated())
            //replier.reply('참여자: '+imsiattmember);
            for(let icon = 0; icon < imsiattmember.length; icon++) {
               if(imsiattmember == victory[room])  {
                  imsiattmember.splice(icon, 1);
               icon--;
               }
            }    
            replier.reply("🐷소원 연못 당첨자 축하합니다.🐷\n\n당첨자: " + victory[room] + '\n현재 포인트:' + userinfo[room][victory[room]][9] + '원(반영완료)\n\n당첨 확률: '+sowoncount+'/' + attendbonus['list'][room].length+'\n도움준 분들:\n'+attendbonus['list'][room].join('\n'));
         attendbonus['list']['words'][room] = [];
            attendbonus['list'][room] =[];
         }
         fs.write(attendb, JSON.stringify(attendbonus, null, 4));
      }*/
   }


   if(msg == '!슬롯' && useritem[room][sender][8] >= 1 && (yoil == 2 || yoil == 4)) {
      
      let slotmsg = [];
      let slotcount = useritem[room][sender][8];
      let successcount = 0;
      fs.write(vipi, JSON.stringify(useritem, null, 4));
      slotmsg.push(sender+"(슬롯 개수: "+useritem[room][sender][8]+"회)\n");
      for(k=0; k< slotcount; k++){
         const itemdab = [];
         for (i=0; i<3 ;i++){
            itemdab[i] = (slotitems[generateScore(slotitems.length,0)]);
         }
         slotmsg.push((k+1)+"번 돌림판: "+"["+itemdab[0]+itemdab[1]+itemdab[2]+"]\n");
         if(itemdab[0] == itemdab[1] && itemdab[1] == itemdab[2]){
            successcount++;
         }
      }
      if(successcount>=1){
         slotmsg.push("\n잭팟 횟수: "+sender+"님 "+(successcount*10000)+"포인트 획득");
         modifypoint(room, sender, successcount*10000);        
      }
      else{
         slotmsg.push("\n"+sender+"님 다음 기회에...");
      } 
      useritem[room][sender][8] = 0
      replier.reply(slotmsg.join(''));
   }

   
   if(msg == '!출석순위') {
      if(jsonattend['list'][room] == undefined || jsonattend['list'][room].length < 1) {
         replier.reply('아직 아무도 출석체크를 하지 않았습니다! ㅊㅅ 또는 출첵을 입력해 출석해 보세요!');
         return;
      }
      replier.reply('[' + room + '] 의 출석순위입니다' + Lw + '\n\n' + jsonattend['list'][room].map(e => jsonattend['list'][room].indexOf(e) + 1 + '위ㅣ' + e).join('\n\n'));
      return;
   }


   if(msg == "!도움말") {
      showHelp(room, replier);
      return;
   }


   if(msg.startsWith('!권한 ')) {
      createUserAccount(room, sender);
      let cost_item = msg.substr(4);
      if(cost_item == "") {
         replier.reply(sender+'님의 계정을 초기화합니다. 잠시만 기다려주세요.');
         return;
      }
      let j_count = 0;
      for(let j in item_cost) {
         if(j == cost_item){
            //replier.reply('j'+j);
            if(userinfo[room][sender][8] >= item_cost[j]) { // 돈 있는지 체크
               //replier.reply(item_cost[j]+j+j_count);
               modifymileage(room,sender,-item_cost[j]);
               useritem[room][sender][j_count] = useritem[room][sender][j_count]+1;
               fs.write(vipi, JSON.stringify(useritem, null, 4));
               replier.reply(sender+'님 '+cost_item+'권한 획득 완료\n'+'잔여 마일리지: '+userinfo[room][sender][8]+' Mileage\n획득 '+cost_item+' 권한: '+useritem[room][sender][j_count] +'번');
               return;
            }
         }
         j_count++;
         /*if(j_count == 3){
            replier.reply(sender+'님 그런 권한 따위는 없음.\n직접 만들길 바람');
            
         }*/
      }
   }

   if(msg.startsWith('!명언설정')) {
      if(userinfo[room][sender][8] >= 1000) {
         modifymileage(room, sender, -1000);
         mname = msg.substr(6) + ' - ' + sender;
         fs.write(msay, JSON.stringify(mname));
         replier.reply(sender+'님 1000마일리지차감\n소지 마일리지 : '+userinfo[room][sender][8]+'\n명언설정 완료\n' + fs.read(msay));
      } else {
         replier.reply('마일 그지는 명언을 낼 수가 없다 - 시네마봇');
      }
   }

if (msg.startsWith('!여행')) {
  createUserAccount(room, sender);
  let searchregion = msg.substr(4);
  if (searchregion == "") {
    replier.reply('멍충아 가고싶은 지역을 도음말 참고해서 써야지. 갈곳까지 정해주랴?');
    return;
  }
  for (let j in region_cost) {
    if (j == searchregion) {
      if (userinfo[room][sender][9] >= region_cost[j]) { // 지역보다 포인트이 유저가 더 있는지 체크한다.
        sumitemname = []; // 현재 아이템 리스트를 담을 배열
        for (let i = 0; i < arrivaldata['milege'].length; i++) {
          if (arrivaldata['milege'][i]['region'] == searchregion) {
            sumitemname.push(arrivaldata['milege'][i]['Arrival']);
          }
        } //아이템을 리스트에 담는 for 문   아이템이 1개 이상 존재해야 집어넣음
        mileageticketname = sumitemname[generateScore(sumitemname.length, 0)]; //현재 갈 수 있는 나라중 한개의 아이템을 뽑아라
        var s = generateScore(10000, 1); //퍼스트 비지니스 이코노미
        if (0 < [s] && [s] <= 8000) {
          itemcnt = 'Economy';
          itemcntnum = 1;
        } else if (8000 < [s] && [s] <= 9300) {
          itemcnt = 'Business';
          itemcntnum = 1.5;
        } else if (9300 < [s] && [s] <= 9900) {
          itemcnt = 'First';
          itemcntnum = 2;
        } else if (0 < [s] && [s] <= 10000) {
          itemcnt = '전용기';
          itemcntnum = 5;
        } else if (9995 < [s] && [s] <= 10000) {
          itemcnt = '초야니니 무등 위';
          itemcntnum = 1;
        }
        choicemsg = [];
        for (let i = 0; i < arrivaldata['milege'].length; i++) {
          if (mileageticketname == arrivaldata['milege'][i]['Arrival']) {
            let grademile = +arrivaldata['milege'][i]['Mileage'] * itemcntnum;
            let grademiles = Math.floor(grademile * 1.25); // 1.25배 보너스
            choicemsg.push("Departure(🛫): 인천\nArrival(🛬): " + arrivaldata['milege'][i]['Arrival'] + "\nMileage: " + grademiles);

            modifypoint(room, sender, -region_cost[j]);
            modifymileage(room, sender, grademiles);

            // ================================
            // 🧳 방(room) 단위 잭팟 20% 적립/추첨
            // ================================
            (function () {
            var earnedMiles = grademiles;                    // 이번 여행으로 획득한 마일
            var state = getOrInitTravelPotRoom(room);        // { pot, count }

            // 10% 적립 (내림)
            var accrual = Math.floor(earnedMiles * 0.20);
            state.pot += accrual;
            state.count += 1;

            // 당첨 확률 계산(10회 이상부터)
            var winProb = calcTravelWinProb(state.count, state.pot);
            var isWin = roll(winProb);

            // 안내 메시지(선택)
            // choicemsg.push("\n[여행 적립] 이번 적립: " + accrual + "M");

            if (isWin && state.pot > 0) {
               // ✅ 잭팟 당첨: 누적 잭팟 지급
               modifymileage(room, sender, state.pot);
               choicemsg.push("\n🎉 축하합니다! 잭팟 " + state.pot + "M 당첨!");

               // 규칙: 당첨 시 방 카운트/포트 초기화
               state.count = 0;
               state.pot = 0;
            } else {
               /* 미당첨 안내(현재 누적 상황)
               if (state.count >= 10) {
                  choicemsg.push("\n※ 잭팟 대상 포함 (현재 확률 약 " + Math.round(winProb * 100) + "%)");
               } else {
                  choicemsg.push("\n※ 잭팟 대상까지 " + (10 - state.count) + "회 남음");
               }*/
               choicemsg.push("\n방 잭팟 누적: " + state.pot + "M");
            }

            fs.write(travelPotFile, JSON.stringify(travelPot, null, 4));
            })();
            // ================================


            if (userinfo[room][sender][1] >= 1000) {
              userinfo[room][sender][0] = userinfo[room][sender][0] + 1;
              userinfo[room][sender][1] = userinfo[room][sender][1] - 1000;
              userinfo[room][sender][2] = userinfo[room][sender][2] + 1;
              replier.reply('[VIP 레벨업]\n\n' + sender + '님의 VIP 레벨이 ' + userinfo[room][sender][0] + '가 되었습니다.\n마일여행권 보상 획득');
              useritem[room][sender][0]++;
            }
            fs.write(vips, JSON.stringify(userinfo, null, 4));
            fs.write(vipi, JSON.stringify(useritem, null, 4));
          }
        }
        replier.reply('[' + sender + '] Ticket\nGrade: ' + itemcnt + '\n' + choicemsg.join('') + '\n잔여 포인트:' + userinfo[room][sender][9] + '원');
      } else { // 지역보다 포인트이 유저가 더 있는지 체크한다.{
        replier.reply('[' + sender + '] 님 포인트 부족. \n현재 포인트: ' + userinfo[room][sender][9] + '원\n\n다음 출석을 노리세요.');
        return;
      } //만약 리스트에 이름이 없는 경우
    }
  }
}

   if(msg.slice(0, 7) == "!포인트추가 ") {
      let t = 0;
      let tp = 0;
      if(admin.includes(sender)) {
         
      if(!msg.replace("/", "").includes("/") && msg.includes("/")) {
         t = msg.slice(7).split("/")[0];
         tp = Number(msg.split("/")[1]);
         modifypoint(room, t, tp)
         replier.reply('[' + t + '] 님 포인트 '+tp+'원 추가\n소지 포인트:'+ userinfo[room][t][9]+'원');
      }
      else {
         replier.reply("잘못된 입력입니다.\n아이디: "+t+'\n포인트: '+tp);
      }
      }
      else{
      replier.reply('권한이 없어 거부되었습니다.');
         return;
      }
   }

   if(msg.slice(0, 6) == "!마일추가 ") {
      let t = 0;
      let tp = 0;
      if(admin.includes(sender)) {
         if(!msg.replace("/", "").includes("/") && msg.includes("/")) {
            t = msg.slice(6).split("/")[0];
            tp = Number(msg.split("/")[1]);
            modifymileage(room, t, tp)
            replier.reply('[' + t + '] 님 마일 '+tp+'마일 추가\n소지 마일:'+ userinfo[room][t][8]+'마일');
         }
         else {
            replier.reply("잘못된 입력입니다.\n아이디: "+t+'\n마일: '+tp);
         }
      }
      else{
         replier.reply('권한이 없어 거부되었습니다.');
         return;
      }
   }
   
   if(msg.slice(0, 6) == "!권한추가 ") {  //!권한추가 아이디/숫자 (눈치 [0],랭커[1],초성[2])
      let t = 0;
      let tp = 0;
      if(sender != sadmin) {
         replier.reply('권한이 없어 거부되었습니다.');
         return;
      }
      if(!msg.replace("/", "").includes("/") && msg.includes("/")) {
         t = msg.slice(6).split("/")[0];
         tp = msg.split("/")[1];
         useritem[room][t][tp] = useritem[room][t][tp]+1;
         fs.write(vipi, JSON.stringify(useritem, null, 4));
         replier.reply('[' + t + '] 님 '+tp+'권한 추가');
      }
      else {
         replier.reply("잘못된 입력입니다.\n아이디: "+t);
      }
   }


   if(msg.startsWith('!포인트전체추가 ')) {
      if(admin.includes(sender)) {
      let searchcost = msg.substr(9);
      let costlist = [];
      for(let j in userinfo[room]) costlist.push(j);
      //replier.reply(costlist);
      for(let ik =0 ; ik < costlist.length; ik++){
         //replier.reply(costlist[ik]+': '+searchcost+'원 추가');
         modifypoint(room, costlist[ik], Number(searchcost))
      }
      replier.reply(room+ '내 인원'+costlist.length+'명\n전체 포인트 '+searchcost+'원 추가');
   }}

   if(msg == "!경험치순위") {
    let rankinglist = [];
    for(i in userinfo[room]) rankinglist.push(i + ' : ' + (userinfo[room][i][0]*1000+Math.round(userinfo[room][i][1])) + ' Exp');
    replier.reply('[' + room + '] 의 VIP 순위' + Lw + '\n\n' + rankinglist.sort((a, b) => b.split(' : ')[1].split(' Exp')[0] - a.split(' : ')[1].split(' Exp')[0]).map(e => (rankinglist.indexOf(e) + 1) + '위ㅣ' + e).join('\n'));
 }
   if(msg == "!탕진순위") {
    let rankinglist = [];
    for(i in userinfo[room]) rankinglist.push(i + ' : ' + (userinfo[room][i][7]) + '회');
    replier.reply('[' + room + '] 의 마일여행 탕진 순위' + Lw + '\n\n' + rankinglist.sort((a, b) => b.split(' : ')[1].split('회')[0] - a.split(' : ')[1].split('회')[0]).map(e => (rankinglist.indexOf(e) + 1) + '위ㅣ' + e).join('\n'));
 }
 if(msg == "!마일순위") {
    let rankinglist = [];
    for(i in userinfo[room]) rankinglist.push(i + ' : ' + (userinfo[room][i][8]) + ' Mileage');
    replier.reply('[' + room + '] 의 마일리지 순위' + Lw + '\n\n' + rankinglist.sort((a, b) => b.split(' : ')[1].split(' Mileage')[0] - a.split(' : ')[1].split(' Mileage')[0]).map(e => (rankinglist.indexOf(e) + 1) + '위ㅣ' + e).join('\n'));
 }
   if(msg == "!포인트순위") {
    let costlist = [];
    for(i in userinfo[room]) costlist.push(i + ' : ' + (userinfo[room][i][9]) + '원');
    replier.reply('[' + room + '] 의 포인트 순위' + Lw + '\n' + costlist.sort((a, b) => b.split(' : ')[1].split('원')[0] - a.split(' : ')[1].split('원')[0]).map(e => (costlist.indexOf(e) + 1) + '위ㅣ' + e).join('\n'));
    }
   if(msg == "!배우순위") {
      let costlist = [];
      for(i in actoritem[room]) costlist.push(i + ' : ' + (actoritem[room][i].length) + '명');
      replier.reply('[' + room + '] 의 획득배우 순위' + Lw + '\n' + costlist.sort((a, b) => b.split(' : ')[1].split('명')[0] - a.split(' : ')[1].split('명')[0]).map(e => (costlist.indexOf(e) + 1) + '위ㅣ' + e).join('\n'));
   }
   if(msg == "!보겜순위") {
      let costlist = [];
      for(i in actoritem[room]) costlist.push(i + ' : ' + (actoritem[room][i].length) + '개');
      replier.reply('[' + room + '] 의 보드게임 순위' + Lw + '\n' + costlist.sort((a, b) => b.split(' : ')[1].split('개')[0] - a.split(' : ')[1].split('개')[0]).map(e => (costlist.indexOf(e) + 1) + '위ㅣ' + e).join('\n'));
   }
  if(msg == "!티어순위") {
      let costlist = [];
      for(i in useritem[room]){
       if(useritem[room][i][5] > 0){
         costlist.push(i + ' : ' + (useritem[room][i][5]) + '티어');
      }}
      replier.reply('[' + room + '] 의 티어 순위' + Lw + '\n' + costlist.sort((a, b) => b.split(' : ')[1].split('티어')[0] - a.split(' : ')[1].split('티어')[0]).map(e => (costlist.indexOf(e) + 1) + '위ㅣ' + e).join('\n'));
   }
      if(msg == "!촬영순위") {
      let costlist = [];
      for(i in useritem[room]) costlist.push(i + ' : ' + (useritem[room][i][6]) + '회');
      replier.reply('[' + room + '] 의 촬영 순위' + Lw + '\n' + costlist.sort((a, b) => b.split(' : ')[1].split('회')[0] - a.split(' : ')[1].split('회')[0]).map(e => (costlist.indexOf(e) + 1) + '위ㅣ' + e).join('\n'));
   }
   
   if(msg == "!사망순위") {
      let rankinglist = [];
      for(i in usepoint[room]) rankinglist.push(i + ' : ' + usepoint[room][i] + '회');
      replier.reply('[' + room + '] 의 1:1 탕탕 순위' + Lw + '\n\n' + rankinglist.sort((a, b) => b.split(' : ')[1].split('회')[0] - a.split(' : ')[1].split('회')[0]).map(e => (rankinglist.indexOf(e) + 1) + '위ㅣ' + e).join('\n'));
   }

   if(msg == "!요리순위") {
      let rankinglist = [];
      for(i in useritem[room]) rankinglist.push(i + ' : ' + useritem[room][i][12] + '회');
      replier.reply('[' + room + '] 의 요리 순위' + Lw + '\n\n' + rankinglist.sort((a, b) => b.split(' : ')[1].split('회')[0] - a.split(' : ')[1].split('회')[0]).map(e => (rankinglist.indexOf(e) + 1) + '위ㅣ' + e).join('\n'));
   }


   if(msg == "!내정보") {
      createUserAccount(room, sender);
      if(room == '사계') {
         let myinfo = [];
         let sgattend = 0;
         let sgyabawi = 0;
         if(jsonattend['list'][room].includes(sender).valueOf()) {
            sgattend = 1;
         }
         if(votelist['list'][room].includes(sender).valueOf()) {
            sgyabawi = 1;
         }
         myinfo.push('☆[' + sender + '] 정보☆\n보유 마일: ' + userinfo[room][sender][8] + ' Mileage\n보유 포인트: ' + userinfo[room][sender][9] + '원\n----------------\nVIP 레벨: ' + userinfo[room][sender][0] + '레벨\nVIP 경험치: ' + Math.round(userinfo[room][sender][1]) + 'exp\n보유 마일여행권: ' + userinfo[room][sender][2] + '장\n----------------\n탕진 횟수: ' + userinfo[room][sender][7] + '회\n초성 정답: ' + userinfo[room][sender][3] + '번\n눈치게임 참여: ' + userinfo[room][sender][4] + '번\n야바위 참여: ' + userinfo[room][sender][5] + '번\n찰싹 횟수: ' + userinfo[room][sender][6] + '\n요리 횟수: ' + useritem[room][sender][12]+'회');
         if(sgattend == 1) {
            myinfo.push('\n----------------\n출석 여부: 출석');
         } else {
            myinfo.push('\n----------------\n출석 여부: 미출석');
         }
         if(sgyabawi == 1) {
            myinfo.push('\n금일 야바위: 참석');
         } else {
            myinfo.push('\n금일 야바위: 미참석');
         }
         myinfo.push('\n----------------\n보유권한\n'+'눈치(20k): '+useritem[room][sender][0]+'\n랭커(15k): '+useritem[room][sender][1]+'\n초성(10k) '+useritem[room][sender][2]);
         //myinfo.push('\n슬롯갯수: '+useritem[room][sender][8]);
         if(useritem[room][sender][5] > 0){
         myinfo.push('\n----------------\n영화관련\n'+'티어: '+arrivaldata['tier'][useritem[room][sender][5]]['name']);
         myinfo.push('\n기대치: '+ggidae[useritem[room][sender][4]]);
         myinfo.push('\n각색 효과: '+gaksaeklist[useritem[room][sender][9]]);
         myinfo.push('\n촬영횟수: '+useritem[room][sender][6]);
         myinfo.push('\n초대박횟수: '+useritem[room][sender][7]);
         }
         myinfo.push('\n한정캐스팅: '+useritem[room][sender][10]);
         myinfo.push('\n글자교환권: '+useritem[room][sender][11]);
         if(actoritem[room][sender] != undefined){
            myinfo.push('\n추가 포인트: '+useritem[room][sender][3]+'원');
         }
         replier.reply(myinfo.join(''));
         return;
      } else {
         replier.reply('[' + sender + '] 정보\n보유 마일: ' + userinfo[room][sender][8] + ' Mileage\n보유 포인트: ' + userinfo[room][sender][9] + '원\nVIP 레벨: ' + userinfo[room][sender][0] + '레벨\nVIP 경험치: ' + Math.round(userinfo[room][sender][1]) + 'exp\n보유 마일여행권: ' + userinfo[room][sender][2] + '장\n탕진 횟수: ' + userinfo[room][sender][7] + '회\n야바위 참여: ' + userinfo[room][sender][5] + '번\n보겜 포인트: '+useritem[room][sender][3]+'원' + '\n요리 횟수: ' + useritem[room][sender][12]+'회');
          return;
      }
   }

   if(msg == '!마일여행') {
      createUserAccount(room, sender);
      if(userinfo[room][sender][8] >= 6000 || userinfo[room][sender][2] >= 1) {
         sumitemname = []; // 현재 아이템 리스트를 담을 배열
         for(let i = 0; i < arrivaldata['milege'].length; i++) {
            sumitemname.push(arrivaldata['milege'][i]['Arrival']);
         }
         mileageticketname = sumitemname[generateScore(sumitemname.length,0)]; //현재 갈 수 있는 나라중 한개의 아이템을 뽑아라
         var s = generateScore(10000,1); //퍼스트 비지니스 이코노미
         if(0 < [s] && [s] <= 9000) {
            itemcnt = 'Economy';
            itemcntnum = 1;
         } else if(9000 < [s] && [s] <= 9700) {
            itemcnt = 'Business';
            itemcntnum = 1.2;
         } else if(9700 < [s] && [s] <= 9950) {
            itemcnt = 'First';
            itemcntnum = 1.5;
         } else if(9950 < [s] && [s] <= 10000) {
            itemcnt = '전용기';
            itemcntnum = 3;
         } else if(9995 < [s] && [s] <= 10000) {
            itemcnt = '초야니니 무등 위';
            itemcntnum = 1;
         }
         choicemsg = [];
         for(let i = 0; i < arrivaldata['milege'].length; i++) {
            if(mileageticketname == arrivaldata['milege'][i]['Arrival']) {
               let grademile = +arrivaldata['milege'][i]['Mileage'] * itemcntnum;
               let grademiles = Math.floor(grademile*1.25);
               choicemsg.push("Departure(🛫): 인천\nArrival(🛬): " + arrivaldata['milege'][i]['Arrival'] + "\nMileage: " + grademiles);

               if(userinfo[room][sender][2] >= 1) {
                  userinfo[room][sender][2] = userinfo[room][sender][2] - 1;
                  fs.write(vips, JSON.stringify(userinfo, null, 4));
               } else {
                  modifymileage(room, sender, -6000);
               }
               modifymileage(room, sender, grademiles);
            }
         }
         replier.reply('[' + sender + '] 마일리지티켓 결과\nGrade: ' + itemcnt + '\n' + choicemsg + '\n현재 마일리지: ' + userinfo[room][sender][8] + 'Milege');
         userinfo[room][sender][7] = userinfo[room][sender][7] + 1;
         fs.write(vips, JSON.stringify(userinfo, null, 4));
      } else { // 지역보다 포인트이 유저가 더 있는지 체크한다.{
         if(room == '사계') {
            replier.reply('[' + sender + '] 님 마일리지 거지\n현재 마일리지: ' + userinfo[room][sender][8] + 'Milege\n\n' + fs.read(msay));
            return;
         } else {
            replier.reply('[' + sender + '] 님 마일리지 거지\n현재 마일리지: ' + userinfo[room][sender][8] + 'Milege\n\n');
            return;
         }
      } //만약 리스트에 이름이 없는 경우               
   }

   if(msg == "!마일비용")  {
      replier.reply('[마일 비용]\n아시아:2000\n오세아니아:4000\n중동:5000\n유럽:5500\n아프리카:6000\n미주:8000\n중남미:10000');
   }
   if(room == '사계' && count >= 400 && timer == 0) {
      timer = 1;
   }



if (timer == 1 || msg == '!초성') {
  count = 0;
  let resultMessage = [];

  if (timer !== 1) {
    if (useritem[room][sender][2] >= 1) {
      useritem[room][sender][2]--;
      fs.write(vipi, JSON.stringify(useritem, null, 4));
      resultMessage.push(sender + "님의 잔여 초성 권한: " + useritem[room][sender][2] + "번\n");
    } else {
      return;
    }
  }

  let s = Math.floor(Math.random() * 4);  // 문제유형 0~3 랜덤 결정

  if (s === 1 || s === 2) {  // 🎯 영화 문제
    word[room] = 0;
    let words = [];
    for (let i = 0; i < data['cinema'].length; i++) {
      let wawa = data['moviename'][i]['name'];
      words.push(wawa);
    }
    word[room] = words[generateScore(words.length, 0)];

    if (s === 1) {  // 내용 퀴즈
      let searchid = word[room];
      if (data['errorMessage'] != undefined) return replier.reply('에러발생: ' + data['errorMessage']);

      let cinemaid = null;
      for (let j = 0; j < data['moviename'].length; j++) {
        if (data['moviename'][j]['name'] === searchid) {
          cinemaid = Number(data['moviename'][j]['picid']);
          break;
        }
      }
      replier.reply('테스티스트', 'cinemaid: ' + cinemaid+"\nword: " + word[room]+"\nserachid: " + searchid);

      for (let k = 0; k < data['cinema'].length; k++) {
        if (data['cinema'][k]['picid'] == cinemaid) {
          resultMessage.push('[🎞 영화 내용 퀴즈]\n글자수: ' + word[room].length + '개 (띄어쓰기 포함)\n내용: ' + data['cinema'][k]['content'] + '\n\n정답 예시: !정답 영화제목');
        }
      }
    }
    if (cinemaid === null) {
      s = 2;  // 또는 바로 초성 퀴즈 함수로 이동
   }

    if (s === 2) {  // 초성 퀴즈
      resultMessage.push('[🎞 영화 제목 초성 퀴즈]\n초성: ' + getFirstChar(word[room]) + '\n\n정답 예시: !정답 영화제목');
      replier.reply('테스티스트', '초성정답: ' + word[room]);
    }
  }

  if (s === 3) {  // 🎯 스킬 퀴즈
    word[room] = 0;
    let words = [];
    for (let i = 0; i < data['스킬리스트'].length; i++) {
      let wawa = data['스킬리스트'][i]['이름'];
      words.push(wawa);
    }
    word[room] = words[generateScore(words.length, 0)];

    let skilldesc = null;
    for (let j = 0; j < data['스킬리스트'].length; j++) {
      if (data['스킬리스트'][j]['이름'] === word[room]) {
        skilldesc = data['스킬리스트'][j]['설명'];
        break;
      }
    }
replier.reply('테스티스트', '스킬정답: ' + word[room]);
    resultMessage.push('[🎯 배우 스킬 퀴즈]\n설명: ' + skilldesc + '\n\n정답 예시: !정답 스킬이름');
  }

  if (s === 0) {  // 🎯 배우 퀴즈
    actorquiz[room] = 0;
    let quiz_actor = [];

    let i = generateScore(data['allactor'].length, 0);  // ✅ 핵심 수정 (배열 감싸지 않음)
    actorquiz[room] = data['allactor'][i]['name'];

    if (data['errorMessage'] != undefined) return replier.reply('에러발생: ' + data['errorMessage']);

    quiz_actor.push('[🎬 배우 퀴즈]\n');
    quiz_actor.push('배우 이름은?\n');
    quiz_actor.push('★ 등급: ' + data['allactor'][i]['star'] + '성\n');
    quiz_actor.push('📊 스탯: ' + data['allactor'][i]['stat'] + '\n');

    for (let sidx = 1; sidx <= 6; sidx++) {
      let skillKey = 'skill' + sidx;
      if (data['allactor'][i][skillKey] !== undefined) {
        quiz_actor.push('스킬' + sidx + ': ' + data['allactor'][i][skillKey] + '\n');
      }
    }
    quiz_actor.push('\n정답 예시: !정답 배우이름');
    resultMessage.push(quiz_actor.join(''));
  }

  timer = 2;
  replier.reply(resultMessage.join(''));
}


      if(msg.startsWith('!정답') && timer == 2) {
      if(actorquiz[room] != undefined){
         if(actorquiz[room] == msg.substr(4)) {
            let s  =  generateScore(1700,300);
            timer = 0;
            try{
               let link = 'https://raw.githubusercontent.com/jyh1203/nomad/main/actor/'+actorquiz[room]+'.JPG';   
               let result = molyaApi(link, "정답!!", sender + '님 ' + s + '원 추가('+ (userinfo[room][sender][9] +s)+ ')원');
               let data = JSON.parse(result).data;
               replier.reply(data.viewUrl);
               modifypoint(room, sender, s)
               //replier.reply('정답입니다!\n' + sender + '님 ' + s + '원 추가\n소지 포인트: '+ userinfo[room][sender][9] + '원');
               userinfo[room][sender][3] = userinfo[room][sender][3] + 1;
               fs.write(vips, JSON.stringify(userinfo, null, 4));
            delete actorquiz[room];
            count = 0;
            }
            catch(err){
               //replier.reply(err);
               modifypoint(room, sender, s)
               replier.reply('정답입니다!\n' + sender + '님 ' + s + '원 추가\n소지 포인트: '+ userinfo[room][sender][9] + '원');
               userinfo[room][sender][3] = userinfo[room][sender][3] + 1;
               fs.write(vips, JSON.stringify(userinfo, null, 4));
               count = 0;
               delete actorquiz[room];
            }
         }
         else if(actorquiz[room] != null) {
            replier.reply(sender + '님 탈락');
         }
      }
      else if(word[room] == msg.substr(4)) {
         let s  =  generateScore(1700, 300);
         timer = 0;
            modifypoint(room, sender, s)
            replier.reply('정답입니다!\n' + sender + '님 ' + s + '원 추가\n소지 포인트: '+ userinfo[room][sender][9] + '원');
            userinfo[room][sender][3] = userinfo[room][sender][3] + 1;
            fs.write(vips, JSON.stringify(userinfo, null, 4));
            delete word[room];
            timer = 0;
            count = 0;
            cinemaid = 0;
      } 
      else if(word[room] != null) {
         replier.reply([sender + '님 바보예요? 이 정답도 모르다니..', "에휴... 답이 없다 답이 없엉.", "시부라이프 1일차인가요? 틀렸어요", "땡이라고 말하기도 시간이 아깝군영!", "땡때래땡땡 땡!!!", " 딩동 땡!!!!", "정답을 말하기 전에 생각이라는 것을 좀..", "머리는 장식인가요? 장식이 참 화려하고 볼품없네요.", "동네 바보형 인증", "你真笨啊!", "你有没有脑袋。", "초성을 읽어보긴 한거예요? 이런 조합은 정말 아닌 것 같아요.", "일찌감치 정답과 돈은 포기하겠다 이거네요?", "정말 이렇게 가는거예요? 사람들이 바보라고 생각할 것 같아요…", "봇에게 물어뜯길지도 모르겠네요. 하지만 희망이 없는 것도 아니니 계속 화이팅해요!", "괜찮은 선택이지만 땡!!! 적어도 구스님은 이런 스타일을 좋아할것 같아요.", "와 이런 발상이라니! 이정도면 수상 가능성도 있는 것 같아요! 아차상", "비록 최선의 선택은 아니지만 좋아보여요. 협회에서도 좋아했으면 좋겠네요!", "이렇게 보면 말이 되긴하는데 최선의 선택인지는 모르겠어요", "tonto"][generateScore(20,0)]);
      }
   }

   if(msg.startsWith("!관리자추가 ")) {
      if(sadmin.indexOf(sender) != -1) {
         var plus = msg.substring(7);
         admin.push(plus);
         replier.reply(plus + "님을 관리자 순위에 추가시켰습니다");
      } else {
         replier.reply(sender + "님은 관리자 권한이 없습니다");
      }
   }
   if(msg.startsWith("!관리자삭제 ")) {
      if(sadmin.indexOf(sender) != -1) {
         var plus = msg.substring(7);
         admin.pop(plus);
         replier.reply(plus + "님을 관리자 순위에서 삭제시켰습니다");
      } else {
         replier.reply(sender + "님은 관리자 권한이 없습니다");
      }
   }
   //눈치게임을 정오와 자정에 시작함. 랜덤 숫자이며 해당 숫자 입력부터 -1씩 깎아서 써야 함.
   //중복 쓰면 즉시 종료
   //순서대로 쓰면 숫자 X 100원만큼 추가 지급
      if(gameStarted == false && msg == "!눈치"){     
         luckyperson = generateScore(jsonattend['list']['사계'].length,0);
         luckyperson = jsonattend['list']['사계'][luckyperson];
        //replier.reply(luckyperson);
        //luckyperson = '간지용';
      if(room == "테스티스트") {
         replier.reply("사계" ,"눈치게임 시작!\n한사람씩 " + counter + "부터 시작해서 -1씩 차감하여 순차입력.\n중복 숫자, 다른 텍스트가 나오는 경우 혹은 중복 참가시 눈치게임 즉시 종료\n\n행운의 참가자: "+luckyperson);
      }
      else if(useritem[room][sender][0] >= 1){
         useritem[room][sender][0]--;
         fs.write(vipi, JSON.stringify(useritem, null, 4));
         replier.reply("사계",sender+"(잔여 눈치 권한: "+useritem[room][sender][0]+")님이 시작하는 눈치게임 시작!\n한사람씩 " + counter + "부터 시작해서 -1씩 차감하여 순차입력.\n중복 숫자, 다른 텍스트가 나오는 경우 혹은 중복 참가시 눈치게임 즉시 종료\n\n행운의 참가자: "+luckyperson);
      }
      else{return;}
      
      gameStarted = true;         
      java.lang.Thread.sleep(timeover * 1000);
      if(counter < 10) {
         replier.reply('사계', '제한시간 끝!');
         winnerlist.push("눈치게임 보상자 명단\n\n");
         if(participants.includes(luckyperson).valueOf()) {
            replier.reply('행운의 참가자 참석 확인');
         }
         for(let i = 0; i < participants.length; i++) {
            userinfo['사계'][participants[i]][9] = userinfo['사계'][participants[i]][9] + ((participants.length - i) * 100);
            winnerlist.push(participants[i] + ": " + (participants.length - i) * 100 + "원\n");
         }
         replier.reply('사계', winnerlist.join(''));
         fs.write(vips, JSON.stringify(userinfo, null, 4));
         winnerlist = [];
         countStarted = 0;
         participants = [];
         luckyperson = "0";
         counter = 10;
         prevCounter = null;
         gameStarted = false;
      }
   }
   if(msg == counter && gameStarted == true && room == "사계") {
      if(participants.indexOf(sender) == -1) {
         participants.push(sender);
         if(userinfo[room] == undefined) {
            userinfo[room] = {};
         }
         if(userinfo[room][sender] == undefined) {
            userinfo[room][sender] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
         }
         userinfo[room][sender][4] = userinfo[room][sender][4] + 1;
         fs.write(vips, JSON.stringify(userinfo, null, 4));
         //replier.reply("성공: "+ participants[0]+"의 돈은 "+userinfo[room][participants[0]][9]);
         prevCounter = counter;
         counter = counter - 1;
         gameStarted = true;
         countStarted = 0;
      } else {
         replier.reply(sender + "님 이미 참가했잖아요!\n보상 명단에서 삭제하고 게임 종료.");
         participants.pop(sender);
         winnerlist.push("눈치게임 보상자 명단\n\n");
         if(participants.length > 0) {
            for(let i = 0; i < participants.length; i++) {
                userinfo['사계'][participants[i]][9] = userinfo['사계'][participants[i]][9] + ((participants.length - i) * 100);
               winnerlist.push(participants[i] + ": " + (participants.length - i) * 100 + "원\n");
            }
            replier.reply('사계', winnerlist.join(''));
            fs.write(vips, JSON.stringify(userinfo, null, 4));
            winnerlist = [];
            participants = [];
            luckyperson = "0";
            counter = 10;
            prevCounter = null;
            gameStarted = false;
         }
      }
   } 
   else if(msg < counter && msg > 0 && gameStarted == true && room == "사계") {
      if(msg == prevCounter && gameStarted == true) {
         replier.reply("중복이다!!\n" + counter + "를 입력해야함.\n" + sender + "님 탈락!! 게임 종료");
         winnerlist.push("눈치게임 보상자 명단\n\n");
         for(let i = 0; i < participants.length; i++) {
            userinfo['사계'][participants[i]][9] = userinfo['사계'][participants[i]][9] + ((participants.length - i) * 100);
            winnerlist.push(participants[i] + ": " + (participants.length - i) * 100 + "원\n");
         }
         replier.reply('사계', winnerlist.join(''));
         fs.write(vips, JSON.stringify(userinfo, null, 4));
         winnerlist = [];
         participants = [];
         luckyperson = "0";
         counter = 10;
         prevCounter = null;
         gameStarted = false;
      } else {
         replier.reply(sender + "님 탈락!!\n너무 빨리 쓰셨어 숫자를.. 게임 종료");
         winnerlist.push("눈치게임 보상자 명단\n\n");
         for(let i = 0; i < participants.length; i++) {
            userinfo['사계'][participants[i]][9] = userinfo['사계'][participants[i]][9] + ((participants.length - i) * 100);
            winnerlist.push(participants[i] + ": " + (participants.length - i) * 100 + "원\n");
         }
         replier.reply('사계', winnerlist.join(''));
         fs.write(vips, JSON.stringify(userinfo, null, 4));
         winnerlist = [];
         participants = [];
         luckyperson = "0";
         counter = 10;
         prevCounter = null;
         gameStarted = false;
      }
   } 
   else if(msg > counter && gameStarted == true && room == "사계") {
      replier.reply(sender + "님 탈락\n 숫자 못세시나요? 게임종료");
      winnerlist.push("눈치게임 보상자 명단\n\n");
      for(let i = 0; i < participants.length; i++) {
        userinfo['사계'][participants[i]][9] = userinfo['사계'][participants[i]][9] + ((participants.length - i) * 100);
         winnerlist.push(participants[i] + ": " + (participants.length - i) * 100 + "원\n");
      }
      replier.reply('사계', winnerlist.join(''));
      fs.write(vips, JSON.stringify(userinfo, null, 4));
      winnerlist = [];
      participants = [];
      luckyperson = "0";
      counter = 10;
      prevCounter = null;
      gameStarted = false;
   } 
   else if(counter < 10 && msg != Number && gameStarted == true && room == "사계") {
      replier.reply(sender + "님 눈치가 없군요. 게임종료");
      /*if (participants.indexOf(sender) != -1){
        participants.pop(sender);
        replier.reply(participants.length+' persona');
      }*/
      winnerlist.push("눈치게임 보상자 명단\n\n");
      for(let i = 0; i < participants.length; i++) {
        userinfo['사계'][participants[i]][9] = userinfo['사계'][participants[i]][9] + ((participants.length - i) * 100);
         winnerlist.push(participants[i] + ": " + (participants.length - i) * 100 + "원\n");
      }
      replier.reply('사계', winnerlist.join(''));
      fs.write(vips, JSON.stringify(userinfo, null, 4));
      winnerlist = [];
      participants = [];
      luckyperson = "0";
      counter = 10;
      prevCounter = null;
      gameStarted = false;
   }
   if(counter == 0 && room == "사계") {
      replier.reply("성공 !! 축하합니다\n게임 종료 정산합니다.");
      let winnerlist = [];
      winnerlist.push("눈치게임 보상자 명단\n\n");
      if(participants.includes(luckyperson).valueOf()) {
         for(let i = 0; i < participants.length; i++) {
            userinfo['사계'][participants[i]][9] = userinfo['사계'][participants[i]][9] + ((participants.length - i) * 500);
            winnerlist.push(participants[i] + ": " + (participants.length - i) * 500 + "원\n");
         }
       
            replier.reply('행운의 참가자 참석 확인');
         
      }
      else{
         for(let i = 0; i < participants.length; i++) {
            userinfo['사계'][participants[i]][9] = userinfo['사계'][participants[i]][9] + ((participants.length - i) * 300);
            winnerlist.push(participants[i] + ": " + (participants.length - i) * 300 + "원\n");
         }        
      }
      replier.reply('사계', winnerlist.join(''));
      fs.write(vips, JSON.stringify(userinfo, null, 4));
      winnerlist = [];
      participants = [];
      luckyperson = "0";
      counter = 10;
      prevCounter = null;
      gameStarted = false;
   }


   //눈치게임을 정오와 자정에 시작함. 랜덤 숫자이며 해당 숫자 입력부터 -1씩 깎아서 써야 함.
   //중복 쓰면 즉시 종료
   //순서대로 쓰면 숫자 X 100원만큼 추가 지급
   if(gameStartedd == false && msg == "!더블눈치"){
      if(useritem[room][sender][0] >= 2){
         useritem[room][sender][0] = useritem[room][sender][0]- 2;
         fs.write(vipi, JSON.stringify(useritem, null, 4));
         replier.reply("사계",sender+"(잔여 눈치 권한: "+useritem[room][sender][0]+")님이 시작하는 더블 눈치게임 시작!\n한사람씩 " + counterd + "부터 시작해서 -2씩 차감하여 순차입력.\n중복 숫자, 다른 텍스트가 나오는 경우 혹은 중복 참가시 눈치게임 즉시 종료");
      }
      else{
         return;
      }      
      gameStartedd = true;         
      java.lang.Thread.sleep(timeover * 1000);
      if(counterd < 20) {
         replier.reply('사계', '제한시간 끝!');
         winnerlist.push("더블 눈치게임 보상자 명단\n\n");
         for(let i = 0; i < participants.length; i++) {
               userinfo['사계'][participants[i]][9] = userinfo['사계'][participants[i]][9] + ((participants.length - i) * 200);
            winnerlist.push(participants[i] + ": " + (participants.length - i) * 200 + "원\n");
         }
         replier.reply('사계', winnerlist.join(''));
         fs.write(vips, JSON.stringify(userinfo, null, 4));
         winnerlist = [];
         countStarted = 0;
         participants = [];
         counterd = 20;
         prevCounter = null;
         gameStartedd = false;
      }
   }

   if(msg == counterd && gameStartedd == true && room == "사계") {
      if(participants.indexOf(sender) == -1) {
         participants.push(sender);
         if(userinfo[room] == undefined) {
            userinfo[room] = {};
         }
         if(userinfo[room][sender] == undefined) {
            userinfo[room][sender] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
         }
         userinfo[room][sender][4] = userinfo[room][sender][4] + 1;
         fs.write(vips, JSON.stringify(userinfo, null, 4));
         //replier.reply("성공: "+ participants[0]+"의 돈은 "+userinfo[room][participants[0]][9]);
         prevCounter = counterd;
         counterd = counterd - 2;
         //gameStartedd = true;
         countStarted = 0;
      } 
      else {
         replier.reply(sender + "님 이미 참가했잖아요!\n 게임 종료.");
         participants.pop(sender);
         winnerlist.push("더블 눈치게임 보상자 명단\n\n");
         if(participants.length > 0) {
            for(let i = 0; i < participants.length; i++) {
                userinfo['사계'][participants[i]][9] = userinfo['사계'][participants[i]][9] + ((participants.length - i) * 200);
               winnerlist.push(participants[i] + ": " + (participants.length - i) * 200 + "원\n");
            }
            replier.reply('사계', winnerlist.join(''));
            fs.write(vips, JSON.stringify(userinfo, null, 4));
            winnerlist = [];
            participants = [];
            counterd = 20;
            prevCounter = null;
            gameStartedd = false;
         }
      }
   } 
   else if(msg < counterd && msg > 0 && gameStartedd == true && room == "사계") {
      if(msg == prevCounter && gameStartedd == true) {
         replier.reply("중복이다!!\n" + counterd + "를 입력해야함.\n" + sender + "님 탈락!! 게임 종료");
         winnerlist.push("더블 눈치게임 보상자 명단\n\n");
         for(let i = 0; i < participants.length; i++) {
            userinfo['사계'][participants[i]][9] = userinfo['사계'][participants[i]][9] + ((participants.length - i) * 200);
            winnerlist.push(participants[i] + ": " + (participants.length - i) * 200 + "원\n");
         }
         replier.reply('사계', winnerlist.join(''));
         fs.write(vips, JSON.stringify(userinfo, null, 4));
         winnerlist = [];
         participants = [];
         counterd = 20;
         prevCounter = null;
         gameStartedd = false;
      } else {
         replier.reply(sender + "님 탈락!!\n너무 빨리 쓰셨어 숫자를.. 게임 종료");
         winnerlist.push("더블 눈치게임 보상자 명단\n\n");
         for(let i = 0; i < participants.length; i++) {
            userinfo['사계'][participants[i]][9] = userinfo['사계'][participants[i]][9] + ((participants.length - i) * 200);
            winnerlist.push(participants[i] + ": " + (participants.length - i) * 200 + "원\n");
         }
         replier.reply('사계', winnerlist.join(''));
         fs.write(vips, JSON.stringify(userinfo, null, 4));
         winnerlist = [];
         participants = [];
         counterd = 20;
         prevCounter = null;
         gameStartedd = false;
      }
   } 
   else if(msg > counterd && gameStartedd == true && room == "사계") {
      replier.reply(sender + "님 탈락\n 숫자 못세시나요? 게임종료"+msg+gameStartedd+room);
      winnerlist.push("더블 눈치게임 보상자 명단\n\n");
      for(let i = 0; i < participants.length; i++) {
        userinfo['사계'][participants[i]][9] = userinfo['사계'][participants[i]][9] + ((participants.length - i) * 200);
         winnerlist.push(participants[i] + ": " + (participants.length - i) * 200 + "원\n");
      }
      replier.reply('사계', winnerlist.join(''));
      fs.write(vips, JSON.stringify(userinfo, null, 4));
      winnerlist = [];
      participants = [];
      counterd = 20;
      prevCounter = null;
      gameStartedd = false;
   } 
   else if(counterd < 20 && msg != Number && gameStartedd == true && room == "사계") {
      replier.reply(sender + "님 눈치가 없군요. 게임종료");
      /*if (participants.indexOf(sender) != -1){
        participants.pop(sender);
        replier.reply(participants.length+' persona');
      }*/
      winnerlist.push("더블 눈치게임 보상자 명단\n\n");
      for(let i = 0; i < participants.length; i++) {
        userinfo['사계'][participants[i]][9] = userinfo['사계'][participants[i]][9] + ((participants.length - i) * 200);
         winnerlist.push(participants[i] + ": " + (participants.length - i) * 200 + "원\n");
      }
      replier.reply('사계', winnerlist.join(''));
      fs.write(vips, JSON.stringify(userinfo, null, 4));
      winnerlist = [];
      participants = [];
      counterd = 20;
      prevCounter = null;
      gameStartedd = false;
   }
   if(counterd == 0 && room == "사계") {
      replier.reply("성공 !! 축하합니다\n게임 종료 정산합니다.");
      let winnerlist = [];
      winnerlist.push("더블 눈치게임 보상자 명단\n\n");
      for(let i = 0; i < participants.length; i++) {
        userinfo['사계'][participants[i]][9] = userinfo['사계'][participants[i]][9] + ((participants.length - i) * 900);
         winnerlist.push(participants[i] + ": " + (participants.length - i) * 900 + "원\n");
      }
      replier.reply('사계', winnerlist.join(''));
      fs.write(vips, JSON.stringify(userinfo, null, 4));
      winnerlist = [];
      participants = [];
      counterd = 20;
      prevCounter = null;
      gameStartedd = false;
   }

  
   if(msg.indexOf("이제 합작하러 가볼까") != -1) {
      let room3 = ["신전", "사계"];
      let resultMessage = [];
      yoil = new Date().getDay();
      yabawidon['week'] = yoil;
      for(let ri = 0; ri < room3.length; ri++){
         resultMessage.push("\n\n["+ room3[ri] +" 포인트 정보]");
         resultMessage.push("\n포인트 획득: "+ yabawidon[room3[ri]]['addpoint']);
         resultMessage.push("\n포인트 소모: "+ yabawidon[room3[ri]]['usepoint']);
         yabawidon[room3[ri]]['addpoint'] = 0;
         yabawidon[room3[ri]]['usepoint'] = 0;         
      }
      replier.reply("테스티스트2", resultMessage.join(''));
      fs.write(ydon, JSON.stringify(yabawidon, null, 4));      
   }

   
   //당첨자수 1명 그리고 하루에 한번 쿨타임, 참여비는 매일 랜덤으로 바뀌고 수수료 40%를 제하고 드림
   //참여비는 최소 100에서 최대 2000 설정
   if(msg == "!야바위시작" || msg.indexOf("이제 합작하러 가볼까") != -1) {
      if(admin.includes(sender)) {
         if(yabawidon[room] == undefined) {
            yabawidon[room] = {};
         }
         if(yabawidon[room]['score'] == undefined) {
            yabawidon[room]['score'] = 0;
         }
         
         let lpoint;
         lpoint = generateScore(2000, 1000);
         yabawidon[room]['score'] = lpoint
         replier.reply("오늘의 야바위 참여 포인트는 " + lpoint + "원입니다.\n수수료를 제외하고 1인 몰빵입니다.")
         fs.write(ydon, JSON.stringify(yabawidon, null, 4));
         return;
      }
   }
   if(msg == "!야바위참여") {
      if(yabawidon[room]['score'] != 0) {
         if(votelist['list'][room] == undefined) votelist['list'][room] = [];
         //if(userinfo[room][sender][9] < 1){return;}
         if(votelist['list'][room].includes(sender).valueOf()) { //이미 리스트에 있는지 확인한다.
            replier.reply(sender + "님 중첩 참여 진행합니다.");
         }
        
         if(userinfo[room][sender][9] >= yabawidon[room]['score']) { // 포인트이 유저가 더 있는지 체크한다.         
            if(votelist['list'][room] == undefined) votelist['list'][room] = [];
            fs.write(ymember, JSON.stringify(votelist, null, 4));
            modifypoint(room, sender, -yabawidon[room]['score'])
            votelist['list'][room].push(sender);
            replier.reply(sender + "님 " + votelist['list'][room].length + "번째 참여 완료\n남은 포인트: " + userinfo[room][sender][9] + "원\n당첨 누적 포인트: " + Number((votelist['list'][room].length * Number(yabawidon[room]['score']) * 0.7).toFixed()));
            // replier.reply('s: '+votelist['list'][room].length+'$$'+Number(yabawidon[room]['score']));
            fs.write(ymember, JSON.stringify(votelist, null, 4));
            userinfo[room][sender][5] = userinfo[room][sender][5] + 1;
            fs.write(vips, JSON.stringify(userinfo, null, 4));
            return;
         } else {
            replier.reply(sender + " = 거지\n포인트: " + userinfo[room][sender][9] + "\n필요포인트: " + yabawidon[room]['score']);
         }
      } else {
         replier.reply("참여시간 아니야 돼지야\n0시 시작, 22시 추첨이야");
      }
   }
    
   
   if(msg == "!야바위참여자") {
      replier.reply("[야바위 참여자 순위]" + Lw + '\n\n참여 포인트: ' + yabawidon[room]['score'] + '\n\n참여 횟수: ' + votelist['list'][room].length + '\n\n총 당첨 포인트: ' + Number((votelist['list'][room].length * Number(yabawidon[room]['score']) * 0.7).toFixed()) + '원\n\n*참여자 명단*\n' + votelist['list'][room].join('\n'));
   }
      
       
   if(msg == "!야바위추첨" || msg.indexOf("나랑 오스카 보러 가지 않을래") != -1) {
      if(admin.includes(sender)) {
         //replier.reply(votelist['list'][room].length);
         if(winnercount > votelist['list'][room].length) {
            replier.reply('참여자가 적어 추첨할 수 없습니다.\n참여자: ' + votelist['list'][room].length + '명\n당첨자: ' + winnercount + "명");
            return;
         }
         //replier.reply('su'+votelist['list'][room]);
         let victory = {};
         let lottowon = {};
         if(victory[room] == undefined) victory[room] = {};
         if(lottowon[room] == undefined) lottowon[room] = {};
         lottowon[room] = (votelist['list'][room].length * Number(yabawidon[room]['score']) * 0.7).toFixed();
         //replier.reply(room+"의 야바위 게임 전체 참여수: "+votelist['list'][room].length+"명\n당첨 포인트: "+lottowon[room]+"원");
         let rule = generateScore(votelist['list'][room].length,0);
         //replier.reply(rule);
         victory[room] = votelist['list'][room][rule];
         replier.reply("두구두구두구 추첨 완료");
         java.lang.Thread.sleep(3000);
         // replier.reply("참여자 및 당첨자 리스트를 초기화합니다.");
         modifypoint(room, victory[room], Number(lottowon[room]))
         replier.reply("🐷야바위 당첨자 축하합니다.🐷\n\n당첨자: " + victory[room] + '(현재 포인트(포인트 지급 완료):' + userinfo[room][victory[room]][9] + '원)\n\n총 참여 인원: ' + votelist['list'][room].length + '\n총 당첨 포인트: ' + lottowon[room]);
         victory[room] = {}; 
         votelist['list'][room] = []; 
         lottowon[room] = {}; 
         yabawidon[room]['score'] = 0; 
         fs.write(ymember, JSON.stringify(votelist, null, 4)); 
         fs.write(ydon, JSON.stringify(yabawidon, null, 4));
      } 
      else {
         replier.reply('권한이 없어!!');
         return;
      }
      
   }
   if(!ar[room]) ar[room] = {};
   if(msg.slice(0, 4) == "!지정 ") {
      if(userinfo[room][sender][9] >= 1000) {
         if(!msg.replace("/", "").includes("/") && msg.includes("/")) {
            var T = msg.slice(4).split("/")[0];
            if(!ar[room][T]) {
               ar[room][T] = msg.split("/")[1];
               modifypoint(room, sender, -1000)
               replier.reply('1000포인트 차감\n잔여 포인트: ' + userinfo[room][sender][9]+'원\n'+ T + "(이)라고 말하면 " + msg.split("/")[1] + "(이)라고 답할게요.\n자정까지 사용 가능하고 초기화");
               fs.write(ph, JSON.stringify(ar));
            } else {
               replier.reply("이미 존재함둥");
            }
         } else {
            replier.reply("잘못된 명령임둥");
         }
      } else {
         replier.reply('자네 돈많이 벌어야겠네 - 시네마봇')
      }
   }
   if(Object.keys(ar[room]).includes(msg)) {
      replier.reply(ar[room][msg]);
      //modifypoint('사계', '간지용', 1)
      let tcdel  = generateScore(25, 0);; // 가르치기 삭제 랜덤 함수
      if(tcdel == 0) {
         if(Object.keys(ar[room]).includes(msg)) delete ar[room][msg], replier.reply(msg + " 명령어가 삭제되었어요.");
         fs.write(ph, JSON.stringify(ar));
      }
   }
   
   if(msg == '!랭커' && useritem[room][sender][1] >= 1 || updownswitch == true && UDCount == 0) {
      if(useritem[room][sender][1] >= 1){
         useritem[room][sender][1]--;
         fs.write(vipi, JSON.stringify(useritem, null, 4));
         replier.reply(sender+"(잔여 랭커 권한: "+useritem[room][sender][1]+"번)");
      }
      replier.reply("업다운 시작!\n\n숫자는 최소100 ~ 최대1000 사이\n참여시 (남은 횟수X10) 포인트 소모\n10번의 기회동안 못맞추면 자동 종료\n맞추려면 !업다운 숫자");
      UDPoint = generateScore(900, 100);;
      UDCount = 10;
      updownswitch = true;
      //replier.reply('용현',UDPoint);
      
   }


   if (msg.startsWith("!업다운") && updownswitch == true) {
      if(userinfo[room][sender][9] >= 10){
         if(UDCount > 0) {
            var UDNum = msg.substring(4);
            modifypoint(room, sender, -10*UDCount)
            if (UDPoint == UDNum) {
               updownswitch = false;
               modifypoint(room, sender, UDPoint*UDCount)
               replier.reply(sender+'님 정답!\n'+UDPoint*UDCount+'원 획득\n소지금: '+userinfo[room][sender][9]+'원');
               //replier.reply('용현','ranker winner: '+sender);
               UDPoint = 0;
               rankerchat = 0;
               UDCount = 0;
            } 
            else if (UDPoint < UDNum) {
               replier.reply('입력자: '+sender+'님 '+(10*UDCount)+'포인트 차감\n소지금: '+userinfo[room][sender][9]+'원\n입력값: '+UDNum+'\n결과: DOWN\n남은횟수: '+UDCount+'회');
               UDCount--
            } 
            else if (UDPoint > UDNum) {
               replier.reply('입력자: '+sender+'님 '+(10*UDCount)+'포인트 차감\n소지금: '+userinfo[room][sender][9]+'원\n입력값: '+UDNum+'\n결과: UP\n남은횟수: '+UDCount+'회');
               UDCount--
            } 
            else {
               replier.reply("숫자를 입력해주세요! 포인트는 차감되었습니다.")
            }
            
         }
         if(UDCount == 0 && updownswitch == true) {
               replier.reply("업다운 게임 종료되었습니다. 정답은 "+UDPoint+'입니다.');
               updownswitch = false;
               UDPoint = 0;
               rankerchat = 0;
           }
      }
      else{
         replier.reply(sender + "여 어떻게 10원도 없냐....");
      }
   }


   if (msg == "!룰렛참여") {
     if(players[room] == undefined) {
         players[room] = [];
      }
      if(userinfo[room][sender][8] >= 2000){
         modifymileage(room, sender, -2000)
         if (players.length < Rmaxplayers && Gstart == false) {
            if (players.indexOf(sender)!=-1) {
               replier.reply("[시네마봇]\n"+sender+"님은 이미 참가하셨습니다.");
               return;
            }
            players.push(sender);
            replier.reply("[시네마봇]\n"+sender+'님 2000마일리지 차감\n잔여 마일리지: '+userinfo[room][sender][8]+"Mileage\n룰렛게임 참여 완료\n현재 참가자\n" + players.join('\n'));
            randplayer++;
            if (players.length == Rmaxplayers) {
               replier.reply("[시네마봇]\n참가자가 꽉 찼으니 준비가 되셨으면 시작하여 주세요.\n아무도 안죽으면 모든 참석자에게 20000원 제공");
            }
         }  
         else if (players.length == Rmaxplayers || Gstart == true) {
            replier.reply("[시네마봇]\n게임이 이미 시작되었거나 정원이 가득차 참가하실 수 없으십니다.");
         }
      else{
         replier.reply("2000마일 없어서 참여 못함.")
      }
   }
   }
   
   if (msg == "!시작" && players.indexOf(sender)!=-1) {
      if (players.length > 1) {
      Gstart = true;
      m = 0;
         if (players.length < 8) {
            while (players.length < 8) {
               for (var n=0 ; n < players.length ; n++) {
                  if (players.length < 8) {
                  players.push(players[n]);
                  } else {break;}
               }
            }
         }
         탄환 = generateScore(9, 0);;
         //replier.reply('용현',"탕탕게임="+탄환);
         replier.reply("[시네마봇]\n탄환이 장전되었습니다.\n첫 시작은 " + players[0] +"님\n'탕' 으로 방아쇠를 당겨주세요.\n모두 생존시 20000원 제공");
      }
      else if (players.length == 1) {
         replier.reply("[시네마봇]\n혼자서는 시작할 수 없습니다.");
      }
   }
   
   if (msg == "탕" && Gstart == true && players[m] == sender) {
      if (m == 탄환) {
         replier.reply("["+sender+"]\n타-앙!👉\n"+sender+"님: 그것은 제 유골입니다만? \n사망하셨습니다.");
         Gstart = false;
         m = 0;
         randplayer = 0;
         players = [];
         탄환 = null;
         usepoint[room][sender]++;
      fs.write(upoint, JSON.stringify(usepoint, null, 4));
         
      }      
      else {
         m+=1;
         replier.reply(["["+sender+"님] "+m+"번째 총알\n아 살았죠?","["+sender+"님] "+m+"번째 총알\n아 피했조?","["+sender+"님] "+m+"번째 총알\n그것은 내 잔상입니다만?"][generateScore(3,0)]);
         let resultMsg = [];
         if (m == 8){
            replier.reply("총알이 떨어져서 모든 생존자에게 20000포인트 제공!\n");
            Gstart = false;
            m = 0;
  
            for(let z = 0; z < randplayer; z++) {
                userinfo[room][players[z]][9] = userinfo[room][players[z]][9] + 20000;
                resultMsg.push([players[z]]+"님 20000포인트 제공\n현재 포인트 :"+userinfo[room][players[z]][9]+'\n');            
            }
            replier.reply(resultMsg.join(''));
            fs.write(vips, JSON.stringify(userinfo, null, 4));
            players = [];
            randplayer = 0;
            탄환 = null;
         }
         else{
            replier.reply("다음은 "+players[m]+"님\n"+(m+1)+"번째 차례입니다.");
         }
      }
   } 
      
    if(msg.startsWith('!돈뿌리기') && doncount == false) {
      jijungdon = msg.substr(6);
        if(jijungdon <= userinfo[room][sender][9] && jijungdon >= 5000 && donroom == null){
            doncount = true;
            donroom = room;
            donadmin = sender;
            dondon = Math.round(jijungdon * 0.8);
            modifypoint(room, sender, -jijungdon);
            replier.reply(sender+'님이 '+jijungdon+'을 뿌리셨습니다.(수수료 20% 제외금액: '+dondon+'원)\n'+sender+'님 잔여 포인트'+ userinfo[room][sender][9] +'원\n받고싶은 사람은 !손');
        }
        else if(1000 <= userinfo[room][sender][9] && 1 === generateScore(5, 0)){
         doncount = true;
         donroom = room;
         donadmin = sender;
         dondon = Math.round(userinfo[room][sender][9] * 0.8);
         modifypoint(room, sender, -userinfo[room][sender][9]);
         replier.reply('전재산을 쏩니다. '+sender+'님이 '+dondon*1.25+'원을 뿌리셨습니다.(수수료 20% 제외금액: '+dondon+'원)\n'+sender+'님 잔여 포인트'+ userinfo[room][sender][9] +'원\n받고싶은 사람은 !손');
        }
        else{
            replier.reply(sender+'님 최소 5000원부터 기부가능');
        }
   }

   if(msg =="!손" && doncount == true) {
      createUserAccount(room, sender);
      if(donroom==room){
         if(sender == donadmin){
         replier.reply('넌 뿌린자니까 안돼!!');
         return;
         }
         else{
            if(sonplayers == undefined) {
               sonplayers = [];
            }          
            if (sonplayers.indexOf(sender)!=-1) {
               replier.reply("[시네마봇]\n"+sender+"님은 돈 먹었잖아!!");
               return;
            }
            sonplayers.push(sender);
            if(dondon > 0){
            let s;
            if (dondon <= 500){
               s = dondon;
            }
            if(dondon >500){
               s  =  generateScore(dondon, 1);;
               }
            dondon = dondon - s;
               modifypoint(room, sender, s);
               //replier.reply('용현',sender+'획득포인트: '+s+'잔여포인트: '+dondon);
               if(dondon <= 0){
                  replier.reply(sender+'님 '+ s +'원 획득\n소지 포인트: '+userinfo[room][sender][9]+'원\n돈 떨어짐 끝!!!');
                  doncount = false;
                  donadmin = 0;
                  donroom = null;
                  dondon = 0;
                  sonplayers = [];               
               }
               else{
                  replier.reply(sender+'님 '+ s +'원 획득\n'+sender+'님 소지 포인트'+ userinfo[room][sender][9] + '\n남은 포인트: '+dondon+'원\n받은자\n'+sonplayers.join('\n - ')+'\n\n받고싶은 사람은 !손');
               }
            }
            if(dondon <= 0){
               replier.reply('돈 없다. 돈뿌리고 싶으면 !돈뿌리기');
               donroom = null;
            }
         }
      }
      else{
         replier.reply("다른 방에서 돈뿌리기 이용중이라 이용 못함")
      }
   }   




   if(msg == '!한캐탐색') {
      createUserAccount(room, sender);
      let actor6 = [];
      let actor7 = [];         
      let choicemsg = [];
      for(let k = 0; k <= actoritem[room][sender].length; k++){
         for(let i = 0; i < data['allactor'].length; i++) {
            if(actoritem[room][sender][k] == data['allactor'][i]['name']) {
               if(data['allactor'][i]['star'] == 6){
                  actor6.push(actoritem[room][sender][k]);  
               }
               else if(data['allactor'][i]['star'] == 7){
                  actor7.push(actoritem[room][sender][k]);
               }
               break;
            }
         }
      }
      //myinfo.push('[한정 배우] 총'+actor7.length+'명\n'+actor7.sort()+'\n\n');
      //myinfo.push('[6성 배우] 총'+actor6.length+'명\n'+actor6.sort()+'\n\n');
      let actore7 = actor7.length * 5;
      let actore6 = actor6.length;

      if(actore7 <= actore6){
      if(useritem[room][sender][10] >= 100) {
         let sumactor7 = []; // 현재 아이템 리스트를 담을 배열
         for(let i = 0; i < data['allactor'].length; i++) {
            if(actoritem[room][sender].includes(data['allactor'][i]['name'])){
               //choicemsg.push("중복 배우입니다.")
            }
            else{
               if(data['allactor'][i]['star'] == '7'){
                  sumactor7.push(data['allactor'][i]['name']);
               }
            }
         }
         let chooseactor;
         chooseactor = sumactor7[generateScore(sumactor7.length,0)]; 
         
         for(let i = 0; i < data['allactor'].length; i++) {
            if(chooseactor == data['allactor'][i]['name']) {
               choicemsg.push("성급: "+data['allactor'][i]['star']+"성\n");
               choicemsg.push("이름: "+data['allactor'][i]['name']+"\n");
               choicemsg.push("특성: "+data['allactor'][i]['stat']+"\n");
            }
         }         
         actoritem[room][sender].push(chooseactor);
         chooseactor = '';
         fs.write(actori, JSON.stringify(actoritem, null, 4));
         useritem[room][sender][10] = useritem[room][sender][10] - 100;
         modifyactor(room, sender);
         replier.reply(sender+"님 한정배우 획득 축하\n"+ choicemsg.join('') + '\n현재 한정캐스팅: ' + useritem[room][sender][10] + '장');
         fs.write(vips, JSON.stringify(userinfo, null, 4));
      } 
      else { // 지역보다 포인트이 유저가 더 있는지 체크한다.{
         replier.reply('[' + sender + '] 님 한정캐스팅 거지\n현재 한정캐스팅: ' + useritem[room][sender][10] + '장');
         }
      }
      else{
      let actore7 = actor7.length * 5;
      replier.reply('[' + sender + '] 님 6성 배우 '+(actore6 - actore7)+'명부족\n[한정 배우] 총'+actor7.length+'명\n[6성 배우] 총'+actor6.length+'명)');
      }
   }     
   
// ■ 6성 확정 캐스팅 (한정캐스팅권 50장 소비)
if (msg == "!6성확정") {
    createUserAccount(room, sender);

    // 필요 한정캐스팅권
    var need = 50;
    var ticket = useritem[room][sender][10];

    // 1. 한정캐스팅권 체크
    if (ticket < need) {
        replier.reply("[" + sender + "] 님 한정캐스팅권 부족\n현재: " + ticket + "장");
        return;
    }

    // 2. 전체 배우 중 6성만 수집
    var pool6 = [];
    for (var i = 0; i < data['allactor'].length; i++) {
        if (data['allactor'][i]['star'] == '6') {
            pool6.push(data['allactor'][i]['name']);
        }
    }

    // 3. 미보유 6성만 필터링
    var notOwned6 = [];
    for (var j = 0; j < pool6.length; j++) {
        var nm = pool6[j];
        if (actoritem[room][sender].indexOf(nm) == -1) {
            notOwned6.push(nm);
        }
    }

    // 4. 미보유가 없으면 종료
    if (notOwned6.length == 0) {
        replier.reply(
            sender + "님은 이미 모든 6성 배우를 보유하고 있습니다.\n추가 지급 가능한 6성이 없습니다."
        );
        return;
    }

    // 5. 랜덤 선택
    var pickactor6 = notOwned6[generateScore(notOwned6.length, 0)];

    // 6. 배우 상세 찾기
    var choicemsg = "";
    for (var k = 0; k < data['allactor'].length; k++) {
        if (data['allactor'][k]['name'] == pickactor6) {
            choicemsg = "성급: 6성\n이름: " + pickactor6 + "\n특성: " + data['allactor'][k]['stat'];
            break;
        }
    }

    // 7. 배우 지급
    actoritem[room][sender].push(pickactor6);
    fs.write(actori, JSON.stringify(actoritem, null, 4));

    // 8. 한캐권 차감
    useritem[room][sender][10] = ticket - need;
    fs.write(vipi, JSON.stringify(useritem, null, 4));

    // 9. 배우 능력 계산
    modifyactor(room, sender);

    // 10. 결과 알림
    replier.reply(sender +"님 6성 배우 확정 획득!\n\n" +choicemsg +"\n\n남은 한정캐스팅권: " +useritem[room][sender][10] +"장");
}


   if(msg == '!명캐탐색') {
      createUserAccount(room, sender);
      if(userinfo[room][sender][8] >= 100000) {
         let sumactor5 = []; // 현재 아이템 리스트를 담을 배열
         let sumactor6 = []; // 현재 아이템 리스트를 담을 배열
         for(let i = 0; i < data['allactor'].length; i++) {
            if(actoritem[room][sender].includes(data['allactor'][i]['name'])){
               //choicemsg.push("중복 배우입니다.")
            }
            else{
               if(data['allactor'][i]['star'] == '5'){
                  sumactor5.push(data['allactor'][i]['name']);
               }
               if(data['allactor'][i]['star'] == '6'){
                  sumactor5.push(data['allactor'][i]['name']);
               }
            }
            
         }
         let chooseactor;
         var s = generateScore(100, 1);
         if(s > 95 || sumactor5.length == 0){
            chooseactor = sumactor6[generateScore(sumactor6.length, 0)]; 
         }
         else{
            chooseactor = sumactor5[generateScore(sumactor5.length, 0)]; 
         }
         choicemsg = [];
         for(let i = 0; i < data['allactor'].length; i++) {
            if(chooseactor == data['allactor'][i]['name']) {
               choicemsg.push("성급: "+data['allactor'][i]['star']+"성\n");
               choicemsg.push("이름: "+data['allactor'][i]['name']+"\n");
               choicemsg.push("특성: "+data['allactor'][i]['stat']+"\n");
            }
         }         
         actoritem[room][sender].push(chooseactor);
         replier.reply ('테스티스트',sender+'님 명캐획득:'+chooseactor)
         chooseactor = '';
         fs.write(actori, JSON.stringify(actoritem, null, 4));
         userinfo[room][sender][8] = userinfo[room][sender][8] - 100000;
         modifyactor(room, sender);
         replier.reply(sender+"님 명캐배우 획득 축하\n"+ choicemsg.join('') + '\n현재 마일리지: ' + userinfo[room][sender][8] + 'Milege');
         fs.write(vips, JSON.stringify(userinfo, null, 4));
      } 
      else { // 지역보다 포인트이 유저가 더 있는지 체크한다.{
         replier.reply('[' + sender + '] 님 마일리지 거지\n현재 마일리지: ' + userinfo[room][sender][8] + 'Milege\n\n');
         }                
   }
         
   if(msg == '!배우탐색') {
      createUserAccount(room, sender);
      if(userinfo[room][sender][8] >= 5000) {
         let sumactor5 = []; // 현재 아이템 리스트를 담을 배열
         let sumactor6 = []; // 현재 아이템 리스트를 담을 배열
         for(let i = 0; i < data['allactor'].length; i++) {
            if(data['allactor'][i]['star'] == '5'){
               sumactor5.push(data['allactor'][i]['name']);
            }
            if(data['allactor'][i]['star'] == '6'){
               sumactor6.push(data['allactor'][i]['name']);
            }
         }
         let chooseactor;
         var s = generateScore(100,1); 
         if(s >97){
            chooseactor = sumactor6[generateScore(sumactor6.length,0)]; 
         }
         else{
            chooseactor = sumactor5[generateScore(sumactor5.length,0)]; 
         }
         choicemsg = [];
         for(let i = 0; i < data['allactor'].length; i++) {
            if(chooseactor == data['allactor'][i]['name']) {
               choicemsg.push("성급: "+data['allactor'][i]['star']+"성\n");
               choicemsg.push("이름: "+data['allactor'][i]['name']+"\n");
               choicemsg.push("특성: "+data['allactor'][i]['stat']+"\n");
            }
         }         
         if(actoritem[room][sender].includes(chooseactor)){
            choicemsg.push("중복 배우입니다. 한정 캐스팅 카드 제공")
            useritem[room][sender][10]++;
            fs.write(vipi, JSON.stringify(useritem, null, 4));
         }
         else{
            actoritem[room][sender].push(chooseactor);
            chooseactor = '';
            fs.write(actori, JSON.stringify(actoritem, null, 4));
         }
         userinfo[room][sender][8] = userinfo[room][sender][8] - 5000;
         modifyactor(room, sender);
         replier.reply(sender+"님 배우 획득 축하드립니다.\n"+ choicemsg.join('') + '\n현재 마일리지: ' + userinfo[room][sender][8] + 'Milege');
         fs.write(vips, JSON.stringify(userinfo, null, 4));
      } 
      else { // 지역보다 포인트이 유저가 더 있는지 체크한다.{
         replier.reply('[' + sender + '] 님 마일리지 거지\n현재 마일리지: ' + userinfo[room][sender][8] + 'Milege\n\n');
         }                
      }

if (msg == '!배우탐색10') {
  createUserAccount(room, sender);

  // 마일리지 확인
  if (userinfo[room][sender][8] < 47500) {
    if (room == '사계') {
      replier.reply('[' + sender + '] 님 마일리지 거지\n현재 마일리지: ' + userinfo[room][sender][8] + 'Milege\n\n' + fs.read(msay));
    } else {
      replier.reply('[' + sender + '] 님 마일리지 거지\n현재 마일리지: ' + userinfo[room][sender][8] + 'Milege\n\n');
    }
    return;
  }

  // 안전 초기화
  if (!actoritem[room]) actoritem[room] = {};
  if (!actoritem[room][sender]) actoritem[room][sender] = [];
  if (!useritem[room]) useritem[room] = {};
  if (!useritem[room][sender]) useritem[room][sender] = Array(20).fill(0); // 인덱스 10 사용(한정 캐스팅권)

  // 성급별 풀 구성
  var pool5 = [];
  var pool6 = [];
  for (var i = 0; i < data['allactor'].length; i++) {
    var a = data['allactor'][i];
    if (a['star'] == '6') pool6.push(a['name']);
    else if (a['star'] == '5') pool5.push(a['name']);
  }

  // 세션(10연) 내 중복 방지용
  var pickedThisSession = [];
  var choiceactors = [];

  // 10명 뽑기
  for (var j = 0; j < 10; j++) {
    var picked = null;
    var retry = 0;

    while (retry < 300) { // 무한루프 방지
      var trySix = (generateScore(100, 1) > 97); // 6성 약 2%
      var pickPool = null;

      if (trySix && pool6.length > 0) pickPool = pool6;
      else if (pool5.length > 0) pickPool = pool5;
      else if (pool6.length > 0) pickPool = pool6; // 5성이 비면 6성으로라도
      else break; // 두 풀 모두 비면 종료

      var idx = generateScore(pickPool.length, 0);
      var candidate = pickPool[idx];

      // 세션 내 중복 방지
      if (pickedThisSession.indexOf(candidate) === -1) {
        picked = candidate;
        break;
      }
      retry++;
    }

    if (picked === null) break;

    pickedThisSession.push(picked);
    choiceactors.push(picked);
  }

  if (choiceactors.length === 0) {
    replier.reply(sender + "님, 이번 뽑기에서 선택할 수 있는 배우가 없습니다.");
    return;
  }

  // 결과 메시지 및 보유 추가 목록 구성
  var choicemsg = [];
  var toAdd = []; // 새롭게 보유에 추가할 배우들

  for (var l = 0; l < choiceactors.length; l++) {
    var pickedName = choiceactors[l];

    // 성급 찾기
    var starText = '';
    for (var ii = 0; ii < data['allactor'].length; ii++) {
      if (data['allactor'][ii]['name'] == pickedName) {
        starText = data['allactor'][ii]['star'] + "성 ";
        break;
      }
    }

    // 이미 보유하고 있는 배우인지 체크
    var alreadyOwned = (actoritem[room][sender].indexOf(pickedName) !== -1);

    if (alreadyOwned) {
      // [중첩] 표시 + 한정 캐스팅권 +1 (인덱스 10)
      choicemsg.push("[중첩] " + starText + pickedName + "\n");
      useritem[room][sender][10] = useritem[room][sender][10] + 1;
      fs.write(vipi, JSON.stringify(useritem, null, 4));
    } else {
      // 신규 획득
      choicemsg.push(starText + pickedName + "\n");
      toAdd.push(pickedName);
    }
  }

  // 보유 목록에 신규만 추가 (중첩은 추가 금지)
  for (var p = 0; p < toAdd.length; p++) {
    actoritem[room][sender].push(toAdd[p]);
  }
  fs.write(actori, JSON.stringify(actoritem, null, 4));

  // 후속 처리
  modifyactor(room, sender);
  modifymileage(room, sender, -47500);

  replier.reply(
    sender + "님 배우(10인) 획득 축하드립니다.\n" +
    choicemsg.join('') + '\n현재 마일리지: ' + userinfo[room][sender][8] + 'Milege'
  );
}



   if(msg == "!내배우정보") {//중복 삭제하고 6성 5성순으로 표시
      createUserAccount(room, sender);
      let myinfo = [];
      if(actoritem[room][sender] != undefined){
      myinfo.push('☆[' + sender + ']님 배우 정보☆'+Lw+'\n');
      let actor7 = [];
      let actor6 = [];
      let actor5 = [];
      //replier.reply(actoritem[room][sender].length);

      for(let k = 0; k <= actoritem[room][sender].length; k++){
         for(let i = 0; i < data['allactor'].length; i++) {
            //replier.reply(actoritem[room][sender][k] + data['allactor'][i]['name']);
            if(actoritem[room][sender][k] == data['allactor'][i]['name']) {
               if(data['allactor'][i]['star'] == 6){
                  actor6.push(actoritem[room][sender][k]);  
               }
               else if(data['allactor'][i]['star'] == 5){
                  actor5.push(actoritem[room][sender][k]);
               }
               else if(data['allactor'][i]['star'] == 7){
                  actor7.push(actoritem[room][sender][k]);
               }
               break;
            }
         }
      }
      if(growthactor[room][sender][0] != 0){
         myinfo.push('[성장 배우]\n이름: '+growthactor[room][sender][0]+'(레벨: '+growthactor[room][sender][1]+')\n[속성]:\n연출: '+growthactor[room][sender][3]+"          연기: "+growthactor[room][sender][4]+"\n스토리: "+growthactor[room][sender][5]+"         예술: "+growthactor[room][sender][6]+"\n예능: "+growthactor[room][sender][7]+"\n\n\n");
      }
      if(actor7.length > 0){
         myinfo.push('[7성 배우] 총'+actor7.length+'명\n'+actor7.sort()+'\n\n');
      }
      if(actor6.length > 0){
         myinfo.push('[6성 배우] 총'+actor6.length+'명\n'+actor6.sort()+'\n\n');
      }
      if(actor5.length > 0){
         myinfo.push('[5성 배우] 총'+actor5.length+'명\n'+actor5.sort()+'\n\n');   
      }
      useritem[room][sender][3] = growthactor[room][sender][2] + (actor7.length * 500)+(actor6.length * 20)+(actor5.length * 10);
      myinfo.push('총 보상 포인트는'+useritem[room][sender][3]+'입니다.');
      fs.write(vipi, JSON.stringify(useritem, null, 4));
      }
      else{
        myinfo.push(sender+'님의 배우는 뚜띤뿐입니다.');
      }
      replier.reply(myinfo.join(''));     
   }
   

   if(msg == "!기각촬영") {
      createUserAccount(room, sender);
      if(userinfo[room][sender][9] >= 4000){
         var gs = generateScore(12,1);
         let gidaegak = [];
         useritem[room][sender][9] = gs;
         gidaegak.push(sender+'님 각색 결과\n - '+gaksaeklist[useritem[room][sender][9]])
         //replier.reply(gaksaek.join(''));
         modifypoint(room, sender, -4000);   
         useritem[room][sender][4] = 4;
         fs.write(vipi, JSON.stringify(useritem, null, 4));
         gidaegak.push('\n'+sender+'님의 기대치:\n - '+ggidae[useritem[room][sender][4]])
         replier.reply(gidaegak.join(''));


         if(userinfo[room][sender][9] >= 6000){
            modifypoint(room, sender, -6000);      //돈 제거
            let videom = [];
            //시나리오 선정 진행
            //각색이 만약 0123라면 z를 선정할때 if로 계속 반복해서 돌려 맞을때까지(2성부터 5성까지)
            let z = generateScore(data['cinema'].length,0);
            if(useritem[room][sender][9] == 4){
              if(data['cinema'][z]['star'] != 4){
                 z = [5,49,50,61,78,82,85,103,112,137,146,151,155,156,160,166,167,170,174,177,183,186,188,197,203,204,206,213,215,220,225,227,233,234,240,246,247,255,256,266,269,270,273,274,277,279,285,286,287,289,290,291,294,297,302,303,305,306,310,312,317,318,321,326,328,338,341,342,343,346,347,350,361,366,368,370,371,383,386,393,394,398,402,404,406,412,413,415,416,417,418,420,421,423,425,428,430,431,437,438,443,447,450,451,452,453,462,463,465,475,478,480,481,482,484,486,488,491,492,501,502,505,506,509,517,518,519,520,523,525,541,543,549,552,554,560,564,572,578,583,586,592,597,602,603,607,608,614,615,618,619,627,629,630,633,640,641,649,651,657,675,685,686,687,695,696,699,700,701,704,705,712,713,717,721,723,726,729,734,735,741,785,790,793,816][generateScore(200,0)];
              }
            }
            if(useritem[room][sender][9] == 5){
              if(data['cinema'][z]['star'] != 5){
                 z = [7,11,27,29,33,34,143,150,152,187,219,230,237,241,242,250,253,263,264,271,280,283,284,288,292,293,295,298,299,300,301,307,308,309,311,313,314,315,316,319,322,323,324,325,329,330,331,332,334,336,337,339,344,349,351,352,353,354,355,358,359,360,369,372,373,374,375,376,377,378,379,380,381,382,385,388,397,399,405,408,409,410,419,424,426,427,433,434,435,441,448,449,455,456,457,460,461,469,470,471,473,474,476,477,485,489,490,493,496,500,503,508,511,512,513,514,515,516,521,522,524,527,528,529,530,531,533,534,536,537,538,539,544,545,546,547,548,550,555,556,557,558,559,562,563,565,566,567,568,569,570,571,573,580,581,582,587,588,589,590,593,595,596,600,601,606,610,611,612,613,617,632,634,636,637,638,643,644,646,647,648,650,653,655,656,658,659,660,661,662,663,664,665,666,667,668,669,670,671,672,673,674,676,677,678,679,680,681,682,683,684,688,689,690,691,692,693,694,697,698,702,703,706,707,708,709,710,711,714,715,716,718,719,720,722,724,725,727,728,730,731,732,733,736,737,738,739,740,742,743,744,745,746,747,748,749,750,751,752,753,754,755,756,757,758,759,760,761,762,763,764,765,766,767,768,769,770,771,772,773,774,775,776,777,778,779,780,781,782,783,784,786,787,788,789,791,792,794,795,796,797,798,799,800,801,802,803,804,805,806,807,808,809,810,811,812,813,814,815,817,818,819,820,821,822,823,824,825,826,827,828,829,830,831,832,833,834,835,836,837,838][generateScore(332,0)];
              }
            }
            let picmname = data['cinema'][z]['movie'];
            let picmstar = data['cinema'][z]['star'];
            let picmbest = data['cinema'][z]['best'];
            let picmbest2 = data['cinema'][z]['best2'];
            let actorcount = data['cinema'][z]['actorcount'];
            
  
            // 포인트 초기화 및 제공
            let picmpoint = 0;
  
            //각색 배우 1명 추가 효과
            if(useritem[room][sender][9] == 6) {
              actorcount++;
            }
            //각색 성급향상
            if(useritem[room][sender][9] == 2) {
              picmstar++;
            }
           if(useritem[room][sender][9] == 3) {
           picmstar++;
           picmstar++;
            }
  
            picmpoint = picmstar * 4;
            
            //배우 선정
           let picmactors = [];
           //let imsiactor = [];
  
           if(actoritem[room][sender].length == 0){         //만약 보유 배우수가 0이면 0에 대한 처리 진행
              picmpoint = picmpoint - 40;
           }         
           else if(actorcount >= actoritem[room][sender].length){         //만약 보유 배우수가 액터카운트보다 작다? 그럼 보유 배우 모두를 picmactors에 넣는다.
              for(let k = 0; k <= actoritem[room][sender].length; k++){
                 picmactors.push(actoritem[room][sender][k]);
              }
              //replier.reply('걸렸다');
           }
          else{         
              let actor6 = [];
              let actor5 = [];
              for(let k = 0; k <= actoritem[room][sender].length; k++){         // 배우수 적당할떄 돌리다가 딱 카운트만큼 되면 멈춘다.
                 for(let i = 0; i < data['allactor'].length; i++) {
                    if(actoritem[room][sender][k] == data['allactor'][i]['name']) {
                       if(data['allactor'][i]['star'] == 6){
                          actor6.push(actoritem[room][sender][k]);                     
                       }
                       else{
                          actor5.push(actoritem[room][sender][k]);
                       }
                       break;
                    }
                 }
              }
              for(let j = 0; j <= actor5.length; j++){
                 actor6.push(actor5[j]);
              }
               let piccount = 0;
              for(let j = 0; j <= actor6.length; j++){  
                 if(actorcount <= piccount){
                    //replier.reply('걸렸다 제목:'+picmname+'액터카운트'+actorcount+'배우수: '+picmactors.length);
                    break;
                    }
                    else{
                      picmactors.push(actor6[j]);
                      piccount++
                    //replier.reply('all: '+picmactors.length+'people\n'+picmactors);
                    }
                 
              }
              //replier.reply('안걸린제목:'+picmname+'액터카운트'+actorcount+'배우수: '+picmactors.length);
              
           }          
         // replier.reply('eeeee'+picmactors)
           if(picmactors.length != 0){
              for(let k = 0; k < picmactors.length; k++){                      // 성급에 따라 포인트 제공
                 //imsiactor.push(picmactors[k]);   
                 for(let l = 0; l < data['allactor'].length; l++) {
                    if(picmactors[k] == data['allactor'][l]['name']) {
                       //replier.reply('6성이다!!'); 
                       if(data['allactor'][l]['star'] == 6){
                          picmpoint = picmpoint + 3;
                          //replier.reply('6성이다');                    
                       }
                       else{
                          picmpoint = picmpoint + 2;
                       }
                       break;
                    }
                 }
              }
           }
        
           // 장르 적합 장르를 랜덤으로 돌린다. 그리고 선정한다
          let fullgenre = ["액션","미스터리","서사","멜로","코미디","공포","뮤지컬","애니메이션"];
           let genrem = ["액션","미스터리","서사"];
           let genreg = ["멜로","코미디","공포"];
           let genreb = ["뮤지컬","애니메이션"]; 

           let genreselect = fullgenre[generateScore(fullgenre.length,0)];
           if(picmbest != undefined && picmbest.includes(genreselect)){
              picmpoint = picmpoint + 10;
           }
           else if(picmbest2 != undefined && picmbest2.includes(genreselect)){
              picmpoint = picmpoint + 8;
           }
           else{
              picmpoint = picmpoint + 5;
           }
           
           //랜덤 시장 기대치를 제공
           let marketm = [0,0,0];
           for(let m = 0; m <10; m++){
              var s = generateScore(3, 0);
              marketm[s] = marketm[s] + 1;
           }
           //시장 기대치만큼 포인트 추가
           if(genrem.includes(genreselect)){
              picmpoint = picmpoint + marketm[0]*3;
           }
           else if(genreg.includes(genreselect)){
              picmpoint = picmpoint + marketm[1]*3;
           }
           else if(genreb.includes(genreselect)){
              picmpoint = picmpoint + marketm[2]*3;
           }
           //기대치
           
           if(useritem[room][sender][9] == 1) {
              picmpoint = picmpoint + useritem[room][sender][4]+20;
           }
           else{
              picmpoint = picmpoint + useritem[room][sender][4]*4+4;
           }
           //랜덤 흥행도 곱하기
           let y = generateScore(8,3);
           //흥행도 각색 효과
           if(useritem[room][sender][9] >= 10 && useritem[room][sender][9] <= 12) {
              y = y + useritem[room][sender][9]-9;
           }
           picmpoint = picmpoint + y;
           //각색 효과
           if(useritem[room][sender][9] >= 7 && useritem[room][sender][9] <= 9) {
              picmpoint = picmpoint + useritem[room][sender][9]-6;
           }
           videom.push(sender+'님의 촬영 영화 제목:\n'+picmname+'(');
           for(let w = 0; w < picmstar; w++){
              videom.push('★');
           }
           videom.push(')\n------------------------------------\n출연진('+picmactors.length+'인):\n'+picmactors.join(','));
           videom.push('\n------------------------------------\n장르 선택: '+genreselect)
           videom.push('\n영화 최선: '+picmbest);
           videom.push('\n영화 차선: '+picmbest2);
           
           videom.push('\n------------------------------------');
           videom.push('\n시장 통계:\n남성:'+marketm[0]*10+'%\n여성:'+marketm[1]*10+'%\n어린이:'+marketm[2]*10);
           videom.push('%\n------------------------------------');
           videom.push('\n관객 기대: '+ggidae[useritem[room][sender][4]]);
           videom.push('\n각색 효과: '+gaksaeklist[useritem[room][sender][9]]);
           videom.push('\n시장 선호도: '+y*10+"%");
           videom.push('\n------------------------------------');
           videom.push('\n매출 달성도: ');
                      if(picmpoint <= 25){
              videom.push(mmaechool[0]+'('+picmpoint+')');
              useritem[room][sender][5]--;
              useritem[room][sender][4] = 0;
              videom.push('\n☆티어 다운☆: '+arrivaldata['tier'][useritem[room][sender][5]]['name']);
              modifymileage(room, sender, 2000);      //마일리지 추가
           }
           else if(picmpoint <= 45){
              videom.push(mmaechool[1]+'('+picmpoint+')');
              useritem[room][sender][4] = 0;
              modifymileage(room, sender, 5000);      //마일리지 추가
           }
           else if(picmpoint <= 70){
              videom.push(mmaechool[2]+'('+picmpoint+')');
              useritem[room][sender][4] = 0;
              modifymileage(room, sender, 10000);      //마일리지 추가
           }
           else if(picmpoint <= 85){
              videom.push(mmaechool[3]+'('+picmpoint+')');
              useritem[room][sender][5]++;
              useritem[room][sender][4] = 0;
              videom.push('\n★티어 상승★: '+arrivaldata['tier'][useritem[room][sender][5]]['name']);
              modifymileage(room, sender, 15000);      //마일리지 추가
              randomgiveitem(room, sender)              // 티어 보상 제공
           }
           else{
              videom.push(mmaechool[4]+'('+picmpoint+')');
              useritem[room][sender][5]++;
              useritem[room][sender][4] = 0;
              useritem[room][sender][7]++;
              videom.push('\n★티어 상승★: '+arrivaldata['tier'][useritem[room][sender][5]]['name']);
              modifymileage(room, sender, 30000);      //마일리지 추가
              randomgiveitem(room, sender)            // 티어 보상 제공
           }
           useritem[room][sender][6]++;
           useritem[room][sender][9] = 0;
           fs.write(vipi, JSON.stringify(useritem, null, 4));
           videom.push('\n잔여 금액:'+userinfo[room][sender][9]+'원\n잔여 마일: '+userinfo[room][sender][8]+' Mileage');
           replier.reply(videom.join(''));
        }
        else{
           replier.reply(sender+'님 촬영할 돈이 없어요.\n잔여 금액:'+userinfo[room][sender][9]+'원');
         }
     }  
   }
   

   if(msg == "!촬영시작" || msg == "!촬영") {
      createUserAccount(room, sender);
      if(userinfo[room][sender][9] >= 6000){
          modifypoint(room, sender, -6000);      //돈 제거
          let videom = [];
          //시나리오 선정 진행
          //각색이 만약 0123라면 z를 선정할때 if로 계속 반복해서 돌려 맞을때까지(2성부터 5성까지)
          let z = [generateScore(data['cinema'].length,0)]
          if(useritem[room][sender][9] == 4){
            if(data['cinema'][z]['star'] != 4){
               z = [5,49,50,61,78,82,85,103,111,136,145,150,154,155,159,165,166,169,173,176,182,185,186,195,201,202,204,211,213,218,223,225,231,232,238,244,245,253,263,266,267,270,271,274,276,282,283,284,286,287,288,291,294,299,300,302,303,307,309,314,315,318,323,325,335,338,339,340,343,344,347,358,363,365,367,368,380,383,390,391,395,399,401,403,409,410,412,413,414,415,417,418,420,422,425,427,428,434,435,440,444,447,448,449,450,458,459,461,470,473,475,476,477,479,481,483,486,487,496,497,500,501,504,512,513,514,515,518,520,535,537,543,546,548,553,564,570,575,578,584,589,594,595,599,600,606,607,610,611,619,621,622,625,632,633,637,638,644,660,668,669,670,678,679,682,683,684,687,688,695,696,698,702,704,707,710,715,716,722,764,765][generateScore(180,0)];
            }
          }
          if(useritem[room][sender][9] == 5){
            if(data['cinema'][z]['star'] != 5){
               z =[7,11,27,29,33,34,142,149,151,217,228,235,239,240,248,251,260,261,268,277,280,281,285,289,290,292,295,296,297,298,304,305,306,308,310,311,312,313,316,319,320,321,322,326,327,328,329,331,333,334,336,341,346,348,349,350,351,352,355,356,357,366,369,370,371,372,373,374,375,376,377,378,379,382,385,394,396,402,405,406,407,416,421,423,424,430,431,432,438,445,446,452,453,456,457,464,465,466,468,469,471,472,480,484,485,488,491,495,498,503,506,507,508,509,510,511,516,517,519,522,523,524,525,526,528,530,531,532,533,538,539,540,541,542,544,549,550,551,552,555,556,557,558,559,560,561,562,563,565,572,573,574,579,580,581,582,585,587,588,592,593,598,602,603,604,605,609,624,626,628,629,630,635,640,642,643,645,646,647,648,649,650,651,652,653,654,655,656,657,658,659,661,662,663,664,665,666,667,671,672,673,674,675,676,677,680,681,685,686,689,690,691,692,693,694,697,699,700,701,703,705,706,708,709,711,712,713,714,717,718,719,720,721,723,724,725,726,727,728,729,730,731,732,733,734,735,736,737,738,739,740,741,742,743,744,745,746,747,748,749,750,751,752,753,754,755,756,757,758,759,760,761,762,763,766,767,768,769,770,771,772,773,774][generateScore(282,0)];
            }
          }
          let picmname = data['cinema'][z]['movie'];
          let picmstar = data['cinema'][z]['star'];
          let picmbest = data['cinema'][z]['best'];
          let picmbest2 = data['cinema'][z]['best2'];
          let actorcount = data['cinema'][z]['actorcount'];
          

          // 포인트 초기화 및 제공
          let picmpoint = 0;

          //각색 배우 1명 추가 효과
          if(useritem[room][sender][9] == 6) {
            actorcount++;
          }
          //각색 성급향상
          if(useritem[room][sender][9] == 2) {
            picmstar++;
          }
         if(useritem[room][sender][9] == 3) {
         picmstar++;
         picmstar++;
          }

          picmpoint = picmstar * 4;
          
          //배우 선정
         let picmactors = [];
         //let imsiactor = [];

         if(actoritem[room][sender].length == 0){         //만약 보유 배우수가 0이면 0에 대한 처리 진행
            picmpoint = picmpoint - 40;
         }         
         else if(actorcount >= actoritem[room][sender].length){         //만약 보유 배우수가 액터카운트보다 작다? 그럼 보유 배우 모두를 picmactors에 넣는다.
            for(let k = 0; k <= actoritem[room][sender].length; k++){
               picmactors.push(actoritem[room][sender][k]);
            }
            //replier.reply('걸렸다');
         }
        else{         
            let actor6 = [];
            let actor5 = [];
            for(let k = 0; k <= actoritem[room][sender].length; k++){         // 배우수 적당할떄 돌리다가 딱 카운트만큼 되면 멈춘다.
               for(let i = 0; i < data['allactor'].length; i++) {
                  if(actoritem[room][sender][k] == data['allactor'][i]['name']) {
                     if(data['allactor'][i]['star'] == 6){
                        actor6.push(actoritem[room][sender][k]);                     
                     }
                     else{
                        actor5.push(actoritem[room][sender][k]);
                     }
                     break;
                  }
               }
            }
            for(let j = 0; j <= actor5.length; j++){
               actor6.push(actor5[j]);
            }
             let piccount = 0;
            for(let j = 0; j <= actor6.length; j++){  
               if(actorcount <= piccount){
                  //replier.reply('걸렸다 제목:'+picmname+'액터카운트'+actorcount+'배우수: '+picmactors.length);
                  break;
                  }
                  else{
                    picmactors.push(actor6[j]);
                    piccount++
                  //replier.reply('all: '+picmactors.length+'people\n'+picmactors);
                  }
               
            }
            //replier.reply('안걸린제목:'+picmname+'액터카운트'+actorcount+'배우수: '+picmactors.length);
            
         }          
       // replier.reply('eeeee'+picmactors)
         if(picmactors.length != 0){
            for(let k = 0; k < picmactors.length; k++){                      // 성급에 따라 포인트 제공
               //imsiactor.push(picmactors[k]);   
               for(let l = 0; l < data['allactor'].length; l++) {
                  if(picmactors[k] == data['allactor'][l]['name']) {
                     //replier.reply('6성이다!!'); 
                     if(data['allactor'][l]['star'] == 6){
                        picmpoint = picmpoint + 3;
                        //replier.reply('6성이다');                    
                     }
                     else{
                        picmpoint = picmpoint + 2;
                     }
                     break;
                  }
               }
            }
         }
      
         // 장르 적합 장르를 랜덤으로 돌린다. 그리고 선정한다
        let fullgenre = ["액션","미스터리","서사","멜로","코미디","공포","뮤지컬","애니메이션"];
         let genrem = ["액션","미스터리","서사"];
         let genreg = ["멜로","코미디","공포"];
         let genreb = ["뮤지컬","애니메이션"];

         let genreselect = fullgenre[generateScore(fullgenre.length,0)];
         if(picmbest != undefined && picmbest.includes(genreselect)){
            picmpoint = picmpoint + 10;
         }
         else if(picmbest2 != undefined && picmbest2.includes(genreselect)){
            picmpoint = picmpoint + 8;
         }
         else{
            picmpoint = picmpoint + 5;
         }
         
         //랜덤 시장 기대치를 제공
         let marketm = [0,0,0];
         for(let m = 0; m <10; m++){
            var s = generateScore(3,0);
            marketm[s] = marketm[s] + 1;
         }
         //시장 기대치만큼 포인트 추가
         if(genrem.includes(genreselect)){
            picmpoint = picmpoint + marketm[0]*3;
         }
         else if(genreg.includes(genreselect)){
            picmpoint = picmpoint + marketm[1]*3;
         }
         else if(genreb.includes(genreselect)){
            picmpoint = picmpoint + marketm[2]*3;
         }
         //기대치
         
         if(useritem[room][sender][9] == 1) {
            picmpoint = picmpoint + useritem[room][sender][4]+20;
         }
         else{
            picmpoint = picmpoint + useritem[room][sender][4]*4+4;
         }
         //랜덤 흥행도 곱하기
         let y = generateScore(8,3);
         //흥행도 각색 효과
         if(useritem[room][sender][9] >= 10 && useritem[room][sender][9] <= 12) {
            y = y + useritem[room][sender][9]-9;
         }
         picmpoint = picmpoint + y;
         //각색 효과
         if(useritem[room][sender][9] >= 7 && useritem[room][sender][9] <= 9) {
            picmpoint = picmpoint + useritem[room][sender][9]-6;
         }
         videom.push(sender+'님의 촬영 영화 제목:\n'+picmname+'(');
         for(let w = 0; w < picmstar; w++){
            videom.push('★');
         }
         videom.push(')\n------------------------------------\n출연진('+picmactors.length+'인):\n'+picmactors.join(','));
         videom.push('\n------------------------------------\n장르 선택: '+genreselect)
         videom.push('\n영화 최선: '+picmbest);
         videom.push('\n영화 차선: '+picmbest2);
         
         videom.push('\n------------------------------------');
         videom.push('\n시장 통계:\n남성:'+marketm[0]*10+'%\n여성:'+marketm[1]*10+'%\n어린이:'+marketm[2]*10);
         videom.push('%\n------------------------------------');
         videom.push('\n관객 기대: '+ggidae[useritem[room][sender][4]]);
         videom.push('\n각색 효과: '+gaksaeklist[useritem[room][sender][9]]);
         videom.push('\n시장 선호도: '+y*10+"%");
         videom.push('\n------------------------------------');
         videom.push('\n매출 달성도: ');
                    if(picmpoint <= 25){
            videom.push(mmaechool[0]+'('+picmpoint+')');
            useritem[room][sender][5]--;
            useritem[room][sender][4] = 0;
            videom.push('\n☆티어 다운☆: '+arrivaldata['tier'][useritem[room][sender][5]]['name']);
            modifymileage(room, sender, 2000);      //마일리지 추가
         }
         else if(picmpoint <= 45){
            videom.push(mmaechool[1]+'('+picmpoint+')');
            useritem[room][sender][4] = 0;
            modifymileage(room, sender, 5000);      //마일리지 추가
         }
         else if(picmpoint <= 70){
            videom.push(mmaechool[2]+'('+picmpoint+')');
            useritem[room][sender][4] = 0;
            modifymileage(room, sender, 10000);      //마일리지 추가
         }
         else if(picmpoint <= 85){
            videom.push(mmaechool[3]+'('+picmpoint+')');
            useritem[room][sender][5]++;
            useritem[room][sender][4] = 0;
            videom.push('\n★티어 상승★: '+arrivaldata['tier'][useritem[room][sender][5]]['name']);
            modifymileage(room, sender, 15000);      //마일리지 추가
            randomgiveitem(room, sender)              // 티어 보상 제공
         }
         else{
            videom.push(mmaechool[4]+'('+picmpoint+')');
            useritem[room][sender][5]++;
            useritem[room][sender][4] = 0;
            useritem[room][sender][7]++;
            videom.push('\n★티어 상승★: '+arrivaldata['tier'][useritem[room][sender][5]]['name']);
            modifymileage(room, sender, 30000);      //마일리지 추가
            randomgiveitem(room, sender)            // 티어 보상 제공
         }
         useritem[room][sender][6]++;
         useritem[room][sender][9] = 0;
         fs.write(vipi, JSON.stringify(useritem, null, 4));
         videom.push('\n잔여 금액:'+userinfo[room][sender][9]+'원\n잔여 마일: '+userinfo[room][sender][8]+' Mileage');
         replier.reply(videom.join(''));
      }
      else{
         replier.reply(sender+'님 촬영할 돈이 없어요.\n잔여 금액:'+userinfo[room][sender][9]+'원');
       }
   }

   
   if(msg == "!기대치증가") {
      createUserAccount(room, sender);
      if(userinfo[room][sender][9] >= 500){
         let gidae = [];
          modifypoint(room, sender, -500);      //돈 제거
          useritem[room][sender][4] = useritem[room][sender][4] + 1;
          fs.write(vipi, JSON.stringify(useritem, null, 4));
         gidae.push(sender+'님의 기대치가 '+ggidae[useritem[room][sender][4]]+'으로 증가하였습니다')
         gidae.push('잔여 포인트: '+userinfo[room][sender][9]+'원')
         replier.reply(gidae.join(''));
      }
      else{
         replier.reply(sender+'님 돈 없어요.\n잔여 금액:'+userinfo[room][sender][9]+'원');
      }
   }
   
   
   if(msg == "!기대치풀증가" || msg=="!기대") {
    if(userinfo[room][sender][9] >= 2000){
         let gidae = [];
         modifypoint(room, sender, -2000);   
         useritem[room][sender][4] = 4;
         fs.write(vipi, JSON.stringify(useritem, null, 4));
         gidae.push(sender+'님의 기대치가 '+ggidae[useritem[room][sender][4]]+'으로 증가하였습니다')
         replier.reply(gidae.join(''));
   }
   }

   if(msg == "!각색") {
      if(userinfo[room][sender][9] >= 2000){
         var gs = generateScore(12, 1);
         let gaksaek = [];
         modifypoint(room, sender, -2000);   
         useritem[room][sender][9] = gs;
         fs.write(vipi, JSON.stringify(useritem, null, 4));
         gaksaek.push(sender+'님 각색 결과\n - '+gaksaeklist[useritem[room][sender][9]])
         replier.reply(gaksaek.join(''));
   }
   }

   if(msg == "!기각") {
      if(userinfo[room][sender][9] >= 4000){
         var gs = generateScore(12, 1);
         let gidaegak = [];
         useritem[room][sender][9] = gs;
         gidaegak.push(sender+'님 각색 결과\n - '+gaksaeklist[useritem[room][sender][9]])
         //replier.reply(gaksaek.join(''));
         modifypoint(room, sender, -4000);   
         useritem[room][sender][4] = 4;
         fs.write(vipi, JSON.stringify(useritem, null, 4));
         gidaegak.push('\n'+sender+'님의 기대치:\n - '+ggidae[useritem[room][sender][4]])
         replier.reply(gidaegak.join(''));
         
   }
   }

   
   // 그룹전 관련 명령어 처리

      //시,네,마를 글자 추가해서 그룹전 촬영 가능
      //5000 포인트 지출 필요하며 해당 촬영 결과가 시, 네, 마에 각기 저장됨
      // 이미 찍은게 있다면 기존 값이 갱신되거나 함, 시를 찍고 네를 다시 찍으면 시 결과는 사라짐
   if (msg == "!그룹전팀"  && yoil == 0) {
      let seasonsTeam =smgr[room]['smgroups']['seasons'].join('\n');
      let macaoTeam = smgr[room]['smgroups']['macao'].join('\n');
      let seasonsTeamTable =[];      
      let macaoTeamTable =[];
      seasonsTeamTable.push(seasonsTeam);
      macaoTeamTable.push(macaoTeam);  
      replier.reply("[팀원 정보]"+Lw+'\n사계그룹 멤버:\n'+ seasonsTeamTable+'\n\n' + '마카오그룹 목록:\n' + macaoTeamTable); 
   }


   if (msg.startsWith('!그룹전 ') && yoil == 0) {
      if(smgr[room]['smgroups']['seasons'].includes(sender) || smgr[room]['smgroups']['macao'].includes(sender)){
         createUserAccount(room, sender);
         //replier.reply('test');
         if(userinfo[room][sender][9] < 2000){
            replier.reply(sender+"님의 포인트가 부족합니다.");
            return;
         }
         

         let grouptype = msg.substr(5);
         if(grouptypes.includes(grouptype)){
            let resultMessage = [];
            let z = generateScore(data['cinema'].length,0);
            let picmname = data['cinema'][z]['movie'];
            let picmstar = data['cinema'][z]['star'];
            resultMessage.push(sender+'님의 촬영 영화 제목:\n'+picmname+'(');
            for(let w = 0; w < picmstar; w++){
               resultMessage.push('★');
            }
            resultMessage.push(')\n------------------------------------\n');
            resultMessage.push('\n매출 달성도: ');
            let viewerCount = generateScore(10000,1);
            if(viewerCount <= 2000){
               resultMessage.push(mmaechool[0]+'(관객: '+viewerCount+'명)');
            }  else if(viewerCount <= 4000){
               resultMessage.push(mmaechool[1]+'(관객: '+viewerCount+'명)');
            }  else if(viewerCount <= 6000){
               resultMessage.push(mmaechool[2]+'(관객: '+viewerCount+'명)');
            }  else if(viewerCount <= 8000){
               resultMessage.push(mmaechool[3]+'(관객: '+viewerCount+'명)');      
            }  else{
               resultMessage.push(mmaechool[4]+'(관객: '+viewerCount+'명)');
            }

            if(smgr[room]['smdiceRolls'][sender] > viewerCount){
               resultMessage.push("\n기존 성적보다 구려서 반영 안됩니다.");
            }
            else{
               if(smgr[room]['smgroups']['seasons'].includes(sender)){
                  if(!smgr[room]['smdiceRolls'][sender]){                   // 촬영 안한 경우
                     smgr[room]['smgroupsattends']['seasons'] += 1;      //그룹전 한사람 사계팀 추가
                  }
                  else{               //이미 찍은 촬영 값 삭제
                     delete smgr[room]['seasonsci'][sender];
                     delete smgr[room]['seasonsne'][sender];
                     delete smgr[room]['seasonsma'][sender];
                     }
                  
                  if(grouptype == "시") smgr[room]['seasonsci'][sender] = viewerCount;
                  else if(grouptype == "네") smgr[room]['seasonsne'][sender] = viewerCount;
                  else if(grouptype == "마") smgr[room]['seasonsma'][sender] = viewerCount;

                  resultMessage.push("\n사계팀 내 " + grouptype + " 타입에 관객 추가\n");
                  smgr[room]['smdiceRolls'][sender] = viewerCount;        //그룹전 한사람 점수갱신
               }
               else if(smgr[room]['smgroups']['macao'].includes(sender)){
                  if(!smgr[room]['smdiceRolls'][sender]){                   // 촬영 안한 경우
                     smgr[room]['smgroupsattends']['macao'] += 1;      //그룹전 한사람 사계팀 추가
                  }
                  else{            //이미 찍은 촬영 값 삭제
                     delete smgr[room]['macaoci'][sender];
                     delete smgr[room]['macaone'][sender];
                     delete smgr[room]['macaoma'][sender];
                  }      
                  if(grouptype == "시") smgr[room]['macaoci'][sender] = viewerCount;
                  else if(grouptype == "네") smgr[room]['macaone'][sender] = viewerCount;
                  else if(grouptype == "마") smgr[room]['macaoma'][sender] = viewerCount;

                  resultMessage.push("\n마카오팀 내 " + grouptype + " 타입에 관객 추가\n");
                  smgr[room]['smdiceRolls'][sender] = viewerCount;        //그룹전 한사람 점수갱신
               }
            }
            modifypoint(room, sender, -2000);
            resultMessage.push("\n"+sender+"님 잔여 포인트: "+userinfo[room][sender][9]+"포인트");
            fs.write(smgroupfile, JSON.stringify(smgr, null, 4));
            replier.reply(resultMessage.join(""));
         }
         else{
            replier.reply('그룹을 시, 네, 마 중 하나로 지정하세요. 예시)!그룹전 마');
            return;
         }
      }
   }

   // 그룹전 순위 확인 명령어 처리
   if (msg == "!그룹전현황"  && yoil == 0) {
      let resultMessage =[];
      resultMessage.push("[그룹전 상세 정보]\n");

      let cinemaScores = {
         seasonsci: 0, macaoci: 0,
         seasonsne: 0, macaone: 0,
         seasonsma: 0, macaoma: 0
      };

      function calculateGroupScore(groupObject) {
         let sum = 0;
         for (let key in groupObject) {
            if (groupObject.hasOwnProperty(key)) {
               sum += groupObject[key];
            }
         }
         return sum;
   }

      // 각각의 점수 합산
      cinemaScores.seasonsci = calculateGroupScore(smgr[room]['seasonsci']);
      cinemaScores.macaoci = calculateGroupScore(smgr[room]['macaoci']);
      cinemaScores.seasonsne = calculateGroupScore(smgr[room]['seasonsne']);
      cinemaScores.macaone = calculateGroupScore(smgr[room]['macaone']);
      cinemaScores.seasonsma = calculateGroupScore(smgr[room]['seasonsma']);
      cinemaScores.macaoma = calculateGroupScore(smgr[room]['macaoma']);

      // 각 그룹의 인원 수 계산
      let seasonsciCount = Object.keys(smgr[room]['seasonsci']).length;
      let macaociCount = Object.keys(smgr[room]['macaoci']).length;
      let seasonsneCount = Object.keys(smgr[room]['seasonsne']).length;
      let macaoneCount = Object.keys(smgr[room]['macaone']).length;
      let seasonsmaCount = Object.keys(smgr[room]['seasonsma']).length;
      let macaomaCount = Object.keys(smgr[room]['macaoma']).length;

      // 결과 메시지 구성
      resultMessage.push("[시] 타입\n - 사  계(" + seasonsciCount + "명): 총 " + cinemaScores.seasonsci + "관객\n - 마카오(" + macaociCount + "명): 총 " + cinemaScores.macaoci + "관객\n\n");
      resultMessage.push("[네] 타입\n - 사  계(" + seasonsneCount + "명): 총 " + cinemaScores.seasonsne + "관객\n - 마카오(" + macaoneCount + "명): 총 " + cinemaScores.macaone + "관객\n\n");
      resultMessage.push("[마] 타입\n - 사  계(" + seasonsmaCount + "명): 총 " + cinemaScores.seasonsma + "관객\n - 마카오(" + macaomaCount + "명): 총 " + cinemaScores.macaoma + "관객\n");
      
      replier.reply(resultMessage.join(""));
   }

   if(msg == "!그룹전순위"  && yoil == 0) {
      let rankinglist = [];
      for(i in smgr[room]['smdiceRolls']) rankinglist.push(i + ' : ' + (smgr[room]['smdiceRolls'][i]) + '관객');
      replier.reply('[' + room + '] 의 그룹전 관객 순위' + Lw + '\n\n' + rankinglist.sort((a, b) => b.split(' : ')[1].split('관객')[0] - a.split(' : ')[1].split('관객')[0]).map(e => (rankinglist.indexOf(e) + 1) + '위ㅣ' + e).join('\n'));
      }



   // 그룹전 결과 확인 명령어 처리
   if ((msg.indexOf("나랑 오스카 보러 가지 않을래") != -1 && yoil == 0) || (msg == "!그룹전결과" && sender == sadmin)) {
      let resultMessage =[];
      resultMessage.push("[그룹전 결과]");      

      let cinemaScores = {
         seasonsci: {score: 0,  audience: 0, percentage: 0 },
         macaoci: {score: 0,  audience: 0, percentage: 0 },
         seasonsne: {score: 0,  audience: 0, percentage: 0 },
         macaone: {score: 0,  audience: 0, percentage: 0 },
         seasonsma: {score: 0,  audience: 0, percentage: 0 },
         macaoma: {score: 0,  audience: 0, percentage: 0 }
   };

      function calculateScore(totalAudience) {
         if (totalAudience >= 8000) return { score: totalAudience * 1.0, percentage: 100 };
         if (totalAudience >= 6000) return { score: totalAudience * 0.8, percentage: 80 };
         if (totalAudience >= 4000) return { score: totalAudience * 0.6, percentage: 60 };
         if (totalAudience >= 2000) return { score: totalAudience * 0.4, percentage: 40 };
         return { score: totalAudience * 0.2, percentage: 20 };
   }

      // 각 그룹의 멤버별로 점수 계산 및 합산
      function processGroupScore(groupName) {
         let totalAudience = 0;

         let totalPercentage = 0;
         
         // 그룹 내 각 sender들에 대해 처리
         for (let user in smgr[room][groupName]) {
            let senderAudience = smgr[room][groupName][user];
            let scoreData = calculateScore(senderAudience);
            totalAudience += senderAudience;
            totalPercentage += scoreData.percentage;
         }

         
         // 해당 그룹의 cinemaScores 업데이트
         cinemaScores[groupName].audience = totalAudience;
         cinemaScores[groupName].percentage = totalPercentage;
         cinemaScores[groupName].score = totalAudience * totalPercentage;
   }
   // 각 그룹에 대해 점수 계산
   processGroupScore("seasonsci");  // 사계(시)
   processGroupScore("macaoci");    // 마카오(시)
   processGroupScore("seasonsne");  // 사계(네)
   processGroupScore("macaone");    // 마카오(네)
   processGroupScore("seasonsma");  // 사계(마)
   processGroupScore("macaoma");    // 마카오(마)


   // 각 그룹의 점수와 관객수 출력
      // 각 그룹의 시, 네, 마 점수를 비교하여 승리 계산
      let saWinCount = 0;
      let maWinCount = 0;

      // 시 점수 비교
      if (cinemaScores["seasonsci"].score > cinemaScores["macaoci"].score) {
         saWinCount++;
         resultMessage.push("\n[시]: 사계 승!");
      } else if (cinemaScores["seasonsci"].score < cinemaScores["macaoci"].score) {
         maWinCount++;
         resultMessage.push("\n[시]: 마카오 승!");
      } else {
         resultMessage.push("\n[시]: 동점!");
      }
      resultMessage.push("사  계: 총" + cinemaScores["seasonsci"].score + "점\n(" + cinemaScores["seasonsci"].audience + " * " + cinemaScores["seasonsci"].percentage + "%)");
      resultMessage.push("마카오: 총" + cinemaScores["macaoci"].score + "점\n(" + cinemaScores["macaoci"].audience + " * " + cinemaScores["macaoci"].percentage + "%)");
      // 네 점수 비교
      if (cinemaScores["seasonsne"].score > cinemaScores["macaone"].score) {
         saWinCount++;
         resultMessage.push("\n[네]: 사계 승!");
      } else if (cinemaScores["seasonsne"].score < cinemaScores["macaone"].score) {
         maWinCount++;
         resultMessage.push("\n[네]: 마카오 승!");
      } else {
         resultMessage.push("\n[네]: 동점!");
      }
      resultMessage.push("사계: 총" + cinemaScores["seasonsne"].score + "점\n(" + cinemaScores["seasonsne"].audience + " * " + cinemaScores["seasonsne"].percentage + "%)");
      resultMessage.push("마카오: 총" + cinemaScores["macaone"].score + "점\n(" + cinemaScores["macaone"].audience + " * " + cinemaScores["macaone"].percentage + "%)");
      // 마 점수 비교
      if (cinemaScores["seasonsma"].score > cinemaScores["macaoma"].score) {
         saWinCount++;
         resultMessage.push("\n[마]: 사계 승!");
      } else if (cinemaScores["seasonsma"].score < cinemaScores["macaoma"].score) {
         maWinCount++;
         resultMessage.push("\n[마]: 마카오 승!");
      } else {
         resultMessage.push("\n[마]: 동점!");
      }
      resultMessage.push("사계: 총" + cinemaScores["seasonsma"].score + "점\n(" + cinemaScores["seasonsma"].audience + " * " + cinemaScores["seasonsma"].percentage + "%)");
      resultMessage.push("마카오: 총" + cinemaScores["macaoma"].score + "점\n(" + cinemaScores["macaoma"].audience + " * " + cinemaScores["macaoma"].percentage + "%)");



      // 승리 그룹 판별
      let list = [];             //전체 멤버
      let listattend = [];       //점수가 있는 참여자
      let winnerlist = [];       //승리자 멤버 텍스트 입력
      let rankinglist = [];
      if (saWinCount > maWinCount) {
         resultMessage.push("\n사계 승리(사계: "+saWinCount+" 마카오: "+maWinCount+")");
         for(k in smgr[room]['smdiceRolls']){
            listattend.push(k);       // 요리점수가 있는 참여자를 listattend에 추가
            rankinglist.push(k + ':' + (smgr[room]['smdiceRolls'][k]) + '관객');      // 관객 정보를 리스트에 추가
         }
         for(i in smgr[room]['smgroups']['seasons']) list.push(smgr[room]['smgroups']['seasons'][i]);
         for(let j = 0; j < list.length; j++) {
            if(listattend.includes(list[j])){     //점수획득자가 사계팀에 속해있는 경우
               modifypoint(room, list[j], saWinCount * 5000)
               //userinfo[room][list[j]][9] = userinfo[room][list[j]][9] + (saWinCount * 5000);
               winnerlist.push(list[j] + ": "+ (saWinCount * 5000) +"포인트\n");
            }
         }
         resultMessage.push("\n그룹원에게 " + (saWinCount * 5000) + " 포인트 지급\n\n명단:\n"+winnerlist.join(''));
         fs.write(vips, JSON.stringify(userinfo, null, 4));
         
      } else if (maWinCount > saWinCount) {
         resultMessage.push("\n마카오 승리(사계: "+saWinCount+" 마카오: "+maWinCount+")");
         for(k in smgr[room]['smdiceRolls']) listattend.push(k);       // 요리점수가 있는 참여자를 listattend에 추가
         for(i in smgr[room]['smgroups']['macao']) list.push(smgr[room]['smgroups']['macao'][i]);
         for(let j = 0; j < list.length; j++) {
            if(listattend.includes(list[j])){     //점수획득자가 마카오팀에 속해있는 경우
               modifypoint(room, list[j], maWinCount * 5000)
               //userinfo[room][list[j]][9] = userinfo[room][list[j]][9] + (maWinCount * 5000);
               winnerlist.push(list[j] + ": "+ (maWinCount * 5000) +"포인트\n");
            }
         }
         resultMessage.push("\n그룹원에게 " + (maWinCount * 5000) + " 포인트 지급\n\n명단:\n"+winnerlist.join(''));
         fs.write(vips, JSON.stringify(userinfo, null, 4));
      } else if(maWinCount == saWinCount) {
         resultMessage.push("동점입니다. 다음 기회에...");
      }
      // 관객 순위 정렬
      rankinglist.sort((a, b) => b.split(':')[1].split('관객')[0] - a.split(':')[1].split('관객')[0]);   
      // 1위 이름 추출
      //let firstPlaceName = rankinglist[0].split(' : ')[0];   
      // 1위 이름만 출력
      //resultMessage.push("그룹전 1위: " + firstPlaceName +"\n2000 포인트 제공");
      //modifypoint(room, firstPlaceName, 2000)
   // 최종 결과 출력
      replier.reply(resultMessage.join("\n"));

      // smgroupfile 업데이트   
      smgr[room]['smgroups'] = { seasons: [], macao: [] };    //팀 명단
      smgr[room]['smgroupsattends'] = { seasons: 0, macao: 0 };    // 팀 참석자 인원 체크
      smgr[room]['smdiceRolls'] = {};                              // 참석자: 점수 저장 용도(전체 영화 순위 체크를 위함)
      smgr[room]['seasonsci'] = {};
      smgr[room]['seasonsne'] = {};                      // 각 팀별 시와 네와 마의 점수 저장 용도
      smgr[room]['seasonsma'] = {};                       // 각 팀별 시와 네와 마의 점수 저장 용도
      smgr[room]['macaoci'] = {};
      smgr[room]['macaone'] = {};
      smgr[room]['macaoma'] = {};
      fs.write(smgroupfile, JSON.stringify(smgr, null, 4));
   }

   if(msg == "!그룹전초기화"){
      smgr[room]['smgroups'] = { seasons: [], macao: [] };    //팀 명단
      smgr[room]['smgroupsattends'] = { seasons: 0, macao: 0 };    // 팀 참석자 인원 체크
      smgr[room]['smdiceRolls'] = {};                              // 참석자: 점수 저장 용도(전체 영화 순위 체크를 위함)
      smgr[room]['seasonsci'] = {};
      smgr[room]['seasonsne'] = {};                      // 각 팀별 시와 네와 마의 점수 저장 용도
      smgr[room]['seasonsma'] = {};                       // 각 팀별 시와 네와 마의 점수 저장 용도
      smgr[room]['macaoci'] = {};
      smgr[room]['macaone'] = {};
      smgr[room]['macaoma'] = {};
      fs.write(smgroupfile, JSON.stringify(smgr, null, 4));
   }

   //보드게임 검색 관련
   if(msg == '!보겜뽑기') {
      createUserAccount(room, sender);
      if(userinfo[room][sender][8] >= 10000) {
         let sumbg = []; // 현재 보드게임 리스트를 담을 배열
         let choosebg; //선택된 보드게임
         let choicemsg = [];// 결과 메시지 구성
         for(let i = 0; i < bgdata['bgrank'].length; i++) {
            sumbg.push(bgdata['bgrank'][i]['name']);
         }
         choosebg = sumbg[generateScore(sumbg.length,0)]; 


         for(let i = 0; i < bgdata['bgrank'].length; i++) {
            if(choosebg == bgdata['bgrank'][i]['name']) {
               choicemsg.push("순위: "+bgdata['bgrank'][i]['id']+"위\n");
               choicemsg.push("이름: "+bgdata['bgrank'][i]['name']+"\n");
            }
         }         
         if(actoritem[room][sender].includes(choosebg)){
            choicemsg.push("중복 보드게임입니다.")
         }
         else{
            actoritem[room][sender].push(choosebg);
            choosebg = [];
            fs.write(actori, JSON.stringify(actoritem, null, 4));
         }
         userinfo[room][sender][8] = userinfo[room][sender][8] - 10000;
         modifybg(room, sender);
         replier.reply(sender+"님 보드게임 뽑기 결과\n"+ choicemsg.join('') + '\n현재 마일리지: ' + userinfo[room][sender][8] + 'Milege');
         useritem[room][sender][3] = actoritem[room][sender].length * 10;
         fs.write(vipi, JSON.stringify(useritem, null, 4));
         fs.write(vips, JSON.stringify(userinfo, null, 4));
      } 
      else { // 지역보다 포인트이 유저가 더 있는지 체크한다.{
         replier.reply('[' + sender + '] 님 마일리지 거지\n현재 마일리지: ' + userinfo[room][sender][8] + 'Milege\n\n');
         }                
      }

   if(msg == '!보겜뽑기10') {
      createUserAccount(room, sender);
      if(userinfo[room][sender][8] >= 95000) {
         let sumbg = []; // 현재 보드게임 리스트를 담을 배열
         let choosebg =''; //선택된 보드게임
         let choicebgs = [];
         let choicemsg = [];// 결과 메시지 구성
         for(let i = 0; i < bgdata['bgrank'].length; i++) {
            sumbg.push(bgdata['bgrank'][i]['name']);
         }

         for(let j = 0; j < 10; j++) {
            choosebg = sumbg[generateScore(sumbg.length,0)]; 
            choicebgs.push(choosebg);
         }

         for(let l = 0; l < choicebgs.length; l++){      //뽑힌 보드게임 10개를 넣는다
            for(let i = 0; i < bgdata['bgrank'].length; i++) {    //전체 보드게임 리스트를 넣는다
               if(choicebgs[l] == bgdata['bgrank'][i]['name']) {     //그리고 동일한지 비교한다.
                  if(choicebgs[l] == bgdata['bgrank'][i]['name']) {
                     if(actoritem[room][sender].includes(choicebgs[l])){      //중첩 여부 체크
                        choicemsg.push('[중첩]')  
                     }
                     choicemsg.push(' - '+bgdata['bgrank'][i]['name']+"(");
                     choicemsg.push(bgdata['bgrank'][i]['id']+"위)\n");
                  }               
               }
            }
         }

         for(l = 0; l < choicebgs.length; l++){
            for(let k = 0; k <= actoritem[room][sender].length; k++){
               if(actoritem[room][sender].includes(choicebgs[l])){
                  break;
               }
               else{
                  actoritem[room][sender].push(choicebgs[l]);
               }
            }
         }
         fs.write(actori, JSON.stringify(actoritem, null, 4));
         modifybg(room, sender);
         modifymileage(room, sender, -95000);
         replier.reply(sender+"님 보겜(10개) 획득 리스트\n\n"+ choicemsg.join('') + '\n현재 마일리지: ' + userinfo[room][sender][8] + 'Milege');
         choicebgs = [];
         useritem[room][sender][3] = actoritem[room][sender].length * 10;
         fs.write(vipi, JSON.stringify(useritem, null, 4));
         //fs.write(vips, JSON.stringify(userinfo, null, 4));
      } 
      else { // 지역보다 포인트이 유저가 더 있는지 체크한다.{
            replier.reply('[' + sender + '] 님 마일리지 거지\n현재 마일리지: ' + userinfo[room][sender][8] + 'Milege\n\n');
            return;
         }
   }

   if(msg == "!내보겜정보") {
      createUserAccount(room, sender);
      let myinfo = [];
      if(actoritem[room][sender] != undefined){
      myinfo.push('☆[' + sender + ']님 보드게임 정보☆'+Lw+'\n');
      let bgs = [];      
      //replier.reply(actoritem[room][sender].length);

      for(let k = 0; k < actoritem[room][sender].length; k++){
         bgs.push(actoritem[room][sender][k]+"\n");
         }
      myinfo.push('보드게임 총'+bgs.length+'개\n'+bgs.sort().join("")+'\n\n');
      useritem[room][sender][3] = bgs.length * 10;
      myinfo.push('추가 보상 포인트는'+useritem[room][sender][3]+'입니다.');
      fs.write(vipi, JSON.stringify(useritem, null, 4));
      }
      else{
         myinfo.push(sender+'님의 보드게임은 없습니다.');
      }
      replier.reply(myinfo.join(''));     
   }


   // 경마 관련 코드로 교환까지 함께 설정

   if (msg == "!경마선정" && admin.includes(sender) && yoil == 6) {
      prepareRace(replier);
    }
  
   if (msg.startsWith("!마권 ") && horserace.selectedNames  && yoil == 6) {
   let [animalName, searchword] = msg.substr(4).split("/");
   if (!horserace.selectedNames.includes(animalName)) {
      replier.reply("오류: " + animalName + "은(는) 선정된 말이 아닙니다.");
      return;
   }
   if (!attend_sagae.includes(searchword)) {
      replier.reply("오류: 잘못된 글자입니다.");
      return;
   }
   if (!horserace.bets[animalName]) {
      horserace.bets[animalName] = {};
   }
   if (!horserace.bets[animalName][sender]) {
      horserace.bets[animalName][sender] = 0;
   }
   for(let k = 0; k < 7; k++){      // 0부터 6까지 돌아서 총 7개 슬롯 카운트
      if(searchword == attend_sagae[k] && attendbonus[room][sender][k] > 0){
         horserace.bets[animalName][sender] += 1;
         attendbonus[room][sender][k] -= 1;
         fs.write(attendb, JSON.stringify(attendbonus, null, 4));
         replier.reply(sender + "님이 " + animalName + "에 " + searchword + "를 투자했습니다.");
         fs.write(hracefile, JSON.stringify(horserace, null, 2));
      }
   }
   }
  
   if (msg == "!경마진행상황" && racePrepared && yoil == 6) {
   let status = "현재 마권 구매 내역:\n"+Lw;
   for (let i = 0; i < horserace.selectedNames.length; i++) {
      let animal = horserace.selectedNames[i];
      status += animal + ":\n";
      if (horserace.bets[animal]) {
         for (let bettor in horserace.bets[animal]) {
         status += "  " + bettor + ": " + horserace.bets[animal][bettor] + " 장\n";
         }
      } else {
         status += "  투자자 없음!\n";
      }
   }
   replier.reply(status);
   }

   if (msg == "!경마시작" && admin.includes(sender) && yoil == 6) {
      if(racePrepared && !raceStarted){
      positions = Array(numHorses).fill(0);
      finished = false;
      raceStarted = true;
      replier.reply("사계", "경마 게임을 시작합니다!\n모든 말이 출발 선상에 위치해있습니다.");
      displayTrack(replier);
      race(replier);
      }
      else if(raceStarted){
         replier.reply("이미 경마가 진행중입니다.");
      }
      else if(!racePrepared){
         replier.reply("다음 경기 준비중입니다.");
      }
   }
  
    if (msg == "!경마초기화" && admin.includes(sender) && yoil == 6) {
      horserace = {};
      fs.write(hracefile, JSON.stringify(horserace, null, 2));
   }
  
    if(msg.startsWith('!교환 ')) {
      createUserAccount(room, sender);
      let cost_item = msg.substr(4);
      if(cost_item == "") {
         return;
      }
      for(let j in attend_sagae) {
        if(attend_sagae[j] == cost_item){  
            if(useritem[room][sender][11] > 0) { // 교환권 있는지 체크
            
               useritem[room][sender][11] -= 1;
               attendbonus[room][sender][j] += 1;
               fs.write(vipi, JSON.stringify(useritem, null, 4));
               fs.write(attendb, JSON.stringify(attendbonus, null, 4));
               replier.reply(sender+'님 '+cost_item+' 획득 완료\n보유 교환권: '+useritem[room][sender][11] +'장');
               return;
            }
         }
      }
   }


   if (msg.startsWith('!배우생성')){
      createUserAccount(room, sender);
      if(growthactor[room][sender][0] == 0){             // 센더가 성장형배우를 가지고 있는지 여부 확인
         let actorname = msg.substr(6).trim();
            replier.reply("배우 생성 진행중...");
            java.lang.Thread.sleep(2000);
         if(actorname != "") {                                    //액터 이름이 공백이 아니라면
            growthactor[room][sender][0] = actorname;
            fs.write(g_actor, JSON.stringify(growthactor, null, 4));
            replier.reply("배우 생성 완료\n배우명: "+actorname+"")
         }
         else{
            replier.reply("이름을 입력해주세요.")
         }
      }
      else{
         replier.reply(sender+"님은 배우가 이미 있네요\n배우 이름: "+growthactor[room][sender][0]);
      }

   }


   if (msg.startsWith('!배우강화')){
      createUserAccount(room, sender);
      if(growthactor[room][sender][0] != 0){             // 센더가 성장형배우를 가지고 있는지 여부 확인
         let actorname = msg.substr(6).trim();
         if(actoritem[room][sender].includes(actorname).valueOf()) {                                    //액터가 해당 사람에게 존재하는지
            //replier.reply(actorname+" 존재 확인 완료")
            upgradeActor(room, sender, actorname, replier)
         }
         else{
            replier.reply("해당 배우가 존재하지 않습니다.\n내배우정보로 확인해보세요.")
         }
      }
      else{
         replier.reply(sender+"님은 배우부터 생성하세요.");
      }
      fs.write(g_actor, JSON.stringify(growthactor, null, 4));
   }


   
   if (msg.startsWith('!배우전체강화')){
      createUserAccount(room, sender);
      if(growthactor[room][sender][0] != 0){             // 센더가 성장형배우를 가지고 있는지 여부 확인
         let actorstar = msg.substr(8).trim();
         if(actorstar >=5 && actorstar <= 7){
            let myactorlist = [];
            for(let k = 0; k <= actoritem[room][sender].length; k++){
               for(let i = 0; i < data['allactor'].length; i++) {
                  if(actoritem[room][sender][k] == data['allactor'][i]['name']) {
                     if(data['allactor'][i]['star'] == actorstar){
                        myactorlist.push(actoritem[room][sender][k]);  
                     }
                  }
               }
            }
            if(myactorlist.length >= 1) {                                    //액터가 해당 사람에게 존재하는지
               //replier.reply(actorstar+"성: "+ myactorlist.length +"명 존재 확인 완료")
               upgradeAllActor(room, sender, myactorlist, actorstar, replier)
            }
            else{
               replier.reply(actorstar+"성 배우가 존재하지 않습니다.\n내배우정보로 확인해보세요.")
            }
         }  
         else{ replier.reply("5부터 7까지 숫자만 입력 가능합니다.")}
      }
      else{
         replier.reply(sender+"님은 배우부터 생성하세요.");
      }
      fs.write(g_actor, JSON.stringify(growthactor, null, 4));
   }


   // 🟡 펀딩 예측 참여 명령어
   if (msg.startsWith("!펀딩 ") && funding.funding_start === 1) {
   const input = msg.substring(4).trim(); // "!펀딩 초대박/2"
   handlePrediction(sender, input, room, replier);
   return;
   }

   // 🟠 펀딩 촬영 명령어 (펀딩 대상자만 실행 가능)
   if (msg === "!펀딩촬영" && funding.funding_start === 1) {
   if (sender !== funding.collect_fmember) {
      replier.reply("해당 명령어는 오늘의 펀딩 대상자만 사용할 수 있습니다.");
      return;
   }
   const resultText = confirmShootingRandom(replier);
   replier.reply(resultText);
   return;
   }

   if (msg === "!펀딩갱신") {
   if (jsonattend['today'] !== today) {
      const candidates = jsonattend['list']['사계'] || [];
      if (candidates.length > 0) {
         pick = candidates[Math.floor(Math.random() * candidates.length)];
         funding.collect_fmember = pick;
      }
      jsonattend['today'] = today;
      jsonattend['list'] = {};
      fs.write(path, JSON.stringify(jsonattend, null, 4));

      startFunding(replier);
   } else {
      replier.reply("이미 오늘 펀딩이 시작되었습니다.");
   }
   }

   if (msg === "!펀딩현황") {
   showFundingStatus(replier);
   return;
   }

   if (msg === "!펀딩기록") {
   showFundingHistory(replier);
   return;
   }

   if (msg === "!역대펀딩기록") {
   showAllFundingHistory(replier);
   return;
   }

   if (msg === "!펀딩랭킹") {
   showFundingRanking(replier);
   return;
   }

   // 펀딩 적중률 전체 랭킹
   if (msg === "!펀딩적중률") {
   showFundingAccuracy(replier);
   return;
   }
   // 특정 유저(아룡양) 디버그: 날짜별 적중 목록
   if (msg.startsWith("!펀딩적중률/")) {
   let inputname = msg.substring(7).trim();
   showFundingUserAudit(replier, inputname);
   return;
   }

   // 펀딩 데이터 개요 확인 (기간/유저목록)
   if (msg === "!펀딩개요") {
   showFundingQuickAudit(replier);
   return;
   }


     // 저장된 정보로 간편 조회
  if (msg === "!운세") {
    const info = userFortuneMap[sender];
    if (!info) {
      replier.reply(
        "✨ 당신의 오늘, AI가 미리 알려드려요\n\n" +
        "아직 저장된 정보가 없습니다.\n" +
        "\"!운세저장 이름/생년월일(YYYYMMDD)\" 으로 먼저 저장해주세요.\n\n" +
        "바로 조회하려면:\n" +
        "!운세 이름/생년월일(YYYYMMDD)\n" +
        "예) !운세 홍길동/20010101"
      );
      return;
    }
    replyFortune(sender, replier, info.name, info.birthYYYYMMDD);
    return;
  }


  // 정보 저장: !운세저장 이름/19841030
  if (msg.startsWith("!운세저장 ")) {
    const raw = msg.substring("!운세저장 ".length).trim();
    const sep = raw.indexOf("/");
    if (sep <= 0) {
      replier.reply(
        "❌ 입력 형식이 올바르지 않습니다.\n\n" +
        "!운세저장 이름/생년월일(YYYYMMDD)\n" +
        "예) !운세저장 홍길동/20010101"
      );
      return;
    }
    const name = raw.substring(0, sep).trim();
    const birth = raw.substring(sep + 1).trim();

    if (!name) {
      replier.reply("❌ 이름을 입력해주세요.");
      return;
    }
    if (!isValidYMD(birth)) {
      replier.reply(
        "❌ 생년월일 형식이 올바르지 않습니다.\n\n" +
        "8자리 숫자(YYYYMMDD)이며 실제로 존재하는 날짜여야 합니다.\n" +
        "예) 20010101"
      );
      return;
    }

    // 저장
    userFortuneMap[sender] = {
      name: name,
      birthYYYYMMDD: birth
    };
    try {
      fs.write(idinfo, JSON.stringify(userFortuneMap, null, 4));
    } catch (e) {
      //logError("파일 저장 오류: " + e);
      replier.reply("⚠️ 정보를 파일에 저장하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    replier.reply(
      "✅ 저장되었습니다!\n\n" +
      "저장된 사용자: " + sender + "\n" +
      "이름: " + name + "\n" +
      "생년월일: " + birth + "\n\n" +
      "이제 \"!운세\" 라고 보내면 저장된 정보로 바로 운세를 알려드려요."
    );
    return;
  }

  // 직접 조회: !운세 이름/생년월일(YYYYMMDD)
  if (msg.startsWith("!운세 ")) {
    const indata = msg.substring(4).trim();
    const partsdata = indata.split("/");
    if (partsdata.length !== 2) {
      replier.reply(
        "❌ 입력 형식이 올바르지 않습니다.\n\n" +
        "!운세 이름/생년월일(YYYYMMDD)\n" +
        "예) !운세 홍길동/20010101"
      );
      return;
    }
    const names = partsdata[0].trim();
    const births = partsdata[1].trim();
    if (!names) {
      replier.reply("❌ 이름을 입력해주세요.");
      return;
    }
    if (!isValidYMD(births)) {
      replier.reply(
        "❌ 생년월일 형식이 올바르지 않습니다.\n\n" +
        "8자리 숫자(YYYYMMDD)이며 실제로 존재하는 날짜여야 합니다.\n" +
        "예) 20010101"
      );
      return;
    }
    // ✅ 인자 순서 주의: (sender, replier, name, birth)
    replyFortune(sender, replier, names, births);
    return;
  }


  if (msg === '!중복체크') {
  createUserAccount(room, sender); // 계정 초기화

  let myActors = actoritem[room][sender] || [];
  let seen = new Set();
  let duplicates = [];

  // 중복 배우 탐색
  for (let i = 0; i < myActors.length; i++) {
    let actor = myActors[i];
    if (seen.has(actor)) {
      duplicates.push(actor);
    } else {
      seen.add(actor);
    }
  }

  // 결과 처리
   if (duplicates.length > 0) {
      // 보상 지급 (중복 있으면 무조건 1장 지급)
      if (!useritem[room][sender]) useritem[room][sender] = Array(20).fill(0);
      useritem[room][sender][10] += 1;
      fs.write(vipi, JSON.stringify(useritem, null, 4));

      replier.reply(
         sender + "님의 배우 리스트에서 중복이 발견되었습니다.\n" +
         "중복 배우: " + duplicates.join(", ") + "\n" +
         "🎁 한정 캐스팅권 1장을 지급했습니다."
      );
   } else {
      replier.reply(sender + "님의 배우 리스트에는 중복이 없습니다!");
   }
   }



   // 1) !영화제도전 영화제목
   if (msg.indexOf("!영화제도전") === 0) {
   let title = msg.replace("!영화제도전", "").trim();
   let resOscarChallenge = oscarChallenge(room, sender, title);
      if (resOscarChallenge) {
         replier.reply(resOscarChallenge);
      }
   }




   // 2) !영화제후보
   if (msg === "!영화제후보") {
   let resOscarNominees = showOscarNominees(room);
   replier.reply(resOscarNominees);
   }

   // 3) !영화제결과 (admin + 토요일 전용)
   if (msg === "!영화제결과") {
   let resOscarWinners = showOscarWinners(room, sender);
   if (resOscarWinners) {
      replier.reply(resOscarWinners);
   }
   }

   // 4) !역대영화제순위
   if (msg === "!역대영화제순위") {
   let resOscarRank = showOscarRanking(room);
   replier.reply(resOscarRank);
   }

   // 5) !영화제참가순위
   if (msg === "!영화제참가순위") {
   let resOscarPartRank = showOscarParticipateRanking(room);
   replier.reply(resOscarPartRank);
   }

// ■ 영화제 총점 순위 (사계 기준, 테스티스트 방 전용)
if (msg == "!영화제순위") {
    if (room != "테스티스트") {
        return;
    }

    // 후보 데이터 (사계 기준)
    var filmCandidates = oscar["사계"].entries;

    if (!filmCandidates || filmCandidates.length == 0) {
        replier.reply("영화제 후보 데이터가 없습니다.");
        return;
    }

    // 정렬: total 점수 내림차순
    var sorted = filmCandidates.slice();
    sorted.sort(function(a, b) {
        return b.total - a.total;
    });

    // TOP 10
    var limit = 10;
    if (sorted.length < limit) limit = sorted.length;

    var out = [];
    out.push("🎬 영화제 총점 순위 TOP " + limit + "\n");

    for (var i = 0; i < limit; i++) {
        var mv = sorted[i];
        out.push(
            (i + 1) + "위: " + mv.title +
            " (" + mv.user + ")\n" +
            "총점: " + mv.total + "\n"
        );
    }

    replier.reply(out.join("\n"));
}



// function 함수 끝

}




//펑션들
//출석 관련
function getToday() {
  const now = new Date();
  return now.getFullYear() + "-" + (now.getMonth() + 1).toString().padStart(2, '0') + "-" + now.getDate().toString().padStart(2, '0');
}

// specialScore 계산 (예: 7월 25일이면 725)
function getSpecialScore() {
  const now = new Date();
  return Number((now.getMonth() + 1).toString() + now.getDate().toString());
}

function handleAttendanceByDay(room, sender, yoil, attendmsg) {
  if (room === '사계' && (yoil === 1 || yoil === 5)) {
    bwchef[room]['process'] = 1;
    if (bwchef[room]['bwteams']['black'].length < bwchef[room]['bwteams']['white'].length) {
      bwchef[room]['bwteams']['black'].push(sender);
      attendmsg.push('\n' + sender + '님은 흑팀입니다!');
    } else if (bwchef[room]['bwteams']['black'].length === bwchef[room]['bwteams']['white'].length) {
      let bwteamchange = generateScore(2, 0);
      if (bwteamchange === 0) {
        bwchef[room]['bwteams']['black'].push(sender);
        attendmsg.push('\n' + sender + '님은 흑팀입니다!');
      } else {
        bwchef[room]['bwteams']['white'].push(sender);
        attendmsg.push('\n' + sender + '님은 백팀입니다!');
      }
    } else {
      bwchef[room]['bwteams']['white'].push(sender);
      attendmsg.push('\n' + sender + '님은 백팀입니다!');
    }
    fs.write(bwyorisa, JSON.stringify(bwchef, null, 4));
  }

  if (room === '사계' && yoil === 3) {
    bwchef[room]['process'] = 1;
    fs.write(bwyorisa, JSON.stringify(bwchef, null, 4));
  }

  if (room === '사계' && yoil === 0) {
    if (smgr[room]['smgroups']['seasons'].length <= smgr[room]['smgroups']['macao'].length) {
      smgr[room]['smgroups']['seasons'].push(sender);
      attendmsg.push('\n' + sender + '님 그룹: 사계');
    } else {
      smgr[room]['smgroups']['macao'].push(sender);
      attendmsg.push('\n' + sender + '님 그룹: 마카오');
    }
    fs.write(smgroupfile, JSON.stringify(smgr, null, 4));
  }

  if (yoil === 2 || yoil === 4) {
    useritem[room][sender][8]++;
    fs.write(vipi, JSON.stringify(useritem, null, 4));
    attendmsg.push('\n슬롯 1개 획득');
  }

  if (yoil > 0 && yoil <= 5) {
    var sat = generateScore(7, 0);
    attendbonus[room][sender][sat]++;
    if (room === '사계' || room === '테스티스트') {
      attendmsg.push('\n획득글자: [' + attend_sagae[sat] + '] 획득');
    }
    if (room === '신전') {
      attendmsg.push('\n획득글자: [' + attend_sinjun[sat] + '] 획득');
    }
    fs.write(attendb, JSON.stringify(attendbonus, null, 4));
  }
}






//배우의 성급 정보를 먼저 확인
//성급 정보에 따른 확률 돌림
//성공 및 실패 결과 반환
//해당 배우 삭제 진행
function upgradeAllActor(room, sender, myactorlist, star, replier) {
   //replier.reply(myactorlist.length+"명");

   let rate, success, successcount;
   
   const successRates = {
      5: { threshold: 35, growth: 20 },
      6: { threshold: 30, growth: 40 },
      7: { threshold: 20, growth: 1000 }
  };
  successcount = 0;
  let stat = [0, 0, 0, 0, 0];
   for(let k = 0; k < myactorlist.length; k++){
      rate = generateScore(100, 1);
      success = 0;
      stat = [0, 0, 0, 0, 0];
      if (successRates[star] && rate <= successRates[star].threshold) {
         growthactor[room][sender][1]++;
         growthactor[room][sender][2] = growthactor[room][sender][2] + successRates[star].growth;
         success = 1;
         successcount++;
      }
     if (success == 1 || success == 0) {
         let scoreLimit = success == 1 ? 10 : 4;
         for (let i = 0; i < 5; i++) {
            stat[i] = stat[i] + generateScore(scoreLimit, 1);
            growthactor[room][sender][3 + i] = growthactor[room][sender][3 + i] + stat[i];
         }
      }
      growthactor[room][sender][8]++;        // 성장 시도 횟수 1 증가
      actoritem[room][sender] = actoritem[room][sender].filter(name => name !== myactorlist[k]);        // 소모 배우 소모 시킴
   }
   fs.write(actori, JSON.stringify(actoritem, null, 4));   
   let resultMsg = [];
      resultMsg.push("[배우 성장 결과]\n소모 배우: "+myactorlist.length+"명 ("+star+"성)");
      resultMsg.push("\n성장 배우: "+growthactor[room][sender][0]+"(레벨: "+growthactor[room][sender][1]+")");
      resultMsg.push("성공 횟수: "+successcount+"회");
      resultMsg.push("성장배우 포인트: "+growthactor[room][sender][2]+"포인트");
      resultMsg.push("\n[속성]:\n연출: "+growthactor[room][sender][3]+"(+"+stat[0]+")");
      resultMsg.push("연기: "+growthactor[room][sender][4]+"(+"+stat[1]+")");
      resultMsg.push("스토리: "+growthactor[room][sender][5]+"(+"+stat[2]+")");
      resultMsg.push("예술: "+growthactor[room][sender][6]+"(+"+stat[3]+")");
      resultMsg.push("예능: "+growthactor[room][sender][7]+"(+"+stat[4]+")");
   replier.reply(resultMsg.join('\n'));
   fs.write(g_actor, JSON.stringify(growthactor, null, 4));
}

function upgradeActor(room, sender, actorname, replier) {
   let star;

   for(let i = 0; i < data['allactor'].length; i++) {          // 배우 성급 확인
      if(data['allactor'][i]['name'] == actorname){
         star = data['allactor'][i]['star'];
      }
   }
   let rate = generateScore(100, 1)
   let success = 0;
   let stat = [];

   if (star == 5){                     // 성급 별로 성공 확률 체크하여 성공 여부 확인
      if(rate < 35){
         growthactor[room][sender][1]++;
         growthactor[room][sender][2] = growthactor[room][sender][2] + 20;
         success = 1;
      }
   }
   else if (star == 6){
      if(rate < 30){
         growthactor[room][sender][1]++;
         growthactor[room][sender][2] = growthactor[room][sender][2] + 40;
         success = 1;
      }
   }
   else if (star == 7){
      if(rate < 20){
         growthactor[room][sender][1]++;
         growthactor[room][sender][2] = growthactor[room][sender][2] + 1000;
         success = 1;
      }
   }

   if(success == 1){
      for(i=0;i<5;i++){
         stat[i] = generateScore(10, 1)
         growthactor[room][sender][3+i] = growthactor[room][sender][3+i] + stat[i];
      }
   }
   else if(success == 0){
      for(i=0;i<5;i++){
         stat[i] =  generateScore(4, 1)
         growthactor[room][sender][3+i] = growthactor[room][sender][3+i] + stat[i];
      }
   }
   growthactor[room][sender][8]++;        // 성장 시도 횟수 1 증가
   actoritem[room][sender] = actoritem[room][sender].filter(name => name !== actorname);        // 소모 배우 소모 시킴
   fs.write(actori, JSON.stringify(actoritem, null, 4));
   let resultMsg = [];
   if(success == 1){      
      resultMsg.push("[배우 성장 성공]\n소모 배우: "+actorname+"("+star+"성)");
      resultMsg.push("\n성장 배우: "+growthactor[room][sender][0]+"(레벨: "+growthactor[room][sender][1]+")");
      resultMsg.push("포인트 증가:"+growthactor[room][sender][2]+"포인트");
      resultMsg.push("\n[속성]:\n연출: "+growthactor[room][sender][3]+"("+stat[0]+")");
      resultMsg.push("\n연기: "+growthactor[room][sender][4]+"("+stat[1]+")");
      resultMsg.push("\n스토리: "+growthactor[room][sender][5]+"("+stat[2]+")");
      resultMsg.push("\n예술: "+growthactor[room][sender][6]+"("+stat[3]+")");
      resultMsg.push("\n예능: "+growthactor[room][sender][7]+"("+stat[4]+")");
   }
   else if(success == 0){
      resultMsg.push("[배우 성장 실패]\n소모 배우: "+actorname+"("+star+")");
      resultMsg.push("\n성장 배우: "+growthactor[room][sender][0]+"(레벨: "+growthactor[room][sender][1]+")");
      resultMsg.push("\n[속성]:\n연출: "+growthactor[room][sender][3]+"("+stat[0]+")");
      resultMsg.push("\n연기: "+growthactor[room][sender][4]+"("+stat[1]+")");
      resultMsg.push("\n스토리: "+growthactor[room][sender][5]+"("+stat[2]+")");
      resultMsg.push("\n예술: "+growthactor[room][sender][6]+"("+stat[3]+")");
      resultMsg.push("\n예능: "+growthactor[room][sender][7]+"("+stat[4]+")");
   }
   replier.reply(resultMsg.join('\n'));
   fs.write(g_actor, JSON.stringify(growthactor, null, 4));
}

function getFirstChar(str) {
   return str.split("").map(e => e.normalize("NFKD")[0]).join("");
}

function onStartCompile() {
    fs.write(path, JSON.stringify(jsonattend, null, 4));
     fs.write(vips, JSON.stringify(userinfo, null, 4));
     fs.write(vipi, JSON.stringify(useritem, null, 4)); 
     fs.write(actori, JSON.stringify(actoritem, null, 4));
     fs.write(attendslog, JSON.stringify(attendlog, null, 4));
     fs.write(attendb, JSON.stringify(attendbonus, null, 4));
     fs.write(hracefile, JSON.stringify(horserace, null, 2));
     fs.write(bwyorisa, JSON.stringify(bwchef, null, 4));
     fs.write(smgroupfile, JSON.stringify(smgr, null, 4));
}

function createUserAccount(room, sender) {
   if(userinfo[room] == undefined) {
      userinfo[room] = {};
   }
   if(userinfo[room][sender] == undefined) {
      userinfo[room][sender] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];  // vip레벨[0],경험치[1],마일리지이용권횟수[2],초성당첨횟수[3],눈치 참여횟수[4],야바위참여횟수 [5], 찰싹 횟수[6], 마일여행 횟수[7], 마일 [8], 포인트 [9]
   }
   fs.write(vips, JSON.stringify(userinfo, null, 4));

   if(bwchef[room] == undefined) {
      bwchef[room] = {};
   }
   if(bwchef[room]['bwteams'] == undefined) {
      bwchef[room]['bwteams'] = { black: [], white: [] };
      bwchef[room]['bwscores'] = { black: 0, white: 0 };
      bwchef[room]['bwteamsattends'] = { black: 0, white: 0 };
      bwchef[room]['bwdiceRolls'] = {};
      bwchef[room]['process'] = 0;
      bwchef[room]['yoricount'] = 0;      
   }
   
   fs.write(bwyorisa, JSON.stringify(bwchef, null, 4));

   if(smgr[room] == undefined) {
      smgr[room] = {};
   }
   if(smgr[room]['smgroups'] == undefined) {
      smgr[room]['smgroups'] = { seasons: [], macao: [] };    //팀 명단
      smgr[room]['smgroupsattends'] = { seasons: 0, macao: 0 };    // 팀 참석자 인원 체크
      smgr[room]['smdiceRolls'] = {};                              // 참석자: 점수 저장 용도(전체 영화 순위 체크를 위함)
      smgr[room]['seasonsci'] = {};
      smgr[room]['seasonsne'] = {};                      // 각 팀별 시와 네와 마의 점수 저장 용도
      smgr[room]['seasonsma'] = {};                       // 각 팀별 시와 네와 마의 점수 저장 용도
      smgr[room]['macaoci'] = {};
      smgr[room]['macaone'] = {};
      smgr[room]['macaoma'] = {};     
   }
   fs.write(smgroupfile, JSON.stringify(smgr, null, 4));

   
  if(useritem[room] == undefined) {
      useritem[room] = {};
   }
   if(useritem[room][sender] == undefined) {
      useritem[room][sender] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // 눈치 [0],랭커[1],초성[2],배우추가보상[3],영화기대치[4],티어표시[5],영화촬영횟수[6],초대박횟수[7], 슬롯횟수[8], 각색수치[9], 배우중첩포인트[10], 마권교환권[11], 아직 미정 [12])
   }
   if(useritem[room][sender][11] == undefined) {      //11번째 값을 쓰기 위해서 없는 경우 0을 추가해주는 구문
      useritem[room][sender][11] = 0;
   }
   if(useritem[room][sender][12] == undefined) {      //11번째 값을 쓰기 위해서 없는 경우 0을 추가해주는 구문
      useritem[room][sender][12] = 0;
   }
   fs.write(vipi, JSON.stringify(useritem, null, 4));
   
   
   if(actoritem[room] == undefined) {
      actoritem[room] = {};
   }
   if(actoritem[room][sender] == undefined) {
      actoritem[room][sender] = [];
   }
   fs.write(actori, JSON.stringify(actoritem, null, 4));


   if(growthactor[room] == undefined) {
      growthactor[room] = {};
   }
   if(growthactor[room][sender] == undefined) {
      growthactor[room][sender] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];    // 이름 [0], 성장 레벨[1], 성장 돈[2], 성장 능력치:연출[3], 성장 능력치:연기[4], 성장 능력치:스토리[5], 성장 능력치:예능[6], , 성장 능력치:예능[7], 성장 시도횟수[8]
   }
   fs.write(g_actor, JSON.stringify(growthactor, null, 4));


   if(usepoint[room] == undefined) {
      usepoint[room] = {};
   }
   if(usepoint[room][sender] == undefined) {
      usepoint[room][sender] = 0;
   }
   fs.write(upoint, JSON.stringify(usepoint, null, 4));
   
   if(attendlog[room] == undefined) {
      attendlog[room] = {};
   }
   if(attendlog[room][sender] == undefined) {
      attendlog[room][sender] = [];
   }
   fs.write(attendslog, JSON.stringify(attendlog, null, 4));

   if(attendbonus[room] == undefined) {
      attendbonus[room] = {};
   }
   if(attendbonus[room][sender] == undefined) {
      attendbonus[room][sender] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // 시네마를부탁해,산본노는사람들 외에 3개의 슬롯을 미리 추가함
   }
   if(attendbonus['list'][room] == undefined) attendbonus['list'][room] = [];    //각 방마다 룸을 참여자 만들어서 넣기
   if(attendbonus['list']['words'] == undefined) attendbonus['list']['words'] = {};    //하나 만들어서 전체 숫자 모였는지 체크
   if(attendbonus['list']['words'][room] == undefined) attendbonus['list']['words'][room] = [];    //하나 만들어서 전체 숫자 모였는지 체크
   fs.write(attendb, JSON.stringify(attendbonus, null, 4));

   if(yabawidon[room] == undefined) {
      yabawidon[room] = {};
   }
   if(yabawidon[room]['score'] == undefined) {
      yabawidon[room]['score'] = 0;
   }
   if(yabawidon[room]['addpoint'] == undefined) {
      yabawidon[room]['addpoint'] = 0;
   }
   if(yabawidon[room]['usepoint'] == undefined) {
      yabawidon[room]['usepoint'] = 0;
   }
   if(yabawidon['week'] == undefined) {
      yabawidon['week'] = 0;
   }
   
   fs.write(ydon, JSON.stringify(yabawidon, null, 4));


}


function modifymileage(room, sender, num) {
    userinfo[room][sender][8] = userinfo[room][sender][8] + num;
        fs.write(vips, JSON.stringify(userinfo, null, 4)); 
}

function modifypoint(room, sender, num) {
    userinfo[room][sender][9] = userinfo[room][sender][9] + num;
    if(num < 0) {
        userinfo[room][sender][1] = userinfo[room][sender][1] + (Math.abs(num)/100);
    }
    fs.write(vips, JSON.stringify(userinfo, null, 4));


    if(num > 0){
      yabawidon[room]['addpoint'] = yabawidon[room]['addpoint'] + num
    }
    else if(num < 0){
      yabawidon[room]['usepoint'] = yabawidon[room]['usepoint'] + num
    }
    fs.write(ydon, JSON.stringify(yabawidon, null, 4));
}  
   
   
function randomgiveitem(room, sender) {
   if(String(useritem[room][sender][5]).endsWith('3')){
      useritem[room][sender][2] = useritem[room][sender][2]+1;
   }
   else if(String(useritem[room][sender][5]).endsWith('7')){
      useritem[room][sender][1] = useritem[room][sender][1]+1;
   }
   else if(String(useritem[room][sender][5]).endsWith('0')){
      useritem[room][sender][0] = useritem[room][sender][0]+1;
   }
   fs.write(vipi, JSON.stringify(useritem, null, 4));
}
   
function modifyactor(room, sender) {
   let actor7 = [];
   let actor6 = [];
   let actor5 = [];   
   for(let k = 0; k <= actoritem[room][sender].length; k++){
      for(let i = 0; i < data['allactor'].length; i++) {
         if(actoritem[room][sender][k] == data['allactor'][i]['name']) {
            if(data['allactor'][i]['star'] == 6){
               actor6.push(actoritem[room][sender][k]);               
            }
            else if(data['allactor'][i]['star'] == 7){
               actor7.push(actoritem[room][sender][k]);               
            }
            else if(data['allactor'][i]['star'] == 5){
               actor5.push(actoritem[room][sender][k]);
            }
            break;
         }
      }
   }
   useritem[room][sender][3] = growthactor[room][sender][2] + (actor7.length * 500)+(actor6.length * 20)+(actor5.length * 10)
   fs.write(vipi, JSON.stringify(useritem, null, 4));
}

function modifybg(room, sender) {
   let bg = [];   
   for(let k = 0; k <= actoritem[room][sender].length; k++){//너의  보겜을 넣는다 실시
      bg.push(actoritem[room][sender][k]);
   }
   useritem[room][sender][3] = bg * 10;
   fs.write(vipi, JSON.stringify(useritem, null, 4));
}
   
function onNotificationPosted(sbn, sm) {
   var packageName = sbn.getPackageName();
   if (!packageName.startsWith("com.kakao.tal")) return;
   var actions = sbn.getNotification().actions;
   if (actions == null) return;
   var userId = sbn.getUser().hashCode();
   for (var n = 0; n < actions.length; n++) {
      var action = actions[n];
      if (action.getRemoteInputs() == null) continue;
      var bundle = sbn.getNotification().extras;

      var msg = bundle.get("android.text").toString();
      var sender = bundle.getString("android.title");
      var room = bundle.getString("android.subText");
      if (room == null) room = bundle.getString("android.summaryText");
      var isGroupChat = room != null;
      if (room == null) room = sender;
      var replier = new com.xfl.msgbot.script.api.legacy.SessionCacheReplier(packageName, action, room, false, "");
      var icon = bundle.getParcelableArray("android.messages")[0].get("sender_person").getIcon().getBitmap();
      var image = bundle.getBundle("android.wearable.EXTENSIONS");
      if (image != null) image = image.getParcelable("background");
      var imageDB = new com.xfl.msgbot.script.api.legacy.ImageDB(icon, image);
      com.xfl.msgbot.application.service.NotificationListener.Companion.setSession(packageName, room, action);
      if (this.hasOwnProperty("responseFix")) {
         responseFix(room, msg, sender, isGroupChat, replier, imageDB, packageName, userId != 0);
      }
   }
}
  
function read(originpath) {
   var file = new java.io.File(originpath);
   if (file.exists() == false) return null;
   try {
      var fis = new java.io.FileInputStream(file);
      var isr = new java.io.InputStreamReader(fis);
      var br = new java.io.BufferedReader(isr);
      var temp_br = br.readLine();
      var temp_readline = '';
      while ((temp_readline = br.readLine()) !== null) {
         temp_br += '\n' + temp_readline;
      }
      try {
         fis.close();
         isr.close();
         br.close();
         return temp_br;
      } catch (error) {
         return error;
      }
   } catch (error) {
      return error;
   }
}



//경마 관련 함수 하단
function getRandomElements(arr, count) {
   const shuffled = arr.slice().sort(() => 0.5 - Math.random());
   return shuffled.slice(0, count);
 }
 
 function getCommentary() {
   const randomName = horserace.selectedNames[Math.floor(Math.random() * horserace.selectedNames.length)];
   const randomCommentary = commentary[Math.floor(Math.random() * commentary.length)];
   return randomName + " " + randomCommentary;
 }
 
 function prepareRace(replier) {
   if (raceStarted){
     replier.reply('이미 말이 준비중입니다.');
     return;
   }
   selectedAnimals = getRandomElements(animals, numHorses);
   selectedNames = getRandomElements(hnames, numHorses);
   selectedFeatures = getRandomElements(features, numHorses);
   racePrepared = true;
   horserace = { selectedNames: selectedNames, selectedFeatures: selectedFeatures, selectedAnimals: selectedAnimals, bets: {}, racePrepared: racePrepared }; // 초기화
   fs.write(hracefile, JSON.stringify(horserace, null, 2));
   let raceInfo = "경마 준비가 완료되었습니다!\n선정된 말:\n";
   for (let i = 0; i < numHorses; i++) {
     raceInfo += i+1+ '. ' +selectedNames[i] + " (" + selectedFeatures[i] + ")\n\n";
   }
   replier.reply('사계',raceInfo);
 }
 
 function displayTrack(replier) {
   let trackDisplay = "";
   let sortedPositions = positions.map((pos, index) => { return { index: index, pos: pos }; }).sort((a, b) => b.pos - a.pos);
   for (let i = 0; i < numHorses; i++) {
     let horseIndex = sortedPositions.findIndex(h => h.index === i);
     let track = "-".repeat(trackLength);
     let rank = sortedPositions.findIndex(h => h.index === i);
     let emoji = horserace.selectedAnimals[i][rank];
     if (positions[i] < trackLength) {
       track = track.substring(0, positions[i]) + emoji + track.substring(positions[i] + 1);
     } else {
       track = track.substring(0, trackLength - 1) + emoji;
     }
     let name = horserace.selectedNames[i];
     let padding = " ".repeat(4 - name.length); // 이름 길이에 따른 여백 추가
     trackDisplay += name + padding + ": " + track + " (위치: " + (positions[i] + 1) + "칸)\n";
   }
   replier.reply('사계',trackDisplay + "\n - " + getCommentary());
 }
 
 function updatePositions() {
   for (let i = 0; i < numHorses; i++) {
     positions[i] += Math.floor(Math.random() * 5)+1;
   }
 }
 
 function checkFinish(replier) {
   let finishedHorses = positions.map((pos, index) => { return { index: index, pos: pos }; }).filter(h => h.pos >= trackLength);
   if (finishedHorses.length > 0) {
     finished = true;
     finishedHorses.sort((a, b) => b.pos - a.pos);
     let result = "\n🏆 경마 결과 🏆\n";
     finishedHorses.slice(0, 3).forEach((h, i) => {
       result += (i + 1) + "등: " + horserace.selectedNames[h.index] + " (" + horserace.selectedAnimals[h.index][0] + ")\n";
     });
     replier.reply(result);
 
     // 1등 말에 투자한 사람 표시
     let winner = horserace.selectedNames[finishedHorses[0].index];
     if (horserace.bets[winner]) {
       result += "\n"+ winner+ " 투자자:\n";
       for (let bettor in horserace.bets[winner]) {
         result += bettor + ": " + horserace.bets[winner][bettor] + " 장\n";
         useritem['사계'][bettor][11] += horserace.bets[winner][bettor];
       }
     }
     replier.reply('사계',result);
 
     // 선정된 말 리스트 초기화
     horserace = {};
     fs.write(hracefile, JSON.stringify(horserace, null, 2));
   }
 }
 
 
 function race(replier) {
   if (!finished) {
     updatePositions();
     displayTrack(replier);
     checkFinish(replier);
     if (!finished) {
       setTimeout(() => race(replier), 5000);
     } else {
       raceStarted = false; // Reset the race status
     }
   }
 }


 // 그룹전 관련
 // 점수 생성 함수 - 예시 점수를 생성하는 함수 (사용자 포인트에 따라 다른 방식으로 정의 가능)
function generateScore(maxint, minint) {
   return Math.floor(Math.random() * maxint) + minint; // 최대 맥스 인트내에서 민인트값 더한 랜덤 점수 생성
}

   function gemini(prompt) {
      let json;    
      let result;    
      try {        
          let response = org.jsoup.Jsoup.connect("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyAv_4JrN54LrV2LgTjmv3qwRGBRrUlJqvM")            
              .header("Content-Type", "application/json")            
              .requestBody(JSON.stringify({
                  "contents": [
                      { 
                          "role": "user",
                          "parts": [{"text" : prompt}]  
                      }
                  ],
                  "generationConfig": {
                      "temperature": 1,  
                      "topK": 100,          
                      "topP": 0.9
                  
                    
                  }
                  
              }))       
              .method(org.jsoup.Connection.Method.POST)       
              .ignoreContentType(true)            
              .ignoreHttpErrors(true)            
              .timeout(200000)            
              .post();         
          json = JSON.parse(response.text());        
          result = json.candidates[0].content.parts[0].text;    
      } catch(e) {        
          result = e;        
          Log.e(e);    
      }    
      return result; 
  }



  //펀딩 관련
  function selectFundingMember() {
  const candidates = jsonattend['list']['사계'] || [];
  if (candidates.length > 0) {
    const randomIndex = Math.floor(Math.random() * candidates.length);
    funding.collect_fmember = candidates[randomIndex];
    fs.write(fundingFile, JSON.stringify(funding, null, 4));
    return funding.collect_fmember;
  }
  return null;
}

function startFunding(replier) {
  funding.funding_start = 1;
   const pick = yesterdayList[Math.floor(Math.random() * yesterdayList.length)];
   funding.collect_fmember = pick;
  funding.predictions = {};
  funding.funded_users = [];
  funding.confirmed_shooting = false;
  fs.write(fundingFile, JSON.stringify(funding, null, 4));
   replier.reply("금일 펀딩 영화 제작자는... \n"+funding.collect_fmember+"님 입니다.\n!펀딩 결과/횟수로 투자하세요.\n결과: 초대박, 대박, 레전드, 메가히트, 히트\n횟수: 1~3")
}

function handlePrediction(user, input, room, replier) {
  const now = new Date();
  if (now.getHours() >= 12) {
    replier.reply("⚠️ 펀딩은 자정부터 정오(12:00) 이전까지만 가능합니다.");
    return;
  }

  const allowed = ["초대박", "대박", "레전드", "메가히트", "히트"];

  // 예외 처리 강화
  if (!input.includes("/")) {
    replier.reply("❗ 형식 오류: !펀딩 [결과]/[횟수] 형식으로 입력해주세요.");
    return;
  }

  const parts = input.split("/");
  if (parts.length !== 2) {
    replier.reply("❗ 입력값이 올바르지 않습니다. 예: !펀딩 초대박/2");
    return;
  }

  const guess = parts[0].trim();
  const count = parseInt(parts[1].trim());

  if (!allowed.includes(guess)) {
    replier.reply("❗ '" + guess + "'는 허용되지 않는 결과입니다. 가능한 결과: " + allowed.join(", "));
    return;
  }

  if (isNaN(count) || count < 1 || count > 3) {
    replier.reply("❗ 횟수는 1~3 사이의 숫자로 입력해주세요.");
    return;
  }

  if (funding.predictions[user]) {
    replier.reply("⚠️ 이미 펀딩에 참여하셨습니다. 한 번만 가능합니다.");
    return;
  }

  const cost = count * 5000;
  if (!userinfo[room] || !userinfo[room][user] || userinfo[room][user][9] < cost) {
    replier.reply("💸 포인트가 부족합니다. (필요: " + cost + ")");
    return;
  }

  // 정상 등록
  funding.predictions[user] = {};
  funding.predictions[user][guess] = count;
  funding.funded_users.push(user);
  modifypoint(room, user, -cost);

  fs.write(fundingFile, JSON.stringify(funding, null, 4)); // 동기화

  replier.reply(user + "님, " + guess + " " + count + "회 예측 완료! 남은 포인트: " + userinfo[room][user][9]);
}


function confirmShootingRandom(replier) {
  const now = new Date();
  if (now.getHours() < 12) {
    replier.reply("🎥 촬영은 정오(12:00) 이후에만 가능합니다.");
    return;
  }

  // 🎯 결과 랜덤 선택
  const allowed = ["초대박", "대박", "레전드", "메가히트", "히트"];
  const result = allowed[Math.floor(Math.random() * allowed.length)];

  // 결과 기록
  funding.selected_result = result;
  funding.confirmed_shooting = true;

  // 📝 펀딩 내역 저장
  if (!funding.history) funding.history = [];
  funding.history.push({
    date: getToday(), // ex. "2025.06.13"
    shooter: funding.collect_fmember || "미지정",
    result: result,
    predictions: JSON.parse(JSON.stringify(funding.predictions)), // 깊은 복사 멤버와 allowed와 카운트 저장
    funded_users: [funding.funded_users] // 얕은 복사 (배열 내 값은 문자열이므로 안전) 멤버명만 저장
  });

  let resultMsg = ["🎬 촬영 결과: " + result];

  // ✅ 유저별 결과 처리
  for (let user of funding.funded_users) {
    let prediction = funding.predictions[user] || {};
    let correctCount = prediction[result] || 0;

    if (correctCount > 0) {
      // 🎯 예측 적중 시 보상
      let reward = correctCount * 30000;
      modifypoint("사계", user, reward);
      resultMsg.push(user + "님 적중! 💰 " + reward + "포인트");
    } else {
      // ❌ 예측 실패 시 한캐 지급 (전체 베팅 수만큼)
      let totalBets = 0;
      for (let key in prediction) {
        if (typeof prediction[key] === "number") {
          totalBets += prediction[key];
        }
      }

      if (!useritem["사계"][user]) useritem["사계"][user] = Array(20).fill(0);
      useritem["사계"][user][10] += totalBets;

      resultMsg.push(user + "님 실패. 🎁 한캐 " + totalBets + "개 지급!");
    }
  }

  // 🌟 초대박 달성 시 촬영자에게 추가 보너스
  if (result === "초대박" && funding.collect_fmember) {
    modifypoint("사계", funding.collect_fmember, 10000);
    resultMsg.push("\n🎁 " + funding.collect_fmember + "님은 초대박 달성으로 10,000포인트 보너스를 획득했습니다!");
  }

  // ⛔ 펀딩 초기화
  funding.funding_start = 0;

  // 📁 데이터 저장
  fs.write(vipi, JSON.stringify(useritem, null, 4));
  fs.write(fundingFile, JSON.stringify(funding, null, 4));

  return resultMsg.join("\n");
}


function showFundingStatus(replier) {
  let msg = ["📊 오늘의 펀딩 현황"];

  // 🎥 촬영자 출력
  if (funding.collect_fmember) {
    msg.push("🎥 오늘의 펀딩 촬영자: " + funding.collect_fmember + "\n");
  } else {
    msg.push("🎥 오늘의 펀딩 촬영자: 아직 선정되지 않았습니다.\n");
  }

  // 📦 카테고리 초기화
  const categories = ["초대박", "대박", "레전드", "메가히트", "히트"];
  let sortedPredictions = {};
  for (let c of categories) {
    sortedPredictions[c] = [];
  }

  // 📊 유저별 예측값 그룹화
  let users = funding.funded_users;
  if (Array.isArray(users[0])) users = users[0]; // 평탄화 (이중 배열 방지)

  for (let user of users) {
    let prediction = funding.predictions[user];
    if (!prediction) continue;

    for (let result in prediction) {
      if (!categories.includes(result)) continue;
      let count = prediction[result];
      if (typeof count === "number" && count > 0) {
        sortedPredictions[result].push({ user: user, count: count });
      }
    }
  }

  // 🔽 결과 표시
  for (let c of categories) {
    msg.push("\n🔹 " + c);
    if (sortedPredictions[c].length === 0) {
      msg.push("- 없음");
    } else {
      for (let entry of sortedPredictions[c]) {
        msg.push("- " + entry.user + " " + entry.count + "회");
      }
    }
  }

  replier.reply(msg.join("\n"));
}



function showFundingHistory(replier) {
  if (!funding.history || funding.history.length === 0) {
    replier.reply("📁 저장된 펀딩 기록이 없습니다.");
    return;
  }

  let recent = funding.history.slice(-5).reverse();
  let lines = ["📈 최근 펀딩 결과 요약 (최대 5건)"+Lw];

  for (let record of recent) {
    lines.push("📅 "+record.date+" - 🎯 펀딩 대상자: "+record.shooter);
    lines.push("🔚 결과: "+record.result);
    for (let user in record.predictions) {
      let userPred = [];
      for (let key in record.predictions[user]) {
        userPred.push(key + record.predictions[user][key]+"회");
      }
      lines.push("  - "+user+": "+userPred.join(", "));
    }
    lines.push("--------------------");
  }

  replier.reply(lines.join("\n"));
}

function showAllFundingHistory(replier) {
  if (!funding.history || funding.history.length === 0) {
    replier.reply("📉 아직 저장된 펀딩 기록이 없습니다.");
    return;
  }

  let lines = ["📜 역대 펀딩 기록", ""];

  let shooterCount = {};
  let resultCount = {};

  for (let record of funding.history) {
    let date = record.date || "알수없음";
    let shooter = record.shooter || "미지정";
    let result = record.result || "미정";

    // 기록 표시
    lines.push(date + " / " + shooter + " / " + result);

    // 촬영자 집계
    if (!shooterCount[shooter]) shooterCount[shooter] = 0;
    shooterCount[shooter]++;

    // 결과 집계
    if (!resultCount[result]) resultCount[result] = 0;
    resultCount[result]++;
  }

  // 구분선
  lines.push("\n---------------------------------");
  lines.push("📊 펀딩 요약");

  // 촬영자 선정 횟수
  lines.push("촬영 선정 횟수");
  for (let shooter in shooterCount) {
    lines.push("- " + shooter + ": " + shooterCount[shooter] + "회");
  }

  // 결과 집계
  lines.push("\n펀딩 결과 집계");
  const categories = ["초대박", "대박", "레전드", "메가히트", "히트"];
  for (let c of categories) {
    let count = resultCount[c] || 0;
    lines.push("- " + c + ": " + count + "회");
  }

  replier.reply(lines.join("\n"));
}


function showFundingRanking(replier) {
  let countMap = {};

  // 🔁 과거 펀딩 기록 기반으로 전체 예측 횟수 계산
  for (let record of funding.history || []) {
    for (let user in record.predictions) {
      if (!countMap[user]) countMap[user] = 0;
      for (let key in record.predictions[user]) {
        countMap[user] += record.predictions[user][key];
      }
    }
  }

  // 🧮 정렬용 배열로 변환
  let sorted = [];
  for (let user in countMap) {
    sorted.push([user, countMap[user]]);
  }

  sorted.sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) {
    replier.reply("📊 펀딩 참여 기록이 없습니다.");
    return;
  }

  // 🏆 출력
  let lines = ["🏆 펀딩 참여 랭킹"];
  sorted.forEach(([user, total], idx) => {
    lines.push(idx+1+". "+user+" - 총 "+total+"회 예측");
  });

  replier.reply(lines.join("\n"));
}
/***** 공통 유틸 *****/
function _sendChunks(replier, text, chunkSize) {
  var size = chunkSize || 1500; // 카톡 안전 분할 길이
  for (var i = 0; i < text.length; i += size) {
    replier.reply(text.substring(i, i + size));
  }
}

// 라벨/이름 정규화: 앞뒤 공백 제거, 연속 공백 1개로
// (유니코드 NFC 등은 Rhino 기본 제공 X → 문자열 기반만 수행)
function _norm(s, opt) {
  if (!s) return "";
  var t = String(s);
  if (opt && opt.trim !== false) t = t.replace(/^\s+|\s+$/g, "");
  if (opt && opt.squeezeSpaces) t = t.replace(/\s+/g, " ");
  if (opt && opt.lowercase) t = t.toLowerCase();
  return t;
}

/***** 핵심 집계 로직: 질문에 주신 showFundingAccuracy와 동일 규칙 *****/
function showFundingAccuracy(replier, options) {
  options = options || {};
  if (!funding || !funding.history || funding.history.length === 0) {
    replier.reply("📉 펀딩 적중 기록이 없습니다.");
    return;
  }

  var stats = []; // {user,total,correct,accuracy}
  for (var rIdx = 0; rIdx < funding.history.length; rIdx++) {
    var record = funding.history[rIdx];
    var actual = options.normalize
      ? _norm(record.result, options.normalize)
      : record.result;

    var predictions = record.predictions || {};
    for (var user in predictions) if (predictions.hasOwnProperty(user)) {
      // 정규화된 사용자 키를 쓸지 원본을 쓸지 결정
      var userKey = options.normalize ? _norm(user, options.normalize) : user;

      // stats에 userKey가 있는지 수동 탐색
      var foundIndex = -1;
      for (var i = 0; i < stats.length; i++) {
        if (stats[i].user === userKey) { foundIndex = i; break; }
      }

      // 해당 record 내에서의 합계/정답 카운트 산출
      var userPred = predictions[user] || {};
      var addTotal = 0;
      var addCorrect = 0;
      for (var guess in userPred) if (userPred.hasOwnProperty(guess)) {
        var normGuess = options.normalize ? _norm(guess, options.normalize) : guess;
        var c = userPred[guess] || 0;
        addTotal += c;
        if (normGuess === actual) addCorrect += c;
      }

      if (foundIndex >= 0) {
        stats[foundIndex].total += addTotal;
        stats[foundIndex].correct += addCorrect;
      } else {
        stats.push({ user: userKey, total: addTotal, correct: addCorrect });
      }
    }
  }

  // 정확도 계산
  for (var j = 0; j < stats.length; j++) {
    var s = stats[j];
    s.accuracy = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
  }

  // 정렬: 정확도 ↓, 정답 ↓
  stats.sort(function(a, b) {
    if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
    return b.correct - a.correct;
  });

  // 출력
  var lines = ["🎯 펀딩 적중률 랭킹"];
  for (var k = 0; k < stats.length; k++) {
    var s2 = stats[k];
    lines.push((k + 1) + ". " + s2.user + " - " + s2.correct + "/" + s2.total + "건 적중 (" + s2.accuracy + "%)");
  }
  _sendChunks(replier, lines.join("\n"));
}

/***** 특정 사용자(예: 아룡양) 디버그: 날짜별 정답 목록을 출력 *****/
function showFundingUserAudit(replier, targetName, options) {
  options = options || {};
  if (!targetName) { replier.reply("대상 닉네임을 입력하세요."); return; }
  if (!funding || !funding.history || funding.history.length === 0) {
    replier.reply("📉 펀딩 적중 기록이 없습니다.");
    return;
  }
  var target = options.normalize ? _norm(targetName, options.normalize) : targetName;

  var total = 0, correct = 0;
  var lines = ["🔎 닉네임: " + target];
  var hits = [];

  for (var rIdx = 0; rIdx < funding.history.length; rIdx++) {
    var record = funding.history[rIdx];
    var actual = options.normalize ? _norm(record.result, options.normalize) : record.result;
    var userPred = null;

    // predictions에서 키 정규화 매칭
    var preds = record.predictions || {};
    for (var user in preds) if (preds.hasOwnProperty(user)) {
      var key = options.normalize ? _norm(user, options.normalize) : user;
      if (key === target) { userPred = preds[user]; break; }
    }

    if (!userPred) continue;

    // 해당 날짜 합계/정답
    var dayTotal = 0, dayCorrect = 0;
    var breakdown = [];
    for (var guess in userPred) if (userPred.hasOwnProperty(guess)) {
      var normGuess = options.normalize ? _norm(guess, options.normalize) : guess;
      var c = userPred[guess] || 0;
      dayTotal += c;
      if (normGuess === actual) dayCorrect += c;
      breakdown.push(normGuess + ":" + c);
    }

    total += dayTotal;
    correct += dayCorrect;
    if (dayCorrect > 0) {
      hits.push(
        "- " + record.date + " | 결과:" + actual +
        " | 적중:" + dayCorrect +
        " | 예측(" + breakdown.join(", ") + ")"
      );
    }
  }

  lines.push("합계: " + correct + "/" + total + " (" + (total>0 ? Math.round(correct*100/total) : 0) + "%)");
  if (hits.length > 0) {
    lines.push("✅ 적중 날짜 목록:");
    for (var i = 0; i < hits.length; i++) lines.push(hits[i]);
  } else {
    lines.push("적중한 날짜가 없습니다.");
  }
  _sendChunks(replier, lines.join("\n"));
}

/***** 전체 데이터 검증(요약): 파일/메모리 차이 의심 시 사용 *****/
function showFundingQuickAudit(replier, options) {
  options = options || {};
  if (!funding || !funding.history || funding.history.length === 0) {
    replier.reply("📉 펀딩 적중 기록이 없습니다.");
    return;
  }
  var n = funding.history.length;
  var firstDate = funding.history[0].date;
  var lastDate  = funding.history[n-1].date;

  var users = {};
  for (var rIdx = 0; rIdx < funding.history.length; rIdx++) {
    var preds = funding.history[rIdx].predictions || {};
    for (var user in preds) if (preds.hasOwnProperty(user)) {
      var key = options.normalize ? _norm(user, options.normalize) : user;
      users[key] = 1;
    }
  }
  var names = [];
  for (var k in users) if (users.hasOwnProperty(k)) names.push(k);
  names.sort();

  var msg = [];
  msg.push("🧾 기록 개요");
  msg.push("- records: " + n);
  msg.push("- date range: " + firstDate + " ~ " + lastDate);
  msg.push("- users(" + names.length + "): " + names.join(", "));
  _sendChunks(replier, msg.join("\n"));
}




//도움말 관련
function showHelp(room, replier) {
  let helpme = [];
  helpme.push("⚔ 마일 게임 도움말 ⚔\n");
  helpme.push("🔻 도움말 전체보기 🔻" + (typeof Lw !== 'undefined' ? Lw : '') + "\n");

   if (room === "사계") {
   helpme.push("");

   helpme.push("📌 [포인트/출석]");
   helpme.push("ㅊㅅ, 출첵, 출췍 : 출석 시 랜덤 포인트 획득");
   helpme.push("!내정보 / !출석정보 / !출석정보7");
   helpme.push("!포인트순위 / !출석순위 / !탕진순위");
   helpme.push("!사망순위 / !경험치순위 / !요리순위 / !개인전순위");
   helpme.push("────────────────────────");
   helpme.push("");

   helpme.push("✈️ [여행]");
   helpme.push("!마일여행 : 6000마일로 여행 (비즈니스 이상 확률 2배)");
   helpme.push("!여행 지역명 : 포인트 사용 여행");
   helpme.push("지역별 비용:");
   helpme.push("아시아2000 오세4000 중동5000 유럽5500 아프6000 미주8000 중남미10000");
   helpme.push("────────────────────────");
   helpme.push("");

   helpme.push("💳 [마일·포인트 정보]");
   helpme.push("!마일정보 : 내 마일 보기");
   helpme.push("!마일비용 : 마일 소비표 확인");
   helpme.push("────────────────────────");
   helpme.push("");

   helpme.push("🔑 [권한 획득]");
   helpme.push("!권한 (눈치/랭커/초성)");
   helpme.push("※ 눈치 20k / 랭커 15k / 초성 10k");
   helpme.push("────────────────────────");
   helpme.push("");

   helpme.push("🎮 [미니게임 모음]");

   helpme.push("— 초성 게임 —");
   helpme.push("!초성 : 시작");
   helpme.push("!정답 단어 : 정답 제출");
   helpme.push("");

   helpme.push("— 눈치 게임 —");
   helpme.push("!눈치 : 시작");
   helpme.push("(10부터 1까지 순서대로 말하기)");
   helpme.push("");

   helpme.push("— 랭커(업다운) —");
   helpme.push("!랭커 : 실행");
   helpme.push("!업다운 숫자 : 맞추면 보상");
   helpme.push("");

   helpme.push("— 룰렛 게임 —");
   helpme.push("!룰렛참여(2000마일)");
   helpme.push("!시작");
   helpme.push("탕 : 내 차례 총알확인");
   helpme.push("");

   helpme.push("— 돈뿌리기 —");
   helpme.push("!돈뿌리기 금액");
   helpme.push("!손");
   helpme.push("");

   helpme.push("— 야바위 —");
   helpme.push("!야바위참여");
   helpme.push("!야바위참여자");
   helpme.push("");

   helpme.push("— 경마 —");
   helpme.push("!경마진행상황");
   helpme.push("!마권 말이름/보유글자");
   helpme.push("!교환 원하는글자");
   helpme.push("");

   helpme.push("— 흑백 게임 —");
   helpme.push("!흑백팀");
   helpme.push("!흑백순위");
   helpme.push("!요리 요리명");
   helpme.push("!최고요리 요리명/횟수");
   helpme.push("");

   helpme.push("— 그룹전 게임 —");
   helpme.push("!그룹전팀");
   helpme.push("!그룹전순위");
   helpme.push("!그룹전현황");
   helpme.push("!그룹전 (시/네/마)");
   helpme.push("");

   helpme.push("— 글자 게임 —");
   helpme.push("!글자정보");
   helpme.push("!글자보너스");
   helpme.push("!소원 글자");
   helpme.push("────────────────────────");
   helpme.push("");

   helpme.push("🎬 [영화·배우 시스템]");

   helpme.push("— 배우 —");
   helpme.push("!내배우정보 : 보유 배우 리스트");
   helpme.push("!배우탐색(5000마일)");
   helpme.push("!배우탐색10(47500마일)");
   helpme.push("!명캐탐색(100000마일)");
   helpme.push("!한캐탐색(한캐100)");
   helpme.push("!6성확정(한캐50)");
   helpme.push("!배우생성 배우명");
   helpme.push("!배우강화");
   helpme.push("!배우순위");
   helpme.push("");

   helpme.push("— 성장 옵션 —");
   helpme.push("!기대치증가");
   helpme.push("!기대치풀증가");
   helpme.push("!각색");
   helpme.push("!촬영시작 (6000포인트)");
   helpme.push("평범2000 히트5000 메가10000 레전드15000 초대박30000");
   helpme.push("────────────────────────");
   helpme.push("");

   helpme.push("🎬 [펀딩 시스템]");
   helpme.push("!펀딩 결과/횟수");
   helpme.push("!펀딩촬영");
   helpme.push("!펀딩현황");
   helpme.push("!펀딩기록");
   helpme.push("!역대펀딩기록");
   helpme.push("!펀딩랭킹");
   helpme.push("!펀딩적중률");
   helpme.push("!펀딩적중률/닉네임");
   helpme.push("!펀딩개요");
   helpme.push("────────────────────────");
   helpme.push("");

   helpme.push("🏆 [영화제 시스템]");
   helpme.push("!영화제도전 제목");
   helpme.push("!영화제후보");
   helpme.push("!영화제결과");
   helpme.push("!영화제참가순위");
   helpme.push("!역대영화제순위");
   helpme.push("1등10만 / 2등5만 / 3등3만 포인트 지급");
   helpme.push("3회 도전 → 한캐권1");
   helpme.push("5회 도전 → 마일여행권1");
   helpme.push("────────────────────────");
   helpme.push("");

   helpme.push("⚙️ [기타 기능]");
   helpme.push("!명언설정");
   helpme.push("!지정 명령어/출력어");
   helpme.push("────────────────────────");

   }
   else{
      // 포인트 획득
      helpme.push("📌 [포인트 획득]");
      helpme.push("- ㅊㅅ, 출첵, 출췍: 출석 시 랜덤 포인트 획득\n");

      // 여행
      helpme.push("✈️ [여행]");
      helpme.push("- !마일여행: 6000마일 소모 / 비즈니스 이상 비행 확률 2배");
      helpme.push("- !여행 (지역): 포인트로 여행 시작");
      helpme.push("  예: !여행 유럽 → 지역별 마일리지 획득\n");

      // 순위 관련
      helpme.push("🏆 [순위 관련]");
      helpme.push("- !출석순위 / !포인트순위 / !탕진순위");
      helpme.push("- !마일순위 / !보겜순위 / !경험치순위\n");

      // 보겜 관련
      helpme.push("🎲 [보겜 관련]");
      helpme.push("- !내보겜정보: 보유 보드게임 확인 (출석 보너스 반영)");
      helpme.push("- !보겜뽑기: 보겜 1개 뽑기 (10000마일)");
      helpme.push("- !보겜뽑기10: 보겜 10개 뽑기 (95000마일)\n");

      // 돈뿌리기
      helpme.push("💸 [돈뿌리기 게임]");
      helpme.push("- !돈뿌리기 (5000 이상): 포인트 기부");
      helpme.push("- !손: 남은 포인트가 있다면 획득\n");

      // 글자 게임
      helpme.push("🔤 [글자 게임]");
      helpme.push("- 출석 시 7종 글자 중 1종 랜덤 획득");
      helpme.push("- !글자정보: 보유 글자 확인");
      helpme.push("- !글자보너스: 글자 7종 1개씩 모으면 5000포인트");
      helpme.push("- !소원 (글자): 연못에 글자 투척 → 7종 모이면 추첨");
      helpme.push("  예: !소원 응\n");

      // 룰렛 게임
      helpme.push("🎰 [룰렛 게임]");
      helpme.push("- !룰렛참여: 최대 8인 참가 (2000마일)");
      helpme.push("- !시작: 룰렛 시작");
      helpme.push("- 탕: 내 차례에 외쳐서 러시안룰렛 확인\n");
   }
   replier.reply(helpme.join("\n"));
}



/*******************************************************
 * 🎬 오스카(영화제) 시스템 - 파일 1개(oscar.txt) 통합 버전
 *  - Rhino JS 호환 (ES3 스타일)
 *  - 필요 외부 변수/함수:
 *      - fs, growthactor, userinfo, useritem
 *      - modifypoint(room, user, amount)
 *      - modifymileage(room, user, amount)  // 참가상용 마일여행권 지급
 *      - getToday()                         // "YYYY.MM.DD" 또는 비슷한 문자열 반환
 *******************************************************/

/** 📁 오스카 데이터 파일 설정 (하나만 사용) */
const OSCAR_FILE = "sdcard/bot/oscar/oscar.txt";
if (!fs.read(OSCAR_FILE)) {
  fs.write(OSCAR_FILE, "{}");
}
let oscar = JSON.parse(fs.read(OSCAR_FILE));

/** 💾 오스카 데이터 저장 */
function saveOscar() {
  fs.write(OSCAR_FILE, JSON.stringify(oscar, null, 4));
}

/** 🏠 방(room)용 오스카 데이터 구조 보장 */
function ensureOscarRoom(room) {
  if (!oscar[room]) {
    oscar[room] = {
      season: 1,             // 시즌 번호(주차 개념으로 사용)
      entries: [],           // 출품작 리스트
      historyWinners: [],    // 이전 시즌 우승 스냅샷 (항상 최대 1개 유지)
      participateCount: {},  // 이번 시즌 유저별 도전 횟수
      pointsRecord: {}       // 유저별 영화제 포인트(10/5/3점 누적)
    };
    saveOscar();
  }
}

/** 🎭 성장 배우 능력치 최대값 읽기
 *  growthactor[room][user] 형식:
 *    - 배열형 예시: [이름, 레벨, 포인트, 연출, 연기, 스토리, 예술, 예능]
 *  성장 배우가 없으면 ok=false 를 반환 → 명령어 차단
 */
function getGrowthCaps(room, user) {
  let caps = {
    name: "",
    dir: 0,
    act: 0,
    story: 0,
    art: 0,
    show: 0,
    ok: false
  };

  if (!growthactor || !growthactor[room] || !growthactor[room][user]) {
    return caps; // 성장 배우 없음 → ok=false
  }

  let g = growthactor[room][user];
  // 배열형 처리
  if (g && typeof g.length === "number" && g.length > 0) {
    if (g[0]) caps.name = g[0];
    if (g[3]) caps.dir = Number(g[3]) || 0;
    if (g[4]) caps.act = Number(g[4]) || 0;
    if (g[5]) caps.story = Number(g[5]) || 0;
    if (g[6]) caps.art = Number(g[6]) || 0;
    if (g[7]) caps.show = Number(g[7]) || 0;
    caps.ok = caps.name !== "";
    return caps;
  }

  // 객체형으로 저장된 경우를 대비 (예: {name, dir, act, ...})
  if (typeof g === "object") {
    if (g.name) caps.name = g.name;
    if (g.dir) caps.dir = Number(g.dir) || 0;
    if (g.act) caps.act = Number(g.act) || 0;
    if (g.story) caps.story = Number(g.story) || 0;
    if (g.art) caps.art = Number(g.art) || 0;
    if (g.show) caps.show = Number(g.show) || 0;
    caps.ok = caps.name !== "";
  }

  return caps;
}

/** 🎲 1 ~ max 범위 랜덤 (growth 최대치 기반)
 *   generateScore(max, 1) 사용 (봇 기존 랜덤 함수)
 */
function rand1to(max) {
  let m = Number(max);
  if (isNaN(m) || m < 1) m = 1;      // 최소 1 보장
  return generateScore(m, 1);
}

/** 📝 최종 평가 점수에 따른 한줄 평가 문구 */
function getTotalComment(total) {
    if (total >= 8000) {return "🎬 역대급 걸작! 영화사의 한 페이지를 장식할 작품입니다.";    }
    if (total >= 7000) {return "🌟 예술성과 완성도 모두 압도적인 명작입니다.";    }
    if (total >= 6000) {return "🔥 강렬한 몰입감과 훌륭한 연출이 돋보이는 작품입니다.";    }
    if (total >= 5000) {return "🎞 작품성과 재미 모두 균형잡힌 수준 높은 영화입니다.";    }
    if (total >= 4000) {return "👍 전체적으로 준수하며 흥미로운 구성이 돋보입니다.";    }
    if (total >= 3000) {return "🙂 나쁘지 않은 작품입니다. 몇몇 요소가 좋은 평가를 받았습니다.";    }
    if (total >= 2000) {return "😐 무난한 수준입니다. 조금 더 다듬었다면 좋았을 작품입니다.";    }
    if (total >= 1000) {return "🫥 아쉬운 점이 조금 있습니다. 발전 가능성은 보입니다.";    }
    return "💀 여러모로 아쉬움이 남는 작품입니다. 다음 작품을 기대합니다!";
}


/** 🏅 영화제 결과 문자열 포맷용 (공통) */
function formatEntryLine(rank, entry, label) {
  return (
    rank +
    ". " +
    entry.title +
    " - " +
    entry.user +
    " (" +
    label +
    " " +
    entry.total +
    "점)"
  );
}

/** 🎬 1) !영화제도전 (영화제 출품) */
function oscarChallenge(room, sender, title) {
    ensureOscarRoom(room);
    createUserAccount(room, sender);

    // 영화 제목 없으면 오류
    if (!title || title.length === 0) {
        return "영화 제목을 입력해주세요.\n예) !영화제도전 나의 영화";
    }

    // 배우 최대치 정보 가져오기
    var actorMax = growthactor[room][sender];
    if (!actorMax) {
        return "배우 최대 능력치 데이터가 없습니다.";
    }

    // 영화제 DB
    var dataRoom = oscar[room];
    var entries = dataRoom.entries;

    // 도전 결과 생성 (기존 계산 로직 유지)
    var dirScore = getRandomAbility(actorMax.dir_max);
    var actScore = getRandomAbility(actorMax.act_max);
    var storyScore = getRandomAbility(actorMax.story_max);
    var artScore = getRandomAbility(actorMax.art_max);
    var showScore = getRandomAbility(actorMax.show_max);

    var totalScore =
        dirScore + actScore + storyScore + artScore + showScore;

    // 영화 객체 구성
    var movie = {
        user: sender,
        title: title,
        dir: dirScore,
        act: actScore,
        story: storyScore,
        art: artScore,
        show: showScore,
        total: totalScore,
        date: getToday()
    };

    // 영화제 배열에 추가
    entries.push(movie);
    fs.write(oscarFile, JSON.stringify(oscar, null, 4));

    // 출력 메시지 (UI 모듈 적용)
    return buildMovieGaugeMessage(movie, actorMax);
}


/** 🏆 2) !영화제후보 (누적 후보 조회)
 *  - 각 부문별 상위 3편 (연출/연기/스토리/예술/예능)
 *  - 시즌 내 누적 기준(매일 리셋 X, 영화제결과 때까지 유지)
 */
function showOscarNominees(room) {
  ensureOscarRoom(room);
  let dataRoom = oscar[room];
  let entries = dataRoom.entries;

  if (!entries || entries.length === 0) {
    return "현재 출품된 영화가 없습니다.";
  }

  // 각 부문별 상위 3개 뽑기
  function top3ByKey(key) {
    let arr = entries.slice(0); // 복사본
    arr.sort(function (a, b) {
      return b[key] - a[key];
    });
    let res = [];
    let i;
    for (i = 0; i < arr.length && i < 3; i++) {
      //res.push(arr[i].title + " (" + arr[i].user + ", " + arr[i][key] + "점)");
      res.push(arr[i].title + " (" + arr[i].user + ")");
    }
    return res;
  }

  let msg = [];
  msg.push("[🎖 영화제 후보작 안내]");
  msg.push("※ 누적 출품작 기준 상위 3편씩 표시됩니다.\n");

  let dirTop = top3ByKey("dir");
  msg.push("🎬 연출상 후보");
  if (dirTop.length === 0) msg.push("- 후보 없음");
  else {
    let i;
    for (i = 0; i < dirTop.length; i++) {
      msg.push((i + 1) + ". " + dirTop[i]);
    }
  }
  msg.push("");

  let actTop = top3ByKey("act");
  msg.push("🎭 연기상 후보");
  if (actTop.length === 0) msg.push("- 후보 없음");
  else {
    let i2;
    for (i2 = 0; i2 < actTop.length; i2++) {
      msg.push((i2 + 1) + ". " + actTop[i2]);
    }
  }
  msg.push("");

  let storyTop = top3ByKey("story");
  msg.push("📖 스토리상 후보");
  if (storyTop.length === 0) msg.push("- 후보 없음");
  else {
    let i3;
    for (i3 = 0; i3 < storyTop.length; i3++) {
      msg.push((i3 + 1) + ". " + storyTop[i3]);
    }
  }
  msg.push("");

  let artTop = top3ByKey("art");
  msg.push("🎨 예술상 후보");
  if (artTop.length === 0) msg.push("- 후보 없음");
  else {
    let i4;
    for (i4 = 0; i4 < artTop.length; i4++) {
      msg.push((i4 + 1) + ". " + artTop[i4]);
    }
  }
  msg.push("");

  let showTop = top3ByKey("show");
  msg.push("🎉 예능상 후보");
  if (showTop.length === 0) msg.push("- 후보 없음");
  else {
    let i5;
    for (i5 = 0; i5 < showTop.length; i5++) {
      msg.push((i5 + 1) + ". " + showTop[i5]);
    }
  }

  return msg.join("\n");
}

/** 🧮 참가상 지급
 *  - 1주간(시즌) 영화제 도전 3회 이상: 한정 캐스팅권 1장 (useritem[room][user][10]++)
 *  - 5회 이상: 마일여행권 1장 (useritem[room][user][0]++)
 *  - 영화제결과 발표 시 한 번만 처리 (시즌 리셋 전)
 */
function giveParticipantRewards(room, dataRoom) {
  let pc = dataRoom.participateCount;
  if (!pc) return [];

  let logs = [];
  let user;
  for (user in pc) {
    if (!pc.hasOwnProperty(user)) continue;
    let count = pc[user];
    if (count >= 3) {
      // 배열 존재 보장
      if (!useritem[room] || !useritem[room][user]) continue;

      // 한캐권 (10번 인덱스)
      useritem[room][user][10] = (useritem[room][user][10] || 0) + 1;
      logs.push(user + "님: 1주간 영화제 도전 " + count + "회 → 한정 캐스팅권 1장 지급");

      // 마일여행권 (0번 인덱스)
      if (count >= 5) {
        useritem[room][user][0] = (useritem[room][user][0] || 0) + 1;
        logs.push(user + "님: 1주간 영화제 도전 " + count + "회 → 마일여행권 1장 지급");
      }
    }
  }

  // 사용자 아이템 저장
  fs.write(vipi, JSON.stringify(useritem, null, 4)); // ※ 기존에 사용하던 vipi 경로 활용

  return logs;
}

/** 🏁 3) !영화제결과 (토요일 + admin 전용)
 *  - 조건:
 *      1) sender === "admin"
 *      2) 요일: 토요일 (new Date().getDay() === 6)
 *  - 기능:
 *      - 최종 평가 점수(total) 기준 TOP 10 출력
 *      - 1위: 100000포인트 + 영화제순위 10점
 *      - 2위:  50000포인트 + 영화제순위 5점
 *      - 3위:  30000포인트 + 영화제순위 3점
 *      - 참가상 지급(3회/5회 조건)
 *      - 직전 시즌 우승 스냅샷 1개만 historyWinners에 저장
 *      - entries, participateCount 초기화 + season 증가
 */
function showOscarWinners(room, sender) {
  ensureOscarRoom(room);
  let dataRoom = oscar[room];

  // 권한 체크
  if (sender !== "admin") {
    return "권한이 없습니다.";
  }

  // 요일 체크 (토요일만)
  let todayYoil = new Date().getDay(); // 0:일 ~ 6:토
  if (todayYoil !== 6) {
    return "영화제 결과는 토요일 오후 10시에 발표됩니다.";
  }

  let entries = dataRoom.entries;
  if (!entries || entries.length === 0) {
    return "영화제가 취소되었습니다.(참가작 부족)";
  }

  // total 기준 정렬
  let arr = entries.slice(0);
  arr.sort(function (a, b) {
    return b.total - a.total;
  });

  // TOP 10
  let top = [];
  let i;
  for (i = 0; i < arr.length && i < 10; i++) {
    top.push(arr[i]);
  }

  // 수상 처리: 1~3위
  let msg = [];
  msg.push("[🏆 영화제 결과 발표]");
  msg.push("시즌: " + dataRoom.season);
  msg.push("");

  let pointsRecord = dataRoom.pointsRecord;
  if (!pointsRecord) {
    pointsRecord = {};
    dataRoom.pointsRecord = pointsRecord;
  }

  function addOscarPoint(user, score) {
    if (!pointsRecord[user]) pointsRecord[user] = 0;
    pointsRecord[user] += score;
  }

  // 1위
  if (top.length >= 1) {
    let e1 = top[0];
    modifypoint(room, e1.user, 100000);
    addOscarPoint(e1.user, 10);
    msg.push(formatEntryLine(1, e1, "대상") + " / 보상: 100000포인트, 영화제순위 10점 추가");
  }

  // 2위
  if (top.length >= 2) {
    let e2 = top[1];
    modifypoint(room, e2.user, 50000);
    addOscarPoint(e2.user, 5);
    msg.push(formatEntryLine(2, e2, "최우수상") + " / 보상: 50000포인트, 영화제순위 5점 추가");
  }

  // 3위
  if (top.length >= 3) {
    let e3 = top[2];
    modifypoint(room, e3.user, 30000);
    addOscarPoint(e3.user, 3);
    msg.push(formatEntryLine(3, e3, "우수상") + " / 보상: 30000포인트, 영화제순위 3점 추가");
  }

  // 4위 이하 (포인트 없음, 순위만)
  if (top.length > 3) {
    msg.push("");
    msg.push("기타 순위:");
    for (i = 3; i < top.length; i++) {
      msg.push(formatEntryLine(i + 1, top[i], "입선"));
    }
  }

  // 참가상 지급
  let rewardLogs = giveParticipantRewards(room, dataRoom);
  if (rewardLogs.length > 0) {
    msg.push("");
    msg.push("[🎁 참가상 지급]");
    msg = msg.concat(rewardLogs);
  }

  // 우승 스냅샷: 직전 1개만 유지
  let snapshot = {
    season: dataRoom.season,
    date: getToday(),
    gold: top.length >= 1 ? { user: top[0].user, title: top[0].title, total: top[0].total } : null,
    silver: top.length >= 2 ? { user: top[1].user, title: top[1].title, total: top[1].total } : null,
    bronze: top.length >= 3 ? { user: top[2].user, title: top[2].title, total: top[2].total } : null
  };
  dataRoom.historyWinners = [snapshot]; // 이전 것은 버리고 딱 1개만

  // 시즌 리셋: entries/participateCount 비우고 시즌 +1
  dataRoom.entries = [];
  dataRoom.participateCount = {};
  dataRoom.season = dataRoom.season + 1;

  saveOscar();

  return msg.join("\n");
}

/** 📊 4) !역대영화제순위
 *  - pointsRecord 기준 누적 순위 출력
 */
function showOscarRanking(room) {
  ensureOscarRoom(room);
  let dataRoom = oscar[room];
  let pr = dataRoom.pointsRecord;

  let arr = [];
  let user;
  for (user in pr) {
    if (!pr.hasOwnProperty(user)) continue;
    arr.push({ user: user, score: pr[user] });
  }

  if (arr.length === 0) {
    return "아직 영화제 수상 기록이 없습니다.";
  }

  arr.sort(function (a, b) {
    return b.score - a.score;
  });

  let msg = [];
  msg.push("[📜 역대 영화제 순위]");
  let i;
  for (i = 0; i < arr.length; i++) {
    msg.push((i + 1) + ". " + arr[i].user + " - " + arr[i].score + "점");
  }

  return msg.join("\n");
}

/** 🧾 5) !영화제참가순위
 *  - 이번 시즌(현재 season)의 도전 횟수 순위
 */
function showOscarParticipateRanking(room) {
  ensureOscarRoom(room);
  let dataRoom = oscar[room];
  let pc = dataRoom.participateCount;

  let arr = [];
  let user;
  for (user in pc) {
    if (!pc.hasOwnProperty(user)) continue;
    arr.push({ user: user, count: pc[user] });
  }

  if (arr.length === 0) {
    return "이번 시즌에는 아직 영화제 도전자가 없습니다.";
  }

  arr.sort(function (a, b) {
    return b.count - a.count;
  });

  let msg = [];
  msg.push("[🎟 영화제 참가 순위]");
  let i;
  for (i = 0; i < arr.length; i++) {
    msg.push((i + 1) + ". " + arr[i].user + " - " + arr[i].count + "회 도전");
  }

  return msg.join("\n");
}

// ■ 색상 효과 & 한줄평 함수
function getColorIcon(rate) {
    if (rate >= 90) return "🔥";
    if (rate >= 70) return "🟦";
    if (rate >= 50) return "🟩";
    if (rate >= 30) return "🟨";
    return "🟥";
}

function getOneLine(rate) {
    if (rate >= 85) return "전설적 퍼포먼스!";
    if (rate >= 70) return "매우 뛰어난 능력!";
    if (rate >= 55) return "안정적인 실력.";
    if (rate >= 40) return "발전의 여지가 보입니다.";
    return "좀 더 연습이 필요합니다.";
}

// ■ 능력 게이지 + 색상 + 한줄평 생성
function buildGaugeLine(icon, name, cur, max) {
    var bar = Creat_Bar(cur, max, 0, 0); // 게이지만, p/n 끔
    var rate = (cur / max) * 100;
    var color = getColorIcon(rate);
    var msg = icon + " " + name + "\n" + color + " " + bar + "\n" + "점수: " + cur + " / " + max + "("+ rate.toFixed(1) + "%)\n" + "➤ " + getOneLine(rate);

    return msg;
}


// ■ 영화제 메시지 전체 구성
function buildMovieGaugeMessage(movie, actorMax) {
    var out = [];

    out.push("🎞 영화제 도전 – " + movie.title + "\n");

    out.push(buildGaugeLine("🎬", "연출",  movie.dir,   actorMax.dir_max));
    out.push(buildGaugeLine("🎭", "연기",  movie.act,   actorMax.act_max));
    out.push(buildGaugeLine("📘", "스토리", movie.story, actorMax.story_max));
    out.push(buildGaugeLine("🎨", "예술",  movie.art,   actorMax.art_max));
    out.push(buildGaugeLine("🤹", "예능",  movie.show,  actorMax.show_max));
   out.push("\n📊 총평: " + getTotalComment(movie.total));

    //out.push("\n📊 종합 총점: " + movie.total + "점");

    return out.join("\n");
}





//게이지바 생성
function Creat_Bar(num, max, p, n){
    // num : 현재 수치 • max : 최대 수치  • p : 비율출력 여부 (1=on, 0=off) - n과함께 생략 가능 • n : 수치출력 여부 (1=on, 0=off) - 생략 가능    
    let bar = ['▏', '▏', '▎', '▍', '▌', '▋', '▊', '▉'];
    let per = 100/(max/num)/10;
    let gauge = [];

    for(let i=0; i<parseInt(per); i++) gauge.push('█');
    if(per != parseInt(per))
        gauge.push(bar[parseInt((per-gauge.length)*10/1.25)]);
    for(let i=gauge.length; i<10; i++) gauge.push(' ');
    if(p == undefined || p == null) p = 0; if(n == undefined) n = 0;
    return gauge.join('')+
        (!p?'':' ('+(per*10).toFixed(1)+'%)')+
        (!n?'':' ('+num+'/'+max+')');
}
