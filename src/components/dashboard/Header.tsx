import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Calendar,
  LayoutDashboard,
  CheckSquare,
  PieChart,
  Target,
  BookOpen,
  User,
} from "lucide-react";
import { checkGoogleCalendarConnection } from "@/lib/googleCalendar";

interface HeaderProps {
  userAvatar?: string;
  onLogout?: () => void;
}

const Header = ({
  userAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=default",
  onLogout = () => {},
}: HeaderProps) => {
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [activePath, setActivePath] = useState("/");

  useEffect(() => {
    // Set active path based on current location
    setActivePath(window.location.pathname);

    const checkConnection = async () => {
      try {
        // In demo mode, just check database without loading Google API
        const user = await import("@/lib/supabase").then((m) =>
          m.getCurrentUser(),
        );
        if (user) {
          const { supabase } = await import("@/lib/supabase");
          const { data } = await supabase
            .from("google_calendar_settings")
            .select("is_connected")
            .eq("user_id", user.id)
            .maybeSingle();

          setIsCalendarConnected(data?.is_connected || false);
        } else {
          setIsCalendarConnected(false);
        }
      } catch (error) {
        console.error("Error checking Google Calendar connection:", error);
        setIsCalendarConnected(false);
      }
    };

    checkConnection();

    // Check connection status periodically
    const intervalId = setInterval(checkConnection, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, []);

  const isActive = (path: string) => {
    return activePath === path
      ? "text-primary font-medium glow-text"
      : "text-foreground/80 hover:text-primary";
  };

  return (
    <header className="bg-gradient-glass glass-nav border-b border-white/10 sticky top-0 z-10 backdrop-blur-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2">
              <div className="rounded-full bg-primary p-1 glow animate-pulse-glow">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-white"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <span className="text-lg font-medium glow-text">Mental Bank</span>
            </Link>

            <nav className="hidden md:flex ml-8 space-x-6">
              <Link
                to="/"
                className={`flex items-center space-x-1 ${isActive("/")}`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/tasks"
                className={`flex items-center space-x-1 ${isActive("/tasks")}`}
              >
                <CheckSquare className="h-4 w-4" />
                <span>Tasks</span>
              </Link>
              <Link
                to="/categories"
                className={`flex items-center space-x-1 ${isActive("/categories")}`}
              >
                <PieChart className="h-4 w-4" />
                <span>Categories</span>
              </Link>
              <Link
                to="/charts"
                className={`flex items-center space-x-1 ${isActive("/charts")}`}
              >
                <Calendar className="h-4 w-4" />
                <span>Growth</span>
              </Link>
              <Link
                to="/goals"
                className={`flex items-center space-x-1 ${isActive("/goals")}`}
              >
                <Target className="h-4 w-4" />
                <span>Goals</span>
              </Link>
              <Link
                to="/journal"
                className={`flex items-center space-x-1 ${isActive("/journal")}`}
              >
                <BookOpen className="h-4 w-4" />
                <span>Journal</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center">
                    <Calendar
                      className={`h-5 w-5 ${isCalendarConnected ? "text-green-500" : "text-gray-400"}`}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {isCalendarConnected
                    ? "Google Calendar Connected"
                    : "Google Calendar Not Connected"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Link to="/profile">
              <Avatar className="cursor-pointer hover:ring-2 hover:ring-primary/50">
                <AvatarImage src={userAvatar} alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="glass-card-inner border-white/20 hover:bg-white/10"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
