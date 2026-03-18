import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Principal } from "@icp-sdk/core/principal";
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Post } from "../backend";
import {
  useGetUserProfile,
  useLikePost,
  useUnlikePost,
} from "../hooks/useQueries";
import { CommentSection } from "./CommentSection";
import { UserAvatar } from "./UserAvatar";

interface PostCardProps {
  post: Post;
  isAuthenticated: boolean;
  currentPrincipal: Principal | null;
  onNavigateToProfile?: (principal: string) => void;
  index?: number;
}

const TIME_AGO = (timestamp: bigint) => {
  const diff = Date.now() - Number(timestamp / 1_000_000n);
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return new Date(Number(timestamp / 1_000_000n)).toLocaleDateString();
};

export function PostCard({
  post,
  isAuthenticated,
  currentPrincipal,
  onNavigateToProfile,
  index = 0,
}: PostCardProps) {
  const { data: authorProfile } = useGetUserProfile(post.author);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Number(post.likes));
  const [showComments, setShowComments] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);

  const likePost = useLikePost();
  const unlikePost = useUnlikePost();

  const handleLike = async () => {
    if (!isAuthenticated) return;
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 300);
    try {
      if (wasLiked) {
        await unlikePost.mutateAsync(post.id);
      } else {
        await likePost.mutateAsync(post.id);
      }
    } catch {
      setLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
    }
  };

  const imageUrl = post.image?.getDirectURL();

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
      className="bg-card rounded-2xl shadow-card overflow-hidden"
      data-ocid={`post.item.${index + 1}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button
          type="button"
          onClick={() => onNavigateToProfile?.(post.author.toString())}
          className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
        >
          <UserAvatar profile={authorProfile} size="md" />
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">
              {authorProfile?.username ??
                `${post.author.toString().slice(0, 8)}...`}
            </p>
            <p className="text-xs text-muted-foreground">
              {TIME_AGO(post.timestamp)}
            </p>
          </div>
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground shrink-0"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      {post.content && (
        <p className="px-4 py-1 text-[15px] text-foreground/95 leading-relaxed">
          {post.content}
        </p>
      )}

      {/* Image */}
      {imageUrl && (
        <div className="mt-2">
          <img
            src={imageUrl}
            alt="Post"
            className="w-full object-cover max-h-96"
            loading="lazy"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 px-3 pt-2 pb-1">
        <button
          type="button"
          onClick={handleLike}
          disabled={!isAuthenticated}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all min-h-[44px]",
            liked
              ? "text-rose-400"
              : "text-muted-foreground hover:text-foreground",
            !isAuthenticated && "cursor-default",
          )}
          data-ocid={`post.toggle.${index + 1}`}
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-all",
              liked && "fill-rose-400",
              heartAnim && "animate-heart-pop",
            )}
          />
          <span className="text-sm font-medium">{likeCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
          data-ocid={`post.secondary_button.${index + 1}`}
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm font-medium">Comments</span>
        </button>
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <CommentSection
            postId={post.id}
            isAuthenticated={isAuthenticated}
            currentUserPrincipal={currentPrincipal}
          />
        )}
      </AnimatePresence>
    </motion.article>
  );
}
