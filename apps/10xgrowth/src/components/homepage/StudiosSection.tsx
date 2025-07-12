'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  Briefcase, 
  Palette, 
  TrendingUp, 
  Zap, 
  Brain, 
  Smartphone,
  ArrowRight,
  Settings,
  Megaphone,
  Code,
  Bot,
  DollarSign,
  Users,
  Cog,
  BarChart3,
  Rocket
} from 'lucide-react';

const studios = [
  // Strategy & Planning
  {
    id: 'vision',
    title: 'Vision Studio',
    description: 'Strategic planning and business clarity to transform your ideas into actionable roadmaps',
    icon: Eye,
    color: 'google-blue',
    category: 'Strategy',
    features: ['Business Strategy', 'Goal Setting', 'Market Analysis']
  },
  {
    id: 'project',
    title: 'Project Studio',
    description: 'Agile project management and delivery excellence for seamless execution',
    icon: Briefcase,
    color: 'google-green',
    category: 'Operations',
    features: ['Agile Management', 'Sprint Planning', 'Delivery Tracking']
  },
  {
    id: 'process',
    title: 'Process Studio',
    description: 'Business process optimization and workflow automation for maximum efficiency',
    icon: Settings,
    color: 'google-yellow',
    category: 'Operations',
    features: ['Process Mapping', 'Workflow Design', 'Automation']
  },
  
  // Marketing & Sales
  {
    id: 'marketing',
    title: 'Marketing Studio',
    description: 'Digital marketing strategies and campaigns that drive brand growth',
    icon: Megaphone,
    color: 'google-red',
    category: 'Marketing',
    features: ['Digital Marketing', 'Campaign Management', 'Brand Strategy']
  },
  {
    id: 'sales',
    title: 'Sales Studio',
    description: 'Sales optimization, CRM implementation, and revenue acceleration',
    icon: TrendingUp,
    color: 'google-blue',
    category: 'Sales',
    features: ['Sales Funnels', 'CRM Setup', 'Lead Management']
  },
  {
    id: 'visual',
    title: 'Creative Studio',
    description: 'Branding, design, and visual communication that captures your unique identity',
    icon: Palette,
    color: 'google-green',
    category: 'Marketing',
    features: ['Brand Design', 'Content Creation', 'Visual Identity']
  },
  
  // Technology & AI
  {
    id: 'tech',
    title: 'Tech Studio',
    description: 'Technology consulting, software development, and digital transformation',
    icon: Code,
    color: 'google-red',
    category: 'Technology',
    features: ['Software Development', 'Tech Consulting', 'Digital Transformation']
  },
  {
    id: 'ai',
    title: 'AI Studio',
    description: 'AI consulting, machine learning, and intelligent automation solutions',
    icon: Brain,
    color: 'google-yellow',
    category: 'Technology',
    features: ['AI Strategy', 'ML Solutions', 'Intelligent Automation']
  },
  {
    id: 'ai-app',
    title: 'AI App Studio',
    description: 'Custom AI applications and chatbot development for business automation',
    icon: Bot,
    color: 'google-blue',
    category: 'Technology',
    features: ['Custom AI Apps', 'Chatbot Development', 'AI Integration']
  },
  
  // Business Operations
  {
    id: 'finance',
    title: 'Finance Studio',
    description: 'Financial planning, accounting automation, and business intelligence',
    icon: DollarSign,
    color: 'google-green',
    category: 'Finance',
    features: ['Financial Planning', 'Accounting Setup', 'Business Intelligence']
  },
  {
    id: 'talent',
    title: 'Talent Studio',
    description: 'HR solutions, talent acquisition, and workforce optimization',
    icon: Users,
    color: 'google-red',
    category: 'HR',
    features: ['Talent Acquisition', 'HR Systems', 'Performance Management']
  },
  {
    id: 'operations',
    title: 'Operations Studio',
    description: 'Operational excellence, supply chain optimization, and quality management',
    icon: Cog,
    color: 'google-yellow',
    category: 'Operations',
    features: ['Operations Excellence', 'Supply Chain', 'Quality Management']
  },
  
  // Specialized Services
  {
    id: 'data',
    title: 'Data Studio',
    description: 'Data analytics, business intelligence, and data-driven decision making',
    icon: BarChart3,
    color: 'google-blue',
    category: 'Analytics',
    features: ['Data Analytics', 'Business Intelligence', 'Reporting']
  },
  {
    id: 'automation',
    title: 'Automation Studio',
    description: 'Business automation, Zoho suite implementation, and workflow optimization',
    icon: Zap,
    color: 'google-green',
    category: 'Technology',
    features: ['Zoho Implementation', 'Workflow Automation', 'System Integration']
  },
  {
    id: 'growth',
    title: 'Growth Studio',
    description: 'Growth hacking, performance optimization, and scale-up strategies',
    icon: Rocket,
    color: 'google-red',
    category: 'Strategy',
    features: ['Growth Hacking', 'Performance Optimization', 'Scale-up Strategy']
  }
];

const StudioCard = ({ studio, index }: { studio: any; index: number }) => {
  const Icon = studio.icon;
  const colorClasses = {
    'google-blue': {
      bg: 'bg-google-blue',
      text: 'text-google-blue',
      border: 'border-google-blue',
      light: 'bg-blue-50'
    },
    'google-red': {
      bg: 'bg-google-red',
      text: 'text-google-red',
      border: 'border-google-red',
      light: 'bg-red-50'
    },
    'google-yellow': {
      bg: 'bg-google-yellow',
      text: 'text-google-yellow',
      border: 'border-google-yellow',
      light: 'bg-yellow-50'
    },
    'google-green': {
      bg: 'bg-google-green',
      text: 'text-google-green',
      border: 'border-google-green',
      light: 'bg-green-50'
    }
  };

  const colors = colorClasses[studio.color as keyof typeof colorClasses];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group relative h-full"
    >
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 h-full flex flex-col border border-white/20 relative overflow-hidden">
        {/* Subtle gradient overlay on hover */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 ${colors.bg}`} />
        
        {/* Category Badge */}
        <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 mb-6 self-start border border-slate-200">
          {studio.category}
        </div>

        {/* Icon with enhanced styling */}
        <div className="relative mb-6">
          <div className={`w-16 h-16 ${colors.light} rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow border border-white/50`}>
            <Icon className={`w-8 h-8 ${colors.text}`} />
          </div>
          {/* Subtle glow effect */}
          <div className={`absolute inset-0 w-16 h-16 ${colors.bg} opacity-0 group-hover:opacity-10 rounded-2xl blur-xl transition-opacity`} />
        </div>

        {/* Content with better typography */}
        <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{studio.title}</h3>
        <p className="text-slate-600 text-sm mb-6 flex-grow leading-relaxed">{studio.description}</p>

        {/* Features with improved design */}
        <div className="space-y-2 mb-6">
          {studio.features.map((feature: string, idx: number) => (
            <div key={idx} className="flex items-center text-sm text-slate-500">
              <div className={`w-1.5 h-1.5 ${colors.bg} rounded-full mr-3 flex-shrink-0`} />
              <span className="font-medium">{feature}</span>
            </div>
          ))}
        </div>

        {/* Professional CTA */}
        <button className={`${colors.text} font-semibold text-sm flex items-center gap-2 hover:gap-3 transition-all mt-auto group/btn`}>
          <span>Explore Studio</span>
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};

export default function StudiosSection() {
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  
  const categories = ['All', ...Array.from(new Set(studios.map(studio => studio.category)))];
  const filteredStudios = selectedCategory === 'All' 
    ? studios 
    : studios.filter(studio => studio.category === selectedCategory);

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 via-white to-slate-50 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(148,163,184,0.03)_25%,transparent_25%),linear-gradient(-45deg,rgba(148,163,184,0.03)_25%,transparent_25%)] bg-[size:20px_20px]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-full px-6 py-3 mb-6">
            <div className="w-2 h-2 bg-google-blue rounded-full"></div>
            <span className="text-sm font-semibold text-slate-700 tracking-wide uppercase">Global Business Solutions</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
            Enterprise Studio Ecosystem
          </h2>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto mb-8 leading-relaxed">
            Transform your organization with our comprehensive Studios-as-a-Service platform. 
            <br className="hidden md:block" />
            <span className="font-semibold text-slate-800">15 specialized studios. 500+ global experts. Enterprise-grade delivery.</span>
          </p>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-google-blue text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Studios Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredStudios.map((studio, index) => (
            <StudioCard key={studio.id} studio={studio} index={index} />
          ))}
        </div>

        {/* Studio Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          <div>
            <div className="text-3xl font-bold text-google-blue">15+</div>
            <div className="text-gray-600">Specialized Studios</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-google-red">500+</div>
            <div className="text-gray-600">Expert Professionals</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-google-yellow">24/7</div>
            <div className="text-gray-600">Support Available</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-google-green">99%</div>
            <div className="text-gray-600">Client Satisfaction</div>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-lg text-gray-600 mb-6">
            Ready to accelerate your growth with our expert studios?
          </p>
          <button className="px-8 py-4 bg-google-blue text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:bg-blue-600 transition-all duration-300">
            Schedule a Free Consultation
          </button>
        </motion.div>
      </div>
    </section>
  );
}