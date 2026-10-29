import { getOutfits } from "../services/outfitService.js";
import menLook from "../assets/images/men-banner-mobile.png";
import womenLook from "../assets/images/women-banner-mobile.png";
import duoLook from "../assets/images/home-banner-mobile.png";
import neutralLook from "../assets/images/wardrobe-banner-mobile.png";

// Development previews only. These are never posted to the community or saved to the database.
const localLooks = [
  ["Sandstone Afternoon", menLook, "Soft beige layers and relaxed tailoring."],
  ["After Dark Neutrals", womenLook, "Quiet tones with an easy, confident silhouette."],
  ["Two Ways to Go Minimal", duoLook, "A monochrome pairing with clean lines."],
  ["The Cream Edit", neutralLook, "Comfortable neutrals styled together."],
  ["Weekend in Beige", menLook, "A laid-back shirt and light trousers."],
  ["City Coffee Run", womenLook, "Relaxed separates for an everyday look."],
  ["Black and Ivory", duoLook, "A simple contrast that always works."],
  ["Soft Layers Club", neutralLook, "Easy layers in warm neutral shades."],
  ["Sunlit Essentials", menLook, "A light palette for an effortless day."],
  ["Downtown Neutrals", womenLook, "Tailored shapes with a casual finish."],
  ["Modern Monochrome", duoLook, "Two clean approaches to tonal dressing."],
  ["Everyday Ease", neutralLook, "Relaxed pieces with a polished feel."],
  ["Off-Duty Linen", menLook, "Breezy layers for warmer afternoons."],
  ["A Little Structure", womenLook, "A neat jacket and fluid trousers."],
  ["The Neutral Mood", duoLook, "Understated outfits with strong silhouettes."],
];

const makePreview = (id, title, imageUrl, description, tags = []) => ({
  _id: `preview-${id}`,
  isDemo: true,
  title,
  description,
  image: { url: imageUrl },
  user: { name: "OOTDIFY preview" },
  tags,
  likeCount: 0,
  commentCount: 0,
  isSaved: false,
});

export const getCommunityPreviewOutfits = async () => {
  if (!import.meta.env.DEV) return [];

  let catalogLooks = [];
  try {
    const data = await getOutfits();
    catalogLooks = (data.outfits || [])
      .filter((outfit) => outfit.coverImage?.url)
      .slice(0, 15)
      .map((outfit) => makePreview(
        outfit._id,
        outfit.title,
        outfit.coverImage.url,
        outfit.description || "A look from the OOTDIFY catalog, shown as a community layout preview.",
        [outfit.occasion?.name, outfit.outfitType?.name].filter(Boolean),
      ));
  } catch {
    // Local image previews still render when the API is unavailable.
  }

  const needed = Math.max(0, 15 - catalogLooks.length);
  return [
    ...catalogLooks,
    ...localLooks.slice(0, needed).map(([title, imageUrl, description], index) =>
      makePreview(`local-${index}`, title, imageUrl, description)),
  ];
};
