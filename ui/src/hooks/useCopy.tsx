import { useState } from "react";

const UseCopy = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return {
    copied,
    handleCopy,
  };
};

export default UseCopy;
