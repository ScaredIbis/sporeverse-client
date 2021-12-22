import { useEffect } from 'react'

type Player = {
  x: number,
  y: number,
  address: string,
  avatar: string,
  label: string,
  currentRoom: string
}

const Game = ({
  players,
  background,
  handlePlayerMoved
}: {
  players: Record<string, Player>,
  name: string,
  background: string,
  handlePlayerMoved: (direction: { x: number, y: number }) => void
}) => {
  useEffect(() => {

    const handler = function (event: any) {
      if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
      }

      const movementSpeed = 12

      switch (event.key) {
        case "Down": // IE/Edge specific value
        case "ArrowDown":
          handlePlayerMoved({ y: movementSpeed, x: 0 })
          // Do something for "down arrow" key press.
          break;
        case "Up": // IE/Edge specific value
        case "ArrowUp":
          handlePlayerMoved({ y: -movementSpeed, x: 0 })
          // Do something for "up arrow" key press.
          break;
        case "Left": // IE/Edge specific value
        case "ArrowLeft":
          handlePlayerMoved({ x: -movementSpeed, y: 0 })
          // Do something for "left arrow" key press.
          break;
        case "Right": // IE/Edge specific value
        case "ArrowRight":
          handlePlayerMoved({ x: movementSpeed, y: 0 })
          // Do something for "right arrow" key press.
          break;
        default:
          return; // Quit when this doesn't handle the key event.
      }

      // Cancel the default action to avoid it being handled twice
      event.preventDefault();
    }

    window.addEventListener("keydown", handler, true)
  }, [handlePlayerMoved])

  return (
    <>
      <img
        src={background}
        width="1100px"
        height="auto"
        alt="public sporeverse"
      ></img>

      {(Object.values(players).map(player => (
        <div
          key={player.address}
          style={{
            position: 'absolute',
            left: player.x,
            top: player.y,
          }}
        >
          <img alt={player.address} width="90" src={player.avatar}></img>
          <div style={{ background: 'rgba(255, 255, 255, 0.8)', padding: '4px', textAlign: 'center' }}>{player.label || `${player.address.slice(0, 6)}...`}</div>
        </div>
      )))}
    </>
  )
}

export default Game;