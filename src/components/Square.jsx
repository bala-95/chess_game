import React from 'react';

export const Square = ({
    isBlack,
    children,
    onClick,
    isSelected,
    isPossibleMove,
    isLastMove,
    isCheck
}) => {
    const backgroundColor = isBlack ? 'var(--board-dark)' : 'var(--board-light)';

    let overlay = null;
    if (isSelected) {
        overlay = <div className="square-overlay selected" />;
    } else if (isLastMove) {
        overlay = <div className="square-overlay last-move" />;
    }

    return (
        <div
            className={`square ${isBlack ? 'black' : 'white'}`}
            onClick={onClick}
            style={{ backgroundColor, position: 'relative' }}
        >
            {overlay}
            <div className="square-content">
                {children}
            </div>
            {isPossibleMove && (
                <div className={`possible-move ${children ? 'capture' : ''}`} />
            )}
            {isCheck && <div className="check-indicator" />}
        </div>
    );
};
