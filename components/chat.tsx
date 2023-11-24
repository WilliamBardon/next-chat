"use client"
import { ReactNode, useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";

interface IMessage {
  message: string;
  sender: string;
  isSentByCurrentUser: boolean; // new property
}

const Chat = ({ chatroomid, children }: { chatroomid: string, children?: ReactNode | ReactNode[] }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [messages, setMessages] = useState<IMessage[]>([]);

  const message = useRef<HTMLInputElement>(null!);
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

    socket.current.on('receive-message', (msg: any) => {
      console.log("message received: ", msg);
      setMessages(prev => {
        return [...prev, { ...msg.message }]; // set isSentByCurrentUser to false for received messages
      });
    });
  }

  return (
    <div className="w-full h-full bg-slate-200 p-4">
      <button onClick={()=>{
         socket.current!.emit("message-to-live", { chatroomid: chatroomid, message: { message: null, sender: "", isSentByCurrentUser: false } });
      }}>Clean Live Messages</button>
      <div className="flex gap-2">
        <input ref={message} className="py-2 px-4 rounded-md" type="text" placeholder="Type here your message"></input>
        <button className="bg-slate-800 px-4 text-white rounded-md" onClick={() => {
          var messageToSend = message.current.value;

          socket.current!.emit("send-message", { chatroomid: chatroomid, message: { message: messageToSend, sender: 'other user', isSentByCurrentUser: false } });
          // socket.current!.emit("send-message", { chatroomid: chatroomid, message: message.current.value });
          setMessages(prev => {
            console.log("prev: ", prev);
            console.log("message: ", message.current.value);
            return [...prev, { message: messageToSend, sender: 'current user', isSentByCurrentUser: true }]; // set isSentByCurrentUser to true for sent messages
          });
         message.current.value = "";
        }}>Send</button>
      </div>
      <div className="flex flex-col text-black">
        {messages.map((x, index) => {
          return (
            <div key={index} className="flex gap-2 mb-4" style={{ alignSelf: x.isSentByCurrentUser ? 'flex-end' : 'flex-start' }}>
              <span>{x.sender} : {x.message}</span>
              <button onClick={()=>{
                socket.current!.emit("message-to-live", { chatroomid: chatroomid, message: { message: x.message, sender: x.sender, isSentByCurrentUser: false } });
                console.log("message sent to live: ", x);
                }} className="text-xs bg-slate-300 px-2">Send to live</button>
            </div>
          );
        })}
      </div>
      <div>
        <div>{children}</div>
      </div>
    </div>
  )
}

export default Chat;