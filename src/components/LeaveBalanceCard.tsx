import React from 'react';
export function LeaveBalanceCard({
  leaveType,
  balance,
  pool = null,
  className = ''
}) {
  // Determine background color based on leave type
  const getBgColor = () => {
    if (pool) return 'bg-purple-500';
    switch (leaveType?.name) {
      case 'Annual Leave':
        return 'bg-blue-500';
      case 'Personal Leave':
      case "Carer's Leave":
        return 'bg-green-500';
      case 'Flexi Leave':
        return 'bg-amber-500';
      default:
        return 'bg-gray-500';
    }
  };
  const renderRules = () => {
    if (!leaveType) return null;
    return <div className="mt-3 pt-3 border-t border-gray-200 space-y-1 text-sm">
        {leaveType.maxDaysPerYear && <div className="flex justify-between text-gray-600">
            <span>Yearly Limit:</span>
            <span className="font-medium">{leaveType.maxDaysPerYear} days</span>
          </div>}
        {leaveType.allowAdvanceBooking && <div className="flex justify-between text-gray-600">
            <span>Can book ahead:</span>
            <span className="font-medium">
              Up to {leaveType.maxAdvanceDays} days
            </span>
          </div>}
        {leaveType.allowRetrospective && <div className="flex justify-between text-gray-600">
            <span>Can book past:</span>
            <span className="font-medium">
              Up to {leaveType.maxRetrospectiveDays} days
            </span>
          </div>}
        {leaveType.requiresDocument && <div className="text-amber-600">
            * Requires supporting documentation
          </div>}
      </div>;
  };
  const renderBalance = () => {
    // Handle case where balance is undefined
    if (!balance) {
      return <div className="text-gray-500 italic">
          Balance information not available
        </div>;
    }
    // If this is a leave type with a yearly limit (like Flexi Leave)
    if (leaveType?.maxDaysPerYear) {
      const typeUsed = pool && balance.usageByType ? balance.usageByType[leaveType.id] || 0 : 0;
      const remainingYearlyLimit = leaveType.maxDaysPerYear - typeUsed;
      const poolBalance = pool ? balance.balance - Object.values(balance.usageByType || {}).reduce((sum, used) => sum + (used || 0), 0) : null;
      return <div>
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-md">
            <span className="text-blue-800 font-medium">Yearly Limit:</span>
            <span className="text-xl font-bold text-blue-800">
              {remainingYearlyLimit.toFixed(1)} days
            </span>
          </div>
          <div className="mt-3 text-sm text-gray-500">
            <div className="flex justify-between items-center mb-1">
              <span>Used this year:</span>
              <span>{typeUsed.toFixed(1)} days</span>
            </div>
            {poolBalance !== null && <div className="flex justify-between items-center text-gray-400 text-xs mt-2 pt-2 border-t border-gray-200">
                <span>Pool Balance Available:</span>
                <span>{poolBalance.toFixed(1)} days</span>
              </div>}
          </div>
          {renderRules()}
        </div>;
    }
    // Handle regular balance display
    return <div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Available Balance:</span>
          <span className="text-xl font-bold">
            {(balance.balance || 0).toFixed(1)} days
          </span>
        </div>
        {leaveType?.accrualType === 'incremental' && <div className="mt-2 text-sm text-gray-500">
            Accruing at {(leaveType.accrualRate || 0).toFixed(2)} days per{' '}
            {leaveType.accrualPeriod}
          </div>}
        {renderRules()}
      </div>;
  };
  return <div className={`rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className={`${getBgColor()} p-4 text-white`}>
        <h3 className="font-bold">{leaveType?.name}</h3>
        <p className="text-sm opacity-90">
          {pool ? `Shared leave pool - Resets on ${pool.resetDate}` : leaveType?.accrualType === 'incremental' ? 'Accrued incrementally' : 'Allocated annually'}
        </p>
      </div>
      <div className="bg-white p-4">{renderBalance()}</div>
    </div>;
}