'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, Download, FileText } from 'lucide-react';
import { formatDate, truncateContent } from '@/lib/community/helpers';
import { useCommunityStore } from '@/lib/community/communityStore';
import { communityApi } from '@/lib/community/api';

interface Attachment {
  name: string;
  data: string;
}

interface ArticleCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    imageUrl?: string;
    attachments?: string;
    likeCount: number;
    commentCount: number;
    createdAt: Date;
    author: { id: string; name: string };
  };
  currentUserId?: string;
}

export function ArticleCard({ post, currentUserId }: ArticleCardProps) {
  const router = useRouter();
  const { userLikedPosts, addUserLike, removeUserLike } = useCommunityStore();
  const isLiked = userLikedPosts.has(post.id);
  const [likeCount, setLikeCount] = React.useState(post.likeCount);

  let attachments: Attachment[] = [];
  try {
    attachments = post.attachments ? JSON.parse(post.attachments) : [];
  } catch {
    attachments = [];
  }
  const pdfAttachments = attachments.filter((attachment) =>
    attachment.name.toLowerCase().endsWith('.pdf')
  );

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUserId) {
      router.push('/login');
      return;
    }
    try {
      const result = await communityApi.toggleLike(post.id, currentUserId);
      if (result.liked) {
        addUserLike(post.id);
        setLikeCount((prev) => prev + 1);
      } else {
        removeUserLike(post.id);
        setLikeCount((prev) => prev - 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <Link href={`/community/${post.id}`}>
      <article className="bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-lg transition-shadow p-4 border border-gray-200 dark:border-slate-700 cursor-pointer">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400">
          {post.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          by {post.author.name} • {formatDate(new Date(post.createdAt))}
        </p>
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-48 object-cover rounded-md my-3"
          />
        )}
        <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
          {truncateContent(post.content, 150)}
        </p>
        {pdfAttachments.length > 0 && (
          <div className="mb-4 rounded-lg border border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/10 p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
              <FileText size={16} />
              PDF attachments available
            </div>
            <div className="space-y-2">
              {pdfAttachments.map((attachment, index) => (
                <a
                  key={`${attachment.name}-${index}`}
                  href={attachment.data}
                  download={attachment.name}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-between gap-3 rounded-md border border-blue-200/70 dark:border-blue-800/60 bg-white/80 dark:bg-slate-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <span className="truncate">{attachment.name}</span>
                  <Download size={16} className="shrink-0 text-blue-600 dark:text-blue-400" />
                </a>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              isLiked
                ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
            <span className="text-sm font-medium">{likeCount}</span>
          </button>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 px-3 py-2">
            <MessageCircle size={18} />
            <span className="text-sm font-medium">{post.commentCount}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
