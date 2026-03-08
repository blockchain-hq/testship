export type IdlSource = "anchor" | "codama" | "shank" | "manual";

export type ProgramEntry = {
  name: string;
  idlPath: string;
  deployPath?: string;
  source: IdlSource;
};

export type ProjectConfig = {
  rootPath: string;
  programs: ProgramEntry[];
};
