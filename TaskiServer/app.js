var api,
    app,
    config = require("./config"),
    connectFlash = require("connect-flash"),
    cookieParser = require("cookie-parser"),
    cors = require("cors"),
    bodyParser = require("body-parser"),
    express = require("express"),
    port = 3000,
    passport = require("passport"),
    session = require("express-session"),
    view = require("./routes/view");

app = express();

app.set("view engine", "jade");
app.set("views", "./views");
app.use(session({ "secret": config && config.secret || "defaultSecret"}));
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ "extended": false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(connectFlash());

require("./config/passport")(passport);
api = require("./routes/api")(passport);

app.use("/public", express.static("public"));
app.use("/API", api);
app.use("/", view);

app.listen(port, function () {
	console.log("Example app listening on port " + port + "!");
});
