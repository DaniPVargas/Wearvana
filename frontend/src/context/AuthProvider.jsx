import { createContext, useState } from "react";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({});
  const [userAlias, setUserAlias] = useState("");

  return (
    <AuthContext.Provider value={{ auth, setAuth, userAlias, setUserAlias }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
