import React from 'react';
import { useLeave } from '../context/LeaveContext';
export function LeavePoolBalance({
  leavePool,
  selectedLeaveType
}) {
  const {
    leavePools,
    getUserLeaveBalances
  } = useLeave();
  const poolBalance = getUserLeaveBalances()?.find(b => b?.poolId === leavePool) || null;
  const pool = leavePools?.find(p => p?.id === leavePool) || null;
  if (!poolBalance || !pool) {
    return <p className="text-blue-800 font-medium">No pool balance available</p>;
  }
  // Calculate total pool usage
  const totalPoolUsed = Object.values(poolBalance?.usageByType || {}).reduce((sum, used) => sum + (used || 0), 0);
  const totalPoolAvailable = (poolBalance?.balance || 0) - totalPoolUsed;
  // Calculate type-specific availability
  const typeUsed = poolBalance.usageByType?.[selectedLeaveType.id] || 0;
  const typeYearlyLimit = selectedLeaveType.maxDaysPerYear || Infinity;
  const typeRemainingLimit = Math.max(0, typeYearlyLimit - typeUsed);
  // Available balance is the minimum between pool balance and type limit
  const actualAvailableBalance = Math.min(totalPoolAvailable, typeRemainingLimit);
  return <>
      <p className="text-blue-800 font-medium">
        Available Balance: {actualAvailableBalance.toFixed(1)} days
      </p>
      {selectedLeaveType.maxDaysPerYear && <p className="text-sm text-blue-600 mt-1">
          Yearly Limit: {typeUsed.toFixed(1)} of {typeYearlyLimit} days used
        </p>}
      <p className="text-xs text-gray-500 mt-1">
        From {pool?.name || 'Leave Pool'} (Total:{' '}
        {totalPoolAvailable.toFixed(1)} days)
      </p>
    </>;
}