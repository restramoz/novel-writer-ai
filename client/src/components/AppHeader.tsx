import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation, useRoute } from "wouter";
import { Menu, LogOut, Settings, Sparkles } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppHeaderProps {
  onMenuClick?: () => void;
}

export default function AppHeader({ onMenuClick }: AppHeaderProps) {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-mystical bg-card/80 backdrop-blur-md">
      <div className="container flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="relative">
            <Sparkles className="w-6 h-6 text-accent animate-pulse-glow" />
          </div>
          <h1 className="text-xl font-bold text-foreground bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Novel Writer
          </h1>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => navigate("/")}
            className="text-foreground/70 hover:text-foreground transition-colors"
          >
            Library
          </button>
          <button
            onClick={() => navigate("/create")}
            className="text-foreground/70 hover:text-foreground transition-colors"
          >
            Create
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-foreground hover:bg-accent/10"
                  >
                    {user.name || "User"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button size="sm" className="btn-mystical">
              Sign In
            </Button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 hover:bg-accent/10 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
