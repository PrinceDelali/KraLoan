import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import { motion } from 'framer-motion';

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);

  const features = [
    {
      icon: "👥",
      title: "Community Savings",
      description: "Foster trust with transparent group savings and real-time collaboration."
    },
    {
      icon: "💰",
      title: "Smart Payouts",
      description: "Automated, fair fund distribution with intelligent scheduling."
    },
    {
      icon: "📊",
      title: "Real-time Tracking",
      description: "Instantly monitor contributions, progress, and financial insights."
    },
    {
      icon: "🔒",
      title: "Secure & Trusted",
      description: "Bank-level security protocols protecting your money and data."
    }
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15 + 0.2,
        duration: 0.7,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden relative">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-teal-400/30 to-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
      </div>

      {/* Header */}
      <Header forcePublic={true} />

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={fadeUp}
          className={`text-center max-w-4xl mx-auto`}
        >
          {/* Badge */}
          <motion.div
            custom={0}
            variants={fadeUp}
            className="inline-flex items-center px-6 py-2 bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-full text-sm font-semibold text-blue-700 mb-8 shadow-lg"
          >
            <span className="mr-2">🌟</span>
            Modern Community Savings Platform
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            custom={1}
            variants={fadeUp}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              KraLoan
            </span>
            <br />
            <span className="text-gray-800">Susu Savings</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            custom={2}
            variants={fadeUp}
            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light"
          >
            Transform your community savings with our trusted platform. Manage groups, track contributions, and ensure transparent payouts with bank-level security.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            custom={3}
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
          >
            <Link
              to="/register"
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border-0"
            >
              <span className="relative z-10">Create a Group</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link
              to="/login"
              className="group px-8 py-4 bg-white/90 backdrop-blur-sm text-gray-800 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl border border-gray-200/50 hover:border-gray-300/50 transform hover:-translate-y-1 transition-all duration-300"
            >
              Join a Group
            </Link>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <div className="w-full max-w-7xl mx-auto px-4">
          <motion.div
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={fadeUp}
            custom={4}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose KraLoan?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built for communities, designed for trust, and engineered for security.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
                variants={fadeUp}
                custom={5 + index}
                className="group p-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 border border-white/50 hover:border-blue-200/50"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={fadeUp}
          custom={10}
          className="w-full max-w-4xl mx-auto mt-20 px-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-white/50">
              <div className="text-3xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-gray-600">Active Groups</div>
            </div>
            <div className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-white/50">
              <div className="text-3xl font-bold text-purple-600 mb-2">$2M+</div>
              <div className="text-gray-600">Total Savings</div>
            </div>
            <div className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-white/50">
              <div className="text-3xl font-bold text-indigo-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Enhanced Footer */}
      <footer className="relative z-10 py-12 bg-white/80 backdrop-blur-sm border-t border-gray-200/50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600 text-lg mb-4">
            © 2025 KraLoan. Empowering communities through secure savings.
          </p>
          <p className="text-gray-500 text-sm">
            Built with ❤️ for community trust and financial growth.
          </p>
        </div>
      </footer>
    </div>
  );
}