
import React, { useState, useEffect } from 'react';
import { Participant, Tab } from './types';
import ParticipantManager from './components/ParticipantManager';
import LuckyDraw from './components/LuckyDraw';
import GroupingTool from './components/GroupingTool';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Participants);
  const [participants, setParticipants] = useState<Participant[]>([]);

  // Load initial data if needed or handle persistence
  useEffect(() => {
    const saved = localStorage.getItem('hr_participants');
    if (saved) {
      try {
        setParticipants(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load participants", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('hr_participants', JSON.stringify(participants));
  }, [participants]);

  const handleUpdateParticipants = (newList: Participant[]) => {
    setParticipants(newList);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-indigo-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <i className="fas fa-users-gear text-2xl"></i>
            <h1 className="text-xl font-bold tracking-tight">HR Pro Toolbox</h1>
          </div>
          <nav className="flex space-x-1">
            <button
              onClick={() => setActiveTab(Tab.Participants)}
              className={`px-4 py-2 rounded-md transition-colors ${activeTab === Tab.Participants ? 'bg-white/20' : 'hover:bg-white/10'}`}
            >
              <i className="fas fa-list mr-2"></i>名單管理
            </button>
            <button
              onClick={() => setActiveTab(Tab.LuckyDraw)}
              className={`px-4 py-2 rounded-md transition-colors ${activeTab === Tab.LuckyDraw ? 'bg-white/20' : 'hover:bg-white/10'}`}
            >
              <i className="fas fa-gift mr-2"></i>獎品抽籤
            </button>
            <button
              onClick={() => setActiveTab(Tab.Grouping)}
              className={`px-4 py-2 rounded-md transition-colors ${activeTab === Tab.Grouping ? 'bg-white/20' : 'hover:bg-white/10'}`}
            >
              <i className="fas fa-layer-group mr-2"></i>自動分組
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-8">
        {participants.length === 0 && activeTab !== Tab.Participants && (
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg text-amber-800 text-center">
            <i className="fas fa-circle-exclamation text-4xl mb-4"></i>
            <p className="text-lg font-medium">請先上傳或貼上姓名名單！</p>
            <button 
              onClick={() => setActiveTab(Tab.Participants)}
              className="mt-4 bg-amber-600 text-white px-6 py-2 rounded-full hover:bg-amber-700 transition-colors"
            >
              前往名單管理
            </button>
          </div>
        )}

        {activeTab === Tab.Participants && (
          <ParticipantManager 
            participants={participants} 
            onUpdate={handleUpdateParticipants} 
          />
        )}

        {activeTab === Tab.LuckyDraw && participants.length > 0 && (
          <LuckyDraw participants={participants} />
        )}

        {activeTab === Tab.Grouping && participants.length > 0 && (
          <GroupingTool participants={participants} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-500 text-sm">
          &copy; 2024 HR Pro Toolbox - 專業人力資源工具
        </div>
      </footer>
    </div>
  );
};

export default App;
