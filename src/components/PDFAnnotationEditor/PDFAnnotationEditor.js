// PDFAnnotationEditor.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Canvas, PencilBrush, IText } from 'fabric';
import { PDFDocument } from 'pdf-lib';

pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.mjs`;

// Basic styling for the component and toolbar (can be moved to a CSS file)
const styles = {
    editorContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        border: '1px solid #ccc',
        borderRadius: '4px',
        overflow: 'hidden'
    },
    toolbar: {
        padding: '8px 12px',
        borderBottom: '1px solid #ddd',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        flexWrap: 'wrap', // Allow items to wrap on smaller screens
        alignItems: 'center',
        gap: '10px' // Spacing between items
    },
    toolButton: {
        padding: '6px 10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        cursor: 'pointer',
        backgroundColor: '#fff',
        transition: 'background-color 0.2s ease',
    },
    activeToolButton: {
        backgroundColor: '#007bff',
        color: 'white',
        borderColor: '#007bff',
    },
    inputGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
    },
    inputField: {
        padding: '6px',
        border: '1px solid #ccc',
        borderRadius: '4px',
    },
    scoreInput: {
        width: '70px',
    },
    notesTextarea: {
        minWidth: '200px', // Give it some base width
        flexGrow: 1, // Allow it to take available space if toolbar wraps
        resize: 'vertical',
    },
    pdfDisplayArea: {
        flexGrow: 1,
        overflowY: 'scroll',
        backgroundColor: '#e9ecef', // Slightly different background for the scroll area
        padding: '10px 0', // Add some vertical padding
    },
    pageContainer: {
        position: 'relative',
        margin: '20px auto',
        display: 'flex',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)', // Enhanced shadow
    },
    fabricCanvasOverlay: {
        position: 'absolute',
        left: '50%',
        top: 0,
        transform: 'translateX(-50%)',
        zIndex: 10 // Ensure it's above react-pdf's page canvas
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000, // On top of everything
        fontSize: '1.2em',
        color: '#333',
    }
};


const PDFAnnotationEditor = ({
    pdfUrl,
    onSaveSuccess, // Callback for when save is successful (e.g., to close modal)
    submissionId,  // Prop for submission ID
    markType, // NEW: 'exam' or undefined
    // isSaving is now internal to this component
}) => {
    // console.log(`Render. Tool: ${activeTool}`);
    const [numPages, setNumPages] = useState(null);
    const [fabricCanvases, setFabricCanvases] = useState({});
    const [activeTool, setActiveTool] = useState('pen');
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(5);
    const pageCanvasRefs = useRef({});

    // NEW state for score, notes, and internal saving indicator
    const [score, setScore] = useState('');
    const [notes, setNotes] = useState('');
    const [internalIsSaving, setInternalIsSaving] = useState(false);

    const hexToRgba = useCallback((hex, alpha) => {
        if (!hex || typeof hex !== 'string' || !hex.startsWith('#') || (hex.length !== 7 && hex.length !== 4)) {
            return 'rgba(255, 255, 0, 0.3)';
        }
        let r, g, b;
        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16); g = parseInt(hex[2] + hex[2], 16); b = parseInt(hex[3] + hex[3], 16);
        } else {
            r = parseInt(hex.slice(1, 3), 16); g = parseInt(hex.slice(3, 5), 16); b = parseInt(hex.slice(5, 7), 16);
        }
        if (isNaN(r) || isNaN(g) || isNaN(b)) return 'rgba(255, 255, 0, 0.3)';
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }, []);

    const onDocumentLoadSuccess = ({ numPages: nextNumPages }) => {
        setNumPages(nextNumPages);
        Object.values(fabricCanvases).forEach(canvas => {
            if (canvas && typeof canvas.dispose === 'function') canvas.dispose();
        });
        setFabricCanvases({});
        pageCanvasRefs.current = {};
    };

    const initFabricCanvas = (pageNumber, canvasElement, width, height) => {
        if (fabricCanvases[pageNumber] && fabricCanvases[pageNumber] instanceof Canvas) {
            fabricCanvases[pageNumber].setDimensions({ width, height });
            fabricCanvases[pageNumber].renderAll();
            return;
        }
        if (canvasElement) {
            const fabricCanvasInstance = new Canvas(canvasElement, { width, height });
            setFabricCanvases(prev => ({ ...prev, [pageNumber]: fabricCanvasInstance }));
        }
    };

    const handleCanvasMouseDown = useCallback((options, fabricCanvas, pageNum) => {
        if (!fabricCanvas) return;
        if (activeTool === 'textbox') {
            if (options.target && !(options.target instanceof Canvas)) {
                if (options.target instanceof IText) {
                    fabricCanvas.setActiveObject(options.target);
                    options.target.enterEditing();
                    options.target.initDelayedCursor(true);
                    fabricCanvas.renderAll();
                }
            return;
        }
            const pointer = fabricCanvas.getPointer(options.e);
            const text = new IText('', {
                left: pointer.x, top: pointer.y, fontFamily: 'arial', fill: color,
                fontSize: 20, originX: 'left', originY: 'top', padding: 7,
                cornerColor: 'blue', cornerStrokeColor: 'blue', transparentCorners: false, cornerSize: 10,
        });
        fabricCanvas.add(text);
            fabricCanvas.setActiveObject(text);
            text.enterEditing();
            text.initDelayedCursor(true);
            fabricCanvas.renderAll();
        } else if (activeTool === 'eraser') {
            if (options.target && !(options.target instanceof Canvas)) {
                fabricCanvas.remove(options.target);
        fabricCanvas.renderAll();
            }
        }
    }, [activeTool, color]);

    useEffect(() => {
        Object.entries(fabricCanvases).forEach(([pageNumStr, fCanvas]) => {
            if (fCanvas instanceof Canvas) {
            const pageNum = parseInt(pageNumStr, 10);

                fCanvas.isDrawingMode = (activeTool === 'pen' || activeTool === 'highlighter');
                fCanvas.selection = !fCanvas.isDrawingMode;

                if (activeTool === 'pen') {
                    fCanvas.freeDrawingBrush = new PencilBrush(fCanvas);
                    fCanvas.freeDrawingBrush.color = color;
                    fCanvas.freeDrawingBrush.width = parseInt(brushSize, 10);
                    fCanvas.defaultCursor = 'crosshair'; // Cursor for pen
                } else if (activeTool === 'highlighter') {
                    fCanvas.freeDrawingBrush = new PencilBrush(fCanvas);
                    fCanvas.freeDrawingBrush.color = hexToRgba(color, 0.3);
                    fCanvas.freeDrawingBrush.width = parseInt(brushSize, 10) * 3;
                    fCanvas.defaultCursor = 'crosshair'; // Cursor for highlighter
                } else if (activeTool === 'textbox') {
                    fCanvas.defaultCursor = 'text'; // Cursor for textbox
                } else if (activeTool === 'eraser') {
                    fCanvas.defaultCursor = 'cell'; // Cursor for eraser (select mode)
                } else {
                    fCanvas.defaultCursor = 'default'; // Default cursor
                }

                fCanvas.off('mouse:down');
                if (activeTool === 'textbox' || activeTool === 'eraser') {
                    fCanvas.on('mouse:down', (options) => handleCanvasMouseDown(options, fCanvas, pageNum));
                }
                fCanvas.renderAll();
            }
        });
        return () => {
            Object.values(fabricCanvases).forEach(fCanvas => {
                if (fCanvas instanceof Canvas) fCanvas.off('mouse:down');
            });
        };
    }, [activeTool, color, brushSize, fabricCanvases, handleCanvasMouseDown, hexToRgba]);

    const handleEraserButtonClick = () => {
        if (activeTool !== 'eraser') {
            setActiveTool('eraser');
            return;
        }
        let objectsWereRemoved = false;
        Object.values(fabricCanvases).forEach(fCanvas => {
            if (fCanvas instanceof Canvas) {
                const activeObjectOrSelection = fCanvas.getActiveObject();
                if (activeObjectOrSelection) {
                    if (activeObjectOrSelection.type === 'activeSelection') {
                        activeObjectOrSelection.forEachObject(obj => fCanvas.remove(obj));
                        objectsWereRemoved = true;
                    } else {
                        fCanvas.remove(activeObjectOrSelection); // Also remove single selected on button click
                        objectsWereRemoved = true;
                    }
                    if (objectsWereRemoved) {
                        fCanvas.discardActiveObject();
                        fCanvas.renderAll();
                    }
                }
            }
        });
    };

    const handleSave = async () => {
        if (!numPages || !pdfUrl) {
            alert("No PDF loaded or no pages to save.");
            return;
        }
        if (!submissionId) {
            alert("Submission ID is missing. Cannot save.");
            return;
        }
        setInternalIsSaving(true);

        // 1. Generate the marked PDF blob
        const newPdfDoc = await PDFDocument.create();
        const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
        const originalPdfDoc = await PDFDocument.load(existingPdfBytes);

        for (let i = 0; i < numPages; i++) {
            const [originalPage] = await newPdfDoc.copyPages(originalPdfDoc, [i]);
            const newPage = newPdfDoc.addPage(originalPage);
            const fabricCanvas = fabricCanvases[i + 1];
            if (fabricCanvas) {
                const originalBg = fabricCanvas.backgroundColor;
                fabricCanvas.backgroundColor = '';
                fabricCanvas.renderAll();
                fabricCanvas.discardActiveObject();
                fabricCanvas.renderAll();
                const annotationDataUrl = fabricCanvas.toDataURL({ format: 'png', multiplier: 2 });
                const annotationImageBytes = await fetch(annotationDataUrl).then(res => res.arrayBuffer());
                const annotationImage = await newPdfDoc.embedPng(annotationImageBytes);
                fabricCanvas.backgroundColor = originalBg;
                fabricCanvas.renderAll();
                const { width, height } = newPage.getSize();
                newPage.drawImage(annotationImage, { x: 0, y: 0, width: width, height: height });
            }
        }
        const pdfBytes = await newPdfDoc.save();
        const markedPdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

        // 2. Prepare FormData
        const formData = new FormData();
        formData.append('submissionId', submissionId);
        formData.append('score', score); // Score from state
        formData.append('notes', notes); // Notes from state
        formData.append('file', markedPdfBlob, `marked_${submissionId}.pdf`);

        // 3. Make the API Call
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
            alert("Authentication token not found. Please log in.");
            setInternalIsSaving(false);
            return;
        }

        try {
            const endpoint = markType === 'exam'
                ? 'https://backend-edu-site-5cnm.vercel.app/exams/mark'
                : 'https://backend-edu-site-5cnm.vercel.app/assignments/mark';
            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Authorization': `MonaEdu ${token}`,
                },
                body: formData,
            });

            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(responseData.message || `Server error: ${response.status}`);
            }
            alert(responseData.message || 'Marked assignment saved successfully!');
            if (onSaveSuccess) {
                onSaveSuccess();
            }
        } catch (err) {
            console.error('Error saving marked assignment:', err);
            alert(`Error: ${err.message}`);
        } finally {
            setInternalIsSaving(false);
        }
    };
    
    const getToolButtonStyle = (toolName) => ({
        ...styles.toolButton,
        ...(activeTool === toolName ? styles.activeToolButton : {}),
    });

    return (
        <div style={styles.editorContainer}>
            {internalIsSaving && (
                <div style={styles.loadingOverlay}>Saving... Please wait.</div>
            )}
            <div style={styles.toolbar}>
                <button style={getToolButtonStyle('pen')} onClick={() => setActiveTool('pen')}>Pen</button>
                <button style={getToolButtonStyle('highlighter')} onClick={() => setActiveTool('highlighter')}>Highlight</button>
                <button style={getToolButtonStyle('eraser')} onClick={handleEraserButtonClick}>Eraser</button>
                <button style={getToolButtonStyle('textbox')} onClick={() => setActiveTool('textbox')}>Textbox</button>
                
                <div style={styles.inputGroup}>
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ ...styles.inputField, padding: '2px', height: '34px'}} />
                </div>
                <div style={styles.inputGroup}>
                    <label htmlFor="brushSizeInput">Size:</label>
                    <input type="range" id="brushSizeInput" min="1" max="50" value={brushSize} onChange={(e) => setBrushSize(e.target.value)} style={{ margin: '0 5px' }}/> {brushSize}
                </div>
            </div>
            <div style={{ ...styles.toolbar, borderTop: '1px solid #ddd', justifyContent: 'space-between' }}> {/* Second row for score/notes/save */}
                <div style={styles.inputGroup}>
                    <label htmlFor="scoreInput">Score:</label>
                    <input
                        type="number"
                        id="scoreInput"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        style={{ ...styles.inputField, ...styles.scoreInput }}
                    />
                </div>
                
                <button onClick={handleSave} disabled={internalIsSaving || !numPages} style={styles.toolButton}>
                    {internalIsSaving ? 'Saving...' : 'Save Marked PDF'}
                </button>
            </div>

            <div style={styles.pdfDisplayArea}>
                <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={(error) => console.error("Error loading PDF:", error.message)}
                >
                    {Array.from(new Array(numPages || 0), (el, index) => (
                        <div key={`page_container_${index + 1}`} style={styles.pageContainer}>
                            <Page
                                key={`page_${index + 1}`}
                                pageNumber={index + 1}
                                renderAnnotationLayer={false}
                                renderTextLayer={false}
                                onRenderSuccess={(page) => {
                                    const viewport = page.getViewport({ scale: 1 });
                                    const fabricCanvasContainer = document.getElementById(`fabric-canvas-container-${index + 1}`);
                                    if (fabricCanvasContainer) {
                                        let canvasEl = pageCanvasRefs.current[index + 1];
                                        if (!canvasEl) {
                                            canvasEl = document.createElement('canvas');
                                            canvasEl.id = `fabric-actual-canvas-${index + 1}`;
                                            pageCanvasRefs.current[index + 1] = canvasEl;
                                            fabricCanvasContainer.innerHTML = '';
                                            fabricCanvasContainer.appendChild(canvasEl);
                                        }
                                        initFabricCanvas(index + 1, canvasEl, viewport.width, viewport.height);
                                    }
                                }}
                            />
                            <div id={`fabric-canvas-container-${index + 1}`} style={styles.fabricCanvasOverlay}>
                                {/* Canvas element will be dynamically added here */}
                            </div>
                        </div>
                    ))}
                </Document>
            </div>
        </div>
    );
};

export default PDFAnnotationEditor;