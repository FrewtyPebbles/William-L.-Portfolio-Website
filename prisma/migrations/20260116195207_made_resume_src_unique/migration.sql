/*
  Warnings:

  - A unique constraint covering the columns `[src]` on the table `Resume` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Resume_src_key" ON "Resume"("src");
