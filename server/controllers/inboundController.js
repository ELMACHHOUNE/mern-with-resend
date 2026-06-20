const inboundWebhook = async (req, res) => {
  const { from, to, subject, text, html, attachments } = req.body;

  console.log("Inbound email received:");
  console.log("From:", from);
  console.log("To:", to);
  console.log("Subject:", subject);

  res.status(200).send("OK");
};

module.exports = { inboundWebhook };
