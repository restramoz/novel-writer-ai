import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLocation } from "wouter";
import { BookOpen, Sparkles, Wand2, Users, Zap } from "lucide-react";
import MainLayout from "@/components/MainLayout";
import { trpc } from "@/lib/trpc";
import type { Novel } from "@shared/types";

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { data: novels = [], isLoading } = trpc.novels.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="mb-8">
            <Sparkles className="w-16 h-16 mx-auto text-accent animate-pulse-glow mb-4" />
            <h1 className="text-5xl font-bold mb-4 text-foreground">
              Novel Writer AI
            </h1>
            <p className="text-xl text-foreground/70 mb-8">
              Create captivating stories with the power of AI. Generate concepts,
              characters, and chapters effortlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="card-mystical border-mystical hover:shadow-lg transition-all">
              <CardHeader>
                <Wand2 className="w-8 h-8 text-accent mb-2" />
                <CardTitle>Master Concepts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/70">
                  Transform your ideas into complete story structures with
                  AI-powered concept generation.
                </p>
              </CardContent>
            </Card>

            <Card className="card-mystical border-mystical hover:shadow-lg transition-all">
              <CardHeader>
                <Users className="w-8 h-8 text-accent mb-2" />
                <CardTitle>Character Manager</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/70">
                  Create rich, detailed characters with personalities,
                  backstories, and relationships.
                </p>
              </CardContent>
            </Card>

            <Card className="card-mystical border-mystical hover:shadow-lg transition-all">
              <CardHeader>
                <Zap className="w-8 h-8 text-accent mb-2" />
                <CardTitle>Chapter Generation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/70">
                  Generate chapters with context awareness and streaming
                  real-time responses.
                </p>
              </CardContent>
            </Card>
          </div>

          <Button onClick={() => navigate("/create")} className="btn-mystical text-lg px-8 py-6">
            Start Writing
          </Button>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Welcome back, {user?.name}
          </h1>
          <p className="text-foreground/70">
            Continue your creative journey or start a new novel
          </p>
        </div>

        <div className="flex gap-4">
          <Button onClick={() => navigate("/create")} className="btn-mystical">
            <Sparkles className="w-4 h-4 mr-2" />
            Create New Novel
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-48 bg-card/50 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : novels.length === 0 ? (
          <Card className="card-mystical text-center py-12">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-foreground/70 mb-4">
              No novels yet. Create your first masterpiece!
            </p>
            <Button onClick={() => navigate("/create")} variant="outline">
              Create Novel
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {novels.map((novel: Novel) => (
              <Card
                key={novel.id}
                className="card-mystical cursor-pointer hover:shadow-lg transition-all"
                onClick={() => navigate(`/novel/${novel.id}`)}
              >
                <CardHeader>
                  <CardTitle className="line-clamp-2">{novel.title}</CardTitle>
                  <CardDescription>{novel.genre}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p className="text-foreground/70 line-clamp-3">
                      {novel.basicIdea || "No description"}
                    </p>
                    <div className="flex justify-between text-xs text-foreground/50">
                      <span>{novel.wordCount} words</span>
                      <span className="capitalize">{novel.status}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
