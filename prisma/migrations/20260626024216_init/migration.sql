-- CreateTable
CREATE TABLE "WeatherRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "locationQuery" TEXT NOT NULL,
    "resolvedName" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "temperatureData" TEXT NOT NULL,
    "rawApiData" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
