import React, { createContext } from 'react';

import useAuth from './hooks/useAuth';

const AuthContext = createContext();

function AuthProvider({ children }) {
  const {
    user, loading, role, enterprise, error, entering, handleLogin, handleLogout,
  } = useAuth();

  return (
    <AuthContext.Provider value={{ loading, user, role, enterprise, error, entering, handleLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };