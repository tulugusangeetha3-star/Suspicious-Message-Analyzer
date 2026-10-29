
const messageInput = document.getElementById("message");
const senderInput = document.getElementById("sender");
const analyzeBtn = document.getElementById("analyzeBtn");

const results = document.getElementById("results");
const scoreElement = document.getElementById("score");
const riskLevel = document.getElementById("riskLevel");
const riskDescription = document.getElementById("riskDescription");
const warningList = document.getElementById("warningList");
const actionList = document.getElementById("actionList");

const nextSteps = document.getElementById("nextSteps");
const nextStepsList = document.getElementById("nextStepsList");

let lastAnalysis = null;

// Add a list item safely using textContent.
function addListItem(list, text) {
    const item = document.createElement("li");
    item.textContent = text;
    list.appendChild(item);
}

// Analyze the message for common phishing warning signs.
function analyzeMessage() {
    const message = messageInput.value.trim();
    const sender = senderInput.value.trim();
    const text = message.toLowerCase();

    if (!message) {
        alert("Please paste a message before analyzing.");
        messageInput.focus();
        return;
    }

    const warnings = [];
    let score = 0;

    // 1. Urgent or threatening language
    const urgencyWords = [
        "urgent",
        "immediately",
        "act now",
        "limited time",
        "suspended",
        "will be blocked",
        "expires today",
        "final warning"
    ];

    if (urgencyWords.some(word => text.includes(word))) {
        warnings.push(
            "Urgent or threatening language may pressure you to act quickly."
        );
        score += 20;
    }

    // 2. Requests for sensitive information
    const sensitiveWords = [
        "password",
        "otp",
        "one-time password",
        "bank details",
        "credit card",
        "verify your account",
        "confirm your account",
        "login details"
    ];

    if (sensitiveWords.some(word => text.includes(word))) {
        warnings.push(
            "The message mentions account verification or sensitive information."
        );
        score += 30;
    }

    // 3. Suspicious link indicators
    const linkPattern = /https?:\/\/\S+|www\.\S+/i;

    if (linkPattern.test(message)) {
        warnings.push(
            "The message contains a web link. Check its destination independently."
        );
        score += 20;
    }

    // 4. Requests to open an attachment
    const attachmentWords = [
        "open the attachment",
        "download the attachment",
        "attached file",
        "enable macros"
    ];

    if (attachmentWords.some(word => text.includes(word))) {
        warnings.push(
            "The message asks you to open or download an attachment."
        );
        score += 15;
    }

    // 5. Common impersonation language
    const impersonationWords = [
        "account suspended",
        "unusual activity",
        "security alert",
        "payment failed",
        "claim your reward",
        "you have won",
        "prize"
    ];

    if (impersonationWords.some(word => text.includes(word))) {
        warnings.push(
            "The message uses language commonly seen in impersonation or scam messages."
        );
        score += 15;
    }

    // 6. Generic greeting
    const genericGreetings = [
        "dear user",
        "dear customer",
        "dear account holder",
        "valued customer"
    ];

    if (genericGreetings.some(word => text.includes(word))) {
        warnings.push(
            "The greeting is generic rather than personally identifying."
        );
        score += 10;
    }

    // 7. Sender address: a simple observation only
    if (sender && !sender.includes("@")) {
        warnings.push(
            "The sender field is not in a typical email-address format. Verify the sender."
        );
        score += 5;
    }

    // Keep the score between 0 and 100.
    score = Math.min(score, 100);

    let level;
    let description;

    if (score >= 60) {
        level = "High Warning";
        description =
            "Several common warning signs were detected. Do not click links or share information until verified.";
    } else if (score >= 30) {
        level = "Medium Warning";
        description =
            "Some warning signs were detected. Verify the message through an official channel.";
    } else {
        level = "Low Warning Score";
        description =
            "Few configured warning signs were detected. This does not prove the message is safe.";
    }

    if (warnings.length === 0) {
        warnings.push(
            "No configured warning phrases were detected. Manual verification is still necessary."
        );
    }

    const actions = [
        "Do not share passwords, OTPs, or banking details.",
        "Do not click links or open unexpected attachments.",
        "Contact the organization using its official app, website, or known phone number.",
        "Report the message if it appears suspicious."
    ];

    // Save the result for the next-step buttons.
    lastAnalysis = { score, level };

    // Display the result.
    scoreElement.textContent = `${score}/100`;
    riskLevel.textContent = level;
    riskDescription.textContent = description;

    warningList.replaceChildren();
    actionList.replaceChildren();

    warnings.forEach(warning => addListItem(warningList, warning));
    actions.forEach(action => addListItem(actionList, action));

    nextSteps.hidden = true;
    nextStepsList.replaceChildren();
    results.hidden = false;

    results.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// Show actions if the user did not enter credentials.
function handleNoCredentials() {
    showNextSteps([
        "Do not click the message links or open unexpected attachments.",
        "Verify the claim using the official website or app.",
        "Report or delete the message if it is fraudulent.",
        "If you downloaded a file, do not open it; seek trusted technical help."
    ]);
}

// Show actions if credentials or sensitive details were entered.
function handleCredentialsEntered() {
    showNextSteps([
        "Stop interacting with the suspicious message.",
        "Using the official website or app, change the affected password immediately.",
        "If you reused that password, change it on other affected accounts too.",
        "Enable multi-factor authentication if available.",
        "If you shared banking details or made a payment, contact your bank through its official number immediately.",
        "If you shared an OTP, contact the affected service or bank immediately.",
        "Tell your organization's IT/security team if a work or college account is involved.",
        "Watch for unauthorized activity and follow the service provider's recovery guidance."
    ]);
}

// Display the selected safety advice.
function showNextSteps(steps) {
    nextStepsList.replaceChildren();

    steps.forEach(step => addListItem(nextStepsList, step));

    nextSteps.hidden = false;

    nextSteps.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
}

// Button events
analyzeBtn.addEventListener("click", analyzeMessage);

document.getElementById("notEnteredBtn")
    .addEventListener("click", handleNoCredentials);

document.getElementById("enteredBtn")
    .addEventListener("click", handleCredentialsEntered);

// Allow Ctrl+Enter to analyze the message.
messageInput.addEventListener("keydown", function (event) {
    if (event.ctrlKey && event.key === "Enter") {
        analyzeMessage();
    }
});
