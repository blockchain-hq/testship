import { useEffect, useMemo, useState } from "react";
import type { IdlField, IdlType } from "@coral-xyz/anchor/dist/cjs/idl";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import { cn, formatIdlType } from "@/lib/utils";

interface ArgumentFormProps {
  args: IdlField[] | null;
  formData: Record<string, string | number>;
  onChange: (formData: Record<string, string | number>) => void;
  validationErrors: Record<string, string>;
}

const ArgumentForm = (props: ArgumentFormProps) => {
  const { args, formData, onChange, validationErrors } = props;

  const handleChange = (name: string, value: string | number) => {
    onChange({ ...formData, [name]: value });
  };

  const isVecType = (type?: IdlType): type is { vec: IdlType } => {
    return !!type && typeof type === "object" && "vec" in type;
  };

  const isFixedArrayType = (type?: IdlType): type is { array: [IdlType, number] } => {
    return !!type && typeof type === "object" && "array" in type;
  };

  const VecInput = ({
    name,
    type,
    value,
  }: {
    name: string;
    type: IdlType;
    value: string | number | undefined;
  }) => {
    const [items, setItems] = useState<string[]>([]);
    const [draft, setDraft] = useState<string>("");

    // Initialize from incoming value (only when items not set yet)
    useEffect(() => {
      if (items.length > 0) return;
      if (typeof value === "string" && value.trim().length > 0) {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            setItems(parsed.map((v) => String(v)));
            return;
          }
        } catch {}
        setItems([value]);
      } else if (typeof value === "number") {
        setItems([String(value)]);
      }
    }, [value, items.length]);

    const placeholder = useMemo(() => {
      const inner = (type as any)?.vec as IdlType;
      const innerLabel = formatIdlType(inner);
      return `Add ${innerLabel}`;
    }, [type]);

    const updateParent = (next: string[]) => {
      const trimmed = next.map((s) => s.trim()).filter((s) => s.length > 0);
      handleChange(name, JSON.stringify(trimmed));
    };

    const addDraft = () => {
      const v = draft.trim();
      if (!v) return;
      const next = [...items, v];
      setItems(next);
      setDraft("");
      updateParent(next);
    };

    const removeAt = (idx: number) => {
      const next = items.filter((_, i) => i !== idx);
      setItems(next);
      updateParent(next);
    };

    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder={placeholder}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addDraft();
              }
            }}
            onBlur={() => {
              // Don't add empty on blur
            }}
          />
          <button type="button" className="px-2 py-1 border rounded" onClick={addDraft}>
            Add
          </button>
        </div>
        {items.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {items.map((it, idx) => (
              <span
                key={`${name}-chip-${idx}`}
                className="inline-flex items-center gap-1 px-2 py-1 rounded border text-sm"
              >
                {it}
                <button
                  type="button"
                  className="ml-1 text-muted-foreground hover:text-foreground"
                  onClick={() => removeAt(idx)}
                  aria-label="Remove item"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  const FixedArrayInput = ({
    name,
    type,
    value,
  }: {
    name: string;
    type: IdlType; // { array: [IdlType, number] }
    value: string | number | undefined;
  }) => {
    const innerAndLen = useMemo(() => {
      const arr = (type as any)?.array as [IdlType, number] | undefined;
      const inner = arr?.[0];
      const len = typeof arr?.[1] === "number" ? (arr as any)[1] as number : undefined;
      return { inner, len } as { inner?: IdlType; len?: number };
    }, [type]);

    const [items, setItems] = useState<string[]>([]);
    const [draft, setDraft] = useState<string>("");

    useEffect(() => {
      const len = innerAndLen.len ?? 0;
      if (typeof value === "string" && value.trim().length > 0) {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            const casted = parsed.map((v) => String(v));
            // pad/trim to fixed length
            const next = Array.from({ length: len }, (_, i) => casted[i] ?? "");
            setItems(next);
            return;
          }
        } catch {
          // fallthrough to single value
        }
        const next = Array.from({ length: len }, (_, i) => (i === 0 ? String(value) : ""));
        setItems(next);
      } else if (typeof value === "number") {
        const next = Array.from({ length: innerAndLen.len ?? 0 }, (_, i) => (i === 0 ? String(value) : ""));
        setItems(next);
      } else {
        setItems(Array.from({ length: innerAndLen.len ?? 0 }, () => ""));
      }
    }, [value, innerAndLen.len]);

    const placeholder = useMemo(() => {
      const innerLabel = innerAndLen.inner ? formatIdlType(innerAndLen.inner) : "item";
      return `Enter ${innerLabel}`;
    }, [innerAndLen.inner]);

    const updateParent = (next: string[]) => {
      const fixed = (innerAndLen.len ?? 0) > 0 ? next.slice(0, innerAndLen.len) : next;
      handleChange(name, JSON.stringify(fixed));
    };

    const addDraft = () => {
      const v = draft.trim();
      if (!v) return;
      const limit = innerAndLen.len ?? Infinity;
      if (items.length >= limit) return;
      const next = [...items, v];
      setItems(next);
      setDraft("");
      updateParent(next);
    };

    const removeAt = (idx: number) => {
      const next = items.filter((_, i) => i !== idx);
      setItems(next);
      updateParent(next);
    };

    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder={placeholder}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addDraft();
              }
            }}
          />
          <button type="button" className="px-2 py-1 border rounded" onClick={addDraft}>
            Add
          </button>
          {typeof innerAndLen.len === "number" && (
            <span className="text-xs text-muted-foreground self-center">
              {items.length}/{innerAndLen.len}
            </span>
          )}
        </div>
        {items.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {items.map((it, idx) => (
              <span
                key={`${name}-fixed-chip-${idx}`}
                className="inline-flex items-center gap-1 px-2 py-1 rounded border text-sm"
              >
                {it}
                <button
                  type="button"
                  className="ml-1 text-muted-foreground hover:text-foreground"
                  onClick={() => removeAt(idx)}
                  aria-label="Remove item"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

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
                ({formatIdlType(arg.type)})
              </span>
            )}
          </Label>
          {validationErrors[arg.name] && (
            <p className="text-red-500 text-sm">{validationErrors[arg.name]}</p>
          )}
          {isVecType(arg.type) ? (
            <VecInput name={arg.name} type={arg.type} value={formData[arg.name]} />
          ) : isFixedArrayType(arg.type) ? (
            <FixedArrayInput name={arg.name} type={arg.type} value={formData[arg.name]} />
          ) : (
            <Input
              id={arg.name}
              type="text"
              placeholder={`Enter value for ${arg.name}`}
              value={formData[arg.name]}
              onChange={(e) => handleChange(arg.name, e.target.value)}
              className={cn(validationErrors[arg.name] && "border-red-500")}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default ArgumentForm;
