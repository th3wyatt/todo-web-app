var express = require('express');
var middleware = require('./middleware.js');
var bodyParser = require('body-parser');
var _ = require('underscore');
var app = express();
var PORT = process.env.PORT || 3000;
var todoNextId = 4;

var todos = [{
		id: 1,
		description: 'Meet mom for lunch',
		completed: false,
	}, {
		id: 2,
		description: 'go to market',
		completed: false
	}, {
		id: 3,
		description: 'win all the things',
		completed: true
	}]

app.use(bodyParser.json());

//app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
	res.send('Todo API Root');
});


app.get('/todos', function (req, res) {
	res.json(todos);
});

app.get('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedToDo = _.findWhere(todos, { id: todoId });
	if (matchedToDo) {
		res.json(matchedToDo);
	} else {
		res.status(404).send();
	}
});

app.post('/todos', function (req, res){
	var body = _.pick(req.body, 'description', 'completed');
	
	if (!_.isBoolean(body.completed)|| !_.isString(body.description)|| body.description.trim().length === 0) {
		return res.status(400).send();
	}
	
	body.description = body.description.trim();
	body.id = todoNextId++;
	todos.push(body);
	res.json(body);
})

//app.use(middleware.logger);
//app.use(middleware.requireAuthentication);

//app.get('/about', middleware.requireAuthentication, function (req, res) {
//	res.send('About us!!!');
//});

app.listen(PORT, function () {
	console.log('express server started on port: ' + PORT);
});
