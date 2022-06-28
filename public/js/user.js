const usersEndpoint = "../../api/users";
let alertElement = document.querySelector(".alert");

async function issueGetRequest(user_id) {
  const userUrl = `${usersEndpoint}/${user_id}`;
  const usersData = await Promise.all(
    [userUrl].map((url) => fetch(url).then((r) => r.json()))
  );

  displayUserData(usersData);
  attachEventHandlers();
}

const showResponseOnDelete = (response) => {
  if (response.status === 200) {
    showMessage("User was deleted", false);
  } else {
    showMessage("User was not deleted", true);
  }
};

const showResponseOnUpdate = (response) => {
  if (response.status === 200) {
    showMessage("User was updated", false);
  } else {
    showMessage("User was not updated", true);
  }
};

const showResponse = (response) => {
  if (response.status === 201) {
    showMessage("User was created", false);
  } else {
    showMessage("User was not created", true);
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

const issuePutRequest = (id, data, responseHandler) => {
  // update data on the server:
  const url = usersEndpoint + "/" + id;
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
      showResponseOnUpdate(response);
      return response.json();
    })
    .then(responseHandler);
};

const issuePatchRequest = (id, data, responseHandler) => {
  // update data on the server:
  const url = usersEndpoint + "/" + id;
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
      showResponseOnUpdate(response);
      return response.json();
    })
    .then(responseHandler);
};

const issueDeleteRequest = (id, responseHandler) => {
  // delete data on the server:
  const url = usersEndpoint + "/" + id;
  console.log("DELETE request:", url);
  fetch(url, { method: "delete" }).then(responseHandler);
};

const issuePostRequest = (data, responseHandler) => {
  // create data on the server:
  console.log("POST request:", usersEndpoint, data);
  fetch(usersEndpoint, {
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
    firstname: container.querySelector("#firstname").value,
    lastname: container.querySelector("#lastname").value,
    email: container.querySelector("#email").value,
    avatar: container.querySelector("#avatar").value,
    password: container.querySelector("#password").value,
  };
  const callback = (item) => {
    if (item["error"] === undefined) {
      container.innerHTML = getItemHTML(item);
    }
    attachEventHandlers();
  };
  issuePutRequest(id, data, callback);
};

const handlePartialUpdate = (ev) => {
  const id = ev.target.getAttribute("data-id");
  const container = ev.target.parentElement.parentElement;
  const data = {
    email: container.querySelector("#email").value,
  };
  const callback = (item) => {
    if (item["error"] === undefined) {
      container.innerHTML = getItemHTML(item);
    }
    attachEventHandlers();
  };
  issuePatchRequest(id, data, callback);
};


const handleCreate = () => {
  const container = document.querySelector(".add-new-panel");
  data = {
    firstname: container.querySelector(".firstname").value,
    lastname: container.querySelector(".lastname").value,
    email: container.querySelector(".email").value,
    avatar: container.querySelector(".avatar").value,
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
  location.href = "./users.html";
};

const attachEventHandlers = () => {
  for (elem of document.querySelectorAll(".delete")) {
    elem.onclick = handleDelete;
  }
  for (elem of document.querySelectorAll(".edit")) {
    elem.onclick = showEditForm;
  }
    for (elem of document.querySelectorAll(".emailEdit")) {
    elem.onclick = showEmailEditForm;
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
  };
  document.querySelector(".update.save").onclick = handleCreate;
};

const attachFormEventHandlers = (item, container) => {
  container.querySelector(".update").onclick = handleUpdate;
  container.querySelector(".cancel").onclick = () => {
    container.innerHTML = getItemHTML(item);
    attachEventHandlers();
  };
};

const attachEmailFormEventHandlers = (item, container) => {
  container.querySelector(".partialUpdate").onclick = handlePartialUpdate;
  container.querySelector(".cancel").onclick = () => {
    container.innerHTML = getItemHTML(item);
    attachEventHandlers();
  };
};

const showEditForm = (ev) => {
  const id = ev.target.id;
  const url = usersEndpoint + "/" + id;
  const cardElement = ev.target.parentElement.parentElement;
  fetch(url)
    .then((response) => response.json())
    .then((item) => {
      displayForm(item, cardElement);
      attachFormEventHandlers(item, cardElement);
    });
  return false;
};

const showEmailEditForm = (ev) => {
  const id = ev.target.id;
  const url = usersEndpoint + "/" + id;
  const cardElement = ev.target.parentElement.parentElement;
  fetch(url)
    .then((response) => response.json())
    .then((item) => {
      displayEmailForm(item, cardElement);
      attachEmailFormEventHandlers(item, cardElement);
    });
  return false;
};

{
  /* <input type="text" id="email" value="${item.email}"><br> */
}
const displayForm = (item, container) => {
  container.innerHTML = `
        <div style="margin-top:7px;">
            <label>id:</label><span>${item.id}</span><br>
            <label>firstname:</label>
            <input type="text" id="firstname" value="${item.firstname}"><br>
            
            <label>lastname:</label>
            <input type="text" id="lastname" value="${item.lastname}"><br>
            
            <label>email:</label>
            <input type="text" id="email" disabled readOnly value="${item.email}"><br>
            
            <label>avatar:</label>
            <input type="text" id="avatar" value="${item.avatar}"><br>
            
            <input  style="visibility:hidden;"  type="text" id="password" disabled readOnly value="${item.password}"><br>
            <label></label>
            <button type="button" data-id="${item.id}" class="update button-primary">Update</button>
            <button type="button" class="cancel">Cancel</button>
        </div>
    `;
};

const displayEmailForm = (item, container) => {
  container.innerHTML = `
        <div style="margin-top:7px;">
            <label>id:</label><span>${item.id}</span><br>
            <label>firstname:</label>${item.firstname}<br>
            <label>lastname:</label>${item.lastname}<br>
            <label>email:</label>
            <input type="text" id="email"  value="${item.email}"><br>
            <label>avatar:</label><a href="user.html?id=${item.id}" id="gotoUser${item.id}"><img src="${item.avatar}" /></a>
            
            </br>
            <button type="button" data-id="${item.id}" class="partialUpdate button-primary">Update</button>
            <button type="button" class="cancel">Cancel</button>
        </div>
    `;
};


const getItemHTML = (item) => {
  let controls = "";

  if (item.id !== undefined && item.id !== "undefined") {
    controls = `<div class="controls" >
            <i class="fas fa-edit edit" id="${item.id}"></i>
            <i class="fas fa-trash delete" id="${item.id}"></i>
        </div>`;
  }

  return `<div>
        ${controls}
        <label>id:</label><span>${item.id}</span><br>
        <label>firstname:</label><span>${item.firstname}</span><br>
        <label>lastname:</label><span>${item.lastname}</span><br>
        <label>email:</label><span>${item.email}</span><i class="fas fa-edit emailEdit" id="${item.id}"></i><br>
        <label>avatar:</label><img src="${item.avatar}" />
    </div>`;
};

const displayItem = (item, container) => {
  itemHTML = getItemHTML(item);
  container.innerHTML += `
        <div class="card-wrapper">${itemHTML}</div>
    `;
};

const displayUserData = (data) => {
  console.log(data);
  const container = document.querySelector("#container");
  container.innerHTML = "";
  for (item of data) {
    displayItem(item, container);
  }
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

const user_id = getParams()["id"];
issueGetRequest(user_id);
