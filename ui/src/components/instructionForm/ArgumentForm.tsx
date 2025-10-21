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
    <div className="bg-level-2-bg w-full max-w-[800px] border-level-2-border border rounded-md p-4 gap-4">
      <h4 className="text-sm font-semibold text-foreground/90 uppercase tracking-wider">
        Arguments ({args.length})
      </h4>

      {args.map((arg) => (
        <div key={arg.name} className="grid w-full items-center gap-3">
          <Label
            htmlFor={arg.name}
            className="text-sm font-medium text-foreground flex items-center gap-2"
          >
            {arg.name}
            {arg.type && (
              <span className="text-xs text-muted-foreground/50">
                ({arg.type.toString()})
              </span>
            )}
          </Label>
          <Input
            id={arg.name}
            type="text"
            placeholder={`Enter value for ${arg.name}`}
            className="bg-level-3-bg
    border-2 border-level-3-border
    text-foreground
    placeholder:text-muted-foreground/50
    focus:bg-level-3-bg
    focus:border-level-3-border
    focus:ring-2 focus:ring-green-500/20
    transition-all
    h-11"
          />
        </div>
      ))}
    </div>
  );
};

export default ArgumentForm;
