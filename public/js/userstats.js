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
    const articlesDataTable = google.visualization.arrayToDataTable(articlesDataForChart);
    const commentsDataTable = google.visualization.arrayToDataTable(commentsDataForChart);

    let articlesOptions;
    let commentsOptions;
    let articlesChart;
    let commentsChart;
    let typeIsCharts = false
    let typeIsTable = false

    if (chartType === 'pie') {
       articlesChart = new google.visualization.PieChart(document.getElementById('articlesPerUserChart'));
       commentsChart = new google.visualization.PieChart(document.getElementById('commentsPerUserChart'));

       articlesOptions = {'title':'Number of articles', 'width':400, 'height':400, 'legend': {'position': 'left', 'textStyle' :{ 'fontSize': 10}}};
       commentsOptions = {'title':'Number of comments', 'width':400, 'height':400, 'legend': {'position': 'left', 'textStyle' :{ 'fontSize': 10}}};
       articlesOptions.chartArea = {'left': 20, 'right': 20, 'top': 40, 'bottom': 20}
       commentsOptions.chartArea = {'left': 20, 'right': 20, 'top': 40, 'bottom': 20}
       typeIsCharts = true
    } else if (chartType === 'table') {
        typeIsTable = true
    } else {
        articlesChart = new google.visualization.ColumnChart(document.getElementById('articlesPerUserChart'));
        commentsChart = new google.visualization.ColumnChart(document.getElementById('commentsPerUserChart'));

        articlesOptions = {'title':'Number of articles', 'width':400, 'height':400, 'legend': {'position': 'none'}};
        commentsOptions = {'title':'Number of comments', 'width':400, 'height':400, 'legend': {'position': 'none'}};
        typeIsCharts = true
    }

    if (typeIsCharts) {
        articlesChart.draw(articlesDataTable, articlesOptions);
        commentsChart.draw(commentsDataTable, commentsOptions);

        document.querySelector("#btnDownloadArticlesDataCsv").onclick = () => {
          download("articles_data.csv", articlesDataForChart);
        };
        document.querySelector("#btnDownloadCommentsDataCsv").onclick = () => {
          download("comments_data.csv", commentsDataForChart);
        };
        document.querySelector("#btnDownloadArticlesDataCsv").disabled = false;
        document.querySelector("#btnDownloadCommentsDataCsv").disabled = false;
        document.querySelector("#tableChart").style.visibility= "visible"
        document.querySelector("#tableData").style.visibility= "collapse"
    }
    if (typeIsTable) {
        const tableElement = document.getElementById("tableDataBody");
        for (const user_id in userIdToName) {
            let userName = userIdToName[user_id]
            let userLink = `<a href="user.html?id=${user_id}">${userName}</a>`
            let articlesCount = articlesPerUser[user_id] ?? 0
            let commentsCount = commentsPerUser[user_id] ?? 0
            tableElement.innerHTML += `<tr><td style="text-align: center">${userLink}</td>
                <td style="text-align: center">${articlesCount}</td>
                <td style="text-align: center">${commentsCount}</td></tr>`
        }
        document.querySelector("#tableData").style.visibility= "visible"
        document.querySelector("#tableChart").style.visibility= "collapse"
    }
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

function getParams() {
  var values = {};
  var parts = window.location.href.replace(
    /[?&]+([^=&]+)=([^&]*)/gi,
    function (m, key, value) {
      values[key] = value;
    }
  );
  return values;
}

// Load google charts
google.charts.load('current', {'packages':['corechart']});

const chartType = getParams()["type"];
issueGetRequest()
