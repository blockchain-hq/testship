import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useState, useRef } from "react";
import type { Idl } from "@coral-xyz/anchor";
import { useIDL } from "@/context/IDLContext";
import { toast } from "sonner";

const validateIDL = (data: any): { valid: boolean; error?: string } => {

  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return { valid: false, error: "IDL must be a JSON object" };
  } 

  if (!Array.isArray(data.instructions)) {
    return { valid: false, error: "IDL must have instructions" };
  }

  if (data.address !== undefined && typeof data.address !== "string") {
    return { valid: false, error: "IDL address must be a string" };
  }

  if (data.metadata !== undefined && typeof data.metadata !== "object") {
    return { valid: false, error: "IDL metadata must be an object" };
  }

  if (data.accounts !== undefined && !Array.isArray(data.accounts)) {
    return { valid: false, error: "IDL accounts must be an array" };
  }

  return { valid: true };
};

const CustomIDLModal = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { setIdl } = useIDL();

  const readFileText = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.onload = () => resolve(reader.result as string);
      reader.readAsText(file, "utf-8");
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);

    if (!selectedFile) {
      setError("Please select a file");
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith(".json")) {
      setError("Only JSON files are allowed");
      e.target.value = "";
      return;
    }

    try {
      const text = await readFileText(selectedFile);

      let parsedData;
      try {
        parsedData = JSON.parse(text);
      } catch (jsonError) {
        setError("File is not valid JSON");
        e.target.value = "";
        return;
      }

      const validation = validateIDL(parsedData);
      if (!validation.valid) {
        setError(validation.error || "Invalid IDL format");
        e.target.value = "";
        return;
      }

      setFile(selectedFile);
      setIdl(parsedData as Idl);
      toast.success("IDL loaded successfully from file: " + selectedFile.name);
    } catch (err: any) {
      toast.error("Failed to process file: " + err.message);
      setError(err instanceof Error ? err.message : "Failed to process file");
      e.target.value = "";
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".json"
      />
      <Button variant="outline" onClick={handleUpload}>
        <Upload className="mr-2 h-4 w-4" /> Upload IDL
      </Button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      {file && !error && <p className="text-green-500 text-sm mt-2">IDL loaded successfully: {file.name}</p>}
    </>
  )
}

export default CustomIDLModal;