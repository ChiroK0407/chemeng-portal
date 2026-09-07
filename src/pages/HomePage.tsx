import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, Variants } from 'framer-motion';
import { api } from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { 
  Users, Briefcase, Calendar, BookOpen, 
  MapPin, Award, ExternalLink, ArrowRight 
} from 'lucide-react';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6, 
      ease: "easeOut" 
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

export default function HomePage() {
  const { user } = useAuth();

  // ── TanStack Query State Data Hydration Tier ────────────────────
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['homeStats'],
    queryFn: async () => {
      const res = await api.get('/admin/stats');
      return res.data?.data || res.data;
    }
  });

  const { data: psus, isLoading: psusLoading } = useQuery({
    queryKey: ['featuredPsus'],
    queryFn: async () => {
      const res = await api.get('/psus?isFeatured=true&limit=6');
      return res.data?.data || res.data;
    }
  });

  const { data: opportunities, isLoading: oppsLoading } = useQuery({
    queryKey: ['latestOpportunities'],
    queryFn: async () => {
      const res = await api.get('/opportunities?limit=4&status=published');
      return res.data?.data || res.data;
    }
  });

  const { data: blogs, isLoading: blogsLoading } = useQuery({
    queryKey: ['recentBlogs'],
    queryFn: async () => {
      const res = await api.get('/blogs?limit=3&status=published');
      return res.data?.data || res.data;
    }
  });

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['upcomingEvents'],
    queryFn: async () => {
      const res = await api.get('/events?status=upcoming&limit=3');
      return res.data?.data || res.data;
    }
  });

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 pt-24 overflow-x-hidden">

      {/* 🧭 SECTION 1: HERO CONTAINER SECTION */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-grid-pattern overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-50 dark:to-surface-950 pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl sm:text-6xl font-display font-extrabold text-surface-900 dark:text-white tracking-tight leading-tight"
          >
            <span className="text-gradient">The Engineering Ecosystem</span> <br />
            for ChemE Professionals
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-6 text-lg sm:text-xl text-surface-500 dark:text-surface-400 max-w-3xl mx-auto leading-relaxed"
          >
            Connect with top-tier public sector undertakings, showcase core chemical process simulations, track industry placement streams, and grow alongside leading academic and industry operators.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            {/* 💡 FIXED: Removed asChild, wrapped Button element directly inside Link */}
            <Link to="/psu">
              <Button variant="primary" size="lg" className="rounded-xl shadow-sm">
                Explore PSUs
              </Button>
            </Link>
            {!user && (
              <Link to="/auth/signup">
                <Button variant="outline" size="lg" className="rounded-xl">
                  Join the Community
                </Button>
              </Link>
            )}
          </motion.div>

          {/* 📊 Core Platform System Analytics Stats Bar Dashboard */}
          <div className="mt-20 max-w-4xl mx-auto border border-surface-200 dark:border-surface-800 bg-white/70 dark:bg-surface-900/50 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-sm">
            {statsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2 text-center">
                    <div className="h-8 bg-surface-200 dark:bg-surface-800 rounded-md w-1/2 mx-auto" />
                    <div className="h-4 bg-surface-100 dark:bg-surface-800 rounded-md w-3/4 mx-auto" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 division-x division-surface-100 dark:division-surface-800">
                <div className="text-center">
                  <p className="text-3xl font-bold text-surface-900 dark:text-white">{stats?.totalMembers || 0}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-surface-400 mt-1">Members</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-surface-900 dark:text-white">{stats?.totalPsus || 0}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-surface-400 mt-1">PSUs Listed</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-surface-900 dark:text-white">{stats?.totalProjects || 0}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-surface-400 mt-1">Projects</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-surface-900 dark:text-white">{stats?.totalOpportunities || 0}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-surface-400 mt-1">Openings</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 🏢 SECTION 2: FEATURED PSUs GRID SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-surface-900 dark:text-white">Top PSUs for Chemical Engineers</h2>
            <p className="text-sm text-surface-500 mt-1">Direct corporate channels mapped through valid GATE performance score requirements.</p>
          </div>
          {/* 💡 FIXED Code conflict line 154: Adjusted breakpoints to eliminate simultaneous flex/hidden assignments */}
          <Link to="/psu" className="text-sm font-semibold text-[#1a63ef] hover:underline items-center gap-1 hidden sm:inline-flex">
            View all PSUs <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {psusLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[...Array(3)].map((_, i) => <div key={i} className="h-64 bg-surface-200 dark:bg-surface-800 rounded-2xl" />)}
          </div>
        ) : !psus || psus.length === 0 ? (
          <EmptyState title="No Featured PSUs Available" description="There are no specific public utilities configured as featured profiles inside the instance context right now." />
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {psus.map((psu: any) => (
              <motion.div key={psu.id} variants={fadeInUp}>
                <Card className="p-6 h-full flex flex-col justify-between hover:shadow-md transition-shadow dark:bg-surface-900 border-surface-200 dark:border-surface-800 rounded-2xl">
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-950/40 flex items-center justify-center font-bold text-lg text-primary-700 dark:text-primary-400 flex-shrink-0">
                        {psu.logoUrl ? <img src={psu.logoUrl} alt={psu.name} className="w-full h-full object-contain" /> : psu.name.substring(0, 2).toUpperCase()}
                      </div>
                      {/* 💡 FIXED: Dropped old variants parameter mapping to safeguard custom Badge file declarations */}
                      <Badge className="text-[10px] uppercase font-bold tracking-wider rounded-md px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40">
                        {psu.sector}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-lg text-surface-900 dark:text-white line-clamp-1">{psu.name}</h3>
                    <p className="text-xs text-surface-400 font-medium mt-0.5">{psu.headquarters || 'Headquarters Confidential'}</p>
                    <div className="mt-4 space-y-2 border-t border-surface-100 dark:border-surface-800/60 pt-3">
                      <div className="flex justify-between text-xs font-medium"><span className="text-surface-400">CTC Range:</span><span className="text-surface-700 dark:text-surface-200 font-semibold">₹{psu.packageMinLpa || 'N/A'} - ₹{psu.packageMaxLpa || 'N/A'} LPA</span></div>
                      {/* 💡 FIXED: Replaced unassignable variant strings with clean inline class layouts */}
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-surface-400">GATE Criteria:</span>
                        <span>
                          {psu.gateRequired ? (
                            <span className="text-[10px] px-2 py-0.5 font-bold rounded bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30">Required</span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 font-bold rounded bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/30">Direct</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* 💡 FIXED: Removed asChild from footer layout button links */}
                  <Link to={`/psu/${psu.slug}`} className="w-full mt-6">
                    <Button variant="outline" className="w-full rounded-xl text-xs font-semibold">
                      View Details
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* 💼 SECTION 3: LATEST OPPORTUNITIES LIST SECTION */}
      <section className="py-16 bg-surface-100/50 dark:bg-surface-900/20 border-y border-surface-200 dark:border-surface-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-surface-900 dark:text-white">Latest Opportunities</h2>
              <p className="text-sm text-surface-500 mt-1">Live active career, research, and fellowship channels in direct production scope.</p>
            </div>
            <Link to="/opportunities" className="text-sm font-semibold text-[#1a63ef] hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {oppsLoading ? (
            <div className="space-y-4 animate-pulse">
              {[...Array(2)].map((_, i) => <div key={i} className="h-24 bg-surface-200 dark:bg-surface-800 rounded-xl" />)}
            </div>
          ) : !opportunities || opportunities.length === 0 ? (
            <EmptyState title="No Openings Tracked" description="There are no specific placement files currently marked active inside our telemetry grids." />
          ) : (
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} className="space-y-4">
              {opportunities.map((opp: any) => (
                <motion.div key={opp.id} variants={fadeInUp} className="group bg-white dark:bg-surface-900 p-5 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-surface-300 dark:hover:border-surface-700 transition-all duration-200">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-surface-50 dark:bg-surface-950 flex items-center justify-center border border-surface-100 dark:border-surface-800 text-surface-400 group-hover:text-primary-600 transition-colors flex-shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-base text-surface-900 dark:text-white">{opp.title}</h3>
                        <Badge className="text-[10px] px-2 rounded-md font-semibold tracking-wide uppercase bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 border border-surface-200 dark:border-surface-700">{opp.type}</Badge>
                      </div>
                      <p className="text-sm font-medium text-surface-600 dark:text-surface-300 mt-0.5">{opp.company}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-surface-400">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {opp.location || 'Remote Execution'}</span>
                        <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> Stipend: {opp.stipend_max ? `Up to ₹${Number(opp.stipend_max).toLocaleString()}` : 'Unspecified'}</span>
                      </div>
                    </div>
                  </div>
                  <a href={opp.apply_url || '#'} target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                    <Button variant="primary" size="sm" className="w-full sm:w-auto rounded-xl text-xs font-semibold px-4 shadow-sm">
                      Apply Now <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </a>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* 📝 SECTION 4: RECENT BLOGS GRID SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-surface-900 dark:text-white">From the Community</h2>
            <p className="text-sm text-surface-500 mt-1">Technical articles, simulation documentation summaries, and engineering logs.</p>
          </div>
          {/* 💡 FIXED Line 252: Adjusted responsive layout breakpoint utility declarations */}
          <Link to="/blogs" className="text-sm font-semibold text-[#1a63ef] hover:underline items-center gap-1 hidden sm:inline-flex">
            Read all articles <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {blogsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[...Array(3)].map((_, i) => <div key={i} className="h-72 bg-surface-200 dark:bg-surface-800 rounded-2xl" />)}
          </div>
        ) : !blogs || blogs.length === 0 ? (
          <EmptyState title="No Articles Published" description="The community journal repository contains zero active publication items in this view cycle." />
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogs.map((blog: any) => (
              <motion.div key={blog.id} variants={fadeInUp}>
                <Card className="overflow-hidden h-full flex flex-col justify-between group dark:bg-surface-900 border-surface-200 dark:border-surface-800 rounded-2xl hover:shadow-md transition-shadow">
                  <div className="relative h-44 bg-surface-900 overflow-hidden select-none">
                    {blog.cover_image ? (
                      <img src={blog.cover_image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-950 to-surface-900 flex items-center justify-center text-white/5 font-bold text-6xl">🧪</div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <Link to={`/blogs/${blog.slug}`} className="block group-hover:text-[#1a63ef] transition-colors">
                        <h3 className="font-bold text-base text-surface-900 dark:text-white line-clamp-2 leading-snug">{blog.title}</h3>
                      </Link>
                    </div>
                    <div className="flex items-center justify-between mt-5 pt-3 border-t border-surface-100 dark:border-surface-800/60">
                      <span className="text-xs font-semibold text-surface-600 dark:text-surface-300">{blog.author_name || 'Anonymous Member'}</span>
                      <span className="text-[10px] font-medium text-surface-400 flex items-center gap-1"><BookOpen className="w-3 h-3" /> {blog.read_time_min || 5} min read</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* 📅 SECTION 5: UPCOMING EVENTS SECTION */}
      <section className="py-16 bg-white dark:bg-surface-900 px-4 sm:px-6 lg:px-8 border-t border-surface-200 dark:border-surface-800/80">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-surface-900 dark:text-white">Upcoming Events</h2>
              <p className="text-sm text-surface-500 mt-1">Interactive design webinars, process model peer-reviews, and networking loops.</p>
            </div>
            <Link to="/events" className="text-sm font-semibold text-[#1a63ef] hover:underline flex items-center gap-1">
              View all events <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {eventsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
              {[...Array(3)].map((_, i) => <div key={i} className="h-56 bg-surface-200 dark:bg-surface-800 rounded-2xl" />)}
            </div>
          ) : !events || events.length === 0 ? (
            <EmptyState title="No Seminars Blocked" description="There are no active upcoming collaborative panels registered inside our agenda systems right now." />
          ) : (
            <div className="flex overflow-x-auto pb-4 gap-6 scrollbar-hide md:grid md:grid-cols-3 md:overflow-visible">
              {events.map((event: any) => (
                <div key={event.id} className="min-w-[280px] sm:min-w-0 flex-shrink-0 md:flex-shrink w-full">
                  <Card className="p-5 h-full flex flex-col justify-between dark:bg-surface-950 border-surface-200 dark:border-surface-800 rounded-2xl shadow-sm">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold text-primary-600 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {new Date(event.startsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        {/* 💡 FIXED: Mapped variant back into a fully explicit local text wrapper */}
                        <Badge className="text-[9px] uppercase tracking-wide font-bold rounded-md px-2 py-0.5 bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 border border-surface-200 dark:border-surface-700">
                          {event.isOnline ? 'Online Panel' : 'Physical Venue'}
                        </Badge>
                      </div>
                      <h3 className="font-bold text-base text-surface-900 dark:text-white line-clamp-2 leading-snug">{event.title}</h3>
                      <p className="text-xs font-medium text-surface-400 mt-1.5 line-clamp-1">Hosted by: {event.organizer?.fullName || 'Faculty Affiliate'}</p>
                    </div>
                    <div className="mt-6 pt-3 border-t border-surface-100 dark:border-surface-800 flex justify-between items-center text-xs">
                      <span className="text-surface-400 font-medium">RSVP Count: <strong className="text-surface-700 dark:text-surface-200 font-semibold">{event.rsvpCount || 0} Seatings</strong></span>
                      <Link to={`/events/${event.slug}`} className="text-xs font-bold text-[#1a63ef] hover:underline flex items-center gap-0.5">Details <ArrowRight className="w-3 h-3" /></Link>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 🚀 SECTION 6: CONCLUDING CTA BANNER SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight">Ready to accelerate your ChemE career?</h2>
          <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Mount your digital professional card, explore featured sector openings, index your custom code scripts, and scale your operational reach.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            {/* 💡 FIXED: Extracted asChild attributes cleanly */}
            <Link to="/opportunities">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-xl shadow-sm border-none px-6 py-3">
                Explore Opportunities
              </Button>
            </Link>
            {!user && (
              <Link to="/auth/signup">
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 font-semibold rounded-xl">
                  Join Now
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}