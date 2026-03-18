import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import { Principal as PrincipalClass } from "@icp-sdk/core/principal";
import { ArrowLeft, Grid3X3, Loader2, UserMinus, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PostCard } from "../components/PostCard";
import { UserAvatar } from "../components/UserAvatar";
import {
  useFollowUser,
  useGetFollowers,
  useGetFollowing,
  useGetUserPosts,
  useGetUserProfile,
  useUnfollowUser,
} from "../hooks/useQueries";

interface ProfilePageProps {
  targetPrincipalStr: string;
  currentPrincipal: Principal | null;
  onBack: () => void;
  onNavigateToProfile: (principal: string) => void;
}

export function ProfilePage({
  targetPrincipalStr,
  currentPrincipal,
  onBack,
  onNavigateToProfile,
}: ProfilePageProps) {
  let targetPrincipal: Principal | null = null;
  try {
    targetPrincipal = PrincipalClass.fromText(targetPrincipalStr);
  } catch {
    // invalid principal
  }

  const { data: profile, isLoading: profileLoading } =
    useGetUserProfile(targetPrincipal);
  const { data: posts = [] } = useGetUserPosts(targetPrincipal);
  const { data: followers = [] } = useGetFollowers(targetPrincipal);
  const { data: following = [] } = useGetFollowing(targetPrincipal);

  const isOwnProfile = currentPrincipal?.toString() === targetPrincipalStr;
  const isFollowing = followers.some(
    (f) => f.toString() === currentPrincipal?.toString(),
  );

  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  const handleFollowToggle = async () => {
    if (!targetPrincipal) return;
    try {
      if (isFollowing) {
        await unfollowUser.mutateAsync(targetPrincipal);
        toast.success(`Unfollowed ${profile?.username}`);
      } else {
        await followUser.mutateAsync(targetPrincipal);
        toast.success(`Following ${profile?.username}`);
      }
    } catch {
      toast.error("Action failed. Try again.");
    }
  };

  const [activeTab, setActiveTab] = useState<"posts">("posts");

  if (profileLoading) {
    return (
      <div className="max-w-lg mx-auto" data-ocid="profile.loading_state">
        <div className="glass border-b border-border px-4 py-3 flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-start gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="flex gap-6">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-10 w-16" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-40 glass border-b border-border px-4 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-9 w-9"
          data-ocid="profile.link"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-display text-lg font-bold text-foreground flex-1 truncate">
          {profile?.username ?? "Profile"}
        </h1>
      </div>

      <div className="safe-bottom">
        {/* Profile header */}
        <div className="p-4 space-y-4">
          <div className="flex items-start gap-4">
            <UserAvatar profile={profile} size="xl" />
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-xl font-bold text-foreground">
                {profile?.username ?? "Unknown"}
              </h2>
              {profile?.bio && (
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            {[
              { label: "Posts", value: posts.length },
              { label: "Followers", value: followers.length },
              { label: "Following", value: following.length },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-bold text-lg text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Follow button */}
          {!isOwnProfile && currentPrincipal && (
            <Button
              onClick={handleFollowToggle}
              disabled={followUser.isPending || unfollowUser.isPending}
              className={`w-full h-10 rounded-xl font-semibold ${
                isFollowing
                  ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  : "gradient-brand border-0 text-white"
              }`}
              data-ocid="profile.toggle"
            >
              {followUser.isPending || unfollowUser.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isFollowing ? (
                <>
                  <UserMinus className="h-4 w-4 mr-2" />
                  Unfollow
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Follow
                </>
              )}
            </Button>
          )}
        </div>

        {/* Posts tab */}
        <div className="border-t border-border">
          <div className="flex">
            <button
              type="button"
              className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "posts"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground"
              }`}
              onClick={() => setActiveTab("posts")}
              data-ocid="profile.tab"
            >
              <Grid3X3 className="h-4 w-4" />
              Posts
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12" data-ocid="profile.empty_state">
              <p className="text-muted-foreground text-sm">No posts yet</p>
            </div>
          ) : (
            <div className="space-y-4" data-ocid="profile.list">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
