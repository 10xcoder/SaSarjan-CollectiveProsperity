'use client';

import { motion } from 'framer-motion';
import { 
  Users, 
  Calculator, 
  FolderKanban, 
  Activity,
  Check,
  Sparkles
} from 'lucide-react';

const saasTools = [
  {
    id: 'crm',
    name: 'CRM System',
    description: 'Complete customer relationship management solution',
    icon: Users,
    price: 'From ₹999/month',
    color: 'google-blue',
    features: [
      'Contact Management',
      'Sales Pipeline',
      'Email Integration',
      'Analytics Dashboard'
    ],
    popular: false
  },
  {
    id: 'accounting',
    name: 'Accounting Suite',
    description: 'Professional accounting and financial management',
    icon: Calculator,
    price: 'From ₹1,499/month',
    color: 'google-red',
    features: [
      'Invoice Generation',
      'Expense Tracking',
      'GST Compliance',
      'Financial Reports'
    ],
    popular: true
  },
  {
    id: 'project',
    name: 'Project Management',
    description: 'Collaborate and manage projects efficiently',
    icon: FolderKanban,
    price: 'From ₹799/month',
    color: 'google-yellow',
    features: [
      'Task Management',
      'Team Collaboration',
      'Timeline View',
      'Resource Planning'
    ],
    popular: false
  },
  {
    id: 'monitoring',
    name: 'Workforce Monitoring',
    description: 'Track productivity and optimize team performance',
    icon: Activity,
    price: 'From ₹599/month',
    color: 'google-green',
    features: [
      'Time Tracking',
      'Activity Monitoring',
      'Productivity Reports',
      'Team Analytics'
    ],
    popular: false
  }
];

const SaaSCard = ({ tool, index }: { tool: any; index: number }) => {
  const Icon = tool.icon;
  const colorClasses = {
    'google-blue': {
      bg: 'bg-google-blue',
      text: 'text-google-blue',
      border: 'border-google-blue',
      light: 'bg-blue-50',
      gradient: 'from-google-blue/20 to-google-blue/5'
    },
    'google-red': {
      bg: 'bg-google-red',
      text: 'text-google-red',
      border: 'border-google-red',
      light: 'bg-red-50',
      gradient: 'from-google-red/20 to-google-red/5'
    },
    'google-yellow': {
      bg: 'bg-google-yellow',
      text: 'text-google-yellow',
      border: 'border-google-yellow',
      light: 'bg-yellow-50',
      gradient: 'from-google-yellow/20 to-google-yellow/5'
    },
    'google-green': {
      bg: 'bg-google-green',
      text: 'text-google-green',
      border: 'border-google-green',
      light: 'bg-green-50',
      gradient: 'from-google-green/20 to-google-green/5'
    }
  };

  const colors = colorClasses[tool.color as keyof typeof colorClasses];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="relative"
    >
      {/* Popular Badge */}
      {tool.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-google-red to-google-yellow text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <Sparkles className="w-4 h-4" />
            Most Popular
          </div>
        </div>
      )}

      <div className={`relative bg-white rounded-2xl shadow-lg overflow-hidden h-full ${
        tool.popular ? 'ring-2 ring-google-red ring-opacity-50' : ''
      }`}>
        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-50`} />
        
        <div className="relative p-6">
          {/* Icon */}
          <div className={`w-14 h-14 ${colors.light} rounded-xl flex items-center justify-center mb-4`}>
            <Icon className={`w-7 h-7 ${colors.text}`} />
          </div>

          {/* Content */}
          <h3 className="text-xl font-bold text-gray-900 mb-2">{tool.name}</h3>
          <p className="text-gray-600 mb-4 text-sm">{tool.description}</p>

          {/* Price */}
          <div className="mb-6">
            <div className={`text-2xl font-bold ${colors.text}`}>{tool.price}</div>
            <div className="text-sm text-gray-500">per user</div>
          </div>

          {/* Features */}
          <div className="space-y-2 mb-6">
            {tool.features.map((feature: string, idx: number) => (
              <div key={idx} className="flex items-center text-sm">
                <Check className={`w-4 h-4 ${colors.text} mr-2 flex-shrink-0`} />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
              tool.popular 
                ? `${colors.bg} text-white hover:opacity-90` 
                : `${colors.border} border-2 ${colors.text} hover:${colors.bg} hover:text-white`
            }`}
          >
            Start Free Trial
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default function SaaSSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Software as a <span className="bg-clip-text text-transparent gradient-google">Service</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Enterprise-grade tools available on affordable monthly rental models. 
            No setup fees, no long-term commitments.
          </p>
        </motion.div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {saasTools.map((tool, index) => (
            <SaaSCard key={tool.id} tool={tool} index={index} />
          ))}
        </div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-white rounded-2xl p-8 shadow-lg"
        >
          <h3 className="text-2xl font-bold text-center mb-8">Why Choose Our SaaS Solutions?</h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-google-blue bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h4 className="font-semibold mb-2">Quick Setup</h4>
              <p className="text-gray-600 text-sm">Get started in minutes with our pre-configured solutions</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-google-red bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💸</span>
              </div>
              <h4 className="font-semibold mb-2">Cost Effective</h4>
              <p className="text-gray-600 text-sm">Pay only for what you use with flexible monthly plans</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-google-green bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔧</span>
              </div>
              <h4 className="font-semibold mb-2">Full Support</h4>
              <p className="text-gray-600 text-sm">24/7 technical support and regular updates included</p>
            </div>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-lg text-gray-600 mb-6">
            Need a custom solution or bundle pricing?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-google-blue to-google-green text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Contact Our Sales Team
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}