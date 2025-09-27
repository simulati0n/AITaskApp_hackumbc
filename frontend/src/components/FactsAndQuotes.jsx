import React from 'react'

export default function FactsAndQuotes() {
    return (
        <>
            <div className="text-center px-4 py-6 sm:px-0">
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
            
            {/* Quote Section */}
            <div className="text-center px-4 py-6 sm:px-0 mt-16">
                <blockquote className="max-w-6xl mx-auto">
                    <p className="text-2xl md:text-3xl lg:text-4xl font-[Playfair_Display] italic text-gray-800 dark:text-gray-200 leading-relaxed mb-6">
                        "Dreams without goals are just dreams, and ultimately, they fuel <strong>disappointments.</strong> On 
                        the road to achieving your dreams, you must apply discipline, but more importantly, consistency."
                    </p>
                    <div className="flex justify-center">
                    <footer className="text-lg text-gray-600 dark:text-gray-400">
                        — Denzel Washington
                    </footer>
                    </div>
                </blockquote>
            </div>
        </>
    )
}