'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Star, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Bundle {
  id: string
  name: string
  description: string
  apps: string[]
  originalPrice: number
  discountedPrice: number
  savings: number
  popular?: boolean
  features: string[]
  color: string
  icon: string
}

interface BundleCardProps {
  bundle: Bundle
  className?: string
  onSelect?: (bundleId: string) => void
}

export function BundleCard({ bundle, className, onSelect }: BundleCardProps) {
  const savingsPercentage = Math.round((bundle.savings / bundle.originalPrice) * 100)

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={cn('relative', className)}
    >
      <Card className={cn(
        'relative overflow-hidden border-2 transition-all duration-300',
        bundle.popular 
          ? 'border-primary shadow-lg shadow-primary/20' 
          : 'border-border hover:border-primary/30',
        'group hover:shadow-xl'
      )}>
        {/* Popular badge */}
        {bundle.popular && (
          <div className="absolute -top-1 -right-1 z-10">
            <Badge className="bg-primary text-primary-foreground shadow-lg rounded-bl-lg rounded-tr-lg px-3 py-1">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Most Popular
            </Badge>
          </div>
        )}

        {/* Savings badge */}
        <div className="absolute top-4 left-4 z-10">
          <Badge 
            variant="secondary" 
            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          >
            Save {savingsPercentage}%
          </Badge>
        </div>

        <CardHeader className="pb-4 pt-8">
          {/* Bundle icon and header */}
          <div className="flex items-center space-x-3 mb-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg"
              style={{ backgroundColor: bundle.color }}
            >
              {bundle.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold">{bundle.name}</h3>
              <p className="text-sm text-muted-foreground">{bundle.description}</p>
            </div>
          </div>

          {/* Pricing */}
          <div className="text-center py-4">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-2xl font-bold">₹{bundle.discountedPrice}</span>
              <span className="text-lg text-muted-foreground line-through">
                ₹{bundle.originalPrice}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">per month</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Included apps */}
          <div>
            <h4 className="font-semibold text-sm mb-2">Included Apps:</h4>
            <div className="flex flex-wrap gap-1">
              {bundle.apps.map((app) => (
                <Badge key={app} variant="outline" className="text-xs">
                  {app}
                </Badge>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold text-sm mb-2">What's included:</h4>
            <ul className="space-y-2">
              {bundle.features.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center text-sm"
                >
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  {feature}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* CTA Button */}
          <Button
            className={cn(
              'w-full mt-6 group-hover:shadow-lg transition-all duration-300',
              bundle.popular && 'bg-primary hover:bg-primary/90'
            )}
            onClick={() => onSelect?.(bundle.id)}
          >
            Get This Bundle
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          {/* Trust indicators */}
          <div className="pt-2 text-center">
            <p className="text-xs text-muted-foreground">
              30-day money back guarantee • Cancel anytime
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}