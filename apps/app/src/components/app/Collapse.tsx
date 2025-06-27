import React, { ReactNode, useState } from 'react';

interface CollapseProps {
  children: ReactNode;
  trigger: ({
    onClick,
    show,
  }: {
    onClick: React.MouseEventHandler<HTMLDivElement>;
    show: boolean;
  }) => React.ReactNode;
}

const Collapse = ({ children, trigger }: CollapseProps) => {
  const [show, setShow] = useState(false);

  const onClick = () => {
    setShow((s) => !s);
  };

  return (
    <>
      {trigger({ onClick, show })}
      <div
        className={`transition-all overflow-hidden ${
          show ? 'block' : 'hidden'
        }`}
      >
        {children}
      </div>
    </>
  );
};

export default Collapse;
