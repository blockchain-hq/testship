import { useState } from "react";

const getHasVisitedFromLocalStorage = () =>
  localStorage.getItem("hasVisited") === "true";
const setHasVisitedToLocalStorage = () =>
  localStorage.setItem("hasVisited", "true");

const useHasVisited = () => {
  const [hasVisited, setHasVisited] = useState(getHasVisitedFromLocalStorage());

  const handleVisit = () => {
    setHasVisited(true);
    setHasVisitedToLocalStorage();
  };

  return {
    hasVisited,
    handleVisit,
  };
};

export default useHasVisited;
