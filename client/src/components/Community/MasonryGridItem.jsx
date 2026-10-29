import { useEffect, useRef } from "react";

const MasonryGridItem = ({ children }) => {
    const itemRef = useRef(null);

    useEffect(() => {
        const item = itemRef.current;
        const grid = item?.parentElement;
        const content = item?.firstElementChild;
        if (!item || !grid || !content) return undefined;

        const updateRowSpan = () => {
            const styles = window.getComputedStyle(grid);
            const rowHeight = Number.parseFloat(styles.gridAutoRows) || 8;
            const rowGap = Number.parseFloat(styles.rowGap) || 0;
            const contentHeight = content.getBoundingClientRect().height;
            item.style.gridRowEnd = `span ${Math.max(
                1,
                Math.ceil((contentHeight + rowGap) / (rowHeight + rowGap)),
            )}`;
        };
        const observer = new ResizeObserver(updateRowSpan);
        observer.observe(content);
        updateRowSpan();

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={itemRef} className="self-start" style={{ gridRowEnd: "span 1" }}>
            {children}
        </div>
    );
};

export default MasonryGridItem;
