'use client';

import React from 'react';
import Link from 'next/link';
import { Pencil, Trash2, Flag, X, Check } from 'lucide-react';
import { communityApi } from '@/lib/community/api';
import { formatDate } from '@/lib/community/helpers';

interface Comment {
  id: string;
  content: string;
  author: { id: string; name: string };
  createdAt: Date;
}

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  currentUserId?: string;
  onCommentAdded?: (comment: Comment) => void;
  onCommentUpdated?: (comment: Comment) => void;
  onCommentDeleted?: (commentId: string) => void;
}

const FLAG_REASONS = [
  'Spam or misleading',
  'Harassment or hate speech',
  'Inappropriate content',
  'Off-topic',
  'Other',
];

export function CommentSection({
  postId,
  comments,
  currentUserId,
  onCommentAdded,
  onCommentUpdated,
  onCommentDeleted,
}: CommentSectionProps) {
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editContent, setEditContent] = React.useState('');
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [flaggingId, setFlaggingId] = React.useState<string | null>(null);
  const [flagReason, setFlagReason] = React.useState('');
  const [flagSuccess, setFlagSuccess] = React.useState<string | null>(null);
  const [flagError, setFlagError] = React.useState<string | null>(null);
  const MAX_COMMENT_LENGTH = 300;
  const isCommentTooLong = input.length > MAX_COMMENT_LENGTH;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentUserId) return;
    setLoading(true);
    try {
      const comment = await communityApi.createComment(input, postId, currentUserId);
      setInput('');
      onCommentAdded?.(comment);
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return;
    setLoading(true);
    try {
      const updated = await communityApi.updateComment(commentId, editContent);
      setEditingId(null);
      setEditContent('');
      onCommentUpdated?.(updated);
    } catch (error) {
      console.error('Error updating comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    setLoading(true);
    try {
      await communityApi.deleteComment(commentId);
      setDeletingId(null);
      onCommentDeleted?.(commentId);
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFlag = async (commentId: string) => {
    if (!flagReason.trim()) return;
    try {
      await communityApi.flagContent(flagReason, undefined, commentId);
      setFlaggingId(null);
      setFlagReason('');
      setFlagSuccess('Comment has been flagged for review.');
      setTimeout(() => setFlagSuccess(null), 3000);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to flag';
      setFlagError(msg);
      setTimeout(() => setFlagError(null), 3000);
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
    setDeletingId(null);
    setFlaggingId(null);
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Comments ({comments.length})
      </h3>

      {flagSuccess && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">
          {flagSuccess}
        </div>
      )}
      {flagError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
          {flagError}
        </div>
      )}

      {currentUserId ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Add a comment..."
              className={`w-full px-4 py-3 rounded-lg border dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 resize-none ${
                isCommentTooLong
                  ? 'border-yellow-300 focus:ring-yellow-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              rows={3}
            />
            <div className="flex items-center justify-between mt-2">
              <div>
                {isCommentTooLong && (
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                    💡 Consider keeping comments shorter for better readability
                  </p>
                )}
              </div>
              <span
                className={`text-xs ${
                  isCommentTooLong
                    ? 'text-yellow-600 dark:text-yellow-400 font-medium'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {input.length}/{MAX_COMMENT_LENGTH}
              </span>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <div className="mb-6 p-4 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Log in
            </Link>{' '}
            to leave a comment.
          </p>
        </div>
      )}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="p-4 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600"
          >
            <div className="flex items-start justify-between mb-2">
              <p className="font-semibold text-gray-900 dark:text-white">{comment.author.name}</p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(new Date(comment.createdAt))}
                </p>
                {currentUserId && (
                  <div className="flex items-center gap-1">
                    {currentUserId === comment.author.id && (
                      <>
                        <button
                          type="button"
                          onClick={() => startEditing(comment)}
                          title="Edit comment"
                          className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeletingId(comment.id);
                            setEditingId(null);
                            setFlaggingId(null);
                          }}
                          title="Delete comment"
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                    {currentUserId !== comment.author.id && (
                      <button
                        type="button"
                        onClick={() => {
                          setFlaggingId(comment.id);
                          setEditingId(null);
                          setDeletingId(null);
                        }}
                        title="Flag comment"
                        className="p-1 text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                      >
                        <Flag size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Delete confirmation */}
            {deletingId === comment.id && (
              <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                  Are you sure you want to delete this comment?
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleDelete(comment.id)}
                    disabled={loading}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingId(null)}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Flag form */}
            {flaggingId === comment.id && (
              <div className="mb-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    Flag this comment
                  </p>
                  <button
                    type="button"
                    onClick={() => setFlaggingId(null)}
                    aria-label="Close flag form"
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="space-y-2">
                  {FLAG_REASONS.map((reason) => (
                    <label key={reason} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name={`flag-reason-${comment.id}`}
                        value={reason}
                        checked={flagReason === reason}
                        onChange={() => setFlagReason(reason)}
                        className="text-orange-600"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{reason}</span>
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => handleFlag(comment.id)}
                  disabled={!flagReason.trim()}
                  className="mt-2 px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 transition-colors"
                >
                  Submit Flag
                </button>
              </div>
            )}

            {/* Edit form or content */}
            {editingId === comment.id ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Edit your comment..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(comment.id)}
                    disabled={loading || !editContent.trim()}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <Check size={14} />
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setEditContent('');
                    }}
                    className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                  >
                    <X size={14} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
