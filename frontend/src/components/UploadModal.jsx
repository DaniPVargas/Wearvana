import { useContext, useState, useRef, useEffect } from "react";
import { Camera, Image, X, Plus, Link as LinkIcon, Send } from "lucide-react";
import AuthClient from "../services/AuthClient";
import authContext from "../context/AuthProvider";
import "../css/uploadModel.css";

export default function UploadModal({ isOpen, onClose }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [showTagModal, setShowTagModal] = useState(false);
  const [productTags, setProductTags] = useState([]);
  const [tagPosition, setTagPosition] = useState({ x: 0, y: 0 });
  const [currentTag, setCurrentTag] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [publicationStatus, setPublicationStatus] = useState(null); // null, "publishing", "success", "error"
  const [title, setTitle] = useState("");

  const { userID } = useContext(authContext);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const [draggingTag, setDraggingTag] = useState(null);

  // Add scroll lock effect
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setSuggestions(null);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const fetchImageSearch = async () => {
      if (!selectedImage) return;
      const authClientInstance = new AuthClient();
      setSuggestions(
        await authClientInstance.imageSearch(selectedImage, userID)
      );
    };
    fetchImageSearch();
  }, [userID, selectedImage]);

  const handleImageUpload = (e) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecciona unha imaxe");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("A imaxe non pode superar os 5MB");
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
        video: {
          facingMode: "environment",
          width: { ideal: 1080 },
          height: { ideal: 1080 },
          aspectRatio: { ideal: 1 },
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
            console.error("Error playing video:", err);
            setCameraError(
              "Erro ao iniciar a cámara. Por favor, recarga a páxina"
            );
          });
      });
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError(
        "Non se puido acceder á cámara. Por favor, permite o acceso"
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
          setSelectedImage(file);
          setPreviewUrl(URL.createObjectURL(blob));
          stopCamera();
        },
        "image/jpeg",
        0.8
      );
    } catch (error) {
      console.error("Error capturing photo:", error);
      setCameraError("Erro ao capturar a foto. Por favor, inténtao de novo.");
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
    const naturalWidth = imageRef.current.naturalWidth;
    const min_image_x = ((rect.width - naturalWidth) / 2 / rect.width) * 100;
    const max_image_x = 100 - min_image_x;
    const x = Math.min(
      max_image_x,
      Math.max(min_image_x, ((e.clientX - rect.left) / rect.width) * 100)
    );
    const y = Math.min(
      max_image_x,
      Math.max(min_image_x, ((e.clientY - rect.top) / rect.height) * 100)
    );

    setTagPosition({ x, y });
    setCurrentTag("new");
  };

  const handleAddTag = (tag) => {
    if (currentTag === "new") {
      setProductTags((tags) => [
        ...tags,
        { ...tag, x_coord: tagPosition.x, y_coord: tagPosition.y },
      ]);
    } else if (typeof currentTag === "number") {
      setProductTags((tags) =>
        tags.map((t, i) => (i === currentTag ? { ...t, ...tag } : t))
      );
    }
    setCurrentTag(null);
  };

  const handleRemoveTag = (index) => {
    const removedTag = productTags[index];
    setProductTags((tags) => tags.filter((_, i) => i !== index));
    // We make avaible again the add button
    setSuggestions((prevSuggestions) =>
      prevSuggestions.map((s) =>
        s.clothing_name === removedTag.name ? { ...s, accepted: false } : s
      )
    );
  };

  const handleEditTag = (index) => {
    setCurrentTag(index);
    setTagPosition({
      x: productTags[index].x_coord,
      y: productTags[index].y_coord,
    });
    setShowTagModal(true);
  };

  const handleClose = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setProductTags([]);
    setTitle("");
    stopCamera();
    setSuggestions(null);
    onClose();
  };

  const publishPost = async ({ image, title, tags }) => {
    setPublicationStatus("publishing");
    const authClientInstance = new AuthClient();
    try {
      await authClientInstance.publicatePost(userID, image, title, tags);
      console.log("success");
      setPublicationStatus("success");
    } catch (error) {
      setPublicationStatus("error");
      console.log("error");
    } finally {
      setTimeout(() => {
        setPublicationStatus(null);
      }, 3000);
    }
  };

  const handleDragStart = (index) => (e) => {
    setDraggingTag(index);
  };

  const handleDrag = (e) => {
    if (draggingTag === null || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const naturalWidth = imageRef.current.naturalWidth;
    const min_image_x = ((rect.width - naturalWidth) / 2 / rect.width) * 100;
    const max_image_x = 100 - min_image_x;
    const x = Math.min(
      max_image_x,
      Math.max(min_image_x, ((e.clientX - rect.left) / rect.width) * 100)
    );
    const y = Math.min(
      max_image_x,
      Math.max(min_image_x, ((e.clientY - rect.top) / rect.height) * 100)
    );

    setProductTags((tags) =>
      tags.map((tag, i) =>
        i === draggingTag ? { ...tag, x_coord: x, y_coord: y } : tag
      )
    );
  };

  const handleDragEnd = (e) => {
    if (draggingTag === null || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const naturalWidth = imageRef.current.naturalWidth;
    const min_image_x = ((rect.width - naturalWidth) / 2 / rect.width) * 100;
    const max_image_x = 100 - min_image_x;
    const x = Math.min(
      max_image_x,
      Math.max(min_image_x, ((e.clientX - rect.left) / rect.width) * 100)
    );
    const y = Math.min(
      max_image_x,
      Math.max(min_image_x, ((e.clientY - rect.top) / rect.height) * 100)
    );

    setProductTags((tags) =>
      tags.map((tag, i) =>
        i === draggingTag ? { ...tag, x_coord: x, y_coord: y } : tag
      )
    );
    setDraggingTag(null);
  };

  const handleAcceptSuggestion = (suggestion, index) => {
    const randomX = Math.random() * 100;
    const randomY = Math.random() * 100;

    setProductTags((tags) => [
      ...tags,
      {
        ...suggestion,
        x_coord: randomX,
        y_coord: randomY,
      },
    ]);

    setSuggestions((prevSuggestions) =>
      prevSuggestions.map((s, i) =>
        i === index ? { ...s, accepted: true } : s
      )
    );
  };

  const handleRemoveSuggestion = (index) => {
    setSuggestions((prevSuggestions) =>
      prevSuggestions.filter((_, i) => i !== index)
    );
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
                <span>Facer foto</span>
              </button>
              <button
                onClick={handleImageUpload}
                className="wearvana-button w-full flex items-center justify-center gap-2 py-3 !bg-white !text-black border border-gray-200"
              >
                <Image className="h-5 w-5" />
                <span>Subir da galería</span>
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
                  style={{ cursor: showTagModal ? "crosshair" : "default" }}
                />
                {/* Product Tags */}
                {productTags.map((tag, index) => (
                  <button
                    key={index}
                    onClick={() => handleEditTag(index)}
                    className="absolute w-6 h-6 -ml-3 -mt-3 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                    style={{
                      left: `${tag.x_coord}%`,
                      top: `${tag.y_coord}%`,
                    }}
                    draggable
                    onDragStart={handleDragStart(index)}
                    onDrag={handleDrag}
                    onDragEnd={handleDragEnd}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                ))}
              </div>
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Título da publicación
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Escribe un título para a túa publicación..."
                  className="wearvana-input w-full"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1 mt-1">Suxestións</h3>
                {suggestions === null ? (
                  <>
                    <h4 className="ms-1  font-medium text-gray-600">
                      Cargando{" "}
                      <small className="loading-dots">
                        <span>.</span> <span>.</span> <span>.</span>
                      </small>
                    </h4>
                  </>
                ) : suggestions.length == 0 ? (
                  <h4 className="ms-1 font-medium text-gray-700">
                    Non hai suxestións
                  </h4>
                ) : (
                  suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="ms-1 flex flex-col items-start mt-2"
                    >
                      <div className="flex justify-between w-full pe-5">
                        <div className="flex flex-col">
                          <span className="text-lg text-gray-700">
                            {suggestion.brand}
                          </span>
                          <a
                            href={suggestion.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-black-800 font-semibold hover:underline"
                          >
                            {suggestion.clothing_name}
                          </a>
                        </div>
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() =>
                              handleAcceptSuggestion(suggestion, index)
                            }
                            className={`black-button ${
                              suggestion.accepted ? "disabled-button" : ""
                            }`}
                            disabled={suggestion.accepted}
                          >
                            <Plus />
                          </button>
                          <button
                            onClick={() => handleRemoveSuggestion(index)}
                            className="black-button"
                          >
                            <X />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button
                className={`wearvana-button w-full flex items-center justify-center gap-2 py-3 ${
                  showTagModal
                    ? "!bg-wearvana-accent/10 !text-wearvana-accent"
                    : ""
                }`}
                onClick={() => setShowTagModal(!showTagModal)}
              >
                <LinkIcon className="h-5 w-5" />
                <span>
                  {showTagModal && !currentTag
                    ? "Selecciona la prenda"
                    : "Etiquetar productos"}
                </span>
              </button>
              {productTags.length > 0 && title.trim() && (
                <button
                  className="wearvana-button w-full flex items-center justify-center gap-2 py-3"
                  onClick={() => {
                    publishPost({
                      image: selectedImage,
                      title,
                      tags: productTags,
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
              {typeof currentTag === "number"
                ? "Editar produto"
                : "Detalles do produto"}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleAddTag({
                  clothing_name: formData.get("clothing_name"),
                  current_price: formData.get("current_price"),
                  original_price: null,
                  link: formData.get("link"),
                  brand: formData.get("brand"),
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nome do produto
                </label>
                <input
                  type="text"
                  name="name"
                  className="wearvana-input"
                  required
                  defaultValue={
                    currentTag !== null && typeof currentTag === "number"
                      ? productTags[currentTag].clothing_name
                      : ""
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Marca do produto
                </label>
                <input
                  type="text"
                  name="brand"
                  className="wearvana-input"
                  required
                  defaultValue={
                    currentTag !== null && typeof currentTag === "number"
                      ? productTags[currentTag].brand
                      : ""
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Prezo (€)
                </label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  className="wearvana-input"
                  required
                  defaultValue={
                    currentTag !== null && typeof currentTag === "number"
                      ? productTags[currentTag].current_price
                      : ""
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Enlace do produto
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
                  onClick={() => {
                    setCurrentTag(null);
                  }}
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[90] flex items-center justify-center">
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

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
