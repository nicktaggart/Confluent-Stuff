
import React from 'react';
import { 
  LayoutDashboard, 
  Server, 
  Layers, 
  Send, 
  Download, 
  MessageSquareCode,
  Zap
} from 'lucide-react';
import { AppTab } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  clusterCount: number;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, clusterCount }) => {
  const navItems = [
    { id: AppTab.OVERVIEW, icon: LayoutDashboard, label: 'Overview' },
    { id: AppTab.CLUSTERS, icon: Server, label: 'Clusters', count: clusterCount },
    { id: AppTab.TOPICS, icon: Layers, label: 'Topics' },
    { id: AppTab.PRODUCER, icon: Send, label: 'Producer' },
    { id: AppTab.CONSUMER, icon: Download, label: 'Consumer' },
    { id: AppTab.AI_GURU, icon: MessageSquareCode, label: 'AI Guru' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-indigo-500 p-2 rounded-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">KafkaFlow</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {item.count !== undefined && (
                <span className="ml-auto bg-slate-800 text-xs px-2 py-1 rounded-full text-slate-300">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-indigo-900/40 rounded-xl p-4 border border-indigo-500/30">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300 mb-2">Current Tier</p>
            <p className="text-sm font-bold text-white mb-1">Starter (Free)</p>
            <p className="text-xs text-indigo-200 mb-3 opacity-80">90% Throughput Used</p>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mb-3">
              <div className="bg-indigo-400 h-1.5 rounded-full w-[90%]"></div>
            </div>
            <button className="w-full bg-indigo-500 hover:bg-indigo-400 text-white text-xs py-2 rounded font-semibold transition-colors">
              Upgrade to Pro
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-slate-800 capitalize">
            {activeTab.replace('_', ' ')}
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-700">Enterprise User</p>
              <p className="text-xs text-slate-500">acme-corp-prod</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm">
              AC
            </div>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
