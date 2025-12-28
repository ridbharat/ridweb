const pdfUrl = "../ebookdata/HTML E-BOOK.pdf"; // Replace with your PDF path
let pdfDoc = null;
let pageNum = 1;
let pageIsRendering = false;
let pageNumPending = null;

const scale = 1.5; // Adjust zoom level

const pdfRender = document.getElementById("pdf-render");
const loadingIndicator = document.getElementById("loading");

// Render the page
const renderPage = async (num) => {
  pageIsRendering = true;
  loadingIndicator.style.display = "block";
  pdfRender.innerHTML = ""; // Clear previous canvas

  // Get page
  try {
    const page = await pdfDoc.getPage(num);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;
    pdfRender.appendChild(canvas);

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
    };

    await page.render(renderContext).promise;

    // Page rendered
    pageIsRendering = false;
    loadingIndicator.style.display = "none";

    if (pageNumPending !== null) {
      renderPage(pageNumPending);
      pageNumPending = null;
    }
  } catch (err) {
    console.error("Error rendering page:", err);
    pdfRender.innerHTML =
      "Failed to render page. Please check the file path or try again.";
    pageIsRendering = false;
    loadingIndicator.style.display = "none";
  }
};

// Queue page rendering
const queueRenderPage = (num) => {
  if (pageIsRendering) {
    pageNumPending = num;
  } else {
    renderPage(num);
  }
};

// Show previous page
const showPrevPage = () => {
  if (pageNum <= 1) return;
  pageNum--;
  queueRenderPage(pageNum);
  updatePageInfo();
};

// Show next page
const showNextPage = () => {
  if (pageNum >= pdfDoc.numPages) return;
  pageNum++;
  queueRenderPage(pageNum);
  updatePageInfo();
};

// Update page info
const updatePageInfo = () => {
  document.getElementById("page-num").textContent = pageNum;
  document.getElementById("page-count").textContent = pdfDoc.numPages;
};

// Download the PDF file
const downloadPDF = () => {
  const link = document.createElement("a");
  link.href = pdfUrl;
  link.download = pdfUrl.split("/").pop(); // Get the file name from the URL
  link.click();
};

// Get the document
pdfjsLib
  .getDocument(pdfUrl)
  .promise.then((doc) => {
    pdfDoc = doc;
    updatePageInfo();
    renderPage(pageNum);
    document.getElementById("download-btn").style.display = "inline-block"; // Show the download button
  })
  .catch((err) => {
    console.error("Error loading PDF:", err);
    pdfRender.innerHTML =
      "Failed to load PDF. Please check the file path or try again.";
  });

// Button event listeners
document.getElementById("prev-page").addEventListener("click", showPrevPage);
document.getElementById("next-page").addEventListener("click", showNextPage);
