import { useState, useRef, useEffect } from 'react';
import { Camera, Image, X, Plus, Link as LinkIcon, Send } from 'lucide-react';

export default function UploadModal({ isOpen, onClose }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [showTagModal, setShowTagModal] = useState(false);
  const [productTags, setProductTags] = useState([]);
  const [tagPosition, setTagPosition] = useState({ x: 0, y: 0 });
  const [currentTag, setCurrentTag] = useState(null);
  const [title, setTitle] = useState('');
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const [isCapturingProduct, setIsCapturingProduct] = useState(false);
  const [productUrl, setProductUrl] = useState('');

  // Add scroll lock effect
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleImageUpload = (e) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecciona una imagen.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede superar los 5MB.');
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setShowCamera(false);
  };

  const startCamera = async () => {
    try {
      setShowCamera(true);
      
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
        setSelectedImage(file);
        setPreviewUrl(URL.createObjectURL(blob));
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

  const handleImageClick = (e) => {
    if (!imageRef.current || !showTagModal) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setTagPosition({ x, y });
    setCurrentTag('new');
  };

  const handleAddTag = (tag) => {
    if (currentTag === 'new') {
      setProductTags(tags => [...tags, { ...tag, position: tagPosition }]);
    } else if (typeof currentTag === 'number') {
      setProductTags(tags => 
        tags.map((t, i) => i === currentTag ? { ...t, ...tag } : t)
      );
    }
    setCurrentTag(null);
  };

  const handleRemoveTag = (index) => {
    setProductTags(tags => tags.filter((_, i) => i !== index));
  };

  const handleEditTag = (index) => {
    setCurrentTag(index);
    setTagPosition(productTags[index].position);
    setShowTagModal(true);
  };

  const handleClose = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setProductTags([]);
    setTitle('');
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="bg-white w-full max-w-lg rounded-xl overflow-hidden">
        {/* Modal Header */}
        <div className="border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Nova publicación</h2>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4">
          {!selectedImage ? (
            <div className="space-y-4">
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
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img
                  ref={imageRef}
                  src={previewUrl}
                  alt="Preview"
                  className="w-full aspect-square object-cover rounded-lg"
                  onClick={handleImageClick}
                  style={{ cursor: showTagModal ? 'crosshair' : 'default' }}
                />
                {/* Product Tags */}
                {productTags.map((tag, index) => (
                  <button
                    key={index}
                    onClick={() => handleEditTag(index)}
                    className="absolute w-6 h-6 -ml-3 -mt-3 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                    style={{ 
                      left: `${tag.position.x}%`,
                      top: `${tag.position.y}%`
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                ))}
              </div>
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Título da publicación
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Escribe un título para tu publicación..."
                  className="wearvana-input w-full"
                />
              </div>
              <button 
                className={`wearvana-button w-full flex items-center justify-center gap-2 py-3 ${showTagModal ? '!bg-wearvana-accent/10 !text-wearvana-accent' : ''}`}
                onClick={() => setShowTagModal(!showTagModal)}
              >
                <LinkIcon className="h-5 w-5" />
                <span>
                  {showTagModal && !currentTag ? 'Selecciona la prenda' : 'Etiquetar productos'}
                </span>
              </button>
              {productTags.length > 0 && title.trim() && (
                <button 
                  className="wearvana-button w-full flex items-center justify-center gap-2 py-3"
                  onClick={() => {
                    // TODO: Implement post creation
                    console.log('Creating post with:', {
                      image: selectedImage,
                      title: title,
                      tags: productTags
                    });
                    handleClose();
                  }}
                >
                  <Send className="h-5 w-5" />
                  <span>Publicar</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tag Modal */}
      {showTagModal && currentTag !== null && (
        <div 
          className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setCurrentTag(null);
            }
          }}
        >
          <div className="bg-white w-full max-w-sm rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">
              {typeof currentTag === 'number' ? 'Editar producto' : 'Detalles del producto'}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleAddTag({
                  name: formData.get('name'),
                  price: formData.get('price'),
                  link: formData.get('link'),
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del producto</label>
                <input
                  type="text"
                  name="name"
                  className="wearvana-input"
                  required
                  defaultValue={currentTag !== null && typeof currentTag === 'number' ? productTags[currentTag].name : ''}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Precio (€)</label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  className="wearvana-input"
                  required
                  defaultValue={currentTag !== null && typeof currentTag === 'number' ? productTags[currentTag].price : ''}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Enlace del producto</label>
                <input
                  type="url"
                  name="link"
                  className="wearvana-input"
                  required
                  defaultValue={currentTag !== null && typeof currentTag === 'number' ? productTags[currentTag].link : ''}
                />
              </div>
              <div className="flex gap-2 pt-2">
                {typeof currentTag === 'number' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleRemoveTag(currentTag);
                      setCurrentTag(null);
                    }}
                    className="flex-1 py-2 px-4 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setCurrentTag(null)}
                  className="flex-1 py-2 px-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 wearvana-button"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Camera View */}
      {showCamera && (
        <div className="fixed inset-0 bg-black z-[80]">
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
                <button
                  onClick={capturePhoto}
                  className="w-16 h-16 rounded-full border-4 border-white"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
} 