import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEvents, useRSVP } from '../../hooks/useEvents';
import { useAuth } from '../../context/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Search, Calendar, MapPin, Users, Video } from 'lucide-react';

export default function EventsPage() {
  const { user } = useAuth();
  const rsvpMutation = useRSVP();
  
  const [statusTab, setStatusTab] = useState<'upcoming' | 'ongoing' | 'completed'>('upcoming');
  const [search, setSearch] = useState('');
  const [isOnlineOnly, setIsOnlineOnly] = useState(false);
  const [limit, setLimit] = useState(9);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError } = useEvents({
    page: 1,
    limit,
    status: statusTab,
    search: debouncedSearch || undefined,
    isOnline: isOnlineOnly ? true : undefined
  });

  const events = data?.data || [];
  const featuredEvent = data?.featured;
  const meta = data?.meta;
  
  // ✅ FIXED code 2304: Computed hasMore based on metadata or arrays thresholds
  const totalCount = meta?.total || events.length;
  const hasMore = meta ? events.length < totalCount : false;

  const parseDateLayout = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      day: d.toLocaleDateString('en-US', { day: '2-digit' }),
      month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      full: d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-surface-200 dark:border-surface-800 gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-white">Community Events</h1>
            <p className="text-sm text-surface-500 mt-1">Join technical webinars, process modeling peer-reviews, and networking loops.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-900 p-4 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex gap-2 border-b md:border-b-0 border-surface-100 dark:border-surface-800 pb-2 md:pb-0 overflow-x-auto">
            {(['upcoming', 'ongoing', 'completed'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setStatusTab(tab)}
                className={`px-4 py-2 text-sm font-semibold capitalize rounded-xl transition-all ${
                  statusTab === tab 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-surface-500 hover:text-surface-800 dark:hover:text-surface-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 flex-1 md:justify-end">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl text-sm dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-[#1a63ef]"
              />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-surface-600 dark:text-surface-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isOnlineOnly}
                onChange={(e) => setIsOnlineOnly(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-surface-300"
              />
              Online Only
            </label>
          </div>
        </div>

        {statusTab === 'upcoming' && featuredEvent && !search && !isOnlineOnly && (
          <div className="mb-10 group bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-2 hover:shadow-md transition-shadow">
            <div className="relative h-64 lg:h-auto bg-surface-900 overflow-hidden min-h-[260px]">
              {featuredEvent.coverUrl ? (
                <img src={featuredEvent.coverUrl} alt={featuredEvent.title} className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-900 to-surface-900 flex items-center justify-center text-white/5 font-bold text-9xl select-none">🧪</div>
              )}
              <div className="absolute top-4 left-4 p-2.5 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-xl text-center shadow-md min-w-[55px]">
                <p className="text-xl font-black text-surface-900 dark:text-white leading-none">{parseDateLayout(featuredEvent.startsAt).day}</p>
                <p className="text-[10px] font-bold text-blue-600 mt-1">{parseDateLayout(featuredEvent.startsAt).month}</p>
              </div>
            </div>
            <div className="p-6 md:p-8 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 px-2.5 py-0.5 rounded-md">FEATURED SEMINAR</span>
                <Link to={`/events/${featuredEvent.slug}`} className="block hover:text-blue-600 transition-colors">
                  <h2 className="text-xl md:text-2xl font-bold text-surface-900 dark:text-white leading-snug line-clamp-2">{featuredEvent.title}</h2>
                </Link>
                <p className="text-sm text-surface-500 dark:text-surface-400 line-clamp-3 leading-relaxed">{featuredEvent.description}</p>
                <div className="pt-2 space-y-1.5 text-xs text-surface-400 font-semibold">
                  <p className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-surface-400" /> {parseDateLayout(featuredEvent.startsAt).full}</p>
                  <p className="flex items-center gap-1.5">
                    {featuredEvent.isOnline ? <><Video className="w-4 h-4 text-green-500" /> <span className="text-green-600">Online Web-panel</span></> : <><MapPin className="w-4 h-4" /> {featuredEvent.venue}</>}
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-surface-100 dark:border-surface-800/80 flex items-center justify-between">
                <span className="text-xs text-surface-400 font-semibold flex items-center gap-1"><Users className="w-4 h-4" /> {featuredEvent.rsvpCount} Registered</span>
                <Link to={`/events/${featuredEvent.slug}`}><Button variant="primary" size="sm" className="rounded-xl font-bold">Access Matrix</Button></Link>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[...Array(6)].map((_, i) => <div key={i} className="h-72 bg-surface-200 dark:bg-surface-800 rounded-2xl" />)}
          </div>
        ) : isError || events.length === 0 ? (
          <EmptyState title="No Forums Listed" description="There are no active cataloged event items matching your current filters criteria selection details." />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event: any) => {
                const dateParts = parseDateLayout(event.startsAt);
                const isUserRsvped = event.isRsvped;
                const capacityPercent = event.maxCapacity ? Math.min((event.rsvpCount / event.maxCapacity) * 100, 100) : 0;

                return (
                  <Card key={event.id} className="overflow-hidden h-full flex flex-col justify-between group dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative">
                    <div className="relative h-44 bg-surface-900 overflow-hidden select-none">
                      {event.coverUrl ? (
                        <img src={event.coverUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-indigo-950 to-surface-900 flex items-center justify-center text-white/5 font-bold text-6xl">🧪</div>
                      )}
                      
                      <div className="absolute top-4 left-4 p-2 bg-white/95 dark:bg-black/60 backdrop-blur-md rounded-xl text-center shadow-md min-w-[50px]">
                        <p className="text-lg font-black text-surface-900 dark:text-white leading-none">{dateParts.day}</p>
                        <p className="text-[9px] font-extrabold text-blue-600 mt-0.5 leading-none">{dateParts.month}</p>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="mb-2">
                          {event.isOnline ? (
                            <Badge className="text-[9px] uppercase font-bold tracking-wide rounded bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/20 px-2 py-0.5"><Video className="w-3 h-3 inline mr-1 -mt-0.5" /> Digital Panel</Badge>
                          ) : (
                            <Badge className="text-[9px] uppercase font-bold tracking-wide rounded bg-surface-50 dark:bg-surface-800 text-surface-600 dark:text-surface-300 border border-surface-200 dark:border-surface-700 px-2 py-0.5 line-clamp-1 max-w-full"><MapPin className="w-3 h-3 inline mr-1 -mt-0.5" /> {event.venue}</Badge>
                          )}
                        </div>

                        <Link to={`/events/${event.slug}`} className="block hover:text-blue-600 transition-colors">
                          <h3 className="font-bold text-base text-surface-900 dark:text-white line-clamp-2 leading-snug">{event.title}</h3>
                        </Link>
                        
                        <p className="text-xs font-semibold text-surface-400 mt-2 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {dateParts.full}</p>
                        <p className="text-[11px] text-surface-400 mt-1 font-medium">Hosted by: {event.organizer?.profile?.fullName || 'Academic Affiliate'}</p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-surface-100 dark:border-surface-800/60 space-y-3">
                        <div className="flex justify-between items-center text-xs font-medium">
                          <span className="text-surface-400 flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Attendance:</span>
                          <span className="text-surface-700 dark:text-surface-200 font-bold">{event.rsvpCount} {event.maxCapacity ? `/ ${event.maxCapacity} seats` : 'Registered'}</span>
                        </div>

                        {event.maxCapacity && (
                          <div className="w-full h-1.5 bg-surface-100 dark:bg-surface-950 rounded-full overflow-hidden border border-surface-200/40 dark:border-surface-800/40">
                            <div className={`h-full transition-all duration-300 ${capacityPercent > 85 ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${capacityPercent}%` }} />
                          </div>
                        )}

                        {user && statusTab === 'upcoming' && (
                          // ✅ FIXED code 2322: Changed loading to isLoading
                          <Button
                            onClick={() => rsvpMutation.mutate(event.id)}
                            variant={isUserRsvped ? 'outline' : 'primary'}
                            className={`w-full text-xs font-bold rounded-xl py-2 shadow-sm ${isUserRsvped ? 'border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20' : ''}`}
                            isLoading={rsvpMutation.isPending}
                          >
                            {isUserRsvped ? 'Cancel My RSVP' : 'RSVP Seating'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {hasMore && (
              <div className="flex justify-center pt-10">
                <button onClick={() => setLimit(prev => prev + 9)} className="px-5 py-2.5 border border-surface-200 dark:border-surface-800 text-xs font-bold rounded-xl bg-white dark:bg-surface-900 text-surface-700 dark:text-surface-200 shadow-sm hover:bg-surface-50 transition-colors">
                  Load More Panels
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}