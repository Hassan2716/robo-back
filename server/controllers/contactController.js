import Contact from '../models/Contact.js';
import { sendEmail } from '../utils/email.js';
import { AppError } from '../middleware/errorHandler.js';

export const submitContact = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const contact = await Contact.create({
      name,
      email,
      phone,
      subject,
      message
    });

    await sendEmail({
      to: process.env.CONTACT_EMAIL || 'info@robocutz.com',
      subject: `New Contact: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: contact
    });
  } catch (error) {
    next(error);
  }
};

export const getContacts = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Contact.countDocuments(query);

    res.status(200).json({
      success: true,
      count: contacts.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: contacts
    });
  } catch (error) {
    next(error);
  }
};

export const getContact = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return next(new AppError('Contact not found', 404));
    }

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    next(error);
  }
};

export const updateContactStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['new', 'read', 'replied', 'archived'];

    if (!validStatuses.includes(status)) {
      return next(new AppError('Invalid status', 400));
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return next(new AppError('Contact not found', 404));
    }

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return next(new AppError('Contact not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};