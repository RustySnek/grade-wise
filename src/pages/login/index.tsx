"use client"
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const redirect_on_login = async () => {
    const session = await getSession()
    console.log("redirecting")
    if (session) {
      console.log(session)
        const role = session.user.role;
        if (role === "admin") {
          router.push("/admin/panel")
        } else if (role === "teacher") {
          router.push("/teacher/panel")
        } else if (role === "student") {
          router.push("/student/panel")
        }
    }
  }
  useEffect(() => {
    console.log("running use eff");
    (async () => await redirect_on_login())()
  },[])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("username")?.toString();
    const password = formData.get("password")?.toString();

    // Call the signIn function with the email and password
    const result = await signIn("credentials", {
      username: email,
      password: password,
    });
    if (result?.ok) {
      await redirect_on_login()     
    }
      //router.push(result.url);
    
    // Handle the result or show an error message
    console.log(result);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Email:
        <input className="bg-black" minLength={4} type="text" name="username" />
      </label>
      <label>
        Password:
        <input className="bg-black" minLength={4} type="password" name="password" />
      </label>
      <button type="submit">Sign In</button>
    </form>
  );
}
