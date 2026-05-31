'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { Post } from '@/types/post'
import { getGenreBadgeClass } from '@/lib/genres'
import { urls } from '@/lib/urls'

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={urls.post(post.id)}
      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
    >
      <div className="relative w-full aspect-square bg-gray-100">
        {post.imageUrl ? (
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
            📸
          </div>
        )}
        <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full text-white
          ${getGenreBadgeClass(post.genre)}`}>
          {post.genre}
        </span>
      </div>

      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="font-bold text-sm line-clamp-2">{post.title}</p>
        <p className="text-xs text-gray-500 line-clamp-2">{post.description}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-xs text-gray-400">📍 {post.area}</span>
          <span className="text-xs text-gray-400">{post.date}</span>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-pink-500 font-bold">
            詳細を見る →
          </span>
        </div>
      </div>
    </Link>
  )
}
