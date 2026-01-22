
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Database, Share2, TrendingUp, AlertTriangle, Radio } from 'lucide-react';
import { ClusterMetrics } from '../types';

interface OverviewProps {
  metrics: ClusterMetrics;
}

const Overview: React.FC<OverviewProps> = ({ metrics }) => {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Radio className="w-4 h-4 text-emerald-500 animate-pulse" /> Live Cluster Telemetry
        </h2>
        <span className="text-xs text-slate-400 font-mono">Last updated: {new Date().toLocaleTimeString()}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Activity className="text-blue-500" />} 
          title="Total Messages" 
          value={metrics.totalMessages.toLocaleString()} 
          change="+Live" 
          isLive
        />
        <StatCard 
          icon={<Share2 className="text-indigo-500" />} 
          title="Active Consumers" 
          value={metrics.activeConsumers} 
          change="Stable" 
        />
        <StatCard 
          icon={<Database className="text-green-500" />} 
          title="Data Ingress" 
          value={formatBytes(metrics.dataIngressBytes)} 
          change="Real-time" 
        />
        <StatCard 
          icon={<TrendingUp className="text-purple-500" />} 
          title="Avg Latency" 
          value={`${metrics.avgLatency}ms`} 
          change="Optimized" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-800">Cluster Throughput (msg/sec)</h3>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
               <span className="text-xs font-bold text-indigo-600 uppercase">Streaming</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.throughputHistory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'}}
                />
                <Bar dataKey="messages" fill="#6366f1" radius={[4, 4, 0, 0]} animationDuration={300} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-6">System Health</h3>
          <div className="space-y-4">
            <HealthItem label="Broker Connectivity" status="HEALTHY" />
            <HealthItem label="Zookeeper Quorum" status="HEALTHY" />
            <HealthItem label="Under-replicated Partitions" status={metrics.totalMessages > 500 ? "WARNING" : "HEALTHY"} value={metrics.totalMessages > 500 ? "2 partitions" : "0"} />
            <HealthItem label="CPU Load" status="HEALTHY" value={`${Math.min(95, 20 + Math.floor(metrics.totalMessages / 100))}%`} />
          </div>
          <div className="mt-8 p-4 bg-indigo-50 rounded-xl border border-indigo-200 flex gap-3">
            <AlertTriangle className="text-indigo-500 w-5 h-5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-indigo-800">Dynamic Scaling Insight</p>
              <p className="text-xs text-indigo-700 leading-relaxed">
                {metrics.totalMessages < 100 
                  ? "Cluster is idle. Perfect time for configuration changes or partition reassignments."
                  : "Throughput is increasing. The AI Guru recommends monitoring consumer lag on 'user-events' topic."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, change, isLive }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group hover:border-indigo-300 transition-colors">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">{icon}</div>
      <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</span>
    </div>
    <div className="flex items-end gap-3">
      <span className="text-3xl font-bold text-slate-800 tabular-nums">{value}</span>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5 ${isLive ? 'bg-emerald-100 text-emerald-700 animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
        {change}
      </span>
    </div>
  </div>
);

const HealthItem = ({ label, status, value }: any) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
    <span className="text-sm text-slate-600 font-medium">{label}</span>
    <div className="flex items-center gap-2">
      {value && <span className="text-xs text-slate-400 font-mono">{value}</span>}
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
        status === 'HEALTHY' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
      }`}>
        {status}
      </span>
    </div>
  </div>
);

export default Overview;
