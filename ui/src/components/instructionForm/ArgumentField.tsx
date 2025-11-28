import type { IdlType } from "@coral-xyz/anchor/dist/cjs/idl";
import type { Idl } from "@coral-xyz/anchor";
import {
  isVecType,
  isOptionType,
  isDefinedType,
  isEnumType,
  isStructType,
  getVecInnerType,
  getOptionInnerType,
  getTypeDisplayName,
} from "@/lib/typeParser";
import VecInput from "./VecInput";
import OptionInput from "./OptionInput";
import EnumInput from "./EnumInput";
import StructInput from "./StructInput";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils"; 

interface ArgumentFieldProps {
  name: string;
  value: unknown;
  type: IdlType;
  idl: Idl;
  onChange: (value: unknown) => void;
  validationError?: string;
}

const ArgumentField = ({
  name,
  value,
  type,
  idl,
  onChange,
  validationError,
}: ArgumentFieldProps) => {
  // Handle Vec types
  if (isVecType(type)) {
    const innerType = getVecInnerType(type);
    const arrayValue = Array.isArray(value) ? value : [];
    return (
      <VecInput
        name={name}
        value={arrayValue}
        onChange={onChange}
        innerType={innerType}
        idl={idl}
        validationError={validationError}
      />
    );
  }

  // Handle Option types
  if (isOptionType(type)) {
    const innerType = getOptionInnerType(type);
    return (
      <OptionInput
        name={name}
        value={value}
        onChange={onChange}
        innerType={innerType}
        idl={idl}
        validationError={validationError}
      />
    );
  }

  // Handle Enum types
  if (isDefinedType(type) && isEnumType(idl, type)) {
    return (
      <EnumInput
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        idl={idl}
        validationError={validationError}
      />
    );
  }

  // Handle Struct types
  if (isDefinedType(type) && isStructType(idl, type)) {
    const structValue =
      typeof value === "object" && value !== null && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : {};
    return (
      <StructInput
        name={name}
        value={structValue}
        onChange={onChange}
        type={type}
        idl={idl}
        validationErrors={validationError ? { [name]: validationError } : {}}
      />
    );
  }

  // Handle simple types (string, number, bool, pubkey)
  const displayName = getTypeDisplayName(idl, type);
  const inputType =
    typeof type === "string" && type === "bool" ? "checkbox" : "text";

  if (inputType === "checkbox") {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id={name}
            checked={value === true || value === "true"}
            onChange={(e) => onChange(e.target.checked)}
            className={cn(
              "h-4 w-4 rounded border-border",
              validationError && "border-red-500"
            )}
          />
          <Label htmlFor={name} className="text-sm font-medium cursor-pointer">
            {name} ({displayName})
          </Label>
        </div>
        {validationError && (
          <p className="text-red-500 text-sm">{validationError}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {name}
        <span className="text-xs text-muted-foreground/50 ml-2">
          ({displayName})
        </span>
      </Label>
      {validationError && (
        <p className="text-red-500 text-sm">{validationError}</p>
      )}
      <Input
        id={name}
        type={inputType}
        placeholder={`Enter value for ${name}`}
        value={String(value ?? "")}
        onChange={(e) => {
          const val = e.target.value; 
          if (typeof type === "string") {
            if (
              ["u8", "u16", "u32", "u64", "i8", "i16", "i32", "i64"].includes(
                type
              )
            ) {
              // Allow empty string for intermediate typing
              if (val === "" || val === "-") {
                onChange(val);
                return;
              }
              // Validate it's a valid number
              const trimmed = val.trim();
              const num = Number(trimmed);
              // Only convert if it's a valid integer number
              if (!isNaN(num) && isFinite(num) && Number.isInteger(num)) {
                onChange(num);
              } else {
                // Keep the string for now (user might be typing), but it will be validated on submit
                onChange(val);
              }
              return;
            }
          }
          onChange(val);
        }}
        className={cn(validationError && "border-red-500")}
      />
    </div>
  );
};

export default ArgumentField;

