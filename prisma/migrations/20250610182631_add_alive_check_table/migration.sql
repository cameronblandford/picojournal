-- CreateTable
CREATE TABLE "AliveCheck" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AliveCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AliveCheck_userId_date_idx" ON "AliveCheck"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "AliveCheck_userId_date_key" ON "AliveCheck"("userId", "date");

-- AddForeignKey
ALTER TABLE "AliveCheck" ADD CONSTRAINT "AliveCheck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
