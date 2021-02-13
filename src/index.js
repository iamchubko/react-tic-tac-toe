import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) { // this is a function component
  // it contains only a render method and don't have their own state (in constructor)
  // this component rerenders 9 time
  const winningCombo = props.winningCombo; // array
  const key = props.keyAsProp; // each rerender the key is different

  let comboClass = "";
  if (winningCombo && winningCombo.includes(key)) { // if winningCombo exists and if our combination includes key of current iteration
    comboClass = 'combo';
  }

  return (
    <button
      className={`square ${comboClass}`}
      // when clicked, value inside the constructor changes to 'X'
      onClick={props.onClick}
    >
      {props.value} {/* #3 recieves a prop from the parent */}
    </button>
  );
}

class Board extends React.Component { // React component class
  renderSquare(i, col, row, WinningCombo) { // #2 takes parameter and passes a prop to Square
    return ( 
      <Square
        value={this.props.squares[i]} // 'value' is a prop; takes value from Game's state
        // reads value from the constructor
        onClick={() => this.props.onClick(i, col + 1, row + 1)} // passing values to Game comp (parent)
        key={i} // col * colsAndRows.length + row
        keyAsProp={i}
        winningCombo={WinningCombo}
      />
    );
  }


  render() { // method; same as a function component
    const colsAndRows = [1, 2, 3];

    const winningCombo = this.props.winningCombo; // after winning - array of a winning combo

    // https://reactjs.org/docs/lists-and-keys.html#embedding-map-in-jsx
    return (
      <div>
        {colsAndRows.map((square, col) => // col - index in the array
          <div className="board-row" key={col}> {/* there must be a key because it's rendered three times */}
            {colsAndRows.map((square, row) => // row - index in the array
              this.renderSquare( (col * colsAndRows.length + row), col, row, winningCombo ) // value for identifing each square when interact with it
            )}
          </div>
        )}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) { // React component's state
    super(props); // always there when defining the constructor of a subclass (Board)
    // here we're defining initial state
    this.state = {
      history: [{
        squares: Array(9).fill(null), // creates an array with 9 slots filled with null
      }],
      stepNumber: 0, // index of the first move
      xIsNext: true, // first move will be X
      position: [],
      reversed: false, // displays in the default order 
    };
  }

  handleClick(i) { // function
    const history = this.state.history.slice(0, this.state.stepNumber + 1); // index of the current move + 1
    const current = history[history.length - 1];
    const squares = current.squares.slice(); // creates a copy of the array (parameters aren't included)
    if (calculateWinner(squares)[0] || squares[i]) {
      // if the game has been won (function call not a null) or if a Square is already filled (draw)
      return;
    }

    squares[i] = this.state.xIsNext ? 'X' : 'O'; // i - index of the item in the array;
        // ternary operator; checks if a condition truthy or falsy
    this.setState({ // here we adding new object to the history array
      history: history.concat([{ // concat() doesn't mutate the original array; it creates new
        squares: squares, // assigns squares' value
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext, // flips current boolean value
    });
  }

  jumpTo(step) { // when going back to previous moves
    this.setState({ // changes state
      stepNumber: step, // depending on a button you pressed, different value will be asigned
      xIsNext: (step % 2) === 0, // checks if number is even; if it is, the value is true
    });
  }

  storePosition(col, row) {
    let position = this.state.position.slice(0, this.state.stepNumber); // creats a copy of the array; same as in handleClick()
    position = [...position, [col, row]]; // adding new item using spread syntax

    this.setState({
      position: position, // setting state with the copy of the previous state
    });
  }

  render() {
    const history = this.state.history; // variable for constructor's state
    const current = history[this.state.stepNumber]; // takes the last example in the array
    const winner = calculateWinner(current.squares)[0];
    const winningCombo = calculateWinner(current.squares)[1];
    const position = this.state.position;

    let moves = history.map((step, move) => { // history === { squares: Array(9).fill(null) }
      // step - object with an array of the board's moves; we don't use it
      // move - index of the current move; starts with 0;

      // in ternary operator, 0 is falsy, and >0 is truthy
      const desc = move ? // declaring description for a button
        `Go to move #${move} (${position[move - 1]})`: // if falsy, i.e., 0
        'Go to game start'; // if truthy, i.e., >0

      return (
        <li key={move}> {/* unique identifier */}
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    if (this.state.reversed) { // on each re-render, it reverses array if state is true
      moves = moves.reverse();
    }

    let status;
    if (winner === 'Draw') {
      status = winner;
    } else if (winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i, col, row) => {
              this.handleClick(i);
              this.storePosition(col, row); // callback function to store values from Board comp (child)
            }}
            winningCombo={winningCombo}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol reversed={this.state.reversed}>{moves}</ol> {/* array populated with objects */}
          {/* reversed value depends on state which changes on a click of the button */}
          <button onClick={() => {
            this.setState({ reversed: !this.state.reversed, }); // flips the value
          }}>
            Reverse the list
          </button>
        </div>
      </div>
    );
  }
}

function calculateWinner(squares) { // squares - array of 9 squares
  const lines = [
    // horizontal
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    // vertical
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    // crossed
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i]; // destructuring assignment

    // true if one of lines' array matches data from the board (only AFTER you filled necessary combination)
    // squares[i] shows a value: null, X, O; changes when you click on a square
    // basically, first one defines what value is true, and compares itself with the other two
    // https://stackoverflow.com/questions/2917175/return-multiple-values-in-javascript
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [squares[a], lines[i]]; // 1: value, i.e., X or O; 2: winning combination;
      // 1: you can pass b and c as well; in this case they're all equal
    }
  }

  // true if there's not a single null in the array, i.e., all squares are filled
  if (!squares.includes(null)) {
    return ['Draw'];
  }

  return [null]; // if previous conditionals are false
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
