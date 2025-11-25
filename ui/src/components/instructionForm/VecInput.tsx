import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Plus, Trash2 } from "lucide-react";
import type { IdlType } from "@coral-xyz/anchor/dist/cjs/idl";
import { getTypeDisplayName } from "@/lib/typeParser";
import type { Idl } from "@coral-xyz/anchor";

interface VecInputProps {
  name: string;
  value: unknown[];
  onChange: (value: unknown[]) => void;
  innerType: IdlType;
  idl: Idl;
  validationError?: string;
}

const VecInput = ({
  name,
  value,
  onChange,
  innerType,
  idl,
  validationError,
}: VecInputProps) => {
  const handleAddItem = () => {
    onChange([...value, ""]);
  };

  const handleRemoveItem = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  const handleItemChange = (index: number, itemValue: unknown) => {
    const newValue = [...value];
    newValue[index] = itemValue;
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          {name} (Vec&lt;{getTypeDisplayName(idl, innerType)}&gt;)
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddItem}
          className="h-7"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Item
        </Button>
      </div>

      {validationError && (
        <p className="text-red-500 text-sm">{validationError}</p>
      )}

      <div className="space-y-2 border border-border/50 rounded-md p-3 bg-muted/30">
        {value.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No items. Click "Add Item" to add elements to the array.
          </p>
        ) : (
          value.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-2 p-2 bg-background rounded border border-border/30"
            >
              <div className="flex-1">
                <SimpleFieldInput
                  name={`${name}[${index}]`}
                  value={item}
                  type={innerType}
                  idl={idl}
                  onChange={(val: unknown) => handleItemChange(index, val)}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveItem(index)}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Simple field input for vec items (to avoid circular dependency)
const SimpleFieldInput = ({
  name,
  value,
  type,
  idl,
  onChange,
}: {
  name: string;
  value: unknown;
  type: IdlType;
  idl: Idl;
  onChange: (value: unknown) => void;
}) => {
  const displayName = getTypeDisplayName(idl, type);
  const inputType =
    typeof type === "string" && type === "bool" ? "checkbox" : "text";

  if (inputType === "checkbox") {
    return (
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={name}
          checked={value === true || value === "true"}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-border"
        />
        <Label htmlFor={name} className="text-sm font-medium cursor-pointer">
          {name}
        </Label>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Label htmlFor={name} className="text-xs text-muted-foreground">
        {displayName}
      </Label>
      <Input
        id={name}
        type={inputType}
        value={String(value ?? "")}
        onChange={(e) => {
          const val = e.target.value;
          if (typeof type === "string") {
            if (
              ["u8", "u16", "u32", "u64", "i8", "i16", "i32", "i64"].includes(
                type
              )
            ) {
              const num = Number(val);
              onChange(isNaN(num) ? val : num);
              return;
            }
          }
          onChange(val);
        }}
      />
    </div>
  );
};

export default VecInput;

