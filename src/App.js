import React, { useState, useEffect } from 'react';
import './App.css';

const drawSound = new Audio('/sounds/draw.mp3');
const placeSound = new Audio('/sounds/place.mp3');
const rotateSound = new Audio('/sounds/rotate.mp3');

const tiles = [ //every possible tile combination in the deck
  [1, 0, 3, 2, 5, 4, 7, 6], // tile1
  [3, 6, 5, 0, 7, 2, 1, 4], // tile2
  [4, 5, 6, 7, 0, 1, 2, 3], // tile3
  [5, 4, 7, 6, 1, 0, 3, 2], // tile4
  [7, 2, 1, 4, 3, 6, 5, 0], // tile5
  [1, 0, 6, 7, 5, 4, 2, 3], // tile6
  [1, 0, 7, 6, 5, 4, 3, 2], // tile7
  [5, 4, 6, 7, 1, 0, 2, 3], // tile8
  [6, 3, 4, 1, 2, 7, 0, 5], // tile9
  [3, 5, 6, 0, 7, 1, 2, 4], // tile10
  [2, 3, 0, 1, 6, 7, 4, 5], // tile11
  [4, 2, 1, 7, 0, 6, 5, 3], // tile12
  [3, 2, 1, 0, 7, 6, 5, 4], // tile13
  [4, 7, 6, 5, 0, 3, 2, 1], // tile14
  [2, 5, 0, 7, 6, 1, 4, 3], // tile15
  [6, 3, 7, 1, 5, 4, 0, 2], // tile16
  [3, 6, 7, 0, 5, 4, 1, 2], // tile17
  [7, 2, 1, 6, 5, 4, 3, 0], // tile18
  [2, 7, 0, 6, 5, 4, 3, 1], // tile19
  [3, 6, 4, 0, 2, 7, 1, 5], // tile20
  [2, 7, 0, 4, 3, 6, 5, 1], // tile21
  [6, 7, 3, 2, 5, 4, 0, 1], // tile22
  [7, 6, 3, 2, 5, 4, 1, 0], // tile23
  [5, 6, 7, 4, 3, 0, 1, 2], // tile24
  [5, 3, 7, 1, 6, 0, 4, 2], // tile25
  [2, 6, 0, 4, 3, 7, 1, 5], // tile26
  [3, 2, 1, 0, 6, 7, 4, 5], // tile27
  [3, 7, 6, 0, 5, 4, 2, 1], // tile28
  [2, 6, 0, 7, 5, 4, 1, 3], // tile29
  [6, 2, 1, 7, 5, 4, 0, 3], // tile30
  [7, 3, 6, 1, 5, 4, 2, 0], // tile31
  [4, 6, 7, 5, 0, 3, 1, 2], // tile32
  [3, 5, 7, 0, 6, 1, 4, 2], // tile33
  [7, 4, 6, 5, 1, 3, 2, 0], // tile34
  [5, 2, 1, 7, 6, 0, 4, 3], // tile35
];

function App() {
  //grid state
  const [grid, setGrid] = useState(Array(36).fill('blank'));
  const [deck, setDeck] = useState([...Array(35)].map((_, i) => i + 1));
  //hand state
  const [hand, setHand] = useState([]);
  //dragging tile state
  const [draggingTile, setDraggingTile] = useState(null);
  //sounds toggle state
  const [isMuted, setIsMuted] = useState(false);
  //player state
  const [players, setPlayers] = useState([{ color: 'red', position: 0 }]); // Initialize with one player for simplicity


  useEffect(() => { //sounds mute button toggle effect
    drawSound.muted = isMuted;
    placeSound.muted = isMuted;
    rotateSound.muted = isMuted;
  }, [isMuted]);

  //tile logic (dragging, rotating, dropping)
  const drawTile = () => {
    if (deck.length > 0 && hand.length < 3) {
      const randomIndex = Math.floor(Math.random() * deck.length);
      const drawnTile = deck[randomIndex];
      setDeck(deck.filter((_, index) => index !== randomIndex));
      setHand([...hand, { id: drawnTile, rotation: 0 }]);
      drawSound.play();
    }
  };

  const rotateTile = (index) => {
    setHand(prevHand => {
      const newHand = [...prevHand];
      const currentRotation = newHand[index].rotation || 0;
      newHand[index] = {
        ...newHand[index],
        rotating: true,
        rotation: (currentRotation + 90) % 360
      };

      rotateSound.play();

      // Remove the rotating class after the animation
      setTimeout(() => {
        setHand(latestHand => {
          const updatedHand = [...latestHand];
          updatedHand[index] = { ...updatedHand[index], rotating: false };
          return updatedHand;
        });
      }, 300); // Match this to your CSS transition duration

      return newHand;
    });
  };

  const onDragStart = (e, tileIndex) => {
    setDraggingTile(hand[tileIndex]);
    e.dataTransfer.setData('text/plain', tileIndex);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = (e, gridIndex) => {
    e.preventDefault();
    const handIndex = parseInt(e.dataTransfer.getData('text/plain'));

    if (grid[gridIndex] === 'blank') {
      const newGrid = [...grid];
      newGrid[gridIndex] = `tile${draggingTile.id}`;
      setGrid(newGrid);

      const newHand = hand.filter((_, index) => index !== handIndex);
      setHand(newHand);

      placeSound.play();
    }

    setDraggingTile(null);
  };

  //player logic

  const addPlayer = () => {
    if (players.length < 8) {
      setPlayers([...players, { color: `player${players.length + 1}`, position: null }]);
    }
  };
  


  return (
    <div className="App">
      <div className="controls">
        <div className="deck" onClick={drawTile}>
          Deck
        </div>
        <button className="mutebutton" onClick={() => setIsMuted(!isMuted)}>
          {isMuted ? <img className='buttonicon' src="/icons/muted.svg" alt="muted" /> : <img className='buttonicon' src='/icons/unmuted.svg' alt="unmuted" />}
        </button>
      </div>
      <div className="game-board">
        <div className="grid">
          {grid.map((tile, index) => {
            const row = Math.floor(index / 6);
            const col = index % 6;
            const isEdgeTile = row === 0 || row === 5 || col === 0 || col === 5;

            return (
              <div
                key={index}
                className="tile-container"
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, index)}
              >
                {players.map((player, playerIndex) =>
                  player.position === index && (
                    <div
                      key={playerIndex}
                      className="player"
                      style={{ backgroundColor: player.color }}
                    />
                  )
                )}
                <img
                  src={`/pieces/${tile}.svg`}
                  alt={`Tile ${index}`}
                  className="tile"
                />
              </div>
            );

          })}
        </div>
      </div>
      <div className="hand">
        {(hand.length !== 0) ? hand.map((tile, index) => (
          <img
            key={index}
            src={`/pieces/tile${tile.id}.svg`}
            alt={`Hand Tile ${tile.id}`}
            className="hand-tile ${tile.rotating ? 'rotating' : ''}"
            style={{ transform: `rotate(${tile.rotation}deg)` }}
            onClick={() => rotateTile(index)}
            draggable
            onDragStart={(e) => onDragStart(e, index)}
          />
        )) : "Click to rotate tiles!"}
      </div>
    </div>
  );
}

export default App;
