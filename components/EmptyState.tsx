import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
    icon: LucideIcon
    title: string
    description: string
    action?: {
        label: string
        onClick: () => void
    }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="glass rounded-3xl p-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="relative mb-6 group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center shadow-inner border border-slate-200 dark:border-slate-700">
                    <Icon className="w-10 h-10 text-indigo-500 dark:text-indigo-400" strokeWidth={1.5} />
                </div>
            </div>

            <h3 className="text-xl font-bold text-foreground mb-2">
                {title}
            </h3>

            <p className="text-muted-foreground max-w-sm mb-8 leading-relaxed">
                {description}
            </p>

            {action && (
                <button
                    onClick={action.onClick}
                    className="px-8 py-3 rounded-full gradient-primary text-white font-medium hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-indigo-500/25 transform hover:-translate-y-0.5"
                >
                    {action.label}
                </button>
            )}
        </div>
    )
}
