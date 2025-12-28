var notImpContent = document.getElementById("notImp");
var borderRem = document.getElementById("borderRem");
var headerBTN = document.getElementById("headerBTN");

function btnClose() {
  borderRem.style.display = "none";
}
function btnOpen() {
  borderRem.style.display = "flex";
}

function headerhide() {
  headerBTN.innerHTML = "check_box_outline_blank";
  notImpContent.style.display = "block";
  borderRem.style.borderTop = "1px solid #ddd";
}
function headershow() {
  headerBTN.innerHTML = "check_box";
  notImpContent.style.display = "none";
  borderRem.style.border = "none";
  borderRem.style.padding = "16px 0";
}

function awakeAction() {
  if (headerBTN.innerHTML === "check_box") {
    headerhide();
  } else {
    headershow();
  }
}
















// 1. Array of all PDF file paths
const pdfList = [
  "../ebookdata/JavaScript E-Book.pdf",
  "../ebookdata/RID A-Z English Hindi Dictionary E-Book.pdf",
  "../ebookdata/Linux E-Book.pdf",
  "../ebookdata/HTML Beginner Guide.pdf",
  "../ebookdata/CSS3 Mastery.pdf",
  "../ebookdata/Python for Beginners.pdf",
  "../ebookdata/NodeJS Handbook.pdf",
  "../ebookdata/ReactJS Quickstart.pdf",
  "../ebookdata/Data Structures in C.pdf",
  "../ebookdata/Algorithms Explained.pdf"
];

// 2. Function to get URL query parameter
const getQueryParam = (key) => {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
};

// 3. Get index from query string
const fileIndex = parseInt(getQueryParam("file")) || 0;
const pdfUrl = pdfList[fileIndex];

if (!pdfUrl || fileIndex >= pdfList.length) {
  document.getElementById("pdf-render").innerHTML = "Invalid or missing PDF file selection.";
} else {
  // PDF.js loading code
  pdfjsLib.getDocument(pdfUrl).promise
    .then((doc) => {
      pdfDoc = doc;
      updatePageInfo();
      renderPage(pageNum);
      document.getElementById("download-btn").style.display = "inline-block";
    })
    .catch((err) => {
      console.error("Error loading PDF:", err);
      pdfRender.innerHTML = "Failed to load PDF. Please check the file path or try again.";
    });
}
