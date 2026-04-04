import { useResumes } from '../../hooks/useResumes';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export default function ResumeSection() {
  const { resumes, loading, uploading, uploadResume, deleteResume } = useResumes();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadResume(file);
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-ink-300 rounded-md p-6 text-center">
        <p className="text-ink-500 mb-2 font-body text-sm">Upload your resume (PDF, DOC, DOCX - max 10MB)</p>
        <input type="file" accept=".pdf,.doc,.docx" onChange={handleUpload} className="hidden" id="resume-upload-section" />
        <label htmlFor="resume-upload-section">
          <span className="inline-flex items-center px-4 py-2 border-2 border-verdant-600 text-verdant-600 rounded-md text-sm font-medium cursor-pointer hover:bg-verdant-600 hover:text-white transition-colors">
            {uploading ? 'Uploading...' : 'Choose File'}
          </span>
        </label>
      </div>
      {resumes.map((r) => (
        <div key={r.id} className="flex items-center justify-between p-4 border border-ink-200 rounded-md">
          <div>
            <p className="font-heading font-medium text-sm">{r.fileName}</p>
            <p className="text-xs font-mono text-ink-400">{new Date(r.uploadedAt).toLocaleDateString()}</p>
            {r.parsedData?.skills && r.parsedData.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {r.parsedData.skills.slice(0, 8).map((s: string) => <Badge key={s}>{s}</Badge>)}
              </div>
            )}
          </div>
          <Button variant="danger" size="sm" onClick={() => deleteResume(r.id)}>Delete</Button>
        </div>
      ))}
    </div>
  );
}
