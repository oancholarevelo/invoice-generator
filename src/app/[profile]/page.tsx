// src/app/[profile]/page.tsx
'use client';

import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import InvoiceTemplate, { InvoiceData, Item } from '@/components/InvoiceTemplate';
import { profiles } from '@/lib/profiles';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { FileDown, User, ChevronsLeft, Plus, Trash2, ChevronDown } from 'lucide-react';

// Function to calculate and format the due date
const getDueDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 15); // Add 15 days
  return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
};

export default function InvoicePage() {
  const params = useParams();
  const profileKey = params.profile as string;
  const userProfile = profiles[profileKey];

  if (!userProfile) {
    notFound();
  }
  
  const [currency, setCurrency] = useState('PHP');

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    company: userProfile,
    client: { name: '', address: '' },
    invoiceNumber: `${new Date().getFullYear()}-001`,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: getDueDate(),
    items: [{ description: 'Website Development', quantity: 1, rate: 1000 }],
    notes: 'If you have any questions concerning this invoice, use the following contact information:',
    subtotal: 0,
    total: 0,
  });

  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const subtotal = invoiceData.items.reduce((acc, item) => acc + item.quantity * item.rate, 0);
    const total = subtotal;
    setInvoiceData(prev => ({ ...prev, subtotal, total }));
  }, [invoiceData.items]);

  const handleDataChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'clientName') setInvoiceData({ ...invoiceData, client: { ...invoiceData.client, name: value } });
    else if (name === 'clientAddress') setInvoiceData({ ...invoiceData, client: { ...invoiceData.client, address: value } });
    else setInvoiceData({ ...invoiceData, [name]: value });
  };
  
  const handleCurrencyChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setCurrency(e.target.value);
  };

  const handleItemChange = (index: number, field: keyof Item, value: string) => {
    const newItems = [...invoiceData.items];
    const itemToUpdate = { ...newItems[index] };

    if (field === 'description') {
        itemToUpdate[field] = value;
    } else if (field === 'quantity' || field === 'rate') {
        itemToUpdate[field] = parseFloat(value) || 0;
    }

    newItems[index] = itemToUpdate;
    setInvoiceData({ ...invoiceData, items: newItems });
};

  const addItem = () => {
    setInvoiceData({ ...invoiceData, items: [...invoiceData.items, { description: '', quantity: 1, rate: 0 }] });
  };

  const removeItem = (index: number) => {
    setInvoiceData({ ...invoiceData, items: invoiceData.items.filter((_, i) => i !== index) });
  };

  const handleGeneratePdf = () => {
    const input = invoiceRef.current;
    if (input) {
      // Reverted to using 'mm' to preserve the layout
      const a4Width = '210mm';
      const a4Height = '297mm';

      const originalWidth = input.style.width;
      const originalHeight = input.style.height;
      input.style.width = a4Width;
      input.style.height = a4Height;

      html2canvas(input, {
        scale: 2, // Using a higher scale for better image quality
        windowHeight: input.scrollHeight,
        windowWidth: input.scrollWidth,
        onclone: (clonedDoc) => {
          // This ensures the PDF is always in light mode
          clonedDoc.documentElement.classList.remove('dark');
        }
      }).then((canvas) => {
        // Restore original size after capture
        input.style.width = originalWidth;
        input.style.height = originalHeight;

        // Use JPEG format with quality setting for smaller file size
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
    <main className="p-4 sm:p-8 lg:p-12 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl shadow-md backdrop-blur-lg p-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Create Invoice</h1>
            <div className="flex items-center gap-2 mt-2 text-slate-500 dark:text-slate-400">
              <User size={16} />
              <span className="font-semibold">{userProfile.name}</span>
            </div>
          </div>
          {/* UPDATED: Buttons are now grouped together */}
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
            <div>
              <label htmlFor="clientName" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Client Name</label>
              <input type="text" id="clientName" name="clientName" value={invoiceData.client.name} onChange={handleDataChange} placeholder="e.g., Acme Corporation" className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"/>
            </div>
            <div>
              <label htmlFor="clientAddress" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Client Address</label>
              <textarea id="clientAddress" name="clientAddress" value={invoiceData.client.address} onChange={handleDataChange} placeholder="Client's full address" className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" rows={3}></textarea>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="invoiceNumber" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Invoice #</label>
                <input type="text" id="invoiceNumber" name="invoiceNumber" value={invoiceData.invoiceNumber} onChange={handleDataChange} className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"/>
              </div>
               <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Due Date</label>
                <input type="date" id="dueDate" name="dueDate" value={invoiceData.dueDate} onChange={handleDataChange} className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"/>
              </div>
            </div>
            
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Currency</label>
              {/* UPDATED: Wrapped select in a relative div and added a custom chevron icon for balanced padding */}
              <div className="relative">
                <select id="currency" name="currency" value={currency} onChange={handleCurrencyChange} className="w-full px-3 py-2 appearance-none bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="PHP">PHP (₱)</option>
                  <option value="USD">USD ($)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
               <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Items</h3>
               <div className="space-y-4">
                  {invoiceData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <input type="text" value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} placeholder="Description" className="sm:col-span-5 p-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"/>
                      <input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} placeholder="Qty" className="sm:col-span-2 p-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"/>
                      <input type="number" value={item.rate} onChange={(e) => handleItemChange(index, 'rate', e.target.value)} placeholder="Rate" className="sm:col-span-3 p-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"/>
                      <button onClick={() => removeItem(index)} className="sm:col-span-2 text-red-500 hover:text-red-700 flex justify-center items-center h-full"><Trash2 size={18}/></button>
                    </div>
                  ))}
                  <button onClick={addItem} className="w-full py-2 border-dashed border-2 border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold flex items-center justify-center gap-2"><Plus size={16}/> Add Item</button>
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
                {/* MOVED the download button to the header */}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}