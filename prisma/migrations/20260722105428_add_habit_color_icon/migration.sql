-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Habit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'chart-1',
    "icon" TEXT NOT NULL DEFAULT 'Sprout',
    "userId" TEXT NOT NULL,
    "archivedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Habit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Habit" ("archivedAt", "createdAt", "id", "name", "updatedAt", "userId") SELECT "archivedAt", "createdAt", "id", "name", "updatedAt", "userId" FROM "Habit";
DROP TABLE "Habit";
ALTER TABLE "new_Habit" RENAME TO "Habit";
CREATE INDEX "Habit_userId_idx" ON "Habit"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
