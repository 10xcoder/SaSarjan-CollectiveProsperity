'use client';

import React from 'react';
import { motion, useInView } from 'framer-motion';
import { TrendingUp, Users, Briefcase, Award, Globe, Zap, BarChart3 } from 'lucide-react';

interface Metric {
  id: string;
  value: number;
  suffix: string;
  label: string;
  icon: any;
  color: string;
  description: string;
}

const metrics: Metric[] = [
  {
    id: 'users',
    value: 10000,
    suffix: '+',
    label: 'Active Users',
    icon: Users,
    color: 'google-blue',
    description: 'Businesses trusting our platform'
  },
  {
    id: 'projects',
    value: 500,
    suffix: '+',
    label: 'Projects Delivered',
    icon: Briefcase,
    color: 'google-red',
    description: 'Successfully completed projects'
  },
  {
    id: 'growth',
    value: 300,
    suffix: '%',
    label: 'Average Growth',
    icon: TrendingUp,
    color: 'google-yellow',
    description: 'Client revenue increase'
  },
  {
    id: 'satisfaction',
    value: 95,
    suffix: '%',
    label: 'Success Rate',
    icon: Award,
    color: 'google-green',
    description: 'Client satisfaction score'
  },
  {
    id: 'countries',
    value: 25,
    suffix: '+',
    label: 'Countries',
    icon: Globe,
    color: 'google-blue',
    description: 'Global presence'
  },
  {
    id: 'freelancers',
    value: 1000,
    suffix: '+',
    label: 'Expert Freelancers',
    icon: Zap,
    color: 'google-red',
    description: 'Verified professionals'
  }
];

const AnimatedCounter = ({ value, suffix }: { value: number; suffix: string }) => {
  const [count, setCount] = React.useState(0);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  React.useEffect(() => {
    if (isInView) {
      const duration = 2000; // 2 seconds
      const steps = 50;
      const stepDuration = duration / steps;
      const increment = value / steps;
      
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        if (currentStep <= steps) {
          setCount(Math.round(increment * currentStep));
        } else {
          setCount(value);
          clearInterval(timer);
        }
      }, stepDuration);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <span ref={ref} className="text-4xl font-bold">
      {count.toLocaleString()}{suffix}
    </span>
  );
};

const MetricCard = ({ metric, index }: { metric: Metric; index: number }) => {
  const Icon = metric.icon;
  
  const colorClasses = {
    'google-blue': {
      bg: 'bg-google-blue',
      text: 'text-google-blue',
      light: 'bg-blue-50',
      gradient: 'from-google-blue/10 to-google-blue/5',
      border: 'border-google-blue/20'
    },
    'google-red': {
      bg: 'bg-google-red',
      text: 'text-google-red',
      light: 'bg-red-50',
      gradient: 'from-google-red/10 to-google-red/5',
      border: 'border-google-red/20'
    },
    'google-yellow': {
      bg: 'bg-google-yellow',
      text: 'text-google-yellow',
      light: 'bg-yellow-50',
      gradient: 'from-google-yellow/10 to-google-yellow/5',
      border: 'border-google-yellow/20'
    },
    'google-green': {
      bg: 'bg-google-green',
      text: 'text-google-green',
      light: 'bg-green-50',
      gradient: 'from-google-green/10 to-google-green/5',
      border: 'border-google-green/20'
    }
  };

  const colors = colorClasses[metric.color as keyof typeof colorClasses];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="relative group"
    >
      {/* Card with glassmorphism effect */}
      <div className={`relative bg-white/80 backdrop-blur-sm border ${colors.border} rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden`}>
        {/* Background gradient on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
        
        {/* Animated border */}
        <div className={`absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} 
             style={{ WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'exclude' }} />
        
        <div className="relative z-10">
          {/* Icon with glow effect */}
          <div className="relative mb-6">
            <div className={`w-16 h-16 ${colors.light} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
              <Icon className={`w-8 h-8 ${colors.text}`} />
            </div>
            {/* Glow effect */}
            <div className={`absolute inset-0 w-16 h-16 ${colors.bg} opacity-0 group-hover:opacity-20 rounded-2xl blur-xl transition-opacity`} />
          </div>

          {/* Counter with larger, bolder style */}
          <div className={`${colors.text} mb-3`}>
            <div className="text-4xl md:text-5xl font-bold">
              <AnimatedCounter value={metric.value} suffix={metric.suffix} />
            </div>
          </div>

          {/* Label */}
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {metric.label}
          </h3>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed">
            {metric.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default function MetricsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-white relative overflow-hidden">
      {/* Modern Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(66,133,244,0.03)_25%,transparent_25%),linear-gradient(-45deg,rgba(66,133,244,0.03)_25%,transparent_25%),linear-gradient(45deg,transparent_75%,rgba(66,133,244,0.03)_75%),linear-gradient(-45deg,transparent_75%,rgba(66,133,244,0.03)_75%)] bg-[size:20px_20px]" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-google-blue/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-google-green/10 to-transparent rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-google-blue/10 to-google-green/10 border border-google-blue/20 rounded-full px-4 py-2 mb-6">
            <BarChart3 className="w-4 h-4 text-google-blue" />
            <span className="text-sm font-medium text-gray-700">Performance Analytics</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Measurable <span className="bg-clip-text text-transparent bg-gradient-to-r from-google-blue via-google-red to-google-green">Business Impact</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Data-driven results that speak for themselves. Our enterprise clients achieve 
            <span className="font-semibold text-google-blue"> 10x faster growth</span> with 
            <span className="font-semibold text-google-green"> 95% success rates</span> across all projects.
          </p>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {metrics.map((metric, index) => (
            <MetricCard key={metric.id} metric={metric} index={index} />
          ))}
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-lg text-gray-600 mb-8">
            Trusted by leading companies worldwide
          </p>
          
          {/* Logo Placeholder */}
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-32 h-12 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}