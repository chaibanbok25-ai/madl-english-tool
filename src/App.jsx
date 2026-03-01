import { useState, useEffect } from "react";

async function callClaude(system, user) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system,
      messages: [{ role: "user", content: user }]
    })
  });
  const d = await res.json();
  const text = d.content[0].text;
  const m = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  return JSON.parse(m ? m[0] : text);
}

// Storage helpers (localStorage for Vercel deployment)
function sget(key) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; }
  catch { return null; }
}
function sset(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

const C = {
  blue:"#2563eb", blueLt:"#dbeafe", green:"#059669", greenLt:"#d1fae5",
  purple:"#7c3aed", purpleLt:"#ede9fe", red:"#dc2626", redLt:"#fee2e2",
  orange:"#d97706", orangeLt:"#fef3c7", ink:"#1a1e2e", muted:"#6b7280",
  border:"#e2e8f0", bg:"#f0f4ff", accent:"#1e3a8a", surface:"#fff",
  teal:"#0d9488", tealLt:"#ccfbf1"
};

const GRADE_DESC = {
  el34: "elementary grade 3-4 (simple sentences, 80-100 words)",
  el56: "elementary grade 5-6 (moderate sentences, 120-150 words)",
  mid1: "middle school grade 1 (compound sentences, 150-180 words)",
  mid2: "middle school grade 2-3 (complex sentences, 180-220 words)",
  high: "high school level (advanced, 200-250 words)"
};
const GRADE_LABELS = {
  el34:"초등 3-4학년", el56:"초등 5-6학년",
  mid1:"중등 1학년", mid2:"중등 2-3학년", high:"고등학생"
};

const TEACHER_PW = "madl1234";

const Btn = ({ onClick, disabled, color = C.blue, children, small, style = {} }) => (
  <button onClick={onClick} disabled={disabled}
    style={{
      padding: small ? "7px 14px" : "10px 20px", borderRadius: 9, border: "none",
      background: disabled ? "#c8d0e8" : color, color: disabled ? C.muted : "white",
      fontWeight: 700, fontSize: small ? 12 : 13, cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 6, ...style
    }}>{children}</button>
);

const Inp = ({ label, value, onChange, type = "text", placeholder }) => (
  <div>
    {label && <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 5 }}>{label}</div>}
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", color: C.ink, boxSizing: "border-box" }} />
  </div>
);

const Sel = ({ label, value, onChange, options }) => (
  <div>
    {label && <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 5 }}>{label}</div>}
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width: "100%", padding: "8px 10px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.ink, background: C.bg, fontFamily: "inherit", outline: "none" }}>
      {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  </div>
);

const Loading = ({ msg }) => (
  <div style={{ textAlign: "center", padding: "40px", color: C.muted }}>
    <div style={{ width: 32, height: 32, border: `3px solid ${C.border}`, borderTopColor: C.blue, borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 12px" }} />
    <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{msg}</div>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

// ══════════════════════════════════════
// LOGIN
// ══════════════════════════════════════
function LoginScreen({ onStudentLogin, onTeacherLogin }) {
  const [mode, setMode] = useState("student");
  const [num, setNum] = useState("");
  const [pw, setPw] = useState("");
  const [tpw, setTpw] = useState("");
  const [error, setError] = useState("");

  const studentLogin = () => {
    const students = sget("students") || {};
    const found = Object.values(students).find(s => s.number === num && s.password === pw);
    if (found) onStudentLogin(found);
    else setError("번호 또는 비밀번호가 틀렸습니다.");
  };

  const teacherLogin = () => {
    if (tpw === TEACHER_PW) onTeacherLogin();
    else setError("선생님 비밀번호가 틀렸습니다.");
  };

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${C.accent} 0%, #3b82f6 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: C.surface, borderRadius: 20, padding: 36, width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📚</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: C.accent }}>AI 영어 학습 툴</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>베이스캠프 · 쪽마 · Chai-Banbok</div>
        </div>
        <div style={{ display: "flex", background: C.bg, borderRadius: 10, padding: 4, marginBottom: 24 }}>
          {[["student", "👨‍🎓 학생"], ["teacher", "👩‍🏫 선생님"]].map(([m, l]) => (
            <button key={m} onClick={() => { setMode(m); setError(""); }}
              style={{ flex: 1, padding: "9px", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit", background: mode === m ? C.surface : "transparent", color: mode === m ? C.accent : C.muted, boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,.1)" : "none" }}>
              {l}
            </button>
          ))}
        </div>
        {mode === "student" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Inp label="학생 번호" value={num} onChange={setNum} placeholder="예: 001" />
            <Inp label="비밀번호" value={pw} onChange={setPw} type="password" placeholder="비밀번호 입력" />
            {error && <div style={{ fontSize: 12, color: C.red, textAlign: "center" }}>{error}</div>}
            <Btn onClick={studentLogin} disabled={!num || !pw} style={{ width: "100%", justifyContent: "center" }}>🚀 시작하기</Btn>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Inp label="선생님 비밀번호" value={tpw} onChange={setTpw} type="password" placeholder="비밀번호 입력" />
            {error && <div style={{ fontSize: 12, color: C.red, textAlign: "center" }}>{error}</div>}
            <Btn onClick={teacherLogin} disabled={!tpw} color={C.purple} style={{ width: "100%", justifyContent: "center" }}>🏫 관리자 입장</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// TEACHER DASHBOARD
// ══════════════════════════════════════
function TeacherDashboard({ onLogout }) {
  const [tab, setTab] = useState("students");
  const [students, setStudents] = useState({});
  const [newName, setNewName] = useState("");
  const [newNum, setNewNum] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newGrade, setNewGrade] = useState("el56");
  const [selectedSt, setSelectedSt] = useState(null);
  const [results, setResults] = useState([]);
  const [report, setReport] = useState("");
  const [loadingReport, setLoadingReport] = useState(false);
  const [ccInput, setCcInput] = useState({ vocab: "", grammar: "", listening: "" });

  useEffect(() => { setStudents(sget("students") || {}); }, []);

  const addStudent = () => {
    if (!newName || !newNum || !newPw) return;
    const s = sget("students") || {};
    const id = "st_" + Date.now();
    s[id] = { id, name: newName, number: newNum, password: newPw, grade: newGrade, createdAt: new Date().toLocaleDateString("ko-KR") };
    sset("students", s);
    setStudents({ ...s });
    setNewName(""); setNewNum(""); setNewPw("");
  };

  const deleteStudent = (id) => {
    if (!window.confirm("삭제할까요?")) return;
    const s = sget("students") || {};
    delete s[id];
    sset("students", s);
    setStudents({ ...s });
  };

  const viewResults = (st) => {
    setSelectedSt(st);
    setResults(sget("results_" + st.id) || []);
    setReport("");
    setTab("report");
  };

  const saveCcResult = () => {
    if (!selectedSt) return;
    const r = sget("results_" + selectedSt.id) || [];
    r.push({ type: "classcard", date: new Date().toLocaleDateString("ko-KR"), ...ccInput });
    sset("results_" + selectedSt.id, r);
    setResults([...r]);
    setCcInput({ vocab: "", grammar: "", listening: "" });
    alert("저장됐습니다!");
  };

  const generateReport = async () => {
    if (!selectedSt || results.length === 0) return;
    setLoadingReport(true);
    try {
      const r = await callClaude(
        "You are a Korean English tutor writing a parent report. Write in warm, professional Korean. Respond ONLY with valid JSON.",
        `Write a weekly parent report for ${selectedSt.name} (${GRADE_LABELS[selectedSt.grade]}).
Recent results: ${JSON.stringify(results.slice(-10))}
Return ONLY: {"report": "학부모님께\\n\\n[이번 주 요약]\\n...\\n\\n[잘한 점]\\n...\\n\\n[보완할 점]\\n...\\n\\n[다음 주 방향]\\n...\\n\\nAI 영어 학습 툴 드림"}`
      );
      setReport(r.report);
    } catch (e) { alert("오류: " + e.message); }
    finally { setLoadingReport(false); }
  };

  const stList = Object.values(students);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "sans-serif" }}>
      <div style={{ background: `linear-gradient(135deg, ${C.purple}, #6d28d9)`, padding: "16px 22px", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 900 }}>🏫 선생님 대시보드</div>
          <div style={{ fontSize: 11, opacity: .7 }}>학생관리 · 결과조회 · 리포트</div>
        </div>
        <Btn onClick={onLogout} color="rgba(255,255,255,.2)" small style={{ border: "1px solid rgba(255,255,255,.4)" }}>로그아웃</Btn>
      </div>
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, display: "flex" }}>
        {[["students", "👥 학생관리"], ["report", "📊 결과·리포트"]].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex: 1, padding: "13px", border: "none", borderBottom: `3px solid ${tab === t ? C.purple : "transparent"}`, background: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit", color: tab === t ? C.purple : C.muted }}>
            {l}
          </button>
        ))}
      </div>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "20px 14px 60px" }}>
        {tab === "students" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.purple, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 14 }}>➕ 학생 등록</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10, marginBottom: 12 }}>
                <Inp label="이름" value={newName} onChange={setNewName} placeholder="홍길동" />
                <Inp label="번호" value={newNum} onChange={setNewNum} placeholder="001" />
                <Inp label="비밀번호" value={newPw} onChange={setNewPw} placeholder="1234" type="password" />
                <Sel label="학년" value={newGrade} onChange={setNewGrade} options={Object.entries(GRADE_LABELS).map(([v, l]) => ({ v, l }))} />
              </div>
              <Btn onClick={addStudent} disabled={!newName || !newNum || !newPw} color={C.purple}>➕ 등록</Btn>
            </div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 14 }}>👥 등록된 학생 ({stList.length}명)</div>
              {stList.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px", color: C.muted, fontSize: 13 }}>아직 등록된 학생이 없습니다</div>
              ) : stList.map(st => (
                <div key={st.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: C.bg, borderRadius: 10, marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, background: C.purple + "22", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👤</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>{st.name}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>번호 {st.number} · {GRADE_LABELS[st.grade]}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Btn onClick={() => viewResults(st)} color={C.blue} small>📊 결과보기</Btn>
                    <Btn onClick={() => deleteStudent(st.id)} color={C.red} small>삭제</Btn>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "report" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 12 }}>학생 선택</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {stList.map(st => (
                  <button key={st.id} onClick={() => viewResults(st)}
                    style={{ padding: "8px 14px", borderRadius: 8, border: `2px solid ${selectedSt?.id === st.id ? C.purple : C.border}`, background: selectedSt?.id === st.id ? C.purpleLt : C.surface, cursor: "pointer", fontSize: 13, fontWeight: 700, color: selectedSt?.id === st.id ? C.purple : C.ink, fontFamily: "inherit" }}>
                    {st.name}
                  </button>
                ))}
              </div>
            </div>
            {selectedSt && (
              <>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.orange, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 12 }}>📱 ClassCard 결과 입력 — {selectedSt.name}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10, marginBottom: 12 }}>
                    <Inp label="단어 (점수/개수)" value={ccInput.vocab} onChange={v => setCcInput(p => ({ ...p, vocab: v }))} placeholder="예: 18/20" />
                    <Inp label="문법 (PASS/FAIL)" value={ccInput.grammar} onChange={v => setCcInput(p => ({ ...p, grammar: v }))} placeholder="PASS" />
                    <Inp label="듣기 (점수)" value={ccInput.listening} onChange={v => setCcInput(p => ({ ...p, listening: v }))} placeholder="예: 90" />
                  </div>
                  <Btn onClick={saveCcResult} color={C.orange} small>💾 저장</Btn>
                </div>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 14 }}>📋 {selectedSt.name}의 학습 기록 ({results.length}건)</div>
                  {results.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "20px", color: C.muted, fontSize: 13 }}>아직 기록이 없습니다</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 300, overflowY: "auto" }}>
                      {[...results].reverse().map((r, i) => (
                        <div key={i} style={{ padding: "10px 14px", background: C.bg, borderRadius: 8, fontSize: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontWeight: 700, color: r.type === "reading" ? C.blue : r.type === "essay" ? C.purple : r.type === "naesin" ? C.orange : C.teal }}>
                              {r.type === "reading" ? "📖 독해" : r.type === "essay" ? "✍️ 에세이" : r.type === "naesin" ? "📝 내신" : "📱 ClassCard"}
                            </span>
                            <span style={{ color: C.muted }}>{r.date}</span>
                          </div>
                          <span>{r.type === "classcard" ? `단어 ${r.vocab} · 문법 ${r.grammar} · 듣기 ${r.listening}` : `${r.score}점${r.topic ? ` · ${r.topic}` : ""}`}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.green, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 12 }}>💬 학부모 리포트 자동생성</div>
                  <Btn onClick={generateReport} disabled={loadingReport || results.length === 0} color={C.green}>{loadingReport ? "⏳ 생성 중..." : "🤖 AI 리포트 생성"}</Btn>
                  {loadingReport && <Loading msg="AI가 리포트를 작성 중입니다..." />}
                  {report && (
                    <div style={{ marginTop: 14 }}>
                      <div style={{ background: C.greenLt, border: `1px solid #6ee7b7`, borderRadius: 10, padding: 16, fontSize: 13, lineHeight: 1.9, color: "#064e3b", whiteSpace: "pre-wrap" }}>{report}</div>
                      <Btn onClick={() => { navigator.clipboard?.writeText(report); alert("복사됐습니다! 카카오톡에 붙여넣으세요 😊"); }} color={C.teal} small style={{ marginTop: 10 }}>📋 카카오톡 복사</Btn>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// STUDENT APP
// ══════════════════════════════════════
function StudentDashboard({ student, onLogout }) {
  const [tab, setTab] = useState("home");

  const saveResult = (type, score, extra = {}) => {
    const r = sget("results_" + student.id) || [];
    r.push({ type, score, date: new Date().toLocaleDateString("ko-KR"), ...extra });
    sset("results_" + student.id, r);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "sans-serif" }}>
      <div style={{ background: `linear-gradient(135deg, ${C.accent}, #3b82f6)`, padding: "16px 22px", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 900 }}>📚 AI 영어 학습 툴</div>
          <div style={{ fontSize: 11, opacity: .7 }}>안녕하세요, {student.name}님 · {GRADE_LABELS[student.grade]}</div>
        </div>
        <Btn onClick={onLogout} color="rgba(255,255,255,.2)" small style={{ border: "1px solid rgba(255,255,255,.4)" }}>로그아웃</Btn>
      </div>
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, display: "flex", overflowX: "auto" }}>
        {[["home", "🏠 홈"], ["reading", "📖 독해"], ["essay", "✍️ 에세이"], ["naesin", "📝 내신"]].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex: 1, minWidth: 70, padding: "13px 8px", border: "none", borderBottom: `3px solid ${tab === t ? C.blue : "transparent"}`, background: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit", color: tab === t ? C.blue : C.muted, whiteSpace: "nowrap" }}>
            {l}
          </button>
        ))}
      </div>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "20px 14px 60px" }}>
        {tab === "home" && <StudentHome student={student} />}
        {tab === "reading" && <ReadingTool student={student} saveResult={saveResult} />}
        {tab === "essay" && <EssayTool student={student} saveResult={saveResult} />}
        {tab === "naesin" && <NaesinTool student={student} saveResult={saveResult} />}
      </div>
    </div>
  );
}

function StudentHome({ student }) {
  const results = sget("results_" + student.id) || [];
  const reading = results.filter(r => r.type === "reading");
  const essay = results.filter(r => r.type === "essay");
  const naesin = results.filter(r => r.type === "naesin");
  const avg = arr => arr.length ? Math.round(arr.reduce((s, r) => s + (r.score || 0), 0) / arr.length) : "-";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: `linear-gradient(135deg, ${C.accent}, #3b82f6)`, borderRadius: 14, padding: 24, color: "white" }}>
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>안녕하세요, {student.name}님! 👋</div>
        <div style={{ fontSize: 13, opacity: .8 }}>오늘도 열심히 해봐요!</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {[
          { label: "📖 독해", count: reading.length, avg: avg(reading), color: C.blue, lt: C.blueLt },
          { label: "✍️ 에세이", count: essay.length, avg: avg(essay), color: C.purple, lt: C.purpleLt },
          { label: "📝 내신", count: naesin.length, avg: avg(naesin), color: C.orange, lt: C.orangeLt },
        ].map((x, i) => (
          <div key={i} style={{ background: x.lt, border: `1px solid ${x.color}33`, borderRadius: 12, padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: x.color, marginBottom: 8 }}>{x.label}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: x.color }}>{x.avg}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>평균 · {x.count}회</div>
          </div>
        ))}
      </div>
      {results.length > 0 && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 12 }}>📋 최근 학습 기록</div>
          {[...results].reverse().slice(0, 5).map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 4 ? `1px solid ${C.border}` : "none", fontSize: 13 }}>
              <span>{r.type === "reading" ? "📖 독해" : r.type === "essay" ? "✍️ 에세이" : "📝 내신"} {r.topic || ""}</span>
              <span style={{ fontWeight: 700, color: r.score >= 80 ? C.green : r.score >= 60 ? C.orange : C.red }}>{r.score}점 · {r.date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReadingTool({ student, saveResult }) {
  const [topic, setTopic] = useState("animals");
  const [qcount, setQcount] = useState("4");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [grading, setGrading] = useState(false);

  const generate = async () => {
    setLoading(true); setData(null); setAnswers({}); setResults(null);
    try {
      const r = await callClaude(
        "You are an English education expert. Respond ONLY with valid JSON.",
        `Create an English reading passage for ${GRADE_DESC[student.grade]} students. Topic: ${topic}. Make ${qcount} questions (mix mc and short).
Return ONLY: {"title":"...","topic_kr":"...","wordCount":120,"passage":"...","questions":[{"type":"mc","question":"?","options":["① A","② B","③ C","④ D"],"answer":"2","explanation_kr":"..."},{"type":"short","question":"?","answer":"...","explanation_kr":"..."}]}`
      );
      setData(r);
    } catch (e) { alert("오류: " + e.message); }
    finally { setLoading(false); }
  };

  const gradeAnswers = async () => {
    setGrading(true);
    const shortQs = data.questions.map((q, i) => q.type === "short" ? { i, q, ans: answers[i] || "" } : null).filter(Boolean);
    let aiG = {};
    if (shortQs.length > 0) {
      try {
        const r = await callClaude("Judge answers. Return ONLY JSON array like [{\"i\":0,\"correct\":true}]",
          shortQs.map(s => `Q${s.i}: expected="${s.q.answer}", student="${s.ans}"`).join("\n"));
        (Array.isArray(r) ? r : []).forEach(x => { aiG[x.i] = x.correct; });
      } catch (e) {}
    }
    const res = data.questions.map((q, i) => ({
      isCorrect: q.type === "mc" ? parseInt(answers[i]) === parseInt(q.answer) : (aiG[i] || false),
      answer: q.answer, exp: q.explanation_kr
    }));
    setResults(res);
    saveResult("reading", Math.round(res.filter(r => r.isCorrect).length / res.length * 100), { topic });
    setGrading(false);
  };

  const correct = results ? results.filter(r => r.isCorrect).length : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 14 }}>📐 지문 설정</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, marginBottom: 14 }}>
          <Sel label="주제" value={topic} onChange={setTopic} options={[
            { v: "animals", l: "동물/자연" }, { v: "science", l: "과학/기술" }, { v: "culture", l: "문화/사회" },
            { v: "health", l: "건강/음식" }, { v: "environment", l: "환경/지구" }, { v: "sports", l: "스포츠" }, { v: "history", l: "역사/인물" }]} />
          <Sel label="문제 수" value={qcount} onChange={setQcount} options={[{ v: "3", l: "3문제" }, { v: "4", l: "4문제" }, { v: "5", l: "5문제" }]} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn onClick={generate} disabled={loading}>{loading ? "⏳ 생성 중..." : "🤖 AI 지문 생성"}</Btn>
          {data && <Btn onClick={() => { setData(null); setAnswers({}); setResults(null); }} color="#64748b">🔄 새 지문</Btn>}
        </div>
      </div>
      {loading && <Loading msg="AI가 지문과 문제를 생성 중입니다..." />}
      {!loading && !data && (
        <div style={{ textAlign: "center", padding: "50px 20px", color: C.muted }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📖</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.ink, marginBottom: 6 }}>AI 지문 생성을 눌러보세요</div>
          <div style={{ fontSize: 13 }}>학년에 맞는 지문과 문제가 자동으로 만들어집니다</div>
        </div>
      )}
      {data && (
        <>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 22 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.accent, marginBottom: 12 }}>{data.title}</div>
            <div style={{ fontSize: 14, lineHeight: 2, background: "#f8faff", borderRadius: 10, padding: "14px 16px", borderLeft: `4px solid ${C.blue}`, whiteSpace: "pre-wrap" }}>{data.passage}</div>
          </div>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 22 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.accent, marginBottom: 16 }}>📝 문제를 풀어보세요</div>
            {data.questions.map((q, i) => (
              <div key={i} style={{ marginBottom: 22, paddingBottom: 22, borderBottom: i < data.questions.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <span style={{ display: "inline-flex", minWidth: 26, height: 26, background: results ? (results[i].isCorrect ? C.green : C.red) : C.blue, color: "white", borderRadius: "50%", fontSize: 12, fontWeight: 700, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{q.question}</span>
                </div>
                {q.type === "mc" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {q.options.map((opt, oi) => {
                      let bg = "#f8faff", border = C.border;
                      if (results) { if (oi + 1 === parseInt(q.answer)) { bg = C.greenLt; border = C.green; } else if (oi + 1 === parseInt(answers[i]) && !results[i].isCorrect) { bg = C.redLt; border = C.red; } }
                      else if (parseInt(answers[i]) === oi + 1) { bg = C.blueLt; border = C.blue; }
                      return <div key={oi} onClick={() => !results && setAnswers(a => ({ ...a, [i]: oi + 1 }))} style={{ padding: "9px 13px", border: `1px solid ${border}`, borderRadius: 8, cursor: results ? "default" : "pointer", background: bg, fontSize: 13 }}>{opt}</div>;
                    })}
                  </div>
                )}
                {q.type === "short" && (
                  <textarea disabled={!!results} value={answers[i] || ""} onChange={e => setAnswers(a => ({ ...a, [i]: e.target.value }))} placeholder="영어로 답을 써보세요..."
                    style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", resize: "vertical", minHeight: 65, outline: "none" }} />
                )}
                {results && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ background: results[i].isCorrect ? C.greenLt : C.redLt, border: `1px solid ${results[i].isCorrect ? "#6ee7b7" : "#fca5a5"}`, borderRadius: 8, padding: "8px 13px", fontSize: 13, color: results[i].isCorrect ? "#064e3b" : "#7f1d1d" }}>
                      {results[i].isCorrect ? "✅ 정답!" : `❌ 오답 — 정답: ${results[i].answer}`}
                    </div>
                    <div style={{ background: C.blueLt, border: "1px solid #93c5fd", borderRadius: 8, padding: "8px 13px", fontSize: 13, color: "#1e3a8a", marginTop: 5 }}>💡 {results[i].exp}</div>
                  </div>
                )}
              </div>
            ))}
            {!results && <Btn onClick={gradeAnswers} disabled={grading} color={C.green}>{grading ? "⏳ 채점 중..." : "✅ 채점하기"}</Btn>}
            {results && (
              <div style={{ background: `linear-gradient(135deg,${C.accent},#3b82f6)`, color: "white", borderRadius: 12, padding: 22, textAlign: "center" }}>
                <div style={{ fontSize: 32 }}>{correct === data.questions.length ? "🏆" : correct >= data.questions.length * .75 ? "🎉" : "💪"}</div>
                <div style={{ fontSize: 40, fontWeight: 900, margin: "6px 0" }}>{correct} / {data.questions.length}</div>
                <div style={{ fontSize: 13, opacity: .85 }}>{Math.round(correct / data.questions.length * 100)}점 · 결과 저장됨 ✅</div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function EssayTool({ student, saveResult }) {
  const [topicType, setTopicType] = useState("opinion");
  const [fbLevel, setFbLevel] = useState("balanced");
  const [custom, setCustom] = useState("");
  const [loadT, setLoadT] = useState(false);
  const [topicData, setTopicData] = useState(null);
  const [text, setText] = useState("");
  const [loadF, setLoadF] = useState(false);
  const [fb, setFb] = useState(null);
  const wc = text.trim() ? text.trim().split(/\s+/).length : 0;
  const sizeMap = { el34: "3-5 sentences", el56: "5-8 sentences", mid1: "1 paragraph", mid2: "2-3 paragraphs", high: "3-4 paragraphs" };

  const getTopic = async () => {
    setLoadT(true); setTopicData(null); setFb(null); setText("");
    if (custom.trim()) { setTopicData({ topic_en: custom, topic_kr: "직접 입력", tips: ["자유롭게 써보세요!", "영어로 생각을 표현해보세요"], target: "자유롭게" }); setLoadT(false); return; }
    try {
      const r = await callClaude("You are an English education expert. Respond ONLY with valid JSON.",
        `Create essay topic for ${GRADE_DESC[student.grade]} students. Type: ${topicType}.
Return ONLY: {"topic_en":"...","topic_kr":"...","tips":["팁1","팁2","팁3"],"target":"${sizeMap[student.grade]}"}`);
      setTopicData(r);
    } catch (e) { alert("오류: " + e.message); }
    finally { setLoadT(false); }
  };

  const submit = async () => {
    setLoadF(true); setFb(null);
    const lvl = { gentle: "Be very encouraging.", balanced: "Be balanced.", strict: "Be thorough." };
    try {
      const r = await callClaude(`English essay teacher for ${GRADE_LABELS[student.grade]}. ${lvl[fbLevel]} Respond ONLY with valid JSON.`,
        `Grade: Topic:"${topicData.topic_en}" Essay:"${text}"
Return ONLY: {"score_total":85,"scores":{"grammar":80,"vocabulary":85,"content":90,"structure":85},"good_points":["...","..."],"corrections":[{"original":"...","corrected":"...","reason":"..."}],"better_expressions":[{"original":"...","better":"...","reason":"..."}],"overall_comment":"..."}`);
      setFb(r);
      saveResult("essay", r.score_total, { topic: topicData.topic_en.slice(0, 20) });
    } catch (e) { alert("오류: " + e.message); }
    finally { setLoadF(false); }
  };

  const scoreC = { grammar: C.blue, vocabulary: C.purple, content: C.green, structure: C.orange };
  const scoreL = { grammar: "문법", vocabulary: "어휘", content: "내용", structure: "구성" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 14 }}>✍️ 에세이 설정</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, marginBottom: 12 }}>
          <Sel label="유형" value={topicType} onChange={setTopicType} options={[{ v: "opinion", l: "의견 말하기" }, { v: "description", l: "묘사하기" }, { v: "narrative", l: "경험 쓰기" }, { v: "argument", l: "주장하기" }]} />
          <Sel label="첨삭 강도" value={fbLevel} onChange={setFbLevel} options={[{ v: "gentle", l: "친절하게" }, { v: "balanced", l: "균형있게" }, { v: "strict", l: "꼼꼼하게" }]} />
        </div>
        <input value={custom} onChange={e => setCustom(e.target.value)} placeholder="직접 주제 입력 (선택, 비워두면 AI 출제)"
          style={{ width: "100%", padding: "8px 10px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", color: C.ink, marginBottom: 12, boxSizing: "border-box" }} />
        <div style={{ display: "flex", gap: 10 }}>
          <Btn onClick={getTopic} disabled={loadT} color={C.purple}>{loadT ? "⏳ 생성 중..." : "🎲 주제 받기"}</Btn>
          {topicData && <Btn onClick={() => { setTopicData(null); setFb(null); setText(""); }} color="#64748b">🔄 새 주제</Btn>}
        </div>
      </div>
      {loadT && <Loading msg="주제를 생성하고 있어요..." />}
      {topicData && (
        <>
          <div style={{ background: `linear-gradient(135deg,${C.purpleLt},#f0f4ff)`, border: `2px solid ${C.purple}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.purple, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 7 }}>📌 오늘의 주제</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.ink, marginBottom: 6 }}>{topicData.topic_en}</div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>💬 {topicData.topic_kr}</div>
            <div style={{ fontSize: 12, color: C.muted }}>✏️ {topicData.tips?.join(" · ")} · 📏 {topicData.target}</div>
          </div>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.accent }}>✏️ 영어로 써보세요</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: wc >= 10 ? C.green : C.muted }}>{wc} 단어</span>
            </div>
            <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Start writing here..."
              style={{ width: "100%", padding: 14, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, lineHeight: 1.9, resize: "vertical", minHeight: 160, fontFamily: "inherit", outline: "none", color: C.ink }} />
            <Btn onClick={submit} disabled={wc < 10 || loadF} color={C.purple} style={{ marginTop: 12 }}>{loadF ? "⏳ 첨삭 중..." : "🤖 AI 첨삭 받기"}</Btn>
          </div>
          {loadF && <Loading msg="AI가 에세이를 읽고 있어요..." />}
          {fb && (
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ background: C.purple, color: "white", padding: "14px 20px", fontSize: 14, fontWeight: 700 }}>🤖 AI 첨삭 결과 — 총점 {fb.score_total}점 · 저장됨 ✅</div>
              <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
                {Object.entries(fb.scores || {}).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 12, color: C.muted, width: 45, flexShrink: 0 }}>{scoreL[k]}</span>
                    <div style={{ flex: 1, height: 8, background: C.border, borderRadius: 4 }}><div style={{ width: `${v}%`, height: "100%", background: scoreC[k], borderRadius: 4 }} /></div>
                    <span style={{ fontSize: 12, fontWeight: 700, width: 30 }}>{v}</span>
                  </div>
                ))}
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: "uppercase", marginBottom: 8 }}>✅ 잘한 점</div>
                  {fb.good_points?.map((p, i) => <div key={i} style={{ fontSize: 13, lineHeight: 1.8 }}>• {p}</div>)}
                </div>
                {fb.corrections?.filter(c => c.original).length > 0 && (
                  <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.orange, textTransform: "uppercase", marginBottom: 8 }}>🔧 문법 교정</div>
                    {fb.corrections.filter(c => c.original).map((c, i) => (
                      <div key={i} style={{ marginBottom: 10 }}>
                        <div style={{ background: C.redLt, borderRadius: 6, padding: "6px 10px", fontSize: 13, textDecoration: "line-through", color: C.red }}>✗ {c.original}</div>
                        <div style={{ background: C.greenLt, borderRadius: 6, padding: "6px 10px", fontSize: 13, color: C.green, fontWeight: 600, marginTop: 3 }}>✓ {c.corrected}</div>
                        <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>📌 {c.reason}</div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ background: C.blueLt, borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#1e3a8a", lineHeight: 1.9 }}>💬 {fb.overall_comment}</div>
                <Btn onClick={() => { setTopicData(null); setFb(null); setText(""); }} color="#64748b">✍️ 새 주제</Btn>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function NaesinTool({ student, saveResult }) {
  const [passage, setPassage] = useState("");
  const [qtype, setQtype] = useState("mixed");
  const [difficulty, setDifficulty] = useState("mid");
  const [qcount, setQcount] = useState("5");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [grading, setGrading] = useState(false);

  const generate = async () => {
    if (passage.trim().length < 50) { alert("지문을 50자 이상 입력해주세요."); return; }
    setLoading(true); setData(null); setAnswers({}); setResults(null);
    const diffDesc = { easy: "중간고사 기본", mid: "기말고사 표준", hard: "고난도 1등급" };
    try {
      const r = await callClaude("You are a Korean high school English exam expert. Respond ONLY with valid JSON.",
        `Create ${qcount} exam questions. Difficulty: ${diffDesc[difficulty]}. Type: ${qtype}.
Passage: """${passage}"""
Return ONLY: {"passage_analysis":{"key_vocab":["word(뜻)"],"grammar_points":["..."],"exam_tip":"..."},"questions":[{"type":"blank","question":"지시문","passage_modified":"빈칸지문","options":["① ","② ","③ ","④ ","⑤ "],"answer":"3","explanation_kr":"..."}]}`);
      setData(r);
    } catch (e) { alert("오류: " + e.message); }
    finally { setLoading(false); }
  };

  const gradeAnswers = async () => {
    setGrading(true);
    const writingQs = data.questions.map((q, i) => q.type === "writing" ? { i, q, ans: answers[i] || "" } : null).filter(Boolean);
    let aiG = {};
    if (writingQs.length > 0) {
      try {
        const r = await callClaude("Judge answers. Return ONLY JSON array [{\"i\":0,\"correct\":true}]",
          writingQs.map(s => `Q${s.i}: expected="${s.q.answer}", student="${s.ans}"`).join("\n"));
        (Array.isArray(r) ? r : []).forEach(x => { aiG[x.i] = x.correct; });
      } catch (e) {}
    }
    const res = data.questions.map((q, i) => ({
      isCorrect: q.type === "writing" ? (aiG[i] || false) : parseInt(answers[i]) === parseInt(q.answer),
      answer: q.answer, exp: q.explanation_kr
    }));
    setResults(res);
    saveResult("naesin", Math.round(res.filter(r => r.isCorrect).length / res.length * 100), { difficulty });
    setGrading(false);
  };

  const correct = results ? results.filter(r => r.isCorrect).length : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 12 }}>📋 교과서 지문 입력</div>
        <textarea value={passage} onChange={e => setPassage(e.target.value)} placeholder="교과서 본문을 여기에 붙여넣으세요..."
          style={{ width: "100%", padding: 12, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, lineHeight: 1.9, resize: "vertical", minHeight: 140, fontFamily: "inherit", outline: "none", color: C.ink }} />
        <div style={{ fontSize: 11, color: passage.length > 50 ? C.green : C.muted, marginBottom: 12, marginTop: 4 }}>
          {passage.length}자 {passage.length > 50 ? "✅ 준비됨" : "(50자 이상 필요)"}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10, marginBottom: 12 }}>
          <Sel label="문제 유형" value={qtype} onChange={setQtype} options={[{ v: "mixed", l: "혼합 (권장)" }, { v: "blank", l: "빈칸추론" }, { v: "grammar", l: "어법오류" }, { v: "writing", l: "서술형" }]} />
          <Sel label="난이도" value={difficulty} onChange={setDifficulty} options={[{ v: "easy", l: "기본" }, { v: "mid", l: "표준" }, { v: "hard", l: "고난도" }]} />
          <Sel label="문제 수" value={qcount} onChange={setQcount} options={[{ v: "3", l: "3문제" }, { v: "5", l: "5문제" }, { v: "7", l: "7문제" }]} />
        </div>
        <Btn onClick={generate} disabled={loading || passage.trim().length < 50}>{loading ? "⏳ 생성 중..." : "🤖 AI 문제 생성"}</Btn>
      </div>
      {loading && <Loading msg="AI가 지문을 분석하고 문제를 생성 중입니다..." />}
      {data && (
        <>
          <div style={{ background: C.orangeLt, border: `2px solid ${C.orange}`, borderRadius: 12, padding: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.orange, textTransform: "uppercase", marginBottom: 10 }}>🔍 AI 지문 분석</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              {data.passage_analysis?.key_vocab?.map((v, i) => (
                <span key={i} style={{ background: "white", border: `1px solid ${C.orange}`, borderRadius: 6, padding: "3px 9px", fontSize: 12 }}>{v}</span>
              ))}
            </div>
            <div style={{ fontSize: 12, color: C.ink }}>📐 {data.passage_analysis?.grammar_points?.join(" · ")}</div>
            <div style={{ fontSize: 12, color: C.orange, fontWeight: 600, marginTop: 6 }}>💡 {data.passage_analysis?.exam_tip}</div>
          </div>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 22 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.accent, marginBottom: 16 }}>📝 문제를 풀어보세요</div>
            {data.questions?.map((q, i) => (
              <div key={i} style={{ marginBottom: 22, paddingBottom: 22, borderBottom: i < data.questions.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                  <span style={{ display: "inline-flex", minWidth: 26, height: 26, background: results ? (results[i].isCorrect ? C.green : C.red) : C.blue, color: "white", borderRadius: "50%", fontSize: 12, fontWeight: 700, alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                  <span style={{ padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700, background: C.orangeLt, color: C.orange }}>{q.type === "blank" ? "빈칸추론" : q.type === "grammar" ? "어법오류" : "서술형"}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 10 }}>{q.question}</div>
                {q.passage_modified && (
                  <div style={{ fontSize: 13, lineHeight: 1.9, background: "#f8faff", borderRadius: 10, padding: "12px 16px", borderLeft: `4px solid ${C.blue}`, marginBottom: 10, whiteSpace: "pre-wrap" }}>{q.passage_modified}</div>
                )}
                {q.options && q.options.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {q.options.map((opt, oi) => {
                      let bg = "#f8faff", border = C.border;
                      if (results) { if (oi + 1 === parseInt(q.answer)) { bg = C.greenLt; border = C.green; } else if (oi + 1 === parseInt(answers[i]) && !results[i].isCorrect) { bg = C.redLt; border = C.red; } }
                      else if (parseInt(answers[i]) === oi + 1) { bg = C.blueLt; border = C.blue; }
                      return <div key={oi} onClick={() => !results && setAnswers(a => ({ ...a, [i]: oi + 1 }))} style={{ padding: "9px 13px", border: `1px solid ${border}`, borderRadius: 8, cursor: results ? "default" : "pointer", background: bg, fontSize: 13 }}>{opt}</div>;
                    })}
                  </div>
                )}
                {q.type === "writing" && (
                  <textarea disabled={!!results} value={answers[i] || ""} onChange={e => setAnswers(a => ({ ...a, [i]: e.target.value }))} placeholder="답을 영어로 써보세요..."
                    style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", resize: "vertical", minHeight: 70, outline: "none" }} />
                )}
                {results && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ background: results[i].isCorrect ? C.greenLt : C.redLt, border: `1px solid ${results[i].isCorrect ? "#6ee7b7" : "#fca5a5"}`, borderRadius: 8, padding: "8px 13px", fontSize: 13, color: results[i].isCorrect ? "#064e3b" : "#7f1d1d" }}>
                      {results[i].isCorrect ? "✅ 정답!" : `❌ 오답 — 정답: ${results[i].answer}`}
                    </div>
                    <div style={{ background: C.blueLt, border: "1px solid #93c5fd", borderRadius: 8, padding: "8px 13px", fontSize: 13, color: "#1e3a8a", marginTop: 5 }}>💡 {results[i].exp}</div>
                  </div>
                )}
              </div>
            ))}
            {!results && <Btn onClick={gradeAnswers} disabled={grading} color={C.green}>{grading ? "⏳ 채점 중..." : "✅ 채점하기"}</Btn>}
            {results && (
              <div style={{ background: `linear-gradient(135deg,${C.accent},#3b82f6)`, color: "white", borderRadius: 12, padding: 22, textAlign: "center" }}>
                <div style={{ fontSize: 32 }}>{correct === data.questions.length ? "🏆" : "💪"}</div>
                <div style={{ fontSize: 40, fontWeight: 900, margin: "6px 0" }}>{correct} / {data.questions.length}</div>
                <div style={{ fontSize: 13, opacity: .85 }}>{Math.round(correct / data.questions.length * 100)}점 · 저장됨 ✅</div>
                <Btn onClick={() => { setData(null); setAnswers({}); setResults(null); setPassage(""); }} color="rgba(255,255,255,.2)" style={{ marginTop: 12, border: "1px solid rgba(255,255,255,.4)" }}>📋 새 지문</Btn>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// ROOT
// ══════════════════════════════════════
export default function App() {
  const [mode, setMode] = useState("login");
  const [currentStudent, setCurrentStudent] = useState(null);

  return mode === "login"
    ? <LoginScreen onStudentLogin={s => { setCurrentStudent(s); setMode("student"); }} onTeacherLogin={() => setMode("teacher")} />
    : mode === "teacher"
    ? <TeacherDashboard onLogout={() => setMode("login")} />
    : <StudentDashboard student={currentStudent} onLogout={() => { setCurrentStudent(null); setMode("login"); }} />;
}
