var clientId;
var clientSecret;
// var authorizationBasic = $.base64.btoa(clientId + ':' + clientSecret);
var authorizationBasic;

var totalCollectionCount = 0;
var totalCommitsCount = 0;

var timeoutCounter = 1;

var topCommits = [];
var commitMap = new Map();

function resetCounters(){
    totalCollectionCount = 0;
    totalCommitsCount = 0;
    timeoutCounter = 1;
    topCommits = [];
}

function initializeArray(array, dataLength, data){
    for(var i=0; i<dataLength; i++){
        array.push(data);
    }
}

function getCommitCount(ChartServices, userId, password, duration, topRepo){
    //console.log("getCommitCount() is triggered.");
    $("#gitCommitCount").text("0");

    clientId = userId;
    clientSecret = password;
    authorizationBasic = window.btoa(clientId + ':' + clientSecret);
    //console.log("User ID: " + clientId + " :: Password: " + clientSecret);

    var minTime = getPreviousDate(duration);

    resetCounters();
    initializeArray(topCommits, topRepo, 0);

    var request = new XMLHttpRequest();
    request.open("GET", getRootUri() + "/_apis/projectCollections?$top=1000", true);
    request.setRequestHeader('Authorization', 'Basic ' + authorizationBasic);

    // Initially wait for few sec
    setTimeout(() => {request.send(); }, 1500);

    request.onreadystatechange = function(){
        if (request.readyState === 4) {
            var responseObj = JSON.parse(request.responseText);
            var collectionCount = responseObj.value.length;
            totalCollectionCount = totalCollectionCount + collectionCount;
            $("#collectionCount").text(totalCollectionCount + " Collection(s)");

            responseObj.value.forEach(function (item, index) {
                //console.log(item.name);
                getRepositories(ChartServices, item.name, minTime, topRepo);
            });
    
        }
    };
}


function getRepositories(ChartServices, collectionName, minTime, topRepo){
    //console.log("getRepositories() is triggered.");
    var request = new XMLHttpRequest();
    request.open("GET", getRootUri() + "/" + collectionName + "//_apis/git/repositories?api-version=6.0", true);
    request.setRequestHeader('Authorization', 'Basic ' + authorizationBasic);

    setTimeout(() => {request.send(); }, (timeoutCounter++ % 5)*100);

    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            //alert(request.responseText);
            var responseObj = JSON.parse(request.responseText);

            responseObj.value.forEach(function (item, index) {
                //console.log(item.name);
                getCommits(ChartServices, collectionName, item.project.name, item.id, item.name, minTime, topRepo);
            });
            responseObj = null;
        }
    };
}


function getCommits(ChartServices, collectionName, projectName, repositoryId, repositoryName, minTime, topRepo){
    var request = new XMLHttpRequest();
    request.open("GET", getRootUri() + "/" + collectionName + "//_apis/git/repositories/" + repositoryId + "/commits?api-version=6.0&searchCriteria.fromDate=" + minTime, true);
    request.setRequestHeader('Authorization', 'Basic ' + authorizationBasic);

    setTimeout(() => {request.send(); }, ((timeoutCounter++ % 10)*7) + 10);

    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            //alert(request.responseText);
            var responseObj = JSON.parse(request.responseText);
            var gitCommitCount = responseObj.value.length;
            responseObj = null;
            totalCommitsCount = totalCommitsCount + gitCommitCount;
            //console.log(collectionName + " :: " + repositoryId + " :: " + gitCommitCount + " :: " +  totalCommitsCount);

            // add commit details to map
            commitMap.set(gitCommitCount, collectionName + " -> " + projectName + " -> " + repositoryName);
            commitMap = new Map([...commitMap.entries()].sort((a, b) => a.key - b.key).reverse());

            // add commit count to array
            if(gitCommitCount > topCommits[topRepo-1]){
                topCommits[topRepo-1] = gitCommitCount;
                topCommits.sort((a, b) => a - b);
                topCommits.reverse();
            }


            if(parseInt($("#gitCommitCount").text()) < totalCommitsCount){
                $("#gitCommitCount").text(totalCommitsCount);

                /*console.log(topCommits);
                for(var i=0; i<5; i++){
                    console.log(commitMap.get(topCommits[i]));
                }*/
                displayChart(ChartServices, topCommits, commitMap, topRepo);
            }
        }
    };
}