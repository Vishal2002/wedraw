import React, { useLayoutEffect, useState, useRef,useCallback } from 'react';
import rough from 'roughjs/bundled/rough.esm.js';
import Sidebar from './Sidebar';
const gen = rough.generator();

function createElement(id, x1, y1, x2, y2, shape) {
  switch (shape) {
    case 'line':
      return { id, x1, y1, x2, y2, shape, roughEle: gen.line(x1, y1, x2, y2) };
    case 'rectangle':
      return { id, x1, y1, x2, y2, shape, roughEle: gen.rectangle(x1, y1, x2 - x1, y2 - y1) };
    case 'circle':
      const radius = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) / 2;
      const centerX = (x1 + x2) / 2;
      const centerY = (y1 + y2) / 2;
      return { id, x1, y1, x2, y2, shape, roughEle: gen.circle(centerX, centerY, radius * 2) };
    case 'arrow':
      return { id, x1, y1, x2, y2, shape, roughEle: gen.line(x1, y1, x2, y2, { arrow: true }) };
    case 'diamond':
      return { id, x1, y1, x2, y2, shape, roughEle: gen.polygon([[x1, (y1 + y2) / 2], [(x1 + x2) / 2, y1], [x2, (y1 + y2) / 2], [(x1 + x2) / 2, y2]]) };
    default:
      return null;
  }
}

const nearPoint = (x, y, x1, y1, name) => {
  return Math.abs(x - x1) < 5 && Math.abs(y - y1) < 5 ? name : null;
};

const positionWithinElement = (x, y, element) => {
  const { shape, x1, x2, y1, y2 } = element;
  if (shape === 'rectangle') {
    const topLeft = nearPoint(x, y, x1, y1, 'tl');
    const topRight = nearPoint(x, y, x2, y1, 'tr');
    const bottomLeft = nearPoint(x, y, x1, y2, 'bl');
    const bottomRight = nearPoint(x, y, x2, y2, 'br');
    const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? 'inside' : null;
    return topLeft || topRight || bottomLeft || bottomRight || inside;
  } else {
    const a = { x: x1, y: y1 };
    const b = { x: x2, y: y2 };
    const c = { x, y };
    const offset = distance(a, b) - (distance(a, c) + distance(b, c));
    const start = nearPoint(x, y, x1, y1, 'start');
    const end = nearPoint(x, y, x2, y2, 'end');
    const inside = Math.abs(offset) < 1 ? 'inside' : null;
    return start || end || inside;
  }
};

const distance = (a, b) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

const getElementAtPosition = (x, y, elements) => {
  return elements
    .map(element => ({ ...element, position: positionWithinElement(x, y, element) }))
    .find(element => element.position !== null);
};

const adjustElementCoordinates = element => {
  const { shape, x1, y1, x2, y2 } = element;
  if (shape === 'rectangle') {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    return { x1: minX, y1: minY, x2: maxX, y2: maxY };
  } else {
    if (x1 < x2 || (x1 === x2 && y1 < y2)) {
      return { x1, y1, x2, y2 };
    } else {
      return { x1: x2, y1: y2, x2: x1, y2: y1 };
    }
  }
};

const cursorForPosition = position => {
  switch (position) {
    case 'tl':
    case 'br':
    case 'start':
    case 'end':
      return 'nwse-resize';
    case 'tr':
    case 'bl':
      return 'nesw-resize';
    default:
      return 'move';
  }
};

const resizedCoordinates = (clientX, clientY, position, coordinates) => {
  const { x1, y1, x2, y2 } = coordinates;
  switch (position) {
    case 'tl':
    case 'start':
      return { x1: clientX, y1: clientY, x2, y2 };
    case 'tr':
      return { x1, y1: clientY, x2: clientX, y2 };
    case 'bl':
      return { x1: clientX, y1, x2, y2: clientY };
    case 'br':
    case 'end':
      return { x1, y1, x2: clientX, y2: clientY };
    default:
      return null;
  }
};

const useHistory = initialState => {
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState([initialState]);

  const setState = (action, overwrite = false) => {
    const newState = typeof action === 'function' ? action(history[index]) : action;
    if (overwrite) {
      const historyCopy = [...history];
      historyCopy[index] = newState;
      setHistory(historyCopy);
    } else {
      const updatedState = [...history].slice(0, index + 1);
      setHistory([...updatedState, newState]);
      setIndex(prevState => prevState + 1);
    }
  };

  const undo = () => index > 0 && setIndex(prevState => prevState - 1);
  const redo = () => index < history.length - 1 && setIndex(prevState => prevState + 1);

  return [history[index], setState, undo, redo];
};

const DrawingTool = ({ selectedShape }) => {
  const [elements, setElements, undo, redo] = useHistory([]);
  const [action, setAction] = useState('none');
  const [selectedElement, setSelectedElement] = useState(null);
  const [tool, setTool] = useState('none');
  const canvasRef = useRef(null);
  const handleKeyDown = useCallback((event) => {
    if (event.ctrlKey) {
      if (event.key === 'z') {
        undo();
      } else if (event.key === 'y') {
        redo();
      }
    }
  }, [undo, redo]);

  useLayoutEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rc = rough.canvas(canvas);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    elements.forEach(element => {
      rc.draw(element.roughEle);
    });
  }, [elements]);

  const updateElement = (id, x1, y1, x2, y2, shape) => {
    const updatedElement = createElement(id, x1, y1, x2, y2, shape);
    const elementsCopy = [...elements];
    elementsCopy[id] = updatedElement;
    setElements(elementsCopy, true);
  };

  const handleMouseDown = event => {
    const { clientX, clientY } = event;
    if (selectedShape !== 'select') {
      const id = elements.length;
      const element = createElement(id, clientX, clientY, clientX, clientY, selectedShape);
      setElements(prevState => [...prevState, element]);
      setSelectedElement(element);
      setAction('drawing');
    } else {
      const element = getElementAtPosition(clientX, clientY, elements);
      if (element) {
        setSelectedElement(element);
        setAction('moving');
      } else {
        setSelectedElement(null);
      }
    }
  };

  const handleMouseMove = event => {
    const { clientX, clientY } = event;

    if (action === 'drawing') {
      const index = elements.length - 1;
      const { x1, y1 } = elements[index];
      updateElement(index, x1, y1, clientX, clientY, selectedShape);
    } else if (action === 'moving') {
      const { id, x1, x2, y1, y2, shape, position } = selectedElement;
      if (position === 'inside') {
        const dx = clientX - (x1 + x2) / 2;
        const dy = clientY - (y1 + y2) / 2;
        updateElement(id, x1 + dx, y1 + dy, x2 + dx, y2 + dy, shape);
      } else {
        const { x1: newX1, y1: newY1, x2: newX2, y2: newY2 } = resizedCoordinates(clientX, clientY, position, { x1, y1, x2, y2 });
        updateElement(id, newX1, newY1, newX2, newY2, shape);
      }
    }
  };

  const handleMouseUp = () => {
    if (selectedElement) {
      const index = selectedElement.id;
      const { id, shape } = elements[index];
      const { x1, y1, x2, y2 } = adjustElementCoordinates(elements[index]);
      updateElement(id, x1, y1, x2, y2, shape);
    }
    setAction('none');
  };

  return (
    <>
      <div className='flex'>
      
        <canvas
          ref={canvasRef}
          width={window.innerWidth}
          height={window.innerHeight - 64}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ cursor: action === 'moving' ? cursorForPosition(selectedElement?.position) : 'crosshair' }}
        />
          {selectedElement && (
          <Sidebar selectedElement={selectedElement} updateElement={updateElement} />
        )}
      </div>
    </>
  );
};

export default DrawingTool;