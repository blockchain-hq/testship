import "./App.css";
import { Header } from "./components/layout/header";
import { InstructionSearch } from "./components/instruction-search";
import { InstructionPanel } from "./components/instruction/instruction-panel";
import { TransactionHistory } from "./components/transaction-history";
import { ProgramSelector } from "./components/program-selector";
import { usePrograms } from "@/hooks/use-programs";
import { CircleNotchIcon } from "@phosphor-icons/react";

function App() {
  const { isLoading, error } = usePrograms();

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <ProgramSelector />
          <InstructionSearch />

          <div className="flex-1 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center h-full text-muted-foreground gap-2">
                <CircleNotchIcon className="size-5 animate-spin" />
                Loading programs...
              </div>
            )}
            {error && (
              <div className="flex items-center justify-center h-full text-destructive">
                Failed to connect to server
              </div>
            )}
            {!isLoading && !error && <InstructionPanel />}
          </div>
        </div>

        <div className="w-[420px] border-l shrink-0 overflow-hidden">
          <TransactionHistory />
        </div>
      </div>
    </div>
  );
}

export default App;
