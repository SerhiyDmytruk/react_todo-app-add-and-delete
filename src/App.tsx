import React, { useState, useEffect, useRef } from 'react';
import { UserWarning } from './UserWarning';
import { getTodos, addTodo, USER_ID, deleteTodo } from './api/todos';
import { ErrorNotification } from './components/ErrorNotification';
import { TodoList } from './components/TodoList';
import { NewTodo } from './components/NewTodo';
import { Todo } from './types/Todo';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [filter, setFilter] = useState('all');

  const [disable, setDisable] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const [pendingList, setPendingList] = useState<number[]>([]);

  const inputRef = useRef<HTMLInputElement | null>(null);

  function inputFocus() {
    inputRef.current?.focus();
  }

  useEffect(() => {
    if (!disable) {
      inputFocus();
    }
  }, [disable]);

  useEffect(() => {
    getTodos()
      .then(setTodos)
      .catch(er => {
        setError(true);
        setErrorMessage('Unable to load todos');

        throw er;
      });
  }, []);

  const filteredTodos = todos.filter(todo => {
    if (filter === 'all') {
      return todo;
    } else if (filter === 'completed') {
      return todo.completed === true;
    } else if (filter === 'active') {
      return todo.completed === false;
    }
  });

  const handleAddTodo = (todo: Todo) => {
    const normalizedTitle = todo.title.trim();
    const newTodoID = Date.now();

    setError(false);
    setErrorMessage('');

    if (normalizedTitle === '') {
      setError(true);
      setErrorMessage('Title should not be empty');
      inputFocus();

      return;
    }

    const newTodo = {
      id: newTodoID,
      userId: USER_ID,
      completed: todo.completed,
      title: normalizedTitle,
      temp: true,
    };

    setDisable(true);
    setPendingList(prevList => [...prevList, newTodoID]);

    setTodos(prevTodos => [...prevTodos, newTodo]);

    addTodo(newTodo)
      .then(() => {
        setTodos(prevTodos => prevTodos.filter(item => item.id !== newTodoID));
      })
      .then(() => {
        setTodos(prevTodos => (prevTodos ? [...prevTodos, todo] : [todo]));
        setDisable(false);
      })
      .catch(er => {
        setTodos(todos);
        setError(true);
        setDisable(false);
        setErrorMessage('Unable to add a todo');

        throw er;
      })
      .finally(() => {
        setPendingList(prevList => prevList.filter(item => item !== newTodoID));
        setInputValue('');
      });
  };

  const handleUpdate = (todoId: number) => {
    setTodos((prevState: Todo[]) => {
      return prevState.map((todo: Todo) =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo,
      );
    });

    setPendingList(prevList => prevList.filter(item => todoId !== item));
  };

  const handleDeleteTodo = (todoId: number) => {
    setPendingList(prevList => [...prevList, todoId]);

    deleteTodo(todoId)
      .catch(er => {
        setTodos(todos);
        setError(true);
        setDisable(false);
        setErrorMessage('Unable to delete a todo');

        throw er;
      })
      .then(() => {
        setTodos(prevState => prevState.filter(todo => todo.id !== todoId));

        setPendingList(prevList => prevList.filter(item => item !== todoId));
      })
      .finally(() => {
        inputFocus();
      });
  };

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {todos && (
            <button
              type="button"
              className="todoapp__toggle-all active"
              data-cy="ToggleAllButton"
            />
          )}

          <NewTodo
            ref={inputRef}
            newTodo={handleAddTodo}
            disable={disable}
            inputValue={inputValue}
            setInputValue={setInputValue}
          />
        </header>

        <TodoList
          todos={filteredTodos}
          toggleStatus={handleUpdate}
          deleteTodo={handleDeleteTodo}
          pendingList={pendingList}
        />

        {todos.length > 1 && <Footer data={todos} setFilter={setFilter} />}
      </div>

      <ErrorNotification
        status={error}
        statusMessage={errorMessage}
        setStatus={setError}
        setStatusMessage={setErrorMessage}
      />
    </div>
  );
};
