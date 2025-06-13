import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Settings, FileText, AlertTriangle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLeave } from '../context/LeaveContext';
function AdminCenterContent() {
  const {
    getUsers
  } = useAuth();
  const {
    getPendingApplications,
    updateApplicationStatus,
    globalTilSettings,
    updateGlobalTilSettings
  } = useLeave();
  const users = getUsers();
  const pendingApplications = getPendingApplications();
  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  const handleApprove = applicationId => {
    updateApplicationStatus(applicationId, 'approved');
  };
  const handleReject = applicationId => {
    updateApplicationStatus(applicationId, 'rejected');
  };
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showTilSettings, setShowTilSettings] = useState(false);
  return <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Center</h1>
      {/* System Stats - Moved to top */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          System Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Total Users
            </h3>
            <p className="text-2xl font-bold">{users.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Pending Approvals
            </h3>
            <p className="text-2xl font-bold">{pendingApplications.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Leave Types
            </h3>
            <p className="text-2xl font-bold">4</p>
          </div>
        </div>
      </section>
      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/admin/users" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col items-center text-center">
          <div className="p-4 bg-blue-100 rounded-full mb-4">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            User Management
          </h2>
          <p className="text-gray-600">
            Add, edit, or remove users and manage their work schedules
          </p>
        </Link>
        <Link to="/admin/leave-types" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col items-center text-center">
          <div className="p-4 bg-green-100 rounded-full mb-4">
            <Settings className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Leave Types
          </h2>
          <p className="text-gray-600">
            Configure leave types, accrual rules, and eligibility
          </p>
        </Link>
        {/* Add TIL Settings Card */}
        <div onClick={() => setShowTilSettings(true)} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col items-center text-center cursor-pointer">
          <div className="p-4 bg-amber-100 rounded-full mb-4">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            TIL Settings
          </h2>
          <p className="text-gray-600">
            Configure global Time in Lieu settings
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
          <div className="p-4 bg-purple-100 rounded-full mb-4">
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Reports</h2>
          <p className="text-gray-600">
            Generate leave reports and export data
          </p>
          <span className="mt-3 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
            Coming Soon
          </span>
        </div>
      </div>
      {/* Pending Approvals */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Pending Approvals
          {pendingApplications.length > 0 && <span className="ml-2 px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">
              {pendingApplications.length}
            </span>}
        </h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {pendingApplications.length > 0 ? <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingApplications.map(application => {
                const user = users.find(u => u.id === application.userId) || {
                  name: `User #${application.userId}`
                };
                return <tr key={application.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {user.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {application.leaveType.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(application.startDate)}
                            {application.startDate !== application.endDate && ` - ${formatDate(application.endDate)}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {application.totalDays}{' '}
                            {application.totalDays === 1 ? 'day' : 'days'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(application.createdDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button onClick={() => handleApprove(application.id)} className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 text-sm">
                              Approve
                            </button>
                            <button onClick={() => handleReject(application.id)} className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 text-sm">
                              Reject
                            </button>
                            <button onClick={() => setSelectedApplication(application)} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 text-sm">
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>;
              })}
                </tbody>
              </table>
            </div> : <div className="p-6 text-center">
              <div className="inline-flex items-center justify-center p-4 bg-yellow-50 rounded-full mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
              </div>
              <p className="text-gray-500">
                No pending leave applications to approve
              </p>
            </div>}
        </div>
      </section>
      {/* Leave Application Details Modal */}
      {selectedApplication && <LeaveApplicationDetails application={selectedApplication} onClose={() => setSelectedApplication(null)} />}
      {/* TIL Settings Modal */}
      {showTilSettings && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Global TIL Settings
              </h2>
              <form onSubmit={e => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const settings = {
              accrualRatio: parseFloat(formData.get('accrualRatio')),
              usageRatio: parseFloat(formData.get('usageRatio')),
              expiryDays: parseInt(formData.get('expiryDays'))
            };
            updateGlobalTilSettings(settings);
            setShowTilSettings(false);
          }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Accrual Ratio
                    </label>
                    <input type="number" name="accrualRatio" step="0.1" min="0" defaultValue={globalTilSettings.accrualRatio} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    <p className="mt-1 text-sm text-gray-500">
                      Hours earned per hour worked (e.g., 1.5 = time and a half)
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Usage Ratio
                    </label>
                    <input type="number" name="usageRatio" step="0.1" min="0" defaultValue={globalTilSettings.usageRatio} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    <p className="mt-1 text-sm text-gray-500">
                      Hours deducted per hour taken
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Days
                    </label>
                    <input type="number" name="expiryDays" min="0" defaultValue={globalTilSettings.expiryDays} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    <p className="mt-1 text-sm text-gray-500">
                      Number of days before TIL hours expire
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowTilSettings(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>}
    </div>;
}
export function AdminCenter() {
  return <AdminCenterContent />;
}