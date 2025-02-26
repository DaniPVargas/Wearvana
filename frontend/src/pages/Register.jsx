import { useContext, useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthProvider";
import AuthClient from "../services/AuthClient";
import * as Passwordless from "@passwordlessdev/passwordless-client";

const PASSWORDLESS_API_KEY = "wearvana:public:a72fe9ba831b4292808084b49406b3d3";
const PASSWORDLESS_API_URL = "https://v4.passwordless.dev";

export default function Register() {
  const nameRef = useRef(null);
  const [fullName, setFullName] = useState("");
  const [alias, setAlias] = useState("");
  const [description, setDescription] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const { setAuth, setUserID } = useContext(AuthContext);
  const navigate = useNavigate();

  const isFormValid = fullName.trim() && alias.trim() && description.trim();

  // Focus on the alias input when the component mounts
  useEffect(() => {
    nameRef.current.focus();
  }, []);

  // Clean up the error message when the user changes the alias
  useEffect(() => {
    setErrMsg("");
  }, [alias]);

  const handleSubmit = async (e) => {
    let registerToken = null;

    // Load a random image as a file
    const randomImage = Math.random() < 0.5 ? "male.png" : "female.png";
    const response = await fetch(`/${randomImage}`);
    const imageBlob = await response.blob();
    const imageFile = new File([imageBlob], randomImage, {
      type: imageBlob.type,
    });

    const authClientInstance = new AuthClient();

    try {
      registerToken = await authClientInstance.register(
        fullName,
        alias,
        description,
        ""
      );
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
        const response = await authClientInstance.signIn(token);
        setAuth(response.token_id);
        setUserID(response.user_id);

        // Update user info to upload the image
        try {
          const imageUrl = await authClientInstance.uploadImage(
            imageFile,
            response.user_id
          );
          authClientInstance.updateUser(
            response.user_id,
            fullName,
            description,
            imageUrl
          );
        } catch (error) {
          setErrMsg(error.message);
          console.log("Error uploading image or updating user", error);
          // Show an advice in the UI
        }

        navigate("/");
      } else {
        setErrMsg(error);
      }
    }
  };

  return (
    <div className="max-w-md px-5 mx-auto flex items-center justify-center min-h-screen bg-ig-primary">
      <section className="w-full p-6 bg-white rounded-lg shadow-lg">
        <img src="/logo.svg" alt="Logo" className="mx-auto mb-4 w-48 h-48" />
        <p className="text-center text-lg text-gray-500 mb-12">A Rede Social da Moda</p>
        <div className="mb-4">
          <input
            type="text"
            id="fullname"
            ref={nameRef}
            autoComplete="off"
            onChange={(e) => setFullName(e.target.value)}
            value={fullName}
            required
            placeholder="Nome completo"
            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            id="alias"
            autoComplete="off"
            onChange={(e) => setAlias(e.target.value)}
            value={alias}
            required
            placeholder="Alias"
            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="mb-4">
          <textarea
            id="description"
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            required
            placeholder="Descrición"
            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          onClick={handleSubmit}
          className="wearvana-button w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50"
          disabled={!isFormValid}
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
  );
}
