
import { useEffect, useRef, useState } from "react";
import { useResume } from "../context/ResumeContext";
import LayoutEditorModal from "../Features/LayoutEditorModal/LayoutEditorModal";

export default function Toolbar() {
    const { editMode, setEditMode } = useResume();
    const [showLayoutModal, setShowLayoutModal] = useState(false);
    const savedSelection = useRef(null);

    useEffect(() => {
        const saveSelection = () => {
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0) {
                savedSelection.current = sel.getRangeAt(0);
            }
        };

        document.addEventListener("mouseup", saveSelection);
        document.addEventListener("keyup", saveSelection);

        return () => {
            document.removeEventListener("mouseup", saveSelection);
            document.removeEventListener("keyup", saveSelection);
        };
    }, []);

    const exec = (command, value = null) => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) {

            return;
        }

        if (savedSelection.current) {
            sel.removeAllRanges();
            sel.addRange(savedSelection.current);
        }

        document.execCommand("styleWithCSS", false, true);
        document.execCommand(command, false, value);
    };



    const toolbarStyle = {
        position: "fixed",
        top: "120px",
        left: "606px",
        right: 0,
        zIndex: 999,
        width: "50%",
        background: "linear-gradient(to right, #f3e5f5, #fff3e0)",
        backdropFilter: "blur(12px)",
        padding: "12px 20px",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "10px",
        borderRadius: "12px",
        color: "#333",
        boxShadow: "0 4px 12px rgba(211, 176, 235, 0.4)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
    };



    const buttonStyle = {
        padding: "8px 14px",
        background: "linear-gradient(to right, #d5bce3, #fddb7c)",
        border: "1px solid #e8d0f5",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "500",
        cursor: "pointer",
        color: "#1f1f1f",
        boxShadow: "0 2px 6px rgba(198, 169, 227, 0.3)",
        transition: "all 0.2s ease-in-out",
    };


    if (!editMode) return null;
    return (
        <>
            <div className="toolbar" style={toolbarStyle}>
                <button style={buttonStyle} onClick={() => exec("bold")}><b>B</b></button>
                <button style={buttonStyle} onClick={() => exec("italic")}><i>I</i></button>
                <button style={buttonStyle} onClick={() => exec("underline")}><u>U</u></button>
                <button style={buttonStyle} onClick={() => exec("insertUnorderedList")}>• List</button>
                <button style={buttonStyle} onClick={() => exec("insertOrderedList")}>1. List</button>
                <button style={buttonStyle} onClick={() => setShowLayoutModal(true)}>
                    Layout
                </button>
                <button
                    style={buttonStyle}
                    onClick={() => {
                        const url = prompt("Enter URL:");
                        if (url) exec("createLink", url);
                    }}
                >
                    🔗 Link
                </button>
                <button style={buttonStyle} onClick={() => exec("undo")}>↩️ Undo</button>
                <button style={buttonStyle} onClick={() => exec("redo")}>↪️ Redo</button>
            </div>
            <LayoutEditorModal
                isOpen={showLayoutModal}
                onClose={() => setShowLayoutModal(false)}
            />
        </>
    );
}


