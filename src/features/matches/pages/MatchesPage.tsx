import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { MatchCategoryCard } from '../components/MatchCategoryCard';
import { MATCH_CATEGORIES } from '@/types';
import { useGetMatchCategoryCountsQuery } from '@/store/api/matchApi';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function MatchesPage() {
  // Single API call to get all category counts
  const { data: countsData, isLoading, error } = useGetMatchCategoryCountsQuery();

  // Transform the API response into a map for easy lookup
  const categoryCounts = useMemo(() => {
    if (!countsData?.data) return {};
    
    const countsMap: Record<string, number> = {};
    countsData.data.forEach((item) => {
      countsMap[item.category] = item.count;
    });
    
    return countsMap;
  }, [countsData]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 py-2"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-semibold text-text flex items-center gap-3">
            <Heart className="w-8 h-8 text-primary" />
            Your Matches
          </h1>
          <p className="text-text-secondary mt-1">
            Explore profiles that match your preferences
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MATCH_CATEGORIES.map((_, index) => (
            <div
              key={index}
              className="p-4 rounded-xl border border-border bg-surface"
            >
              <Skeleton className="h-12 w-12 rounded-xl mb-4" />
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-48 mb-3" />
              <Skeleton className="h-6 w-16 ml-auto" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-6 rounded-xl border border-error/20 bg-error/10 text-center">
          <p className="text-error font-medium mb-2">Failed to load match categories</p>
          <p className="text-sm text-text-secondary">
            Please refresh the page or try again later
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MATCH_CATEGORIES.map((category, index) => (
            <MatchCategoryCard
              key={category.id}
              category={category}
              count={categoryCounts[category.id] || 0}
              index={index}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

