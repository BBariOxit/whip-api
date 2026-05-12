import { env } from '~/config/environment'

const sendEmail = async (recipientEmail, subject, htmlContent) => {
  // Use Brevo API (formerly Sendinblue)
  // https://developers.brevo.com/reference/sendtransacemail

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': env.BREVO_API_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: {
        name: env.ADMIN_EMAIL_NAME,
        email: env.ADMIN_EMAIL_ADDRESS
      },
      to: [{ email: recipientEmail }],
      subject: subject,
      htmlContent: htmlContent
    })
  })

  const data = await response.json()

  // Nếu có lỗi từ phía Brevo, log ra console để biết ngay
  if (!response.ok) {
    console.error('Lỗi từ Brevo:', data)
    throw new Error(data.message || 'Lỗi khi gửi email qua Brevo')
  }

  console.log('Đã gửi email thành công, ID:', data.messageId)
  return data
}

export const brevoProvider = {
  sendEmail
}
