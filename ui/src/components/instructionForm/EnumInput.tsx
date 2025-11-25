import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";
import type { IdlType } from "@coral-xyz/anchor/dist/cjs/idl";
import { getEnumVariants } from "@/lib/typeParser";
import type { Idl } from "@coral-xyz/anchor";

interface EnumInputProps {
  name: string;
  value: unknown;
  onChange: (value: unknown) => void;
  type: IdlType;
  idl: Idl;
  validationError?: string;
}

const EnumInput = ({
  name,
  value,
  onChange,
  type,
  idl,
  validationError,
}: EnumInputProps) => {
  const variants = getEnumVariants(idl, type);

  if (!variants || variants.length === 0) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{name} (enum)</Label>
        <p className="text-sm text-muted-foreground">
          No enum variants found
        </p>
      </div>
    );
  }

  // Handle enum with fields (tuple or struct variants)
  const hasFields = variants.some((v) => v.fields);

  if (hasFields) { 
    const selectedVariant = typeof value === "object" && value !== null
      ? Object.keys(value)[0]
      : null;

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{name} (enum)</Label>
        {validationError && (
          <p className="text-red-500 text-sm">{validationError}</p>
        )}
        <Select
          value={selectedVariant || ""}
          onValueChange={(variantName) => { 
            const variant = variants.find((v) => v.name === variantName);
            if (variant?.fields) { 
              const fields = Array.isArray(variant.fields)
                ? variant.fields.map((f: unknown) => { 
                    return typeof f === "object" && f !== null && "name" in f
                      ? ""
                      : "";
                  })
                : [];
              onChange({ [variantName]: fields });
            } else {
              onChange({ [variantName]: {} });
            }
          }}
        >
          <SelectTrigger className={cn(validationError && "border-red-500")}>
            <SelectValue placeholder="Select enum variant" />
          </SelectTrigger>
          <SelectContent>
            {variants.map((variant) => (
              <SelectItem key={variant.name} value={variant.name}>
                {variant.name}
                {variant.fields !== undefined && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (has fields)
                  </span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select> 
      </div>
    );
  }
 
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{name} (enum)</Label>
      {validationError && (
        <p className="text-red-500 text-sm">{validationError}</p>
      )}
      <Select
        value={String(value || "")}
        onValueChange={(val) => onChange(val)}
      >
        <SelectTrigger className={cn(validationError && "border-red-500")}>
          <SelectValue placeholder="Select enum variant" />
        </SelectTrigger>
        <SelectContent>
          {variants.map((variant) => (
            <SelectItem key={variant.name} value={variant.name}>
              {variant.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default EnumInput;

