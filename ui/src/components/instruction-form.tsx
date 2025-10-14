import { type Idl } from "@coral-xyz/anchor";
import type { IdlType } from "@coral-xyz/anchor/dist/cjs/idl";

interface InstructionFormProps {
  instruction: Idl["instructions"][number];
}

const InstructionForm = (props: InstructionFormProps) => {
  const { instruction } = props;

  const deriveType = (type: IdlType) => {
    if (type === "u8") {
      return "number";
    }

    return "string";
  };

  return (
    <div>
      <h3>Method: {instruction.name}</h3>

      <form className="flex flex-col justify-center items-center gap-4">
        {instruction.args.map((arg) => (
          <div>
            <label htmlFor={arg.name}>{arg.name}</label>
            <input type={deriveType(arg.type)} id={arg.name} name={arg.name} />
          </div>
        ))}
      </form>

      <button>Submit</button>
    </div>
  );
};

export default InstructionForm;
