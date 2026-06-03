'use client';

import { useState } from 'react';
import { Sparkles, Send, Moon, MessageSquare, Compass } from 'lucide-react';

export default function Home() {
  const [messages, setMessages] = useState<any[]>([
    { role: 'assistant', content: '안녕! 오늘은 또 어떤 바를 가볼까나~! 원하는 분위기를 말해주면 어울리는 공간을 추천해 줄게. ✨' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();
      
      if (data.message) {
        setMessages([...newMessages, { role: 'assistant', content: data.message }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: '오류가 발생했어. .env.local 설정이나 서버 로그를 확인해 봐!' }]);
      }
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { role: 'assistant', content: '서버와 연결할 수 없어.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-slate-100 flex flex-col font-sans">
      
      {/* 상단 네비게이션 바 */}
      <header className="border-b border-purple-900/40 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl shadow-lg shadow-purple-500/20">
            <Moon className="w-5 h-5 text-purple-100 animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-purple-200 to-indigo-200 bg-clip-text text-transparent">
              Mind Galaxy & Bar
            </h1>
            <p className="text-xs text-purple-300/70">NLP Psychology & Whiskey Curator</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs bg-purple-950/60 border border-purple-800/50 px-3 py-1.5 rounded-full text-purple-200 font-mono">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping inline-block mr-1"></span>
          RAG + Tool Calling Active
        </div>
      </header>

      {/* 메인 레이아웃 (반응형 2분할 구조) */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden h-[calc(100vh-73px)]">
        
        {/* 왼쪽 사이드바: 프로덕트 대시보드 */}
        <section className="bg-slate-900/40 border border-purple-950/50 rounded-2xl p-5 flex flex-col justify-between backdrop-blur-sm">
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>당신만을 위한 BAR CURATOR</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                오늘의 무드에 맞는 바를 추천해드립니다! 
              </p>
            </div>
            
            <div className="border-t border-purple-950/60 pt-4 space-y-3">
              <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm">
                <Compass className="w-4 h-4" />
                <span>호출 가능 도구 (Tools)</span>
              </div>
              <div className="bg-slate-950/60 rounded-xl p-3 border border-indigo-950 text-xs space-y-2 font-mono">
                <div className="text-indigo-400 font-semibold">getWhiskeyBarRecommendation()</div>
                <div className="text-slate-400 text-[11px]">무드에 맞는 한남/청담/연남 위스키 바 데이터셋 매칭 호출</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border border-purple-900/30 rounded-xl p-3.5 text-center text-xs text-purple-200">
            "한번 사는 인생, 오늘도 적셔." 🚀
          </div>
        </section>

        {/* 오른쪽 메인 챗봇 컴포넌트 */}
        <section className="md:col-span-2 bg-slate-900/80 border border-purple-900/30 rounded-2xl flex flex-col overflow-hidden shadow-2xl shadow-purple-950/10">
          
          {/* 메시지 출력 영역 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-normal text-sm leading-relaxed scrollbar-thin scrollbar-thumb-purple-900">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role !== 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-md whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-l from-purple-600 to-indigo-600 text-purple-50'
                      : 'bg-slate-800/80 border border-slate-700/50 text-slate-200'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center shrink-0 animate-pulse">
                  <MessageSquare className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="bg-slate-800/50 border border-slate-700/30 rounded-2xl px-4 py-2.5 text-slate-400 text-xs flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  감정 동기화 및 바텐더 추천 기능 작동 중...
                </div>
              </div>
            )}
          </div>

          {/* 하단 메시지 입력창 */}
          <form onSubmit={handleSend} className="p-4 border-t border-purple-900/30 bg-slate-950/40 backdrop-blur-sm flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="오늘 있었던 감정 변화나 일기를 적어주세요..."
              disabled={isLoading}
              className="flex-1 bg-slate-900 border border-purple-950 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-600 text-slate-100 placeholder-slate-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-purple-50 font-semibold p-3 rounded-xl shadow-md transition-all shrink-0 flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}