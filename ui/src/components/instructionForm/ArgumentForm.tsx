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
    <div className="bg-card border border-border/50 rounded-md p-4 space-y-4">
      <h4 className="text-sm font-semibold text-foreground/90 uppercase tracking-wider">
        {args.length > 0 ? `Arguments (${args.length})` : "No Arguments"}
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
          />
        </div>
      ))}
    </div>
  );
};

export default ArgumentForm;
