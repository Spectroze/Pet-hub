import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const { to, subject, text, html } = await request.json();

    // Log the incoming request data (without sensitive info)
    console.log("Attempting to send email to:", to);

    if (!to || !subject || (!text && !html)) {
      console.error("Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields: to, subject, text or html" },
        { status: 400 }
      );
    }

    // Check environment variables
    if (!process.env.EMAIL || !process.env.PASSWORD) {
      console.error("Environment variables missing");
      return NextResponse.json(
        {
          error: "Email configuration error",
          details: "Missing email or password in server configuration",
        },
        { status: 500 }
      );
    }

    console.log("Creating transport with email:", process.env.EMAIL);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
      debug: true, // Enable debug logging
      logger: true, // Enable logger
    });

    console.log("Verifying transport configuration...");

    // Verify connection configuration
    try {
      await transporter.verify();
      console.log("Transporter verified successfully");
    } catch (verifyError) {
      console.error("Transport verification failed:", verifyError);
      return NextResponse.json(
        {
          error: "Email configuration error",
          details: verifyError.message,
        },
        { status: 500 }
      );
    }

    const mailOptions = {
      from: `"Pet Care Service" <${process.env.EMAIL}>`,
      to,
      subject,
      text,
      html,
    };

    console.log("Attempting to send mail...");

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info);
      return NextResponse.json({
        message: "Email sent successfully",
        messageId: info.messageId,
      });
    } catch (sendError) {
      console.error("Send mail error:", sendError);
      return NextResponse.json(
        {
          error: "Failed to send email",
          details: sendError.message,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("General error:", error);
    return NextResponse.json(
      {
        error: "Server error",
        details: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
