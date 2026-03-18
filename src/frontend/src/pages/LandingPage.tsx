import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Heart, MessageCircle, Sparkles, Users } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function LandingPage() {
  const { login, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isLoggingIn = loginStatus === "logging-in";

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      if (error?.message === "User is already authenticated") {
        await queryClient.invalidateQueries();
      }
    }
  };

  const features = [
    { icon: Users, label: "Follow friends & creators" },
    { icon: Heart, label: "Like what inspires you" },
    { icon: MessageCircle, label: "Join the conversation" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-10"
          style={{ background: "oklch(0.65 0.28 285)", filter: "blur(80px)" }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full opacity-8"
          style={{ background: "oklch(0.7 0.2 355)", filter: "blur(60px)" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 max-w-sm w-full text-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center mb-6"
        >
          <img
            src="/assets/generated/socialsphere-logo-transparent.dim_120x120.png"
            alt="SocialSphere"
            className="h-20 w-20"
          />
        </motion.div>

        {/* Brand */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="font-display text-5xl font-bold tracking-tight mb-3"
        >
          <span className="text-gradient-brand">Social</span>
          <span className="text-foreground">Sphere</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-muted-foreground text-lg mb-10 leading-relaxed"
        >
          Share moments. Build connections. Be yourself.
        </motion.p>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-3 mb-10"
        >
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-3 bg-card rounded-xl px-4 py-3"
              >
                <div className="gradient-brand rounded-lg p-1.5">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-foreground/90">
                  {f.label}
                </span>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-3"
        >
          <Button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full h-14 text-base font-semibold rounded-2xl gradient-brand border-0 text-white shadow-glow"
            data-ocid="landing.primary_button"
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 animate-pulse" />
                Connecting...
              </span>
            ) : (
              "Get Started"
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            Secured by Internet Identity — no passwords needed
          </p>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="relative z-10 mt-12 text-center"
      >
        <p className="text-xs text-muted-foreground/60">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </motion.footer>
    </div>
  );
}
