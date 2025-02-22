import { createContext, useState } from "react";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState("");
  const [userID, setUserID] = useState("");

  return (
    <AuthContext.Provider value={{ auth, setAuth, userID, setUserID }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
