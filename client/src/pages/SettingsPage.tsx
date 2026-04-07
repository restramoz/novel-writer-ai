import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MainLayout from "@/components/MainLayout";
import { toast } from "sonner";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    theme: "dark",
    modelName: "llama2",
    modelUrl: "http://localhost:11434",
    temperature: 0.7,
    maxTokens: 2000,
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("appSettings");
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("appSettings", JSON.stringify(settings));
    toast.success("Settings saved successfully!");
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-foreground/70">
            Configure your AI writing assistant and preferences
          </p>
        </div>

        {/* Theme Settings */}
        <Card className="card-mystical">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-accent" />
              Appearance
            </CardTitle>
            <CardDescription>Customize the look and feel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Theme</label>
              <Select
                value={settings.theme}
                onValueChange={(value) =>
                  setSettings({ ...settings, theme: value })
                }
              >
                <SelectTrigger className="bg-input border-mystical">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* AI Model Settings */}
        <Card className="card-mystical">
          <CardHeader>
            <CardTitle>AI Model Configuration</CardTitle>
            <CardDescription>
              Configure your Ollama instance for text generation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Model Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Model Name
              </label>
              <Select
                value={settings.modelName}
                onValueChange={(value) =>
                  setSettings({ ...settings, modelName: value })
                }
              >
                <SelectTrigger className="bg-input border-mystical">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="llama2">Llama 2</SelectItem>
                  <SelectItem value="mistral">Mistral</SelectItem>
                  <SelectItem value="neural-chat">Neural Chat</SelectItem>
                  <SelectItem value="dolphin-mixtral">
                    Dolphin Mixtral
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-foreground/50 mt-1">
                Make sure the model is installed in your Ollama instance
              </p>
            </div>

            {/* Model URL */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Ollama Server URL
              </label>
              <Input
                value={settings.modelUrl}
                onChange={(e) =>
                  setSettings({ ...settings, modelUrl: e.target.value })
                }
                placeholder="http://localhost:11434"
                className="bg-input border-mystical"
              />
              <p className="text-xs text-foreground/50 mt-1">
                Default: http://localhost:11434
              </p>
            </div>

            {/* Temperature */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Temperature: {settings.temperature.toFixed(2)}
              </label>
              <Slider
                value={[settings.temperature]}
                onValueChange={(value) =>
                  setSettings({ ...settings, temperature: value[0] })
                }
                min={0}
                max={1}
                step={0.1}
                className="w-full"
              />
              <p className="text-xs text-foreground/50 mt-1">
                Lower values = more focused, Higher values = more creative
              </p>
            </div>

            {/* Max Tokens */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Max Tokens: {settings.maxTokens}
              </label>
              <Slider
                value={[settings.maxTokens]}
                onValueChange={(value) =>
                  setSettings({ ...settings, maxTokens: value[0] })
                }
                min={500}
                max={4000}
                step={100}
                className="w-full"
              />
              <p className="text-xs text-foreground/50 mt-1">
                Maximum length of generated responses
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex gap-4">
          <Button onClick={handleSave} className="btn-mystical">
            Save Settings
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
