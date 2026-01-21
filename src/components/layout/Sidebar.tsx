import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Search, 
  Heart, 
  MessageSquare, 
  Users, 
  User, 
  Settings,
  Crown,
  Image,
  Star,
  Bookmark,
  Sparkles,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsMobileMenuOpen, setMobileMenuOpen } from '@/store/slices/uiSlice';
import { useGetMembershipSummaryQuery } from '@/store/api/membershipApi';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Search', path: '/search', icon: Search },
  { label: 'Matches', path: '/matches', icon: Heart },
  { label: 'Messages', path: '/chat', icon: MessageSquare },
  { label: 'Activity', path: '/activity', icon: Users },
];

const matchCategories: NavItem[] = [
  { label: 'New Matches', path: '/matches/new_matches', icon: Sparkles },
  { label: 'Preferred', path: '/matches/preferred_matches', icon: Star },
  { label: 'Shortlisted', path: '/matches/shortlisted_profiles', icon: Bookmark },
];

const accountItems: NavItem[] = [
  { label: 'My Profile', path: '/profile', icon: User },
  { label: 'Photos', path: '/photos', icon: Image },
  { label: 'Membership', path: '/membership', icon: Crown },
  { label: 'Settings', path: '/settings', icon: Settings },
];

function NavSection({ title, items }: { title?: string; items: NavItem[] }) {
  const dispatch = useAppDispatch();
  
  return (
    <div className="space-y-1">
      {title && (
        <h3 className="px-4 text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
          {title}
        </h3>
      )}
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          onClick={() => dispatch(setMobileMenuOpen(false))}
          end={item.path === '/profile'} // Only match exactly for /profile, not /profile/:id
          className={({ isActive }) => cn(
            'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
            isActive
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'text-text-secondary hover:bg-champagne hover:text-text'
          )}
        >
          <item.icon className="w-5 h-5" />
          <span>{item.label}</span>
          {item.badge && item.badge > 0 && (
            <span className="ml-auto px-2 py-0.5 rounded-full bg-error text-white text-xs">
              {item.badge}
            </span>
          )}
        </NavLink>
      ))}
    </div>
  );
}

export function Sidebar() {
  const dispatch = useAppDispatch();
  const isMobileMenuOpen = useAppSelector(selectIsMobileMenuOpen);
  const { data: membership } = useGetMembershipSummaryQuery();
  const isPremium = membership?.data?.isPremium || false;

  const sidebarContent = (
    <div className="flex flex-col h-full py-4 overflow-y-auto">
      {/* Main Navigation */}
      <nav className="flex-1 px-3 space-y-6">
        <NavSection items={mainNavItems} />
        <NavSection title="Quick Access" items={matchCategories} />
        <NavSection title="Account" items={accountItems} />
      </nav>

      {/* Premium CTA - Only show for non-premium users */}
      {!isPremium && (
        <div className="px-4 mt-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary-50 to-accent-50 border border-primary-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-text">Go Premium</p>
                <p className="text-xs text-text-secondary">Unlock all features</p>
              </div>
            </div>
            <NavLink
              to="/membership"
              onClick={() => dispatch(setMobileMenuOpen(false))}
              className="block w-full py-2 px-4 text-center text-sm font-medium text-white bg-gradient-to-r from-primary to-accent rounded-lg hover:opacity-90 transition-opacity"
            >
              Upgrade Now
            </NavLink>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16 border-r border-border bg-surface">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => dispatch(setMobileMenuOpen(false))}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            />
            
            {/* Sidebar */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-surface lg:hidden shadow-xl"
            >
              {/* Close Button */}
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => dispatch(setMobileMenuOpen(false))}
                  className="p-2 rounded-lg hover:bg-champagne text-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Logo */}
              <div className="p-4 border-b border-border">
                <span className="font-script text-3xl text-primary">PahadiMatch</span>
              </div>
              
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

