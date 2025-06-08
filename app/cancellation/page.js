export default function CancellationPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Cancellation Policy
          </h1>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              <strong>Last updated:</strong> January 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                1. Subscription Cancellation
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">                You may cancel your BillMeNow subscription at any time through your account settings 
                or by contacting our support team. Here&apos;s what you need to know:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>Cancellations can be processed immediately or scheduled for the end of your billing cycle</li>
                <li>You will continue to have access to all features until the end of your current billing period</li>
                <li>No partial refunds are provided for unused time in monthly or annual subscriptions</li>
                <li>Your data will be retained for 90 days after cancellation for potential reactivation</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                2. How to Cancel
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You can cancel your subscription using any of these methods:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li><strong>Self-Service:</strong> Go to Settings → Subscription → Cancel Subscription</li>
                <li><strong>Email:</strong> Send a cancellation request to support@billmenow.com</li>
                <li><strong>Chat:</strong> Use our in-app chat support during business hours</li>
                <li><strong>Phone:</strong> Call our support line (available for premium customers)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                3. Immediate vs. End-of-Cycle Cancellation
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                    End-of-Cycle Cancellation (Recommended)
                  </h3>
                  <ul className="list-disc pl-4 text-blue-800 dark:text-blue-200 space-y-1 text-sm">
                    <li>Continue using all features until billing period ends</li>
                    <li>No immediate disruption to your workflow</li>
                    <li>Access to customer support throughout the period</li>
                    <li>Automatic data export reminders before expiration</li>
                  </ul>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-3">
                    Immediate Cancellation
                  </h3>
                  <ul className="list-disc pl-4 text-orange-800 dark:text-orange-200 space-y-1 text-sm">
                    <li>Account access terminates immediately</li>
                    <li>No refund for remaining subscription time</li>
                    <li>Limited to emergency situations</li>
                    <li>Data export must be completed beforehand</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                4. Free Trial Cancellation
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                If you&apos;re on a free trial:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>Cancel anytime during the trial period with no charges</li>
                <li>No credit card charges if cancelled before trial expires</li>
                <li>Account automatically converts to free plan if available</li>
                <li>Data is preserved according to free plan limitations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                5. Data Export Before Cancellation
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Before cancelling, we recommend exporting your data:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>Invoice data (PDF and CSV formats)</li>
                <li>Client contact information</li>
                <li>Payment history and reports</li>
                <li>Email templates and settings</li>
                <li>Custom branding and templates</li>
              </ul>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mt-4">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  <strong>Important:</strong> Data export is available for 90 days after cancellation. 
                  After this period, data may be permanently deleted according to our data retention policy.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                6. Reactivation
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Reactivating your account is simple:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>Log in with your existing credentials (within 90 days)</li>
                <li>Choose a subscription plan</li>
                <li>All your data will be restored automatically</li>
                <li>Previous settings and customizations are preserved</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                7. Account Deletion
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                If you want to permanently delete your account and all associated data:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>Contact our support team with a deletion request</li>
                <li>Provide account verification information</li>
                <li>Allow 5-10 business days for complete data removal</li>
                <li>This action is irreversible and cannot be undone</li>
              </ul>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mt-4">
                <p className="text-red-800 dark:text-red-200 text-sm">
                  <strong>Warning:</strong> Account deletion is permanent. All invoices, client data, 
                  and transaction history will be permanently removed and cannot be recovered.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                8. Cancellation Support
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Our support team is here to help with your cancellation:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>Email: support@billmenow.com</li>
                <li>Response time: Within 24 hours</li>
                <li>Live chat: Available during business hours (9 AM - 6 PM EST)</li>
                <li>Help articles: Available in our help center</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                9. Feedback and Improvement
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">                We value your feedback to improve our service. When cancelling, you&apos;ll have the 
                opportunity to share:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>Reasons for cancellation</li>
                <li>Suggestions for improvement</li>
                <li>Feature requests</li>
                <li>Overall experience feedback</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
