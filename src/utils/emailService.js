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

//   // Send appointment confirmation email
// async sendAppointmentConfirmation(appointmentData) {
//   try {
//     const { 
//       patient, 
//       doctor, 
//       appointmentDate, 
//       appointmentTime, 
//       slotSerialNumber,
//       appointmentId 
//     } = appointmentData;
    
//     console.log('📧 Preparing appointment confirmation email...');
//     console.log('- Patient:', patient.email);
//     console.log('- Sender CC:', process.env.SMTP_USER);
//     console.log('- Serial Number:', slotSerialNumber);
    
//     // Format appointment date
//     const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', { 
//       weekday: 'long', 
//       year: 'numeric', 
//       month: 'long', 
//       day: 'numeric' 
//     });
    
//     // Create mail options
//     const mailOptions = {
//       from: `"Doctor Appointment System" <${process.env.SMTP_USER}>`,
//       to: patient.email,
//       cc: process.env.SMTP_USER, // CC to sender (you)
//       subject: `Appointment Confirmation - Serial #${slotSerialNumber || 'N/A'}`,
//       html: `
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <meta charset="UTF-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <title>Appointment Confirmation</title>
//           <style>
//             /* Email Styles */
//             body {
//               font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//               line-height: 1.6;
//               color: #333333;
//               margin: 0;
//               padding: 0;
//               background-color: #f7f9fc;
//             }
            
//             .email-container {
//               max-width: 600px;
//               margin: 0 auto;
//               background-color: #ffffff;
//             }
            
//             .email-header {
//               background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
//               color: white;
//               padding: 30px 20px;
//               text-align: center;
//               border-radius: 8px 8px 0 0;
//             }
            
//             .email-header h1 {
//               margin: 0;
//               font-size: 28px;
//               font-weight: 700;
//             }
            
//             .email-header p {
//               margin: 10px 0 0;
//               font-size: 16px;
//               opacity: 0.9;
//             }
            
//             .email-content {
//               padding: 30px;
//             }
            
//             .info-card {
//               background: #ffffff;
//               border: 1px solid #e2e8f0;
//               border-radius: 10px;
//               padding: 25px;
//               margin-bottom: 20px;
//               box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
//             }
            
//             .serial-badge {
//               display: inline-block;
//               background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
//               color: white;
//               padding: 8px 20px;
//               border-radius: 20px;
//               font-weight: bold;
//               font-size: 18px;
//               margin-bottom: 20px;
//             }
            
//             h2 {
//               color: #1e293b;
//               margin-top: 0;
//               margin-bottom: 20px;
//               font-size: 20px;
//               border-bottom: 2px solid #e2e8f0;
//               padding-bottom: 10px;
//             }
            
//             .info-row {
//               display: flex;
//               margin-bottom: 12px;
//               align-items: flex-start;
//             }
            
//             .info-label {
//               flex: 0 0 120px;
//               color: #64748b;
//               font-weight: 500;
//               font-size: 14px;
//             }
            
//             .info-value {
//               flex: 1;
//               color: #1e293b;
//               font-weight: 500;
//             }
            
//             .instruction-list {
//               padding-left: 20px;
//               margin: 15px 0;
//             }
            
//             .instruction-list li {
//               margin-bottom: 8px;
//               color: #475569;
//             }
            
//             .footer-note {
//               margin-top: 25px;
//               padding-top: 20px;
//               border-top: 1px solid #e2e8f0;
//               color: #64748b;
//               font-size: 14px;
//               line-height: 1.5;
//             }
            
//             .sender-copy-note {
//               background: #f0f9ff;
//               border-left: 4px solid #0ea5e9;
//               padding: 12px 15px;
//               margin: 15px 0;
//               border-radius: 0 4px 4px 0;
//               font-size: 13px;
//               color: #475569;
//             }
            
//             .appointment-id {
//               display: inline-block;
//               background: #f1f5f9;
//               padding: 6px 12px;
//               border-radius: 4px;
//               font-family: monospace;
//               font-size: 14px;
//               color: #475569;
//               margin-top: 5px;
//             }
            
//             @media (max-width: 480px) {
//               .email-content {
//                 padding: 20px;
//               }
              
//               .info-row {
//                 flex-direction: column;
//                 margin-bottom: 15px;
//               }
              
//               .info-label {
//                 margin-bottom: 5px;
//               }
//             }
//           </style>
//         </head>
//         <body>
//           <div class="email-container">
//             <div class="email-header">
//               <h1>Appointment Confirmed</h1>
//               <p>Your appointment has been successfully booked</p>
//             </div>
            
//             <div class="email-content">
//               <div style="text-align: center; margin-bottom: 25px;">
//                 <div class="serial-badge">Serial #${slotSerialNumber || 'N/A'}</div>
//               </div>
              
//               <!-- Appointment Details -->
//               <div class="info-card">
//                 <h2>Appointment Details</h2>
                
//                 <div class="info-row">
//                   <div class="info-label">Appointment ID:</div>
//                   <div class="info-value">
//                     <div class="appointment-id">${appointmentId || 'N/A'}</div>
//                   </div>
//                 </div>
                
//                 <div class="info-row">
//                   <div class="info-label">Patient Name:</div>
//                   <div class="info-value">${patient.fullName}</div>
//                 </div>
                
//                 <div class="info-row">
//                   <div class="info-label">Email:</div>
//                   <div class="info-value">${patient.email}</div>
//                 </div>
                
//                 <div class="info-row">
//                   <div class="info-label">Phone:</div>
//                   <div class="info-value">${patient.phone}</div>
//                 </div>
                
//                 <div class="info-row">
//                   <div class="info-label">Date:</div>
//                   <div class="info-value">${formattedDate}</div>
//                 </div>
                
//                 <div class="info-row">
//                   <div class="info-label">Time:</div>
//                   <div class="info-value">${appointmentTime}</div>
//                 </div>
                
//                 <div class="info-row">
//                   <div class="info-label">Duration:</div>
//                   <div class="info-value">${doctor.perPatientTime || 15} minutes</div>
//                 </div>
                
//                 <div class="info-row">
//                   <div class="info-label">Reason:</div>
//                   <div class="info-value">${patient.reason}</div>
//                 </div>
//               </div>
              
//               <!-- Doctor Information -->
//               <div class="info-card">
//                 <h2>Doctor Information</h2>
                
//                 <div class="info-row">
//                   <div class="info-label">Doctor:</div>
//                   <div class="info-value">Dr. ${doctor.name}</div>
//                 </div>
                
//                 <div class="info-row">
//                   <div class="info-label">Speciality:</div>
//                   <div class="info-value">${doctor.speciality || 'General Medicine'}</div>
//                 </div>
                
//                 ${doctor.designation ? `
//                 <div class="info-row">
//                   <div class="info-label">Degree:</div>
//                   <div class="info-value">${doctor.designation}</div>
//                 </div>
//                 ` : ''}
                
//                 <div class="info-row">
//                   <div class="info-label">Location:</div>
//                   <div class="info-value">${doctor.location || 'Hospital Location'}</div>
//                 </div>
                
//                 ${doctor.email ? `
//                 <div class="info-row">
//                   <div class="info-label">Contact:</div>
//                   <div class="info-value">${doctor.email}</div>
//                 </div>
//                 ` : ''}
//               </div>
              
//               <!-- Important Instructions -->
//               <div class="info-card">
//                 <h2>Important Instructions</h2>
                
//                 <ul class="instruction-list">
//                   <li>Please arrive <strong>30 minutes before</strong> your scheduled appointment time</li>
//                   <li>Bring your <strong>government-issued ID</strong> and <strong>insurance card</strong> (if applicable)</li>
//                   <li>Cancellation must be made <strong>24 hours in advance</strong> </li>
//                   <li>If you need to reschedule, please contact us at least 12 hours before your appointment</li>
//                   <li>For medical emergencies, please call emergency services immediately</li>
//                   <li>Bring any relevant medical reports or prescription from previous consultations</li>
//                 </ul>
//               </div>
              
//               <!-- Sender Copy Note (Only shows in sender's copy) -->
//               <div class="sender-copy-note">
//                 <strong>📧 System Copy:</strong> This email was sent to the patient and CC'd to the system administrator.
//                 <div style="margin-top: 5px; font-size: 12px;">
//                   Patient: ${patient.fullName} (${patient.email})
//                 </div>
//               </div>
              
//               <!-- Footer -->
//               <div class="footer-note">
//                 <p>
//                   <strong>Contact Information:</strong><br>
//                   For rescheduling, cancellations, or inquiries:<br>
//                   📞 ${process.env.CONTACT_PHONE || 'Call us at our helpline'}<br>
//                   📧 ${process.env.OWNER_EMAIL || 'appointment@doctorappointment.a2itltd.com'}
//                 </p>
                
//                 <p style="margin-top: 15px; font-size: 12px; color: #94a3b8;">
//                   This is an automated email. Please do not reply directly to this message.<br>
//                   © ${new Date().getFullYear()} Doctor Appointment System. All rights reserved.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </body>
//         </html>
//       `,
//       text: `
//         ===========================================
//         APPOINTMENT CONFIRMATION - SERIAL #${slotSerialNumber || 'N/A'}
//         ===========================================
        
//         Dear ${patient.fullName},
        
//         Your appointment has been successfully booked.
        
//         APPOINTMENT DETAILS:
//         ====================
//         Appointment ID: ${appointmentId || 'N/A'}
//         Serial Number: #${slotSerialNumber}
//         Patient Name: ${patient.fullName}
//         Email: ${patient.email}
//         Phone: ${patient.phone}
//         Date: ${formattedDate}
//         Time: ${appointmentTime}
//         Duration: ${doctor.perPatientTime || 15} minutes
//         Reason: ${patient.reason}
        
//         DOCTOR INFORMATION:
//         ===================
//         Doctor: Dr. ${doctor.name}
//         Speciality: ${doctor.speciality || 'General Medicine'}
//         ${doctor.designation ? `Designation: ${doctor.designation}` : ''}
//         Location: ${doctor.location || 'Hospital Location'}
//         ${doctor.email ? `Contact: ${doctor.email}` : ''}
        
//         IMPORTANT INSTRUCTIONS:
//         ======================
//         1. Please arrive 15 minutes before your scheduled appointment time
//         2. Bring your government-issued ID and insurance card (if applicable)
//         3. Cancellation must be made 24 hours in advance to avoid fees
//         4. For rescheduling, contact us at least 12 hours before appointment
//         5. For emergencies, call emergency services immediately
//         6. Bring any relevant medical reports or prescriptions
        
//         CONTACT INFORMATION:
//         ===================
//         For rescheduling, cancellations, or inquiries:
//         Phone: ${process.env.CONTACT_PHONE || 'Our helpline'}
//         Email: ${process.env.OWNER_EMAIL || 'appointment@doctorappointment.a2itltd.com'}
        
//         ===========================================
//         NOTE: This email was sent to the patient and
//         CC'd to the system administrator for records.
//         ===========================================
        
//         © ${new Date().getFullYear()} Doctor Appointment System
//         This is an automated email. Please do not reply directly.
//       `
//     };

//     // Send email
//     console.log('🔄 Sending email through SMTP...');
//     const info = await this.transporter.sendMail(mailOptions);
    
//     console.log('✅ Email sent successfully!');
//     console.log('📨 Message ID:', info.messageId);
//     console.log('👤 Sent to patient:', patient.email);
//     console.log('📋 CC sent to sender:', process.env.SMTP_USER);
//     console.log('📧 Response:', info.response);
    
//     return {
//       success: true,
//       messageId: info.messageId,
//       emailSent: true,
//       recipients: {
//         patient: patient.email,
//         sender: process.env.SMTP_USER
//       },
//       response: info.response
//     };
    
//   } catch (error) {
//     console.error('❌ Email sending failed:', error);
//     console.error('❌ Error details:', {
//       name: error.name,
//       message: error.message,
//       code: error.code,
//       command: error.command
//     });
    
//     return {
//       success: false,
//       error: error.message,
//       emailSent: false,
//       errorDetails: {
//         name: error.name,
//         code: error.code,
//         command: error.command
//       }
//     };
//   }
// }
// In src/utils/emailService.js 2
async sendAppointmentConfirmation(appointmentData) {
  try {
    const { 
      patient, 
      doctor, 
      appointmentDate, 
      appointmentTime, 
      slotSerialNumber,
      appointmentId,
      status = 'confirmed' // Add status parameter with default 'confirmed'
    } = appointmentData;
    
    console.log('📧 Preparing appointment confirmation email...');
    console.log('- Status:', status);
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
    
    // Determine subject and status message based on appointment status
    let subject, statusMessage, statusBadge;
    
    if (status === 'confirmed') {
      subject = `Appointment Confirmed - Serial #${slotSerialNumber || 'N/A'}`;
      statusMessage = 'Your appointment has been confirmed and is ready for your visit.';
      statusBadge = 'CONFIRMED';
    } else if (status === 'pending') {
      subject = `Appointment Request Received - Serial #${slotSerialNumber || 'N/A'}`;
      statusMessage = 'Your appointment request has been received and is pending approval.';
      statusBadge = 'PENDING APPROVAL';
    } else {
      subject = `Appointment Status - Serial #${slotSerialNumber || 'N/A'}`;
      statusMessage = 'Your appointment details are below.';
      statusBadge = status.toUpperCase();
    }
    
    // Create mail options
    const mailOptions = {
      from: `"Doctor Appointment System" <${process.env.SMTP_USER}>`,
      to: patient.email,
      cc: process.env.SMTP_USER, // CC to sender (you)
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Appointment ${status === 'confirmed' ? 'Confirmation' : 'Request Received'}</title>
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
            
            /* Dynamic header color based on status */
            .email-header {
              background: ${status === 'confirmed' ? 'linear-gradient(135deg, #059669 0%, #0d9488 100%)' : 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)'};
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
            
            .status-banner {
              text-align: center;
              margin-bottom: 25px;
              padding: 15px;
              border-radius: 8px;
              ${status === 'confirmed' 
                ? 'background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 1px solid #a7f3d0;' 
                : 'background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 1px solid #fcd34d;'
              }
            }
            
            .status-banner h3 {
              margin: 0 0 10px 0;
              font-size: 20px;
              ${status === 'confirmed' ? 'color: #065f46;' : 'color: #92400e;'}
            }
            
            .status-banner p {
              margin: 0;
              ${status === 'confirmed' ? 'color: #047857;' : 'color: #b45309;'}
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
              ${status === 'confirmed' 
                ? 'background: linear-gradient(135deg, #059669 0%, #0d9488 100%);' 
                : 'background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);'
              }
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
            
            /* Status-specific instructions */
            .instruction-list {
              padding-left: 20px;
              margin: 15px 0;
            }
            
            .instruction-list li {
              margin-bottom: 8px;
              color: #475569;
            }
            
            .pending-note {
              background: #fffbeb;
              border: 1px solid #fde68a;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
              border-radius: 0 4px 4px 0;
            }
            
            .confirmed-note {
              background: #ecfdf5;
              border: 1px solid #a7f3d0;
              border-left: 4px solid #059669;
              padding: 15px;
              margin: 20px 0;
              border-radius: 0 4px 4px 0;
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
            
            .status-indicator {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
              margin-left: 10px;
              ${status === 'confirmed' 
                ? 'background: #d1fae5; color: #065f46;' 
                : 'background: #fef3c7; color: #92400e;'
              }
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
              <h1>${status === 'confirmed' ? 'Appointment Confirmed' : 'Appointment Request Received'}</h1>
              <p>${status === 'confirmed' ? 'Your appointment has been successfully booked' : 'Your appointment request has been received'}</p>
            </div>
            
            <div class="email-content">
              <!-- Status Banner -->
              <div class="status-banner">
                <h3>Status: ${statusBadge}</h3>
                <p>${statusMessage}</p>
              </div>
              
              <div style="text-align: center; margin-bottom: 25px;">
                <div class="serial-badge">Serial #${slotSerialNumber || 'N/A'}</div>
              </div>
              
              <!-- Status-specific note -->
              ${status === 'pending' ? `
                <div class="pending-note">
                  <strong>📋 Note:</strong> Your appointment is currently <strong>pending approval</strong>. 
                  The clinic will review your request and confirm your appointment within 24 hours. 
                  You will receive another email once your appointment is confirmed.
                </div>
              ` : `
                <div class="confirmed-note">
                  <strong>✅ Appointment Confirmed:</strong> Your appointment has been approved and is ready for your visit.
                  Please arrive 30 minutes before your scheduled time.
                </div>
              `}
              
              <!-- Appointment Details -->
              <div class="info-card">
                <h2>
                  Appointment Details 
                  <span class="status-indicator">${statusBadge}</span>
                </h2>
                
                <div class="info-row">
                  <div class="info-label">Appointment ID:</div>
                  <div class="info-value">
                    <div class="appointment-id">${appointmentId || 'N/A'}</div>
                  </div>
                </div>
                
                <div class="info-row">
                  <div class="info-label">Status:</div>
                  <div class="info-value">
                    <strong>${statusBadge}</strong>
                    ${status === 'pending' ? ' (Awaiting admin approval)' : ' (Ready for your visit)'}
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
              
              <!-- Status-specific Instructions -->
              <div class="info-card">
                <h2>${status === 'confirmed' ? 'Important Instructions' : 'Next Steps'}</h2>
                
                <ul class="instruction-list">
                  ${status === 'confirmed' ? `
                    <li>Please arrive <strong>30 minutes before</strong> your scheduled appointment time</li>
                    <li>Bring your <strong>government-issued ID</strong> and <strong>insurance card</strong> (if applicable)</li>
                    <li>Cancellation must be made <strong>24 hours in advance</strong></li>
                    <li>If you need to reschedule, please contact us at least 12 hours before your appointment</li>
                    <li>For medical emergencies, please call emergency services immediately</li>
                    <li>Bring any relevant medical reports or prescription from previous consultations</li>
                  ` : `
                    <li>Your appointment is <strong>pending approval</strong> by the clinic staff</li>
                    <li>You will receive <strong>another email</strong> once your appointment is confirmed</li>
                    <li>Expected confirmation time: <strong>within 24 hours</strong></li>
                    <li>If you don't receive confirmation within 24 hours, please contact the clinic</li>
                    <li>Once confirmed, please arrive 30 minutes before your scheduled appointment time</li>
                    <li>For urgent medical needs, please call emergency services immediately</li>
                  `}
                </ul>
              </div>
              
              <!-- Sender Copy Note -->
              <div class="sender-copy-note">
                <strong>📧 System Copy:</strong> This email was sent to the patient and CC'd to the system administrator.
                <div style="margin-top: 5px; font-size: 12px;">
                  Patient: ${patient.fullName} (${patient.email}) | Status: ${status}
                </div>
              </div>
              
              <!-- Footer -->
              <div class="footer-note">
                <p>
                  <strong>Contact Information:</strong><br>
                  For questions, rescheduling, or cancellations:<br>
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
        ${status === 'confirmed' ? 'APPOINTMENT CONFIRMED' : 'APPOINTMENT REQUEST RECEIVED'} - SERIAL #${slotSerialNumber || 'N/A'}
        ===========================================
        
        ${status === 'confirmed' 
          ? 'Dear ' + patient.fullName + ',\n\nYour appointment has been confirmed and is ready for your visit.' 
          : 'Dear ' + patient.fullName + ',\n\nYour appointment request has been received and is pending approval.'
        }
        
        STATUS: ${statusBadge}
        ${status === 'pending' ? ' (Awaiting admin approval)' : ' (Ready for your visit)'}
        
        APPOINTMENT DETAILS:
        ====================
        Appointment ID: ${appointmentId || 'N/A'}
        Serial Number: #${slotSerialNumber}
        Status: ${statusBadge}
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
        
        ${status === 'confirmed' ? `
        IMPORTANT INSTRUCTIONS:
        ======================
        1. Please arrive 30 minutes before your scheduled appointment time
        2. Bring your government-issued ID and insurance card (if applicable)
        3. Cancellation must be made 24 hours in advance to avoid fees
        4. For rescheduling, contact us at least 12 hours before appointment
        5. For emergencies, call emergency services immediately
        6. Bring any relevant medical reports or prescriptions
        ` : `
        NEXT STEPS:
        ==========
        1. Your appointment is pending approval by clinic staff
        2. You will receive another email once your appointment is confirmed
        3. Expected confirmation time: within 24 hours
        4. If you don't receive confirmation within 24 hours, please contact the clinic
        5. Once confirmed, please arrive 30 minutes before your scheduled appointment time
        6. For urgent medical needs, call emergency services immediately
        `}
        
        CONTACT INFORMATION:
        ===================
        For questions, rescheduling, or cancellations:
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
    console.log('🎯 Status:', status);
    console.log('📧 Response:', info.response);
    
    return {
      success: true,
      messageId: info.messageId,
      emailSent: true,
      status: status,
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
      status: appointmentData.status || 'unknown',
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