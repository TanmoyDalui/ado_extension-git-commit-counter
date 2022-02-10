var clientId;
var clientSecret;
// var authorizationBasic = $.base64.btoa(clientId + ':' + clientSecret);
var authorizationBasic;

var totalCollectionCount = 0;
var totalCommitsCount = 0;

var timeoutCounter = 1;

function resetCounters(){
    totalCollectionCount = 0;
    totalCommitsCount = 0;
    timeoutCounter = 1;
}

function getCommitCount(userId, password, duration){
    clientId = userId;
    clientSecret = password;
    authorizationBasic = window.btoa(clientId + ':' + clientSecret);
    //console.log("User ID: " + clientId + " :: Password: " + clientSecret);

    var minTime = getPreviousDate(duration);

    resetCounters();
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
                getRepositories(item.name, minTime);
            });
    
        }
    };
}


function getRepositories(collectionName, minTime){
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
                getCommits(collectionName, item.id, minTime);
            });
            responseObj = null;
        }
    };
}


function getCommits(collectionName, repositoryId, minTime){
    var request = new XMLHttpRequest();
    request.open("GET", getRootUri() + "/" + collectionName + "//_apis/git/repositories/" + repositoryId + "/commits?api-version=6.0&searchCriteria.fromDate=" + minTime, true);
    request.setRequestHeader('Authorization', 'Basic ' + authorizationBasic);

    setTimeout(() => {request.send(); }, (timeoutCounter++ % 60)*7 + 10);

    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            //alert(request.responseText);
            var responseObj = JSON.parse(request.responseText);
            var gitCommitCount = responseObj.value.length;
            responseObj = null;
            totalCommitsCount = totalCommitsCount + gitCommitCount;
            //console.log(collectionName + " :: " + repositoryId + " :: " + gitCommitCount + " :: " +  totalCommitsCount);


            if(parseInt($("#gitCommitCount").text()) < totalCommitsCount)
                $("#gitCommitCount").text(totalCommitsCount);
        }
    };
}