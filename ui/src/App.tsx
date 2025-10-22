import "./App.css";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { TransactionHistory } from "./components/TransactionHistory";
import { Home } from "./pages/Home";
import { useTransactionHistory } from "./hooks/useTransactionHistory";
import { Skeleton } from "./components/ui/skeleton";
import { Toaster } from "./components/ui/sonner";

import useHasVisited from "./hooks/useHasVisited";
import UseIdl from "./hooks/useIDL";
import LZ from "lz-string";
import type { SharedState } from "./lib/types";
import { useEffect, useState } from "react";
import Search from "./components/instructionForm/Search";
import { Kbd } from "./components/ui/kbd";
import InstructionFormv2 from "./components/InstructionFormv2";
import { SearchIcon } from "lucide-react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const driverObj = driver({
  showProgress: true,
  steps: [
    {
      element: "#search-instruction-form",
      popover: {
        title: "Search Instruction",
        description: "Search for an instruction to test",
      },
    },
    {
      element: "#instruction-form",
      popover: {
        title: "Fill in Form",
        description: "Fill the remaining details in form",
      },
    },
    {
      element: "#run-instruction-btn",
      popover: {
        title: "Run Instruction Button",
        description: "Click the button to send transaction",
      },
    },
  ],
});

function App() {
  const { idl, isLoading, setIdl } = UseIdl();
  const { transactions, clearHistory, removeTransaction } =
    useTransactionHistory();
  const { hasVisited, handleVisit } = useHasVisited();
  const [state, setState] = useState<SharedState | null>(null);
  const [selectedInstructionName, setSelectedInstructionName] =
    useState<string>(idl?.instructions[0].name || "");

  useEffect(() => {
    setSelectedInstructionName(idl?.instructions[0].name || "");
  }, [idl]);

  const getSelectedInstruction = (instructionName: string) => {
    return idl?.instructions.find(
      (instruction) => instruction.name === instructionName
    );
  };
  useEffect(() => {
    const currentHash = window.location.hash;
    console.log(currentHash, "current hash");
    if (currentHash) {
      const decompressed = LZ.decompressFromEncodedURIComponent(
        currentHash.replace("#state=", "")
      );
      console.log(decompressed, "decompressed");
      const state: SharedState = JSON.parse(decompressed);
      setIdl(state.idl);
      setState(state);
    }
  }, [setIdl]);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenTour") === "true";

    if (hasVisited && idl && (!hasSeenTour || state)) {
      setTimeout(() => {
        driverObj.drive();
        localStorage.setItem("hasSeenTour", "true");
      }, 500);
    }
  }, [hasVisited, idl, state]);

  // const getAccountMapForInstruction = (instructionName: string) => {
  //   const accounts = state?.instructions.find(
  //     (inst) => inst.name === instructionName
  //   )?.accounts;

  //   const map = new Map<string, string | null>();
  //   accounts?.forEach((acc) =>
  //     map.set(acc.name, acc.address ? acc.address : null)
  //   );

  //   return map;
  // };

  if (!hasVisited) {
    return (
      <div className="min-h-screen bg-background dark:bg-background-dark w-full">
        <Header programName={idl?.metadata.name || ""} />
        <div className="flex w-full">
          <main className="flex-1 min-h-screen w-full lg:ml-0">
            <Home onGetStarted={handleVisit} />
          </main>
        </div>
        <Toaster />
      </div>
    );
  }

  console.log(
    getSelectedInstruction(selectedInstructionName),
    "selected instruction"
  );
  console.log(idl, "idl");
  console.log(selectedInstructionName, "selected instruction name");

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark w-full">
      <Header programName={idl?.metadata.name || ""} />
      <div className="flex w-[90%] mx-auto">
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
              {/* Main Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                {/* Left Column - Instructions */}
                <div className="space-y-4">
                  <div
                    className="flex items-center space-x-2 gap-2"
                    id="search-instruction-form"
                  >
                    <SearchIcon />
                    <Search
                      instructionNames={idl.instructions.map(
                        (instruction) => instruction.name
                      )}
                      selectedInstructionName={selectedInstructionName}
                      setSelectedInstructionName={(instructionName) => {
                        setSelectedInstructionName(instructionName);
                      }}
                    />
                    <Kbd>CTRL + K</Kbd>
                  </div>

                  <InstructionFormv2
                    instruction={
                      getSelectedInstruction(selectedInstructionName) ?? null
                    }
                    idl={idl}
                  />
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
