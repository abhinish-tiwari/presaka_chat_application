import { Avatar } from '@components/ui';
import { useAppSelector } from '@store/hooks';

const StatusTab = () => {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div className="px-6 py-8 text-center">
      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 mx-auto mb-6 flex items-center justify-center p-1 shadow-xl">
        <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden border-4 border-transparent bg-clip-padding">
          <Avatar alt={user?.name || ''} size="xl" className="rounded-full w-full h-full" />
        </div>
        <div className="absolute bottom-1 right-1 bg-blue-600 text-white rounded-full p-1.5 border-2 border-white dark:border-gray-900 shadow-md">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">My Status</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-[220px] mx-auto">
        Share what's on your mind with your contacts through stories.
      </p>

      <div className="text-left space-y-4 opacity-50 select-none grayscale cursor-not-allowed">
        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-2">Recent Updates</p>
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40">
          <div className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="h-2 w-16 bg-gray-100 dark:bg-gray-800 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusTab;
