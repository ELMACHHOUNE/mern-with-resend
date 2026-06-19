const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (req, res) => {
  const { to, subject, html, text } = req.body;

  if (!to || !subject || (!html && !text)) {
    return res
      .status(400)
      .json({ message: "to, subject, and html or text are required" });
  }

  const { data, error } = await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: Array.isArray(to) ? to : [to],
    subject,
    ...(html && { html }),
    ...(text && { text }),
  });

  if (error) {
    return res.status(400).json({ error });
  }

  res.status(200).json({ data });
};

module.exports = { sendEmail };
