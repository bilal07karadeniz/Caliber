import axios from 'axios';
import { config } from '../config';

const aiClient = axios.create({
  baseURL: config.aiServiceUrl,
  timeout: 30000,
});

export const aiEngineService = {
  async parseResume(filePath: string) {
    try {
      const { data } = await aiClient.post('/api/parse-resume', { file_path: filePath });
      return data;
    } catch (error) {
      console.error('AI Engine parse error:', error);
      throw error;
    }
  },

  async getJobRecommendations(userId: string, limit = 20) {
    try {
      const { data } = await aiClient.post('/api/match/user-to-jobs', { user_id: userId, limit });
      return data;
    } catch (error) {
      console.error('AI Engine recommendation error:', error);
      throw error;
    }
  },

  async getCandidateRecommendations(jobId: string, limit = 20) {
    try {
      const { data } = await aiClient.post('/api/match/job-to-candidates', { job_id: jobId, limit });
      return data;
    } catch (error) {
      console.error('AI Engine candidate ranking error:', error);
      throw error;
    }
  },

  async getMatchScore(userId: string, jobId: string) {
    try {
      const { data } = await aiClient.post('/api/match/score', { user_id: userId, job_id: jobId });
      return data;
    } catch (error) {
      console.error('AI Engine match score error:', error);
      throw error;
    }
  },

  async analyzeSkillGap(userId: string, jobId: string) {
    try {
      const { data } = await aiClient.post('/api/skill-gap/analyze', { user_id: userId, job_id: jobId });
      return data;
    } catch (error) {
      console.error('AI Engine skill gap error:', error);
      throw error;
    }
  },

  async getCareerInsights(userId: string) {
    try {
      const { data } = await aiClient.post('/api/skill-gap/career-insights', { user_id: userId });
      return data;
    } catch (error) {
      console.error('AI Engine career insights error:', error);
      throw error;
    }
  },

  async getLearningPath(userId: string) {
    try {
      const { data } = await aiClient.get(`/api/skill-gap/learning-path/${userId}`);
      return data;
    } catch (error) {
      console.error('AI Engine learning path error:', error);
      throw error;
    }
  },

  async getAiMetrics() {
    try {
      const { data } = await aiClient.get('/api/admin/ai-metrics');
      return data;
    } catch (error) {
      console.error('AI Engine metrics error:', error);
      throw error;
    }
  },
};
