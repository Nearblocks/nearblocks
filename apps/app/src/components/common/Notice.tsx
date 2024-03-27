import React from 'react';

const Notice = () => {
  return (
    <div className="flex flex-wrap">
      <div className="flex items-center justify-center text-center w-full  border-b-2 border-nearblue bg-nearblue py-2 text-green text-sm ">
        This blockchain explorer is out of sync. Some charts may be delayed.
      </div>
    </div>
  );
};
export default Notice;
