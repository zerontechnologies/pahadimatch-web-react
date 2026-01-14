import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Crown } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { MatchCategoryInfo } from '@/types';

interface MatchCategoryCardProps {
  category: MatchCategoryInfo;
  count?: number;
  index?: number;
}

export function MatchCategoryCard({ category, count = 0, index = 0 }: MatchCategoryCardProps) {
  // Safely get icon component, fallback to Heart if not found
  const getIconComponent = () => {
    if (!category.icon) return Icons.Heart;
    const IconName = category.icon as keyof typeof Icons;
    return Icons[IconName] || Icons.Heart;
  };
  const IconComponent = getIconComponent();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/matches/${category.id}`}
        className={cn(
          'group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200',
          'hover:border-primary-200 hover:shadow-md hover:bg-primary-50/30',
          category.isPremium
            ? 'bg-gradient-to-r from-accent-50/50 to-primary-50/50 border-accent-200'
            : 'bg-surface border-border'
        )}
      >
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
          category.isPremium
            ? 'bg-gradient-to-br from-accent to-primary text-white'
            : 'bg-primary-50 text-primary group-hover:bg-primary group-hover:text-white transition-colors'
        )}>
          <IconComponent className="w-6 h-6" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-text group-hover:text-primary transition-colors">
              {category.name}
            </h3>
            {category.isPremium && (
              <Badge variant="gold" className="text-xs">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
          <p className="text-sm text-text-muted truncate">{category.description}</p>
        </div>

        <div className="flex items-center gap-3">
          {count > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-primary-100 text-primary text-sm font-medium">
              {count > 99 ? '99+' : count}
            </span>
          )}
          <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
        </div>
      </Link>
    </motion.div>
  );
}

