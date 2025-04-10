-- CreateTable
CREATE TABLE "PublishedResearch" (
    "id" TEXT NOT NULL,
    "cdnUrl" TEXT NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "PublishedResearch_pkey" PRIMARY KEY ("id")
);
