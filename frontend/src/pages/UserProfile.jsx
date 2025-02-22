import { MapPin, Link as LinkIcon, UserPlus, UserMinus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function UserProfile() {
  const { username } = useParams();
  const [isFollowing, setIsFollowing] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [username]); // Re-run when username changes

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

  return (
    <div className="pb-4">
      {/* Profile Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-20 h-20 rounded-full border-2 border-gray-200"
          />
          <div>
            <h1 className="text-xl font-bold">{user.name}</h1>
            <p className="text-gray-600">{user.username}</p>
          </div>
        </div>
        <button 
          onClick={toggleFollow}
          className={`wearvana-button flex items-center gap-2 ${
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
      <div className="mb-6">
        <p className="text-gray-800 mb-2">{user.bio}</p>
        <div className="flex flex-col gap-1 text-gray-600">
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
      <div className="flex justify-around mb-8 py-4 border-y border-gray-200">
        <div className="text-center">
          <div className="font-bold">{user.stats.posts}</div>
          <div className="text-gray-600 text-sm">Publicaciones</div>
        </div>
        <div className="text-center">
          <div className="font-bold">{user.stats.followers}</div>
          <div className="text-gray-600 text-sm">Seguidores</div>
        </div>
        <div className="text-center">
          <div className="font-bold">{user.stats.following}</div>
          <div className="text-gray-600 text-sm">Siguiendo</div>
        </div>
      </div>

      {/* Items Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Artículos</h2>
        <div className="grid grid-cols-3 gap-2">
          {items.map((item) => (
            <div key={item.id} className="relative aspect-square">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2 rounded-b-lg">
                <p className="text-white text-sm font-medium">{item.title}</p>
                <p className="text-white text-xs">{item.price}€</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 