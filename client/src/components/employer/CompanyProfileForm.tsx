import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Input from '../ui/Input';
import TextArea from '../ui/TextArea';
import Button from '../ui/Button';
import { companyApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function CompanyProfileForm() {
  const { user, fetchMe } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm({ defaultValues: user?.companyProfile || {} });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try { await companyApi.update(data); await fetchMe(); toast.success('Company profile updated'); }
    catch { toast.error('Failed'); }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      <Input label="Company Name" {...register('companyName')} />
      <Input label="Industry" {...register('industry')} />
      <Input label="Website" {...register('website')} />
      <TextArea label="Description" {...register('description')} />
      <div>
        <label className="label mb-1 block">Company Size</label>
        <select {...register('size')} className="w-full px-3 py-2 border border-ink-200 rounded-md font-body text-sm bg-surface-raised focus:outline-none focus:border-verdant-500">
          <option value="">Select size</option>
          {['1-10', '11-50', '51-200', '201-500', '500+'].map(s => <option key={s} value={s}>{s} employees</option>)}
        </select>
      </div>
      <Button type="submit" isLoading={loading}>Save Company Profile</Button>
    </form>
  );
}
