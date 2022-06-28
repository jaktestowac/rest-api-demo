const jsonServer = require("./json-server");
const { validations, validateEmail } = require("./validators");
const fs = require("fs");
const jwt = require('jsonwebtoken')
const authUserDb = './admins.json'


function userDb(){
  return JSON.parse(fs.readFileSync(authUserDb, 'UTF-8'));
  
}


let updatedSchema = false;

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const adminRouter = jsonServer.router("admin-db.json");
const path = require("path");
const { pluginStatuses, formatErrorResponse, getRandomIdBasedOnDay } = require("./consts");
const { logDebug } = require("./loggerApi");
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 3000;

const customRoutes = (req, res, next) => {
  try {
    if (!updatedSchema) {
      try {
        const host = req.headers.host;
        const referer = req.headers.referer;
        const schema = JSON.parse(
          fs.readFileSync(
            path.join(__dirname, "public/tools/schema/openapi_rest_demo.json"),
            "utf8"
          )
        );
        const schemaV2 = JSON.parse(
          fs.readFileSync(
            path.join(__dirname, "public/tools/schema/openapi_rest_demo_v2.json"),
            "utf8"
          )
        );
        if (referer !== undefined) {
          const newAddr = `${referer.split(":")[0]}://${host}/api`;
          if (newAddr !== schema["servers"][0]["url"]) {
            schema["servers"][0]["url"] = newAddr;
            fs.writeFileSync(
              path.join(
                __dirname,
                "public/tools/schema/openapi_rest_demo.json"
              ),
              JSON.stringify(schema, null, 2)
            );
          }
          const newAddrV2 = `${referer.split(":")[0]}://${host}/api/v2`;
          if (newAddrV2 !== schemaV2["servers"][0]["url"]) {
            schemaV2["servers"][0]["url"] = newAddrV2;
            fs.writeFileSync(
              path.join(
                __dirname,
                "public/tools/schema/openapi_rest_demo_v2.json"
              ),
              JSON.stringify(schemaV2, null, 2)
            );
          }
          updatedSchema = true;
        }
      } catch (error) {
        console.log(error);
      }
    }
    if (req.method === "GET" && req.url.endsWith("/restoreDB")) {
      const db = JSON.parse(
        fs.readFileSync(path.join(__dirname, "db-base.json"), "utf8")
      );
      router.db.setState(db);
      logDebug("restoreDB successful");
      res.status(201).send({ message: "Database successfully restored" });
    } else if (req.method === "GET" && req.url.endsWith("/db")) {
      const dbData = JSON.parse(
        fs.readFileSync(path.join(__dirname, "db.json"), "utf8")
      );
      res.json(dbData);
      req.body = dbData;
    } else if (req.method === "GET" && req.url.endsWith("/userpics")) {
      const files = fs.readdirSync(path.join(__dirname, "/public/data/users"));
      res.json(files);
      req.body = files;
    } else if (req.method === "GET" && req.url.endsWith("/allimages")) {
      const files = fs.readdirSync(
        path.join(__dirname, "/public/data/images/256")
      );
      res.json(files);
      req.body = files;
    } else if (req.method === "GET" && req.url.endsWith("/pluginstatuses")) {
      res.json(pluginStatuses);
      req.body = pluginStatuses;
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send(formatErrorResponse("Fatal error. Please contact administrator."));
  }
};

server.use(middlewares);
server.use(jsonServer.bodyParser);

// https://github.com/techiediaries/fake-api-jwt-json-server
// JWT: based on https://github.com/techiediaries/fake-api-jwt-json-server/blob/master/server.js
const SECRET_KEY = "123456789";

const expiresIn = "1h";

// Create a token from a payload
function createToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
}

// Verify the token
function verifyToken(token) {
  return jwt.verify(token, SECRET_KEY, (err, decode) =>
    decode !== undefined ? decode : err
  );
}

// Check if the user exists in database
function isAuthenticated({ email, password }) {
  return (
    userDb().users.findIndex(
      (user) => user.email === email && user.password === password
    ) !== -1
  );
}

// Replace content of two file with another (i.e. db restoration)
function replaceContents(file, replacement, cb) {

  fs.readFile(replacement, (err, contents) => {
    if (err) return cb(err);
    fs.writeFile(file, contents, cb);
  });

}

// Restore admin DBs
server.get("/api/v2/restoreDB", (req, res) => {
  logDebug("restore DB for admins and plugins");
  let error1 = '';
  let error2 = '';

  replaceContents('admin-db-base.json', 'admin-db.json', err => {
    if (err) {
      error1 = err;
    }
    console.log('admin db restored');
  });

  replaceContents('admins.json', 'admins-base.json', err => {
    if (err) {
      error2 = err;
    }
    console.log('admins db restored');
  });

  if (error1 || error2) {
      const status = 401;
      const message = `Restore admin db (plugins) err: ${error1}, Restore admins err: ${error2}`;
      res.status(status).json({ status, message });
      return;
  }
  
  res.status(200).json("DBs: admin (plugins) and admins restored;");
});

// Register New User
server.post("/api/v2/register", (req, res) => {
  logDebug("register endpoint called; request body:");
  console.log(req.body);
  const { email, password } = req.body;

  if (!validateEmail(email)) {
    const status = 422;
    const message = "Invalid email";
    res.status(status).json({ status, message });
    return;
  }

  if (isAuthenticated({ email, password }) === true) {
    const status = 401;
    const message = "Email and Password already exist";
    res.status(status).json({ status, message });
    return;
  }

  fs.readFile(authUserDb, (err, data) => {
    if (err) {
      const status = 401;
      const message = err;
      res.status(status).json({ status, message });
      return;
    }

    // Get current users data
    var data = JSON.parse(data.toString());

    // Get the id of last user
    var last_item_id = data.users[data.users.length - 1].id;

    //Add new user
    data.users.push({ id: last_item_id + 1, email: email, password: password }); //add some data
    var writeData = fs.writeFile(
      authUserDb,
      JSON.stringify(data),
      (err, result) => {
        // WRITE
        if (err) {
          const status = 401;
          const message = err;
          res.status(status).json({ status, message });
          return;
        }
      }
    );
  });

  // Create token for new user
  const access_token = createToken({ email, password });
  logDebug("Access Token:" + access_token);
  res.status(200).json({ access_token });
});

// Login to one of the users from ./users.json
server.post("/api/v2/login", (req, res) => {
  logDebug("login endpoint called; request body:");
  console.log(req.body);
  const { email, password } = req.body;
  if (isAuthenticated({ email, password }) === false) {
    const status = 401;
    const message = "Incorrect email or password";
    res.status(status).json({ status, message });
    return;
  }
  const access_token = createToken({ email, password });
  logDebug("Access Token:" + access_token);
  res.status(200).json({ access_token });
});

// server.use(/^(?!\/auth).*$/, (req, res, next) => {
server.use(/(\/api\/v2).*$/, (req, res, next) => {
  if (
    req.headers.authorization === undefined ||
    req.headers.authorization.split(" ")[0] !== "Bearer"
  ) {
    const status = 401;
    const message = "Error in authorization format";
    res.status(status).json({ status, message });
    return;
  }
  try {
    let verifyTokenResult;
    logDebug("req.headers.authorization:" + req.headers.authorization);
    const access_token = req.headers.authorization.split(" ")[1]
    logDebug("Access Token:" + access_token);
    verifyTokenResult = verifyToken(access_token);

    if (verifyTokenResult instanceof Error) {
      const status = 401;
      const message = "Access token not provided";
      res.status(status).json({ status, message });
      return;
    }
    next();
  } catch (err) {
    const status = 401;
    const message = "Error access_token is revoked";
    res.status(status).json({ status, message });
  }
});


server.use(customRoutes);
server.use(validations);
server.use("/api/v2", adminRouter);
server.use("/api", router);

server.listen(port, () => {
  logDebug(`Test Custom Data API listening on port ${port}!`);
});
