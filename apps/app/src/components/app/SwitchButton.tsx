import React from 'react';

const SwitchButton = ({ selected, onChange }: any) => {
  return (
    <div
      className={`${
        selected
          ? 'w-[35px] h-[19px] bg-teal-800 cursor-pointer select-none rounded-[30px] px-0.5 relative'
          : 'w-[35px] h-[19px] bg-gray-200 dark:bg-black-200 cursor-pointer select-none rounded-[30px] px-0.5 relative'
      } relative`}
      onClick={onChange}
    >
      <div
        className={` flex items-center justify-center h-[80%] w-[5px]  min-w-[unset] p-2  font-bold cursor-pointer bg-white text-white rounded-full shadow-md border border-transparent transition ease duration-300 absolute left-4 ${
          selected ? '' : 'bg-white left-0.5'
        } `}
      ></div>
    </div>
  );
};

export default SwitchButton;
