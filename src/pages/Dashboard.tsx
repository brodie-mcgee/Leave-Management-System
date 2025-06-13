import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LeaveProvider, useLeave } from '../context/LeaveContext';
import { LeaveBalanceCard } from '../components/LeaveBalanceCard';
import { LeaveApplicationStatus } from '../components/LeaveApplicationStatus';
import { TILBalanceCard } from '../components/TILBalanceCard';
function DashboardContent() {
  const {
    user
  } = useAuth();
  const {
    getUserLeaveBalances,
    getUserLeaveApplications,
    getPendingApplications,
    updateApplicationStatus,
    getTilBalance,
    globalTilSettings
  } = useLeave();
  const leaveBalances = getUserLeaveBalances();
  const recentApplications = getUserLeaveApplications().slice(0, 3);
  const pendingApprovals = user?.role === 'admin' || user?.role === 'manager' ? getPendingApplications().slice(0, 5) : [];
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
  return <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      {/* Leave Balances */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Your Leave Balances
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {user?.tilSettings?.enabled && <TILBalanceCard />}
          {leaveBalances.map(balance => <LeaveBalanceCard key={balance.leaveTypeId} leaveType={balance.leaveType} balance={balance.balance} />)}
        </div>
      </section>
      {/* Recent Applications */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">
            Recent Leave Applications
          </h2>
          <Link to="/history" className="text-blue-600 hover:underline text-sm flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            View All History
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {recentApplications.length > 0 ? <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
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
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentApplications.map(application => <tr key={application.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
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
                        <LeaveApplicationStatus status={application.status} />
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div> : <div className="p-6 text-center text-gray-500">
              <p>No recent leave applications</p>
              <Link to="/apply" className="mt-2 inline-flex items-center text-blue-600 hover:underline">
                <CalendarPlus className="w-4 h-4 mr-1" />
                Apply for Leave
              </Link>
            </div>}
        </div>
      </section>
      {/* Pending Approvals (for managers and admins) */}
      {(user?.role === 'manager' || user?.role === 'admin') && pendingApprovals.length > 0 && <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Pending Approvals
              {pendingApprovals.length > 0 && <span className="ml-2 px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">
                  {pendingApprovals.length}
                </span>}
            </h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
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
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingApprovals.map(application => <tr key={application.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {/* In a real app, you would look up the user's name */}
                            User #{application.userId}
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
                          <div className="flex space-x-2">
                            <button onClick={() => handleApprove(application.id)} className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 flex items-center text-sm">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approve
                            </button>
                            <button onClick={() => handleReject(application.id)} className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 flex items-center text-sm">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>)}
                  </tbody>
                </table>
              </div>
            </div>
          </section>}
      {/* Quick Actions */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/apply" className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <CalendarPlus className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Apply for Leave</h3>
              <p className="text-sm text-gray-500">
                Submit a new leave request
              </p>
            </div>
          </Link>
          <Link to="/history" className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center">
            <div className="p-3 bg-purple-100 rounded-full mr-4">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Leave History</h3>
              <p className="text-sm text-gray-500">View your leave history</p>
            </div>
          </Link>
          {user?.role === 'admin' && <Link to="/admin" className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center">
              <div className="p-3 bg-amber-100 rounded-full mr-4">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Admin Center</h3>
                <p className="text-sm text-gray-500">
                  Manage users and leave types
                </p>
              </div>
            </Link>}
        </div>
      </section>
    </div>;
}
export function Dashboard() {
  return <DashboardContent />;
}