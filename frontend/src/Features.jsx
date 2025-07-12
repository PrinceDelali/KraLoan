import React, { useState } from 'react';
import { ArrowLeft, Users, DollarSign, BarChart3, Bell, Shield, Star, Zap, TrendingUp } from 'lucide-react';

export default function Features() {
  const [hoveredCard, setHoveredCard] = useState(null);

  const features = [
    {
      icon: Users,
      title: "Community Savings",
      description: "Foster trust with transparent group savings and easy management.",
      details: "Create and manage savings groups with up to 50 members. Track contributions, set goals, and build financial communities.",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50"
    },
    {
      icon: DollarSign,
      title: "Smart Payouts",
      description: "Automated, fair fund distribution to all group members.",
      details: "AI-powered payout system ensures fairness and transparency. Automated scheduling and instant transfers.",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Instantly monitor contributions, payouts, and group progress.",
      details: "Comprehensive dashboards with visual charts, progress tracking, and detailed financial insights.",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50"
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Get reminders for due payments, confirmations, and payout turns.",
      details: "Customizable alerts via SMS, email, and push notifications. Never miss a payment deadline.",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50"
    },
    {
      icon: Shield,
      title: "Bank-Grade Security",
      description: "Military-grade encryption for your data and transactions.",
      details: "256-bit SSL encryption, two-factor authentication, and compliance with international security standards.",
      color: "from-indigo-500 to-blue-500",
      bgColor: "bg-indigo-50"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Instant transfers and real-time updates across all devices.",
      details: "Sub-second transaction processing with 99.9% uptime guarantee and instant synchronization.",
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50"
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Users", icon: Users },
    { number: "₵2M+", label: "Total Saved", icon: TrendingUp },
    { number: "1K+", label: "Groups Created", icon: Star },
    { number: "99.9%", label: "Uptime", icon: Zap }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-1/2 w-60 h-60 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 p-6 lg:p-8">
        {/* Header with Back Button */}
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <button 
              className="group flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-all duration-300 hover:scale-105"
              onClick={() => window.history.back()}
            >
              <div className="p-2 rounded-full bg-white shadow-md group-hover:shadow-lg group-hover:bg-blue-50 transition-all duration-300">
                <ArrowLeft className="w-5 h-5" />
              </div>
              <span className="font-medium">Back</span>
            </button>
            
            <div className="text-right">
              <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Features
              </h1>
              <p className="text-slate-600 text-lg">Powerful tools for community savings</p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white mb-3">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold text-slate-800 mb-1">{stat.number}</div>
                <div className="text-slate-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 hover:bg-white hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer border border-white/20 ${
                  hoveredCard === index ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                }`}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Gradient overlay */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-600 mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  {/* Expandable details */}
                  <div className={`overflow-hidden transition-all duration-300 ${
                    hoveredCard === index ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="pt-4 border-t border-slate-200">
                      <p className="text-sm text-slate-500 leading-relaxed">
                        {feature.details}
                      </p>
                    </div>
                  </div>
                  
                  {/* Arrow indicator */}
                  <div className={`mt-4 flex items-center text-blue-600 font-medium text-sm transition-all duration-300 ${
                    hoveredCard === index ? 'translate-x-2 opacity-100' : 'translate-x-0 opacity-0'
                  }`}>
                    <span className="mr-2">Learn more</span>
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                  Ready to start saving together?
                </h2>
                <p className="text-xl mb-8 opacity-90">
                  Join thousands of people building financial communities
                </p>
                <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg">
                  Get Started Today
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}