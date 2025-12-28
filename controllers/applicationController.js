const path = require("path");
const fs = require("fs");
const Application = require("../models/Application");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
// ✅ ALWAYS absolute path
const signatureImagePath = path.resolve(__dirname, "../assets/sign.png");
const stampImagePath = path.resolve(__dirname, "../assets/stamp.png");
const logo_mywebsite = path.resolve(__dirname, "../assets/logo.jpeg");

// 🔍 Debug log (ek baar check kar lena)
console.log("Signature exists:", fs.existsSync(signatureImagePath));
console.log("Stamp exists:", fs.existsSync(stampImagePath));

// nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD
  }
});

// Email sending helper
async function sendMail(to, subject, html) {
  return transporter.sendMail({
    from: `"RID Bharat" <${process.env.SMTP_FROM_EMAIL}>`,
    to,
    subject,
    html
  });
}

// Helper function to format date
function formatDate(dateStr) {
  if (!dateStr) return new Date().toLocaleDateString();
  const date = new Date(dateStr);
  const day = date.getDate();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day}${getOrdinalSuffix(day)} ${month}, ${year}`;
}

function getOrdinalSuffix(day) {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

// Apply Certificate
exports.applyCertificate = async (req, res) => {
  try {
    const {
      fullName, fatherName, dob, course, certificateType,
      phone, email, duration, durationUnit, startDate, endDate, projectName
    } = req.body;

    // Validation
    if (!fullName || !email || !phone || !course || !certificateType || !duration || !durationUnit) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields"
      });
    }

    // Generate unique ID
    const appId = "RIDAPP" + Math.floor(10000000 + Math.random() * 90000000);

    // Save to database with duration and unit
    const newApp = await Application.create({
      appId,
      fullName,
      fatherName,
      dob,
      course,
      certificateType,
      phone,
      email,
      duration,
      durationUnit,
      startDate,
      endDate,
      projectName
    });

    // Send email to user
    const userHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">RID - Application Received Successfully!</h2>
        <p>Dear <strong>${fullName}</strong>,</p>
        <p>Thank you for applying for certificate at RID Bharat.</p>
        <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #166534;">Your Application Details:</h3>
          <p><strong>Application ID:</strong> ${appId}</p>
          <p><strong>Certificate Type:</strong> ${certificateType === 'CERTIFICATE_OF_COMPLETION' ? 'Certificate of Completion' : 'Experience Letter'}</p>
          <p><strong>Course:</strong> ${course}</p>
          <p><strong>Duration:</strong> ${duration} ${durationUnit}</p>
          <p><strong>Status:</strong> <span style="color: #d97706;">PENDING VERIFICATION</span></p>
        </div>
        <p>Your application is under review by admin. You'll receive another email once your certificate is verified.</p>
        <p>You can check your application status at: 
          <a href="${req.protocol}://${req.get('host')}/verify" 
             style="color: #2563eb; text-decoration: none; font-weight: bold;">
            Verify Certificate
          </a>
        </p>
        <p><strong>Keep your Application ID safe for future reference.</strong></p>
        <hr style="margin: 20px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          Best Regards,<br>
          RID Bharat Team<br>
          TWKSAA Welfare Foundation
        </p>
      </div>
    `;

    await sendMail(email, `RID - Application Received (ID: ${appId})`, userHtml);

    // Send email to admin
    const adminHtml = `
      <div style="font-family: Arial, sans-serif;">
        <h2 style="color: #dc2626;">📋 New Certificate Application Received</h2>
        <div style="background: #fef2f2; padding: 15px; border-radius: 8px;">
          <h3>Applicant Details:</h3>
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Application ID:</strong> ${appId}</p>
          <p><strong>Certificate Type:</strong> ${certificateType === 'CERTIFICATE_OF_COMPLETION' ? 'Certificate of Completion' : 'Experience Letter'}</p>
          <p><strong>Course:</strong> ${course}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Project:</strong> ${projectName}</p>
          <p><strong>Duration:</strong> ${duration} ${durationUnit}</p>
          <p><strong>Certificate Type Code:</strong> ${certificateType}</p>
        </div>
        <div style="margin: 25px 0; text-align: center;">
          <a href="${req.protocol}://${req.get('host')}/api/verify-admin/${appId}" 
             style="background: #16a34a; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; font-weight: bold;">
            ✅ Click to Verify & Issue Certificate
          </a>
        </div>
        <p style="color: #6b7280;">This link will verify the application and generate certificate.</p>
      </div>
    `;

    await sendMail(process.env.SMTP_USERNAME, `New Application: ${appId} - ${fullName}`, adminHtml);

    return res.status(201).json({
      success: true,
      appId,
      message: "Application submitted successfully!"
    });
  } catch (err) {
    console.error("applyCertificate error:", err);
    return res.status(500).json({
      success: false,
      error: "Server error. Please try again."
    });
  }
};

// Admin Verify
exports.adminVerify = async (req, res) => {
  try {
    const { appId } = req.params;

    const app = await Application.findOne({ appId });

    if (!app) {
      return res.status(404).send(`
        <div style="text-align: center; padding: 50px;">
          <h2 style="color: #dc2626;">❌ Application Not Found</h2>
          <p>Application ID ${appId} does not exist.</p>
          <a href="/verify" style="color: #2563eb;">Go to Verification Page</a>
        </div>
      `);
    }

    // Update status
    app.status = "VERIFIED";
    app.verifiedAt = new Date();
    await app.save();

    // Generate certificate PDF based on certificate type
    const certsDir = path.join(__dirname, "../certificates");
    if (!fs.existsSync(certsDir)) {
      fs.mkdirSync(certsDir, { recursive: true });
    }
    const filePath = path.join(certsDir, `${appId}.pdf`);

    // Choose certificate type based on certificateType field
    if (app.certificateType === 'CERTIFICATE_OF_COMPLETION') {
      await generateCompletionCertificatePDF(app, filePath);
    } else if (app.certificateType === 'EXPERIENCE_LETTER') {
      await generateExperienceLetterPDF(app, filePath);
    } else {
      // Default to completion certificate
      await generateCompletionCertificatePDF(app, filePath);
    }

    // Send email to user about verification
    const userHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">🎉 Your Certificate is Verified!</h2>
        <p>Dear <strong>${app.fullName}</strong>,</p>
        <p>Congratulations! Your certificate has been verified and is now ready for download.</p>
        <div style="background: #f0fdf4; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
          <h3 style="color: #166534;">Certificate Details</h3>
          <p><strong>Application ID:</strong> ${appId}</p>
          <p><strong>Certificate Type:</strong> ${app.certificateType === 'CERTIFICATE_OF_COMPLETION' ? 'Certificate of Completion' : 'Experience Letter'}</p>
          <p><strong>Course:</strong> ${app.course}</p>
          <p><strong>Project:</strong> ${app.projectName}</p>
          <p><strong>Duration:</strong> ${app.duration} ${app.durationUnit || 'weeks'}</p>
          <div style="margin: 25px 0;">
            <a href="${req.protocol}://${req.get('host')}/api/download/${appId}" 
               style="background: linear-gradient(135deg, #16a34a, #22c55e); 
                      color: white; padding: 15px 30px; text-decoration: none; 
                      border-radius: 8px; font-weight: bold; display: inline-block;">
              📥 Download Certificate (PDF)
            </a>
          </div>
          <p>Or visit: <a href="${req.protocol}://${req.get('host')}/verify">RID Verification Page</a></p>
        </div>
        <p><strong>Note:</strong> You can also download your certificate by entering your Application ID on the verification page.</p>
        <hr>
        <p style="color: #6b7280; font-size: 14px;">
          Best Regards,<br>
          RID Bharat Team
        </p>
      </div>
    `;

    await sendMail(app.email, `✅ Certificate Verified - ${appId}`, userHtml);

    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificate Verified</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .success { color: #16a34a; font-size: 24px; }
          .info { background: #f0fdf4; padding: 20px; border-radius: 10px; margin: 20px auto; max-width: 500px; }
        </style>
      </head>
      <body>
        <div class="success">✅ Application Verified Successfully!</div>
        <div class="info">
          <p><strong>Application ID:</strong> ${appId}</p>
          <p><strong>Applicant:</strong> ${app.fullName}</p>
          <p><strong>Certificate Type:</strong> ${app.certificateType === 'CERTIFICATE_OF_COMPLETION' ? 'Certificate of Completion' : 'Experience Letter'}</p>
          <p>Certificate has been generated and email sent to ${app.email}</p>
          <p><a href="/verify">Go to Verification Page</a></p>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error("adminVerify error:", err);
    return res.status(500).send(`
      <div style="text-align: center; padding: 50px;">
        <h2 style="color: #dc2626;">Server Error</h2>
        <p>Please try again later.</p>
      </div>
    `);
  }
};

// Verify by ID
exports.verifyById = async (req, res) => {
  try {
    const { appId } = req.params;
    const app = await Application.findOne({ appId });

    if (!app) {
      return res.status(404).json({
        success: false,
        message: "Invalid Application ID"
      });
    }

    return res.json({
      success: true,
      status: app.status,
      applicationId: app.appId,
      name: app.fullName,
      fatherName: app.fatherName,
      dob: app.dob,
      course: app.course,
      certificateType: app.certificateType,
      duration: app.duration,
      durationUnit: app.durationUnit,
      startDate: app.startDate,
      endDate: app.endDate,
      projectName: app.projectName,
      email: app.email
    });
  } catch (err) {
    console.error("verifyById error:", err);
    return res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};

// Download Certificate
exports.downloadCertificate = async (req, res) => {
  try {
    const { appId } = req.params;
    const app = await Application.findOne({ appId });

    if (!app) {
      return res.status(404).send("Certificate not found");
    }

    if (app.status !== "VERIFIED") {
      return res.status(403).send(`
        <div style="text-align: center; padding: 50px;">
          <h2>Certificate Not Verified Yet</h2>
          <p>Your certificate is still under verification process.</p>
          <p>Status: ${app.status}</p>
          <a href="/verify">Check Status</a>
        </div>
      `);
    }

    const filePath = path.join(__dirname, `../certificates/${appId}.pdf`);

    if (!fs.existsSync(filePath)) {
      // Generate based on certificate type
      if (app.certificateType === 'CERTIFICATE_OF_COMPLETION') {
        await generateCompletionCertificatePDF(app, filePath);
      } else if (app.certificateType === 'EXPERIENCE_LETTER') {
        await generateExperienceLetterPDF(app, filePath);
      } else {
        await generateCompletionCertificatePDF(app, filePath);
      }
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="RID_${app.certificateType === 'CERTIFICATE_OF_COMPLETION' ? 'Certificate' : 'ExperienceLetter'}_${appId}.pdf"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (err) {
    console.error("downloadCertificate error:", err);
    res.status(500).send("Error downloading certificate");
  }
};

// Generate Completion Certificate PDF - Single page with border
async function generateCompletionCertificatePDF(app, filePath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 40
      });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // ================= PATHS =================
      const logo_mywebsite = path.resolve(__dirname, "../assets/logo.jpeg");
      const signatureImagePath = path.resolve(__dirname, "../assets/sign.png");
      const stampImagePath = path.resolve(__dirname, "../assets/Stamp.png");

      // ================= PAGE SAFE AREA =================
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const safeLeft = 60;
      const safeRight = pageWidth - 60;
      const usableWidth = safeRight - safeLeft;

      // ================= COLORS =================
      const primaryColor = '#000000';
      const secondaryColor = '#666666';
      const accentColor = '#2c3e50';
      const certificateColor = '#166534';

      // ================= BORDERS =================
      doc.lineWidth(2);
      doc.strokeColor('#16a34a');
      doc.rect(30, 30, pageWidth - 60, pageHeight - 60).stroke();

      doc.lineWidth(1);
      doc.strokeColor('#cccccc');
      doc.rect(35, 35, pageWidth - 70, pageHeight - 70).stroke();

      // ================= WATERMARK =================
      if (fs.existsSync(logo_mywebsite)) {
        doc.save();
        doc.opacity(0.08);
        doc.image(
          logo_mywebsite,
          (pageWidth - 300) / 2,
          (pageHeight - 300) / 2,
          { width: 300 }
        );
        doc.restore();
      }

      // ================= DURATION =================
      const durationValue = app.duration || "0";
      const durationUnit = app.durationUnit || "weeks";
      const startDate = formatDate(app.startDate);
      const endDate = formatDate(app.endDate);

      // ================= HEADER =================
      doc.fillColor(secondaryColor).fontSize(10)
        .text('Registration Number: 048884', safeLeft, 60);

      doc.text('Website: www.ridbharat.com', 0, 60, { align: 'right' });

      doc.fillColor(accentColor).fontSize(22).font('Helvetica-Bold')
        .text('Research, Innovation & Discovery Bharat', 0, 90, { align: 'center' });

      doc.fontSize(14)
        .text('RID Organization, Provides Solutions for Every Problem', 0, 115, { align: 'center' });

      doc.fillColor(secondaryColor).fontSize(10)
        .text('Managed & Run by TWKSAA Welfare Foundation, Certified by Central Government', 0, 140, { align: 'center' });

      doc.text('An ISO 9001:2015 Certified Organization', 0, 155, { align: 'center' });

      doc.strokeColor('#cccccc').lineWidth(1)
        .moveTo(safeLeft, 170)
        .lineTo(pageWidth - safeLeft, 170)
        .stroke();

      const issueDate = formatDate(new Date());
      doc.fillColor(primaryColor).fontSize(11)
        .text(`Issue Date: ${issueDate}`, safeLeft, 190);

      doc.text(`Certificate Number: ${app.appId}`, 0, 190, { align: 'right' });

      doc.fillColor(certificateColor).fontSize(11).font('Helvetica-Bold')
        .text(
          `Duration: ${durationValue} ${durationUnit} (${startDate} to ${endDate})`,
          0,
          210,
          { align: 'center' }
        );

      // ================= TITLE =================
      doc.fontSize(28).font('Helvetica-Bold')
        .text('CERTIFICATE OF COMPLETION', 0, 240, { align: 'center' });

      // ================= BODY =================
      doc.fillColor(primaryColor).fontSize(14)
        .text('This is to certify that', 0, 290, { align: 'center' });

      doc.fillColor(certificateColor).fontSize(24).font('Helvetica-Bold')
        .text(app.fullName.toUpperCase(), 0, 320, { align: 'center' });

      doc.fillColor(primaryColor).fontSize(14)
        .text(`Son/Daughter of ${app.fatherName}`, 0, 350, { align: 'center' });

      // 🔧 INSIDE BORDER FIX
      doc.text(
        `has successfully completed the ${app.course} course`,
        safeLeft,
        390,
        { width: usableWidth, align: 'center' }
      );

      doc.text(
        `with project "${app.projectName}"`,
        safeLeft,
        410,
        { width: usableWidth, align: 'center' }
      );

      doc.text(
        `Duration: ${durationValue} ${durationUnit} (${startDate} to ${endDate})`,
        0,
        440,
        { align: 'center' }
      );

      doc.fontSize(12)
        .text(
          'has demonstrated dedication, hard work and excellence throughout the course.',
          safeLeft,
          480,
          { width: usableWidth, align: 'center' }
        );

      doc.text(
        'This certificate is awarded in recognition of successful completion of the training program.',
        safeLeft,
        500,
        { width: usableWidth, align: 'center' }
      );

      // ================= SIGNATURE =================
      const signatureY = 600;
      const names = ["Er. Rajesh Prasad"];
      const randomName = names[Math.floor(Math.random() * names.length)];

      if (fs.existsSync(signatureImagePath)) {
        doc.image(signatureImagePath, 100, signatureY - 40, { width: 120 });
      }

      doc.fillColor(primaryColor).fontSize(12)
        .text('Authorized Signatory', 100, signatureY + 20);

      doc.fontSize(14).font('Helvetica-Bold')
        .text(randomName, 100, signatureY + 40);

      doc.fontSize(12)
        .text('CEO & Director', 100, signatureY + 60);

      doc.text('RID Bharat, Bhopal', 100, signatureY + 75);

      doc.strokeColor('#000').lineWidth(1)
        .moveTo(100, signatureY + 30)
        .lineTo(300, signatureY + 30)
        .stroke();

      if (fs.existsSync(stampImagePath)) {
        doc.image(stampImagePath, pageWidth - 190, signatureY - 10, { width: 100 });
      }

      doc.fillColor(secondaryColor).fontSize(10)
        .text('Official Stamp & Seal', pageWidth - 200, signatureY + 80, {
          width: 150,
          align: 'center'
        });

      // ================= FOOTER (100% FIXED) =================
      const FOOTER_Y = pageHeight - 120;

      doc.strokeColor('#cccccc').lineWidth(0.5)
        .moveTo(safeLeft, FOOTER_Y)
        .lineTo(pageWidth - safeLeft, FOOTER_Y)
        .stroke();

      doc.fillColor(accentColor).fontSize(10).font('Helvetica-Bold')
        .text(
          'Digitally Signed & Verified',
          safeLeft,
          FOOTER_Y + 10,
          { width: usableWidth, align: 'center', lineBreak: false }
        );

      doc.text(
        'Research, Innovation & Discovery Bharat (RID Bharat)',
        safeLeft,
        FOOTER_Y + 25,
        { width: usableWidth, align: 'center', lineBreak: false }
      );

      doc.fillColor(certificateColor).fontSize(9)
        .text(
          `Verify this certificate at: rid-bharat.org/verify | Certificate ID: ${app.appId}`,
          safeLeft,
          FOOTER_Y + 40,
          { width: usableWidth, align: 'center', lineBreak: false }
        );

      doc.fillColor(secondaryColor).fontSize(8)
        .text(
          'Office Address: MiG–72, Sector A, Rajeev Nagar, Ayodhya Nagar, Bhopal, Madhya Pradesh 462021 (India)',
          safeLeft,
          FOOTER_Y + 55,
          { width: usableWidth, align: 'center', lineBreak: false }
        );

      doc.text(
        'Contact: +91 98927 82728 | Email: supportid@gmail.com',
        safeLeft,
        FOOTER_Y + 70,
        { width: usableWidth, align: 'center', lineBreak: false }
      );

      doc.end();

      stream.on("finish", () => resolve(true));
      stream.on("error", reject);

    } catch (err) {
      reject(err);
    }
  });
}




// Generate Experience Letter PDF - User entered duration as is
async function generateExperienceLetterPDF(app, filePath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // ================= PATHS =================
      const signatureImagePath = path.resolve(__dirname, "../assets/sign.png");
      const stampImagePath = path.resolve(__dirname, "../assets/Stamp.png");

      // ================= PAGE SETUP =================
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const safeLeft = 60;
      const safeRight = pageWidth - 60;
      const usableWidth = safeRight - safeLeft;

      // ================= COLORS =================
      const primaryColor = "#000000";
      const secondaryColor = "#666666";
      const accentColor = "#2c3e50";

      // ================= BORDER =================
      doc.lineWidth(2).strokeColor("#16a34a")
        .rect(30, 30, pageWidth - 60, pageHeight - 60).stroke();
      doc.lineWidth(1).strokeColor("#cccccc")
        .rect(35, 35, pageWidth - 70, pageHeight - 70).stroke();

      // ================= DATES =================
      const durationValue = app.duration || "0";
      const durationUnit = app.durationUnit || "months";
      const startDate = formatDate(app.startDate);
      const endDate = formatDate(app.endDate);
      const issueDate = formatDate(new Date());

      // ================= HEADER =================
      doc.fillColor(secondaryColor).fontSize(10)
        .text("Registration Number: 048884", safeLeft, 60);
      doc.text("Website: www.ridbharat.com", 0, 60, { align: "right" });

      doc.fillColor(accentColor).fontSize(22).font("Helvetica-Bold")
        .text("Research, Innovation & Discovery Bharat", 0, 90, { align: "center" });

      doc.fontSize(14)
        .text("RID Organization, Provides Solutions for Every Problem", 0, 115, { align: "center" });

      doc.fontSize(10).fillColor(secondaryColor)
        .text("Managed & Run by TWKSAA Welfare Foundation, Certified by Central Government", 0, 140, { align: "center" });

      doc.text("An ISO 9001:2015 Certified Organization", 0, 155, { align: "center" });

      doc.moveTo(safeLeft, 170).lineTo(safeRight, 170).stroke();

      doc.fillColor(primaryColor).fontSize(11)
        .text(`Issue Date: ${issueDate}`, safeLeft, 190);
      doc.text(`IEL Number: ${app.appId}`, 0, 190, { align: "right" });

      doc.fillColor(accentColor).font("Helvetica-Bold")
        .text(
          `Internship Duration: ${durationValue} ${durationUnit} (${startDate} to ${endDate})`,
          0,
          210,
          { align: "center" }
        );

      // ================= TITLE =================
      doc.fontSize(26).font("Helvetica-Bold")
        .text("INTERNSHIP EXPERIENCE LETTER", 0, 245, { align: "center" });

      // ================= BODY =================
      doc.fontSize(12).fillColor(primaryColor)
        .text(
          `To: ${app.fullName}, S/O ${app.fatherName}, Bhopal, Madhya Pradesh`,
          safeLeft,
          300,
          { width: usableWidth, align: "center" }
        );

      doc.text(
        `This is to certify that ${app.fullName} has successfully completed an internship with Research, Innovation & Discovery Bharat (RID Bharat) from ${startDate} to ${endDate}.`,
        safeLeft,
        340,
        { width: usableWidth, align: "center" }
      );

      // ✅ ONE LINE GAP AFTER END DATE
      doc.moveDown(1);

      doc.text(
        `During the internship tenure, ${app.fullName} was actively involved in the project titled "${app.projectName}". The intern demonstrated sincerity, discipline, adaptability, and a strong sense of responsibility while performing assigned tasks.`,
        safeLeft,
        doc.y,
        { width: usableWidth, align: "center" }
      );

      doc.text(
        `Throughout the program, ${app.fullName} displayed a positive learning attitude, technical understanding, and the ability to work efficiently both independently and within a team environment.`,
        safeLeft,
        doc.y,
        { width: usableWidth, align: "center" }
      );

      // ✅ ONE LINE GAP AFTER "team environment."
      doc.moveDown(1);

      doc.text(
        `We appreciate the dedication and efforts shown and wish ${app.fullName} great success in all future academic and professional endeavors.`,
        safeLeft,
        doc.y,
        { width: usableWidth, align: "center" }
      );

      // ================= SIGNATURE =================
      const signatureY = pageHeight - 240;

      doc.fontSize(12).text("Best Regards,", safeLeft, signatureY);

      if (fs.existsSync(signatureImagePath)) {
        doc.image(signatureImagePath, safeLeft, signatureY + 20, { width: 130 });
      }

      doc.fontSize(14).font("Helvetica-Bold")
        .text("Er. Deepak Kumar", safeLeft, signatureY + 75);

      doc.fontSize(12)
        .text("CEO & Director", safeLeft, signatureY + 95);

      doc.text("RID Bharat, Bhopal", safeLeft, signatureY + 110);

      // ================= FOOTER =================
      const footerY = pageHeight - 100;

      doc.moveTo(safeLeft, footerY).lineTo(safeRight, footerY).stroke();

      doc.fontSize(8).fillColor(secondaryColor)
        .text(
          "Office Address: MiG–72, Sector A, Rajeev Nagar, Ayodhya Nagar, Bhopal, Madhya Pradesh 462021 (India)",
          safeLeft,
          footerY + 10,
          { width: usableWidth, align: "center", lineBreak: false }
        );

      doc.text(
        "Contact: +91 98927 82728 | Email: supportid@gmail.com",
        safeLeft,
        footerY + 25,
        { width: usableWidth, align: "center", lineBreak: false }
      );

      // ================= STAMP =================
      if (fs.existsSync(stampImagePath)) {
        doc.image(stampImagePath, safeRight - 90, signatureY + 30, { width: 90 });
      }

      doc.end();

      stream.on("finish", () => resolve(true));
      stream.on("error", reject);

    } catch (err) {
      reject(err);
    }
  });
}
