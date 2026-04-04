import Input from '../ui/Input';
import TextArea from '../ui/TextArea';
import Select from '../ui/Select';

interface Props {
  register: any;
  errors: any;
}

export default function JobForm({ register, errors }: Props) {
  return (
    <div className="space-y-4">
      <Input label="Job Title" {...register('title', { required: 'Required' })} error={errors.title?.message} placeholder="e.g. Senior React Developer" />
      <TextArea label="Description" {...register('description', { required: 'Required' })} error={errors.description?.message} placeholder="Describe the role..." className="min-h-[150px]" />
      <TextArea label="Requirements" {...register('requirements', { required: 'Required' })} error={errors.requirements?.message} placeholder="List qualifications..." className="min-h-[100px]" />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Location" {...register('location', { required: 'Required' })} error={errors.location?.message} />
        <Select label="Employment Type" {...register('employmentType', { required: 'Required' })}
          options={[{ value: 'FULL_TIME', label: 'Full Time' }, { value: 'PART_TIME', label: 'Part Time' }, { value: 'CONTRACT', label: 'Contract' }, { value: 'INTERNSHIP', label: 'Internship' }, { value: 'REMOTE', label: 'Remote' }]} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Min Salary (USD)" type="number" {...register('salaryMin')} />
        <Input label="Max Salary (USD)" type="number" {...register('salaryMax')} />
      </div>
    </div>
  );
}
