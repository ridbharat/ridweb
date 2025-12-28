const WorkshopApplication = require('../models/workshopmodels');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

// ✅ Assets Paths
const signatureImagePath = path.resolve(__dirname, "../assets/sign.png");
const logo_mywebsite = path.resolve(__dirname, "../assets/logo.jpeg");

// Email Configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD
  }
});

// Format date helper
function formatDate(dateStr) {
  if (!dateStr) return new Date().toLocaleDateString('en-IN');
  const date = new Date(dateStr);
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('en-IN', options);
}

// Generate Application ID
function generateAppId(type) {
  const prefix = type === 'workshop' ? 'RID-WS' : 'RID-TR';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${timestamp}-${random}`;
}

// ✅ 1. Apply for Workshop/Training Certificate
exports.applyCertificate = async (req, res) => {
  try {
    const { fullName, dob, phone, certificateType, duration, durationUnit, email } = req.body;

   

    // Validation
    if (!fullName || !dob || !phone || !certificateType || !duration || !durationUnit || !email) {
      console.log("Validation failed - missing fields");
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate certificate type
    if (!['workshop', 'training'].includes(certificateType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid certificate type'
      });
    }

    // Generate Application ID
    const appId = generateAppId(certificateType);
    // console.log("Generated App ID:", appId);

    // Create application
    const application = new WorkshopApplication({
      appId,
      fullName,
      dob: new Date(dob),
      phone,
      certificateType,
      duration: parseInt(duration),
      durationUnit,
      email,
      status: 'PENDING'
    });

    await application.save();
    console.log("Application saved to database:", appId);

    // Send email to user
    try {
      await sendUserEmail(email, fullName, appId, certificateType);
      console.log("User email sent to:", email);
    } catch (emailError) {
      console.error("User email error:", emailError);
    }

    // Send email to admin
    try {
      await sendAdminEmail(appId, fullName, email, phone, certificateType, duration, durationUnit);
      console.log("Admin email sent");
    } catch (emailError) {
      console.error("Admin email error:", emailError);
    }

    res.status(201).json({
      success: true,
      appId,
      message: 'Application submitted successfully! Check your email for confirmation.'
    });

  } catch (error) {
    console.error('Apply Certificate Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ 2. Verify Application Status
exports.verifyApplication = async (req, res) => {
  try {
    const { appId } = req.params;
    console.log("Verifying App ID:", appId);

    const application = await WorkshopApplication.findOne({ appId });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      application: {
        appId: application.appId,
        fullName: application.fullName,
        dob: application.dob,
        phone: application.phone,
        certificateType: application.certificateType,
        duration: application.duration,
        durationUnit: application.durationUnit,
        email: application.email,
        status: application.status,
        createdAt: application.createdAt,
        verifiedAt: application.verifiedAt
      }
    });

  } catch (error) {
    console.error('Verify Application Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ 3. Admin Verify and Generate PDF
exports.adminVerify = async (req, res) => {
  try {
    const { appId } = req.params;
    console.log("Admin verifying App ID:", appId);

    const application = await WorkshopApplication.findOne({ appId });

    if (!application) {
      return res.status(404).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #dc2626;">❌ Application Not Found</h2>
            <p>Application ID ${appId} does not exist.</p>
            <a href="/verify" style="color: #2563eb;">Go to Verification Page</a>
          </body>
        </html>
      `);
    }

    // Update status
    application.status = 'VERIFIED';
    application.verifiedAt = new Date();
    await application.save();
    

    // Generate PDF Certificate
    const pdfPath = await generateCertificatePDF(application);
    console.log("PDF generated at:", pdfPath);

    // Update certificate path
    application.certificatePath = pdfPath;
    await application.save();

    // Send email to user with certificate
    try {
      await sendCertificateEmail(application, pdfPath);
      console.log("Certificate email sent to user:", application.email);
    } catch (emailError) {
      console.error("Certificate email error:", emailError);
    }

    res.send(`
      <html>
        <head>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px; 
              background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 15px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
              max-width: 600px;
              margin: 0 auto;
            }
            .success { 
              color: #16a34a; 
              font-size: 24px; 
              margin-bottom: 20px; 
            }
            .info { 
              background: #f0fdf4; 
              padding: 20px; 
              border-radius: 10px; 
              margin: 20px 0; 
              text-align: left;
            }
            .btn { 
              display: inline-block; 
              background: linear-gradient(to right, #2563eb, #1d4ed8); 
              color: white; 
              padding: 12px 25px; 
              text-decoration: none; 
              border-radius: 8px; 
              margin: 15px 10px;
              font-weight: 600;
            }
            .btn-secondary {
              background: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">✅ Certificate Verified Successfully!</div>
            <div class="info">
              <p><strong>Application ID:</strong> ${appId}</p>
              <p><strong>Applicant:</strong> ${application.fullName}</p>
              <p><strong>Certificate Type:</strong> ${application.certificateType.toUpperCase()}</p>
              <p><strong>Duration:</strong> ${application.duration} ${application.durationUnit}</p>
              <p>Certificate has been generated and email sent to ${application.email}</p>
            </div>
            <div>
              <a href="/api/workshop/download/${appId}" class="btn">
                📥 Download Certificate
              </a>
              <br>
              <a href="/verify" class="btn btn-secondary" style="margin-top: 15px;">
                🔍 Verify Another Certificate
              </a>
            </div>
          </div>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('Admin Verify Error:', error);
    res.status(500).send(`
      <html>
        <body style="text-align: center; padding: 50px;">
          <h2 style="color: #dc2626;">Server Error</h2>
          <p>Please try again later.</p>
          <a href="/verify" style="color: #2563eb;">Go Back</a>
        </body>
      </html>
    `);
  }
};

// ✅ 4. Download Certificate
exports.downloadCertificate = async (req, res) => {
  try {
    const { appId } = req.params;
    console.log("Download requested for App ID:", appId);

    const application = await WorkshopApplication.findOne({ appId });

    if (!application) {
      return res.status(404).send('Certificate not found');
    }

    if (application.status !== 'VERIFIED') {
      return res.status(403).send(`
        <html>
          <body style="text-align: center; padding: 50px;">
            <h2>Certificate Not Verified Yet</h2>
            <p>Your certificate is still under verification process.</p>
            <p>Status: ${application.status}</p>
            <a href="/verify">Check Status</a>
          </body>
        </html>
      `);
    }

    let filePath = application.certificatePath;
    
    // Generate certificate if not exists
    if (!filePath || !fs.existsSync(filePath)) {
      console.log("Generating new certificate PDF");
      filePath = await generateCertificatePDF(application);
      application.certificatePath = filePath;
      await application.save();
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="RID_${application.certificateType}_${appId}.pdf"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Download Certificate Error:', error);
    res.status(500).send('Error downloading certificate');
  }
};

// ✅ 5. Generate Certificate PDF (Workshop/Training) - UPDATED FOOTER
async function generateCertificatePDF(application) {
  return new Promise((resolve, reject) => {
    try {
      const certsDir = path.join(__dirname, '../certificates');
      if (!fs.existsSync(certsDir)) {
        fs.mkdirSync(certsDir, { recursive: true });
      }

      const filePath = path.join(certsDir, `${application.appId}.pdf`);

      // 🔴 Portrait + single page
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40
      });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;

      /* ================= WATERMARK LOGO ================= */
      if (fs.existsSync(logo_mywebsite)) {
        doc.save();
        doc.opacity(0.08);
        doc.image(
          logo_mywebsite,
          pageWidth / 2 - 180,
          pageHeight / 2 - 180,
          { width: 360 }
        );
        doc.restore();
      }

      /* ================= HEADER ================= */
      doc.fontSize(26)
        .font('Helvetica-Bold')
        .fillColor('#1e3a8a')
        .text('RESEARCH, INNOVATION & DISCOVERY BHARAT', {
          align: 'center'
        });

      doc.moveDown(0.3);
      doc.fontSize(14)
        .fillColor('#4b5563')
        .text('Managed by TWKSAA Welfare Foundation', { align: 'center' });

      doc.moveDown(0.2);
      doc.fontSize(11)
        .fillColor('#6b7280')
        .text('An ISO 9001:2015 Certified Organization', { align: 'center' });

      /* ================= TITLE ================= */
      doc.moveDown(1);
      doc.fontSize(36)
        .font('Helvetica-Bold')
        .fillColor('#dc2626')
        .text('CERTIFICATE', { align: 'center' });

      const certTitle =
        application.certificateType === 'workshop'
          ? 'OF PARTICIPATION'
          : 'OF COMPLETION';

      doc.fontSize(22)
        .fillColor('#1e3a8a')
        .text(certTitle, { align: 'center' });

      /* ================= BODY ================= */
      doc.moveDown(1.2);
      doc.fontSize(15)
        .fillColor('#374151')
        .text('This is to certify that', { align: 'center' });

      doc.moveDown(0.6);
      doc.fontSize(30)
        .font('Helvetica-Bold')
        .fillColor('#166534')
        .text(application.fullName.toUpperCase(), { align: 'center' });

      doc.moveDown(0.8);

      const programText =
        application.certificateType === 'workshop'
          ? 'has actively participated in the Workshop'
          : 'has successfully completed the Training Program';

      doc.fontSize(16)
        .font('Helvetica')
        .fillColor('#374151')
        .text(programText, { align: 'center' });

      const durationText = `${application.duration} ${application.durationUnit}`;
      doc.moveDown(0.4);
      doc.text(`Duration: ${durationText}`, { align: 'center' });

      doc.moveDown(0.6);
      doc.fontSize(14)
        .text(
          'The participant demonstrated dedication, discipline, and enthusiasm throughout the program.',
          { align: 'center' }
        );

      /* ================= SIGNATURE ================= */
      const signY = pageHeight - 210;

      if (fs.existsSync(signatureImagePath)) {
        doc.image(signatureImagePath, 80, signY - 35, { width: 120 });
      }

      doc.strokeColor('#000')
        .lineWidth(1)
        .moveTo(80, signY)
        .lineTo(260, signY)
        .stroke();

      doc.fontSize(12).fillColor('#000')
        .text('Authorized Signatory', 80, signY + 8);

      doc.font('Helvetica-Bold')
        .text('Er. Deepak Kumar', 80, signY + 24);

      doc.font('Helvetica')
        .text('CEO & Director, RID Bharat', 80, signY + 40);

      /* ================= FOOTER (SIGNATURE KE NICHE) ================= */
      doc.moveDown(1);
      doc.fontSize(10)
        .fillColor('#166534')
        .text(
          `Verify at: https://ridbharat.org/verify | Certificate ID: ${application.appId}`,
          0,
          signY + 90,
          { align: 'center' }
        );

      doc.fontSize(9)
        .fillColor('#6b7280')
        .text(
          'Contact: +91 98927 82728 | Email: supportid@gmail.com | Bhopal (MP)',
          { align: 'center' }
        );

      doc.end();

      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);

    } catch (err) {
      reject(err);
    }
  });
}


// ================= EMAIL FUNCTIONS =================

// ✅ Send confirmation email to user
async function sendUserEmail(email, name, appId, type) {
  const mailOptions = {
    from: `"RID Bharat" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USERNAME}>`,
    to: email,
    subject: `Application Received - ${appId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #16a34a;">✅ Application Received Successfully!</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Thank you for applying for ${type} certificate at RID Bharat.</p>
        <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #166534;">📋 Application Details:</h3>
          <p><strong>Application ID:</strong> ${appId}</p>
          <p><strong>Certificate Type:</strong> ${type.toUpperCase()}</p>
          <p><strong>Status:</strong> <span style="color: #d97706;">PENDING VERIFICATION</span></p>
        </div>
        <p>Your application is under review. You'll receive another email once verified.</p>
        <p>You can check status at: <a href="http://localhost:9191/verify">Verify Certificate</a></p>
        <p><strong>Keep your Application ID safe for reference.</strong></p>
        <hr>
        <p style="color: #6b7280; font-size: 14px;">
          Best Regards,<br>
          RID Bharat Team<br>
          TWKSAA Welfare Foundation
        </p>
      </div>
    `
  };

 
  return await transporter.sendMail(mailOptions);
}

// ✅ Send notification email to admin
async function sendAdminEmail(appId, name, email, phone, type, duration, unit) {
  const mailOptions = {
    from: `"RID Bharat" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USERNAME}>`,
    to: process.env.ADMIN_EMAIL || process.env.SMTP_USERNAME,
    subject: `📋 New Application: ${appId}`,
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2 style="color: #dc2626;">📋 New Application Received</h2>
        <div style="background: #fef2f2; padding: 15px; border-radius: 8px;">
          <h3>Applicant Details:</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Application ID:</strong> ${appId}</p>
          <p><strong>Type:</strong> ${type.toUpperCase()}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Duration:</strong> ${duration} ${unit}</p>
        </div>
        <div style="margin: 25px 0; text-align: center;">
          <a href="http://localhost:9191/api/workshop/verify-admin/${appId}" 
             style="background: #16a34a; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; font-weight: bold;">
            ✅ Click to Verify & Issue Certificate
          </a>
        </div>
      </div>
    `
  };

  
  return await transporter.sendMail(mailOptions);
}

// ✅ Send certificate ready email to user
async function sendCertificateEmail(application, pdfPath) {
  const mailOptions = {
    from: `"RID Bharat" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USERNAME}>`,
    to: application.email,
    subject: `✅ Certificate Ready - ${application.appId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #16a34a;">🎉 Your Certificate is Ready!</h2>
        <p>Dear <strong>${application.fullName}</strong>,</p>
        <p>Congratulations! Your ${application.certificateType} certificate has been verified.</p>
        <div style="background: #f0fdf4; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
          <h3 style="color: #166534;">Certificate Details</h3>
          <p><strong>Application ID:</strong> ${application.appId}</p>
          <p><strong>Certificate Type:</strong> ${application.certificateType.toUpperCase()}</p>
          <p><strong>Duration:</strong> ${application.duration} ${application.durationUnit}</p>
          <div style="margin: 25px 0;">
            <a href="http://localhost:9191/api/workshop/download/${application.appId}" 
               style="background: linear-gradient(135deg, #16a34a, #22c55e); 
                      color: white; padding: 15px 30px; text-decoration: none; 
                      border-radius: 8px; font-weight: bold; display: inline-block;">
              📥 Download Certificate (PDF)
            </a>
          </div>
        </div>
        <p>Or visit: <a href="http://localhost:9191/verify">RID Verification Page</a></p>
        <hr>
        <p style="color: #6b7280; font-size: 14px;">
          Best Regards,<br>
          RID Bharat Team
        </p>
      </div>
    `
  };

  return await transporter.sendMail(mailOptions);
}