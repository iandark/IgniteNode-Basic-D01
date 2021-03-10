const express = require('express');
const cors = require('cors');

const { v4: uuidV4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
    const { username } = request.headers;

    const user = users.find(user=> user.username  === username);

    if(!user) {
        return response.status(404).json({ error: "User don't exist"});
    }

    request.user = user;

    next();
}

function checksExistsTodo(request, response, next) {
    const { id } = request.params;
    const { todos } = request.user;
    const todo = todos.find(todo=> todo.id  === id);

    if(!todo) {
        return response.status(404).json({ error: "This todo don't exist"});
    }

    request.todo = todo;

    next();
}

app.post('/users', (request, response) => {
    const { name, username } = request.body;

    const userAlreadyExist = users.some(user=> user.username  === username);
    if(userAlreadyExist) {
        return response.status(400).json({ "error": "There's a user already in database with this username"});
    }

    const id = uuidV4();
    const user = {
        id,
        name,
        username,
        todos: []
    }
    users.push(user);
    return response.json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
    const { todos } = request.user;
    return response.json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
    const { title, deadline } = request.body;
    const { todos } = request.user;
    const id = uuidV4();

    const todo = {
        id,
        title,
        done: false,
        deadline: new Date(deadline),
        created_at: new Date()
    }

    todos.push(todo);
    return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
    const { id } = request.params;
    const { title, deadline } = request.body;
    const { user, todo } = request;

    user.todos.find((todo) =>{
      if(todo.id  === id) {
        todo.title = title;
        todo.deadline = deadline;
      }
    });

    return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodo, (request, response) => {
    const { todo } = request;

    todo.done = true;
    return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
    const { todos } = request.user;
    const { todo } = request;
    todos.splice(todos.indexOf(todo), 1);

    return response.status(204).json(todos);
});

module.exports = app;
