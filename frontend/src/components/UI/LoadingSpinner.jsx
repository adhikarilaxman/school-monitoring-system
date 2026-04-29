import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ text = 'Loading...', size = 40 }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <Loader2 className="animate-spin text-navy-500" size={size} />
      <p className="text-slate-500 text-sm font-medium">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
