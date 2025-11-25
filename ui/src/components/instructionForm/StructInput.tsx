import { Label } from "../ui/label"; 
import type { IdlType } from "@coral-xyz/anchor/dist/cjs/idl";
import { getStructFields, getTypeDisplayName } from "@/lib/typeParser";
import type { Idl } from "@coral-xyz/anchor"; 
import ArgumentField from "./ArgumentField";


interface StructInputProps {
  name: string;
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  type: IdlType;
  idl: Idl;
  validationErrors?: Record<string, string>;
}

const StructInput = ({
  name,
  value,
  onChange,
  type,
  idl,
  validationErrors = {},
}: StructInputProps) => {
  const fields = getStructFields(idl, type);

  if (!fields || fields.length === 0) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          {name} ({getTypeDisplayName(idl, type)})
        </Label>
        <p className="text-sm text-muted-foreground">Empty struct</p>
      </div>
    );
  }

  const handleFieldChange = (fieldName: string, fieldValue: unknown) => {
    onChange({
      ...value,
      [fieldName]: fieldValue,
    });
  };

  return (
    <div className="space-y-3 border border-border/50 rounded-md p-4 bg-muted/20">
      <Label className="text-sm font-semibold">
        {name} ({getTypeDisplayName(idl, type)})
      </Label>
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <ArgumentField
              name={`${name}.${field.name}`}
              value={value[field.name]}
              type={field.type}
              idl={idl}
              onChange={(val) => handleFieldChange(field.name, val)}
              validationError={validationErrors[field.name]}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default StructInput;

