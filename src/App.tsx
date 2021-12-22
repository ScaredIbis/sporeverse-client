import { useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { io, Socket } from "socket.io-client";
import Game from './Game';
import './App.css';
import public_thumb from './img/public_thumb.png';
import tracer_thumb from './img/tracer_thumb.png';
import vip_thumb from './img/vip_thumb.png';

// const BASE_URL = 'http://localhost:3000'
const BASE_URL='http://35.244.99.101'

type Player = {
  x: number,
  y: number,
  address: string,
  avatar: string,
  label: string,
  currentRoom: string
}

type RoomData = {
  name: string,
  background: string,
  players: Record<string, Player>
}

const emptyRoom = {
  name: 'Spore Village',
  background: 'https://i.ibb.co/HFj2bKP/Screen-Shot-2021-12-21-at-10-30-43-am-cropped.png',
  players: {}
}

const toRedactedAddress = (address: string) => {
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

function App() {
  const [currentAccount, setCurrentAccount] = useState<string>();
  const [playerName, setPlayerName] = useState<string>('');
  const [avatar, setPlayerAvatar] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<{ sender: string, message: string}[]>([]);
  const [sporeverseKey, setSporeverseKey] = useState(window.sessionStorage.getItem('key'));
  const [baseSocket, setBaseSocket] = useState<Socket>()
  const [roomData, setRoomData] = useState<RoomData>(emptyRoom)

  const connectWalletHandler = async () => {
    // @ts-ignore
    const { ethereum } = window;

    if(!ethereum) {
      alert('Please install metamask')
    }

    try {
      console.log('REQUESTING WALLET')
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log('Found an account! address', accounts[0]);
      setCurrentAccount(accounts[0]);
      return accounts[0]
    } catch (error) {
      console.error(error)
    }
  }

  const logout = () => {
    window.sessionStorage.removeItem('key');
    setSporeverseKey(null)
    setRoomData(emptyRoom)
  }

  useEffect(() => {
    const _baseSocket = io(BASE_URL);
    _baseSocket.on('tick', data => {
      setRoomData(data);
    })
    _baseSocket.on('message', data => {
      setMessages(previous => [data, ...previous]);
    })
    setBaseSocket(_baseSocket)
  }, [])

  const joinSocketRoom = useCallback(async (roomName: string) => {
    console.log('ATTEMPTING TO JOIN SOCKET ROOM')

    setMessages([])

    if(sporeverseKey) {

      console.log("BASE SOCKET", baseSocket)

      console.log('EMITTING JOIN')
      if(baseSocket) {
        baseSocket.emit('join', { key: sporeverseKey, roomName });
      } else {
        console.log('NO BASE SOCKET')
      }
    } else {
      console.log('NO SPOREVERSE KEY')
    }
  }, [sporeverseKey, baseSocket])

  const loginToSporeverseHandler = useCallback(async () => {
      // @ts-ignore
      const { ethereum } = window;

      if(!ethereum) {
        alert('Please install metamask')
      }

      const account = await connectWalletHandler()

      const { nonce } = await fetch(`${BASE_URL}/nonce/${account}`).then(res => res.json());

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();

      const message = `Log into the Sporeverse: ${nonce}`
      const signature = await signer.signMessage(message);

      const { key } = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          address: account,
          signature,
          message
        })
      }).then(res => res.json())

      window.sessionStorage.setItem('key', key)
      setSporeverseKey(key);
  }, [])

  const handlePlayerMoved = useCallback((direction: { x: number, y: number }) => {
    if(baseSocket) {
      baseSocket.emit('move', direction)
    }
  }, [baseSocket])

  useEffect(() => {
    if(currentAccount && sporeverseKey) {
      // connectToSocket();
      joinSocketRoom('public')
    }
    // refresh socket connection
  }, [currentAccount, sporeverseKey, joinSocketRoom])

  useEffect(() => {
    connectWalletHandler()
    // refresh socket connection
  }, [])

  const updatePlayerName = useCallback(() => {
    if(baseSocket) {
      baseSocket.emit('updateName', playerName)
    }
  }, [baseSocket, playerName])

  const updatePlayerAvatar = useCallback(() => {
    if(baseSocket) {
      baseSocket.emit('updateAvatar', avatar)
    }
  }, [baseSocket, avatar])

  const sendMessage = useCallback(() => {
    if(baseSocket) {
      baseSocket.emit('sendMessage', message)
      setMessage('')
    }
  }, [baseSocket, message])

  return (
    <div className='main-app'>
      <div>
        <h1 style={{ display: 'inline-block', marginRight: '10px', color: 'white' }}>Hello Spore</h1>
          <button onClick={loginToSporeverseHandler} disabled={Boolean(sporeverseKey)} className='cta-button connect-wallet-button'>
            { sporeverseKey && currentAccount ? `Logged in as ${toRedactedAddress(currentAccount)}` : 'Log into the sporeverse' }
          </button>
          <button className="logout-button" onClick={() => logout()}>
            logout
          </button>
          {/* AKA */}
          {/* <input>  </> */}
      </div>
      <div style={{ display: 'flex' }}>
        <div>
          { baseSocket ? (
            <Game
              players={roomData.players}
              name={roomData.name}
              background={roomData.background}
              handlePlayerMoved={handlePlayerMoved}
            />
          ) : (
            <img
            src={emptyRoom.background}
            width="1100px"
            height="auto"
            alt="public sporeverse"
          ></img>
          ) }

        </div>
        <div style={{ color: 'white', marginLeft: '20px', marginRight: '20px', display: 'flex', flexDirection: 'column' }}>
          <img
            style={{ marginBottom: '30px', cursor: 'pointer' }}
            width="100px"
            src={public_thumb}
            alt="public_area_thumbnail"
            onClick={() => joinSocketRoom('public')}
          />
          <img
            style={{ marginRight: '30px', cursor: 'pointer'  }}
            width="100px"
            src={vip_thumb}
            alt="vip_area_thumbnail"
            onClick={() => joinSocketRoom('vip')}
          />
          <img
            style={{ marginRight: '30px', cursor: 'pointer'  }}
            width="100px"
            src={tracer_thumb}
            alt="tracer_area_thumbnail"
            onClick={() => joinSocketRoom('tracer')}
          />
        </div>
        <div style={{color: 'white'}} id="profile">
          <p><strong style={{fontSize: '24px'}}>Spore Profile</strong></p>
          <strong style={{fontSize: '18px'}}>Name</strong>
          <br/>
          <input type="text" value={playerName} onChange={(event) => setPlayerName(event.target.value)}/>
          <button onClick={() => updatePlayerName()}>save</button>
          <br/>
          <br/>
          <strong style={{fontSize: '18px'}}>Avatar</strong>
          <br/>
          <input type="text" value={avatar} onChange={(event) => setPlayerAvatar(event.target.value)}/>
          <button onClick={updatePlayerAvatar} >save</button>
          <br/>
          <br/>
          <p><strong style={{fontSize: '24px'}}>Spore Chat ({roomData.name})</strong></p>
          <strong style={{fontSize: '18px'}}>Message</strong>
          <br/>
          <textarea cols={25} rows={6} value={message} onChange={(event) => setMessage(event.target.value)}/>
          <button onClick={() => sendMessage()}>send</button>
          <br/>
          {messages.map(message => (
            <div style={{ marginBottom: '5px' }}>
              <strong>{message.sender}:</strong><br/>
              <span>{message.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App;