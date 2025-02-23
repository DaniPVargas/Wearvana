import { Settings, MapPin, Link as LinkIcon, X, Upload, Camera, Image as ImageIcon } from "lucide-react";
import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthProvider";
import AuthClient from "../services/AuthClient";
import Skeleton from "../components/Skeleton";
import PostsGridFeed from '../components/PostsGridFeed';

export default function Profile() {
  const navigate = useNavigate();
  const { setAuth, userID, setUserID } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [newProfileImage, setNewProfileImage] = useState(null);
  const [newProfileImagePreview, setNewProfileImagePreview] = useState(null);
  const profileImageInputRef = useRef(null);
  const [showPhotoUploadModal, setShowPhotoUploadModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

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

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const authClientInstance = new AuthClient();
        const userData = await authClientInstance.getUser(userID);
        setUser(userData);

        const postsData = await authClientInstance.getUserPosts(userID);
        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userID) {
      fetchUserData();
    }

    // Listen for profile updates
    const handleProfileUpdate = () => {
      fetchUserData();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [userID]);

  // Update description state when user data is loaded
  useEffect(() => {
    if (user) {
      setNewDescription(user.description || "");
    }
  }, [user]);

  const handleProfileImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecciona una imagen.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no puede superar los 5MB.");
      return;
    }

    setNewProfileImage(file);
    setNewProfileImagePreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    try {
      const authClientInstance = new AuthClient();
      
      // If there's a new profile image, upload it first
      let profilePictureUrl = user.profile_picture_url;
      if (newProfileImage) {
        profilePictureUrl = await authClientInstance.uploadImage(newProfileImage, userID);
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

      // Close modals and reset states
      setShowEditProfileModal(false);
      setShowSettingsModal(false);
      setNewProfileImage(null);
      setNewProfileImagePreview(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error al actualizar el perfil. Por favor, inténtalo de nuevo.");
    }
  };

  const startCamera = async () => {
    try {
      setShowCamera(true);
      setShowPhotoUploadModal(false);

      await new Promise(resolve => setTimeout(resolve, 100));

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 720 },
          height: { ideal: 1280 },
          aspectRatio: { ideal: 9/16 }
        },
        audio: false
      });
      
      if (!videoRef.current) {
        throw new Error('Video element not found');
      }

      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      
      videoRef.current.addEventListener('canplay', function handleCanPlay() {
        videoRef.current.removeEventListener('canplay', handleCanPlay);
        videoRef.current.play()
          .then(() => {
            setCameraError(null);
          })
          .catch(err => {
            console.error('Error playing video:', err);
            setCameraError('Error al iniciar la cámara. Por favor, recarga la página.');
          });
      });
    } catch (err) {
      console.error('Error accessing camera:', err);
      setCameraError('No se pudo acceder a la cámara. Por favor, permite el acceso.');
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    try {
      if (!videoRef.current || !canvasRef.current) {
        console.error('Video or canvas element not found');
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error('Failed to capture photo');
          return;
        }

        const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
        setNewProfileImage(file);
        setNewProfileImagePreview(URL.createObjectURL(blob));
        stopCamera();
      }, 'image/jpeg', 0.8);
    } catch (error) {
      console.error('Error capturing photo:', error);
      setCameraError('Error al capturar la foto. Por favor, inténtalo de nuevo.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
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

  if (isLoading || !user) {
    return (
      <div className="pb-4 max-w-7xl mx-auto px-4">
        {/* Profile Header Skeleton */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <Skeleton className="w-20 h-20 md:w-32 md:h-32 rounded-full" />
            <div>
              <Skeleton className="w-32 h-6 mb-2 rounded" />
              <Skeleton className="w-24 h-4 rounded" />
            </div>
          </div>
          <Skeleton className="w-28 h-10 rounded-lg" />
        </div>

        {/* Bio Section Skeleton */}
        <div className="mb-6">
          <Skeleton className="w-3/4 h-4 mb-2 rounded" />
          <div className="flex flex-col gap-2">
            <Skeleton className="w-1/2 h-4 rounded" />
            <Skeleton className="w-1/3 h-4 rounded" />
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="flex justify-around mb-8 py-4 border-y border-gray-200">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="text-center">
              <Skeleton className="w-12 h-6 mb-1 mx-auto rounded" />
              <Skeleton className="w-20 h-4 mx-auto rounded" />
            </div>
          ))}
        </div>

        {/* Items Grid Skeleton */}
        <div>
          <Skeleton className="w-40 h-8 mb-4 rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(9)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-4 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-6">
              <img
                src={user.profile_picture_url}
                alt={user.user_alias}
                className="w-20 h-20 md:w-32 md:h-32 rounded-full border-2 border-gray-200"
              />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{user.user_alias}</h1>
                <p className="text-gray-600 text-lg">@{user.user_alias.toLowerCase()}</p>
              </div>
            </div>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="md:hidden wearvana-button flex items-center gap-2 self-start"
            >
              <Settings size={16} />
              <span>Axustes</span>
            </button>
          </div>

          {/* Bio Section */}
          <div className="mb-6 max-w-2xl">
            <p className="text-gray-800 mb-2 text-lg">{user.description || "No description provided"}</p>
          </div>

          {/* Stats */}
          <div className="flex justify-around py-4 border-y border-gray-200 max-w-2xl">
            <div className="text-center">
              <div className="font-bold text-xl">{posts.length}</div>
              <div className="text-gray-600">Publicaciones</div>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <PostsGridFeed posts={posts} user={user} />
        </div>
      </div>

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
      {showEditProfileModal && (
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
          className="fixed inset-0 bg-black/50 z-[90] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPhotoUploadModal(false);
            }
          }}
        >
          <div className="bg-white w-full max-w-sm rounded-xl">
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
                  <button
                    onClick={stopCamera}
                    className="wearvana-button"
                  >
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
    </div>
  );
}
