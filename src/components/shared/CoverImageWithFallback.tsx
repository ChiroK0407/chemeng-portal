interface CoverImageWithFallbackProps {
  coverUrl?: string | null;
  seed: string;
  aspectRatio?: 'video' | 'square' | 'wide' | 'auto';
  className?: string;
}

export function CoverImageWithFallback({
  coverUrl,
  seed,
  aspectRatio = 'video',
  className = ''
}: CoverImageWithFallbackProps) {
  
  const aspectClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
    wide: 'aspect-[21/9]',
    auto: 'h-full w-full'
  };

  // Selects a dark-mode safe gradient theme palette using deterministic string hashes
  const getDeterministicGradient = (str: string) => {
    const hash = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradients = [
      'from-blue-600 to-indigo-900',
      'from-purple-600 to-indigo-950',
      'from-teal-600 to-slate-900',
      'from-emerald-600 to-cyan-950',
      'from-indigo-600 to-purple-900'
    ];
    return gradients[hash % gradients.length];
  };

  return (
    <div className={`relative w-full overflow-hidden select-none bg-surface-900 ${aspectClasses[aspectRatio]} ${className}`}>
      {coverUrl ? (
        <img
          src={coverUrl}
          alt={seed}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      ) : (
        <div className={`w-full h-full bg-gradient-to-br flex items-center justify-center relative ${getDeterministicGradient(seed)}`}>
          {/* Subtle grid mesh utility layer overlay */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
          <span className="text-white/20 font-display font-black text-4xl tracking-tighter uppercase select-none opacity-40">
            {seed.substring(0, 3)}
          </span>
        </div>
      )}
    </div>
  );
}