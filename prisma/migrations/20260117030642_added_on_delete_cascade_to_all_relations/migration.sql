-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Contribution" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "level" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "projectID" INTEGER NOT NULL,
    "contributorID" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Contribution_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Contribution_contributorID_fkey" FOREIGN KEY ("contributorID") REFERENCES "Contributor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Contribution" ("contributorID", "created_at", "description", "id", "level", "projectID") SELECT "contributorID", "created_at", "description", "id", "level", "projectID" FROM "Contribution";
DROP TABLE "Contribution";
ALTER TABLE "new_Contribution" RENAME TO "Contribution";
CREATE TABLE "new_ProjectSubImage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "src" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "projectID" INTEGER NOT NULL,
    CONSTRAINT "ProjectSubImage_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ProjectSubImage" ("description", "id", "projectID", "src", "title") SELECT "description", "id", "projectID", "src", "title" FROM "ProjectSubImage";
DROP TABLE "ProjectSubImage";
ALTER TABLE "new_ProjectSubImage" RENAME TO "ProjectSubImage";
CREATE TABLE "new_ProjectSubLink" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "link" TEXT NOT NULL,
    "projectID" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjectSubLink_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ProjectSubLink" ("created_at", "description", "id", "link", "projectID", "title") SELECT "created_at", "description", "id", "link", "projectID", "title" FROM "ProjectSubLink";
DROP TABLE "ProjectSubLink";
ALTER TABLE "new_ProjectSubLink" RENAME TO "ProjectSubLink";
CREATE TABLE "new_ProjectSubPage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "nav_description" TEXT NOT NULL DEFAULT '',
    "short_description" TEXT NOT NULL DEFAULT '',
    "full_description" TEXT NOT NULL,
    "projectID" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjectSubPage_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ProjectSubPage" ("created_at", "full_description", "id", "nav_description", "projectID", "short_description", "slug", "title") SELECT "created_at", "full_description", "id", "nav_description", "projectID", "short_description", "slug", "title" FROM "ProjectSubPage";
DROP TABLE "ProjectSubPage";
ALTER TABLE "new_ProjectSubPage" RENAME TO "ProjectSubPage";
CREATE UNIQUE INDEX "ProjectSubPage_slug_key" ON "ProjectSubPage"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
