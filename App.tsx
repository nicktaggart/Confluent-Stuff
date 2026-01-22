
import React, { useState, useCallback, useEffect } from 'react';
import Layout from './components/Layout';
import Overview from './components/Overview';
import TopicManager from './components/TopicManager';
import ProducerConsumer from './components/ProducerConsumer';
import { AppTab, KafkaTopic, KafkaMessage, ClusterMetrics } from './types';
import { getKafkaExplanation } from './services/geminiService';
import { BrainCircuit, Info, Sparkles, BookOpen } from 'lucide-react';

const INITIAL_TOPICS: KafkaTopic[] = [
  { name: 'user-events', partitions: 3, replicationFactor: 3, retentionMs: 604800000, messages: [] },
  { name: 'order-processed', partitions: 6, replicationFactor: 3, retentionMs: 604800000, messages: [] },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.OVERVIEW);
  const [topics, setTopics] = useState<KafkaTopic[]>(INITIAL_TOPICS);
  const [messages, setMessages] = useState<KafkaMessage[]>([]);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  
  // Live Metrics State
  const [metrics, setMetrics] = useState<ClusterMetrics>({
    totalMessages: 1250430,
    dataIngressBytes: 42500000,
    activeConsumers: 48,
    avgLatency: 18,
    throughputHistory: Array.from({ length: 12 }, (_, i) => ({
      time: `${10 + i}:00`,
      messages: 400 + Math.floor(Math.random() * 600),
      latency: 10 + Math.floor(Math.random() * 20)
    }))
  });

  // Background Traffic Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => {
        const newMsgCount = 5 + Math.floor(Math.random() * 15);
        const newHistory = [...prev.throughputHistory.slice(1), {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          messages: 400 + Math.floor(Math.random() * 800),
          latency: 12 + Math.floor(Math.random() * 15)
        }];
        
        return {
          ...prev,
          totalMessages: prev.totalMessages + newMsgCount,
          dataIngressBytes: prev.dataIngressBytes + (newMsgCount * 128), // approx 128 bytes per msg
          throughputHistory: newHistory
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleCreateTopic = (name: string, partitions: number) => {
    const newTopic: KafkaTopic = {
      name,
      partitions,
      replicationFactor: 3,
      retentionMs: 604800000,
      messages: [],
    };
    setTopics([...topics, newTopic]);
  };

  const handleProduce = (topicName: string, key: string, value: string) => {
    const topic = topics.find(t => t.name === topicName);
    if (!topic) return;

    const newMessage: KafkaMessage = {
      id: Math.random().toString(36).substr(2, 9),
      topic: topicName,
      partition: Math.floor(Math.random() * topic.partitions),
      offset: topic.messages.length + 1,
      timestamp: Date.now(),
      key,
      value,
    };

    setMessages(prev => [...prev, newMessage]);
    setTopics(prev => prev.map(t => 
      t.name === topicName ? { ...t, messages: [...t.messages, newMessage] } : t
    ));

    // Update Live Metrics based on user action
    setMetrics(prev => ({
      ...prev,
      totalMessages: prev.totalMessages + 1,
      dataIngressBytes: prev.dataIngressBytes + value.length + key.length + 50, // actual bytes
    }));
  };

  const fetchAiInsight = async (topic: string) => {
    setLoadingAi(true);
    const insight = await getKafkaExplanation(topic);
    setAiResponse(insight);
    setLoadingAi(false);
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} clusterCount={1}>
      {activeTab === AppTab.OVERVIEW && <Overview metrics={metrics} />}
      
      {activeTab === AppTab.TOPICS && (
        <TopicManager topics={topics} onCreateTopic={handleCreateTopic} />
      )}

      {activeTab === AppTab.PRODUCER && (
        <ProducerConsumer topics={topics} onProduce={handleProduce} messages={messages} mode="PRODUCER" />
      )}
      
      {activeTab === AppTab.CONSUMER && (
        <ProducerConsumer topics={topics} onProduce={handleProduce} messages={messages} mode="CONSUMER" />
      )}

      {activeTab === AppTab.AI_GURU && (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
          <div className="bg-indigo-600 rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                <BrainCircuit className="w-10 h-10" /> Kafka Architect Assistant
              </h2>
              <p className="text-indigo-100 text-lg mb-8 max-w-xl">
                Ask anything about scaling Kafka, distributed systems, or the Enterprise Java ecosystem.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Explain Consumer Rebalancing",
                  "Partitions vs Throughput",
                  "Idempotent Producers in Java",
                  "Kafka Connect for ETL"
                ].map(prompt => (
                  <button 
                    key={prompt}
                    onClick={() => fetchAiInsight(prompt)}
                    className="flex items-center gap-3 p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition-all text-left group"
                  >
                    <div className="p-2 bg-indigo-50 rounded-lg group-hover:scale-110 transition-transform">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-sm">{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"></div>
          </div>

          {(loadingAi || aiResponse) && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-10">
                {loadingAi ? (
                  <div className="space-y-4">
                    <div className="h-4 bg-slate-100 rounded-full w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-slate-100 rounded-full w-full animate-pulse"></div>
                    <div className="h-4 bg-slate-100 rounded-full w-5/6 animate-pulse"></div>
                  </div>
                ) : (
                  <div className="prose prose-slate max-w-none">
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                      <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">Architect Insight</h3>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Generated by Gemini AI</p>
                      </div>
                    </div>
                    <div className="text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                      {aiResponse}
                    </div>
                  </div>
                )}
              </div>
              <div className="px-10 py-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Enterprise Support Active</span>
                <button className="text-indigo-600 font-bold text-sm hover:underline">Download Whitepaper</button>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 rounded-2xl p-8 text-white border border-slate-800">
              <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-indigo-400" /> Pro Scaling Tip
              </h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                When scaling consumers, ensure your partition count is at least equal to your consumer count. Kafka only allows one consumer per partition within a group.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
               <h4 className="text-lg font-bold mb-4 text-slate-800">Spring Boot Template</h4>
               <pre className="text-xs bg-slate-50 p-4 rounded-xl font-mono text-slate-700 border border-slate-200 overflow-x-auto">
{`@KafkaListener(topics = "orders")
public void listen(Order order) {
    service.process(order);
}`}
               </pre>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
