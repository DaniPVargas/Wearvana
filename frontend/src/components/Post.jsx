"use client"

import { useState } from "react"
import { Heart, Share } from "lucide-react"
import { Link } from "react-router-dom"

export default function Post({ username, userImage, images, likes, caption }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
  }

  return (
    <div className="pb-8 mb-4">
      <div className="flex items-center gap-3 px-4 py-3">
        <Link to={`/user/${username}`} className="flex items-center gap-3 hover:opacity-80">
          <img 
            src={userImage} 
            alt={username}
            className="w-7 h-7 rounded-full object-cover"
          />
          <span className="text-sm font-medium">{username}</span>
        </Link>
        <button className="ml-auto">
          <svg width="16" height="4" viewBox="0 0 16 4" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 2H2.01M8 2H8.01M14 2H14.01" stroke="black" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="relative aspect-[3/4] bg-gray-50">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-HbpRL3prpms6Fn7t544TSccClzI2lb.png"
          alt={`${username}'s post`}
          className="object-cover w-full h-full"
        />
      </div>

      <div className="px-4 pt-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex gap-4">
            <button aria-label="Like post">
              <Heart className="w-[22px] h-[22px]" />
            </button>
            <button aria-label="Share post">
              <Share className="w-[22px] h-[22px]" />
            </button>
          </div>
        </div>
        <div className="text-sm">
          <p className="font-medium mb-1">{likes} likes</p>
          <p>
            <Link to={`/user/${username}`} className="font-medium hover:underline">
              {username}
            </Link>{" "}
            {caption}
          </p>
        </div>
      </div>
    </div>
  )
}

