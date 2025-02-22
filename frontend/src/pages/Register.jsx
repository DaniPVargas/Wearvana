import { useContext, useEffect, useRef, useState } from "react";
import * as Passwordless from "@passwordlessdev/passwordless-client";
import authContext from "../context/AuthProvider";
import AuthClient from "../services/AuthClient";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const aliasRef = useRef();
  const [alias, setAlias] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const { setAuth } = useContext(authContext);
  const navigate = useNavigate();

  const PASSWORDLESS_API_KEY =
    "wearvana:public:a72fe9ba831b4292808084b49406b3d3";
  const PASSWORDLESS_API_URL = "https://v4.passwordless.dev";

  useEffect(() => {
    aliasRef.current.focus();
  }, []);

  useEffect(() => {
    setErrMsg("");
  }, [alias]);

  const handleSubmit = async (e) => {
    let registerToken = null;

    const authClientInstance = new AuthClient();
    try {
      // Register the alias with AuthClient
      registerToken = await authClientInstance.register(alias);
    } catch (error) {
      setErrMsg(error.message);
    }

    if (registerToken) {

        const p = new Passwordless.Client({
        apiKey: PASSWORDLESS_API_KEY,
        apiUrl: PASSWORDLESS_API_URL,
      });

      // Use the alias for the credential nickname
      const { token, error } = await p.register(registerToken);

      if (!error) {
        const verifiedToken = await authClientInstance.signIn(token);
        localStorage.setItem("jwt", verifiedToken.jwt);
        setAuth({ verifiedToken });
        navigate("/");
      } else {
        setErrMsg(error);
      }
    }
  };

  return (
    <>
      <div className="max-w-md px-5 mx-auto flex items-center justify-center min-h-screen bg-ig-primary">
        <section className="w-full p-6 bg-white rounded-lg shadow-lg">
          <img
            src="/logo.svg"
            alt="Logo"
            className="mx-auto mb-16 w-24 h-24 "
          />
          <div className="mb-4">
            <input
              type="text"
              id="alias"
              ref={aliasRef}
              autoComplete="off"
              onChange={(e) => setAlias(e.target.value)}
              value={alias}
              required
              placeholder="alias"
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleSubmit}
            className="wearvana-button w-full flex items-center justify-center gap-2 py-3"
          >
            Crea unha conta
          </button>
          <p className="mt-4 text-center text-sm text-gray-500">
            Xa estás rexistrado?{" "}
            <Link to="/login" className="hover:underline text-wearvana-accent">
              Inicia sesión
            </Link>
          </p>
          {errMsg && (
            <p
              className="text-center text-red-500 text-sm mt-2"
              aria-live="assertive"
            >
              {errMsg}
            </p>
          )}
        </section>
      </div>
    </>
  );
}
