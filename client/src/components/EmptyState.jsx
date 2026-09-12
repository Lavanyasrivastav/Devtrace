export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-surface-border py-16 text-center">
      {Icon && <Icon className="h-10 w-10 text-gray-600" />}
      <h3 className="text-base font-semibold text-gray-200">{title}</h3>
      {description && <p className="max-w-sm text-sm text-gray-400">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
