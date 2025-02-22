import { useContext, useRef, useState } from "react";
import authContext from "../context/AuthProvider";
import * as Passwordless from "@passwordlessdev/passwordless-client";
import AuthClient from "../services/AuthClient";
import { ToastContainer } from "react-toastify";

// import {
//   PASSWORDLESS_API_KEY,
//   PASSWORDLESS_API_URL,
// } from "../configuration/PasswordlessOptions";

const PASSWORDLESS_API_KEY = "wearvana:public:a72fe9ba831b4292808084b49406b3d3";
const PASSWORDLESS_API_URL = "https://v4.passwordless.dev";

export default function LoginPage() {
  const [errMsg, setErrMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const { setAuth } = useContext(authContext);

  const handleSubmit = async (e) => {
    try {
      const passwordless = new Passwordless.Client({
        apiUrl: PASSWORDLESS_API_URL,
        apiKey: PASSWORDLESS_API_KEY,
      });
      const authClientInstance = new AuthClient();

      const token = await passwordless.signinWithDiscoverable();
      console.log(token);
      if (!token) return;

      const verifiedToken = await authClientInstance.signIn(token.token);
      localStorage.setItem("jwt", verifiedToken.jwt);
      setAuth({ verifiedToken });
      setSuccess(true);
    } catch (error) {
      setErrMsg("Erro ao iniciar sesion");
    }
  };

  return (
    <div className="max-w-md px-5 mx-auto flex items-center justify-center min-h-screen bg-ig-primary">
      <section className="w-full mt-8 p-6 bg-white rounded-lg shadow-lg">
        {errMsg && (
          <p className="text-red-500 text-sm mb-4" aria-live="assertive">
            {errMsg}
          </p>
        )}
        {success ? (
          <h1 className="text-2xl font-semibold text-center">
            You are logged in!
          </h1>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-center mb-4">Sign In</h1>
            <button
              onClick={handleSubmit}
              className="wearvana-button w-full flex items-center justify-center gap-2 py-3"
            >
              Sign In
            </button>
            <p className="mt-4 text-center text-sm text-gray-500">
              Need an account?{" "}
              <a href="#" className="text-ig-link hover:underline">
                Sign Up
              </a>
            </p>
          </>
        )}
        <ToastContainer />
      </section>
    </div>
  );
}
