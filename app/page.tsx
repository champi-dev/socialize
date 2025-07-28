export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to Socialize
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Connect, share, and engage with your community
        </p>
        <div className="flex gap-4 justify-center">
          <button className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition">
            Get Started
          </button>
          <button className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition">
            Learn More
          </button>
        </div>
      </div>
    </main>
  )
}