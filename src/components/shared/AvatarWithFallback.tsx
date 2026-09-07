interface AvatarWithFallbackProps {
  avatarUrl?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function AvatarWithFallback({
  avatarUrl,
  name,
  size = 'md',
  className = ''
}: AvatarWithFallbackProps) {
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg font-bold',
    xl: 'w-24 h-24 text-2xl font-black'
  };

  // Computes deterministic styling backdrops using safe color maps to avoid theme collisions
  const getFallbackTheme = (str: string) => {
    const sum = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const variants = [
      'bg-blue-600 text-blue-50',
      'bg-purple-600 text-purple-50',
      'bg-teal-600 text-teal-50',
      'bg-emerald-600 text-emerald-50',
      'bg-indigo-600 text-indigo-50'
    ];
    return variants[sum % variants.length];
  };

  const initials = name.trim().substring(0, 2).toUpperCase() || 'CH';

  return (
    <div className={`rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner select-none ${sizeClasses[size]} ${className}`}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Handle broken image urls cleanly by falling back to initial tokens
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      ) : (
        <div className={`w-full h-full flex items-center justify-center ${getFallbackTheme(name)}`}>
          {initials}
        </div>
      )}
    </div>
  );
}