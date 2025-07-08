'use client'

import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedCounterProps {
  value: number
  duration?: number
  suffix?: string
  prefix?: string
  className?: string
  decimals?: number
}

export function AnimatedCounter({
  value,
  duration = 2,
  suffix = '',
  prefix = '',
  className,
  decimals = 0
}: AnimatedCounterProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100
  })

  useEffect(() => {
    if (isInView) {
      motionValue.set(value)
    }
  }, [isInView, motionValue, value])

  useEffect(() => {
    return springValue.on('change', (latest) => {
      if (ref.current) {
        const formatted = latest.toFixed(decimals)
        ref.current.textContent = `${prefix}${formatted}${suffix}`
      }
    })
  }, [springValue, prefix, suffix, decimals])

  return (
    <motion.div
      ref={ref}
      className={cn('tabular-nums', className)}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
      transition={{ 
        duration: 0.6, 
        delay: 0.2,
        type: 'spring',
        stiffness: 100
      }}
    >
      {prefix}0{suffix}
    </motion.div>
  )
}