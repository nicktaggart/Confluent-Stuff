
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getKafkaExplanation = async (topic: string, context?: string) => {
  const model = 'gemini-3-flash-preview';
  const prompt = `
    You are an expert Enterprise Java and Kafka Architect. 
    Explain "${topic}" in the context of building a distributed messaging system.
    Keep it professional, technical but accessible.
    Current Context: ${context || 'General Kafka knowledge'}
    
    Format the response with:
    1. A concise definition.
    2. Why it matters for scaling.
    3. A brief "Java/Spring" code snippet or configuration example if applicable.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to my knowledge base. Please try again.";
  }
};

export const getScalingRecommendation = async (metrics: any) => {
  const model = 'gemini-3-pro-preview';
  const prompt = `
    Analyze these Kafka metrics and provide a scaling recommendation for an enterprise environment.
    Metrics: ${JSON.stringify(metrics)}
    
    Think about:
    - Partition counts vs Consumer threads.
    - Throughput limits.
    - Disk usage and retention.
    - Cost-benefit analysis of moving from Starter to Professional tiers.
    
    Provide a specific recommendation: SCALE_UP, SCALE_OUT, or MAINTAIN.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "Unable to analyze metrics right now.";
  }
};
