const articlesEndpoint = "../../api/articles";
const usersEndpoint = "../../api/users";
const commentsEndpoint = "../../api/comments";
let results;

async function issueGetRequest() {
  // get data from the server:
  results = await Promise.all(
    [articlesEndpoint, usersEndpoint, commentsEndpoint].map((url) =>
      fetch(url).then((r) => r.json())
    )
  );

  google.charts.setOnLoadCallback(displayData);
}

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

const displayData = () => {
  const articlesData = results[0];
  const usersData = results[1];
  const commentsData = results[2];

  const articlesPerUser = {}
  const commentsPerUser = {}
  const userIdToName = {}

  for (let j = 0; j < usersData.length; j++) {
    userIdToName[usersData[j].id] = `${usersData[j].firstname} ${usersData[j].lastname}`
 }

  for (let j = 0; j < articlesData.length; j++) {
    if(!(articlesData[j].user_id in articlesPerUser)) {
        articlesPerUser[articlesData[j].user_id] = 0
    }
    articlesPerUser[articlesData[j].user_id]++
 }

  for (let j = 0; j < commentsData.length; j++) {
    if(!(commentsData[j].user_id in commentsPerUser)) {
        commentsPerUser[commentsData[j].user_id] = 0
    }
    commentsPerUser[commentsData[j].user_id]++
 }

  const articlesDataForChart = [['User', 'Articles']]
  const commentsDataForChart = [['User', 'Comments']]

  for (const user_id in articlesPerUser) {
     articlesDataForChart.push([userIdToName[user_id], articlesPerUser[user_id]])
  }

  for (const user_id in commentsPerUser) {
     commentsDataForChart.push([userIdToName[user_id], commentsPerUser[user_id]])
  }

  // Doc: https://developers.google.com/chart/interactive/docs/gallery/columnchart?hl=pl
  var articlesDataTable = google.visualization.arrayToDataTable(articlesDataForChart);
  var commentsDataTable = google.visualization.arrayToDataTable(commentsDataForChart);

    // Optional; add a title and set the width and height of the chart
    var articlesOptions = {'title':'Number of articles', 'width':400, 'height':400, 'legend': {'position': 'none'}};
    var commentsOptions = {'title':'Number of comments', 'width':400, 'height':400, 'legend': {'position': 'none'}};

    var articlesChart = new google.visualization.ColumnChart(document.getElementById('articlesPerUserChart'));
    articlesChart.draw(articlesDataTable, articlesOptions);
    var commentsChart = new google.visualization.ColumnChart(document.getElementById('commentsPerUserChart'));
    commentsChart.draw(commentsDataTable, commentsOptions);
};

// Load google charts
google.charts.load('current', {'packages':['corechart']});

issueGetRequest()
