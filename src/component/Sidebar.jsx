// In the Sidebar component
const Sidebar = ({ selectedElement, updateElement }) => {
  if (!selectedElement) return null;

  const handleStrokeChange = (color) => {
    updateElement(selectedElement.id, { ...selectedElement, strokeColor: color });
  };

  const handleStrokeWidthChange = (width) => {
    updateElement(selectedElement.id, { ...selectedElement, strokeWidth: width });
  };

  return (
    <div className="absolute right-0 top-16 w-50 p-2.5 bg-gray-200">
      <h3 className="text-lg font-bold">Element Properties</h3>
      <div className="mb-2">
        <label className="block font-medium">Stroke Color:</label>
        <input
          type="color"
          value={selectedElement.strokeColor || '#000000'}
          onChange={(e) => handleStrokeChange(e.target.value)}
          className="w-full"
        />
      </div>
      <div>
        <label className="block font-medium">Stroke Width:</label>
        <input
          type="range"
          min="1"
          max="20"
          value={selectedElement.strokeWidth || 1}
          onChange={(e) => handleStrokeWidthChange(e.target.value)}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default Sidebar;