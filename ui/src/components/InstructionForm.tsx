import React from 'react';
import { type Idl } from "@coral-xyz/anchor";
import type { IdlType } from "@coral-xyz/anchor/dist/cjs/idl";
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface InstructionFormProps {
  instruction: Idl["instructions"][number];
}

const InstructionForm = (props: InstructionFormProps) => {
  const { instruction } = props;
  const [formData, setFormData] = React.useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const deriveType = (type: IdlType): string => {
    if (typeof type === 'string') {
      switch (type) {
        case 'u8':
        case 'u16':
        case 'u32':
        case 'u64':
        case 'i8':
        case 'i16':
        case 'i32':
        case 'i64':
          return 'number';
        case 'bool':
          return 'boolean';
        default:
          return 'string';
      }
    }
    return 'string';
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Mock submission - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Submitting instruction:', instruction.name, formData);
    } catch (error) {
      console.error('Error submitting instruction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (arg: any) => {
    const type = deriveType(arg.type);
    const value = formData[arg.name] || '';

    switch (type) {
      case 'number':
        return (
          <Input
            type="number"
            id={arg.name}
            value={value}
            onChange={(e) => handleInputChange(arg.name, Number(e.target.value))}
            placeholder={`Enter ${arg.name}`}
          />
        );
      case 'boolean':
        return (
          <Select value={value.toString()} onValueChange={(val) => handleInputChange(arg.name, val === 'true')}>
            <SelectTrigger>
              <SelectValue placeholder="Select boolean value" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        );
      default:
        return (
          <Textarea
            id={arg.name}
            value={value}
            onChange={(e) => handleInputChange(arg.name, e.target.value)}
            placeholder={`Enter ${arg.name}`}
            rows={3}
          />
        );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>⚡</span>
          <span>{instruction.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Accounts Section */}
          {instruction.accounts && instruction.accounts.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Accounts</h4>
              {instruction.accounts.map((account, index) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={`account-${index}`}>
                    {String(account.name)} {typeof account === 'object' && 'isMut' in account && Boolean(account.isMut) && <span className="text-red-500">(mutable)</span>}
                  </Label>
                  <Input
                    id={`account-${index}`}
                    placeholder={`Enter ${String(account.name)} public key`}
                    value={formData[`account-${index}`] || ''}
                    onChange={(e) => handleInputChange(`account-${index}`, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Arguments Section */}
          {instruction.args && instruction.args.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Arguments</h4>
              {instruction.args.map((arg) => (
                <div key={arg.name} className="space-y-2">
                  <Label htmlFor={arg.name}>
                    {arg.name} <span className="text-gray-500">({typeof arg.type === 'string' ? arg.type : 'object'})</span>
                  </Label>
                  {renderInput(arg)}
                </div>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="min-w-32"
            >
              {isSubmitting ? 'Running...' : 'Run Instruction'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default InstructionForm;
