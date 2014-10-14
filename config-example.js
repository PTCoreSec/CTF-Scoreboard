var config = {};

config.host = "0.0.0.0";
config.appPort = 3000;
config.brand = "exampleCTF";
config.url = "https://localhost:3000";
config.passwordComplexityRegex = "(?=^.{8,}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s)[0-9a-zA-Z!@#$%^&*()]*$"

module.exports = config;
