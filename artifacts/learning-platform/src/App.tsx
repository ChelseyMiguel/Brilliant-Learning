import { Switch, Route, Router as WouterRouter } from 'wouter';
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import DashboardPage from "@/pages/dashboard";
import CoursesPage from "@/pages/courses";
import CourseDetailPage from "@/pages/course-detail";
import LessonPlayerPage from "@/pages/lesson-player";
import ProfilePage from "@/pages/profile";
import ReviewPage from "@/pages/review";
import LeaderboardPage from "@/pages/leaderboard";
import LearnPage from "@/pages/learn";
import GlossaryPage from "@/pages/glossary";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function AppRoutes() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Switch>
          <Route path="/" component={LandingPage} />
          <Route path="/dashboard" component={DashboardPage} />
          <Route path="/courses" component={CoursesPage} />
          <Route path="/courses/:courseId" component={CourseDetailPage} />
          <Route path="/lessons/:lessonId" component={LessonPlayerPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/review" component={ReviewPage} />
          <Route path="/leaderboard" component={LeaderboardPage} />
          <Route path="/learn" component={LearnPage} />
          <Route path="/glossary" component={GlossaryPage} />
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <WouterRouter base={basePath}>
        <AppRoutes />
      </WouterRouter>
    </ErrorBoundary>
  );
}

export default App;
