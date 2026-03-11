-- CreateTable
CREATE TABLE "PublicFile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "tool_tip" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "PublicFile_src_key" ON "PublicFile"("src");
