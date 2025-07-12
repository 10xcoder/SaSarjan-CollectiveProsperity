'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    role: 'CEO',
    company: 'TechStart Solutions',
    content: '10xGrowth transformed our startup from an idea to a thriving business. Their Vision Studio helped us create a clear roadmap, and the Project Studio ensured flawless execution. We achieved 300% growth in just 6 months!',
    rating: 5,
    image: '/api/placeholder/80/80',
    color: 'google-blue'
  },
  {
    id: 2,
    name: 'Priya Sharma',
    role: 'Marketing Director',
    company: 'E-Commerce Plus',
    content: 'The Revenue Studio revolutionized our sales process. Their team built custom funnels that increased our conversion rate by 250%. The ROI has been phenomenal!',
    rating: 5,
    image: '/api/placeholder/80/80',
    color: 'google-red'
  },
  {
    id: 3,
    name: 'Amit Patel',
    role: 'Founder',
    company: 'GreenTech Innovations',
    content: 'Working with 10xGrowth\'s AI Studio was a game-changer. They helped us integrate AI into our operations, saving 40% on operational costs while improving customer satisfaction.',
    rating: 5,
    image: '/api/placeholder/80/80',
    color: 'google-yellow'
  },
  {
    id: 4,
    name: 'Sneha Gupta',
    role: 'Operations Head',
    company: 'LogiFlow Systems',
    content: 'The Zoho Studio team streamlined our entire workflow. What used to take days now takes hours. Their automation expertise is unmatched!',
    rating: 5,
    image: '/api/placeholder/80/80',
    color: 'google-green'
  }
];

const TestimonialCard = ({ testimonial, isActive }: { testimonial: any; isActive: boolean }) => {
  const colorClasses = {
    'google-blue': 'border-google-blue bg-blue-50',
    'google-red': 'border-google-red bg-red-50',
    'google-yellow': 'border-google-yellow bg-yellow-50',
    'google-green': 'border-google-green bg-green-50'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: isActive ? 1 : 0,
        scale: isActive ? 1 : 0.8,
        x: isActive ? 0 : 100
      }}
      exit={{ opacity: 0, scale: 0.8, x: -100 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 flex items-center justify-center px-4"
    >
      <div className={`bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-4xl w-full border-2 ${
        colorClasses[testimonial.color as keyof typeof colorClasses]
      }`}>
        {/* Quote Icon */}
        <Quote className="w-12 h-12 text-gray-300 mb-6" />

        {/* Content */}
        <p className="text-lg md:text-xl text-gray-700 mb-8 italic">
          "{testimonial.content}"
        </p>

        {/* Rating */}
        <div className="flex gap-1 mb-6">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${
                i < testimonial.rating ? 'fill-google-yellow text-google-yellow' : 'text-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Author */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-600">
              {testimonial.name.charAt(0)}
            </span>
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
            <p className="text-gray-600">{testimonial.role}, {testimonial.company}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  React.useEffect(() => {
    const timer = setInterval(nextTestimonial, 5000); // Auto-advance every 5 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Client <span className="bg-clip-text text-transparent gradient-google">Success Stories</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it. Hear from businesses that have 
            experienced exponential growth with 10xGrowth.
          </p>
        </motion.div>

        {/* Testimonial Carousel */}
        <div className="relative h-[400px] md:h-[350px]">
          <AnimatePresence mode="wait">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                isActive={index === currentIndex}
              />
            ))}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:translate-x-0 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <button
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-0 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 h-2 bg-google-blue rounded-full'
                  : 'w-2 h-2 bg-gray-300 rounded-full hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center gap-4 bg-white rounded-full px-6 py-3 shadow-lg">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center"
                >
                  <span className="text-xs font-bold text-gray-600">
                    {String.fromCharCode(65 + i)}
                  </span>
                </div>
              ))}
            </div>
            <span className="text-gray-700 font-semibold">
              Join 10,000+ satisfied clients
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}