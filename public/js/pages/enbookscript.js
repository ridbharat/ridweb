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
















// 1. Array of all PDF filenames
const pdfFiles = [
  "JavaScript E-Book.pdf",
  "RID A-Z English Hindi Dictionary E-Book.pdf",
  "Linux E-Book.pdf",
  "HTML Beginner Guide.pdf",
  "CSS3 Mastery.pdf",
  "Python for Beginners.pdf",
  "NodeJS Handbook.pdf",
  "ReactJS Quickstart.pdf",
  "Data Structures in C.pdf",
  "Algorithms Explained.pdf"
];

let pdfList = [];
let pdfUrl = '';

// 2. Function to get URL query parameter
const getQueryParam = (key) => {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
};

// 3. Load URLs from server
async function loadUrls() {
  try {
    const promises = pdfFiles.map(file =>
      fetch(`/ebook/get-url/${encodeURIComponent(file)}`)
        .then(r => r.json())
        .then(d => d.url)
    );
    pdfList = await Promise.all(promises);

    const fileIndex = parseInt(getQueryParam("file")) || 0;
    pdfUrl = pdfList[fileIndex];

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
  } catch (error) {
    console.error("Error loading URLs:", error);
    document.getElementById("pdf-render").innerHTML = "Failed to load PDF URLs.";
  }
}

loadUrls();
