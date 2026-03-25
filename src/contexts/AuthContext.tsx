import React, { createContext, useContext, useReducer, useEffect, useState, ReactNode } from 'react';
import { User, StoredUser, AuthState, LoginCredentials, SignupCredentials } from '../types';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  signup: (credentials: SignupCredentials) => Promise<boolean>;
  loginAsDemo: () => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
  clearAllData: () => void;
  updateUserRole: (userId: string, newRole: 'admin' | 'pharmacist' | 'staff') => Promise<boolean>;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_DEMO'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGIN_DEMO':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

const getStoredUsers = (): StoredUser[] => {
  try {
    const stored = localStorage.getItem('pharmacy_users');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const storeUsers = (users: StoredUser[]) => {
  localStorage.setItem('pharmacy_users', JSON.stringify(users));
};

const getStoredAuth = (): { user: User | null } => {
  try {
    const stored = localStorage.getItem('pharmacy_auth');
    return stored ? JSON.parse(stored) : { user: null };
  } catch {
    return { user: null };
  }
};

const storeAuth = (user: User) => {
  localStorage.setItem('pharmacy_auth', JSON.stringify({ user }));
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const { user } = getStoredAuth();
    if (user) {
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const users = getStoredUsers();
      const user = users.find(u => u.email === credentials.email);
      
      if (!user) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return false;
      }

      // Validate password
      if (user.password !== credentials.password) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return false;
      }

      const updatedStoredUser: StoredUser = { ...user, lastLogin: new Date().toISOString() };
      const updatedUsers = users.map(u => u.id === user.id ? updatedStoredUser : u);
      storeUsers(updatedUsers);
      
      // Convert to User type without password for security
      const { password: _, ...userWithoutPassword } = updatedStoredUser;
      storeAuth(userWithoutPassword);
      dispatch({ type: 'LOGIN_SUCCESS', payload: userWithoutPassword });
      return true;
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return false;
    }
  };

  const signup = async (credentials: SignupCredentials): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const users = getStoredUsers();
      
      if (users.some(u => u.email === credentials.email)) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return false;
      }

      if (credentials.password !== credentials.confirmPassword) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return false;
      }

      const newUser: StoredUser = {
        id: Date.now().toString(),
        email: credentials.email,
        name: credentials.name,
        role: credentials.role,
        password: credentials.password,
        createdAt: new Date().toISOString(),
      };

      const updatedUsers = [...users, newUser];
      storeUsers(updatedUsers);
      
      // Convert to User type without password for security
      const { password: _, ...userWithoutPassword } = newUser;
      storeAuth(userWithoutPassword);
      dispatch({ type: 'LOGIN_SUCCESS', payload: userWithoutPassword });
      return true;
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return false;
    }
  };

  const loginAsDemo = async (): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Create demo user
      const demoUser: User = {
        id: 'demo-user',
        email: 'demo@mkpharmacy.com',
        name: 'Demo User',
        role: 'admin',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      localStorage.setItem('mk_pharmacy_demo_mode', 'true');
      setIsDemoMode(true);
      dispatch({ type: 'LOGIN_DEMO', payload: demoUser });
      return true;
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('pharmacy_auth');
    localStorage.removeItem('mk_pharmacy_demo_mode');
    setIsDemoMode(false);
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (user: User) => {
    const users = getStoredUsers();
    const storedUser = users.find(u => u.id === user.id);
    if (storedUser) {
      const updatedStoredUser: StoredUser = { ...storedUser, ...user };
      const updatedUsers = users.map(u => u.id === user.id ? updatedStoredUser : u);
      storeUsers(updatedUsers);
      storeAuth(user);
      dispatch({ type: 'UPDATE_USER', payload: user });
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'pharmacist' | 'staff'): Promise<boolean> => {
    try {
      const users = getStoredUsers();
      const userToUpdate = users.find(u => u.id === userId);
      
      if (!userToUpdate) {
        return false;
      }

      const updatedUser: StoredUser = { ...userToUpdate, role: newRole };
      const updatedUsers = users.map(u => u.id === userId ? updatedUser : u);
      storeUsers(updatedUsers);
      
      // Update current user if it's the same user
      if (state.user && state.user.id === userId) {
        const { password, ...userWithoutPassword } = updatedUser;
        storeAuth(userWithoutPassword);
        dispatch({ type: 'UPDATE_USER', payload: userWithoutPassword });
      }
      
      return true;
    } catch (error) {
      return false;
    }
  };

  const clearAllData = () => {
    localStorage.removeItem('pharmacy_users');
    localStorage.removeItem('pharmacy_auth');
    localStorage.removeItem('mk_pharmacy_demo_mode');
  };

  const value: AuthContextType = {
    ...state,
    login,
    signup,
    loginAsDemo,
    logout,
    updateUser,
    clearAllData,
    updateUserRole,
    isDemoMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
