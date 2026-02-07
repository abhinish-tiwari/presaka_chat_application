import { useState } from 'react';
import { PageTransition } from '@components/PageTransition';
import {
  Skeleton,
  ChatListSkeleton,
  MessageListSkeleton,
  UserSearchListSkeleton,
  ProfileSkeleton,
  CardSkeleton,
  Spinner,
  SpinnerCenter,
  Card,
  Button,
} from '@components/ui';

const SkeletonShowcase = () => {
  const [showSkeletons, setShowSkeletons] = useState(true);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Skeleton Loaders Showcase
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Beautiful loading states with shimmer animations
              </p>
            </div>
            <Button onClick={() => setShowSkeletons(!showSkeletons)}>
              {showSkeletons ? 'Hide Skeletons' : 'Show Skeletons'}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Skeletons */}
            <Card>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Basic Skeletons
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Text (single line)</p>
                  <Skeleton variant="text" width="80%" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Text (multiple lines)</p>
                  <Skeleton variant="text" lines={3} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Circular</p>
                  <Skeleton variant="circular" width={64} height={64} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Rounded</p>
                  <Skeleton variant="rounded" height={100} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Rectangular</p>
                  <Skeleton variant="rectangular" height={80} />
                </div>
              </div>
            </Card>

            {/* Spinners */}
            <Card>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Spinners
              </h2>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Sizes</p>
                  <div className="flex items-center gap-4">
                    <Spinner size="xs" />
                    <Spinner size="sm" />
                    <Spinner size="md" />
                    <Spinner size="lg" />
                    <Spinner size="xl" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">With Label</p>
                  <Spinner size="md" label="Loading..." />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Centered</p>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                    <SpinnerCenter label="Loading content..." size="md" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Chat List Skeleton */}
            <Card>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Chat List Skeleton
              </h2>
              {showSkeletons && <ChatListSkeleton count={4} />}
            </Card>

            {/* Message List Skeleton */}
            <Card>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Message List Skeleton
              </h2>
              {showSkeletons && <MessageListSkeleton count={4} />}
            </Card>

            {/* User Search Skeleton */}
            <Card>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                User Search Skeleton
              </h2>
              {showSkeletons && <UserSearchListSkeleton count={3} />}
            </Card>

            {/* Profile Skeleton */}
            <Card>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Profile Skeleton
              </h2>
              {showSkeletons && <ProfileSkeleton />}
            </Card>

            {/* Card Skeleton */}
            <Card>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Card Content Skeleton
              </h2>
              {showSkeletons && <CardSkeleton />}
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default SkeletonShowcase;

