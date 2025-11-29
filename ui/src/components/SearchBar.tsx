import Search from "./instructionForm/Search";
import { useInstructions } from "@/context/InstructionsContext";
import { useIDL } from "@/context/IDLContext";

const SearchBar = () => {
  const { activeInstruction, setActiveInstruction } = useInstructions();
  const { idl } = useIDL();

  if (!idl) return null;

  return (
    <div className="flex items-center space-x-2 gap-2" id="search-bar">
      <Search
        instructionNames={idl.instructions.map(
          (instruction) => instruction.name
        )}
        selectedInstructionName={activeInstruction || ""}
        setSelectedInstructionName={(instructionName) => {
          setActiveInstruction(instructionName);
        }}
      />
    </div>
  );
};

export default SearchBar;
