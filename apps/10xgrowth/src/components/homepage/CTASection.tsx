'use client';

import { motion } from 'framer-motion';
import { Calendar, MessageCircle, Sparkles, ArrowRight, Shield, Award, Zap, Globe } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Modern Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(66,133,244,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(66,133,244,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* Subtle Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-google-blue/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-tr from-google-green/20 to-transparent rounded-full blur-3xl" />
      </div>
      
      {/* Hexagon pattern overlay */}
      <div className="absolute inset-0 opacity-5" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234285f4' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
           }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          {/* Enterprise Badge */}
          <motion.div
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-full mb-8"
          >
            <Award className="w-5 h-5 text-google-yellow" />
            <span className="font-semibold">Enterprise-Grade Solutions</span>
            <Shield className="w-5 h-5 text-google-green" />
          </motion.div>

          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
            Ready to <span className="bg-clip-text text-transparent bg-gradient-to-r from-google-blue via-google-yellow to-google-green">Transform Your Business?</span>
          </h2>
          
          <p className="text-xl text-white/80 mb-12 max-w-4xl mx-auto leading-relaxed">
            Join global enterprises that have achieved <span className="font-bold text-google-yellow">10x growth</span> with our proven methodology. 
            <br className="hidden md:block" />
            Get started with a comprehensive strategy session designed for your industry.
          </p>

          {/* Enterprise CTA Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
            {/* Strategic Consultation Card */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:border-google-blue/40 transition-all duration-500 overflow-hidden"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-google-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-center w-16 h-16 bg-google-blue/20 rounded-2xl mb-6 mx-auto group-hover:scale-110 transition-transform">
                  <Calendar className="w-8 h-8 text-google-blue" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3 text-center">
                  Strategic Consultation
                </h3>
                <p className="text-white/70 mb-6 text-center leading-relaxed">
                  45-minute executive session with our enterprise strategists. Get a custom growth roadmap for your organization.
                </p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-white/60 text-sm">
                    <Zap className="w-4 h-4 mr-2 text-google-blue" />
                    <span>Custom strategy blueprint</span>
                  </div>
                  <div className="flex items-center text-white/60 text-sm">
                    <Shield className="w-4 h-4 mr-2 text-google-blue" />
                    <span>Risk assessment included</span>
                  </div>
                  <div className="flex items-center text-white/60 text-sm">
                    <Award className="w-4 h-4 mr-2 text-google-blue" />
                    <span>Industry best practices</span>
                  </div>
                </div>
                
                <button className="w-full bg-google-blue hover:bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/25">
                  <span>Book Strategic Session</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>

            {/* Enterprise Solutions Card */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:border-google-green/40 transition-all duration-500 overflow-hidden"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-google-green/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-center w-16 h-16 bg-google-green/20 rounded-2xl mb-6 mx-auto group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-8 h-8 text-google-green" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3 text-center">
                  Enterprise Solutions
                </h3>
                <p className="text-white/70 mb-6 text-center leading-relaxed">
                  Custom enterprise packages with dedicated account management and scalable studio resources.
                </p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-white/60 text-sm">
                    <Globe className="w-4 h-4 mr-2 text-google-green" />
                    <span>Global team access</span>
                  </div>
                  <div className="flex items-center text-white/60 text-sm">
                    <Shield className="w-4 h-4 mr-2 text-google-green" />
                    <span>Enterprise SLA guarantee</span>
                  </div>
                  <div className="flex items-center text-white/60 text-sm">
                    <Zap className="w-4 h-4 mr-2 text-google-green" />
                    <span>24/7 priority support</span>
                  </div>
                </div>
                
                <button className="w-full bg-google-green hover:bg-green-600 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-green-500/25">
                  <span>Contact Enterprise Team</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Enterprise Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-google-blue" />
              </div>
              <span className="text-white/80 text-sm">Enterprise Security</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-google-yellow" />
              </div>
              <span className="text-white/80 text-sm">ISO Certified</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-google-green" />
              </div>
              <span className="text-white/80 text-sm">Global Coverage</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-google-red" />
              </div>
              <span className="text-white/80 text-sm">24/7 Support</span>
            </div>
          </div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-12 flex flex-wrap justify-center items-center gap-6 text-white/60 text-sm"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-google-green rounded-full animate-pulse" />
              <span><span className="text-google-yellow font-semibold">47 enterprises</span> transformed this month</span>
            </div>
            <div className="hidden md:block w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-google-blue rounded-full animate-pulse" />
              <span>Average ROI: <span className="text-google-blue font-semibold">340%</span></span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}