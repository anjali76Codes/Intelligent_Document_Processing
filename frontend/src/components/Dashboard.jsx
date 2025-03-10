import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaClock, FaPercentage } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom'; // Import Link for navigation
import data from '../data/data.json'; // Import the data directly if it's available locally
import axios from 'axios';

const Dashboard = () => {
  const [chartData, setChartData] = useState(data);
  const [selectedFile, setSelectedFile] = useState(null);
  const [docInfo, setDocInfo] = useState(null); // To store extracted document information
  const [isModalOpen, setIsModalOpen] = useState(false); // To manage modal visibility
  const [isLoading, setIsLoading] = useState(false); // To manage loading state

  const summaryStats = {
    totalDocuments: chartData.reduce((total, day) => total + day.documentsProcessed, 0),
    invoiceDocs: chartData.reduce((total, day) => total + day.documentTypeDistribution.Invoice, 0),
    receiptDocs: chartData.reduce((total, day) => total + day.documentTypeDistribution.Receipt, 0),
    contractDocs: chartData.reduce((total, day) => total + day.documentTypeDistribution.Contract, 0),
    otherDocs: chartData.reduce((total, day) => total + day.documentTypeDistribution.Other, 0),
    performance: chartData.length > 0
      ? ((chartData.reduce((total, day) => total + day.performance, 0) / chartData.length).toFixed(2))
      : 0
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);

    // Predefined document information
    const predefinedDocInfo = {
      format: 'JPEG', // Example format
      fontSize: '12px', // Example font size
      numParagraphs: 3, // Example number of paragraphs
      textSnippet: 'This is a snippet of the text content from the uploaded file, showing the beginning of the document.'
    };

    // Simulate a delay (for example, if you want to mimic the time it would take to process the file)
    setTimeout(() => {
      setDocInfo(predefinedDocInfo);
    }, 500);
  };

  const handleTrainModel = () => {
    // Show loading message
    setIsLoading(true);

    // Simulate loading for 2 seconds before showing the modal
    setTimeout(() => {
      setIsLoading(false);
      setIsModalOpen(true); // Show the modal after loading
    }, 2000);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800">Enterprise Dashboard</h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[{ title: 'Total Documents', value: summaryStats.totalDocuments, icon: <FaCheckCircle className="text-purple-500" /> },
        { title: 'Invoices', value: summaryStats.invoiceDocs, icon: <FaTimesCircle className="text-green-500" /> },
        { title: 'Receipts', value: summaryStats.receiptDocs, icon: <FaClock className="text-yellow-500" /> },
        { title: 'Performance', value: `${summaryStats.performance}%`, icon: <FaPercentage className="text-blue-500" /> }].map(({ title, value, icon }) => (
          <div key={title} className="bg-white p-4 shadow-md rounded-lg flex items-center space-x-4">
            <div className="text-3xl">{icon}</div>
            <div>
              <p className="text-gray-500 text-sm">{title}</p>
              <p className="text-xl font-semibold text-gray-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Route Buttons */}
      <div className="grid grid-cols-2 gap-6 mt-6">
        <Link to="/extract-text">
          <button className="bg-blue-900 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transsition-all ease-in-out duration-0.3s shadow-lg">
            Go to Document Text Extractor
          </button>
        </Link>

        <Link to="/bank-statement">
          <button className="bg-blue-900 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transsition-all ease-in-out duration-0.3s shadow-lg">
            Go to Bank Statement
          </button>
        </Link>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-4 shadow-md rounded-lg">
          <h3 className="text-lg font-semibold">Documents Processed Each Day</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="documentsProcessed" fill="#800080" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 shadow-md rounded-lg">
          <h3 className="text-lg font-semibold">Model Identified Document Types</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={[{ name: 'Invoice', value: summaryStats.invoiceDocs },
              { name: 'Receipt', value: summaryStats.receiptDocs },
              { name: 'Contract', value: summaryStats.contractDocs },
              { name: 'Other', value: summaryStats.otherDocs }]}
                dataKey="value" cx="50%" cy="50%" outerRadius={80}>
                <Cell fill="#4CAF50" />
                <Cell fill="#FF9800" />
                <Cell fill="#2196F3" />
                <Cell fill="#9C27B0" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 shadow-md rounded-lg">
          <h3 className="text-lg font-semibold">Performance Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="performance" stroke="#FFBB28" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="bg-white p-6 shadow-md rounded-lg mt-6">
        <h3 className="text-lg font-semibold mb-4">Upload Document for Verification</h3>

        {/* File Upload Area */}
        <div className="flex items-center justify-center border-2 border-dashed border-gray-300 p-8 rounded-lg hover:bg-gray-50 transition-colors">
          <input
            type="file"
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            className="absolute opacity-0 cursor-pointer"
          />
          <div className="text-center text-gray-500 space-y-4">
            <p className="text-lg">Drag and drop a file here, or click to select one.</p>
            <p className="text-sm">Accepted formats: PDF, DOC, DOCX, JPG, JPEG, PNG</p>
          </div>
        </div>

        {/* Show File Details */}
        {selectedFile && (
          <div className="mt-6 flex space-x-6">
            {/* File Preview */}
            <div className="w-1/4 p-4 border border-gray-300 rounded-lg flex justify-center items-center bg-gray-50">
              {selectedFile.type.includes("image") ? (
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Selected File"
                  className="w-full h-auto object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-600">
                  <p className="text-sm">{selectedFile.name}</p>
                  <p className="text-xs text-gray-400">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                </div>
              )}
            </div>

            {/* Document Information */}
            <div className="w-3/4 p-4 border border-gray-300 rounded-lg space-y-4">
              {docInfo ? (
                <>
                  <p><strong>Format:</strong> {docInfo.format}</p>
                  <p><strong>Font Size:</strong> {docInfo.fontSize}</p>
                  {/* <p><strong>Number of Paragraphs:</strong> {docInfo.numParagraphs}</p>
                  <p><strong>Text Content:</strong> {docInfo.textSnippet}</p> */}
                </>
              ) : (
                <p className="text-gray-600">Waiting for document information...</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Train Model Button */}
      <div className="bg-white p-6 shadow-md rounded-lg mt-6 text-center">
        <button
          onClick={handleTrainModel}
          disabled={!selectedFile}  // Disable button if no file is uploaded
          className={`${!selectedFile ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
            } text-white px-6 py-3 rounded-lg shadow-lg`}
        >
          {selectedFile ? "Train Model" : "Upload a file to train the model"}  {/* Change text based on file upload */}
        </button>
      </div>

      {/* Modal for "Train Model" */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-1/3">
            <h3 className="text-xl font-semibold mb-4">The model will be trained, and we will update you soon!</h3>
            <button
              onClick={closeModal}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Training the model... Please wait.</h3>
            <div className="loader"></div> {/* Add a loading spinner or animation */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
