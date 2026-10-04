import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useOrganisations } from '../../hooks/useOrganisations';
import { useDebounce } from '../../hooks/useDebounce';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';

const ORG_TYPES = ['Government PSU', 'Private Company', 'MNC', 'Startup'];

export default function OrganisationListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [orgType, setOrgType] = useState(searchParams.get('orgType') || '');
  const [gateRequired, setGateRequired] = useState(searchParams.get('gateRequired') || 'any');
  const [branch, setBranch] = useState(searchParams.get('branch') || '');
  const [limit, setLimit] = useState(12);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 300);
  const debouncedBranch = useDebounce(branch, 300);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (orgType) params.orgType = orgType;
    if (gateRequired !== 'any') params.gateRequired = gateRequired;
    if (debouncedBranch) params.branch = debouncedBranch;
    setSearchParams(params);
  }, [debouncedSearch, orgType, gateRequired, debouncedBranch, setSearchParams]);

  const { data, isLoading, isError } = useOrganisations({
    page: 1,
    limit,
    search: debouncedSearch || undefined,
    orgType: orgType || undefined,
    gateRequired: gateRequired !== 'any' ? gateRequired : undefined,
    branch: debouncedBranch || undefined,
  });

  const orgList = data?.data || [];
  const meta = data?.meta;
  const totalCount = meta?.total || orgList.length;
  const hasMore = meta ? orgList.length < totalCount : false;

  const FiltersContent = () => (
    <div className="space-y-6">
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-surface-400 dark:text-surface-500">Search</label>
        <div className="relative mt-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search by organisation name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl text-sm dark:text-surface-100 focus:ring-2 focus:ring-[#1a63ef] focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-surface-400 dark:text-surface-500">Type</label>
        <select
          value={orgType}
          onChange={(e) => setOrgType(e.target.value)}
          className="w-full mt-1 p-2.5 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl text-sm dark:text-surface-100 focus:ring-2 focus:ring-[#1a63ef] focus:outline-none"
        >
          <option value="">All Types</option>
          {ORG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-surface-400 dark:text-surface-500">GATE Requirement</label>
        <div className="grid grid-cols-3 gap-2 mt-1.5 p-1 bg-surface-100 dark:bg-surface-950 rounded-xl border border-surface-200 dark:border-surface-800">
          {['any', 'yes', 'no'].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setGateRequired(mode)}
              className={`py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                gateRequired === mode
                  ? 'bg-white dark:bg-surface-800 text-surface-900 dark:text-white shadow-sm'
                  : 'text-surface-500 dark:text-surface-400 hover:text-surface-700'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-surface-400 dark:text-surface-500">Eligible Academic Branch</label>
        <input
          type="text"
          placeholder="e.g. Chemical Engineering"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          className="w-full mt-1 p-2.5 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl text-sm dark:text-surface-100 focus:ring-2 focus:ring-[#1a63ef] focus:outline-none"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-surface-200 dark:border-surface-800 gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Organisation Explorer</h1>
            <p className="text-sm text-surface-500 mt-1">Discover government and corporate employers, and what to expect as a chemical engineer.</p>
          </div>
          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="md:hidden flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl text-sm font-semibold text-surface-700 dark:text-surface-200 shadow-sm"
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          <aside className="hidden md:block sticky top-28 bg-white dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm">
            <h3 className="font-bold text-sm uppercase tracking-wider text-surface-900 dark:text-white flex items-center gap-2 mb-5">
              <SlidersHorizontal className="w-4 h-4 text-primary-600" /> Filter Criteria
            </h3>
            <FiltersContent />
          </aside>

          {isMobileDrawerOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm md:hidden">
              <div className="absolute bottom-0 inset-x-0 bg-white dark:bg-surface-900 rounded-t-3xl max-h-[85vh] overflow-y-auto p-6 space-y-6">
                <div className="flex justify-between items-center border-b pb-3 border-surface-100 dark:border-surface-800">
                  <h3 className="font-bold text-lg text-surface-900 dark:text-white">Filter Parameters</h3>
                  <button onClick={() => setIsMobileDrawerOpen(false)} className="text-sm font-bold text-surface-400 hover:text-surface-600">Close</button>
                </div>
                <FiltersContent />
                <Button className="w-full py-3 rounded-xl font-bold" onClick={() => setIsMobileDrawerOpen(false)}>Apply Filters</Button>
              </div>
            </div>
          )}

          <div className="md:col-span-3 space-y-6">
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wide px-1">
              Showing {orgList.length} of {totalCount} organisations
            </p>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-surface-200 dark:bg-surface-800 rounded-2xl" />)}
              </div>
            ) : isError || orgList.length === 0 ? (
              <EmptyState title="No organisations listed yet" description="Adjust your filters, or check back once the admin team adds more." />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {orgList.map((org: any) => (
                    <Card key={org.id} className="p-5 h-full flex flex-col justify-between dark:bg-surface-900 border-surface-200 dark:border-surface-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative group">
                      <div>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-base mb-4 shadow-inner">
                          {org.logo_url ? <img src={org.logo_url} alt={org.name} className="w-full h-full object-contain" /> : org.name.substring(0, 2).toUpperCase()}
                        </div>

                        <h3 className="font-bold text-lg text-surface-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1">{org.name}</h3>
                        <p className="text-xs text-surface-400 font-medium mt-0.5 line-clamp-1">{org.full_name || 'Employer'}</p>

                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {org.org_type && <Badge className="text-[10px] uppercase font-bold rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/20">{org.org_type}</Badge>}
                          {org.bond_years && <Badge className="text-[10px] uppercase font-bold rounded-md bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/20">{org.bond_years} Yr Bond</Badge>}
                        </div>

                        {/* Package Scale intentionally removed -- salary is never disclosed, government or corporate. */}
                        <div className="mt-5 pt-3 border-t border-surface-100 dark:border-surface-800/60 space-y-1.5 text-xs font-medium">
                          <div className="flex justify-between">
                            <span className="text-surface-400">GATE Requirement:</span>
                            {org.gate_cutoff ? (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/20">Required</span>
                            ) : (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/20">Direct Hire</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <Link to={`/organisations/${org.slug}`} className="w-full mt-6 block">
                        <Button variant="outline" className="w-full rounded-xl text-xs font-semibold tracking-wide py-2.5">View Profile Details</Button>
                      </Link>
                    </Card>
                  ))}
                </div>

                {hasMore && (
                  <div className="flex justify-center pt-10">
                    <button
                      onClick={() => setLimit(prev => prev + 12)}
                      className="px-6 py-3 border border-surface-200 dark:border-surface-800 text-sm font-semibold rounded-xl bg-white dark:bg-surface-900 text-surface-700 dark:text-surface-200 shadow-sm hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
                    >
                      Load More
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
