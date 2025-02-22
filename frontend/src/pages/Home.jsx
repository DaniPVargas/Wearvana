import { useState, useEffect, useRef } from "react"
import { Upload } from "lucide-react"
import Post from "../components/Post"

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
  const observerTarget = useRef(null)
  const nextPostId = useRef(1)

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

  return (
    <div className="max-w-[470px] mx-auto relative">
      {posts.map((post) => (
        <Post key={post.id} {...post} />
      ))}
      <button 
        className="fixed bottom-6 right-6 bg-black text-white p-3 rounded-full hover:bg-black/90 transition-colors"
        aria-label="Upload new post"
      >
        <Upload className="h-4 w-4" />
      </button>
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
  )
}

