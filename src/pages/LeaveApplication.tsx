import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLeave } from '../context/LeaveContext';
import { AttachmentUploader } from '../components/AttachmentUploader';
import { LeavePoolBalance } from '../components/LeavePoolBalance';
function LeaveApplicationForm() {
  const {
    user
  } = useAuth();
  const {
    getUserLeaveTypes,
    getUserLeaveBalances,
    submitLeaveApplication
  } = useLeave();
  const navigate = useNavigate();
  const leaveTypes = getUserLeaveTypes();
  const leaveBalances = getUserLeaveBalances();
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    notes: '',
    attachmentUrl: null,
    startTime: '',
    endTime: ''
  });
  const [errors, setErrors] = useState({});
  const [calculatedDays, setCalculatedDays] = useState(0);
  const [selectedLeaveType, setSelectedLeaveType] = useState(null);
  const [selectedBalance, setSelectedBalance] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dayType, setDayType] = useState('full'); // 'full' or 'partial'
  // Add isSingleDayRequest computed value
  const isSingleDayRequest = formData.startDate && formData.endDate && formData.startDate === formData.endDate;
  // Add handleChange function
  const handleChange = e => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  // Add handleAttachmentUpload function that was referenced but not defined
  const handleAttachmentUpload = url => {
    setFormData(prev => ({
      ...prev,
      attachmentUrl: url
    }));
  };
  // Update selected leave type and balance when leave type changes
  useEffect(() => {
    if (formData.leaveTypeId) {
      const leaveType = leaveTypes.find(lt => lt.id === parseInt(formData.leaveTypeId));
      setSelectedLeaveType(leaveType);
      const balance = leaveBalances.find(lb => lb.leaveTypeId === parseInt(formData.leaveTypeId));
      setSelectedBalance(balance);
    } else {
      setSelectedLeaveType(null);
      setSelectedBalance(null);
    }
  }, [formData.leaveTypeId, leaveTypes, leaveBalances]);
  // Update useEffect for date changes to handle full/partial days
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      // Check if dates are valid
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        setCalculatedDays(0);
        return;
      }
      // Check if end date is before start date
      if (end < start) {
        setCalculatedDays(0);
        return;
      }
      // Handle single day calculation
      if (isSingleDayRequest) {
        const dayName = start.toLocaleDateString('en-US', {
          weekday: 'long'
        });
        if (user.workSchedule.workDays[dayName]) {
          const fullDayHours = user.workSchedule.workDays[dayName].hours;
          // If it's a full day or no times are set, use full day hours
          if (dayType === 'full' || !formData.startTime || !formData.endTime) {
            setCalculatedDays(1);
            return;
          }
          // Calculate partial day
          const startTime = new Date(`2000-01-01T${formData.startTime}`);
          const endTime = new Date(`2000-01-01T${formData.endTime}`);
          const selectedHours = (endTime - startTime) / (1000 * 60 * 60);
          setCalculatedDays(selectedHours / fullDayHours);
        } else {
          setCalculatedDays(0);
        }
        return;
      }
      // Calculate business days for multi-day requests
      let days = 0;
      const currentDate = new Date(start);
      const workDays = Object.keys(user.workSchedule.workDays);
      while (currentDate <= end) {
        const dayOfWeek = currentDate.toLocaleDateString('en-US', {
          weekday: 'long'
        });
        if (workDays.includes(dayOfWeek)) {
          days++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      setCalculatedDays(days);
    } else {
      setCalculatedDays(0);
    }
  }, [formData.startDate, formData.endDate, formData.startTime, formData.endTime, user.workSchedule, dayType]);
  // Update validateForm to handle single vs multi-day validation
  const validateForm = () => {
    const newErrors = {};
    // Add console logging for debugging
    console.log('Validating form with data:', formData);
    console.log('Selected leave type:', selectedLeaveType);
    console.log('Selected balance:', selectedBalance);
    console.log('Calculated days:', calculatedDays);
    if (!formData.leaveTypeId) {
      newErrors.leaveTypeId = 'Please select a leave type';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Please select a start date';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'Please select an end date';
    }
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        newErrors.endDate = 'End date cannot be before start date';
      }
    }
    if (calculatedDays === 0) {
      newErrors.dates = "The selected dates don't include any of your work days";
    }
    if (selectedBalance && calculatedDays > selectedBalance.balance) {
      newErrors.balance = "You don't have enough leave balance for this request";
    }
    if (selectedLeaveType?.requiresDocument && !formData.attachmentUrl) {
      newErrors.attachment = 'This leave type requires supporting documentation';
    }
    // Add general form error display
    if (Object.keys(newErrors).length > 0) {
      newErrors.submit = 'Please correct the errors above before submitting';
    }
    setErrors(newErrors);
    console.log('Validation errors:', newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async e => {
    e.preventDefault();
    console.log('Submit button clicked');
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }
    setIsSubmitting(true);
    try {
      console.log('Submitting application with data:', {
        leaveTypeId: parseInt(formData.leaveTypeId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalDays: calculatedDays,
        notes: formData.notes,
        attachmentUrl: formData.attachmentUrl,
        ...(selectedLeaveType?.allowPartialDays && isSingleDayRequest && {
          times: {
            startTime: formData.startTime,
            endTime: formData.endTime
          }
        })
      });
      const success = await submitLeaveApplication({
        leaveTypeId: parseInt(formData.leaveTypeId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalDays: calculatedDays,
        notes: formData.notes,
        attachmentUrl: formData.attachmentUrl,
        ...(selectedLeaveType?.allowPartialDays && isSingleDayRequest && {
          times: {
            startTime: formData.startTime,
            endTime: formData.endTime
          }
        })
      });
      if (!success) {
        throw new Error('Failed to submit leave application');
      }
      setSuccess(true);
      // Increase timeout to make success message more visible
      setTimeout(() => {
        navigate('/history');
      }, 3000);
    } catch (error) {
      console.error('Error submitting application:', error);
      setErrors({
        submit: error.message || 'Failed to submit leave application'
      });
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
            Leave Application Submitted
          </h2>
          <p className="text-gray-600 mb-4">
            Your leave request has been submitted successfully and is pending
            approval.
          </p>
          <p className="text-sm text-gray-500">
            You will be redirected to your leave history...
          </p>
        </div>
      </div>;
  }
  return <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Apply for Leave</h1>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            {/* Leave Type Selection */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="leaveTypeId">
                Leave Type *
              </label>
              <select id="leaveTypeId" name="leaveTypeId" value={formData.leaveTypeId} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.leaveTypeId ? 'border-red-300' : 'border-gray-300'}`}>
                <option value="">Select a leave type</option>
                {leaveTypes.map(type => <option key={type.id} value={type.id}>
                    {type.name}
                  </option>)}
              </select>
              {errors.leaveTypeId && <p className="mt-1 text-sm text-red-600">
                  {errors.leaveTypeId}
                </p>}
            </div>
            {selectedLeaveType && <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-md">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
                  <div>
                    {selectedLeaveType.leavePool ? <LeavePoolBalance leavePool={selectedLeaveType.leavePool} selectedLeaveType={selectedLeaveType} /> : <>
                        <p className="text-blue-800 font-medium">
                          Available Balance:{' '}
                          {(selectedBalance?.balance || 0).toFixed(1)} days
                        </p>
                        <p className="text-sm text-blue-600 mt-1">
                          {selectedLeaveType.accrualType === 'incremental' ? `Accruing at ${(selectedLeaveType.accrualRate || 0).toFixed(2)} days per ${selectedLeaveType.accrualPeriod}` : `${selectedLeaveType.annualAllocation || 0} days allocated on ${selectedLeaveType.resetDate}`}
                        </p>
                      </>}
                  </div>
                </div>
              </div>}
            {/* Date Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="startDate">
                  Start Date *
                </label>
                <div className="relative">
                  <input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.startDate ? 'border-red-300' : 'border-gray-300'}`} />
                  <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                {errors.startDate && <p className="mt-1 text-sm text-red-600">
                    {errors.startDate}
                  </p>}
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="endDate">
                  End Date *
                </label>
                <div className="relative">
                  <input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.endDate ? 'border-red-300' : 'border-gray-300'}`} />
                  <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
              </div>
            </div>
            {/* Time Selection */}
            {selectedLeaveType?.allowPartialDays && isSingleDayRequest && <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Leave Duration Type
                </label>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                    <input type="radio" id="fullDay" name="dayType" value="full" checked={dayType === 'full'} onChange={e => {
                  setDayType(e.target.value);
                  setFormData(prev => ({
                    ...prev,
                    startTime: '',
                    endTime: ''
                  }));
                }} className="h-4 w-4 text-blue-600 border-gray-300" />
                    <label htmlFor="fullDay" className="flex-1">
                      <div className="text-sm font-medium text-gray-700">
                        Full Day
                      </div>
                      {formData.startDate && <div className="text-xs text-gray-500 mt-0.5">
                          {(() => {
                      const date = new Date(formData.startDate);
                      const dayName = date.toLocaleDateString('en-US', {
                        weekday: 'long'
                      });
                      const workDay = user.workSchedule.workDays[dayName];
                      return workDay ? `${workDay.hours} hours based on your work schedule` : 'Not a scheduled work day';
                    })()}
                        </div>}
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                    <input type="radio" id="partialDay" name="dayType" value="partial" checked={dayType === 'partial'} onChange={e => setDayType(e.target.value)} className="h-4 w-4 text-blue-600 border-gray-300" />
                    <label htmlFor="partialDay" className="flex-1">
                      <div className="text-sm font-medium text-gray-700">
                        Partial Day
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Select specific start and end times
                      </div>
                    </label>
                  </div>
                  {dayType === 'partial' && <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="startTime">
                          Start Time
                        </label>
                        <input id="startTime" name="startTime" type="time" value={formData.startTime} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.startTime ? 'border-red-300' : 'border-gray-300'}`} />
                        {errors.startTime && <p className="mt-1 text-sm text-red-600">
                            {errors.startTime}
                          </p>}
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="endTime">
                          End Time
                        </label>
                        <input id="endTime" name="endTime" type="time" value={formData.endTime} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.endTime ? 'border-red-300' : 'border-gray-300'}`} />
                        {errors.endTime && <p className="mt-1 text-sm text-red-600">
                            {errors.endTime}
                          </p>}
                      </div>
                    </div>}
                </div>
              </div>}
            {/* Calculated Days */}
            {formData.startDate && formData.endDate && calculatedDays > 0 && <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-gray-700">
                  <span className="font-medium">Leave Duration: </span>
                  {dayType === 'partial' && isSingleDayRequest ? <>
                      {(() => {
                  const startTime = new Date(`2000-01-01T${formData.startTime}`);
                  const endTime = new Date(`2000-01-01T${formData.endTime}`);
                  const hours = (endTime - startTime) / (1000 * 60 * 60);
                  return `${hours.toFixed(1)} hours`;
                })()}
                    </> : `${calculatedDays} ${calculatedDays === 1 ? 'day' : 'days'}`}
                </p>
                <div className="text-sm text-gray-500 mt-1">
                  Based on your {user.workSchedule.type} work schedule (
                  {Object.keys(user.workSchedule.workDays).join(', ')})
                </div>
              </div>}
            {errors.dates && <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                <div className="flex">
                  <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                  <p>{errors.dates}</p>
                </div>
              </div>}
            {errors.balance && <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                <div className="flex">
                  <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                  <p>{errors.balance}</p>
                </div>
              </div>}
            {/* Notes */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="notes">
                Notes
              </label>
              <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Add any additional information here..." />
            </div>
            {/* Document Upload */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Supporting Document
                {selectedLeaveType?.requiresDocument && <span className="text-red-500 ml-1">*</span>}
              </label>
              <AttachmentUploader onUpload={handleAttachmentUpload} />
              {errors.attachment && <p className="mt-1 text-sm text-red-600">{errors.attachment}</p>}
              {selectedLeaveType?.requiresDocument && <p className="mt-1 text-sm text-gray-500">
                  A supporting document is required for {selectedLeaveType.name}
                </p>}
            </div>
            {/* Submit Error - Move this above the submit button */}
            {errors.submit && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                <p className="font-medium">{errors.submit}</p>
                {Object.entries(errors).map(([key, value]) => key !== 'submit' ? <p key={key} className="text-sm mt-1">
                      • {value}
                    </p> : null)}
              </div>}
            {/* Submit Button */}
            <div className="flex justify-end">
              <button type="submit" disabled={isSubmitting} className={`px-4 py-2 rounded-md text-white font-medium ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`} onClick={handleSubmit} // Add onClick handler as backup
            >
                {isSubmitting ? 'Submitting...' : 'Submit Leave Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>;
}
export function LeaveApplication() {
  return <LeaveApplicationForm />;
}