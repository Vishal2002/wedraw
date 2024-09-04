import React, { useState } from 'react';
import DrawingTool from './component/Drawingtool';
import Penciltool from './component/Penciltool';
import Navbar from './ui/Navbar';
import Sidebar from './component/Sidebar';


const App = () => {
  const [selectedTool, setSelectedTool] = useState('select');

  const handleToolSelect = (tool) => {
    setSelectedTool(tool);
  };

  return (
    <div className="h-screen flex flex-col">
      <Navbar onToolSelect={handleToolSelect} selectedTool={selectedTool} />
      <div className="flex-grow">
        {selectedTool === 'pencil' ? (
          <Penciltool />
        ) : (
          <DrawingTool selectedShape={selectedTool} />
        )}
      </div>
    </div>
  );
};
export default App;