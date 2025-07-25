// src/app/[profile]/page.tsx
'use client';

import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import InvoiceTemplate, { InvoiceData, Item } from '@/components/InvoiceTemplate';
import { getProfile, Profile } from '@/lib/profiles';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { FileDown, User, ChevronsLeft, Plus, Trash2, ChevronDown, Building, UploadCloud, FileImage } from 'lucide-react';

// Function to calculate and format the due date
const getDueDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 15); // Add 15 days
  return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
};

export default function InvoicePage() {
  const params = useParams();
  const profileKey = params.profile as string;
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoFilename, setLogoFilename] = useState<string>('');

  const [currency, setCurrency] = useState('PHP');

  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

  const invoiceRef = useRef<HTMLDivElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let logoUrlToRevoke: string | null = null;

    getProfile(profileKey).then(profile => {
      if (profile) {
        setUserProfile(profile);
        setInvoiceData({
          company: profile,
          client: { name: '', address: '' },
          invoiceNumber: `${new Date().getFullYear()}-001`,
          invoiceDate: new Date().toISOString().split('T')[0],
          dueDate: getDueDate(),
          items: [{ description: 'Website Development', quantity: 1, rate: 1000 }],
          notes: 'If you have any questions concerning this invoice, use the following contact information:',
          paymentDetails: profile.paymentDetails,
          isPaid: false,
          subtotal: 1000,
          total: 1000,
        });
      }
      setLoading(false);
    });

    return () => {
      if (logoUrlToRevoke) {
        URL.revokeObjectURL(logoUrlToRevoke);
      }
    };
  }, [profileKey]);

  useEffect(() => {
    if (invoiceData) {
      const subtotal = invoiceData.items.reduce((acc, item) => acc + item.quantity * item.rate, 0);
      const total = subtotal;
      setInvoiceData(prev => prev ? ({ ...prev, subtotal, total }) : null);
    }
  }, [invoiceData?.items]);

  if (loading) {
    return <main className="p-4 sm:p-8 lg:p-12"><div className="max-w-7xl mx-auto text-center">Loading Profile...</div></main>;
  }

  if (!userProfile || !invoiceData) {
    notFound();
  }

  const handleCompanyDataChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInvoiceData(prev => {
        if (!prev) return null;
        return {
            ...prev,
            company: {
                ...prev.company,
                [name]: value,
            }
        };
    });
  };
  
  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const logoUrl = URL.createObjectURL(file);
      setLogoFilename(file.name);
      setInvoiceData(prev => {
        if (!prev) return null;
        // Revoke the old URL if it exists to avoid memory leaks
        if (prev.company.logoUrl && prev.company.logoUrl.startsWith('blob:')) {
          URL.revokeObjectURL(prev.company.logoUrl);
        }
        return {
          ...prev,
          company: {
            ...prev.company,
            logoUrl,
          }
        };
      });
    }
  };

  const handleDataChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setInvoiceData(prev => {
      if (!prev) return null;
      if (name === 'clientName') {
        return { ...prev, client: { ...prev.client, name: value } };
      } else if (name === 'clientAddress') {
        return { ...prev, client: { ...prev.client, address: value } };
      } else {
        return { ...prev, [name]: finalValue };
      }
    });
  };
  
  const handleCurrencyChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setCurrency(e.target.value);
  };

  const handleItemChange = (index: number, field: keyof Item, value: string) => {
    setInvoiceData(prev => {
      if (!prev) return null;
      const newItems = [...prev.items];
      const itemToUpdate = { ...newItems[index] };

      if (field === 'description') {
          itemToUpdate[field] = value;
      } else if (field === 'quantity' || field === 'rate') {
          itemToUpdate[field] = parseFloat(value) || 0;
      }

      newItems[index] = itemToUpdate;
      return { ...prev, items: newItems };
    });
  };

  const addItem = () => {
    setInvoiceData(prev => prev ? { ...prev, items: [...prev.items, { description: '', quantity: 1, rate: 0 }] } : null);
  };

  const removeItem = (index: number) => {
    setInvoiceData(prev => prev ? { ...prev, items: prev.items.filter((_, i) => i !== index) } : null);
  };

  const handleGeneratePdf = () => {
    const input = invoiceRef.current;
    if (input) {
      const a4Width = '210mm';
      const a4Height = '297mm';

      const originalWidth = input.style.width;
      const originalHeight = input.style.height;
      input.style.width = a4Width;
      input.style.height = a4Height;

      html2canvas(input, {
        scale: 2,
        windowHeight: input.scrollHeight,
        windowWidth: input.scrollWidth,
        onclone: (clonedDoc) => {
          clonedDoc.documentElement.classList.remove('dark');
        }
      }).then((canvas) => {
        input.style.width = originalWidth;
        input.style.height = originalHeight;

        const imgData = canvas.toDataURL('image/jpeg', 0.9);
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

        const clientName = invoiceData.client.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'invoice';
        pdf.save(`${clientName}-${invoiceData.invoiceNumber}.pdf`);
      });
    }
  };

  return (
    <main className="p-4 sm:p-8 lg:p-12 bg-transparent">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl shadow-md backdrop-blur-lg p-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Create Invoice</h1>
            <div className="flex items-center gap-2 mt-2 text-slate-500 dark:text-slate-400">
              <User size={16} />
              <span className="font-semibold">{profileKey === 'custom' ? (invoiceData.company.name || 'Custom User') : userProfile.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm">
              <ChevronsLeft size={16} />
              Switch User
            </Link>
            <button onClick={handleGeneratePdf} className="py-2.5 px-6 inline-flex items-center gap-2 text-sm font-semibold rounded-lg border-transparent bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              <FileDown size={16}/>
              Download PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="lg:col-span-2 p-6 bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl space-y-6 backdrop-blur-lg shadow-md">
            
            {profileKey === 'custom' && (
              <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 flex items-center"><Building size={20} className="mr-2"/> Your Details</h3>
                  <div>
                      <label htmlFor="name" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Your Name / Company</label>
                      <input type="text" id="name" name="name" value={invoiceData.company.name} onChange={handleCompanyDataChange} placeholder="e.g., John Doe" className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"/>
                  </div>
                  <div>
                      <label htmlFor="logoUrl" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Logo</label>
                      <button onClick={() => logoInputRef.current?.click()} className="w-full border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/80 transition-all duration-300 group flex items-center justify-center gap-2">
                          <UploadCloud className="text-slate-400 group-hover:text-indigo-600" size={20}/>
                          <span className="text-slate-600 font-semibold">{logoFilename ? 'Change Logo' : 'Upload Logo'}</span>
                      </button>
                      <input type="file" accept="image/png, image/jpeg" onChange={handleLogoUpload} ref={logoInputRef} className="hidden" />
                      {logoFilename && (
                        <div className="flex items-center justify-center mt-2 text-sm text-slate-500">
                          <FileImage size={16} className="mr-2" />
                          <span>{logoFilename}</span>
                        </div>
                      )}
                  </div>
                   <div>
                      <label htmlFor="address" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Your Address</label>
                      <textarea id="address" name="address" value={invoiceData.company.address} onChange={handleCompanyDataChange} placeholder="123 Example St..." className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" rows={2}></textarea>
                  </div>
                  <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Your Email</label>
                      <input type="email" id="email" name="email" value={invoiceData.company.email} onChange={handleCompanyDataChange} placeholder="you@example.com" className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"/>
                  </div>
                   <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Your Phone</label>
                      <input type="tel" id="phone" name="phone" value={invoiceData.company.phone} onChange={handleCompanyDataChange} placeholder="+1 (555) 123-4567" className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"/>
                  </div>
                   <div>
                      <label htmlFor="portfolio" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Website / Portfolio</label>
                      <input type="text" id="portfolio" name="portfolio" value={invoiceData.company.portfolio} onChange={handleCompanyDataChange} placeholder="yourwebsite.com" className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"/>
                  </div>
              </div>
            )}
            
            <div className={`${profileKey === 'custom' ? 'border-t border-slate-200 dark:border-slate-700 pt-6' : ''} space-y-4`}>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 flex items-center"><User size={20} className="mr-2"/> Client Details</h3>
              <div>
                <label htmlFor="clientName" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Client Name</label>
                <input type="text" id="clientName" name="clientName" value={invoiceData.client.name} onChange={handleDataChange} placeholder="e.g., Acme Corporation" className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"/>
              </div>
              <div>
                <label htmlFor="clientAddress" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Client Address</label>
                <textarea id="clientAddress" name="clientAddress" value={invoiceData.client.address} onChange={handleDataChange} placeholder="Client's full address" className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" rows={3}></textarea>
              </div>
            </div>
            
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="invoiceNumber" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Invoice #</label>
                  <input type="text" id="invoiceNumber" name="invoiceNumber" value={invoiceData.invoiceNumber} onChange={handleDataChange} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"/>
                </div>
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Due Date</label>
                  <input type="date" id="dueDate" name="dueDate" value={invoiceData.dueDate} onChange={handleDataChange} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"/>
                </div>
              </div>
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Currency</label>
                <div className="relative">
                  <select id="currency" name="currency" value={currency} onChange={handleCurrencyChange} className="w-full px-3 py-2 appearance-none bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="PHP">PHP (₱)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
               <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Items</h3>
               <div className="space-y-4">
                  {invoiceData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <input type="text" value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} placeholder="Description" className="sm:col-span-5 px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"/>
                      <input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} placeholder="Qty" className="sm:col-span-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"/>
                      <input type="number" value={item.rate} onChange={(e) => handleItemChange(index, 'rate', e.target.value)} placeholder="Rate" className="sm:col-span-3 px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"/>
                      <button onClick={() => removeItem(index)} className="sm:col-span-2 text-red-500 hover:text-red-700 flex justify-center items-center h-full"><Trash2 size={18}/></button>
                    </div>
                  ))}
                  <button onClick={addItem} className="w-full py-2 border-dashed border-2 border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold flex items-center justify-center gap-2"><Plus size={16}/> Add Item</button>
               </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-6 space-y-6">
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Notes</label>
                <textarea id="notes" name="notes" value={invoiceData.notes} onChange={handleDataChange} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" rows={3}></textarea>
              </div>
              <div>
                <label htmlFor="paymentDetails" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Payment Options</label>
                <textarea id="paymentDetails" name="paymentDetails" value={invoiceData.paymentDetails} onChange={handleCompanyDataChange} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" rows={4}></textarea>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-6">
              <label htmlFor="isPaid" className="text-sm font-medium text-slate-700 dark:text-slate-300">Mark as Paid</label>
              <div className="relative inline-block w-10 align-middle select-none">
                  <input type="checkbox" name="isPaid" id="isPaid" checked={invoiceData.isPaid} onChange={handleDataChange} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-4 border-slate-300 dark:border-slate-600 appearance-none cursor-pointer transition-all duration-200 ease-in-out"/>
                  <label htmlFor="isPaid" className="toggle-label block overflow-hidden h-6 rounded-full bg-slate-300 dark:bg-slate-600 cursor-pointer"></label>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="lg:sticky top-12">
                <div className="w-full max-w-[210mm] mx-auto bg-white rounded-lg shadow-2xl overflow-hidden aspect-[1/1.414]">
                    <div className="overflow-y-auto h-full">
                        <InvoiceTemplate data={invoiceData} currency={currency} ref={invoiceRef} />
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}