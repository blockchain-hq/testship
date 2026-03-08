import type { TypeNode, ProgramNode } from "@codama/nodes";

type Props = {
  type: TypeNode;
  value: any;
  onChange: (v: any) => void;
  programNode: ProgramNode;
};

export const TypeInput = ({ type, value, onChange, programNode }: Props) => {
  switch (type.kind) {
    case "numberTypeNode":
      return <NumberInput format={type.format} value={value} onChange={onChange} />;

    case "booleanTypeNode":
      return <BoolInput value={value} onChange={onChange} />;

    case "publicKeyTypeNode":
      return <PubkeyInput value={value} onChange={onChange} />;

    case "stringTypeNode":
      return <StringInput value={value} onChange={onChange} />;

    case "bytesTypeNode":
      return <BytesInput value={value} onChange={onChange} />;

    case "optionTypeNode":
      return (
        <OptionInput
          innerType={type.item}
          value={value}
          onChange={onChange}
          programNode={programNode}
        />
      );

    case "enumTypeNode":
      return <EnumInput type={type} value={value} onChange={onChange} />;

    case "arrayTypeNode":
      return (
        <ArrayInput
          itemType={type.item}
          value={value}
          onChange={onChange}
          programNode={programNode}
        />
      );

    case "structTypeNode":
      return (
        <StructInput
          type={type}
          value={value}
          onChange={onChange}
          programNode={programNode}
        />
      );

    case "definedTypeLinkNode": {
      const resolved = programNode.definedTypes.find(
        (d) => d.name === type.name
      );
      if (resolved) {
        return (
          <TypeInput
            type={resolved.type}
            value={value}
            onChange={onChange}
            programNode={programNode}
          />
        );
      }
      return <FallbackInput label={type.name} value={value} onChange={onChange} />;
    }

    default:
      return <FallbackInput label={type.kind} value={value} onChange={onChange} />;
  }
};

const inputClass =
  "w-full text-xs font-mono px-3 py-2 border border-border rounded-md bg-background";

const NumberInput = ({
  format,
  value,
  onChange,
}: {
  format: string;
  value: any;
  onChange: (v: any) => void;
}) => {
  const isBigInt = format.includes("64") || format.includes("128");
  return (
    <input
      type={isBigInt ? "text" : "number"}
      value={value ?? ""}
      onChange={(e) => onChange(isBigInt ? e.target.value : Number(e.target.value))}
      placeholder={format}
      className={inputClass}
    />
  );
};

const BoolInput = ({
  value,
  onChange,
}: {
  value: any;
  onChange: (v: any) => void;
}) => (
  <label className="flex items-center gap-2 py-1">
    <input
      type="checkbox"
      checked={value ?? false}
      onChange={(e) => onChange(e.target.checked)}
      className="h-4 w-4 rounded border-border"
    />
    <span className="text-xs text-muted-foreground">
      {value ? "true" : "false"}
    </span>
  </label>
);

const PubkeyInput = ({
  value,
  onChange,
}: {
  value: any;
  onChange: (v: any) => void;
}) => (
  <input
    type="text"
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value)}
    placeholder="Public key (base58)"
    className={inputClass}
  />
);

const StringInput = ({
  value,
  onChange,
}: {
  value: any;
  onChange: (v: any) => void;
}) => (
  <input
    type="text"
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value)}
    placeholder="string"
    className={inputClass}
  />
);

const BytesInput = ({
  value,
  onChange,
}: {
  value: any;
  onChange: (v: any) => void;
}) => (
  <input
    type="text"
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value)}
    placeholder="hex bytes"
    className={inputClass}
  />
);

const OptionInput = ({
  innerType,
  value,
  onChange,
  programNode,
}: {
  innerType: TypeNode;
  value: any;
  onChange: (v: any) => void;
  programNode: ProgramNode;
}) => {
  const hasValue = value !== null && value !== undefined;

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={hasValue}
          onChange={(e) => onChange(e.target.checked ? "" : null)}
          className="h-4 w-4 rounded border-border"
        />
        <span className="text-xs text-muted-foreground">Some</span>
      </label>
      {hasValue && (
        <TypeInput
          type={innerType}
          value={value}
          onChange={onChange}
          programNode={programNode}
        />
      )}
    </div>
  );
};

const EnumInput = ({
  type,
  value,
  onChange,
}: {
  type: any;
  value: any;
  onChange: (v: any) => void;
}) => (
  <select
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value)}
    className={inputClass}
  >
    <option value="" disabled>
      Select variant
    </option>
    {type.variants?.map((v: any) => (
      <option key={v.name} value={v.name}>
        {v.name}
      </option>
    ))}
  </select>
);

const ArrayInput = ({
  itemType,
  value,
  onChange,
  programNode,
}: {
  itemType: TypeNode;
  value: any;
  onChange: (v: any) => void;
  programNode: ProgramNode;
}) => {
  const items: any[] = Array.isArray(value) ? value : [];

  const addItem = () => onChange([...items, undefined]);
  const removeItem = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, v: any) => {
    const next = [...items];
    next[i] = v;
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="flex-1">
            <TypeInput
              type={itemType}
              value={item}
              onChange={(v) => updateItem(i, v)}
              programNode={programNode}
            />
          </div>
          <button
            onClick={() => removeItem(i)}
            className="text-xs text-destructive px-2 py-2 hover:bg-destructive/10 rounded"
          >
            x
          </button>
        </div>
      ))}
      <button
        onClick={addItem}
        className="text-xs text-muted-foreground hover:text-foreground px-2 py-1"
      >
        + Add item
      </button>
    </div>
  );
};

const StructInput = ({
  type,
  value,
  onChange,
  programNode,
}: {
  type: any;
  value: any;
  onChange: (v: any) => void;
  programNode: ProgramNode;
}) => {
  const obj = value && typeof value === "object" ? value : {};

  const setField = (name: string, v: any) =>
    onChange({ ...obj, [name]: v });

  return (
    <div className="border border-border rounded-md p-3 space-y-2">
      {type.fields?.map((field: any) => (
        <div key={field.name} className="flex items-start gap-2">
          <span className="text-xs font-mono w-28 shrink-0 pt-2 truncate">
            {field.name}
          </span>
          <div className="flex-1">
            <TypeInput
              type={field.type}
              value={obj[field.name]}
              onChange={(v) => setField(field.name, v)}
              programNode={programNode}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const FallbackInput = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: any;
  onChange: (v: any) => void;
}) => (
  <input
    type="text"
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value)}
    placeholder={label}
    className={inputClass}
  />
);
