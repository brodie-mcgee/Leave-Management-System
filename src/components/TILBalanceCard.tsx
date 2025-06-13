import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLeave } from '../context/LeaveContext';
export function TILBalanceCard() {
  const {
    user
  } = useAuth();
  const {
    getTilBalance,
    globalTilSettings
  } = useLeave();
  const tilBalance = getTilBalance(user.id);
  // Calculate the next expiry date from accrual history
  const calculateNextExpiry = () => {
    if (!tilBalance?.accrualHistory?.length) {
      // If no accrual history but has balance, set expiry based on current date
      if (tilBalance?.balance > 0) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + globalTilSettings.expiryDays);
        return {
          date: expiryDate,
          hours: tilBalance.balance
        };
      }
      return null;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDates = tilBalance.accrualHistory.map(entry => {
      const accrualDate = new Date(entry.date);
      const expiryDate = new Date(accrualDate);
      expiryDate.setDate(expiryDate.getDate() + globalTilSettings.expiryDays);
      return {
        date: expiryDate,
        hours: entry.hours
      };
    });
    // Sort by date ascending and get the earliest expiry
    const sortedExpiries = expiryDates.sort((a, b) => a.date - b.date);
    return sortedExpiries[0] || null;
  };
  const nextExpiry = calculateNextExpiry();
  const isExpired = nextExpiry?.date && new Date() > nextExpiry.date;
  if (!user.tilSettings?.enabled) {
    return null;
  }
  return <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-blue-500 p-4 text-white">
        <h3 className="font-bold">Time in Lieu</h3>
        <p className="text-sm opacity-90">Available Balance</p>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Current Balance:</span>
          <div className="text-right">
            <span className="text-xl font-bold">
              {(tilBalance?.balance || 0).toFixed(1)}
            </span>
            <span className="text-gray-500 ml-1">hours</span>
          </div>
        </div>
        {tilBalance?.pendingAccrual > 0 && <div className="mb-4 p-3 bg-blue-50 rounded-md text-sm">
            <div className="flex items-center text-blue-700">
              <Clock className="w-4 h-4 mr-2" />
              <span>Pending Approval:</span>
              <span className="ml-auto font-medium">
                {tilBalance.pendingAccrual.toFixed(1)} hours
              </span>
            </div>
          </div>}
        {/* Show warning if there's any balance or pending accrual */}
        {(tilBalance?.balance > 0 || tilBalance?.pendingAccrual > 0) && <div className={`p-3 rounded-md text-sm ${isExpired ? 'bg-red-50' : 'bg-amber-50'}`}>
            <div className={`flex items-start ${isExpired ? 'text-red-700' : 'text-amber-700'}`}>
              <AlertTriangle className="w-4 h-4 mr-2 mt-0.5" />
              <div>
                <p className="font-medium">
                  {isExpired ? 'Action Required' : 'Usage Policy'}
                </p>
                <p className="mt-1">
                  {nextExpiry ? isExpired ? <span className="font-medium">
                        {nextExpiry.hours.toFixed(1)} hours of TIL should have
                        been taken by {nextExpiry.date.toLocaleDateString()}.
                        Please arrange to take this leave as soon as possible.
                      </span> : <>
                        {nextExpiry.hours.toFixed(1)} hours should be taken by{' '}
                        {nextExpiry.date.toLocaleDateString()} to comply with
                        college policy.
                      </> : <>
                      College policy requires TIL hours to be taken within{' '}
                      {globalTilSettings.expiryDays} days of being accrued
                    </>}
                </p>
              </div>
            </div>
          </div>}
      </div>
    </div>;
}