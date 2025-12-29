
export enum EditTool {
  TRANSFORM = 'TRANSFORM',
  FILTERS = 'FILTERS',
  TEXT = 'TEXT',
  AI_GEN = 'AI_GEN',
  MUSIC = 'MUSIC',
  TEMPLATES = 'TEMPLATES',
  AI_ASSISTANT = 'AI_ASSISTANT',
  ADMIN = 'ADMIN',
  HELP = 'HELP'
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  provider: 'google' | 'microsoft' | 'apple' | 'email';
}

export interface RegisteredUser {
  email: string;
  name: string;
  password: string;
  avatar: string;
  isBanned?: boolean;
  banReason?: string;
  unbanAt?: number;
}

export interface BanState {
  isBanned: boolean;
  banReason?: string;
  isWarningActive: boolean;
  warningCountdown?: number; // Seconds until ban
  unbanAt?: number; // Timestamp in ms for when access is restored
}

export interface VideoClip {
  id: string;
  type: 'local' | 'ai';
  mediaType: 'video' | 'image';
  url: string;
  title: string;
  duration: number; 
  thumbnail?: string;
  prompt?: string;
  // Visual Properties
  speed: number;
  volume: number;
  filter: string;
  blur: number;
  brightness: number;
  contrast: number;
  isShake: boolean;
  startTime: number; 
}

export interface AudioTrack {
  id: string;
  url: string;
  title: string;
  duration: number;
  startTime: number;
  volume: number;
}

export interface TextOverlay {
  id: string;
  content: string;
  startTime: number;
  duration: number;
  style: 'neon' | 'glitch' | 'minimal' | 'impact';
  color: string;
}

export interface ProjectState {
  clips: VideoClip[];
  audioTracks: AudioTrack[];
  textOverlays: TextOverlay[];
  selectedClipId: string | null;
  selectedTextId: string | null;
  currentTime: number;
  isPlaying: boolean;
}
