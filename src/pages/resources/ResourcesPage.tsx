import { useState } from 'react';
import { useResources } from '../../hooks/useResources';
import { useDebounce } from '../../hooks/useDebounce';
import { api } from '../../lib/axios';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Search, FileText, Video, Book, FileCheck, ExternalLink, Download, ArrowUpRight, GraduationCap, Eye, Filter, SlidersHorizontal } from 'lucide-react';

const TYPE_TABS = [
  { label: 'All Resources', value: 'all' },
  { label: 'PDF Library', value: 'pdf' },
  { label: 'Video Streams', value: 'video' },
  { label: 'Textbooks', value: 'book' },
  { label: 'Lecture Notes', value: 'notes' },
  { label: 'External Links', value: 'link' },
];

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [semester, setSemester] = useState('all');
  const [limit, setLimit] = useState(12);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 300);
  const debouncedSubject = useDebounce(subject, 300);

  const { data: resourceData, isLoading, isError } = useResources({
    page: 1,
    limit,
    type: activeTab !== 'all' ? activeTab : undefined,
    search: debouncedSearch || undefined,
    subject: debouncedSubject || undefined,
    semester: semester !== 'all' ? semester : undefined,
  });

  const catalog = resourceData?.data || [];
  const meta = resourceData?.meta;
  const hasMore = meta ? catalog.length < meta.total : false;

  const getResourceMeta = (type: string) => {
    switch (type) {
      case 'pdf': return { icon: <FileText className="w-5 h-5 text-red-500" />, btnText: 'Download PDF', btnIcon: <Download className="w-3.5 h-3.5" /> };
      case 'video': return { icon: <Video className="w-5 h-5 text-blue-500" />, btnText: 'Watch', btnIcon: <ExternalLink className="w-3.5 h-3.5" /> };
      case 'book': return { icon: <Book className="w-5 h-5 text-amber-500" />, btnText: 'View', btnIcon: <ArrowUpRight className="w-3.5 h-3.5" /> };
      case 'notes': return { icon: <FileCheck className="w-5 h-5 text-teal-500" />, btnText: 'Download Notes', btnIcon: <Download className="w-3.5 h-3.5" /> };
      default: return { icon: <ExternalLink className="w-5 h-5 text-purple-500" />, btnText: 'Open Resource', btnIcon: <ExternalLink className="w-3.5 h-3.5" /> };
    }
  };

  const handleOpen = async (resource: any) => {
    try {
      const res = await api.post(`/resources/${resource.id}/click`);
      window.open(res.data?.data?.url || resource.url, '_blank', 'noreferrer');
    } catch {
      window.open(resource.url, '_blank', 'noreferrer');
    }
  };

  const FiltersContent = () => (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-surface-400 dark:text-surface-500">Resource Search</label>
        <div className="relative mt-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input type="text" placeholder="Search titles..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl text-sm dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-[#1a63ef]" />
        </div>
      </div>
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-surface-400 dark:text-surface-500">Subject</label>
        <input type="text" placeholder="e.g. Thermodynamics" value={subject} onChange={(e) => setSubject(e.target.value)}
          className="w-full mt-1 p-2.5 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl text-sm dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-[#1a63ef]" />
      </div>
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-surface-400 dark:text-surface-500">Semester</label>
        <select value={semester} onChange={(e) => setSemester(e.target.value)}
          className="w-full mt-1 p-2.5 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl text-sm dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-[#1a63ef]">
          <option value="all">All Semesters</option>
          {[...Array(8)].map((_, idx) => <option key={idx + 1} value={idx + 1}>{`Semester ${idx + 1}`}</option>)}
        </select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-surface-200 dark:border-surface-800 gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-white">Resource Hub</h1>
            <p className="text-sm text-surface-500 mt-0.5">Notes, textbooks, and reference material shared by the community.</p>
          </div>
          <button onClick={() => setIsMobileDrawerOpen(true)} className="md:hidden flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl text-sm font-semibold text-surface-700 dark:text-surface-200 shadow-sm self-start">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>

        <div className="flex overflow-x-auto gap-1 pb-2 mb-6 border-b border-surface-100 dark:border-surface-800 scrollbar-hide">
          {TYPE_TABS.map(tab => (
            <button key={tab.value} onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.value ? 'border-[#1a63ef] text-[#1a63ef]' : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          <aside className="hidden md:block sticky top-28 bg-white dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm">
            <h3 className="font-bold text-sm uppercase tracking-wider text-surface-900 dark:text-white flex items-center gap-1.5 mb-4">
              <SlidersHorizontal className="w-4 h-4 text-[#1a63ef]" /> Filters
            </h3>
            <FiltersContent />
          </aside>

          {isMobileDrawerOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm md:hidden">
              <div className="absolute bottom-0 inset-x-0 bg-white dark:bg-surface-900 rounded-t-3xl max-h-[85vh] overflow-y-auto p-6 space-y-6">
                <div className="flex justify-between items-center border-b pb-3 border-surface-100 dark:border-surface-800">
                  <h3 className="font-bold text-lg text-surface-900 dark:text-white">Filters</h3>
                  <button onClick={() => setIsMobileDrawerOpen(false)} className="text-sm font-bold text-surface-400 hover:text-surface-600">Close</button>
                </div>
                <FiltersContent />
                <Button className="w-full py-3 rounded-xl font-bold" onClick={() => setIsMobileDrawerOpen(false)}>Apply</Button>
              </div>
            </div>
          )}

          <div className="md:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[...Array(6)].map((_, i) => <div key={i} className="h-60 bg-surface-200 dark:bg-surface-800 rounded-2xl" />)}
              </div>
            ) : isError || catalog.length === 0 ? (
              <EmptyState title="No resources found" description="Nothing matches your current filters." />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {catalog.map((resource: any) => {
                    const metaConfig = getResourceMeta(resource.type);
                    return (
                      <Card key={resource.id} className="p-5 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
                        <div>
                          <div className="flex items-center justify-between gap-4 mb-3.5">
                            <div className="w-10 h-10 rounded-xl bg-surface-50 dark:bg-surface-950 border border-surface-200/60 dark:border-surface-800/80 flex items-center justify-center shadow-inner flex-shrink-0">
                              {metaConfig.icon}
                            </div>
                            {resource.semester && (
                              <Badge className="text-[9px] uppercase font-bold rounded bg-surface-50 dark:bg-surface-800 text-surface-600 dark:text-surface-300 border border-surface-200 dark:border-surface-700">S{resource.semester}</Badge>
                            )}
                          </div>
                          <h3 className="font-bold text-base text-surface-900 dark:text-white leading-snug line-clamp-2 group-hover:text-[#1a63ef] transition-colors">{resource.title}</h3>
                          {resource.subject && (
                            <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 mt-1 flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" /> {resource.subject}</p>
                          )}
                          <p className="text-xs text-surface-400 mt-2.5 line-clamp-2 leading-relaxed">{resource.description}</p>
                        </div>

                        <div className="mt-5 pt-3 border-t border-surface-100 dark:border-surface-800/60 flex flex-col gap-3.5 w-full text-[11px] font-medium text-surface-400">
                          <div className="flex justify-between items-center">
                            <span>{resource.uploader_name ? <>By: <strong className="text-surface-700 dark:text-surface-300">{resource.uploader_name}</strong></> : <span>&nbsp;</span>}</span>
                            <span className="flex items-center gap-0.5"><Eye className="w-3.5 h-3.5" /> {resource.downloads || 0} hits</span>
                          </div>
                          <Button variant="outline" size="sm" className="w-full rounded-xl text-[11px] font-bold py-2 flex items-center justify-center gap-1.5" onClick={() => handleOpen(resource)}>
                            {metaConfig.btnIcon}
                            {metaConfig.btnText}
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {hasMore && (
                  <div className="flex justify-center pt-10">
                    <button onClick={() => setLimit(prev => prev + 12)} className="px-5 py-2.5 border border-surface-200 dark:border-surface-800 text-xs font-bold rounded-xl bg-white dark:bg-surface-900 text-surface-700 dark:text-surface-200 shadow-sm hover:bg-surface-50 transition-colors">
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
