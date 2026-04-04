import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import TextArea from '../ui/TextArea';
import { applicationApi } from '../../services/api';

interface Props { isOpen: boolean; onClose: () => void; jobId: string; jobTitle: string; onApplied: () => void; }

export default function ApplyModal({ isOpen, onClose, jobId, jobTitle, onApplied }: Props) {
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    setLoading(true);
    try {
      await applicationApi.apply({ jobId, coverLetter: coverLetter || undefined });
      toast.success('Application submitted');
      onApplied();
      onClose();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to apply'); }
    finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Apply — ${jobTitle}`}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={handleApply} isLoading={loading}>Submit</Button></>}>
      <TextArea label="Cover Letter (optional)" value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)}
        maxLength={5000} placeholder="Why are you a good fit for this role?" className="min-h-[150px]" />
    </Modal>
  );
}
