import PageHero from "../components/Common/PageHero.jsx";
import OOTDBanner from "../components/Home/OOTDBanner.jsx"
import TrendingPreview from "../components/Home/TrendingPreview.jsx"
import homeBanner from "../assets/images/Home-banner.png";
import homeBannerMobile from "../assets/images/home-banner-mobile.png";
import CTASection from "../components/Home/CTASection.jsx";
import CategorySplit from "../components/Home/CategorySplit.jsx";
import WardrobeTeaser from "../components/Home/WardrobeTeaser.jsx";
import CelebrityInspired from "../components/Home/CelebrityInspired.jsx";

const Home = () => {
  return (
    <div>
      <PageHero
      desktopImage={homeBanner}
      mobileImage={homeBannerMobile}
      wordmark="OOTDIFY"
      topRightLabel="SEASON"
      dividerLeft="CURATED"
      dividerCenter="FOR EVERY OCCASION"
      dividerRight="STYLED"
      ctaLabel="EXPLORE LOOKS"
      ctaHref="#ootd"
      fullHeight
      />
      <OOTDBanner/>
      <CategorySplit/>
      <CelebrityInspired/>
      <TrendingPreview/>
      <WardrobeTeaser/>
      <CTASection/>
    </div>
  )
}

export default Home
