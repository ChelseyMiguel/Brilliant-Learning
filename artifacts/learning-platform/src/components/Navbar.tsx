import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sparkles, Medal, ArrowLeft, BookMarked } from "lucide-react";

interface NavbarProps {
  /** If provided, renders a back arrow linking to this path instead of the full nav */
  backHref?: string;
  /** Label shown next to the logo when in "sub-page" mode */
  pageTitle?: string;
  /** Whether to show the full nav links (default: true) */
  fullNav?: boolean;
}

export default function Navbar({
  backHref,
  pageTitle,
  fullNav = true,
}: NavbarProps) {
  const [location] = useLocation();

  const { data: reviewData } = useQuery<{ total: number }>({
    queryKey: ["/api/progress/review"],
    queryFn: () => fetch("/api/progress/review").then((r) => r.json()),
  });
  const reviewCount = reviewData?.total ?? 0;

  const isActive = (path: string) => location === path;

  const navLinkClass = (path: string) =>
    `transition-colors ${isActive(path) ? "text-primary font-semibold" : ""}`;

  return (
    <>
      <nav className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Left: back button or logo */}
          <div className="flex items-center gap-2">
            {backHref && (
              <Link href={backHref}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-1 text-muted-foreground hover:text-foreground"
                  data-testid="button-back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
            )}
            <Link href="/dashboard">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0">
                  <img src="/lumina-logo.png" alt="Lumina" className="w-full h-full object-cover" />
                </div>
                <span className="font-semibold font-display">
                  {pageTitle ? pageTitle : "Lumina Learning"}
                </span>
              </div>
            </Link>
          </div>

          {/* Right: full nav or nothing */}
          {fullNav && (
            <div className="flex items-center gap-1">
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className={navLinkClass("/dashboard")}
                  data-testid="nav-dashboard"
                >
                  Home
                </Button>
              </Link>
              <Link href="/learn">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-1.5 ${navLinkClass("/learn")}`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Learn
                </Button>
              </Link>
              <Link href="/glossary">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-1.5 ${navLinkClass("/glossary")}`}
                  data-testid="nav-glossary"
                >
                  <BookMarked className="w-3.5 h-3.5" />
                  Glossary
                </Button>
              </Link>
              <Link href="/courses">
                <Button
                  variant="ghost"
                  size="sm"
                  className={navLinkClass("/courses")}
                  data-testid="nav-courses"
                >
                  Courses
                </Button>
              </Link>
              <Link href="/review">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`relative ${navLinkClass("/review")}`}
                  data-testid="nav-review"
                >
                  Review
                  {reviewCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {reviewCount > 9 ? "9+" : reviewCount}
                    </span>
                  )}
                </Button>
              </Link>
              <Link href="/leaderboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className={navLinkClass("/leaderboard")}
                  data-testid="nav-leaderboard"
                >
                  <Medal className="w-4 h-4 mr-1" />
                  Ranks
                </Button>
              </Link>
              <Link href="/profile">
                <Button
                  variant="ghost"
                  size="sm"
                  className={navLinkClass("/profile")}
                  data-testid="nav-profile"
                >
                  Profile
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

    </>
  );
}
