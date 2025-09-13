import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "@/lib/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: "user" | "admin";
}

const AuthGuard = ({ children, requiredRole }: AuthGuardProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await AuthService.getCurrentUser();
        
        if (!user) {
          navigate("/auth");
          return;
        }

        setIsAuthenticated(true);

        // If a specific role is required, check if user has that role
        if (requiredRole && user.role !== requiredRole) {
          // If user doesn't have the required role, redirect to their appropriate dashboard
          if (user.role === "admin") {
            navigate("/admin");
          } else {
            navigate("/user");
          }
          return;
        }

        // If user is authenticated but trying to access wrong dashboard, redirect appropriately
        if (requiredRole === "admin" && user.role !== "admin") {
          navigate("/user");
          return;
        }

        if (requiredRole === "user" && user.role !== "user") {
          navigate("/admin");
          return;
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        navigate("/auth");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, requiredRole]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
};

export default AuthGuard;
