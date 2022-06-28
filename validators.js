const e = require("express");
const fs = require("fs");
const path = require("path");
const {
  tomorrow,
  pluginStatuses,
  bearerToken,
  basicAuth,
  formatErrorResponse,
  getRandomIdBasedOnDay,
} = require("./consts");
const { logDebug } = require("./loggerApi");

const mandatory_non_empty_fields_user = [
  "firstname",
  "lastname",
  "email",
  "avatar",
];
const all_fields_user = [
  "id",
  "firstname",
  "lastname",
  "email",
  "avatar",
  "password",
];
const mandatory_non_empty_fields_article = ["user_id", "title", "body", "date"];
const all_fields_article = ["id", "user_id", "title", "body", "date", "image"];
const mandatory_non_empty_fields_comment = [
  "user_id",
  "article_id",
  "body",
  "date",
];
const all_fields_comment = ["id", "user_id", "article_id", "body", "date"];
const all_fields_plugin = ["id", "name", "status", "version"];
const mandatory_non_empty_fields_plugin = ["name", "status", "version"];

function is_plugin_status_valid(body) {
  if (pluginStatuses.findIndex((status) => status === body["status"]) === -1) {
    return false;
  }
  return true;
}

function are_mandatory_fields_valid(body, mandatory_non_empty_fields) {
  for (let index = 0; index < mandatory_non_empty_fields.length; index++) {
    const element = mandatory_non_empty_fields[index];
    if (
      body[element] === undefined ||
      body[element] === "" ||
      body[element]?.length === 0
    ) {
      logDebug(`Field validation: field ${element} not valid ${body[element]}`);
      return false;
    }
  }
  return true;
}

function are_all_fields_valid(
  body,
  all_possible_fields,
  mandatory_non_empty_fields,
  max_field_length = 10000
) {
  const keys = Object.keys(body);
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    if (!all_possible_fields.includes(key)) {
      logDebug(`Field validation: ${key} not in ${all_possible_fields}`);
      return false;
    }
    const element = body[key];
    if (element?.toString().length > max_field_length) {
      logDebug(`Field validation: ${key} longer than ${max_field_length}`);
      return false;
    }
    if (mandatory_non_empty_fields.includes(key)) {
      if (element === undefined || element?.toString().length === 0) {
        logDebug("Body:", body);
        logDebug(
          `Field validation: ${key} is empty! Mandatory fields: ${mandatory_non_empty_fields}`
        );
        return false;
      }
    }
  }
  return true;
}

const validateEmail = (email) => {
  return email.match(/^\S+@\S+\.\S+$/);
};

const validations = (req, res, next) => {
  try {
    const urlEnds = req.url.replace(/\/\/+/g, "/");
    if (
      (req.url.includes("/api/users") ||
        req.url.includes("/api/comments") ||
        req.url.includes("/api/articles") ||
        req.url.includes("/api/plugins")) &&
      req.body?.length > 0
    ) {
      try {
        JSON.parse(req.body);
      } catch (error) {
        logDebug(`Error: ${JSON.stringify(error)}`);
        res
          .status(400)
          .send(formatErrorResponse("Bad request - malformed JSON"));
        return;
      }
    }

    if (req.method === "POST" && urlEnds.endsWith("/api/users")) {
      // validate mandatory fields:
      if (
        !are_mandatory_fields_valid(req.body, mandatory_non_empty_fields_user)
      ) {
        res
          .status(422)
          .send(
            formatErrorResponse(
              "One of mandatory field is missing",
              mandatory_non_empty_fields_user
            )
          );
        return;
      }
      // validate email:
      if (!validateEmail(req.body["email"])) {
        res.status(422).send(formatErrorResponse("Invalid email"));
        return;
      }
      // validate all fields:
      if (
        !are_all_fields_valid(
          req.body,
          all_fields_user,
          mandatory_non_empty_fields_user
        )
      ) {
        res
          .status(422)
          .send(
            formatErrorResponse(
              "One of field is invalid (empty, invalid or too long) or there are some additional fields",
              all_fields_user
            )
          );
        return;
      }
      const dbData = fs.readFileSync(path.join(__dirname, "db.json"), "utf8");
      if (dbData.includes(req.body["email"])) {
        res.status(409).send(formatErrorResponse("Email not unique"));
        return;
      }
    }
    if (req.method === "PUT" && urlEnds.includes("/api/users/")) {
      const urlParts = urlEnds.split("/");
      let userId = urlParts[urlParts.length - 1];
      // validate mandatory fields:
      if (
        !are_mandatory_fields_valid(req.body, mandatory_non_empty_fields_user)
      ) {
        res
          .status(422)
          .send(
            formatErrorResponse(
              "One of mandatory field is missing",
              mandatory_non_empty_fields_user
            )
          );
        return;
      }
      // validate all fields:
      if (
        !are_all_fields_valid(
          req.body,
          all_fields_user,
          mandatory_non_empty_fields_user
        )
      ) {
        res
          .status(422)
          .send(
            formatErrorResponse(
              "One of field is invalid (empty, invalid or too long) or there are some additional fields",
              all_fields_user
            )
          );
        return;
      }
      const dbData = fs.readFileSync(path.join(__dirname, "db.json"), "utf8");
      const dbDataJson = JSON.parse(dbData);
      const foundMail = dbDataJson["users"].find((user) => {
        if (
          user["id"]?.toString() !== userId?.toString() &&
          user["email"] === req.body["email"]
        ) {
          return user;
        }
      });
      if (foundMail !== undefined) {
        res.status(409).send(formatErrorResponse("Email not unique"));
        return;
      }
      const foundUser = dbDataJson["users"].find((user) => {
        if (user["id"]?.toString() === userId?.toString()) {
          return user;
        }
      });
      if (foundUser === undefined) {
        req.method = "POST";
        req.url = req.url.replace(`/${userId}`, "");
        if (parseInt(userId).toString() === userId){
          userId = parseInt(userId);
        }
        req.body.id = userId;
      }
    }
    if (req.method === "PATCH" && urlEnds.includes("/api/users")) {
      // validate all fields:
      if (
        !are_all_fields_valid(
          req.body,
          all_fields_user,
          mandatory_non_empty_fields_user
        )
      ) {
        res
          .status(422)
          .send(
            formatErrorResponse(
              "One of field is invalid (empty, invalid or too long) or there are some additional fields",
              all_fields_user
            )
          );
        return;
      }
    }
    if (
      req.method !== "GET" &&
      req.method !== "HEAD" &&
      urlEnds.includes("/api/comments")
    ) {
      // validate all fields:
      if (
        !are_all_fields_valid(
          req.body,
          all_fields_comment,
          mandatory_non_empty_fields_comment
        )
      ) {
        res
          .status(422)
          .send(
            formatErrorResponse(
              "One of field is invalid (empty, invalid or too long) or there are some additional fields",
              all_fields_comment
            )
          );
        return;
      }
      const dbData = fs.readFileSync(path.join(__dirname, "db.json"), "utf8");
      const dbDataJson = JSON.parse(dbData);

      let commentId
      if (req.method !== "POST") {
        const urlParts = urlEnds.split("/");
        commentId = urlParts[urlParts.length - 1];
      }

      const foundComment = dbDataJson["comments"].find((comment) => {
        console.log('comment["id"], commentId', comment["id"], commentId)
        if (comment["id"]?.toString() === commentId?.toString()) {
          return comment;
        }
      });
      logDebug("api/comments foundComment:", commentId, foundComment);
      if (req.method !== "POST" && req.method !== "PUT" && foundComment === undefined) {
          res.status(404).send(formatErrorResponse("Comment not found"));
          return;
      }
      if (req.method === "PUT" || req.method === "PATCH") {
        if (req.body["user_id"] !== undefined && foundComment !== undefined && foundComment["user_id"]?.toString() !== req.body["user_id"]?.toString()) {
          logDebug("Comment user id different from user id in request", foundComment, commentId);
          res.status(403).send(formatErrorResponse("Invalid authorization"));
          return;
        }
      } 
      let userId
      if (req.method !== "POST" && foundComment !== undefined) {
        userId = foundComment["user_id"]
      } else {
        userId = req.body["user_id"]
      }
      let foundUser = dbDataJson["users"].find((user) => {
        if (user["id"]?.toString() === userId?.toString()) {
          return user;
        }
      });
      logDebug("api/comments foundUser:", userId, foundUser);
      if (foundUser === undefined) {
        res.status(404).send(formatErrorResponse("User not found"));
        return;
      }
      // const userAuth = btoa(foundUser.email + ":" + foundUser.password);
      const userAuth = Buffer.from(
        foundUser.email + ":" + foundUser.password,
        "utf8"
      ).toString("base64");

      const authorization = req.headers["authorization"];
      logDebug("expected auth: ", userAuth);
      logDebug("actual headers:", authorization);
      if (authorization !== `Basic ${userAuth}`) {
        res.status(403).send(formatErrorResponse("Invalid authorization"));
        return;
      }
      if (req.method === "PUT" && foundComment === undefined) {
        req.method = "POST";
        req.url = req.url.replace(`/${commentId}`, "");
        if (parseInt(commentId).toString() === commentId){
          commentId = parseInt(commentId);
        }
        req.body.id = commentId;
      }
    }
    if (req.method === "POST" && urlEnds.includes("/api/comments")) {
      if (
        !are_mandatory_fields_valid(
          req.body,
          mandatory_non_empty_fields_comment
        )
      ) {
        res
          .status(422)
          .send(
            formatErrorResponse(
              "One of mandatory field is missing",
              mandatory_non_empty_fields_comment
            )
          );
        return;
      }
      // validate all fields:
      if (
        !are_all_fields_valid(
          req.body,
          all_fields_comment,
          mandatory_non_empty_fields_comment
        )
      ) {
        res
          .status(422)
          .send(
            formatErrorResponse(
              "One of field is invalid (empty, invalid or too long) or there are some additional fields",
              all_fields_comment
            )
          );
        return;
      }
    }

    if (req.method === "POST" && urlEnds.endsWith("/api/articles")) {
      if (
        !are_mandatory_fields_valid(
          req.body,
          mandatory_non_empty_fields_article
        )
      ) {
        res
          .status(422)
          .send(
            formatErrorResponse(
              "One of mandatory field is missing",
              mandatory_non_empty_fields_article
            )
          );
        return;
      }
      // validate all fields:
      if (
        !are_all_fields_valid(
          req.body,
          all_fields_article,
          mandatory_non_empty_fields_article
        )
      ) {
        res
          .status(422)
          .send(
            formatErrorResponse(
              "One of field is invalid (empty, invalid or too long) or there are some additional fields",
              all_fields_article
            )
          );
        return;
      }
    }
    if (req.method === "PATCH" && urlEnds.includes("/api/articles")) {
      // validate all fields:
      if (
        !are_all_fields_valid(
          req.body,
          all_fields_article,
          mandatory_non_empty_fields_article
        )
      ) {
        res
          .status(422)
          .send(
            formatErrorResponse(
              "One of field is invalid (empty, invalid or too long) or there are some additional fields",
              all_fields_article
            )
          );
        return;
      }
    }
    if (req.method === "PUT" && urlEnds.includes("/api/articles")) {
      if (
        !are_mandatory_fields_valid(
          req.body,
          mandatory_non_empty_fields_article
        )
      ) {
        res
          .status(422)
          .send(
            formatErrorResponse(
              "One of mandatory field is missing",
              mandatory_non_empty_fields_article
            )
          );
        return;
      }
      // validate all fields:
      if (
        !are_all_fields_valid(
          req.body,
          all_fields_article,
          mandatory_non_empty_fields_article
        )
      ) {
        res
          .status(422)
          .send(
            formatErrorResponse(
              "One of field is invalid (empty, invalid or too long) or there are some additional fields",
              all_fields_article
            )
          );
        return;
      }
      const urlParts = urlEnds.split("/");
      let articleId = urlParts[urlParts.length - 1];
      const dbData = fs.readFileSync(path.join(__dirname, "db.json"), "utf8");
      const dbDataJson = JSON.parse(dbData);
      const foundArticle = dbDataJson["articles"].find((article) => {
        if (article["id"]?.toString() === articleId?.toString()) {
          return article;
        }
      });
      if (foundArticle === undefined) {
        req.method = "POST";
        req.url = req.url.replace(`/${articleId}`, "");
        if (parseInt(articleId).toString() === articleId){
          articleId = parseInt(articleId);
        }
        req.body.id = articleId;
      }
    }
    next();
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send(formatErrorResponse("Fatal error. Please contact administrator."));
  }
};

exports.validations = validations;
exports.validateEmail = validateEmail;
