import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useUIStore } from '@store/uiStore';

const Layout = () => {
  const { isSidebarOpen } = useUIStore();

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="w-80 border-r border-gray-200 bg-white">
          <Sidebar />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;

