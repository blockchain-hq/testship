import "./App.css";
import { useState } from "react";
import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";
import { Footer } from "./components/layout/Footer";
import { LogsPanel } from "./components/LogsPanel";
import InstructionForm from "./components/InstructionForm";
import { Home } from "./pages/Home";
import UseIdl from "./hooks/useIDL";
import { Skeleton } from "./components/ui/skeleton";
import { Toaster } from "./components/ui/sonner";
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from "./components/ui/accordion";

const getHasVisitedFromLocalStorage = () =>
  localStorage.getItem("hasVisited") === "true";
const setHasVisitedToLocalStorage = () =>
  localStorage.setItem("hasVisited", "true");

function App() {
  const { idl, isLoading } = UseIdl();
  // const [currentPage] = useState<"home" | "instructions">("home");
  const [hasVisited, setHasVisited] = useState(getHasVisitedFromLocalStorage());

  const handleGetStarted = () => {
    setHasVisited(true);
    setHasVisitedToLocalStorage();
  };

  if (!hasVisited) {
    return (
      <div className="min-h-screen bg-background dark:bg-background-dark w-full">
        <Header />
        <div className="flex w-full">
          <main className="flex-1 min-h-screen w-full lg:ml-0">
            <Home onGetStarted={handleGetStarted} />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark w-full">
      <Header />
      <div className="flex w-full">
        <Sidebar />

        <main className="flex-1 min-h-screen w-full lg:ml-0">
          {/* {currentPage === "home" ? <Home /> : <InstructionView />} */}

          {isLoading ? (
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                <Skeleton className="h-8 w-full max-w-64" />
                <Skeleton className="h-4 w-full max-w-96" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <Skeleton className="h-64" />
                  <Skeleton className="h-64" />
                </div>
              </div>
            </div>
          ) : idl ? (
            <div className="p-4 sm:p-6">
              <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground dark:text-foreground-dark mb-2">
                  {idl.metadata.name}
                </h1>
                <p className="text-sm sm:text-base text-foreground/70 dark:text-foreground-dark/70">
                  {idl.metadata.description}
                </p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-4">
                  {/* <h2 className="text-base sm:text-lg font-semibold text-foreground dark:text-foreground-dark">
                    Instructions ({idl.instructions.length})
                  </h2>
                  <div className="space-y-4">
                    {idl.instructions.map((instruction) => (
                      <InstructionForm
                        key={instruction.name}
                        instruction={instruction}
                        idl={idl}
                      />
                    ))}
                  </div> */}

                  <Accordion
                    type="single"
                    collapsible
                    className="border-b border-border dark:border-border-dark"
                  >
                    <h2 className="text-base sm:text-lg font-semibold text-foreground dark:text-foreground-dark">
                      Instructions ({idl.instructions.length})
                    </h2>
                    <div className="space-y-4">
                      {idl.instructions.map((instruction, index) => (
                        <AccordionItem value={`item-${index}`}>
                          <AccordionTrigger>
                            {instruction.name}
                          </AccordionTrigger>
                          <AccordionContent className="animate-in slide-in-from-top-2">
                            <InstructionForm
                              key={instruction.name}
                              instruction={instruction}
                              idl={idl}
                            />
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </div>
                  </Accordion>
                </div>

                <div className="space-y-4">
                  <h2 className="text-base sm:text-lg font-semibold text-foreground dark:text-foreground-dark">
                    Output & Logs
                  </h2>
                  <LogsPanel />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-6">
              <div className="text-center py-8 sm:py-12">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground dark:text-foreground-dark mb-2">
                  No IDL Loaded
                </h2>
                <p className="text-sm sm:text-base text-foreground/70 dark:text-foreground-dark/70 mb-4">
                  Load an Anchor program IDL to start testing instructions
                </p>
                <button className="px-4 py-2 bg-accent-primary text-white rounded hover:bg-accent-primary/90 text-sm sm:text-base transition-colors">
                  Load IDL File
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
      <Toaster />
    </div>
  );
}

export default App;
