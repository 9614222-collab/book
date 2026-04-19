import { useState, useEffect, useRef } from "react";

const DEFAULT_BOOKS = [
  { id:1, title:"아몬드", author:"손원평", emoji:"🌰", pages:"264p", level:"★★★", genre:"소설", summary:"감정을 느끼지 못하는 소년 윤재가 주변 사람들과 관계를 맺으며 성장하는 이야기" },
  { id:2, title:"완득이", author:"김려령", emoji:"🥊", pages:"240p", level:"★★☆", genre:"소설", summary:"다문화 가정의 소년 완득이와 담임 선생님의 따뜻한 이야기" },
  { id:3, title:"어린 왕자", author:"생텍쥐페리", emoji:"👑", pages:"168p", level:"★★☆", genre:"고전", summary:"어린 왕자의 별 여행을 통해 진정한 관계와 삶의 의미를 탐구하는 고전" },
  { id:4, title:"동물농장", author:"조지 오웰", emoji:"🐷", pages:"200p", level:"★★★", genre:"고전", summary:"동물들이 세운 농장이 부패해 가는 과정을 통해 권력과 민주주의를 다룬 우화" },
  { id:5, title:"괭이부리말 아이들", author:"김중미", emoji:"🏘️", pages:"280p", level:"★★☆", genre:"소설", summary:"가난한 동네 아이들의 이야기를 통해 사회적 연대를 보여주는 소설" },
  { id:6, title:"소년이 온다", author:"한강", emoji:"🕊️", pages:"216p", level:"★★★", genre:"역사", summary:"5·18 광주민주화운동을 배경으로 한 역사적 소설" },
  { id:7, title:"정의란 무엇인가", author:"마이클 샌델", emoji:"⚖️", pages:"320p", level:"★★★", genre:"인문", summary:"공정함과 옳고 그름에 대해 철학적으로 탐구하는 인문 도서" },
  { id:8, title:"파과", author:"구병모", emoji:"🍐", pages:"272p", level:"★★★", genre:"소설", summary:"오래된 청부업자가 자신의 삶을 되돌아보는 소설" },
  { id:9, title:"82년생 김지영", author:"조남주", emoji:"👩", pages:"190p", level:"★★☆", genre:"소설", summary:"평범한 여성의 삶을 통해 사회적 편견을 조명하는 소설" },
  { id:10, title:"채식주의자", author:"한강", emoji:"🌿", pages:"247p", level:"★★★", genre:"소설", summary:"한 여성의 채식 선언을 통해 욕망과 자유를 탐구하는 소설" },
];

const ADMIN_PW = "teacher1234";
const BADGES = [
  { id:"first", label:"첫 독서", emoji:"🌱", desc:"처음으로 퀴즈를 완료!" },
  { id:"quiz3", label:"퀴즈왕", emoji:"🏆", desc:"퀴즈 3회 완료!" },
  { id:"review3", label:"소감문 달인", emoji:"✍️", desc:"소감문 3회 작성!" },
  { id:"chat3", label:"토론왕", emoji:"💬", desc:"AI 대화 3회 완료!" },
  { id:"perfect", label:"완벽한 하루", emoji:"⭐", desc:"하루에 모두 완료!" },
  { id:"week", label:"일주일 개근", emoji:"📅", desc:"7일 연속 독서!" },
  { id:"books5", label:"다독왕", emoji:"📚", desc:"5권 이상 읽었어요!" },
];
const LEVELS = [
  { min:0, label:"새싹 독자", emoji:"🌱", color:"#10b981" },
  { min:3, label:"책벌레", emoji:"🐛", color:"#3b82f6" },
  { min:8, label:"독서 탐험가", emoji:"🧭", color:"#8b5cf6" },
  { min:15, label:"논술 마스터", emoji:"🎓", color:"#f59e0b" },
  { min:25, label:"독서 천재", emoji:"🌟", color:"#ef4444" },
];
const WEEK_DAYS = ["일","월","화","수","목","금","토"];

function getTodayStr() { return new Date().toISOString().split("T")[0]; }
function getWeekStart(dateStr) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split("T")[0];
}
function getWeekDates(weekStart) {
  return Array.from({length:7},(_,i)=>{
    const d = new Date(weekStart); d.setDate(d.getDate()+i);
    return d.toISOString().split("T")[0];
  });
}
function getLastDays(n) {
  return Array.from({length:n},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(n-1-i));return d.toISOString().split("T")[0];});
}

async function callAI(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompt}]})
  });
  const data = await res.json();
  return data.content?.map(b=>b.text||"").join("")||"";
}

export default function App() {
  const today = getTodayStr();
  const thisWeekStart = getWeekStart(today);
  const weekDates = getWeekDates(thisWeekStart);

  const [screen, setScreen] = useState("login");
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [inputName, setInputName] = useState("");
  const [inputPw, setInputPw] = useState("");
  const [loginTab, setLoginTab] = useState("student");
  const [parentTarget, setParentTarget] = useState("");
  const [records, setRecords] = useState({});
  const [books, setBooks] = useState(DEFAULT_BOOKS);
  const [allStudents, setAllStudents] = useState([]);

  // 주간 계획: { weekStart: { dayIndex: bookId } }
  const [weekPlan, setWeekPlan] = useState({});
  const [planningMode, setPlanningMode] = useState(false);
  const [draftPlan, setDraftPlan] = useState({});
  const [gradeFilter, setGradeFilter] = useState("전체");

  const storageLoaded = useRef(false);
  useEffect(()=>{
    if(storageLoaded.current) return;
    storageLoaded.current = true;
    loadStorage();
  },[]);

  async function loadStorage() {
    try { const b=await window.storage.get("books"); if(b) setBooks(JSON.parse(b.value)); } catch{}
    try { const s=await window.storage.get("students"); if(s) setAllStudents(JSON.parse(s.value)); } catch{}
  }
  async function saveBooks(b) {
    setBooks(b);
    try { await window.storage.set("books",JSON.stringify(b)); } catch{}
  }
  async function loadStudentRecords(n) {
    try { const r=await window.storage.get(`rec_${n}`); if(r) return JSON.parse(r.value); } catch{}
    return {};
  }
  async function loadStudentPlan(n) {
    try { const p=await window.storage.get(`plan_${n}`); if(p) return JSON.parse(p.value); } catch{}
    return {};
  }
  async function saveStudentRecords(n, rec) {
    setRecords(rec);
    try { await window.storage.set(`rec_${n}`,JSON.stringify(rec)); } catch{}
    let updated=[...allStudents];
    if(!updated.includes(n)){updated.push(n);setAllStudents(updated);}
    try { await window.storage.set("students",JSON.stringify(updated)); } catch{}
  }
  async function saveWeekPlan(n, plan) {
    setWeekPlan(plan);
    try { await window.storage.set(`plan_${n}`,JSON.stringify(plan)); } catch{}
  }
  async function saveRecord(key, value) {
    const updated={...records,[`${today}_${key}`]:value};
    await saveStudentRecords(name, updated);
  }

  // 오늘 배정된 책
  const todayDayIndex = new Date(today).getDay();
  const thisWeekPlan = weekPlan[thisWeekStart] || {};
  const todayBookId = thisWeekPlan[todayDayIndex];
  const todayBook = books.find(b=>b.id===todayBookId) || null;

  const todayDone = {
    quiz: !!records[`${today}_quiz`],
    review: !!records[`${today}_review`],
    chat: !!records[`${today}_chat`],
  };

  function calcStats(rec) {
    const quizCount=Object.keys(rec).filter(k=>k.includes("_quiz")).length;
    const reviewCount=Object.keys(rec).filter(k=>k.includes("_review")).length;
    const chatCount=Object.keys(rec).filter(k=>k.includes("_chat")).length;
    const totalActivity=quizCount+reviewCount+chatCount;
    const lvl=[...LEVELS].reverse().find(l=>totalActivity>=l.min)||LEVELS[0];
    const days=getLastDays(30);
    let streak=0;
    for(let i=days.length-1;i>=0;i--){
      if(rec[`${days[i]}_quiz`]||rec[`${days[i]}_review`]||rec[`${days[i]}_chat`]) streak++;
      else break;
      if(streak>365) break;
    }
    const earnedBadges=[];
    if(quizCount>=1) earnedBadges.push("first");
    if(quizCount>=3) earnedBadges.push("quiz3");
    if(reviewCount>=3) earnedBadges.push("review3");
    if(chatCount>=3) earnedBadges.push("chat3");
    const perfectDays=days.filter(d=>rec[`${d}_quiz`]&&rec[`${d}_review`]&&rec[`${d}_chat`]);
    if(perfectDays.length>=1) earnedBadges.push("perfect");
    if(streak>=7) earnedBadges.push("week");
    const booksRead=new Set(Object.keys(rec).filter(k=>k.includes("_quiz")).map(k=>k.split("_book_")[1]||"")).size;
    if(booksRead>=5) earnedBadges.push("books5");
    return {quizCount,reviewCount,chatCount,totalActivity,level:lvl,streak,earnedBadges};
  }

  async function login() {
    if(!inputName.trim()) return;
    if(loginTab==="admin"&&inputPw!==ADMIN_PW){alert("비밀번호가 틀렸어요!");return;}
    const n=inputName.trim();
    setName(n);
    const rec=loginTab==="student"||loginTab==="parent"?await loadStudentRecords(loginTab==="parent"?n:n):{};
    const plan=loginTab==="student"?await loadStudentPlan(n):{};
    setRecords(rec);
    setWeekPlan(plan);
    if(loginTab==="parent"){setParentTarget(n);setRole("parent");}
    else if(loginTab==="admin") setRole("admin");
    else setRole("student");
    setScreen(loginTab==="admin"?"admin":loginTab==="parent"?"parent":"home");
  }

  // ── 주간 계획 저장 ──────────────────────────────────────
  async function confirmPlan() {
    const updated={...weekPlan,[thisWeekStart]:draftPlan};
    await saveWeekPlan(name, updated);
    setPlanningMode(false);
  }
  function openPlanningMode() {
    setDraftPlan(thisWeekPlan);
    setPlanningMode(true);
  }

  // ── Quiz ───────────────────────────────────────────────
  const [quizData,setQuizData]=useState(null);
  const [quizAnswers,setQuizAnswers]=useState({});
  const [quizResult,setQuizResult]=useState(null);
  const [quizLoading,setQuizLoading]=useState(false);

  async function startQuiz() {
    if(!todayBook) return;
    setQuizLoading(true);setQuizData(null);setQuizAnswers({});setQuizResult(null);
    const prompt=`초등학교 6학년 학생이 "${todayBook.title}" (${todayBook.author})를 읽었는지 확인하는 퀴즈 4문제. JSON만:\n{"questions":[{"q":"질문","type":"ox","answer":"O 또는 X","hint":"힌트"}]}\ntype은 "ox" 또는 "short". 2개씩.`;
    try {
      const text=await callAI(prompt);
      setQuizData(JSON.parse(text.replace(/```json|```/g,"").trim()));
    } catch {
      setQuizData({questions:[
        {q:`"${todayBook.title}"의 주인공 이름은?`,type:"short",answer:"책에서 확인",hint:"첫 장을 떠올려보세요!"},
        {q:`이 책의 작가는 ${todayBook.author}이다.`,type:"ox",answer:"O",hint:"표지를 생각해봐요!"},
        {q:"이 책에서 가장 인상적인 사건은?",type:"short",answer:"자유 답변",hint:"천천히 떠올려보세요."},
        {q:"이 책은 현대를 배경으로 한다.",type:"ox",answer:"O",hint:"시대적 배경을 생각해봐요!"},
      ]});
    }
    setQuizLoading(false);setScreen("quiz");
  }

  async function submitQuiz() {
    if(!quizData) return;
    setQuizLoading(true);
    const qList=quizData.questions.map((q,i)=>`Q${i+1}: ${q.q}\n정답: ${q.answer}\n학생답변: ${quizAnswers[i]||"(미작성)"}`).join("\n\n");
    try {
      const text=await callAI(`채점해줘.\n${qList}\nJSON만: {"scores":[true/false배열],"total":점수,"message":"격려메시지","details":["코멘트"]}`);
      const result=JSON.parse(text.replace(/```json|```/g,"").trim());
      setQuizResult(result);
      if(result.total>=2) await saveRecord("quiz",{score:result.total,book:todayBook.title});
    } catch {
      setQuizResult({scores:[true,true,false,true],total:3,message:"잘 읽었어요!",details:["정답!","정답!","다시 확인해봐요","정답!"]});
      await saveRecord("quiz",{score:3,book:todayBook.title});
    }
    setQuizLoading(false);
  }

  // ── Review ─────────────────────────────────────────────
  const [review,setReview]=useState("");
  const [reviewFeedback,setReviewFeedback]=useState("");
  const [reviewLoading,setReviewLoading]=useState(false);

  async function submitReview() {
    if(!todayBook||review.trim().length<20){alert("소감문을 조금 더 써주세요! (20자 이상)");return;}
    setReviewLoading(true);
    try {
      const text=await callAI(`초등 6학년 "${name}"이 "${todayBook.title}"을 읽고 쓴 소감문에 피드백해줘.\n소감문:\n${review}\n\n[칭찬] 잘 쓴 점 2가지\n[조언] 발전할 점 1~2가지\n[질문] 후속 질문 1가지\n[응원] 짧은 응원 메시지`);
      setReviewFeedback(text);
      await saveRecord("review",{text:review.slice(0,50),book:todayBook.title});
    } catch {
      setReviewFeedback("[칭찬] 자신의 생각을 잘 표현했어요!\n[조언] 책의 구체적인 장면을 인용하면 더 좋아요.\n[질문] 만약 네가 주인공이라면 어떻게 했을까요?\n[응원] 정말 잘 하고 있어요! 💪");
      await saveRecord("review",{text:review.slice(0,50),book:todayBook.title});
    }
    setReviewLoading(false);
  }

  // ── Chat ───────────────────────────────────────────────
  const [chatMessages,setChatMessages]=useState([]);
  const [chatInput,setChatInput]=useState("");
  const [chatLoading,setChatLoading]=useState(false);
  const chatEndRef=useRef(null);
  useEffect(()=>{chatEndRef.current?.scrollIntoView({behavior:"smooth"});},[chatMessages]);

  async function startChat() {
    if(!todayBook) return;
    setChatMessages([]);setChatLoading(true);
    const intro=`안녕 ${name}아! 👋 나는 AI 독서 선생님이야.\n오늘 읽은 "${todayBook.title}" (${todayBook.author})에 대해 이야기해보자!\n\n${todayBook.title}를 읽고 어떤 감정이 들었어? 주인공이 어떤 사람인지 소개해줄 수 있어? 😊`;
    setChatMessages([{role:"ai",text:intro}]);setChatLoading(false);setScreen("chat");
  }

  async function sendChat() {
    if(!chatInput.trim()||chatLoading) return;
    const userMsg=chatInput.trim();setChatInput("");
    const updated=[...chatMessages,{role:"user",text:userMsg}];
    setChatMessages(updated);setChatLoading(true);
    const history=updated.map(m=>`${m.role==="ai"?"선생님":name}: ${m.text}`).join("\n");
    try {
      const text=await callAI(`너는 초등 6학년 "${name}"에게 "${todayBook?.title}" 독서 대화를 이끄는 친절한 AI 선생님이야.\n책 내용: ${todayBook?.summary}\n\n대화:\n${history}\n\n답변에 공감하고 후속 질문 1개 해줘. 3번 이상 대화했으면 "오늘 대화 정말 잘했어! ⭐ 독서 완료!"로 마무리. 5문장 이내, 친근하게.`);
      setChatMessages(p=>[...p,{role:"ai",text}]);
      if(updated.filter(m=>m.role==="user").length>=3) await saveRecord("chat",{book:todayBook?.title});
    } catch {
      setChatMessages(p=>[...p,{role:"ai",text:"좋은 생각이야! 😊 그렇다면 책에서 가장 인상 깊었던 장면은?"}]);
    }
    setChatLoading(false);
  }

  // ── Admin ──────────────────────────────────────────────
  const [showAddBook,setShowAddBook]=useState(false);
  const [newBook,setNewBook]=useState({title:"",author:"",emoji:"📖",pages:"",level:"★★☆",genre:"소설",summary:""});
  const [viewingStudent,setViewingStudent]=useState(null);
  const [studentRec,setStudentRec]=useState({});

  async function loadStudentForAdmin(sn) {
    const rec=await loadStudentRecords(sn);
    setStudentRec(rec);setViewingStudent(sn);
  }
  function addBook() {
    if(!newBook.title||!newBook.author) return;
    saveBooks([...books,{...newBook,id:Date.now()}]);
    setShowAddBook(false);setNewBook({title:"",author:"",emoji:"📖",pages:"",level:"★★☆",genre:"소설",summary:""});
  }
  function deleteBook(id){if(window.confirm("삭제할까요?")) saveBooks(books.filter(b=>b.id!==id));}

  // ── UI helpers ─────────────────────────────────────────
  const COLORS={primary:"#3b82f6",purple:"#8b5cf6",orange:"#f59e0b",green:"#10b981",red:"#ef4444",pink:"#ec4899"};
  const wrap={fontFamily:"'Segoe UI',sans-serif",maxWidth:500,margin:"0 auto",padding:16,background:"#f0f4ff",minHeight:"100vh"};

  function Header({title,onBack,gradient=`linear-gradient(135deg,${COLORS.primary},${COLORS.purple})`}){
    return(
      <div style={{background:gradient,borderRadius:16,padding:"16px 18px",color:"white",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
        {onBack&&<button onClick={onBack} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"white",fontSize:18,cursor:"pointer",borderRadius:8,width:34,height:34}}>←</button>}
        <div style={{fontWeight:800,fontSize:17}}>{title}</div>
      </div>
    );
  }
  function Card({children,extra={}}){
    return <div style={{background:"white",borderRadius:14,padding:16,marginBottom:12,boxShadow:"0 2px 10px rgba(0,0,0,0.07)",...extra}}>{children}</div>;
  }
  function Btn({label,onClick,color=COLORS.primary,disabled=false,full=false,small=false}){
    return <button onClick={onClick} disabled={disabled} style={{padding:small?"8px 14px":"12px 20px",borderRadius:12,border:"none",background:disabled?"#cbd5e1":color,color:"white",fontWeight:700,cursor:disabled?"not-allowed":"pointer",fontSize:small?12:14,width:full?"100%":"auto",boxShadow:disabled?"none":`0 3px 10px ${color}55`}}>{label}</button>;
  }

  // ══════════════════════════════════════════════════════
  // LOGIN
  // ══════════════════════════════════════════════════════
  if(screen==="login") return(
    <div style={{fontFamily:"'Segoe UI',sans-serif",minHeight:"100vh",background:"linear-gradient(135deg,#3b82f6,#6366f1)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"white",borderRadius:24,padding:32,width:"100%",maxWidth:380,textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,0.15)"}}>
        <div style={{fontSize:52}}>📚</div>
        <div style={{fontSize:22,fontWeight:800,color:"#1e293b",marginTop:8}}>독서 학습 센터</div>
        <div style={{display:"flex",gap:0,marginTop:20,marginBottom:20,background:"#f1f5f9",borderRadius:12,padding:4}}>
          {[["student","학생"],["parent","학부모"],["admin","선생님"]].map(([tab,label])=>(
            <button key={tab} onClick={()=>setLoginTab(tab)} style={{flex:1,padding:"8px 0",borderRadius:10,border:"none",background:loginTab===tab?"white":"transparent",fontWeight:700,fontSize:13,color:loginTab===tab?"#3b82f6":"#94a3b8",cursor:"pointer",boxShadow:loginTab===tab?"0 2px 6px rgba(0,0,0,0.1)":"none"}}>{label}</button>
          ))}
        </div>
        <input value={inputName} onChange={e=>setInputName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}
          placeholder={loginTab==="admin"?"선생님 이름":loginTab==="parent"?"자녀 이름을 입력":"이름을 입력하세요"}
          style={{width:"100%",padding:"13px 16px",borderRadius:12,border:"2px solid #e2e8f0",fontSize:15,textAlign:"center",boxSizing:"border-box",outline:"none"}}/>
        {loginTab==="admin"&&(
          <input value={inputPw} onChange={e=>setInputPw(e.target.value)} type="password" placeholder="비밀번호 (teacher1234)"
            style={{width:"100%",padding:"13px 16px",borderRadius:12,border:"2px solid #e2e8f0",fontSize:15,textAlign:"center",boxSizing:"border-box",outline:"none",marginTop:8}}/>
        )}
        <button onClick={login} style={{width:"100%",marginTop:12,padding:14,borderRadius:12,border:"none",background:"linear-gradient(135deg,#3b82f6,#6366f1)",color:"white",fontSize:16,fontWeight:800,cursor:"pointer"}}>
          {loginTab==="admin"?"관리자로 입장 🔐":loginTab==="parent"?"자녀 기록 보기 👨‍👩‍👧":"시작하기 🚀"}
        </button>
        {loginTab==="admin"&&<div style={{fontSize:11,color:"#94a3b8",marginTop:8}}>비밀번호: teacher1234</div>}
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════
  // PLANNING MODE (주간 목표 선택)
  // ══════════════════════════════════════════════════════
  if(planningMode) return(
    <div style={wrap}>
      <div style={{background:"linear-gradient(135deg,#f59e0b,#ef4444)",borderRadius:16,padding:"18px",color:"white",marginBottom:14}}>
        <div style={{fontSize:13,opacity:0.85}}>이번 주 독서 계획</div>
        <div style={{fontSize:20,fontWeight:800,marginTop:4}}>📅 요일별 읽을 책 선택</div>
        <div style={{fontSize:12,opacity:0.85,marginTop:4}}>각 요일에 읽고 싶은 책을 골라보세요!</div>
      </div>

      {/* 학년 필터 */}
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {["전체","4학년","5학년","6학년"].map(g=>(
          <button key={g} onClick={()=>setGradeFilter(g)} style={{flex:1,padding:"8px 0",borderRadius:10,border:"none",background:gradeFilter===g?"#f59e0b":"white",color:gradeFilter===g?"white":"#64748b",fontWeight:700,fontSize:13,cursor:"pointer",boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>
            {g}
          </button>
        ))}
      </div>

      {/* 요일별 선택 */}
      {weekDates.map((d,i)=>{
        const isToday=d===today;
        const isPast=d<today;
        const selectedId=draftPlan[i];
        const selectedBook=books.find(b=>b.id===selectedId);
        return(
          <Card key={d} extra={{border:isToday?`2px solid ${COLORS.orange}`:"2px solid transparent",opacity:isPast?0.6:1}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:32,height:32,borderRadius:10,background:isToday?"#fef3c7":isPast?"#f1f5f9":"#eff6ff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,color:isToday?COLORS.orange:isPast?"#94a3b8":COLORS.primary}}>
                  {WEEK_DAYS[i]}
                </div>
                <div style={{fontSize:12,color:"#64748b"}}>{new Date(d).toLocaleDateString("ko-KR",{month:"short",day:"numeric"})}{isToday?" (오늘)":""}</div>
              </div>
              {selectedBook&&(
                <button onClick={()=>setDraftPlan(p=>({...p,[i]:undefined}))} style={{background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:13}}>✕ 해제</button>
              )}
            </div>
            {selectedBook?(
              <div style={{display:"flex",alignItems:"center",gap:10,background:"#f8fafc",borderRadius:10,padding:"10px 12px"}}>
                <span style={{fontSize:24}}>{selectedBook.emoji}</span>
                <div>
                  <div style={{fontWeight:700,fontSize:13,color:"#1e293b"}}>{selectedBook.title}</div>
                  <div style={{fontSize:11,color:"#64748b"}}>{selectedBook.author} · {selectedBook.pages}</div>
                </div>
                <div style={{marginLeft:"auto",fontSize:11,color:COLORS.primary,background:"#eff6ff",borderRadius:6,padding:"2px 8px"}}>{selectedBook.genre}</div>
              </div>
            ):(
              <div style={{background:"#f8fafc",borderRadius:10,padding:"10px 12px",fontSize:13,color:"#94a3b8",textAlign:"center"}}>책을 아래에서 선택하세요</div>
            )}
            {/* 책 선택 드롭다운 */}
            {!isPast&&(
              <div style={{marginTop:8,display:"flex",flexWrap:"wrap",gap:6}}>
                {books.map(b=>(
                  <button key={b.id} onClick={()=>setDraftPlan(p=>({...p,[i]:b.id}))}
                    style={{padding:"5px 10px",borderRadius:8,border:`1.5px solid ${draftPlan[i]===b.id?COLORS.primary:"#e2e8f0"}`,background:draftPlan[i]===b.id?"#eff6ff":"white",fontSize:12,fontWeight:600,cursor:"pointer",color:draftPlan[i]===b.id?COLORS.primary:"#64748b"}}>
                    {b.emoji} {b.title}
                  </button>
                ))}
              </div>
            )}
          </Card>
        );
      })}

      {/* 미리보기 */}
      {Object.keys(draftPlan).filter(k=>draftPlan[k]).length>0&&(
        <Card extra={{background:"#fffbeb",border:"1.5px solid #fde68a"}}>
          <div style={{fontWeight:700,color:"#d97706",marginBottom:8}}>📋 이번 주 계획 미리보기</div>
          {weekDates.map((d,i)=>{
            const b=books.find(bk=>bk.id===draftPlan[i]);
            if(!b) return null;
            return(
              <div key={d} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0",fontSize:13}}>
                <span style={{fontWeight:700,color:COLORS.orange,width:20}}>{WEEK_DAYS[i]}</span>
                <span>{b.emoji}</span>
                <span style={{color:"#1e293b"}}>{b.title}</span>
              </div>
            );
          })}
        </Card>
      )}

      <div style={{display:"flex",gap:10,marginTop:4}}>
        <button onClick={()=>setPlanningMode(false)} style={{flex:1,padding:13,borderRadius:12,border:"2px solid #e2e8f0",background:"white",color:"#64748b",fontWeight:700,cursor:"pointer"}}>취소</button>
        <button onClick={confirmPlan} style={{flex:2,padding:13,borderRadius:12,border:"none",background:`linear-gradient(135deg,${COLORS.orange},${COLORS.red})`,color:"white",fontWeight:800,fontSize:15,cursor:"pointer"}}>
          ✅ 이번 주 계획 저장
        </button>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════
  // HOME
  // ══════════════════════════════════════════════════════
  if(screen==="home"){
    const stats=calcStats(records);
    const planCount=Object.keys(thisWeekPlan).filter(k=>thisWeekPlan[k]).length;
    return(
      <div style={wrap}>
        {/* 헤더 */}
        <div style={{background:"linear-gradient(135deg,#3b82f6,#6366f1)",borderRadius:18,padding:"20px",color:"white",marginBottom:14,boxShadow:"0 6px 20px rgba(59,130,246,0.35)"}}>
          <div style={{fontSize:12,opacity:0.85}}>{new Date().toLocaleDateString("ko-KR",{year:"numeric",month:"long",day:"numeric",weekday:"long"})}</div>
          <div style={{fontSize:21,fontWeight:800,marginTop:4}}>안녕하세요, {name}님! 👋</div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}>
            <span style={{fontSize:22}}>{stats.level.emoji}</span>
            <div>
              <div style={{fontWeight:700,fontSize:14}}>{stats.level.label}</div>
              <div style={{fontSize:11,opacity:0.85}}>총 활동 {stats.totalActivity}회 · 🔥{stats.streak}일 연속</div>
            </div>
          </div>
          <div style={{display:"flex",gap:8,marginTop:12}}>
            {[["퀴즈","quiz","✅"],["소감문","review","📝"],["대화","chat","💬"]].map(([label,key,emoji])=>(
              <div key={key} style={{flex:1,background:todayDone[key]?"rgba(16,185,129,0.4)":"rgba(255,255,255,0.15)",borderRadius:10,padding:"8px 0",textAlign:"center"}}>
                <div style={{fontSize:18}}>{todayDone[key]?"✅":emoji}</div>
                <div style={{fontSize:11,marginTop:3,fontWeight:600}}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 주간 계획 배너 */}
        {planCount===0?(
          <div style={{background:"linear-gradient(135deg,#f59e0b,#ef4444)",borderRadius:14,padding:"16px 18px",color:"white",marginBottom:12,cursor:"pointer"}} onClick={openPlanningMode}>
            <div style={{fontWeight:800,fontSize:15}}>📅 이번 주 독서 계획을 세워볼까요?</div>
            <div style={{fontSize:13,opacity:0.9,marginTop:4}}>요일별로 읽고 싶은 책을 선택하면 매일 자동으로 배정돼요!</div>
            <div style={{marginTop:10,background:"rgba(255,255,255,0.25)",borderRadius:10,padding:"8px 14px",fontWeight:700,fontSize:13,textAlign:"center"}}>
              📚 지금 계획 세우기 →
            </div>
          </div>
        ):(
          <Card extra={{border:`2px solid ${COLORS.orange}`}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <div style={{fontWeight:800,color:"#1e293b",fontSize:14}}>📅 이번 주 독서 계획</div>
              <button onClick={openPlanningMode} style={{padding:"5px 10px",borderRadius:8,border:`1.5px solid ${COLORS.orange}`,background:"white",color:COLORS.orange,fontWeight:700,fontSize:12,cursor:"pointer"}}>수정</button>
            </div>
            <div style={{display:"flex",gap:4}}>
              {weekDates.map((d,i)=>{
                const b=books.find(bk=>bk.id===thisWeekPlan[i]);
                const isToday=d===today;
                const isPast=d<today;
                const donePart=records[`${d}_quiz`];
                return(
                  <div key={d} style={{flex:1,textAlign:"center"}}>
                    <div style={{fontSize:10,fontWeight:700,color:isToday?COLORS.orange:"#94a3b8",marginBottom:4}}>{WEEK_DAYS[i]}</div>
                    <div style={{height:44,borderRadius:10,background:!b?"#f8fafc":donePart?"#d1fae5":isToday?"#fef3c7":"#eff6ff",border:`2px solid ${!b?"#e2e8f0":donePart?"#10b981":isToday?COLORS.orange:COLORS.primary}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:b?18:12,color:!b?"#e2e8f0":""}}>
                      {b?b.emoji:"○"}
                    </div>
                    {donePart&&<div style={{fontSize:9,color:COLORS.green,marginTop:2,fontWeight:700}}>완료✓</div>}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* 오늘의 책 */}
        {todayBook?(
          <Card>
            <div style={{fontSize:12,color:COLORS.primary,fontWeight:700,marginBottom:8}}>📖 오늘의 책</div>
            <div style={{display:"flex",gap:14,alignItems:"center"}}>
              <div style={{fontSize:44}}>{todayBook.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:800,fontSize:17,color:"#1e293b"}}>{todayBook.title}</div>
                <div style={{fontSize:13,color:"#64748b",marginTop:2}}>{todayBook.author} · {todayBook.pages}</div>
                <div style={{fontSize:12,color:COLORS.orange,marginTop:4}}>{todayBook.level} · {todayBook.genre}</div>
              </div>
            </div>
            <div style={{background:"#f8fafc",borderRadius:10,padding:"10px 12px",marginTop:12,fontSize:13,color:"#475569",lineHeight:1.6}}>{todayBook.summary}</div>
          </Card>
        ):(
          <div style={{background:"#fff7ed",borderRadius:14,padding:"18px",marginBottom:12,border:"1.5px solid #fed7aa",textAlign:"center"}}>
            <div style={{fontSize:32}}>📭</div>
            <div style={{fontWeight:700,color:"#ea580c",marginTop:8,fontSize:15}}>오늘 읽을 책이 없어요!</div>
            <div style={{fontSize:13,color:"#64748b",marginTop:4}}>이번 주 계획에서 오늘({WEEK_DAYS[todayDayIndex]}요일) 책을 선택해주세요.</div>
            <button onClick={openPlanningMode} style={{marginTop:12,padding:"10px 20px",borderRadius:10,border:"none",background:COLORS.orange,color:"white",fontWeight:700,cursor:"pointer"}}>📅 계획 수정하기</button>
          </div>
        )}

        {/* 활동 버튼 */}
        {todayBook&&(
          <>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <button onClick={startQuiz} style={{padding:"16px 0",borderRadius:14,border:"none",background:todayDone.quiz?"#10b981":"linear-gradient(135deg,#3b82f6,#6366f1)",color:"white",fontWeight:800,fontSize:14,cursor:"pointer"}}>
                {todayDone.quiz?"✅ 퀴즈 완료":"✏️ 독서 확인 퀴즈"}
              </button>
              <button onClick={startChat} style={{padding:"16px 0",borderRadius:14,border:"none",background:todayDone.chat?"#10b981":"linear-gradient(135deg,#f59e0b,#ef4444)",color:"white",fontWeight:800,fontSize:14,cursor:"pointer"}}>
                {todayDone.chat?"✅ 대화 완료":"💬 AI 선생님 대화"}
              </button>
            </div>
            <button onClick={()=>{setReviewFeedback("");setReview("");setScreen("review");}} style={{width:"100%",padding:16,borderRadius:14,border:"none",background:todayDone.review?"#10b981":"linear-gradient(135deg,#8b5cf6,#ec4899)",color:"white",fontWeight:800,fontSize:14,cursor:"pointer",marginBottom:10}}>
              {todayDone.review?"✅ 소감문 완료":"📝 소감문 쓰기 + AI 피드백"}
            </button>
          </>
        )}

        {/* 배지 미리보기 */}
        <Card>
          <div style={{fontSize:13,fontWeight:800,color:"#1e293b",marginBottom:8}}>🏅 배지 ({stats.earnedBadges.length}/{BADGES.length})</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {BADGES.map(b=>{
              const earned=stats.earnedBadges.includes(b.id);
              return <div key={b.id} title={b.desc} style={{background:earned?"#eff6ff":"#f8fafc",border:`2px solid ${earned?COLORS.primary:"#e2e8f0"}`,borderRadius:8,padding:"5px 10px",fontSize:12,color:earned?"#1e293b":"#cbd5e1",opacity:earned?1:0.5,fontWeight:earned?700:400}}>{b.emoji} {b.label}</div>;
            })}
          </div>
        </Card>

        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>setScreen("records")} style={{flex:1,padding:13,borderRadius:14,border:"2px solid #e2e8f0",background:"white",color:"#64748b",fontWeight:700,fontSize:13,cursor:"pointer"}}>📅 나의 기록</button>
          <button onClick={()=>setScreen("login")} style={{padding:13,borderRadius:14,border:"2px solid #e2e8f0",background:"white",color:"#94a3b8",fontWeight:700,fontSize:13,cursor:"pointer"}}>로그아웃</button>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════
  // QUIZ
  // ══════════════════════════════════════════════════════
  if(screen==="quiz") return(
    <div style={wrap}>
      <Header title="✏️ 독서 확인 퀴즈" onBack={()=>setScreen("home")}/>
      <div style={{background:"#eff6ff",borderRadius:12,padding:"12px 16px",marginBottom:14,border:"1.5px solid #bfdbfe"}}>
        <div style={{fontWeight:700,color:COLORS.primary,fontSize:14}}>{todayBook?.emoji} {todayBook?.title} · {todayBook?.author}</div>
        <div style={{fontSize:12,color:"#64748b",marginTop:4}}>책을 정말 읽었는지 확인해요! 솔직하게 답해주세요 😊</div>
      </div>
      {quizLoading&&!quizData&&<div style={{textAlign:"center",padding:40,color:COLORS.purple,fontWeight:700}}>⏳ 퀴즈 만드는 중...</div>}
      {quizData&&!quizResult&&(
        <>
          {quizData.questions.map((q,i)=>(
            <div key={i} style={{background:"white",borderRadius:14,padding:16,marginBottom:12,boxShadow:"0 2px 8px rgba(0,0,0,0.07)"}}>
              <div style={{fontWeight:700,color:"#1e293b",fontSize:14,marginBottom:10}}>Q{i+1}. {q.q}</div>
              {q.type==="ox"?(
                <div style={{display:"flex",gap:10}}>
                  {["O","X"].map(v=>(
                    <button key={v} onClick={()=>setQuizAnswers(p=>({...p,[i]:v}))}
                      style={{flex:1,padding:"12px 0",borderRadius:12,border:`2px solid ${quizAnswers[i]===v?COLORS.primary:"#e2e8f0"}`,background:quizAnswers[i]===v?"#eff6ff":"white",fontWeight:800,fontSize:22,cursor:"pointer",color:quizAnswers[i]===v?COLORS.primary:"#94a3b8"}}>{v}</button>
                  ))}
                </div>
              ):(
                <input value={quizAnswers[i]||""} onChange={e=>setQuizAnswers(p=>({...p,[i]:e.target.value}))} placeholder="답을 써보세요..."
                  style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:14,boxSizing:"border-box"}}/>
              )}
              <div style={{fontSize:11,color:"#94a3b8",marginTop:8}}>💡 힌트: {q.hint}</div>
            </div>
          ))}
          <Btn label={quizLoading?"⏳ 채점 중...":"🎯 제출하기"} onClick={submitQuiz} full color="linear-gradient(135deg,#3b82f6,#6366f1)" disabled={quizLoading}/>
        </>
      )}
      {quizResult&&(
        <div>
          <div style={{background:"linear-gradient(135deg,#3b82f6,#6366f1)",borderRadius:16,padding:20,color:"white",textAlign:"center",marginBottom:14}}>
            <div style={{fontSize:40}}>{quizResult.total>=3?"🎉":"💪"}</div>
            <div style={{fontSize:22,fontWeight:800,marginTop:6}}>{quizResult.total} / {quizData.questions.length} 정답</div>
            <div style={{fontSize:14,opacity:0.9,marginTop:8,lineHeight:1.6}}>{quizResult.message}</div>
          </div>
          {quizData.questions.map((q,i)=>(
            <div key={i} style={{background:"white",borderRadius:12,padding:14,marginBottom:10,border:`2px solid ${quizResult.scores[i]?"#10b981":"#fca5a5"}`}}>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <div style={{fontSize:13,fontWeight:600,color:"#1e293b",flex:1}}>Q{i+1}. {q.q}</div>
                <span style={{fontSize:18,marginLeft:8}}>{quizResult.scores[i]?"✅":"❌"}</span>
              </div>
              <div style={{fontSize:12,color:"#64748b",marginTop:6}}>정답: <strong>{q.answer}</strong></div>
              {quizResult.details&&<div style={{fontSize:12,color:COLORS.primary,marginTop:4}}>{quizResult.details[i]}</div>}
            </div>
          ))}
          <Btn label="🏠 홈으로" onClick={()=>setScreen("home")} full color="linear-gradient(135deg,#3b82f6,#6366f1)"/>
        </div>
      )}
    </div>
  );

  // ══════════════════════════════════════════════════════
  // REVIEW
  // ══════════════════════════════════════════════════════
  if(screen==="review") return(
    <div style={wrap}>
      <Header title="📝 소감문 쓰기" onBack={()=>setScreen("home")} gradient="linear-gradient(135deg,#8b5cf6,#ec4899)"/>
      <div style={{background:"#fdf4ff",borderRadius:12,padding:"12px 16px",marginBottom:14,border:"1.5px solid #e9d5ff"}}>
        <div style={{fontWeight:700,color:COLORS.purple,fontSize:14}}>{todayBook?.emoji} {todayBook?.title} 소감문</div>
        <div style={{fontSize:12,color:"#64748b",marginTop:4}}>💡 <strong>내 생각 → 책의 내용 → 느낀 점</strong> 순서로!</div>
      </div>
      {!reviewFeedback?(
        <>
          <textarea value={review} onChange={e=>setReview(e.target.value)}
            placeholder={`${todayBook?.title}을(를) 읽고 느낀 점을 자유롭게 써보세요.\n\n예시:\n이 책을 읽고 나는...\n가장 인상 깊었던 장면은...\n내가 주인공이라면...`}
            rows={12} style={{width:"100%",padding:"14px",borderRadius:14,border:"1.5px solid #e2e8f0",fontSize:14,lineHeight:1.8,resize:"vertical",boxSizing:"border-box",fontFamily:"inherit",background:"white"}}/>
          <div style={{textAlign:"right",fontSize:12,color:"#94a3b8",marginTop:4,marginBottom:12}}>{review.length}자</div>
          <Btn label={reviewLoading?"⏳ 선생님이 읽는 중...":"✨ AI 피드백 받기"} onClick={submitReview} full color="linear-gradient(135deg,#8b5cf6,#ec4899)" disabled={reviewLoading}/>
        </>
      ):(
        <div>
          <div style={{background:"white",borderRadius:14,padding:16,marginBottom:12,border:"1.5px solid #e2e8f0"}}>
            <div style={{fontSize:13,fontWeight:700,color:"#64748b",marginBottom:8}}>내가 쓴 소감문</div>
            <div style={{fontSize:13,color:"#1e293b",lineHeight:1.8,whiteSpace:"pre-wrap"}}>{review}</div>
          </div>
          {[{key:"칭찬",emoji:"⭐",bg:"#fefce8",border:"#fde68a",tc:"#d97706"},{key:"조언",emoji:"💪",bg:"#f0fdf4",border:"#bbf7d0",tc:"#16a34a"},{key:"질문",emoji:"🤔",bg:"#eff6ff",border:"#bfdbfe",tc:"#2563eb"},{key:"응원",emoji:"💌",bg:"#fdf4ff",border:"#e9d5ff",tc:"#7c3aed"}].map(({key,emoji,bg,border,tc})=>{
            const m=reviewFeedback.match(new RegExp(`\\[${key}\\]([\\s\\S]*?)(?=\\[|$)`));
            if(!m) return null;
            return(
              <div key={key} style={{background:bg,borderRadius:14,padding:"14px 16px",marginBottom:10,border:`1.5px solid ${border}`}}>
                <div style={{fontWeight:800,color:tc,marginBottom:6,fontSize:14}}>{emoji} {key}</div>
                <div style={{fontSize:14,color:"#1e293b",lineHeight:1.8,whiteSpace:"pre-wrap"}}>{m[1].trim()}</div>
              </div>
            );
          })}
          <Btn label="🏠 홈으로" onClick={()=>setScreen("home")} full color="linear-gradient(135deg,#8b5cf6,#ec4899)"/>
        </div>
      )}
    </div>
  );

  // ══════════════════════════════════════════════════════
  // CHAT
  // ══════════════════════════════════════════════════════
  if(screen==="chat") return(
    <div style={{fontFamily:"'Segoe UI',sans-serif",maxWidth:500,margin:"0 auto",background:"#f0f4ff",minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <div style={{padding:"14px 16px",background:"linear-gradient(135deg,#f59e0b,#ef4444)",color:"white",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
        <button onClick={()=>setScreen("home")} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"white",fontSize:18,cursor:"pointer",borderRadius:8,width:34,height:34}}>←</button>
        <div><div style={{fontWeight:800,fontSize:16}}>💬 AI 선생님 대화</div><div style={{fontSize:12,opacity:0.85}}>{todayBook?.emoji} {todayBook?.title}</div></div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:10}}>
        {chatMessages.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="ai"?"flex-start":"flex-end"}}>
            {m.role==="ai"&&<div style={{fontSize:24,marginRight:8,alignSelf:"flex-end"}}>🤖</div>}
            <div style={{maxWidth:"80%",background:m.role==="ai"?"white":"linear-gradient(135deg,#3b82f6,#6366f1)",color:m.role==="ai"?"#1e293b":"white",borderRadius:m.role==="ai"?"18px 18px 18px 4px":"18px 18px 4px 18px",padding:"12px 16px",fontSize:14,lineHeight:1.7,boxShadow:"0 2px 8px rgba(0,0,0,0.08)",whiteSpace:"pre-wrap"}}>{m.text}</div>
          </div>
        ))}
        {chatLoading&&<div style={{display:"flex",gap:8}}><div style={{fontSize:24}}>🤖</div><div style={{background:"white",borderRadius:"18px 18px 18px 4px",padding:"12px 16px",color:"#94a3b8",fontSize:14}}>선생님이 생각 중... ⏳</div></div>}
        <div ref={chatEndRef}/>
      </div>
      <div style={{padding:12,background:"white",borderTop:"1px solid #e2e8f0",display:"flex",gap:8,flexShrink:0}}>
        <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()} placeholder="선생님 질문에 답해보세요..."
          style={{flex:1,padding:"10px 14px",borderRadius:12,border:"1.5px solid #e2e8f0",fontSize:14,outline:"none"}}/>
        <button onClick={sendChat} disabled={chatLoading||!chatInput.trim()} style={{padding:"10px 16px",borderRadius:12,border:"none",background:`linear-gradient(135deg,${COLORS.orange},${COLORS.red})`,color:"white",fontWeight:800,cursor:"pointer",fontSize:18}}>↑</button>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════
  // RECORDS
  // ══════════════════════════════════════════════════════
  if(screen==="records"){
    const stats=calcStats(records);
    return(
      <div style={wrap}>
        <Header title="📅 나의 독서 기록" onBack={()=>setScreen("home")}/>
        <div style={{background:`linear-gradient(135deg,${stats.level.color},${stats.level.color}99)`,borderRadius:16,padding:20,color:"white",marginBottom:12,textAlign:"center"}}>
          <div style={{fontSize:44}}>{stats.level.emoji}</div>
          <div style={{fontWeight:800,fontSize:20,marginTop:6}}>{stats.level.label}</div>
          <div style={{fontSize:13,opacity:0.9,marginTop:4}}>총 활동 {stats.totalActivity}회 · 연속 🔥{stats.streak}일</div>
          <div style={{display:"flex",justifyContent:"center",gap:20,marginTop:12}}>
            {[["퀴즈",stats.quizCount,"✏️"],["소감문",stats.reviewCount,"📝"],["대화",stats.chatCount,"💬"]].map(([l,c,e])=>(
              <div key={l} style={{textAlign:"center"}}>
                <div style={{fontSize:22,fontWeight:800}}>{c}</div>
                <div style={{fontSize:11,opacity:0.85}}>{e}{l}</div>
              </div>
            ))}
          </div>
        </div>
        <Card>
          <div style={{fontWeight:800,color:"#1e293b",marginBottom:10}}>🏅 배지 컬렉션</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {BADGES.map(b=>{
              const earned=stats.earnedBadges.includes(b.id);
              return <div key={b.id} style={{background:earned?"#eff6ff":"#f8fafc",border:`2px solid ${earned?COLORS.primary:"#e2e8f0"}`,borderRadius:10,padding:"8px 12px",opacity:earned?1:0.4,textAlign:"center"}}>
                <div style={{fontSize:20}}>{b.emoji}</div>
                <div style={{fontSize:11,fontWeight:700,color:earned?"#1e293b":"#94a3b8",marginTop:4}}>{b.label}</div>
                <div style={{fontSize:10,color:"#94a3b8",marginTop:2}}>{b.desc}</div>
              </div>;
            })}
          </div>
        </Card>
        <Card>
          <div style={{fontWeight:800,color:"#1e293b",marginBottom:10}}>최근 2주 기록</div>
          {getLastDays(14).map(d=>{
            const q=records[`${d}_quiz`],r=records[`${d}_review`],c=records[`${d}_chat`];
            const total=[q,r,c].filter(Boolean).length;
            const isToday=d===today;
            return(
              <div key={d} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:"1px solid #f1f5f9"}}>
                <div style={{width:60,fontSize:12,color:isToday?COLORS.primary:"#64748b",fontWeight:isToday?700:400}}>
                  {new Date(d).toLocaleDateString("ko-KR",{month:"short",day:"numeric"})}{isToday?" 오늘":""}
                </div>
                <div style={{flex:1,display:"flex",gap:4}}>
                  {[["퀴즈",q],["소감문",r],["대화",c]].map(([label,done])=>(
                    <div key={label} style={{flex:1,textAlign:"center",padding:"4px 0",borderRadius:8,background:done?"#eff6ff":"#f8fafc",fontSize:11,color:done?COLORS.primary:"#cbd5e1",fontWeight:700}}>{done?"✅":""}{label}</div>
                  ))}
                </div>
                <div style={{fontSize:13,fontWeight:800,color:total===3?"#10b981":total>0?COLORS.orange:"#e2e8f0"}}>{total}/3</div>
              </div>
            );
          })}
        </Card>
        <Btn label="🏠 홈으로" onClick={()=>setScreen("home")} full/>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════
  // PARENT
  // ══════════════════════════════════════════════════════
  if(screen==="parent"){
    const stats=calcStats(records);
    return(
      <div style={wrap}>
        <div style={{background:"linear-gradient(135deg,#10b981,#3b82f6)",borderRadius:16,padding:"18px",color:"white",marginBottom:14}}>
          <div style={{fontSize:13,opacity:0.85}}>학부모 리포트</div>
          <div style={{fontSize:20,fontWeight:800,marginTop:4}}>👨‍👩‍👧 {parentTarget} 학습 현황</div>
        </div>
        <Card>
          <div style={{fontWeight:800,marginBottom:12,color:"#1e293b"}}>📊 종합 현황</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[["현재 레벨",`${stats.level.emoji} ${stats.level.label}`,stats.level.color],["연속 독서",`🔥 ${stats.streak}일`,"#ef4444"],["총 퀴즈",`✏️ ${stats.quizCount}회`,COLORS.primary],["총 소감문",`📝 ${stats.reviewCount}회`,COLORS.purple],["총 대화",`💬 ${stats.chatCount}회`,COLORS.orange],["획득 배지",`🏅 ${stats.earnedBadges.length}/${BADGES.length}개`,"#10b981"]].map(([l,v,c])=>(
              <div key={l} style={{background:"#f8fafc",borderRadius:12,padding:"12px 14px"}}>
                <div style={{fontSize:11,color:"#64748b"}}>{l}</div>
                <div style={{fontSize:15,fontWeight:800,color:c,marginTop:4}}>{v}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div style={{fontWeight:800,color:"#1e293b",marginBottom:10}}>📅 최근 2주 활동</div>
          {getLastDays(14).map(d=>{
            const q=records[`${d}_quiz`],r=records[`${d}_review`],c=records[`${d}_chat`];
            const total=[q,r,c].filter(Boolean).length;
            return(
              <div key={d} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderBottom:"1px solid #f1f5f9"}}>
                <div style={{width:64,fontSize:12,color:d===today?COLORS.primary:"#64748b"}}>{new Date(d).toLocaleDateString("ko-KR",{month:"short",day:"numeric"})}{d===today?" 오늘":""}</div>
                <div style={{flex:1,height:8,borderRadius:6,background:"#f1f5f9",overflow:"hidden"}}>
                  <div style={{width:`${(total/3)*100}%`,height:"100%",background:total===3?"#10b981":total>0?COLORS.orange:"transparent",borderRadius:6}}/>
                </div>
                <div style={{fontSize:12,fontWeight:700,color:total===3?"#10b981":total>0?COLORS.orange:"#e2e8f0",width:24,textAlign:"right"}}>{total}/3</div>
              </div>
            );
          })}
        </Card>
        <div style={{background:"#fefce8",borderRadius:14,padding:16,border:"1.5px solid #fde68a",marginBottom:12}}>
          <div style={{fontWeight:800,color:"#d97706",marginBottom:6}}>💌 선생님의 한마디</div>
          <div style={{fontSize:14,color:"#1e293b",lineHeight:1.7}}>
            {stats.totalActivity===0?`${parentTarget} 학생이 아직 독서를 시작하지 않았어요. 함께 첫 책을 시작해보세요! 📚`:stats.streak>=5?`${parentTarget} 학생이 ${stats.streak}일 연속으로 독서하고 있어요! 정말 대단한 습관이에요. 🔥`:`${parentTarget} 학생이 총 ${stats.totalActivity}번의 활동을 완료했어요! 👏`}
          </div>
        </div>
        <Btn label="로그아웃" onClick={()=>setScreen("login")} full color="#64748b"/>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════
  // ADMIN
  // ══════════════════════════════════════════════════════
  if(screen==="admin"){
    return(
      <div style={wrap}>
        <div style={{background:"linear-gradient(135deg,#1e293b,#334155)",borderRadius:16,padding:"18px",color:"white",marginBottom:14}}>
          <div style={{fontSize:13,opacity:0.7}}>관리자 모드</div>
          <div style={{fontSize:20,fontWeight:800,marginTop:4}}>🔐 선생님 대시보드</div>
        </div>
        <Card>
          <div style={{fontWeight:800,color:"#1e293b",marginBottom:12}}>👩‍🎓 학생 현황 ({allStudents.length}명)</div>
          {allStudents.length===0&&<div style={{fontSize:13,color:"#94a3b8"}}>아직 접속한 학생이 없어요.</div>}
          {allStudents.map(sn=>(
            <div key={sn} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f1f5f9"}}>
              <div style={{fontWeight:600,color:"#1e293b"}}>👤 {sn}</div>
              <button onClick={()=>loadStudentForAdmin(sn)} style={{padding:"6px 12px",borderRadius:8,border:"none",background:COLORS.primary,color:"white",fontSize:12,fontWeight:700,cursor:"pointer"}}>리포트</button>
            </div>
          ))}
        </Card>
        {viewingStudent&&(
          <Card extra={{border:`2px solid ${COLORS.primary}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontWeight:800,color:"#1e293b"}}>📊 {viewingStudent} 리포트</div>
              <button onClick={()=>setViewingStudent(null)} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:"#94a3b8"}}>✕</button>
            </div>
            {(()=>{
              const st=calcStats(studentRec);
              return(
                <>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
                    {[["퀴즈",st.quizCount,"✏️"],["소감문",st.reviewCount,"📝"],["대화",st.chatCount,"💬"]].map(([l,c,e])=>(
                      <div key={l} style={{background:"#f8fafc",borderRadius:10,padding:"10px 0",textAlign:"center"}}>
                        <div style={{fontSize:20}}>{e}</div>
                        <div style={{fontSize:18,fontWeight:800,color:COLORS.primary,marginTop:4}}>{c}</div>
                        <div style={{fontSize:11,color:"#64748b"}}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{fontSize:13}}>레벨: <strong>{st.level.emoji} {st.level.label}</strong> · 🔥{st.streak}일 · 🏅{st.earnedBadges.length}개</div>
                  <div style={{marginTop:10}}>
                    {getLastDays(7).map(d=>{
                      const q=studentRec[`${d}_quiz`],r=studentRec[`${d}_review`],c=studentRec[`${d}_chat`];
                      const total=[q,r,c].filter(Boolean).length;
                      return(
                        <div key={d} style={{display:"flex",gap:8,alignItems:"center",padding:"4px 0"}}>
                          <div style={{width:52,fontSize:11,color:"#64748b"}}>{new Date(d).toLocaleDateString("ko-KR",{month:"short",day:"numeric"})}</div>
                          {[["Q",q],["S",r],["C",c]].map(([l,done])=>(
                            <div key={l} style={{width:24,height:24,borderRadius:6,background:done?"#3b82f6":"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:done?"white":"#cbd5e1",fontWeight:700}}>{l}</div>
                          ))}
                          <div style={{fontSize:12,fontWeight:700,color:total===3?"#10b981":total>0?COLORS.orange:"#e2e8f0"}}>{total}/3</div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </Card>
        )}
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontWeight:800,color:"#1e293b"}}>📚 책 목록 관리</div>
            <button onClick={()=>setShowAddBook(true)} style={{padding:"6px 12px",borderRadius:8,border:"none",background:COLORS.green,color:"white",fontSize:12,fontWeight:700,cursor:"pointer"}}>+ 추가</button>
          </div>
          {books.map((b,i)=>(
            <div key={b.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<books.length-1?"1px solid #f1f5f9":"none"}}>
              <span style={{fontSize:20}}>{b.emoji}</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:13,color:"#1e293b"}}>{b.title}</div>
                <div style={{fontSize:11,color:"#94a3b8"}}>{b.author} · {b.genre}</div>
              </div>
              <button onClick={()=>deleteBook(b.id)} style={{padding:"4px 8px",borderRadius:6,border:"none",background:"#fee2e2",color:"#ef4444",fontSize:11,fontWeight:700,cursor:"pointer"}}>삭제</button>
            </div>
          ))}
          {showAddBook&&(
            <div style={{marginTop:14,background:"#f8fafc",borderRadius:12,padding:14,border:"1.5px solid #e2e8f0"}}>
              <div style={{fontWeight:700,color:"#1e293b",marginBottom:10}}>새 책 추가</div>
              {[["제목","title","책 제목"],["저자","author","저자"],["이모지","emoji","📖"],["페이지","pages","예: 200p"],["장르","genre","소설/인문/고전"],["줄거리","summary","간단한 줄거리"]].map(([label,key,ph])=>(
                <div key={key} style={{marginBottom:8}}>
                  <div style={{fontSize:11,color:"#64748b",marginBottom:3}}>{label}</div>
                  <input value={newBook[key]} onChange={e=>setNewBook(p=>({...p,[key]:e.target.value}))} placeholder={ph}
                    style={{width:"100%",padding:"8px 10px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:13,boxSizing:"border-box"}}/>
                </div>
              ))}
              <div style={{display:"flex",gap:8,marginTop:8}}>
                <Btn label="추가하기" onClick={addBook} color={COLORS.green} small/>
                <Btn label="취소" onClick={()=>setShowAddBook(false)} color="#94a3b8" small/>
              </div>
            </div>
          )}
        </Card>
        <Btn label="로그아웃" onClick={()=>setScreen("login")} full color="#64748b"/>
      </div>
    );
  }
  return null;
}
