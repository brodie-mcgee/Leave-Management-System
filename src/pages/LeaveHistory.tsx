import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Download, CalendarPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLeave } from '../context/LeaveContext';
import { LeaveApplicationStatus } from '../components/LeaveApplicationStatus';
import { AttachmentUploader } from '../components/AttachmentUploader';
function LeaveHistoryContent() {
  const {
    user
  } = useAuth();
  const {
    getUserLeaveApplications,
    addAttachment
  } = useLeave();
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const allApplications = getUserLeaveApplications();
  // Filter applications based on selected filter
  const filteredApplications = allApplications.filter(app => {
    if (filter === 'all') return true;
    if (filter === 'pending') return app.status === 'pending';
    if (filter === 'approved') return app.status === 'approved';
    if (filter === 'rejected') return app.status === 'rejected';
    if (filter === 'withdrawn') return app.status === 'withdrawn';
    return true;
  });
  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  const toggleExpand = id => {
    setExpandedId(expandedId === id ? null : id);
  };
  const handleUpload = (applicationId, url) => {
    addAttachment(applicationId, url);
    setUploadingId(null);
  };
  const startUpload = applicationId => {
    setUploadingId(applicationId);
  };
  return <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Leave History</h1>
        <Link to="/apply" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
          <CalendarPlus className="w-4 h-4 mr-2" />
          Apply for Leave
        </Link>
      </div>
      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-md text-sm font-medium ${filter === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            All
          </button>
          <button onClick={() => setFilter('pending')} className={`px-3 py-1.5 rounded-md text-sm font-medium ${filter === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            Pending
          </button>
          <button onClick={() => setFilter('approved')} className={`px-3 py-1.5 rounded-md text-sm font-medium ${filter === 'approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            Approved
          </button>
          <button onClick={() => setFilter('rejected')} className={`px-3 py-1.5 rounded-md text-sm font-medium ${filter === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            Rejected
          </button>
          <button onClick={() => setFilter('withdrawn')} className={`px-3 py-1.5 rounded-md text-sm font-medium ${filter === 'withdrawn' ? 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            Withdrawn
          </button>
        </div>
      </div>
      {/* Applications List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredApplications.length > 0 ? <div>
            {filteredApplications.map(application => <div key={application.id} className="border-b last:border-0">
                <div className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => toggleExpand(application.id)}>
                  <div className="flex flex-wrap justify-between items-center">
                    <div className="mb-2 md:mb-0">
                      <h3 className="font-medium text-gray-900">
                        {application.leaveType.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(application.startDate)}
                        {application.startDate !== application.endDate && ` - ${formatDate(application.endDate)}`}
                        <span className="mx-2">•</span>
                        {application.totalDays}{' '}
                        {application.totalDays === 1 ? 'day' : 'days'}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <LeaveApplicationStatus status={application.status} />
                      <span className="ml-3 text-gray-400">
                        {expandedId === application.id ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>
                </div>
                {expandedId === application.id && <div className="p-4 bg-gray-50 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">
                          Submitted On
                        </h4>
                        <p>{formatDate(application.createdDate)}</p>
                      </div>
                      {application.status === 'approved' && <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">
                            Approved On
                          </h4>
                          <p>{formatDate(application.approvedDate)}</p>
                        </div>}
                    </div>
                    {application.notes && <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500 mb-1">
                          Notes
                        </h4>
                        <p className="text-gray-700">{application.notes}</p>
                      </div>}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Supporting Document
                      </h4>
                      {application.attachmentUrl ? <div className="flex items-center">
                          <FileText className="text-blue-500 w-5 h-5 mr-2" />
                          <a href={application.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex-1 truncate">
                            {application.attachmentUrl.split('/').pop()}
                          </a>
                          <a href={application.attachmentUrl} download className="ml-2 p-1 text-gray-500 hover:text-gray-700">
                            <Download className="w-4 h-4" />
                          </a>
                        </div> : uploadingId === application.id ? <div>
                          <AttachmentUploader onUpload={url => handleUpload(application.id, url)} />
                        </div> : <div className="flex items-center">
                          <p className="text-gray-500 mr-3">
                            No document attached
                          </p>
                          <button onClick={e => {
                  e.stopPropagation();
                  startUpload(application.id);
                }} className="text-blue-600 hover:underline text-sm">
                            Add Document
                          </button>
                        </div>}
                    </div>
                    {application.status === 'approved' && <div className="text-sm text-gray-500">
                        This leave has been approved and {application.totalDays}{' '}
                        {application.totalDays === 1 ? 'day has' : 'days have'}{' '}
                        been deducted from your balance.
                      </div>}
                    {application.status === 'pending' && <div className="text-sm text-gray-500">
                        This leave application is awaiting approval.
                      </div>}
                  </div>}
              </div>)}
          </div> : <div className="p-6 text-center">
            <p className="text-gray-500 mb-4">
              No leave applications found with the selected filter.
            </p>
            <Link to="/apply" className="inline-flex items-center text-blue-600 hover:underline">
              <CalendarPlus className="w-4 h-4 mr-1" />
              Apply for Leave
            </Link>
          </div>}
      </div>
    </div>;
}
export function LeaveHistory() {
  return <LeaveHistoryContent />;
}