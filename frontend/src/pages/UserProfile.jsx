import { MapPin, Link as LinkIcon, UserPlus, UserMinus, Heart, Share2, Copy, Mail, MessageCircle, Check, X, ArrowLeft } from 'lucide-react';
import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Skeleton from '../components/Skeleton';
import AuthClient from '../services/AuthClient';
import AuthContext from '../context/AuthProvider';
import PostsGridFeed from '../components/PostsGridFeed';

export default function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const { userID } = useContext(AuthContext);
  const [selectedPost, setSelectedPost] = useState(null);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [confettiPosts, setConfettiPosts] = useState(new Set());
  const [showShareMenu, setShowShareMenu] = useState(null);
  const [copiedPostId, setCopiedPostId] = useState(null);
  const shareMenuRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const selectedPostRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setUser(null);
      setPosts([]);
      
      try {
        const authClientInstance = new AuthClient();
        
        // Get user data
        const userData = await authClientInstance.getUser(username);
        setUser(userData);

        // If this is the current user's profile, redirect to /profile
        if (userData.user_id === userID) {
          navigate('/profile', { replace: true });
          return;
        }

        // Update URL to show username instead of ID if we came from a user_id URL
        if (userData && !isNaN(username) && userData.user_alias !== username) {
          navigate(`/user/${userData.user_alias}`, { replace: true });
        }

        // Fetch user's posts
        const postsData = await authClientInstance.getUserPosts(username);
        // Sort posts by post_id in descending order (newest first)
        const sortedPosts = postsData.sort((a, b) => b.post_id - a.post_id);
        setPosts(sortedPosts);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchUserData();
    }

    return () => {
      setUser(null);
      setPosts([]);
      setIsLoading(true);
    };
  }, [username, navigate, userID]);

  // Scroll to top when username changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [username]);

  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
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
  }

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

  const handlePostClick = (post) => {
    setSelectedPost(post);
    // We'll scroll to the post after the state update and render
    setTimeout(() => {
      selectedPostRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
    }, 0);
  };

  // Add click outside listener for share menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setShowShareMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading) {
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">User not found</h2>
          <p className="text-gray-600">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-4 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {!selectedPost && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 md:w-32 md:h-32 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-200">
                  <img
                    src={user.profile_picture_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.user_alias}`}
                    alt={user.user_alias}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">{user.user_alias}</h1>
                  <p className="text-gray-600 text-lg">@{user.user_alias.toLowerCase()}</p>
                </div>
              </div>
              <button 
                onClick={toggleFollow}
                className={`wearvana-button flex items-center gap-2 self-start md:self-center ${
                  isFollowing 
                    ? 'bg-white !text-black border border-gray-300 hover:border-gray-400' 
                    : ''
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserMinus size={16} />
                    <span>Siguiendo</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    <span>Seguir</span>
                  </>
                )}
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
        )}

        {/* Posts Section */}
        <PostsGridFeed posts={posts} user={user} />
      </div>
    </div>
  );
} 