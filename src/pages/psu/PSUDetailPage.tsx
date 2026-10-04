import { useParams, Link } from 'react-router-dom';
import { usePSU, usePSUs } from '../../hooks/usePSUs';
import { PageSpinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Globe, Landmark, ShieldCheck, MapPin, Award } from 'lucide-react';

export default function PSUDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: psu, isLoading, isError } = usePSU(slug || '');

  const { data: relatedData } = usePSUs({ sector: psu?.sector, limit: 4 });

  if (isLoading) return <PageSpinner />;
  if (isError || !psu) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 px-4">
        <div className="text-center max-w-md card p-8 border rounded-2xl border-surface-200 dark:border-surface-800">
          <p className="text-sm text-surface-500">This PSU profile couldn't be found.</p>
          <Link to="/psu" className="text-blue-600 font-semibold mt-4 inline-flex items-center gap-1.5"><ArrowLeft className="w-4 h-4" /> Back to Directory</Link>
        </div>
      </div>
    );
  }

  const relatedList = relatedData?.data?.filter((p: any) => p.id !== psu.id).slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Link to="/psu" className="inline-flex items-center gap-1.5 text-sm font-semibold text-surface-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </Link>

        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl p-6 md:p-8 shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center font-bold text-white text-xl flex-shrink-0 shadow-md">
              {psu.logo_url ? <img src={psu.logo_url} alt={psu.name} className="w-full h-full object-contain" /> : psu.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-white leading-none">{psu.name}</h1>
                {psu.is_featured && <span className="text-[10px] font-bold px-2 py-0.5 text-amber-700 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 rounded-md uppercase tracking-wider">Featured</span>}
              </div>
              <p className="text-sm font-medium text-surface-400 mt-1">{psu.full_name || 'Government of India Enterprise'}</p>
            </div>
          </div>
          {psu.sector && <Badge className="text-xs uppercase font-bold px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/20 self-start sm:self-auto">{psu.sector}</Badge>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-6 rounded-2xl shadow-sm grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div className="space-y-0.5"><span className="text-xs text-surface-400 font-medium block">Package Scale</span><strong className="text-lg font-bold text-surface-900 dark:text-white">₹{psu.package_min_lpa ?? '?'} - ₹{psu.package_max_lpa ?? '?'} LPA</strong></div>
              <div className="space-y-0.5"><span className="text-xs text-surface-400 font-medium block">GATE Cutoff</span><strong className="text-lg font-bold text-surface-900 dark:text-white">{psu.gate_cutoff || 'Not applicable'}</strong></div>
              <div className="space-y-0.5"><span className="text-xs text-surface-400 font-medium block">Bond Period</span><strong className="text-lg font-bold text-surface-900 dark:text-white">{psu.bond_years ? `${psu.bond_years} Years` : 'No Bond'}</strong></div>
              <div className="space-y-0.5"><span className="text-xs text-surface-400 font-medium block">Headquarters</span><strong className="text-base font-bold text-surface-800 dark:text-surface-200 flex items-center gap-1 mt-0.5"><MapPin className="w-4 h-4 text-surface-400" /> {psu.headquarters || 'N/A'}</strong></div>
              <div className="space-y-0.5"><span className="text-xs text-surface-400 font-medium block">Recruitment Mode</span><strong className="text-base font-bold text-surface-800 dark:text-surface-200 flex items-center gap-1 mt-0.5"><ShieldCheck className="w-4 h-4 text-surface-400" /> {psu.recruitment_mode || 'GATE Score'}</strong></div>
            </div>

            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-6 rounded-2xl shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400 dark:text-surface-500 flex items-center gap-2 mb-4">
                <Landmark className="w-4 h-4" /> Eligible Branches
              </h3>
              <div className="flex flex-wrap gap-2">
                {psu.eligible_branches?.length > 0 ? (
                  psu.eligible_branches.map((br: string) => (
                    <span key={br} className="px-3 py-1 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 text-surface-700 dark:text-surface-200 text-xs font-semibold rounded-lg">{br}</span>
                  ))
                ) : (
                  <span className="text-xs italic text-surface-400">All branches eligible.</span>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-6 md:p-8 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold text-surface-900 dark:text-white border-b border-surface-100 dark:border-surface-800 pb-3 mb-4">Overview</h3>
              <div className="prose prose-portal dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: psu.description || '<p class="italic text-surface-400">No description added yet.</p>' }} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-6 rounded-2xl shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-surface-400 dark:text-surface-500 mb-2">Links</h4>
              {psu.website_url && (
                <a href={psu.website_url} target="_blank" rel="noreferrer" className="block w-full">
                  <Button variant="outline" className="w-full rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 py-2.5"><Globe className="w-4 h-4" /> Visit Official Site</Button>
                </a>
              )}
              {(psu.apply_url || psu.website_url) && (
                <a href={psu.apply_url || psu.website_url} target="_blank" rel="noreferrer" className="block w-full">
                  <Button className="w-full bg-[#1a63ef] hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 py-2.5 shadow-sm"><Award className="w-4 h-4" /> Recruitment Portal</Button>
                </a>
              )}
            </div>

            {relatedList.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-surface-400 dark:text-surface-500 px-1">Similar PSUs</h4>
                {relatedList.map((rel: any) => (
                  <Link key={rel.id} to={`/psu/${rel.slug}`} className="block bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-4 rounded-xl shadow-sm hover:border-surface-300 dark:hover:border-surface-700 transition-colors group">
                    <h5 className="font-bold text-sm text-surface-900 dark:text-surface-50 group-hover:text-blue-600 line-clamp-1 transition-colors">{rel.name}</h5>
                    <p className="text-xs font-semibold text-[#1a63ef] mt-0.5">₹{rel.package_min_lpa ?? '?'} - ₹{rel.package_max_lpa ?? '?'} LPA</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
