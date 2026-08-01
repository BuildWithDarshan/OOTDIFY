import { Link } from "react-router-dom";

const BG_COLORS = ["#edede9","#d6ccc2","#f5ebe0","#e3d5ca","#d5bdaf"]

const TrendRow = ({ trend, reversed, index }) => {
  const bgColor = BG_COLORS[index % BG_COLORS.length];

  return (
    <section
      className="sticky top-0 h-screen min-h-screen w-full flex items-center overflow-hidden"
      style={{ zIndex: index + 1, backgroundColor: bgColor }}
    >
      <Link
        to={`/trends/${trend._id}`}
        className="
          group
          w-full
          h-full
          min-h-full
          max-w-6xl
          mx-auto
          px-4
          sm:px-6
          lg:px-10
          overflow-y-auto
          md:overflow-visible
          grid
          grid-cols-1
          md:grid-cols-2
          gap-4
          sm:gap-6
          md:gap-10
          items-center
          py-6
          sm:py-8
          md:py-0
        "
      >
        {/* IMAGE */}
        <div
  className={`
    relative
    w-full
    flex
    items-center
    justify-center
    ${reversed ? "md:order-2" : "md:order-1"}
  `}
>
  <div className="relative inline-block max-w-full">
    <img
      src={trend.coverImage?.url || trend.coverImage}
      alt={trend.title}
      className="
        block
        max-w-full
        w-auto
        max-h-[34dvh]
        sm:max-h-[42dvh]
        md:max-h-[70dvh]
        duration-700
        transition-transform
        group-hover:scale-105
      "
    />

    {trend.gender && (
      <span
        className="
          absolute
      bottom-3
      right-3
      top-auto
      left-auto
      sm:top-5
      sm:left-5
      sm:bottom-auto
      sm:right-auto
      rounded-full
      bg-white/90
      backdrop-blur
      px-3
      py-1.5
      sm:px-4
      sm:py-2
      text-[10px]
      sm:text-xs
      font-medium
      capitalize
        "
      >
        {trend.gender}
      </span>
    )}
  </div>
</div>

        {/* CONTENT */}
        <div className={reversed ? "md:order-1" : "md:order-2"}>
          <p className="uppercase tracking-[0.3em] sm:tracking-[0.35em] text-[10px] sm:text-xs text-text-muted mb-2 sm:mb-4">
            Trend
          </p>

          <h2 className="font-display italic text-2xl sm:text-4xl md:text-5xl xl:text-6xl leading-tight md:leading-none">
            {trend.title}
          </h2>

          <p className="mt-2.5 sm:mt-6 md:mt-8 text-sm sm:text-base md:text-lg leading-relaxed md:leading-8 text-text-secondary max-w-xl line-clamp-3 md:line-clamp-none">
            {trend.description}
          </p>

          <div className="mt-4 sm:mt-8 md:mt-10">
            <span
              className="
                inline-flex
                items-center
                gap-2
                bg-text-primary
                text-bg
                rounded-full
                px-4
                py-2.5
                sm:px-5
                sm:py-3
                text-xs
                sm:text-sm
                font-medium
                tracking-wide
                transition-all
                duration-500
                ease-[cubic-bezier(0.34,1.56,0.64,1)]
                group-hover:bg-accent
                group-hover:text-on-accent
                group-hover:gap-3
                group-hover:scale-105
              "
            >
              Explore Trend
              <span className="transition-transform duration-500 group-hover:translate-x-1">
                →
              </span>
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
};

export default TrendRow;
