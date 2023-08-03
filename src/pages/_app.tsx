import '@/styles/globals.css'
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app'

import { trpc } from '../utils/trpc';
import { Session } from 'next-auth';

const MyApp = ({ Component, pageProps }: AppProps<{session: Session}>) => {
  return(
    <SessionProvider session={pageProps.session}>
    <Component {...pageProps} />
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
