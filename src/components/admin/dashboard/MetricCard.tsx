interface MetricCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    growth?: number;
    subtitle?: string;
}

const formatPercentage = (value: number | string | undefined | null): number => {
    if (value === null || value === undefined) return 0;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? 0 : Math.round(num);
};

export function MetricCard({ icon, label, value, growth, subtitle }: MetricCardProps) {
    const hasGrowth = growth !== undefined && growth !== null;
    const isPositive = growth && growth > 0;
    const isNegative = growth && growth < 0;

    return (
        <div className="rounded-xl border border-[var(--neutral-200)] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div className="text-3xl">{icon}</div>
                {hasGrowth && (
                    <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isPositive
                            ? "bg-[var(--success)]/10 text-[var(--success)]"
                            : isNegative
                                ? "bg-[var(--error)]/10 text-[var(--error)]"
                                : "bg-[var(--neutral-100)] text-[var(--neutral-600)]"
                            }`}
                    >
                        {isPositive && "+"}{formatPercentage(growth)}%
                    </span>
                )}
            </div>
            <div className="mt-4">
                <p className="text-3xl font-bold text-[var(--neutral-900)]">
                    {typeof value === "number" ? value.toLocaleString("vi-VN") : value}
                </p>
                <p className="mt-1 text-sm font-medium text-[var(--neutral-600)]">
                    {label}
                </p>
                {subtitle && (
                    <p className="mt-1 text-xs text-[var(--neutral-500)]">{subtitle}</p>
                )}
            </div>
        </div>
    );
}
