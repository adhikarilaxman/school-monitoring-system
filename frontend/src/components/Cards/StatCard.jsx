import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  change, 
  changeType = 'positive',
  icon: Icon,
  onClick,
  className = ''
}) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl p-6 shadow-card card-hover ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-navy-500">{value}</h3>
          {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
            <Icon className="w-6 h-6 text-teal-500" />
          </div>
        )}
      </div>
      
      {change !== undefined && (
        <div className="flex items-center gap-1 mt-4">
          {changeType === 'positive' ? (
            <>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 rounded-full">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-xs font-semibold text-green-600">{change}%</span>
              </div>
              <span className="text-xs text-slate-400">vs last period</span>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-red-100 rounded-full">
                <TrendingDown className="w-3 h-3 text-red-600" />
                <span className="text-xs font-semibold text-red-600">{change}%</span>
              </div>
              <span className="text-xs text-slate-400">vs last period</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
