import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as nodemailer from "nodemailer";
import { defineString } from "firebase-functions/params";

const gmailUser = defineString("GMAIL_USER");
const gmailPass = defineString("GMAIL_PASS"); // Use App Passwords for Gmail

export const sendContactEmail = onDocumentCreated(
  {
    document: "contact_messages/{docId}",
  },
  async (event) => {
    const data = event.data?.data();
    if (!data) return;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser.value(),
        pass: gmailPass.value(),
      },
    });

    // Email to you (notification)
    const mailOptions = {
      from: `"Portfolio Contact" <${gmailUser.value()}>`,
      to: gmailUser.value(), // YOU receive mail
      replyTo: data.email,   // Reply goes to user
      subject: `New Contact: ${data.subject}`,
      html: `
        <h3>New Contact Message</h3>
        <p><b>Name:</b> ${data.name}</p>
        <p><b>Email:</b> ${data.email}</p>
        <p><b>Subject:</b> ${data.subject}</p>
        <p><b>Message:</b><br/>${data.message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    // Auto-reply to the user
    await transporter.sendMail({
      from: `"Rabin R" <${gmailUser.value()}>`,
      to: data.email,
      subject: "Thanks for contacting Rabin R",
      html: `
        <p>Hi ${data.name},</p>

        <p>Thank you for reaching out through my portfolio. I've received your message and will review it shortly.</p>

        <p>If your inquiry is related to job opportunities, freelance projects, or collaborations, I'll get back to you as soon as possible.</p>

        <p>In the meantime, feel free to check my work at:<br/>
        <a href="https://rabinr.in">https://rabinr.in</a></p>

        <p>Best regards,<br/>
        <b>Rabin R</b><br/>
        Angular & Frontend Developer</p>
      `,
    });

    // Update document status to 'replied'
    await event.data?.ref.update({
      status: "replied",
      repliedAt: new Date(),
    });
  }
);
