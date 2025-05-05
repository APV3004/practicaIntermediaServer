require("dotenv").config();
const { IncomingWebhook } = require("@slack/webhook");

const slackUrl = process.env.SLACK_WEBHOOK;

const webHook = slackUrl ? new IncomingWebhook(slackUrl) : null;

const loggerStream = {
  write: (message) => {
    if (!webHook) {
      console.warn("⚠ SLACK_WEBHOOK no definido. Log no enviado.");
      return;
    }

    webHook.send({
      text: `*[Error detectado]*\n\`\`\`${message.trim()}\`\`\``,
    });
  },
};

module.exports = loggerStream; 