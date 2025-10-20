import "./App.css";
import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";
import { Footer } from "./components/layout/Footer";
import { TransactionHistory } from "./components/TransactionHistory";
import InstructionForm from "./components/InstructionForm";
import { Home } from "./pages/Home";
import { useTransactionHistory } from "./hooks/useTransactionHistory";
import { Skeleton } from "./components/ui/skeleton";
import { Toaster } from "./components/ui/sonner";
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from "./components/ui/accordion";
import useHasVisited from "./hooks/useHasVisited";
import UseIdl from "./hooks/useIDL";
import LZ from "lz-string";
import type { SharedState } from "./lib/types";
import { useEffect, useState } from "react";

function App() {
  const { idl, isLoading, setIdl } = UseIdl();
  const { transactions, clearHistory, removeTransaction, addTransaction } =
    useTransactionHistory();
  const { hasVisited, handleVisit } = useHasVisited();
  const [state, setState] = useState<SharedState | null>(null);

  useEffect(() => {
    const currentHash = window.location.hash;
    console.log(currentHash, "current hash");
    if (currentHash) {
      const decompressed = LZ.decompressFromEncodedURIComponent(
        currentHash.replace("#status=", "")
      );
      const state: SharedState = JSON.parse(decompressed);
      setIdl(state.idl);
      setState(state);
    }
  }, [setIdl]);

  const getAccountMapForInstruction = (instructionName: string) => {
    const accounts = state?.instructions.find(
      (inst) => inst.name === instructionName
    )?.accounts;

    const map = new Map<string, string | null>();
    accounts?.forEach((acc) =>
      map.set(acc.name, acc.address ? acc.address : null)
    );

    return map;
  };

  if (!hasVisited) {
    return (
      <div className="min-h-screen bg-background dark:bg-background-dark w-full">
        <Header />
        <div className="flex w-full">
          <main className="flex-1 min-h-screen w-full lg:ml-0">
            <Home onGetStarted={handleVisit} />
          </main>
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark w-full">
      <Header />
      <div className="flex w-full">
        <Sidebar />

        <main className="flex-1 min-h-screen w-full lg:ml-0">
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
              {/* Program Header */}
              <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground dark:text-foreground-dark mb-2">
                  {idl.metadata.name}
                </h1>
                <p className="text-sm sm:text-base text-foreground/70 dark:text-foreground-dark/70">
                  {idl.metadata.description || "Created with Anchor"}
                </p>
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                {/* Left Column - Instructions */}
                <div className="space-y-4">
                  <h2 className="text-base sm:text-lg font-semibold text-foreground dark:text-foreground-dark">
                    Instructions ({idl.instructions.length})
                  </h2>

                  <Accordion
                    type="single"
                    collapsible
                    className="border-b border-border dark:border-border-dark"
                  >
                    {idl.instructions.map((instruction, index) => (
                      <AccordionItem
                        key={instruction.name}
                        value={`item-${index}`}
                      >
                        <AccordionTrigger className="text-sm sm:text-base">
                          {instruction.name}
                          <span className="text-xs text-muted-foreground ml-2">
                            {instruction.accounts.length} accounts,{" "}
                            {instruction.args.length} args
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="animate-in slide-in-from-top-2">
                          <InstructionForm
                            instruction={instruction}
                            idl={idl}
                            addTransactionRecord={addTransaction}
                            accountMapFromState={getAccountMapForInstruction(
                              instruction.name
                            )}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>

                {/* Right Column - Transaction History */}
                <div className="h-[calc(100vh-16rem)] sticky top-4">
                  <TransactionHistory
                    transactions={transactions}
                    onClear={clearHistory}
                    onRemove={removeTransaction}
                  />
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
