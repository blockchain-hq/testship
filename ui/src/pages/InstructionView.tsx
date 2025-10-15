import React from 'react';

export const InstructionView: React.FC = () => {
  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Instruction Testing
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-lg font-semibold mb-4">Instruction Form</h2>
            <p className="text-gray-600 mb-4">
              Configure and test your Anchor program instructions here.
            </p>
            {/* InstructionForm component will be rendered here */}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-lg font-semibold mb-4">Results & Logs</h2>
            <p className="text-gray-600 mb-4">
              View execution results and detailed logs.
            </p>
            {/* LogsPanel component will be rendered here */}
          </div>
        </div>
      </div>
    </div>
  );
};
