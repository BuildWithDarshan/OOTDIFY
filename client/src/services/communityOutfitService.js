import api from "./api.js";

const COMMUNITY_OUTFITS_URL = "/community-outfits";

export const getCommunityOutfits = (params = {}) =>
    api.get(COMMUNITY_OUTFITS_URL, { params }).then((res) => res.data);

export const getCommunityCreatorProfile = (userId, params = {}) =>
    api
        .get(`${COMMUNITY_OUTFITS_URL}/creator/${userId}`, { params })
        .then((res) => res.data);

export const getCommunityOutfitById = (id) =>
    api.get(`${COMMUNITY_OUTFITS_URL}/${id}`).then((res) => res.data);

export const getRelatedCommunityOutfits = (id, params = {}) =>
    api
        .get(`${COMMUNITY_OUTFITS_URL}/${id}/related`, { params })
        .then((res) => res.data);

export const getMyCommunityOutfits = (params = {}) =>
    api.get(`${COMMUNITY_OUTFITS_URL}/my`, { params }).then((res) => res.data);

const createCommunityOutfitFormData = ({
    image,
    title,
    description,
    gender,
    occasion,
    outfitType,
    tags,
    productLinks,
    visibility,
}) => {
    const formData = new FormData();

    if (image) formData.append("image", image);
    if (title !== undefined) formData.append("title", title);
    if (description !== undefined) formData.append("description", description);
    if (gender !== undefined) formData.append("gender", gender);
    if (occasion !== undefined) formData.append("occasion", occasion);
    if (outfitType !== undefined) formData.append("outfitType", outfitType);

    if (tags !== undefined) {
        formData.append("tags", JSON.stringify(tags));
    }

    if (productLinks !== undefined) {
        formData.append("productLinks", JSON.stringify(productLinks));
    }
    if (visibility !== undefined) formData.append("visibility", visibility);

    return formData;
};

export const createCommunityOutfit = (outfit) =>
    api
        .post(
            COMMUNITY_OUTFITS_URL,
            createCommunityOutfitFormData(outfit),
        )
        .then((res) => res.data);

export const updateCommunityOutfit = (id, outfit) =>
    api
        .put(
            `${COMMUNITY_OUTFITS_URL}/${id}`,
            createCommunityOutfitFormData(outfit),
        )
        .then((res) => res.data);

export const deleteCommunityOutfit = (id) =>
    api.delete(`${COMMUNITY_OUTFITS_URL}/${id}`).then((res) => res.data);