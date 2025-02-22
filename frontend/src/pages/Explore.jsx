import { useState, useRef } from 'react';
import { Search, Upload, SearchX, X, Camera, Image } from 'lucide-react';
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
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setShowCamera(true);
      setShowModal(false);
    } catch (err) {
      alert('No se pudo acceder a la cámara.');
      console.error('Error accessing camera:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(blob));
      setIsLoading(true);
      setHasUploaded(true);
      stopCamera();

      // Simulate upload and processing
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    }, 'image/jpeg');
  };

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
                className="w-full aspect-square object-cover rounded-lg"
              />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                <button
                  onClick={stopCamera}
                  className="p-3 bg-white rounded-full text-black shadow-lg hover:bg-gray-100"
                >
                  <X className="h-6 w-6" />
                </button>
                <button
                  onClick={capturePhoto}
                  className="p-3 bg-white rounded-full text-black shadow-lg hover:bg-gray-100"
                >
                  <Camera className="h-6 w-6" />
                </button>
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
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
              >
                <X className="h-5 w-5" />
              </button>
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
    </div>
  );
} 