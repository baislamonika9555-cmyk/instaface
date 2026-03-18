import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Principal } from "@icp-sdk/core/principal";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, Check, Grid3X3, Loader2, Settings } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { PostCard } from "../components/PostCard";
import { UserAvatar } from "../components/UserAvatar";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useGetFollowers,
  useGetFollowing,
  useGetUserPosts,
  useUpdateProfile,
} from "../hooks/useQueries";

interface OwnProfilePageProps {
  currentPrincipal: Principal | null;
  onNavigateToProfile: (principal: string) => void;
}

export function OwnProfilePage({
  currentPrincipal,
  onNavigateToProfile,
}: OwnProfilePageProps) {
  const { data: profile } = useGetCallerUserProfile();
  const { data: posts = [] } = useGetUserPosts(currentPrincipal);
  const { data: followers = [] } = useGetFollowers(currentPrincipal);
  const { data: following = [] } = useGetFollowing(currentPrincipal);
  const updateProfile = useUpdateProfile();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const openEdit = () => {
    setUsername(profile?.username ?? "");
    setBio(profile?.bio ?? "");
    setAvatarPreview(null);
    setAvatarFile(null);
    setEditOpen(true);
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }
    let avatarBlob: ExternalBlob | null = null;
    if (avatarFile) {
      const bytes = new Uint8Array(await avatarFile.arrayBuffer());
      avatarBlob = ExternalBlob.fromBytes(bytes);
    }
    try {
      await updateProfile.mutateAsync({
        username: username.trim(),
        bio: bio.trim(),
        avatar: avatarBlob,
      });
      toast.success("Profile updated!");
      setEditOpen(false);
    } catch {
      toast.error("Failed to update profile.");
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-40 glass border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-gradient-brand">
          {profile?.username ?? "My Profile"}
        </h1>
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={openEdit}
              data-ocid="own-profile.open_modal_button"
            >
              <Settings className="h-4.5 w-4.5" />
            </Button>
          </DialogTrigger>
          <DialogContent
            className="max-w-sm bg-card border-border"
            data-ocid="own-profile.dialog"
          >
            <DialogHeader>
              <DialogTitle className="font-display">Edit Profile</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              {/* Avatar upload */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full overflow-hidden">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserAvatar profile={profile} size="xl" />
                    )}
                  </div>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarSelect}
                    className="hidden"
                    id="avatar-upload"
                    data-ocid="own-profile.upload_button"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 gradient-brand rounded-full p-1.5 cursor-pointer shadow-glow-sm"
                  >
                    <Camera className="h-3.5 w-3.5 text-white" />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  id="edit-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-muted border-0"
                  maxLength={32}
                  data-ocid="own-profile.input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-bio">Bio</Label>
                <Textarea
                  id="edit-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="bg-muted border-0 resize-none"
                  rows={3}
                  maxLength={200}
                  data-ocid="own-profile.textarea"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditOpen(false)}
                  className="flex-1"
                  data-ocid="own-profile.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="flex-1 gradient-brand border-0 text-white"
                  data-ocid="own-profile.save_button"
                >
                  {updateProfile.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="safe-bottom">
        {/* Profile header */}
        <div className="p-4 space-y-4">
          <div className="flex items-start gap-4">
            <UserAvatar profile={profile} size="xl" />
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-xl font-bold text-foreground">
                {profile?.username ?? "—"}
              </h2>
              {profile?.bio ? (
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {profile.bio}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground/60 mt-1 italic">
                  No bio yet
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

          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full border-border"
            data-ocid="own-profile.delete_button"
          >
            Sign Out
          </Button>
        </div>

        {/* Posts tab */}
        <div className="border-t border-border">
          <div className="flex">
            <div className="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium border-b-2 border-primary text-primary">
              <Grid3X3 className="h-4 w-4" />
              Posts
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {posts.length === 0 ? (
            <div
              className="text-center py-12"
              data-ocid="own-profile.empty_state"
            >
              <p className="text-muted-foreground text-sm">
                You haven\'t posted anything yet
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Share your first post!
              </p>
            </div>
          ) : (
            <div className="space-y-4" data-ocid="own-profile.list">
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
