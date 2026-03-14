export interface VideoClip {
  id: string;
  file: File;
  name: string;
  duration: number;
  objectUrl: string;
  status: 'uploading' | 'ready' | 'error';
  progress: number;
}

export interface CreativeBriefData {
  overall_energy: string;
  music_style_direction: string;
  references_text: string;
}
