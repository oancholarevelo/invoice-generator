// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProfiles, Profile } from '@/lib/profiles';
import { ArrowRight, FileText, PlusCircle } from 'lucide-react';

export default function HomePage() {
  const [profiles, setProfiles] = useState<Record<string, Profile> | null>(null);

  useEffect(() => {
    getProfiles().then(setProfiles);
  }, []);

  return (
    <main className="flex flex-col items-center justify-center p-8 bg-transparent">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-indigo-100 rounded-full">
            <FileText size={48} className="text-indigo-600" />
          </div>
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
          Build That Invoice
        </h1>
        <p className="mt-6 text-xl text-slate-600">
          Who is creating this invoice?
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 w-full max-w-4xl">
        {profiles ? (
          Object.keys(profiles).map((key) => (
            <Link
              key={key}
              href={`/${key}`}
              className="group rounded-2xl border border-slate-200/50 bg-white/50 p-8 text-left shadow-lg backdrop-blur-lg transition-all hover:ring-2 hover:ring-indigo-500 hover:scale-105"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">{profiles[key].name}</h2>
                  <p className="mt-2 text-slate-500">{profiles[key].email}</p>
                </div>
                <ArrowRight
                  className="text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-indigo-600"
                  size={24}
                />
              </div>
            </Link>
          ))
        ) : (
          <>
            <div className="rounded-2xl bg-slate-200/50 p-8 h-36 animate-pulse"></div>
            <div className="rounded-2xl bg-slate-200/50 p-8 h-36 animate-pulse"></div>
          </>
        )}
         <Link
            href={`/custom`}
            className="group rounded-2xl border-2 border-dashed border-slate-300 bg-transparent p-8 text-center shadow-lg transition-all hover:border-indigo-500 hover:bg-slate-50/50 flex flex-col justify-center items-center col-span-1 sm:col-span-2"
        >
            <PlusCircle className="h-12 w-12 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            <h2 className="mt-4 text-2xl font-semibold text-slate-900">Create Your Own</h2>
            <p className="mt-2 text-slate-500">Enter your details manually</p>
        </Link>
      </div>
    </main>
  );
}