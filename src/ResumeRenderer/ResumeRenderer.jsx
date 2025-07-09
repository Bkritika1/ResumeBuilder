
import { useEffect } from "react";
import Projects from "./components/Projects";
import Skills from "./components/Skills";
import WorkExperience from "./components/WorkExperience";
import Education from "./components/Education";
import PersonalInfo from "./components/PersonalInfo";
import Contact from "./components/Contact";
import Summary from "./components/Summary";
import Avatar from "./components/Avatar";
import Strengths from "./components/Strength";
import Achievements from "./components/Achivements";
import Language from "./components/Language";
import Awards from "./components/Awards";
import Organizations from "./components/Organizations";
import "./ResumeRenderer.css";

import { useResume } from "../context/ResumeContext";
import templateStyles from "../data/templateStyle";

const sectionComponents = {
    personalInfo: PersonalInfo,
    education: Education,
    workExperience: WorkExperience,
    skills: Skills,
    projects: Projects,
    contact: Contact,
    summary: Summary,
    strengths: Strengths,
    achievements: Achievements,
    organizations: Organizations,
    avatar: Avatar,
    language: Language,
    awards: Awards
};

export default function ResumeRenderer({ template }) {
    const { data, style, customLayoutAreas, setSelectedSection, sectionOrder } = useResume();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest(".resumeSection")) {
                setSelectedSection(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const layout = {
        ...style?.layout,
        grid: {
            ...style?.layout?.grid,
            areas: customLayoutAreas || style?.layout?.grid?.areas || []
        }
    };

    const grid = layout.grid || { templateRows: "", templateColumns: "", rowGap: "", columnGap: "", areas: [] };
    const fontFamily = layout.fontFamily || "sans-serif";
    const fontSize = layout.fontSize || "12px";
    const colorScheme = layout.colorScheme || { background: "#fff", text: "#000" };

    const layoutAreas = customLayoutAreas || grid.areas || [];

    const templateId = style?.templateId || template?.id || "default";
    const templateStyle = templateStyles[templateId] || {};
    const cssVariables = templateStyle.vars || {};

    const renderSection = (sectionName) => {
        const SectionComponent = sectionComponents[sectionName];
        if (!SectionComponent) {
            console.warn("Unknown section:", sectionName);
            return <div style={{ color: "red" }}>❌ {sectionName} not found</div>;
        }
        return <SectionComponent />;
    };

    const numRows = (grid.templateRows || "").split(" ").length;
    const numCols = (grid.templateColumns || "").split(" ").length;

    const gridMatrix = Array.from({ length: numRows }, () =>
        Array(numCols).fill(".")
    );

    layoutAreas.forEach((area) => {
        for (let row = area.rowStart - 1; row < area.rowEnd - 1; row++) {
            for (let col = area.colStart - 1; col < area.colEnd - 1; col++) {
                gridMatrix[row][col] = area.name;
            }
        }
    });

    const gridTemplateAreas = gridMatrix.map((row) => `"${row.join(" ")}"`).join(" ");

    return (
        <div
            id="resume-view"
            style={{
                fontFamily,
                fontSize,
                background: colorScheme.background,
                color: colorScheme.text,
                gridTemplateColumns: grid.templateColumns,
                gridTemplateRows: grid.templateRows,
                rowGap: grid.rowGap,
                columnGap: grid.columnGap,
                display: "grid",
                gridTemplateAreas,
                ...cssVariables,
            }}
        >
            {layoutAreas
                .filter((area) => area.name !== "unused")
                .map((area, index) => {
                    const visibleOrderedSections = area.sections.filter((sec) =>
                        sectionOrder.includes(sec)
                    );

                    const extraSections = area.sections.filter(
                        (sec) => !visibleOrderedSections.includes(sec) && data[sec] !== undefined
                    );

                    const allSectionsToRender = [...visibleOrderedSections, ...extraSections];

                    return (
                        <div key={index} style={{ gridArea: area.name }}>
                            {allSectionsToRender.map((section) => (
                                <div key={section}>{renderSection(section)}</div>
                            ))}
                        </div>
                    );
                })}
        </div>
    );
}
