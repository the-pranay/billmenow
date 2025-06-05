export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Refund Policy
          </h1>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              <strong>Last updated:</strong> January 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                1. Our Refund Commitment
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                At BillMeNow, we stand behind our service and want you to be completely satisfied. 
                Our refund policy is designed to be fair and straightforward while protecting both 
                our customers and our business.
              </p>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-green-800 dark:text-green-200 text-sm font-medium">
                  <strong>Money-Back Guarantee:</strong> We offer a 30-day money-back guarantee 
                  for all new subscriptions.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                2. Eligible Refund Scenarios
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You may be eligible for a refund in the following situations:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li><strong>30-Day Money-Back Guarantee:</strong> New subscribers can request a full refund within 30 days</li>
                <li><strong>Service Outage:</strong> Extended service interruptions exceeding our SLA commitments</li>
                <li><strong>Billing Errors:</strong> Incorrect charges or duplicate payments</li>
                <li><strong>Involuntary Charges:</strong> Charges made without proper authorization</li>
                <li><strong>Technical Issues:</strong> Critical bugs that prevent core functionality usage</li>
                <li><strong>Account Compromise:</strong> Unauthorized access resulting in unwanted charges</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                3. Non-Refundable Scenarios
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Refunds are generally not provided in these situations:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>Subscriptions active for more than 30 days (except for specific circumstances)</li>
                <li>Cancellations due to change of mind after the 30-day period</li>
                <li>Partial month refunds for subscription cancellations</li>
                <li>Third-party transaction fees and processing charges</li>
                <li>Services used in violation of our Terms of Service</li>
                <li>Refunds requested after data export or account deletion</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                4. Refund Types and Timeframes
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                    Full Refunds
                  </h3>
                  <ul className="list-disc pl-4 text-blue-800 dark:text-blue-200 space-y-1 text-sm">
                    <li>30-day money-back guarantee</li>
                    <li>Billing errors and duplicate charges</li>
                    <li>Service fails to meet advertised features</li>
                    <li>Processing time: 5-10 business days</li>
                  </ul>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3">
                    Partial Refunds
                  </h3>
                  <ul className="list-disc pl-4 text-purple-800 dark:text-purple-200 space-y-1 text-sm">
                    <li>Extended service outages</li>
                    <li>Pro-rated for significant service degradation</li>
                    <li>Case-by-case evaluation</li>
                    <li>Processing time: 7-14 business days</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                5. How to Request a Refund
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Step 1: Contact Support</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Email us at refunds@billmenow.com with your refund request. Include your account 
                    email, subscription details, and reason for the refund.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Step 2: Provide Information</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Include transaction ID, billing date, and any relevant screenshots or 
                    documentation supporting your request.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Step 3: Review Process</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Our team will review your request within 2-3 business days and respond with 
                    our decision and next steps.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Step 4: Processing</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Approved refunds are processed back to your original payment method within 
                    5-10 business days.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                6. Payment Method Specific Information
              </h2>
              <div className="space-y-4">
                <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Credit/Debit Cards</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Refunds appear as a credit on your statement within 5-10 business days. 
                    The exact timing depends on your bank's processing schedule.
                  </p>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Digital Wallets (PayPal, etc.)</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Refunds are typically processed within 3-5 business days and appear in 
                    your wallet balance immediately upon processing.
                  </p>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Bank Transfers</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Direct bank refunds may take 7-14 business days to appear in your account, 
                    depending on international banking procedures.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                7. Special Circumstances
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We may consider refunds outside our standard policy for:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>Medical emergencies or hardship situations</li>
                <li>Business closure or bankruptcy</li>
                <li>Legal compliance requirements</li>
                <li>Service failures beyond our control</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400 mt-4">
                These requests are evaluated case-by-case and may require additional documentation.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                8. Chargebacks and Disputes
              </h2>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  <strong>Important:</strong> Before initiating a chargeback with your bank, 
                  please contact our support team. We can often resolve issues more quickly 
                  and avoid chargeback fees that may be passed on to you.
                </p>
              </div>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mt-4">
                <li>Chargebacks may result in account suspension until resolved</li>
                <li>We reserve the right to provide transaction documentation to payment processors</li>
                <li>Chargeback fees may be collected if the dispute is found invalid</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                9. Contact Information for Refunds
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Refund Requests</h3>
                  <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
                    <li>Email: refunds@billmenow.com</li>
                    <li>Subject: "Refund Request - [Your Account Email]"</li>
                    <li>Response time: 2-3 business days</li>
                  </ul>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">General Support</h3>
                  <ul className="text-green-800 dark:text-green-200 text-sm space-y-1">
                    <li>Email: support@billmenow.com</li>
                    <li>Live chat: Available in app</li>
                    <li>Response time: Within 24 hours</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                10. Policy Updates
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We may update this refund policy from time to time. Significant changes will be 
                communicated via email and posted on our website. The updated policy will apply 
                to all future transactions and may affect existing subscriptions where legally permissible.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
