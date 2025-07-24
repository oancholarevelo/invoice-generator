// src/components/InvoiceTemplate.tsx
import React from 'react';
import Image from 'next/image';
import { Profile } from '@/lib/profiles';

export interface Item {
  description: string;
  quantity: number;
  rate: number;
}
export interface InvoiceData {
  company: Profile;
  client: { name: string; address: string; };
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  items: Item[];
  subtotal: number;
  total: number;
  notes: string;
}
interface InvoiceTemplateProps {
  data: InvoiceData;
  currency: string;
}

const getCurrencySymbol = (currency: string) => {
  switch (currency) {
    case 'PHP':
      return '₱';
    case 'USD':
      return '$';
    default:
      return '$';
  }
};

const InvoiceTemplate = React.forwardRef<HTMLDivElement, InvoiceTemplateProps>(({ data, currency }, ref) => {
  const currencySymbol = getCurrencySymbol(currency);

  return (
    <div ref={ref} className="flex flex-col p-4 sm:p-10 bg-white w-full min-h-full">
      
      <div className="flex-grow">
        <div className="flex justify-between">
          <div>
            <Image src={data.company.logoUrl} alt={`${data.company.name} Logo`} width={200} height={200} className="h-16 w-auto" priority />
          </div>
          <div className="text-end">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">Invoice</h2>
            <span className="mt-1 block text-gray-500"># {data.invoiceNumber}</span>
            <address className="mt-4 not-italic text-gray-800" dangerouslySetInnerHTML={{ __html: data.company.address.replace(/\n/g, '<br />') }} />
          </div>
        </div>

        <div className="mt-8 grid sm:grid-cols-2 gap-3">
          <div>
            <h3 className="text-base font-semibold text-gray-800">Bill to:</h3>
            <h3 className="text-base font-semibold text-gray-800">{data.client.name}</h3>
            <address className="mt-2 not-italic text-gray-500" dangerouslySetInnerHTML={{ __html: data.client.address.replace(/\n/g, '<br />') }} />
          </div>
          <div className="sm:text-end space-y-2">
            <dl className="grid sm:grid-cols-5 gap-x-3">
              <dt className="col-span-3 font-semibold text-gray-800">Invoice date:</dt>
              <dd className="col-span-2 text-gray-500">{data.invoiceDate}</dd>
            </dl>
            <dl className="grid sm:grid-cols-5 gap-x-3">
              <dt className="col-span-3 font-semibold text-gray-800">Due date:</dt>
              <dd className="col-span-2 text-gray-500">{data.dueDate}</dd>
            </dl>
          </div>
        </div>

        <div className="mt-6">
          <div className="border border-gray-200 p-4 rounded-lg space-y-4">
            <div className="hidden sm:grid sm:grid-cols-5">
              <div className="sm:col-span-2 text-xs font-medium text-gray-500 uppercase">Item</div>
              <div className="text-start text-xs font-medium text-gray-500 uppercase">Qty</div>
              <div className="text-start text-xs font-medium text-gray-500 uppercase">Rate</div>
              <div className="text-end text-xs font-medium text-gray-500 uppercase">Amount</div>
            </div>
            <div className="hidden sm:block border-b border-gray-200"></div>
            {data.items.map((item, index) => (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2" key={index}>
                <div className="col-span-full sm:col-span-2"><p className="font-medium text-gray-800">{item.description}</p></div>
                <div><p className="text-gray-800">{item.quantity}</p></div>
                <div><p className="text-gray-800">{currencySymbol}{item.rate.toFixed(2)}</p></div>
                <div><p className="sm:text-end text-gray-800">{currencySymbol}{(item.quantity * item.rate).toFixed(2)}</p></div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex sm:justify-end">
          <div className="w-full max-w-2xl sm:text-end space-y-2">
            <dl className="grid sm:grid-cols-5 gap-x-3">
              <dt className="col-span-3 font-semibold text-gray-800">Subtotal:</dt>
              <dd className="col-span-2 text-gray-500">{currencySymbol}{data.subtotal.toFixed(2)}</dd>
            </dl>
            <dl className="grid sm:grid-cols-5 gap-x-3">
              <dt className="col-span-3 font-bold text-lg text-gray-800">Total:</dt>
              <dd className="col-span-2 font-bold text-lg text-gray-800">{currencySymbol}{data.total.toFixed(2)}</dd>
            </dl>
          </div>
        </div>
      </div>
      
      <div className="mt-8 sm:mt-12 pt-8 border-t border-gray-200">
        <h4 className="text-lg font-semibold text-gray-800">Thank you!</h4>
        <p className="text-gray-500">{data.notes}</p>
        <div className="mt-2">
          <p className="block text-sm font-medium text-gray-800">{data.company.email}</p>
          <p className="block text-sm font-medium text-gray-800">{data.company.phone}</p>
          <a href={`https://${data.company.portfolio}`} target="_blank" rel="noopener noreferrer" className="block text-sm font-medium text-indigo-600 hover:text-indigo-500">{data.company.portfolio}</a>
        </div>
        <p className="mt-5 text-sm text-gray-500">© {new Date().getFullYear()} {data.company.name}.</p>
      </div>
    </div>
  );
});

InvoiceTemplate.displayName = 'InvoiceTemplate';
export default InvoiceTemplate;