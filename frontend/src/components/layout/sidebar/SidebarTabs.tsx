import { motion } from 'framer-motion';

type TabType = 'chats' | 'status' | 'settings';

interface SidebarTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TABS = [
  {
    id: 'chats',
    label: 'Chats',
    icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
  },
  {
    id: 'status',
    label: 'Status',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
  },
];

const SidebarTabs = ({ activeTab, onTabChange }: SidebarTabsProps) => {
  return (
    <div className="flex px-2 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id as TabType)}
          className={`flex-1 py-3 px-1 text-[11px] font-semibold transition-all relative flex flex-col items-center gap-1.5 group ${
            activeTab === tab.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <div
            className={`p-1.5 rounded-lg transition-colors ${
              activeTab === tab.id ? 'bg-blue-50 dark:bg-blue-900/20' : 'group-hover:bg-gray-50 dark:group-hover:bg-gray-800'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
            </svg>
          </div>
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full shadow-[0_-1px_4px_rgba(37,99,235,0.4)]"
            />
          )}
        </button>
      ))}
    </div>
  );
};

export default SidebarTabs;
