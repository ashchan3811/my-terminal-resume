export interface Command {
  name: string;
  description: string;
  execute: (args: string[]) => string | Promise<string>;
  autocomplete?: () => string[];
}

export interface HistoryItem {
  id: string;
  command: string;
  output: string;
  timestamp: Date;
  dir: string;
}

export interface FileSystemNode {
  name: string;
  type: "file" | "directory";
  content?: string;
  children?: Record<string, FileSystemNode>;
}

export interface Theme {
  name: string;
  label: string;
  bg: string;
  fg: string;
  accent: string;
  border: string;
  prompt: string;
  caret: string;
  heading: string;
}

export const THEMES: Record<string, Theme> = {
  geometric: {
    name: "geometric",
    label: "Geometric Balance",
    bg: "bg-[#0A0E14]",
    fg: "text-[#B3B1AD]",
    accent: "text-[#F29718]",
    border: "border-[#1A1F29]",
    prompt: "text-[#F29718]",
    caret: "bg-[#F29718]",
    heading: "text-[#F29718] font-bold"
  },
  hacker: {
    name: "hacker",
    label: "Hacker Slate",
    bg: "bg-[#090d16]",
    fg: "text-[#00ff66]",
    accent: "text-[#39ff14]",
    border: "border-[#1f2e4d]",
    prompt: "text-[#00ff66]",
    caret: "bg-[#00ff66]",
    heading: "text-[#39ff14]"
  },
  dracula: {
    name: "dracula",
    label: "Dracula",
    bg: "bg-[#282a36]",
    fg: "text-[#f8f8f2]",
    accent: "text-[#ff79c6]",
    border: "border-[#44475a]",
    prompt: "text-[#50fa7b]",
    caret: "bg-[#ff79c6]",
    heading: "text-[#8be9fd]"
  },
  matrix: {
    name: "matrix",
    label: "The Matrix",
    bg: "bg-black",
    fg: "text-[#00ff00]",
    accent: "text-[#39ff14]",
    border: "border-[#00ff00]/30",
    prompt: "text-[#00ff00]",
    caret: "bg-[#00ff00]",
    heading: "text-[#00ff00] font-bold"
  },
  ubuntu: {
    name: "ubuntu",
    label: "Ubuntu Terminal",
    bg: "bg-[#300a24]",
    fg: "text-[#dfdbd2]",
    accent: "text-[#df4814]",
    border: "border-[#5e2750]",
    prompt: "text-[#87ff00]",
    caret: "bg-[#dfdbd2]",
    heading: "text-[#df4814] font-medium"
  },
  nord: {
    name: "nord",
    label: "Nordic Frost",
    bg: "bg-[#2e3440]",
    fg: "text-[#d8dee9]",
    accent: "text-[#88c0d0]",
    border: "border-[#4c566a]",
    prompt: "text-[#a3be8c]",
    caret: "bg-[#88c0d0]",
    heading: "text-[#81a1c1]"
  },
  light: {
    name: "light",
    label: "Clean Light",
    bg: "bg-[#f5f5f5]",
    fg: "text-slate-800",
    accent: "text-indigo-600",
    border: "border-slate-300",
    prompt: "text-emerald-600",
    caret: "bg-indigo-600",
    heading: "text-indigo-700 font-semibold"
  }
};
