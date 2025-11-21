// Simple Linear Congruential Generator (LCG)
let seed = 123456789;

export const setSeed = (newSeed) => {
    seed = newSeed;
};

const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
};

export const getBestMove = (game) => {
    const possibleMoves = game.moves();
    if (possibleMoves.length === 0) return null;

    // Random move using seeded RNG (Level 0)
    const randomIndex = Math.floor(seededRandom() * possibleMoves.length);
    return possibleMoves[randomIndex];
};
