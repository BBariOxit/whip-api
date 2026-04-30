import { Resend } from 'resend'
import { env } from '~/config/environment'

console.log('Kiểm tra API Key trong Provider:', env.RESEND_API_KEY ? 'Đã có giá trị' : 'Chưa có giá trị (undefined)')
const resend = new Resend(env.RESEND_API_KEY)

const sendEmail = async (recipientEmail, subject, htmlContent) => {
  // Bóc tách data và error từ kết quả trả về
  const { data, error } = await resend.emails.send({
    // tài khoản gửi email (đã xác thực)
    from: `${env.ADMIN_EMAIL_NAME} <${env.ADMIN_EMAIL_ADDRESS}>`,
    // tài khoản nhận email
    to: [recipientEmail],
    // tiêu đề email
    subject: subject,
    // nội dung email (có thể là html)
    html: htmlContent
  })

  // Nếu có lỗi từ phía Resend, log ra console để biết ngay
  if (error) {
    console.error('Lỗi từ Resend:', error)
    throw new Error(error.message)
  }

  console.log('Đã gửi email thành công, ID:', data.id)
  return data
}

export const resendProvider = {
  sendEmail
}