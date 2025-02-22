import { useState, useEffect, useRef } from "react"
import { Upload, Camera, Image, X, Plus, Link as LinkIcon, Settings } from "lucide-react"
import Post from "../components/Post"
import UploadModal from "../components/UploadModal"

const generatePost = (id) => ({
  id,
  username: `user_${id}`,
  userImage: `https://picsum.photos/200?random=${id}`,
  images: [`https://picsum.photos/600/600?random=${id}`],
  likes: Math.floor(Math.random() * 1000) + 1,
  caption: `Post caption ${id} 📸✨`,
})

const posts = [
  {
    id: 1,
    username: "minimal_style",
    likes: 2345,
    caption: "Minimal vibes for spring 🌸 #InditexStyle"
  }
]

export default function Home() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showTagModal, setShowTagModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [productTags, setProductTags] = useState([])
  const [tagPosition, setTagPosition] = useState({ x: 0, y: 0 })
  const [currentTag, setCurrentTag] = useState(null)
  
  const observerTarget = useRef(null)
  const nextPostId = useRef(1)
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const canvasRef = useRef(null)
  const imageRef = useRef(null)

  const loadMorePosts = () => {
    setLoading(true)
    const newPosts = Array.from({ length: 3 }, () => generatePost(nextPostId.current++))
    setPosts(prev => [...prev, ...newPosts])
    setLoading(false)
  }

  useEffect(() => {
    // Load initial posts
    loadMorePosts()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          loadMorePosts()
        }
      },
      { threshold: 1.0 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [loading])

  useEffect(() => {
    if (showUploadModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showUploadModal]);

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
    setCurrentTag('new'); // Use 'new' to indicate we're creating a new tag
  };

  const handleAddTag = (tag) => {
    if (currentTag === 'new') {
      // Add new tag
      setProductTags(tags => [...tags, { ...tag, position: tagPosition }]);
    } else if (typeof currentTag === 'number') {
      // Edit existing tag
      setProductTags(tags => 
        tags.map((t, i) => i === currentTag ? { ...t, ...tag } : t)
      );
    }
    setCurrentTag(null); // This will close the details modal but keep the tagging mode active
  };

  const handleRemoveTag = (index) => {
    setProductTags(tags => tags.filter((_, i) => i !== index));
  };

  const handleEditTag = (index) => {
    setCurrentTag(index);
    setTagPosition(productTags[index].position);
    setShowTagModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[975px] mx-auto px-0 md:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Feed */}
          <div className="flex-grow max-w-[630px]">
            <div className="max-w-[470px] mx-auto md:mx-0">
              {posts.map((post) => (
                <Post key={post.id} {...post} />
              ))}

              <div 
                ref={observerTarget}
                className="h-10 flex items-center justify-center"
              >
                {loading ? (
                  <div className="text-gray-400">Loading more posts...</div>
                ) : (
                  <div className="h-1 w-1" /> // Invisible element for intersection observer
                )}
              </div>
            </div>
          </div>

          {/* Empty sidebar placeholder for layout balance */}
          <div className="hidden lg:block w-[319px] flex-none" />
        </div>
      </div>

      {/* Upload Button */}
      <button 
        onClick={() => setShowUploadModal(true)}
        className="fixed md:hidden bottom-20 right-4 wearvana-button p-3 rounded-full shadow-lg z-40"
        aria-label="Upload new post"
      >
        <Upload className="h-5 w-5" />
      </button>

      {/* Upload Modal */}
      <UploadModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} />

      {/* Tag Modal */}
      {showTagModal && currentTag !== null && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
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
        <div className="fixed inset-0 bg-black z-50">
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

