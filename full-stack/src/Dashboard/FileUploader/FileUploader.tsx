import { ChangeEvent, useState } from 'react';
import { documentProcessor } from '../../services/documentProcessor.js';
import DocumentResults from '../../components/DocumentResults/DocumentResults.jsx';

type ProcessingStatus = "idle" | "processing" | "success" | "error";

interface ProcessingProgress {
    step: string;
    progress: number;
    message: string;
}

export default function FileUploader() {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<ProcessingStatus>("idle");
    const [progress, setProgress] = useState<number>(0);
    const [progressMessage, setProgressMessage] = useState<string>("");
    const [result, setResult] = useState<any>(null);
    const [showResults, setShowResults] = useState<boolean>(false);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files) {
            setFile(e.target.files[0]);
            setStatus("idle");
            setResult(null);
            setShowResults(false);
            console.log('Selected file:', e.target.files[0]);
        }
    }

    const handleProgressUpdate = (progressData: ProcessingProgress) => {
        setProgress(progressData.progress);
        setProgressMessage(progressData.message);
        
        if (progressData.step === 'error') {
            setStatus("error");
        } else if (progressData.step === 'complete') {
            setStatus("success");
        }
    };

    async function handleProcessDocument() {
        if (!file) return;

        setStatus("processing");
        setProgress(0);
        setProgressMessage("Starting document processing...");

        try {
            const processingResult = await documentProcessor.processDocument(
                file, 
                handleProgressUpdate
            );

            setResult(processingResult);
            
            if (processingResult.success) {
                setStatus("success");
                setShowResults(true);
            } else {
                setStatus("error");
            }
        } catch (error) {
            console.error("Document processing failed:", error);
            setStatus("error");
            setProgressMessage(error instanceof Error ? error.message : "Processing failed");
        }
    }

    const handleCloseResults = () => {
        setShowResults(false);
        setResult(null);
    };

    const handleSaveToHistory = (result: any) => {
        documentProcessor.saveToHistory(result);
        // Could show a success message here
        console.log('Saved to history');
    };

    return (
        <>
            <div className="space-y-2">
                <div className="file-input-section">
                    <input 
                        type="file" 
                        accept=".txt,.pdf,.doc,.docx" 
                        onChange={handleFileChange}
                        disabled={status === "processing"}
                    />
                    <p className="file-help-text">
                        Upload a Terms of Service, Privacy Policy, or EULA document (.txt, .pdf, .doc, .docx)
                    </p>
                </div>

                {file && (
                    <div className="file-info">
                        <h4>Selected Document:</h4>
                        <p><strong>Name:</strong> {file.name}</p>
                        <p><strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB</p>
                        <p><strong>Type:</strong> {file.type || 'Unknown'}</p>
                    </div>
                )}

                {file && status !== "processing" && (
                    <div className="process-section">
                        <button onClick={handleProcessDocument} className="process-btn">
                            🤖 Analyze with AI
                        </button>
                        <p className="process-help-text">
                            Our AI will simplify the legal document and highlight important points
                        </p>
                    </div>
                )}

                {status === "processing" && (
                    <div className="processing-section">
                        <div className="progress-container">
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="progress-text">{progress}%</p>
                        </div>
                        <p className="progress-message">{progressMessage}</p>
                    </div>
                )}

                {status === "success" && !showResults && (
                    <div className="success-section">
                        <p className="success-message">✅ Document processed successfully!</p>
                        <button onClick={() => setShowResults(true)} className="view-results-btn">
                            View Results
                        </button>
                    </div>
                )}

                {status === "error" && (
                    <div className="error-section">
                        <p className="error-message">❌ {progressMessage || "Processing failed. Please try again."}</p>
                        <button onClick={() => setStatus("idle")} className="retry-btn">
                            Try Again
                        </button>
                    </div>
                )}
            </div>

            {showResults && result && (
                <DocumentResults
                    result={result}
                    onClose={handleCloseResults}
                    onSaveToHistory={handleSaveToHistory}
                />
            )}
        </>
    );
}