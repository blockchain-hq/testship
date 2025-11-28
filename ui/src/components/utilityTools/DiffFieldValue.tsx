import { ArrowRight } from "lucide-react";
import { SmartFieldValue } from "./SmartFieldValue";
import type { FieldDiff } from "@/lib/utils/account-diff";

interface DiffFieldValueProps {
  diff: FieldDiff;
}

export const DiffFieldValue = ({ diff }: DiffFieldValueProps) => {
  const { oldValue, newValue, changeType } = diff;

  // Determine styling based on change type
  const getChangeStyles = () => {
    switch (changeType) {
      case "added":
        return {
          container: "bg-green-50 dark:bg-green-950/20 border-l-2 border-green-500",
          label: "text-green-700 dark:text-green-400",
        };
      case "removed":
        return {
          container: "bg-red-50 dark:bg-red-950/20 border-l-2 border-red-500",
          label: "text-red-700 dark:text-red-400",
        };
      case "modified":
        return {
          container: "bg-orange-50 dark:bg-orange-950/20 border-l-2 border-orange-500",
          label: "text-orange-700 dark:text-orange-400",
        };
    }
  };

  const styles = getChangeStyles();

  // Handle added field
  if (changeType === "added") {
    return (
      <div className={`${styles.container} px-3 py-2`}>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-semibold ${styles.label}`}>
            ADDED
          </span>
          <div className="text-[11px]">
            <SmartFieldValue fieldKey={diff.fieldKey} value={newValue} />
          </div>
        </div>
      </div>
    );
  }

  // Handle removed field
  if (changeType === "removed") {
    return (
      <div className={`${styles.container} px-3 py-2`}>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-semibold ${styles.label}`}>
            REMOVED
          </span>
          <div className="text-[11px] opacity-70">
            <SmartFieldValue fieldKey={diff.fieldKey} value={oldValue} />
          </div>
        </div>
      </div>
    );
  }

  // Handle modified field - show both old and new
  return (
    <div className={`${styles.container} px-3 py-2`}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[10px] font-semibold ${styles.label}`}>
          MODIFIED
        </span>
        <div className="flex items-center gap-2 text-[11px] flex-1 min-w-0">
          {/* Old value */}
          <div className="opacity-60 line-through">
            <SmartFieldValue fieldKey={diff.fieldKey} value={oldValue} />
          </div>
          
          {/* Arrow */}
          <ArrowRight className="w-3 h-3 flex-shrink-0 text-orange-600 dark:text-orange-400" />
          
          {/* New value */}
          <div className="font-medium">
            <SmartFieldValue fieldKey={diff.fieldKey} value={newValue} />
          </div>
        </div>
      </div>
    </div>
  );
};

