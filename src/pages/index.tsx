import Image from 'next/image'
import { Inter } from 'next/font/google'
import { trpc } from '@/utils/trpc'

const inter = Inter({ subsets: ['latin'] })
export default function Home() {
const hello = trpc.hello.useQuery({text: 'client'})
if (!hello.data) {
  return <div>Loading...</div>;
}


  return (
    <main>
      <div>
        {hello.data?.greeting}
      </div>
    </main>
    )
}
