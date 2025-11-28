import InstructionFormv2 from "./InstructionFormv2";
import SearchBar from "./SearchBar";
import { useInstructions } from "@/context/InstructionsContext";
import { useIDL } from "@/context/IDLContext";
import NoInstructionSelectedView from "./NoInstructionSelectedView";
import NoIDLView from "./NoIDLView";
import { TransactionHistory } from "./TransactionHistory";
import { useTransactionHistory } from "@/hooks/useTransactionHistory";

const MainView = () => {
  const { activeInstruction } = useInstructions();
  const { idl } = useIDL();
  const { transactions, clearHistory, removeTransaction, addTransaction } =
    useTransactionHistory();

  const instruction = idl?.instructions.find(
    (instruction) => instruction.name === activeInstruction
  );

  return (
    <div className="p-4 sm:p-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* left col - instructions */}
        <div className="space-y-4">
          <SearchBar />

          {idl ? (
            instruction ? (
              <InstructionFormv2
                instruction={instruction ?? null}
                idl={idl}
                addTransaction={addTransaction}
              />
            ) : (
              <NoInstructionSelectedView />
            )
          ) : (
            <NoIDLView />
          )}
        </div>

        <div className="h-[calc(100vh-16rem)] sticky top-4">
          <TransactionHistory
            transactions={transactions}
            onClear={clearHistory}
            onRemove={removeTransaction}
            addTransaction={addTransaction}
          />
        </div>
      </div>
    </div>
  );
};

export default MainView;
