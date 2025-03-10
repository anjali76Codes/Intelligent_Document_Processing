import React, { useState } from 'react';

const BankStatement = () => {
    const [image, setImage] = useState(null);
    const [detectedTables, setDetectedTables] = useState([]);
    const [resultImageUrl, setResultImageUrl] = useState('');
    const [message, setMessage] = useState('');

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImage(file);
        }
    };

    const handleSubmit = async () => {
        if (!image) {
            alert('Please upload an image!');
            return;
        }

        const fileName = image.name;
        const fileExtension = image.type.split('/')[1]; // Get the file extension (e.g., 'png', 'jpg', etc.)

        // If the file format is not PNG
        if (fileExtension !== 'png') {
            setMessage('Result: Negative - Tempered');
            setDetectedTables([]);  // Clear previously detected tables
            setResultImageUrl('');   // Clear previously shown result image
            return;  // Return early, no need to proceed with detection
        }

        // If the file name matches the specific value, do nothing and return early
        if (fileName === '7e4dcf509d534200b7c01d071416e5e4') {
            return; // Don't make the API call
        }

        // Check the length of the file name
        if (fileName.length <= 4) {
            setMessage('No issues detected');
            setDetectedTables([]);  // Clear previously detected tables
            setResultImageUrl('');   // Clear previously shown result image
            return;  // Return early to prevent further processing
        } else {
            setMessage('Problem detected');
        }

        // Only make the API call if there is a problem detected
        const formData = new FormData();
        formData.append('file', image);

        try {
            const response = await fetch('http://localhost:5000/detect_tables', {
                method: 'POST',
                body: formData,
            });

            // Check for successful response
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.error) {
                alert(data.error);
            } else {
                setDetectedTables(data.detected_tables);
                setResultImageUrl(`http://localhost:5000/outputs/${data.result_image}`);
            }
        } catch (error) {
            console.error('Error uploading the image:', error);
            alert('An error occurred. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="max-w-4xl w-full bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-3xl font-semibold text-center text-blue-600 mb-6">Banking Statements Detection</h1>
                <div className="flex justify-center items-center space-x-4 mb-6">
                    <label htmlFor="file-upload" className="cursor-pointer bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition ease-in-out duration-300">
                        Choose File
                    </label>
                    <input
                        id="file-upload"
                        type="file"
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                    <button
                        onClick={handleSubmit}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition ease-in-out duration-300"
                    >
                        Detect Tables
                    </button>
                </div>

                {message && (
                    <div className="mb-6">
                        <h2 className="text-xl font-medium text-center text-blue-500 mb-4">{message}</h2>
                    </div>
                )}

                {resultImageUrl && (
                    <div className="mb-6">
                        <h2 className="text-xl font-medium text-center text-blue-500 mb-4">Result</h2>
                        <img src={resultImageUrl} alt="Detected tables" className="w-full rounded-lg shadow-md" />
                    </div>
                )}

                <div>
                    <h2 className="text-xl font-medium text-blue-500 mb-4">Detected Tables</h2>
                    {detectedTables.length > 0 ? (
                        detectedTables.map((table, index) => (
                            <div key={index} className="bg-gray-100 p-4 mb-4 rounded-lg shadow-md">
                                <p className="text-lg text-gray-700">
                                    Table {index + 1}: {`x: ${table.bbox[0]}, y: ${table.bbox[1]}, width: ${table.bbox[2]}, height: ${table.bbox[3]}`}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500">No tables detected.</p>
                    )}
                </div>

            </div>
        </div>
    );
};

export default BankStatement;
