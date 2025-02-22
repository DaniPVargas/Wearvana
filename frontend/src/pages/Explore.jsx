import { useState, useRef, useEffect } from 'react';
import { Search, Upload, SearchX, X, Camera, Image, RotateCcw, ChevronDown } from 'lucide-react';
import Skeleton from '../components/Skeleton';
import TypewriterPlaceholder from '../components/TypewriterPlaceholder';

function ProductCard({ image, name, price, loading }) {
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
    <div className="flex flex-col">
      <img 
        src={image} 
        alt={name}
        className="aspect-[3/4] object-cover rounded-lg mb-2"
      />
      <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{name}</h3>
      <p className="text-sm font-semibold">{price}€</p>
    </div>
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

export default function Explore() {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
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
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-HbpRL3prpms6Fn7t544TSccClzI2lb.png"
    },
    {
      id: 2,
      name: "Linen Blend Shirt",
      price: 29.99,
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-HbpRL3prpms6Fn7t544TSccClzI2lb.png"
    },
    // Add more mock products...
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setHasSearched(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleImageUpload = (e) => {
    e.preventDefault();
    setShowModal(false);
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecciona una imagen.');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede superar los 5MB.');
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setIsLoading(true);
    setHasUploaded(true);

    // Simulate upload and processing
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    // In a real app, you would upload the file here:
    // const formData = new FormData();
    // formData.append('image', file);
    // await fetch('/api/upload', { method: 'POST', body: formData });
  };

  const startCamera = async () => {
    try {
      // First show the camera UI so the element exists
      setShowCamera(true);
      setShowModal(false);
      
      // Wait a bit for the element to be in the DOM
      await new Promise(resolve => setTimeout(resolve, 100));

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });
      
      if (!videoRef.current) {
        throw new Error('Video element not found');
      }

      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      
      // Instead of playing immediately, wait for canplay event
      videoRef.current.addEventListener('canplay', function handleCanPlay() {
        // Remove the event listener to avoid multiple calls
        videoRef.current.removeEventListener('canplay', handleCanPlay);
        
        // Calculate height maintaining aspect ratio
        height = videoRef.current.videoHeight / (videoRef.current.videoWidth / width);
        
        // Firefox fix
        if (isNaN(height)) {
          height = width / (4 / 3);
        }

        // Set dimensions
        videoRef.current.setAttribute("width", width);
        videoRef.current.setAttribute("height", height);
        if (canvasRef.current) {
          canvasRef.current.setAttribute("width", width);
          canvasRef.current.setAttribute("height", height);
        }

        // Start playing and update state
        videoRef.current.play()
          .then(() => {
            setStreaming(true);
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
      
      // Set canvas size to match video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the video frame to the canvas
      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Add flash effect
      setFlash(true);
      setTimeout(() => setFlash(false), 200);

      // Convert to blob
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Failed to capture photo');
          return;
        }

        const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
        setSelectedImage(file);
        setPreviewUrl(URL.createObjectURL(blob));
        setHasUploaded(true);
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
      fileInputRef.current.value = '';
    }
  };

  const shouldShowProducts = (activeTab === 'search' && hasSearched) || 
                           (activeTab === 'inspiration' && hasUploaded);

  return (
    <div className="pb-4">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === 'search'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('search')}
        >
          Buscar
        </button>
        <button
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === 'inspiration'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('inspiration')}
        >
          Inspiración
        </button>
      </div>

      {/* Search Tab Content */}
      {activeTab === 'search' && (
        <div className="px-4">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="wearvana-input pl-10"
                  placeholder=""
                />
                <div className="absolute left-10 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  {!searchQuery && <TypewriterPlaceholder suggestions={searchSuggestions} />}
                </div>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Inspiration Tab Content */}
      {activeTab === 'inspiration' && (
        <div className="px-4 mb-6">
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
                  width: '100%',
                  height: '100%',
                  minHeight: '400px',
                  maxHeight: '80vh',
                  objectFit: 'cover',
                  backgroundColor: 'black'
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
                      style={{ backdropFilter: 'blur(4px)' }}
                    >
                      <X className="h-5 w-5" />
                    </button>
                    <div className="flex-grow flex justify-center">
                      <button
                        onClick={capturePhoto}
                        className="p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transform active:scale-95 transition-transform"
                        style={{ 
                          width: '64px', 
                          height: '64px',
                          backdropFilter: 'blur(4px)'
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

          {/* Upload Options Modal */}
          {showModal && (
            <div 
              className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center pb-4"
              onClick={(e) => {
                // Only close if clicking the backdrop
                if (e.target === e.currentTarget) {
                  setShowModal(false);
                }
              }}
            >
              <div className="bg-white w-full max-w-sm rounded-t-xl p-4">
                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-semibold text-center mb-2">Subir foto</h3>
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
                  <button 
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 py-2 font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Products Grid or Empty State */}
      <div className="px-4">
        {shouldShowProducts ? (
          <div className="grid grid-cols-2 gap-4">
            {isLoading
              ? Array(6).fill(null).map((_, i) => (
                  <ProductCard key={i} loading={true} />
                ))
              : products.map((product) => (
                  <ProductCard
                    key={product.id}
                    image={product.image}
                    name={product.name}
                    price={product.price}
                    loading={false}
                  />
                ))}
          </div>
        ) : (
          <EmptyState 
            message={
              activeTab === 'search' 
                ? "Busca prendas para ver resultados"
                : "Sube una foto para encontrar prendas similares"
            }
          />
        )}
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas
        ref={canvasRef}
        className="hidden"
      />
    </div>
  );
} 