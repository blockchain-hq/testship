import { driver } from "driver.js";
import { useCallback, useMemo } from "react";

const useTour = () => {
  const driverObj = useMemo(
    () =>
      driver({
        showProgress: true,
        steps: [
          {
            element: "#search-bar",
            popover: {
              title: "Search",
              description: "Search for an instruction to get started.",
            },
          },
          {
            element: "#instruction-form",
            popover: {
              title: "Instruction Form",
              description: "Fill in the form to run the instruction.",
            },
          },
          {
            element: "#run-instruction-btn",
            popover: {
              title: "Run Instruction",
              description: "Click to run the instruction.",
            },
          },
          {
            element: "#utility-dialog-trigger",
            popover: {
              title: "Utility Dialog",
              description:
                "Use utility tools to convert timestamps, lamports, strings, and durations.",
            },
          },
          {
            element: "#transaction-history",
            popover: {
              title: "Transaction History",
              description: "View the transaction history.",
            },
          },
          {
            popover: {
              title: "Happy Testing!",
              description: "That's all. Start testing your program!",
            },
          },
        ],
      }),
    []
  );

  const showTour = useCallback(() => {
    driverObj.drive();
  }, [driverObj]);

  return {
    showTour,
  };
};

export default useTour;
