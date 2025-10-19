import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type React from "react";
import { useEffect, useState } from "react";

const IDLLoaderModal = () => {
  const [idlFile, setIdlFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log(idlFile);
  }, [idlFile]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIdlFile(file);
    setError(null);

    try {
      const text = await readFileText(file);

      let parsed;
      try {
        parsed = JSON.parse(text);
        console.log("✅ Valid JSON:", parsed);
        // You can add Anchor IDL structure validation here later
      } catch (jsonErr: any) {
        console.error("❌ JSON parsing failed:", jsonErr);
        setError("File content is not valid JSON.");
        e.target.value = ""; // reset file input
        return;
      }

      console.log("✅ Valid Anchor IDL:", parsed);
    } catch (err: any) {
      console.error("❌ File read failed:", err);
      setError(err?.message ?? "Unknown error while reading the file.");
      e.target.value = "";
    }
  };

  const readFileText = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onerror = () => reject(new Error("Failed to read file"));
      fr.onload = () => resolve(fr.result as string);
      fr.readAsText(file, "utf-8");
    });
  };

  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button variant="outline">Load IDL</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Load IDL</DialogTitle>
            <DialogDescription>
              Upload IDL for any Solana Anchor Program from your device
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="idl-file">IDL</Label>
              <Input
                id="idl-file"
                name="name"
                type="file"
                accept=".json,application/json"
                placeholder="Upload IDL here"
                onChange={handleFileChange}
              />
              {error && <p>{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Load</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default IDLLoaderModal;
