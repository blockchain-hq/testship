import { Header } from "./components/layout/Header";
import MainView from "./components/MainView";
import { Skeleton } from "./components/ui/skeleton";
import { useIDL } from "./context/IDLContext";

const App = () => {
  const { isLoading } = useIDL();

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
