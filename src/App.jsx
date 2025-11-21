import React, { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Board } from './components/Board';
import { RotateCcw, ArrowLeftRight, Bot, User, Hash, LogOut } from 'lucide-react';
import { getBestMove, setSeed } from './ai/Engine';
import { useAuth } from './contexts/AuthContext';
import { Login } from './components/Auth/Login';
import { Signup } from './components/Auth/Signup';
import { StatsCard } from './components/Stats/StatsCard';
import { gameStats } from './services/gameStats';
import './App.css';

function App() {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [orientation, setOrientation] = useState('w');
  const [lastMove, setLastMove] = useState(null);
  const [history, setHistory] = useState([]);
  const [gameMode, setGameMode] = useState('PvP'); // 'PvP' or 'PvAI'
  const [aiColor] = useState('b'); // AI plays Black by default
  const [seed, setSeedState] = useState(123456789);
  const [showSignup, setShowSignup] = useState(false);
  const [statsKey, setStatsKey] = useState(0); // Force stats refresh
  const { user, loading, signOut } = useAuth();

  // Sound effects (optional, maybe later)

  const makeMove = useCallback((move) => {
    try {
      const result = game.move(move);
      if (result) {
        setGame(new Chess(game.fen())); // Trigger re-render
        setLastMove({ from: result.from, to: result.to });
        setHistory(h => [...h, result.san]);
        setSelectedSquare(null);
        setPossibleMoves([]);
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }, [game]);

  // Check for game end and save result
  useEffect(() => {
    if (!user || !game.isGameOver()) return;

    const saveResult = async () => {
      let result;
      const currentPlayer = game.turn() === 'w' ? 'Black' : 'White'; // Winner is opposite of current turn

      if (game.isCheckmate()) {
        // Determine if user won or lost
        if (gameMode === 'PvAI') {
          // In PvAI mode, user is white, AI is black
          result = currentPlayer === 'White' ? 'win' : 'loss';
        } else {
          // In PvP mode, we can't determine winner without more info
          // For now, we'll save based on who's turn it is
          result = 'win'; // Simplified for now
        }
      } else {
        // Draw (stalemate, insufficient material, etc.)
        result = 'draw';
      }

      const opponent = gameMode === 'PvAI' ? 'AI' : 'Human';
      await gameStats.saveGameResult(user.id, result, opponent);

      // Refresh stats after saving
      setStatsKey(k => k + 1);
    };

    saveResult();
  }, [game, user, gameMode]);

  // AI Move Effect
  useEffect(() => {
    if (gameMode === 'PvAI' && game.turn() === aiColor && !game.isGameOver()) {
      const timeoutId = setTimeout(() => {
        const aiMove = getBestMove(game);
        if (aiMove) {
          makeMove(aiMove);
        }
      }, 500); // Small delay for realism
      return () => clearTimeout(timeoutId);
    }
  }, [game, gameMode, aiColor, makeMove]);

  const onSquareClick = (square) => {
    // If a square is already selected
    if (selectedSquare) {
      // Attempt to move to the clicked square
      const move = {
        from: selectedSquare,
        to: square,
        promotion: 'q' // always promote to queen for simplicity for now
      };

      if (makeMove(move)) {
        return;
      }

      // If move failed, check if we clicked on another piece of our own color
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
        const moves = game.moves({ square, verbose: true }).map(m => m.to);
        setPossibleMoves(moves);
        return;
      }

      // Deselect if clicking elsewhere
      setSelectedSquare(null);
      setPossibleMoves([]);
    } else {
      // Select a piece
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
        const moves = game.moves({ square, verbose: true }).map(m => m.to);
        setPossibleMoves(moves);
      }
    }
  };

  const resetGame = () => {
    setGame(new Chess());
    setSelectedSquare(null);
    setPossibleMoves([]);
    setLastMove(null);
    setHistory([]);
  };

  const flipBoard = () => {
    setOrientation(o => o === 'w' ? 'b' : 'w');
  };

  const toggleGameMode = () => {
    setGameMode(mode => mode === 'PvP' ? 'PvAI' : 'PvP');
    // Optional: Reset game when switching modes? Maybe not strictly necessary but cleaner.
    // resetGame(); 
  };

  const handleSeedChange = (e) => {
    const newSeed = parseInt(e.target.value, 10);
    if (!isNaN(newSeed)) {
      setSeedState(newSeed);
      setSeed(newSeed);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="app-container">
        <div className="loading-message">Loading...</div>
      </div>
    );
  }

  // Show auth page if not logged in
  if (!user) {
    return showSignup ?
      <Signup onToggleMode={() => setShowSignup(false)} /> :
      <Login onToggleMode={() => setShowSignup(true)} />;
  }

  // Game Status
  let status = '';
  if (game.isCheckmate()) {
    status = `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins!`;
  } else if (game.isStalemate()) {
    status = 'Stalemate! Draw.';
  } else if (game.isInsufficientMaterial()) {
    status = 'Draw! Insufficient Material.';
  } else if (game.isThreefoldRepetition()) {
    status = 'Draw! Threefold Repetition.';
  } else if (game.isDraw()) {
    status = 'Draw!';
  } else if (game.isCheck()) {
    status = 'Check!';
  } else {
    status = `${game.turn() === 'w' ? 'White' : 'Black'}'s turn`;
  }

  return (
    <div className="app-container">
      <div className="game-layout">
        <div className="board-container">
          <Board
            game={game}
            board={game.board()}
            onSquareClick={onSquareClick}
            selectedSquare={selectedSquare}
            possibleMoves={possibleMoves}
            lastMove={lastMove}
            orientation={orientation}
          />
        </div>

        <div className="sidebar">
          <div className="status-card">
            <h2>{status}</h2>
            <div className="controls">
              <button onClick={resetGame} title="New Game">
                <RotateCcw size={20} /> New Game
              </button>
              <button onClick={flipBoard} title="Flip Board">
                <ArrowLeftRight size={20} /> Flip
              </button>
              <button onClick={toggleGameMode} title="Toggle Game Mode" className={gameMode === 'PvAI' ? 'active-mode' : ''}>
                {gameMode === 'PvAI' ? <Bot size={20} /> : <User size={20} />}
                {gameMode === 'PvAI' ? ' vs AI' : ' vs Friend'}
              </button>
              <button onClick={signOut} title="Sign Out" className="signout-button">
                <LogOut size={20} /> Sign Out
              </button>
              {gameMode === 'PvAI' && (
                <div className="seed-control">
                  <Hash size={16} />
                  <input
                    type="number"
                    value={seed}
                    onChange={handleSeedChange}
                    title="AI Random Seed"
                  />
                </div>
              )}
            </div>
          </div>

          <StatsCard key={statsKey} />

          <div className="history-card">
            <h3>Move History</h3>
            <div className="history-list">
              {history.map((move, i) => (
                <span key={i} className={i % 2 === 0 ? 'move-white' : 'move-black'}>
                  {i % 2 === 0 ? `${Math.floor(i / 2) + 1}. ` : ''}{move}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
