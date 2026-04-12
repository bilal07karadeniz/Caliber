import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import SkillAutocomplete from '../../components/SkillAutocomplete';
import { jobApi } from '../../services/api';

const JOB_CATEGORIES = ['Technology', 'Healthcare', 'Finance', 'Education', 'Marketing', 'Legal', 'Design', 'Engineering', 'Sales', 'Human Resources', 'Manufacturing', 'Retail', 'Hospitality', 'Other'];

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skills, setSkills] = useState<{ name: string; requiredLevel: number }[]>([]);
  const [skillLevel, setSkillLevel] = useState(3);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => { loadJob(); }, [id]);

  const loadJob = async () => {
    try {
      const { data: res } = await jobApi.get(id!);
      const job = res.data;
      reset({ title: job.title, description: job.description, requirements: job.requirements, location: job.location, employmentType: job.employmentType, category: job.category || '', salaryMin: job.salaryMin, salaryMax: job.salaryMax });
      setSkills(job.jobSkills?.map((js: any) => ({ name: js.skill.name, requiredLevel: js.requiredLevel || 3 })) || []);
    } catch { toast.error('Failed to load job'); }
    setLoading(false);
  };

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      await jobApi.update(id!, { ...data, salaryMin: data.salaryMin ? Number(data.salaryMin) : undefined, salaryMax: data.salaryMax ? Number(data.salaryMax) : undefined, skills });
      toast.success('Job updated');
      navigate('/employer/jobs');
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><Spinner size="lg" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 className="font-heading text-2xl font-bold text-ink-900 mb-6">Edit Job Posting</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <div className="space-y-4 max-w-2xl">
            <Input label="Job Title" {...register('title')} />
            <TextArea label="Description" {...register('description')} className="min-h-[150px]" />
            <TextArea label="Requirements" {...register('requirements')} className="min-h-[100px]" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Location" {...register('location')} />
              <Select label="Employment Type" {...register('employmentType')}
                options={[{ value: 'FULL_TIME', label: 'Full Time' }, { value: 'PART_TIME', label: 'Part Time' }, { value: 'CONTRACT', label: 'Contract' }, { value: 'INTERNSHIP', label: 'Internship' }, { value: 'REMOTE', label: 'Remote' }]} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Min Salary" type="number" {...register('salaryMin')} />
              <Input label="Max Salary" type="number" {...register('salaryMax')} />
            </div>
            <Select label="Category" {...register('category')}
              options={[{ value: '', label: 'Select Category' }, ...JOB_CATEGORIES.map((c) => ({ value: c, label: c }))]} />
            <div>
              <p className="label mb-2">Skills</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {skills.map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 border border-ink-200 rounded-md font-mono text-xs text-ink-700">
                    {s.name} <span className="text-ink-400">L{s.requiredLevel}</span>
                    <button type="button" onClick={() => setSkills(skills.filter((_, j) => j !== i))} className="hover:text-signal-high transition-colors">&times;</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <SkillAutocomplete
                    placeholder="Search skills..."
                    excludeNames={skills.map((s) => s.name)}
                    onSelect={(skill) => {
                      setSkills([...skills, { name: skill.name, requiredLevel: skillLevel }]);
                    }}
                  />
                </div>
                <select value={skillLevel} onChange={(e) => setSkillLevel(Number(e.target.value))} className="px-3 py-2 border border-ink-200 rounded-md text-sm font-body transition-colors focus:border-verdant-500 focus:outline-none"><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option><option value={5}>5</option></select>
              </div>
            </div>
            <Button type="submit" isLoading={saving}>Save Changes</Button>
          </div>
        </Card>
      </form>
    </DashboardLayout>
  );
}
