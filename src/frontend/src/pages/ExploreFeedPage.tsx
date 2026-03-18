import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import { Compass, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { PostCard } from "../components/PostCard";
import { useGetExploreFeed } from "../hooks/useQueries";

interface ExploreFeedPageProps {
  currentPrincipal: Principal | null;
  onNavigateToProfile: (principal: string) => void;
}

const LIMIT = 20n;

export function ExploreFeedPage({
  currentPrincipal,
  onNavigateToProfile,
}: ExploreFeedPageProps) {
  const [offset, setOffset] = useState(0n);
  const {
    data: posts = [],
    isLoading,
    isFetching,
  } = useGetExploreFeed(offset, LIMIT);

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-40 glass border-b border-border px-4 py-3">
        <h1 className="font-display text-xl font-bold text-gradient-brand">
          Explore
        </h1>
      </div>

      <div className="p-4 space-y-4 safe-bottom">
        {isLoading ? (
          <div className="space-y-4" data-ocid="explore.loading_state">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-48 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
            data-ocid="explore.empty_state"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4">
              <Compass className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              Nothing here yet
            </h3>
            <p className="text-sm text-muted-foreground">
              Be the first to post something amazing!
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4" data-ocid="explore.list">
            {posts.map((post, i) => (
              <PostCard
                key={post.id.toString()}
                post={post}
                isAuthenticated={!!currentPrincipal}
                currentPrincipal={currentPrincipal}
                onNavigateToProfile={onNavigateToProfile}
                index={i}
              />
            ))}
            {posts.length === Number(LIMIT) && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setOffset((o) => o + LIMIT)}
                disabled={isFetching}
                data-ocid="explore.pagination_next"
              >
                {isFetching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Load more"
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
