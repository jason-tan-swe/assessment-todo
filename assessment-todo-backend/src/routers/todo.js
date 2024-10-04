import express from 'express';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import { v4 as uuidv4 } from 'uuid';
import { validateTodo } from '../schemas/validators.js';
import auth from '../middleware/auth.js';
import { verifyToken } from '../functions/cookies.js';
import validateBody from '../middleware/todo.js';

dayjs.extend(utc);
const router = express.Router();

export default ({todoRepository}) => {
    // Create new todo
    router.post('/', auth, async (req, res) => {
        try {
            let session = verifyToken(req.cookies['todox-session']);

            const todoID = uuidv4();
            const created = dayjs().utc().toISOString();

            let newTodo = {
                ...req.body,
                todoID,
                userID: session.userID,
                created,
                isCompleted: false
            };

            if (validateTodo(newTodo)) {
                let resultTodo = await todoRepository.insertOne(newTodo);
                return res.status(201).send(resultTodo);
            }
            console.error(validateTodo.errors);
            return res.status(400).send({error: "Invalid field used."});
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({error: "Todo creation failed."});
        }
    });

    // Get all todos
    router.get('/', auth, async (req, res) => {
        try {
            // Verify user session is signed by us and get session if it is
            let session = verifyToken(req.cookies['todox-session']);
            
            const todos = await todoRepository.findAllByUserID(session.userID);
            return res.status(200).send(todos);
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({error: "Failed to fetch todos."});
        }
    });


    // Edit a todo item
    router.put('/:todoID', auth, validateBody, async (req, res) => {
        try {
            // Verify user session is signed by us
            let session = verifyToken(req.cookies['todox-session']);

            // Check if item exists
            const todoItemToUpdate = await todoRepository.findOneByTodoID(req.params.todoID);
            if (todoItemToUpdate === null) {
                return res.status(404).send({error: "Item not found."});
            }

            // Check if user is the owner of the todo item
            if (todoItemToUpdate.userID !== session.userID) {
                return res.status(401).send({error: "Unauthorized."});
            }

            // Limit what fields can be updated by the user
            const allowedFields = {
                name: req.body.name,
                isCompleted: req.body.isCompleted,
            }

            // Create the updated todo item
            const updatedTodo = {
                ...todoItemToUpdate,
                ...allowedFields,
            };

            if (validateTodo(updatedTodo)) {
                // Update todo filtered by id and user id 
                let resultTodo = await todoRepository.updateOne({ 
                    todoID: todoItemToUpdate.todoID,
                    userID: todoItemToUpdate.userID
                }, {
                    $set: updatedTodo
                });
                return res.status(200).send(resultTodo);
            }
            console.error(validateTodo.errors);
            return res.status(400).send({error: "Invalid field used."});
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({error: "Todo update failed."});
        }
    });

    // Delete a todo item
    router.delete('/:todoID', auth, async (req, res) => {
        try {
            // Grab user session from cookie
            let session = verifyToken(req.cookies['todox-session']);

            // Check if item exists
            const todoItemToDelete = await todoRepository.findOneByTodoID(req.params.todoID);
            if (todoItemToDelete === null) {
                return res.status(404).send({error: "Item not found."});
            }

            // Check if user is the owner of the todo item
            if (todoItemToDelete.userID !== session.userID) {
                return res.status(401).send({error: "Unauthorized."});
            }

            // Delete the todo item
            let resultTodo = await todoRepository.deleteOne({ 
                todoID: todoItemToDelete.todoID,
                userID: todoItemToDelete.userID
            });
            return res.status(200).send(resultTodo);
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({error: "Todo delete failed."});
        }
    });

    return router;
}
