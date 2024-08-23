import React, { ReactNode, useState } from 'react';

interface CollapseProps {
  children: ReactNode;
  trigger: ({
    show,
    onClick,
  }: {
    show: boolean;
    onClick: React.MouseEventHandler<HTMLAnchorElement>;
  }) => React.ReactNode;
}

const Collapse = ({ children, trigger }: CollapseProps) => {
  const [show, setShow] = useState(false);

  const onClick = () => {
    setShow((s) => !s);
  };

  return (
    <>
      {trigger({ show, onClick })}
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
