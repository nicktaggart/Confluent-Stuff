
import React, { useState } from 'react';
import { KafkaTopic } from '../types';
import { Plus, Info, Database, Layers } from 'lucide-react';

interface TopicManagerProps {
  topics: KafkaTopic[];
  onCreateTopic: (name: string, partitions: number) => void;
}

const TopicManager: React.FC<TopicManagerProps> = ({ topics, onCreateTopic }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPartitions, setNewPartitions] = useState(3);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Kafka Topics</h2>
          <p className="text-sm text-slate-500">Manage your data streams and partition mapping.</p>
        </div>
        <button 
          onClick={() => setShowCreate(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Create New Topic
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {topics.map((topic) => (
          <div key={topic.name} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-50">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Database className="w-5 h-5" />
                </div>
                <div className="flex gap-1">
                   {[...Array(topic.replicationFactor)].map((_, i) => (
                     <div key={i} className="w-2 h-2 rounded-full bg-emerald-400" title="Replicated"></div>
                   ))}
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">{topic.name}</h3>
              <p className="text-xs text-slate-400 font-mono tracking-tighter">ID: {Math.random().toString(36).substr(2, 9)}</p>
            </div>
            
            <div className="p-6 bg-slate-50/50 flex-1">
              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-slate-500">Partitions</span>
                <span className="font-bold text-slate-800">{topic.partitions}</span>
              </div>
              
              <div className="grid grid-cols-6 gap-1.5 mb-6">
                {[...Array(topic.partitions)].map((_, i) => (
                  <div 
                    key={i} 
                    className="h-8 bg-indigo-100 border border-indigo-200 rounded flex items-center justify-center text-[10px] font-bold text-indigo-700"
                    title={`Partition ${i}`}
                  >
                    P{i}
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Messages</span>
                  <span className="text-slate-700 font-medium">~{topic.messages.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Retention</span>
                  <span className="text-slate-700 font-medium">7 days</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-white border-t border-slate-100 flex gap-2">
              <button className="flex-1 text-xs font-semibold py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                View Data
              </button>
              <button className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 transition-colors">
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">New Topic</h3>
              <p className="text-slate-500 text-sm mb-8">Define your data stream configuration.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Topic Name</label>
                  <input 
                    type="text" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. user-purchases"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Partition Count ({newPartitions})</label>
                  <input 
                    type="range" 
                    min="1" 
                    max="12" 
                    step="1"
                    value={newPartitions}
                    onChange={(e) => setNewPartitions(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium">
                    <span>1 (Low Throughput)</span>
                    <span>12 (High Throughput)</span>
                  </div>
                  <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex gap-3">
                    <Layers className="text-indigo-500 w-5 h-5 shrink-0" />
                    <p className="text-xs text-indigo-800 leading-relaxed">
                      Each partition is handled by a single consumer thread in a group. More partitions allow higher parallel processing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100 rounded-b-2xl flex gap-3">
              <button 
                onClick={() => setShowCreate(false)}
                className="flex-1 py-3 font-semibold text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (newName) {
                    onCreateTopic(newName, newPartitions);
                    setShowCreate(false);
                    setNewName('');
                  }
                }}
                className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all"
              >
                Create Topic
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicManager;
