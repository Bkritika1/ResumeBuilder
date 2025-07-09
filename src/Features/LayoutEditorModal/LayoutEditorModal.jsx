import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./LayoutEditorModal.css";
import { useResume } from "../../context/ResumeContext";

const allSections = [
    "avatar", "contact", "summary", "education", "workExperience", "skills",
    "projects", "organizations", "awards", "language", "strengths", "achievements"
];

const formatAreaName = (name) => {
    return name
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, str => str.toUpperCase());
};

export default function LayoutEditorModal({ isOpen, onClose }) {
    const { style, setSectionOrder, sectionOrder, customLayoutAreas, setCustomLayoutAreas } = useResume();

    const originalGridAreas = customLayoutAreas || style?.layout?.grid?.areas || [];
    const [gridAreas, setGridAreas] = useState(() => {
        const copy = JSON.parse(JSON.stringify(originalGridAreas));
        const allowedNames = ["leftColumn", "rightColumn"];
        const filtered = copy.filter(a => allowedNames.includes(a.name));

        const used = filtered.flatMap(a => a.sections);
        const unused = allSections.filter(s => !used.includes(s));

        return [
            ...filtered,
            { name: "unused", sections: unused }
        ];
    });


    if (!isOpen || !style?.layout?.grid) return null;

    const onDragEnd = (result) => {
        const { source, destination } = result;
        if (!destination) return;

        const updated = [...gridAreas];
        const sourceArea = updated.find(a => a.name === source.droppableId);
        const destArea = updated.find(a => a.name === destination.droppableId);

        const [moved] = sourceArea.sections.splice(source.index, 1);
        destArea.sections.splice(destination.index, 0, moved);

        setGridAreas(updated);
    };

    const handleApply = () => {
        const editedAreas = gridAreas.filter(a =>
            ["leftColumn", "rightColumn"].includes(a.name)
        );
        const untouchedAreas = originalGridAreas.filter(
            a => !["leftColumn", "rightColumn"].includes(a.name)
        );

        const unusedArea = gridAreas.find(a => a.name === "unused");
        const newLayout = [
            ...untouchedAreas,
            ...editedAreas,
            ...(unusedArea ? [unusedArea] : [])
        ];
        const newSectionsInLayout = newLayout.flatMap(a => a.sections);
        const newSectionOrder = Array.from(new Set([...sectionOrder, ...newSectionsInLayout]));
        setSectionOrder(newSectionOrder);
        setCustomLayoutAreas(newLayout);
        onClose();
    };

    const StrictModeDroppable = ({ children, ...props }) => {
        const [enabled, setEnabled] = useState(false);

        useEffect(() => {
            const animation = requestAnimationFrame(() => setEnabled(true));
            return () => cancelAnimationFrame(animation);
        }, []);

        if (!enabled) return null;
        return <Droppable {...props}>{children}</Droppable>;
    };

    const usedSections = gridAreas.flatMap(a => a.sections);

    return (
        <div className="layoutEditorModal">
            <div className="modalContent">
                <h2>Edit Layout</h2>

                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="gridAreaPreview">
                        {["leftColumn", "rightColumn", "unused"].map((areaName) => {
                            const area = gridAreas.find((a) => a.name === areaName);
                            if (!area) return null;

                            return (
                                <div key={area.name} className="gridAreaBox">
                                    <h4>{formatAreaName(area.name)}</h4>
                                    <StrictModeDroppable droppableId={area.name}>
                                        {(provided) => (
                                            <div
                                                className="droppableZone"
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                            >
                                                {area.sections.map((section, index) => (
                                                    <Draggable key={section} draggableId={String(section)} index={index}>
                                                        {(provided) => (
                                                            <div
                                                                className="sectionItem"
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                            >
                                                                {section}
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </StrictModeDroppable>
                                </div>
                            );
                        })}
                    </div>

                </DragDropContext>

                <div className="modalButtons">
                    <button onClick={handleApply}> Apply</button>
                    <button onClick={onClose}> Cancel</button>
                </div>
            </div>
        </div>
    );
}
