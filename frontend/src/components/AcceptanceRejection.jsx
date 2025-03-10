import React, { useState, useEffect } from 'react';

const AcceptanceRejection = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openUser, setOpenUser] = useState(null);
  const [editMode, setEditMode] = useState(null);  // Track edit mode for document status

  useEffect(() => {
    fetch('/data/dummyData.json') // Fetching the dummy data from public folder
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error loading dummy data:", error);
        setIsLoading(false);
      });
  }, []);

  const handleDocumentStatusChange = (userId, documentId, newStatus) => {
    const updatedData = data.map((user) => {
      if (user.id === userId) {
        const updatedDocuments = user.documents.map((document) =>
          document.id === documentId ? { ...document, status: newStatus } : document
        );
        return { ...user, documents: updatedDocuments };
      }
      return user;
    });
    setData(updatedData);
  };

  const toggleUserDocuments = (userId) => {
    setOpenUser(openUser === userId ? null : userId); // Toggle dropdown
  };

  const handleDocumentPreview = (file) => {
    if (file.endsWith('.pdf')) {
      window.open(file, '_blank');  // Open PDF in a new tab
    } else if (file.endsWith('.jpg') || file.endsWith('.png')) {
      const newWindow = window.open();
      newWindow.document.write(`<img src="${file}" style="width: 100%; height: auto;" />`);  // Open image in a new tab
    } else {
      alert("Unsupported file type");
    }
  };

  const toggleEditMode = (docId) => {
    setEditMode(editMode === docId ? null : docId);  // Toggle between showing "Modify" and "Accept/Reject" buttons
  };

  if (isLoading) {
    return <div className="text-center text-blue-800">Loading...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 h-full">
      <h2 className="text-3xl font-semibold text-blue-800 mb-6">Acceptance and Rejection of Documents</h2>

      {/* User Details Table */}
      <table className="w-full table-auto border-collapse text-left">
        <thead>
          <tr>
            <th className="p-2 border border-blue-200 text-blue-800">Name</th>
            <th className="p-2 border border-blue-200 text-blue-800">Email</th>
            <th className="p-2 border border-blue-200 text-blue-800">Phone</th>
            <th className="p-2 border border-blue-200 text-blue-800">Documents</th>
          </tr>
        </thead>
        <tbody>
          {data.map((user) => (
            <tr key={user.id} className="hover:bg-blue-100">
              <td className="p-2 border border-blue-200">{user.user}</td>
              <td className="p-2 border border-blue-200">{user.email}</td>
              <td className="p-2 border border-blue-200">{user.phone}</td>
              <td className="p-2 border border-blue-200">
                <button
                  onClick={() => toggleUserDocuments(user.id)}
                  className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-700"
                >
                  {openUser === user.id ? 'Hide Documents' : 'Show Documents'}
                </button>

                <div
                  className={`transition-all duration-500 ease-in-out mt-4 overflow-hidden ${openUser === user.id ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                >
                  {user.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center mb-4">
                      <div className="flex-1 pr-4">
                        <p className="font-semibold text-blue-800">{doc.type}</p>
                        <button
                          onClick={() => handleDocumentPreview(doc.file)}
                          className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-700"
                        >
                          View Document
                        </button>
                      </div>
                      <div className="flex-1">
                        <p className="text-blue-800">Status: {doc.status}</p>
                        <div className="mt-2 flex space-x-4">
                          {editMode === doc.id ? (
                            <>
                              <button
                                onClick={() => handleDocumentStatusChange(user.id, doc.id, 'Accepted')}
                                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-400"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleDocumentStatusChange(user.id, doc.id, 'Rejected')}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-400"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => toggleEditMode(doc.id)}
                              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-400 transition-all duration-500 ease-in-out"
                            >
                              Modify
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AcceptanceRejection;
