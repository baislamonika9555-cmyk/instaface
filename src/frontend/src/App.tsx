import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { BottomNav } from "./components/BottomNav";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import { CreatePostPage } from "./pages/CreatePostPage";
import { ExploreFeedPage } from "./pages/ExploreFeedPage";
import { HomeFeedPage } from "./pages/HomeFeedPage";
import { LandingPage } from "./pages/LandingPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { OwnProfilePage } from "./pages/OwnProfilePage";
import { ProfilePage } from "./pages/ProfilePage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
});

type Tab = "home" | "explore" | "create" | "profile";
type Route =
  | { type: "tab"; tab: Tab }
  | { type: "user-profile"; principal: string; fromTab: Tab };

function AppInner() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const currentPrincipal = identity?.getPrincipal() ?? null;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();

  const [route, setRoute] = useState<Route>({ type: "tab", tab: "home" });

  const activeTab: Tab = route.type === "tab" ? route.tab : route.fromTab;

  const navigateToProfile = (principal: string) => {
    const fromTab: Tab = route.type === "tab" ? route.tab : route.fromTab;
    // If viewing own profile, use the profile tab
    if (currentPrincipal && principal === currentPrincipal.toString()) {
      setRoute({ type: "tab", tab: "profile" });
    } else {
      setRoute({ type: "user-profile", principal, fromTab });
    }
  };

  // Not authenticated: show landing
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  // Checking profile
  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full gradient-brand animate-pulse" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (showProfileSetup) {
    return <OnboardingPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="relative">
        {route.type === "user-profile" ? (
          <ProfilePage
            targetPrincipalStr={route.principal}
            currentPrincipal={currentPrincipal}
            onBack={() => setRoute({ type: "tab", tab: route.fromTab })}
            onNavigateToProfile={navigateToProfile}
          />
        ) : route.tab === "home" ? (
          <HomeFeedPage
            currentPrincipal={currentPrincipal}
            onNavigateToProfile={navigateToProfile}
          />
        ) : route.tab === "explore" ? (
          <ExploreFeedPage
            currentPrincipal={currentPrincipal}
            onNavigateToProfile={navigateToProfile}
          />
        ) : route.tab === "create" ? (
          <CreatePostPage
            onSuccess={() => setRoute({ type: "tab", tab: "home" })}
          />
        ) : (
          <OwnProfilePage
            currentPrincipal={currentPrincipal}
            onNavigateToProfile={navigateToProfile}
          />
        )}
      </main>

      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setRoute({ type: "tab", tab })}
      />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
