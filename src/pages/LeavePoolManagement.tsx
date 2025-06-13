import React, { useState } from 'react';
import { Plus, Edit, Trash, Check, X } from 'lucide-react';
import { LeaveProvider, useLeave } from '../context/LeaveContext';
function LeavePoolForm({
  pool,
  onSave,
  onCancel
}) {
  const [formData, setFormData] = useState({
    name: pool?.name || '',
    accrualType: pool?.accrualType || 'incremental',
    accrualRate: pool?.accrualRate || 0.76923,
    accrualPeriod: pool?.accrualPeriod || 'week',
    annualAllocation: pool?.annualAllocation || 15,
    resetDate: pool?.resetDate || 'January 1',
    rollover: pool?.rollover ?? true,
    availableFor: {
      employmentTypes: pool?.availableFor?.employmentTypes || ['all'],
      categories: pool?.availableFor?.categories || ['A', 'B', 'C']
    }
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
          Pool Name
        </label>
        <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Personal/Carer's Leave Pool" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="accrualType">
          Accrual Method
        </label>
        <select id="accrualType" name="accrualType" value={formData.accrualType} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="incremental">Incremental (accrued over time)</option>
          <option value="bulk">Bulk (allocated annually)</option>
        </select>
      </div>
      {formData.accrualType === 'incremental' ? <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="accrualRate">
              Accrual Rate (days per period)
            </label>
            <input id="accrualRate" name="accrualRate" type="number" step="0.00001" min="0" required value={formData.accrualRate} onChange={handleNumberChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
        </div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>}
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
      </div>
      <div className="flex items-center">
        <input id="rollover" name="rollover" type="checkbox" checked={formData.rollover} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
        <label htmlFor="rollover" className="ml-2 text-sm text-gray-700">
          Allow unused leave to roll over to next period
        </label>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center">
          <X className="w-4 h-4 mr-2" />
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
          <Check className="w-4 h-4 mr-2" />
          {pool ? 'Update Leave Pool' : 'Add Leave Pool'}
        </button>
      </div>
    </form>;
}
function LeavePoolManagementContent() {
  const {
    leavePools,
    addLeavePool,
    updateLeavePool,
    deleteLeavePool
  } = useLeave();
  const [isAddingPool, setIsAddingPool] = useState(false);
  const [editingPoolId, setEditingPoolId] = useState(null);
  const handleDelete = id => {
    if (window.confirm('Are you sure you want to delete this leave pool?')) {
      deleteLeavePool(id);
    }
  };
  return <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Leave Pool Management
        </h1>
        <button onClick={() => setIsAddingPool(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add Leave Pool
        </button>
      </div>
      {isAddingPool && <div className="mb-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Add New Leave Pool
          </h2>
          <LeavePoolForm onSave={pool => {
        addLeavePool(pool);
        setIsAddingPool(false);
      }} onCancel={() => setIsAddingPool(false)} />
        </div>}
      <div className="grid grid-cols-1 gap-6">
        {leavePools.map(pool => <div key={pool.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {pool.name}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {pool.accrualType === 'incremental' ? `Accrues ${pool.accrualRate.toFixed(2)} days per ${pool.accrualPeriod}` : `${pool.annualAllocation} days allocated on ${pool.resetDate}`}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => setEditingPoolId(pool.id === editingPoolId ? null : pool.id)} className="p-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(pool.id)} className="p-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200">
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
                    {pool.availableFor.employmentTypes.includes('all') ? 'Available for all employees' : `Available for ${pool.availableFor.employmentTypes.join(', ')} employees`}
                  </p>
                  <p className="mt-1">
                    Categories: {pool.availableFor.categories.join(', ')}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Settings
                  </h3>
                  <p className="mt-1">
                    {pool.rollover ? 'Unused leave rolls over' : 'Unused leave expires'}
                  </p>
                  <p className="mt-1">Reset date: {pool.resetDate}</p>
                </div>
              </div>
              {editingPoolId === pool.id && <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    Edit Leave Pool
                  </h3>
                  <LeavePoolForm pool={pool} onSave={updates => {
              updateLeavePool(pool.id, updates);
              setEditingPoolId(null);
            }} onCancel={() => setEditingPoolId(null)} />
                </div>}
            </div>
          </div>)}
      </div>
    </div>;
}
export function LeavePoolManagement() {
  return <LeavePoolManagementContent />;
}