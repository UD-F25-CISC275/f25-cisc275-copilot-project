import { useState, useEffect } from "react";
import type { PyodideInterface } from "pyodide";

let pyodideInstance: PyodideInterface | null = null;
let pyodideLoading: Promise<PyodideInterface> | null = null;

export function usePyodide() {
    const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadPyodide = async () => {
            try {
                // If Pyodide is already loaded, use it
                if (pyodideInstance) {
                    setPyodide(pyodideInstance);
                    setLoading(false);
                    return;
                }

                // If Pyodide is currently loading, wait for it
                if (pyodideLoading) {
                    const instance = await pyodideLoading;
                    setPyodide(instance);
                    setLoading(false);
                    return;
                }

                // Start loading Pyodide
                setLoading(true);
                pyodideLoading = (async () => {
                    const { loadPyodide: loadPyodideFromCDN } = await import(
                        "pyodide"
                    );
                    const pyodideInstance = await loadPyodideFromCDN({
                        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
                    });
                    return pyodideInstance;
                })();

                const instance = await pyodideLoading;
                pyodideInstance = instance;
                setPyodide(instance);
                setLoading(false);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to load Pyodide"
                );
                setLoading(false);
            }
        };

        void loadPyodide();
    }, []);

    return { pyodide, loading, error };
}
