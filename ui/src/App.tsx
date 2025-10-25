import { Loader2 } from "lucide-react";
import { Header } from "./components/layout/Header";
import MainView from "./components/MainView";
import { Skeleton } from "./components/ui/skeleton";
import { useIDL } from "./context/IDLContext";
import useLoadSharedState from "./hooks/useLoadSharedState";
import useHasVisited from "./hooks/useHasVisited";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useEffect } from "react";
import { useInstructions } from "./context/InstructionsContext";

const driverObj = driver({
  showProgress: true,
  steps: [
    {
      element: "#search-bar",
      popover: {
        title: "Search",
        description: "Search for an instruction to get started.",
      },
    },
    {
      element: "#instruction-form",
      popover: {
        title: "Instruction Form",
        description: "Fill in the form to run the instruction.",
      },
    },
    {
      element: "#run-instruction-btn",
      popover: {
        title: "Run Instruction",
        description: "Click to run the instruction.",
      },
    },
    {
      element: "#utility-dialog-trigger",
      popover: {
        title: "Utility Dialog",
        description:
          "Use utility tools to convert timestamps, lamports, strings, and durations.",
      },
    },
    {
      element: "#transaction-history",
      popover: {
        title: "Transaction History",
        description: "View the transaction history.",
      },
    },
    {
      popover: {
        title: "Happy Testing!",
        description: "That's all. Start testing your program!",
      },
    },
  ],
});

const App = () => {
  const { isLoading } = useIDL();
  const { isLoading: isLoadingSharedState } = useLoadSharedState();
  const { hasVisited, handleVisit } = useHasVisited();
  const { idl } = useIDL();
  const { setActiveInstruction, activeInstruction } = useInstructions();

  useEffect(() => {
    if (!hasVisited && !isLoading && idl && idl.instructions.length > 0) {
      if (!activeInstruction) {
        setActiveInstruction(idl.instructions[0].name);
      }

      setTimeout(() => {
        driverObj.drive();
      }, 300);

      handleVisit();
    }
  }, [
    hasVisited,
    isLoading,
    idl,
    setActiveInstruction,
    activeInstruction,
    handleVisit,
  ]);

  if (isLoadingSharedState) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p>Loading shared session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground dark:text-foreground-dark">
      <Header />
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
          ) : (
            <MainView />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
