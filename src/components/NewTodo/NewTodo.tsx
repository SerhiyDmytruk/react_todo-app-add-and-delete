import { forwardRef } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Todo } from '../../types/Todo';

type Props = {
  disable: boolean;
  newTodo: (todo: Todo) => void;
  inputValue: string;
  setInputValue: (value: string) => void;
};

export const NewTodo = forwardRef<HTMLInputElement, Props>(
  ({ newTodo, disable, inputValue, setInputValue }, ref) => {
    const inputHandler = (event: ChangeEvent<HTMLInputElement>) => {
      setInputValue(event.target.value);
    };

    const formHandler = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      newTodo({
        id: Date.now(),
        completed: false,
        title: inputValue,
        userId: 0,
      });
    };

    return (
      <form onSubmit={formHandler}>
        <input
          ref={ref}
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          value={inputValue}
          onChange={inputHandler}
          disabled={disable}
          autoFocus
        />
      </form>
    );
  },
);

NewTodo.displayName = 'NewTodo';
