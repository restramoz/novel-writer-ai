import { X } from "lucide-react";
import { useLocation } from "wouter";

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const [, navigate] = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 md:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed left-0 top-0 z-50 h-screen w-64 bg-card border-r border-mystical md:hidden">
        <div className="flex items-center justify-between p-4 border-b border-mystical">
          <h2 className="font-semibold text-glow">Menu</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <button
            onClick={() => handleNavigation("/")}
            className="w-full text-left px-4 py-2 rounded-lg hover:bg-accent/10 transition-colors"
          >
            Library
          </button>
          <button
            onClick={() => handleNavigation("/create")}
            className="w-full text-left px-4 py-2 rounded-lg hover:bg-accent/10 transition-colors"
          >
            Create Novel
          </button>
          <button
            onClick={() => handleNavigation("/settings")}
            className="w-full text-left px-4 py-2 rounded-lg hover:bg-accent/10 transition-colors"
          >
            Settings
          </button>
        </nav>
      </div>
    </>
  );
}
