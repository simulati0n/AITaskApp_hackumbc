import { Button } from "./components/ui/button"
import Navbar from "./components/Navbar"


function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center  justpx-4 py-6 sm:px-0">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">Welcome to AI Task App</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Follow up with your goals and tasks the right way.
          </p>
          <div className="flex space-x-4 justify-center">
            <Button>Get Started</Button>
            <Button variant="outline">Learn More</Button>
          </div>
          </div>
          <div className="text-center px-4 py-6 sm:px-0 mt-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Did You Know?</h2>
            <div className="max-w-3xl mx-auto">
              <ul className="space-y-4 text-left text-lg">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2 mr-3"></span>
                  <p className="text-gray-600 dark:text-gray-300">About 30% of Americans set goals for New Year's Resolutions</p>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2 mr-3"></span>
                  <p className="text-gray-600 dark:text-gray-300">80% of goal-setters feel confident they can stick to their resolutions throughout the year</p>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2 mr-3"></span>
                  <p className="text-gray-600 dark:text-gray-300"><strong>92% of adults will not follow through on a resolution</strong></p>
                </li>
              </ul>
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  Source: <a href="https://www.pewresearch.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Pew Research Center</a>
                </p>
              </div>
            </div>
          </div>
      </main>
    </div>
  )
}

export default App
