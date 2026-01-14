import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { MatchCategoryCard } from '../components/MatchCategoryCard';
import { MATCH_CATEGORIES } from '@/types';
import { useLazyGetMatchesByCategoryQuery } from '@/store/api/matchApi';
import { useEffect, useState } from 'react';

export function MatchesPage() {
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [getMatches] = useLazyGetMatchesByCategoryQuery();

  useEffect(() => {
    // Fetch counts for all categories
    const fetchCounts = async () => {
      const counts: Record<string, number> = {};
      
      await Promise.all(
        MATCH_CATEGORIES.map(async (category) => {
          try {
            const result = await getMatches({ category: category.id, limit: 1 }).unwrap();
            counts[category.id] = result.pagination?.total || 0;
          } catch {
            counts[category.id] = 0;
          }
        })
      );
      
      setCategoryCounts(counts);
    };

    fetchCounts();
  }, [getMatches]);

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
    </motion.div>
  );
}

