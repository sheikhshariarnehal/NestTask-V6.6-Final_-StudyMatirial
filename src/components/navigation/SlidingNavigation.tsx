import { useState, memo, useCallback } from 'react';
import { 
  Home, Calendar, Bell, Search, X, Settings, Users, LogOut,
  User, ChevronRight, BarChart2, CheckCircle2, Clock, AlertCircle,
  HelpCircle, Share2, Download, Star, Book, FileText, File, Notebook,
  GraduationCap, ShieldCheck, FolderPlus, BookPlus, BookOpen, Sun, Moon
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import type { NavPage } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { StudyMaterialsModal } from '../study-materials/StudyMaterialsModal';
import { useCourses } from '../../hooks/useCourses';

interface SlidingNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  activePage: NavPage;
  onPageChange: (page: NavPage) => void;
  onLogout: () => void;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  taskStats: {
    total: number;
    inProgress: number;
    completed: number;
    overdue: number;
  };
}

const NavItem = memo(({ item, isActive, onClick, showSubmenu, onSubmenuToggle }) => (
  <motion.button
    onClick={() => item.hasSubmenu ? onSubmenuToggle() : onClick()}
    whileHover={{ scale: 1.02, x: 2 }}
    whileTap={{ scale: 0.98 }}
    className={`
      w-full px-3 py-2 rounded-lg flex items-center justify-between
      transition-all duration-200 ease-in-out text-sm
      group relative overflow-hidden
      ${isActive 
        ? 'bg-gradient-to-r from-blue-50/90 to-blue-100/90 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-600 dark:text-blue-400 shadow-sm' 
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/40'
      }
    `}
  >
    <div className="flex items-center gap-2.5 relative z-10">
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: isActive ? 360 : 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <item.icon className={`w-4 h-4 transition-all duration-200 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'group-hover:text-blue-500 dark:group-hover:text-blue-400'}`} />
      </motion.div>
      <span className="font-medium tracking-wide">{item.label}</span>
    </div>
    {item.hasSubmenu && (
      <motion.div
        animate={{ rotate: showSubmenu ? 90 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
      </motion.div>
    )}
  </motion.button>
));

export const SlidingNavigation = memo(function SlidingNavigation({ 
  isOpen, 
  onClose, 
  activePage, 
  onPageChange,
  onLogout,
  user,
  taskStats
}: SlidingNavigationProps) {
  const { isDark, toggle } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showStudyMaterials, setShowStudyMaterials] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);
  const { materials } = useCourses();

  const navItems = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'upcoming' as const, label: 'Upcoming', icon: Calendar },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'search' as const, label: 'Search', icon: Search },
    { id: 'study-materials' as const, label: 'Study Materials', icon: BookOpen },
    { id: 'courses' as const, label: 'Courses', icon: GraduationCap },
    { 
      id: 'admin' as const,
      icon: ShieldCheck,
      label: 'Admin Dashboard',
      hasSubmenu: true,
      adminOnly: true,
      submenuItems: [
        { icon: FolderPlus, label: 'Manage Study Materials' },
        { icon: BookPlus, label: 'Manage Courses' }
      ]
    }
  ];

  const handlePageChange = useCallback((page: NavPage) => {
    onPageChange(page);
    onClose();
  }, [onPageChange, onClose]);

  const handleStudyMaterialClick = useCallback((category: string) => {
    setSelectedCategory(category);
    setShowMaterialsModal(true);
    setShowStudyMaterials(false);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-[100]"
              onClick={onClose}
              style={{ contain: 'strict' }}
            />

            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed top-0 left-0 h-[100dvh] w-[85vw] sm:w-[300px] max-w-[320px] 
                bg-white/95 dark:bg-gray-900/95 shadow-2xl z-[101] flex flex-col overflow-hidden
                backdrop-blur-md backdrop-saturate-150
                border-r border-gray-200/50 dark:border-gray-800/50"
              style={{ 
                contain: 'content',
                willChange: 'transform'
              }}
            >
              <div className="flex-shrink-0 p-4 sm:p-5 bg-gradient-to-br from-blue-600/95 via-blue-500/95 to-indigo-600/95 backdrop-blur-sm shadow-lg" style={{ contain: 'content' }}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3.5">
                    {user.avatar ? (
                      <motion.img 
                        whileHover={{ scale: 1.05 }}
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-11 h-11 rounded-full border-2 border-white/80 shadow-lg
                          hover:border-white transition-all duration-300"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center 
                          shadow-lg hover:bg-white/30 transition-all duration-300"
                      >
                        <User className="w-5 h-5 text-white" />
                      </motion.div>
                    )}
                    <div className="min-w-0">
                      <h2 className="text-base font-semibold text-white overflow-hidden text-ellipsis 
                        whitespace-nowrap tracking-wide">{user.name}</h2>
                      <p className="text-xs text-blue-100/90 truncate font-medium">{user.email}</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="p-2 rounded-xl hover:bg-white/15 transition-colors duration-300
                      focus:outline-none focus:ring-2 focus:ring-white/30 active:bg-white/20"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5 text-white" />
                  </motion.button>
                </div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="mt-4 p-3.5 bg-gradient-to-br from-white/15 to-white/5 rounded-xl 
                    backdrop-blur-md border border-white/15 transition-all duration-300
                    hover:from-white/20 hover:to-white/10 hover:border-white/20"
                >
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <p className="text-sm text-blue-100/90 font-medium">Total Tasks</p>
                      <p className="text-2xl font-bold tracking-tight">{taskStats.total}</p>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowStats(!showStats)}
                      className={`
                        p-2 rounded-xl transition-all duration-300 
                        focus:outline-none focus:ring-2 focus:ring-white/30
                        ${showStats ? 'bg-white/25 hover:bg-white/30' : 'hover:bg-white/15'}
                      `}
                    >
                      <BarChart2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              </div>

              <div 
                className="flex-1 overflow-y-auto overscroll-contain
                  scrollbar-thin scrollbar-track-transparent
                  scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700
                  hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-600
                  scrollbar-thumb-rounded-full"
                style={{ contain: 'strict' }}
              >
                <AnimatePresence mode="wait">
                  {showStats && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden border-b border-gray-100 dark:border-gray-800"
                      style={{ contain: 'content' }}
                    >
                      <div className="p-4 grid grid-cols-3 gap-3">
                        {[
                          { icon: CheckCircle2, label: 'Completed', value: taskStats.completed, color: 'text-green-500' },
                          { icon: Clock, label: 'In Progress', value: taskStats.inProgress, color: 'text-blue-500' },
                          { icon: AlertCircle, label: 'Overdue', value: taskStats.overdue, color: 'text-red-500' }
                        ].map((stat) => (
                          <div 
                            key={stat.label} 
                            className="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
                          >
                            <div className="flex justify-center mb-1">
                              <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <p className="text-base font-semibold text-gray-900 dark:text-white">
                              {stat.value}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {stat.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <nav className="flex-1 px-2 py-3" style={{ contain: 'content' }}>
                  <ul className="space-y-1">
                    {navItems
                      .filter(item => !item.adminOnly || user.email === 'admin@example.com')
                      .map((item) => (
                        <li key={item.id}>
                          <NavItem
                            item={item}
                            isActive={activePage === item.id}
                            onClick={() => handlePageChange(item.id)}
                            showSubmenu={
                              (item.id === 'study' && showStudyMaterials) ||
                              (item.id === 'admin' && showAdminMenu)
                            }
                            onSubmenuToggle={() => {
                              if (item.id === 'study') {
                                setShowStudyMaterials(prev => !prev);
                              } else if (item.id === 'admin') {
                                setShowAdminMenu(prev => !prev);
                              }
                            }}
                          />
                        </li>
                    ))}
                  </ul>
                </nav>
              </div>

              <div className="flex-shrink-0 p-3 bg-gradient-to-b from-gray-50/95 to-gray-100/95 
                dark:from-gray-800/95 dark:to-gray-900/95
                border-t border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                      bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900
                      border border-gray-200/50 dark:border-gray-700/50
                      shadow-sm hover:shadow-md transition-all duration-200
                      group relative overflow-hidden
                      ${isDark ? 'text-amber-500' : 'text-indigo-500'}
                    `}
                    onClick={() => toggle()}
                  >
                    <div className="relative flex items-center gap-2">
                      {isDark ? (
                        <motion.div
                          initial={{ rotate: 0 }}
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                        >
                          <Sun className="w-4 h-4" />
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ rotate: 0 }}
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                        >
                          <Moon className="w-4 h-4" />
                        </motion.div>
                      )}
                      <span className="hidden sm:inline text-sm font-medium">
                        {isDark ? 'Light' : 'Dark'}
                      </span>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    className="
                      flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                      bg-gradient-to-b from-red-50 to-red-100/80 dark:from-red-900/30 dark:to-red-800/30
                      text-red-600 dark:text-red-400
                      border border-red-200/50 dark:border-red-700/50
                      shadow-sm hover:shadow-md transition-all duration-200
                      group relative overflow-hidden
                    "
                    onClick={onLogout}
                  >
                    <div className="relative flex items-center gap-2">
                      <motion.div
                        initial={{ x: 0 }}
                        whileHover={{ x: -2 }}
                        transition={{ duration: 0.2 }}
                      >
                        <LogOut className="w-4 h-4 transition-transform group-hover:scale-110" />
                      </motion.div>
                      <span className="hidden sm:inline text-sm font-medium">
                        Logout
                      </span>
                    </div>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <StudyMaterialsModal
        isOpen={showMaterialsModal}
        onClose={() => setShowMaterialsModal(false)}
        category={selectedCategory}
        materials={materials?.filter(m => 
          m.category.toLowerCase() === selectedCategory.toLowerCase()
        )}
      />
    </>
  );
});