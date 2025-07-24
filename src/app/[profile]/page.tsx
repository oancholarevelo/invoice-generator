// src/app/[profile]/page.tsx
'use client';

import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import InvoiceTemplate, { InvoiceData, Item } from '@/components/InvoiceTemplate';
import { profiles } from '@/lib/profiles';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FileDown, User, ChevronsLeft, Plus, Trash2 } from 'lucide-react';

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

  // If profile doesn't exist, show a 404 page
  if (!userProfile) {
    notFound();
  }

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

  const handleItemChange = (index: number, field: keyof Item, value: string) => {
    const newItems = [...invoiceData.items];
    const numValue = field === 'description' ? value : parseFloat(value) || 0;
    (newItems[index] as any)[field] = numValue;
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
      // Temporarily set a fixed width to ensure consistency
      input.style.width = '210mm';
      html2canvas(input, { scale: 2 }).then((canvas) => {
        // Restore original width
        input.style.width = '';
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`invoice-${invoiceData.invoiceNumber}.pdf`);
      });
    }
  };

  return (
    <main className="p-4 sm:p-8 lg:p-12 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Create Invoice</h1>
            <div className="flex items-center gap-2 mt-2 text-slate-500 dark:text-slate-400">
              <User size={16} />
              <span className="font-semibold">{userProfile.name}</span>
            </div>
          </div>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:underline">
            <ChevronsLeft size={16} />
            Switch User
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Form Section */}
          <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl space-y-6">
             {/* ... Form content remains the same ... */}
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

          {/* Preview Section */}
          <div className="lg:col-span-3">
            <div className="lg:sticky top-12">
                <div className="w-full max-w-[210mm] mx-auto bg-white rounded-lg shadow-2xl overflow-hidden">
                    <div className="aspect-[1/1.414] overflow-y-auto">
                        <InvoiceTemplate data={invoiceData} ref={invoiceRef} />
                    </div>
                </div>
                <div className="mt-6 flex justify-end max-w-[210mm] mx-auto">
                  <button onClick={handleGeneratePdf} className="py-2.5 px-6 inline-flex items-center gap-2 text-sm font-semibold rounded-lg border-transparent bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                      <FileDown size={16}/>
                      Download PDF
                  </button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}