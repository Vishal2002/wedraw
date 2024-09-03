import React from 'react';

const Sidebar = ({ selectedElement, updateElement }) => {
  if (!selectedElement) return null;

  const handleStrokeChange = (color) => {
    updateElement(selectedElement.id, { ...selectedElement, strokeColor: color });
  };

  const handleStrokeWidthChange = (width) => {
    updateElement(selectedElement.id, { ...selectedElement, strokeWidth: width });
  };

  return (
    <div className="sidebar" style={{ position: 'absolute', right: 0, top: 64, width: 200, padding: 10, backgroundColor: '#f0f0f0' }}>
      <h3>Element Properties</h3>
      <div>
        <label>Stroke Color:</label>
        <input type="color" value={selectedElement.strokeColor || '#000000'} onChange={(e) => handleStrokeChange(e.target.value)} />
      </div>
      <div>
        <label>Stroke Width:</label>
        <input type="range" min="1" max="20" value={selectedElement.strokeWidth || 1} onChange={(e) => handleStrokeWidthChange(e.target.value)} />
      </div>
    </div>
  );
};

export default Sidebar;