import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthClient from "../services/AuthClient";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => localStorage.getItem('jwt') || "");
  const [userID, setUserID] = useState(() => localStorage.getItem('userID') || "");
  const navigate = useNavigate();

  useEffect(() => {
    const validateUser = async () => {
      if (userID) {
        try {
          const authClientInstance = new AuthClient();
          await authClientInstance.getUser(userID);
        } catch (error) {
          console.error("Error validating user:", error);
          // Clear auth data and redirect to login
          localStorage.removeItem('jwt');
          localStorage.removeItem('userID');
          setAuth("");
          setUserID("");
          navigate('/login');
        }
      }
    };

    validateUser();
  }, [userID, navigate]);

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
