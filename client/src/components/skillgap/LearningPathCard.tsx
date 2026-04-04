import type { CourseRecommendation } from '../../types';

const priorityColors: Record<string, string> = { critical: 'bg-signal-low', moderate: 'bg-saffron-500', minor: 'bg-verdant-500' };

export default function LearningPathCard({ course }: { course: CourseRecommendation }) {
  return (
    <div className="flex items-stretch border border-ink-200 rounded-md overflow-hidden hover:border-ink-300 transition-colors">
      <div className={`w-1 ${priorityColors[course.priority] || 'bg-ink-300'}`} />
      <div className="flex-1 flex items-center justify-between p-3.5">
        <div>
          <p className="font-heading font-medium text-sm">{course.resource_title}</p>
          <p className="text-xs font-mono text-ink-400 mt-0.5">{course.provider} · {course.estimated_duration} · {course.skill_name}</p>
        </div>
        {course.url && course.url !== '#' && (
          <a href={course.url} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-verdant-600 hover:underline underline-offset-2 shrink-0 ml-3">Open</a>
        )}
      </div>
    </div>
  );
}
