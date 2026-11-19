const nodemailer = require('nodemailer')

async function sendVerificationEmail(email, token) {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CLIENT_URL } = process.env
    const port = Number(SMTP_PORT)

    if (!SMTP_HOST || !Number.isInteger(port) || !SMTP_USER || !SMTP_PASS || !CLIENT_URL) {
        throw new Error('Email delivery is not configured')
    }

    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
        }
    })
    const verificationUrl = new URL('/verify-email', CLIENT_URL)
    verificationUrl.searchParams.set('token', token)

    await transporter.sendMail({
        from: process.env.EMAIL_FROM || SMTP_USER,
        to: email,
        subject: 'Verify your HallBook email',
        text: `Verify your email address to activate your HallBook account:\n\n${verificationUrl.toString()}\n\nThis link expires in 24 hours.`
    })
}

module.exports = { sendVerificationEmail }
