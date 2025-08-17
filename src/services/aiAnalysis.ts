import axios from 'axios';

export interface AiAnalysisRequest {
  userId: string;
  caption: string;
  imagePrompt?: string;
  aiProvider?: string; // AIプロバイダーを追加
}

export interface AiAnalysisResult {
  score: number;
  reasons: string[];
  suggestions: string[];
  [key: string]: any;
}

export async function analyzePost(data: AiAnalysisRequest): Promise<AiAnalysisResult> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://instagram-marketing-backend-v2.onrender.com';
  const response = await axios.post(`${API_BASE_URL}/api/ai/analyze`, data);
  if (response.data && response.data.success) {
    return response.data.data;
  } else {
    throw new Error(response.data?.error || 'AI分析APIエラー');
  }
} 