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

    const commentsPerArticle = {}
    const articleIdToTitle = {}

    for (let j = 0; j < articlesData.length; j++) {
        articleIdToTitle[articlesData[j].id] = `${articlesData[j].title?.substring(0, 200)} (...)`
    }

    for (let j = 0; j < commentsData.length; j++) {
        if(!(commentsData[j].article_id in commentsPerArticle)) {
            commentsPerArticle[commentsData[j].article_id] = 0
        }
        commentsPerArticle[commentsData[j].article_id]++
    }

    const articlesDataForChart = [['Article', 'Number of comments']]

    for (const user_id in commentsPerArticle) {
       articlesDataForChart.push([articleIdToTitle[user_id], commentsPerArticle[user_id]])
    }

    // Doc: https://developers.google.com/chart/interactive/docs/gallery/columnchart?hl=pl
    const articlesDataTable = google.visualization.arrayToDataTable(articlesDataForChart);

    let commentsPerArticleOptions;
    let commentsPerArticleChart;

    if (chartType === 'pie') {
       commentsPerArticleChart = new google.visualization.PieChart(document.getElementById('commentsPerArticle'));

       commentsPerArticleOptions = {'title':'Number of comments per article', 'width':720, 'height':400, 'legend': {'position': 'left', 'textStyle' :{ 'fontSize': 10}}};
       commentsPerArticleOptions.chartArea = {'left': 20, 'right': 20, 'top': 40, 'bottom': 20}
    } else {
        commentsPerArticleChart = new google.visualization.ColumnChart(document.getElementById('commentsPerArticle'));
        commentsPerArticleOptions = {'title':'Number of comments per article', 'width':720, 'height':400, 'legend': {'position': 'none'}};
    }

    commentsPerArticleChart.draw(articlesDataTable, commentsPerArticleOptions);

    document.querySelector("#btnDownloadArticlesDataCsv").onclick = () => {
      download("comments_per_article_data.csv", articlesDataForChart);
    };
    document.querySelector("#btnDownloadArticlesDataCsv").disabled = false;
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
