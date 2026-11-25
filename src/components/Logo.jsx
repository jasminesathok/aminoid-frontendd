import React from 'react';
import { useTheme } from './ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import logoDark from '../assets/logos/logo_dark.png';
import logoLight from '../assets/logos/logo_light.png';

export const Logo = ({ className = "", size = "default" }) => {
  const { theme } = useTheme();
  const { companyLogo, companyName } = useCurrency();

  const sizeClass = {
    sm:      "h-8 w-auto",
    default: "h-12 w-auto",
    lg:      "h-18 w-auto",
  }[size] ?? "h-16 w-16";

  // The default Aminoid logo art already has the wordmark baked in.
  // A custom uploaded company logo is just an image, so once a tenant
  // uploads one, show the company name as text next to it — otherwise
  // the sidebar header shows only a bare image with no name at all.
  const hasCustomLogo = Boolean(companyLogo);

  return (
    <div className={`flex items-center gap-3 min-w-0 ${className}`}>
      <img
        src={companyLogo || (theme === 'dark' ? logoDark : logoLight)}
        alt={companyName || "Company Logo"}
        className={`${sizeClass} object-contain shrink-0 ${hasCustomLogo ? 'rounded-lg' : ''}`}
      />
      {hasCustomLogo && companyName && (
        <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">
          {companyName}
        </span>
      )}
    </div>
  );
};