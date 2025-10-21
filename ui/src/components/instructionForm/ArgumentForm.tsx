import type { IdlField } from "@coral-xyz/anchor/dist/cjs/idl";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";

interface ArgumentFormProps {
  args: IdlField[] | null;
}

const ArgumentForm = (props: ArgumentFormProps) => {
  const { args } = props;

  if (!args) return null;
  return (
    <div className="bg-level-2-bg w-full max-w-[800px] border-level-2-border border rounded-md p-4">
      <h4 className="text-sm font-medium text-foreground dark:text-foreground-dark">
        Arguments ({args.length})
      </h4>

      {args.map((arg) => (
        <div key={arg.name} className="grid w-full items-center gap-3">
          <Label
            htmlFor={arg.name}
            className="text-foreground dark:text-foreground-dark text-left w-full"
          >
            {arg.name} {arg.type && `(${arg.type})`}
          </Label>
          <Input
            id={arg.name}
            type="text"
            placeholder={`Enter value for ${arg.name}`}
            className="text-foreground dark:text-foreground-dark bg-level-3-bg text-left w-full"
          />
        </div>
      ))}
    </div>
  );
};

export default ArgumentForm;
