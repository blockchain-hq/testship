import type { IdlField } from "@coral-xyz/anchor/dist/cjs/idl";
import { useIDL } from "@/context/IDLContext";
import ArgumentField from "./ArgumentField";

interface ArgumentFormProps {
  args: IdlField[] | null;
  formData: Record<string, unknown>;
  onChange: (formData: Record<string, unknown>) => void;
  validationErrors: Record<string, string>;
}

const ArgumentForm = (props: ArgumentFormProps) => {
  const { args, formData, onChange, validationErrors } = props;
  const { idl } = useIDL();

  const handleChange = (name: string, value: unknown) => {
    onChange({ ...formData, [name]: value });
  };

  if (!args || !idl) return null;
  
  return (
    <div className="bg-card border border-border/50 rounded-md p-4 space-y-4">
      <h4 className="text-sm font-semibold text-foreground/90 uppercase tracking-wider">
        {args.length > 0 ? `Arguments (${args.length})` : "No Arguments"}
      </h4>

      {args.map((arg) => (
        <ArgumentField
          key={arg.name}
          name={arg.name}
          value={formData[arg.name]}
          type={arg.type}
          idl={idl}
          onChange={(value) => handleChange(arg.name, value)}
          validationError={validationErrors[arg.name]}
        />
      ))}
    </div>
  );
};

export default ArgumentForm;
