"use client"
import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { Socket, io } from 'socket.io-client';

interface IMessage {
  message: string;
  sender: string;
  isSentByCurrentUser: boolean; // new property
}

const LiveMessage = ({ chatroomid = "test", children }: { chatroomid: string, children?: ReactNode | ReactNode[] }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [message, setMessage] = useState<IMessage>();

  const socket = useRef<Socket<any> | null>(null);



  useEffect(() => {
    if (!isLoaded) {
      setIsLoaded(true);
      socketInitializer();
    }
  }, [])

  async function socketInitializer() {
    await fetch(`/api/socket`)

    // @ts-ignore
    socket.current = io(undefined, {
      path: `/api/socket_io`,
      addTrailingSlash: false,
      forceNew: true
    })

    socket.current.on('connect', () => {
      console.log('connected, joining room: ', chatroomid);
      socket.current!.emit('join-room', chatroomid);
    });

    socket.current.on('message-to-live', (msg: any) => {
      console.log("message received: ", msg);
      setMessage(msg.message);
      // setMessages(prev => {
      //   return [...prev, { ...msg.message }]; // set isSentByCurrentUser to false for received messages
      // });
    });
  }

  return (
    <div className='relative w-full min-h-screen bg-transparent'>
      {
        message?.message && (
          <div className='absolute bottom-4 right-8 bg-slate-600 rounded-md p-8 text-white animate-bounce'>
            <h3 className='font-bold text-2xl'>{message?.sender}</h3>
            <h1 className='font-bold text-5xl'>{message?.message}</h1>
          </div>
        )
      }
    </div>
  )
}

export default LiveMessage