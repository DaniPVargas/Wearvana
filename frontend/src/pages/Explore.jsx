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

const coats = [
  "https://static.zara.net/assets/public/4b25/539e/98124491af29/8e2d9b8cd22c/07522043505-e1/07522043505-e1.jpg?ts=1739884066200&w=850",
  "https://static.zara.net/assets/public/44ec/5e80/42c642dca4c8/95a11bb99a4c/03046037681-e1/03046037681-e1.jpg?ts=1738230460267&w=850",
  "https://static.zara.net/assets/public/85d2/538c/452147f88559/59f0c1cb0f1b/03046067704-e1/03046067704-e1.jpg?ts=1737998230493&w=850",
  "https://static.zara.net/assets/public/36a8/abbd/d9864d4e9b09/70481aba33f4/08372023800-e1/08372023800-e1.jpg?ts=1738841262076&w=850",
  "https://static.zara.net/assets/public/516b/6d05/dd884a4a9a85/28a57ccf0dc2/06318032712-e1/06318032712-e1.jpg?ts=1736350984704&w=850",
  "https://static.zara.net/assets/public/0850/9386/2c0c43388066/8c15bc98bb42/04341855675-e1/04341855675-e1.jpg?ts=1737474985492&w=850",
];

const trousers = [
  "https://static.zara.net/assets/public/6e5a/a4d4/644c4811ace6/bc35701ed56f/03581041800-e1/03581041800-e1.jpg?ts=1730389565655&w=850",
  "https://static.zara.net/assets/public/6cff/5361/a2734d20b5d8/f6101bfc90ee/06688220400-e1/06688220400-e1.jpg?ts=1722518584943&w=850",
  "https://static.zara.net/assets/public/afe4/89b7/f2484bd8ae58/7ddd12a5613f/09632252407-e1/09632252407-e1.jpg?ts=1730627502960&w=850",
  "https://static.zara.net/assets/public/4f57/e253/d05547ec802b/f7073d4facc2/00103011700-e1/00103011700-e1.jpg?ts=1738844073331&w=850",
  "https://static.zara.net/assets/public/119d/55d1/622c4e68a862/64fdb5915d68/08727013400-e1/08727013400-e1.jpg?ts=1738668043592&w=850",
];

const shirts = [
  "https://static.zara.net/assets/public/b2b6/4357/95af428f9242/6a4ef2dfb98e/04174318511-e1/04174318511-e1.jpg?ts=1739870817425&w=850",
  "https://static.zara.net/assets/public/4cd0/54a4/c6e44e6ab784/856cbe946ee9/05644151671-e1/05644151671-e1.jpg?ts=1739984155919&w=850",
  "https://static.zara.net/assets/public/bab2/4e1d/3a2b48498e62/de3cd9035dfe/05644154250-e1/05644154250-e1.jpg?ts=1738329956988&w=850",
  "https://static.zara.net/assets/public/6aa7/84b8/d3dc4dd19321/1e8336e37191/00264174250-e2/00264174250-e2.jpg?ts=1738841007351&w=850",
  "https://static.zara.net/assets/public/3f3d/dbe5/23a64b3383c7/89eba3726c71/04174378104-e1/04174378104-e1.jpg?ts=1738059280739&w=850",
];

const shoes = [
  "https://static.zara.net/assets/public/65d0/4bd9/2d9d460dbb1f/f0da18dfa18a/12210410800-e2/12210410800-e2.jpg?ts=1737727246603&w=850",
  "https://static.zara.net/assets/public/17cc/6fe1/34394a808d37/178ab3fff527/13550410800-e1/13550410800-e1.jpg?ts=1735576015724&w=850",
  "https://static.zara.net/assets/public/775a/64d3/10e947729cde/af4eed2e62a8/12112410800-e1/12112410800-e1.jpg?ts=1729507714405&w=850",
  "https://static.zara.net/assets/public/55a2/1006/27fc4697a342/4add59358f08/15402510025-e1/15402510025-e1.jpg?ts=1732015406217&w=850",
  "https://static.zara.net/assets/public/3f49/f1dc/bc564b3e8ec2/f5407a803484/15412510500-e1/15412510500-e1.jpg?ts=1739782997089&w=850",
];
const general = [
  "https://static.zara.net/assets/public/3fba/c469/61864877a1e8/9abd9a9edfc9/09967003051-000-e1/09967003051-000-e1.jpg?ts=1739868697024&w=850",
];

function getRandomImageUrl(category) {
  const allImages = [...coats, ...trousers, ...shirts, ...shoes, ...general];

  switch (category) {
    case 1:
      return coats[Math.floor(Math.random() * coats.length)];
    case 2:
      return trousers[Math.floor(Math.random() * trousers.length)];
    case 3:
      return shirts[Math.floor(Math.random() * shirts.length)];
    case 4:
      return shoes[Math.floor(Math.random() * shoes.length)];
    case 5:
    default:
      return allImages[Math.floor(Math.random() * allImages.length)];
  }
}

function ProductCard({
  image,
  name,
  current_price,
  original_price,
  link,
  brand,
  loading,
  category,
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
        <img
          src={getRandomImageUrl(category)}
          alt={name}
          className="rounded-lg"
        />
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

function EmptyState({ message, icon: Icon = SearchX, suggestion }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Icon className="h-12 w-12 text-gray-400 mb-4" />
      <p className="text-gray-500 text-center mb-2">{message}</p>
      {suggestion && (
        <p className="text-sm text-gray-400 text-center">{suggestion}</p>
      )}
    </div>
  );
}

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
  const [inspirationResults, setInspirationResults] = useState([]);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const { userID } = useContext(AuthContext);
  const [category, setCategory] = useState(5);
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
    "Camiseta para el gimnasio...",
  ];

  const categoryKeywords = {
    1: [
      "chaqueta",
      "abrigo",
      "chamarra",
      "cazadora",
      "anorak",
      "gabardina",
      "trench",
      "parka",
      "impermeable",
      "plumas",
      "bomber",
      "blazer",
      "chaqueta" /* gl */,
      "abrigo" /* gl */,
      "jacket" /* en */,
      "coat" /* en */,
      "raincoat" /* en */,
    ],
    2: [
      "pantalón",
      "pantalones",
      "jeans",
      "vaquero",
      "short",
      "bermuda",
      "chándal",
      "leggins",
      "joggers",
      "cargo",
      "mallas",
      "capri",
      "pantalóns" /* gl */,
      "vaqueiros" /* gl */,
      "trousers" /* en */,
      "pants" /* en */,
      "shorts" /* en */,
    ],
    3: [
      "camiseta",
      "playera",
      "polo",
      "blusa",
      "top",
      "crop top",
      "jersey",
      "suéter",
      "chaleco",
      "hoodie",
      "sudadera",
      "camisa",
      "camisa" /* gl */,
      "suadoiro" /* gl */,
      "t-shirt" /* en */,
      "shirt" /* en */,
      "sweater" /* en */,
      "hoodie" /* en */,
    ],
    4: [
      "zapato",
      "zapatos",
      "tenis",
      "botines",
      "sandalia",
      "zapatilla",
      "mocasín",
      "oxford",
      "alpargata",
      "chancla",
      "sneaker",
      "zapatilla" /* gl */,
      "bota" /* gl */,
      "shoe" /* en */,
      "sneaker" /* en */,
      "boots" /* en */,
      "sandals" /* en */,
    ],
  };

  // Set random initial suggestion when component mounts
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * searchSuggestions.length);
    setCurrentSuggestionIndex(randomIndex);
  }, []);

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

  useEffect(() => {
    // Find if any prestablished category fit into the query
    let foundCategory = 5;
    for (const [key, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((word) => searchQuery.toLowerCase().includes(word))) {
        foundCategory = parseInt(key);
        break;
      }
    }
    setCategory(foundCategory);
  }, [searchQuery]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    setSearchResults([]);

    const authClientInstance = new AuthClient();

    try {
      const data = await authClientInstance.textSearch(searchQuery);
      setSearchResults(data || []);
    } catch (error) {
      console.log(error);
      setSearchResults([]);
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
    setInspirationResults([]);

    const authClientInstance = new AuthClient();

    try {
      const data = await authClientInstance.imageSearch(file, userID);
      setInspirationResults(data || []);
    } catch (error) {
      console.log(error);
      setInspirationResults([]);
    } finally {
      setIsLoading(false);
    }
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
          facingMode: "environment",
          width: { ideal: 1080 },
          height: { ideal: 1080 },
          aspectRatio: { ideal: 1 },
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
                          suggestions={[
                            searchSuggestions[currentSuggestionIndex],
                          ]}
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
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80] flex items-center justify-center">
                  <div className="relative w-full max-w-md aspect-square bg-black rounded-xl overflow-hidden m-4">
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
                  {isLoading ? (
                    Array(6)
                      .fill(null)
                      .map((_, i) => <ProductCard key={i} loading={true} />)
                  ) : (activeTab === "search"
                      ? searchResults
                      : inspirationResults
                    ).length > 0 ? (
                    (activeTab === "search"
                      ? searchResults
                      : inspirationResults
                    ).map((product, index) => (
                      <ProductCard
                        key={index}
                        name={product.name}
                        current_price={product.current_price}
                        original_price={product.original_price}
                        link={product.link}
                        brand={product.brand}
                        loading={false}
                        category={category}
                      />
                    ))
                  ) : (
                    <div className="col-span-full">
                      <EmptyState
                        message={
                          activeTab === "search"
                            ? "No se encontraron productos que coincidan con tu búsqueda"
                            : "No se encontraron productos similares a tu imagen"
                        }
                        suggestion={
                          activeTab === "search"
                            ? "Intenta con otros términos o categorías"
                            : "Prueba con otra imagen o ajusta el encuadre de la foto"
                        }
                      />
                    </div>
                  )}
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
