import { validateTodo } from '../schemas/validators.js';

// Middleware used to check if the payload sent from the user is valid
const validateBody = (req, res, next) => {
    try {
        if (req.method === "OPTIONS") {
            return next();
        }
        
        if (req.body) {
            if (validateTodo(req.body)) {
                return next();
            }
        }
        return res
            .status(400)
            .send("Invalid todo item.");
    }
    catch (err) {
        return res
            .status(401)
            .send({});
    }
}

export default validateBody;