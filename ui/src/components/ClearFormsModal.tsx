import { useClearFormHistory } from "@/hooks/useClearFromHistory";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";

const ClearFormsModal = () => {
  const { clearFormHistory, isClearing } = useClearFormHistory();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex cursor-pointer">
          <Trash2 className="w-4 h-4 mr-2" />
          Clear Forms
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Clear Form History?</AlertDialogTitle>
          <AlertDialogDescription>
            This will clear all saved form arguments and account addresses from
            localStorage. Your saved accounts library and transaction history
            will not be affected. The page will reload after clearing.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={clearFormHistory} disabled={isClearing}>
            {isClearing ? "Clearing..." : "Clear History"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ClearFormsModal;
