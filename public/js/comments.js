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
  const tempArticleData = {};

  for (let j = 0; j < usersData.length; j++) {
    const user_name = `${usersData[j].firstname} ${usersData[j].lastname}`;
    tempUserData[usersData[j].id.toString()] = user_name;
  }

  for (let i = 0; i < articlesData.length; i++) {
    tempArticleData[articlesData[i].id.toString()] = articlesData[i];
  }

  for (let j = 0; j < userComments.length; j++) {
    userComments[j].user_name =
      tempUserData[userComments[j].user_id.toString()];
    userComments[j].article =
      tempArticleData[userComments[j].article_id.toString()];
  }
  userComments.sort((a, b) => a.date < b.date);

  displayCommentsData(userComments);
}

// const getItemHTML = (item) => {
//     return `<div>
//         <label>user:</label><span><a href="user.html?id=${item.user_id}" id="gotoUser${item.user_id}-${item.id}">${item.user_name}</a></span><br>
//         <label>date:</label><span>${item.date}</span><br>
//         <span><strong>${item.title}</strong></span><br>
//         <span>${item.body?.substring(0, 200)} (...)</span><br>
//         <span><a href="article.html?id=${item.id}" id="gotoArticle${item.id}">See whole article...</a></span><br>
//         <br>
//         <hr>
//         <h3>Comments:</h3>
//         <hr>
//         ${getCommentsHTML(item.comments)}
//     </div>`;
// };

const getCommentHTML = (comment) => {
  return `<div>
        <label>article:</label></br><span><a href="article.html?id=${
          comment.article?.id
        }" id="gotoArticle${
    comment.article?.id
  }">${comment.article?.title?.substring(0, 50)} (...)</a></span><br>
        <label>user:</label><span><a href="user.html?id=${
          comment.user_id
        }" id="gotoUser${comment.user_id}-${comment.id}">${
    comment.user_name
  }</a></span><br>
        <label>date:</label><span>${comment.date}</span><br>
        <label>comment:</label><span>${comment.body}</span><br>
        <span><strong><a href="comment.html?id=${comment.id}" id="gotoComment${
    comment.id
  }">See comment...</a></strong></span><br>
    </div>`;
};

const displayCommentsData = (data) => {
  const container = document.querySelector("#container");
  container.innerHTML = "";
  for (item of data) {
    displayItem(item, container);
  }
};

const displayItem = (item, container) => {
  if (item !== undefined && item.article !== undefined) {
      itemHTML = getCommentHTML(item);
      container.innerHTML += `
            <div class="card-wrapper">${itemHTML}</div>
        `;
  }
};

issueGetRequest();
