import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: string;
  trendType?: 'up' | 'down' | 'neutral' | 'warning';
  className?: string;
  compact?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  color?: string;
  onClick?: () => void;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = true,
  padding = 'md',
  onClick
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div 
      className={`
        bg-white rounded-xl border border-slate-200 shadow-sm 
        ${hover ? 'hover:shadow-md transition-shadow duration-200' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${paddingClasses[padding]}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor = 'bg-teal-100',
  trend,
  trendType = 'up',
  className = '',
  compact = false,
  size = 'md'
}) => {
  const getTrendColor = () => {
    switch (trendType) {
      case 'up': return 'text-emerald-600';
      case 'down': return 'text-red-600';
      case 'warning': return 'text-amber-600';
      case 'neutral': return 'text-slate-600';
      default: return 'text-emerald-600';
    }
  };

  const getIconColor = () => {
    if (iconColor.startsWith('bg-')) {
      return iconColor.replace('bg-', 'text-');
    }
    return iconColor;
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'text-lg font-bold';
      case 'lg': return 'text-3xl font-bold';
      default: return 'text-2xl font-bold';
    }
  };

  return (
    <Card className={className} hover={true}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className={`${getSizeClasses()} text-slate-900`}>
            {value}
          </h3>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${iconColor} bg-opacity-10 ml-4`}>
            <Icon className={`w-6 h-6 ${getIconColor()}`} />
          </div>
        )}
      </div>
      {trend && (
        <div className="flex items-center text-sm">
          {trendType === 'up' && (
            <>
              <div className="w-4 h-4 bg-emerald-500 rounded-full mr-2"></div>
              <span className={getTrendColor()}>{trend}</span>
            </>
          )}
          {trendType === 'down' && (
            <>
              <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
              <span className={getTrendColor()}>{trend}</span>
            </>
          )}
          {trendType === 'warning' && (
            <>
              <div className="w-4 h-4 bg-amber-500 rounded-full mr-2"></div>
              <span className={getTrendColor()}>{trend}</span>
            </>
          )}
          {trendType === 'neutral' && (
            <span className={getTrendColor()}>{trend}</span>
          )}
        </div>
      )}
    </Card>
  );
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'bg-teal-100',
  onClick,
  className = ''
}) => {
  const getTextColor = () => {
    if (color.startsWith('bg-')) {
      return color.replace('bg-', 'text-');
    }
    return color;
  };

  return (
    <Card 
      className={`
        ${onClick ? 'cursor-pointer hover:border-teal-300' : ''} 
        ${className}
      `}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${getTextColor()}`} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500 uppercase tracking-wide">{title}</p>
          <p className="text-lg font-bold text-slate-900 truncate">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default Card;
