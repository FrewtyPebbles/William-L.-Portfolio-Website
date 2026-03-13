-- CreateEnum
CREATE TYPE "ProjectProgress" AS ENUM ('PROTOTYPING', 'DEVELOPMENT', 'ALPHA', 'BETA', 'RELEASE');

-- CreateEnum
CREATE TYPE "ContributionLevel" AS ENUM ('EXTRA_SMALL', 'SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE', 'EVERYTHING', 'NON_APPLICABLE');

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "progress" "ProjectProgress" NOT NULL,
    "nav_description" TEXT NOT NULL,
    "short_description" TEXT NOT NULL,
    "full_description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectSubImage" (
    "id" SERIAL NOT NULL,
    "src" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "projectID" INTEGER NOT NULL,

    CONSTRAINT "ProjectSubImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectSubLink" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "link" TEXT NOT NULL,
    "projectID" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectSubLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectSubPage" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "nav_description" TEXT NOT NULL DEFAULT '',
    "short_description" TEXT NOT NULL DEFAULT '',
    "full_description" TEXT NOT NULL,
    "projectID" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectSubPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contribution" (
    "id" SERIAL NOT NULL,
    "level" "ContributionLevel" NOT NULL,
    "description" TEXT NOT NULL,
    "projectID" INTEGER NOT NULL,
    "contributorID" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contributor" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "githubUserName" TEXT NOT NULL DEFAULT 'none',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contributor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resume" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "nav_description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicFile" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "tool_tip" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PublicFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectSubPage_slug_key" ON "ProjectSubPage"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Contributor_name_key" ON "Contributor"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Contributor_githubUserName_key" ON "Contributor"("githubUserName");

-- CreateIndex
CREATE UNIQUE INDEX "Resume_src_key" ON "Resume"("src");

-- CreateIndex
CREATE UNIQUE INDEX "PublicFile_src_key" ON "PublicFile"("src");

-- AddForeignKey
ALTER TABLE "ProjectSubImage" ADD CONSTRAINT "ProjectSubImage_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSubLink" ADD CONSTRAINT "ProjectSubLink_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSubPage" ADD CONSTRAINT "ProjectSubPage_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_contributorID_fkey" FOREIGN KEY ("contributorID") REFERENCES "Contributor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
