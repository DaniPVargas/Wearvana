import { Heart, Share2, Copy, Mail, MessageCircle, Check, ArrowLeft } from 'lucide-react';
import { useState, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthProvider';

export default function PostsGridFeed({ posts, user, onBackClick }) {
  const [selectedPost, setSelectedPost] = useState(null);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [confettiPosts, setConfettiPosts] = useState(new Set());
  const [showShareMenu, setShowShareMenu] = useState(null);
  const [copiedPostId, setCopiedPostId] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const shareMenuRef = useRef(null);
  const selectedPostRef = useRef(null);
  const { userID } = useContext(AuthContext);
  const navigate = useNavigate();

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setTimeout(() => {
      selectedPostRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
    }, 0);
  };

  const handleProfileClick = (e, userId) => {
    e.preventDefault();
    if (userId === userID) {
      navigate('/profile');
    } else {
      navigate(`/user/${userId}`);
    }
  };

  const handleTagClick = (e, tag) => {
    e.stopPropagation();
    setSelectedTag(tag);
  };

  const handleLike = (postId) => {
    setLikedPosts(prev => {
      const newLiked = new Set(prev)
      if (newLiked.has(postId)) {
        newLiked.delete(postId)
      } else {
        newLiked.add(postId)
        // Trigger confetti animation
        setConfettiPosts(prev => new Set(prev).add(postId))
        setTimeout(() => {
          setConfettiPosts(prev => {
            const newSet = new Set(prev)
            newSet.delete(postId)
            return newSet
          })
        }, 500)
      }
      return newLiked
    })
  };

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
    window.open(whatsappUrl, '_blank');
    setShowShareMenu(null);
  };

  const handleEmailShare = (post) => {
    const productLink = post.tags[0]?.link;
    if (!productLink) return;
    
    const mailtoUrl = `mailto:?subject=Check out this product on Wearvana&body=Check out this product from ${post.user.user_alias}: ${productLink}`;
    window.location.href = mailtoUrl;
    setShowShareMenu(null);
  };

  const handleBack = () => {
    setSelectedPost(null);
    if (onBackClick) onBackClick();
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm ${selectedPost ? 'p-0' : 'p-6'}`}>
      {/* Feed View Header */}
      {selectedPost ? (
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center">
          <button 
            onClick={handleBack}
            className="hover:opacity-70 transition-opacity mr-4"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h2 className="text-xl font-semibold">Publicaciones</h2>
        </div>
      ) : (
        <h2 className="text-xl font-semibold mb-6">Publicaciones</h2>
      )}

      {/* Posts Grid/Feed */}
      <div className={selectedPost ? "divide-y divide-gray-200" : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"}>
        {selectedPost ? (
          posts.map((post) => (
            <div 
              key={post.post_id} 
              className="relative group cursor-pointer"
              ref={post.post_id === selectedPost.post_id ? selectedPostRef : null}
            >
              <div className="bg-white">
                {/* Post Header */}
                <div className="flex items-center gap-3 p-4">
                  <a
                    href="#"
                    onClick={(e) => handleProfileClick(e, user.user_id)}
                    className="flex items-center gap-3 hover:opacity-80"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      <img
                        src={user.profile_picture_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.user_alias}`}
                        alt={user.user_alias}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="font-medium">{user.user_alias}</span>
                  </a>
                </div>

                {/* Post Image with Tags */}
                <div className="relative aspect-square">
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  {post.tags.map((tag, index) => (
                    <button
                      key={index}
                      onClick={(e) => handleTagClick(e, tag)}
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

                {/* Post Actions and Details */}
                <div className="p-4">
                  <div className="flex items-center gap-4 mb-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(post.post_id);
                      }}
                      className={`transform transition-all duration-200 hover:scale-125 ${
                        likedPosts.has(post.post_id) 
                          ? 'text-red-500 scale-110' 
                          : 'hover:text-red-500'
                      }`}
                    >
                      <Heart 
                        className={`h-6 w-6 transform transition-all duration-200 ${
                          likedPosts.has(post.post_id) ? 'fill-current' : ''
                        }`}
                      />
                    </button>
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(post.post_id);
                        }}
                        className="hover:text-blue-500 transition-colors"
                      >
                        <Share2 className="h-6 w-6" />
                      </button>
                      {showShareMenu === post.post_id && (
                        <div 
                          ref={shareMenuRef}
                          className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg py-2 min-w-[200px] z-50"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyLink(post);
                            }}
                            className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
                          >
                            {copiedPostId === post.post_id ? (
                              <>
                                <Check className="h-4 w-4 text-green-500" />
                                <span className="text-green-500">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4" />
                                <span>Copy link</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWhatsAppShare(post);
                            }}
                            className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span>Share on WhatsApp</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEmailShare(post);
                            }}
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
                        <span className="font-medium">{tag.clothing_name}</span>
                        <span className="text-gray-500"> · </span>
                        <span className="text-wearvana-accent">{tag.current_price}€</span>
                        <span className="text-gray-500"> · </span>
                        <span className="text-gray-500">{tag.brand}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          posts.map((post) => (
            <div 
              key={post.post_id} 
              className="relative aspect-square group cursor-pointer"
              onClick={() => handlePostClick(post)}
            >
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <div className="text-center text-white p-2">
                  <p className="font-medium">{post.title}</p>
                  {post.tags && post.tags[0] && (
                    <p className="text-sm">{post.tags[0].current_price}€</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tag Details Modal */}
      {selectedTag && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedTag(null)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-sm w-full"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">{selectedTag.clothing_name}</h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Precio: </span>
                <span className="text-wearvana-accent">{selectedTag.current_price}€</span>
              </p>
              <p>
                <span className="font-medium">Marca: </span>
                <span>{selectedTag.brand}</span>
              </p>
              <a
                href={selectedTag.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-4 wearvana-button text-center"
              >
                Ver producto
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 