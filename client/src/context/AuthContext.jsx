import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          // Check if token is expired
          const decoded = jwt_decode(token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp && decoded.exp < currentTime) {
            // Token has expired
            logout();
          } else {
            // Set auth header
            setAuthHeader(token);
            // Get user data
            const res = await axios.get('/api/auth/me');
            setUser(res.data);
          }
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          logout();
        }
      }
      setLoading(false);
    };
    
    initializeAuth();
  }, [token]);
  
  // Set Auth token in header
  const setAuthHeader = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };
  
  // Register user
  const register = async (name, email, password) => {
    try {
      const res = await axios.post('/api/auth/register', { name, email, password });
      
      if (res.data.token) {
        setToken(res.data.token);
        setUser(res.data);
        setAuthHeader(res.data.token);
        return { success: true };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed. Please try again.' 
      };
    }
  };
  
  // Login user
  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      
      if (res.data.token) {
        setToken(res.data.token);
        setUser(res.data);
        setAuthHeader(res.data.token);
        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Invalid credentials' 
      };
    }
  };
  
  // Logout user
  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthHeader(null);
  };
  
  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token,
        loading,
        isAuthenticated: !!user,
        register, 
        login, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 