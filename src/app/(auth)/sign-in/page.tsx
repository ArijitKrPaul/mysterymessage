"use client"; //since its a client component we have to use 'use client'

import { useSession, signIn, signOut } from "next-auth/react";
export default function Component() {
  const { data: session } = useSession();
  if (session) {
    return (
      <>
        Signed in as {session.user?.username} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }
  return (
    <>
      Not signed in <br />
      <button className="bg-orange-500 w-25 " onClick={() => signIn()}>
        Sign in
      </button>
    </>
  );
}
