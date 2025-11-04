import { useEffect, useMemo, useState } from "react";
import type { Idl, IdlField, IdlType } from "@coral-xyz/anchor/dist/cjs/idl";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import { cn, formatIdlType } from "@/lib/utils";
import { useIDL } from "@/context/IDLContext";

interface ArgumentFormProps {
  args: IdlField[] | null;
  formData: Record<string, string | number>;
  onChange: (formData: Record<string, string | number>) => void;
  validationErrors: Record<string, string>;
}

interface EnumValueEditorProps {
  enumName: string;
  current: any;
  onChange: (val: any) => void;
  onBlur?: () => void;
}

const EnumValueEditor = ({ enumName, current, onChange, onBlur }: EnumValueEditorProps) => {
  const { idl } = useIDL();
  const enumType = (idl as Idl)?.types?.find((t) => t.name === enumName);
  // @ts-expect-error dynamic
  const variants = enumType?.type?.variants as any[] | undefined;

  // Helper for extracting variant/payload from incoming current
  const getCurrentKV = () => {
    if (current && typeof current === "object") {
      const keys = Object.keys(current);
      if (keys.length) return [keys[0], current[keys[0]]];
    }
    return [variants?.[0]?.name ?? "", ""];
  };

  const [variant, setVariant] = useState<string>(() => getCurrentKV()[0]);
  const [payload, setPayload] = useState<any>(() => getCurrentKV()[1]);

  // Only update local if variant changes from outside (not on every prop change)
  useEffect(() => {
    const [newVariant, newPayload] = getCurrentKV();
    if (newVariant !== variant) {
      setVariant(newVariant);
      setPayload(newPayload);
    }
  }, [current, variants]);

  const vMeta = variants?.find((v) => v.name === variant);
  const vFields = vMeta?.fields;
  const isStructVariant = Array.isArray(vFields) && vFields.length > 0 && typeof vFields[0] === "object" && "name" in (vFields[0] as any);
  const isTupleVariant = Array.isArray(vFields) && !isStructVariant;

  const handleVariantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nv = e.target.value;
    setVariant(nv);
    const meta = variants?.find((vv: any) => vv.name === nv);
    let nextPayload = {};
    if (meta?.fields) nextPayload = Array.isArray(meta.fields) ? (meta.fields.length === 1 ? "" : meta.fields.map(() => "")) : {};
    setPayload(nextPayload);
    onChange({ [nv]: nextPayload });
  };

  const handlePayloadChange = (val: any) => {
  setPayload(val);
  onChange({ [variant]: val });
};

  const handleBlur = () => {
    if (onBlur) onBlur();
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center gap-2">
        <select
          className="border rounded px-2 py-1 text-sm"
          value={variant}
          onChange={handleVariantChange}
        >
          {variants?.map((v: any) => (
            <option key={v.name} value={v.name}>{v.name}</option>
          ))}
        </select>
      </div>
      {!vFields ? null : isTupleVariant ? (
        <div className="flex flex-col gap-2">
          {vFields.map((ft: any, idx: number) => (
            <Input
              key={`enum-${enumName}-${variant}-t-${idx}`}
              placeholder={`(${formatIdlType(ft)})`}
              value={Array.isArray(payload) ? String(payload[idx] ?? "") : (idx === 0 && typeof payload === "string" ? payload : "")}
              onChange={e => {
                if (vFields.length === 1) handlePayloadChange(e.target.value);
                else {
                  const arr = Array.isArray(payload) ? [...payload] : [];
                  arr[idx] = e.target.value;
                  handlePayloadChange(arr);
                }
              }}
              onBlur={handleBlur}
            />
          ))}
        </div>
      ) : isStructVariant ? (
        <div className="flex flex-col gap-2">
          {vFields?.map((f: any) => {
            const fieldType = f.type;
            const isNumericType = typeof fieldType === 'string' && 
              ['u8','u16','u32','u64','i8','i16','i32','i64'].includes(fieldType);
            
            return (
            <div className="flex items-center gap-2" key={`enum-${enumName}-${variant}-s-${f.name}`}>
              <div className="w-32 text-xs text-muted-foreground">{f.name}</div>
              <Input
                placeholder={formatIdlType(f.type)}
                  type={isNumericType ? "number" : "text"}
                value={payload ? String(payload[f.name] ?? "") : ""}
                onChange={e => {
                  const next = { ...(payload || {}) };
                    // Convert to number for numeric types
                    if (isNumericType) {
                      const numVal = e.target.value === '' ? '' : Number(e.target.value);
                      next[f.name] = numVal;
                    } else {
                  next[f.name] = e.target.value;
                    }
                  handlePayloadChange(next);
                }}
                className="flex-1"
                onBlur={handleBlur}
              />
            </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

const ArgumentForm = (props: ArgumentFormProps) => {
  const { args, formData, onChange, validationErrors } = props;
  const { idl } = useIDL();

  const handleChange = (name: string, value: string | number) => {
    onChange({ ...formData, [name]: value });
  };

  const isVecType = (type?: IdlType): type is { vec: IdlType } => {
    return !!type && typeof type === "object" && "vec" in type;
  };

  const isFixedArrayType = (type?: IdlType): type is { array: [IdlType, number] } => {
    return !!type && typeof type === "object" && "array" in type;
  };

  const getDefinedName = (type?: IdlType): string | null => {
    if (!type || typeof type !== "object") return null;
    if ("defined" in type) {
      const v: any = (type as any).defined;
      if (typeof v === "string") return v;
      if (v && typeof v === "object" && "name" in v) return String(v.name);
    }
    return null;
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

  const StructInput = ({
    name,
    type,
    value,
  }: {
    name: string;
    type: IdlType; // defined struct
    value: string | number | undefined;
  }) => {
    const { idl } = useIDL();
    const definedName = getDefinedName(type);
    const [obj, setObj] = useState<Record<string, any>>({});

    // Initialize from existing value
    useEffect(() => {
      // Only hydrate from external value if we don't have local edits yet
      if (Object.keys(obj).length > 0) return;
      if (typeof value === "string" && value.trim()) {
        try {
          const parsed = JSON.parse(value);
          if (parsed && typeof parsed === "object") {
            const next: Record<string, any> = {};
            Object.keys(parsed).forEach((k) => (next[k] = (parsed as any)[k]));
            setObj(next);
          }
        } catch {}
      }
    }, [value]);

    const schema = useMemo(() => {
      if (!idl || !definedName) return null;
      const t = (idl as Idl).types?.find((x) => x.name === definedName);
      // @ts-expect-error - IDL schema is dynamic
      const fields = t?.type?.fields as { name: string; type: IdlType }[] | undefined;
      return fields ?? null;
    }, [idl, definedName]);

    // Initialize defaults once so nested editors have concrete shapes
    useEffect(() => {
      if (!schema) return;
      if (Object.keys(obj).length > 0) return;
      const next: Record<string, any> = {};
      for (const f of schema) {
        // Reuse helper from above
        const defVal = getDefaultForField ? getDefaultForField(f) : (typeof f.type === 'object' && 'vec' in f.type ? [] : typeof f.type === 'object' && 'array' in f.type ? Array((f.type as any).array?.[1] ?? 0).fill(0) : typeof f.type === 'object' && 'option' in f.type ? null : '');
        next[f.name] = defVal;
      }
      setObj(next);
      updateParent(next as any);
    }, [schema]);

    const getDefaultForField = (field: { name: string; type: IdlType }): any => {
      // Specific defaults for ExtraInfo struct
      if (definedName === "ExtraInfo") {
        switch (field.name) {
          case "tags": return [];
          case "scores": return [];
          case "data": return [];
          case "favorite_numbers": return [0, 0, 0, 0];
          case "nicknames": return null;
          default: return "";
        }
      }
      // General defaults based on type
      const fieldType = field.type;
      if (typeof fieldType === "object" && fieldType !== null) {
        if ("vec" in fieldType) return [];
        if ("array" in fieldType) {
          const len = (fieldType as any).array?.[1] ?? 0;
          return Array(len).fill(0);
        }
        if ("option" in fieldType) return null;
      }
      return "";
    };

    const updateParent = (next: Record<string, any>) => {
      // Ensure all schema fields are present with proper defaults
      const complete: Record<string, any> = {};
      if (schema) {
        for (const field of schema) {
          if (field.name in next && next[field.name] !== undefined) {
            complete[field.name] = next[field.name];
          } else {
            complete[field.name] = getDefaultForField(field);
          }
        }
      } else {
        Object.assign(complete, next);
      }
      handleChange(name, JSON.stringify(complete));
    };

    if (!schema) {
      return (
        <Input
          placeholder={`Enter JSON for ${definedName ?? "object"}`}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => handleChange(name, e.target.value)}
        />
      );
    }

    // Use the top-level EnumValueEditor to avoid remounting on every render

    return (
      <div className="space-y-3">
        {schema.map((field) => (
          <div className="flex items-center gap-2" key={`${name}.${field.name}`}>
            <div className="w-40 text-sm text-muted-foreground">{field.name}</div>
            {(() => {
              const def = getDefinedName(field.type);
              if (def) {
                // Determine kind from IDL
                const t = (idl as Idl)?.types?.find((tt) => tt.name === def);
                const kind: string | undefined = (t as any)?.type?.kind;
                
                if (kind === "enum") {
                  return (
                    <EnumValueEditor
                      enumName={def}
                      current={obj[field.name]}
                      onChange={(tagged: any) => {
                        const next = { ...obj, [field.name]: tagged };
                        setObj(next);
                      }}
                      onBlur={() => updateParent({ ...obj, [field.name]: obj[field.name] })}
                    />
                  );
                }
                
                if (kind === "struct") {
                  // Nested struct - render recursively
                  return (
                    <div className="flex-1">
                      <StructInput
                        name={`${name}.${field.name}`}
                        type={field.type}
                        value={typeof obj[field.name] === 'string' ? obj[field.name] : JSON.stringify(obj[field.name] || {})}
                      />
                    </div>
                  );
                }
              }

              // Nested helpers for vec/array/option/bytes
              const renderVecEditor = () => {
                const inner = (field.type as any).vec as IdlType;
                const isInnerNumeric = typeof inner === 'string' && ['u8','u16','u32','i8','i16','i32'].includes(inner);

                const Items = () => {
                  const [draft, setDraft] = useState<string>("");
                  const items: any[] = Array.isArray(obj[field.name]) ? (obj[field.name] as any[]) : [];

                  const addItem = () => {
                    const raw = draft.trim();
                    if (!raw) return;
                    const value = isInnerNumeric ? Number(raw) : raw;
                    const nextArr = [...items, value];
                    const next = { ...obj, [field.name]: nextArr };
                    setDraft("");
                    setObj(next);
                    updateParent(next as any);
                  };

                  const removeAt = (idx: number) => {
                    const nextArr = items.filter((_, i) => i !== idx);
                    const next = { ...obj, [field.name]: nextArr };
                    setObj(next);
                    updateParent(next as any);
                  };

                  return (
                    <div className="flex flex-col gap-3 w-full">
                      <div className="flex flex-wrap gap-2">
                        {items.map((it, idx) => (
                          <div key={idx} className="px-2 py-1 rounded border text-xs flex items-center gap-2 bg-white">
                            <span>{String(it)}</span>
                            <button type="button" className="text-red-500 hover:text-red-600" onClick={() => removeAt(idx)}>✕</button>
                          </div>
                        ))}
                        {items.length === 0 && (
                          <div className="text-xs text-muted-foreground">No items</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder={`Add ${formatIdlType(inner)}`}
                          value={draft}
                          type={isInnerNumeric ? "number" : "text"}
                          onChange={(e) => setDraft(e.target.value)}
                          className="max-w-xs"
                        />
                        <button type="button" onClick={addItem} className="h-8 px-3 rounded border bg-primary text-primary-foreground hover:opacity-90">Add</button>
                      </div>
                    </div>
                  );
                };

                return <Items />;
              };

              const renderFixedArrayEditor = () => {
                const [inner, len] = (field.type as any).array as [IdlType, number];
                const isInnerNumeric = typeof inner === 'string' && ['u8','u16','u32','i8','i16','i32'].includes(inner);
                const current: any[] = Array.isArray(obj[field.name]) ? (obj[field.name] as any[]) : Array(len).fill(isInnerNumeric ? 0 : "");

                const changeAt = (idx: number, v: string) => {
                  const nextArr = [...current];
                  nextArr[idx] = isInnerNumeric ? (v === '' ? 0 : Number(v)) : v;
                  const next = { ...obj, [field.name]: nextArr.slice(0, len) };
                  setObj(next);
                  updateParent(next as any);
                };

                return (
                  <div className="flex flex-col gap-2 w-full">
                    <div className="grid grid-cols-4 gap-2">
                      {Array.from({ length: len }).map((_, idx) => (
                        <Input
                          key={idx}
                          placeholder={`${formatIdlType(inner)}[${idx}]`}
                          type={isInnerNumeric ? "number" : "text"}
                          value={current[idx] ?? (isInnerNumeric ? 0 : "")}
                          onChange={(e) => changeAt(idx, e.target.value)}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground">Length: {len}</div>
                  </div>
                );
              };

              const renderOptionEditor = () => {
                const inner = (field.type as any).option as IdlType;
                const isVecInner = typeof inner === 'object' && inner !== null && 'vec' in inner;
                const isArrayInner = typeof inner === 'object' && inner !== null && 'array' in inner;
                const current = obj[field.name];

                // Specialized editor for Option<Vec<T>>
                const OptionVecEditor = () => {
                  const innerType = (inner as any).vec as IdlType;
                  const isNum = typeof innerType === 'string' && ['u8','u16','u32','i8','i16','i32'].includes(innerType);
                  const items: any[] = Array.isArray(obj[field.name]) ? (obj[field.name] as any[]) : [];
                  const [draft, setDraft] = useState<string>("");
                  const addItem = () => {
                    const raw = draft.trim();
                    if (!raw) return;
                    const value = isNum ? Number(raw) : raw;
                    const next = { ...obj, [field.name]: [...items, value] };
                    setDraft("");
                    setObj(next);
                    updateParent(next as any);
                  };
                  const removeAt = (idx: number) => {
                    const nextArr = items.filter((_, i) => i !== idx);
                    const next = { ...obj, [field.name]: nextArr };
                    setObj(next);
                    updateParent(next as any);
                  };
                  return (
                    <div className="flex flex-col gap-3 w-full">
                      <div className="flex flex-wrap gap-2">
                        {items.map((it, idx) => (
                          <div key={idx} className="px-2 py-1 rounded border text-xs flex items-center gap-2 bg-white">
                            <span>{String(it)}</span>
                            <button type="button" className="text-red-500 hover:text-red-600" onClick={() => removeAt(idx)}>✕</button>
                          </div>
                        ))}
                        {items.length === 0 && <div className="text-xs text-muted-foreground">No items</div>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder={`Add ${formatIdlType(innerType)}`}
                          value={draft}
                          type={isNum ? 'number' : 'text'}
                          onChange={(e) => setDraft(e.target.value)}
                          className="max-w-xs"
                        />
                        <button type="button" onClick={addItem} className="h-8 px-3 rounded border bg-primary text-primary-foreground hover:opacity-90">Add</button>
                      </div>
                    </div>
                  );
                };

                return (
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className={`h-8 px-3 rounded border ${current == null ? 'bg-primary text-primary-foreground' : 'bg-white'}`}
                        onClick={() => {
                          const next = { ...obj, [field.name]: null };
                          setObj(next);
                          updateParent(next as any);
                        }}
                      >None</button>
                      <button
                        type="button"
                        className={`h-8 px-3 rounded border ${current != null ? 'bg-primary text-primary-foreground' : 'bg-white'}`}
                        onClick={() => {
                          const defaultSome = isVecInner ? [] : (isArrayInner ? [] : "");
                          const next = { ...obj, [field.name]: current ?? defaultSome };
                          setObj(next);
                          updateParent(next as any);
                        }}
                      >Some</button>
                    </div>
                    {current != null && (
                      <div className="p-2">
                        {isVecInner ? (
                          <OptionVecEditor />
                        ) : isArrayInner ? (
                          <div className="w-full">{renderFixedArrayEditor()}</div>
                        ) : (
                          <Input
                            placeholder={`Enter ${formatIdlType(inner)}`}
                            value={typeof current === 'string' ? current : ''}
                            onChange={(e) => {
                              const next = { ...obj, [field.name]: e.target.value };
                              setObj(next);
                            }}
                            onBlur={() => updateParent(obj as any)}
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              };

              const renderBytesEditor = () => {
                const items: number[] = Array.isArray(obj[field.name]) ? (obj[field.name] as number[]) : [];
                const [draft, setDraft] = useState<string>("");

                const addByte = () => {
                  const n = Number(draft);
                  if (Number.isNaN(n)) return;
                  const clamped = Math.max(0, Math.min(255, n));
                  const next = { ...obj, [field.name]: [...items, clamped] };
                  setDraft("");
                  setObj(next);
                  updateParent(next as any);
                };

                const removeAt = (idx: number) => {
                  const nextArr = items.filter((_, i) => i !== idx);
                  const next = { ...obj, [field.name]: nextArr };
                  setObj(next);
                  updateParent(next as any);
                };

                return (
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex flex-wrap gap-2">
                      {items.map((b, idx) => (
                        <div key={idx} className="px-2 py-1 rounded border text-xs flex items-center gap-2 bg-white">
                          <span>{b}</span>
                          <button type="button" className="text-red-500 hover:text-red-600" onClick={() => removeAt(idx)}>✕</button>
                        </div>
                      ))}
                      {items.length === 0 && <div className="text-xs text-muted-foreground">No bytes</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Add byte (0-255)"
                        value={draft}
                        type="number"
                        onChange={(e) => setDraft(e.target.value)}
                        className="max-w-[160px]"
                      />
                      <button type="button" onClick={addByte} className="h-8 px-3 rounded border bg-primary text-primary-foreground hover:opacity-90">Add</button>
                    </div>
                  </div>
                );
              };

              // Render specialized editors for nested field kinds
              if (typeof field.type === 'object' && field.type !== null) {
                if ('vec' in field.type) return renderVecEditor();
                if ('array' in field.type) return renderFixedArrayEditor();
                if ('option' in field.type) return renderOptionEditor();
              }
              // bytes as primitive
              if (typeof field.type === 'string' && field.type === 'bytes') return renderBytesEditor();

              // Check if field is numeric type
              const isNumericType = typeof field.type === 'string' && 
                ['u8','u16','u32','u64','i8','i16','i32','i64'].includes(field.type);
              
              return (
                <Input
                  placeholder={`Enter ${formatIdlType(field.type)}`}
                  type={isNumericType ? "number" : "text"}
                  value={obj[field.name] ?? ""}
                  onChange={(e) => {
                    const next = { ...obj };
                    // Convert to number for numeric types
                    if (isNumericType) {
                      next[field.name] = e.target.value === '' ? '' : Number(e.target.value);
                    } else {
                      next[field.name] = e.target.value;
                    }
                    setObj(next);
                  }}
                  onBlur={() => updateParent(obj as any)}
                  className="flex-1"
                />
              );
            })()}
          </div>
        ))}
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
                {(() => {
                  const base = formatIdlType(arg.type);
                  const defined = getDefinedName(arg.type);
                  if (defined && idl?.types) {
                    const t = idl.types.find((tt) => tt.name === defined);
                    const kind: string | undefined = (t as any)?.type?.kind;
                    if (kind === "struct") return `(${base}, struct)`;
                    if (kind === "enum") return `(${base}, enum)`;
                  }
                  return `(${base})`;
                })()}
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
      ) : getDefinedName(arg.type) ? (
        (() => {
          const def = getDefinedName(arg.type);
          const t = idl?.types?.find((tt) => tt.name === def);
          const kind: string | undefined = (t as any)?.type?.kind;
          if (kind === "struct") {
            return (
              <StructInput name={arg.name} type={arg.type as IdlType} value={formData[arg.name]} />
            );
          }
          if (kind === "enum") {
            // parse current value if available
            let current: any = undefined;
            const val = formData[arg.name];
            if (typeof val === "string" && val.trim()) {
              try { current = JSON.parse(val); } catch {}
            }
            return (
              // Reuse the same stable editor for top-level enum args
              <div className="w-full">
                <EnumValueEditor
                  enumName={def as string}
                  current={current}
                  onChange={(tagged: any) => handleChange(arg.name, JSON.stringify(tagged))}
                />
              </div>
            );
          }
          // Fallback
          return (
            <Input
              id={arg.name}
              type="text"
              placeholder={`Enter value for ${arg.name}`}
              value={formData[arg.name]}
              onChange={(e) => handleChange(arg.name, e.target.value)}
              className={cn(validationErrors[arg.name] && "border-red-500")}
            />
          );
        })()
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
