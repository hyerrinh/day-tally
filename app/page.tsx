import { prisma } from "@/lib/prisma";

  const getUsers = async () => {
    const res = await fetch('http://localhost:3000/api/users')
    const users = await res.json()
    return users
  }



export default async function Home  (){

  const users = await getUsers();
  const users2 = await prisma.user.findMany();
console.log(users2);

  return (
    <div></div>
  );
}
