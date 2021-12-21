import { stringify } from 'querystring'
import React, { useCallback, useEffect, useState, useMemo } from 'react'

type Player = {
  x: number,
  y: number,
  address: string,
  avatar: string,
  label: string,
  currentRoom: string
}

const GameArea = ({
  playerAddress,
  players,
  handlePlayerMoved
}: {
  playerAddress: Player['address'],
  players: Record<string, Player>,
  handlePlayerMoved: (direction: { x: number, y: number }) => void
}) => {
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);

  useEffect(() => {
    console.log('ADDING EVENT LISTENER')

    window.addEventListener("keydown", function (event: any) {
      if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
      }

      const delta = 7

      switch (event.key) {
        case "Down": // IE/Edge specific value
        case "ArrowDown":
          handlePlayerMoved({ y: delta, x: 0 })
          // Do something for "down arrow" key press.
          break;
        case "Up": // IE/Edge specific value
        case "ArrowUp":
          handlePlayerMoved({ y: -delta, x: 0 })
          // Do something for "up arrow" key press.
          break;
        case "Left": // IE/Edge specific value
        case "ArrowLeft":
          handlePlayerMoved({ x: -delta, y: 0 })
          // Do something for "left arrow" key press.
          break;
        case "Right": // IE/Edge specific value
        case "ArrowRight":
          handlePlayerMoved({ x: delta, y: 0 })
          // Do something for "right arrow" key press.
          break;
        default:
          return; // Quit when this doesn't handle the key event.
      }

      // Cancel the default action to avoid it being handled twice
      event.preventDefault();
    }, true)
  }, [handlePlayerMoved])

  return (
    <>
      {(Object.values(players).map(player => (
        <div
          key={player.address}
          style={{
            position: 'absolute',
            left: player.x,
            top: player.y
          }}
        >
          <img alt={player.address} height="80" width="80" src={player.avatar}></img>
          <span>{player.address.slice(0, 6)}...</span>
        </div>
      )))}
    </>
  )
}

const Game = ({
  playerAddress,
  players,
  handlePlayerMoved
}: {
  playerAddress: string,
  players: Record<string, Player>
  handlePlayerMoved: (direction: { x: number, y: number }) => void
}) => {
  return (
    <GameArea
      playerAddress={playerAddress}
      players={players}
      handlePlayerMoved={handlePlayerMoved}
    />
  )
}

export default Game;