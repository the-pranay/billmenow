export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Cookie Policy
          </h1>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              <strong>Last updated:</strong> January 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                1. What Are Cookies?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Cookies are small text files that are stored on your device (computer, tablet, or mobile) 
                when you visit our website. They help us provide you with a better experience by remembering 
                your preferences and analyzing how you use our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                2. How We Use Cookies
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                BillMeNow uses cookies for several purposes:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>Keeping you logged in to your account</li>
                <li>Remembering your preferences and settings</li>
                <li>Analyzing website performance and usage</li>
                <li>Providing personalized content and features</li>
                <li>Preventing fraud and enhancing security</li>
                <li>Measuring the effectiveness of our marketing campaigns</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                3. Types of Cookies We Use
              </h2>
              
              <div className="space-y-6">
                <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Essential Cookies (Always Active)
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    These cookies are necessary for the website to function properly.
                  </p>
                  <ul className="list-disc pl-4 text-gray-600 dark:text-gray-400 text-sm space-y-1">
                    <li><strong>Authentication:</strong> Keep you logged in during your session</li>
                    <li><strong>Security:</strong> Protect against cross-site request forgery</li>
                    <li><strong>Session Management:</strong> Maintain your application state</li>
                    <li><strong>Load Balancing:</strong> Distribute server load effectively</li>
                  </ul>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Functional Cookies
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    These cookies enhance your experience by remembering your choices.
                  </p>
                  <ul className="list-disc pl-4 text-gray-600 dark:text-gray-400 text-sm space-y-1">
                    <li><strong>Preferences:</strong> Remember your theme, language, and display settings</li>
                    <li><strong>Form Data:</strong> Save partially completed forms</li>
                    <li><strong>Widget Settings:</strong> Remember dashboard customizations</li>
                    <li><strong>Accessibility:</strong> Store accessibility preferences</li>
                  </ul>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Analytics Cookies
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    These cookies help us understand how you interact with our website.
                  </p>
                  <ul className="list-disc pl-4 text-gray-600 dark:text-gray-400 text-sm space-y-1">
                    <li><strong>Usage Statistics:</strong> Track page views, session duration</li>
                    <li><strong>Performance Monitoring:</strong> Identify slow-loading pages</li>
                    <li><strong>Error Tracking:</strong> Help us fix bugs and improve reliability</li>
                    <li><strong>Feature Usage:</strong> Understand which features are most popular</li>
                  </ul>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Marketing Cookies
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    These cookies help us deliver relevant advertisements and measure campaign effectiveness.
                  </p>
                  <ul className="list-disc pl-4 text-gray-600 dark:text-gray-400 text-sm space-y-1">
                    <li><strong>Ad Targeting:</strong> Show relevant advertisements</li>
                    <li><strong>Conversion Tracking:</strong> Measure marketing campaign success</li>
                    <li><strong>Retargeting:</strong> Show ads on other websites you visit</li>
                    <li><strong>Social Media:</strong> Enable social sharing features</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                4. Third-Party Cookies
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Some cookies are set by third-party services we use:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Analytics</h3>
                  <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
                    <li>Google Analytics</li>
                    <li>Mixpanel</li>
                    <li>Hotjar</li>
                  </ul>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Support</h3>
                  <ul className="text-green-800 dark:text-green-200 text-sm space-y-1">
                    <li>Intercom</li>
                    <li>Zendesk</li>
                    <li>Crisp Chat</li>
                  </ul>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Payment</h3>
                  <ul className="text-purple-800 dark:text-purple-200 text-sm space-y-1">
                    <li>Razorpay</li>
                    <li>Stripe</li>
                    <li>PayPal</li>
                  </ul>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Marketing</h3>
                  <ul className="text-orange-800 dark:text-orange-200 text-sm space-y-1">
                    <li>Google Ads</li>
                    <li>Facebook Pixel</li>
                    <li>LinkedIn Insight</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                5. Managing Your Cookie Preferences
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You have several options to manage cookies:
              </p>
              
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Cookie Settings (Recommended)</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    Use our cookie preference center to control which types of cookies you accept.
                  </p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                    Manage Cookie Preferences
                  </button>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Browser Settings</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Configure your browser to block all cookies or notify you when cookies are being sent.
                  </p>
                  <ul className="list-disc pl-4 text-gray-600 dark:text-gray-400 text-sm mt-2 space-y-1">
                    <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies</li>
                    <li><strong>Firefox:</strong> Preferences → Privacy & Security → Cookies</li>
                    <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
                    <li><strong>Edge:</strong> Settings → Cookies and site permissions</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    <strong>Note:</strong> Disabling essential cookies may affect website functionality 
                    and prevent you from accessing certain features.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                6. Cookie Retention Periods
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <thead className="bg-gray-50 dark:bg-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Cookie Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Retention Period</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Session</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Browser session</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Authentication</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Preferences</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">1 year</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">User settings</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Analytics</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">2 years</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Usage tracking</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Marketing</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">90 days</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Ad targeting</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                7. Your Rights
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Under applicable privacy laws, you have the right to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>Know what cookies are being used</li>
                <li>Control which cookies are set</li>
                <li>Withdraw consent at any time</li>
                <li>Access and delete cookie data</li>
                <li>Receive clear information about cookie usage</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                8. Updates to This Policy
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We may update this Cookie Policy from time to time to reflect changes in our 
                practices or applicable laws. We will notify you of significant changes and 
                update the "Last updated" date at the top of this policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                9. Contact Us
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                If you have questions about our use of cookies, please contact us:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>Email: privacy@billmenow.com</li>
                <li>Subject: "Cookie Policy Question"</li>
                <li>Address: BillMeNow Privacy Team, [Your Business Address]</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
