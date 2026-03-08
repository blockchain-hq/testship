import { useWorkspace, useActiveProgram } from "@/store/use-workspace";
import { useInstructionStore } from "@/store/use-instruction";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const Sidebar = () => {
  const { programs, activeProgram, setActiveProgram } = useWorkspace();
  const program = useActiveProgram();
  const { selected, select } = useInstructionStore();

  if (programs.length === 0) return null;

  const instructions = program?.programNode.instructions ?? [];

  return (
    <aside className="w-72 border-r border-border bg-card flex flex-col overflow-hidden">
      {programs.length > 1 && (
        <div className="p-3 border-b border-border">
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
      )}

      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">
            {program?.programNode.name}
          </span>
          <Badge variant="secondary" className="text-[10px] shrink-0">
            {program?.source}
          </Badge>
        </div>
        {program?.programNode.publicKey && (
          <span className="text-[11px] text-muted-foreground font-mono truncate block mt-1">
            {program.programNode.publicKey}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-2">
            Instructions ({instructions.length})
          </span>
        </div>
        <nav className="px-2 pb-2 space-y-0.5">
          {instructions.map((ix) => (
            <button
              key={ix.name}
              onClick={() => select(ix.name)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between group transition-colors",
                selected === ix.name
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent text-foreground"
              )}
            >
              <span className="truncate font-mono text-xs">{ix.name}</span>
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity",
                  selected === ix.name && "opacity-100"
                )}
              />
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};
