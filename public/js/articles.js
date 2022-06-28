const articlesEndpoint = "../../api/articles";
const usersEndpoint = "../../api/users";
const pictureListEndpoint = "../../api/allimages";
let picList = [];
let users = [];

async function issueGetRequest() {
  // get data from the server:
  const results = await Promise.all(
    [articlesEndpoint, usersEndpoint].map((url) =>
      fetch(url).then((r) => r.json())
    )
  );

  const articlesData = results[0];
  const usersData = results[1];
  users = usersData;

  for (let i = 0; i < articlesData.length; i++) {
    for (let j = 0; j < usersData.length; j++) {
      if (usersData[j].id?.toString() === articlesData[i].user_id?.toString()) {
        articlesData[
          i
        ].user_name = `${usersData[j].firstname} ${usersData[j].lastname}`;
        articlesData[i].user_id = usersData[j].id;
        break;
      }
    }
    if (articlesData[i].user_name === undefined) {
      articlesData[i].user_name = "Unknown user";
    }
  }
  // sort articles by date:
  articlesData.sort((a, b) => a.date < b.date);

  displayPostsData(articlesData);
  attachEventHandlers();
}

const attachEventHandlers = () => {
  document.querySelector("#add-new").onclick = () => {
    window.scrollTo(0, 0);
    const container = document.querySelector(".add-new-panel");
    container.querySelector(".body").value = "";
    container.querySelector(".title").value = "";
    let index = 0;
    for (element of picList) {
      var opt = document.createElement("option");
      opt.value = element;
      opt.innerHTML = element; // whatever property it has

      container.querySelector(".image").appendChild(opt);
      index++;
    }
    index = 0;
    for (element of users) {
      var opt = document.createElement("option");
      opt.value = element.id;
      opt.innerHTML = `${element.firstname} ${element.lastname}`;

      container.querySelector(".user").appendChild(opt);
      index++;
    }
    container.classList.add("active");
  };
  document.querySelector(".close").onclick = () => {
    document.querySelector(".add-new-panel").classList.remove("active");
  };
  document.querySelector(".add-new-panel .cancel").onclick = () => {
    document.querySelector(".add-new-panel").classList.remove("active");
  };
  document.querySelector(".update.save").onclick = handleCreate;
};

let alertElement = document.querySelector(".alert");

const showResponseOnDelete = (response) => {
  if (response.status === 200) {
    showMessage("Article was deleted", false);
  } else {
    showMessage("Article was not deleted", true);
  }
};

const showResponseOnUpdate = (response) => {
  if (response.status === 200) {
    showMessage("Article was updated", false);
  } else {
    showMessage("Article was not updated", true);
  }
};

const showResponse = (response) => {
  if (response.status === 201) {
    showMessage("Article was created", false);
  } else {
    showMessage("Article was not created", true);
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
function pad(num, size = 2) {
  num = num.toString();
  while (num.length < size) num = "0" + num;
  return num;
}

const handleCreate = () => {
  const container = document.querySelector(".add-new-panel");

  const today = new Date();
  const date =
    today.getFullYear() +
    "-" +
    pad(today.getMonth() + 1) +
    "-" +
    pad(today.getDate());

  data = {
    title: container.querySelector(".title").value,
    body: container.querySelector(".body").value,
    user_id: container.querySelector(".user").value,
    date: date,
    image: `.\\data\\images\\256\\${container.querySelector(".image").value}`,
  };
  issueArticleRequest(data, issueGetRequest);
  document.querySelector(".add-new-panel").classList.remove("active");
};
const issueArticleRequest = (data, responseHandler) => {
  // create data on the server:
  console.log("POST request:", articlesEndpoint, data);
  fetch(articlesEndpoint, {
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => showResponse(response))
    .then(responseHandler);
};
const attachFormEventHandlers = (item, container) => {
  container.querySelector(".update").onclick = handleUpdate;
  container.querySelector(".cancel").onclick = () => {
    container.innerHTML = getItemHTML(item);
    attachEventHandlers();
  };
};
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

//        <label>id:</label><span>${item.id}</span><br>
const getItemHTML = (item) => {
  return `<div>
        <a href="article.html?id=${item.id}" id="gotoArticle${
    item.id
  }">${getImagesHTML(item.image)}</a><br>
        <div align="center" ><strong>${item.title}</strong></div><br>
        <label>user:</label><span><a href="user.html?id=${
          item.user_id
        }" id="gotoUser${item.user_id}-${item.id}">${
    item.user_name
  }</a></span><br>
        <label>date:</label><span>${item.date}</span><br>
        <label></label><span>${item.body?.substring(0, 200)} (...)</span><br>
        <span><a href="article.html?id=${item.id}" id="seeArticle${
    item.id
  }">See More...</a></span><br>
    </div>`;
};

const displayPostsData = (data) => {
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

async function getPictureList() {
  picList = await Promise.all(
    [pictureListEndpoint].map((url) => fetch(url).then((r) => r.json()))
  );
  picList = picList[0];
}

getPictureList();
issueGetRequest();
