import { motion } from 'framer-motion';
import { Card, Button } from '@components/ui';
import { ThemeToggle } from '@components/ThemeToggle';
import { PageTransition } from '@components/PageTransition';
import { staggerContainer, staggerItem } from '@/utils/animations';
import { useAppDispatch } from '@store/hooks';
import { openNewChatModal } from '@store/uiStore';

const HomePage = () => {
  const dispatch = useAppDispatch();
  
  const steps = [
    {
      icon: '🔍',
      title: 'Find Contacts',
      description: 'Search for friends by their phone number to start a secure chat.',
      color: 'blue'
    },
    {
      icon: '💬',
      title: 'Real-time Chat',
      description: 'Experience instant delivery with typing indicators and read receipts.',
      color: 'indigo'
    },
    {
      icon: '🎨',
      title: 'Choose Style',
      description: 'Switch between light and dark modes to suit your workspace.',
      color: 'purple'
    },
  ];

  return (
    <PageTransition>
      <div className="flex flex-col items-center justify-center min-h-screen h-full bg-transparent p-6 relative overflow-hidden">
        {/* Floating Theme Toggle */}
        <div className="absolute top-6 right-6 z-20">
          <ThemeToggle />
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-500/10 dark:bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl w-full relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 mb-6 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 p-4">
              <svg
                className="w-full h-full text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>

            <h2 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Preṣaka</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-xl max-w-xl mx-auto leading-relaxed">
              Connectivity, simplified. Select an existing conversation or start a new one to begin.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {steps.map((step, index) => (
              <motion.div key={index} variants={staggerItem}>
                <Card
                  variant="bordered"
                  padding="lg"
                  className="h-full bg-white/50 dark:bg-gray-800/40 backdrop-blur-md border-gray-100 dark:border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 group"
                >
                  <div className="text-3xl mb-4 bg-gray-50 dark:bg-gray-800 w-12 h-12 flex items-center justify-center rounded-xl group-hover:scale-110 transition-transform">
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              variant="primary"
              size="lg"
              onClick={() => dispatch(openNewChatModal())}
              className="px-12 py-7 text-xl rounded-[2rem] shadow-blue-500/30 shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300"
            >
              Start New Conversation
            </Button>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default HomePage;
