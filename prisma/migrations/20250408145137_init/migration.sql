-- CreateTable
CREATE TABLE "ButtonClick" (
    "id" SERIAL NOT NULL,
    "buttonText" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ButtonClick_pkey" PRIMARY KEY ("id")
);
