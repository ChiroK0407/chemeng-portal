import { useState } from 'react';
import { useResources, useResourceCategories } from '../../hooks/useResources';
import { useDebounce } from '../../hooks/useDebounce';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { 
  Search, FileText, Video, Book, FileCheck, ExternalLink, 
  Download, ArrowUpRight, GraduationCap, Eye, Filter, SlidersHorizontal 
} from 'lucide-react';

const TYPE_TABS = [
  { label: 'All Resources', value: 'all' },
  { label: 'PDF Library', value: 'pdf' },
  { label: 'Video Streams', value: 'video' },
  { label: 'Textbooks', value: 'book' },
  { label: 'Lecture Notes', value: 'notes' },
  { label: 'External Links', value: 'link' }
];

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [semester, setSemester] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [limit, setLimit] = useState(12);

  const debouncedSearch = useDebounce(search, 300);
  const debouncedSubject = useDebounce(subject, 300);

  // Fetch contextual options matrices and current data feeds
  const { data: categories } = useResourceCategories();
  const { data: resourceData, isLoading, isError } = useResources({
    page: 1,
    limit,
    type: activeTab !== 'all' ? (activeTab as any) : undefined,
    search: debouncedSearch || undefined,
    subject: debouncedSubject || undefined,
    semester: semester !== 'all' ? semester : undefined,
    categoryId: selectedCategory || undefined
  });

  const catalog = resourceData?.data || [];
  const meta = resourceData?.meta;
  const hasMore = meta ? catalog.length < meta.total : false;

  // Resolves the proper visual utility callout icon based on content type mapping definitions
  const getResourceMeta = (type: string) => {
    switch (type) {
      case 'pdf':
        return { icon: <FileText className="w-5 h-5 text-red-500" />, btnText: 'Download PDF', btnIcon: <Download className="w-3.5 h-3.5" /> };
      case 'video':
        return { icon: <Video className="w-5 h-5 text-blue-500" />, btnText: 'Watch Session', btnIcon: <ExternalLink className="w-3.5 h-3.5" /> };
      case 'book':
        return { icon: <Book className="w-5 h-5 text-amber-500" />, btnText: 'View Blueprint', btnIcon: <ArrowUpRight className="w-3.5 h-3.5" /> };
      case 'notes':
        return { icon: <FileCheck className="w-5 h-5 text-teal-500" />, btnText: 'Download Notes', btnIcon: <Download className="w-3.5 h-3.5" /> };
      default:
        return { icon: <ExternalLink className="w-5 h-5 text-purple-500" />, btnText: 'Open Resource', btnIcon: <ExternalLink className="w-3.5 h-3.5" /> };
    }
  };

  const FiltersContent = () => (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-surface-400 dark:text-surface-500">Resource Search</label>
        <div className="relative mt-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search keywords, titles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl text-sm dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-[#1a63ef]"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-surface-400 dark:text-surface-500">Engineering Subject</label>
        <input
          type="text"
          placeholder="e.g. Thermodynamics, Reaction Eng"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full mt-1 p-2.5 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl text-sm dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-[#1a63ef]"
        />
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-surface-400 dark:text-surface-500">Academic Semester</label>
        <select
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          className="w-full mt-1 p-2.5 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl text-sm dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-[#1a63ef]"
        >
          <option value="all">All Semesters</option>
          {[...Array(8)].map((_, idx) => (
            <option key={idx + 1} value={idx + 1}>{`Semester ${idx + 1}`}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-surface-400 dark:text-surface-500">Hub Domain Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full mt-1 p-2.5 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl text-sm dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-[#1a63ef]"
        >
          <option value="">All Fields</option>
          {categories?.map((cat: any) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Title Presentation Header Panel */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-surface-200 dark:border-surface-800 gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-white">Resource Hub</h1>
            <p className="text-sm text-surface-500 mt-0.5">Access crowdsourced data, textbooks, notes, and process simulation guidelines.</p>
          </div>
        </div>

        {/* Media Types Tab Bar Mapping Matrix */}
        <div className="flex overflow-x-auto gap-1 pb-2 mb-6 border-b border-surface-100 dark:border-surface-800 scrollbar-hide">
          {TYPE_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.value
                  ? 'border-[#1a63ef] text-[#1a63ef]'
                  : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          
          {/* Static Filters Desktop Column Card */}
          <aside className="hidden md:block sticky top-28 bg-white dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm">
            <h3 className="font-bold text-sm uppercase tracking-wider text-surface-900 dark:text-white flex items-center gap-1.5 mb-4">
              <SlidersHorizontal className="w-4 h-4 text-[#1a63ef]" /> Filters
            </h3>
            <FiltersContent />
          </aside>

          {/* Asset Grid Loop Execution Workspace Panel Area */}
          <div className="md:col-span-3">
            
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[...Array(6)].map((_, i) => <div key={i} className="h-60 bg-surface-200 dark:bg-surface-800 rounded-2xl" />)}
              </div>
            ) : isError || catalog.length === 0 ? (
              <EmptyState title="Repository Clear" description="There are no specific reference resources corresponding to your filter criteria parameter vectors." />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {catalog.map((resource: any) => {
                    const metaConfig = getResourceMeta(resource.type);
                    const creatorName = resource.uploadedBy?.profile?.fullName || resource.uploaderName || 'Faculty Member';
                    return (
                      <Card key={resource.id} className="p-5 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
                        
                        <div>
                          <div className="flex items-center justify-between gap-4 mb-3.5">
                            <div className="w-10 h-10 rounded-xl bg-surface-50 dark:bg-surface-950 border border-surface-200/60 dark:border-surface-800/80 flex items-center justify-center shadow-inner flex-shrink-0">
                              {metaConfig.icon}
                            </div>
                            <div className="flex flex-wrap justify-end gap-1 max-w-[70%]">
                              {resource.semester && (
                                <Badge className="text-[9px] uppercase font-bold rounded bg-surface-50 dark:bg-surface-800 text-surface-600 dark:text-surface-300 border border-surface-200 dark:border-surface-700">
                                  S{resource.semester}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <h3 className="font-bold text-base text-surface-900 dark:text-white leading-snug line-clamp-2 group-hover:text-[#1a63ef] transition-colors">
                            {resource.title}
                          </h3>
                          
                          <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 mt-1 flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5" /> {resource.subject || 'General Allied Domain'}
                          </p>

                          <p className="text-xs text-surface-400 mt-2.5 line-clamp-2 leading-relaxed">
                            {resource.description || 'No programmatic abstract synopsis indexed for this documentation cluster component node.'}
                          </p>
                        </div>

                        <div className="mt-5 pt-3 border-t border-surface-100 dark:border-surface-800/60 flex flex-col gap-3.5 w-full text-[11px] font-medium text-surface-400">
                          <div className="flex justify-between items-center">
                            <span>By: <strong className="text-surface-700 dark:text-surface-300">{creatorName}</strong></span>
                            <span className="flex items-center gap-0.5"><Eye className="w-3.5 h-3.5" /> {resource.downloads || 0} hits</span>
                          </div>

                          {/* Trigger control channel link block mapping */}
                          <a 
                            href={resource.type === 'pdf' || resource.type === 'notes' ? (resource.fileUrl || resource.url) : resource.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="w-full block"
                          >
                            <Button variant="outline" size="sm" className="w-full rounded-xl text-[11px] font-bold py-2 flex items-center justify-center gap-1.5">
                              {metaConfig.btnIcon}
                              {metaConfig.btnText}
                            </Button>
                          </a>
                        </div>

                      </Card>
                    );
                  })}
                </div>

                {hasMore && (
                  <div className="flex justify-center pt-10">
                    <button 
                      onClick={() => setLimit(prev => prev + 12)} 
                      className="px-5 py-2.5 border border-surface-200 dark:border-surface-800 text-xs font-bold rounded-xl bg-white dark:bg-surface-900 text-surface-700 dark:text-surface-200 shadow-sm hover:bg-surface-50 transition-colors"
                    >
                      Load More Items
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