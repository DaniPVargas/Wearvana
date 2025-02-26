import { useContext, useRef, useState } from "react";
import authContext from "../context/AuthProvider";
import * as Passwordless from "@passwordlessdev/passwordless-client";
import AuthClient from "../services/AuthClient";
import { Link, useNavigate } from "react-router-dom";

const PASSWORDLESS_API_KEY = "wearvana:public:a72fe9ba831b4292808084b49406b3d3";
const PASSWORDLESS_API_URL = "https://v4.passwordless.dev";

export default function LoginPage() {
  const [errMsg, setErrMsg] = useState("");
  const { setAuth, setUserID } = useContext(authContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    try {
      const passwordless = new Passwordless.Client({
        apiUrl: PASSWORDLESS_API_URL,
        apiKey: PASSWORDLESS_API_KEY,
      });
      const authClientInstance = new AuthClient();

      const token = await passwordless.signinWithDiscoverable();
      if (!token) {
        setErrMsg(
          "Non tes unha passkey asociada a este navegador.\nPor favor, inicia sesión"
        );
        return;
      }

      const response = await authClientInstance.signIn(token.token);

      setAuth(response.token_id);
      setUserID(response.user_id);

      console.log("Logged in");
      navigate("/");
    } catch (error) {
      setErrMsg("Erro ao iniciar sesion");
    }
  };

  return (
    <div className="max-w-md px-5 mx-auto flex items-center justify-center min-h-screen bg-ig-primary">
      <section className="w-full p-6 bg-white rounded-lg shadow-lg">
        <img src="/logo.svg" alt="Logo" className="mx-auto mb-4 w-48 h-48" />
        <p className="text-center text-lg text-gray-500 mb-12">
          A Rede Social da Moda
        </p>
        <button
          onClick={handleSubmit}
          className="wearvana-button w-full flex items-center justify-center gap-2 py-3"
        >
          Iniciar sesión
        </button>
        <p className="mt-4 text-center text-sm text-gray-500">
          Aínda non tes unha conta?{" "}
          <Link to="/register" className="hover:underline text-wearvana-accent">
            Crea unha conta
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
  );
}
