import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);

  const features = [
    {
      icon: "👥",
      title: "Community Savings",
      description: "Foster trust with transparent group savings."
    },
    {
      icon: "💰",
      title: "Smart Payouts",
      description: "Automated, fair fund distribution."
    },
    {
      icon: "📊",
      title: "Real-time Tracking",
      description: "Instantly monitor contributions and progress."
    },
    {
      icon: "🔒",
      title: "Secure & Trusted",
      description: "Bank-level security for your money and data."
    }
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className={`text-center max-w-3xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Hero Section */}
          <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            🌟 Modern Community Savings
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight">
            KraLoan Susu Savings
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join a trusted platform to manage your susu group, track contributions, and ensure transparent payouts.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/register"
              className="relative px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold text-lg shadow-md hover:shadow-lg hover:bg-blue-700 transform hover:-translate-y-1 transition-all duration-300"
            >
              Create a Group
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold text-lg shadow-md hover:shadow-lg border border-blue-200 hover:border-blue-300 transform hover:-translate-y-1 transition-all duration-300"
            >
              Join a Group
            </Link>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-gray-500 text-sm">
        <p>© 2025 KraLoan. Empowering communities through savings.</p>
      </footer>
    </div>
  );
}