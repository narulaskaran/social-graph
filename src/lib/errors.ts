export class AppError extends Error {
  status: number;

  constructor(message: string, status: number = 500) {
    super(message);
    this.status = status;
    this.name = "AppError";
  }
}

export function handleError(error: unknown) {
  console.error("API Error:", error);

  if (error instanceof AppError) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  return Response.json(
    { error: "Internal Server Error", details: String(error) },
    { status: 500 }
  );
}
