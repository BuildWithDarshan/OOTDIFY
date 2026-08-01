import { useEffect, useState } from "react";
import Select, { components as selectComponents } from "react-select";
import {
  ChevronDown,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  getOccasions,
  getOutfitTypes,
} from "../../services/taxonomyService.js";

const seasons = ["summer", "winter", "monsoon", "all-season"];
const SEARCH_DEBOUNCE_MS = 700;

const SearchField = ({ value, onChange, onClear, compact = false }) => (
  <label
    className={`group relative flex items-center overflow-hidden rounded-2xl border bg-bg shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all duration-300 focus-within:-translate-y-0.5 focus-within:border-accent focus-within:shadow-[0_14px_38px_rgba(0,0,0,0.1)] ${
      value ? "border-accent/50" : "border-border hover:border-text-muted/50"
    } ${compact ? "h-12" : "h-14"}`}
  >
    <span className="ml-2.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-text-primary text-bg sm:ml-3">
      <Search className="h-3.5 w-3.5" />
    </span>

    <input
      type="text"
      inputMode="search"
      value={value || ""}
      onChange={onChange}
      placeholder="Search outfits by name or style"
      aria-label="Search outfits"
      className="min-w-0 flex-1 bg-transparent px-3 text-sm font-medium text-text-primary outline-none placeholder:text-text-muted/70"
    />

    {value && (
      <button
        type="button"
        onClick={onClear}
        aria-label="Clear outfit search"
        className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-muted transition-all duration-300 hover:rotate-90 hover:bg-bg-subtle hover:text-text-primary"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    )}

    <span
      className={`absolute bottom-0 left-0 h-[2px] bg-accent transition-all duration-500 ${
        value ? "w-full" : "w-0 group-focus-within:w-full"
      }`}
    />
  </label>
);

const DropdownIndicator = (props) => (
  <selectComponents.DropdownIndicator {...props}>
    <ChevronDown
      className={`h-3.5 w-3.5 transition-transform duration-300 ${
        props.selectProps.menuIsOpen ? "rotate-180" : ""
      }`}
    />
  </selectComponents.DropdownIndicator>
);

const getSelectStyles = (compact) => ({
  control: (base, state) => ({
    ...base,
    minHeight: compact ? 40 : 50,
    borderRadius: compact ? 12 : 16,
    borderColor: state.isFocused ? "#40916c" : "#d7e5db",
    backgroundColor: "#ffffff",
    boxShadow: state.isFocused
      ? "0 10px 28px rgba(64,145,108,.14)"
      : "0 4px 14px rgba(8,28,21,.035)",
    cursor: "pointer",
    transition: "all 220ms ease",
    ":hover": {
      borderColor: state.isFocused ? "#40916c" : "#95b8a3",
      transform: "translateY(-1px)",
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: compact ? "0 10px" : "0 14px",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#708078",
    fontSize: compact ? 12 : 13,
    whiteSpace: "nowrap",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#081c15",
    fontSize: compact ? 12 : 13,
    fontWeight: 600,
  }),
  input: (base) => ({
    ...base,
    color: "#081c15",
    fontSize: compact ? 12 : 13,
  }),
  indicatorsContainer: (base) => ({
    ...base,
    color: "#40916c",
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    padding: compact ? 8 : 10,
    color: state.isFocused ? "#2d6a4f" : "#52705f",
    ":hover": { color: "#2d6a4f" },
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: 5,
    color: "#718078",
    borderRadius: 999,
    ":hover": { color: "#081c15", backgroundColor: "#eef5ef" },
  }),
  menuPortal: (base) => ({ ...base, zIndex: 80 }),
  menu: (base) => ({
    ...base,
    overflow: "hidden",
    border: "1px solid #d7e5db",
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
      ? "#12382b"
      : state.isFocused
        ? "#e8f5ea"
        : "transparent",
    color: state.isSelected ? "#ffffff" : "#173328",
    cursor: "pointer",
    fontSize: compact ? 12 : 13,
    fontWeight: state.isSelected ? 600 : 500,
    transition: "background-color 160ms ease, color 160ms ease",
    ":active": { backgroundColor: state.isSelected ? "#12382b" : "#d8f3dc" },
  }),
  noOptionsMessage: (base) => ({
    ...base,
    color: "#718078",
    fontSize: 12,
  }),
});

const SelectField = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  compact = false,
}) => (
  <div className="min-w-0 flex-1">
    <span className={`${compact ? "mb-1 text-[8px] tracking-[0.16em]" : "mb-2 text-[10px] tracking-[0.2em]"} block font-semibold uppercase text-text-muted`}>
      {label}
    </span>

    <Select
      value={options.find((option) => option.value === value) || null}
      onChange={(option) => onChange(option?.value || "")}
      options={options}
      placeholder={placeholder}
      isClearable={Boolean(value)}
      isSearchable
      menuPosition="fixed"
      menuPortalTarget={typeof document !== "undefined" ? document.body : null}
      noOptionsMessage={() => "No matching options"}
      components={{
        DropdownIndicator,
        IndicatorSeparator: null,
      }}
      styles={getSelectStyles(compact)}
    />
  </div>
);

const PriceField = ({ placeholder, value, onChange, compact = false }) => {
  const isActive = value !== "" && value !== undefined;

  return (
    <div
      className={`
        relative flex-1 overflow-hidden border bg-bg
        ${compact ? "rounded-xl" : "rounded-2xl"}
        transition-all duration-300
        ${
          isActive
            ? "border-accent/50 shadow-[0_10px_30px_rgba(0,0,0,0.07)]"
            : "border-border hover:border-text-muted/50"
        }
        focus-within:border-accent
        focus-within:-translate-y-0.5
        focus-within:shadow-[0_12px_35px_rgba(0,0,0,0.09)]
      `}
    >
      <span className={`absolute top-1/2 -translate-y-1/2 font-medium text-text-muted ${compact ? "left-3 text-xs" : "left-4 text-sm"}`}>
        ₹
      </span>

      <input
        type="number"
        min="0"
        placeholder={placeholder}
        value={value || ""}
        onChange={onChange}
        className={`w-full bg-transparent font-medium text-text-primary outline-none placeholder:text-text-muted/70 ${
          compact ? "py-2.5 pl-7 pr-2 text-xs" : "py-3.5 pl-8 pr-3 text-sm"
        }`}
      />

      <span
        className={`
          absolute bottom-0 left-0 h-[2px] bg-accent
          transition-all duration-500
          ${isActive ? "w-full" : "w-0 focus-within:w-full"}
        `}
      />
    </div>
  );
};

const FilterFields = ({
  filters,
  setFilter,
  occasions,
  outfitTypes,
  compact = false,
}) => {
  return (
    <div className={`grid w-full grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_1.25fr] ${compact ? "gap-2" : "gap-4 lg:gap-3"}`}>
      <SelectField
        label="Occasion"
        value={filters.occasion}
        onChange={(value) => setFilter("occasion", value)}
        options={occasions.map((occasion) => ({
          value: occasion._id,
          label: occasion.name,
        }))}
        placeholder="All occasions"
        compact={compact}
      />

      <SelectField
        label="Style"
        value={filters.outfitType}
        onChange={(value) => setFilter("outfitType", value)}
        options={outfitTypes.map((type) => ({
          value: type._id,
          label: type.name,
        }))}
        placeholder="All styles"
        compact={compact}
      />

      <SelectField
        label="Season"
        value={filters.season}
        onChange={(value) => setFilter("season", value)}
        options={seasons.map((season) => ({
          value: season,
          label: season.replace("-", " ").replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
          ),
        }))}
        placeholder="All seasons"
        compact={compact}
      />

      <div>
        <span className={`${compact ? "mb-1 text-[8px] tracking-[0.16em]" : "mb-2 text-[10px] tracking-[0.2em]"} block font-semibold uppercase text-text-muted`}>
          Price Range
        </span>

        <div className="flex items-center gap-2">
          <PriceField
            placeholder="Min"
            value={filters.minPrice}
            compact={compact}
            onChange={(event) =>
              setFilter("minPrice", event.target.value)
            }
          />

          <span className="h-px w-3 shrink-0 bg-border" />

          <PriceField
            placeholder="Max"
            value={filters.maxPrice}
            compact={compact}
            onChange={(event) =>
              setFilter("maxPrice", event.target.value)
            }
          />
        </div>
      </div>
    </div>
  );
};

const OutfitFilterBar = ({
  filters,
  setFilter,
  clearFilters,
  activeCount,
}) => {
  const [open, setOpen] = useState(false);
  const [occasions, setOccasions] = useState([]);
  const [outfitTypes, setOutfitTypes] = useState([]);
  const [searchValue, setSearchValue] = useState(filters.search || "");

  useEffect(() => {
    const loadTaxonomies = async () => {
      try {
        const [occasionData, outfitTypeData] = await Promise.all([
          getOccasions(),
          getOutfitTypes(),
        ]);

        setOccasions(occasionData.occasions || []);
        setOutfitTypes(outfitTypeData.outfitTypes || []);
      } catch (error) {
        console.error("Failed to load outfit filters:", error);
      }
    };

    loadTaxonomies();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const normalizedSearch = searchValue.trim();
    if (normalizedSearch === (filters.search || "")) return undefined;

    const timer = window.setTimeout(() => {
      setFilter("search", normalizedSearch);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [filters.search, searchValue, setFilter]);

  const clearSearch = () => {
    setSearchValue("");
    setFilter("search", "");
  };

  const clearAllFilters = () => {
    setSearchValue("");
    clearFilters();
  };

  return (
    <>
      <div className="mb-3 lg:hidden">
        <SearchField
          compact
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          onClear={clearSearch}
        />
      </div>

      {/* Mobile and tablet filter trigger */}
      <div className="mb-6 flex items-center justify-between lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="
            group relative flex min-h-12 items-center gap-3
            overflow-hidden rounded-full border border-border
            bg-bg px-5 py-3 text-sm font-medium text-text-primary
            shadow-[0_8px_25px_rgba(0,0,0,0.06)]
            transition-all duration-300
            hover:-translate-y-0.5
            hover:border-accent/50
            hover:shadow-[0_12px_35px_rgba(0,0,0,0.1)]
          "
        >
          <span
            className="
              absolute inset-0 -translate-x-full
              bg-gradient-to-r from-transparent via-white/40 to-transparent
              transition-transform duration-700
              group-hover:translate-x-full
            "
          />

          <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-text-primary text-bg transition-transform duration-300 group-hover:rotate-12">
            <SlidersHorizontal className="h-4 w-4" />
          </span>

          <span className="relative">Refine Looks</span>

          {activeCount > 0 && (
            <span
              className="
                relative flex h-6 min-w-6 items-center justify-center
                rounded-full bg-accent px-1.5 text-[11px]
                font-semibold text-on-accent
                shadow-[0_4px_14px_rgba(0,0,0,0.15)]
              "
            >
              {activeCount}
            </span>
          )}
        </button>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="
              flex items-center gap-1.5 text-xs font-medium text-text-muted
              transition-colors duration-300 hover:text-accent-hover
            "
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        )}
      </div>

      {/* Desktop filter panel */}
      <div
        className="mb-8 hidden rounded-[22px] border border-[#d7e5db] bg-[#f3f8f4] p-2.5 shadow-[0_14px_40px_rgba(8,28,21,0.07)] transition-shadow duration-500 hover:shadow-[0_18px_48px_rgba(8,28,21,0.1)] lg:block"
      >
        <div className="flex items-end gap-2.5">
          <div className="w-[clamp(14rem,22vw,18rem)] shrink-0">
            <span className="mb-1 block text-[8px] font-semibold uppercase tracking-[0.16em] text-[#52705f]">
              Search looks
            </span>
            <SearchField
              compact
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              onClear={clearSearch}
            />
          </div>

          <div className="min-w-0 flex-1 rounded-2xl border border-white bg-white/90 p-2 shadow-[0_6px_20px_rgba(8,28,21,0.04)]">
            <FilterFields
              filters={filters}
              setFilter={setFilter}
              occasions={occasions}
              outfitTypes={outfitTypes}
              compact
            />
          </div>

          <div className="flex h-[62px] w-[86px] shrink-0 flex-col items-center justify-center rounded-2xl bg-[#12382b] text-white shadow-[0_8px_22px_rgba(8,28,21,0.14)]">
            {activeCount > 0 ? (
              <>
                <span className="mb-1 text-[8px] font-semibold uppercase tracking-[0.14em] text-[#b7e4c7]">
                  {activeCount} active
                </span>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="group flex items-center gap-1 text-[9px] font-medium text-white/80 transition-colors duration-300 hover:text-white"
                >
                  <RotateCcw className="h-3 w-3 transition-transform duration-500 group-hover:-rotate-180" />
                  Reset
                </button>
              </>
            ) : (
              <>
                
                <span className="text-center text-[10px] font-medium leading-3 text-white/75">
                  Refine
                  <br />your look
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`
          fixed inset-0 z-50 flex items-end lg:hidden
          transition-visibility duration-500
          ${open ? "visible" : "invisible pointer-events-none"}
        `}
        aria-hidden={!open}
      >
        <button
          type="button"
          aria-label="Close filters"
          onClick={() => setOpen(false)}
          className={`
            absolute inset-0 bg-black/50 backdrop-blur-sm
            transition-opacity duration-500
            ${open ? "opacity-100" : "opacity-0"}
          `}
        />

        <div
          className={`
            relative w-full overflow-hidden rounded-t-[32px]
            border-t border-white/10 bg-bg
            shadow-[0_-25px_80px_rgba(0,0,0,0.2)]
            transition-all duration-500 ease-out
            ${
              open
                ? "translate-y-0 opacity-100"
                : "translate-y-full opacity-0"
            }
          `}
        >
          <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-border" />

          <div className="max-h-[90dvh] overflow-y-auto px-5 pb-6 pt-4">
            <div className="mb-7 flex items-start justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">

                  <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent-hover">
                    Personalise your feed
                  </span>
                </div>

                <h3 className="font-display text-3xl italic text-text-primary">
                  Refine Your Style
                </h3>

                <p className="mt-2 max-w-xs text-sm leading-6 text-text-muted">
                  Filter outfits by occasion, style, season and budget.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close filters"
                className="
                  flex h-11 w-11 shrink-0 items-center justify-center
                  rounded-full border border-border text-text-primary
                  transition-all duration-300
                  hover:rotate-90 hover:border-accent hover:text-accent-hover
                "
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {activeCount > 0 && (
              <div
                className="
                  mb-6 flex items-center justify-between rounded-2xl
                  border border-accent/20 bg-accent/5 px-4 py-3
                "
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-accent px-2 text-xs font-semibold text-on-accent">
                    {activeCount}
                  </span>

                  <span className="text-sm font-medium text-text-primary">
                    Active filters
                  </span>
                </div>

                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-accent-hover"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>
            )}

            <FilterFields
              filters={filters}
              setFilter={setFilter}
              occasions={occasions}
              outfitTypes={outfitTypes}
            />

            <div className="sticky bottom-0 mt-8 bg-bg/95 pb-1 pt-4 backdrop-blur-xl">
              <div className="flex gap-3">
                {activeCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="
                      min-h-12 flex-1 rounded-full border border-border
                      px-5 py-3 text-sm font-medium text-text-primary
                      transition-all duration-300
                      hover:border-text-primary hover:bg-bg-subtle
                    "
                  >
                    Clear all
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="
                    group relative min-h-12 flex-1 overflow-hidden
                    rounded-full bg-text-primary px-5 py-3
                    text-sm font-medium text-bg
                    shadow-[0_12px_30px_rgba(0,0,0,0.16)]
                    transition-all duration-300
                    hover:-translate-y-0.5
                    hover:shadow-[0_16px_40px_rgba(0,0,0,0.22)]
                  "
                >
                  <span className="relative z-10">
                    Show Results
                  </span>

                  <span
                    className="
                      absolute inset-0 -translate-x-full
                      bg-gradient-to-r from-transparent
                      via-white/20 to-transparent
                      transition-transform duration-700
                      group-hover:translate-x-full
                    "
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OutfitFilterBar;
