import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import {
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  Target,
  BookOpen,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const Header = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <header className="w-full border-b border-white/10 bg-gradient-glass">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Link
              to="/"
              className="flex items-center mr-6 text-xl font-bold glow-text"
            >
              <span className="text-2xl mr-2 glow-text">$</span>
              Mental Bank
            </Link>

            <nav className="hidden md:flex space-x-1">
              <Link to="/">
                <Button
                  variant={isActive("/") ? "default" : "ghost"}
                  className="flex items-center glass-button"
                  size="sm"
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/tasks">
                <Button
                  variant={isActive("/tasks") ? "default" : "ghost"}
                  className="flex items-center glass-button"
                  size="sm"
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Tasks
                </Button>
              </Link>
              <Link to="/categories">
                <Button
                  variant={isActive("/categories") ? "default" : "ghost"}
                  className="flex items-center glass-button"
                  size="sm"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Categories
                </Button>
              </Link>
              <Link to="/growth">
                <Button
                  variant={isActive("/growth") ? "default" : "ghost"}
                  className="flex items-center glass-button"
                  size="sm"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Growth
                </Button>
              </Link>
              <Link to="/goals">
                <Button
                  variant={isActive("/goals") ? "default" : "ghost"}
                  className="flex items-center glass-button"
                  size="sm"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Goals
                </Button>
              </Link>
              <Link to="/journal">
                <Button
                  variant={isActive("/journal") ? "default" : "ghost"}
                  className="flex items-center glass-button"
                  size="sm"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Journal
                </Button>
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-1">
            <Link to="/profile">
              <Button
                variant={isActive("/profile") ? "default" : "ghost"}
                className="flex items-center glass-button"
                size="sm"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </Link>
            <Link to="/settings">
              <Button
                variant={isActive("/settings") ? "default" : "ghost"}
                className="flex items-center glass-button"
                size="sm"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="flex items-center glass-button"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
