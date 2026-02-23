import React from 'react';
import { motion } from 'framer-motion';

export const WhatsAppButton: React.FC = () => {
  return (
    <motion.a
      href="https://wa.me/8801700000000" // Replace with actual number
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 md:bottom-6 right-6 z-50 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/30 hover:bg-green-600 transition-colors"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, type: "spring", bounce: 0.5 }}
    >
      <i className="fa-brands fa-whatsapp text-3xl"></i>
    </motion.a>
  );
};
