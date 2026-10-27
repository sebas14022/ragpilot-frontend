import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { useAuth } from "./context/AuthContext";

const SignIn = lazy(() => import("./pages/SignIn"));
const NotFound = lazy(() => import("./pages/NotFound"));
const RagLab = lazy(() => import("./pages/RagLab"));

function AppSplash() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <img
        src="/images/logo/logo.svg"
        alt="RagPilot"
        className="h-10 w-auto"
      />
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <span className="size-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        Loading session...
      </div>
    </div>
  );
}

function PageFallback() {
  return (
    <div className="flex h-64 items-center justify-center">
      <span className="size-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
    </div>
  );
}

export default function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return <AppSplash />;
  }

  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route
            path="/signin"
            element={session ? <Navigate to="/" replace /> : <SignIn />}
          />

          <Route
            element={session ? <AppLayout /> : <Navigate to="/signin" replace />}
          >
            <Route index path="/" element={<RagLab />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
