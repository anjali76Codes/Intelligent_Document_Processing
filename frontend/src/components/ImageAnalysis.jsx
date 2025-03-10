import React, { useState } from 'react';
import axios from 'axios';

const ImageAnalysis = () => {
    const [file, setFile] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [error, setError] = useState(null);
    const [tamperedBox, setTamperedBox] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file to upload');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:5000/process-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.error) {
                setError(response.data.error);
                setImageUrl(null);
            } else {
                setImageUrl(response.data.ela_image_url);
                setTamperedBox(response.data.tampered_box);
                setError(null);
            }
        } catch (err) {
            setError('Error processing the image');
        }
    };

    return (
        <div>
            <h1>Image Manipulation Detection</h1>
            <form onSubmit={handleSubmit}>
                <input type="file" onChange={handleFileChange} />
                <button type="submit">Upload Image</button>
            </form>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {imageUrl && (
                <div>
                    <h2>Processed Image</h2>
                    <img src={`http://localhost:5000/${imageUrl}`} alt="Processed" style={{ maxWidth: '100%' }} />
                    {tamperedBox && (
                        <div>
                            <p>Tampered region found!</p>
                            <p>
                                Box coordinates: ({tamperedBox.x1}, {tamperedBox.y1}) to ({tamperedBox.x2}, {tamperedBox.y2})
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImageAnalysis;
