import OutfitBrowse from "./OutfitBrowse.jsx";
import womenBanner from "../assets/images/women-banner.png"
import womenBannerMobile from "../assets/images/women-banner-mobile.png"

const Women = () => <OutfitBrowse gender="women"
hero={{
      desktopImage: womenBanner,
      mobileImage: womenBannerMobile,
      wordmark: "WOMEN",
      topRightLabel: "EDIT",
      dividerLeft: "ELEGANT",
      dividerCenter: "STYLED FOR EVERY OCCASION",
      dividerRight: "TIMELESS",
      fullHeight: true,
    }}
/>

export default Women;