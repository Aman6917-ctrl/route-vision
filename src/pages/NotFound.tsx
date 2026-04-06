import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen noise-overlay flex items-center justify-center px-4 bg-background">
      <div className="glass-panel max-w-md w-full p-10 text-center space-y-4">
        <p className="text-6xl font-display font-bold text-gradient glow-text">404</p>
        <h1 className="text-lg font-semibold text-foreground">Page not found</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This path does not exist. Head back to the route planner.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 btn-glow px-6 py-3 rounded-xl text-sm font-semibold text-primary-foreground mt-2"
        >
          <Home className="w-4 h-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
