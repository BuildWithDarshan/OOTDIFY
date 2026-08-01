import { useLocation } from "react-router-dom";

const SITE_NAME = "OOTDIFY";
const DEFAULT_TITLE = "OOTDIFY | Curated Outfits for Every Occasion";
const DEFAULT_DESCRIPTION =
  "Discover curated outfits, fashion trends, styling tips, and wardrobe essentials for every occasion with OOTDIFY.";

const pageMetadata = {
  "/": {
    title: DEFAULT_TITLE,
    description:
      "Discover curated outfits for men and women, celebrity-inspired looks, fashion trends, and wardrobe essentials for every occasion.",
  },
  "/men": {
    title: "Men's Outfits for Every Occasion | OOTDIFY",
    description:
      "Explore curated men's outfits for casual days, work, parties, dates, weddings, and every occasion in between.",
  },
  "/women": {
    title: "Women's Outfits for Every Occasion | OOTDIFY",
    description:
      "Explore curated women's outfits for casual days, work, parties, dates, weddings, and every occasion in between.",
  },
  "/trends": {
    title: "Latest Fashion Trends | OOTDIFY",
    description:
      "Discover the latest fashion trends, fresh outfit inspiration, and practical ways to make each trend your own.",
  },
  "/style-tips": {
    title: "Fashion Styling Tips & Guides | OOTDIFY",
    description:
      "Read practical fashion styling tips and dressing guides designed to help you build better outfits with confidence.",
  },
  "/wardrobe-essentials": {
    title: "Wardrobe Essentials | OOTDIFY",
    description:
      "Build a versatile wardrobe with timeless clothing, footwear, and accessories selected for repeat wear and effortless styling.",
  },
  "/about": {
    title: "About OOTDIFY | Curated Fashion Made Simple",
    description:
      "Learn how OOTDIFY makes personal style simpler through curated outfits, trusted shopping links, trends, and practical style guidance.",
  },
  "/favourites": {
    title: "Your Favourite Outfits | OOTDIFY",
    description:
      "View and manage the OOTDIFY outfits you have saved for later.",
    noIndex: true,
  },
  "/profile": {
    title: "Your Profile | OOTDIFY",
    description: "Manage your OOTDIFY profile and style preferences.",
    noIndex: true,
  },
  "/login": {
    title: "Log In | OOTDIFY",
    description: "Log in to your OOTDIFY account to access saved outfits and preferences.",
    noIndex: true,
  },
  "/register": {
    title: "Create an Account | OOTDIFY",
    description: "Create your OOTDIFY account and start saving outfits you love.",
    noIndex: true,
  },
};

const makeAbsoluteUrl = (value) => {
  if (!value || typeof value !== "string") return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (typeof window === "undefined") return value;
  return new URL(value, window.location.origin).href;
};

const PageMeta = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  image,
  noIndex = false,
}) => {
  const socialImage = makeAbsoluteUrl(image);

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta
        name="robots"
        content={noIndex ? "noindex, nofollow" : "index, follow"}
      />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {socialImage && <meta property="og:image" content={socialImage} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {socialImage && <meta name="twitter:image" content={socialImage} />}
    </>
  );
};

export const RouteMeta = () => {
  const { pathname } = useLocation();
  const metadata = pageMetadata[pathname];

  if (metadata) return <PageMeta {...metadata} />;

  // Detail pages provide metadata from their fetched content.
  if (
    pathname.startsWith("/outfit/") ||
    pathname.startsWith("/trends/") ||
    pathname.startsWith("/style-tips/")
  ) {
    return null;
  }

  return (
    <PageMeta
      title="Page Not Found | OOTDIFY"
      description="The page you requested could not be found on OOTDIFY."
      noIndex
    />
  );
};

export default PageMeta;
