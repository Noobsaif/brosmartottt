import React from 'react';
import { motion } from 'framer-motion';

export const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 py-12 px-4 transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 md:p-12"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Terms of Service</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Effective Date: October 2023</p>

        <div className="space-y-8 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing and using BrosMart OTT, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Account Usage Rules</h2>
            <p className="leading-relaxed">
              To ensure the longevity of the accounts provided, users must adhere to the following rules:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong className="text-red-500">Do not change the password or email</strong> of the provided accounts unless explicitly told it is a "Private Account".</li>
              <li><strong className="text-red-500">Do not add or delete profiles</strong> on shared accounts. Use only the profile assigned to you.</li>
              <li><strong className="text-red-500">Do not share the credentials</strong> with others. Single-device plans are strictly for one device.</li>
            </ul>
            <p className="mt-2 text-sm italic text-gray-500">Violation of these rules will result in immediate termination of the warranty and account access without refund.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Payment & Delivery</h2>
            <p className="leading-relaxed">
              We operate on a manual verification system. After sending payment via bKash, Nagad, or Rocket, you must submit the correct Transaction ID (TrxID). Orders are typically processed within 10-60 minutes during business hours (10 AM - 12 AM).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Limitation of Liability</h2>
            <p className="leading-relaxed">
              BrosMart OTT is a reseller of digital subscriptions. We are not the owners of the OTT platforms (Netflix, Spotify, etc.). We are not liable for any server-side issues, downtime, or policy changes from the official platforms. However, we will do our best to provide a replacement account if issues arise.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. Termination</h2>
            <p className="leading-relaxed">
              We reserve the right to terminate or suspend your access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
};