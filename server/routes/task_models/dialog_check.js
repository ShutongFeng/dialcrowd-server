function copyExist(userArray, task_info) {
    var flags = [];
    var tests = [];
    var task_text = JSON.stringify(task_info);
    var task_len = task_text.length;
    console.log(task_text)
    userArray.forEach(sentence =>
    {
        overlap = LCSubStr(sentence, task_text, sentence.length, task_len);
        tests.push(overlap)
        var result = true;
        if (overlap >= sentence.length/2 && sentence.includes("=")){
            result = false;
        }
        flags.push(result);
    })
    console.log(flags);
    console.log(tests);
    if (flags.includes(false)) {
        return true;
    }
    return false;
}

function LCSubStr( X,  Y , m , n) {
        // Create a table to store
        // lengths of longest common
        // suffixes of substrings.
        // Note that LCSuff[i][j]
        // contains length of longest
        // common suffix of
        // X[0..i-1] and Y[0..j-1].
        // The first row and first
        // column entries have no
        // logical meaning, they are
        // used only for simplicity of program
        var LCStuff =
        Array(m + 1).fill().map(()=>Array(n + 1).fill(0));
 
        // To store length of the longest
        // common substring
        var result = 0;
 
        // Following steps build
        // LCSuff[m+1][n+1] in bottom up fashion
        for (i = 0; i <= m; i++) {
            for (j = 0; j <= n; j++) {
                if (i == 0 || j == 0)
                    LCStuff[i][j] = 0;
                else if (X[i - 1] == Y[j - 1]) {
                    LCStuff[i][j] = LCStuff[i - 1][j - 1] + 1;
                    result = Math.max(result, LCStuff[i][j]);
                } else
                    LCStuff[i][j] = 0;
            }
        }
        return result;
}

function dialogueTest(dialogueArray, task_info) {
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
    //console.log(dialogueArray)
    var userArray = []
    dialogueArray.forEach(x => {
        utterance = x["dialog"];
        console.log(utterance);

        utterance.forEach(utter => {
            if (utter["role"] === "You") {
                dialogueNum++;
                userUtter = utter["utter"];
                userArray.push(userUtter)
                userUtter.split(" ").forEach(token => {
                    tokenNum++;
                    if (!userWordSet.has(token)) {
                        userWordSet.add(token);
                    }
                });
            } else {
                // End dialogue: You can now hang up.
                if (utter["utter"].includes("You can now hang up") || utter["utter"].includes("bye") || utter["utter"].includes("Blue Finish Button")) {
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
    if(copyExist(userArray, task_info)){
        isPassed = false;
        problems.push("You may copied too much from given task description, please rephrase your sentences.")
    }

    return { "isPassed": isPassed, "problems": problems };
}

module.exports = dialogueTest;