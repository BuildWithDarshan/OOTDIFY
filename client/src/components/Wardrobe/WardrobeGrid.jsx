import AnimatedGridItem from "./AnimatedGridItem.jsx";
import WardrobeItemCard from "./WardrobeItemCard.jsx";

const WardrobeGrid = ({ items }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 lg:gap-16">
      {items.map((item, i) => {
        const delay = (i % 3) * 100;

        return (
          <AnimatedGridItem
            key={item._id || `item-${i}`}
            delay={delay}
            className="w-full"
          >
            <WardrobeItemCard item={item} />
          </AnimatedGridItem>
        );
      })}
    </div>
  );
};

export default WardrobeGrid;