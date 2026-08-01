import Item from "../models/Item.js";
import {uploadImageToCloudinary, deleteImageCloudinary} from "../services/cloudinaryService.js";

export const createItem = async(req,res) => {
    try {
        
        const {name, price, referralLink, shoppingSite, brand, gender, itemType, itemSubType, isWardrobeEssential} = req.body;

        if(!name || !price || !referralLink || !shoppingSite || !gender || !itemType || !itemSubType) {
            return res.status(400).json({success: false, message: "All required fields are must be provided"});
        }

        if(!req.file) {
            return res.status(400).json({success: false, message: "Item image is required"});
        }

        const parsedPrice = Number(price);
        if(isNaN(parsedPrice) || parsedPrice < 0) {
            return res.status(400).json({success: false, message : "Price must be a valid non-negative number"})
        }

        const {url, publicId} = await uploadImageToCloudinary(req.file.path, "ootdify/items");
 
        const item = await Item.create({
            name: name.trim(),
            price : parsedPrice,
            referralLink,
            shoppingSite,
            brand: brand ? brand.trim() : undefined,
            gender,
            itemType,
            itemSubType: itemSubType.trim(),
            isWardrobeEssential: isWardrobeEssential === "true",
            image: {url, publicId},
        });

        return res.status(201).json({success: true, message: "Item Created Successfully", item});

    } catch (error) {
        return res.status(500).json({success: false, message: "Somthing went wrong while creating the item", error: error.message});
    }
}

export const getItems = async(req,res) => {
    try {
        
        const {gender, itemType, itemSubType, brand, isWardrobeEssential} = req.query;

        const filter = {isActive: true};
        if(gender) filter.gender = gender;
        if (itemType) filter.itemType = itemType;
        if (itemSubType) filter.itemSubType = itemSubType;
        if (brand) filter.brand = brand;
        if (isWardrobeEssential !== undefined) {
            filter.isWardrobeEssential = isWardrobeEssential === "true";
        }

        const items = await Item.find(filter).sort({createdAt: -1});

        return res.status(200).json({
            success: true,
            count: items.length,
            items,
        });

    } catch (error) {
        return res.status(500).json({success:false, message: "Something went wrong while fetching items", error: error.message});
    }
}

export const getItemById = async(req,res) => {
    try {
       
        const item = await Item.findById(req.params.id);

        if(!item || !item.isActive) {
            return res.status(404).json({success: false, message: "Item not found"});
        }

        return res.status(200).json({success: true, item});

    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({
                success: false,
                message: "Item not found",
          });
          }
          return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching the item",
            error: error.message,
          });
    }
}

export const updateItem = async(req,res) => {
    try {

        const item = await Item.findById(req.params.id);

        if(!item) {
            return res.status(404).json({success: false, message: "Item not found"});
        }
        
        const {name, price, referralLink, shoppingSite, brand, gender, itemType, itemSubType, isActive, isWardrobeEssential} = req.body;

        if (name !== undefined) item.name = name.trim();
        if (referralLink !== undefined) item.referralLink = referralLink;
        if (shoppingSite !== undefined) item.shoppingSite = shoppingSite;
        if (gender !== undefined) item.gender = gender;
        if (itemType !== undefined) item.itemType = itemType;
        if (itemSubType !== undefined) item.itemSubType = itemSubType.trim();
        if (brand !== undefined) item.brand = brand.trim();
        if (isWardrobeEssential !== undefined) item.isWardrobeEssential = isWardrobeEssential === "true";
        if (isActive !== undefined) item.isActive = isActive === "true";

        if(price !== undefined) {
            const parsedPrice = Number(price);
            if(isNaN(parsedPrice) || parsedPrice < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Price must be a valid non-negative number",
                });
            }
            item.price = parsedPrice;
        }

        if(req.file) {
            const oldPublicId = item.image?.publicId;
            const {url, publicId} = await uploadImageToCloudinary(req.file.path, "ootdify/items");
            item.image = {url, publicId};
            await deleteImageCloudinary(oldPublicId);
        }

        await item.save();

        return res.status(200).json({success: true, message: "Item Updated Successfully",item});
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({
                success: false,
                message: "Item not found",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Something went wrong while updating the item",
            error: error.message,
        });
    }
}

export const deleteItem = async(req,res) => {
    try {
        
        const item = await Item.findById(req.params.id);

        if(!item) {
            return res.status(404).json({success: false, message: "Item not found"});
        }
        
        item.isActive = false;
        await item.save();

        return res.status(200).json({success:true, message: "Item deleted successfully"})
        
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({
                success: false,
                message: "Item not found",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Something went wrong while deleting the item",
            error: error.message,
        });
    }
}