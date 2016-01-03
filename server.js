var express = require('express');
var middleware = require('./middleware.js');
var bodyParser = require('body-parser');
var _ = require('underscore');
var app = express();
var PORT = process.env.PORT || 3000;
var todoNextId = 1;
var todos = [];

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

app.delete('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedToDo = _.findWhere(todos, { id: todoId });
	if (!matchedToDo) {
		return res.status(400).json({"error":"no todo found"});
	} else {
		todos = _.without(todos, matchedToDo);
		res.json({ "message": "item deleted" });
	}
});

app.put('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedToDo = _.findWhere(todos, { id: todoId });
	var body = _.pick(req.body, 'description', 'completed');
	var validAttributes = {};
	
	if (!matchedToDo) {
		return res.status(400).send();
	}
	
	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		return res.status(400).send();
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.descripton.trim() > 0) {
		validAttributes.description = body.description;
	} else if (body.hasOwnProperty('description')) {
		return res.status(400).send();
	}
	
	_.extend(matchedToDo, validAttributes);

	res.json(matchedToDo);

});

//app.use(middleware.logger);
//app.use(middleware.requireAuthentication);

//app.get('/about', middleware.requireAuthentication, function (req, res) {
//	res.send('About us!!!');
//});

app.listen(PORT, function () {
	console.log('express server started on port: ' + PORT);
});
