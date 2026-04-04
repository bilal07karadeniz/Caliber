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
import { jobApi } from '../../services/api';

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skills, setSkills] = useState<{ name: string; requiredLevel: number }[]>([]);
  const [skillName, setSkillName] = useState('');
  const [skillLevel, setSkillLevel] = useState(3);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => { loadJob(); }, [id]);

  const loadJob = async () => {
    try {
      const { data: res } = await jobApi.get(id!);
      const job = res.data;
      reset({ title: job.title, description: job.description, requirements: job.requirements, location: job.location, employmentType: job.employmentType, salaryMin: job.salaryMin, salaryMax: job.salaryMax });
      setSkills(job.jobSkills?.map((js: any) => ({ name: js.skill.name, requiredLevel: js.requiredLevel || 3 })) || []);
    } catch { toast.error('Failed to load job'); }
    setLoading(false);
  };

  const addSkill = () => {
    if (skillName.trim() && !skills.find((s) => s.name.toLowerCase() === skillName.toLowerCase())) {
      setSkills([...skills, { name: skillName.trim(), requiredLevel: skillLevel }]);
      setSkillName('');
    }
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
      <h1 className="text-2xl font-bold mb-6">Edit Job Posting</h1>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {skills.map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    {s.name} (L{s.requiredLevel})
                    <button type="button" onClick={() => setSkills(skills.filter((_, j) => j !== i))} className="hover:text-red-500">&times;</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input className="flex-1 px-3 py-2 border rounded-lg text-sm" value={skillName} onChange={(e) => setSkillName(e.target.value)} placeholder="Skill name" />
                <select value={skillLevel} onChange={(e) => setSkillLevel(Number(e.target.value))} className="px-3 py-2 border rounded-lg text-sm"><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option><option value={5}>5</option></select>
                <Button type="button" variant="secondary" size="sm" onClick={addSkill}>Add</Button>
              </div>
            </div>
            <Button type="submit" isLoading={saving}>Save Changes</Button>
          </div>
        </Card>
      </form>
    </DashboardLayout>
  );
}
