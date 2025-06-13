import React from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
export function LeaveApplicationStatus({
  status
}) {
  switch (status) {
    case 'approved':
      return <div className="flex items-center text-green-600">
          <CheckCircle className="w-4 h-4 mr-1" />
          <span>Approved</span>
        </div>;
    case 'pending':
      return <div className="flex items-center text-amber-600">
          <Clock className="w-4 h-4 mr-1" />
          <span>Pending</span>
        </div>;
    case 'rejected':
      return <div className="flex items-center text-red-600">
          <XCircle className="w-4 h-4 mr-1" />
          <span>Rejected</span>
        </div>;
    case 'withdrawn':
      return <div className="flex items-center text-gray-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          <span>Withdrawn</span>
        </div>;
    default:
      return <div className="flex items-center text-gray-600">
          <span>{status}</span>
        </div>;
  }
}