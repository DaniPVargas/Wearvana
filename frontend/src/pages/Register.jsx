import { useEffect, useRef, useState } from "react";
import * as Passwordless from "@passwordlessdev/passwordless-client";
import { ToastContainer, toast } from "react-toastify";
import AuthClient from "../services/AuthClient";

export default function RegisterPage() {
  const aliasRef = useRef();
  const [alias, setAlias] = useState("");
  const [errMsg, setErrMsg] = useState("");

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
    try {
      const authClientInstance = new AuthClient();

      // Register the alias with AuthClient
      registerToken = await authClientInstance.register(alias);
    } catch (error) {
      toast(error.message, {
        className: "toast-error",
      });
      console.log(registerToken);
      console.log("Error registering user", error);
    }

    if (registerToken) {
      console.log(registerToken);
      const p = new Passwordless.Client({
        apiKey: PASSWORDLESS_API_KEY,
        apiUrl: PASSWORDLESS_API_URL,
      });

      // Use the alias for the credential nickname
      const credentialNickname = alias;
      //   const finalResponse = await p.register(
      //     registerToken.token,
      //     credentialNickname
      //   );
      finalResponse = true;

      if (finalResponse) {
        toast(`Registered '${alias}'!`);
        console.log(`Registered '${alias}'!`);
      }
    }
  };

  return (
    <>
      <div className="max-w-md px-5 mx-auto flex items-center justify-center min-h-screen bg-ig-primary">
        <section className="w-full mt-8 p-6 bg-white rounded-lg shadow-lg">
          {errMsg && (
            <p className="text-red-500 text-sm mb-4" aria-live="assertive">
              {errMsg}
            </p>
          )}
          <h1 className="text-2xl font-semibold text-center mb-4">Register</h1>
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
            Register
          </button>
          <p className="mt-4 text-center text-sm text-gray-500">
            Already registered?{" "}
            <a href="#" className="text-ig-link hover:underline">
              Sign in
            </a>
          </p>
          <ToastContainer />
        </section>
      </div>
    </>
  );
}
