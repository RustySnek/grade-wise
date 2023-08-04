import { NextApiHandler, NextApiRequest, NextApiResponse } from "next"
import { useSession, getSession } from "next-auth/react"

const with_admin_session = (handler: NextApiHandler) => async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession({req});
    if (!session) {
      res.writeHead(302, {Location: "/login"})
      res.end();
      return;
  }
    return handler(req, res)
}
export default with_admin_session;
