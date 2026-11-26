"use client";

import { useEffect, useState } from "react";
import { useUserAuth } from "@/contexts/UserAuthContext";
import AuthModal from "@/components/ui/AuthModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface Comment {
  id: string;
  displayName: string;
  content: string;
  createdAt: string;
}

interface PaginatedComments {
  data: Comment[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface CommentsSectionProps {
  articleId: string;
}

function formatCommentDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ta-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CommentsSection({ articleId }: CommentsSectionProps) {
  const { user, token, loading: authLoading } = useUserAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Form state
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function fetchComments(p: number) {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/comments/${articleId}?page=${p}`);
      if (res.ok) {
        const data: PaginatedComments = await res.json();
        setComments(data.data);
        setTotalPages(data.totalPages);
        setTotal(data.total);
        setPage(data.page);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchComments(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user || !token) {
      setAuthModalOpen(true);
      return;
    }
    setSubmitting(true);
    setSubmitMessage(null);
    setSubmitError(null);

    try {
      const res = await fetch(`${API_URL}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ articleId, content }),
      });

      if (res.ok) {
        setSubmitMessage("கருத்து சமர்ப்பிக்கப்பட்டது. அங்கீகரிக்கப்பட்ட பிறகு காண்பிக்கப்படும்.");
        setContent("");
      } else if (res.status === 401) {
        setSubmitError("உள்நுழைவு காலாவதியானது. மீண்டும் உள்நுழையவும்.");
      } else {
        const body = await res.json().catch(() => null);
        setSubmitError(body?.error?.message || "கருத்தை சமர்ப்பிக்க முடியவில்லை.");
      }
    } catch {
      setSubmitError("கருத்தை சமர்ப்பிக்க முடியவில்லை.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-12 border-t border-foreground/10 pt-8">
      <h2 className="text-2xl font-bold">கருத்துகள் {total > 0 && <span className="text-base font-normal text-foreground/50">({total})</span>}</h2>

      {/* Comment list */}
      {loading ? (
        <p className="mt-4 text-sm text-foreground/50">ஏற்றுகிறது...</p>
      ) : comments.length === 0 ? (
        <p className="mt-4 text-sm text-foreground/50">இன்னும் கருத்துகள் இல்லை.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="rounded-lg border border-foreground/10 p-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold">{c.displayName}</span>
                <span className="text-foreground/40">·</span>
                <time className="text-foreground/50" dateTime={c.createdAt}>
                  {formatCommentDate(c.createdAt)}
                </time>
              </div>
              <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">{c.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => fetchComments(page - 1)}
            disabled={page <= 1}
            className="rounded border border-foreground/20 px-3 py-1 text-sm disabled:opacity-40"
          >
            முந்தைய
          </button>
          <span className="text-sm text-foreground/60">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => fetchComments(page + 1)}
            disabled={page >= totalPages}
            className="rounded border border-foreground/20 px-3 py-1 text-sm disabled:opacity-40"
          >
            அடுத்த
          </button>
        </div>
      )}

      {/* Comment submission */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold">கருத்து எழுதுங்கள்</h3>

        {authLoading ? (
          <p className="mt-3 text-sm text-foreground/50">ஏற்றுகிறது...</p>
        ) : user ? (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <p className="text-sm text-foreground/60">
              <span className="font-medium text-foreground">{user.name}</span> என உள்நுழைந்துள்ளனர்
            </p>
            <textarea
              placeholder="உங்கள் கருத்து *"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={4}
              maxLength={5000}
              className="w-full rounded border border-foreground/20 bg-background px-3 py-2 text-sm"
            />

            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "சமர்ப்பிக்கிறது..." : "கருத்தை சமர்ப்பி"}
            </button>

            {submitMessage && <p className="text-sm text-green-600">{submitMessage}</p>}
            {submitError && <p className="text-sm text-red-600">{submitError}</p>}
          </form>
        ) : (
          <div className="mt-4 rounded-lg border border-foreground/15 bg-foreground/[0.03] p-5">
            <p className="text-sm text-foreground/70">
              கருத்து எழுத உள்நுழையவும் அல்லது பதிவு செய்யவும்.
            </p>
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="mt-3 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              உள்நுழைய / பதிவு செய்க
            </button>
          </div>
        )}
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </section>
  );
}
