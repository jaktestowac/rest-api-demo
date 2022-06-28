const articlesEndpoint = "../../api/articles";
const usersEndpoint = "../../api/users";
const commentsEndpoint = "../../api/comments";
let user_name = "Unknown";
let users = [];
let article_id = undefined;
let articleData;

async function issueGetRequest(article_id) {
  const articlesUrl = `${articlesEndpoint}/${article_id}`;
  const articlesData = await Promise.all(
    [articlesUrl].map((url) => fetch(url).then((r) => r.json()))
  );
  const usersData = await Promise.all(
    [usersEndpoint].map((url) => fetch(url).then((r) => r.json()))
  );
  users = usersData[0];

  const commentsUrl = `${commentsEndpoint}?article_id=${article_id}`;
  const comments = await Promise.all(
    [commentsUrl].map((url) => fetch(url).then((r) => r.json()))
  );
  articleData = articlesData[0];
  const userComments = comments[0];

  articleData.comments = userComments;

  // sort comments by date:
  articleData.comments.sort((a, b) => a.date < b.date);
  article_id = articleData.id;
  const commentsWithUsers = await Promise.all([
    addUserNameToComments(articleData.comments),
  ]);
  articleData.comments = commentsWithUsers[0];
  articleData = await Promise.all([addUserNameToArticle(articleData)]);
  displayArticlesData(articlesData);
  attachEventHandlers();
}

async function addUserNameToComments(comments) {
  for (let index = 0; index < comments.length; index++) {
    const comment = comments[index];
    const userUrl = `${usersEndpoint}/${comment.user_id}`;
    const usersData = await Promise.all(
      [userUrl].map((url) => fetch(url).then((r) => r.json()))
    );
    const userData = usersData[0];
    if (userData.firstname === undefined) {
      user_name = "Unknown user";
    } else {
      user_name = `${userData.firstname} ${userData.lastname}`;
    }
    comments[index].user_name = user_name;
  }
  return comments;
}
async function addUserNameToArticle(item) {
  const userUrl = `${usersEndpoint}/${item.user_id}`;
  const usersData = await Promise.all(
    [userUrl].map((url) => fetch(url).then((r) => r.json()))
  );
  const userData = usersData[0];
  if (userData.firstname === undefined) {
    user_name = "Unknown user";
  } else {
    user_name = `${userData.firstname} ${userData.lastname}`;
  }
  item.user_name = user_name;
  return item;
}

const getImagesHTML = (image) => {
  let htmlData = "";
  if (image !== undefined) {
    htmlData += `<div align="center" ><img src="${image}" /></div>`;
    //        for (image of images) {
    //            htmlData += `<img src="${image}" />`;
    //            htmlData += `<br>`
    //        }
  }
  return htmlData;
};

//            <i class="fas fa-trash delete" id="${item.id}"></i>
//        <label>id:</label><span>${item.id}</span><br>
const getItemHTML = (item) => {
  let controls = "";

  if (item.id !== undefined && item.id !== "undefined") {
    controls = `<div class="controls" >
            <i class="fas fa-edit edit" id="${item.id}"></i>
            <i class="fas fa-trash delete" id="${item.id}"></i>
        </div>`;
  }

  return `<div>
        ${controls}<br>
        ${getImagesHTML(item.image)}<br>
        <label>title:</label><span>${
          item.title
        }</span><i class="fas fa-edit editName" id="${item.id}"></i><br>
        <label>user:</label><span><a href="user.html?id=${item.user_id}">${
    item.user_name
  }</a></span><br>
        <label>date:</label><span>${item.date}</span><br>
        <label></label><span>${item.body}</span><br>
    </div>`;
};
//        <hr><br>
//        <label>comments:</label><br>
//        ${getCommentsHTML(item.comments)}

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

const getCommentHTML = (comments) => {
  return `<div>
        <label>id:</label><span>${comments.id}</span><br>
        <label>author:</label><span><a href="user.html?id=${comments.user_id}" id="gotoUser${comments.id}-${comments.user_id}">${comments.user_name}</a></span><br>
        <label>date:</label><span>${comments.date}</span><br>
        <label>comment:</label><span>${comments.body}</span><br>
        <span><a href="comment.html?id=${item.id}" id="gotoComment${item.id}">See More...</a></span><br>
    </div>`;
};

const displayArticlesData = (data) => {
  const container = document.querySelector("#container");
  container.innerHTML = "";
  for (item of data) {
    displayItem(item, container);
  }
  const containerComments = document.querySelector("#containerComments");
  containerComments.innerHTML = "";
  for (item of data) {
    displayComments(item, containerComments);
  }
};

const displayComments = (item, container) => {
  itemHTML = getCommentsHTML(item.comments);
  container.innerHTML += `<div align="center" ><div class="card-wrapper-wide" align="left">${itemHTML}</div></div><br>`;
};
const displayItem = (item, container) => {
  itemHTML = getItemHTML(item);
  container.innerHTML += `<div align="center" ><div class="card-wrapper-wide" align="left">${itemHTML}</div></div>`;
};

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

article_id = getParams()["id"];
issueGetRequest(article_id);

let alertElement = document.querySelector(".alert");

const showMessage = (message, isError = false) => {
  alertElement.innerHTML = message;
  alertElement.classList.remove("alert-error", "alert-success");
  if (isError) {
    alertElement.classList.add("alert-error");
  } else {
    alertElement.classList.add("alert-success");
  }
  var newMessageElement = alertElement.cloneNode(true);
  alertElement.parentNode.replaceChild(newMessageElement, alertElement);
  alertElement = newMessageElement;
};

const issuePatchRequest = (id, data, responseHandler) => {
  // update data on the server:
  const url = articlesEndpoint + "/" + id;
  console.log("PATCH request:", url, data);
  fetch(url, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      showResponseOnUpdate(response, "Article");
      return response.json();
    })
    .then(responseHandler);
};

const issuePutRequest = (id, data, responseHandler) => {
  // update data on the server:
  const url = articlesEndpoint + "/" + id;
  console.log("PUT request:", url, data);
  fetch(url, {
    method: "put",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      showResponseOnUpdate(response, "Article");
      return response.json();
    })
    .then(responseHandler);
};

const showResponseOnCreate = (response, item) => {
  if (response.status === 201) {
    showMessage(`${item} was created`, false);
  } else {
    showMessage(`${item} was not created`, true);
  }
};

const showResponseOnDelete = (response, item) => {
  if (response.status === 200) {
    showMessage(`${item} was deleted`, false);
  } else {
    showMessage(`${item} was not deleted`, true);
  }
};

const showResponseOnUpdate = (response, item) => {
  if (response.status === 200) {
    showMessage(`${item} was updated`, false);
  } else {
    showMessage(`${item} was not updated`, true);
  }
};

const issueDeleteRequest = (id, responseHandler) => {
  // delete data on the server:
  const url = articlesEndpoint + "/" + id;
  console.log("DELETE request:", url);
  fetch(url, { method: "delete" })
    .then((response) => {
      showResponseOnDelete(response, "Article");
      return response.json();
    })
    .then(responseHandler);
};

const issueArticlePostRequest = (data, responseHandler) => {
  // create data on the server:
  console.log("POST request:", articlesEndpoint, data);
  fetch(articlesEndpoint, {
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then(responseHandler);
};
const issueCommentPostRequest = (data, responseHandler, basicAuth) => {
  // create data on the server:
  console.log("POST request:", commentsEndpoint, data);
  fetch(commentsEndpoint, {
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Basic ${basicAuth}`,
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      showResponseOnCreate(response, "Comment");
      return response.json();
    })
    .then(responseHandler);
};

const handleUpdate = (ev) => {
  const id = ev.target.getAttribute("data-id");
  const container = ev.target.parentElement.parentElement;
  const data = {
    title: container.querySelector("#title").value,
    body: container.querySelector("#body").value,
    user_id: container.querySelector("#user_id").value,
    date: container.querySelector("#date").value,
    image: container.querySelector("#image").value,
  };
  const callback = (item) => {
    if (item["error"] === undefined) {
      item.user_name = user_name;
      container.innerHTML = getItemHTML(item);
    }
    attachEventHandlers();
  };
  issuePutRequest(id, data, callback);
};

const handleUpdateName = (ev) => {
  const id = ev.target.getAttribute("data-id");
  const container = ev.target.parentElement.parentElement;
  const data = {
    title: container.querySelector("#title").value,
  };
  const callback = (item) => {
    if (item["error"] === undefined) {
      item.user_name = user_name;
      container.innerHTML = getItemHTML(item);
    }
    attachEventHandlers();
  };
  issuePatchRequest(id, data, callback);
};
function pad(num, size = 2) {
  num = num.toString();
  while (num.length < size) num = "0" + num;
  return num;
}

const handleCommentCreate = () => {
  const container = document.querySelector(".add-new-panel");
  const today = new Date();
  const date =
    today.getFullYear() +
    "-" +
    pad(today.getMonth() + 1) +
    "-" +
    pad(today.getDate());

  const userEmail = container.querySelector("#email").value;
  const foundUser = users.find((u) => u.email === userEmail);

  data = {
    article_id: article_id,
    body: container.querySelector("#body").value,
    user_id: foundUser?.id ?? undefined,
    date: date,
  };
  issueCommentPostRequest(
    data,
    issueGetRequest(article_id),
    btoa(
      `${container.querySelector("#email").value}:${
        container.querySelector("#pass").value
      }`
    )
  );
  document.querySelector(".add-new-panel").classList.remove("active");
};

const handleDelete = (ev) => {
  const id = ev.target.id;
  const areYouSure = confirm(
    "Are you sure that you want to delete item #" + id + "?"
  );
  if (!areYouSure) {
    return;
  }
  issueDeleteRequest(id, actionAfterDelete);
};

const actionAfterDelete = () => {
  location.href = "./articles.html";
};

const attachEventHandlers = () => {
  for (elem of document.querySelectorAll(".delete")) {
    elem.onclick = handleDelete;
  }
  for (elem of document.querySelectorAll(".edit")) {
    elem.onclick = showEditForm;
  }
  for (elem of document.querySelectorAll(".editName")) {
    elem.onclick = showEditNameForm;
  }
  document.querySelector("#add-new").onclick = () => {
    window.scrollTo(0, 0);
    const container = document.querySelector(".add-new-panel");
    container.querySelector(".body").value = "";
    container.querySelector("#email").value = "";
    container.querySelector("#pass").value = "";
    container.querySelector("#body").value = "";
    container.classList.add("active");
  };
  document.querySelector(".close").onclick = () => {
    document.querySelector(".add-new-panel").classList.remove("active");
  };
  document.querySelector(".add-new-panel .cancel").onclick = () => {
    document.querySelector(".add-new-panel").classList.remove("active");
    location.reload();
  };
  document.querySelector(".update.save").onclick = handleCommentCreate;
};

const attachFormEventHandlers = (item, container) => {
  container.querySelector(".update").onclick = handleUpdate;
  container.querySelector(".cancel").onclick = () => {
    container.innerHTML = getItemHTML(item);
    location.reload();
    attachEventHandlers();
  };
};

const attachNameFormEventHandlers = (item, container) => {
  container.querySelector(".updateName").onclick = handleUpdateName;
  container.querySelector(".cancel").onclick = () => {
    container.innerHTML = getItemHTML(item);
    location.reload();
    attachEventHandlers();
  };
};
const showEditForm = (ev) => {
  const id = ev.target.id;
  const url = articlesEndpoint + "/" + id;
  const cardElement = ev.target.parentElement.parentElement;
  fetch(url)
    .then((response) => response.json())
    .then((item) => {
      displayForm(item, cardElement);
      attachFormEventHandlers(item, cardElement);
    });
  return false;
};
const showEditNameForm = (ev) => {
  const id = ev.target.id;
  const url = articlesEndpoint + "/" + id;
  const cardElement = ev.target.parentElement.parentElement;
  fetch(url)
    .then((response) => response.json())
    .then((item) => {
      displayNameForm(item, cardElement);
      attachNameFormEventHandlers(item, cardElement);
    });
  return false;
};

const displayForm = (item, container) => {
  container.innerHTML = `
        <div style="margin-top:7px; width:500px;">
            <label>id:</label><span>${item.id}</span><br>
            <label>title:</label>
            <input type="text" id="title" value="${item.title}"><br>
            </br>
            <label>body:</label><br>
            <textarea rows="4" type="text" id="body" style="width:350px;" value="${item.body}">${item.body}</textarea><br>
            <input style="visibility:hidden;" type="text" id="user_id" value="${item.user_id}"><br>
            <input style="visibility:hidden;" type="text" id="date" value="${item.date}"><br>
            <label>image:</label>
            <input type="text" id="image" value="${item.image}"><br><br>
    </div>
    <div align="center" >
            <label></label><br>
            <button type="button" data-id="${item.id}" class="update button-primary">Update</button>
            <button type="button" class="cancel">Cancel</button>
        </div>
    `;
};

const displayNameForm = (item, container) => {
  container.innerHTML = `
    <div style="margin-top:7px; width:1200px;">
        ${getImagesHTML(item.image)}<br>
            <label>title:</label>
            <input type="text" id="title" value="${item.title}"><br>
            <label>user:</label><span><a href="user.html?id=${item.user_id}">${
    item.user_id
  }</a></span><br>
            <label>date:</label><span>${item.date}</span><br>
            <label></label><span>${item.body}</span><br>
            <label></label><br>
            <button type="button" data-id="${
              item.id
            }" class="updateName button-primary">Update</button>
            <button type="button" class="cancel">Cancel</button>
        </div>
    `;
};
