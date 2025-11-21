// AI Chess Engine with difficulty levels
// Seeded random number generator using Linear Congruential Generator (LCG)
let seed = 123456789;

function seededRandom() {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
}

export const setSeed = (newSeed) => {
    seed = newSeed;
};

// Piece values for move evaluation
const PIECE_VALUES = {
    'p': 1,   // Pawn
    'n': 3,   // Knight
    'b': 3,   // Bishop
    'r': 5,   // Rook
    'q': 9,   // Queen
    'k': 0    // King (invaluable)
};

// Position bonuses for piece placement (simplified)
const POSITION_BONUS = {
    'p': [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [5, 5, 5, 5, 5, 5, 5, 5],
        [1, 1, 2, 3, 3, 2, 1, 1],
        [0.5, 0.5, 1, 2.5, 2.5, 1, 0.5, 0.5],
        [0, 0, 0, 2, 2, 0, 0, 0],
        [0.5, -0.5, -1, 0, 0, -1, -0.5, 0.5],
        [0.5, 1, 1, -2, -2, 1, 1, 0.5],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ],
    'n': [
        [-5, -4, -3, -3, -3, -3, -4, -5],
        [-4, -2, 0, 0, 0, 0, -2, -4],
        [-3, 0, 1, 1.5, 1.5, 1, 0, -3],
        [-3, 0.5, 1.5, 2, 2, 1.5, 0.5, -3],
        [-3, 0, 1.5, 2, 2, 1.5, 0, -3],
        [-3, 0.5, 1, 1.5, 1.5, 1, 0.5, -3],
        [-4, -2, 0, 0.5, 0.5, 0, -2, -4],
        [-5, -4, -3, -3, -3, -3, -4, -5]
    ]
};

function getPositionValue(piece, square) {
    const type = piece.type;
    const color = piece.color;

    if (!POSITION_BONUS[type]) return 0;

    const file = square.charCodeAt(0) - 97; // a-h to 0-7
    const rank = parseInt(square[1]) - 1;   // 1-8 to 0-7

    // Flip rank for black pieces
    const adjustedRank = color === 'w' ? rank : 7 - rank;

    return POSITION_BONUS[type][adjustedRank][file] / 10;
}

function evaluateMove(game, move, difficulty) {
    let score = 0;

    // Make the move temporarily
    game.move(move);

    // Material evaluation
    if (move.captured) {
        score += PIECE_VALUES[move.captured] * 10;
    }

    if (difficulty === 'hard') {
        // Position evaluation
        const piece = game.get(move.to);
        if (piece) {
            score += getPositionValue(piece, move.to);
        }

        // Check if move puts opponent in check
        if (game.inCheck()) {
            score += 5;
        }

        // Penalize moving into threats (simplified)
        const attacks = game.moves({ square: move.to, verbose: true });
        score -= attacks.length * 0.1;
    }

    // Undo the move
    game.undo();

    return score;
}

export function getBestMove(game, difficulty = 'medium') {
    const moves = game.moves({ verbose: true });

    if (moves.length === 0) return null;

    // Easy: Pure random (using seeded random)
    if (difficulty === 'easy') {
        const randomIndex = Math.floor(seededRandom() * moves.length);
        return moves[randomIndex];
    }

    // Medium & Hard: Evaluate moves
    const scoredMoves = moves.map(move => ({
        move,
        score: evaluateMove(game, move, difficulty)
    }));

    // Sort by score (highest first)
    scoredMoves.sort((a, b) => b.score - a.score);

    if (difficulty === 'medium') {
        // Medium: Pick from top 3 moves randomly
        const topMoves = scoredMoves.slice(0, Math.min(3, scoredMoves.length));
        const randomIndex = Math.floor(seededRandom() * topMoves.length);
        return topMoves[randomIndex].move;
    }

    // Hard: Pick best move with small randomness
    const bestScore = scoredMoves[0].score;
    const bestMoves = scoredMoves.filter(m => m.score >= bestScore - 1);
    const randomIndex = Math.floor(seededRandom() * bestMoves.length);
    return bestMoves[randomIndex].move;
}
