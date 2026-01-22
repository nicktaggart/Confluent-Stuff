
export interface KafkaMessage {
  id: string;
  topic: string;
  partition: number;
  offset: number;
  timestamp: number;
  key: string;
  value: string;
}

export interface KafkaTopic {
  name: string;
  partitions: number;
  replicationFactor: number;
  retentionMs: number;
  messages: KafkaMessage[];
}

export interface ClusterMetrics {
  totalMessages: number;
  dataIngressBytes: number;
  activeConsumers: number;
  avgLatency: number;
  throughputHistory: { time: string; messages: number; latency: number }[];
}

export interface KafkaCluster {
  id: string;
  name: string;
  status: 'PROVISIONING' | 'RUNNING' | 'DEGRADED';
  region: string;
  nodes: number;
  type: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  topics: KafkaTopic[];
}

export enum AppTab {
  OVERVIEW = 'overview',
  CLUSTERS = 'clusters',
  TOPICS = 'topics',
  PRODUCER = 'producer',
  CONSUMER = 'consumer',
  AI_GURU = 'ai_guru'
}
