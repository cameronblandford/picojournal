import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const todos = await prisma.emotionalTodo.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { completed: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ todos })
  } catch (error) {
    console.error("Error fetching emotional todos:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { task, benefit, blocker } = await request.json()

    if (!task || !benefit || !blocker) {
      return NextResponse.json(
        { error: "Task, benefit, and blocker are required" },
        { status: 400 }
      )
    }
    
    const todo = await prisma.emotionalTodo.create({
      data: {
        userId: session.user.id,
        task,
        benefit,
        blocker
      }
    })

    return NextResponse.json({ todo }, { status: 201 })
  } catch (error) {
    console.error("Error creating emotional todo:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, task, benefit, blocker, completed } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: "Todo ID is required" },
        { status: 400 }
      )
    }

    // Verify ownership
    const existingTodo = await prisma.emotionalTodo.findUnique({
      where: { id }
    })

    if (!existingTodo || existingTodo.userId !== session.user.id) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 })
    }

    const todo = await prisma.emotionalTodo.update({
      where: { id },
      data: {
        ...(task !== undefined && { task }),
        ...(benefit !== undefined && { benefit }),
        ...(blocker !== undefined && { blocker }),
        ...(completed !== undefined && { completed })
      }
    })

    return NextResponse.json({ todo })
  } catch (error) {
    console.error("Error updating emotional todo:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Todo ID is required" },
        { status: 400 }
      )
    }

    // Verify ownership
    const existingTodo = await prisma.emotionalTodo.findUnique({
      where: { id }
    })

    if (!existingTodo || existingTodo.userId !== session.user.id) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 })
    }

    await prisma.emotionalTodo.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting emotional todo:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}