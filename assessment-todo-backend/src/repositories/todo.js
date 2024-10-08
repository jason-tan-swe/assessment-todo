export default (db) => {
    const { TODO_COLLECTION } = process.env;
    const collection = db.collection(TODO_COLLECTION);

    async function insertOne(todo) {
        return await collection.insertOne(todo);
    }

    async function findAllByUserID(userID) {
        return await collection.find({ userID }).toArray();
    }

    async function findOneByTodoID(todoID) {
        return await collection.findOne({ todoID });
    }

    async function updateOne(filter, updatedTodo) {
        return await collection.updateOne(filter, updatedTodo);
    }

    async function deleteOne(query) {
        return await collection.deleteOne(query);
    }

    return {
        insertOne,
        findAllByUserID,
        findOneByTodoID,
        updateOne,
        deleteOne
    };
};