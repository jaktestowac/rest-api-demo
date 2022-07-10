const articlesEndpoint = "../../api/articles";
const usersEndpoint = "../../api/users";
const commentsEndpoint = "../../api/comments";
let results;
let articlesDataForChart;
let commentsDataForChart;

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

  articlesDataForChart = [['User', 'Articles']]
  commentsDataForChart = [['User', 'Comments']]

  for (const user_id in articlesPerUser) {
     articlesDataForChart.push([userIdToName[user_id], articlesPerUser[user_id]])
  }

  for (const user_id in commentsPerUser) {
     commentsDataForChart.push([userIdToName[user_id], commentsPerUser[user_id]])
  }

  // Doc: https://developers.google.com/chart/interactive/docs/gallery/columnchart?hl=pl
  const articlesDataTable = google.visualization.arrayToDataTable(articlesDataForChart);
  const commentsDataTable = google.visualization.arrayToDataTable(commentsDataForChart);

    // Optional; add a title and set the width and height of the chart
    var articlesOptions = {'title':'Number of articles', 'width':400, 'height':400, 'legend': {'position': 'none'}};
    var commentsOptions = {'title':'Number of comments', 'width':400, 'height':400, 'legend': {'position': 'none'}};

    var articlesChart = new google.visualization.ColumnChart(document.getElementById('articlesPerUserChart'));
    articlesChart.draw(articlesDataTable, articlesOptions);
    var commentsChart = new google.visualization.ColumnChart(document.getElementById('commentsPerUserChart'));
    commentsChart.draw(commentsDataTable, commentsOptions);

  document.querySelector("#btnDownloadArticlesDataCsv").onclick = () => {
      download("articles_data.csv", articlesDataForChart);
  };
  document.querySelector("#btnDownloadCommentsDataCsv").onclick = () => {
      download("comments_data.csv", commentsDataForChart);
  };
  document.querySelector("#btnDownloadArticlesDataCsv").disabled = false;
  document.querySelector("#btnDownloadCommentsDataCsv").disabled = false;
};

const jsonToCSV = (object) => {
  let csv = '';
  if(!Array.isArray(object)) {
     csv = Object.entries(Object.entries(object)[0][1]).map((e) => e[0]).join(",");
     csv += "\r\n";
  }

  for (const [k,v] of Object.entries(object)) {
    csv += Object.values(v).join(",") + "\r\n";
  }
  return csv;
}

const download = (filename, data) => {
  const text = jsonToCSV(data)

  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

// Load google charts
google.charts.load('current', {'packages':['corechart']});

issueGetRequest()
