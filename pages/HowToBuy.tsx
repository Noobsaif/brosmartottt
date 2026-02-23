import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const HowToBuy: React.FC = () => {
  const steps = [
    {
      title: "Select Product",
      desc: "Browse our shop and choose the subscription you want.",
      icon: "fa-cart-shopping"
    },
    {
      title: "Make Payment",
      desc: "Send money to our bKash/Nagad Personal number using 'Send Money'.",
      icon: "fa-money-bill-wave"
    },
    {
      title: "Submit Order",
      desc: "Fill out the checkout form with your Phone Number and TrxID.",
      icon: "fa-file-invoice"
    },
    {
      title: "Get Delivery",
      desc: "Wait 10-30 mins. Your ID & Password will appear in your Dashboard.",
      icon: "fa-gift"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 py-12 px-4 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">How to Order</h1>
          <p className="text-gray-500 dark:text-gray-400">Follow these simple steps to get your premium subscription instantly.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center relative overflow-hidden"
            >
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center text-xl mx-auto mb-4">
                <i className={`fa-solid ${step.icon}`}></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{step.desc}</p>
              <div className="absolute -right-4 -bottom-4 text-9xl font-bold text-gray-50 dark:text-gray-800 -z-10 opacity-50">{index + 1}</div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 md:p-12"
        >
           <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Payment Numbers</h2>
           <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-pink-500 p-6 rounded-xl text-white text-center shadow-lg shadow-pink-500/30">
                 <h3 className="font-bold text-lg mb-1">bKash Personal</h3>
                 <p className="text-2xl font-mono">01700-000000</p>
              </div>
              <div className="bg-orange-500 p-6 rounded-xl text-white text-center shadow-lg shadow-orange-500/30">
                 <h3 className="font-bold text-lg mb-1">Nagad Personal</h3>
                 <p className="text-2xl font-mono">01700-000000</p>
              </div>
              <div className="bg-purple-600 p-6 rounded-xl text-white text-center shadow-lg shadow-purple-600/30">
                 <h3 className="font-bold text-lg mb-1">Rocket Personal</h3>
                 <p className="text-2xl font-mono">01700-000000-8</p>
              </div>
           </div>
           
           <div className="text-center mt-12">
             <Link to="/products">
               <Button className="px-8 py-4 text-lg">Browse Shop Now</Button>
             </Link>
           </div>
        </motion.div>
      </div>
    </div>
  );
};