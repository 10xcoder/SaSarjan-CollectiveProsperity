'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Target, Rocket, TrendingUp, CheckCircle } from 'lucide-react';

const processSteps = [
  {
    id: 1,
    title: 'Vision',
    description: 'Define your business goals and create a clear roadmap for success',
    icon: Lightbulb,
    color: 'google-blue',
    details: [
      'Strategic planning sessions',
      'Market opportunity analysis',
      'Goal setting framework'
    ]
  },
  {
    id: 2,
    title: 'Strategy',
    description: 'Develop actionable strategies aligned with your vision and market needs',
    icon: Target,
    color: 'google-red',
    details: [
      'Competitive analysis',
      'Resource allocation',
      'Timeline planning'
    ]
  },
  {
    id: 3,
    title: 'Execution',
    description: 'Implement your strategies with our expert teams and proven methodologies',
    icon: Rocket,
    color: 'google-yellow',
    details: [
      'Agile project management',
      'Expert team deployment',
      'Progress monitoring'
    ]
  },
  {
    id: 4,
    title: 'Scale',
    description: 'Grow exponentially with data-driven insights and continuous optimization',
    icon: TrendingUp,
    color: 'google-green',
    details: [
      'Performance analytics',
      'Growth optimization',
      'Market expansion'
    ]
  }
];

const ProcessStep = ({ step, index, isActive, onClick }: any) => {
  const Icon = step.icon;
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

  const colors = colorClasses[step.color as keyof typeof colorClasses];

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      onClick={() => onClick(step.id)}
      className="relative cursor-pointer"
    >
      {/* Connection Line */}
      {index < processSteps.length - 1 && (
        <div className="hidden lg:block absolute top-12 left-full w-full h-1 bg-gray-200">
          <motion.div
            initial={{ width: '0%' }}
            whileInView={{ width: '100%' }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.2 + 0.5 }}
            className={`h-full ${colors.bg}`}
          />
        </div>
      )}

      {/* Step Content */}
      <div className="relative z-10 text-center lg:text-left">
        {/* Icon Circle */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          className={`w-24 h-24 mx-auto lg:mx-0 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
            isActive ? `${colors.bg} text-white shadow-lg` : `${colors.light} ${colors.text}`
          }`}
        >
          <Icon className="w-10 h-10" />
        </motion.div>

        {/* Step Number */}
        <div className={`text-sm font-bold ${colors.text} mb-2`}>
          STEP {step.id}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {step.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm lg:pr-8">
          {step.description}
        </p>

        {/* Details (shown on active) */}
        <motion.div
          initial={false}
          animate={{
            height: isActive ? 'auto' : 0,
            opacity: isActive ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden mt-4"
        >
          <div className="space-y-2">
            {step.details.map((detail: string, idx: number) => (
              <div key={idx} className="flex items-start text-sm">
                <CheckCircle className={`w-4 h-4 ${colors.text} mr-2 flex-shrink-0 mt-0.5`} />
                <span className="text-gray-600">{detail}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default function ProcessSection() {
  const [activeStep, setActiveStep] = React.useState(1);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Our <span className="bg-clip-text text-transparent gradient-google">Process</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A proven 4-step methodology to transform your vision into measurable success
          </p>
        </motion.div>

        {/* Process Timeline */}
        <div className="grid lg:grid-cols-4 gap-8 lg:gap-0">
          {processSteps.map((step, index) => (
            <ProcessStep
              key={step.id}
              step={step}
              index={index}
              isActive={activeStep === step.id}
              onClick={setActiveStep}
            />
          ))}
        </div>

        {/* Mobile Timeline Indicator */}
        <div className="lg:hidden mt-8 flex justify-center space-x-2">
          {processSteps.map((step) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                activeStep === step.id 
                  ? `w-8 ${
                      step.color === 'google-blue' ? 'bg-google-blue' :
                      step.color === 'google-red' ? 'bg-google-red' :
                      step.color === 'google-yellow' ? 'bg-google-yellow' :
                      'bg-google-green'
                    }` 
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-lg text-gray-600 mb-6">
            Ready to start your transformation journey?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-google-blue via-google-red via-google-yellow to-google-green text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Get Started Today
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}