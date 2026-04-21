import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyDRE9zJJ2NYLifwGygEd6WofbqUIr2kI7Y",
  authDomain: "book-reading-4d1b0.firebaseapp.com",
  projectId: "book-reading-4d1b0",
  storageBucket: "book-reading-4d1b0.firebasestorage.app",
  messagingSenderId: "446657944043",
  appId: "1:446657944043:web:c40a365c43f194893a21ae"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Firebase에서 데이터 불러오기
async function loadData(key) {
  try {
    const ref = doc(db, "reading", key);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data().value : null;
  } catch { return null; }
}

// Firebase에 데이터 저장하기
async function saveData(key, value) {
  try {
    const ref = doc(db, "reading", key);
    await setDoc(ref, { value });
  } catch(e) { console.error(e); }
}

const DEFAULT_BOOKS = [
  // ── 6학년 ──
  { id:1, title:"아몬드", author:"손원평", emoji:"🌰", pages:"264p", level:"★★★", grade:"6학년", summary:"감정을 느끼지 못하는 소년 윤재가 주변 사람들과 관계를 맺으며 성장하는 이야기",
    quizzes:[
      {q:"윤재는 편도체가 작아서 감정을 잘 느끼지 못한다.",type:"ox",answer:"O",hint:"윤재의 뇌 구조에 대해 생각해봐요!"},
      {q:"윤재의 할머니는 윤재에게 '괴물'이라는 별명을 붙여줬다.",type:"ox",answer:"X",hint:"할머니가 윤재를 어떻게 불렀는지 떠올려봐요!"},
      {q:"윤재의 엄마는 어떤 일을 하나요?",type:"short",answer:"식당 운영",hint:"윤재 가족의 생계를 생각해봐요!"},
      {q:"곤이는 윤재에게 처음부터 친절하게 대했다.",type:"ox",answer:"X",hint:"곤이와 윤재의 첫 만남을 떠올려봐요!"},
    ],
    feedbackTips:["책의 구체적인 장면을 인용했나요?","윤재의 감정과 자신의 감정을 비교해봤나요?","공감이란 무엇인지 자신의 생각을 썼나요?"]
  },
  { id:2, title:"완득이", author:"김려령", emoji:"🥊", pages:"240p", level:"★★☆", grade:"6학년", summary:"다문화 가정의 소년 완득이와 담임 선생님의 따뜻한 이야기",
    quizzes:[
      {q:"완득이의 아버지는 한국 사람이다.",type:"ox",answer:"X",hint:"완득이 가족의 구성을 생각해봐요!"},
      {q:"완득이의 담임 선생님 이름은 독고준이다.",type:"ox",answer:"O",hint:"선생님의 독특한 이름을 떠올려봐요!"},
      {q:"완득이는 어떤 운동을 배우나요?",type:"short",answer:"킥복싱",hint:"완득이의 취미활동을 떠올려봐요!"},
      {q:"완득이 엄마는 처음부터 완득이와 함께 살았다.",type:"ox",answer:"X",hint:"완득이 엄마의 사연을 생각해봐요!"},
    ],
    feedbackTips:["완득이와 선생님의 관계 변화를 썼나요?","다문화 가정에 대한 자신의 생각을 표현했나요?","가족의 의미에 대해 생각해봤나요?"]
  },
  { id:3, title:"어린 왕자", author:"생텍쥐페리", emoji:"👑", pages:"168p", level:"★★☆", grade:"6학년", summary:"어린 왕자의 별 여행을 통해 진정한 관계와 삶의 의미를 탐구하는 고전",
    quizzes:[
      {q:"어린 왕자는 B612라는 소행성에서 왔다.",type:"ox",answer:"O",hint:"어린 왕자의 고향을 생각해봐요!"},
      {q:"어린 왕자가 가장 사랑한 것은 여우였다.",type:"ox",answer:"X",hint:"어린 왕자의 별에 있던 것을 떠올려봐요!"},
      {q:"'길들인다'는 것은 어떤 의미인가요?",type:"short",answer:"관계를 맺는 것, 서로에게 특별한 존재가 되는 것",hint:"여우가 어린 왕자에게 한 말을 떠올려봐요!"},
      {q:"어른들은 어린 왕자를 잘 이해했다.",type:"ox",answer:"X",hint:"어른들의 관심사를 떠올려봐요!"},
    ],
    feedbackTips:["'길들인다'는 의미에 대해 자신의 생각을 썼나요?","진정한 관계란 무엇인지 표현했나요?","어린 왕자에게서 배운 점을 적었나요?"]
  },
  { id:4, title:"동물농장", author:"조지 오웰", emoji:"🐷", pages:"200p", level:"★★★", grade:"6학년", summary:"동물들이 세운 농장이 부패해 가는 과정을 통해 권력과 민주주의를 다룬 우화",
    quizzes:[
      {q:"동물농장의 돼지 지도자 이름은 나폴레옹이다.",type:"ox",answer:"O",hint:"동물농장을 이끈 돼지를 떠올려봐요!"},
      {q:"동물들의 혁명 구호는 '네 다리는 좋고, 두 다리는 나쁘다'였다.",type:"ox",answer:"O",hint:"동물들이 외친 구호를 생각해봐요!"},
      {q:"스노볼은 최후에 어떻게 됐나요?",type:"short",answer:"나폴레옹에 의해 농장에서 쫓겨났다",hint:"두 돼지 지도자의 관계를 생각해봐요!"},
      {q:"마지막에 돼지들은 두 발로 걷기 시작했다.",type:"ox",answer:"O",hint:"농장 마지막 장면을 떠올려봐요!"},
    ],
    feedbackTips:["권력이 어떻게 부패하는지 분석했나요?","현실 사회와 연결지어 생각해봤나요?","좋은 지도자의 조건에 대해 썼나요?"]
  },
  { id:5, title:"괭이부리말 아이들", author:"김중미", emoji:"🏘️", pages:"280p", level:"★★☆", grade:"6학년", summary:"가난한 동네 아이들의 이야기를 통해 사회적 연대를 보여주는 소설",
    quizzes:[
      {q:"괭이부리말은 부유한 동네를 배경으로 한다.",type:"ox",answer:"X",hint:"괭이부리말이 어떤 동네인지 생각해봐요!"},
      {q:"이 책의 주인공은 단 한 명이다.",type:"ox",answer:"X",hint:"책에 등장하는 여러 아이들을 떠올려봐요!"},
      {q:"이 책에서 이웃들이 서로 돕는 모습이 나오나요?",type:"short",answer:"네, 어려운 상황에서도 서로 도우며 살아가는 모습이 나온다",hint:"동네 사람들의 관계를 생각해봐요!"},
      {q:"가난이 아이들의 꿈에 영향을 미친다.",type:"ox",answer:"O",hint:"아이들의 미래와 현실을 생각해봐요!"},
    ],
    feedbackTips:["가난과 꿈의 관계에 대해 생각했나요?","이웃 간의 도움이 왜 중요한지 썼나요?","사회가 어떻게 변해야 하는지 의견을 표현했나요?"]
  },
  { id:6, title:"소년이 온다", author:"한강", emoji:"🕊️", pages:"216p", level:"★★★", grade:"6학년", summary:"5·18 광주민주화운동을 배경으로 한 역사적 소설",
    quizzes:[
      {q:"이 소설의 배경은 1980년 광주이다.",type:"ox",answer:"O",hint:"역사적 사건의 시기를 떠올려봐요!"},
      {q:"주인공 동호는 어른이다.",type:"ox",answer:"X",hint:"주인공의 나이를 생각해봐요!"},
      {q:"5·18 민주화운동은 어느 도시에서 일어났나요?",type:"short",answer:"광주",hint:"책의 배경 도시를 생각해봐요!"},
      {q:"이 책은 역사적 사실을 바탕으로 쓰였다.",type:"ox",answer:"O",hint:"작가가 이 책을 쓴 이유를 생각해봐요!"},
    ],
    feedbackTips:["역사적 사건에 대한 자신의 생각을 표현했나요?","등장인물의 용기에 대해 썼나요?","민주주의의 의미에 대해 생각해봤나요?"]
  },
  // ── 5학년 ──
  { id:9, title:"이상한 과자 가게 전천당", author:"히로시마 레이코", emoji:"🍭", pages:"184p", level:"★☆☆", grade:"5학년", summary:"어디선가 나타나는 신비한 과자 가게 전천당에서 특별한 과자를 사면 소원이 이뤄지는 판타지 이야기",
    quizzes:[
      {q:"전천당은 아무나 찾아갈 수 있는 가게이다.",type:"ox",answer:"X",hint:"전천당에 가려면 어떤 조건이 필요한지 떠올려봐요!"},
      {q:"전천당의 주인 이름은 베니야이다.",type:"ox",answer:"O",hint:"가게 주인의 특별한 이름을 생각해봐요!"},
      {q:"전천당에서 산 과자를 먹으면 어떻게 되나요?",type:"short",answer:"소원이 이뤄지지만 예상치 못한 결과가 생긴다",hint:"과자의 신기한 효과를 떠올려봐요!"},
      {q:"이 책은 욕심을 부리면 안 된다는 교훈을 준다.",type:"ox",answer:"O",hint:"각 이야기의 결말을 생각해봐요!"},
    ],
    feedbackTips:["가장 기억에 남는 과자 이야기를 구체적으로 썼나요?","욕심과 소원에 대한 자신의 생각을 표현했나요?","만약 내가 전천당에 간다면 어떤 과자를 살지 상상해서 썼나요?"]
  },
  { id:10, title:"어린이 살아남기 시리즈", author:"다양", emoji:"🏕️", pages:"200p", level:"★☆☆", grade:"5학년", summary:"다양한 위기 상황에서 살아남는 방법을 배우며 지식과 모험을 동시에 즐기는 학습 만화",
    quizzes:[
      {q:"위급한 상황에서 침착하게 행동하는 것이 중요하다.",type:"ox",answer:"O",hint:"살아남기 위한 기본 태도를 생각해봐요!"},
      {q:"이 책은 재미있는 이야기와 함께 생존 지식을 알려준다.",type:"ox",answer:"O",hint:"책의 특징을 생각해봐요!"},
      {q:"책에서 배운 생존 지식 중 가장 기억에 남는 것은?",type:"short",answer:"자유 답변",hint:"책에서 인상 깊었던 내용을 떠올려봐요!"},
      {q:"주인공들은 혼자서만 위기를 해결한다.",type:"ox",answer:"X",hint:"주인공들이 어떻게 협력하는지 생각해봐요!"},
    ],
    feedbackTips:["책에서 새롭게 알게 된 생존 지식을 썼나요?","주인공의 용기와 지혜에 대해 표현했나요?","실생활에서 활용할 수 있는 내용을 연결해서 썼나요?"]
  },
  { id:11, title:"우리들의 일그러진 영웅", author:"이문열", emoji:"🏫", pages:"168p", level:"★★☆", grade:"5학년", summary:"전학 온 소년이 반을 지배하는 엄석대와 맞서며 겪는 학교생활 이야기",
    quizzes:[
      {q:"엄석대는 반에서 인기가 많고 힘이 센 학생이다.",type:"ox",answer:"O",hint:"엄석대의 반에서의 위치를 생각해봐요!"},
      {q:"주인공 한병태는 처음부터 엄석대와 친하게 지냈다.",type:"ox",answer:"X",hint:"한병태가 전학 왔을 때 어떤 태도였는지 떠올려봐요!"},
      {q:"이 책에서 '영웅'이 일그러졌다는 것은 무슨 뜻인가요?",type:"short",answer:"자유 답변",hint:"엄석대가 반에서 한 행동들을 생각해봐요!"},
      {q:"이 책은 불의에 맞서는 용기의 중요성을 다룬다.",type:"ox",answer:"O",hint:"책의 주제를 생각해봐요!"},
    ],
    feedbackTips:["엄석대의 행동에 대한 자신의 생각을 표현했나요?","용기 있게 행동하는 것의 의미에 대해 썼나요?","학교생활 속 비슷한 경험을 연결해서 생각했나요?"]
  },
  { id:12, title:"행복한 청소부", author:"모니카 페트", emoji:"🧹", pages:"56p", level:"★☆☆", grade:"5학년", summary:"도로 표지판을 닦는 청소부가 글자를 배우며 삶의 행복을 찾아가는 따뜻한 이야기",
    quizzes:[
      {q:"주인공 청소부는 처음에 글을 읽을 줄 몰랐다.",type:"ox",answer:"O",hint:"청소부의 처음 상황을 생각해봐요!"},
      {q:"청소부는 자신의 일을 부끄러워했다.",type:"ox",answer:"X",hint:"청소부가 일을 대하는 태도를 떠올려봐요!"},
      {q:"이 책에서 행복이란 무엇이라고 생각하나요?",type:"short",answer:"자유 답변",hint:"청소부가 느끼는 행복을 생각해봐요!"},
      {q:"이 책은 작은 일에서도 행복을 찾을 수 있다는 것을 알려준다.",type:"ox",answer:"O",hint:"책의 주제를 생각해봐요!"},
    ],
    feedbackTips:["청소부의 삶에서 배운 점을 구체적으로 썼나요?","행복의 의미에 대해 자신의 생각을 표현했나요?","내 주변의 작은 행복을 연결해서 생각했나요?"]
  },
  { id:23, title:"내 친구가 사라졌다", author:"황지영", emoji:"👫", pages:"192p", level:"★☆☆", grade:"5학년", summary:"단짝 친구가 갑자기 이사를 가면서 생긴 빈자리를 새로운 친구들과 채워가는 성장 이야기",
    quizzes:[
      {q:"주인공의 단짝 친구는 이사를 갔다.",type:"ox",answer:"O",hint:"이야기의 시작을 생각해봐요!"},
      {q:"주인공은 새 친구를 쉽게 사귀었다.",type:"ox",answer:"X",hint:"주인공이 어떤 감정을 느꼈는지 떠올려봐요!"},
      {q:"진정한 우정이란 무엇이라고 생각하나요?",type:"short",answer:"자유 답변",hint:"책 속 친구 관계를 생각해봐요!"},
      {q:"이 책은 이별과 새로운 만남에 대해 이야기한다.",type:"ox",answer:"O",hint:"책의 주제를 생각해봐요!"},
    ],
    feedbackTips:["책 속 주인공의 감정에 공감하며 썼나요?","우정의 소중함에 대해 자신의 생각을 표현했나요?","자신의 친구 관계와 연결해서 생각했나요?"]
  },
  { id:24, title:"꼴찌라도 괜찮아", author:"고정욱", emoji:"🏃", pages:"176p", level:"★☆☆", grade:"5학년", summary:"달리기를 못하는 소년이 포기하지 않고 도전하면서 자신감을 찾아가는 따뜻한 이야기",
    quizzes:[
      {q:"주인공은 달리기를 잘했다.",type:"ox",answer:"X",hint:"주인공의 고민을 생각해봐요!"},
      {q:"꼴찌여도 포기하지 않고 끝까지 달리는 것이 중요하다.",type:"ox",answer:"O",hint:"책의 메시지를 생각해봐요!"},
      {q:"이 책에서 가장 감동적인 장면은 어디였나요?",type:"short",answer:"자유 답변",hint:"주인공이 달리기를 하는 장면을 떠올려봐요!"},
      {q:"이 책은 결과보다 과정이 중요하다는 것을 알려준다.",type:"ox",answer:"O",hint:"책의 주제를 생각해봐요!"},
    ],
    feedbackTips:["주인공의 도전 정신에서 배운 점을 썼나요?","포기하지 않는 것의 의미에 대해 표현했나요?","내가 힘들었지만 끝까지 해낸 경험을 연결해서 썼나요?"]
  },
  // ── 4학년 ──
  { id:16, title:"강아지똥", author:"권정생", emoji:"🐶", pages:"40p", level:"★☆☆", grade:"4학년", summary:"보잘것없어 보이는 강아지똥이 민들레 꽃을 피우는 데 꼭 필요한 존재임을 깨닫는 이야기",
    quizzes:[
      {q:"강아지똥은 자신이 쓸모없다고 생각했다.",type:"ox",answer:"O",hint:"강아지똥의 마음을 떠올려봐요!"},
      {q:"강아지똥은 결국 민들레 꽃을 피우는 데 도움을 줬다.",type:"ox",answer:"O",hint:"이야기의 결말을 생각해봐요!"},
      {q:"이 책에서 배울 수 있는 가장 중요한 교훈은?",type:"short",answer:"모든 존재는 소중하고 쓸모가 있다",hint:"강아지똥의 변화를 생각해봐요!"},
      {q:"이 책은 자존감과 존재의 가치를 다룬다.",type:"ox",answer:"O",hint:"책의 주제를 생각해봐요!"},
    ],
    feedbackTips:["강아지똥의 감정에 공감하며 썼나요?","모든 존재의 소중함에 대해 자신의 생각을 표현했나요?","나 자신의 소중함과 연결해서 썼나요?"]
  },
  { id:17, title:"신기한 스쿨버스", author:"조애너 콜", emoji:"🚌", pages:"280p", level:"★☆☆", grade:"4학년", summary:"마법 같은 스쿨버스를 타고 인체, 우주, 자연 속으로 떠나는 신나는 과학 탐험 이야기",
    quizzes:[
      {q:"스쿨버스는 실제로 아이들을 몸속으로 데려갔다.",type:"ox",answer:"O",hint:"이 책의 마법 같은 설정을 떠올려봐요!"},
      {q:"이 책은 과학 지식을 재미있게 알려준다.",type:"ox",answer:"O",hint:"책의 형식을 생각해봐요!"},
      {q:"책에서 가장 신기했던 과학 사실은?",type:"short",answer:"자유 답변",hint:"탐험 중 가장 흥미로웠던 장면을 생각해봐요!"},
      {q:"프리즐 선생님은 평범한 과학 선생님이다.",type:"ox",answer:"X",hint:"프리즐 선생님의 특별한 점을 생각해봐요!"},
    ],
    feedbackTips:["책에서 새롭게 알게 된 과학 사실을 썼나요?","과학에 대한 흥미와 호기심을 표현했나요?","실생활과 연결해서 생각했나요?"]
  },
  { id:18, title:"구름빵", author:"백희나", emoji:"☁️", pages:"48p", level:"★☆☆", grade:"4학년", summary:"구름으로 만든 빵을 먹고 하늘을 나는 남매의 따뜻하고 상상력 넘치는 이야기",
    quizzes:[
      {q:"구름빵을 먹으면 하늘을 날 수 있다.",type:"ox",answer:"O",hint:"구름빵의 특별한 효과를 생각해봐요!"},
      {q:"이 책은 가족의 사랑을 담고 있다.",type:"ox",answer:"O",hint:"남매와 부모님의 관계를 생각해봐요!"},
      {q:"내가 구름빵을 먹는다면 무엇을 하고 싶나요?",type:"short",answer:"자유 답변",hint:"상상력을 마음껏 펼쳐봐요!"},
      {q:"이 책은 상상력과 창의력을 키워준다.",type:"ox",answer:"O",hint:"책의 특징을 생각해봐요!"},
    ],
    feedbackTips:["상상력을 발휘해서 자신만의 생각을 표현했나요?","가족의 사랑에 대해 썼나요?","책 속 장면을 구체적으로 묘사했나요?"]
  },
  { id:19, title:"알사탕", author:"백희나", emoji:"🍬", pages:"48p", level:"★☆☆", grade:"4학년", summary:"특별한 알사탕을 먹으면 주변 사람들의 마음속 목소리가 들리는 신기한 이야기",
    quizzes:[
      {q:"알사탕을 먹으면 다른 사람의 마음을 들을 수 있다.",type:"ox",answer:"O",hint:"알사탕의 특별한 능력을 생각해봐요!"},
      {q:"주인공은 알사탕 덕분에 외롭지 않게 됐다.",type:"ox",answer:"O",hint:"이야기의 결말을 떠올려봐요!"},
      {q:"내가 알사탕이 있다면 누구의 마음을 듣고 싶나요?",type:"short",answer:"자유 답변",hint:"주변의 소중한 사람을 생각해봐요!"},
      {q:"이 책은 소통과 공감의 중요성을 알려준다.",type:"ox",answer:"O",hint:"책의 주제를 생각해봐요!"},
    ],
    feedbackTips:["다른 사람의 마음을 이해하는 것에 대해 썼나요?","소통의 중요성을 자신의 경험과 연결했나요?","가장 인상 깊은 장면을 구체적으로 표현했나요?"]
  },
  { id:20, title:"내가 라면을 먹을 때", author:"하세가와 요스케", emoji:"🍜", pages:"32p", level:"★☆☆", grade:"4학년", summary:"내가 라면을 먹는 순간 세계 곳곳에서 동시에 일어나는 일들을 보여주는 책",
    quizzes:[
      {q:"이 책은 세계 여러 나라 어린이들의 생활을 보여준다.",type:"ox",answer:"O",hint:"책의 내용을 생각해봐요!"},
      {q:"세계 모든 아이들은 같은 환경에서 살고 있다.",type:"ox",answer:"X",hint:"책에서 보여주는 다양한 상황을 생각해봐요!"},
      {q:"이 책을 읽고 어떤 생각이 들었나요?",type:"short",answer:"자유 답변",hint:"세계 다른 나라 아이들과 자신을 비교해봐요!"},
      {q:"이 책은 세계 여러 나라에 관심을 갖게 해준다.",type:"ox",answer:"O",hint:"책의 목적을 생각해봐요!"},
    ],
    feedbackTips:["세계 친구들의 상황에 공감하며 썼나요?","자신의 생활과 비교해서 생각했나요?","세계시민으로서 할 수 있는 일을 표현했나요?"]
  },
];

const ADMIN_PW = "teacher1234";
const BADGES = [
  { id:"first", label:"첫 독서", emoji:"🌱", desc:"처음으로 퀴즈 완료!" },
  { id:"quiz3", label:"퀴즈왕", emoji:"🏆", desc:"퀴즈 3회 완료!" },
  { id:"review3", label:"소감문 달인", emoji:"✍️", desc:"소감문 3회 작성!" },
  { id:"chat3", label:"토론왕", emoji:"💬", desc:"AI 대화 3회 완료!" },
  { id:"perfect", label:"완벽한 하루", emoji:"⭐", desc:"하루에 모두 완료!" },
  { id:"week", label:"일주일 개근", emoji:"📅", desc:"7일 연속 독서!" },
  { id:"books5", label:"다독왕", emoji:"📚", desc:"5권 이상 읽었어요!" },
];
const LEVELS = [
  { min:0,  label:"새싹 독자",   emoji:"🌱", color:"#10b981" },
  { min:3,  label:"책벌레",      emoji:"🐛", color:"#3b82f6" },
  { min:8,  label:"독서 탐험가", emoji:"🧭", color:"#8b5cf6" },
  { min:15, label:"논술 마스터", emoji:"🎓", color:"#f59e0b" },
  { min:25, label:"독서 천재",   emoji:"🌟", color:"#ef4444" },
];
const WEEK_DAYS = ["일","월","화","수","목","금","토"];
const COLORS = { primary:"#3b82f6", purple:"#8b5cf6", orange:"#f59e0b", green:"#10b981", red:"#ef4444" };

function getTodayStr() { return new Date().toISOString().split("T")[0]; }
function getWeekStart(ds) { const d=new Date(ds); d.setDate(d.getDate()-d.getDay()); return d.toISOString().split("T")[0]; }
function getWeekDates(ws) { return Array.from({length:7},(_,i)=>{ const d=new Date(ws); d.setDate(d.getDate()+i); return d.toISOString().split("T")[0]; }); }
function getLastDays(n) { return Array.from({length:n},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-(n-1-i)); return d.toISOString().split("T")[0]; }); }

export default function App() {
  const today = getTodayStr();
  const thisWeekStart = getWeekStart(today);
  const weekDates = getWeekDates(thisWeekStart);
  const todayDayIndex = new Date(today).getDay();

  const [screen, setScreen] = useState("login");
  const [loginTab, setLoginTab] = useState("student");
  const [inputName, setInputName] = useState("");
  const [inputPw, setInputPw] = useState("");
  const [name, setName] = useState("");
  const [parentTarget, setParentTarget] = useState("");
  const [records, setRecords] = useState({});
  const [books] = useState(DEFAULT_BOOKS);
  const [weekPlan, setWeekPlan] = useState({});
  const [planningMode, setPlanningMode] = useState(false);
  const [draftPlan, setDraftPlan] = useState({});
  const [gradeFilter, setGradeFilter] = useState("전체");
  const [loading, setLoading] = useState(false);
  const [allStudents, setAllStudents] = useState([]);

  const thisWeekPlan = weekPlan[thisWeekStart] || {};
  const todayBookId = thisWeekPlan[todayDayIndex];
  const todayBook = books.find(b=>b.id===todayBookId) || null;
  const todayDone = {
    quiz: !!records[`${today}_quiz`],
    review: !!records[`${today}_review`],
    chat: !!records[`${today}_chat`],
  };

  // Firebase에서 학생 데이터 로드
  async function loadStudentData(n) {
    setLoading(true);
    const rec = await loadData(`rec_${n}`) || {};
    const plan = await loadData(`plan_${n}`) || {};
    const students = await loadData("students") || [];
    setRecords(rec);
    setWeekPlan(plan);
    setAllStudents(students);
    setLoading(false);
  }

  // Firebase에 기록 저장
  async function saveRecord(key, value) {
    const updated = {...records, [`${today}_${key}`]: value};
    setRecords(updated);
    await saveData(`rec_${name}`, updated);
    // 학생 목록 업데이트
    const students = await loadData("students") || [];
    if (!students.includes(name)) {
      const updated2 = [...students, name];
      setAllStudents(updated2);
      await saveData("students", updated2);
    }
  }

  async function savePlan(n, plan) {
    setWeekPlan(plan);
    await saveData(`plan_${n}`, plan);
  }

  function login() {
    if (!inputName.trim()) return;
    if (loginTab==="admin" && inputPw!==ADMIN_PW) { alert("비밀번호가 틀렸어요!"); return; }
    const n = inputName.trim(); setName(n);
    if (loginTab==="student") { loadStudentData(n); setScreen("home"); }
    else if (loginTab==="parent") { loadStudentData(n); setParentTarget(n); setScreen("parent"); }
    else { loadStudentData(n); setScreen("admin"); }
  }

  function calcStats(rec) {
    const qc=Object.keys(rec).filter(k=>k.includes("_quiz")).length;
    const rc=Object.keys(rec).filter(k=>k.includes("_review")).length;
    const cc=Object.keys(rec).filter(k=>k.includes("_chat")).length;
    const total=qc+rc+cc;
    const lvl=[...LEVELS].reverse().find(l=>total>=l.min)||LEVELS[0];
    let streak=0;
    const days=getLastDays(30);
    for(let i=days.length-1;i>=0;i--){
      if(rec[`${days[i]}_quiz`]||rec[`${days[i]}_review`]||rec[`${days[i]}_chat`]) streak++;
      else break;
    }
    const earned=[];
    if(qc>=1) earned.push("first");
    if(qc>=3) earned.push("quiz3");
    if(rc>=3) earned.push("review3");
    if(cc>=3) earned.push("chat3");
    if(days.some(d=>rec[`${d}_quiz`]&&rec[`${d}_review`]&&rec[`${d}_chat`])) earned.push("perfect");
    if(streak>=7) earned.push("week");
    if(qc>=5) earned.push("books5");
    return {qc,rc,cc,total,level:lvl,streak,earned};
  }

  // Quiz - 주관식 입력 버그 수정 (ref 사용)
  const [quizAnswers,setQuizAnswers]=useState({});
  const [quizResult,setQuizResult]=useState(null);
  const quizRefs=useRef({});

  function startQuiz() { setQuizAnswers({}); setQuizResult(null); quizRefs.current={}; setScreen("quiz"); }

  function submitQuiz() {
    if(!todayBook?.quizzes) return;
    // ref에서 최신 값 읽기
    const finalAnswers={...quizAnswers};
    Object.keys(quizRefs.current).forEach(k=>{ finalAnswers[k]=quizRefs.current[k].value||""; });
    const scores=todayBook.quizzes.map((q,i)=>{
      const ans=(finalAnswers[i]||"").trim().toLowerCase();
      if(q.type==="ox") return ans===q.answer.toLowerCase();
      return ans.length>0;
    });
    const total=scores.filter(Boolean).length;
    setQuizResult({scores,total});
    if(total>=2) saveRecord("quiz",{score:total,book:todayBook.title});
  }

  // Review
  const [review,setReview]=useState("");
  const [reviewSubmitted,setReviewSubmitted]=useState(false);

  function submitReview() {
    if(review.trim().length<20){alert("소감문을 20자 이상 써주세요!");return;}
    setReviewSubmitted(true);
    saveRecord("review",{text:review.slice(0,50),book:todayBook?.title});
  }

  // 단어장
  const [vocab, setVocab] = useState([]);
  const [vocabTestAnswers, setVocabTestAnswers] = useState({});
  const [vocabTest, setVocabTest] = useState(null);
  const [vocabTestResult, setVocabTestResult] = useState(null);
  const vocabRefs = useRef({});
  const wordRef = useRef(null);
  const meaningRef = useRef(null);

  useEffect(()=>{
    if(name) loadVocab();
  },[name]);

  async function loadVocab() {
    const v = await loadData(`vocab_${name}`) || [];
    setVocab(v);
  }

  async function addVocab() {
    const word = wordRef.current?.value?.trim();
    const meaning = meaningRef.current?.value?.trim();
    if(!word||!meaning){alert("단어와 뜻을 모두 입력해주세요!");return;}
    const newVocab=[...vocab,{word,meaning,book:todayBook?.title||"",date:getTodayStr()}];
    setVocab(newVocab);
    await saveData(`vocab_${name}`,newVocab);
    if(wordRef.current) wordRef.current.value="";
    if(meaningRef.current) meaningRef.current.value="";
  }

  async function deleteVocab(idx) {
    const updated=vocab.filter((_,i)=>i!==idx);
    setVocab(updated);
    await saveData(`vocab_${name}`,updated);
  }

  function startVocabTest() {
    if(vocab.length<2){alert("단어가 2개 이상 있어야 테스트할 수 있어요!");return;}
    const shuffled=[...vocab].sort(()=>Math.random()-0.5).slice(0,Math.min(vocab.length,10));
    setVocabTest(shuffled);
    setVocabTestAnswers({});
    setVocabTestResult(null);
    vocabRefs.current={};
  }

  function submitVocabTest() {
    const finalAns={...vocabTestAnswers};
    Object.keys(vocabRefs.current).forEach(k=>{ finalAns[k]=vocabRefs.current[k]?.value||""; });
    const scores=vocabTest.map((v,i)=>{
      const ans=(finalAns[i]||"").trim();
      return ans===v.meaning||v.meaning.includes(ans)&&ans.length>1;
    });
    setVocabTestResult({scores,total:scores.filter(Boolean).length});
  }

  // Chat
  const CHAT_QUESTIONS=[
    "이 책을 읽고 어떤 감정이 들었어? 주인공이 어떤 사람인지 소개해줄 수 있어? 😊",
    "책에서 가장 인상 깊었던 장면은 뭐야? 왜 그 장면이 기억에 남아?",
    "만약 네가 주인공이라면 어떻게 행동했을 것 같아?",
    "이 책을 읽고 나서 생각이 바뀐 것이 있어? 어떤 점에서 변했어?",
    "이 책을 친구에게 추천한다면 어떻게 소개할 것 같아?",
  ];
  const [chatStep,setChatStep]=useState(0);
  const [chatAnswers,setChatAnswers]=useState([]);
  const [chatInput,setChatInput]=useState("");
  const chatEndRef=useRef(null);
  useEffect(()=>{ chatEndRef.current?.scrollIntoView({behavior:"smooth"}); },[chatAnswers]);

  function startChat() { setChatStep(0); setChatAnswers([]); setChatInput(""); setScreen("chat"); }

  function sendChat() {
    if(!chatInput.trim()) return;
    const newAnswers=[...chatAnswers,{q:CHAT_QUESTIONS[chatStep],a:chatInput.trim()}];
    setChatAnswers(newAnswers); setChatInput("");
    if(chatStep>=4) saveRecord("chat",{book:todayBook?.title});
    else setChatStep(s=>s+1);
  }

  // Plan
  function openPlan() { setDraftPlan(thisWeekPlan); setPlanningMode(true); }
  function confirmPlan() {
    const p={...weekPlan,[thisWeekStart]:draftPlan};
    savePlan(name,p); setPlanningMode(false);
  }

  // UI
  const wrap={fontFamily:"'Apple SD Gothic Neo','Malgun Gothic','Segoe UI',sans-serif",maxWidth:500,margin:"0 auto",padding:16,background:"#f0f4ff",minHeight:"100vh"};
  function Card({children,style:s={}}){ return <div style={{background:"white",borderRadius:14,padding:16,marginBottom:12,boxShadow:"0 2px 10px rgba(0,0,0,0.07)",...s}}>{children}</div>; }
  function GBtn({label,onClick,bg,disabled,full}){ return <button onClick={onClick} disabled={disabled} style={{width:full?"100%":"auto",padding:"13px 20px",borderRadius:12,border:"none",background:disabled?"#cbd5e1":bg,color:"white",fontWeight:800,fontSize:14,cursor:disabled?"not-allowed":"pointer"}}>{label}</button>; }
  function BackHeader({title,bg}){
    return <div style={{background:bg,borderRadius:16,padding:"16px 18px",color:"white",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
      <button onClick={()=>setScreen("home")} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"white",fontSize:18,cursor:"pointer",borderRadius:8,width:34,height:34}}>←</button>
      <div style={{fontWeight:800,fontSize:17}}>{title}</div>
    </div>;
  }

  // 로딩 화면
  if(loading) return(
    <div style={{...wrap,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:48}}>📚</div>
        <div style={{fontWeight:700,color:"#6366f1",marginTop:12,fontSize:16}}>데이터 불러오는 중...</div>
      </div>
    </div>
  );

  // PLANNING
  if(planningMode) return(
    <div style={wrap}>
      <div style={{background:"linear-gradient(135deg,#f59e0b,#ef4444)",borderRadius:16,padding:"18px",color:"white",marginBottom:14}}>
        <div style={{fontSize:20,fontWeight:800}}>📅 이번 주 독서 계획</div>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {["전체","4학년","5학년","6학년"].map(g=>(
          <button key={g} onClick={()=>setGradeFilter(g)} style={{flex:1,padding:"8px 0",borderRadius:10,border:"none",background:gradeFilter===g?"#f59e0b":"white",color:gradeFilter===g?"white":"#64748b",fontWeight:700,fontSize:13,cursor:"pointer"}}>
            {g}
          </button>
        ))}
      </div>
      {weekDates.map((d,i)=>{
        const isToday=d===today,isPast=d<today,selBook=books.find(b=>b.id===draftPlan[i]);
        return(
          <Card key={d} style={{border:isToday?`2px solid ${COLORS.orange}`:"2px solid transparent",opacity:isPast?0.6:1}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:32,height:32,borderRadius:10,background:isToday?"#fef3c7":"#eff6ff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,color:isToday?COLORS.orange:COLORS.primary}}>{WEEK_DAYS[i]}</div>
                <div style={{fontSize:12,color:"#64748b"}}>{new Date(d).toLocaleDateString("ko-KR",{month:"short",day:"numeric"})}{isToday?" (오늘)":""}</div>
              </div>
              {selBook&&<button onClick={()=>setDraftPlan(p=>({...p,[i]:undefined}))} style={{background:"none",border:"none",color:"#94a3b8",cursor:"pointer"}}>✕</button>}
            </div>
            {selBook?(
              <div style={{display:"flex",alignItems:"center",gap:10,background:"#f8fafc",borderRadius:10,padding:"10px 12px",marginBottom:8}}>
                <span style={{fontSize:22}}>{selBook.emoji}</span>
                <div>
                  <div style={{fontWeight:700,fontSize:13}}>{selBook.title}</div>
                  <div style={{fontSize:11,color:"#64748b"}}>{selBook.author} · {selBook.grade}</div>
                </div>
              </div>
            ):(
              <div style={{background:"#f8fafc",borderRadius:10,padding:"8px 12px",fontSize:13,color:"#94a3b8",marginBottom:8,textAlign:"center"}}>책을 선택하세요</div>
            )}
            {!isPast&&(
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {books.filter(b=>gradeFilter==="전체"||b.grade===gradeFilter).map(b=>(
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
      <div style={{display:"flex",gap:10}}>
        <button onClick={()=>setPlanningMode(false)} style={{flex:1,padding:13,borderRadius:12,border:"2px solid #e2e8f0",background:"white",color:"#64748b",fontWeight:700,cursor:"pointer"}}>취소</button>
        <button onClick={confirmPlan} style={{flex:2,padding:13,borderRadius:12,border:"none",background:"linear-gradient(135deg,#f59e0b,#ef4444)",color:"white",fontWeight:800,fontSize:15,cursor:"pointer"}}>✅ 계획 저장</button>
      </div>
    </div>
  );

  // LOGIN
  if(screen==="login") return(
    <div style={{fontFamily:"'Apple SD Gothic Neo','Malgun Gothic','Segoe UI',sans-serif",minHeight:"100vh",background:"linear-gradient(135deg,#3b82f6,#6366f1)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"white",borderRadius:24,padding:32,width:"100%",maxWidth:380,textAlign:"center"}}>
        <div style={{fontSize:52}}>📚</div>
        <div style={{fontSize:22,fontWeight:800,color:"#1e293b",marginTop:8}}>독서 학습 센터</div>
        <div style={{display:"flex",gap:0,margin:"20px 0",background:"#f1f5f9",borderRadius:12,padding:4}}>
          {[["student","학생"],["parent","학부모"],["admin","선생님"]].map(([tab,label])=>(
            <button key={tab} onClick={()=>setLoginTab(tab)} style={{flex:1,padding:"8px 0",borderRadius:10,border:"none",background:loginTab===tab?"white":"transparent",fontWeight:700,fontSize:13,color:loginTab===tab?"#3b82f6":"#94a3b8",cursor:"pointer"}}>{label}</button>
          ))}
        </div>
        <input value={inputName} onChange={e=>setInputName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}
          placeholder={loginTab==="admin"?"선생님 이름":loginTab==="parent"?"자녀 이름 입력":"이름을 입력하세요"}
          style={{width:"100%",padding:"13px 16px",borderRadius:12,border:"2px solid #e2e8f0",fontSize:15,textAlign:"center",outline:"none",fontFamily:"inherit"}}/>
        {loginTab==="admin"&&(
          <input value={inputPw} onChange={e=>setInputPw(e.target.value)} type="password" placeholder="비밀번호 (teacher1234)"
            style={{width:"100%",padding:"13px 16px",borderRadius:12,border:"2px solid #e2e8f0",fontSize:15,textAlign:"center",outline:"none",marginTop:8,fontFamily:"inherit"}}/>
        )}
        <button onClick={login} style={{width:"100%",marginTop:12,padding:14,borderRadius:12,border:"none",background:"linear-gradient(135deg,#3b82f6,#6366f1)",color:"white",fontSize:16,fontWeight:800,cursor:"pointer"}}>
          {loginTab==="admin"?"관리자 입장 🔐":loginTab==="parent"?"자녀 기록 보기 👨‍👩‍👧":"시작하기 🚀"}
        </button>
        <div style={{marginTop:12,fontSize:12,color:"#10b981",fontWeight:600}}>✅ 어느 기기에서나 같은 데이터!</div>
      </div>
    </div>
  );

  // HOME
  if(screen==="home"){
    const stats=calcStats(records);
    const planCount=Object.keys(thisWeekPlan).filter(k=>thisWeekPlan[k]).length;
    return(
      <div style={wrap}>
        <div style={{background:"linear-gradient(135deg,#3b82f6,#6366f1)",borderRadius:18,padding:"20px",color:"white",marginBottom:14}}>
          <div style={{fontSize:12,opacity:0.85}}>{new Date().toLocaleDateString("ko-KR",{year:"numeric",month:"long",day:"numeric",weekday:"long"})}</div>
          <div style={{fontSize:21,fontWeight:800,marginTop:4}}>안녕하세요, {name}님! 👋</div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}>
            <span style={{fontSize:22}}>{stats.level.emoji}</span>
            <div><div style={{fontWeight:700,fontSize:14}}>{stats.level.label}</div><div style={{fontSize:11,opacity:0.85}}>총 활동 {stats.total}회 · 🔥{stats.streak}일 연속</div></div>
          </div>
          <div style={{display:"flex",gap:8,marginTop:12}}>
            {[["퀴즈","quiz","✅"],["소감문","review","📝"],["대화","chat","💬"]].map(([l,k,e])=>(
              <div key={k} style={{flex:1,background:todayDone[k]?"rgba(16,185,129,0.4)":"rgba(255,255,255,0.15)",borderRadius:10,padding:"8px 0",textAlign:"center"}}>
                <div style={{fontSize:18}}>{todayDone[k]?"✅":e}</div>
                <div style={{fontSize:11,marginTop:3,fontWeight:600}}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {planCount===0?(
          <div style={{background:"linear-gradient(135deg,#f59e0b,#ef4444)",borderRadius:14,padding:"16px 18px",color:"white",marginBottom:12,cursor:"pointer"}} onClick={openPlan}>
            <div style={{fontWeight:800,fontSize:15}}>📅 이번 주 독서 계획을 세워볼까요?</div>
            <div style={{marginTop:10,background:"rgba(255,255,255,0.25)",borderRadius:10,padding:"8px 14px",fontWeight:700,fontSize:13,textAlign:"center"}}>📚 지금 계획 세우기 →</div>
          </div>
        ):(
          <Card style={{border:`2px solid ${COLORS.orange}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontWeight:800,color:"#1e293b",fontSize:14}}>📅 이번 주 독서 계획</div>
              <button onClick={openPlan} style={{padding:"5px 10px",borderRadius:8,border:`1.5px solid ${COLORS.orange}`,background:"white",color:COLORS.orange,fontWeight:700,fontSize:12,cursor:"pointer"}}>수정</button>
            </div>
            <div style={{display:"flex",gap:4}}>
              {weekDates.map((d,i)=>{
                const b=books.find(bk=>bk.id===thisWeekPlan[i]);
                const isToday=d===today,done=records[`${d}_quiz`];
                return(
                  <div key={d} style={{flex:1,textAlign:"center"}}>
                    <div style={{fontSize:10,fontWeight:700,color:isToday?COLORS.orange:"#94a3b8",marginBottom:4}}>{WEEK_DAYS[i]}</div>
                    <div style={{height:44,borderRadius:10,background:!b?"#f8fafc":done?"#d1fae5":isToday?"#fef3c7":"#eff6ff",border:`2px solid ${!b?"#e2e8f0":done?"#10b981":isToday?COLORS.orange:COLORS.primary}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:b?18:12,color:"#e2e8f0"}}>
                      {b?b.emoji:"○"}
                    </div>
                    {done&&<div style={{fontSize:9,color:COLORS.green,marginTop:2,fontWeight:700}}>완료✓</div>}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {todayBook?(
          <Card>
            <div style={{fontSize:12,color:COLORS.primary,fontWeight:700,marginBottom:8}}>📖 오늘의 책</div>
            <div style={{display:"flex",gap:14,alignItems:"center"}}>
              <div style={{fontSize:44}}>{todayBook.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:800,fontSize:17,color:"#1e293b"}}>{todayBook.title}</div>
                <div style={{fontSize:13,color:"#64748b",marginTop:2}}>{todayBook.author} · {todayBook.pages}</div>
                <div style={{fontSize:12,color:COLORS.orange,marginTop:4}}>{todayBook.level} · {todayBook.grade}</div>
              </div>
            </div>
            <div style={{background:"#f8fafc",borderRadius:10,padding:"10px 12px",marginTop:12,fontSize:13,color:"#475569",lineHeight:1.6}}>{todayBook.summary}</div>
          </Card>
        ):(
          <div style={{background:"#fff7ed",borderRadius:14,padding:"18px",marginBottom:12,border:"1.5px solid #fed7aa",textAlign:"center"}}>
            <div style={{fontSize:32}}>📭</div>
            <div style={{fontWeight:700,color:"#ea580c",marginTop:8,fontSize:15}}>오늘 읽을 책이 없어요!</div>
            <button onClick={openPlan} style={{marginTop:12,padding:"10px 20px",borderRadius:10,border:"none",background:COLORS.orange,color:"white",fontWeight:700,cursor:"pointer"}}>📅 계획 수정하기</button>
          </div>
        )}

        {todayBook&&(
          <>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <button onClick={startQuiz} style={{padding:"16px 0",borderRadius:14,border:"none",background:todayDone.quiz?"#10b981":"linear-gradient(135deg,#3b82f6,#6366f1)",color:"white",fontWeight:800,fontSize:14,cursor:"pointer"}}>
                {todayDone.quiz?"✅ 퀴즈 완료":"✏️ 독서 확인 퀴즈"}
              </button>
              <button onClick={startChat} style={{padding:"16px 0",borderRadius:14,border:"none",background:todayDone.chat?"#10b981":"linear-gradient(135deg,#f59e0b,#ef4444)",color:"white",fontWeight:800,fontSize:14,cursor:"pointer"}}>
                {todayDone.chat?"✅ 대화 완료":"💬 독서 토론 질문"}
              </button>
            </div>
            <button onClick={()=>{setReviewSubmitted(false);setReview("");setScreen("review");}} style={{width:"100%",padding:16,borderRadius:14,border:"none",background:todayDone.review?"#10b981":"linear-gradient(135deg,#8b5cf6,#ec4899)",color:"white",fontWeight:800,fontSize:14,cursor:"pointer",marginBottom:10}}>
              {todayDone.review?"✅ 소감문 완료":"📝 소감문 쓰기"}
            </button>
          </>
        )}

        <Card>
          <div style={{fontSize:13,fontWeight:800,color:"#1e293b",marginBottom:8}}>🏅 배지 ({stats.earned.length}/{BADGES.length})</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {BADGES.map(b=>{const e=stats.earned.includes(b.id);return(
              <div key={b.id} title={b.desc} style={{background:e?"#eff6ff":"#f8fafc",border:`2px solid ${e?COLORS.primary:"#e2e8f0"}`,borderRadius:8,padding:"5px 10px",fontSize:12,color:e?"#1e293b":"#cbd5e1",opacity:e?1:0.5,fontWeight:e?700:400}}>{b.emoji} {b.label}</div>
            );})}
          </div>
        </Card>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>setScreen("records")} style={{flex:1,padding:13,borderRadius:14,border:"2px solid #e2e8f0",background:"white",color:"#64748b",fontWeight:700,fontSize:13,cursor:"pointer"}}>📅 나의 기록</button>
          <button onClick={()=>setScreen("vocab")} style={{flex:1,padding:13,borderRadius:14,border:"2px solid #e2e8f0",background:"white",color:"#10b981",fontWeight:700,fontSize:13,cursor:"pointer"}}>📖 단어장 {vocab.length>0?`(${vocab.length})`:"" }</button>
          <button onClick={()=>setScreen("login")} style={{padding:13,borderRadius:14,border:"2px solid #e2e8f0",background:"white",color:"#94a3b8",fontWeight:700,fontSize:13,cursor:"pointer"}}>로그아웃</button>
        </div>
      </div>
    );
  }

  // QUIZ
  if(screen==="quiz") return(
    <div style={wrap}>
      <BackHeader title="✏️ 독서 확인 퀴즈" bg="linear-gradient(135deg,#3b82f6,#6366f1)"/>
      {!quizResult?(
        <>
          {(todayBook?.quizzes||[]).map((q,i)=>(
            <Card key={i}>
              <div style={{fontWeight:700,color:"#1e293b",fontSize:14,marginBottom:10}}>Q{i+1}. {q.q}</div>
              {q.type==="ox"?(
                <div style={{display:"flex",gap:10}}>
                  {["O","X"].map(v=>(
                    <button key={v} onClick={()=>setQuizAnswers(p=>({...p,[i]:v}))}
                      style={{flex:1,padding:"12px 0",borderRadius:12,border:`2px solid ${quizAnswers[i]===v?COLORS.primary:"#e2e8f0"}`,background:quizAnswers[i]===v?"#eff6ff":"white",fontWeight:800,fontSize:22,cursor:"pointer",color:quizAnswers[i]===v?COLORS.primary:"#94a3b8"}}>{v}</button>
                  ))}
                </div>
              ):(
                <input
                  ref={el=>quizRefs.current[i]=el}
                  defaultValue={quizAnswers[i]||""}
                  placeholder="답을 써보세요..."
                  style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:14,fontFamily:"inherit"}}/>
              )}
              <div style={{fontSize:11,color:"#94a3b8",marginTop:8}}>💡 {q.hint}</div>
            </Card>
          ))}
          <GBtn label="🎯 제출하기" onClick={submitQuiz} bg="linear-gradient(135deg,#3b82f6,#6366f1)" full/>
        </>
      ):(
        <div>
          <div style={{background:"linear-gradient(135deg,#3b82f6,#6366f1)",borderRadius:16,padding:20,color:"white",textAlign:"center",marginBottom:14}}>
            <div style={{fontSize:40}}>{quizResult.total>=(todayBook?.quizzes?.length||4)-1?"🎉":"💪"}</div>
            <div style={{fontSize:22,fontWeight:800,marginTop:6}}>{quizResult.total}/{todayBook?.quizzes?.length||4} 정답</div>
            <div style={{fontSize:14,opacity:0.9,marginTop:8}}>{quizResult.total>=(todayBook?.quizzes?.length||4)-1?"책을 정말 꼼꼼히 읽었네요!":"조금 더 꼼꼼히 읽어보면 더 잘할 수 있어요!"}</div>
          </div>
          {(todayBook?.quizzes||[]).map((q,i)=>(
            <div key={i} style={{background:"white",borderRadius:12,padding:14,marginBottom:10,border:`2px solid ${quizResult.scores[i]?"#10b981":"#fca5a5"}`}}>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <div style={{fontSize:13,fontWeight:600,flex:1}}>Q{i+1}. {q.q}</div>
                <span style={{fontSize:18,marginLeft:8}}>{quizResult.scores[i]?"✅":"❌"}</span>
              </div>
              <div style={{fontSize:12,color:"#64748b",marginTop:6}}>정답: <strong>{q.answer}</strong></div>
            </div>
          ))}
          <GBtn label="🏠 홈으로" onClick={()=>setScreen("home")} bg="linear-gradient(135deg,#3b82f6,#6366f1)" full/>
        </div>
      )}
    </div>
  );

  // REVIEW
  if(screen==="review") return(
    <div style={wrap}>
      <BackHeader title="📝 소감문 쓰기" bg="linear-gradient(135deg,#8b5cf6,#ec4899)"/>
      {!reviewSubmitted?(
        <>
          <div style={{background:"#fdf4ff",borderRadius:12,padding:"12px 16px",marginBottom:14,border:"1.5px solid #e9d5ff"}}>
            <div style={{fontWeight:700,color:COLORS.purple,fontSize:14}}>💡 논술 팁</div>
            <div style={{fontSize:13,color:"#64748b",marginTop:4}}>내 생각 → 책의 내용 → 느낀 점 순서로 써보세요!</div>
          </div>
          <textarea value={review} onChange={e=>setReview(e.target.value)}
            placeholder={`${todayBook?.title}을(를) 읽고 느낀 점을 써보세요.\n\n예시:\n이 책을 읽고 나는...\n가장 인상 깊었던 장면은...\n내가 주인공이라면...`}
            rows={12} style={{width:"100%",padding:"14px",borderRadius:14,border:"1.5px solid #e2e8f0",fontSize:14,lineHeight:1.8,resize:"vertical",fontFamily:"inherit"}}/>
          <div style={{textAlign:"right",fontSize:12,color:"#94a3b8",margin:"4px 0 12px"}}>{review.length}자</div>
          <GBtn label="✅ 소감문 제출" onClick={submitReview} bg="linear-gradient(135deg,#8b5cf6,#ec4899)" full/>
        </>
      ):(
        <div>
          <Card style={{border:"1.5px solid #e2e8f0"}}>
            <div style={{fontSize:13,fontWeight:700,color:"#64748b",marginBottom:8}}>내가 쓴 소감문</div>
            <div style={{fontSize:13,color:"#1e293b",lineHeight:1.8,whiteSpace:"pre-wrap"}}>{review}</div>
          </Card>
          <div style={{background:"#fefce8",borderRadius:14,padding:"14px 16px",marginBottom:10,border:"1.5px solid #fde68a"}}>
            <div style={{fontWeight:800,color:"#d97706",marginBottom:8}}>⭐ 잘 썼어요!</div>
            <div style={{fontSize:14,color:"#1e293b",lineHeight:1.8}}>소감문을 완성했어요! 정말 대단해요! 💪</div>
          </div>
          {(todayBook?.feedbackTips||[]).map((tip,i)=>(
            <div key={i} style={{background:"#f0fdf4",borderRadius:12,padding:"12px 16px",marginBottom:8,border:"1.5px solid #bbf7d0"}}>
              <div style={{fontSize:13,color:"#16a34a"}}>✅ {tip}</div>
            </div>
          ))}
          <GBtn label="🏠 홈으로" onClick={()=>setScreen("home")} bg="linear-gradient(135deg,#8b5cf6,#ec4899)" full/>
        </div>
      )}
    </div>
  );

  // CHAT
  if(screen==="chat") return(
    <div style={{fontFamily:"'Apple SD Gothic Neo','Malgun Gothic','Segoe UI',sans-serif",maxWidth:500,margin:"0 auto",background:"#f0f4ff",height:"100vh",display:"flex",flexDirection:"column"}}>
      <div style={{padding:"14px 16px",background:"linear-gradient(135deg,#f59e0b,#ef4444)",color:"white",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
        <button onClick={()=>setScreen("home")} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"white",fontSize:18,cursor:"pointer",borderRadius:8,width:34,height:34}}>←</button>
        <div><div style={{fontWeight:800,fontSize:16}}>💬 독서 토론 질문</div><div style={{fontSize:12,opacity:0.85}}>{todayBook?.emoji} {todayBook?.title}</div></div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:10}}>
        <div style={{display:"flex",gap:8}}>
          <div style={{fontSize:24,alignSelf:"flex-end"}}>📖</div>
          <div style={{maxWidth:"80%",background:"white",borderRadius:"18px 18px 18px 4px",padding:"12px 16px",fontSize:14,lineHeight:1.7,boxShadow:"0 2px 8px rgba(0,0,0,0.08)"}}>
            안녕 {name}아! 👋 오늘 읽은 <strong>"{todayBook?.title}"</strong>에 대해 이야기해보자!<br/><br/>
            <strong>{CHAT_QUESTIONS[0]}</strong>
          </div>
        </div>
        {chatAnswers.map((ca,i)=>(
          <div key={i}>
            <div style={{display:"flex",justifyContent:"flex-end"}}>
              <div style={{maxWidth:"80%",background:"linear-gradient(135deg,#3b82f6,#6366f1)",color:"white",borderRadius:"18px 18px 4px 18px",padding:"12px 16px",fontSize:14,lineHeight:1.7}}>{ca.a}</div>
            </div>
            {i+1<CHAT_QUESTIONS.length&&(
              <div style={{display:"flex",gap:8,marginTop:10}}>
                <div style={{fontSize:24,alignSelf:"flex-end"}}>📖</div>
                <div style={{maxWidth:"80%",background:"white",borderRadius:"18px 18px 18px 4px",padding:"12px 16px",fontSize:14,lineHeight:1.7,boxShadow:"0 2px 8px rgba(0,0,0,0.08)"}}>
                  좋은 생각이에요! 😊<br/><br/><strong>{CHAT_QUESTIONS[i+1]}</strong>
                </div>
              </div>
            )}
            {i+1>=CHAT_QUESTIONS.length&&(
              <div style={{display:"flex",gap:8,marginTop:10}}>
                <div style={{fontSize:24,alignSelf:"flex-end"}}>📖</div>
                <div style={{maxWidth:"80%",background:"linear-gradient(135deg,#10b981,#3b82f6)",color:"white",borderRadius:"18px 18px 18px 4px",padding:"12px 16px",fontSize:14,lineHeight:1.7}}>
                  오늘 정말 훌륭하게 토론했어요! ⭐<br/>독서 토론 완료! 계속 이렇게 열심히 해봐요! 📚
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={chatEndRef}/>
      </div>
      {chatAnswers.length<CHAT_QUESTIONS.length?(
        <div style={{padding:12,background:"white",borderTop:"1px solid #e2e8f0",display:"flex",gap:8,flexShrink:0}}>
          <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()} placeholder="생각을 자유롭게 써보세요..."
            style={{flex:1,padding:"10px 14px",borderRadius:12,border:"1.5px solid #e2e8f0",fontSize:14,outline:"none",fontFamily:"inherit"}}/>
          <button onClick={sendChat} disabled={!chatInput.trim()} style={{padding:"10px 16px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#f59e0b,#ef4444)",color:"white",fontWeight:800,cursor:"pointer",fontSize:18}}>↑</button>
        </div>
      ):(
        <div style={{padding:12,background:"white",borderTop:"1px solid #e2e8f0",flexShrink:0}}>
          <button onClick={()=>setScreen("home")} style={{width:"100%",padding:13,borderRadius:12,border:"none",background:"linear-gradient(135deg,#f59e0b,#ef4444)",color:"white",fontWeight:800,fontSize:14,cursor:"pointer"}}>🏠 홈으로 돌아가기</button>
        </div>
      )}
    </div>
  );

  // VOCAB 단어장
  if(screen==="vocab") return(
    <div style={wrap}>
      <BackHeader title="📖 나의 단어장" bg="linear-gradient(135deg,#10b981,#3b82f6)"/>

      {/* 단어 추가 */}
      <Card>
        <div style={{fontWeight:800,color:"#1e293b",marginBottom:10}}>✏️ 새 단어 추가</div>
        <div style={{display:"flex",gap:8,marginBottom:8}}>
          <input ref={wordRef} placeholder="모르는 단어"
            style={{flex:1,padding:"10px 12px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:14,fontFamily:"inherit"}}/>
          <input ref={meaningRef} placeholder="뜻"
            style={{flex:1,padding:"10px 12px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:14,fontFamily:"inherit"}}/>
        </div>
        <button onClick={addVocab} style={{width:"100%",padding:"10px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#10b981,#3b82f6)",color:"white",fontWeight:700,cursor:"pointer"}}>
          + 단어 추가
        </button>
      </Card>

      {/* 테스트 버튼 */}
      {vocab.length>=2&&!vocabTest&&(
        <button onClick={startVocabTest} style={{width:"100%",padding:14,borderRadius:14,border:"none",background:"linear-gradient(135deg,#f59e0b,#ef4444)",color:"white",fontWeight:800,fontSize:15,cursor:"pointer",marginBottom:12,boxShadow:"0 3px 12px rgba(245,158,11,0.3)"}}>
          🎯 단어 테스트 시작! ({Math.min(vocab.length,10)}문제)
        </button>
      )}

      {/* 단어 테스트 */}
      {vocabTest&&!vocabTestResult&&(
        <Card style={{border:"2px solid #f59e0b"}}>
          <div style={{fontWeight:800,color:COLORS.orange,marginBottom:12}}>🎯 단어 테스트</div>
          {vocabTest.map((v,i)=>(
            <div key={i} style={{marginBottom:14}}>
              <div style={{fontWeight:700,color:"#1e293b",fontSize:15,marginBottom:6}}>Q{i+1}. <span style={{color:COLORS.primary}}>{v.word}</span> 의 뜻은?</div>
              <div style={{fontSize:11,color:"#94a3b8",marginBottom:6}}>📖 {v.book}</div>
              <input
                ref={el=>vocabRefs.current[i]=el}
                defaultValue={vocabTestAnswers[i]||""}
                placeholder="뜻을 써보세요..."
                style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:14,fontFamily:"inherit"}}/>
            </div>
          ))}
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{setVocabTest(null);setVocabTestResult(null);}} style={{flex:1,padding:12,borderRadius:10,border:"2px solid #e2e8f0",background:"white",color:"#64748b",fontWeight:700,cursor:"pointer"}}>취소</button>
            <button onClick={submitVocabTest} style={{flex:2,padding:12,borderRadius:10,border:"none",background:`linear-gradient(135deg,${COLORS.orange},${COLORS.red})`,color:"white",fontWeight:800,cursor:"pointer"}}>제출하기 🎯</button>
          </div>
        </Card>
      )}

      {/* 테스트 결과 */}
      {vocabTestResult&&(
        <Card style={{border:"2px solid #10b981"}}>
          <div style={{textAlign:"center",padding:"10px 0",marginBottom:12}}>
            <div style={{fontSize:36}}>{vocabTestResult.total===vocabTest.length?"🎉":vocabTestResult.total>=vocabTest.length/2?"👍":"💪"}</div>
            <div style={{fontWeight:800,fontSize:20,color:COLORS.primary,marginTop:6}}>{vocabTestResult.total}/{vocabTest.length} 정답!</div>
            <div style={{fontSize:13,color:"#64748b",marginTop:4}}>
              {vocabTestResult.total===vocabTest.length?"완벽해요! 모든 단어를 외웠어요!":vocabTestResult.total>=vocabTest.length/2?"절반 이상 맞았어요! 조금만 더 연습해봐요!":"다시 한번 단어장을 읽고 도전해봐요!"}
            </div>
          </div>
          {vocabTest.map((v,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #f1f5f9"}}>
              <span style={{fontSize:18}}>{vocabTestResult.scores[i]?"✅":"❌"}</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:14,color:COLORS.primary}}>{v.word}</div>
                <div style={{fontSize:12,color:"#64748b"}}>정답: {v.meaning}</div>
              </div>
            </div>
          ))}
          <button onClick={()=>{setVocabTest(null);setVocabTestResult(null);}} style={{width:"100%",marginTop:12,padding:12,borderRadius:10,border:"none",background:"linear-gradient(135deg,#10b981,#3b82f6)",color:"white",fontWeight:700,cursor:"pointer"}}>
            다시 테스트하기 🔄
          </button>
        </Card>
      )}

      {/* 단어 목록 */}
      <Card>
        <div style={{fontWeight:800,color:"#1e293b",marginBottom:10}}>📚 내 단어장 ({vocab.length}개)</div>
        {vocab.length===0&&<div style={{fontSize:13,color:"#94a3b8",textAlign:"center",padding:"20px 0"}}>아직 단어가 없어요!<br/>책을 읽다가 모르는 단어를 추가해봐요 😊</div>}
        {vocab.map((v,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"1px solid #f1f5f9"}}>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,color:COLORS.primary,fontSize:15}}>{v.word}</div>
              <div style={{fontSize:13,color:"#1e293b",marginTop:2}}>{v.meaning}</div>
              <div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>📖 {v.book} · {v.date}</div>
            </div>
            <button onClick={()=>deleteVocab(i)} style={{background:"#fee2e2",border:"none",color:"#ef4444",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:12,fontWeight:700}}>삭제</button>
          </div>
        ))}
      </Card>

      <GBtn label="🏠 홈으로" onClick={()=>setScreen("home")} bg="linear-gradient(135deg,#10b981,#3b82f6)" full/>
    </div>
  );

  // RECORDS
  if(screen==="records"){
    const stats=calcStats(records);
    return(
      <div style={wrap}>
        <BackHeader title="📅 나의 독서 기록" bg="linear-gradient(135deg,#3b82f6,#6366f1)"/>
        <div style={{background:`linear-gradient(135deg,${stats.level.color},${stats.level.color}99)`,borderRadius:16,padding:20,color:"white",marginBottom:12,textAlign:"center"}}>
          <div style={{fontSize:44}}>{stats.level.emoji}</div>
          <div style={{fontWeight:800,fontSize:20,marginTop:6}}>{stats.level.label}</div>
          <div style={{fontSize:13,opacity:0.9,marginTop:4}}>총 활동 {stats.total}회 · 🔥{stats.streak}일</div>
          <div style={{display:"flex",justifyContent:"center",gap:20,marginTop:12}}>
            {[["퀴즈",stats.qc,"✏️"],["소감문",stats.rc,"📝"],["대화",stats.cc,"💬"]].map(([l,c,e])=>(
              <div key={l}><div style={{fontSize:22,fontWeight:800}}>{c}</div><div style={{fontSize:11,opacity:0.85}}>{e}{l}</div></div>
            ))}
          </div>
        </div>
        <Card>
          <div style={{fontWeight:800,color:"#1e293b",marginBottom:10}}>최근 2주 기록</div>
          {getLastDays(14).map(d=>{
            const q=records[`${d}_quiz`],r=records[`${d}_review`],c=records[`${d}_chat`];
            const total=[q,r,c].filter(Boolean).length,isToday=d===today;
            return(
              <div key={d} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:"1px solid #f1f5f9"}}>
                <div style={{width:60,fontSize:12,color:isToday?COLORS.primary:"#64748b",fontWeight:isToday?700:400}}>
                  {new Date(d).toLocaleDateString("ko-KR",{month:"short",day:"numeric"})}{isToday?" 오늘":""}
                </div>
                <div style={{flex:1,display:"flex",gap:4}}>
                  {[["퀴즈",q],["소감문",r],["대화",c]].map(([l,done])=>(
                    <div key={l} style={{flex:1,textAlign:"center",padding:"4px 0",borderRadius:8,background:done?"#eff6ff":"#f8fafc",fontSize:11,color:done?COLORS.primary:"#cbd5e1",fontWeight:700}}>{done?"✅":""}{l}</div>
                  ))}
                </div>
                <div style={{fontSize:13,fontWeight:800,color:total===3?"#10b981":total>0?COLORS.orange:"#e2e8f0"}}>{total}/3</div>
              </div>
            );
          })}
        </Card>
        <GBtn label="🏠 홈으로" onClick={()=>setScreen("home")} bg="linear-gradient(135deg,#3b82f6,#6366f1)" full/>
      </div>
    );
  }

  // PARENT
  if(screen==="parent"){
    const stats=calcStats(records);
    return(
      <div style={wrap}>
        <div style={{background:"linear-gradient(135deg,#10b981,#3b82f6)",borderRadius:16,padding:"18px",color:"white",marginBottom:14}}>
          <div style={{fontSize:13,opacity:0.85}}>학부모 리포트</div>
          <div style={{fontSize:20,fontWeight:800,marginTop:4}}>👨‍👩‍👧 {parentTarget} 학습 현황</div>
        </div>
        <Card>
          <div style={{fontWeight:800,marginBottom:12}}>📊 종합 현황</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[["현재 레벨",`${stats.level.emoji} ${stats.level.label}`,stats.level.color],["연속 독서",`🔥 ${stats.streak}일`,"#ef4444"],["총 퀴즈",`✏️ ${stats.qc}회`,COLORS.primary],["총 소감문",`📝 ${stats.rc}회`,COLORS.purple],["총 대화",`💬 ${stats.cc}회`,COLORS.orange],["획득 배지",`🏅 ${stats.earned.length}/${BADGES.length}개`,"#10b981"]].map(([l,v,c])=>(
              <div key={l} style={{background:"#f8fafc",borderRadius:12,padding:"12px 14px"}}>
                <div style={{fontSize:11,color:"#64748b"}}>{l}</div>
                <div style={{fontSize:15,fontWeight:800,color:c,marginTop:4}}>{v}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div style={{fontWeight:800,marginBottom:10}}>📅 최근 2주 활동</div>
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
            {stats.total===0?`${parentTarget} 학생이 아직 독서를 시작하지 않았어요. 함께 첫 책을 시작해보세요! 📚`:stats.streak>=5?`${parentTarget} 학생이 ${stats.streak}일 연속으로 독서하고 있어요! 🔥`:`${parentTarget} 학생이 총 ${stats.total}번의 활동을 완료했어요! 👏`}
          </div>
        </div>
        <GBtn label="로그아웃" onClick={()=>setScreen("login")} bg="#64748b" full/>
      </div>
    );
  }

  // ADMIN
  if(screen==="admin"){
    return(
      <div style={wrap}>
        <div style={{background:"linear-gradient(135deg,#1e293b,#334155)",borderRadius:16,padding:"18px",color:"white",marginBottom:14}}>
          <div style={{fontSize:20,fontWeight:800}}>🔐 선생님 대시보드</div>
        </div>
        <Card>
          <div style={{fontWeight:800,marginBottom:12}}>👩‍🎓 학생 현황 ({allStudents.length}명)</div>
          {allStudents.length===0&&<div style={{fontSize:13,color:"#94a3b8"}}>아직 접속한 학생이 없어요.</div>}
          {allStudents.map(sn=>(
            <div key={sn} style={{padding:"10px 0",borderBottom:"1px solid #f1f5f9"}}>
              <div style={{fontWeight:700,color:"#1e293b"}}>👤 {sn}</div>
            </div>
          ))}
        </Card>
        <GBtn label="로그아웃" onClick={()=>setScreen("login")} bg="#64748b" full/>
      </div>
    );
  }

  return null;
}
