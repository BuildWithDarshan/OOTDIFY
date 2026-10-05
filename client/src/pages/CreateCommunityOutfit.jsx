import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import {
    ArrowLeft,
    Eye,
    EyeOff,
    ImagePlus,
    Link2,
    LoaderCircle,
    Sparkles,
    Shirt,
    X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import EmojiPickerButton from "../components/Common/EmojiPickerButton.jsx";
import {
    createCommunityOutfit,
    getCommunityOutfitById,
    updateCommunityOutfit,
} from "../services/communityOutfitService.js";
import { getOccasions, getOutfitTypes } from "../services/taxonomyService.js";

const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const HEIC_IMAGE_TYPES = ["image/heic", "image/heif"];
const MAX_TAGS = 10;

const selectStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: 48,
        borderRadius: 14,
        borderColor: state.isFocused ? "#40916c" : "#b7e4c7",
        backgroundColor: "#ffffff",
        boxShadow: state.isFocused ? "0 0 0 2px rgba(64,145,108,.12)" : "none",
        transition: "border-color 180ms ease, box-shadow 180ms ease",
        ":hover": { borderColor: "#40916c" },
    }),
    valueContainer: (base) => ({ ...base, padding: "0 14px" }),
    placeholder: (base) => ({ ...base, color: "#708078", fontSize: 14 }),
    singleValue: (base) => ({
        ...base,
        color: "#081c15",
        fontSize: 14,
        fontWeight: 500,
    }),
    input: (base) => ({ ...base, color: "#081c15", fontSize: 14 }),
    dropdownIndicator: (base) => ({
        ...base,
        color: "#40916c",
        ":hover": { color: "#2d6a4f" },
    }),
    clearIndicator: (base) => ({
        ...base,
        color: "#718078",
        ":hover": { color: "#081c15" },
    }),
    menuPortal: (base) => ({ ...base, zIndex: 80 }),
    menu: (base) => ({
        ...base,
        overflow: "hidden",
        border: "1px solid #b7e4c7",
        borderRadius: 14,
        backgroundColor: "#ffffff",
        boxShadow: "0 18px 45px rgba(8,28,21,.16)",
    }),
    menuList: (base) => ({ ...base, padding: 6 }),
    option: (base, state) => ({
        ...base,
        marginBlock: 2,
        borderRadius: 9,
        backgroundColor: state.isSelected
            ? "#1b4332"
            : state.isFocused
              ? "#d8f3dc"
              : "transparent",
        color: state.isSelected ? "#ffffff" : "#173328",
        cursor: "pointer",
        fontSize: 14,
    }),
    noOptionsMessage: (base) => ({ ...base, color: "#718078", fontSize: 12 }),
};

const selectProps = {
    isSearchable: true,
    menuPosition: "fixed",
    menuPortalTarget: typeof document !== "undefined" ? document.body : null,
    noOptionsMessage: () => "No matching options",
};

const inputClassName =
    "min-h-12 w-full rounded-xl border border-border bg-bg px-4 text-base text-text-primary outline-none transition-all duration-300 placeholder:text-text-muted/80 hover:border-border-strong focus:border-accent focus:ring-4 focus:ring-accent/10";

const labelClassName =
    "mb-1.5 block text-sm font-semibold text-text-secondary";

const PRODUCT_CATEGORIES = [
    { key: "topwear", label: "Topwear", placeholder: "https://example.com/topwear" },
    { key: "bottomwear", label: "Bottomwear", placeholder: "https://example.com/bottomwear" },
    { key: "footwear", label: "Footwear", placeholder: "https://example.com/footwear" },
];

const CreateCommunityOutfit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [categories, setCategories] = useState([]);
    const [occasions, setOccasions] = useState([]);
    const [taxonomyLoading, setTaxonomyLoading] = useState(true);
    const [taxonomyError, setTaxonomyError] = useState("");
    const [image, setImage] = useState(null);
    const [existingImage, setExistingImage] = useState("");
    const [outfitLoading, setOutfitLoading] = useState(isEditMode);
    const [outfitLoadError, setOutfitLoadError] = useState("");
    const [imageError, setImageError] = useState("");
    const [imageProcessing, setImageProcessing] = useState(false);
    const [title, setTitle] = useState("");
    const titleInputRef = useRef(null);
    const [gender, setGender] = useState(null);
    const [category, setCategory] = useState(null);
    const [occasion, setOccasion] = useState(null);
    const [description, setDescription] = useState("");
    const [visibility, setVisibility] = useState("public");
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState([]);
    const [productLinks, setProductLinks] = useState({
        topwear: "",
        bottomwear: "",
        footwear: "",
    });
    const [submitError, setSubmitError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const imagePreview = useMemo(
        () => (image ? URL.createObjectURL(image) : existingImage),
        [existingImage, image],
    );

    useEffect(() => {
        return () => {
            if (imagePreview.startsWith("blob:")) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    useEffect(() => {
        let cancelled = false;

        Promise.all([getOutfitTypes(), getOccasions()])
            .then(([typeData, occasionData]) => {
                if (cancelled) return;
                setCategories(typeData.outfitTypes || []);
                setOccasions(occasionData.occasions || []);
            })
            .catch(() => {
                if (!cancelled) {
                    setTaxonomyError(
                        "Categories and occasions could not be loaded. Please refresh and try again.",
                    );
                }
            })
            .finally(() => {
                if (!cancelled) setTaxonomyLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!isEditMode || !user?.id) return undefined;
        let cancelled = false;

        getCommunityOutfitById(id)
            .then((data) => {
                if (cancelled) return;
                const outfit = data.outfit;
                const ownerId =
                    typeof outfit.user === "string"
                        ? outfit.user
                        : outfit.user?._id;

                if (ownerId !== user.id) {
                    setOutfitLoadError(
                        "You can only edit outfits that you created.",
                    );
                    return;
                }

                setExistingImage(outfit.image?.url || "");
                setTitle(outfit.title || "");
                setDescription(outfit.description || "");
                setVisibility(outfit.visibility || "public");
                setGender(
                    outfit.gender
                        ? {
                              value: outfit.gender,
                              label:
                                  outfit.gender.charAt(0).toUpperCase() +
                                  outfit.gender.slice(1),
                          }
                        : null,
                );
                setCategory(
                    outfit.outfitType?._id
                        ? {
                              value: outfit.outfitType._id,
                              label: outfit.outfitType.name,
                          }
                        : null,
                );
                setOccasion(
                    outfit.occasion?._id
                        ? {
                              value: outfit.occasion._id,
                              label: outfit.occasion.name,
                          }
                        : null,
                );
                setTags(outfit.tags || []);
                setProductLinks({
                    topwear: outfit.productLinks?.topwear || "",
                    bottomwear: outfit.productLinks?.bottomwear || "",
                    footwear: outfit.productLinks?.footwear || "",
                });
            })
            .catch((error) => {
                if (!cancelled) {
                    setOutfitLoadError(
                        error.response?.data?.message ||
                            "This outfit could not be loaded for editing.",
                    );
                }
            })
            .finally(() => {
                if (!cancelled) setOutfitLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [id, isEditMode, user?.id]);

    const categoryOptions = categories.map((item) => ({
        value: item._id,
        label: item.name,
    }));
    const occasionOptions = occasions.map((item) => ({
        value: item._id,
        label: item.name,
    }));

    const handleImageChange = async (event) => {
        const selectedImage = event.target.files?.[0];
        event.target.value = "";
        setImageError("");

        if (!selectedImage) return;

        const isHeicImage =
            HEIC_IMAGE_TYPES.includes(selectedImage.type.toLowerCase()) ||
            /\.(heic|heif)$/i.test(selectedImage.name);

        if (isHeicImage) {
            setImageProcessing(true);
            try {
                const { default: heic2any } = await import("heic2any");
                const jpegBlob = await heic2any({
                    blob: selectedImage,
                    toType: "image/jpeg",
                    quality: 0.9,
                });
                const convertedBlob = Array.isArray(jpegBlob)
                    ? jpegBlob[0]
                    : jpegBlob;
                const jpegFile = new File(
                    [convertedBlob],
                    selectedImage.name.replace(/\.(heic|heif)$/i, "") +
                        ".jpg",
                    { type: "image/jpeg", lastModified: Date.now() },
                );

                if (jpegFile.size > MAX_IMAGE_SIZE) {
                    setImageError("The converted image must be 4 MB or smaller.");
                    return;
                }

                setImage(jpegFile);
            } catch (error) {
                setImageError(
                    error.message ||
                        "This HEIC photo could not be converted. Try saving it as JPG and upload again.",
                );
            } finally {
                setImageProcessing(false);
            }
            return;
        }

        if (!ALLOWED_IMAGE_TYPES.includes(selectedImage.type)) {
            setImageError("Choose a JPG, PNG, WEBP, HEIC, or HEIF image.");
            return;
        }

        if (selectedImage.size > MAX_IMAGE_SIZE) {
            setImageError("The image must be 4 MB or smaller.");
            return;
        }

        setImage(selectedImage);
    };

    const addTag = () => {
        const tag = tagInput.trim().replace(/^#/, "").toLowerCase();
        if (!tag) return;

        if (tag.length > 40) {
            setSubmitError("Each tag must be 40 characters or fewer.");
            return;
        }

        if (tags.includes(tag)) {
            setTagInput("");
            return;
        }

        if (tags.length >= MAX_TAGS) {
            setSubmitError(`You can add up to ${MAX_TAGS} tags.`);
            return;
        }

        setSubmitError("");
        setTags((current) => [...current, tag]);
        setTagInput("");
    };

    const removeTag = (tagToRemove) => {
        setTags((current) => current.filter((tag) => tag !== tagToRemove));
    };

    const handleTagKeyDown = (event) => {
        if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            addTag();
        }
    };

    const handleProductLinkChange = (key, value) => {
        setProductLinks((current) => ({ ...current, [key]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitError("");

        if (imageProcessing) {
            setSubmitError("Wait for the HEIC photo to finish converting.");
            return;
        }

        if (!image && !isEditMode) {
            setImageError("Upload an outfit photo to continue.");
            return;
        }

        if (!title.trim() || !gender || !category || !occasion) {
            setSubmitError("Complete all required fields before posting.");
            return;
        }

        const invalidLink = Object.entries(productLinks).find(([, value]) => {
            if (!value.trim()) return false;

            try {
                const parsedUrl = new URL(value.trim());
                return !["http:", "https:"].includes(parsedUrl.protocol);
            } catch {
                return true;
            }
        });

        if (invalidLink) {
            const label =
                PRODUCT_CATEGORIES.find(({ key }) => key === invalidLink[0])?.label ||
                invalidLink[0];
            setSubmitError(`Enter a valid HTTP or HTTPS ${label.toLowerCase()} link.`);
            return;
        }

        setSubmitting(true);

        try {
            const outfitPayload = {
                image,
                title: title.trim(),
                gender: gender.value,
                outfitType: category.value,
                occasion: occasion.value,
                description: description.trim(),
                visibility,
                tags,
                productLinks: Object.fromEntries(
                    Object.entries(productLinks).map(([key, value]) => [
                        key,
                        value.trim(),
                    ]),
                ),
            };

            if (isEditMode) {
                await updateCommunityOutfit(id, outfitPayload);
                navigate(`/community/${id}`);
            } else {
                await createCommunityOutfit(outfitPayload);
                navigate(`/community/creator/${user.id}`);
            }
        } catch (error) {
            setSubmitError(
                error.response?.data?.message ||
                    "Your outfit could not be posted. Please try again.",
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading) {
        return (
            <main className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4">
                <p role="status" className="text-sm text-text-secondary">
                    Checking your sign-in...
                </p>
            </main>
        );
    }

    if (!isAuthenticated) {
        return (
            <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
                <p className="font-display text-4xl text-text-primary">
                    Sign in to share your look.
                </p>
                <p className="mt-3 text-sm text-text-secondary">
                    Join the community to post and manage your outfit inspiration.
                </p>
                <Link
                    to="/login"
                    className="mt-6 rounded-full bg-text-primary px-5 py-3 text-sm font-medium text-on-accent transition hover:bg-accent-hover"
                >
                    Sign in
                </Link>
            </main>
        );
    }

    if (isEditMode && outfitLoading) {
        return (
            <main className="flex min-h-[60vh] items-center justify-center px-4">
                <span role="status" className="inline-flex items-center gap-2 text-sm text-text-secondary">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Loading outfit...
                </span>
            </main>
        );
    }

    if (isEditMode && outfitLoadError) {
        return (
            <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
                <p className="font-display text-4xl text-text-primary">
                    Unable to edit this outfit
                </p>
                <p role="alert" className="mt-3 text-sm text-text-secondary">
                    {outfitLoadError}
                </p>
                <Link
                    to="/community"
                    className="mt-6 rounded-full bg-text-primary px-5 py-3 text-sm font-medium text-bg transition hover:bg-accent-hover"
                >
                    Back to community
                </Link>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-bg-subtle/55 pb-16">
            <style>{`
                @keyframes createCommunityHeaderReveal {
                    from { opacity: 0; transform: translate3d(0, 20px, 0); }
                    to { opacity: 1; transform: translate3d(0, 0, 0); }
                }

                @keyframes createCommunityCardReveal {
                    from { opacity: 0; transform: translate3d(0, 24px, 0); }
                    to { opacity: 1; transform: translate3d(0, 0, 0); }
                }

                .community-create-header {
                    animation: createCommunityHeaderReveal 700ms cubic-bezier(.16,1,.3,1) both;
                }

                .community-create-card {
                    animation: createCommunityCardReveal 700ms cubic-bezier(.16,1,.3,1) 120ms both;
                }

                .community-create-details {
                    animation-delay: 200ms;
                }

                @media (prefers-reduced-motion: reduce) {
                    .community-create-header,
                    .community-create-card {
                        animation: none;
                    }
                }
            `}</style>

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
                <header className="community-create-header mb-7 overflow-hidden rounded-[1.75rem] border border-border/80 bg-bg shadow-[0_18px_55px_rgba(8,28,21,0.08)] sm:mb-9 mt-[60px]">
                    <div className="relative flex flex-col items-center gap-5 p-6 text-center sm:flex-row sm:p-8 sm:text-left">
                        <div className="absolute inset-y-0 left-0 hidden w-1.5 bg-gradient-to-b from-green-300 via-accent to-green-700 sm:block" />
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                                Community studio
                            </p>
                            <h1 className="mt-1 font-display text-4xl italic text-text-primary sm:text-5xl">
                                {isEditMode ? "Edit your look" : "Share your look"}
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                                {isEditMode
                                    ? "Update the photo or details for your community outfit."
                                    : "A photo, a few details, and your personal style. Share an outfit that might inspire someone else."}
                            </p>
                        </div>
                        <Link
                            to="/community"
                            className="group inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full border border-border bg-bg-subtle px-4 py-2.5 text-xs font-medium text-text-secondary transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:text-accent-hover hover:shadow-md sm:w-auto"
                        >
                            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
                            Back to Discover
                        </Link>
                    </div>
                </header>

                <div className="mb-5 flex items-center gap-2 px-1">
                    <Sparkles aria-hidden="true" className="h-4 w-4 text-accent" />
                    <p className="text-xs font-medium text-text-secondary">
                        {isEditMode
                            ? "Your changes will appear on your community outfit."
                            : visibility === "public"
                              ? "Your public outfit will appear in Discover and on your creator profile."
                              : "Only you can see a private outfit on your creator profile."}
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(24rem,0.92fr)] lg:gap-5"
                >
                    <section className="community-create-card min-w-0 rounded-[1.75rem] border border-border/80 bg-bg p-4 shadow-[0_12px_38px_rgba(8,28,21,0.06)] transition-all duration-500 hover:shadow-[0_18px_48px_rgba(8,28,21,0.09)] sm:p-6 lg:sticky lg:top-24">
                        <div className="mb-5 flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-subtle text-accent-hover">
                                <ImagePlus className="h-4.5 w-4.5" />
                            </span>
                            <div>
                                <h2 className="font-display text-2xl italic text-text-primary">
                                    The outfit photo
                                </h2>
                                <p className="text-xs text-text-muted">
                                    {isEditMode
                                        ? "Choose a replacement or keep the current photo."
                                        : "Your photo is the star of the post."}
                                </p>
                            </div>
                        </div>
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <p className="text-xs text-text-secondary">
                                    JPG, PNG, WEBP, HEIC, or HEIF <span className="mx-1 text-text-muted">·</span> Up to 4 MB
                            </p>
                            {image && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImage(null);
                                        setImageError("");
                                    }}
                                    className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-medium text-text-secondary transition hover:bg-bg-subtle hover:text-text-primary"
                                >
                                    <X aria-hidden="true" className="h-3.5 w-3.5" />
                                    Remove
                                </button>
                            )}
                        </div>

                        <label
                            className={`group relative flex min-h-[28rem] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed bg-bg-subtle/40 transition-all duration-300 hover:border-accent hover:bg-bg-subtle/60 lg:min-h-[calc(100vh-14rem)] ${
                                imageError
                                    ? "border-red-400"
                                    : "border-border-strong"
                            }`}
                        >
                            {imageProcessing ? (
                                <span className="flex max-w-xs flex-col items-center px-6 py-12 text-center">
                                    <LoaderCircle
                                        aria-hidden="true"
                                        className="mb-3 h-8 w-8 animate-spin text-accent"
                                    />
                                    <span className="text-sm font-medium text-text-primary">
                                        Converting HEIC photo...
                                    </span>
                                </span>
                            ) : imagePreview ? (
                                <>
                                    <img
                                        src={imagePreview}
                                        alt="Preview of the outfit you selected"
                                        className="max-h-[calc(100vh-17rem)] w-full object-contain"
                                    />
                                    <span className="absolute inset-x-4 bottom-4 rounded-full bg-text-primary/85 px-4 py-2 text-center text-xs font-medium text-on-accent opacity-0 backdrop-blur transition group-hover:opacity-100">
                                        Choose a different photo
                                    </span>
                                </>
                            ) : (
                                <span className="flex max-w-xs flex-col items-center px-6 py-12 text-center">
                                    <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-subtle text-accent">
                                        <ImagePlus
                                            aria-hidden="true"
                                            className="h-7 w-7"
                                        />
                                    </span>
                                    <span className="font-display text-3xl italic text-text-primary">
                                        {isEditMode ? "Current outfit photo" : "Add your outfit photo"}
                                    </span>
                                    <span className="mt-2 text-sm leading-6 text-text-secondary">
                                        {isEditMode
                                            ? "Choose a replacement photo or keep the current image."
                                            : "Choose a clear photo that shows your look. The image keeps its original proportions."}
                                    </span>
                                    <span className="mt-5 rounded-full bg-text-primary px-5 py-2.5 text-xs font-semibold text-on-accent transition group-hover:bg-accent-hover">
                                        {isEditMode ? "Choose replacement" : "Choose photo"}
                                    </span>
                                </span>
                            )}
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
                                onChange={handleImageChange}
                                className="sr-only"
                                aria-label="Upload outfit photo"
                            />
                        </label>
                        {imageError && (
                            <p role="alert" className="mt-2 text-xs text-red-700">
                                {imageError}
                            </p>
                        )}
                    </section>

                    <section className="community-create-card community-create-details min-w-0 rounded-[1.75rem] border border-border/80 bg-bg p-5 shadow-[0_12px_38px_rgba(8,28,21,0.06)] transition-all duration-500 hover:shadow-[0_18px_48px_rgba(8,28,21,0.09)] sm:p-7">
                        <div className="mb-6 flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-subtle text-accent-hover">
                                <Shirt className="h-4.5 w-4.5" />
                            </span>
                            <div>
                                <h2 className="font-display text-2xl italic text-text-primary">
                                    Outfit details
                                </h2>
                                <p className="text-xs text-text-muted">
                                    Help others find and understand your look.
                                </p>
                            </div>
                        </div>
                        <div className="grid gap-5">
                                <div>
                                    <label htmlFor="community-title" className={labelClassName}>
                                        Outfit title <span className="text-accent">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            ref={titleInputRef}
                                            id="community-title"
                                            type="text"
                                            required
                                            maxLength={120}
                                            value={title}
                                            onChange={(event) => setTitle(event.target.value)}
                                            placeholder="e.g. Relaxed weekend layers"
                                            className={`${inputClassName} pr-12`}
                                        />
                                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2">
                                            <EmojiPickerButton
                                                inputRef={titleInputRef}
                                                maxLength={120}
                                                onChange={setTitle}
                                                value={title}
                                            />
                                        </span>
                                    </div>
                                    <p className="mt-1.5 text-right text-[10px] text-text-muted">
                                        {title.length}/120
                                    </p>
                                </div>

                                <div>
                                    <label className={labelClassName}>
                                        Gender <span className="text-accent">*</span>
                                    </label>
                                    <Select
                                        {...selectProps}
                                        value={gender}
                                        onChange={setGender}
                                        options={[
                                            { value: "men", label: "Men" },
                                            { value: "women", label: "Women" },
                                            { value: "unisex", label: "Unisex" },
                                        ]}
                                        placeholder="Choose who this look is for"
                                        aria-label="Choose outfit gender"
                                        styles={selectStyles}
                                    />
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label className={labelClassName}>
                                            Category <span className="text-accent">*</span>
                                        </label>
                                        <Select
                                            {...selectProps}
                                            value={category}
                                            onChange={setCategory}
                                            options={categoryOptions}
                                            placeholder={
                                                taxonomyLoading
                                                    ? "Loading categories..."
                                                    : "Choose category"
                                            }
                                            aria-label="Choose outfit category"
                                            isDisabled={taxonomyLoading || Boolean(taxonomyError)}
                                            styles={selectStyles}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClassName}>
                                            Occasion <span className="text-accent">*</span>
                                        </label>
                                        <Select
                                            {...selectProps}
                                            value={occasion}
                                            onChange={setOccasion}
                                            options={occasionOptions}
                                            placeholder={
                                                taxonomyLoading
                                                    ? "Loading occasions..."
                                                    : "Choose occasion"
                                            }
                                            aria-label="Choose outfit occasion"
                                            isDisabled={taxonomyLoading || Boolean(taxonomyError)}
                                            styles={selectStyles}
                                        />
                                    </div>
                                </div>

                                {taxonomyError && (
                                    <p role="alert" className="-mt-2 text-xs text-red-700">
                                        {taxonomyError}
                                    </p>
                                )}

                                <div>
                                    <label htmlFor="community-tags" className={labelClassName}>
                                        Style tags <span className="font-normal normal-case tracking-normal text-text-muted">· Optional</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            id="community-tags"
                                            type="text"
                                            maxLength={40}
                                            value={tagInput}
                                            onChange={(event) => setTagInput(event.target.value)}
                                            onKeyDown={handleTagKeyDown}
                                            placeholder="Add a tag, press Enter"
                                            className={inputClassName}
                                        />
                                        <button
                                            type="button"
                                            onClick={addTag}
                                            className="shrink-0 rounded-2xl border border-border px-4 text-sm font-medium text-text-secondary transition hover:border-accent hover:text-accent-hover"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    {tags.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="inline-flex items-center gap-1.5 rounded-full bg-bg-subtle px-3 py-1.5 text-xs font-medium text-text-secondary"
                                                >
                                                    #{tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag(tag)}
                                                        aria-label={`Remove tag ${tag}`}
                                                        className="rounded-full text-text-muted transition hover:text-text-primary"
                                                    >
                                                        <X aria-hidden="true" className="h-3 w-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <p className="mt-2 text-[10px] text-text-muted">
                                        Add up to {MAX_TAGS} tags.
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="community-description" className={labelClassName}>
                                        Description <span className="font-normal normal-case tracking-normal text-text-muted">· Optional</span>
                                    </label>
                                    <textarea
                                        id="community-description"
                                        rows={4}
                                        maxLength={2000}
                                        value={description}
                                        onChange={(event) => setDescription(event.target.value)}
                                        placeholder="Share a little about this look..."
                                        className={`${inputClassName} min-h-28 resize-y py-3`}
                                    />
                                </div>

                                <fieldset className="border-t border-border pt-5">
                                    <legend className={labelClassName}>
                                        Who can see this outfit?
                                    </legend>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {[
                                            {
                                                value: "public",
                                                label: "Public",
                                                description: "Visible in Discover and on your profile.",
                                                Icon: Eye,
                                            },
                                            {
                                                value: "private",
                                                label: "Private",
                                                description: "Only visible to you on your profile.",
                                                Icon: EyeOff,
                                            },
                                        ].map(({ value, label, description: visibilityDescription, Icon }) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => setVisibility(value)}
                                                aria-pressed={visibility === value}
                                                className={`flex min-h-20 cursor-pointer items-start gap-3 rounded-2xl border p-4 text-left transition ${
                                                    visibility === value
                                                        ? "border-accent bg-accent-subtle/60"
                                                        : "border-border bg-bg hover:border-accent/60"
                                                }`}
                                            >
                                                <Icon
                                                    aria-hidden="true"
                                                    className={`mt-0.5 h-5 w-5 shrink-0 ${
                                                        visibility === value
                                                            ? "text-accent-hover"
                                                            : "text-text-muted"
                                                    }`}
                                                />
                                                <span>
                                                    <span className="block text-sm font-semibold text-text-primary">
                                                        {label}
                                                    </span>
                                                    <span className="mt-1 block text-xs leading-5 text-text-secondary">
                                                        {visibilityDescription}
                                                    </span>
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </fieldset>

                                <div className="border-t border-border pt-5">
                                    <div className="mb-4">
                                        <h2 className="font-display text-2xl text-text-primary">
                                            Shop the look
                                        </h2>
                                        <p className="mt-1 text-xs leading-5 text-text-secondary">
                                            Optional links—add at most one for each category.
                                        </p>
                                    </div>
                                    <div className="space-y-3">
                                        {PRODUCT_CATEGORIES.map(({ key, label, placeholder }) => (
                                            <label key={key} className="block">
                                                <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-text-secondary">
                                                    <Link2
                                                        aria-hidden="true"
                                                        className="h-3.5 w-3.5 text-accent"
                                                    />
                                                    {label}
                                                    <span className="font-normal text-text-muted">
                                                        · Optional
                                                    </span>
                                                </span>
                                                <input
                                                    type="url"
                                                    inputMode="url"
                                                    maxLength={2048}
                                                    value={productLinks[key]}
                                                    onChange={(event) =>
                                                        handleProductLinkChange(
                                                            key,
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder={placeholder}
                                                    className={`${inputClassName} min-h-11 text-sm`}
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {submitError && (
                                    <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
                                        {submitError}
                                    </p>
                                )}

                                <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-[11px] leading-5 text-text-muted">
                                        Fields marked <span className="text-accent">*</span> are required.
                                    </p>
                                    <button
                                        type="submit"
                                        disabled={submitting || imageProcessing || taxonomyLoading || Boolean(taxonomyError)}
                                        className="inline-flex min-h-12 items-center justify-center rounded-full bg-text-primary px-6 text-sm font-semibold text-bg transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent hover:text-on-accent hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {submitting
                                            ? isEditMode
                                                ? "Saving changes..."
                                                : "Posting outfit..."
                                            : isEditMode
                                              ? "Save changes"
                                              : "Post outfit"}
                                    </button>
                                </div>
                        </div>
                    </section>
                </form>
            </div>
        </main>
    );
};

export default CreateCommunityOutfit;
