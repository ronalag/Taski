var app,
    cors = require("cors"),
    bodyParser = require("body-parser"),
    express = require("express"),
    login = require("./routes/login"),
    user = require("./routes/user");


app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ "extended": true }));

app.get("/", function (req, res) {
	res.send("Hello World!");
});

app.get("/Account/:id", function (req, res) {
    var id = req.params.id;
    console.log(id);
});
app.use("/User", user);
app.use("/Login", login);

app.listen(3000, function () {
	console.log("Example app listening on port 3000!");
});
