import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

class sendotp {
  transporter: nodemailer.Transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "mujithabaep772@gmail.com",
        pass: process.env.maile_Pass,
      },
    });
  }

  // user verification otp mail
  sendMail(name: string, email: string, otp: number, role: string): void {
    const mailoptions: nodemailer.SendMailOptions = {
      from: "muj@gmail.com",
      to: email,
      subject: `CoursaTech Account Verification for ${role}`,
      html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Account Verification</h2>
                <p>Dear ${name},</p>
                <p>To verify your CoursaTech account, use the following OTP:</p>
                <h3 style="background: #f4f4f4; padding: 10px; text-align: center;">${otp}</h3>
                <p>Thank you,<br>CoursaTech Team</p>
            </div>
                   
                   `,
    };
    this.transporter.sendMail(mailoptions, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("verification code sent successfully");
      }
    });
  }

  // informing the course deleted bcz of continues reports
  sendCourseDeleteMail(email: string, name: string, courseName: string): void {
    const mailOptions: nodemailer.SendMailOptions = {
      from: "muj@gmail.com",
      to: email,
      subject: `Course Removal Notification: ${courseName}`,
      html: `
                <p>Dear ${name},</p>
                <p>We regret to inform you that your course titled <b>"${courseName}"</b> has been deleted from our platform due to continuous reports and violations of our community guidelines.</p>
                <p>If you believe this was a mistake or if you have any questions, please contact our support team.</p>
                <p>Thank you for your understanding.</p>
                <p>Best regards,<br/><b>CoursaTech Team</b></p>
            `,
    };

    this.transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.error("Error sending course deletion email:", err);
      } else {
        console.log("Course deletion email sent successfully");
      }
    });
  }
}

export default sendotp;
