import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

export default function LoginPage() {
  const router = useRouter();
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("username")?.toString();
    const password = formData.get("password")?.toString();

    // Call the signIn function with the email and password
    const result = await signIn("credentials", {
      username: email,
      password: password,
      callbackUrl: "/admin/panel", // Redirect URL after successful login
      redirect: false, // Set to true to redirect immediately
    });
    if (result?.url) {
      router.push(result.url);
    }
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
