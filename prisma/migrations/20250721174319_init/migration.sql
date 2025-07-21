-- CreateTable
CREATE TABLE "graphs" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "graphs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "graph_id" TEXT NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connections" (
    "profile_a_id" TEXT NOT NULL,
    "profile_b_id" TEXT NOT NULL,
    "graph_id" TEXT NOT NULL,

    CONSTRAINT "connections_pkey" PRIMARY KEY ("profile_a_id", "profile_b_id", "graph_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_first_name_last_name_graph_id_key" ON "profiles"("first_name", "last_name", "graph_id");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_graph_id_fkey" FOREIGN KEY ("graph_id") REFERENCES "graphs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_graph_id_fkey" FOREIGN KEY ("graph_id") REFERENCES "graphs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_profile_a_id_fkey" FOREIGN KEY ("profile_a_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_profile_b_id_fkey" FOREIGN KEY ("profile_b_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE; 