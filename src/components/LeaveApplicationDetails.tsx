import React from 'react';
import { X, FileText, Calendar, User, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLeave } from '../context/LeaveContext';
export function LeaveApplicationDetails({
  application,
  onClose
}) {
  const {
    getUsers
  } = useAuth();
  const {
    getUserLeaveBalances
  } = useLeave();
  const user = getUsers().find(u => u.id === application.userId);
  const userBalances = getUserLeaveBalances(application.userId);
  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Leave Application Details
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* User Information */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center mb-3">
              <User className="w-5 h-5 text-gray-500 mr-2" />
              <h3 className="font-medium text-gray-900">{user?.name}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Role</p>
                <p className="font-medium capitalize">{user?.role}</p>
              </div>
              <div>
                <p className="text-gray-500">Category</p>
                <p className="font-medium">{user?.category}</p>
              </div>
            </div>
          </div>
          {/* Leave Details */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-gray-500" />
              Leave Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Leave Type</p>
                <p className="font-medium">{application.leaveType.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Duration</p>
                <p className="font-medium">{application.totalDays} days</p>
              </div>
              <div>
                <p className="text-gray-500">Start Date</p>
                <p className="font-medium">
                  {formatDate(application.startDate)}
                </p>
              </div>
              <div>
                <p className="text-gray-500">End Date</p>
                <p className="font-medium">{formatDate(application.endDate)}</p>
              </div>
            </div>
          </div>
          {/* Documents */}
          {application.attachmentUrl && <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-500" />
                Supporting Documents
              </h3>
              <a href={application.attachmentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <FileText className="w-4 h-4 mr-2" />
                View Document
              </a>
            </div>}
          {/* Leave Balances */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-gray-500" />
              Current Leave Balances
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {userBalances.map(balance => <div key={balance.leaveTypeId || balance.poolId} className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm font-medium">
                    {balance.leaveType?.name || balance.pool?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Available: {balance.balance.toFixed(1)} days
                  </p>
                </div>)}
            </div>
          </div>
        </div>
      </div>
    </div>;
}