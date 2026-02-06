'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { commentsApi } from '@/lib/api';
import { Comment, UserRole } from '@/types';
import Link from 'next/link';

const ADMIN_ROLES: UserRole[] = ['CONTENT_MANAGER', 'MANAGER', 'SUPER_ADMIN'];
const MIN_LENGTH = 3;
const MAX_LENGTH = 500;

// Client-side bad word filter (basic check)
const BAD_WORDS = [
  'anjing', 'anjir', 'bangsat', 'brengsek', 'bajingan', 'keparat', 'kampret',
  'kontol', 'memek', 'ngentot', 'jancok', 'jancuk', 'goblok', 'goblog', 'tolol',
  'idiot', 'bego', 'bodoh', 'babi', 'setan', 'iblis', 'pelacur', 'sundal', 'lonte',
  'fuck', 'shit', 'bitch', 'bastard', 'dick', 'pussy', 'slut', 'whore',
];

function containsBadWordsClient(text: string): boolean {
  const normalized = text.toLowerCase().replace(/[0-9@]/g, (c) => {
    const map: Record<string, string> = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a' };
    return map[c] || c;
  });
  const noSpaces = normalized.replace(/\s+/g, '');
  return BAD_WORDS.some((w) => normalized.includes(w) || noSpaces.includes(w));
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'baru saja';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  const months = Math.floor(days / 30);
  return `${months} bulan lalu`;
}

export default function CommentSection({ programId }: { programId: string }) {
  const user = useAuthStore((s) => s.user);
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [clientError, setClientError] = useState('');

  const isAdmin = user && ADMIN_ROLES.includes(user.role);

  const fetchComments = async () => {
    try {
      const res = await commentsApi.getAll(programId);
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setComments(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [programId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setClientError('');

    const trimmed = content.trim();
    if (trimmed.length < MIN_LENGTH) {
      setClientError(`Komentar minimal ${MIN_LENGTH} karakter`);
      return;
    }
    if (trimmed.length > MAX_LENGTH) {
      setClientError(`Komentar maksimal ${MAX_LENGTH} karakter`);
      return;
    }
    if (containsBadWordsClient(trimmed)) {
      setClientError('Komentar mengandung kata-kata yang tidak pantas');
      return;
    }

    setSubmitting(true);
    try {
      await commentsApi.create({ programId, content: trimmed });
      setContent('');
      await fetchComments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengirim komentar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHide = async (id: string) => {
    try {
      await commentsApi.hide(id);
      await fetchComments();
    } catch { /* ignore */ }
  };

  const handleUnhide = async (id: string) => {
    try {
      await commentsApi.unhide(id);
      await fetchComments();
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus komentar ini secara permanen?')) return;
    try {
      await commentsApi.delete(id);
      await fetchComments();
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-sm font-bold text-primary-600">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700">{user.name}</span>
          </div>
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setClientError('');
            }}
            placeholder="Tulis komentar..."
            rows={3}
            maxLength={MAX_LENGTH}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-3">
              <span className={`text-xs ${content.length > MAX_LENGTH ? 'text-red-500' : 'text-gray-400'}`}>
                {content.length}/{MAX_LENGTH}
              </span>
              {(clientError || error) && (
                <span className="text-xs text-red-500">{clientError || error}</span>
              )}
            </div>
            <button
              type="submit"
              disabled={submitting || content.trim().length < MIN_LENGTH}
              className="px-5 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Mengirim...' : 'Kirim'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
          <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-sm text-gray-500 mb-3">Login untuk memberikan komentar</p>
          <Link
            href="/login"
            className="inline-block px-5 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            Login
          </Link>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-sm text-gray-400">Belum ada komentar</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={`bg-white rounded-xl border p-5 ${
                comment.isHidden ? 'border-yellow-200 bg-yellow-50/50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-500">
                      {comment.user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {comment.user?.name || 'Anonim'}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      {timeAgo(comment.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Admin actions */}
                {isAdmin && (
                  <div className="flex items-center space-x-1">
                    {comment.isHidden ? (
                      <button
                        onClick={() => handleUnhide(comment.id)}
                        className="p-1.5 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
                        title="Tampilkan komentar"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleHide(comment.id)}
                        className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Sembunyikan komentar"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus komentar"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Hidden label for admin */}
              {comment.isHidden && isAdmin && (
                <div className="mt-2 mb-1">
                  <span className="inline-block text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">
                    Disembunyikan
                  </span>
                </div>
              )}

              <p className="mt-3 text-sm text-gray-700 leading-relaxed">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
