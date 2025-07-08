'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ProsperityCategory {
  id: string
  label: string
  color: string
  description: string
  icon: string
}

interface ProsperityWheelProps {
  size?: number
  interactive?: boolean
  selectedCategory?: string
  onCategorySelect?: (categoryId: string) => void
  className?: string
}

const prosperityCategories: ProsperityCategory[] = [
  {
    id: 'personal',
    label: 'Personal Growth',
    color: '#6366F1',
    description: 'Transform yourself with tools for personal development',
    icon: '✨'
  },
  {
    id: 'organizational',
    label: 'Business Excellence',
    color: '#10B981',
    description: 'Scale your organization with proven growth strategies',
    icon: '🏢'
  },
  {
    id: 'community',
    label: 'Community Impact',
    color: '#F59E0B',
    description: 'Build stronger communities through collective action',
    icon: '🤝'
  },
  {
    id: 'ecological',
    label: 'Green Future',
    color: '#22C55E',
    description: 'Create sustainable solutions for our planet',
    icon: '🌱'
  },
  {
    id: 'economic',
    label: 'Financial Freedom',
    color: '#3B82F6',
    description: 'Build wealth and economic independence',
    icon: '💰'
  },
  {
    id: 'knowledge',
    label: 'Learning & Skills',
    color: '#8B5CF6',
    description: 'Expand your knowledge and develop new capabilities',
    icon: '📚'
  },
  {
    id: 'social',
    label: 'Social Connection',
    color: '#EC4899',
    description: 'Strengthen relationships and social bonds',
    icon: '❤️'
  },
  {
    id: 'cultural',
    label: 'Cultural Heritage',
    color: '#A78BFA',
    description: 'Preserve and celebrate cultural traditions',
    icon: '🎭'
  }
]

export function ProsperityWheel({
  size = 300,
  interactive = true,
  selectedCategory,
  onCategorySelect,
  className
}: ProsperityWheelProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)

  const radius = size / 2 - 20
  const centerX = size / 2
  const centerY = size / 2
  const segmentAngle = 360 / prosperityCategories.length

  const createSegmentPath = (index: number) => {
    const startAngle = (index * segmentAngle - 90) * (Math.PI / 180)
    const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180)
    
    const x1 = centerX + radius * Math.cos(startAngle)
    const y1 = centerY + radius * Math.sin(startAngle)
    const x2 = centerX + radius * Math.cos(endAngle)
    const y2 = centerY + radius * Math.sin(endAngle)
    
    const largeArcFlag = segmentAngle > 180 ? 1 : 0
    
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
  }

  const getTextPosition = (index: number) => {
    const angle = (index * segmentAngle + segmentAngle / 2 - 90) * (Math.PI / 180)
    const textRadius = radius * 0.7
    return {
      x: centerX + textRadius * Math.cos(angle),
      y: centerY + textRadius * Math.sin(angle)
    }
  }

  const handleCategoryClick = (categoryId: string) => {
    if (!interactive) return
    
    setIsSpinning(true)
    setTimeout(() => setIsSpinning(false), 600)
    
    onCategorySelect?.(categoryId)
  }

  const activeCategory = selectedCategory || hoveredCategory
  const activeCategoryData = prosperityCategories.find(cat => cat.id === activeCategory)

  return (
    <div className={cn('relative flex flex-col items-center', className)}>
      <motion.div
        animate={{ rotate: isSpinning ? 360 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        className="relative"
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="drop-shadow-lg"
        >
          {/* Outer ring */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius + 5}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="2"
            className="opacity-20"
          />
          
          {/* Segments */}
          {prosperityCategories.map((category, index) => {
            const isHovered = hoveredCategory === category.id
            const isSelected = selectedCategory === category.id
            const isActive = isHovered || isSelected
            
            return (
              <g key={category.id}>
                <motion.path
                  d={createSegmentPath(index)}
                  fill={category.color}
                  fillOpacity={isActive ? 0.8 : 0.6}
                  stroke="white"
                  strokeWidth="2"
                  className={cn(
                    'transition-all duration-200',
                    interactive && 'cursor-pointer hover:drop-shadow-md'
                  )}
                  whileHover={interactive ? { scale: 1.05 } : {}}
                  onMouseEnter={() => interactive && setHoveredCategory(category.id)}
                  onMouseLeave={() => interactive && setHoveredCategory(null)}
                  onClick={() => handleCategoryClick(category.id)}
                  style={{
                    transformOrigin: `${centerX}px ${centerY}px`
                  }}
                />
                
                {/* Category icon and label */}
                <g className="pointer-events-none">
                  <text
                    x={getTextPosition(index).x}
                    y={getTextPosition(index).y - 8}
                    textAnchor="middle"
                    fontSize="20"
                    fill="white"
                    className="select-none font-medium"
                  >
                    {category.icon}
                  </text>
                  <text
                    x={getTextPosition(index).x}
                    y={getTextPosition(index).y + 12}
                    textAnchor="middle"
                    fontSize="11"
                    fill="white"
                    className="select-none font-medium"
                    style={{ 
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)' 
                    }}
                  >
                    {category.label.split(' ')[0]}
                  </text>
                </g>
              </g>
            )
          })}
          
          {/* Center circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r="30"
            fill="hsl(var(--background))"
            stroke="hsl(var(--border))"
            strokeWidth="3"
            className="drop-shadow-sm"
          />
          
          {/* Center logo/text */}
          <text
            x={centerX}
            y={centerY - 5}
            textAnchor="middle"
            fontSize="12"
            fill="hsl(var(--foreground))"
            className="font-bold select-none"
          >
            SaSarjan
          </text>
          <text
            x={centerX}
            y={centerY + 8}
            textAnchor="middle"
            fontSize="8"
            fill="hsl(var(--muted-foreground))"
            className="select-none"
          >
            Prosperity
          </text>
        </svg>
      </motion.div>
      
      {/* Active category description */}
      {activeCategoryData && interactive && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="mt-4 text-center max-w-xs"
        >
          <h4 className="font-semibold text-sm" style={{ color: activeCategoryData.color }}>
            {activeCategoryData.label}
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            {activeCategoryData.description}
          </p>
        </motion.div>
      )}
    </div>
  )
}