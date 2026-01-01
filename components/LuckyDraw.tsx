
import React, { useState, useEffect, useRef } from 'react';
import { Participant, Winner } from '../types';

interface Props {
  participants: Participant[];
}

const LuckyDraw: React.FC<Props> = ({ participants }) => {
  const [allowRepeat, setAllowRepeat] = useState(false);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDisplay, setCurrentDisplay] = useState<string>('???');
  const [prizeName, setPrizeName] = useState('特等獎');
  const [availableParticipants, setAvailableParticipants] = useState<Participant[]>([]);
  
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Reset available pool when participants list changes
    setAvailableParticipants([...participants]);
  }, [participants]);

  const startDraw = () => {
    const pool = allowRepeat ? participants : availableParticipants;
    
    if (pool.length === 0) {
      alert('名單中已無可抽取的對象！');
      return;
    }

    setIsDrawing(true);
    let counter = 0;
    const duration = 2000; // 2 seconds animation
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const randomIdx = Math.floor(Math.random() * pool.length);
      setCurrentDisplay(pool[randomIdx].name);

      if (elapsed < duration) {
        timerRef.current = window.setTimeout(animate, 50);
      } else {
        finishDraw(pool[randomIdx]);
      }
    };

    animate();
  };

  const finishDraw = (winner: Participant) => {
    setIsDrawing(false);
    setCurrentDisplay(winner.name);
    
    const newWinner: Winner = {
      ...winner,
      prize: prizeName,
      timestamp: new Date()
    };

    setWinners(prev => [newWinner, ...prev]);

    if (!allowRepeat) {
      setAvailableParticipants(prev => prev.filter(p => p.id !== winner.id));
    }

    triggerConfetti();
  };

  const triggerConfetti = () => {
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
    for (let i = 0; i < 50; i++) {
      const div = document.createElement('div');
      div.className = 'confetti';
      div.style.left = Math.random() * 100 + 'vw';
      div.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      div.style.width = Math.random() * 10 + 5 + 'px';
      div.style.height = div.style.width;
      div.style.top = '-10px';
      document.body.appendChild(div);
      setTimeout(() => div.remove(), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Settings Panel */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">獎項名稱</label>
              <input
                type="text"
                value={prizeName}
                onChange={(e) => setPrizeName(e.target.value)}
                placeholder="輸入獎項名稱..."
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setAllowRepeat(!allowRepeat)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${allowRepeat ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${allowRepeat ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="text-sm font-medium text-slate-700">允許重複抽中同一人</span>
            </div>
            <div className="text-xs text-slate-500">
              當前待抽池：{allowRepeat ? participants.length : availableParticipants.length} 人
            </div>
          </div>

          <div className="flex flex-col items-center justify-center bg-slate-50 p-8 rounded-xl border-2 border-dashed border-slate-200">
            <div className={`text-5xl font-black mb-6 transition-all ${isDrawing ? 'scale-110 text-indigo-600' : 'text-slate-800'}`}>
              {currentDisplay}
            </div>
            <button
              onClick={startDraw}
              disabled={isDrawing || (allowRepeat ? participants.length === 0 : availableParticipants.length === 0)}
              className={`w-full py-4 rounded-xl text-xl font-bold text-white shadow-lg transition-all transform active:scale-95 ${
                isDrawing ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-1'
              }`}
            >
              {isDrawing ? (
                <span><i className="fas fa-spinner fa-spin mr-2"></i>抽獎中...</span>
              ) : (
                <span><i className="fas fa-trophy mr-2"></i>開始抽獎</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Winners History */}
      {winners.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold flex items-center">
              <i className="fas fa-history text-indigo-600 mr-2"></i>中獎紀錄
            </h3>
            <button
              onClick={() => {
                setWinners([]);
                setAvailableParticipants([...participants]);
              }}
              className="text-sm text-slate-500 hover:text-red-500"
            >
              重置所有狀態
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {winners.map((winner, idx) => (
              <div key={idx} className="flex items-center p-4 bg-slate-50 rounded-lg border border-slate-100 group hover:border-indigo-200 hover:bg-indigo-50 transition-all">
                <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold mr-3">
                  {winners.length - idx}
                </div>
                <div>
                  <div className="font-bold text-slate-800">{winner.name}</div>
                  <div className="text-xs text-indigo-500 font-medium">{winner.prize}</div>
                </div>
                <div className="ml-auto text-[10px] text-slate-400">
                  {winner.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LuckyDraw;
