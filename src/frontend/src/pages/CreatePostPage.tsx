import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Loader2, Send, X } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { UserAvatar } from "../components/UserAvatar";
import { useCreatePost, useGetCallerUserProfile } from "../hooks/useQueries";

interface CreatePostPageProps {
  onSuccess: () => void;
}

export function CreatePostPage({ onSuccess }: CreatePostPageProps) {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createPost = useCreatePost();
  const { data: profile } = useGetCallerUserProfile();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageFile) {
      toast.error("Add some text or an image to post");
      return;
    }

    let externalBlob: ExternalBlob | null = null;
    if (imageFile) {
      const bytes = new Uint8Array(await imageFile.arrayBuffer());
      externalBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
        setUploadProgress(pct),
      );
    }

    try {
      await createPost.mutateAsync({
        content: content.trim(),
        image: externalBlob,
      });
      toast.success("Post shared!");
      setContent("");
      removeImage();
      setUploadProgress(0);
      onSuccess();
    } catch {
      toast.error("Failed to create post. Please try again.");
      setUploadProgress(0);
    }
  };

  const charLimit = 500;
  const isOverLimit = content.length > charLimit;

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-40 glass border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-gradient-brand">
          New Post
        </h1>
        <Button
          onClick={handleSubmit}
          disabled={
            (!content.trim() && !imageFile) ||
            createPost.isPending ||
            isOverLimit
          }
          className="h-9 px-4 gradient-brand border-0 text-white font-semibold rounded-full text-sm"
          data-ocid="create.submit_button"
        >
          {createPost.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="h-3.5 w-3.5 mr-1.5" />
              Share
            </>
          )}
        </Button>
      </div>

      <div className="p-4 safe-bottom">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-4 shadow-card"
        >
          {/* Author row */}
          <div className="flex items-start gap-3">
            <UserAvatar profile={profile} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground">
                {profile?.username ?? "You"}
              </p>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                className="mt-2 bg-transparent border-0 resize-none p-0 text-base focus-visible:ring-0 text-foreground placeholder:text-muted-foreground min-h-[100px]"
                maxLength={charLimit + 50}
                data-ocid="create.textarea"
              />
            </div>
          </div>

          {/* Char counter */}
          <div className="flex justify-end mt-2">
            <span
              className={`text-xs ${
                isOverLimit ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {content.length}/{charLimit}
            </span>
          </div>

          {/* Image preview */}
          {imagePreview && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative mt-3 rounded-xl overflow-hidden"
            >
              <img
                src={imagePreview}
                alt="Selected preview"
                className="w-full max-h-64 object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 hover:bg-background transition-colors"
                data-ocid="create.delete_button"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {/* Upload progress */}
          {createPost.isPending &&
            uploadProgress > 0 &&
            uploadProgress < 100 && (
              <div className="mt-3">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full gradient-brand rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}

          {/* Image button */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              id="image-upload"
              data-ocid="create.upload_button"
            />
            <label
              htmlFor="image-upload"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary cursor-pointer transition-colors px-3 py-2 rounded-xl hover:bg-muted min-h-[44px]"
            >
              <ImagePlus className="h-5 w-5" />
              {imageFile ? imageFile.name : "Add photo"}
            </label>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
