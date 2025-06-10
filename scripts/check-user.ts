import { prisma } from "../src/lib/prisma"

async function checkUser() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    })
    
    console.log("Users in database:")
    console.log(JSON.stringify(users, null, 2))
    
    if (users.length > 0) {
      const userId = users[0].id
      console.log("\nChecking entries for first user:")
      const entries = await prisma.entry.count({
        where: { userId }
      })
      console.log(`User ${userId} has ${entries} entries`)
      
      const aliveChecks = await prisma.aliveCheck.count({
        where: { userId }
      })
      console.log(`User ${userId} has ${aliveChecks} alive checks`)
    }
  } catch (error) {
    console.error("Error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUser()