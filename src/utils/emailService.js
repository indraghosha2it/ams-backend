const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port: parseInt(process.env.SMTP_PORT) || 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || 'appointment@doctorappointment.a2itltd.com',
        pass: process.env.SMTP_PASSWORD || '', // Add your SMTP password in .env
      },
      tls: {
        rejectUnauthorized: false // Only for development if SSL issues
      }
    });
  }

  // Send appointment confirmation email
// In src/utils/emailService.js
async sendAppointmentConfirmation(appointmentData) {
  try {
    const { 
      patient, 
      doctor, 
      appointmentDate, 
      appointmentTime, 
      slotSerialNumber,
      appointmentId 
    } = appointmentData;
    
    console.log('📧 Preparing appointment confirmation email...');
    console.log('- Patient:', patient.email);
    console.log('- Sender CC:', process.env.SMTP_USER);
    console.log('- Serial Number:', slotSerialNumber);
    
    // Format appointment date
    const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Create mail options
    const mailOptions = {
      from: `"Doctor Appointment System" <${process.env.SMTP_USER}>`,
      to: patient.email,
      cc: process.env.SMTP_USER, // CC to sender (you)
      subject: `Appointment Confirmation - Serial #${slotSerialNumber || 'N/A'}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Appointment Confirmation</title>
          <style>
            /* Email Styles */
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333333;
              margin: 0;
              padding: 0;
              background-color: #f7f9fc;
            }
            
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
            }
            
            .email-header {
              background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
              color: white;
              padding: 30px 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            
            .email-header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            
            .email-header p {
              margin: 10px 0 0;
              font-size: 16px;
              opacity: 0.9;
            }
            
            .email-content {
              padding: 30px;
            }
            
            .info-card {
              background: #ffffff;
              border: 1px solid #e2e8f0;
              border-radius: 10px;
              padding: 25px;
              margin-bottom: 20px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            }
            
            .serial-badge {
              display: inline-block;
              background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
              color: white;
              padding: 8px 20px;
              border-radius: 20px;
              font-weight: bold;
              font-size: 18px;
              margin-bottom: 20px;
            }
            
            h2 {
              color: #1e293b;
              margin-top: 0;
              margin-bottom: 20px;
              font-size: 20px;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 10px;
            }
            
            .info-row {
              display: flex;
              margin-bottom: 12px;
              align-items: flex-start;
            }
            
            .info-label {
              flex: 0 0 120px;
              color: #64748b;
              font-weight: 500;
              font-size: 14px;
            }
            
            .info-value {
              flex: 1;
              color: #1e293b;
              font-weight: 500;
            }
            
            .instruction-list {
              padding-left: 20px;
              margin: 15px 0;
            }
            
            .instruction-list li {
              margin-bottom: 8px;
              color: #475569;
            }
            
            .footer-note {
              margin-top: 25px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              color: #64748b;
              font-size: 14px;
              line-height: 1.5;
            }
            
            .sender-copy-note {
              background: #f0f9ff;
              border-left: 4px solid #0ea5e9;
              padding: 12px 15px;
              margin: 15px 0;
              border-radius: 0 4px 4px 0;
              font-size: 13px;
              color: #475569;
            }
            
            .appointment-id {
              display: inline-block;
              background: #f1f5f9;
              padding: 6px 12px;
              border-radius: 4px;
              font-family: monospace;
              font-size: 14px;
              color: #475569;
              margin-top: 5px;
            }
            
            @media (max-width: 480px) {
              .email-content {
                padding: 20px;
              }
              
              .info-row {
                flex-direction: column;
                margin-bottom: 15px;
              }
              
              .info-label {
                margin-bottom: 5px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h1>Appointment Confirmed</h1>
              <p>Your appointment has been successfully booked</p>
            </div>
            
            <div class="email-content">
              <div style="text-align: center; margin-bottom: 25px;">
                <div class="serial-badge">Serial #${slotSerialNumber || 'N/A'}</div>
              </div>
              
              <!-- Appointment Details -->
              <div class="info-card">
                <h2>Appointment Details</h2>
                
                <div class="info-row">
                  <div class="info-label">Appointment ID:</div>
                  <div class="info-value">
                    <div class="appointment-id">${appointmentId || 'N/A'}</div>
                  </div>
                </div>
                
                <div class="info-row">
                  <div class="info-label">Patient Name:</div>
                  <div class="info-value">${patient.fullName}</div>
                </div>
                
                <div class="info-row">
                  <div class="info-label">Email:</div>
                  <div class="info-value">${patient.email}</div>
                </div>
                
                <div class="info-row">
                  <div class="info-label">Phone:</div>
                  <div class="info-value">${patient.phone}</div>
                </div>
                
                <div class="info-row">
                  <div class="info-label">Date:</div>
                  <div class="info-value">${formattedDate}</div>
                </div>
                
                <div class="info-row">
                  <div class="info-label">Time:</div>
                  <div class="info-value">${appointmentTime}</div>
                </div>
                
                <div class="info-row">
                  <div class="info-label">Duration:</div>
                  <div class="info-value">${doctor.perPatientTime || 15} minutes</div>
                </div>
                
                <div class="info-row">
                  <div class="info-label">Reason:</div>
                  <div class="info-value">${patient.reason}</div>
                </div>
              </div>
              
              <!-- Doctor Information -->
              <div class="info-card">
                <h2>Doctor Information</h2>
                
                <div class="info-row">
                  <div class="info-label">Doctor:</div>
                  <div class="info-value">Dr. ${doctor.name}</div>
                </div>
                
                <div class="info-row">
                  <div class="info-label">Speciality:</div>
                  <div class="info-value">${doctor.speciality || 'General Medicine'}</div>
                </div>
                
                ${doctor.designation ? `
                <div class="info-row">
                  <div class="info-label">Degree:</div>
                  <div class="info-value">${doctor.designation}</div>
                </div>
                ` : ''}
                
                <div class="info-row">
                  <div class="info-label">Location:</div>
                  <div class="info-value">${doctor.location || 'Hospital Location'}</div>
                </div>
                
                ${doctor.email ? `
                <div class="info-row">
                  <div class="info-label">Contact:</div>
                  <div class="info-value">${doctor.email}</div>
                </div>
                ` : ''}
              </div>
              
              <!-- Important Instructions -->
              <div class="info-card">
                <h2>Important Instructions</h2>
                
                <ul class="instruction-list">
                  <li>Please arrive <strong>30 minutes before</strong> your scheduled appointment time</li>
                  <li>Bring your <strong>government-issued ID</strong> and <strong>insurance card</strong> (if applicable)</li>
                  <li>Cancellation must be made <strong>24 hours in advance</strong> </li>
                  <li>If you need to reschedule, please contact us at least 12 hours before your appointment</li>
                  <li>For medical emergencies, please call emergency services immediately</li>
                  <li>Bring any relevant medical reports or prescription from previous consultations</li>
                </ul>
              </div>
              
              <!-- Sender Copy Note (Only shows in sender's copy) -->
              <div class="sender-copy-note">
                <strong>📧 System Copy:</strong> This email was sent to the patient and CC'd to the system administrator.
                <div style="margin-top: 5px; font-size: 12px;">
                  Patient: ${patient.fullName} (${patient.email})
                </div>
              </div>
              
              <!-- Footer -->
              <div class="footer-note">
                <p>
                  <strong>Contact Information:</strong><br>
                  For rescheduling, cancellations, or inquiries:<br>
                  📞 ${process.env.CONTACT_PHONE || 'Call us at our helpline'}<br>
                  📧 ${process.env.OWNER_EMAIL || 'appointment@doctorappointment.a2itltd.com'}
                </p>
                
                <p style="margin-top: 15px; font-size: 12px; color: #94a3b8;">
                  This is an automated email. Please do not reply directly to this message.<br>
                  © ${new Date().getFullYear()} Doctor Appointment System. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        ===========================================
        APPOINTMENT CONFIRMATION - SERIAL #${slotSerialNumber || 'N/A'}
        ===========================================
        
        Dear ${patient.fullName},
        
        Your appointment has been successfully booked.
        
        APPOINTMENT DETAILS:
        ====================
        Appointment ID: ${appointmentId || 'N/A'}
        Serial Number: #${slotSerialNumber}
        Patient Name: ${patient.fullName}
        Email: ${patient.email}
        Phone: ${patient.phone}
        Date: ${formattedDate}
        Time: ${appointmentTime}
        Duration: ${doctor.perPatientTime || 15} minutes
        Reason: ${patient.reason}
        
        DOCTOR INFORMATION:
        ===================
        Doctor: Dr. ${doctor.name}
        Speciality: ${doctor.speciality || 'General Medicine'}
        ${doctor.designation ? `Designation: ${doctor.designation}` : ''}
        Location: ${doctor.location || 'Hospital Location'}
        ${doctor.email ? `Contact: ${doctor.email}` : ''}
        
        IMPORTANT INSTRUCTIONS:
        ======================
        1. Please arrive 15 minutes before your scheduled appointment time
        2. Bring your government-issued ID and insurance card (if applicable)
        3. Cancellation must be made 24 hours in advance to avoid fees
        4. For rescheduling, contact us at least 12 hours before appointment
        5. For emergencies, call emergency services immediately
        6. Bring any relevant medical reports or prescriptions
        
        CONTACT INFORMATION:
        ===================
        For rescheduling, cancellations, or inquiries:
        Phone: ${process.env.CONTACT_PHONE || 'Our helpline'}
        Email: ${process.env.OWNER_EMAIL || 'appointment@doctorappointment.a2itltd.com'}
        
        ===========================================
        NOTE: This email was sent to the patient and
        CC'd to the system administrator for records.
        ===========================================
        
        © ${new Date().getFullYear()} Doctor Appointment System
        This is an automated email. Please do not reply directly.
      `
    };

    // Send email
    console.log('🔄 Sending email through SMTP...');
    const info = await this.transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully!');
    console.log('📨 Message ID:', info.messageId);
    console.log('👤 Sent to patient:', patient.email);
    console.log('📋 CC sent to sender:', process.env.SMTP_USER);
    console.log('📧 Response:', info.response);
    
    return {
      success: true,
      messageId: info.messageId,
      emailSent: true,
      recipients: {
        patient: patient.email,
        sender: process.env.SMTP_USER
      },
      response: info.response
    };
    
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      command: error.command
    });
    
    return {
      success: false,
      error: error.message,
      emailSent: false,
      errorDetails: {
        name: error.name,
        code: error.code,
        command: error.command
      }
    };
  }
}
  async sendPendingAppointmentEmail(appointmentData) {
    try {
      // Call the existing sendAppointmentConfirmation method
      // but we can customize the subject or content if needed
      const result = await this.sendAppointmentConfirmation(appointmentData);
      
      return result;
    } catch (error) {
      console.error('❌ Pending appointment email failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send appointment status update email
  async sendAppointmentStatusUpdate(appointmentData) {
    try {
      const { patient, doctor, appointmentDate, appointmentTime, status, remarks } = appointmentData;
      
      const mailOptions = {
        from: `"Doctor Appointment System" <${process.env.SMTP_USER}>`,
        to: patient.email,
        subject: `Appointment Status Update: ${status}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none; }
              .status-badge { 
                display: inline-block; 
                padding: 5px 15px; 
                border-radius: 20px; 
                font-weight: bold;
                margin-bottom: 15px;
              }
              .status-confirmed { background: #059669; color: white; }
              .status-cancelled { background: #dc2626; color: white; }
              .status-completed { background: #2563eb; color: white; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Appointment Status Update</h1>
                <p>Your appointment status has been updated</p>
              </div>
              <div class="content">
                <div class="status-badge status-${status}">
                  Status: ${status.toUpperCase()}
                </div>
                
                <h3>Appointment Details</h3>
                <p><strong>Patient:</strong> ${patient.fullName}</p>
                <p><strong>Date:</strong> ${new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Time:</strong> ${appointmentTime}</p>
                <p><strong>Doctor:</strong> Dr. ${doctor.name}</p>
                <p><strong>Speciality:</strong> ${doctor.speciality || 'General Medicine'}</p>
                
                ${remarks ? `<p><strong>Remarks:</strong> ${remarks}</p>` : ''}
                
                <div class="footer">
                  <p>For any questions, contact: ${process.env.OWNER_EMAIL || 'appointment@doctorappointment.a2itltd.com'}</p>
                  <p>© ${new Date().getFullYear()} Doctor Appointment System. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Status update email sent:', info.messageId);
      return {
        success: true,
        messageId: info.messageId
      };
      
    } catch (error) {
      console.error('❌ Status update email failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new EmailService();