//https://github.com/microsoft/azure-pipelines-task-lib/blob/master/node/docs/azure-pipelines-task-lib.md#taskgetInput
console.log("Starting update variable script");

const tl = require("azure-pipelines-task-lib/task");
const request = require('request-promise-native');

async function run() {
    try {
        const url = tl.getVariable("SYSTEM_TEAMFOUNDATIONSERVERURI") + tl.getVariable("SYSTEM_TEAMPROJECTID") + "/_apis/Release/releases/" + tl.getVariable("RELEASE_RELEASEID") + "?api-version=5.0";
        const variableName = tl.getInput('variableName', true);
        const variableValue = tl.getInput('variableValue', true);

        const releaseJson = JSON.parse(await request({
            'method': 'GET',
            'url': url,
            'headers': {
                'Authorization': 'Bearer ' + tl.getVariable("SYSTEM_ACCESSTOKEN"),
                'Content-Type': 'application/json'
            }
        }));

        if (!(variableName in releaseJson.variables))
            releaseJson.variables[variableName] = {};

        releaseJson.variables[variableName].value = variableValue;
        await request({
            'method': 'Put',
            'url': url,
            'headers': {
                'Authorization': 'Bearer ' + tl.getVariable("SYSTEM_ACCESSTOKEN"),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(releaseJson)
        });
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }

    console.log("Finished update variable script");
}

(async() => {
    await run();
})();
