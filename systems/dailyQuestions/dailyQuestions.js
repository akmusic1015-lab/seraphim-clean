const questions = require("./questions");

module.exports = (client) => {

    // =========================
    // SETTINGS
    // =========================

    const CHANNEL_ID = "1508754404185079830";
    const QOTD_ROLE_ID = "1495381706243444908";

    let unusedQuestions = [...questions];
    let lastSentDate = null;

    // =========================
    // RANDOM QUESTION SYSTEM
    // =========================

    function getQuestion() {

        if (unusedQuestions.length === 0) {
            unusedQuestions = [...questions];
        }

        const index = Math.floor(
            Math.random() * unusedQuestions.length
        );

        const question = unusedQuestions[index];

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
`

╔══════════════════════╗
      ✨ DAILY QUESTION ✨
╚══════════════════════╝

<@&${QOTD_ROLE_ID}>

> ${question}

🌸 Answer below and chat with everyone!
💬 New question every day at 7:00 AM AEST.
━━━━━━━━━━━━━━━━━━━━━━━`
        });

        console.log("❓ Daily Question Sent");
    }

    // =========================
    // BOT READY
    // =========================

    client.once("clientReady", () => {

        console.log("❓ Daily Questions Loaded");

        setInterval(async () => {

            const now = new Date(
                new Date().toLocaleString(
                    "en-US",
                    {
                        timeZone: "Australia/Brisbane"
                    }
                )
            );

            const today =
                now.toISOString().split("T")[0];

            if (
                now.getHours() === 7 &&
                now.getMinutes() === 0 &&
                lastSentDate !== today
            ) {

                lastSentDate = today;

                await sendQuestion();
            }

        }, 60000); // check every minute

    });

};