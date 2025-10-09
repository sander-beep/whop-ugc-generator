export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Title */}
        <h1 className="text-5xl font-bold text-gray-900 mb-6 text-center">
          Whop AI UGC Ad Generator
        </h1>
        
        {/* Main Description Card */}
        <div className="bg-white rounded-xl p-8 shadow-md text-center mb-16">
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4">
            Transform your marketing with AI-powered UGC video ads. Create engaging, 
            authentic-looking user-generated content in minutes.
          </p>
          <p className="text-base text-gray-500 max-w-2xl mx-auto mb-2">
            Join successful creators and businesses who are using AI to generate 
            high-converting video ads without expensive production costs.
          </p>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto">
            💡 <strong>Tip:</strong> Perfect for e-commerce brands, course creators, 
            and SaaS companies looking to scale their ad creation.
          </p>
        </div>

        {/* Features Section */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Why Choose Our AI UGC Generator?
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-xl p-6 shadow-md flex flex-col gap-2">
            <h3 className="font-semibold text-gray-900">
              ⚡ Lightning Fast Generation
            </h3>
            <p className="text-sm text-gray-600">
              Create professional UGC ads in under 5 minutes. No video editing 
              skills required.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md flex flex-col gap-2">
            <h3 className="font-semibold text-gray-900">
              🎯 Highly Targeted
            </h3>
            <p className="text-sm text-gray-600">
              Customize ads for specific audiences, platforms, and campaign goals.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md flex flex-col gap-2">
            <h3 className="font-semibold text-gray-900">
              💰 Cost Effective
            </h3>
            <p className="text-sm text-gray-600">
              Save thousands on video production. Generate unlimited variations 
              for A/B testing.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md flex flex-col gap-2">
            <h3 className="font-semibold text-gray-900">
              🚀 Proven Results
            </h3>
            <p className="text-sm text-gray-600">
              Our users report 2-3x higher engagement rates compared to traditional ads.
            </p>
          </div>
        </div>

        {/* Success Stories */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Success Stories
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Success Story Card 1 */}
          <div className="bg-white rounded-xl p-6 shadow-md flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                E-commerce Brand
              </h3>
              <p className="text-xs text-gray-500 mb-2">Fashion & Apparel</p>
              <p className="text-gray-700 mb-4 text-sm">
                "Generated{" "}
                <span className="font-bold text-blue-600">50+ video ads</span>{" "}
                in one week. Our ROAS improved by{" "}
                <span className="font-bold text-blue-600">150%</span>!"
              </p>
            </div>
          </div>

          {/* Success Story Card 2 */}
          <div className="bg-white rounded-xl p-6 shadow-md flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Course Creator
              </h3>
              <p className="text-xs text-gray-500 mb-2">Online Education</p>
              <p className="text-gray-700 mb-4 text-sm">
                "Cut ad production time by{" "}
                <span className="font-bold text-blue-600">90%</span>. 
                Now launching new campaigns daily with ease."
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Ready to transform your advertising?
          </p>
          <p className="text-sm text-gray-500">
            Install the app in your Whop to get started with AI-powered UGC ads.
          </p>
        </div>
      </div>
    </div>
  );
}

