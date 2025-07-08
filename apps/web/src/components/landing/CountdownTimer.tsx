'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CountdownTimerProps {
  launchDate: Date
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function CountdownTimer({ 
  launchDate, 
  className,
  size = 'md' 
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const calculateTimeLeft = () => {
      const difference = launchDate.getTime() - new Date().getTime()
      
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        }
      }
      
      return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    }

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    // Set initial value
    setTimeLeft(calculateTimeLeft())

    return () => clearInterval(timer)
  }, [launchDate, mounted])

  if (!mounted) {
    return null // Prevent hydration mismatch
  }

  const sizeClasses = {
    sm: {
      container: 'gap-1',
      number: 'text-lg font-bold',
      label: 'text-xs',
      separator: 'text-sm'
    },
    md: {
      container: 'gap-2',
      number: 'text-xl font-bold',
      label: 'text-xs',
      separator: 'text-lg'
    },
    lg: {
      container: 'gap-3',
      number: 'text-2xl font-bold',
      label: 'text-sm',
      separator: 'text-xl'
    }
  }

  const { container, number, label, separator } = sizeClasses[size]

  const timeUnits = [
    { value: timeLeft.days, label: 'Days', key: 'days' },
    { value: timeLeft.hours, label: 'Hours', key: 'hours' },
    { value: timeLeft.minutes, label: 'Mins', key: 'minutes' },
    { value: timeLeft.seconds, label: 'Secs', key: 'seconds' }
  ]

  return (
    <div className={cn('flex items-center justify-center', container, className)}>
      {timeUnits.map((unit, index) => (
        <div key={unit.key} className="flex items-center">
          <div className="text-center">
            <motion.div
              key={`${unit.key}-${unit.value}`}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className={cn(
                number,
                'bg-primary/10 px-2 py-1 rounded min-w-[2.5rem] flex items-center justify-center'
              )}
            >
              {String(unit.value).padStart(2, '0')}
            </motion.div>
            <div className={cn(label, 'text-muted-foreground mt-1')}>
              {unit.label}
            </div>
          </div>
          {index < timeUnits.length - 1 && (
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className={cn(separator, 'mx-1 text-muted-foreground')}
            >
              :
            </motion.div>
          )}
        </div>
      ))}
    </div>
  )
}