import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { eligibilityService } from '../services/eligibilityService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('gov_token') || null);
  const [loading, setLoading] = useState(true);

  // Cached eligibility result
  const [cachedEligibility, setCachedEligibility] = useState(() => {
    try {
      const stored = localStorage.getItem('gov_cached_eligibility');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Helper to check if essential profile fields are complete
  const isProfileComplete = (u = user) => {
    if (!u) return false;
    return Boolean(
      u.name && 
      u.age !== undefined && u.age !== null && u.age > 0 &&
      u.state && 
      u.gender && 
      u.annualIncome !== undefined && u.annualIncome !== null
    );
  };

  // Run background eligibility evaluation and cache result
  const runBackgroundEligibilityCheck = async (profileData = user) => {
    if (!profileData || !isProfileComplete(profileData)) return null;

    try {
      const payload = {
        age: profileData.age || 25,
        gender: profileData.gender || 'Male',
        state: profileData.state || 'Uttar Pradesh',
        occupation: profileData.occupation || 'Farmer',
        education: profileData.education || '12th Pass',
        annualIncome: profileData.annualIncome || 150000,
        caste: profileData.caste || 'General',
        disabilityStatus: Boolean(profileData.disabilityStatus),
        bplStatus: Boolean(profileData.bplStatus)
      };

      const res = await eligibilityService.checkEligibility(payload);
      if (res.success) {
        const evalData = {
          eligibleSchemes: res.eligibleSchemes || [],
          notEligibleSchemes: res.notEligibleSchemes || [],
          totalChecked: res.totalChecked || 0,
          eligibleCount: (res.eligibleSchemes || []).length,
          lastEvaluatedAt: Date.now()
        };

        setCachedEligibility(evalData);
        localStorage.setItem('gov_cached_eligibility', JSON.stringify(evalData));
        return evalData;
      }
    } catch (error) {
      console.error('Background eligibility evaluation failed:', error);
    }
    return null;
  };

  // Initialize session from token & auto-evaluate if needed
  useEffect(() => {
    const checkUserStatus = async () => {
      const storedToken = localStorage.getItem('gov_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.user) {
            if (res.user.isBlocked) {
              logout();
              alert('Account Blocked: Your account has been suspended by System Administrator. You have been logged out.');
              window.location.href = '/login';
              return;
            }
            setUser(res.user);
            if (isProfileComplete(res.user) && !localStorage.getItem('gov_cached_eligibility')) {
              runBackgroundEligibilityCheck(res.user);
            }
          } else {
            logout();
          }
        } catch (error) {
          const errMsg = error.message || '';
          if (errMsg.toLowerCase().includes('suspended') || errMsg.toLowerCase().includes('blocked')) {
            logout();
            alert('Account Blocked: Your account has been suspended by System Administrator. You have been logged out.');
            window.location.href = '/login';
          } else {
            logout();
          }
        }
      }
      setLoading(false);
    };

    checkUserStatus();

    // Periodic poll every 7 seconds to check if current logged-in user was blocked by admin
    const pollInterval = setInterval(() => {
      const storedToken = localStorage.getItem('gov_token');
      if (storedToken) {
        authService.getMe().then((res) => {
          if (res.user && res.user.isBlocked) {
            logout();
            alert('Account Blocked: Your account has been suspended by System Administrator. You have been logged out.');
            window.location.href = '/login';
          }
        }).catch((err) => {
          const msg = err.message || '';
          if (msg.toLowerCase().includes('suspended') || msg.toLowerCase().includes('blocked')) {
            logout();
            alert('Account Blocked: Your account has been suspended by System Administrator. You have been logged out.');
            window.location.href = '/login';
          }
        });
      }
    }, 7000);

    return () => clearInterval(pollInterval);
  }, []);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    if (res.success && res.token) {
      localStorage.setItem('gov_token', res.token);
      setToken(res.token);
      setUser(res.user);
      if (isProfileComplete(res.user)) {
        runBackgroundEligibilityCheck(res.user);
      }
    }
    return res;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.success && res.token) {
      localStorage.setItem('gov_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('gov_token');
    localStorage.removeItem('gov_cached_eligibility');
    setToken(null);
    setUser(null);
    setCachedEligibility(null);
  };

  const updateUserState = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        cachedEligibility,
        isProfileComplete: isProfileComplete(user),
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateUserState,
        runBackgroundEligibilityCheck
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
