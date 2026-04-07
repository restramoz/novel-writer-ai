import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Streamdown } from "streamdown";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface MasterConceptGenProps {
  novelId: string;
  genre: string;
  basicIdea: string;
  onGenerated?: () => void;
}

export default function MasterConceptGen({
  novelId,
  genre,
  basicIdea,
  onGenerated,
}: MasterConceptGenProps) {
  const [synopsis, setSynopsis] = useState(basicIdea);
  const [generatedContent, setGeneratedContent] = useState<string>("");

  const generateMutation = trpc.novels.generateMasterConcept.useMutation({
    onSuccess: (data) => {
      setGeneratedContent(JSON.stringify(data, null, 2));
      toast.success("Master Concept generated successfully!");
      onGenerated?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate master concept");
    },
  });

  const handleGenerate = () => {
    if (!synopsis.trim()) {
      toast.error("Please enter a synopsis");
      return;
    }

    generateMutation.mutate({
      novelId,
      synopsis,
      genre,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="card-mystical">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Generate Master Concept
          </CardTitle>
          <CardDescription>
            Transform your synopsis into a comprehensive story structure with AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Novel Synopsis
            </label>
            <Textarea
              placeholder="Enter or refine your novel's synopsis..."
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              rows={6}
              className="bg-input border-mystical"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generateMutation.isPending || !synopsis.trim()}
            className="btn-mystical w-full"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Master Concept
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedContent && (
        <Card className="card-mystical">
          <CardHeader>
            <CardTitle>Generated Master Concept</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none">
              <Streamdown>{generatedContent}</Streamdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
