import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { supabase } from "../supabaseClient";
import { ResumeProvider } from "../context/ResumeContext";
import ResumeRenderer from "../ResumeRenderer/ResumeRenderer";
import Toolbar from "./Toolbar";
import SaveControls from "./SaveControl";
import templateStyles from "../data/templateStyle";
import { templates } from "../data/templates";
import Footer from "../Components/Footer/Footer";
import Navbar from "./Navbar";

export default function ResumePage() {
    const [user, setUser] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [userData, setUserData] = useState(null);
    const [searchParams] = useSearchParams();
    const { templateId } = useParams();
    const navigate = useNavigate();
    const resumeRef = useRef();

    const editModeFromURL = searchParams.get("edit") === "true";

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
        });
    }, []);

    useEffect(() => {
        fetch("/api/templates")
            .then((res) => res.json())
            .then((data) => {
                const found = data.templates.find((t) => t.id === Number(templateId));
                setSelectedTemplate(found);
            });

        fetch("/api/user-data")
            .then((res) => res.json())
            .then((data) => {
                setUserData(data.data);
            });
    }, [templateId]);

    const handleTemplateSwitch = (newId) => {
        const newTemplate = templates.find((t) => t.id === newId);
        if (newTemplate) setSelectedTemplate(newTemplate);
    };

    const handleDownload = () => {
        if (!user) {
            navigate("/auth");
            return;
        }

        const input = resumeRef.current;
        html2canvas(input).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save("my-resume.pdf");
        });
    };

    if (!selectedTemplate || !userData)
        return <p style={{ textAlign: "center", paddingTop: "2rem" }}>Loading template...</p>;

    const dynamicStyle = {
        ...(templateStyles[selectedTemplate.id] || {}),
        layout: selectedTemplate.layout
    };

    const savedData = JSON.parse(localStorage.getItem("resumeData"));
    const resumeData = savedData || userData;

    return (
        <>
            <ResumeProvider
                key={selectedTemplate.id}
                initialData={resumeData}
                style={dynamicStyle}
                editModeFromURL={editModeFromURL}
                templateId={selectedTemplate.id}
            >
                <Navbar onDownload={handleDownload} />

                <div
                    className="templateSectionn"
                    style={{
                        display: "flex",
                        minHeight: "100vh",
                        marginTop: "4rem",
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            width: "45%",
                            padding: "1rem",
                            overflowY: "auto",
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "1rem",
                            justifyContent: "space-between",
                            alignContent: "flex-start",
                        }}
                        className="hide-scroll"
                    >
                        <h3 style={{ width: "100%", marginBottom: "1rem", fontSize: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Templates</h3>

                        {templates.map((tpl) => (
                            <div
                                key={tpl.id}
                                onClick={() => handleTemplateSwitch(tpl.id)}
                                style={{
                                    width: "48%",
                                    background: "#fff",
                                    border: tpl.id === selectedTemplate.id
                                        ? "2px solid #fddb60"
                                        : "1px solid #ccc",
                                    borderRadius: "8px",
                                    padding: "0.5rem",
                                    cursor: "pointer",
                                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                                }}
                            >
                                <div
                                    style={{
                                        width: "100%",
                                        height: "300px",
                                        overflow: "hidden",
                                        position: "relative",
                                        borderRadius: "6px",
                                        // background: "#f9f9f9",
                                        top: '0.8rem',
                                        left: '1rem'
                                    }}
                                >
                                    <div
                                        style={{
                                            transform: "scale(0.26)",
                                            transformOrigin: "top left",
                                            width: "210mm",
                                            height: "297mm",
                                            pointerEvents: "none",
                                        }}
                                    >
                                        <ResumeProvider
                                            key={tpl.id}
                                            initialData={resumeData}
                                            style={{
                                                ...(templateStyles[tpl.id] || {}),
                                                layout: tpl.layout,
                                            }}
                                            editModeFromURL={false}
                                            templateId={tpl.id}
                                        >
                                            <ResumeRenderer template={tpl} />
                                        </ResumeProvider>
                                    </div>
                                </div>

                                <p style={{ textAlign: "center", fontSize: "14px", marginTop: "0.5rem" }}>
                                    {tpl.name}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div
                        style={{
                            flexGrow: 1,
                            padding: "2rem",
                            height: "100%",
                            textAlign: "center",
                            width: "70%",
                            overflowY: "auto",
                        }}
                        className="hide-scroll"
                    >
                        <Toolbar />
                        <SaveControls />

                        <div
                            ref={resumeRef}
                            style={{
                                margin: "2rem auto",
                                width: "fit-content",
                            }}
                        >
                            <ResumeRenderer template={selectedTemplate} />
                        </div>

                        <button
                            onClick={handleDownload}
                            className="btnPrimary"
                            style={{ marginTop: "1rem" }}
                        >
                            Download PDF
                        </button>
                    </div>
                </div>

                <Footer />
            </ResumeProvider>
        </>
    );
}

