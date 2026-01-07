import React, { useState, useEffect } from 'react';
import { Calendar, X, Loader2, AlertCircle } from 'lucide-react';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string) => void;
  isLoading?: boolean;
  initialDate?: string;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  initialDate = '',
}) => {
  const [date, setDate] = useState(initialDate);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Default to current time if no initial date, or ensure format is correct
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      const defaultDate = now.toISOString().slice(0, 16);
      
      setDate(initialDate || defaultDate);
      setError(null);
    }
  }, [isOpen, initialDate]);

  const handleConfirm = () => {
    if (!date) {
      setError('Please select a date and time.');
      return;
    }

    const selectedTime = new Date(date).getTime();
    const now = new Date().getTime();

    if (selectedTime < now) {
      setError('You cannot schedule a post in the past.');
      return;
    }

    onConfirm(date);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
        onClick={!isLoading ? onClose : undefined}
      />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 opacity-100">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-solar-100 text-solar-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>

            <div className="flex-1 pt-0.5">
              <h3 className="text-lg font-bold text-slate-900 leading-6 mb-2">
                Schedule Publication
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                Choose a date and time to automatically publish this post.
              </p>

              <div className="space-y-3">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">
                     Date & Time
                   </label>
                   <input
                     type="datetime-local"
                     value={date}
                     onChange={(e) => {
                       setDate(e.target.value);
                       setError(null);
                     }}
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-solar-500 focus:outline-none text-slate-900 ${error ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-solar-500'}`}
                   />
                </div>
                
                {error && (
                  <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                    <AlertCircle className="w-3 h-3" />
                    {error}
                  </div>
                )}

                <p className="text-xs text-slate-400">
                  Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone} (Local)
                </p>
              </div>
            </div>

            {!isLoading && (
              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-slate-500 transition-colors -mt-1 -mr-2 p-2 rounded-full hover:bg-slate-50"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 focus:ring-2 focus:ring-slate-200 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={handleConfirm}
            className="w-full sm:w-auto px-4 py-2 rounded-lg text-white font-medium flex items-center justify-center gap-2 bg-solar-600 hover:bg-solar-700 focus:ring-2 focus:ring-solar-200 focus:ring-offset-1 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleModal;