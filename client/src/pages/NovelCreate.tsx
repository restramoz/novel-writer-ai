import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import MainLayout from "@/components/MainLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

const GENRES = [
  "Fantasy",
  "Romance",
  "Thriller",
  "Science Fiction",
  "Horror",
  "Mystery",
  "Adventure",
  "Historical Fiction",
  "Literary Fiction",
  "Young Adult",
];

export default function NovelCreate() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    title: "",
    genre: "Fantasy",
    basicIdea: "",
  });

  const createMutation = trpc.novels.create.useMutation({
    onSuccess: () => {
      toast.success("Novel created successfully!");
      navigate("/");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create novel");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please enter a novel title");
      return;
    }

    createMutation.mutate(formData);
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-glow mb-2">Create New Novel</h1>
          <p className="text-foreground/70">
            Start your creative journey by defining your novel's foundation
          </p>
        </div>

        <Card className="card-mystical">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              Novel Details
            </CardTitle>
            <CardDescription>
              Provide basic information about your novel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Novel Title *
                </label>
                <Input
                  placeholder="Enter your novel title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="bg-input border-mystical"
                />
              </div>

              {/* Genre */}
              <div>
                <label className="block text-sm font-medium mb-2">Genre</label>
                <Select value={formData.genre} onValueChange={(value) =>
                  setFormData({ ...formData, genre: value })
                }>
                  <SelectTrigger className="bg-input border-mystical">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GENRES.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Basic Idea */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Basic Idea / Synopsis
                </label>
                <Textarea
                  placeholder="Describe your novel's core concept, plot, or any initial ideas..."
                  value={formData.basicIdea}
                  onChange={(e) =>
                    setFormData({ ...formData, basicIdea: e.target.value })
                  }
                  rows={6}
                  className="bg-input border-mystical"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="btn-mystical"
                  disabled={createMutation.isPending || !formData.title.trim()}
                >
                  {createMutation.isPending ? "Creating..." : "Create Novel & Continue"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
