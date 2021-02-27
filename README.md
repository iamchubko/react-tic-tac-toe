![tic-tac-toe preview](/tic-tac-toe-preview.png)

# React tic-tac-toe exerecises

This is my take on tasks provided at the end of [React tic-tac-toe tutorial](https://reactjs.org/tutorial/tutorial.html).

## My why behind this repo

Completing these tasks took about two weeks on and off as I was struggling with understanding many core concepts of React. Now, I decided to share my solution in case someone finds it difficult to comprehend things, as I did.

**Disclaimer:** source code may contain comments with innacurate info, but I decided to leave it as is because it was the way I memorized stuff.

## 1. Display the location for each move in the format (col, row) in the move history list.

**Disclaimer:** before attempting this exercise, you need to complete 3rd exercise first. The reason is indexes from the loop give us a great starting point to locate squares. If you find it difficult to grasp some of the staff, toy can relate to that exercise.

The move history list is in `Game` component's `render()` method, and to display each move location we need indexes of squares from `Board` component's `render()` method. So we need to pass data from the child to the parent. We can't do this directly, so we would use callback props.

1. In the parent component, `Game`, add new state key to the constructor with an array literal as a value

```jsx
this.state = {
  position = [],
}
```

2. Below, create a function with two arguments to store props. Just like in handleClick(), create a copy of the array with .slice() array method, and add current step number as the second argument. Next, using spread syntax, pass the array you want to add to, and the value you adding to it. After that, update state with that variable

```jsx
storePosition(col, row) {
  let position = this.state.position.slice(0, this.state.stepNumber);
    // creats a copy of the array; same way as in handleClick()

  position = [...position, [col, row]];
    // first argument is the array we want to add to; second is the value we want to add

  this.setState({
    position: position, // sets state with the variable with the same name
  });
}
```

3. In `<Board />`, pass that function to `onClick` prop and add its arguments to the arrow function's arguments, so we can use it down in the component 

```jsx
<Board
  // ...
  onClick={(i, col, row) => {
    this.handleClick(i);
    this.storePosition(col, row);
  }}
  // ...
/>
```

4. In `Board`'s `render()` method aka the child, add two arguments, `col` and `row`, to renderSquare() function (you can name them anyting you like, but they should match the second arguments in both `.map()` methods)

```jsx
<div>
  {colsAndRows.map((square, col) =>
    <div className="board-row" key={col}>
      {colsAndRows.map((square, row) =>
        this.renderSquare((col * colsAndRows.length + row), col, row)
      )}
    </div>
  )}
</div>
```

5. In `renderSquare()` function, add the same two arguments to it and to `<Square />` onClick prop. We add `+ 1` to each argument, so `0` indexed square return `1` in column and `1` in row
```jsx
renderSquare(i, col, row) { 
  return ( 
    <Square
      // ...
      onClick={() => this.props.onClick(i, col + 1, row + 1)}
      //...
    />
  );
}
```
Now, when you click on a square, its position will be passed to `Game` component.

6. In `Game`'s `render()` method, store our state in a variable and slightly modify `desc` varibale to display position of a square
```jsx
const position = this.state.position;

let moves = history.map((step, move) => {
 const desc = move ?
  `Go to move #${move} (${position[move - 1]})`: // -1 because first item in move array occupied by 'go to game start' button
  'Go to game start';
}
```

## 2. Bold the currently selected item in the move list.

Just a CSS rule to color button on focus

```css
button:focus {
  border: 2px solid black;
}
```

## 3. Rewrite Board to use two loops to make the squares instead of hardcoding them.
Previously, we generated text for move buttons using `.map()` method. You can read about it in [React's documentation](https://reactjs.org/docs/lists-and-keys.html#embedding-map-in-jsx)

1. In `Board`'s `render()` method, write this code.
Some things to note:
  * An array variable there as a base for iteration using `.map()` method;
  * In `.map()` method, the first parameter is the content of the array's item; the second is an index of the item it is iterating on;
  * `renderSquare()`'s argument will be a key we will assign to `Square` component.

```jsx
render() {
  const colsAndRows = [1, 2, 3];

  return (
    <div>
      {colsAndRows.map((square, col) =>
        <div className="board-row" key={col}> {/* there must be a key because it's rendered three times */}
          {colsAndRows.map((square, row) =>
            this.renderSquare(col * colsAndRows.length + row) // value will be from 0 to 8
          )}
        </div>
      )}
    </div>
  );
}
```
2. In `renderSquare()` function, pass its argument as `key` value
```jsx
renderSquare(i) {
  return ( 
    <Square
      value={this.props.squares[i]}
      onClick={() => this.props.onClick(i)}
      key={i} // (col * colsAndRows.length + row) for each element
    />
  );
}
```

## 4. Add a toggle button that lets you sort the moves in either ascending or descending order.
1. In `Game` component's `constructor`, add new state
```jsx
this.state = {
  reversed: false,
};
```

2. In `render()` method's return statement, add button inside `<div>`

```jsx
<div className="game-info">
  // ...
  <ol reversed={this.state.reversed}>{moves}</ol>
  <button onClick={() => {
    this.setState({ reversed: !this.state.reversed, }); // exclamation point flips boolean value
  }}>
    Reverse the list
  </button>
</div>
```

There are

* New button with an event handler that flips current state on click.
* Reversed html boolean attribute that changes order of numbers. Without it, button click will only change the order of array's items, thus order of buttons, not the accompanying numbers.

3. In `render()` method, change `moves` variable from `const` to `let` so we can mutate it later. Next, add an `if` statement that will reverse the arrayon each re-render if truthy
```jsx
let moves = history.map((step, move) => {
  // ...
}

if (this.state.reversed) {
  moves = moves.reverse(); // .reverse() is an array method 
}
```

## 5. When someone wins, highlight the three squares that caused the win.

To find out who wins, we use `calculateWinner()` function. To higlight squares, we can apply class to an element and color it with CSS; we can do this in `Square`. We could've called `calculateWinner()` directly in `Square`, but we couldn't pass `Game`'s state with it. Instead, we pass this function from `Game` all the way to `Square` as a prop

1. We need to slightly modify `calculateWinner()` to return not only a winning value but a winning combination as well.  

```jsx
if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
  return [squares[a], lines[i]];
}
```

Because one of the return statements is an array now, we should wrap the last one return statement in brackets too.

2. In `Game`'s `render()` method, add a new variable a the top to store the second `return` value and add index position to all instances of `calculateWinner()` function calls: in `handleClick()` and `render()`

```jsx
const winner = calculateWinner(current.squares)[0];
const winningCombo = calculateWinner(current.squares)[1];
```

```jsx
if (calculateWinner(squares)[0] || squares[i]) {
  return;
}
```

3. In `Game`'s `return()` statement, pass `winningCombo` variable to `<Board />` component as a prop

```jsx
<Board
  // ...
  winningCombo={winningCombo}
/>
```

4. In `Board`'s `render()` method, store the prop in a variable and pass it to `renderSquare()` as an argument

```jsx
const winningCombo = this.props.winningCombo;

return (
  <div>
    {colsAndRows.map((square, col) =>
      <div className="board-row" key={col}>
        {colsAndRows.map((square, row) =>
          this.renderSquare( (col * colsAndRows.length + row), col, row, winningCombo )
        )}
      </div>
    )}
  </div>
);
```

Repeat the process and pass it as a prop to the `<Square />` in `renderSquare()`. In addition, we need to pass another prop with the same value as in `key` prop

```jsx
renderSquare(i, col, row, WinningCombo) {
  return ( 
    <Square
      // ...
      key={i}
      index={i}
      winningCombo={WinningCombo}
    />
  );
}
```

5. Now, in `Square`
* store props in variables;
* initialize a new variable with an empty string to store class name in the future;
* create an `if` statement to test if winning combination is initialized, and if it includes component's `index`. If so, initialize the variable with class name;

```jsx
const winningCombo = props.winningCombo;
const index = props.index;
let comboClass = "";

if (winningCombo && winningCombo.includes(index)) {
  comboClass = 'combo';
}
```

6. Write a CSS rule
```css
.square.combo {
  background-color: green;
}
```

7. Pass the variable to `className`

```jsx
return (
  <button
    className={`square ${comboClass}`}
    // ...
  >
    {props.value}
  </button>
);
```

## 6. When no one wins, display a message about the result being a draw.

1. In `calcualateWinner()`, add another `if` statement before last `return` statement to check if the array doesn't include any `null`

```jsx
if (!squares.includes(null)) {
  return ['Draw'];
}
```

2. In `Game`'s `render()`, update an `if` statement with a winner text

```jsx
if (winner === 'Draw') {
  status = winner;
} else if (winner) {
  status = 'Winner: ' + winner;
} else {
  status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
}
```
