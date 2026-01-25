export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black text-white pt-16 sm:pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-wider mb-8 sm:mb-12">
          CONTACT US
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
          <div>
            <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 sm:mb-6">
              GET IN TOUCH
            </h2>
            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-300 font-light">
              <p>
                <span className="text-gray-500">Email:</span> contact@str.com
              </p>
              <p>
                <span className="text-gray-500">Phone:</span> +1 (555) 123-4567
              </p>
              <p>
                <span className="text-gray-500">Address:</span>
                <br />
                123 Luxury Avenue
                <br />
                New York, NY 10001
              </p>
            </div>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 sm:mb-6">
              SEND A MESSAGE
            </h2>
            <form className="space-y-3 sm:space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full bg-black border border-white/10 px-4 py-3 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 transition-colors"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full bg-black border border-white/10 px-4 py-3 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 transition-colors"
              />
              <textarea
                placeholder="Your Message"
                rows={6}
                className="w-full bg-black border border-white/10 px-4 py-3 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 transition-colors resize-none"
              />
              <button
                type="submit"
                className="w-full px-6 sm:px-8 py-3 sm:py-4 border border-white/20 hover:border-white/40 transition-all"
              >
                <span className="text-xs sm:text-sm font-light tracking-widest">
                  SEND MESSAGE
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
