import React, { useState, Fragment } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLeave } from '../context/LeaveContext';
import { Users, UserPlus, Edit, Trash, Check, X, Clock, Plus, Minus } from 'lucide-react';
export function UserManagement() {
  const {
    getUsers
  } = useAuth();
  const {
    getUserLeaveBalances
  } = useLeave();
  const [users, setUsers] = useState(getUsers());
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [adjustingLeaveForUser, setAdjustingLeaveForUser] = useState(null);
  const [, forceUpdate] = useState({});
  // Force a re-render when leave balances are adjusted
  const handleLeaveBalanceAdjustmentComplete = () => {
    forceUpdate({});
    setAdjustingLeaveForUser(null);
  };
  return <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <button onClick={() => setIsAddingUser(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </button>
      </div>
      {isAddingUser && <UserForm onSave={addUser} onCancel={() => setIsAddingUser(false)} />}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Work Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => <Fragment key={user.id}>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {user.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : user.role === 'manager' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.workSchedule.type}
                        <span className="text-xs text-gray-500 block">
                          {Object.keys(user.workSchedule.workDays).join(', ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button onClick={() => setEditingUserId(user.id)} className="text-blue-600 hover:text-blue-800" title="Edit User">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button onClick={() => setAdjustingLeaveForUser(user)} className="text-green-600 hover:text-green-800" title="Adjust Leave Balance">
                          <Clock className="w-5 h-5" />
                        </button>
                        <button onClick={() => deleteUser(user.id)} className="text-red-600 hover:text-red-800" title="Delete User">
                          <Trash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {editingUserId === user.id && <tr>
                      <td colSpan={5} className="px-6 py-4 bg-gray-50">
                        <UserForm user={user} onSave={updates => updateUser(user.id, updates)} onCancel={() => setEditingUserId(null)} />
                      </td>
                    </tr>}
                </Fragment>)}
            </tbody>
          </table>
        </div>
      </div>
      {adjustingLeaveForUser && <LeaveBalanceAdjustmentForm user={adjustingLeaveForUser} onClose={() => setAdjustingLeaveForUser(null)} onSave={handleLeaveBalanceAdjustmentComplete} />}
    </div>;
}
function LeaveBalanceAdjustmentForm({
  user,
  onClose,
  onSave
}) {
  const {
    leaveTypes,
    leavePools,
    getUserLeaveBalances,
    adjustLeaveBalance
  } = useLeave();
  const currentBalances = getUserLeaveBalances(user.id);
  const [adjustments, setAdjustments] = useState({});
  const [reasons, setReasons] = useState({});
  // Group leave types by pool
  const groupedLeaveTypes = leaveTypes.reduce((acc, leaveType) => {
    if (leaveType.leavePool) {
      if (!acc.pooled[leaveType.leavePool]) {
        acc.pooled[leaveType.leavePool] = [];
      }
      acc.pooled[leaveType.leavePool].push(leaveType);
    } else {
      acc.independent.push(leaveType);
    }
    return acc;
  }, {
    pooled: {},
    independent: []
  });
  const handleAdjustmentChange = (id, value, isPool = false) => {
    setAdjustments(prev => ({
      ...prev,
      [isPool ? `pool_${id}` : `type_${id}`]: value
    }));
  };
  const handleReasonChange = (id, reason, isPool = false) => {
    setReasons(prev => ({
      ...prev,
      [isPool ? `pool_${id}` : `type_${id}`]: reason
    }));
  };
  const handleSubmit = e => {
    e.preventDefault();
    // Process pool adjustments
    Object.entries(adjustments).forEach(([key, adjustment]) => {
      if (adjustment && reasons[key]) {
        const [type, id] = key.split('_');
        adjustLeaveBalance(user.id, parseInt(id), parseFloat(adjustment), reasons[key], type === 'pool');
      }
    });
    onSave(); // Call onSave to trigger parent component update
    onClose();
  };
  const getPoolBalance = poolId => {
    return currentBalances.find(b => b.poolId === poolId);
  };
  const getLeaveTypeBalance = leaveTypeId => {
    return currentBalances.find(b => b.leaveTypeId === leaveTypeId);
  };
  return <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl my-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Adjust Leave Balances - {user.name}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Leave Pools Section */}
          {Object.entries(groupedLeaveTypes.pooled).map(([poolId, poolLeaveTypes]) => {
          const pool = leavePools.find(p => p.id === parseInt(poolId));
          const poolBalance = getPoolBalance(parseInt(poolId));
          if (!pool) return null;
          return <div key={`pool_${poolId}`} className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-purple-900">
                        {pool.name}
                      </h3>
                      <div className="text-sm text-purple-800">
                        Current Pool Balance:{' '}
                        {poolBalance?.balance?.toFixed(1) || '0'} days
                      </div>
                    </div>
                    {/* Pool Balance Adjustment */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pool Balance Adjustment (days)
                        </label>
                        <div className="flex items-center">
                          <button type="button" onClick={() => handleAdjustmentChange(pool.id, (parseFloat(adjustments[`pool_${pool.id}`] || 0) - 1).toString(), true)} className="p-1 bg-gray-100 text-gray-700 rounded-l-md border border-r-0 border-gray-300">
                            <Minus className="w-4 h-4" />
                          </button>
                          <input type="number" step="0.5" value={adjustments[`pool_${pool.id}`] || ''} onChange={e => handleAdjustmentChange(pool.id, e.target.value, true)} className="w-20 text-center border-y border-gray-300 py-1" placeholder="0" />
                          <button type="button" onClick={() => handleAdjustmentChange(pool.id, (parseFloat(adjustments[`pool_${pool.id}`] || 0) + 1).toString(), true)} className="p-1 bg-gray-100 text-gray-700 rounded-r-md border border-l-0 border-gray-300">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Reason for Pool Adjustment
                        </label>
                        <input type="text" value={reasons[`pool_${pool.id}`] || ''} onChange={e => handleReasonChange(pool.id, e.target.value, true)} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="e.g., Initial pool balance setup" required={!!adjustments[`pool_${pool.id}`]} />
                      </div>
                    </div>
                    {/* Pool Usage Breakdown */}
                    {poolBalance?.usageByType && Object.keys(poolBalance.usageByType).length > 0 && <div className="mt-2 p-3 bg-white rounded-md border border-purple-100">
                          <h4 className="text-sm font-medium text-purple-900 mb-2">
                            Current Pool Usage:
                          </h4>
                          <div className="space-y-1">
                            {Object.entries(poolBalance.usageByType).map(([typeId, used]) => {
                    const leaveType = leaveTypes.find(lt => lt.id === parseInt(typeId));
                    return <div key={typeId} className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                      {leaveType?.name || `Leave Type ${typeId}`}
                                      :
                                    </span>
                                    <span className="text-gray-700">
                                      {used.toFixed(1)} days used
                                    </span>
                                  </div>;
                  })}
                          </div>
                        </div>}
                  </div>
                  {/* Leave Types in Pool */}
                  <div className="mt-4 space-y-4">
                    <h4 className="text-sm font-medium text-purple-900">
                      Leave Types in this Pool:
                    </h4>
                    {poolLeaveTypes.map(leaveType => <div key={leaveType.id} className="pl-4 border-l-2 border-purple-200">
                        <div className="text-sm text-gray-600">
                          {leaveType.name}
                        </div>
                        {leaveType.maxDaysPerYear && <div className="text-xs text-gray-500">
                            Limit: {leaveType.maxDaysPerYear} days per year
                          </div>}
                      </div>)}
                  </div>
                </div>;
        })}
          {/* Independent Leave Types Section */}
          {groupedLeaveTypes.independent.length > 0 && <div className="space-y-4">
              <h3 className="font-medium text-gray-700">
                Independent Leave Types
              </h3>
              {groupedLeaveTypes.independent.map(leaveType => {
            const currentBalance = getLeaveTypeBalance(leaveType.id);
            return <div key={leaveType.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-700">
                        {leaveType.name}
                      </h3>
                      <div className="text-sm text-gray-500">
                        Current Balance:{' '}
                        {currentBalance?.balance?.toFixed(1) || '0'} days
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Adjustment (days)
                        </label>
                        <div className="flex items-center">
                          <button type="button" onClick={() => handleAdjustmentChange(leaveType.id, (parseFloat(adjustments[`type_${leaveType.id}`] || 0) - 1).toString())} className="p-1 bg-gray-100 text-gray-700 rounded-l-md border border-r-0 border-gray-300">
                            <Minus className="w-4 h-4" />
                          </button>
                          <input type="number" step="0.5" value={adjustments[`type_${leaveType.id}`] || ''} onChange={e => handleAdjustmentChange(leaveType.id, e.target.value)} className="w-20 text-center border-y border-gray-300 py-1" placeholder="0" />
                          <button type="button" onClick={() => handleAdjustmentChange(leaveType.id, (parseFloat(adjustments[`type_${leaveType.id}`] || 0) + 1).toString())} className="p-1 bg-gray-100 text-gray-700 rounded-r-md border border-l-0 border-gray-300">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Reason for Adjustment
                        </label>
                        <input type="text" value={reasons[`type_${leaveType.id}`] || ''} onChange={e => handleReasonChange(leaveType.id, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="e.g., Initial balance setup" required={!!adjustments[`type_${leaveType.id}`]} />
                      </div>
                    </div>
                  </div>;
          })}
            </div>}
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Save Adjustments
            </button>
          </div>
        </form>
      </div>
    </div>;
}
function UserForm({
  user,
  onSave,
  onCancel
}) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'employee',
    category: user?.category || 'A',
    workSchedule: {
      type: user?.workSchedule?.type || 'full-time',
      fte: user?.workSchedule?.fte || 1.0,
      workDays: user?.workSchedule?.workDays || {
        Monday: {
          hours: 7.6
        },
        Tuesday: {
          hours: 7.6
        },
        Wednesday: {
          hours: 7.6
        },
        Thursday: {
          hours: 7.6
        },
        Friday: {
          hours: 7.6
        }
      }
    }
  });
  const [tilSettings, setTilSettings] = useState({
    enabled: user?.tilSettings?.enabled || false,
    allowRetrospective: user?.tilSettings?.allowRetrospective || false
  });
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
  const handleWorkScheduleChange = e => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      workSchedule: {
        ...prev.workSchedule,
        [name]: value
      }
    }));
  };
  const handleWorkDaysChange = day => {
    const currentDays = [...formData.workSchedule.workDays];
    if (currentDays.includes(day)) {
      // Remove day if already selected
      const updatedDays = currentDays.filter(d => d !== day);
      setFormData(prev => ({
        ...prev,
        workSchedule: {
          ...prev.workSchedule,
          workDays: updatedDays
        }
      }));
    } else {
      // Add day if not selected
      const updatedDays = [...currentDays, day];
      setFormData(prev => ({
        ...prev,
        workSchedule: {
          ...prev.workSchedule,
          workDays: updatedDays
        }
      }));
    }
  };
  const handleWorkDayHoursChange = (day, hours) => {
    setFormData(prev => ({
      ...prev,
      workSchedule: {
        ...prev.workSchedule,
        workDays: {
          ...prev.workSchedule.workDays,
          [day]: {
            hours: parseFloat(hours) || 0
          }
        }
      }
    }));
  };
  const toggleWorkDay = day => {
    const updatedWorkDays = {
      ...formData.workSchedule.workDays
    };
    if (updatedWorkDays[day]) {
      delete updatedWorkDays[day];
    } else {
      updatedWorkDays[day] = {
        hours: formData.workSchedule.type === 'full-time' ? 7.6 : 4
      };
    }
    setFormData(prev => ({
      ...prev,
      workSchedule: {
        ...prev.workSchedule,
        workDays: updatedWorkDays
      }
    }));
  };
  const handleTilSettingChange = e => {
    const {
      name,
      value,
      type,
      checked
    } = e.target;
    setTilSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
    }));
  };
  const handleSubmit = e => {
    e.preventDefault();
    onSave({
      ...formData,
      tilSettings
    });
  };
  return <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
            Full Name
          </label>
          <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
            Email
          </label>
          <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="role">
            Role
          </label>
          <select id="role" name="role" value={formData.role} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category">
            Staff Category
          </label>
          <select id="category" name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="A">Category A</option>
            <option value="B">Category B</option>
            <option value="C">Category C</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="type">
            Work Schedule Type
          </label>
          <select id="type" name="type" value={formData.workSchedule.type} onChange={handleWorkScheduleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="casual">Casual</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fte">
            FTE (Full Time Equivalent)
          </label>
          <input id="fte" name="fte" type="number" min="0" max="1" step="0.1" value={formData.workSchedule.fte} onChange={e => handleWorkScheduleChange({
          target: {
            name: 'fte',
            value: parseFloat(e.target.value) || 0
          }
        })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <p className="mt-1 text-xs text-gray-500">
            1.0 = Full time, 0.5 = Half time
          </p>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Work Days & Hours
        </label>
        <div className="space-y-3">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => <div key={day} className="flex items-center space-x-4">
              <button type="button" onClick={() => toggleWorkDay(day)} className={`px-3 py-1.5 rounded-md text-sm w-32 ${formData.workSchedule.workDays[day] ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'}`}>
                {day}
              </button>
              {formData.workSchedule.workDays[day] && <div className="flex items-center space-x-2">
                  <input type="number" step="0.1" min="0" max="24" value={formData.workSchedule.workDays[day].hours} onChange={e => handleWorkDayHoursChange(day, e.target.value)} className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <span className="text-sm text-gray-500">hours</span>
                </div>}
            </div>)}
        </div>
      </div>
      <div className="border rounded-lg p-4 space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          Time in Lieu Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input type="checkbox" id="tilEnabled" name="enabled" checked={tilSettings.enabled} onChange={handleTilSettingChange} className="h-4 w-4 text-blue-600 rounded" />
            <label htmlFor="tilEnabled" className="ml-2 text-sm text-gray-700">
              Enable Time in Lieu for this user
            </label>
          </div>
          {tilSettings.enabled && <div className="flex items-center">
              <input type="checkbox" id="allowRetrospective" name="allowRetrospective" checked={tilSettings.allowRetrospective} onChange={handleTilSettingChange} className="h-4 w-4 text-blue-600 rounded" />
              <label htmlFor="allowRetrospective" className="ml-2 text-sm text-gray-700">
                Allow retrospective TIL requests
              </label>
            </div>}
        </div>
      </div>
      <div className="flex justify-end space-x-3">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center">
          <X className="w-4 h-4 mr-2" />
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
          <Check className="w-4 h-4 mr-2" />
          {user ? 'Update User' : 'Add User'}
        </button>
      </div>
    </form>;
}