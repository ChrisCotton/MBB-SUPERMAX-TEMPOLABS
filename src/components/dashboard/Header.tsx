import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, Settings, User, LogOut, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface HeaderProps {
  userAvatar?: string;
  onLogout?: () => void;
}

const Header = ({ userAvatar = "", onLogout = () => {} }: HeaderProps) => {
  const [userDisplayName, setUserDisplayName] = useState<string>("John Doe");

  const handleLogout = async () => {
    try {
      await import("@/lib/auth").then(({ signOut }) => signOut());
      window.location.href = "/";
      onLogout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const session = await import("@/lib/auth").then(({ getSession }) =>
          getSession(),
        );
        if (session?.user?.email) {
          setUserDisplayName(session.user.email);
        }
      } catch (error) {
        console.error("Error getting user info:", error);
      }
    };

    getUserInfo();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-20 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <nav className="flex flex-col gap-4 pt-4">
                <Link to="/" className="text-lg font-medium hover:text-primary">
                  Dashboard
                </Link>
                <Link
                  to="/tasks"
                  className="text-lg font-medium hover:text-primary"
                >
                  Tasks
                </Link>
                <Link
                  to="/categories"
                  className="text-lg font-medium hover:text-primary"
                >
                  Categories
                </Link>
                <Link
                  to="/charts"
                  className="text-lg font-medium hover:text-primary"
                >
                  Charts
                </Link>
                <Link
                  to="/goals"
                  className="text-lg font-medium hover:text-primary"
                >
                  Goals
                </Link>
                <Link
                  to="/journal"
                  className="text-lg font-medium hover:text-primary"
                >
                  Journal
                </Link>
                <Link
                  to="/profile"
                  className="text-lg font-medium hover:text-primary"
                >
                  Profile
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-full bg-primary p-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-white"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <span className="text-xl font-bold">Mental Bank</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/tasks"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Tasks
          </Link>
          <Link
            to="/categories"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Categories
          </Link>
          <Link
            to="/charts"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Charts
          </Link>
          <Link
            to="/goals"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Goals
          </Link>
          <Link
            to="/journal"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Journal
          </Link>
          <Link
            to="/profile"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Profile
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            <span className="sr-only">Notifications</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar>
                  <AvatarImage src={userAvatar} alt={userDisplayName} />
                  <AvatarFallback>{userDisplayName.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                My Account ({userDisplayName})
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => (window.location.href = "/profile")}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
