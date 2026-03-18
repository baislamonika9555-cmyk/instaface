import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { UserProfile } from "../backend";

interface UserAvatarProps {
  profile: UserProfile | null | undefined;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

export function UserAvatar({
  profile,
  size = "md",
  className,
}: UserAvatarProps) {
  const initials = profile?.username
    ? profile.username.slice(0, 2).toUpperCase()
    : "?";

  const avatarUrl = profile?.avatar?.getDirectURL();

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {avatarUrl && (
        <AvatarImage src={avatarUrl} alt={profile?.username ?? "User"} />
      )}
      <AvatarFallback className="gradient-brand text-white font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
