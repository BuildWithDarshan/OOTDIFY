import { useSearchParams } from "react-router-dom";
import { useCallback, useMemo } from "react";

const FILTER_KEYS = [
  "search",
  "occasion",
  "outfitType",
  "season",
  "minPrice",
  "maxPrice",
];

export const useFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => {
    const result = {};
    FILTER_KEYS.forEach((key) => {
      const value = searchParams.get(key);
      if (value) result[key] = value;
    });
    return result;
  }, [searchParams]);

  const setFilter = useCallback(
    (key, value) => {
      const next = new URLSearchParams(searchParams);
      if (value === "" || value === null || value === undefined) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const clearFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const activeCount = Object.keys(filters).length;

  return { filters, setFilter, clearFilters, activeCount };
};
