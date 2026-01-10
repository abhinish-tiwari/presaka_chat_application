import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Left Sidebar - Chat List */}
      <div className="w-full md:w-96 border-r border-gray-300 bg-white flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content - Chat Messages */}
      <div className="flex-1 flex flex-col bg-[#efeae2]">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;

