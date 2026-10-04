import { useParams, Link } from 'react-router-dom';
import { useEvent } from '../../hooks/useEvents';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { ArrowLeft, Calendar, MapPin, Video, Globe, Share2 } from 'lucide-react';

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: event, isLoading, isError } = useEvent(slug || '');

  if (isLoading) return <Spinner />;

  if (isError || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 px-4">
        <div className="text-center max-w-sm card p-6 border border-surface-200 dark:border-surface-800 rounded-2xl">
          <p className="text-sm text-surface-500">This event couldn't be found.</p>
          <Link to="/events" className="text-blue-600 font-bold mt-4 inline-flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Back to Events</Link>
        </div>
      </div>
    );
  }

  const parseDate = (dStr: string) => new Date(dStr).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard.');
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 pb-20">
      <div className="relative w-full h-[320px] md:h-[380px] bg-surface-900 select-none overflow-hidden">
        {event.cover_image ? (
          <img src={event.cover_image} alt={event.title} className="w-full h-full object-cover opacity-50" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-950 via-surface-900 to-indigo-950 opacity-70" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-50 dark:from-surface-950 to-transparent" />
        <div className="absolute top-6 left-6 z-10">
          <Link to="/events" className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/90 dark:bg-black/40 backdrop-blur-md rounded-xl border border-surface-100/10 text-xs font-bold text-surface-900 dark:text-white shadow-sm hover:bg-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-6 md:p-8 rounded-3xl shadow-sm">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge className="text-[10px] uppercase font-black tracking-wider rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-none">{event.status}</Badge>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-white leading-relaxed pb-3">{event.title}</h1>

              <div className="mt-6 pt-4 border-t border-surface-100 dark:border-surface-800 space-y-3 text-sm font-semibold text-surface-700 dark:text-surface-200">
                <p className="flex items-center gap-2.5"><Calendar className="w-4 h-4 text-surface-400" /> <span>Starts: {parseDate(event.starts_at)}</span></p>
                {event.ends_at && <p className="flex items-center gap-2.5"><Calendar className="w-4 h-4 text-surface-400" /> <span>Ends: {parseDate(event.ends_at)}</span></p>}
                <p className="flex items-center gap-2.5">
                  {event.is_online ? <><Video className="w-4 h-4 text-green-500" /> <span className="text-green-600 font-bold">Online</span></> : <><MapPin className="w-4 h-4 text-surface-400" /> <span>{event.venue || 'TBA'}</span></>}
                </p>
              </div>

              <div className="mt-8 prose prose-portal dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: event.content || event.description || '<p class="italic text-surface-400">No further details added yet.</p>' }} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-6 rounded-2xl shadow-sm space-y-4">
              {event.is_online && event.meeting_url && (event.status === 'upcoming' || event.status === 'ongoing') && (
                <a href={event.meeting_url} target="_blank" rel="noreferrer" className="block w-full">
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 py-2.5">
                    <Globe className="w-4 h-4" /> Join Meeting
                  </button>
                </a>
              )}
              <button onClick={handleShare} className="w-full py-2.5 border border-surface-200 dark:border-surface-800 text-xs font-bold rounded-xl text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-950 flex items-center justify-center gap-1.5 transition-colors">
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>

            {event.organizer_name && (
              <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-5 rounded-2xl shadow-sm">
                <span className="text-[10px] font-bold text-surface-400 block uppercase tracking-wide">Organizer</span>
                <span className="font-bold text-sm text-surface-900 dark:text-surface-50 mt-0.5 block">{event.organizer_name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
