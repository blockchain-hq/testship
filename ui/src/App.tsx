import "./App.css";
import { Header } from "./components/layout/header";
import { Sidebar } from "./components/layout/sidebar";
import { InstructionPanel } from "./components/instruction/instruction-panel";
import { usePrograms } from "@/hooks/use-programs";

function App() {
  const { isLoading, error } = usePrograms();

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          {isLoading && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Loading programs...
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center h-full text-destructive">
              Failed to connect to server
            </div>
          )}
          {!isLoading && !error && <InstructionPanel />}
        </main>
      </div>
    </div>
  );
}

export default App;
