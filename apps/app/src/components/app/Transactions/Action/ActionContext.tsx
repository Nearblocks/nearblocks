import React, { createContext, ReactNode, useContext, useState } from 'react';

type ActionContextType = {
  address: string;
  handleMouseLeave: () => void;
  onHandleMouseOver: (e: React.MouseEvent<HTMLElement>, id: string) => void;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
};

const ActionContext = createContext<ActionContextType | undefined>(undefined);

export const ActionProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string>('');

  const onHandleMouseOver = (e: React.MouseEvent<HTMLElement>, id: string) => {
    e.preventDefault();
    setAddress(id);
  };

  const handleMouseLeave = () => {
    setAddress('');
  };

  return (
    <ActionContext.Provider
      value={{ address, handleMouseLeave, onHandleMouseOver, setAddress }}
    >
      {children}
    </ActionContext.Provider>
  );
};

export const useActionContext = () => {
  const context = useContext(ActionContext);
  if (!context) {
    throw new Error('useActionContext must be used within an ActionProvider');
  }
  return context;
};
