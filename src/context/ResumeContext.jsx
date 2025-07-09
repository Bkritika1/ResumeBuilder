import { createContext, useContext, useState, useEffect } from "react";

export const ResumeContext = createContext();
export const useResume = () => useContext(ResumeContext);

export function ResumeProvider({ children, initialData, style, editModeFromURL, templateId }) {
    const [data, setData] = useState(() => {
        const saved = localStorage.getItem("resumeData");
        return saved ? JSON.parse(saved) : initialData;
    });

    const [editMode, setEditMode] = useState(editModeFromURL || false);
    const [selectedSection, setSelectedSection] = useState(null);

    const [customLayoutAreas, setCustomLayoutAreas] = useState(null);
    const [sectionOrder, setSectionOrder] = useState([]);

    // 1. Load custom layout areas from localStorage or fallback
    useEffect(() => {
        if (!templateId || !style?.layout?.grid?.areas) return;

        const layoutKey = `resumeCustomAreas-${templateId}`;
        const saved = localStorage.getItem(layoutKey);

        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setCustomLayoutAreas(parsed);
                    return;
                }
            } catch {
                // Fall through to fallback
            }
        }

        setCustomLayoutAreas(style.layout.grid.areas || []);
    }, [templateId, style]);

    // 2. Load section order based on layout or fallback
    useEffect(() => {
        if (!templateId) return;

        const sectionKey = `resumeSectionOrder-${templateId}`;
        const saved = localStorage.getItem(sectionKey);

        const fallback = (customLayoutAreas || style?.layout?.grid?.areas || []).flatMap(
            (a) => a.sections
        );

        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                setSectionOrder(parsed);
            } else {
                setSectionOrder(fallback);
            }
        } catch {
            setSectionOrder(fallback);
        }
    }, [templateId, style, customLayoutAreas]);

    // 3. Save sectionOrder to localStorage when changed
    useEffect(() => {
        if (!templateId) return;
        const sectionKey = `resumeSectionOrder-${templateId}`;
        localStorage.setItem(sectionKey, JSON.stringify(sectionOrder));
    }, [sectionOrder, templateId]);

    // 4. Save layout changes when modified
    useEffect(() => {
        if (!templateId || !customLayoutAreas) return;
        const layoutKey = `resumeCustomAreas-${templateId}`;
        localStorage.setItem(layoutKey, JSON.stringify(customLayoutAreas));
    }, [customLayoutAreas, templateId]);

    // 5. Save resume data
    useEffect(() => {
        localStorage.setItem("resumeData", JSON.stringify(data));
    }, [data]);

    // Called manually when user clicks save
    const save = () => {
        localStorage.setItem("resumeData", JSON.stringify(data));
        setEditMode(false);
        console.log("Saved rich text data:", data);
    };

    // Update any field inside any section
    const updateField = (section, key, value) => {
        console.log("Updating:", section, key, value);
        setData((prev) => {
            if (key === null && section) {
                return {
                    ...prev,
                    [section]: value,
                };
            }

            if (key && section) {
                return {
                    ...prev,
                    [section]: {
                        ...prev[section],
                        [key]: value,
                    },
                };
            }

            if (!section && key) {
                return {
                    ...prev,
                    [key]: value,
                };
            }

            return prev;
        });
    };

    return (
        <ResumeContext.Provider
            value={{
                data,
                setData,
                style,
                editMode,
                setEditMode,
                save,
                updateField,
                selectedSection,
                setSelectedSection,
                sectionOrder,
                setSectionOrder,
                customLayoutAreas,
                setCustomLayoutAreas,
            }}
        >
            {children}
        </ResumeContext.Provider>
    );
}
