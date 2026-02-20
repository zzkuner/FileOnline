-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Link" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "displayTitle" TEXT,
    "displayMode" TEXT NOT NULL DEFAULT 'DEFAULT',
    "showFilename" BOOLEAN NOT NULL DEFAULT false,
    "showFilesize" BOOLEAN NOT NULL DEFAULT false,
    "coverImage" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "password" TEXT,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Link_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Link" ("createdAt", "description", "expiresAt", "fileId", "id", "isActive", "name", "password", "slug", "updatedAt") SELECT "createdAt", "description", "expiresAt", "fileId", "id", "isActive", "name", "password", "slug", "updatedAt" FROM "Link";
DROP TABLE "Link";
ALTER TABLE "new_Link" RENAME TO "Link";
CREATE UNIQUE INDEX "Link_slug_key" ON "Link"("slug");
CREATE INDEX "Link_fileId_idx" ON "Link"("fileId");
CREATE INDEX "Link_slug_idx" ON "Link"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
