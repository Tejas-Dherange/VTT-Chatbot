"use client";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="pt-20 pb-16 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
              Chat with Your
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent"> Video Transcripts</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 leading-relaxed text-muted-foreground">
              Upload your VTT files and get instant answers from your video content. 
              Powered by advanced AI and vector search technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
                Get Started Free
              </button>
              <button className="border-2 border-border px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 hover:bg-accent">
                Watch Demo
              </button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">
              Powerful Features
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to unlock insights from your video content
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
                title: "Semantic Search",
                description: "Find specific moments and topics across all your video transcripts with AI-powered search"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: "Instant Answers",
                description: "Get immediate responses to questions about your video content with context-aware AI"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                title: "VTT File Support",
                description: "Upload and process VTT transcript files from any video platform or recording tool"
              }
            ].map((feature, index) => (
              <div key={index} className="p-8 rounded-2xl transition-all duration-200 hover:transform hover:scale-105 bg-card border border-border shadow-sm">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-xl mb-6 flex items-center justify-center">
                  <div className="text-blue-600 dark:text-blue-400">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-card-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* How it Works Section */}
        <div className="py-20">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 `}>How It Works</h2>
            <p className={`text-xl `}>
              Get started in three simple steps Get started in three simple
              steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Upload VTT Files",
                description:
                  "Simply drag and drop your video transcript files or upload them through our interface",
              },
              {
                step: "02",
                title: "AI Processing",
                description:
                  "Our system processes and indexes your content using advanced vector embeddings",
              },
              {
                step: "03",
                title: "Start Chatting",
                description:
                  "Ask questions and get instant, accurate answers based on your video content",
              },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div
                  className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-2xl font-bold `}
                >
                  {step.step}
                </div>
                <h3 className={`text-xl font-bold mb-3 `}>{step.title}</h3>
                <p className={``}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className={`py-20 px-8 rounded-2xl text-center `}>
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to unlock your video insights?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already getting more value from
            their video content
          </p>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
            Start Free Trial
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className={`mt-20 border-t`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center `}
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 3v10a2 2 0 002 2h6a2 2 0 002-2V7M9 7h6M9 11h6m-3 4h3"
                    />
                  </svg>
                </div>
                <span className={`text-xl font-bold`}>VideoChat AI</span>
              </div>
              <p className={`text-sm `}>
                AI-powered video transcript analysis for smarter content
                insights.
              </p>
            </div>

            <div>
              <h3 className={`font-semibold mb-4 ]`}>Product</h3>
              <ul className="space-y-2">
                {["Features", "Pricing", "API", "Integrations"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className={`text-sm hover:text-blue-500 transition-colors `}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className={`font-semibold mb-4 `}>Resources</h3>
              <ul className="space-y-2">
                {["Documentation", "Help Center", "Blog", "Community"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className={`text-sm hover:text-blue-500 transition-colors `}
                      >
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div>
              <h3 className={`font-semibold mb-4 `}>Company</h3>
              <ul className="space-y-2">
                {["About", "Contact", "Privacy", "Terms"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className={`text-sm hover:text-blue-500 transition-colors`}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={`mt-12 pt-8 border-t text-center `}>
            <p className={`text-sm`}>
              © 2025 VideoChat AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
