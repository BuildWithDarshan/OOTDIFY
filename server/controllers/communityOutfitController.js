import mongoose from "mongoose";
import CommunityOutfit from "../models/CommunityOutfit.js";
import CommunityLike from "../models/CommunityLike.js";
import CommunitySave from "../models/CommunitySave.js";
import CommunityComment from "../models/CommunityComment.js";
import CommunityReport from "../models/CommunityReport.js";
import Occasion from "../models/Occasion.js";
import OutfitType from "../models/OutfitType.js";
import User from "../models/User.js";
import {
    deleteImageCloudinary,
    uploadImageToCloudinary,
} from "../services/cloudinaryService.js";

const ALLOWED_SORTS = [
    "latest",
    "mostLiked",
    "mostSaved",
    "mostCommented",
    "trending",
];
const MAX_PAGE_SIZE = 50;

const outfitPopulation = [
    { path: "user", select: "name profilePicture" },
    { path: "outfitType", select: "name slug" },
    { path: "occasion", select: "name slug" },
];

const parsePagination = (query) => {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);

    if (
        !Number.isInteger(page) ||
        page < 1 ||
        !Number.isInteger(limit) ||
        limit < 1
    ) {
        const error = new Error("page and limit must be positive integers");
        error.statusCode = 400;
        throw error;
    }

    return {
        page,
        limit: Math.min(limit, MAX_PAGE_SIZE),
        skip: (page - 1) * Math.min(limit, MAX_PAGE_SIZE),
    };
};

const getSortOption = (sort) => {
    switch (sort) {
        case "latest":
            return { createdAt: -1, _id: -1 };
        case "mostLiked":
            return { likeCount: -1, createdAt: -1, _id: -1 };
        case "mostSaved":
            return { saveCount: -1, createdAt: -1, _id: -1 };
        case "mostCommented":
            return { commentCount: -1, createdAt: -1, _id: -1 };
        case "trending":
            return {
                likeCount: -1,
                saveCount: -1,
                commentCount: -1,
                createdAt: -1,
                _id: -1,
            };
        default: {
            const error = new Error(
                `sort must be one of: ${ALLOWED_SORTS.join(", ")}`,
            );
            error.statusCode = 400;
            throw error;
        }
    }
};

const resolveTaxonomyId = async (value, Model, fieldName) => {
    if (mongoose.Types.ObjectId.isValid(value)) {
        return value;
    }

    const taxonomy = await Model.findOne({
        isActive: true,
        slug: String(value).trim().toLowerCase(),
    }).select("_id");

    if (!taxonomy) {
        const error = new Error(`${fieldName} was not found`);
        error.statusCode = 400;
        throw error;
    }

    return taxonomy._id;
};

const validateActiveTaxonomy = async (occasionId, outfitTypeId) => {
    const [occasion, outfitType] = await Promise.all([
        Occasion.findOne({ _id: occasionId, isActive: true }).select("_id"),
        OutfitType.findOne({ _id: outfitTypeId, isActive: true }).select("_id"),
    ]);

    if (!occasion) {
        const error = new Error("Invalid or inactive occasion");
        error.statusCode = 400;
        throw error;
    }

    if (!outfitType) {
        const error = new Error("Invalid or inactive outfit type");
        error.statusCode = 400;
        throw error;
    }
};

const buildFeedQuery = async (queryParams) => {
    const query = { isVisible: true };
    const conditions = [];

    if (queryParams.gender) {
        query.gender = queryParams.gender;
    }

    if (queryParams.category) {
        query.outfitType = await resolveTaxonomyId(
            queryParams.category,
            OutfitType,
            "category",
        );
    }

    if (queryParams.occasion) {
        query.occasion = await resolveTaxonomyId(
            queryParams.occasion,
            Occasion,
            "occasion",
        );
    }

    if (queryParams.tags) {
        const tags = String(queryParams.tags)
            .split(",")
            .map((tag) => tag.trim().toLowerCase())
            .filter(Boolean);

        if (tags.length) {
            query.tags = { $in: tags };
        }
    }

    if (queryParams.search) {
        const search = String(queryParams.search).trim().slice(0, 100);

        if (search) {
            const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const searchRegex = new RegExp(escapedSearch, "i");

            const [matchingTypes, matchingOccasions] = await Promise.all([
                OutfitType.find({
                    isActive: true,
                    name: searchRegex,
                }).select("_id"),
                Occasion.find({
                    isActive: true,
                    name: searchRegex,
                }).select("_id"),
            ]);

            conditions.push({
                $or: [
                    { title: searchRegex },
                    { description: searchRegex },
                    { tags: searchRegex },
                    { outfitType: { $in: matchingTypes.map((item) => item._id) } },
                    { occasion: { $in: matchingOccasions.map((item) => item._id) } },
                ],
            });
        }
    }

    if (conditions.length) {
        query.$and = conditions;
    }

    return query;
};

const forwardError = (error, res, next) => {
    if (error.statusCode && res.statusCode === 200) {
        res.status(error.statusCode);
    }
    next(error);
};

export const getCommunityOutfits = async (req, res, next) => {
    try {
        const { page, limit, skip } = parsePagination(req.query);
        const sort = getSortOption(req.query.sort || "latest");
        const query = await buildFeedQuery(req.query);

        const [outfits, total] = await Promise.all([
            CommunityOutfit.find(query)
                .populate(outfitPopulation)
                .sort(sort)
                .skip(skip)
                .limit(limit),
            CommunityOutfit.countDocuments(query),
        ]);

        return res.status(200).json({
            success: true,
            outfits,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: skip + outfits.length < total,
            },
        });
    } catch (error) {
        return forwardError(error, res, next);
    }
};

export const getCommunityCreatorProfile = async (req, res, next) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(404).json({
                success: false,
                message: "Community creator not found",
            });
        }

        const creator = await User.findOne({
            _id: userId,
            isActive: true,
        }).select("name createdAt profilePicture");

        if (!creator) {
            return res.status(404).json({
                success: false,
                message: "Community creator not found",
            });
        }

        const { page, limit, skip } = parsePagination(req.query);
        const outfitQuery = { user: creator._id, isVisible: true };
        const [outfits, total, totals] = await Promise.all([
            CommunityOutfit.find(outfitQuery)
                .populate(outfitPopulation)
                .sort({ createdAt: -1, _id: -1 })
                .skip(skip)
                .limit(limit),
            CommunityOutfit.countDocuments(outfitQuery),
            CommunityOutfit.aggregate([
                { $match: outfitQuery },
                {
                    $group: {
                        _id: null,
                        outfitCount: { $sum: 1 },
                        likeCount: { $sum: "$likeCount" },
                    },
                },
            ]),
        ]);

        const stats = totals[0] || { outfitCount: 0, likeCount: 0 };

        return res.status(200).json({
            success: true,
            creator,
            stats: {
                outfitCount: stats.outfitCount,
                likeCount: stats.likeCount,
            },
            outfits,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: skip + outfits.length < total,
            },
        });
    } catch (error) {
        return forwardError(error, res, next);
    }
};

export const getCommunityOutfitById = async (req, res, next) => {
    try {
        const outfit = await CommunityOutfit.findOne({
            _id: req.params.id,
            isVisible: true,
        }).populate(outfitPopulation);

        if (!outfit) {
            return res.status(404).json({
                success: false,
                message: "Community outfit not found",
            });
        }

        return res.status(200).json({ success: true, outfit });
    } catch (error) {
        return forwardError(error, res, next);
    }
};

export const getRelatedCommunityOutfits = async (req, res, next) => {
    try {
        const { page, limit, skip } = parsePagination(req.query);
        const sort = req.query.sort || "relevance";
        const sourceOutfit = await CommunityOutfit.findOne({
            _id: req.params.id,
            isVisible: true,
        }).select("gender outfitType occasion tags");

        if (!sourceOutfit) {
            return res.status(404).json({
                success: false,
                message: "Community outfit not found",
            });
        }

        const sourceTags = (sourceOutfit.tags || [])
            .map((tag) => tag.trim().toLowerCase())
            .filter(Boolean);
        const matchingSignals = [
            { gender: sourceOutfit.gender },
            { outfitType: sourceOutfit.outfitType },
            { occasion: sourceOutfit.occasion },
        ];

        if (sourceTags.length > 0) {
            matchingSignals.push({ tags: { $in: sourceTags } });
        }

        const match = {
            $and: [
                {
                    isVisible: true,
                    _id: { $ne: sourceOutfit._id },
                    $or: matchingSignals,
                },
                await buildFeedQuery(req.query),
            ],
        };
        const sortOrder =
            sort === "relevance"
                ? { relevanceScore: -1, createdAt: -1, _id: -1 }
                : { ...getSortOption(sort), relevanceScore: -1 };
        const sharedTagsExpression = {
            $setIntersection: [
                { $ifNull: ["$tags", []] },
                sourceTags,
            ],
        };

        const [rankedOutfits, total] = await Promise.all([
            CommunityOutfit.aggregate([
                { $match: match },
                {
                    $addFields: {
                        sharedTags: sharedTagsExpression,
                    },
                },
                {
                    $addFields: {
                        relevanceScore: {
                            $add: [
                                {
                                    $cond: [
                                        { $eq: ["$gender", sourceOutfit.gender] },
                                        2,
                                        0,
                                    ],
                                },
                                {
                                    $cond: [
                                        {
                                            $eq: [
                                                "$outfitType",
                                                sourceOutfit.outfitType,
                                            ],
                                        },
                                        4,
                                        0,
                                    ],
                                },
                                {
                                    $cond: [
                                        {
                                            $eq: [
                                                "$occasion",
                                                sourceOutfit.occasion,
                                            ],
                                        },
                                        3,
                                        0,
                                    ],
                                },
                                { $multiply: [{ $size: "$sharedTags" }, 2] },
                            ],
                        },
                    },
                },
                { $sort: sortOrder },
                { $skip: skip },
                { $limit: limit + 1 },
                { $project: { _id: 1, relevanceScore: 1, sharedTags: 1 } },
            ]),
            CommunityOutfit.countDocuments(match),
        ]);

        const hasMore = rankedOutfits.length > limit;
        const pageOutfits = rankedOutfits.slice(0, limit);
        const pageIds = pageOutfits.map((item) => item._id);
        const populatedOutfits = pageIds.length
            ? await CommunityOutfit.find({ _id: { $in: pageIds } })
                  .populate(outfitPopulation)
                  .lean()
            : [];
        const outfitsById = new Map(
            populatedOutfits.map((outfit) => [outfit._id.toString(), outfit]),
        );

        const outfits = pageOutfits
            .map((rankedOutfit) => {
                const outfit = outfitsById.get(rankedOutfit._id.toString());
                if (!outfit) return null;

                return {
                    ...outfit,
                    relevanceScore: rankedOutfit.relevanceScore,
                    sharedTags: rankedOutfit.sharedTags,
                };
            })
            .filter(Boolean);

        return res.status(200).json({
            success: true,
            outfits,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore,
            },
        });
    } catch (error) {
        return forwardError(error, res, next);
    }
};

export const createCommunityOutfit = async (req, res, next) => {
    let uploadedImage;

    try {
        const { title, description, gender, occasion, outfitType, tags, productLinks } =
            req.body;

        const [occasionId, outfitTypeId] = await Promise.all([
            resolveTaxonomyId(occasion, Occasion, "occasion"),
            resolveTaxonomyId(outfitType, OutfitType, "category"),
        ]);

        await validateActiveTaxonomy(occasionId, outfitTypeId);

        uploadedImage = await uploadImageToCloudinary(
            req.file.path,
            "ootdify/community",
        );

        const outfit = await CommunityOutfit.create({
            user: req.user.id,
            image: uploadedImage,
            title: title.trim(),
            description: description?.trim() || "",
            gender,
            occasion: occasionId,
            outfitType: outfitTypeId,
            tags: tags || [],
            productLinks: productLinks || {},
        });

        return res.status(201).json({
            success: true,
            message: "Community outfit created successfully",
            outfit,
        });
    } catch (error) {
        if (uploadedImage?.publicId) {
            await deleteImageCloudinary(uploadedImage.publicId);
        }
        return forwardError(error, res, next);
    }
};

export const updateCommunityOutfit = async (req, res, next) => {
    let replacementImage;

    try {
        const outfit = await CommunityOutfit.findById(req.params.id);

        if (!outfit) {
            return res.status(404).json({
                success: false,
                message: "Community outfit not found",
            });
        }

        if (outfit.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You can only edit your own community outfits",
            });
        }

        const { title, description, gender, occasion, outfitType, tags, productLinks } =
            req.body;

        const occasionId = occasion === undefined
            ? outfit.occasion
            : await resolveTaxonomyId(occasion, Occasion, "occasion");

        const outfitTypeId = outfitType === undefined
            ? outfit.outfitType
            : await resolveTaxonomyId(outfitType, OutfitType, "category");

        if (occasion !== undefined || outfitType !== undefined) {
            await validateActiveTaxonomy(occasionId, outfitTypeId);
        }

        if (title !== undefined) outfit.title = title.trim();
        if (description !== undefined) outfit.description = description.trim();
        if (gender !== undefined) outfit.gender = gender;
        if (occasion !== undefined) outfit.occasion = occasionId;
        if (outfitType !== undefined) outfit.outfitType = outfitTypeId;
        if (tags !== undefined) outfit.tags = tags;
        if (productLinks !== undefined) {
            outfit.productLinks = {
                ...outfit.productLinks.toObject?.(),
                ...productLinks,
            };
        }

        const oldPublicId = outfit.image.publicId;

        if (req.file) {
            replacementImage = await uploadImageToCloudinary(
                req.file.path,
                "ootdify/community",
            );
            outfit.image = replacementImage;
        }

        await outfit.save();

        if (replacementImage && oldPublicId !== replacementImage.publicId) {
            await deleteImageCloudinary(oldPublicId);
        }

        return res.status(200).json({
            success: true,
            message: "Community outfit updated successfully",
            outfit,
        });
    } catch (error) {
        if (replacementImage?.publicId) {
            await deleteImageCloudinary(replacementImage.publicId);
        }
        return forwardError(error, res, next);
    }
};

export const deleteCommunityOutfit = async (req, res, next) => {
    try {
        const outfit = await CommunityOutfit.findById(req.params.id);

        if (!outfit) {
            return res.status(404).json({
                success: false,
                message: "Community outfit not found",
            });
        }

        if (outfit.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own community outfits",
            });
        }

        await Promise.all([
            CommunityLike.deleteMany({ outfit: outfit._id }),
            CommunitySave.deleteMany({ outfit: outfit._id }),
            CommunityComment.deleteMany({ outfit: outfit._id }),
            CommunityReport.deleteMany({ outfit: outfit._id }),
        ]);

        await outfit.deleteOne();
        await deleteImageCloudinary(outfit.image.publicId);

        return res.status(200).json({
            success: true,
            message: "Community outfit deleted successfully",
        });
    } catch (error) {
        return forwardError(error, res, next);
    }
};

export const getMyCommunityOutfits = async (req, res, next) => {
    try {
        const { page, limit, skip } = parsePagination(req.query);
        const query = { user: req.user.id };

        const [outfits, total] = await Promise.all([
            CommunityOutfit.find(query)
                .populate(outfitPopulation)
                .sort({ createdAt: -1, _id: -1 })
                .skip(skip)
                .limit(limit),
            CommunityOutfit.countDocuments(query),
        ]);

        return res.status(200).json({
            success: true,
            outfits,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: skip + outfits.length < total,
            },
        });
    } catch (error) {
        return forwardError(error, res, next);
    }
};