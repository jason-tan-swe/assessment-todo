import { useState } from "react";
import { Typography } from "../../definitions";
import Button from "../Button";
import styled from "styled-components";
import Checkbox from "../Checkbox";
import apiFetch from "../../functions/apiFetch";
import { useDispatch } from "react-redux";
import { updateTodoSuccess, clearTodoAlerts, updateTodoError } from "../../actions/todo";
import InputField from "../InputField";
import Form from "../Form";

/**
 * Intended to be used as a child of a List component
 * Params:
 * todo: todo object {todoID, userID, name, created, isCompleted, _id/id}
 * onChange: function that informs parent component that todo has been updated
 *
 */
const TodoListItem = ({ todo, onChange }) => {
    const dispatch = useDispatch()
    const [isEditing, setIsEditing] = useState(false);
    const [todoName, setTodoName] = useState(todo.name);
    const [isChecked, setIsChecked] = useState(todo.isCompleted);

    const handleCheckboxChange = async () => {
        setIsChecked(!isChecked);
        try {
            // update is completed in database
            const response = await apiFetch(`/todo/${todo.todoID}`, {
                method: "PUT",
                body: {
                    ...todo,
                    isCompleted: !isChecked
                }
            });
            if (response.status === 200) {
                await new Promise(r => setTimeout(r, 100)); // simulate latency
                onChange()
                dispatch(updateTodoSuccess({ success: "Item finished!" }));
            } else {
                dispatch(updateTodoError({ error: response.body.error }));
            }
        } catch (error) {
            console.error(error);
            dispatch(updateTodoError({ error: "Sorry! We failed to complete your task. Please try again later." })); 
        }
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            // update the name in the database
            const response = await apiFetch(`/todo/${todo.todoID}`, {
                method: "PUT",
                body: {
                    ...todo,
                    name: todoName
                }
            });

            if (response.status === 200) {
                onChange()
                dispatch(updateTodoSuccess({ success: "Item updated!" }));
            } else {
                dispatch(updateTodoError({ error: response.body.error }));
            }
        } catch (error) {
            console.error(error);
            dispatch(updateTodoError({ error: "Sorry! We failed to update your task. Please try again later." }));
        } finally {
            setIsEditing(false);
        }
    };
    const handleDelete = async () => {
        try {
            const response = await apiFetch(`/todo/${todo.todoID}`, {
                method: "DELETE"
            });
            if (response.status === 200) {
                onChange()
                dispatch(updateTodoSuccess({ success: "Item deleted!" }));
            } else {
                dispatch(updateTodoError({ error: response.body.error }));
            }
        } catch (error) {
            console.error(error);
            dispatch(updateTodoError({ error: "Sorry! We failed to delete your task. Please try again later." }));
        } 
    };
    const handleEdit = async (e) => {
        e.preventDefault();
        setIsEditing(!isEditing);
    }

    return (
        <Container>
            <div className="inputs">
                <Checkbox checked={isChecked} onChange={handleCheckboxChange} />
                {isEditing ?
                    <InputField size="small" type="text" value={todoName} onChange={e => setTodoName(e.target.value)} />
                    : <span>{todo.name}</span>
                }
            </div>
            <div className="item-buttons">
                <Form onSubmit={handleSubmit} className="form-buttons">
                    {isEditing ? <Button text="Confirm" type="submit" size="small" variant="neutral-light" required  /> : <Button type="button" onClick={handleEdit} text="Edit" size="small" variant="primary" />}
                </Form>
                <Button text="Delete" size="small" variant="primary" onClick={handleDelete} />
            </div>
        </Container>
    );
}

const Container = styled.li`
    display: flex;
    justify-content: space-between;
    align-items: center;

    .item-buttons {
        display: flex;
        align-items: center;
        gap: 0px ${Typography.BODY_SIZES.XXXS};
        padding: ${Typography.BODY_SIZES.XXXS};
        margin: 0 !important;
    }
    .inputs {
        > * {
            align-self: center;
        }
        display: flex;
        items-align: center;
        justify-content: center;
        gap: ${Typography.BODY_SIZES.XS};
    }
`;

export default TodoListItem;