import { z } from "zod";
import { StatusCodes } from "http-status-codes";
import workoutService from "../services/workout.service.js";

const handleErrorResponse = (error, reply) => {
  if (error instanceof z.ZodError) {
    return reply.code(StatusCodes.BAD_REQUEST).send({
      message: "Erro de validação",
      errors: error.errors.map((err) => ({
        field: err.path.length > 0 ? err.path.join(".") : "body",
        message: err.message,
      })),
    });
  }

  const errorMessages = {
    "Treino não encontrado": StatusCodes.NOT_FOUND,
  };

  const statusCode =
    errorMessages[error.message] || StatusCodes.INTERNAL_SERVER_ERROR;
  reply.code(statusCode).send({
    error: error.message || "Ocorreu um erro interno",
  });
};

const postWorkout = async (request, reply) => {
  try {
    const schemaBody = z.object({
      name: z
        .string({ required_error: "O nome do treino é obrigatório" })
        .min(3, { message: "O nome do treino deve ter no mínimo 3 caracteres" })
        .max(255, {
          message: "O nome do treino deve ter no máximo 255 caracteres",
        }),
      userId: z.string({ required_error: "O ID do usuário é obrigatório" }),
      exercises: z
        .array(
          z.object({
            name: z
              .string({ required_error: "O nome do exercício é obrigatório" })
              .min(3, {
                message: "O nome do exercício deve ter no mínimo 3 caracteres",
              }),
            series: z
              .string({ required_error: "O número de séries é obrigatório" })
              .regex(/^\d+$/, {
                message: "O número de séries deve ser um número inteiro",
              }),
            repetitions: z.string({
              required_error: "O número de repetições é obrigatório",
            }),
            weight: z.string({ required_error: "O peso é obrigatório" }),
            restTime: z.string({
              required_error: "O tempo de descanso é obrigatório",
            }),
            videoUrl: z
              .string({ required_error: "A URL do vídeo é obrigatória" })
              .url({ message: "A URL do vídeo deve ser válida" }),
            instructions: z
              .string({ required_error: "As instruções são obrigatórias" })
              .min(3, {
                message: "As instruções devem ter pelo menos 3 caracteres",
              }),
          })
        )
        .min(1, { message: "A lista de exercícios não pode estar vazia" })
        .refine((val) => Array.isArray(val), {
          message: "O campo exercises deve ser uma lista de exercícios",
        }),
    });

    const validation = schemaBody.safeParse(request.body);

    if (!validation.success) {
      throw validation.error;
    }

    const { userId, name, exercises } = validation.data;

    const workout = await workoutService.postWorkout(userId, name, exercises);

    reply.code(StatusCodes.CREATED).send(workout);
  } catch (error) {
    handleErrorResponse(error, reply);
  }
};

const getWorkouts = async (request, reply) => {
  try {
    const schemaQuery = z.object({
      userId: z.string().optional(),
    });

    const validation = schemaQuery.safeParse(request.query);

    const { userId } = validation.data;

    const workouts = await workoutService.getWorkouts(userId);

    reply.send(workouts);
  } catch (error) {
    handleErrorResponse(error, reply);
  }
};

export default { postWorkout, getWorkouts };
