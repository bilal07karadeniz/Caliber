interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="py-16">
      <div className="border-t border-ink-200 pt-6">
        {icon && <div className="text-ink-300 mb-3">{icon}</div>}
        <h3 className="font-heading text-xl text-ink-300">{title}</h3>
        {description && <p className="text-sm text-ink-400 mt-1">{description}</p>}
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}
