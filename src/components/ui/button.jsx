import React from 'react'

export function Button({ className = '', variant, children, ...props }) {
  const base = 'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50 disabled:pointer-events-none';
  const variants = variant === 'outline'
    ? 'border border-slate-700 bg-slate-900 text-white hover:bg-slate-800'
    : 'bg-teal-600 text-white hover:bg-teal-500';
  return <button className={`${base} ${variants} ${className}`} {...props}>{children}</button>
}
