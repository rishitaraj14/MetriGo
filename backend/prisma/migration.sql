-- CreateTable
CREATE TABLE "Journey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "startName" TEXT NOT NULL,
    "endName" TEXT NOT NULL,
    "startLat" REAL NOT NULL,
    "startLon" REAL NOT NULL,
    "endLat" REAL NOT NULL,
    "endLon" REAL NOT NULL,
    "routePath" TEXT NOT NULL,
    "fares" TEXT NOT NULL,
    "aiInsights" TEXT
);
