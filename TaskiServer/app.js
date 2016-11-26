var api,
    app,
    config = require("./config"),
    cookieParser = require("cookie-parser"),
    cors = require("cors"),
    bodyParser = require("body-parser"),
    express = require("express"),
    port = process.argv[2] || 3000,
    server,
    session = require("express-session"),
    view = require("./routes/view"),

    gracefulShutdown = function () {
      console.log("Received kill signal. Shutting down gracefully.");
      server.close(function () {
        console.log("Closed out remaining connections.");
        process.exit();
      });

      setTimeout(function () {
        console.log("Couldn't close out remaining connections. Forcefully exiting!");
        process.exit();
      }, 10*1000);
    };

app = express();

app.set("view engine", "jade");
app.set("views", "./views");
app.use(session({ "secret": config && config.secret || "defaultSecret"}));
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ "extended": false }));

api = require("./routes/api")();

app.use("/public", express.static("public"));

app.use("/API", api);
app.use("/", view);

server = app.listen(port, function () {
	console.log("Example app listening on port " + port + "!");
});

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
