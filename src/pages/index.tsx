import Image from 'next/image'
import { Inter } from 'next/font/google'
import { trpc } from '@/utils/trpc'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })
export default function Home() {
  return (
    <main>
      <div>
        <Link href="/login">LOGIN</Link>
        <Link href="/register">REGISTER</Link>
      </div>
    </main>
    )
}
