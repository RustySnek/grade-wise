"use client"
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const redirect_on_login = async () => {
    const session = await getSession()
    if (session) {
      const role = session.user.role;
      if (role === "admin") {
        router.push("/admin/panel")
      } else if (role === "teacher") {
        router.push("/teacher/panel")
      } else if (role === "student") {
        router.push("/student/panel")
      } else if (role === "unregistered") {
        router.push("/student/register")
      }
    }
  }
  useEffect(() => {
    (async () => await redirect_on_login())()
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("username")?.toString();
    const password = formData.get("password")?.toString();
    const new_user_token = formData.get("token")?.toString();
    // Call the signIn function with the email and password
    if (new_user_token) {
      var result = await signIn("credentials", {
        new_user_token,
        redirect: false
      })
    } else {
      var result = await signIn("credentials", {
        username: email,
        password: password,
        redirect: false
      });

    }
    if (result?.ok) {
      await redirect_on_login()
    }
    //router.push(result.url);

    // Handle the result or show an error message
    console.log(result);
  };

  return (
    <div className="flex flex-row justify-evenly ">
      <form className="flex flex-col space-y-2 " onSubmit={handleSubmit}>
        <input className="bg-[#1f1f1f] rounded-xl px-4 py-2 text-2xl text-center" minLength={4} type="text" name="username" placeholder="username" />
        <input className="bg-[#1f1f1f] rounded-xl px-4 py-2 text-2xl text-center" minLength={4} type="password" name="password" placeholder="password" />
        <button type="submit">Sign In</button>
      </form>
      <form className="flex flex-col space-y-2 " onSubmit={handleSubmit}>
        <input className="bg-[#1f1f1f] rounded-xl px-4 py-2 text-2xl text-center" minLength={4} type="password" name="token" placeholder="token" />
        <button type="submit">Sign In</button>
      </form>

    </div>
  );
}
