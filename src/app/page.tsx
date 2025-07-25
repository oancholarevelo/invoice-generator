// src/app/page.tsx
import Link from 'next/link';
import { profiles } from '@/lib/profiles';
import { ArrowRight, FileText } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-8 bg-transparent">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-indigo-100 dark:bg-indigo-900/50 rounded-full">
            <FileText size={48} className="text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-6xl">
          Invoice Generator
        </h1>
        <p className="mt-6 text-xl text-slate-600 dark:text-slate-400">
          Who is creating this invoice?
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 w-full max-w-4xl">
        {(Object.keys(profiles)).map((key) => (
          <Link
            key={key}
            href={`/${key}`}
            className="group rounded-2xl border border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 p-8 text-left shadow-lg backdrop-blur-lg transition-all hover:ring-2 hover:ring-indigo-500 hover:scale-105"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{profiles[key].name}</h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400">{profiles[key].email}</p>
              </div>
              <ArrowRight
                className="text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-indigo-600"
                size={24}
              />
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}