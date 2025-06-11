-- CreateTable
CREATE TABLE "EmotionalTodo" (
    "id" TEXT NOT NULL,
    "task" TEXT NOT NULL,
    "benefit" TEXT NOT NULL,
    "blocker" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmotionalTodo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmotionalTodo_userId_completed_idx" ON "EmotionalTodo"("userId", "completed");

-- CreateIndex
CREATE INDEX "EmotionalTodo_userId_createdAt_idx" ON "EmotionalTodo"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "EmotionalTodo" ADD CONSTRAINT "EmotionalTodo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
