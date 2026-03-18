import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveCallerUserProfile } from "../hooks/useQueries";

export function OnboardingPage() {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }
    try {
      await saveProfile.mutateAsync({
        username: username.trim(),
        bio: bio.trim(),
        createdAt: BigInt(Date.now()) * 1_000_000n,
      });
      toast.success("Profile created! Welcome to SocialSphere 🎉");
    } catch {
      toast.error("Failed to create profile. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/3 right-1/3 w-64 h-64 rounded-full opacity-8"
          style={{ background: "oklch(0.65 0.28 285)", filter: "blur(80px)" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-sm w-full"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-brand shadow-glow mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Set up your profile
          </h1>
          <p className="text-muted-foreground text-sm">
            Choose a username and tell the world about yourself
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">
              Username <span className="text-destructive">*</span>
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@yourname"
              className="h-12 bg-card border-border text-base"
              autoComplete="username"
              maxLength={32}
              data-ocid="onboarding.input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-medium">
              Bio{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              className="bg-card border-border resize-none text-base"
              rows={3}
              maxLength={200}
              data-ocid="onboarding.textarea"
            />
            <p className="text-xs text-muted-foreground text-right">
              {bio.length}/200
            </p>
          </div>

          <Button
            type="submit"
            disabled={!username.trim() || saveProfile.isPending}
            className="w-full h-12 rounded-2xl gradient-brand border-0 text-white font-semibold text-base"
            data-ocid="onboarding.submit_button"
          >
            {saveProfile.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Join SocialSphere"
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
