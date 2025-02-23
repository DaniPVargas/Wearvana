import { useState, useEffect } from 'react';
import { Search, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthClient from '../services/AuthClient';
import Skeleton from '../components/Skeleton';

export default function SearchUser() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const authClientInstance = new AuthClient();
        const usersData = await authClientInstance.getUsers();
        // Only keep users with a profile picture URL
        const usersWithPictures = usersData.filter(user => user.profile_picture_url);
        setUsers(usersWithPictures);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(user => 
        user.user_alias.toLowerCase().includes(query) ||
        user.complete_name.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]); // Empty array when no search query
    }
  }, [searchQuery, users]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Skeleton className="h-12 rounded-lg" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div>
                <Skeleton className="w-32 h-5 rounded mb-1" />
                <Skeleton className="w-24 h-4 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Search Input */}
      <div className="relative mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="wearvana-input pl-10 pr-4"
          placeholder="Buscar usuarios..."
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map(user => (
          <Link
            key={user.user_id}
            to={`/user/${user.user_id}`}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <img
              src={user.profile_picture_url}
              alt={user.user_alias}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h3 className="font-medium">{user.user_alias}</h3>
              <p className="text-sm text-gray-500">{user.complete_name}</p>
            </div>
          </Link>
        ))}

        {searchQuery.trim() && filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No se encontraron usuarios</p>
          </div>
        )}

        {!searchQuery.trim() && (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Escribe para buscar usuarios</p>
          </div>
        )}
      </div>
    </div>
  );
} 