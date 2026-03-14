import { useState, useCallback } from "react";
import UploadDropZone from "@/components/UploadDropZone";
import CreativeBrief from "@/components/CreativeBrief";
import type { VideoClip, CreativeBriefData } from "@/types/amadeus";

type Phase = "upload" | "brief" | "done";

const Index = () => {
  const [phase, setPhase] = useState<Phase>("upload");
  const [clips, setClips] = useState<VideoClip[]>([]);

  const handleClipsReady = useCallback((readyClips: VideoClip[]) => {
    setClips(readyClips);
    setPhase("brief");
  }, []);

  const handleBriefComplete = useCallback((brief: CreativeBriefData) => {
    console.log("Brief submitted:", brief);
    console.log("Clips:", clips.map((c) => ({ id: c.id, name: c.name })));
    setPhase("done");
  }, [clips]);

  return (
    <div className="min-h-screen bg-background">
      {phase === "upload" && <UploadDropZone onClipsReady={handleClipsReady} />}
      {phase === "brief" && <CreativeBrief onComplete={handleBriefComplete} />}
      {phase === "done" && (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <span className="text-5xl">✦</span>
          <h1 className="text-2xl font-bold text-foreground">You're all set.</h1>
          <p className="text-muted-foreground text-sm">Workspace coming in the next phase.</p>
        </div>
      )}
    </div>
  );
};

export default Index;
