import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: false,
  loading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      return { ...initialState, token: null, loading: false };
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: true, loading: false };
    case 'STOP_LOADING':
      return { ...state, loading: false };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Use a ref to hold cart functions — avoids circular dependency
  // CartContext calls clearCart/loadUserCart, but AuthContext can't import CartContext
  // Instead we let components register these callbacks via setCartCallbacks
  const cartCallbacksRef = useRef({ clearCart: () => {}, loadUserCart: () => {} });

  const setCartCallbacks = (callbacks) => {
    cartCallbacksRef.current = callbacks;
  };

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        dispatch({ type: 'STOP_LOADING' });
        return;
      }
      try {
        const res = await authService.getMe();
        dispatch({ type: 'SET_USER', payload: res.data.user });
        // Load this user's saved cart
        cartCallbacksRef.current.loadUserCart();
      } catch {
        dispatch({ type: 'LOGOUT' });
      }
    };
    verifyToken();
  }, []);

  const login = (userData, token) => {
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user: userData, token } });
    // Small delay so token is in localStorage before cart key is computed
    setTimeout(() => {
      cartCallbacksRef.current.loadUserCart();
    }, 50);
  };

  const logout = () => {
    // Clear this user's cart before wiping the token
    cartCallbacksRef.current.clearCart();
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setCartCallbacks }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
