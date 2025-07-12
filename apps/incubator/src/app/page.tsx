export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
          <span className="text-incubator-primary">Incubator</span>
          <span className="text-gray-900">.in</span>
        </h1>

        <p className="mb-8 max-w-2xl text-xl text-gray-600">
          AI-powered discovery platform connecting startups with incubators,
          accelerators, and the innovation ecosystem.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <button className="bg-incubator-primary hover:bg-incubator-primary/90 rounded-lg px-8 py-3 text-white">
            Find Incubators
          </button>
          <button className="rounded-lg border border-gray-300 px-8 py-3 hover:bg-gray-50">
            List Your Incubator
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Powerful Features Coming Soon
          </h2>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="bg-incubator-primary/10 mb-4 h-12 w-12 rounded-lg"></div>
              <h3 className="mb-2 text-xl font-semibold">Smart Discovery</h3>
              <p className="text-gray-600">
                AI-powered matching between startups and incubators
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="bg-incubator-secondary/10 mb-4 h-12 w-12 rounded-lg"></div>
              <h3 className="mb-2 text-xl font-semibold">Journey Tracking</h3>
              <p className="text-gray-600">Visual roadmap from idea to scale.</p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="bg-incubator-startup/10 mb-4 h-12 w-12 rounded-lg"></div>
              <h3 className="mb-2 text-xl font-semibold">Credits Hub</h3>
              <p className="text-gray-600">
                Access government schemes and startup benefits
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
