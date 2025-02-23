import { useState, useEffect, useRef, useContext } from "react";
import {
  Upload,
  Camera,
  Image,
  X,
  Plus,
  Link as LinkIcon,
  Settings,
  Heart,
  Share2,
  Copy,
  Mail,
  MessageCircle,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Post from "../components/Post";
import UploadModal from "../components/UploadModal";
import AuthClient from "../services/AuthClient";
import AuthContext from "../context/AuthProvider";
import Skeleton from "../components/Skeleton";

const generatePost = (id) => ({
  id,
  username: `user_${id}`,
  userImage: `https://picsum.photos/200?random=${id}`,
  images: [`https://picsum.photos/600/600?random=${id}`],
  likes: Math.floor(Math.random() * 1000) + 1,
  caption: `Post caption ${id} 📸✨`,
});

const posts = [
  {
    id: 1,
    username: "minimal_style",
    likes: 2345,
    caption: "Estilo minimalista para a primavera 🌸 #EstiloInditex",
  },
];

const LikeConfetti = ({ active }) => {
  if (!active) return null;

  return (
    <div className="absolute pointer-events-none">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-red-500"
          style={{
            animation: `confetti-${i} 0.5s ease-out forwards`,
            transform: `rotate(${i * 30}deg) translateY(0)`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti-0 {
          to {
            transform: rotate(0deg) translateY(-10px) scale(0);
            opacity: 0;
          }
        }
        @keyframes confetti-1 {
          to {
            transform: rotate(30deg) translateY(-12px) scale(0);
            opacity: 0;
          }
        }
        @keyframes confetti-2 {
          to {
            transform: rotate(60deg) translateY(-14px) scale(0);
            opacity: 0;
          }
        }
        @keyframes confetti-3 {
          to {
            transform: rotate(90deg) translateY(-10px) scale(0);
            opacity: 0;
          }
        }
        @keyframes confetti-4 {
          to {
            transform: rotate(120deg) translateY(-12px) scale(0);
            opacity: 0;
          }
        }
        @keyframes confetti-5 {
          to {
            transform: rotate(150deg) translateY(-14px) scale(0);
            opacity: 0;
          }
        }
        @keyframes confetti-6 {
          to {
            transform: rotate(180deg) translateY(-10px) scale(0);
            opacity: 0;
          }
        }
        @keyframes confetti-7 {
          to {
            transform: rotate(210deg) translateY(-12px) scale(0);
            opacity: 0;
          }
        }
        @keyframes confetti-8 {
          to {
            transform: rotate(240deg) translateY(-14px) scale(0);
            opacity: 0;
          }
        }
        @keyframes confetti-9 {
          to {
            transform: rotate(270deg) translateY(-10px) scale(0);
            opacity: 0;
          }
        }
        @keyframes confetti-10 {
          to {
            transform: rotate(300deg) translateY(-12px) scale(0);
            opacity: 0;
          }
        }
        @keyframes confetti-11 {
          to {
            transform: rotate(330deg) translateY(-14px) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const [pullStartY, setPullStartY] = useState(0);
  const [pullMoveY, setPullMoveY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const pullThreshold = 80; // pixels to pull before refresh triggers
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [productTags, setProductTags] = useState([]);
  const [tagPosition, setTagPosition] = useState({ x: 0, y: 0 });
  const [currentTag, setCurrentTag] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [confettiPosts, setConfettiPosts] = useState(new Set());
  const { userID } = useContext(AuthContext);

  const observerTarget = useRef(null);
  const nextPostId = useRef(1);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [showShareMenu, setShowShareMenu] = useState(null);
  const [copiedPostId, setCopiedPostId] = useState(null);
  const shareMenuRef = useRef(null);
  const navigate = useNavigate();

  const loadMorePosts = () => {
    if (loading) return;
    setLoading(true);
    const newPosts = Array.from({ length: 3 }, () =>
      generatePost(nextPostId.current++)
    );
    setPosts((prev) => [...prev, ...newPosts]);
    setLoading(false);
  };

  const fetchPosts = async () => {
    try {
      const authClientInstance = new AuthClient();

      // Get all users
      const users = await authClientInstance.getUsers();

      // Get posts for each user
      const allPosts = [];
      for (const user of users) {
        try {
          const userPosts = await authClientInstance.getUserPosts(user.user_id);
          // Add user info to each post
          const postsWithUser = userPosts.map((post) => ({
            ...post,
            user: user,
          }));
          allPosts.push(...postsWithUser);
        } catch (error) {
          console.error(
            `Erro ao obter publicacións do usuario ${user.user_id}:`,
            error
          );
        }
      }

      // Sort posts by post_id (most recent first)
      allPosts.sort((a, b) => b.post_id - a.post_id);
      setPosts(allPosts);
    } catch (error) {
      console.error("Erro ao obter publicacións:", error);
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  };

  const handleTouchStart = (e) => {
    // Only enable pull to refresh when at the top of the page
    if (window.scrollY === 0) {
      setPullStartY(e.touches[0].clientY);
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!isPulling) return;

    const y = e.touches[0].clientY;
    setPullMoveY(y);

    const pullDistance = y - pullStartY;
    if (pullDistance > 0) {
      setPullProgress(Math.min(pullDistance / pullThreshold, 1));
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    if (!isPulling) return;

    const pullDistance = pullMoveY - pullStartY;
    if (pullDistance > pullThreshold && !refreshing) {
      setRefreshing(true);
      fetchPosts();
    }

    setPullProgress(0);
    setIsPulling(false);
  };

  useEffect(() => {
    document.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isPulling, pullStartY, refreshing]);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !initialLoading) {
          loadMorePosts();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loading, initialLoading]);

  useEffect(() => {
    if (showUploadModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showUploadModal]);

  const handleImageUpload = (e) => {
    e.preventDefault();
    fileInputRef.current?.click();
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
    setShowCamera(false);
  };

  const startCamera = async () => {
    try {
      setShowCamera(true);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      if (!videoRef.current) {
        throw new Error("Video element not found");
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

      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            console.error("Failed to capture photo");
            return;
          }

          const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
          setSelectedImage(file);
          setPreviewUrl(URL.createObjectURL(blob));
          stopCamera();
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
    setShowCamera(false);
  };

  const handleImageClick = (e) => {
    if (!imageRef.current || !showTagModal) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setTagPosition({ x, y });
    setCurrentTag("new"); // Use 'new' to indicate we're creating a new tag
  };

  const handleAddTag = (tag) => {
    if (currentTag === "new") {
      // Add new tag
      setProductTags((tags) => [...tags, { ...tag, position: tagPosition }]);
    } else if (typeof currentTag === "number") {
      // Edit existing tag
      setProductTags((tags) =>
        tags.map((t, i) => (i === currentTag ? { ...t, ...tag } : t))
      );
    }
    setCurrentTag(null); // This will close the details modal but keep the tagging mode active
  };

  const handleRemoveTag = (index) => {
    setProductTags((tags) => tags.filter((_, i) => i !== index));
  };

  const handleEditTag = (index) => {
    setCurrentTag(index);
    setTagPosition(productTags[index].position);
    setShowTagModal(true);
  };

  const handleTagClick = (tag) => {
    setSelectedTag(tag);
  };

  const handleLike = (postId) => {
    setLikedPosts((prev) => {
      const newLiked = new Set(prev);
      if (newLiked.has(postId)) {
        newLiked.delete(postId);
      } else {
        newLiked.add(postId);
        // Trigger confetti animation
        setConfettiPosts((prev) => new Set(prev).add(postId));
        setTimeout(() => {
          setConfettiPosts((prev) => {
            const newSet = new Set(prev);
            newSet.delete(postId);
            return newSet;
          });
        }, 500);
      }
      return newLiked;
    });
  };

  // Add click outside listener for share menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        shareMenuRef.current &&
        !shareMenuRef.current.contains(event.target)
      ) {
        setShowShareMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleShare = (postId) => {
    setShowShareMenu(postId);
  };

  const handleCopyLink = (post) => {
    const productLink = post.tags[0]?.link;
    if (!productLink) return;

    navigator.clipboard.writeText(productLink).then(() => {
      setCopiedPostId(post.post_id);
      setTimeout(() => setCopiedPostId(null), 2000);
    });
  };

  const handleWhatsAppShare = (post) => {
    const productLink = post.tags[0]?.link;
    if (!productLink) return;

    const message = `Check out this product from ${post.user.user_alias} on Wearvana: ${productLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    setShowShareMenu(null);
  };

  const handleEmailShare = (post) => {
    const productLink = post.tags[0]?.link;
    if (!productLink) return;

    const mailtoUrl = `mailto:?subject=Check out this product on Wearvana&body=Check out this product from ${post.user.user_alias}: ${productLink}`;
    window.location.href = mailtoUrl;
    setShowShareMenu(null);
  };

  const handleProfileClick = (userId) => {
    navigate(`/user/${userId}`);
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[975px] mx-auto px-0 md:px-8 relative">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-grow max-w-[630px]">
              <div className="max-w-[470px] mx-auto md:mx-0">
                {[...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden"
                  >
                    <div className="flex items-center gap-3 p-4">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <Skeleton className="w-24 h-4" />
                    </div>
                    <Skeleton className="w-full aspect-square" />
                    <div className="p-4">
                      <div className="flex items-center gap-4 mb-2">
                        <Skeleton className="w-6 h-6" />
                        <Skeleton className="w-6 h-6" />
                      </div>
                      <Skeleton className="w-3/4 h-4 mb-2" />
                      <div className="space-y-1">
                        <Skeleton className="w-1/2 h-3" />
                        <Skeleton className="w-2/3 h-3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden lg:block w-[319px] flex-none" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[975px] mx-auto px-0 md:px-8 relative">
        {/* Refresh Spinner - Only show during pull-to-refresh */}
        {(pullProgress > 0 || refreshing) && (
          <div
            className={`absolute left-0 right-0 -top-16 flex justify-center items-center h-16 transition-all duration-200 ${
              pullProgress > 0 || refreshing
                ? "translate-y-full opacity-100"
                : "translate-y-0 opacity-0"
            }`}
          >
            <div
              className={`rounded-full h-8 w-8 border-2 border-wearvana-accent border-t-transparent ${
                refreshing
                  ? "animate-[spin_1.5s_linear_infinite]"
                  : "transition-transform duration-200"
              }`}
              style={{
                transform: refreshing
                  ? "none"
                  : `rotate(${pullProgress * 360}deg)`,
              }}
            />
          </div>
        )}

        {/* Main Content - Add sliding animation */}
        <div
          className="transition-transform duration-200"
          style={{
            transform:
              pullProgress > 0
                ? `translateY(${Math.min(pullProgress * 64, 64)}px)`
                : "translateY(0)",
          }}
        >
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Feed */}
            <div className="flex-grow max-w-[630px]">
              <div className="max-w-[470px] mx-auto md:mx-0">
                {posts.map((post) => (
                  <div
                    key={post.post_id}
                    className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden"
                  >
                    {/* Post Header */}
                    <div className="flex items-center gap-3 p-4">
                      <button
                        onClick={() => handleProfileClick(post.user.user_id)}
                        className="hover:opacity-80 transition-opacity"
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                          <img
                            src={
                              post.user.profile_picture_url ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user.user_alias}`
                            }
                            alt={post.user.user_alias}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </button>
                      <button
                        onClick={() => handleProfileClick(post.user.user_id)}
                        className="font-medium hover:opacity-80 transition-opacity"
                      >
                        {post.user.user_alias}
                      </button>
                    </div>

                    {/* Post Image with Tags */}
                    <div className="relative aspect-square">
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {/* Tag Dots */}
                      {post.tags.map((tag, index) => (
                        <button
                          key={index}
                          onClick={() => handleTagClick(tag)}
                          className="absolute w-6 h-6 -ml-3 -mt-3 bg-white/50 hover:bg-white rounded-full border border-white/50 hover:border-white transition-colors cursor-pointer flex items-center justify-center"
                          style={{
                            left: `${tag.x_coord}%`,
                            top: `${tag.y_coord}%`,
                          }}
                        >
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </button>
                      ))}
                    </div>

                    {/* Post Actions */}
                    <div className="p-4">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="relative">
                          <button
                            onClick={() => handleLike(post.post_id)}
                            className={`transform transition-all duration-200 hover:scale-125 ${
                              likedPosts.has(post.post_id)
                                ? "text-red-500 scale-110"
                                : "hover:text-red-500"
                            }`}
                          >
                            <Heart
                              className={`h-6 w-6 transform transition-all duration-200 ${
                                likedPosts.has(post.post_id)
                                  ? "fill-current"
                                  : ""
                              }`}
                            />
                          </button>
                          <LikeConfetti
                            active={confettiPosts.has(post.post_id)}
                          />
                        </div>
                        <div className="relative">
                          <button
                            onClick={() => handleShare(post.post_id)}
                            className="hover:text-blue-500 transition-colors"
                          >
                            <Share2 className="h-6 w-6" />
                          </button>
                          {showShareMenu === post.post_id && (
                            <div
                              ref={shareMenuRef}
                              className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg py-2 min-w-[200px] z-50"
                            >
                              <button
                                onClick={() => handleCopyLink(post)}
                                className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
                              >
                                {copiedPostId === post.post_id ? (
                                  <>
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span className="text-green-500">
                                      Copied!
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-4 w-4" />
                                    <span>Copy link</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleWhatsAppShare(post)}
                                className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
                              >
                                <MessageCircle className="h-4 w-4" />
                                <span>Share on WhatsApp</span>
                              </button>
                              <button
                                onClick={() => handleEmailShare(post)}
                                className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
                              >
                                <Mail className="h-4 w-4" />
                                <span>Share via Email</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <h2 className="font-medium mb-2">{post.title}</h2>
                      {/* Tags Summary */}
                      <div className="space-y-1">
                        {post.tags.map((tag, index) => (
                          <div key={index} className="text-sm">
                            <span className="font-medium">
                              {tag.clothing_name}
                            </span>
                            <span className="text-gray-500"> · </span>
                            <span className="text-wearvana-accent">
                              {tag.current_price}€
                            </span>
                            <span className="text-gray-500"> · </span>
                            <span className="text-gray-500">{tag.brand}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
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
        <UploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
        />

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
                {typeof currentTag === "number"
                  ? "Editar producto"
                  : "Detalles del producto"}
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  handleAddTag({
                    name: formData.get("name"),
                    price: formData.get("price"),
                    link: formData.get("link"),
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nombre del producto
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="wearvana-input"
                    required
                    defaultValue={
                      currentTag !== null && typeof currentTag === "number"
                        ? productTags[currentTag].name
                        : ""
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Precio (€)
                  </label>
                  <input
                    type="number"
                    name="price"
                    step="0.01"
                    className="wearvana-input"
                    required
                    defaultValue={
                      currentTag !== null && typeof currentTag === "number"
                        ? productTags[currentTag].price
                        : ""
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Enlace del producto
                  </label>
                  <input
                    type="url"
                    name="link"
                    className="wearvana-input"
                    required
                    defaultValue={
                      currentTag !== null && typeof currentTag === "number"
                        ? productTags[currentTag].link
                        : ""
                    }
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  {typeof currentTag === "number" && (
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
                  <button type="submit" className="flex-1 wearvana-button">
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
                    <button onClick={stopCamera} className="wearvana-button">
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

        {/* Tag Details Popup */}
        {selectedTag && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTag(null)}
          >
            <div
              className="bg-white rounded-xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">
                {selectedTag.clothing_name}
              </h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Price: </span>
                  <span className="text-wearvana-accent">
                    {selectedTag.current_price}€
                  </span>
                </p>
                <p>
                  <span className="font-medium">Brand: </span>
                  <span>{selectedTag.brand}</span>
                </p>
                <a
                  href={selectedTag.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-4 wearvana-button text-center"
                >
                  View Product
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
