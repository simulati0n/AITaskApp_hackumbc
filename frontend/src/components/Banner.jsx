import { Button } from "./ui/button"
import Navbar from "./Navbar"

export default function Banner() {
    return (
        <>
            <div className="mb-12 bg-white-50 dark:bg-gray-900">
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
            </main>
            </div>
        </>
    )
}