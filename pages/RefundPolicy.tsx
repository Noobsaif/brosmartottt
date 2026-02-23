import React from 'react';
import { motion } from 'framer-motion';

export const RefundPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 py-12 px-4 transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 md:p-12"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Warranty & Refund Policy</h1>
        
        <div className="space-y-8 text-gray-700 dark:text-gray-300">
          <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-xl border border-orange-100 dark:border-orange-900/30">
            <h3 className="text-lg font-bold text-orange-800 dark:text-orange-300 mb-2">🛡️ Full Term Warranty</h3>
            <p>
              We provide a full warranty for the entire duration of your subscription (e.g., 1 Month, 6 Months). If your account stops working or reverts to a free plan, we will fix it or provide a replacement.
            </p>
          </div>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Refund Eligibility</h2>
            <p className="leading-relaxed">
              Due to the nature of digital goods (credentials), we generally **do not offer refunds** once the account details have been delivered and verified as working. 
            </p>
            <p className="mt-2">However, a refund (partial or full) may be considered ONLY if:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>We are unable to deliver the product within 24 hours of payment.</li>
              <li>We are unable to replace a non-working account within 48 hours of reporting.</li>
              <li>The product is out of stock and you do not wish to wait.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Replacement Policy (Warranty)</h2>
            <p className="leading-relaxed">
              If you face any issues with your subscription, please follow these steps:
            </p>
            <ol className="list-decimal pl-5 mt-2 space-y-2">
              <li>Log in to your dashboard and note the Order ID.</li>
              <li>Contact our support via WhatsApp or Messenger.</li>
              <li>Provide a screenshot of the error message.</li>
              <li>We will verify the issue and provide a new password or a replacement account within 0-12 hours.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Voiding Warranty</h2>
            <p className="leading-relaxed">
              Your warranty will be immediately **VOID** if:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>You change the account email or password (unless permitted).</li>
              <li>You share the account credentials with others publicly.</li>
              <li>You try to change the plan or payment method of the account.</li>
              <li>You engage in abusive behavior with our support staff.</li>
            </ul>
          </section>
        </div>
      </motion.div>
    </div>
  );
};