import { useWorkspace } from "@/store/use-workspace";

export const ProgramSelector = () => {
  const { programs, activeProgram, setActiveProgram } = useWorkspace();

  if (programs.length <= 1) return null;

  return (
    <div className="px-4 py-2 border-b shrink-0">
      <select
        value={activeProgram ?? ""}
        onChange={(e) => setActiveProgram(e.target.value)}
        className="w-full text-sm bg-secondary rounded-md px-2 py-1.5"
      >
        {programs.map((p) => (
          <option key={p.name} value={p.name}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
};
