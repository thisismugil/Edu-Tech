import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
});




export async function sendOTP(email: string, otp: string) {
    const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: email,
        subject: 'Your Verification Code',
        text: `Your verification code is: ${otp}. It is valid for 1 minute.`,
        html: `<p>Your verification code is: <strong>${otp}</strong></p><p>It is valid for 1 minute.</p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}
