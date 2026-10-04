import api from "./api.js";

export const getCommunityReports = (params = {}) =>
    api.get("/community-reports", { params }).then((res) => res.data);

export const reviewCommunityReport = (reportId, { status, moderatorNote = "" }) =>
    api
        .patch(`/community-reports/${reportId}/review`, { status, moderatorNote })
        .then((res) => res.data);

export const setCommunityOutfitVisibility = (outfitId, isVisible) =>
    api
        .patch(`/community-reports/outfits/${outfitId}/visibility`, { isVisible })
        .then((res) => res.data);
