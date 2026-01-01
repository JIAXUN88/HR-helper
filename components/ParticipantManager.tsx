
import React, { useState, useMemo } from 'react';
import { Participant } from '../types';

interface Props {
  participants: Participant[];
  onUpdate: (list: Participant[]) => void;
}

const ParticipantManager: React.FC<Props> = ({ participants, onUpdate }) => {
  const [inputText, setInputText] = useState('');

  // 偵測重複的姓名
  const duplicateNames = useMemo(() => {
    const counts = new Map<string, number>();
    participants.forEach(p => {
      counts.set(p.name, (counts.get(p.name) || 0) + 1);
    });
    return new Set([...counts.entries()].filter(([_, count]) => count > 1).map(([name]) => name));
  }, [participants]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseAndAddNames(text);
    };
    reader.readAsText(file);
  };

  const parseAndAddNames = (text: string) => {
    const names = text
      .split(/[\n,]+/)
      .map(n => n.trim())
      .filter(n => n.length > 0);
    
    const newParticipants: Participant[] = names.map(name => ({
      id: Math.random().toString(36).substr(2, 9),
      name
    }));

    onUpdate([...participants, ...newParticipants]);
    setInputText('');
  };

  const handleManualAdd = () => {
    if (!inputText.trim()) return;
    parseAndAddNames(inputText);
  };

  const clearList = () => {
    if (confirm('確定要清除所有名單嗎？')) {
      onUpdate([]);
    }
  };

  const removeDuplicates = () => {
    const seen = new Set<string>();
    const uniqueList = participants.filter(p => {
      if (seen.has(p.name)) return false;
      seen.add(p.name);
      return true;
    });
    onUpdate(uniqueList);
  };

  const generateMockData = () => {
    const mockNames = [
      '陳志明', '林美玲', '李家豪', '王怡君', '張俊傑', 
      '劉淑芬', '黃冠廷', '吳欣怡', '蔡志強', '許雅婷',
      '鄭凱文', '楊曉薇', '郭宗翰', '謝佩君', '曾健平',
      '洪依婷', '邱郁芳', '蘇郁婷', '彭建宏', '江宜軒'
    ];
    const mockParticipants: Participant[] = mockNames.map(name => ({
      id: Math.random().toString(36).substr(2, 9),
      name
    }));
    onUpdate([...participants, ...mockParticipants]);
  };

  const removeParticipant = (id: string) => {
    onUpdate(participants.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <i className="fas fa-file-import text-indigo-600 mr-2"></i>導入名單
            </h2>
            <button 
              onClick={generateMockData}
              className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors font-medium border border-indigo-100"
            >
              <i className="fas fa-magic mr-1"></i>生成模擬名單
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">上傳 CSV / TXT 檔案</label>
              <input 
                type="file" 
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100 cursor-pointer"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-white text-sm text-slate-500">或</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">直接貼上姓名 (以逗號或換行分隔)</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="例如：王小明, 李大華, 張美麗..."
                className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
              ></textarea>
            </div>

            <button
              onClick={handleManualAdd}
              className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              新增至名單
            </button>
          </div>
        </div>

        {/* Stats and Management */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <i className="fas fa-list-check text-indigo-600 mr-2"></i>當前名單 ({participants.length})
            </h2>
            <div className="flex space-x-3">
              {duplicateNames.size > 0 && (
                <button 
                  onClick={removeDuplicates}
                  className="text-amber-600 hover:text-amber-700 text-sm font-medium transition-colors"
                >
                  <i className="fas fa-clone mr-1"></i>移除重複項
                </button>
              )}
              {participants.length > 0 && (
                <button 
                  onClick={clearList}
                  className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                >
                  <i className="fas fa-trash-can mr-1"></i>清除全部
                </button>
              )}
            </div>
          </div>

          <div className="flex-grow overflow-y-auto max-h-[300px] border border-slate-100 rounded-lg">
            {participants.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-slate-400">
                <i className="fas fa-users text-4xl mb-2"></i>
                <p>尚無名單數據</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">#</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">姓名</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {participants.map((p, idx) => {
                    const isDuplicate = duplicateNames.has(p.name);
                    return (
                      <tr key={p.id} className={`hover:bg-slate-50 transition-colors ${isDuplicate ? 'bg-amber-50/50' : ''}`}>
                        <td className="px-4 py-2 text-sm text-slate-500">{idx + 1}</td>
                        <td className="px-4 py-2 text-sm font-medium text-slate-700">
                          {p.name}
                          {isDuplicate && (
                            <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded uppercase">重複</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <button 
                            onClick={() => removeParticipant(p.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <i className="fas fa-xmark"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantManager;
