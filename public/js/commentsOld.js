const endpoint = "../../api/articles";
const endpoints = [
  "../../api/articles",
  "../../api/users",
  "../../api/comments",
];

async function issueGetRequest() {
  // get data from the server:
  const results = await Promise.all(
    endpoints.map((url) => fetch(url).then((r) => r.json()))
  );
  const articlesData = results[0];
  const usersData = results[1];
  const userComments = results[2];
  const tempUserData = {};

  for (let j = 0; j < usersData.length; j++) {
    const user_name = `${usersData[j].firstname} ${usersData[j].lastname}`;
    tempUserData[usersData[j].id.toString()] = user_name;
  }

  for (let i = 0; i < articlesData.length; i++) {
    for (let j = 0; j < usersData.length; j++) {
      if (usersData[j].id === articlesData[i].user_id) {
        articlesData[
          i
        ].user_name = `${usersData[j].firstname} ${usersData[j].lastname}`;
        break;
      }
    }
    if (articlesData[i].user_name === undefined) {
      articlesData[i].user_name = "Unknown user";
    }
    articlesData[i].comments = [];
    for (let j = 0; j < userComments.length; j++) {
      if (userComments[j].article_id === articlesData[i].id) {
        userComments[j].user_name =
          tempUserData[userComments[j].user_id.toString()];
        articlesData[i].comments.push(userComments[j]);
      }
    }
    // sort comments by date:
    articlesData[i].comments.sort((a, b) => a.date < b.date);
  }

  displayArticlesData(articlesData);
}

{
  /* <label>Article id:</label><span>${item.id}</span><br> */
}
const getItemHTML = (item) => {
  return `<div>
        <label>user:</label><span><a href="user.html?id=${item.user_id}">${
    item.user_name
  }</a></span><br>
        <label>date:</label><span>${item.date}</span><br>
        <span><strong>${item.title}</strong></span><br>
        <span>${item.body?.substring(0, 200)} (...)</span><br>
        <span><a href="article.html?id=${
          item.id
        }">See whole article...</a></span><br>
        <br>
        <hr>
        <h3>Comments:</h3>
        <hr>
        ${getCommentsHTML(item.comments)}
    </div>`;
};

const getCommentsHTML = (comments) => {
  let htmlData = "";
  if (comments.length == 0) {
    htmlData = `<div>
        <span>No Comments</span><br>
    </div>`;
  } else {
    for (item of comments) {
      htmlData += getCommentHTML(item);
      htmlData += `<hr><br>`;
    }
  }
  return htmlData;
};

{
  /* <label>id:</label><span>${comments.id}</span><br> */
}
const getCommentHTML = (comment) => {
  return `<div>
        <label>user:</label><span><a href="user.html?id=${comment.user_id}">${comment.user_name}</a></span><br>
        <label>date:</label><span>${comment.date}</span><br>
        <label>comment:</label><span>${comment.body}</span><br>
        <span><a href="comment.html?id=${comment.id}">See comment...</a></span><br>
    </div>`;
};

const displayArticlesData = (data) => {
  const container = document.querySelector("#container");
  container.innerHTML = "";
  for (item of data) {
    displayItem(item, container);
  }
};

const displayItem = (item, container) => {
  itemHTML = getItemHTML(item);
  container.innerHTML += `
        <div class="card-wrapper">${itemHTML}</div>
    `;
};

issueGetRequest();
