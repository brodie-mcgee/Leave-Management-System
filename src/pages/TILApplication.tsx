import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, AlertTriangle, Info, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLeave } from '../context/LeaveContext';
export function TILApplication() {
  const {
    user
  } = useAuth();
  const {
    getTilBalance,
    submitTilApplication,
    globalTilSettings
  } = useLeave();
  const [mode, setMode] = useState('work'); // "work" or "take"
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    reason: '',
    details: ''
  });
  const [calculatedHours, setCalculatedHours] = useState(0);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const tilBalance = getTilBalance(user.id);
  const accrualRatio = user.tilSettings?.accrualRatio || 1;
  const usageRatio = user.tilSettings?.usageRatio || 1;
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      const hours = (end - start) / (1000 * 60 * 60);
      if (hours > 0) {
        setCalculatedHours(mode === 'work' ? hours * globalTilSettings.accrualRatio : hours * globalTilSettings.usageRatio);
      } else {
        setCalculatedHours(0);
      }
    }
  }, [formData.startTime, formData.endTime, mode, globalTilSettings]);
  const validateForm = () => {
    const newErrors = {};
    const today = new Date();
    const selectedDate = new Date(formData.date);
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else if (mode === 'work' && !user.tilSettings?.allowRetrospective && selectedDate < today) {
      newErrors.date = 'Cannot log TIL work retrospectively';
    }
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';
    if (!formData.reason) newErrors.reason = 'Reason is required';
    if (mode === 'take' && calculatedHours > (tilBalance?.balance || 0)) {
      newErrors.hours = 'Insufficient TIL balance';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const result = await submitTilApplication({
        mode,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        reason: formData.reason,
        details: formData.details,
        calculatedHours: calculatedHours
      });
      if (result) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/history');
        }, 2000);
      } else {
        throw new Error('Failed to submit application');
      }
    } catch (error) {
      setErrors({
        submit: error.message || 'Failed to submit application'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  if (success) {
    return <div className="max-w-2xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            TIL Application Submitted
          </h2>
          <p className="text-gray-600 mb-4">
            Your {mode === 'work' ? 'work TIL' : 'TIL leave'} request has been
            submitted successfully.
          </p>
          <p className="text-sm text-gray-500">
            You will be redirected to your history...
          </p>
        </div>
      </div>;
  }
  return <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Time in Lieu Application
      </h1>
      {/* Mode Toggle */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex space-x-4">
          <button onClick={() => setMode('work')} className={`flex-1 py-2 px-4 rounded-md text-center ${mode === 'work' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            Log Work TIL
          </button>
          <button onClick={() => setMode('take')} className={`flex-1 py-2 px-4 rounded-md text-center ${mode === 'take' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            Take TIL Leave
          </button>
        </div>
      </div>
      {/* TIL Balance */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Current TIL Balance
            </h2>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {(tilBalance?.balance || 0).toFixed(1)} hours
            </p>
          </div>
          <Clock className="w-12 h-12 text-blue-200" />
        </div>
        {tilBalance?.pendingAccrual > 0 && <div className="mt-2 text-sm text-gray-600">
            + {tilBalance.pendingAccrual.toFixed(1)} hours pending approval
          </div>}
      </div>
      {/* Warning for expiring TIL */}
      {tilBalance?.balance > 0 && <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 mr-2" />
            <div>
              <h3 className="font-medium text-amber-800">TIL Usage Policy</h3>
              <p className="text-sm text-amber-700 mt-1">
                College policy requires TIL hours to be taken within{' '}
                {globalTilSettings.expiryDays} days of accrual. Please plan your
                TIL leave accordingly.
              </p>
            </div>
          </div>
        </div>}
      {/* Application Form */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <div className="relative">
                <input type="date" value={formData.date} onChange={e => setFormData(prev => ({
                ...prev,
                date: e.target.value
              }))} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.date ? 'border-red-300' : 'border-gray-300'}`} />
                <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input type="time" value={formData.startTime} onChange={e => setFormData(prev => ({
                ...prev,
                startTime: e.target.value
              }))} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.startTime ? 'border-red-300' : 'border-gray-300'}`} />
                {errors.startTime && <p className="mt-1 text-sm text-red-600">
                    {errors.startTime}
                  </p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input type="time" value={formData.endTime} onChange={e => setFormData(prev => ({
                ...prev,
                endTime: e.target.value
              }))} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.endTime ? 'border-red-300' : 'border-gray-300'}`} />
                {errors.endTime && <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>}
              </div>
            </div>
            {calculatedHours > 0 && <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                <div className="flex items-center">
                  <Info className="w-5 h-5 text-blue-500 mr-2" />
                  <div>
                    <p className="text-gray-700">
                      {mode === 'work' ? <>
                          You will accrue{' '}
                          <span className="font-medium">
                            {calculatedHours.toFixed(1)} hours
                          </span>{' '}
                          of TIL
                          <span className="text-sm text-gray-500 block mt-1">
                            ({(calculatedHours / accrualRatio).toFixed(1)} hours
                            × {accrualRatio} accrual ratio)
                          </span>
                        </> : <>
                          This will use{' '}
                          <span className="font-medium">
                            {calculatedHours.toFixed(1)} hours
                          </span>{' '}
                          of your TIL balance
                          <span className="text-sm text-gray-500 block mt-1">
                            ({(calculatedHours / usageRatio).toFixed(1)} hours ×{' '}
                            {usageRatio} usage ratio)
                          </span>
                        </>}
                    </p>
                  </div>
                </div>
              </div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason
              </label>
              <input type="text" value={formData.reason} onChange={e => setFormData(prev => ({
              ...prev,
              reason: e.target.value
            }))} placeholder={mode === 'work' ? 'e.g., Late meeting with client' : 'e.g., Personal appointment'} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.reason ? 'border-red-300' : 'border-gray-300'}`} />
              {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Details
              </label>
              <textarea value={formData.details} onChange={e => setFormData(prev => ({
              ...prev,
              details: e.target.value
            }))} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Add any additional information..." />
            </div>
            {errors.submit && <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  {errors.submit}
                </div>
              </div>}
            <div className="flex justify-end">
              <button type="submit" disabled={isSubmitting} className={`px-4 py-2 rounded-md text-white font-medium ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {isSubmitting ? 'Submitting...' : mode === 'work' ? 'Submit Work TIL' : 'Submit TIL Leave'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>;
}