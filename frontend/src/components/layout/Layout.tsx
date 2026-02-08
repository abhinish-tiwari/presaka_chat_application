import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './sidebar/Sidebar';

const Layout = () => {
  const location = useLocation();
  const isChatOpen = location.pathname.startsWith('/chat/');

  return (
    <div className="flex h-screen bg-white dark:bg-gray-950 overflow-hidden transition-colors duration-300">
      {/* Sidebar - Hidden on mobile if a chat is open */}
      <div className={`
        ${isChatOpen ? 'hidden md:flex' : 'flex'} 
        w-full md:w-80 lg:w-96 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0 z-20
      `}>
        <Sidebar />
      </div>

      {/* Main Content Area - Shown on mobile if a chat is open, or always on desktop */}
      <main className={`
        ${isChatOpen ? 'flex' : 'hidden md:flex'} 
        flex-1 relative overflow-hidden
      `}>
        {/* Background Pattern Layer */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none z-0" 
             style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        
        <div className="relative z-10 w-full h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
