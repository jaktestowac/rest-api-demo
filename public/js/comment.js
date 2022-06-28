const commentsEndpoint = "../../api/comments";
const usersEndpoint = "../../api/users";
let user_name = "Unknown";
let article_id = undefined;
let alertElement = document.querySelector(".alert");

async function issueGetRequest(comment_id) {
  const commentUrl = `${commentsEndpoint}/${comment_id}`;
  const commentsData = await Promise.all(
    [commentUrl].map((url) => fetch(url).then((r) => r.json()))
  );

  const commentData = commentsData[0];
  article_id = commentData.article_id;

  // find user:
  const userUrl = `${usersEndpoint}/${commentData.user_id}`;
  const usersData = await Promise.all(
    [userUrl].map((url) => fetch(url).then((r) => r.json()))
  );
  const userData = usersData[0];
  if (userData.firstname === undefined) {
    user_name = "Unknown user";
  } else {
    user_name = `${userData.firstname} ${userData.lastname}`;
  }
  commentData.user_name = user_name;

  displayCommentData(commentData);
  attachEventHandlers();
}

//
//        <label>id:</label><span>${item.id}</span><br>
const getItemHTML = (item) => {
  let controls = "";

  if (item.id !== undefined && item.id !== "undefined") {
    controls = `<div class="controls" >
            <i class="fas fa-edit edit" id="${item.id}"></i>
        </div>`;
    // <i class="fas fa-trash delete" id="${item.id}"></i>
  }

  return `<div style="width:500px;">
        <span><a href="article.html?id=${item.article_id}" id="gotoArticle${item.article_id}">Return to Article...</a></span><br>

        ${controls}
        <label>id:</label><span>${item.id}</span><br>
        <label>user:</label><span><a href="user.html?id=${item.user_id}" id="gotoUser${item.user_id}-${item.id}">${item.user_name}</a></span><br>
        <label>date:</label><span>${item.date}</span><br>
        <label>comment:</label><span style="margin:10px;">${item.body}</span><br>
    </div>`;
};
//        <hr><br>
//        <label>comments:</label><br>
//        ${getCommentsHTML(item.comments)}

const displayCommentData = (item) => {
  const container = document.querySelector("#container");
  container.innerHTML = "";
  displayItem(item, container);
};

const displayItem = (item, container) => {
  itemHTML = getItemHTML(item);
  container.innerHTML += `<div align="center" ><div class="card-wrapper-wide" align="left" style="width:600px;">${itemHTML}</div></div>`;
};

const showResponseOnUpdate = (response) => {
  if (response.status === 200) {
    showMessage("Comment was updated", false);
  } else if (response.status === 409) {
    showMessage("Comment was updated. Invalid credentials!", false);
  } else {
    showMessage("Comment was not updated", true);
  }
};

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

const issuePutRequest = (id, data, responseHandler, basicAuth) => {
  // update data on the server:
  const url = commentsEndpoint + "/" + id;
  console.log("PUT request:", url, data);
  fetch(url, {
    method: "put",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Basic ${basicAuth}`,
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      showResponseOnUpdate(response);
      return response.json();
    })
    .then(responseHandler);
};

const issueDeleteRequest = (id, responseHandler) => {
  // delete data on the server:
  const url = commentsEndpoint + "/" + id;
  console.log("DELETE request:", url);
  fetch(url, { method: "delete" }).then(responseHandler);
};

const issuePostRequest = (data, responseHandler) => {
  // create data on the server:
  console.log("POST request:", commentsEndpoint, data);
  fetch(commentsEndpoint, {
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then(responseHandler);
};

const handleUpdate = (ev) => {
  const id = ev.target.getAttribute("data-id");
  const container = ev.target.parentElement.parentElement;
  const data = {
    body: container.querySelector("#body").value,
    id: container.querySelector("#id").value,
    user_id: container.querySelector("#user_id").value,
    article_id: container.querySelector("#article_id").value,
    date: container.querySelector("#date").value,
  };
  const callback = (item) => {
    item.user_name = user_name;
    if (item["error"] === undefined) {
      container.innerHTML = getItemHTML(item);
    }
    attachEventHandlers();
  };
  issuePutRequest(
    id,
    data,
    callback,
    btoa(
      `${container.querySelector("#email").value}:${
        container.querySelector("#pass").value
      }`
    )
  );
};

const handleCreate = () => {
  const container = document.querySelector(".add-new-panel");
  data = {
    title: container.querySelector("#title").value,
    body: container.querySelector("#body").value,
  };
  issuePostRequest(data, issueGetRequest);
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
  location.href = `article.html?id=${article_id}`;
};

const attachEventHandlers = () => {
  for (elem of document.querySelectorAll(".delete")) {
    elem.onclick = handleDelete;
  }
  for (elem of document.querySelectorAll(".edit")) {
    elem.onclick = showEditForm;
  }
  //    document.querySelector('#add-new').onclick = () => {
  //        const container = document.querySelector('.add-new-panel');
  //        container.querySelector('.firstname').value = '';
  //        container.querySelector('.firstname').value = '';
  //        container.classList.add('active');
  //    };
  document.querySelector(".close").onclick = () => {
    document.querySelector(".add-new-panel").classList.remove("active");
  };
  document.querySelector(".add-new-panel .cancel").onclick = () => {
    document.querySelector(".add-new-panel").classList.remove("active");
    location.reload();
  };
  document.querySelector(".update.save").onclick = handleCreate;
};

const attachFormEventHandlers = (item, container) => {
  container.querySelector(".update").onclick = handleUpdate;
  container.querySelector(".cancel").onclick = () => {
    container.innerHTML = getItemHTML(item);
    location.reload();
    attachEventHandlers();
  };
};

const showEditForm = (ev) => {
  const id = ev.target.id;
  const url = commentsEndpoint + "/" + id;
  const cardElement = ev.target.parentElement.parentElement;
  fetch(url)
    .then((response) => response.json())
    .then((item) => {
      displayForm(item, cardElement);
      attachFormEventHandlers(item, cardElement);
    });
  return false;
};

const displayForm = (item, container) => {
  container.innerHTML = `
        <div style="margin-top:7px; ">
            <label>comment id:</label><span>${item.id}</span><br>
            <input style="visibility:hidden;" type="text" id="id" value="${item.id}"><br>
            <label>body:</label><br>
            <textarea rows="4" type="text" id="body" style="width:475px;" value="${item.body}">${item.body}</textarea><br>
            <input style="visibility:hidden;" type="text" id="date" value="${item.date}"><br>
            <input style="visibility:hidden;" type="text" id="article_id" value="${item.article_id}"><br>
            <input style="visibility:hidden;" type="text" id="user_id" value="${item.user_id}"><br>
            To update provide your credentials:<br>
            Email:<br><input class="body" type="text" id="email" ><br>
            Password:<br><input class="body" type="password" autocomplete="off" value="" id="pass" "><br><br>
    <div align="center" >
            <label></label><br>
            <button type="button" data-id="${item.id}" class="update button-primary">Update</button>
            <button type="button" class="cancel">Cancel</button>
        </div></div>
    `;
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

const comment_id = getParams()["id"];
issueGetRequest(comment_id);
