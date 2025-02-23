import {
  Home,
  Search,
  Telescope,
  User,
  Settings,
  X,
  Upload,
  Image as ImageIcon,
  Camera,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext, useRef } from "react";
import authContext from "../context/AuthProvider";
import UploadModal from "./UploadModal";
import AuthClient from "../services/AuthClient";

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setAuth, userID, setUserID } = useContext(authContext);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [newProfileImage, setNewProfileImage] = useState(null);
  const [newProfileImagePreview, setNewProfileImagePreview] = useState(null);
  const [user, setUser] = useState(null);
  const profileImageInputRef = useRef(null);
  const [showPhotoUploadModal, setShowPhotoUploadModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Add scroll lock effect
  useEffect(() => {
    if (showSettingsModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showSettingsModal]);

  // Fetch user data when needed
  useEffect(() => {
    const fetchUserData = async () => {
      if (showEditProfileModal && !user) {
        try {
          const authClientInstance = new AuthClient();
          const userData = await authClientInstance.getUser(userID);
          setUser(userData);
          setNewDescription(userData.description || "");
        } catch (error) {
          console.error("Erro ao buscar datos do usuario:", error);
        }
      }
    };

    fetchUserData();
  }, [showEditProfileModal, userID, user]);

  const handleProfileImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecciona unha imaxe.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("A imaxe non pode superar os 5MB.");
      return;
    }

    setNewProfileImage(file);
    setNewProfileImagePreview(URL.createObjectURL(file));
    setShowPhotoUploadModal(false);
  };

  const handleSaveProfile = async () => {
    try {
      const authClientInstance = new AuthClient();

      // If there's a new profile image, upload it first
      let profilePictureUrl = user.profile_picture_url;
      if (newProfileImage) {
        profilePictureUrl = await authClientInstance.uploadImage(
          newProfileImage,
          userID
        );
      }

      // Update user profile with all required fields
      await authClientInstance.updateUser(
        userID,
        user.complete_name, // Keep existing complete_name
        newDescription,
        profilePictureUrl
      );

      // Refresh user data
      const userData = await authClientInstance.getUser(userID);
      setUser(userData);

      // Dispatch event to notify profile update
      window.dispatchEvent(new CustomEvent("profileUpdated"));

      // Close modals and reset states
      setShowEditProfileModal(false);
      setShowSettingsModal(false);
      setNewProfileImage(null);
      setNewProfileImagePreview(null);
    } catch (error) {
      console.error("Erro ao actualizar o perfil:", error);
      alert("Erro ao actualizar o perfil. Por favor, inténtao de novo.");
    }
  };

  const startCamera = async () => {
    try {
      setShowCamera(true);
      setShowPhotoUploadModal(false);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 720 },
          height: { ideal: 1280 },
          aspectRatio: { ideal: 9 / 16 },
        },
        audio: false,
      });

      if (!videoRef.current) {
        throw new Error("Non se atopou o elemento de vídeo");
      }

      videoRef.current.srcObject = stream;
      streamRef.current = stream;

      videoRef.current.addEventListener("canplay", function handleCanPlay() {
        videoRef.current.removeEventListener("canplay", handleCanPlay);
        videoRef.current
          .play()
          .then(() => {
            setCameraError(null);
          })
          .catch((err) => {
            console.error("Erro ao reproducir o vídeo:", err);
            setCameraError(
              "Erro ao iniciar a cámara. Por favor, recarga a páxina."
            );
          });
      });
    } catch (err) {
      console.error("Erro ao acceder á cámara:", err);
      setCameraError(
        "Non se puido acceder á cámara. Por favor, permite o acceso."
      );
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    try {
      if (!videoRef.current || !canvasRef.current) {
        console.error("Non se atopou o vídeo ou o canvas");
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            console.error("Erro ao capturar a foto");
            return;
          }

          const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
          setNewProfileImage(file);
          setNewProfileImagePreview(URL.createObjectURL(blob));
          stopCamera();
        },
        "image/jpeg",
        0.8
      );
    } catch (error) {
      console.error("Erro ao capturar a foto:", error);
      setCameraError(
        "Erro ao capturar a foto. Por favor, inténtao de novo."
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const handleImageUpload = (e) => {
    e.preventDefault();
    profileImageInputRef.current?.click();
  };

  const navItems = [
    { icon: Home, label: "Inicio", path: "/" },
    { icon: Search, label: "Buscar", path: "/search" },
    { icon: Telescope, label: "Explorar", path: "/explore" },
    { icon: User, label: "Perfil", path: "/profile" },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed md:hidden bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex justify-around items-center h-16">
            {navItems.map(({ icon: Icon, label, path }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "text-wearvana-accent"
                      : "text-wearvana-muted hover:text-wearvana-accent"
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 ${
                      isActive ? "stroke-2" : "stroke-1.5"
                    }`}
                  />
                  <span className="text-xs font-medium">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Desktop Left Sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-[244px] bg-white border-r border-gray-200 z-50 flex-col py-8 px-3">
        <div className="mb-8 px-3">
          <h1 className="text-xl tracking-widest font-light">WEARVANA</h1>
        </div>
        <div className="flex flex-col gap-1 flex-1">
          {navItems.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-4 px-3 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "text-wearvana-accent font-medium"
                    : "text-wearvana-primary hover:bg-gray-50"
                }`}
              >
                <Icon
                  className={`h-6 w-6 ${isActive ? "stroke-2" : "stroke-1.5"}`}
                />
                <span className="text-base">{label}</span>
              </Link>
            );
          })}
          <div className="flex-1" />
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-4 px-3 py-3 rounded-lg transition-colors text-wearvana-primary hover:bg-gray-50"
          >
            <Upload className="h-6 w-6 stroke-1.5" />
            <span className="text-base">Subir</span>
          </button>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center gap-4 px-3 py-3 rounded-lg transition-colors text-wearvana-primary hover:bg-gray-50"
          >
            <Settings className="h-6 w-6 stroke-1.5" />
            <span className="text-base">Axustes</span>
          </button>
        </div>
      </nav>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div
          className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSettingsModal(false);
            }
          }}
        >
          <div className="bg-white w-full max-w-sm rounded-xl overflow-hidden">
            <div className="border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Axustes</h2>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <button
                className="w-full flex items-center justify-center px-4 py-3 wearvana-button"
                onClick={() => {
                  setShowEditProfileModal(true);
                }}
              >
                <span>Editar perfil</span>
              </button>
              <button
                className="w-full flex items-center justify-center px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                onClick={() => {
                  localStorage.removeItem("jwt");
                  localStorage.removeItem("userID");
                  setAuth("");
                  setUserID("");
                  setShowSettingsModal(false);
                  navigate("/login");
                }}
              >
                <span>Pechar sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfileModal && user && (
        <div
          className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditProfileModal(false);
            }
          }}
        >
          <div className="bg-white w-full max-w-md rounded-xl overflow-hidden">
            <div className="border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Editar perfil</h2>
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Profile Image Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto de perfil
                </label>
                <div className="flex items-center gap-4">
                  <img
                    src={newProfileImagePreview || user.profile_picture_url}
                    alt={user.user_alias}
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                  />
                  <input
                    type="file"
                    ref={profileImageInputRef}
                    onChange={handleProfileImageSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => setShowPhotoUploadModal(true)}
                    className="wearvana-button flex items-center gap-2 !bg-white !text-black border border-gray-200"
                  >
                    <ImageIcon className="h-5 w-5" />
                    <span>Cambiar foto</span>
                  </button>
                </div>
              </div>

              {/* Description Section */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Descripción
                </label>
                <textarea
                  id="description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="wearvana-input min-h-[100px]"
                  placeholder="Escribe una descripción sobre ti..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowEditProfileModal(false)}
                  className="flex-1 py-2 px-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 wearvana-button"
                >
                  Guardar cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Upload Modal */}
      {showPhotoUploadModal && (
        <div
          className="fixed inset-0 bg-black/50 z-[90] flex items-end md:items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPhotoUploadModal(false);
            }
          }}
        >
          <div className="bg-white w-full max-w-sm md:rounded-xl md:mb-0 rounded-t-xl">
            <div className="flex flex-col gap-4 p-4">
              <h3 className="text-lg font-semibold text-center mb-2">
                Cambiar foto de perfil
              </h3>
              <button
                onClick={startCamera}
                className="wearvana-button w-full flex items-center justify-center gap-2 py-3"
              >
                <Camera className="h-5 w-5" />
                <span>Hacer foto</span>
              </button>
              <button
                onClick={handleImageUpload}
                className="wearvana-button w-full flex items-center justify-center gap-2 py-3 !bg-white !text-black border border-gray-200"
              >
                <ImageIcon className="h-5 w-5" />
                <span>Subir de galería</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera View */}
      {showCamera && (
        <div className="fixed inset-0 bg-black z-[100]">
          <div className="relative h-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {cameraError ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-white text-center px-4">
                  <p className="mb-4">{cameraError}</p>
                  <button onClick={stopCamera} className="wearvana-button">
                    Cerrar
                  </button>
                </div>
              </div>
            ) : (
              <div className="absolute bottom-0 inset-x-0 p-4 flex justify-center">
                <div className="w-full px-10 flex items-center">
                  <button
                    onClick={stopCamera}
                    className="p-3 bg-white/90 rounded-full text-black shadow-lg hover:bg-white"
                    style={{ backdropFilter: "blur(4px)" }}
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <div className="flex-grow flex justify-center">
                    <button
                      onClick={capturePhoto}
                      className="p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transform active:scale-95 transition-transform"
                      style={{
                        width: "64px",
                        height: "64px",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      <div className="w-full h-full rounded-full border-4 border-black/20" />
                    </button>
                  </div>
                  <div className="w-[44px]" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />
    </>
  );
}
