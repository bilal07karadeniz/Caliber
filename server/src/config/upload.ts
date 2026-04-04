import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from './index';

const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(config.uploadDir, 'avatars');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req: any, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user?.userId}-${Date.now()}${ext}`);
  },
});

const resumeStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(config.uploadDir, 'resumes');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req: any, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user?.userId}-${Date.now()}${ext}`);
  },
});

const imageFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const resumeFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and Word documents are allowed'));
  }
};

export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadResume = multer({
  storage: resumeStorage,
  fileFilter: resumeFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});
