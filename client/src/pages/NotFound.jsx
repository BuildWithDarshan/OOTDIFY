import {Link} from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-bg text-text-primary flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        
        <p className="text-xl sm:text-base uppercase tracking-[0.25em] text-text-muted mb-4">
          OOTDIFY
        </p>

        <h1 className="font-display text-7xl sm:text-8xl md:text-9xl font-medium leading-none">
          404
        </h1>

        <h2 className="font-display italic text-2xl sm:text-3xl md:text-4xl mt-6">
          Looks like this page went out of style.
        </h2>

        <p className="text-sm sm:text-base text-text-secondary leading-relaxed mt-4 max-w-md mx-auto">
          The page you're looking for doesn't exist or may have been moved.
          Let's get you back to discovering your next look.
        </p>

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2
          mt-8 bg-text-primary text-bg rounded-full
          px-6 py-3 text-sm font-medium
          hover:bg-accent hover:text-on-accent
          transition-all duration-300"
        >
          Back to Home
          <span>→</span>
        </Link>

      </div>
    </div>
  )
}

export default NotFound
