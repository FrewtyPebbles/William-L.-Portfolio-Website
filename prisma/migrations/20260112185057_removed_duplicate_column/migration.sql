/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Contributor` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Contributor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "githubUserName" TEXT NOT NULL,
    "githubURL" TEXT NOT NULL,
    "githubAvatar" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Contributor" ("created_at", "githubAvatar", "githubURL", "githubUserName", "id", "name") SELECT "created_at", "githubAvatar", "githubURL", "githubUserName", "id", "name" FROM "Contributor";
DROP TABLE "Contributor";
ALTER TABLE "new_Contributor" RENAME TO "Contributor";
CREATE UNIQUE INDEX "Contributor_name_key" ON "Contributor"("name");
CREATE UNIQUE INDEX "Contributor_githubUserName_key" ON "Contributor"("githubUserName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
