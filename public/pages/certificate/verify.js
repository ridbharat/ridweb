document
.getElementById("verifyForm")
.addEventListener("submit", async (e) => {
  e.preventDefault();

  const certificateId = document.getElementById("certificateId").value;

  try {
    const response = await fetch("/verify/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ certificateId }),
    });

    const result = await response.json();
    if (result.message === "Certificate is valid") {
      document.getElementById("result").style.display = "block";
      document.getElementById("result").innerHTML =
        "<strong>Successfully Verified:</strong> <span>certificate is verified, This certificate is valid</span>";
      document.getElementById("infoButton").style.display = "block";

      document.getElementById("popupCertificateId").textContent =
        result.certificate.certificateId;
      document.getElementById("popupInternName").textContent =
        result.certificate.internName;
      document.getElementById("popupIssueDate").textContent =
        result.certificate.issueDate;
      document.getElementById("popupDescription").textContent =
        result.certificate.description;
      document.getElementById("detailCertificatePath").href =
        result.certificate.certificatePath;


      // Clear input field after successful verification
      document.getElementById("certificateId").value = "";

      // Change button text
      document.querySelector("button[type='submit']").textContent =
        "Verify Other Certificate";

      // Hide the success message after 5 seconds (optional)
      setTimeout(() => {
        document.getElementById("result").style.display = "none";
      }, 5000);


    } else {
      document.getElementById("result").style.display = "block";
      document.getElementById("result").style.backgroundColor =
        "#FDE5EA";
      document.getElementById("result").style.borderColor = "#DC143C";
      document.getElementById("result").innerHTML =
        "<strong style='color: red;'>Verification Failed:</strong> <span>Certificate ID is invalid or not found.</span>";
      document.getElementById("infoButton").style.display = "none";
    }
  } catch (error) {
    console.error("Error:", error);
  }
});

document
.getElementById("infoButton")
.addEventListener("click", function () {
  document.getElementById("popup").style.display = "flex";
  document.getElementById("popupBackground").style.display = "block";
  document
    .querySelector(".main-content")
    .classList.add("blur-background");
});

document
.getElementById("closePopup")
.addEventListener("click", function () {
  document.getElementById("popup").style.display = "none";
  document.getElementById("popupBackground").style.display = "none";
  document
    .querySelector(".main-content")
    .classList.remove("blur-background");
});