import { useEffect, useState } from "react";
import { type Idl } from "@coral-xyz/anchor";

const UseIdl = () => {
  const [idl, setIdl] = useState<Idl | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchIdl = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:3000/api/idl");
      const data = await response.json();

      setIdl(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const hasHash = window.location.hash.includes("#status=");

    if (!hasHash) {
      fetchIdl();
    } else {
      setLoading(false);
    }
  }, []);

  return {
    idl,
    error,
    isLoading: loading,
    fetchIdl,
    setIdl,
  };
};

export default UseIdl;
