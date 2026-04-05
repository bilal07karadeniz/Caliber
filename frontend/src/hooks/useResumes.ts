import { useState, useEffect } from 'react';
import { resumeApi } from '../services/api';
import type { Resume } from '../types';
import toast from 'react-hot-toast';

export const useResumes = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchResumes = async () => {
    try {
      const { data: res } = await resumeApi.getAll();
      setResumes(res.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const uploadResume = async (file: File) => {
    setUploading(true);
    try {
      await resumeApi.upload(file);
      await fetchResumes();
      toast.success('Resume uploaded');
    } catch { toast.error('Upload failed'); }
    setUploading(false);
  };

  const deleteResume = async (id: string) => {
    try {
      await resumeApi.delete(id);
      await fetchResumes();
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
  };

  useEffect(() => { fetchResumes(); }, []);

  return { resumes, loading, uploading, uploadResume, deleteResume, refetch: fetchResumes };
};
