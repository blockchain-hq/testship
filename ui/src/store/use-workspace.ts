import { type RootNode, type ProgramNode } from "@codama/nodes";
import { rootNodeFromAnchor } from "@codama/nodes-from-anchor";
import { create } from "zustand";

type ProgramInfo = {
  name: string;
  source: string;
  rootNode: RootNode;
  programNode: ProgramNode;
};

type WorkspaceState = {
  programs: ProgramInfo[];
  activeProgram: string | null;

  loadPrograms: (
    entries: Array<{ name: string; source: string; idl: any }>
  ) => void;
  setActiveProgram: (name: string) => void;
  clearWorkspace: () => void;
};

const parseIdl = (source: string, idl: any): RootNode => {
  if (source === "codama") return idl as RootNode;
  return rootNodeFromAnchor(idl);
};

export const useWorkspace = create<WorkspaceState>((set) => ({
  programs: [],
  activeProgram: null,

  loadPrograms: (entries) => {
    const programs: ProgramInfo[] = [];

    for (const entry of entries) {
      try {
        const rootNode = parseIdl(entry.source, entry.idl);
        programs.push({
          name: entry.name,
          source: entry.source,
          rootNode,
          programNode: rootNode.program,
        });
      } catch (err) {
        console.error(`Failed to parse IDL for ${entry.name}`, err);
      }
    }

    set({
      programs,
      activeProgram: programs[0]?.name ?? null,
    });
  },

  setActiveProgram: (name) => set({ activeProgram: name }),

  clearWorkspace: () => set({ programs: [], activeProgram: null }),
}));

export const useActiveProgram = (): ProgramInfo | null => {
  const { programs, activeProgram } = useWorkspace();
  return programs.find((p) => p.name === activeProgram) ?? null;
};
