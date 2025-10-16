export const InstructionView = () => {
  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground dark:text-foreground-dark mb-6">
          Instruction Testing
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface dark:bg-surface-dark p-6 rounded-lg shadow border border-border dark:border-border-dark">
            <h2 className="text-lg font-semibold mb-4 text-foreground dark:text-foreground-dark">Instruction Form</h2>
            <p className="text-foreground/70 dark:text-foreground-dark/70 mb-4">
              Configure and test your Anchor program instructions here.
            </p>
            {/* InstructionForm component will be rendered here */}
          </div>
          
          <div className="bg-surface dark:bg-surface-dark p-6 rounded-lg shadow border border-border dark:border-border-dark">
            <h2 className="text-lg font-semibold mb-4 text-foreground dark:text-foreground-dark">Results & Logs</h2>
            <p className="text-foreground/70 dark:text-foreground-dark/70 mb-4">
              View execution results and detailed logs.
            </p>
            {/* LogsPanel component will be rendered here */}
          </div>
        </div>
      </div>
    </div>
  );
};
