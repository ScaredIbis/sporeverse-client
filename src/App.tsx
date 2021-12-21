import { useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { io, Socket } from "socket.io-client";
import Game from './Game';
import './App.css';

const BASE_URL = 'http://localhost:3000'

type Player = {
  x: number,
  y: number,
  address: string,
  avatar: string,
  label: string,
  currentRoom: string
}

const toRedactedAddress = (address: string) => {
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

function App() {
  const [currentAccount, setCurrentAccount] = useState<string>();
  const [sporeverseKey, setSporeverseKey] = useState(window.sessionStorage.getItem('key'));
  const [roomSocket, setRoomSocket] = useState<Socket>()
  const [baseSocket, setBaseSocket] = useState<Socket>()
  const [players, setPlayers] = useState<Record<string, Player>>({})

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
    } catch (error) {
      console.error(error)
    }
  }

  const logout = () => {
    window.sessionStorage.removeItem('key');
    setSporeverseKey(null)
  }

  useEffect(() => {
    const _baseSocket = io(BASE_URL);
    _baseSocket.on('tick', data => {
      setPlayers(data);
    })
    setBaseSocket(_baseSocket)
  }, [])

  const joinSocketRoom = useCallback(async (roomName: string) => {
    console.log('ATTEMPTING TO JOIN SOCKET ROOM')

    if(sporeverseKey) {

      console.log("BASE SOCKET", baseSocket)

      console.log('EMITTING JOIN')
      if(baseSocket) {
        baseSocket.emit('join', { key: sporeverseKey, roomName });
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

    await connectWalletHandler()

    const { nonce } = await fetch(`${BASE_URL}/nonce/${currentAccount}`).then(res => res.json());

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
        address: currentAccount,
        signature,
        message
      })
    }).then(res => res.json())

    window.sessionStorage.setItem('key', key)
    setSporeverseKey(key);
  }, [currentAccount])

  const handlePlayerMoved = useCallback((direction: { x: number, y: number }) => {
    if(baseSocket) {
      baseSocket.emit('move', direction)
    }
  }, [baseSocket])

  // const loginToSporeverseButton = useCallback(() => {
  //   return (
  //     <button onClick={loginToSporeverseHandler} disabled={Boolean(sporeverseKey)} className='cta-button connect-wallet-button'>
  //       { sporeverseKey && currentAccount ? `Logged in as ${toRedactedAddress(currentAccount)}` : 'Log into the sporeverse' }
  //     </button>
  //   )
  // }, [sporeverseKey, currentAccount, loginToSporeverseHandler])

  useEffect(() => {
    connectWalletHandler();
    if(currentAccount && sporeverseKey) {
    }
    // joinSocketRoom('public');
    // const socket = io("https://server-domain.com");
  }, [])


  useEffect(() => {
    if(currentAccount && sporeverseKey) {
      // connectToSocket();
      joinSocketRoom('public')
    }
    // refresh socket connection
  }, [currentAccount, sporeverseKey])

  // useEffect(() => {
  //   // refresh socket connection
  // }, [currentAccount, sporeverseKey])



  return (
    <div className='main-app'>
      <div>
        <h1 style={{ display: 'inline-block', marginRight: '10px' }}>Hello Spore</h1>
          <button onClick={loginToSporeverseHandler} disabled={Boolean(sporeverseKey)} className='cta-button connect-wallet-button'>
            { sporeverseKey && currentAccount ? `Logged in as ${toRedactedAddress(currentAccount)}` : 'Log into the sporeverse' }
          </button>
          <button onClick={() => joinSocketRoom('public')}>
            join public room
          </button>
          <button onClick={() => joinSocketRoom('vip')}>
            join private room
          </button>
          <button onClick={() => logout()}>
            logout
          </button>

          {/* AKA */}
          {/* <input>  </> */}
        </div>
      <div>
        {
          currentAccount && sporeverseKey ? (
            <Game
              playerAddress={currentAccount}
              players={players}
              handlePlayerMoved={handlePlayerMoved}
            />
          ) : null
        }
      </div>
    </div>
  )
}

// const LoginToSporeverseButton: React.FC<{
//   account?: string,
//   handleLogin:
// }> = ({})

export default App;