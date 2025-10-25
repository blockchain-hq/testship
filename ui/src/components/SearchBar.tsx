import { SearchIcon } from "lucide-react";
import Search from "./instructionForm/Search";
import { Kbd } from "./ui/kbd";
import { useInstructions } from "@/context/InstructionsContext";
import { useIDL } from "@/context/IDLContext";

const SearchBar = () => {
  const { activeInstruction, setActiveInstruction } = useInstructions();
  const { idl } = useIDL();

  if (!idl) return null;

  return (
    <div className="flex items-center space-x-2 gap-2" id="search-bar">
      <SearchIcon className="size-4" />
      <Search
        instructionNames={idl.instructions.map(
          (instruction) => instruction.name
        )}
        selectedInstructionName={activeInstruction || ""}
        setSelectedInstructionName={(instructionName) => {
          setActiveInstruction(instructionName);
        }}
      />
      <Kbd>CTRL + K</Kbd>
    </div>
  );
};

export default SearchBar;
