import HomeNavbar from "../../components/HomeNavbar"

const features = [
  {
    name: "Track Expenses",
    description: "Easily record and categorize your daily expenses to stay on top of your budget.",
  },
  {
    name: "Visual Reports",
    description: "Get insights into your spending habits with charts and statistics.",
  },
  {
    name: "Simple & Fast",
    description: "A clean and minimal interface designed for speed and ease of use.",
  },
  {
    name: "Documentation",
    description: "Explore guides and documentation to learn about features and usage.",
  },
]

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HomeNavbar />
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Personal Expense Tracker</h1>
          <p className="mt-2 text-lg ">Track, analyze, and manage your expenses with ease.</p>
        </div>
      </header>

      <main className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
                <feature.icon className="h-10 w-10 text-indigo-600" />
                <h3 className="mt-4 text-xl font-semibold text-gray-900">{feature.name}</h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Home
