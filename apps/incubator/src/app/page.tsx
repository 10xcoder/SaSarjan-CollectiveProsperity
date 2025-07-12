import { HeroSection } from '@/components/homepage/HeroSection'
import { FeaturedIncubators } from '@/components/homepage/FeaturedIncubators'
import { ValueProps } from '@/components/homepage/ValueProps'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <HeroSection />
      <FeaturedIncubators />
      <ValueProps />
    </main>
  )
}
