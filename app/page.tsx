import Chat from '@/components/chat'
import Image from 'next/image'
import LiveMessage from './livemessage/page'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <Chat chatroomid="test" />
    </main>
  )
}
