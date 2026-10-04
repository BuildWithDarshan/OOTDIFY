import api from "./api.js";

const COMMUNITY_OUTFITS_URL = "/community-outfits";
const COMMUNITY_REPORTS_URL = "/community-reports";

export const getCommunityInteractionState = (outfitId) =>
    api
        .get(`${COMMUNITY_OUTFITS_URL}/${outfitId}/state`)
        .then((res) => res.data);

export const toggleCommunityLike = (outfitId) =>
    api
        .post(`${COMMUNITY_OUTFITS_URL}/${outfitId}/like`)
        .then((res) => res.data);

export const toggleCommunitySave = (outfitId) =>
    api
        .post(`${COMMUNITY_OUTFITS_URL}/${outfitId}/save`)
        .then((res) => res.data);

export const getCommunityComments = (outfitId, params = {}) =>
    api
        .get(`${COMMUNITY_OUTFITS_URL}/${outfitId}/comments`, { params })
        .then((res) => res.data);

export const addCommunityComment = (outfitId, text) =>
    api
        .post(`${COMMUNITY_OUTFITS_URL}/${outfitId}/comments`, { text })
        .then((res) => res.data);

export const deleteCommunityComment = (commentId) =>
    api
        .delete(`${COMMUNITY_OUTFITS_URL}/comments/${commentId}`)
        .then((res) => res.data);

export const getSavedCommunityOutfits = (params = {}) =>
    api
        .get(`${COMMUNITY_OUTFITS_URL}/saved`, { params })
        .then((res) => res.data);

export const reportCommunityOutfit = ({ outfitId, reason, details = "" }) =>
    api
        .post(COMMUNITY_REPORTS_URL, { outfitId, reason, details })
        .then((res) => res.data);