const seedrandom = require("seedrandom");
const { logDebug } = require("./loggerApi");
const pluginStatuses = ["on", "off", "obsolete"];
const bearerToken = "Bearer SecretToken";
const basicAuth = "Basic dXNlcjpwYXNz"; // user:pass
const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function formatErrorResponse(message, details = undefined, id = undefined) {
  const body = { error: { message: message, details: details }, id };
  logDebug("formatErrorResponse:", body);
  return body;
}

function getRandomIdBasedOnDay(length = 32) {
  var result = "";
  var charactersLength = characters.length;
  const generator = seedrandom(formatYmd(new Date()));
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(generator() * charactersLength));
  }
  return result;
}

function getRandomIntBasedOnDay() {
  const generator = seedrandom(formatYmd(new Date()));
  const randomValue = generator();

  return randomValue.toString().replace(".", "");
}

function tomorrow() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatYmd(tomorrow);
}

const formatYmd = (date) => date.toISOString().slice(0, 10);

module.exports = {
  getRandomIntBasedOnDay,
  getRandomIdBasedOnDay,
  formatYmd,
  tomorrow,
  pluginStatuses,
  bearerToken,
  basicAuth,
  formatErrorResponse,
};
