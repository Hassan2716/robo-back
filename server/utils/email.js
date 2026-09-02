import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"RoboCutz Barber Shop" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
      text
    });
    return { success: true };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

export const sendBookingConfirmation = async (appointment, customer, barber, service) => {
  const dateStr = new Date(appointment.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a1a2e; color: #e94560; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .detail-row:last-child { border-bottom: none; }
        .label { font-weight: bold; color: #666; }
        .value { color: #333; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>RoboCutz Barber Shop</h1>
          <p>Booking Confirmation</p>
        </div>
        <div class="content">
          <p>Hi ${customer.name},</p>
          <p>Your appointment has been confirmed! Here are the details:</p>
          
          <div class="details">
            <div class="detail-row">
              <span class="label">Barber:</span>
              <span class="value">${barber.name}</span>
            </div>
            <div class="detail-row">
              <span class="label">Service:</span>
              <span class="value">${service.name}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">${dateStr}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time:</span>
              <span class="value">${appointment.time}</span>
            </div>
            <div class="detail-row">
              <span class="label">Duration:</span>
              <span class="value">${service.duration} minutes</span>
            </div>
            <div class="detail-row">
              <span class="label">Total:</span>
              <span class="value">$${appointment.totalPrice.toFixed(2)}</span>
            </div>
          </div>
          
          <p>If you need to cancel or reschedule, please contact us at least 2 hours before your appointment.</p>
          <p>We look forward to seeing you!</p>
        </div>
        <div class="footer">
          <p>RoboCutz Barber Shop | 123 Main St, City | (555) 123-4567</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: customer.email,
    subject: `Booking Confirmed - ${service.name} with ${barber.name} on ${dateStr}`,
    html
  });
};

export const sendBookingReminder = async (appointment, customer, barber, service) => {
  const dateStr = new Date(appointment.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #1a1a2e; color: #e94560; padding: 20px; text-align: center;">
        <h1>RoboCutz Barber Shop</h1>
        <p>Appointment Reminder</p>
      </div>
      <div style="padding: 20px; background: #f9f9f9;">
        <p>Hi ${customer.name},</p>
        <p>This is a friendly reminder about your upcoming appointment:</p>
        <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p><strong>Barber:</strong> ${barber.name}</p>
          <p><strong>Service:</strong> ${service.name}</p>
          <p><strong>Date:</strong> ${dateStr}</p>
          <p><strong>Time:</strong> ${appointment.time}</p>
        </div>
        <p>See you soon!</p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: customer.email,
    subject: `Reminder: Your appointment tomorrow at ${appointment.time}`,
    html
  });
};

export const sendCancellationConfirmation = async (appointment, customer, barber, service) => {
  const dateStr = new Date(appointment.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #1a1a2e; color: #e94560; padding: 20px; text-align: center;">
        <h1>RoboCutz Barber Shop</h1>
        <p>Appointment Cancelled</p>
      </div>
      <div style="padding: 20px; background: #f9f9f9;">
        <p>Hi ${customer.name},</p>
        <p>Your appointment has been cancelled as requested:</p>
        <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p><strong>Barber:</strong> ${barber.name}</p>
          <p><strong>Service:</strong> ${service.name}</p>
          <p><strong>Date:</strong> ${dateStr}</p>
          <p><strong>Time:</strong> ${appointment.time}</p>
        </div>
        <p>We hope to see you again soon!</p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: customer.email,
    subject: `Appointment Cancelled - ${service.name} on ${dateStr}`,
    html
  });
};