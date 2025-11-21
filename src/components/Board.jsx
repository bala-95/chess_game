import React from 'react';
import { Square } from './Square';
import { Piece } from './Pieces';
import './Board.css';

export const Board = ({
    game,
    board,
    onSquareClick,
    selectedSquare,
    possibleMoves,
    lastMove,
    orientation = 'w'
}) => {

    const isflipped = orientation === 'b';

    const renderSquare = (i) => {
        const row = isflipped ? 7 - i : i;

        const squares = [];
        for (let j = 0; j < 8; j++) {
            const col = isflipped ? 7 - j : j;
            const square = String.fromCharCode(97 + col) + (8 - row);
            const piece = board[row][col];
            const isBlack = (row + col) % 2 === 1;

            const isSelected = selectedSquare === square;
            const isPossibleMove = possibleMoves.includes(square);
            const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);

            // Check if this square contains the king and is in check
            const isCheck = game.inCheck() && piece && piece.type === 'k' && piece.color === game.turn();

            squares.push(
                <Square
                    key={square}
                    isBlack={isBlack}
                    onClick={() => onSquareClick(square)}
                    isSelected={isSelected}
                    isPossibleMove={isPossibleMove}
                    isLastMove={isLastMove}
                    isCheck={isCheck}
                >
                    {piece && <Piece type={piece.type} color={piece.color} />}
                </Square>
            );
        }
        return squares;
    };

    const rows = [];
    for (let i = 0; i < 8; i++) {
        rows.push(
            <div key={i} className="board-row">
                {renderSquare(i)}
            </div>
        );
    }

    return (
        <div className="board">
            {rows}
            <Coordinates orientation={orientation} />
        </div>
    );
};

const Coordinates = ({ orientation }) => {
    const files = orientation === 'w' ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];
    const ranks = orientation === 'w' ? ['1', '2', '3', '4', '5', '6', '7', '8'] : ['8', '7', '6', '5', '4', '3', '2', '1'];

    return (
        <>
            <div className="coords files">
                {files.map(f => <span key={f}>{f}</span>)}
            </div>
            <div className="coords ranks">
                {ranks.reverse().map(r => <span key={r}>{r}</span>)}
            </div>
        </>
    );
};
