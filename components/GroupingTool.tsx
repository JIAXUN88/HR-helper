
import React, { useState } from 'react';
import { Participant, Group } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

interface Props {
  participants: Participant[];
}

const GroupingTool: React.FC<Props> = ({ participants }) => {
  const [groupCount, setGroupCount] = useState<number>(2);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [useAIThemes, setUseAIThemes] = useState(false);

  function shuffleArray<T>(array: T[]): T[] {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  }

  const generateGroups = async () => {
    setIsGenerating(true);
    const shuffled = shuffleArray<Participant>(participants);
    const newGroups: Group[] = [];
    
    for (let i = 0; i < groupCount; i++) {
      newGroups.push({
        id: Math.random().toString(36).substr(2, 9),
        name: `第 ${i + 1} 組`,
        members: []
      });
    }

    shuffled.forEach((person, index) => {
      const targetGroup = newGroups[index % groupCount];
      if (targetGroup) {
        targetGroup.members.push(person);
      }
    });

    if (useAIThemes) {
      try {
        const themes = await fetchAIThemes(groupCount);
        themes.forEach((theme, idx) => {
          if (newGroups[idx]) {
            newGroups[idx].name = theme.name;
            newGroups[idx].theme = theme.description;
          }
        });
      } catch (err) {
        console.error("AI theme generation failed", err);
      }
    }

    setGroups(newGroups);
    setIsGenerating(false);
  };

  const fetchAIThemes = async (count: number): Promise<{ name: string; description: string }[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate ${count} creative team names and a short 1-sentence mission description for an office team event. 
                 Return strictly as a JSON array of objects with keys "name" and "description". 
                 The names should be professional yet fun. Output in Traditional Chinese.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["name", "description"]
          }
        }
      }
    });
    
    const text = response.text?.trim() || "[]";
    return JSON.parse(text);
  };

  const exportToCSV = () => {
    if (groups.length === 0) return;

    let csvContent = "\ufeff"; // BOM for Excel UTF-8
    csvContent += "組別名稱,創意主題,成員姓名\n";

    groups.forEach(group => {
      group.members.forEach(member => {
        csvContent += `"${group.name}","${group.theme || ''}","${member.name}"\n`;
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `分組結果_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Configuration Card */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <i className="fas fa-users-viewfinder text-indigo-600 mr-2"></i>分組設定
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">預計分為幾組？</label>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setGroupCount(Math.max(2, groupCount - 1))}
                className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50"
              >
                <i className="fas fa-minus"></i>
              </button>
              <span className="text-2xl font-bold w-12 text-center">{groupCount}</span>
              <button 
                onClick={() => setGroupCount(Math.min(participants.length, groupCount + 1))}
                className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50"
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
             <div className="flex items-center space-x-3">
              <button
                onClick={() => setUseAIThemes(!useAIThemes)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${useAIThemes ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useAIThemes ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="text-sm font-medium text-slate-700">使用 AI 生成創意組名</span>
            </div>
            <p className="text-xs text-slate-500">平均每組約 {Math.ceil(participants.length / groupCount)} 人</p>
          </div>

          <div>
            <button
              onClick={generateGroups}
              disabled={isGenerating}
              className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 ${
                isGenerating ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isGenerating ? (
                <span><i className="fas fa-magic fa-spin mr-2"></i>生成中...</span>
              ) : (
                <span><i className="fas fa-shuffle mr-2"></i>立即分組</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Visual Result */}
      {groups.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-700">分組結果預覽</h3>
            <button 
              onClick={exportToCSV}
              className="flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 transition-colors"
            >
              <i className="fas fa-file-csv mr-2"></i>下載分組結果 (CSV)
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group, idx) => (
              <div key={group.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="bg-indigo-50 px-5 py-4 border-b border-indigo-100">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-black text-indigo-900 text-lg">{group.name}</h4>
                    <span className="bg-indigo-200 text-indigo-700 text-xs px-2 py-1 rounded-full font-bold">
                      {group.members.length} 人
                    </span>
                  </div>
                  {group.theme && <p className="text-xs text-indigo-600 italic">{group.theme}</p>}
                </div>
                <div className="p-5 flex-grow">
                  <ul className="space-y-2">
                    {group.members.map((m, mIdx) => (
                      <li key={m.id} className="flex items-center text-slate-700 bg-slate-50 px-3 py-2 rounded-lg text-sm border border-slate-100">
                        <span className="w-5 h-5 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center text-[10px] mr-3 font-bold">
                          {mIdx + 1}
                        </span>
                        {m.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupingTool;
