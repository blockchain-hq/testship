import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label"; 
import type { IdlType } from "@coral-xyz/anchor/dist/cjs/idl";
import { getTypeDisplayName } from "@/lib/typeParser";
import type { Idl } from "@coral-xyz/anchor"; 
import ArgumentField from "./ArgumentField";

interface OptionInputProps {
  name: string;
  value: unknown;
  onChange: (value: unknown) => void;
  innerType: IdlType;
  idl: Idl;
  validationError?: string;
}

const OptionInput = ({
  name,
  value,
  onChange,
  innerType,
  idl,
  validationError,
}: OptionInputProps) => {
  const isSome = value !== null && value !== undefined;
  const displayName = getTypeDisplayName(idl, innerType);

  const handleToggle = (checked: boolean) => {
    if (checked) {
      if (typeof innerType === "string") {
        switch (innerType) {
          case "bool":
            onChange(false);
            break;
          case "u8":
          case "u16":
          case "u32":
          case "u64":
          case "i8":
          case "i16":
          case "i32":
          case "i64":
            onChange(0);
            break;
          default:
            onChange("");
        }
      } else {
        onChange("");
      }
    } else {
      onChange(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <Checkbox
          id={`${name}-option`}
          checked={isSome}
          onCheckedChange={handleToggle}
        />
        <Label
          htmlFor={`${name}-option`}
          className="text-sm font-medium cursor-pointer"
        >
          {name} (Option&lt;{displayName}&gt;)
        </Label>
      </div>

      {validationError && (
        <p className="text-red-500 text-sm">{validationError}</p>
      )}

      {isSome && (
        <div className="ml-7 border-l-2 border-border/50 pl-4">
          <ArgumentField
            name={`${name} (Some)`}
            value={value}
            type={innerType}
            idl={idl}
            onChange={onChange}
            validationError={undefined}
          />
        </div>
      )}

      {!isSome && (
        <p className="ml-7 text-sm text-muted-foreground italic">
          None (optional field)
        </p>
      )}
    </div>
  );
};

export default OptionInput;

