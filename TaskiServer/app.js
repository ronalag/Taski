var api,
    app,
    cors = require("cors"),
    bodyParser = require("body-parser"),
    express = require("express"),
    view = require("./routes/view");

api = require("./routes/api");
app = express();

app.set("view engine", "jade");
app.set("views", "./views");
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ "extended": true }));

app.use("/public", express.static("public"));
app.use("/API", api);
app.use("/", view);

app.listen(3000, function () {
	console.log("Example app listening on port 3000!");
});
