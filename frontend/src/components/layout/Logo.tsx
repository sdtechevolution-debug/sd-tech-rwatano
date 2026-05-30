import logoSrc from "../../assets/logo.png";

type LogoProps = {
  compact?: boolean;
  className?: string;
};

const Logo = ({ compact = false, className = "" }: LogoProps) => (
  <div className={`flex items-center gap-3 py-2 ${className}`}>
    <div className={`flex-none ${compact ? 'h-12 w-12' : 'h-14 w-14'} aspect-square overflow-hidden rounded-full bg-gradient-to-br from-amber-500 via-orange-400 to-amber-300 p-1 shadow-md shadow-amber-200/30 dark:shadow-amber-500/10`}>
      <img
        src={logoSrc}
        alt="SD Tech logo"
        className="h-full w-full rounded-full object-contain"
      />
    </div>

    {!compact && (
      <div className="min-w-0">
        <div className={`truncate font-semibold ${compact ? "text-lg" : "text-2xl"} tracking-[0.24em] text-slate-900 dark:text-white`}>
          <span className="text-slate-500 dark:text-slate-400">SD</span> TECH
        </div>
        <div className="mt-1 max-w-[12rem] text-xs leading-5 text-slate-500 dark:text-slate-400">
          Your partner in technology evolution
        </div>
      </div>
    )}
  </div>
);

export default Logo;
