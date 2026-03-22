// import nodemailer from "nodemailer";

// let transporter = null;

// const configureMailer = () => {
//   if (transporter) return;

//   transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.OTP_SEND_MAIL,
//       pass: process.env.OTP_SEND_PASSWORD,
//     },
//   });
// };

// const sendMail = async ({ to, subject, text, html }) => {
//   try {
//     configureMailer(); // ensure transporter initialized

//     const info = await transporter.sendMail({
//       from: `"Expense Tracker" <${process.env.EMAIL}>`,
//       to,
//       subject,
//       text,
//       html,
//     });

//     return info;
//   } catch (error) {
//     console.error( error.message);
//     return null;
//   }
// };

// export { sendMail };