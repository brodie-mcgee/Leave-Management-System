import React, { useEffect, useState, createContext, useContext } from 'react';
// Mock user data
const mockUsers = [{
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  role: 'employee',
  category: 'A',
  workSchedule: {
    type: 'full-time',
    fte: 1.0,
    workDays: {
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
  },
  tilSettings: {
    enabled: true,
    allowRetrospective: true
  },
  reportsTo: 4
}, {
  id: 2,
  name: 'Jane Smith',
  email: 'jane@example.com',
  role: 'employee',
  category: 'B',
  workSchedule: {
    type: 'part-time',
    fte: 0.5,
    workDays: {
      Monday: {
        hours: 6
      },
      Wednesday: {
        hours: 4
      },
      Friday: {
        hours: 6
      }
    }
  },
  tilSettings: {
    enabled: false,
    allowRetrospective: false
  },
  reportsTo: 4
}, {
  id: 3,
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
  category: 'A',
  workSchedule: {
    type: 'full-time',
    fte: 1.0,
    workDays: {
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
  },
  tilSettings: {
    enabled: true,
    allowRetrospective: true
  },
  manages: []
}, {
  id: 4,
  name: 'Manager User',
  email: 'manager@example.com',
  role: 'manager',
  category: 'A',
  workSchedule: {
    type: 'full-time',
    fte: 1.0,
    workDays: {
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
  },
  tilSettings: {
    enabled: true,
    allowRetrospective: true
  },
  manages: [1, 2]
}];
// Create auth context
const AuthContext = createContext(null);
export function AuthProvider({
  children
}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Check for saved user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('leaveSystemUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);
  // Login function
  const login = (email, password) => {
    // In a real app, this would validate against a backend
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('leaveSystemUser', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };
  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('leaveSystemUser');
  };
  // Get all users (for admin functions)
  const getUsers = () => {
    if (user?.role === 'admin') {
      return mockUsers;
    }
    return [];
  };
  // Add new functions for team management
  const getTeamMembers = managerId => {
    return mockUsers.filter(user => user.reportsTo === managerId);
  };
  const getManager = userId => {
    const user = mockUsers.find(u => u.id === userId);
    if (user?.reportsTo) {
      return mockUsers.find(u => u.id === user.reportsTo);
    }
    return null;
  };
  const updateUserTilSettings = (userId, settings) => {
    if (user?.role !== 'admin') return false;
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      tilSettings: {
        enabled: settings.enabled,
        allowRetrospective: settings.allowRetrospective
      }
    };
    return true;
  };
  const value = {
    user,
    loading,
    login,
    logout,
    getUsers,
    getTeamMembers,
    getManager,
    updateUserTilSettings
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);