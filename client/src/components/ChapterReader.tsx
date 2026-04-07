import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Streamdown } from "streamdown";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  BookmarkPlus,
  BookmarkCheck,
} from "lucide-react";
import { toast } from "sonner";

interface ChapterReaderProps {
  chapterId: string;
  title: string;
  content: string;
  onProgressUpdate?: (scrollPercentage: number) => void;
  onBookmarkSave?: () => void;
  isBookmarked?: boolean;
}

export default function ChapterReader({
  chapterId,
  title,
  content,
  onProgressUpdate,
  onBookmarkSave,
  isBookmarked = false,
}: ChapterReaderProps) {
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const contentRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Calculate reading progress
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const element = contentRef.current;
      const scrollTop = window.scrollY;
      const docHeight = element.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollPercent =
        (scrollTop / (docHeight - winHeight)) * 100;

      setScrollProgress(Math.min(scrollPercent, 100));
      onProgressUpdate?.(Math.min(scrollPercent, 100));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [onProgressUpdate]);

  // Handle music volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume;
    }
  }, [musicVolume]);

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    onBookmarkSave?.();
    toast.success(
      bookmarked ? "Bookmark removed" : "Bookmark saved"
    );
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (musicPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {
        toast.error("Could not play music");
      });
    }
    setMusicPlaying(!musicPlaying);
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="fixed top-16 left-0 right-0 z-30 h-1 bg-card/50">
        <div
          className="h-full bg-gradient-to-r from-accent to-secondary transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Reader Header */}
      <Card className="card-mystical sticky top-20 z-20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-glow">{title}</CardTitle>
              <p className="text-sm text-foreground/60 mt-1">
                {Math.round(scrollProgress)}% read
              </p>
            </div>

            {/* Music Player */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleMusic}
                  className="hover:bg-accent/10"
                >
                  {musicPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>

                <div className="flex items-center gap-2 w-24">
                  {musicVolume === 0 ? (
                    <VolumeX className="w-4 h-4 text-foreground/50" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-foreground/50" />
                  )}
                  <Slider
                    value={[musicVolume]}
                    onValueChange={(value) => setMusicVolume(value[0])}
                    min={0}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Bookmark Button */}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleBookmark}
                className="hover:bg-accent/10"
              >
                {bookmarked ? (
                  <BookmarkCheck className="w-4 h-4 text-accent" />
                ) : (
                  <BookmarkPlus className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content */}
      <Card className="card-mystical">
        <CardContent className="pt-6">
          <div
            ref={contentRef}
            className="prose prose-invert max-w-none text-lg leading-relaxed"
          >
            <Streamdown>{content}</Streamdown>
          </div>
        </CardContent>
      </Card>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        loop
      />
    </div>
  );
}
