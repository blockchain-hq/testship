const API_BASE = "http://localhost:5051";

export type ProgramResponse = {
  name: string;
  source: string;
  hasDeployArtifact: boolean;
  idl: any;
};

export const fetchPrograms = async (): Promise<ProgramResponse[]> => {
  const res = await fetch(`${API_BASE}/api/programs`);
  if (!res.ok) throw new Error("Failed to fetch programs");
  const data = await res.json();
  return data.programs;
};

export const subscribeToEvents = (
  onIdlChanged: (programName: string | null) => void
): (() => void) => {
  const source = new EventSource(`${API_BASE}/api/events`);

  source.addEventListener("update", (e) => {
    try {
      const { program } = JSON.parse(e.data);
      onIdlChanged(program);
    } catch {
      onIdlChanged(null);
    }
  });

  return () => source.close();
};
