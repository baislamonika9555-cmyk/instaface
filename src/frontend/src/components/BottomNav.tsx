import { cn } from "@/lib/utils";
import { Compass, Home, PlusSquare, User } from "lucide-react";
import { motion } from "motion/react";

type Tab = "home" | "explore" | "create" | "profile";

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: typeof Home; ocid: string }[] = [
  { id: "home", label: "Home", icon: Home, ocid: "nav.home.link" },
  { id: "explore", label: "Explore", icon: Compass, ocid: "nav.explore.link" },
  { id: "create", label: "Post", icon: PlusSquare, ocid: "nav.create.link" },
  { id: "profile", label: "Profile", icon: User, ocid: "nav.profile.link" },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 glass border-t border-border z-50 nav-safe"
      style={{
        height: "calc(var(--nav-height) + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 py-2 min-h-[44px] relative transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
              data-ocid={tab.ocid}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full gradient-brand"
                  transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                />
              )}
              {tab.id === "create" ? (
                <div
                  className={cn(
                    "gradient-brand rounded-xl p-2 transition-transform",
                    isActive && "scale-110",
                  )}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
              ) : (
                <Icon
                  className={cn("h-5 w-5", isActive && "fill-primary/20")}
                />
              )}
              {tab.id !== "create" && (
                <span className="text-[10px] font-medium">{tab.label}</span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
