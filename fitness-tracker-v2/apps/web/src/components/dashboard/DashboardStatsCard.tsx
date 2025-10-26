import React, { memo, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usage } from '../lib/theme';

interface DashboardStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
}

export const DashboardStatsCard = memo<DashboardStatsCardProps>(({
  title,
  value,
  subtitle,
  icon,
  trend,
  onClick
}) => {
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick();
    }
  }, [onClick]);

  const trendColor = useMemo(() => {
    if (!trend) return '';
    return trend.isPositive ? 'text-green-600' : 'text-red-600';
  }, [trend]);

  const trendIcon = useMemo(() => {
    if (!trend) return null;
    return trend.isPositive ? '↗' : '↘';
  }, [trend]);

  return (
    <div
      className="glassmorphism p-6 rounded-xl cursor-pointer hover:scale-105 transition-transform duration-200"
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-secondary mb-1">{title}</p>
          <p className="text-2xl font-bold text-primary mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center text-xs ${trendColor}`}>
              <span className="mr-1">{trendIcon}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-3xl text-primary opacity-60">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
});

DashboardStatsCard.displayName = 'DashboardStatsCard';
