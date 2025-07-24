// src/app/page.tsx
import Link from 'next/link';
import { profiles } from '@/lib/profiles';
import { ArrowRight } from 'lucide-react'; // Import the new icon

export default function HomePage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl">Invoice Generator</h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Who is creating this invoice?</p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 w-full max-w-4xl">
        {(Object.keys(profiles)).map((key) => (
          <Link
            key={key}
            href={`/${key}`}
            className="group rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-left transition-all hover:ring-2 hover:ring-indigo-500 hover:shadow-lg"
          >
            {/* MODIFIED: This section now uses flexbox for better alignment */}
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