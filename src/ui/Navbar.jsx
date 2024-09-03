import React from 'react';
import { RxHamburgerMenu } from "react-icons/rx";
import { IoMdUnlock } from "react-icons/io";
import { PiHandPalmBold } from "react-icons/pi";
import { IoMdSquareOutline } from "react-icons/io";
import { FaArrowPointer } from "react-icons/fa6";
import { LuDiamond } from "react-icons/lu";
import { FaRegCircle } from "react-icons/fa";
import { FaArrowRightLong } from "react-icons/fa6";
import { GoPencil } from "react-icons/go";
import { CiEraser } from "react-icons/ci";
import { RiGalleryFill } from "react-icons/ri";
import { TbTypography } from "react-icons/tb";
import { BsEraserFill } from "react-icons/bs";

const Navbar = ({ onToolSelect, selectedTool }) => {
  const tools = [
    { name: 'select', icon: FaArrowPointer },
    { name: 'rectangle', icon: IoMdSquareOutline },
    { name: 'diamond', icon: LuDiamond },
    { name: 'circle', icon: FaRegCircle },
    { name: 'arrow', icon: FaArrowRightLong },
    { name: 'line', icon: FaArrowRightLong },
    { name: 'pencil', icon: GoPencil },
    { name: 'text', icon: TbTypography },
    { name: 'image', icon: RiGalleryFill },
    { name: 'eraser', icon: BsEraserFill },
  ];

  return (
    <div className='p-4 bg-white shadow-md'>
      <div className='max-w-7xl mx-auto flex justify-between items-center'>
        <button className='p-2 rounded-lg border border-gray-300'>
          <RxHamburgerMenu />
        </button>
        
        <div className='flex space-x-2'>
          {tools.map((tool) => (
            <button
              key={tool.name}
              onClick={() => onToolSelect(tool.name)}
              className={`p-2 rounded-lg ${selectedTool === tool.name ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            >
              <tool.icon />
            </button>
          ))}
        </div>
        
        <button className='p-2 rounded-lg border border-gray-300'>
          <IoMdUnlock />
        </button>
      </div>
    </div>
  );
};

export default Navbar;