export const EmailTemplates = {
  // Password Reset OTP Templates
  passwordResetOTP: {
    subject: 'Password Reset OTP - VMC Civic Issues',
    
    html: (fullName: string, otp: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset OTP - VMC Civic Issues</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">VMC Civic Issues</h1>
        <p style="color: #f0f0f0; margin: 10px 0 0 0;">Vadodara Municipal Corporation</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
        <h2 style="color: #333; margin-top: 0;">Password Reset OTP</h2>
        
        <p>Hello <strong>${fullName}</strong>,</p>
        
        <p>We received a request to reset your password for your VMC Civic Issues account. Use the OTP below to reset your password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="background: #667eea; color: white; padding: 20px; border-radius: 10px; font-size: 32px; font-weight: bold; letter-spacing: 8px; display: inline-block; min-width: 200px;">
            ${otp}
          </div>
        </div>
        
        <p style="color: #666; font-size: 14px; text-align: center;">
          <strong>Important:</strong> This OTP will expire in 10 minutes for security reasons.
        </p>
        
        <p style="color: #666; font-size: 14px;">
          If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="color: #888; font-size: 12px; text-align: center;">
          This is an automated message from VMC Civic Issues System.<br>
          Please do not reply to this email.
        </p>
      </div>
    </body>
    </html>
    `,

    text: (fullName: string, otp: string) => `
VMC Civic Issues - Password Reset OTP

Hello ${fullName},

We received a request to reset your password for your VMC Civic Issues account.

Your OTP is: ${otp}

Important: This OTP will expire in 10 minutes for security reasons.

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

---
This is an automated message from VMC Civic Issues System.
Please do not reply to this email.
    `
  },


  
  // Welcome Email Templates
  welcome: {
    subject: 'Welcome to VMC Civic Issues System',
    
    html: (fullName: string, role: string, email: string, tempPassword: string, loginLink: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to VMC Civic Issues</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to VMC Civic Issues</h1>
        <p style="color: #f0f0f0; margin: 10px 0 0 0;">Vadodara Municipal Corporation</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
        <h2 style="color: #333; margin-top: 0;">Account Created Successfully</h2>
        
        <p>Hello <strong>${fullName}</strong>,</p>
        
        <p>Your account has been created for the VMC Civic Issues System with the role of <strong>${role}</strong>.</p>
        
        <div style="background: #fff; padding: 20px; border-radius: 5px; border-left: 4px solid #667eea; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #667eea;">Login Credentials</h3>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Temporary Password:</strong> <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">${tempPassword}</code></p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginLink}" 
             style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Login Now
          </a>
        </div>
        
        <p style="color: #e74c3c; font-size: 14px;">
          <strong>Important:</strong> Please change your password after your first login for security.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="color: #888; font-size: 12px; text-align: center;">
          This is an automated message from VMC Civic Issues System.<br>
          Please do not reply to this email.
        </p>
      </div>
    </body>
    </html>
    `,

    text: (fullName: string, role: string, email: string, tempPassword: string, loginLink: string) => `
VMC Civic Issues - Welcome

Hello ${fullName},

Your account has been created for the VMC Civic Issues System with the role of ${role}.

Login Credentials:
Email: ${email}
Temporary Password: ${tempPassword}

Login here: ${loginLink}

Important: Please change your password after your first login for security.

---
This is an automated message from VMC Civic Issues System.
Please do not reply to this email.
    `
  },

  // Issue Assignment Notification
  issueAssigned: {
    subject: (ticketNumber: string) => `New Issue Assigned: ${ticketNumber}`,
    
    html: (engineerName: string, ticketNumber: string, category: string, location: string, priority: string, dashboardLink: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Issue Assigned</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">New Issue Assigned</h1>
        <p style="color: #f0f0f0; margin: 10px 0 0 0;">VMC Civic Issues</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
        <h2 style="color: #333; margin-top: 0;">Hello ${engineerName},</h2>
        
        <p>A new issue has been assigned to you:</p>
        
        <div style="background: #fff; padding: 20px; border-radius: 5px; border-left: 4px solid #667eea; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #667eea;">Issue Details</h3>
          <p><strong>Ticket:</strong> ${ticketNumber}</p>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Location:</strong> ${location}</p>
          <p><strong>Priority:</strong> <span style="color: ${priority === 'CRITICAL' ? '#e74c3c' : priority === 'HIGH' ? '#f39c12' : '#27ae60'};">${priority}</span></p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${dashboardLink}" 
             style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            View Issue
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          Please review and take appropriate action as per VMC guidelines.
        </p>
      </div>
    </body>
    </html>
    `
  }
};