import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './ExcelUpload.css';

function ExcelUpload() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;
        setLoading(true);

        const formData = new FormData();
        formData.append('excelFile', file);

        try {
            const baseUrl = process.env.REACT_APP_API_BASE_URL || '/api';
            const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

            const res = await fetch(`${cleanBaseUrl}/tickets/process-upload`, {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                // Simulate analyzing delay and trigger download
                const blob = await res.blob();
                setTimeout(() => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = file.name;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    setLoading(false);
                }, 3000);
            } else {
                const data = await res.json();
                alert(data.message || 'Excel upload failed');
            }
            // After download completes, show success message and navigate
            alert('File processed and download started.');
            navigate('/my-tickets');
        } catch (err) {
            console.error(err);
            alert('Network error. Ensure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="excel-page">
            <div className="excel-card">
                <div className="excel-head">
                    <div>
                        <p className="excel-eyebrow">Bulk import</p>
                        <h2>Bulk Ticket Upload</h2>
                        <p className="excel-sub">Import multiple tickets at once using an Excel or CSV file.</p>
                    </div>
                    <Link to="/my-tickets" className="excel-link">View My Tickets →</Link>
                </div>

                <form onSubmit={handleSubmit} className="excel-form">
                    <div className="excel-upload-zone" onClick={() => document.getElementById('excelFileInput').click()}>
                        <input
                            type="file"
                            id="excelFileInput"
                            accept=".xlsx, .xls, .csv"
                            onChange={handleFileChange}
                        />
                        <div className="upload-icon">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <line x1="10" y1="9" x2="8" y2="9" />
                            </svg>
                        </div>
                        <div className="upload-text">
                            {file ? <strong>{file.name}</strong> : 'Select Excel or CSV file'}
                            <span>Supports .xlsx, .xls and .csv formats</span>
                        </div>
                    </div>

                    <button type="submit" className="excel-submit" disabled={loading || !file}>
                        {loading ? 'Processing File...' : 'Upload & Process'}
                    </button>
                </form>

                <div className="excel-footer">
                    <Link to="/" className="excel-link">← Back to Dashboard</Link>
                    <span className="excel-hint">Template tip: columns should include description, category, and priority.</span>
                </div>
            </div>
        </div>
    );
}

export default ExcelUpload;
