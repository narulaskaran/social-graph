-- CreateTable
CREATE TABLE "Profile" (
    "linkedin_username" TEXT NOT NULL PRIMARY KEY,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Connections" (
    "profile_a" TEXT NOT NULL,
    "profile_b" TEXT NOT NULL,

    PRIMARY KEY ("profile_a", "profile_b"),
    CONSTRAINT "Connections_profile_a_fkey" FOREIGN KEY ("profile_a") REFERENCES "Profile" ("linkedin_username") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Connections_profile_b_fkey" FOREIGN KEY ("profile_b") REFERENCES "Profile" ("linkedin_username") ON DELETE RESTRICT ON UPDATE CASCADE
);
