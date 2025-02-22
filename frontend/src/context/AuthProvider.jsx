import { createContext, useState, useEffect } from "react";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => localStorage.getItem('jwt') || "");
  const [userID, setUserID] = useState(() => localStorage.getItem('userID') || "");

  useEffect(() => {
    if (auth) {
      localStorage.setItem('jwt', auth);
    }
  }, [auth]);

  useEffect(() => {
    if (userID) {
      localStorage.setItem('userID', userID);
    }
  }, [userID]);

  return (
    <AuthContext.Provider value={{ auth, setAuth, userID, setUserID }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
