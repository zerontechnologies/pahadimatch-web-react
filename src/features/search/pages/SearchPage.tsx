import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, Grid, List, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileCard } from '@/components/shared/ProfileCard';
import { ProfileCardSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { useLazySearchProfilesQuery } from '@/store/api/searchApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsSearchFilterOpen, setSearchFilterOpen } from '@/store/slices/uiSlice';
import { cn } from '@/lib/utils';
import type { SearchFilters } from '@/types';

const religionOptions = [
  { value: 'hindu', label: 'Hindu' },
  { value: 'muslim', label: 'Muslim' },
  { value: 'christian', label: 'Christian' },
  { value: 'sikh', label: 'Sikh' },
  { value: 'buddhist', label: 'Buddhist' },
  { value: 'jain', label: 'Jain' },
];

const educationOptions = [
  { value: 'high_school', label: 'High School' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'bachelors', label: 'Bachelors' },
  { value: 'masters', label: 'Masters' },
  { value: 'phd', label: 'PhD' },
  { value: 'professional', label: 'Professional' },
];

const occupationOptions = [
  { value: 'government', label: 'Government' },
  { value: 'private', label: 'Private' },
  { value: 'business', label: 'Business' },
  { value: 'self_employed', label: 'Self Employed' },
  { value: 'army', label: 'Army/Defense' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'teacher', label: 'Teacher' },
];

const defaultFilters: SearchFilters = {
  ageMin: 21,
  ageMax: 35,
  heightMin: 150,
  heightMax: 190,
};

export function SearchPage() {
  const dispatch = useAppDispatch();
  const isFilterOpen = useAppSelector(selectIsSearchFilterOpen);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [page, setPage] = useState(1);

  const [searchProfiles, { data, isLoading, isFetching }] = useLazySearchProfilesQuery();

  const profiles = data?.data || [];
  const pagination = data?.pagination;

  // Initial search
  useEffect(() => {
    searchProfiles({ ...filters, page, limit: 20 });
  }, []);

  const handleSearch = () => {
    setPage(1);
    searchProfiles({ ...filters, page: 1, limit: 20 });
    dispatch(setSearchFilterOpen(false));
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    setPage(1);
    searchProfiles({ ...defaultFilters, page: 1, limit: 20 });
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const activeFilterCount = Object.keys(filters).filter((key) => {
    const value = filters[key as keyof SearchFilters];
    return value !== undefined && value !== '' && 
      (Array.isArray(value) ? value.length > 0 : true);
  }).length;

  return (
    <div className="space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-semibold text-text flex items-center gap-3">
            <Search className="w-8 h-8 text-primary" />
            Search Profiles
          </h1>
          <p className="text-text-secondary mt-1">
            Find your perfect match with smart filters
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => dispatch(setSearchFilterOpen(!isFilterOpen))}
            className="lg:hidden"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="ml-2">{activeFilterCount}</Badge>
            )}
          </Button>

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

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <AnimatePresence>
          {(isFilterOpen || window.innerWidth >= 1024) && (
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={cn(
                'w-full lg:w-80 flex-shrink-0',
                'fixed lg:static inset-0 z-50 lg:z-auto',
                'bg-surface lg:bg-transparent'
              )}
            >
              <Card className="h-full lg:h-auto lg:sticky lg:top-20 overflow-y-auto">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-lg">Filters</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleReset}>
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Reset
                    </Button>
                    <button
                      onClick={() => dispatch(setSearchFilterOpen(false))}
                      className="lg:hidden p-2 rounded-lg hover:bg-champagne"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 pb-6">
                  {/* Age Range */}
                  <div>
                    <label className="text-sm font-medium text-text mb-3 block">
                      Age Range: {filters.ageMin} - {filters.ageMax} years
                    </label>
                    <Slider
                      value={[filters.ageMin || 21, filters.ageMax || 35]}
                      min={18}
                      max={60}
                      step={1}
                      onValueChange={([min, max]) => {
                        updateFilter('ageMin', min);
                        updateFilter('ageMax', max);
                      }}
                    />
                  </div>

                  {/* Height Range */}
                  <div>
                    <label className="text-sm font-medium text-text mb-3 block">
                      Height: {filters.heightMin}cm - {filters.heightMax}cm
                    </label>
                    <Slider
                      value={[filters.heightMin || 150, filters.heightMax || 190]}
                      min={140}
                      max={210}
                      step={5}
                      onValueChange={([min, max]) => {
                        updateFilter('heightMin', min);
                        updateFilter('heightMax', max);
                      }}
                    />
                  </div>

                  {/* Religion */}
                  <div>
                    <label className="text-sm font-medium text-text mb-2 block">Religion</label>
                    <Select
                      value={(filters.religion as any)?.[0] || ''}
                      onValueChange={(val) => updateFilter('religion', val ? [val] : undefined)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any religion" />
                      </SelectTrigger>
                      <SelectContent>
                        {religionOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Education */}
                  <div>
                    <label className="text-sm font-medium text-text mb-2 block">Education</label>
                    <Select
                      value={(filters.education as any)?.[0] || ''}
                      onValueChange={(val) => updateFilter('education', val ? [val] : undefined)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any education" />
                      </SelectTrigger>
                      <SelectContent>
                        {educationOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Occupation */}
                  <div>
                    <label className="text-sm font-medium text-text mb-2 block">Occupation</label>
                    <Select
                      value={(filters.occupation as any)?.[0] || ''}
                      onValueChange={(val) => updateFilter('occupation', val ? [val] : undefined)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any occupation" />
                      </SelectTrigger>
                      <SelectContent>
                        {occupationOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="text-sm font-medium text-text mb-2 block">City</label>
                    <Input
                      placeholder="e.g., Dehradun"
                      value={filters.city || ''}
                      onChange={(e) => updateFilter('city', e.target.value)}
                    />
                  </div>

                  {/* Toggles */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="verified"
                        checked={filters.isVerified}
                        onCheckedChange={(checked) => updateFilter('isVerified', checked)}
                      />
                      <label htmlFor="verified" className="text-sm">Verified profiles only</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="photos"
                        checked={filters.hasPhotos}
                        onCheckedChange={(checked) => updateFilter('hasPhotos', checked)}
                      />
                      <label htmlFor="photos" className="text-sm">With photos only</label>
                    </div>
                  </div>

                  {/* Search Button */}
                  <Button onClick={handleSearch} className="w-full" isLoading={isFetching}>
                    <Search className="w-4 h-4 mr-2" />
                    Search Profiles
                  </Button>
                </CardContent>
              </Card>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-2 md:grid-cols-3 gap-4'
              : 'space-y-4'
            }>
              {[...Array(6)].map((_, i) => (
                <ProfileCardSkeleton key={i} />
              ))}
            </div>
          ) : profiles.length > 0 ? (
            <>
              <p className="text-sm text-text-muted mb-4">
                Found {pagination?.total || 0} profiles
              </p>
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-2 md:grid-cols-3 gap-4'
                : 'space-y-4'
              }>
                {profiles.map((profile: any) => (
                  <ProfileCard
                    key={profile.profileId}
                    profile={profile}
                    variant={viewMode}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    disabled={!pagination.hasPrev || isFetching}
                    onClick={() => {
                      const newPage = page - 1;
                      setPage(newPage);
                      searchProfiles({ ...filters, page: newPage, limit: 20 });
                    }}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4 text-sm text-text-secondary">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={!pagination.hasNext || isFetching}
                    onClick={() => {
                      const newPage = page + 1;
                      setPage(newPage);
                      searchProfiles({ ...filters, page: newPage, limit: 20 });
                    }}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={Search}
              title="No profiles found"
              description="Try adjusting your filters to find more matches"
              action={{
                label: 'Reset Filters',
                onClick: handleReset,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

