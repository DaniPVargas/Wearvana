import { useState, useRef, useEffect, useContext } from "react";
import {
  Search,
  Upload,
  SearchX,
  X,
  Camera,
  Image,
  RotateCcw,
  ChevronDown,
  Send,
} from "lucide-react";
import Skeleton from "../components/Skeleton";
import TypewriterPlaceholder from "../components/TypewriterPlaceholder";
import AuthClient from "../services/AuthClient";
import AuthContext from "../context/AuthProvider";

function ProductCard({
  image,
  name,
  current_price,
  original_price,
  link,
  brand,
  loading,
}) {
  if (loading) {
    return (
      <div className="flex flex-col">
        <Skeleton className="aspect-[3/4] rounded-lg mb-2" />
        <Skeleton className="h-4 w-3/4 rounded mb-1" />
        <Skeleton className="h-4 w-1/4 rounded" />
      </div>
    );
  }

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col group hover:shadow-lg transition-shadow duration-200 rounded-lg p-2"
    >
      <div className="aspect-[3/4] bg-wearvana-light rounded-lg mb-2 flex items-center justify-center">
        <span className="text-wearvana-muted">No preview available</span>
      </div>
      <h3 className="text-sm font-medium text-wearvana-primary line-clamp-1 group-hover:text-wearvana-accent transition-colors">
        {name}
      </h3>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{current_price}€</p>
        <span className="text-xs text-wearvana-muted capitalize">{brand}</span>
      </div>
    </a>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <SearchX className="h-12 w-12 text-gray-400 mb-4" />
      <p className="text-gray-500 text-center">{message}</p>
    </div>
  );
}

// Add mock data at the top of the file, after imports
const MOCK_SEARCH_RESULTS = [
  {
    id: "367022517",
    name: "GEOMETRIC JACQUARD SHIRT",
    price: {
      currency: "EUR",
      value: {
        current: 29.95,
      },
    },
    link: "https://www.zara.com/es/en/geometric-jacquard-shirt-p01618475.html?v1=367022517",
    brand: "zara",
  },
  {
    id: "364086315",
    name: "COTTON - LINEN SHIRT",
    price: {
      currency: "EUR",
      value: {
        current: 29.95,
      },
    },
    link: "https://www.zara.com/es/en/cotton---linen-shirt-p01063402.html?v1=364086315",
    brand: "zara",
  },
];

// Add mock data for image search
const MOCK_IMAGE_SEARCH_RESULTS = [
  {
    id: "367022517",
    name: "GEOMETRIC JACQUARD SHIRT",
    price: {
      currency: "EUR",
      value: {
        current: 29.95,
      },
    },
    link: "https://www.zara.com/es/en/geometric-jacquard-shirt-p01618475.html?v1=367022517",
    brand: "zara",
  },
  {
    id: "364086315",
    name: "COTTON - LINEN SHIRT",
    price: {
      currency: "EUR",
      value: {
        current: 29.95,
      },
    },
    link: "https://www.zara.com/es/en/cotton---linen-shirt-p01063402.html?v1=364086315",
    brand: "zara",
  },
];

export default function Explore() {
  const [activeTab, setActiveTab] = useState("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [hasUploaded, setHasUploaded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [flash, setFlash] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const canvasRef = useRef(null);
  const [showPreviewOptions, setShowPreviewOptions] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const { userID } = useContext(AuthContext);

  // Fixed dimensions for the photo
  const width = 720;
  let height = 0;

  const searchSuggestions = [
    "Vestido para mi graduación...",
    "Camiseta azul manga corta...",
    "Pantalones vaqueros rotos...",
    "Chaqueta de cuero negra...",
    "Zapatos para una boda...",
    "Sudadera oversize gris...",
  ];

  // Mock data - would come from API
  const products = [
    {
      id: 1,
      name: "Oversized Blazer",
      price: 49.99,
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-HbpRL3prpms6Fn7t544TSccClzI2lb.png",
    },
    {
      id: 2,
      name: "Linen Blend Shirt",
      price: 29.99,
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-HbpRL3prpms6Fn7t544TSccClzI2lb.png",
    },
  ];

  // Add scroll lock effect
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal]);

  // Add scroll to top effect
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    const authClientInstance = new AuthClient();

    try {
      const data = await authClientInstance.textSearch(searchQuery);
      setSearchResults(data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  const searchByImage = async (file) => {
    setIsLoading(true);
    setHasSearched(true);

    const authClientInstance = new AuthClient();

    try {
      const data = await authClientInstance.imageSearch(file, userID);
    } catch (error) {
      console.log(error);
    } finally {
      setSearchResults(MOCK_IMAGE_SEARCH_RESULTS);
      setIsLoading(false);
    }

    // Comment out the actual API call for now
    /*
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/clothing:image_search`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching by image:', error);
    } finally {
      setIsLoading(false);
    }
    */
  };

  const handleFileSelect = async (e) => {
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

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setHasUploaded(true);
    setShowModal(false);
    await searchByImage(file);
  };

  const startCamera = async () => {
    try {
      setShowCamera(true);
      setShowModal(false);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false,
      });

      if (!videoRef.current) {
        throw new Error("Video element not found");
      }

      videoRef.current.srcObject = stream;
      streamRef.current = stream;

      videoRef.current.addEventListener("canplay", function handleCanPlay() {
        videoRef.current.removeEventListener("canplay", handleCanPlay);

        height =
          videoRef.current.videoHeight / (videoRef.current.videoWidth / width);

        if (isNaN(height)) {
          height = width / (4 / 3);
        }

        videoRef.current.setAttribute("width", width);
        videoRef.current.setAttribute("height", height);
        if (canvasRef.current) {
          canvasRef.current.setAttribute("width", width);
          canvasRef.current.setAttribute("height", height);
        }

        videoRef.current
          .play()
          .then(() => {
            setStreaming(true);
            setCameraError(null);
          })
          .catch((err) => {
            console.error("Error playing video:", err);
            setCameraError(
              "Error al iniciar la cámara. Por favor, recarga la página."
            );
          });
      });
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError(
        "No se pudo acceder a la cámara. Por favor, permite el acceso."
      );
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    try {
      if (!videoRef.current || !canvasRef.current) {
        console.error("Video or canvas element not found");
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      setFlash(true);
      setTimeout(() => setFlash(false), 200);

      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            console.error("Failed to capture photo");
            return;
          }

          const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
          setSelectedImage(file);
          setPreviewUrl(URL.createObjectURL(blob));
          setHasUploaded(true);
          stopCamera();
          await searchByImage(file);
        },
        "image/jpeg",
        0.8
      );
    } catch (error) {
      console.error("Error capturing photo:", error);
      setCameraError(
        "Error al capturar la foto. Por favor, inténtalo de nuevo."
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
    setStreaming(false);
    setShowCamera(false);
  };

  const startCountdown = () => {
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
        if (countdown === 1) {
          capturePhoto();
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setHasUploaded(false);
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const shouldShowProducts =
    (activeTab === "search" && hasSearched) ||
    (activeTab === "inspiration" && hasUploaded);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white sticky top-0 z-10">
            <div className="max-w-2xl mx-auto">
              <div className="flex border-b border-gray-200 relative">
                <button
                  className={`flex-1 py-3 text-center font-medium ${
                    activeTab === "search"
                      ? "text-wearvana-accent"
                      : "text-wearvana-muted"
                  }`}
                  onClick={() => setActiveTab("search")}
                >
                  Buscar
                </button>
                <button
                  className={`flex-1 py-3 text-center font-medium ${
                    activeTab === "inspiration"
                      ? "text-wearvana-accent"
                      : "text-wearvana-muted"
                  }`}
                  onClick={() => setActiveTab("inspiration")}
                >
                  Inspiración
                </button>
                <div
                  className="absolute bottom-0 h-0.5 bg-wearvana-accent transition-all duration-300 ease-in-out"
                  style={{
                    left: activeTab === "search" ? "0" : "50%",
                    width: "50%",
                  }}
                />
              </div>
            </div>
          </div>

          {activeTab === "search" && (
            <div className="px-4 max-w-2xl mx-auto">
              <form onSubmit={handleSearch} className="pt-4">
                <div className="relative">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="wearvana-input pl-10 pr-10"
                      placeholder=""
                    />
                    <div className="absolute left-10 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      {!searchQuery && (
                        <TypewriterPlaceholder
                          suggestions={searchSuggestions}
                        />
                      )}
                    </div>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-wearvana-accent transition-colors"
                    >
                      <Send className="h-full w-full" />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {activeTab === "inspiration" && (
            <div className="px-4 max-w-2xl mx-auto pt-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
              />
              {showCamera ? (
                <div className="relative mb-4">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: "100%",
                      height: "100%",
                      minHeight: "400px",
                      maxHeight: "80vh",
                      objectFit: "cover",
                      backgroundColor: "black",
                    }}
                    className="rounded-lg"
                  />
                  {flash && (
                    <div className="absolute inset-0 bg-white animate-flash" />
                  )}
                  {cameraError ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
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
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
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
              ) : previewUrl ? (
                <div className="relative mb-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setShowPreviewOptions(!showPreviewOptions)}
                    className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </button>
                  {showPreviewOptions && (
                    <div className="absolute top-16 right-4 bg-white rounded-lg shadow-lg overflow-hidden">
                      <button
                        onClick={() => {
                          setPreviewUrl(null);
                          setSelectedImage(null);
                          startCamera();
                          setShowPreviewOptions(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span>Volver a tomar</span>
                      </button>
                      <button
                        onClick={() => {
                          handleRemoveImage();
                          setShowPreviewOptions(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-t border-gray-100"
                      >
                        <div className="flex items-center gap-2">
                          <X className="h-4 w-4" />
                          <span>Cerrar</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowModal(true)}
                  className="wearvana-button w-full flex items-center justify-center gap-2 py-3"
                >
                  <Upload className="h-5 w-5" />
                  <span>Subir foto</span>
                </button>
              )}
            </div>
          )}

          <div className="px-4">
            <div className="max-w-7xl mx-auto">
              {shouldShowProducts ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {isLoading
                    ? Array(6)
                        .fill(null)
                        .map((_, i) => <ProductCard key={i} loading={true} />)
                    : searchResults.map((product, index) => (
                        <ProductCard
                          key={index}
                          name={product.name}
                          current_price={product.current_price}
                          original_price={product.original_price}
                          link={product.link}
                          brand={product.brand}
                          loading={false}
                        />
                      ))}
                </div>
              ) : (
                <div className="max-w-2xl mx-auto">
                  <EmptyState
                    message={
                      activeTab === "search"
                        ? "Busca prendas para ver resultados"
                        : "Sube una foto para encontrar prendas similares"
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Upload Options Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div className="bg-white w-full max-w-sm md:rounded-xl md:mb-0 rounded-t-xl">
            <div className="flex flex-col gap-4 p-4">
              <h3 className="text-lg font-semibold text-center mb-2">
                Subir foto
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
                <Image className="h-5 w-5" />
                <span>Subir de galería</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
