'use client';

import { createContext, useContext, useReducer, useEffect, useState } from 'react';

// Auth Context
const AuthContext = createContext();

// Auth Actions
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Initial State
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

// Auth Reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        loading: true,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
}

// Auth Provider Component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [isMounted, setIsMounted] = useState(false);

  // Load user from localStorage on mount (client-side only)
  useEffect(() => {
    setIsMounted(true);
    
    const savedUser = localStorage.getItem('billmenow_user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      try {
        const user = JSON.parse(savedUser);
        
        // Verify token is still valid by making a test API call
        fetch('/api/dashboard', {
          headers: {
            'Authorization': `Bearer ${savedToken}`,
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          if (response.ok) {
            // Token is valid, set cookie and login
            document.cookie = `auth-token=${savedToken}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
            dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: user });
          } else {
            // Token is invalid, clear everything
            localStorage.removeItem('billmenow_user');
            localStorage.removeItem('token');
            document.cookie = 'auth-token=; path=/; max-age=0';
          }
        })
        .catch(() => {
          // Network error or API error, clear everything
          localStorage.removeItem('billmenow_user');
          localStorage.removeItem('token');
          document.cookie = 'auth-token=; path=/; max-age=0';
        });
        
      } catch (error) {
        console.error('Error loading saved user:', error);
        localStorage.removeItem('billmenow_user');
        localStorage.removeItem('token');
        document.cookie = 'auth-token=; path=/; max-age=0';
      }
    }
  }, []);
  // Login function
  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Save user and token to localStorage and cookies
      localStorage.setItem('billmenow_user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      
      // Also save token as cookie for middleware - ensure it's set properly
      document.cookie = `auth-token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax; Secure=${window.location.protocol === 'https:'}`;
      
      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: data.user });
      
      return { success: true, user: data.user };
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }      // Save user and token to localStorage and cookies
      localStorage.setItem('billmenow_user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      
      // Also save token as cookie for middleware
      document.cookie = `auth-token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax; Secure=${window.location.protocol === 'https:'}`;
      
      dispatch({ type: AUTH_ACTIONS.REGISTER_SUCCESS, payload: data.user });
      
      return { success: true, user: data.user };
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.REGISTER_FAILURE, payload: error.message });
      return { success: false, error: error.message };
    }
  };  // Logout function
  const logout = () => {
    localStorage.removeItem('billmenow_user');
    localStorage.removeItem('token');
    
    // Also remove auth-token cookie
    document.cookie = 'auth-token=; path=/; max-age=0; SameSite=Lax';
    
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    
    // Redirect to home page after logout
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    forgotPassword,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// HOC for protected routes
export function withAuth(Component) {
  return function ProtectedComponent(props) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      return null;
    }

    return <Component {...props} />;
  };
}
