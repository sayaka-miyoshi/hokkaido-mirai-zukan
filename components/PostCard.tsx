'use client'

import Image from 'next/image'
import { Post } from '@/lib/fetchPosts'
import { getGenreBadgeClass } from '@/lib/genres'

export default function PostCard({ post }: { post: Post }) {
  return (
    <a
      href={post.instagramUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
    >
      {/* 画像 */}
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
        {/* ジャンルバッジ */}
        <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full text-white
          ${getGenreBadgeClass(post.genre)}`}>
          {post.genre}
        </span>
      </div>

      {/* テキスト情報 */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="font-bold text-sm line-clamp-2">{post.title}</p>
        <p className="text-xs text-gray-500 line-clamp-2">{post.description}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-xs text-gray-400">📍 {post.area}</span>
          <span className="text-xs text-gray-400">{post.date}</span>
        </div>
        {/* Instagramリンク */}
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs instagram-gradient text-transparent bg-clip-text font-bold">
            Instagramで見る →
          </span>
        </div>
      </div>
    </a>
  )
}
