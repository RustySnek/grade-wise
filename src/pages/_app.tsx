import '@/styles/globals.css'
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app'
import { trpc } from '../utils/trpc';
import { Session } from 'next-auth';
import Image from 'next/image';
import NavBar from './nav_bars/_navbar';
import ErrorBoundary from './_boundary';

const MyApp = ({ Component, pageProps }: AppProps<{ session: Session }>) => {
  return (
    <ErrorBoundary>

      <SessionProvider session={pageProps.session}>
        <main className=' flex flex-col'>
          <NavBar />
          <Component {...pageProps} />

        </main>
      </SessionProvider>
    </ErrorBoundary>

  );
};

export default trpc.withTRPC(MyApp);
