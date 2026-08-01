import Item from "../models/Item.js";
import Click from "../models/Click.js";

export const redirectToReferral = async(req,res) => {
    try {
        
        const { itemId} = req.params;
        const {outfitId} = req.query;

        const item = await Item.findById(itemId);

        if(!item || !item.isActive) {
            return res.status(404).json("Item not found");
        }

        Click.create({
            item: item._id,
            outfit: outfitId || undefined,
            shoppingSite: item.shoppingSite,
            userAgent: req.headers["user-agent"],
            ip: req.ip,
        }).catch((err) => {
            console.error("Failed to log click for item", item._id.toString(), ":", err.message);
        });

        return res.redirect(302, item.referralLink);

    } catch (error) {
        console.error("Redirect error:", error);   // add this line
        if (error.name === "CastError") {
           return res.status(404).send("Item not found");
        }
        return res.status(500).send("Something went wrong while redirecting");
    }
}