import { Building2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const SchoolCard = ({ school, status = 'submitted', onClick }) => {
  const statusConfig = {
    submitted: {
      icon: CheckCircle2,
      text: 'Report Submitted',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      dotColor: 'bg-green-500'
    },
    pending: {
      icon: Clock,
      text: 'Report Pending',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      dotColor: 'bg-yellow-500'
    },
    late: {
      icon: AlertCircle,
      text: 'Report Late',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      dotColor: 'bg-red-500'
    }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl p-5 shadow-card card-hover cursor-pointer"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Building2 className="w-6 h-6 text-teal-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-800 truncate">{school.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2 h-2 rounded-full ${config.dotColor}`}></span>
            <span className={`text-xs font-medium ${config.color}`}>{config.text}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">{school.time || 'Yesterday'}</p>
        </div>
      </div>
    </div>
  );
};

export default SchoolCard;
