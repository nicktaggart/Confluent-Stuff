
import React, { useState, useEffect, useRef } from 'react';
import { KafkaTopic, KafkaMessage } from '../types';
import { Send, Eye, Terminal, Trash2, Users, Gauge, Info, Zap } from 'lucide-react';

interface Props {
  topics: KafkaTopic[];
  onProduce: (topic: string, key: string, value: string) => void;
  messages: KafkaMessage[];
  mode: 'PRODUCER' | 'CONSUMER';
}

const ProducerConsumer: React.FC<Props> = ({ topics, onProduce, messages, mode }) => {
  const [selectedTopic, setSelectedTopic] = useState(topics[0]?.name || '');
  const [key, setKey] = useState('');
  const [value, setValue] = useState('{\n  "event": "purchase",\n  "amount": 49.99,\n  "currency": "USD"\n}');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (mode === 'PRODUCER') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Producer Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Event Producer</h3>
                <p className="text-sm text-slate-500">Send high-throughput events to your cluster.</p>
              </div>
              <div className="bg-indigo-50 px-3 py-1 rounded-full flex items-center gap-2">
                <Zap className="w-3 h-3 text-indigo-600" />
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Low Latency Mode</span>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Topic Destination</label>
                  <select 
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  >
                    {topics.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Partitioning Key</label>
                  <input 
                    type="text" 
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="e.g. user_id_99"
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Message Payload (JSON)</label>
                  <span className="text-[10px] text-slate-400 font-mono">Size: {new Blob([value]).size} bytes</span>
                </div>
                <textarea 
                  rows={8}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 text-indigo-300 rounded-xl border border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono text-sm resize-none"
                />
              </div>

              <button 
                onClick={() => {
                  onProduce(selectedTopic, key, value);
                  // Optional: don't clear value to allow fast repeated tests
                }}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
              >
                <Send className="w-5 h-5" /> Execute Production Call
              </button>
            </div>
          </div>

          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex gap-4">
            <Info className="w-6 h-6 text-amber-500 shrink-0" />
            <div className="text-sm">
              <p className="font-bold text-amber-800 mb-1">Architecture Tip: Key-based Partitioning</p>
              <p className="text-amber-700 leading-relaxed">
                By providing a <b>Key</b>, Kafka ensures all messages with that same key always go to the same <b>Partition</b>. This guarantees strict ordering for specific entities (like a single user's actions).
              </p>
            </div>
          </div>
        </div>

        {/* Mini Log */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 flex flex-col h-full min-h-[500px]">
          <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Acknowledgment Log</span>
          </div>
          <div className="flex-1 p-4 font-mono text-[11px] overflow-y-auto space-y-2">
            {messages.filter(m => m.topic === selectedTopic).slice(-10).map((msg, i) => (
              <div key={msg.id} className="text-slate-400">
                <span className="text-emerald-500">[ACK]</span> Topic: {msg.topic} | P: {msg.partition} | O: {msg.offset}
              </div>
            ))}
            {messages.length === 0 && <div className="text-slate-600 text-center mt-20 italic">Awaiting events...</div>}
          </div>
        </div>
      </div>
    );
  }

  // CONSUMER VIEW
  return (
    <div className="space-y-6">
      {/* Consumer Group Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Group Members</p>
            <p className="text-2xl font-bold text-slate-800">12 Active</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Lag</p>
            <p className="text-2xl font-bold text-slate-800">42 ms</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sync State</p>
            <p className="text-2xl font-bold text-slate-800 text-emerald-500 font-mono">STABLE</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
        {/* Terminal - Main View */}
        <div className="lg:col-span-2 flex flex-col bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
          <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">LIVE_STREAM: {selectedTopic || 'all_topics'}</span>
            </div>
            <div className="flex gap-2">
               <button className="p-2 text-slate-500 hover:text-white transition-colors" title="Clear Terminal">
                 <Trash2 className="w-4 h-4" />
               </button>
            </div>
          </div>
          
          <div 
            ref={scrollRef}
            className="flex-1 p-6 font-mono text-xs overflow-y-auto space-y-4"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center">
                <Terminal className="w-12 h-12 mb-4 opacity-10" />
                <p>Establishing cluster connection...</p>
                <p className="text-[10px] opacity-50 mt-2">Listen for incoming events from producers</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="p-3 bg-slate-800/30 rounded border border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center justify-between opacity-50 mb-2">
                    <span className="text-indigo-400 font-bold">TOPIC: {msg.topic}</span>
                    <span>P:{msg.partition} | O:{msg.offset} | {new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    <div className="flex gap-2">
                      <span className="text-amber-500/80">KEY:</span>
                      <span className="text-emerald-400">{msg.key || '<null>'}</span>
                    </div>
                    <div className="flex gap-2 items-start">
                      <span className="text-amber-500/80">VAL:</span>
                      <span className="text-slate-300 break-all">{msg.value}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Consumer Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" /> Consumer Group ID
            </h4>
            <div className="p-3 bg-slate-50 rounded-xl font-mono text-xs text-slate-600 border border-slate-100">
              enterprise-analytics-group-01
            </div>
            <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
              This group is currently balanced across <b>{topics.find(t => t.name === selectedTopic)?.partitions || 0}</b> partitions.
            </p>
          </div>

          <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20">
            <h4 className="font-bold mb-2">Need to scale?</h4>
            <p className="text-xs text-indigo-100 mb-4 opacity-90 leading-relaxed">
              If your <b>Lag</b> exceeds 500ms consistently, you should add more consumer instances to this group.
            </p>
            <button className="w-full bg-white text-indigo-600 py-2 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors">
              Upgrade to Pro Auto-Scaling
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProducerConsumer;
