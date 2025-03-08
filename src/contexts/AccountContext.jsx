import { createContext, React, useState } from "react";

export const AccountContext = createContext();

export const AccountProvider = ({ children }) => {
  const [selectedAccount, setSelectedAccount] = useState({});
  return (
    <AccountContext.Provider value={{ selectedAccount, setSelectedAccount }}>
      {children}
    </AccountContext.Provider>
  );
};
