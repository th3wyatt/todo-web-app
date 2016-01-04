﻿var express = require('express');
var middleware = require('./middleware.js');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var app = express();
var PORT = process.env.PORT || 3000;
var todoNextId = 1;
var todos = [];

app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.send('Todo API Root');
});

app.get('/todos', function (req, res) {
	var queryParams = req.query;
	var where = {};
	
	if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
		where.completed = true;
	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
		where.completed = false;
	}

	if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {

		where.description = {
			$like: '%' + queryParams.q + '%'
		};
	}
	db.todo.findAll({ where: where }).then(function (todos) {
		res.json(todos);
	}, function (e) {
		res.status(500).send();
	});



//	var filteredTodos = todos;
	
//	if (queryParams.hasOwnProperty('completed') && queryParams.completed == 'true') {
//		filteredTodos = _.where(filteredTodos, { completed: true });
//	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed == 'false') {
//		filteredTodos = _.where(filteredTodos, { completed: false });
//	}
//	
//	if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
//		filteredTodos = _.filter(filteredTodos, function (todo) {
//			return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
//		});
//	}
//	res.json(filteredTodos);
});

app.get('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id, 10);
	
	db.todo.findById(todoId).then(function (todo) {
		if (!!todo) {
			res.json(todo.toJSON());
		} else {
			res.status(404).send();
		}
	}, function (e) {
		res.status(500).send();
	});
});


app.post('/todos', function (req, res) {
	var body = _.pick(req.body, 'description', 'completed');
	
	db.todo.create(body).then(function (todo) {
		res.json(todo.toJSON());
	}, function (e) {
		res.status(400).json(e);
	});
});

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

db.sequelize.sync().then(function () {
	app.listen(PORT, function () {
		console.log('express server started on port: ' + PORT);
	});
});

