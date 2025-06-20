import React from "react";

const PdfViewer = ({ pdfUrl }) => {
  console.log("Loading PDF:", pdfUrl); 

  return (
    <iframe
      src={pdfUrl}
      style={{ width: "100%", height: "100vh" }}
      frameBorder="0"
      title="PDF Viewer"
    />
  );
};

export default PdfViewer;
