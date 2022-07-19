const FILE_TYPE = "application/json"
let fileContent = ''
const articlesEndpoint = "../../api/articles";


const handleCreate = () => {
  const today = new Date();
  const date =
    today.getFullYear() +
    "-" +
    pad(today.getMonth() + 1) +
    "-" +
    pad(today.getDate());
  try {
    fileContent = JSON.parse(fileContent)
  } catch (e) {
    fileContent = {}
  }
  fileContent.date = date
  fileContent.id = undefined
  issueArticleRequest(fileContent);
};

const issueArticleRequest = (data) => {
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
    .then((response) => {
        response.json().then(data => {
            console.log(data)
            const container = document.querySelector("#infoContainer");
            container.innerHTML = `Article created! <br/>Read it <strong><a href="../article.html?id=${data.id}">here</a></strong>!`;
        })
    })
    .then((response) => {
        document.querySelector("#uploadBtn").disabled = true
    });
};

const showResponse = (response) => {
  if (response.status === 201) {
    showMessage("Article was created", false);
  } else {
    showMessage("Article was not created", true);
  }
};

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

function pad(num, size = 2) {
  num = num.toString();
  while (num.length < size) num = "0" + num;
  return num;
}

const attachEventHandlers = () => {
  var dropzone = document.getElementById('dropzone');

  dropzone.ondrop = function(e) {
    e.preventDefault();
    this.className = 'dropzone';
  };

  dropzone.ondragover = function() {
    this.className = 'dropzone dragover';
    return false;
  };

  dropzone.ondragleave = function() {
    this.className = 'dropzone';
  };

  dropzone.ondrop = function(event) {
    const [item] = event.dataTransfer.items;
    const itemData = item.getAsFile()
    itemData.text().then(data => {

        if (itemData.type === FILE_TYPE) {
            const container = document.querySelector("#infoContainer");
            container.innerHTML = `File "${itemData.name}" ready`;
            fileContent = data;
            document.querySelector("#uploadBtn").disabled = false;
        } else {
            const container = document.querySelector("#infoContainer");
            container.innerHTML = `Invalid file type! Must be ${FILE_TYPE}`;
            document.querySelector("#uploadBtn").disabled = true;
        }
    })

    document.querySelector("#uploadBtn").onclick = () => {
        handleCreate()
    };
    event.preventDefault();
    this.className = 'dropzone';
  };
};


attachEventHandlers();
