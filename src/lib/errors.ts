export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public details?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function handleError(error: unknown): Response {
  console.error("API error:", error);

  if (error instanceof AppError) {
    return Response.json(
      {
        error: error.message,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }

  // Handle Prisma errors
  if (error instanceof Error) {
    return Response.json(
      {
        error: "Database error",
        details: error.message,
      },
      { status: 500 }
    );
  }

  // Fallback for unknown errors
  return Response.json(
    {
      error: "Internal server error",
      details: "An unexpected error occurred",
    },
    { status: 500 }
  );
}
