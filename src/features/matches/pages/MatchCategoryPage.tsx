import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Grid, List, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileCard } from '@/components/shared/ProfileCard';
import { ProfileCardSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { useGetMatchesByCategoryQuery } from '@/store/api/matchApi';
import { MATCH_CATEGORIES, type MatchCategory } from '@/types';
import { Users, Bookmark } from 'lucide-react';

export function MatchCategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);

  const category = MATCH_CATEGORIES.find((c) => c.id === categoryId);
  
  const { data, isLoading, isFetching } = useGetMatchesByCategoryQuery({
    category: categoryId as MatchCategory,
    page,
    limit: 20,
  });

  const matches = data?.data || [];
  const pagination = data?.pagination;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 py-2"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/matches">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-display font-semibold text-text">
              {category?.name || 'Matches'}
            </h1>
            <p className="text-text-secondary">
              {category?.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border border-border rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-primary text-white' : 'text-text-muted hover:bg-champagne'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-primary text-white' : 'text-text-muted hover:bg-champagne'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
          : 'space-y-4'
        }>
          {[...Array(8)].map((_, i) => (
            <ProfileCardSkeleton key={i} />
          ))}
        </div>
      ) : matches.length > 0 ? (
        <>
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
            : 'space-y-4'
          }>
            {matches.map((match: any) => (
              <ProfileCard
                key={match.profileId}
                profile={match}
                variant={viewMode}
                showMatchScore
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="outline"
                disabled={pagination.page <= 1 || isFetching}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (pagination.page > 1) {
                    setPage(page - 1);
                  }
                }}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-text-secondary">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={pagination.page >= pagination.totalPages || isFetching}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (pagination.page < pagination.totalPages) {
                    setPage(page + 1);
                  }
                }}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={categoryId === 'shortlisted_profiles' ? Bookmark : Users}
          title={categoryId === 'shortlisted_profiles' ? 'No profile shortlisted' : 'No matches found'}
          description={
            categoryId === 'shortlisted_profiles'
              ? 'Shortlist profiles you like to find them here quickly'
              : "We couldn't find any profiles matching this category. Try updating your preferences."
          }
          action={
            categoryId === 'shortlisted_profiles'
              ? undefined
              : {
                  label: 'Update Preferences',
                  onClick: () => {},
                }
          }
        />
      )}
    </motion.div>
  );
}

