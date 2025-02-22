import { MapPin, Link as LinkIcon, UserPlus, UserMinus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Skeleton from '../components/Skeleton';

export default function UserProfile() {
  const { username } = useParams();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [username]);

  // This would come from your API in a real app
  const user = {
    name: username,
    username: `@${username}`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    bio: "Fashion enthusiast | Sustainable clothing advocate",
    location: "Madrid, España",
    website: "wearvana.com/" + username,
    stats: {
      posts: 42,
      followers: 1234,
      following: 567
    }
  };

  // Mock data for the user's posts/items
  const items = Array(18).fill(null).map((_, i) => ({
    id: i,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-HbpRL3prpms6Fn7t544TSccClzI2lb.png",
    title: `Item ${i + 1}`,
    price: Math.floor(Math.random() * 100) + 20
  }));

  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
  };

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
            {[...Array(18)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-4 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-6">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-20 h-20 md:w-32 md:h-32 rounded-full border-2 border-gray-200"
              />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{user.name}</h1>
                <p className="text-gray-600 text-lg">{user.username}</p>
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
            <p className="text-gray-800 mb-2 text-lg">{user.bio}</p>
            <div className="flex flex-col sm:flex-row gap-3 text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>{user.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <LinkIcon size={16} />
                <a href={`https://${user.website}`} className="text-blue-600 hover:underline">
                  {user.website}
                </a>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-around py-4 border-y border-gray-200 max-w-2xl">
            <div className="text-center">
              <div className="font-bold text-xl">{user.stats.posts}</div>
              <div className="text-gray-600">Publicaciones</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-xl">{user.stats.followers}</div>
              <div className="text-gray-600">Seguidores</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-xl">{user.stats.following}</div>
              <div className="text-gray-600">Siguiendo</div>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Publicaciones</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {items.map((item) => (
              <div key={item.id} className="relative aspect-square group">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <div className="text-center text-white p-2">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm">{item.price}€</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 