import OutfitBrowse from "./OutfitBrowse.jsx";
import menBanner from "../assets/images/men-banner.png"
import menBannerMobile from "../assets/images/men-banner-mobile.png"

const Men = () => <OutfitBrowse
gender="men"
hero={{
  desktopImage: menBanner,
  mobileImage: menBannerMobile,
  wordmark: "MEN",
  topRightLabel: "EDIT",
  dividerLeft: "SHARP",
  dividerCenter: "STYLED FOR EVERY OCCASION",
  dividerRight: "REFINED",
  fullHeight: true,
}}/>

export default Men;