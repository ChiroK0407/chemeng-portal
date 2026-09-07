import { useParams, Link } from 'react-router-dom';
import { useEvent, useRSVP } from '../../hooks/useEvents';
import { useAuth } from '../../context/AuthContext';
// ✅ FIXED: Updated path source import directly to Spinner per update instructions
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ArrowLeft, Calendar, MapPin, Users, Video, Globe, Share2 } from 'lucide-react';

export default function EventDetailPage() {
  const { user } = useAuth();
  const { slug } = useParams<{ slug: string }>();
  const rsvpMutation = useRSVP();

  const { data: event, isLoading, isError } = useEvent(slug || '');

  // ✅ FIXED: Swap out placeholder with your standardized layout loader element
  if (isLoading) return <Spinner />;
  
  if (isError || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 px-4">
        <div className="text-center max-w-sm card p-6 border border-surface-200 dark:border-surface-800 rounded-2xl">
          <p className="text-sm text-surface-500">The scheduled panel portfolio profile data file is unavailable or deleted.</p>
          <Link to="/events" className="text-blue-600 font-bold mt-4 inline-flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Back to Agenda</Link>
        </div>
      </div>
    );
  }

  const parseDate = (dStr: string) => new Date(dStr).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const capacityPercent = event.maxCapacity ? Math.min((event.rsvpCount / event.maxCapacity) * 100, 100) : 0;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Event profile link synchronized into clipboard buffer registry.');
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 pb-20">
      
      <div className="relative w-full h-[320px] md:h-[380px] bg-surface-900 select-none overflow-hidden">
        {event.coverUrl ? (
          <img src={event.coverUrl} alt={event.title} className="w-full h-full object-cover opacity-50" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-950 via-surface-900 to-indigo-950 opacity-70" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-50 dark:from-surface-950 to-transparent" />
        <div className="absolute top-6 left-6 z-10">
          <Link to="/events" className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/90 dark:bg-black/40 backdrop-blur-md rounded-xl border border-surface-100/10 text-xs font-bold text-surface-900 dark:text-white shadow-sm hover:bg-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Hub
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-6 md:p-8 rounded-3xl shadow-sm">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge className="text-[10px] uppercase font-black tracking-wider rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-none">{event.status || 'Active'}</Badge>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-white leading-relaxed pb-3">{event.title}</h1>

              <div className="mt-6 pt-4 border-t border-surface-100 dark:border-surface-800 space-y-3 text-sm font-semibold text-surface-700 dark:text-surface-200">
                <p className="flex items-center gap-2.5"><Calendar className="w-4 h-4 text-surface-400" /> <span>Starts: {parseDate(event.startsAt)}</span></p>
                {event.endsAt && <p className="flex items-center gap-2.5"><Calendar className="w-4 h-4 text-surface-400" /> <span>Concludes: {parseDate(event.endsAt)}</span></p>}
                <p className="flex items-center gap-2.5">
                  {event.isOnline ? <><Video className="w-4 h-4 text-green-500" /> <span className="text-green-600 font-bold">Online Portal Session Channels Linked</span></> : <><MapPin className="w-4 h-4 text-surface-400" /> <span>{event.venue || 'Corporate Event Hall'}</span></>}
                </p>
              </div>

              <div className="mt-8 prose prose-portal dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: event.content || '<p className="italic text-surface-400">No extended overview guidelines submitted for this technical gathering node.</p>' }} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-6 rounded-2xl shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-surface-400 dark:text-surface-500">Attendance Registry</h4>
              
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-surface-500 flex items-center gap-1"><Users className="w-4.5 h-4.5" /> Booked Seating:</span>
                <strong className="text-surface-900 dark:text-white font-extrabold text-base">{event.rsvpCount} {event.maxCapacity ? `/ ${event.maxCapacity} seats` : 'Attendees'}</strong>
              </div>

              {event.maxCapacity && (
                <div className="space-y-1.5 pt-1">
                  <div className="w-full h-2 bg-surface-100 dark:bg-surface-950 rounded-full overflow-hidden border border-surface-200/40">
                    <div className={`h-full transition-all duration-300 ${capacityPercent > 85 ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${capacityPercent}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-surface-400 font-bold uppercase tracking-wide">
                    <span>Filled Capacity</span>
                    <span>{Math.round(capacityPercent)}% Full</span>
                  </div>
                </div>
              )}

              {user && event.status !== 'completed' && event.status !== 'cancelled' && (
                // ✅ FIXED code 2322: Changed loading to isLoading
                <Button
                  onClick={() => rsvpMutation.mutate(event.id)}
                  variant={event.isRsvped ? 'outline' : 'primary'}
                  className={`w-full font-bold py-2.5 rounded-xl text-xs shadow-sm mt-2 ${event.isRsvped ? 'border-red-200 text-red-600 hover:bg-red-50' : ''}`}
                  isLoading={rsvpMutation.isPending}
                >
                  {event.isRsvped ? 'Cancel Registration' : 'Reserve My Seat'}
                </Button>
              )}

              {event.isOnline && event.meetingUrl && event.isRsvped && (
                <a href={event.meetingUrl} target="_blank" rel="noreferrer" className="block w-full pt-1">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 py-2.5">
                    <Globe className="w-4 h-4" /> Enter Meeting Channel
                  </Button>
                </a>
              )}

              <button onClick={handleShare} className="w-full py-2.5 border border-surface-200 dark:border-surface-800 text-xs font-bold rounded-xl text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-950 flex items-center justify-center gap-1.5 transition-colors">
                <Share2 className="w-4 h-4" /> Share with Peers
              </button>
            </div>

            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-5 rounded-2xl shadow-sm flex items-center gap-3.5">
              <img
                src={event.organizer?.profile?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${event.organizerId}`}
                alt="Organizer"
                className="w-11 h-11 rounded-full bg-surface-50 border shadow-inner"
              />
              <div className="overflow-hidden">
                <span className="text-[10px] font-bold text-surface-400 block uppercase tracking-wide">Convener / Organizer</span>
                <Link to={`/members/${event.organizerId}`} className="font-bold text-sm text-surface-900 dark:text-surface-50 hover:text-blue-600 transition-colors line-clamp-1 truncate block mt-0.5">
                  {event.organizer?.profile?.fullName || 'Faculty Organizer'}
                </Link>
                <span className="text-xs text-surface-500 font-semibold line-clamp-1 block">{event.organizer?.profile?.college || 'Academic Affiliate'}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}