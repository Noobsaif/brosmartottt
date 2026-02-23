import React from 'react';
import { motion } from 'framer-motion';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 py-12 px-4 transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 md:p-12"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last Updated: October 2023</p>

        <div className="space-y-8 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Information We Collect</h2>
            <p className="leading-relaxed">
              At BrosMart OTT, we collect minimal information necessary to process your orders and provide support. This includes:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>**Personal Information:** Name, Email address, and Phone number.</li>
              <li>**Order Information:** Transaction IDs (TrxID) and payment methods used (bKash/Nagad/Rocket).</li>
              <li>**Technical Data:** IP address and browser type for security purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. How We Use Your Information</h2>
            <p className="leading-relaxed">
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>To deliver purchased subscription credentials (ID/Password) to your dashboard.</li>
              <li>To verify payments manually using the provided Transaction ID.</li>
              <li>To provide customer support and troubleshoot account issues.</li>
              <li>To send important updates regarding your subscription expiration or renewal.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Data Security</h2>
            <p className="leading-relaxed">
              We take data security seriously. We do **not** store sensitive payment information like credit card numbers or PINs. All payments are processed manually via secure mobile banking channels. Your passwords and account details are stored securely in our database.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Third-Party Sharing</h2>
            <p className="leading-relaxed">
              We do not sell, trade, or rent your personal identification information to others. We may share generic aggregated demographic information not linked to any personal identification information regarding visitors and users with our business partners for analytical purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. Contact Us</h2>
            <p className="leading-relaxed">
              If you have any questions about this Privacy Policy, the practices of this site, or your dealings with this site, please contact us at: <br/>
              <span className="font-semibold text-orange-600">support@brosmart.com</span>
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
};