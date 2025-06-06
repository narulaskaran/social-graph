-- CreateTable
CREATE TABLE "Profile" (
    "linkedin_username" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("linkedin_username")
);

-- CreateTable
CREATE TABLE "Connections" (
    "profile_a" TEXT NOT NULL,
    "profile_b" TEXT NOT NULL,

    CONSTRAINT "Connections_pkey" PRIMARY KEY ("profile_a","profile_b")
);

-- AddForeignKey
ALTER TABLE "Connections" ADD CONSTRAINT "Connections_profile_a_fkey" FOREIGN KEY ("profile_a") REFERENCES "Profile"("linkedin_username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connections" ADD CONSTRAINT "Connections_profile_b_fkey" FOREIGN KEY ("profile_b") REFERENCES "Profile"("linkedin_username") ON DELETE RESTRICT ON UPDATE CASCADE;
