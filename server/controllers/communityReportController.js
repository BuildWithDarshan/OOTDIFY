import mongoose from "mongoose";
import CommunityOutfit from "../models/CommunityOutfit.js";
import CommunityReport from "../models/CommunityReport.js";

const ALLOWED_REASONS = [
    "spam",
    "inappropriate",
    "copyright",
    "harassment",
    "other",
];

const REVIEW_STATUSES = ["dismissed", "actioned"];
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

export const createCommunityReport = async (req, res, next) => {
    try {
        const { outfitId, reason, details = "" } = req.body;

        if (!mongoose.Types.ObjectId.isValid(outfitId)) {
            return res.status(400).json({
                success: false,
                message: "A valid outfitId is required",
            });
        }

        if (!ALLOWED_REASONS.includes(reason)) {
            return res.status(400).json({
                success: false,
                message: `reason must be one of: ${ALLOWED_REASONS.join(", ")}`,
            });
        }

        if (typeof details !== "string" || details.trim().length > 1000) {
            return res.status(400).json({
                success: false,
                message: "details must be a string of 1000 characters or fewer",
            });
        }

        const outfit = await CommunityOutfit.findOne({
            _id: outfitId,
            isVisible: true,
            visibility: { $ne: "private" },
        }).select("_id user");

        if (!outfit) {
            return res.status(404).json({
                success: false,
                message: "Community outfit not found",
            });
        }

        if (outfit.user.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: "You cannot report your own outfit",
            });
        }

        const report = await CommunityReport.create({
            outfit: outfit._id,
            user: req.user.id,
            reason,
            details: details.trim(),
        });

        return res.status(201).json({
            success: true,
            message: "Report submitted for review",
            report: {
                id: report._id,
                outfit: report.outfit,
                reason: report.reason,
                status: report.status,
                createdAt: report.createdAt,
            },
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "You have already reported this outfit",
            });
        }

        next(error);
    }
};

export const getCommunityReports = async (req, res, next) => {
    try {
        const { page, limit, skip } = parsePagination(req.query);
        const status = req.query.status ?? "pending";

        if (!["pending", "dismissed", "actioned", "all"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "status must be pending, dismissed, actioned, or all",
            });
        }

        const query = status === "all" ? {} : { status };

        const [reports, total] = await Promise.all([
            CommunityReport.find(query)
                .populate({
                    path: "outfit",
                    select: "title image user isVisible",
                    populate: { path: "user", select: "name" },
                })
                .populate("user", "name email")
                .populate("reviewedBy", "name")
                .sort({ createdAt: -1, _id: -1 })
                .skip(skip)
                .limit(limit),
            CommunityReport.countDocuments(query),
        ]);

        return res.status(200).json({
            success: true,
            reports,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: skip + reports.length < total,
            },
        });
    } catch (error) {
        if (error.statusCode) res.status(error.statusCode);
        next(error);
    }
};

export const reviewCommunityReport = async (req, res, next) => {
    try {
        const { status, moderatorNote = "" } = req.body;

        if (!REVIEW_STATUSES.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `status must be one of: ${REVIEW_STATUSES.join(", ")}`,
            });
        }

        if (
            typeof moderatorNote !== "string" ||
            moderatorNote.trim().length > 1000
        ) {
            return res.status(400).json({
                success: false,
                message: "moderatorNote must be a string of 1000 characters or fewer",
            });
        }

        const report = await CommunityReport.findById(req.params.reportId);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Community report not found",
            });
        }

        if (report.status !== "pending") {
            return res.status(409).json({
                success: false,
                message: "This report has already been reviewed",
            });
        }

        report.status = status;
        report.reviewedBy = req.user.id;
        report.reviewedAt = new Date();
        report.moderatorNote = moderatorNote.trim();

        await report.save();

        return res.status(200).json({
            success: true,
            message: "Report reviewed successfully",
            report,
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({
                success: false,
                message: "Community report not found",
            });
        }

        next(error);
    }
};

export const setCommunityOutfitVisibility = async (req, res, next) => {
    try {
        const { isVisible } = req.body;

        if (typeof isVisible !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isVisible must be true or false",
            });
        }

        const outfit = await CommunityOutfit.findByIdAndUpdate(
            req.params.outfitId,
            { $set: { isVisible } },
            { new: true, runValidators: true },
        ).select("_id title isVisible");

        if (!outfit) {
            return res.status(404).json({
                success: false,
                message: "Community outfit not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: isVisible
                ? "Community outfit restored"
                : "Community outfit hidden",
            outfit,
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({
                success: false,
                message: "Community outfit not found",
            });
        }

        next(error);
    }
};