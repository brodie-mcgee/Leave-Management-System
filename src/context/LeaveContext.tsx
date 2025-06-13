import React, { useEffect, useState, createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
// Mock leave types
const initialLeaveTypes = [{
  id: 1,
  name: 'Annual Leave',
  accrualType: 'incremental',
  accrualRate: 0.76923,
  accrualPeriod: 'week',
  useFullDayAllocation: false,
  availableFor: {
    employmentTypes: ['all'],
    categories: ['A', 'B', 'C']
  },
  requiresApproval: true,
  requiresDocument: false,
  managerNotification: true,
  leavePool: null,
  allowAdvanceBooking: true,
  allowRetrospective: false,
  maxAdvanceDays: 90
}, {
  id: 2,
  name: 'Personal Leave',
  accrualType: 'pool',
  leavePool: 1,
  maxDaysWithoutEvidence: 5,
  useFullDayAllocation: false,
  availableFor: {
    employmentTypes: ['all'],
    categories: ['A', 'B']
  },
  requiresApproval: true,
  requiresDocument: true,
  managerNotification: true,
  allowAdvanceBooking: false,
  allowRetrospective: true,
  maxRetrospectiveDays: 7
}, {
  id: 3,
  name: 'Flexi Leave',
  accrualType: 'pool',
  leavePool: 1,
  maxDaysPerYear: 1,
  useFullDayAllocation: true,
  availableFor: {
    employmentTypes: ['full-time', 'part-time'],
    categories: ['A']
  },
  requiresApproval: true,
  requiresDocument: false,
  managerNotification: false,
  allowAdvanceBooking: true,
  allowRetrospective: false,
  maxAdvanceDays: 30
}, {
  id: 4,
  name: "Carer's Leave",
  accrualType: 'pool',
  leavePool: 1,
  requiresDocument: true,
  availableFor: {
    employmentTypes: ['all'],
    categories: ['A', 'B']
  },
  requiresApproval: true,
  managerNotification: true,
  allowAdvanceBooking: false,
  allowRetrospective: true,
  maxRetrospectiveDays: 7
},
// Add TIL specific types
{
  id: 5,
  name: 'Time in Lieu',
  accrualType: 'til',
  requiresApproval: true,
  requiresDocument: false,
  managerNotification: true,
  allowAdvanceBooking: true,
  allowRetrospective: true,
  maxAdvanceDays: 90,
  maxRetrospectiveDays: 7,
  availableFor: {
    employmentTypes: ['all'],
    categories: ['A', 'B', 'C']
  }
}];
// Mock leave pools
const initialLeavePools = [{
  id: 1,
  name: "Personal/Carer's Leave Pool",
  annualAllocation: 15,
  rollover: true,
  resetDate: 'January 1',
  availableFor: {
    employmentTypes: ['all'],
    categories: ['A', 'B', 'C']
  }
}];
// Mock leave balances with pool tracking
const initialLeaveBalances = [{
  userId: 1,
  leaveTypeId: 1,
  balance: 15.5
}, {
  userId: 1,
  poolId: 1,
  balance: 15,
  usageByType: {
    2: 3,
    4: 2 // 2 days of Carer's Leave used
  }
}, {
  userId: 1,
  leaveTypeId: 2,
  balance: 15
}, {
  userId: 2,
  leaveTypeId: 1,
  balance: 12.3
}, {
  userId: 2,
  leaveTypeId: 2,
  balance: 15
}, {
  userId: 3,
  leaveTypeId: 1,
  balance: 25.7
}, {
  userId: 3,
  leaveTypeId: 2,
  balance: 15
}, {
  userId: 4,
  leaveTypeId: 1,
  balance: 18.2
}, {
  userId: 4,
  leaveTypeId: 2,
  balance: 15
}];
// Mock TIL balances
const initialTilBalances = [{
  userId: 1,
  balance: 0,
  pendingAccrual: 0,
  accrualHistory: [],
  usageHistory: []
}, {
  userId: 2,
  balance: 0,
  pendingAccrual: 0,
  accrualHistory: [],
  usageHistory: []
}, {
  userId: 3,
  balance: 0,
  pendingAccrual: 0,
  accrualHistory: [],
  usageHistory: []
}, {
  userId: 4,
  balance: 0,
  pendingAccrual: 0,
  accrualHistory: [],
  usageHistory: []
}];
// Mock leave applications
const initialLeaveApplications = [{
  id: 1,
  userId: 1,
  leaveTypeId: 1,
  startDate: '2023-07-10',
  endDate: '2023-07-14',
  totalDays: 5,
  status: 'approved',
  attachmentUrl: null,
  notes: 'Annual vacation',
  approvedBy: 3,
  approvedDate: '2023-06-15',
  createdDate: '2023-06-01'
}, {
  id: 2,
  userId: 1,
  leaveTypeId: 2,
  startDate: '2023-08-05',
  endDate: '2023-08-05',
  totalDays: 1,
  status: 'approved',
  attachmentUrl: 'https://example.com/medical-certificate-123.pdf',
  notes: 'Doctor appointment',
  approvedBy: 3,
  approvedDate: '2023-08-01',
  createdDate: '2023-07-25'
}, {
  id: 3,
  userId: 2,
  leaveTypeId: 1,
  startDate: '2023-09-18',
  endDate: '2023-09-22',
  totalDays: 3,
  status: 'pending',
  attachmentUrl: null,
  notes: 'Family vacation',
  approvedBy: null,
  approvedDate: null,
  createdDate: '2023-08-20'
}];
// Add error types
class LeaveManagementError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LeaveManagementError';
  }
}
// Add validation utilities
const validateLeaveType = (leaveType, existingTypes, existingPools) => {
  const errors = [];
  if (!leaveType.name) {
    errors.push('Leave type name is required');
  }
  if (leaveType.leavePool && !existingPools.find(p => p.id === leaveType.leavePool)) {
    errors.push('Referenced leave pool does not exist');
  }
  if (leaveType.accrualType === 'incremental' && (!leaveType.accrualRate || leaveType.accrualRate <= 0)) {
    errors.push('Invalid accrual rate');
  }
  return errors;
};
const validateLeavePool = (pool, existingTypes) => {
  const errors = [];
  if (!pool.name) {
    errors.push('Pool name is required');
  }
  if (pool.annualAllocation <= 0) {
    errors.push('Annual allocation must be greater than 0');
  }
  // Check if any leave types reference this pool
  const referencingTypes = existingTypes.filter(type => type.leavePool === pool.id);
  if (referencingTypes.length > 0) {
    errors.push(`Pool is in use by ${referencingTypes.length} leave type(s)`);
  }
  return errors;
};
// Create leave context
const LeaveContext = createContext(null);
export function LeaveProvider({
  children
}) {
  const auth = useAuth();
  const {
    user
  } = auth;
  // Get all users (for admin functions)
  const getUsers = () => {
    if (!auth || !auth.getUsers) {
      console.warn('Auth context or getUsers not available');
      return [];
    }
    return auth.getUsers();
  };
  const [leaveTypes, setLeaveTypes] = useState(initialLeaveTypes);
  const [leaveBalances, setLeaveBalances] = useState(initialLeaveBalances);
  const [leaveApplications, setLeaveApplications] = useState(initialLeaveApplications);
  const [leavePools, setLeavePools] = useState(initialLeavePools);
  const [tilBalances, setTilBalances] = useState(initialTilBalances);
  // Update globalTilSettings to be state and add update function
  const [globalTilSettings, setGlobalTilSettings] = useState({
    accrualRatio: 1.5,
    usageRatio: 1,
    expiryDays: 90
  });
  const updateGlobalTilSettings = settings => {
    if (user?.role !== 'admin') return false;
    setGlobalTilSettings(settings);
    return true;
  };
  // Get leave types available for the current user
  const getUserLeaveTypes = () => {
    if (!user) return [];
    return leaveTypes.filter(type => {
      // Check if leave type is available for employment type
      const availableForEmploymentType = type.availableFor.employmentTypes.includes('all') || type.availableFor.employmentTypes.includes(user.workSchedule.type);
      // Check if leave type is available for staff category
      const availableForCategory = type.availableFor.categories.includes(user.category);
      // Check minimum service requirement if applicable
      const meetsServiceRequirement = !type.minimumServiceYears || true;
      return availableForEmploymentType && availableForCategory && meetsServiceRequirement;
    });
  };
  // Calculate total hours for a date range based on work schedule
  const calculateLeaveHours = (startDate, endDate, workSchedule) => {
    let totalHours = 0;
    const currentDate = new Date(startDate);
    const endDateObj = new Date(endDate);
    while (currentDate <= endDateObj) {
      const dayName = currentDate.toLocaleDateString('en-US', {
        weekday: 'long'
      });
      if (workSchedule.workDays[dayName]) {
        totalHours += workSchedule.workDays[dayName].hours;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return totalHours;
  };
  // Get leave balances for a user
  const getUserLeaveBalances = (userId = user?.id) => {
    if (!userId) return [];
    const users = getUsers();
    const currentUser = users.find(u => u.id === userId);
    if (!currentUser) return [];
    const balances = leaveBalances.filter(balance => balance.userId === userId).map(balance => {
      if (balance.leaveTypeId) {
        // Regular leave type
        const leaveType = leaveTypes.find(type => type.id === balance.leaveTypeId);
        // Apply FTE adjustment if needed
        const adjustedBalance = leaveType?.useFullDayAllocation ? balance.balance : balance.balance * currentUser.workSchedule.fte;
        return {
          ...balance,
          leaveType,
          balance: adjustedBalance
        };
      } else if (balance.poolId) {
        // Leave pool
        const pool = leavePools.find(p => p.id === balance.poolId);
        const poolLeaveTypes = leaveTypes.filter(type => type.leavePool === pool.id);
        // Apply FTE adjustment to pool balance
        const adjustedBalance = balance.balance * currentUser.workSchedule.fte;
        return {
          ...balance,
          pool,
          leaveTypes: poolLeaveTypes,
          balance: adjustedBalance,
          usageByType: balance.usageByType
        };
      }
      return balance;
    });
    return balances;
  };
  // Get leave applications for a user
  const getUserLeaveApplications = (userId = user?.id) => {
    if (!userId) return [];
    return leaveApplications.filter(application => application.userId === userId).map(application => {
      const leaveType = leaveTypes.find(type => type.id === application.leaveTypeId);
      return {
        ...application,
        leaveType
      };
    }).sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
  };
  // Get pending applications (for managers/admins)
  const getPendingApplications = () => {
    if (!user || user.role !== 'manager' && user.role !== 'admin') return [];
    let applications = leaveApplications.filter(app => app.status === 'pending');
    // Managers only see applications from their team
    if (user.role === 'manager') {
      applications = applications.filter(app => user.manages.includes(app.userId));
    }
    const users = getUsers();
    return applications.map(application => {
      const leaveType = leaveTypes.find(type => type.id === application.leaveTypeId);
      return {
        ...application,
        leaveType
      };
    });
  };
  // Add new interfaces for time-based leave
  interface TimeRange {
    startTime?: string;
    endTime?: string;
  }
  interface LeaveApplication {
    leaveTypeId: number;
    startDate: string;
    endDate: string;
    totalDays: number;
    times?: TimeRange;
    notes?: string;
    attachmentUrl?: string;
  }
  // Update leave type interface
  interface LeaveType {
    id: number;
    name: string;
    allowAdvanceBooking: boolean;
    allowRetrospective: boolean;
    allowPartialDays: boolean;
    maxAdvanceDays?: number;
    maxRetrospectiveDays?: number;
    minimumHours?: number;
  }
  // Check if a leave application is valid
  const validateLeaveApplication = (application: LeaveApplication) => {
    const leaveType = leaveTypes.find(type => type.id === application.leaveTypeId);
    if (!leaveType) {
      throw new Error('Invalid leave type');
    }
    // Date validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(application.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(application.endDate);
    endDate.setHours(0, 0, 0, 0);
    // Advance booking validation
    if (!leaveType.allowAdvanceBooking && startDate > today) {
      throw new Error('This leave type cannot be booked in advance');
    }
    // Retrospective booking validation
    if (!leaveType.allowRetrospective && startDate < today) {
      throw new Error('This leave type cannot be booked retrospectively');
    }
    // Maximum advance days validation
    if (leaveType.maxAdvanceDays) {
      const maxAdvanceDate = new Date();
      maxAdvanceDate.setDate(today.getDate() + leaveType.maxAdvanceDays);
      if (startDate > maxAdvanceDate) {
        throw new Error(`Cannot book more than ${leaveType.maxAdvanceDays} days in advance`);
      }
    }
    // Partial day validation
    if (application.times) {
      if (!leaveType.allowPartialDays) {
        throw new Error('This leave type does not allow partial days');
      }
      if (leaveType.minimumHours) {
        const startTime = new Date(`2000-01-01T${application.times.startTime}`);
        const endTime = new Date(`2000-01-01T${application.times.endTime}`);
        const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        if (hours < leaveType.minimumHours) {
          throw new Error(`Minimum ${leaveType.minimumHours} hours required for partial day leave`);
        }
      }
    }
    // Balance validation
    if (leaveType.leavePool) {
      // Pool balance check
      const poolBalance = leaveBalances.find(balance => balance.userId === user.id && balance.poolId === leaveType.leavePool);
      if (!poolBalance) {
        throw new Error('No leave pool balance found');
      }
      // Calculate total used from pool
      const totalUsed = Object.values(poolBalance.usageByType).reduce((sum, used) => sum + used, 0);
      // Check type-specific limits
      const typeUsed = poolBalance.usageByType[leaveType.id] || 0;
      if (leaveType.maxDaysPerYear && typeUsed + application.totalDays > leaveType.maxDaysPerYear) {
        throw new Error(`Exceeds annual limit of ${leaveType.maxDaysPerYear} days for this leave type`);
      }
      if (poolBalance.balance - totalUsed < application.totalDays) {
        throw new Error('Insufficient leave balance');
      }
    } else {
      // Regular balance check
      const balance = leaveBalances.find(balance => balance.userId === user.id && balance.leaveTypeId === application.leaveTypeId);
      if (!balance || balance.balance < application.totalDays) {
        throw new Error('Insufficient leave balance');
      }
    }
    return true;
  };
  // Approve or reject a leave application
  const updateApplicationStatus = (applicationId, status, notes) => {
    if (!user || user.role !== 'manager' && user.role !== 'admin') return false;
    const application = leaveApplications.find(app => app.id === applicationId);
    if (!application) return false;
    // Handle TIL specific balance updates
    if (application.leaveTypeId === 5) {
      // TIL leave type
      setTilBalances(prev => prev.map(balance => {
        if (balance.userId === application.userId) {
          if (status === 'approved') {
            // If approving work TIL, move from pending to actual balance
            if (application.notes?.startsWith('Work TIL')) {
              return {
                ...balance,
                balance: balance.balance + (balance.pendingAccrual || 0),
                pendingAccrual: 0
              };
            }
          } else if (status === 'rejected') {
            if (application.notes?.startsWith('Work TIL')) {
              // If rejecting work TIL, clear pending accrual
              return {
                ...balance,
                pendingAccrual: 0
              };
            } else {
              // If rejecting take TIL, restore the balance
              const hours = application.totalDays * 8; // Convert days back to hours
              return {
                ...balance,
                balance: balance.balance + hours
              };
            }
          }
        }
        return balance;
      }));
    }
    // Update the application status
    const updatedApplications = leaveApplications.map(app => {
      if (app.id === applicationId) {
        // If approving, deduct from balance
        if (status === 'approved' && app.status !== 'approved') {
          const updatedBalances = leaveBalances.map(balance => {
            if (balance.userId === app.userId && balance.leaveTypeId === app.leaveTypeId) {
              return {
                ...balance,
                balance: balance.balance - app.totalDays
              };
            }
            return balance;
          });
          setLeaveBalances(updatedBalances);
        }
        // If withdrawing approval, add back to balance
        if (app.status === 'approved' && status !== 'approved') {
          const updatedBalances = leaveBalances.map(balance => {
            if (balance.userId === app.userId && balance.leaveTypeId === app.leaveTypeId) {
              return {
                ...balance,
                balance: balance.balance + app.totalDays
              };
            }
            return balance;
          });
          setLeaveBalances(updatedBalances);
        }
        return {
          ...app,
          status,
          notes: notes || app.notes,
          approvedBy: status === 'approved' ? user.id : null,
          approvedDate: status === 'approved' ? new Date().toISOString().split('T')[0] : null
        };
      }
      return app;
    });
    setLeaveApplications(updatedApplications);
    return true;
  };
  // Add attachment to an application
  const addAttachment = (applicationId, attachmentUrl) => {
    const updatedApplications = leaveApplications.map(app => {
      if (app.id === applicationId && app.userId === user.id) {
        return {
          ...app,
          attachmentUrl
        };
      }
      return app;
    });
    setLeaveApplications(updatedApplications);
    return true;
  };
  // Admin functions
  const addLeaveType = leaveType => {
    if (user?.role !== 'admin') return false;
    const newLeaveType = {
      id: leaveTypes.length + 1,
      ...leaveType
    };
    setLeaveTypes([...leaveTypes, newLeaveType]);
    return true;
  };
  const updateLeaveType = (id, updates) => {
    if (user?.role !== 'admin') return false;
    const updatedLeaveTypes = leaveTypes.map(type => {
      if (type.id === id) {
        return {
          ...type,
          ...updates
        };
      }
      return type;
    });
    setLeaveTypes(updatedLeaveTypes);
    return true;
  };
  const adjustLeaveBalance = (userId, leaveTypeId, adjustment, reason, isPool = false) => {
    if (user?.role !== 'admin') return false;
    setLeaveBalances(prevBalances => {
      // Handle pool balance adjustment
      if (isPool) {
        const poolBalance = prevBalances.find(balance => balance.userId === userId && balance.poolId === leaveTypeId);
        if (poolBalance) {
          return prevBalances.map(balance => {
            if (balance.userId === userId && balance.poolId === leaveTypeId) {
              return {
                ...balance,
                balance: balance.balance + adjustment,
                usageByType: balance.usageByType || {} // Ensure usageByType exists
              };
            }
            return balance;
          });
        } else {
          // Create new pool balance entry
          return [...prevBalances, {
            userId,
            poolId: leaveTypeId,
            balance: adjustment,
            usageByType: {}
          }];
        }
      }
      // Handle regular leave type balance adjustment
      const balanceExists = prevBalances.some(balance => balance.userId === userId && balance.leaveTypeId === leaveTypeId);
      if (balanceExists) {
        return prevBalances.map(balance => {
          if (balance.userId === userId && balance.leaveTypeId === leaveTypeId) {
            return {
              ...balance,
              balance: balance.balance + adjustment
            };
          }
          return balance;
        });
      } else {
        return [...prevBalances, {
          userId,
          leaveTypeId,
          balance: adjustment
        }];
      }
    });
    return true;
  };
  // Add pool management functions
  const addLeavePool = pool => {
    if (user?.role !== 'admin') return false;
    const newPool = {
      id: leavePools.length + 1,
      ...pool
    };
    setLeavePools([...leavePools, newPool]);
    return true;
  };
  const updateLeavePool = (id, updates) => {
    if (user?.role !== 'admin') return false;
    const updatedPools = leavePools.map(pool => {
      if (pool.id === id) {
        // Ensure we're explicitly handling the rollover property
        return {
          ...pool,
          ...updates,
          rollover: updates.rollover ?? pool.rollover // Ensure rollover is explicitly handled
        };
      }
      return pool;
    });
    setLeavePools(updatedPools);
    return true;
  };
  const deleteLeavePool = id => {
    if (user?.role !== 'admin') return false;
    // Check if any leave types are using this pool
    const poolInUse = leaveTypes.some(type => type.leavePool === id);
    if (poolInUse) {
      alert('Cannot delete pool while leave types are using it');
      return false;
    }
    setLeavePools(leavePools.filter(pool => pool.id !== id));
    return true;
  };
  const deleteLeaveType = id => {
    if (user?.role !== 'admin') {
      throw new LeaveManagementError('Only administrators can delete leave types');
    }
    // Check if type exists
    const typeToDelete = leaveTypes.find(type => type.id === id);
    if (!typeToDelete) {
      throw new LeaveManagementError('Leave type not found');
    }
    // Check for active applications
    const activeApplications = leaveApplications.filter(app => app.leaveTypeId === id && app.status !== 'rejected' && app.status !== 'withdrawn');
    if (activeApplications.length > 0) {
      throw new LeaveManagementError(`Cannot delete leave type with ${activeApplications.length} active application(s)`);
    }
    // Begin transaction-like updates
    try {
      // Remove all balances for this leave type
      setLeaveBalances(prev => prev.filter(balance => balance.leaveTypeId !== id));
      // Clean up pool usage records
      setLeaveBalances(prev => prev.map(balance => {
        if (balance.poolId && balance.usageByType) {
          const {
            [id]: removed,
            ...remainingUsage
          } = balance.usageByType;
          return {
            ...balance,
            usageByType: remainingUsage
          };
        }
        return balance;
      }));
      // Finally, delete the leave type
      setLeaveTypes(prev => prev.filter(type => type.id !== id));
      return true;
    } catch (error) {
      console.error('Error during leave type deletion:', error);
      throw new LeaveManagementError('Failed to delete leave type');
    }
  };
  // Add the missing submitLeaveApplication function
  const submitLeaveApplication = application => {
    if (!user) return false;
    // Validate the application
    if (!validateLeaveApplication(application)) {
      throw new Error('Invalid leave application');
    }
    // Create new application
    const newApplication = {
      id: leaveApplications.length + 1,
      userId: user.id,
      status: 'pending',
      createdDate: new Date().toISOString().split('T')[0],
      ...application
    };
    // Add to applications list
    setLeaveApplications(prev => [...prev, newApplication]);
    return true;
  };
  // Add TIL specific functions
  const getTilBalance = userId => {
    return tilBalances.find(b => b.userId === userId) || null;
  };
  const adjustTilBalance = (userId, hours, type = 'manual', details = {}) => {
    if (user?.role !== 'admin') return false;
    setTilBalances(prev => prev.map(balance => {
      if (balance.userId === userId) {
        return {
          ...balance,
          balance: balance.balance + hours,
          [type === 'accrual' ? 'accrualHistory' : 'usageHistory']: [...balance[type === 'accrual' ? 'accrualHistory' : 'usageHistory'], {
            date: new Date().toISOString(),
            hours,
            ...details
          }]
        };
      }
      return balance;
    }));
    return true;
  };
  // Add TIL specific application handling
  const submitTilApplication = tilData => {
    if (!user) return false;
    // Get user's TIL settings
    const userTilSettings = user.tilSettings;
    if (!userTilSettings?.enabled) return false;
    // Validate balance for taking TIL
    if (tilData.mode === 'take') {
      const currentBalance = getTilBalance(user.id)?.balance || 0;
      if (tilData.calculatedHours > currentBalance) {
        throw new Error('Insufficient TIL balance');
      }
    }
    const newApplication = {
      id: leaveApplications.length + 1,
      userId: user.id,
      leaveTypeId: 5,
      startDate: tilData.date,
      endDate: tilData.date,
      totalDays: tilData.calculatedHours / 8,
      status: 'pending',
      notes: `${tilData.mode === 'work' ? 'Work TIL' : 'Take TIL'}: ${tilData.reason}\n${tilData.details || ''}`,
      times: {
        startTime: tilData.startTime,
        endTime: tilData.endTime
      },
      createdDate: new Date().toISOString().split('T')[0]
    };
    // Update applications list
    setLeaveApplications(prev => [...prev, newApplication]);
    // Update TIL balances using state version of globalTilSettings
    setTilBalances(prev => prev.map(balance => {
      if (balance.userId === user.id) {
        if (tilData.mode === 'work') {
          return {
            ...balance,
            pendingAccrual: (balance.pendingAccrual || 0) + tilData.calculatedHours * globalTilSettings.accrualRatio
          };
        } else {
          return {
            ...balance,
            balance: (balance.balance || 0) - tilData.calculatedHours * globalTilSettings.usageRatio
          };
        }
      }
      return balance;
    }));
    return true;
  };
  // Update value object to include global TIL settings
  const value = {
    leaveTypes,
    getUserLeaveTypes,
    getUserLeaveBalances,
    getUserLeaveApplications,
    getPendingApplications,
    submitLeaveApplication,
    updateApplicationStatus,
    addAttachment,
    addLeaveType,
    updateLeaveType,
    deleteLeaveType,
    adjustLeaveBalance,
    leavePools,
    addLeavePool,
    updateLeavePool,
    deleteLeavePool,
    validateLeaveApplication,
    getTilBalance,
    adjustTilBalance,
    submitTilApplication,
    globalTilSettings,
    updateGlobalTilSettings
  };
  return <LeaveContext.Provider value={value}>{children}</LeaveContext.Provider>;
}
export const useLeave = () => useContext(LeaveContext);