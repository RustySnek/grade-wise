import { NextApiRequest, NextApiResponse } from 'next';
import { getSession, SessionProvider } from 'next-auth/react';
import { User } from 'next-auth';


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });

  if (!session || !session.user || !(new Date(session.expires) <= new Date())) {
    // If there's no session or the user is not an admin, respond with a 403 Forbidden status
    return res.status(403).json({ error: 'Access forbidden' });
  }

  // If the user is an admin, perform the admin-related actions here
  // For example, fetch admin data from the database and return it in the response
  // ...

  return res.status(200).json({ message: 'Admin panel data returned successfully' });
}

