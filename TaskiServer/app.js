var api,
    app,
    cors = require("cors"),
    bodyParser = require("body-parser"),
    express = require("express")//,
    //login = require("./login"),
    //user = require("./user")
    ;

api = require("./routes/api");
app = express();

app.set("view engine", "jade");
app.set("views", "./views");
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ "extended": true }));

app.use("/public", express.static("public"));
app.use("/API", api);
app.get("/home", function (req, res) {
  res.render("home", {});
});
app.get("/login", function (req, res) {
  res.render("login", {});
});
app.get("/", function (req, res) {
  res.render("index", {});
});

app.listen(3000, function () {
	console.log("Example app listening on port 3000!");
});
