'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Payment Page
        </h1>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
          <p className="text-gray-600 dark:text-gray-300">
            Payment functionality will be restored after debugging.
          </p>
        </div>
      </div>
    </div>
  );
}
