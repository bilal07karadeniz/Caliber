import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { aiEngineService } from '../services/aiEngine.service';

export const getSkillGapForJob = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await aiEngineService.analyzeSkillGap(req.user!.userId, req.params.jobId);
    return res.json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to analyze skill gap' });
  }
};

export const getCareerInsights = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await aiEngineService.getCareerInsights(req.user!.userId);
    return res.json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to get career insights' });
  }
};

export const getLearningPath = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await aiEngineService.getLearningPath(req.user!.userId);
    return res.json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to get learning path' });
  }
};
