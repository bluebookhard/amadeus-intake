import { useState, useCallback } from "react";
import UploadDropZone from "@/components/UploadDropZone";
import CreativeBrief from "@/components/CreativeBrief";
import ScoreBrief from "@/components/ScoreBrief";
import AmbientBackground from "@/components/AmbientBackground";
import { RotateCcw } from "lucide-react";
import type { VideoClip, CreativeBriefData } from "@/types/amadeus";

type Phase = "upload" | "brief" | "score" | "done";

const Index = () => {
  const [phase, setPhase] = useState<Phase>("upload");
  const [clips, setClips] = useState<VideoClip[]>([]);
  const [briefData, setBriefData] = useState<CreativeBriefData | null>(null);
  

  const handleClipsReady = useCallback((readyClips: VideoClip[]) => {
    setClips(readyClips);
    setPhase("brief");
  }, []);

  const handleBriefComplete = useCallback((brief: CreativeBriefData) => {
    setBriefData(brief);
    setPhase("score");
  }, []);

  const handleStartOver = useCallback(() => {
    clips.forEach((c) => URL.revokeObjectURL(c.objectUrl));
    setClips([]);
    setBriefData(null);
    setEditFromStep(null);
    setPhase("upload");
  }, [clips]);

  const handleBackToUpload = useCallback(() => {
    setPhase("upload");
  }, []);

  const handleEditQuestion = useCallback((step: number) => {
    setEditFromStep(step);
    setPhase("brief");
  }, []);

  const handleBackToBrief = useCallback(() => {
    setEditFromStep(null);
    setPhase("brief");
  }, []);

  const handleBackToScore = useCallback(() => {
    setPhase("score");
  }, []);

  const handleContinue = useCallback(() => {
    setPhase("done");
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      <AmbientBackground />

      {phase !== "upload" && (
        <button
          onClick={handleStartOver}
          className="fixed top-6 right-8 z-[60] flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/80 backdrop-blur-sm text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Start over
        </button>
      )}

      <div className="relative z-10">
        {phase === "upload" && <UploadDropZone onClipsReady={handleClipsReady} />}
        {phase === "brief" && (
          <CreativeBrief
            onComplete={handleBriefComplete}
            onBack={handleBackToUpload}
            initialStep={editFromStep}
            initialData={briefData}
          />
        )}
        {phase === "score" && briefData && (
          <ScoreBrief
            brief={briefData}
            clipCount={clips.length}
            onEditQuestion={handleEditQuestion}
            onContinue={handleContinue}
            onReanalyse={() => { setBriefData(null); setEditFromStep(null); setPhase("brief"); }}
            onBack={handleBackToBrief}
          />
        )}
        {phase === "done" && (
          <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <span className="text-5xl">✦</span>
            <h1 className="text-2xl font-bold text-foreground">You're all set.</h1>
            <p className="text-muted-foreground text-sm">Workspace coming in the next phase.</p>
            <div className="flex items-center gap-6 mt-4">
              <button
                onClick={handleBackToScore}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleStartOver}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Start over
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
