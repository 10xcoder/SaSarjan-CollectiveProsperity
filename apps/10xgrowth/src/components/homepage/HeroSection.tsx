'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Rocket, TrendingUp, Users, Zap, Globe, Shield, Award, BarChart } from 'lucide-react';

const FloatingShape = ({ color, size, position }: any) => {
  return (
    <div
      className={`absolute ${size} ${position} rounded-full opacity-10 blur-3xl`}
      style={{ backgroundColor: color }}
    />
  );
};

export default function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const statsData = [
    { icon: Users, label: "Active Users", value: "10K+" },
    { icon: Rocket, label: "Projects Launched", value: "500+" },
    { icon: TrendingUp, label: "Growth Rate", value: "300%" },
    { icon: Zap, label: "Success Rate", value: "95%" }
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Modern Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(66,133,244,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(66,133,244,0.1)_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      {/* Glassmorphism Accent Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-google-blue/20 to-google-green/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-google-red/20 to-google-yellow/20 rounded-full blur-3xl" />
      </div>

      {/* Modern Dot Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20" />

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          {/* Global Business Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8"
          >
            <Globe className="w-4 h-4 text-google-blue" />
            <span className="text-white/90 text-sm font-medium">Trusted by Global Enterprises</span>
            <Shield className="w-4 h-4 text-google-green" />
          </motion.div>

          {/* Main Headline */}
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 bg-clip-text text-transparent leading-tight"
            style={{
              backgroundImage: 'linear-gradient(135deg, #fff 0%, rgba(66, 133, 244, 0.9) 25%, rgba(234, 67, 53, 0.9) 50%, rgba(251, 188, 4, 0.9) 75%, #fff 100%)'
            }}
          >
            From Vision to Victory
          </motion.h1>

          {/* Subtitle with Enterprise Focus */}
          <motion.h2 
            variants={itemVariants}
            className="text-2xl md:text-4xl font-light text-white/80 mb-4"
          >
            Enterprise-Grade <span className="font-bold text-google-blue">Business Acceleration</span>
          </motion.h2>

          {/* Modern Description */}
          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-white/70 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            Transform your organization with AI-powered studios, global talent networks, and enterprise-grade solutions. 
            <br className="hidden md:block" />
            <span className="text-white/90 font-medium">15+ specialized studios. 500+ experts. 99% success rate.</span>
          </motion.p>

          {/* Modern CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group px-8 py-4 bg-gradient-to-r from-google-blue to-google-green text-white font-semibold rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Start Your Transformation
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <BarChart className="w-5 h-5" />
              View Success Stories
            </motion.button>
          </motion.div>

          {/* Enterprise Stats Grid */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
          >
            {statsData.map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -3, scale: 1.02 }}
                className="relative group"
              >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300">
                  {/* Glowing effect on hover */}
                  <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity ${
                    index === 0 ? 'bg-google-blue' :
                    index === 1 ? 'bg-google-red' :
                    index === 2 ? 'bg-google-yellow' :
                    'bg-google-green'
                  } blur-xl`} />
                  
                  <div className="relative z-10">
                    <stat.icon className={`w-8 h-8 mx-auto mb-3 ${
                      index === 0 ? 'text-google-blue' :
                      index === 1 ? 'text-google-red' :
                      index === 2 ? 'text-google-yellow' :
                      'text-google-green'
                    }`} />
                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-white/70">{stat.label}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            variants={itemVariants}
            className="mt-16 flex flex-wrap justify-center items-center gap-8 opacity-60"
          >
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Shield className="w-4 h-4" />
              <span>ISO 27001 Certified</span>
            </div>
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Award className="w-4 h-4" />
              <span>Fortune 500 Trusted</span>
            </div>
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Globe className="w-4 h-4" />
              <span>25+ Countries</span>
            </div>
          </motion.div>
        </motion.div>

      </div>

    </section>
  );
}