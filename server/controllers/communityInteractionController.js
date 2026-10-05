import mongoose from "mongoose";
import CommunityComment from "../models/CommunityComment.js";
import CommunityLike from "../models/CommunityLike.js";
import CommunityOutfit from "../models/CommunityOutfit.js";
import CommunitySave from "../models/CommunitySave.js";

const MAX_PAGE_SIZE = 50;

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

    const safeLimit = Math.min(limit, MAX_PAGE_SIZE);

    return {
        page,
        limit: safeLimit,
        skip: (page - 1) * safeLimit,
    };
};

const getVisibleOutfit = async (outfitId, userId) =>
    CommunityOutfit.findOne({
        _id: outfitId,
        isVisible: true,
        $or: [
            { visibility: { $ne: "private" } },
            ...(userId ? [{ user: userId, visibility: "private" }] : []),
        ],
    });

export const getCommunityInteractionState = async (req, res, next) => {
    try {
        const outfit = await getVisibleOutfit(req.params.outfitId, req.user.id);

        if (!outfit) {
            return res.status(404).json({
                success: false,
                message: "Community outfit not found",
            });
        }

        const [liked, saved] = await Promise.all([
            CommunityLike.exists({ user: req.user.id, outfit: outfit._id }),
            CommunitySave.exists({ user: req.user.id, outfit: outfit._id }),
        ]);

        return res.status(200).json({
            success: true,
            liked: Boolean(liked),
            saved: Boolean(saved),
        });
    } catch (error) {
        if (error.statusCode) res.status(error.statusCode);
        next(error);
    }
};

export const getCommunityInteractionStates = async (req, res, next) => {
    try {
        const { outfitIds } = req.body;

        if (
            !Array.isArray(outfitIds) ||
            outfitIds.length > MAX_PAGE_SIZE ||
            outfitIds.some(
                (id) =>
                    typeof id !== "string" ||
                    !mongoose.Types.ObjectId.isValid(id),
            )
        ) {
            return res.status(400).json({
                success: false,
                message: `outfitIds must be an array of at most ${MAX_PAGE_SIZE} valid outfit IDs`,
            });
        }

        const uniqueIds = [...new Set(outfitIds.map((id) => id.toLowerCase()))];
        const accessibleOutfits = await CommunityOutfit.find({
            _id: { $in: uniqueIds },
            isVisible: true,
            $or: [
                { visibility: { $ne: "private" } },
                { user: req.user.id, visibility: "private" },
            ],
        })
            .select("_id")
            .lean();
        const accessibleIds = accessibleOutfits.map((outfit) =>
            outfit._id.toString(),
        );
        const [likes, saves] = await Promise.all([
            CommunityLike.find({
                user: req.user.id,
                outfit: { $in: accessibleIds },
            })
                .select("outfit")
                .lean(),
            CommunitySave.find({
                user: req.user.id,
                outfit: { $in: accessibleIds },
            })
                .select("outfit")
                .lean(),
        ]);
        const likedIds = new Set(likes.map((like) => like.outfit.toString()));
        const savedIds = new Set(saves.map((save) => save.outfit.toString()));

        return res.status(200).json({
            success: true,
            states: Object.fromEntries(
                accessibleIds.map((id) => [
                    id,
                    {
                        liked: likedIds.has(id),
                        saved: savedIds.has(id),
                    },
                ]),
            ),
        });
    } catch (error) {
        if (error.statusCode) res.status(error.statusCode);
        next(error);
    }
};

const changeCount = (outfit, field, amount) => {
    const update = amount > 0
        ? { $inc: { [field]: amount } }
        : { $inc: { [field]: amount } };

    const filter = amount < 0
        ? { _id: outfit._id, [field]: { $gt: 0 } }
        : { _id: outfit._id };

    return CommunityOutfit.updateOne(filter, update);
};

export const toggleCommunityLike = async (req, res, next) => {
    try {
        const outfit = await getVisibleOutfit(req.params.outfitId, req.user.id);

        if (!outfit) {
            return res.status(404).json({
                success: false,
                message: "Community outfit not found",
            });
        }

        const existingLike = await CommunityLike.findOne({
            user: req.user.id,
            outfit: outfit._id,
        });

        if (existingLike) {
            await existingLike.deleteOne();
            await changeCount(outfit, "likeCount", -1);

            return res.status(200).json({
                success: true,
                liked: false,
                likeCount: Math.max(0, outfit.likeCount - 1),
            });
        }

        try {
            await CommunityLike.create({
                user: req.user.id,
                outfit: outfit._id,
            });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: "You have already liked this outfit",
                });
            }
            throw error;
        }

        await changeCount(outfit, "likeCount", 1);

        return res.status(200).json({
            success: true,
            liked: true,
            likeCount: outfit.likeCount + 1,
        });
    } catch (error) {
        if (error.statusCode) res.status(error.statusCode);
        next(error);
    }
};

export const toggleCommunitySave = async (req, res, next) => {
    try {
        const outfit = await getVisibleOutfit(req.params.outfitId, req.user.id);

        if (!outfit) {
            return res.status(404).json({
                success: false,
                message: "Community outfit not found",
            });
        }

        const existingSave = await CommunitySave.findOne({
            user: req.user.id,
            outfit: outfit._id,
        });

        if (existingSave) {
            await existingSave.deleteOne();
            await changeCount(outfit, "saveCount", -1);

            return res.status(200).json({
                success: true,
                saved: false,
                saveCount: Math.max(0, outfit.saveCount - 1),
            });
        }

        try {
            await CommunitySave.create({
                user: req.user.id,
                outfit: outfit._id,
            });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: "You have already saved this outfit",
                });
            }
            throw error;
        }

        await changeCount(outfit, "saveCount", 1);

        return res.status(200).json({
            success: true,
            saved: true,
            saveCount: outfit.saveCount + 1,
        });
    } catch (error) {
        if (error.statusCode) res.status(error.statusCode);
        next(error);
    }
};

export const getCommunityComments = async (req, res, next) => {
    try {
        const { page, limit, skip } = parsePagination(req.query);
        const outfit = await getVisibleOutfit(req.params.outfitId, req.user?.id);

        if (!outfit) {
            return res.status(404).json({
                success: false,
                message: "Community outfit not found",
            });
        }

        const query = { outfit: outfit._id };

        const [comments, total] = await Promise.all([
            CommunityComment.find(query)
                .populate("user", "name")
                .sort({ createdAt: 1, _id: 1 })
                .skip(skip)
                .limit(limit),
            CommunityComment.countDocuments(query),
        ]);

        return res.status(200).json({
            success: true,
            comments,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: skip + comments.length < total,
            },
        });
    } catch (error) {
        if (error.statusCode) res.status(error.statusCode);
        next(error);
    }
};

export const addCommunityComment = async (req, res, next) => {
    try {
        const { text } = req.body;

        if (typeof text !== "string" || !text.trim()) {
            return res.status(400).json({
                success: false,
                message: "Comment text is required",
            });
        }

        if (text.trim().length > 1000) {
            return res.status(400).json({
                success: false,
                message: "Comment must be 1000 characters or fewer",
            });
        }

        const outfit = await getVisibleOutfit(req.params.outfitId, req.user.id);

        if (!outfit) {
            return res.status(404).json({
                success: false,
                message: "Community outfit not found",
            });
        }

        const comment = await CommunityComment.create({
            outfit: outfit._id,
            user: req.user.id,
            text: text.trim(),
        });

        await CommunityOutfit.updateOne(
            { _id: outfit._id },
            { $inc: { commentCount: 1 } },
        );

        await comment.populate("user", "name");

        return res.status(201).json({
            success: true,
            message: "Comment added successfully",
            comment,
            commentCount: outfit.commentCount + 1,
        });
    } catch (error) {
        if (error.statusCode) res.status(error.statusCode);
        next(error);
    }
};

export const deleteCommunityComment = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.commentId)) {
            return res.status(404).json({
                success: false,
                message: "Comment not found",
            });
        }

        const comment = await CommunityComment.findById(
            req.params.commentId,
        );

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found",
            });
        }

        const outfit = await getVisibleOutfit(comment.outfit, req.user.id);
        if (!outfit) {
            return res.status(404).json({
                success: false,
                message: "Community outfit not found",
            });
        }

        if (comment.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own comments",
            });
        }

        await comment.deleteOne();

        await CommunityOutfit.updateOne(
            { _id: comment.outfit, commentCount: { $gt: 0 } },
            { $inc: { commentCount: -1 } },
        );

        return res.status(200).json({
            success: true,
            message: "Comment deleted successfully",
        });
    } catch (error) {
        if (error.statusCode) res.status(error.statusCode);
        next(error);
    }
};

export const getSavedCommunityOutfits = async (req, res, next) => {
    try {
        const { page, limit, skip } = parsePagination(req.query);

        const saves = await CommunitySave.find({ user: req.user.id })
            .sort({ createdAt: -1, _id: -1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: "outfit",
                match: {
                    isVisible: true,
                    $or: [
                        { visibility: { $ne: "private" } },
                        { user: req.user.id, visibility: "private" },
                    ],
                },
                populate: [
                    { path: "user", select: "name profilePicture" },
                    { path: "outfitType", select: "name slug" },
                    { path: "occasion", select: "name slug" },
                ],
            });

        const outfits = saves
            .map((save) => save.outfit)
            .filter(Boolean);

        const total = await CommunitySave.countDocuments({
            user: req.user.id,
        });

        return res.status(200).json({
            success: true,
            outfits,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: skip + saves.length < total,
            },
        });
    } catch (error) {
        if (error.statusCode) res.status(error.statusCode);
        next(error);
    }
};