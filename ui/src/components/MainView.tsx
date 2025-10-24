import InstructionFormv2 from "./InstructionFormv2";
import SearchBar from "./SearchBar";
import { useInstructions } from "@/context/InstructionsContext";
import { useIDL } from "@/context/IDLContext";
import NoInstructionSelectedView from "./NoInstructionSelectedView";
import NoIDLView from "./NoIDLView";

const MainView = () => {
  const { activeInstruction } = useInstructions();
  const { idl } = useIDL();

  if (!idl) return null;

  const instruction = idl.instructions.find(
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
              <InstructionFormv2 instruction={instruction} idl={idl} />
            ) : (
              <NoInstructionSelectedView />
            )
          ) : (
            <NoIDLView />
          )}
        </div>
      </div>
    </div>
  );
};

export default MainView;
