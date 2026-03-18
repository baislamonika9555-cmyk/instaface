import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Principal } from "@icp-sdk/core/principal";
import { Loader2, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Comment } from "../backend";
import {
  useAddComment,
  useGetComments,
  useGetUserProfile,
} from "../hooks/useQueries";
import { UserAvatar } from "./UserAvatar";

function CommentItem({ comment }: { comment: Comment }) {
  const { data: profile } = useGetUserProfile(comment.author);

  const timeAgo = (timestamp: bigint) => {
    const diff = Date.now() - Number(timestamp / 1_000_000n);
    if (diff < 60_000) return "just now";
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
    return `${Math.floor(diff / 86_400_000)}d`;
  };

  return (
    <div className="flex gap-3 py-2">
      <UserAvatar profile={profile} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-sm text-foreground">
            {profile?.username ?? "User"}
          </span>
          <span className="text-xs text-muted-foreground">
            {timeAgo(comment.timestamp)}
          </span>
        </div>
        <p className="text-sm text-foreground/90 mt-0.5 break-words">
          {comment.content}
        </p>
      </div>
    </div>
  );
}

interface CommentSectionProps {
  postId: bigint;
  isAuthenticated: boolean;
  currentUserPrincipal: Principal | null;
}

export function CommentSection({
  postId,
  isAuthenticated,
}: CommentSectionProps) {
  const [commentText, setCommentText] = useState("");
  const { data: comments = [], isLoading } = useGetComments(postId);
  const addComment = useAddComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await addComment.mutateAsync({ postId, content: commentText.trim() });
      setCommentText("");
    } catch {
      // silent
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="overflow-hidden"
    >
      <div className="px-4 pt-2 pb-3 border-t border-border">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-0" data-ocid="comments.list">
            <AnimatePresence>
              {comments.length === 0 ? (
                <p
                  className="text-sm text-muted-foreground py-2 text-center"
                  data-ocid="comments.empty_state"
                >
                  No comments yet. Be the first!
                </p>
              ) : (
                comments.map((c) => (
                  <motion.div
                    key={c.id.toString()}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <CommentItem comment={c} />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        )}
        {isAuthenticated && (
          <form onSubmit={handleSubmit} className="flex gap-2 mt-3">
            <Input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 h-9 text-sm bg-muted border-0 focus-visible:ring-1"
              data-ocid="comments.input"
            />
            <Button
              type="submit"
              size="icon"
              className="h-9 w-9 shrink-0 gradient-brand border-0"
              disabled={!commentText.trim() || addComment.isPending}
              data-ocid="comments.submit_button"
            >
              {addComment.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </Button>
          </form>
        )}
      </div>
    </motion.div>
  );
}
