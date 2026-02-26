import { useSearchParams } from "react-router-dom";
import { useState, useEffect, useMemo, useCallback } from "react";
import debounce from "lodash/debounce";

function useQuerySearch(
    paramName: string = "search"
): [string, (value: string) => void] {
    const [searchParams, setSearchParams] = useSearchParams();

    // Get value from URL
    const queryValue = searchParams.get(paramName) ?? "";

    // 🔥 Local immediate state
    const [value, setValue] = useState(queryValue);

    // Sync local state if URL changes (back button etc.)
    useEffect(() => {
        setValue(queryValue);
    }, [queryValue]);

    // Update URL
    const updateURL = useCallback(
        (newValue: string) => {
            setSearchParams((prev) => {
                const params = new URLSearchParams(prev);

                if (newValue) {
                    params.set(paramName, newValue);
                } else {
                    params.delete(paramName);
                }

                return params;
            });
        },
        [setSearchParams, paramName]
    );

    // 🔥 Debounced URL updater
    const debouncedUpdate = useMemo(
        () => debounce(updateURL, 300),
        [updateURL]
    );

    // 🔥 Cleanup to prevent memory leaks
    useEffect(() => {
        return () => {
            debouncedUpdate.cancel();
        };
    }, [debouncedUpdate]);

    // Public setter (instant UI + debounced URL)
    const handleChange = useCallback(
        (newValue: string) => {
            setValue(newValue);        // instant update
            debouncedUpdate(newValue); // debounced URL update
        },
        [debouncedUpdate]
    );

    return [value, handleChange];
}

export default useQuerySearch;