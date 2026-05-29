const questions = require("./questions");

module.exports = (client) => {

    // =========================
    // SETTINGS
    // =========================

    const CHANNEL_ID = "1508754404185079830";

    // shuffled question pool
    let unusedQuestions = [...questions];

    // =========================
    // RANDOM QUESTION SYSTEM
    // =========================

    function getQuestion() {

        // refill when empty
        if (unusedQuestions.length === 0) {
            unusedQuestions = [...questions];
        }

        const index = Math.floor(
            Math.random() * unusedQuestions.length
        );

        const question = unusedQuestions[index];

        // remove used question
        unusedQuestions.splice(index, 1);

        return question;
    }

    // =========================
    // SEND QUESTION
    // =========================

    async function sendQuestion() {

        const channel =
            client.channels.cache.get(CHANNEL_ID);

        if (!channel) return;

        const question = getQuestion();

        await channel.send({

            content:
`╔══════════════════════╗
      ✨  DAILY QUESTION  ✨
╚══════════════════════╝

> ${question}

🌸 Answer below and talk with everyone!
💬 New question every 24 hours.
━━━━━━━━━━━━━━━━━━━━━━━`
        });
    }

    // =========================
    // BOT READY
    // =========================

    client.once("clientReady", async () => {

        console.log("❓ Daily Questions Loaded");

        // OPTIONAL:
        // Uncomment this if you want one sent when bot starts

        // sendQuestion();

        // send every 24h
        setInterval(() => {

            sendQuestion();

        }, 1000 * 60 * 60 * 24);
    });
};