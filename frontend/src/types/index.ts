export interface User {
  id: string;
  name: string;
  email: string;
  role: 'JOB_SEEKER' | 'EMPLOYER' | 'ADMIN';
  phone?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  emailVerified?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userSkills?: UserSkill[];
  companyProfile?: CompanyProfile;
}

export interface Job {
  id: string;
  employerId: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'REMOTE';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  employer?: User & { companyProfile?: CompanyProfile };
  jobSkills?: JobSkill[];
  _count?: { applications: number };
}

export interface Application {
  id: string;
  userId: string;
  jobId: string;
  status: 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'REJECTED' | 'ACCEPTED';
  coverLetter?: string;
  appliedAt: string;
  updatedAt: string;
  user?: User;
  job?: Job;
}

export interface Resume {
  id: string;
  userId: string;
  filePath: string;
  fileName: string;
  extractedText?: string;
  parsedData?: ParsedResumeData;
  isActive: boolean;
  uploadedAt: string;
}

export interface ParsedResumeData {
  name: string;
  email: string;
  phone: string;
  education: { institution: string; degree: string; field: string; year: string }[];
  experience: { company: string; title: string; duration: string; description: string }[];
  skills: string[];
  certifications: string[];
}

export interface Skill {
  id: string;
  name: string;
  category?: string;
}

export interface UserSkill {
  id: string;
  userId: string;
  skillId: string;
  proficiencyLevel?: number;
  skill?: Skill;
}

export interface JobSkill {
  id: string;
  jobId: string;
  skillId: string;
  requiredLevel?: number;
  skill?: Skill;
}

export interface AiRecommendation {
  id: string;
  userId: string;
  jobId: string;
  matchScore: number;
  skillGap?: SkillGapItem[];
  explanation?: string;
  createdAt: string;
  job?: Job;
  user?: User;
}

export interface SkillGapItem {
  skill_name: string;
  required_level: number;
  user_level: number;
  gap: number;
  severity?: string;
}

export interface MatchBreakdown {
  skill_match: number;
  experience_relevance: number;
  education_match: number;
  location_match: number;
  salary_fit: number;
}

export interface MatchResult {
  user_id: string;
  job_id: string;
  score: number;
  breakdown: MatchBreakdown;
  skill_gaps: SkillGapItem[];
  explanation: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'APPLICATION_UPDATE' | 'NEW_JOB_MATCH' | 'NEW_APPLICANT' | 'SYSTEM' | 'RECOMMENDATION';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

export interface CompanyProfile {
  id: string;
  userId: string;
  companyName: string;
  industry?: string;
  website?: string;
  description?: string;
  size?: string;
  logo?: string;
}

export interface CourseRecommendation {
  skill_name: string;
  resource_title: string;
  resource_type: string;
  provider: string;
  estimated_duration: string;
  url: string;
  priority: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
}
