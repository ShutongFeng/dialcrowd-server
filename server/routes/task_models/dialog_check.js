function dialogueTest(dialogueArray) {
    console.log("validate dialogue (dialogueTest)");
    dialogueMinLength = 1;

    isPassed = true;
    problems = [];
    isEnd = false;
    //dialogueArray = dialogues["dialog"];

    if (dialogueArray.length < dialogueMinLength) {
        isPassed = false;
        problems.push("Dialogue Missing.");
        return { "isPassed": isPassed, "problems": problems };
    }

    con = 0;
    tokenNum = 0;
    dialogueNum = 0;
    userWordSet = new Set();
    //We could add black word list later.

    dialogueArray.forEach(x => {
        utterance = x["dialog"];
        //console.log(utterance);

        utterance.forEach(utter => {
            if (utter["role"] === "You") {
                dialogueNum++;
                userUtter = utter["utter"];
                userUtter.split(" ").forEach(token => {
                    tokenNum++;
                    if (!userWordSet.has(token)) {
                        userWordSet.add(token);
                    }
                });
            } else {
                // End dialogue: You can now hang up.
                if (utter["utter"].includes("You can now hang up") || utter["utter"].includes("bye")) {
                    isEnd = true;
                }

            }

        });
    });
    wordNum = userWordSet.size;

    if (tokenNum === 0 || dialogueNum === 0) {
        isPassed = false;
        problems.push("Dialogue is too short.");
        return { "isPassed": isPassed, "problems": problems };
    }

    workTokenRatio = wordNum / tokenNum;
    tokenNumPerUtter = tokenNum / dialogueNum;
    wordNumPerUtter = wordNum / dialogueNum;

    if (dialogueNum < 2) {
        isPassed = false;
        problems.push("Dialogue is too short.");
    }

    if (workTokenRatio < 0.2) {
        isPassed = false;
        problems.push("Using too simple words.");
    }

    if (tokenNumPerUtter < 1.2) {
        isPassed = false;
        problems.push("Utterance is too short.");
    }

    if (!isEnd) {
        isPassed = false;
        problems.push("Dialogue is not finished.");
    }

    return { "isPassed": isPassed, "problems": problems };
}

module.exports = dialogueTest;