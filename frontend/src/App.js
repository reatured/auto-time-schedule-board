import React, { useState, useEffect } from 'react';
import './App.css';
import LoginForm from './LoginForm';
import LogoutButton from './LogoutButton';
import PerplexitySection from './PerplexitySection';

// API URL configuration for Railway deployment
const API_URL = 'http://localhost:8000';

// Add a comment to force cache refresh
// Updated: 2025-01-07 - Fixed API URL
// Force deployment: 2025-01-07 12:00

function jsonToTable(obj) {
  if (obj === null || obj === undefined) return <span>null</span>;
  if (typeof obj !== 'object') return <span>{String(obj)}</span>;
  if (Array.isArray(obj)) {
    if (obj.length === 0) return <div>(empty)</div>;
    // If array of primitives
    if (typeof obj[0] !== 'object') {
      return (
        <table style={{ fontSize: '0.8rem', margin: '8px auto', borderCollapse: 'collapse', background: '#fff', color: '#222' }}>
          <tbody>
            {obj.map((item, i) => (
              <tr key={i}><td style={{ border: '1px solid #ccc', padding: 4 }}>{String(item)}</td></tr>
            ))}
          </tbody>
        </table>
      );
    }
    // Array of objects
    const keys = Array.from(new Set(obj.flatMap(row => Object.keys(row))));
    return (
      <table style={{ fontSize: '0.8rem', margin: '8px auto', borderCollapse: 'collapse', background: '#fff', color: '#222' }}>
        <thead>
          <tr>{keys.map(key => <th key={key} style={{ border: '1px solid #ccc', padding: 4 }}>{key}</th>)}</tr>
        </thead>
        <tbody>
          {obj.map((row, i) => (
            <tr key={i}>{keys.map(key => <td key={key} style={{ border: '1px solid #ccc', padding: 4 }}>{jsonToTable(row[key])}</td>)}</tr>
          ))}
        </tbody>
      </table>
    );
  }
  // Object: render as key-value table
  return (
    <table style={{ fontSize: '0.8rem', margin: '8px auto', borderCollapse: 'collapse', background: '#fff', color: '#222' }}>
      <tbody>
        {Object.entries(obj).map(([key, value]) => (
          <tr key={key}>
            <td style={{ border: '1px solid #ccc', padding: 4, fontWeight: 'bold', verticalAlign: 'top' }}>{key}</td>
            <td style={{ border: '1px solid #ccc', padding: 4 }}>{jsonToTable(value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function App() {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [perplexityResponse, setPerplexityResponse] = useState('');
  const systemInstruction = `请阅读我贴入的昨天的任务内容，并根据上下文自动生成以下五张任务表，制定今日计划表时请检查当前本地时间，并从当前整点起开始安排后续时间段的任务。输出为纯 JSON 代码块，不添加任何解释或引言。自动输出以下五张表的数据，JSON 字段分别为：
1. 今日计划表：字段名 "today"，内容为从当前整点时间起，按整点安排工作任务和合理休息节奏，一直到晚上11:00；
2. 明日计划表：字段名 "tomorrow"，内容为参考今天任务进度和状态，安排明天的整点时间计划；
3. 本月计划表：字段名 "month"，内容为本月剩余天数内的重要事项安排，每项有简短备注；
4. 本年度计划表：字段名 "year"，内容为全年要完成的重要事项，包括任务名称、目标说明、完成状态（✅ / 🟡 / 🔲）、优先级（🔥等级）；
5. 任务进度总表：字段名 "progress"，内容为以编号列表方式列出年度任务，字段包括：事项编号、任务名称、详细解释、当前状态、优先级🔥。`;
  const [isLoading, setIsLoading] = useState(false);
  const [sampleText, setSampleText] = useState(''); // For user to paste sample JSON
  const [useSampleMode, setUseSampleMode] = useState(true);
  const sampleResponse = 'Response:\n```json { "today": { "18:00": "检查 Meta / OpenAI / Perplexity AI 岗位信息", "19:00": "梳理 H-1B cover letter 结构（开头 + 技术背景）", "20:00": "编写 H-1B cover letter 主体段落（项目与职责匹配）", "21:00": "完成 H-1B cover letter 结尾 + 总结 + 校对", "22:00": "提交 Amazon 第二岗位申请", "23:00": "更新 Job Tracker + 洗漱 + 放松" }, "tomorrow": { "09:00": "复盘昨天 H-1B cover letter 进展", "10:00": "练习 Coding 知识题（2道）", "11:00": "检查 NYU/其他注册系统提醒", "12:00": "午餐 + 休息", "13:00": "复查 Job Tracker + 继续岗位信息收集", "14:00": "准备面试资料或模拟面试", "15:00": "处理家庭或个人行政事务", "16:00": "整理 H-1B 申请材料清单", "17:00": "晚餐 + 休息", "18:00": "复习或整理当日学习/工作笔记", "19:00": "自由时间/运动", "20:00": "休闲/休息" }, "month": [ { "date": "2025-07-12", "task": "完成 H-1B cover letter 最终修改并提交" }, { "date": "2025-07-15", "task": "跟进 NYU 注册进度" }, { "date": "2025-07-16 to 2025-07-18", "task": "准备和参加关键岗位面试" }, { "date": "2025-07-20", "task": "复习 Coding 知识题库" }, { "date": "2025-07-25", "task": "更新简历和求职材料" }, { "date": "2025-07-30", "task": "月度总结与计划" } ], "year": [ { "task": "完成 NYU 注册及系统提交", "description": "完成所有注册相关表格、文件上传和审核", "status": "✅", "priority": "🔥🔥" }, { "task": "求职申请", "description": "完成至少5家目标公司岗位投递", "status": "🟡", "priority": "🔥🔥🔥" }, { "task": "H-1B 申请材料准备", "description": "整理并提交完整H-1B申请材料", "status": "🟡", "priority": "🔥🔥🔥" }, { "task": "面试准备", "description": "准备技术面试、行为面试", "status": "🟡", "priority": "🔥🔥" }, { "task": "Coding 知识练习", "description": "每周至少完成5道知识题", "status": "🟡", "priority": "🔥🔥" }, { "task": "家庭行政事务", "description": "处理保险、医疗等家庭事务", "status": "✅", "priority": "🔥" }, { "task": "年度总结与规划", "description": "撰写年度总结和明年计划", "status": "🔲", "priority": "🔥" } ], "progress": [ { "id": 1, "task": "完成 NYU 注册及系统提交", "detail": "上传身份证明等文件，完成 NYU 系统表格填写，发送确认邮件", "status": "已完成", "priority": "🔥🔥" }, { "id": 2, "task": "求职申请", "detail": "投递 Amazon、Meta、OpenAI、Perplexity AI 等岗位", "status": "进行中", "priority": "🔥🔥🔥" }, { "id": 3, "task": "H-1B 申请材料准备", "detail": "梳理结构、撰写主体段落、完成结尾与校对", "status": "进行中", "priority": "🔥🔥🔥" }, { "id": 4, "task": "面试准备", "detail": "准备技术面试、行为面试", "status": "未完成", "priority": "🔥🔥" }, { "id": 5, "task": "Coding 知识练习", "detail": "每周至少完成5道知识题", "status": "进行中", "priority": "🔥🔥" }, { "id": 6, "task": "家庭行政事务", "detail": "协助父母完成保险续费付款", "status": "已完成", "priority": "🔥" }, { "id": 7, "task": "年度总结与规划", "detail": "撰写年度总结和明年计划", "status": "未完成", "priority": "🔥" } ] } ```';

  // When switching to sample mode, auto-fill the textarea if empty
  useEffect(() => {
    if (useSampleMode && !sampleText) {
      setSampleText(sampleResponse);
    }
  }, [useSampleMode]);

  // Debug: Log API URL on component mount
  useEffect(() => {
    console.log('App mounted - API_URL:', API_URL);
    console.log('Current window location:', window.location.href);
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    
    // Debug: Log the actual URL being called
    const signupUrl = `${API_URL}/signup`;
    console.log('Calling signup URL:', signupUrl);
    
    try {
      const res = await fetch(signupUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, full_name: fullName }),
      });
      if (!res.ok) throw new Error((await res.json()).detail || 'Signup failed');
      setMode('login');
      setUsername('');
      setPassword('');
      setFullName('');
      alert('Signup successful! Please log in.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // Debug: Log the actual URL being called
    const loginUrl = `${API_URL}/login`;
    console.log('Calling login URL:', loginUrl);
    
    try {
      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username, password }),
      });
      if (!res.ok) throw new Error((await res.json()).detail || 'Login failed');
      const data = await res.json();
      setToken(data.access_token);
      fetchMe(data.access_token);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchMe = async (accessToken) => {
    try {
      const res = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to fetch user info');
      const data = await res.json();
      setUser(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    setUsername('');
    setPassword('');
    setFullName('');
    setError('');
  };



  // Replace handlePerplexity to use sampleText instead of API call
  const handlePerplexity = async (e) => {
    e.preventDefault();
    setPerplexityResponse('');
    setError('');
    setIsLoading(true);
    try {
      if (useSampleMode) {
        // Instead of API call, use sampleText
        let cleaned = sampleText.trim();
        if (cleaned.startsWith('Response:')) {
          cleaned = cleaned.slice('Response:'.length).trim();
        }
        cleaned = cleaned.replace(/^```json|^```|```$/g, '').trim();
        if (cleaned.startsWith('```')) cleaned = cleaned.slice(3).trim();
        if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3).trim();
        let data = {};
        try {
          data = JSON.parse(cleaned);
        } catch (err) {
          setError('Invalid JSON in sample text');
          setIsLoading(false);
          return;
        }
        setPerplexityResponse(data);
      } else {
        // Real API call
        const res = await fetch(`${API_URL}/perplexity`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_input: systemInstruction,
            user_input: userPrompt
          })
        });
        const data = await res.json();
        if (res.ok) {
          // Try to parse the response as JSON if it's a string
          let parsed = data;
          if (typeof data === 'string') {
            try {
              parsed = JSON.parse(data);
            } catch {
              // fallback to raw string
            }
          }
          setPerplexityResponse(parsed);
        } else {
          setError(data.detail || 'Perplexity API error');
        }
      }
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h2>FastAPI Auth Demo</h2>
        <p style={{ fontSize: '0.8rem', marginBottom: '20px', opacity: 0.7 }}>
          Backend: {API_URL}
        </p>
        {user ? (
          <div>
            <p>Welcome, <b>{user.full_name || user.username}</b>!</p>
            <LogoutButton onLogout={handleLogout} />
            <PerplexitySection
              token={token}
              userPrompt={userPrompt}
              setUserPrompt={setUserPrompt}
              sampleText={sampleText}
              setSampleText={setSampleText}
              isLoading={isLoading}
              useSampleMode={useSampleMode}
              setUseSampleMode={setUseSampleMode}
              handlePerplexity={handlePerplexity}
              perplexityResponse={perplexityResponse}
              error={error}
              sampleResponse={sampleResponse}
              displayJsonAsTable={jsonToTable => {
                if (typeof jsonToTable !== 'object' || jsonToTable === null) return null;
                return Object.entries(jsonToTable).map(([section, value]) => (
                  <div key={section} style={{ marginBottom: 24 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: 6, fontSize: '1rem', color: '#222' }}>{section}</div>
                    {jsonToTable(value)}
                  </div>
                ));
              }}
            />
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: 16 }}>
              <button onClick={() => setMode('login')} disabled={mode === 'login'}>Log In</button>
              <button onClick={() => setMode('signup')} disabled={mode === 'signup'}>Sign Up</button>
            </div>
            {mode === 'signup' ? (
              <form onSubmit={handleSignup} className="auth-form">
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Full Name (optional)"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                />
                <button type="submit">Sign Up</button>
              </form>
            ) : (
              <LoginForm
                username={username}
                setUsername={setUsername}
                password={password}
                setPassword={setPassword}
                onLogin={handleLogin}
                error={error}
                isLoading={isLoading}
              />
            )}
            {error && <p style={{ color: 'salmon' }}>{error}</p>}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
