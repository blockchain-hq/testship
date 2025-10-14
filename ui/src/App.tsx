import { useEffect, useState } from "react";
import { type Idl } from "@coral-xyz/anchor";
import "./App.css";

function App() {
  const [idl, setIdl] = useState<Idl | null>(null);

  const fetchIdl = async () => {
    const response = await fetch("http://localhost:3000/api/idl");
    const data = await response.json();
    setIdl(data);
  };

  useEffect(() => {
    console.log(idl);
  }, [idl]);

  useEffect(() => {
    fetchIdl();
  }, []);

  return (
    <>
      <div>
        {idl ? (
          <div>
            <h1>{idl.metadata.name}</h1>
            <p>{idl.metadata.description}</p>

            <ul>
              {idl.instructions.map((i) => (
                <li>
                  {i.name} - {i.args.map((a) => a.name)}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </>
  );
}

export default App;
