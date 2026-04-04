import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { jobApi } from '../../services/api';

export default function CreateJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<{ name: string; requiredLevel: number }[]>([]);
  const [skillName, setSkillName] = useState('');
  const [skillLevel, setSkillLevel] = useState(3);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const addSkill = () => {
    if (skillName.trim() && !skills.find((s) => s.name.toLowerCase() === skillName.toLowerCase())) {
      setSkills([...skills, { name: skillName.trim(), requiredLevel: skillLevel }]);
      setSkillName('');
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await jobApi.create({ ...data, salaryMin: data.salaryMin ? Number(data.salaryMin) : undefined, salaryMax: data.salaryMax ? Number(data.salaryMax) : undefined, skills });
      toast.success('Job posted!');
      navigate('/employer/jobs');
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to create job'); }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <h1 className="font-heading text-2xl font-bold text-ink-900 mb-6">Create Job Posting</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card header={<h3 className="font-heading font-semibold text-ink-900">Job Details</h3>}>
              <div className="space-y-4">
                <Input label="Job Title" {...register('title', { required: 'Required' })} error={errors.title?.message as string} placeholder="e.g. Senior React Developer" />
                <TextArea label="Description" {...register('description', { required: 'Required' })} error={errors.description?.message as string} placeholder="Describe the role, responsibilities..." className="min-h-[150px]" />
                <TextArea label="Requirements" {...register('requirements', { required: 'Required' })} error={errors.requirements?.message as string} placeholder="List qualifications needed..." className="min-h-[100px]" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Location" {...register('location', { required: 'Required' })} error={errors.location?.message as string} placeholder="e.g. Istanbul, Turkey" />
                  <Select label="Employment Type" {...register('employmentType', { required: 'Required' })}
                    options={[{ value: 'FULL_TIME', label: 'Full Time' }, { value: 'PART_TIME', label: 'Part Time' }, { value: 'CONTRACT', label: 'Contract' }, { value: 'INTERNSHIP', label: 'Internship' }, { value: 'REMOTE', label: 'Remote' }]} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Min Salary (USD)" type="number" {...register('salaryMin')} placeholder="e.g. 50000" />
                  <Input label="Max Salary (USD)" type="number" {...register('salaryMax')} placeholder="e.g. 80000" />
                </div>
              </div>
            </Card>

            <Card header={<h3 className="font-heading font-semibold text-ink-900">Required Skills</h3>}>
              <div className="flex flex-wrap gap-2 mb-4">
                {skills.map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 border border-ink-200 rounded-md font-mono text-xs text-ink-700">
                    {s.name} <span className="text-ink-400">L{s.requiredLevel}</span>
                    <button onClick={() => setSkills(skills.filter((_, j) => j !== i))} className="ml-1 hover:text-signal-high transition-colors">&times;</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 items-end">
                <Input label="Skill Name" value={skillName} onChange={(e) => setSkillName(e.target.value)} placeholder="e.g. React" />
                <div>
                  <p className="label mb-1">Level</p>
                  <select value={skillLevel} onChange={(e) => setSkillLevel(Number(e.target.value))} className="px-3 py-2 border border-ink-200 rounded-md font-body text-sm transition-colors focus:border-verdant-500 focus:outline-none">
                    {[1, 2, 3, 4, 5].map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <Button type="button" variant="secondary" onClick={addSkill}>Add</Button>
              </div>
            </Card>
          </div>

          <div>
            <Card header={<h3 className="font-heading font-semibold text-ink-900">Actions</h3>}>
              <Button type="submit" className="w-full" isLoading={loading}>Publish Job</Button>
            </Card>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
