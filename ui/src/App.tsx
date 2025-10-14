import "./App.css";
import InstructionForm from "./components/instruction-form";
import UseIdl from "./hooks/use-idl";

function App() {
  const { idl } = UseIdl();

  return (
    <>
      <div>
        {idl ? (
          <div>
            <h1>{idl.metadata.name}</h1>
            <p>{idl.metadata.description}</p>

            <div className="flex flex-col justify-center items-center gap-4">
              {idl.instructions.map((instruction) => (
                <div key={instruction.name}>
                  <InstructionForm instruction={instruction} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </>
  );
}

export default App;
