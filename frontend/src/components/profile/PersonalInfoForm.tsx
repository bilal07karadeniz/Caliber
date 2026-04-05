import { useForm } from 'react-hook-form';
import Input from '../ui/Input';
import TextArea from '../ui/TextArea';
import Button from '../ui/Button';
import { userApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function PersonalInfoForm() {
  const { user, fetchMe } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: { name: user?.name || '', phone: user?.phone || '', location: user?.location || '', bio: user?.bio || '' },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await userApi.updateProfile(data);
      await fetchMe();
      toast.success('Profile updated');
    } catch { toast.error('Failed to update'); }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      <Input label="Full Name" {...register('name')} />
      <Input label="Email" value={user?.email || ''} disabled />
      <Input label="Phone" {...register('phone')} />
      <Input label="Location" {...register('location')} />
      <TextArea label="Bio" {...register('bio')} maxLength={2000} />
      <Button type="submit" isLoading={loading}>Save Changes</Button>
    </form>
  );
}
