import React, { useState } from 'react';
import { useLeave } from '../context/LeaveContext';
import { Settings, Plus, Edit, Trash, Check, X } from 'lucide-react';
function LeaveTypeManagementContent() {
  const {
    leaveTypes,
    addLeaveType,
    updateLeaveType,
    deleteLeaveType
  } = useLeave();
  const [isAddingType, setIsAddingType] = useState(false);
  const [editingTypeId, setEditingTypeId] = useState(null);
  const [error, setError] = useState(null);
  const handleDelete = async id => {
    if (window.confirm('Are you sure you want to delete this leave type?')) {
      try {
        const success = deleteLeaveType(id);
        if (!success) {
          setError('You do not have permission to delete leave types');
        }
      } catch (err) {
        setError(err.message);
      }
    }
  };
  return <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Leave Type Management
        </h1>
        <button onClick={() => setIsAddingType(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add Leave Type
        </button>
      </div>
      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>}
      {isAddingType && <div className="mb-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Add New Leave Type
          </h2>
          <LeaveTypeForm onSave={leaveType => {
        addLeaveType(leaveType);
        setIsAddingType(false);
      }} onCancel={() => setIsAddingType(false)} />
        </div>}
      <div className="grid grid-cols-1 gap-6">
        {leaveTypes.map(leaveType => <div key={leaveType.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {leaveType.name}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {leaveType.accrualType === 'incremental' ? `Accrues ${leaveType.accrualRate.toFixed(2)} days per ${leaveType.accrualPeriod}` : `${leaveType.annualAllocation} days allocated on ${leaveType.resetDate}`}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => setEditingTypeId(leaveType.id === editingTypeId ? null : leaveType.id)} className="p-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(leaveType.id)} className="p-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200">
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Availability
                  </h3>
                  <p className="mt-1">
                    {leaveType.availableFor.employmentTypes.includes('all') ? 'Available for all employees' : `Available for ${leaveType.availableFor.employmentTypes.join(', ')} employees`}
                  </p>
                  <p className="mt-1">
                    Categories: {leaveType.availableFor.categories.join(', ')}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Requirements
                  </h3>
                  <div className="mt-1 space-y-1">
                    <p>
                      {leaveType.requiresApproval ? 'Requires approval' : 'No approval required'}
                    </p>
                    <p>
                      {leaveType.requiresDocument ? 'Supporting document required' : 'No supporting document required'}
                    </p>
                    <p>
                      {leaveType.managerNotification ? 'Manager notification enabled' : 'No manager notification'}
                    </p>
                  </div>
                </div>
              </div>
              {leaveType.minimumServiceYears && <div className="p-3 bg-amber-50 border border-amber-100 rounded-md text-amber-800 text-sm">
                  Requires minimum {leaveType.minimumServiceYears} years of
                  service
                </div>}
              {editingTypeId === leaveType.id && <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    Edit Leave Type
                  </h3>
                  <LeaveTypeForm leaveType={leaveType} onSave={updates => {
              updateLeaveType(leaveType.id, updates);
              setEditingTypeId(null);
            }} onCancel={() => setEditingTypeId(null)} />
                </div>}
            </div>
          </div>)}
      </div>
    </div>;
}
function LeaveTypeForm({
  leaveType,
  onSave,
  onCancel
}) {
  const {
    leavePools
  } = useLeave();
  const [formData, setFormData] = useState({
    name: leaveType?.name || '',
    accrualType: leaveType?.accrualType || 'incremental',
    accrualRate: leaveType?.accrualRate || 0.76923,
    accrualPeriod: leaveType?.accrualPeriod || 'week',
    annualAllocation: leaveType?.annualAllocation || 15,
    resetDate: leaveType?.resetDate || 'January 1',
    availableFor: {
      employmentTypes: leaveType?.availableFor?.employmentTypes || ['all'],
      categories: leaveType?.availableFor?.categories || ['A', 'B', 'C']
    },
    minimumServiceYears: leaveType?.minimumServiceYears || 0,
    requiresApproval: leaveType?.requiresApproval !== false,
    requiresDocument: leaveType?.requiresDocument || false,
    managerNotification: leaveType?.managerNotification || false,
    leavePool: leaveType?.leavePool || null,
    maxDaysWithoutEvidence: leaveType?.maxDaysWithoutEvidence || null,
    maxDaysPerYear: leaveType?.maxDaysPerYear || null,
    rollover: leaveType?.rollover ?? true,
    allowPartialDays: leaveType?.allowPartialDays || false,
    minimumHours: leaveType?.minimumHours || 4,
    allowAdvanceBooking: leaveType?.allowAdvanceBooking ?? true,
    allowRetrospective: leaveType?.allowRetrospective ?? false,
    maxAdvanceDays: leaveType?.maxAdvanceDays || 90,
    maxRetrospectiveDays: leaveType?.maxRetrospectiveDays || 7
  });
  const handleChange = e => {
    const {
      name,
      value,
      type,
      checked
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  const handleNumberChange = e => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };
  const handleAvailabilityChange = value => {
    let newAvailability;
    if (value === 'all') {
      newAvailability = ['all'];
    } else if (formData.availableFor.includes('all')) {
      newAvailability = [value];
    } else if (formData.availableFor.includes(value)) {
      newAvailability = formData.availableFor.filter(v => v !== value);
      if (newAvailability.length === 0) {
        newAvailability = ['all'];
      }
    } else {
      newAvailability = [...formData.availableFor, value];
    }
    setFormData(prev => ({
      ...prev,
      availableFor: newAvailability
    }));
  };
  const handleEmploymentTypeChange = type => {
    let newTypes;
    if (type === 'all') {
      newTypes = ['all'];
    } else if (formData.availableFor.employmentTypes.includes('all')) {
      newTypes = [type];
    } else {
      newTypes = formData.availableFor.employmentTypes.includes(type) ? formData.availableFor.employmentTypes.filter(t => t !== type) : [...formData.availableFor.employmentTypes, type];
      if (newTypes.length === 0) {
        newTypes = ['all'];
      }
    }
    setFormData(prev => ({
      ...prev,
      availableFor: {
        ...prev.availableFor,
        employmentTypes: newTypes
      }
    }));
  };
  const handleCategoryChange = category => {
    setFormData(prev => ({
      ...prev,
      availableFor: {
        ...prev.availableFor,
        categories: prev.availableFor.categories.includes(category) ? prev.availableFor.categories.filter(c => c !== category) : [...prev.availableFor.categories, category]
      }
    }));
  };
  const handleSubmit = e => {
    e.preventDefault();
    onSave(formData);
  };
  return <form onSubmit={handleSubmit} className="space-y-4">
      {/* Add Name Field at the top */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
          Leave Type Name *
        </label>
        <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Annual Leave" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Move Leave Pool Settings to top level */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="leavePool">
            Leave Pool Settings
          </label>
          <div className="p-4 border border-gray-200 rounded-md space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="leavePool">
                Assign to Leave Pool (Optional)
              </label>
              <select id="leavePool" name="leavePool" value={formData.leavePool || ''} onChange={e => handleChange({
              target: {
                name: 'leavePool',
                value: e.target.value ? parseInt(e.target.value) : null
              }
            })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Not part of a leave pool</option>
                {leavePools.map(pool => <option key={pool.id} value={pool.id}>
                    {pool.name}
                  </option>)}
              </select>
            </div>
            {formData.leavePool && <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="maxDaysWithoutEvidence">
                    Maximum Days Without Evidence
                  </label>
                  <input id="maxDaysWithoutEvidence" name="maxDaysWithoutEvidence" type="number" min="0" value={formData.maxDaysWithoutEvidence || ''} onChange={handleNumberChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="maxDaysPerYear">
                    Maximum Days Per Year
                  </label>
                  <input id="maxDaysPerYear" name="maxDaysPerYear" type="number" min="0" value={formData.maxDaysPerYear || ''} onChange={handleNumberChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </>}
          </div>
        </div>
        {/* Rest of the form fields */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="accrualType">
            Accrual Method
          </label>
          <select id="accrualType" name="accrualType" value={formData.accrualType} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="incremental">Incremental (accrued over time)</option>
            <option value="bulk">Bulk (allocated annually)</option>
          </select>
        </div>
        {formData.accrualType === 'incremental' ? <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="accrualRate">
                Accrual Rate (days per period)
              </label>
              <input id="accrualRate" name="accrualRate" type="number" step="0.00001" min="0" required value={formData.accrualRate} onChange={handleNumberChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <p className="mt-1 text-xs text-gray-500">
                0.76923 ≈ 20 days per year if accrual period is weekly
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="accrualPeriod">
                Accrual Period
              </label>
              <select id="accrualPeriod" name="accrualPeriod" value={formData.accrualPeriod} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="fortnight">Fortnightly</option>
                <option value="month">Monthly</option>
              </select>
            </div>
          </> : <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="annualAllocation">
                Annual Allocation (days)
              </label>
              <input id="annualAllocation" name="annualAllocation" type="number" step="0.5" min="0" required value={formData.annualAllocation} onChange={handleNumberChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="resetDate">
                Reset Date
              </label>
              <input id="resetDate" name="resetDate" type="text" required value={formData.resetDate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., January 1" />
            </div>
          </>}
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available for Employment Types
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => handleEmploymentTypeChange('all')} className={`px-3 py-1.5 rounded-md text-sm ${formData.availableFor.employmentTypes.includes('all') ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'}`}>
              All Types
            </button>
            {['full-time', 'part-time', 'casual'].map(type => <button key={type} type="button" onClick={() => handleEmploymentTypeChange(type)} disabled={formData.availableFor.employmentTypes.includes('all')} className={`px-3 py-1.5 rounded-md text-sm ${formData.availableFor.employmentTypes.includes(type) && !formData.availableFor.employmentTypes.includes('all') ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'}`}>
                {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </button>)}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available for Staff Categories
          </label>
          <div className="flex flex-wrap gap-2">
            {['A', 'B', 'C'].map(category => <button key={category} type="button" onClick={() => handleCategoryChange(category)} className={`px-3 py-1.5 rounded-md text-sm ${formData.availableFor.categories.includes(category) ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'}`}>
                Category {category}
              </button>)}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            At least one category must be selected
          </p>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="minimumServiceYears">
          Minimum Service Requirement (years)
        </label>
        <input id="minimumServiceYears" name="minimumServiceYears" type="number" min="0" value={formData.minimumServiceYears} onChange={handleNumberChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <p className="mt-1 text-xs text-gray-500">
          Set to 0 for no minimum service requirement
        </p>
      </div>
      <div className="space-y-3">
        <div className="flex items-center">
          <input id="requiresApproval" name="requiresApproval" type="checkbox" checked={formData.requiresApproval} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
          <label htmlFor="requiresApproval" className="ml-2 text-sm text-gray-700">
            Requires approval
          </label>
        </div>
        <div className="flex items-center">
          <input id="requiresDocument" name="requiresDocument" type="checkbox" checked={formData.requiresDocument} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
          <label htmlFor="requiresDocument" className="ml-2 text-sm text-gray-700">
            Requires supporting document
          </label>
        </div>
        <div className="flex items-center">
          <input id="managerNotification" name="managerNotification" type="checkbox" checked={formData.managerNotification} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
          <label htmlFor="managerNotification" className="ml-2 text-sm text-gray-700">
            Notify manager when leave is requested
          </label>
        </div>
      </div>
      <div className="flex items-center">
        <input id="rollover" name="rollover" type="checkbox" checked={formData.rollover} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
        <label htmlFor="rollover" className="ml-2 text-sm text-gray-700">
          Allow unused leave to roll over to next period
        </label>
      </div>
      <div className="md:col-span-2">
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          Leave Application Rules
        </h3>
        <div className="grid grid-cols-1 gap-4 p-4 border border-gray-200 rounded-md">
          {/* Application Timing Settings */}
          <div className="space-y-4">
            <div className="flex flex-col space-y-4">
              {/* Partial Day Setting */}
              <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-md">
                <input id="allowPartialDays" name="allowPartialDays" type="checkbox" checked={formData.allowPartialDays} onChange={handleChange} className="h-4 w-4 text-blue-600 rounded" />
                <div className="flex-1">
                  <label htmlFor="allowPartialDays" className="text-sm font-medium text-gray-700">
                    Allow Partial Days
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Enable this to allow employees to take partial day leave
                    based on their configured work hours
                  </p>
                </div>
              </div>
              {/* Advance Booking Setting */}
              <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-md">
                <input id="allowAdvanceBooking" name="allowAdvanceBooking" type="checkbox" checked={formData.allowAdvanceBooking} onChange={handleChange} className="h-4 w-4 text-blue-600 rounded" />
                <div className="flex-1">
                  <label htmlFor="allowAdvanceBooking" className="text-sm font-medium text-gray-700">
                    Allow Advance Booking
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Enable this to allow employees to book leave in advance
                  </p>
                </div>
              </div>
              {formData.allowAdvanceBooking && <div className="ml-6 p-3 bg-white border border-gray-200 rounded-md">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Days in Advance
                  </label>
                  <input name="maxAdvanceDays" type="number" min="1" value={formData.maxAdvanceDays} onChange={handleNumberChange} className="w-full px-3 py-2 border rounded-md" />
                  <p className="text-xs text-gray-500 mt-1">
                    How far in advance employees can book this type of leave
                  </p>
                </div>}
              {/* Retrospective Booking Setting */}
              <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-md">
                <input id="allowRetrospective" name="allowRetrospective" type="checkbox" checked={formData.allowRetrospective} onChange={handleChange} className="h-4 w-4 text-blue-600 rounded" />
                <div className="flex-1">
                  <label htmlFor="allowRetrospective" className="text-sm font-medium text-gray-700">
                    Allow Retrospective Booking
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Enable this to allow employees to book leave for past dates
                  </p>
                </div>
              </div>
              {formData.allowRetrospective && <div className="ml-6 p-3 bg-white border border-gray-200 rounded-md">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Days in Past
                  </label>
                  <input name="maxRetrospectiveDays" type="number" min="1" value={formData.maxRetrospectiveDays} onChange={handleNumberChange} className="w-full px-3 py-2 border rounded-md" />
                  <p className="text-xs text-gray-500 mt-1">
                    How far back employees can book this type of leave
                  </p>
                </div>}
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center">
          <X className="w-4 h-4 mr-2" />
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
          <Check className="w-4 h-4 mr-2" />
          {leaveType ? 'Update Leave Type' : 'Add Leave Type'}
        </button>
      </div>
    </form>;
}
export function LeaveTypeManagement() {
  return <LeaveTypeManagementContent />;
}