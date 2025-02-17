import { Home, Calendar, Bell, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

export function Navigation() {
  const router = useRouter();
  const currentPath = router.pathname;

  const isActive = (path: string) => currentPath === path;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/upcoming', icon: Calendar, label: 'Upcoming' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
    { path: '/search', icon: Search, label: 'Search' },
  ];

  return (
    <motion.nav 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 sm:bottom-auto sm:top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border-t sm:border-t-0 sm:border-b border-gray-200/50 dark:border-gray-700/50 supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-800/60"
    >
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex items-center justify-around sm:justify-start h-16 gap-1 sm:gap-2">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              href={path}
              className="relative group"
            >
              <motion.div
                className={`flex flex-col sm:flex-row items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive(path)
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-900/30'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-700/50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive(path) ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="text-xs sm:text-sm font-medium tracking-wide">{label}</span>
                {isActive(path) && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500 dark:bg-blue-400 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </motion.nav>
  );
}