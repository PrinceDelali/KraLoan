import React, { useState } from 'react';
import { ArrowLeft, Users, Building2, Target, Globe, Award, TrendingUp, Shield, Clock, MapPin, Mail, Phone } from 'lucide-react';

export default function About() {
  const [activeTab, setActiveTab] = useState('story');

  const stats = [
    { number: "50,000+", label: "Active Users", icon: Users },
    { number: "₵2.5M+", label: "Total Savings", icon: TrendingUp },
    { number: "1,200+", label: "Savings Groups", icon: Building2 },
    { number: "99.8%", label: "Success Rate", icon: Award }
  ];

  const leadership = [
    {
      name: "Kwame Asante",
      role: "Chief Executive Officer",
      education: "MBA, KNUST • BSc Computer Science, UG",
      experience: "Former Senior Product Manager at MTN Mobile Money with 8+ years in fintech",
      bio: "Passionate about financial inclusion and leveraging technology to solve real-world problems in African communities."
    },
    {
      name: "Dr. Ama Osei-Bonsu",
      role: "Chief Technology Officer",
      education: "PhD Computer Science, University of Oxford • MSc, University of Edinburgh",
      experience: "Former Lead Engineer at Revolut, previously at Google London",
      bio: "Expert in distributed systems and financial technology with a focus on security and scalability."
    },
    {
      name: "Kofi Mensah",
      role: "Chief Financial Officer",
      education: "CFA, CPA • MBA Finance, London Business School",
      experience: "Former Investment Director at Databank, 12+ years in financial services",
      bio: "Specialized in financial strategy, risk management, and regulatory compliance in emerging markets."
    },
    {
      name: "Akosua Adjei",
      role: "Chief Operations Officer",
      education: "MSc Operations Management, INSEAD • BSc Mathematics, University of Cape Coast",
      experience: "Former Operations Lead at Zeepay, expert in payment systems and process optimization",
      bio: "Focused on operational excellence and building scalable systems for financial inclusion."
    }
  ];

  const milestones = [
    {
      year: "2021",
      quarter: "Q1",
      title: "Company Founded",
      description: "Susu Technologies incorporated in Ghana with initial seed funding of $500K from angel investors."
    },
    {
      year: "2021",
      quarter: "Q4",
      title: "Product Launch",
      description: "Beta launch with 500 users across 5 communities in Greater Accra region."
    },
    {
      year: "2022",
      quarter: "Q2",
      title: "Series A Funding",
      description: "Raised $2.5M Series A led by 4DX Ventures to expand across West Africa."
    },
    {
      year: "2023",
      quarter: "Q1",
      title: "Regulatory Approval",
      description: "Received electronic money issuer license from Bank of Ghana."
    },
    {
      year: "2023",
      quarter: "Q3",
      title: "50K Users Milestone",
      description: "Reached 50,000 active users with presence in 10 regions across Ghana."
    },
    {
      year: "2024",
      quarter: "Q2",
      title: "Regional Expansion",
      description: "Expanded operations to Nigeria and Kenya with local partnerships."
    }
  ];

  const values = [
    {
      title: "Financial Inclusion",
      description: "We believe everyone deserves access to financial services, regardless of their economic background or location.",
      icon: Globe
    },
    {
      title: "Community Trust",
      description: "Trust is the foundation of traditional susu. We digitize this trust through transparency and security.",
      icon: Shield
    },
    {
      title: "Innovation",
      description: "We leverage cutting-edge technology to solve age-old financial challenges in African communities.",
      icon: TrendingUp
    },
    {
      title: "Integrity",
      description: "We operate with the highest ethical standards, ensuring fair and transparent financial services.",
      icon: Award
    }
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'story':
        return (
          <div className="space-y-8">
            <div className="prose prose-lg max-w-none">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Our Story</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                Susu Technologies was founded in 2021 with a simple yet powerful vision: to digitize traditional rotating savings and credit associations (ROSCAs) that have been the backbone of financial cooperation in African communities for centuries.
              </p>
              <p className="text-slate-600 leading-relaxed mb-6">
                Our founders recognized that while traditional susu groups were effective, they faced challenges with transparency, record-keeping, and geographical limitations. By combining the trust and community spirit of traditional susu with modern technology, we created a platform that makes group savings more accessible, transparent, and secure.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Today, Susu serves over 50,000 users across Ghana, Nigeria, and Kenya, facilitating millions of cedis in community savings and helping individuals achieve their financial goals through collective action.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                <h4 className="text-xl font-bold text-slate-800 mb-3">Our Mission</h4>
                <p className="text-slate-600">
                  To democratize access to financial services by digitizing traditional savings groups, empowering communities to build wealth together through technology, trust, and transparency.
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
                <h4 className="text-xl font-bold text-slate-800 mb-3">Our Vision</h4>
                <p className="text-slate-600">
                  To become the leading platform for community-driven financial services across Africa, fostering economic empowerment and financial inclusion at scale.
                </p>
              </div>
            </div>
          </div>
        );
      
      case 'leadership':
        return (
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Leadership Team</h3>
            <div className="grid gap-8">
              {leadership.map((leader, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-start gap-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                      {leader.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-slate-800 mb-1">{leader.name}</h4>
                      <p className="text-blue-600 font-medium mb-2">{leader.role}</p>
                      <p className="text-sm text-slate-500 mb-3">{leader.education}</p>
                      <p className="text-sm text-slate-600 mb-3">{leader.experience}</p>
                      <p className="text-slate-600">{leader.bio}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'journey':
        return (
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Our Journey</h3>
            <div className="space-y-6">
              {milestones.map((milestone, index) => (
                <div key={index} className="relative pl-8 pb-8 last:pb-0">
                  {index !== milestones.length - 1 && (
                    <div className="absolute left-3 top-6 w-0.5 h-full bg-gradient-to-b from-blue-500 to-purple-500"></div>
                  )}
                  <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  <div className="bg-white rounded-2xl p-6 border border-slate-200">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-bold text-blue-600">{milestone.year}</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">{milestone.quarter}</span>
                    </div>
                    <h4 className="text-xl font-bold text-slate-800 mb-2">{milestone.title}</h4>
                    <p className="text-slate-600">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <button 
              className="group flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-all duration-300"
              onClick={() => window.history.back()}
            >
              <div className="p-2 rounded-full bg-white shadow-md group-hover:shadow-lg transition-all duration-300">
                <ArrowLeft className="w-5 h-5" />
              </div>
              <span className="font-medium">Back</span>
            </button>
            
            <div className="text-right">
              <h1 className="text-5xl font-bold text-slate-800 mb-2">About Susu</h1>
              <p className="text-slate-600 text-lg">Empowering communities through digital savings</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 text-center border border-slate-200 hover:shadow-lg transition-shadow duration-300">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white mb-3">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold text-slate-800 mb-1">{stat.number}</div>
                <div className="text-slate-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Navigation Tabs */}
            <div className="border-b border-slate-200">
              <nav className="flex">
                {[
                  { id: 'story', label: 'Our Story', icon: Building2 },
                  { id: 'leadership', label: 'Leadership', icon: Users },
                  { id: 'journey', label: 'Our Journey', icon: TrendingUp }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {renderContent()}
            </div>
          </div>

          {/* Values Section */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">Our Core Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 text-center border border-slate-200 hover:shadow-lg transition-shadow duration-300">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white mb-4">
                    <value.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">{value.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
              <p className="text-xl opacity-90">Ready to join our community or have questions about our services?</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-3">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-1">Office</h3>
                <p className="text-sm opacity-90">East Legon, Accra<br />Ghana</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-3">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-1">Email</h3>
                <p className="text-sm opacity-90">hello@susu.com<br />support@susu.com</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-3">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-1">Phone</h3>
                <p className="text-sm opacity-90">+233 30 123 4567<br />+233 55 987 6543</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}