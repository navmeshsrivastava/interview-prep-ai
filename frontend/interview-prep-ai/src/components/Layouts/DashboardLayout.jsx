import React, { Children, useContext } from 'react';
import { UserContext } from '../../context/userContext';
import Navbar from './Navbar';

const DashboardLayout = ({ children }) => {
  const { user } = useContext(UserContext);
  return (
    <div>
      <Navbar />

      {user && <div className="px-4 md:px-8">{children}</div>}
    </div>
  );
};

export default DashboardLayout;
