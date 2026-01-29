import React from 'react';

interface ProgressProps {
    value: number;
    className?: string;
    variant?: 'brand' | 'success' | 'danger' | 'warning';
}

export const Progress: React.FC<ProgressProps> = ({
    value,
    className = '',
    variant = 'brand'
}) => {
    const getGradient = () => {
        switch (variant) {
            case 'success':
                return 'from-emerald-500 to-teal-400';
            case 'danger':
                return 'from-red-500 to-rose-400';
            case 'warning':
                return 'from-amber-500 to-orange-400';
            default:
                return 'from-[var(--brand-primary)] to-[var(--brand-primary-light)]';
        }
    };

    return (
        <div className={`w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden ${className}`}>
            <div
                className={`h-full bg-gradient-to-r ${getGradient()} transition-all duration-700 cubic-bezier(0.16,1,0.3,1) shadow-[0_0_12px_-2px_rgba(0,0,0,0.1)]`}
                style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
            />
        </div>
    );
};

export default Progress;
