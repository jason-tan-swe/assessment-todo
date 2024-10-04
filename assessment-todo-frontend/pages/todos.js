import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import Button from '../components/Button';
import PageLayout from '../components/PageLayout';
import Tabs from '../components/Tabs';
import apiFetch from '../functions/apiFetch';
import { useDispatch, useSelector } from 'react-redux';
import { clearTodoAlerts, clearTodoBody, updateTodoError, updateTodoSuccess } from '../actions/todo';
import TodoListItem from '../components/List/TodoListItem';
import Alert from '../components/Alert';
import { useRouter } from 'next/router';
import List from '../components/List';

const sortByMostRecentDateFirst = (a, b) => {
    if (a.created > b.created) {
        return -1;
    }
    else if (a.created < b.created) {
        return 1;
    }
    return 0;
}

const Todos = () => {
    // Redux State Hooks
    const dispatch = useDispatch();
    const todoState = useSelector((state) => state.todo);

    // Next.js Router Hook
    const router = useRouter();

    // React State Hooks
    const tabsRef = useRef(null);
    const [activeTab, setActiveTab] = useState("Incomplete");
    const [incompleteTodos, setIncompleteTodos] = useState([]);
    const [completeTodos, setCompleteTodos] = useState([]);
    const [hasTodoChanged, setHasTodoChanged] = useState(true); // True to fetch on mount

    // Fetches all todos from the database separated into incomplete and complete lists
    const getTodos = async () => {
        try {
            const res = await apiFetch("/todo", { method: "GET" })
            
            if (res.status === 200) {
                setIncompleteTodos(res.body.filter(todo => !todo.isCompleted).sort(sortByMostRecentDateFirst))
                setCompleteTodos(res.body.filter(todo => todo.isCompleted).sort(sortByMostRecentDateFirst))
            }
            else {
                dispatch(updateTodoError({ error: res.body?.error }));
            }
        }
        catch (err) {
            dispatch(updateTodoError({ error: "Failed to fetch todos." }));
            console.error(err);
        } finally {
            setHasTodoChanged(false)  
        }
    }

    /**
     * Approach: Track all changes in the todo list and refresh the list if any changes have occurred
     * Instead of optimistically updating the list using Redux and only fetching once per visit, I've opted for this simpler and less efficient approach
     * to avoid data inconsistencies and avoid having business state inside both the frontend and backend
     */
    useEffect(() => {
        if (hasTodoChanged) {
            getTodos()
        }
    }, [hasTodoChanged])

    const onTodoItemChange = () => {
        setHasTodoChanged(true)
    }

    const tabs = [{
        title: "Incomplete",
        content: <List items={incompleteTodos.map(todo => <TodoListItem key={todo.todoID} onChange={onTodoItemChange} todo={todo} />)} />,
        onClick: () => {
            setActiveTab("Incomplete");
        }
    },
    {
        title: "Completed",
        content: <List items={completeTodos.map(todo => <TodoListItem key={todo.todoID} onChange={onTodoItemChange} todo={todo} />)} />,
        onClick: () => {
            setActiveTab("Completed");
        }
    }]

    return (
        <PageLayout title="Todos">
            <Button text="Back" size="large" variant="primary" onClick={() => router.back()} />
            <Container>
                <Alert message={todoState.alerts.error} onClose={() => dispatch(clearTodoAlerts())} />
                <Alert message={todoState.alerts.success} onClose={() => dispatch(clearTodoAlerts())} variant="success" />
                <div className="content">
                    <img className="logo" src="/img/todox-logo-black.svg" />
                    <Tabs className="tabs" tabsClassName="tabs-content" ref={tabsRef} activeTab={activeTab} tabs={tabs} />
                </div>
            </Container>
        </PageLayout>
    );
};

export default Todos;

const Container = styled.div`
    width: 100%;

    .content {
        .logo {
            height: 8.125rem;
            width: 14.625rem;
        }

        .noLinkStyling {
            text-decoration: none;
        }

        .buttons {
            > * {
                display: block;
                margin-bottom: 0.75rem;

                &:last-child {
                    margin-bottom: 0;
                }
            }
        }
    }
`;