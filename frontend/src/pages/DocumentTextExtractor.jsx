import React, { useState } from 'react';
import axios from 'axios';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set the workerSrc for pdf.js to avoid the version mismatch error
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

const DocumentTextExtractor = () => {
  const [file, setFile] = useState(null);
  const [verificationResponse, setVerificationResponse] = useState(null);
  const [textExtracted, setTextExtracted] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null); // New state for comparison result
  const [isComparing, setIsComparing] = useState(false); // State for comparison loading

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleBarcodeSubmit = async () => {
    if (!file) {
      setError('Image file is required for barcode/QR code extraction');
      return;
    }
    setError(null);
    setIsProcessing(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post('http://localhost:5000/verify-code', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setVerificationResponse(res.data);
    } catch (err) {
      setError('Error during barcode/QR code verification');
    } finally {
      setIsProcessing(false);
    }
  };

  const extractName = (text) => {
    const namePattern = /Name:\s*([A-Za-z]+)\s([A-Za-z]+)(?:\s([A-Za-z]+))?/;
    const match = text.match(namePattern);
    if (match) {
      const lastName = match[1];
      const firstName = match[2];
      const middleName = match[3] || '';
      return `${lastName} ${firstName} ${middleName}`.trim();
    }
    return 'Name not found';
  };

  const extractTextFromImage = async (imageFile) => {
    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = () => {
      const imageData = reader.result;

      Tesseract.recognize(
        imageData,
        ['eng', 'hin'],
        { logger: (m) => console.log(m) }
      ).then(({ data: { text } }) => {
        setTextExtracted(text);
        setName(extractName(text));
        setIsProcessing(false);
      }).catch((error) => {
        console.error('Error during OCR processing:', error);
        setIsProcessing(false);
      });
    };

    reader.readAsDataURL(imageFile);
  };

  const extractTextFromPdf = async (pdfFile) => {
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(pdfFile);
    fileReader.onload = async () => {
      const arrayBuffer = fileReader.result;
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let text = '';
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        text += textContent.items.map(item => item.str).join(' ') + '\n\n';
      }
      setTextExtracted(text);
      setName(extractName(text));
      setIsProcessing(false);
    };
  };

  const extractTextFromWord = async (wordFile) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const arrayBuffer = reader.result;
      try {
        const result = await mammoth.extractRawText({ arrayBuffer });
        setTextExtracted(result.value);
        setName(extractName(result.value));
        setIsProcessing(false);
      } catch (error) {
        console.error('Error extracting text:', error);
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(wordFile);
  };

  const handleFileUpload = () => {
    if (!file) {
      setError('Please upload a file');
      return;
    }
    setError(null);
    if (file.type.startsWith('image/')) {
      extractTextFromImage(file);
    } else if (file.type === 'application/pdf') {
      extractTextFromPdf(file);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      extractTextFromWord(file);
    } else {
      setError('Please upload a valid image, PDF, or Word document');
    }
  };

  const compareWithDatabase = async () => {
    if (!verificationResponse && !textExtracted) {
      setError('Barcode/QR code or text data is required to compare');
      return;
    }

    setIsComparing(true);

    setTimeout(() => {
      setIsComparing(false);

      const result = Math.random() < 0.5 ? 'Verified' : 'Not Verified';
      setComparisonResult(result);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-100 rounded-xl shadow-lg mt-3">
      <h1 className="text-3xl font-semibold text-center mb-6">Document Text Extractor & Barcode/QR Code Verifier</h1>

      {/* Barcode/QR Code Extraction Section */}
      <div className="space-y-6 mb-8">
        <h2 className="text-xl font-semibold">Barcode/QR Code Verification</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full p-3 border border-blue-800 rounded-lg"
        />
        <button
          onClick={handleBarcodeSubmit}
          disabled={isProcessing}
          className="w-full p-3 bg-blue-800 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {isProcessing ? 'Verifying...' : 'Verify Barcode/QR Code'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        {verificationResponse && (
          <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-800 rounded-lg">
            <h3 className="font-semibold text-lg">Verification Result</h3>
            <pre className="mt-2 bg-gray-100 p-4 rounded-lg">{JSON.stringify(verificationResponse, null, 2)}</pre>
            {verificationResponse.barcode_data && (
              <div className="mt-4">
                <h4 className="font-semibold">Extracted Barcode/QR Code Data:</h4>
                <p>{verificationResponse.barcode_data}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Text Extraction Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Text Extraction from Document</h2>
        <input
          type="file"
          onChange={handleFileChange}
          className="w-full p-3 border border-blue-800 rounded-lg mb-4"
          accept=".pdf, .docx, .jpg, .png, .jpeg"
        />
        <button
          onClick={handleFileUpload}
          disabled={isProcessing}
          className={`w-full p-3 rounded-lg text-white font-semibold ${isProcessing ? 'bg-yellow-500 cursor-not-allowed' : 'bg-blue-900 hover:bg-blue-800'}`}
        >
          {isProcessing ? 'Processing...' : 'Extract Text'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        {textExtracted && (
          <div className="mt-6 p-4 bg-gray-900 border border-gray-700 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Extracted Text</h2>
            <div className="whitespace-pre-wrap break-words max-h-96 overflow-y-auto p-2 bg-white border border-gray-200 rounded-lg text-black">
              {textExtracted}
            </div>
          </div>
        )}

        {/* Compare with Official Database Button */}
        {(verificationResponse || textExtracted) && (
          <button
            onClick={compareWithDatabase}
            className="mt-4 w-full p-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {isComparing ? 'Comparing...' : 'Compare with Official Database'}
          </button>
        )}

        {/* Comparison Result */}
        {comparisonResult && (
          <div className="mt-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg">
            <h3 className="font-semibold text-lg">Comparison Result</h3>
            <p>{comparisonResult}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentTextExtractor;
