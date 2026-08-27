import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '../services/authService';
import { eligibilityService } from '../services/eligibilityService';
import { checkProfileCompleteness } from '../utils/constants';

export const AuthContext = createContext(null);

const getStorageItem = (key) => {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(key) || localStorage.getItem(key);
  } catch {
    return null;
  }
};

const setStorageItem = (key, value) => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(key, value);
    localStorage.setItem(key, value);
  } catch {}
};

const removeStorageItem = (key) => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  } catch {}
};

export const AuthProvider = ({ children }) => {
  // Citizen state (tab-isolated with sessionStorage priority)
  const [citizenUser, setCitizenUser] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.location.search.includes('blocked=1')) {
        removeStorageItem('gov_user_token');
        removeStorageItem('gov_token');
        removeStorageItem('gov_citizen_user');
        removeStorageItem('gov_user');
        return null;
      }
      const storedCitizen = getStorageItem('gov_citizen_user');
      if (storedCitizen) {
        const parsed = JSON.parse(storedCitizen);
        return parsed?.role !== 'admin' && !parsed?.isBlocked ? parsed : null;
      }
      return null;
    } catch {
      return null;
    }
  });

  // Admin state (tab-isolated with sessionStorage priority)
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const storedAdmin = getStorageItem('gov_admin_user');
      if (storedAdmin) {
        const parsed = JSON.parse(storedAdmin);
        return parsed?.role === 'admin' ? parsed : null;
      }
      return null;
    } catch {
      return null;
    }
  });

  // User-specific cached eligibility state
  const [cachedEligibility, setCachedEligibility] = useState(() => {
    try {
      const storedCitizen = getStorageItem('gov_citizen_user');
      if (storedCitizen) {
        const parsed = JSON.parse(storedCitizen);
        const uid = parsed?._id || parsed?.id;
        if (uid) {
          const userSpecificCache = getStorageItem(`gov_cached_eligibility_${uid}`);
          if (userSpecificCache) {
            return JSON.parse(userSpecificCache);
          }
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Active user ID ref to protect against race conditions
  const activeUserIdRef = useRef(citizenUser?._id || citizenUser?.id || null);

  useEffect(() => {
    activeUserIdRef.current = citizenUser?._id || citizenUser?.id || null;
  }, [citizenUser]);

  const isCitizenAuthenticated = Boolean(citizenUser && citizenUser.role !== 'admin' && !citizenUser.isBlocked);
  const isAdmin = Boolean(adminUser && adminUser.role === 'admin');

  // Helper to determine if a citizen user profile has completed demographic info
  const isProfileComplete = Boolean(
    citizenUser && checkProfileCompleteness(citizenUser)
  );

  // Background eligibility evaluation helper with strict user isolation
  const runBackgroundEligibilityCheck = useCallback(async (profileData) => {
    const targetUser = profileData || citizenUser;
    const targetUserId = targetUser?._id || targetUser?.id;

    if (!targetUserId) return null;

    try {
      const res = await eligibilityService.checkEligibility(targetUser);

      // Race condition protection: Discard response if user switched or logged out
      if (activeUserIdRef.current !== targetUserId) {
        return null;
      }

      if (res?.success) {
        const eligibilityData = {
          userId: targetUserId,
          eligibleCount: res.eligibleCount ?? (res.eligibleSchemes?.length || 0),
          eligibleSchemes: res.eligibleSchemes || [],
          notEligibleSchemes: res.notEligibleSchemes || [],
          evaluatedAt: new Date().toISOString(),
          profileSnapshot: targetUser
        };

        setCachedEligibility(eligibilityData);
        setStorageItem(`gov_cached_eligibility_${targetUserId}`, JSON.stringify(eligibilityData));
        return eligibilityData;
      }
    } catch (err) {
      console.warn('Background eligibility check could not complete:', err.message);
    }
    return null;
  }, [citizenUser]);

  // Update user state and synchronize storage
  const updateUserState = useCallback((updatedUserData) => {
    if (!updatedUserData) return;
    if (updatedUserData.role === 'admin') {
      setAdminUser(updatedUserData);
      setStorageItem('gov_admin_user', JSON.stringify(updatedUserData));
    } else {
      setCitizenUser(updatedUserData);
      setStorageItem('gov_citizen_user', JSON.stringify(updatedUserData));
    }
  }, []);

  // Check and sync user & admin status upon page refresh
  const checkUserStatus = useCallback(async () => {
    try {
      const adminToken = getStorageItem('gov_admin_token');
      const userToken = getStorageItem('gov_user_token') || getStorageItem('gov_token');

      // 1. Verify Admin Session
      if (adminToken) {
        try {
          const res = await authService.getMe('admin');
          const adm = res?.user || res?.data?.user || res;
          if (adm && adm.role === 'admin') {
            setAdminUser(adm);
            setStorageItem('gov_admin_user', JSON.stringify(adm));
          } else {
            removeStorageItem('gov_admin_token');
            removeStorageItem('gov_admin_user');
            setAdminUser(null);
          }
        } catch (err) {
          // Only clear session on genuine 401 Unauthorized
          if (err?.response?.status === 401 || err?.message?.toLowerCase().includes('unauthorized')) {
            removeStorageItem('gov_admin_token');
            removeStorageItem('gov_admin_user');
            setAdminUser(null);
          }
        }
      } else {
        setAdminUser(null);
      }

      // 2. Verify Citizen Session
      if (userToken) {
        try {
          const res = await authService.getMe('user');
          const usr = res?.user || res?.data?.user || res;
          if (usr && usr.role !== 'admin' && !usr.isBlocked) {
            setCitizenUser(usr);
            setStorageItem('gov_citizen_user', JSON.stringify(usr));

            // Load user-specific cached eligibility
            const uid = usr._id || usr.id;
            try {
              const cached = getStorageItem(`gov_cached_eligibility_${uid}`);
              if (cached) {
                setCachedEligibility(JSON.parse(cached));
              } else {
                setCachedEligibility(null);
              }
            } catch {
              setCachedEligibility(null);
            }

            runBackgroundEligibilityCheck(usr);
          } else if (usr?.isBlocked) {
            removeStorageItem('gov_user_token');
            removeStorageItem('gov_token');
            removeStorageItem('gov_citizen_user');
            removeStorageItem('gov_user');
            setCitizenUser(null);
            setCachedEligibility(null);
          } else {
            removeStorageItem('gov_user_token');
            removeStorageItem('gov_token');
            removeStorageItem('gov_citizen_user');
            removeStorageItem('gov_user');
            setCitizenUser(null);
            setCachedEligibility(null);
          }
        } catch (err) {
          // Only clear session on genuine 401 Unauthorized
          if (err?.response?.status === 401 || err?.message?.toLowerCase().includes('unauthorized')) {
            removeStorageItem('gov_user_token');
            removeStorageItem('gov_token');
            removeStorageItem('gov_citizen_user');
            removeStorageItem('gov_user');
            setCitizenUser(null);
            setCachedEligibility(null);
          }
        }
      } else {
        setCitizenUser(null);
        setCachedEligibility(null);
      }
    } catch (err) {
      console.error('Auth session verification error:', err);
    } finally {
      setLoading(false);
    }
  }, [runBackgroundEligibilityCheck]);

  useEffect(() => {
    checkUserStatus();
  }, [checkUserStatus]);

  // Login Method: Strict state reset and user isolation
  const login = async (credentials) => {
    setCachedEligibility(null);

    const res = await authService.login(credentials);
    const authData = res?.data || res;
    const usr = authData?.user;
    const token = authData?.token;

    if (token && usr) {
      if (usr.role === 'admin') {
        setStorageItem('gov_admin_token', token);
        setStorageItem('gov_admin_user', JSON.stringify(usr));

        // Clear citizen session from current tab
        removeStorageItem('gov_user_token');
        removeStorageItem('gov_token');
        removeStorageItem('gov_citizen_user');
        removeStorageItem('gov_user');

        setAdminUser(usr);
        setCitizenUser(null);
        setCachedEligibility(null);
      } else {
        setStorageItem('gov_user_token', token);
        setStorageItem('gov_token', token);
        setStorageItem('gov_citizen_user', JSON.stringify(usr));
        setStorageItem('gov_user', JSON.stringify(usr));

        // Clear admin session from current tab
        removeStorageItem('gov_admin_token');
        removeStorageItem('gov_admin_user');

        setCitizenUser(usr);
        setAdminUser(null);

        const uid = usr._id || usr.id;
        try {
          const cached = getStorageItem(`gov_cached_eligibility_${uid}`);
          if (cached) {
            setCachedEligibility(JSON.parse(cached));
          } else {
            setCachedEligibility(null);
          }
        } catch {
          setCachedEligibility(null);
        }

        runBackgroundEligibilityCheck(usr);
      }
    }

    return authData;
  };

  // Register Method
  const register = async (userData) => {
    const res = await authService.register(userData);
    return res;
  };

  // Citizen Explicit Logout: Clears current tab's citizen session
  const logout = async () => {
    try {
      await authService.logout();
    } catch { }

    const currentUid = citizenUser?._id || citizenUser?.id;
    if (currentUid) {
      removeStorageItem(`gov_cached_eligibility_${currentUid}`);
    }

    // Clear current tab's sessionStorage
    try {
      sessionStorage.removeItem('gov_user_token');
      sessionStorage.removeItem('gov_token');
      sessionStorage.removeItem('gov_citizen_user');
      sessionStorage.removeItem('gov_user');
      sessionStorage.removeItem('gov_cached_eligibility');
    } catch {}

    // Clear localStorage for this tab's session
    try {
      const storedCitizenStr = localStorage.getItem('gov_citizen_user');
      if (storedCitizenStr) {
        const storedCitizen = JSON.parse(storedCitizenStr);
        if (storedCitizen?._id === currentUid || storedCitizen?.id === currentUid) {
          localStorage.removeItem('gov_user_token');
          localStorage.removeItem('gov_token');
          localStorage.removeItem('gov_citizen_user');
          localStorage.removeItem('gov_user');
          localStorage.removeItem('gov_cached_eligibility');
        }
      }
    } catch {}

    setCitizenUser(null);
    setCachedEligibility(null);
  };

  // Admin Explicit Logout: Clears current tab's admin session
  const logoutAdmin = async () => {
    try {
      await authService.logout();
    } catch { }

    try {
      sessionStorage.removeItem('gov_admin_token');
      sessionStorage.removeItem('gov_admin_user');
      localStorage.removeItem('gov_admin_token');
      localStorage.removeItem('gov_admin_user');
    } catch {}

    setAdminUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user: citizenUser,
        admin: adminUser,
        citizenUser,
        adminUser,
        loading,
        authLoading: loading,
        login,
        register,
        logout,
        logoutCitizen: logout,
        logoutAdmin,
        updateUserState,
        cachedEligibility,
        isProfileComplete,
        runBackgroundEligibilityCheck,
        checkUserStatus,
        isAuthenticated: isCitizenAuthenticated,
        isCitizenAuthenticated,
        isAdmin,
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

export default AuthContext;
