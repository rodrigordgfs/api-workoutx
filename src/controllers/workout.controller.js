import { z } from "zod";
import { StatusCodes } from "http-status-codes";
import workoutService from "../services/workout.service.js";
import { Visibility } from "@prisma/client";

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
      visibility: z.nativeEnum(Visibility).default(Visibility.PUBLIC),
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

    const { userId, name, exercises, visibility } = validation.data;

    const workout = await workoutService.postWorkout(
      userId,
      name,
      visibility,
      exercises
    );

    reply.code(StatusCodes.CREATED).send(workout);
  } catch (error) {
    handleErrorResponse(error, reply);
  }
};

const postWorkoutAI = async (request, reply) => {
  try {
    const schemaBody = z.object({
      userId: z.string({ required_error: "O ID do usuário é obrigatório" }),
      objective: z.string({ required_error: "O objetivo é obrigatório" }),
      trainingTime: z.string({
        required_error: "O tempo de treino é obrigatório",
      }),
      experienceLevel: z.string({
        required_error: "O nível de experiência é obrigatório",
      }),
      frequency: z.string({ required_error: "A frequência é obrigatória" }),
      duration: z.string({ required_error: "A duração é obrigatória" }),
      location: z.string({ required_error: "O local é obrigatório" }),
      equipments: z.array(z.string()).default([]),
      hasPhysicalLimitations: z.boolean().default(false),
      limitationDescription: z.string().optional(),
      preferredTrainingStyle: z.string({
        required_error: "O estilo de treino é obrigatório",
      }),
      nutrition: z.string({ required_error: "A nutrição é obrigatória" }),
      sleepQuality: z.string({
        required_error: "A qualidade do sono é obrigatória",
      }),
    });

    const validation = schemaBody.safeParse(request.body);

    if (!validation.success) {
      throw validation.error;
    }

    const {
      userId,
      objective,
      trainingTime,
      experienceLevel,
      frequency,
      duration,
      location,
      equipments,
      hasPhysicalLimitations,
      limitationDescription,
      preferredTrainingStyle,
      nutrition,
      sleepQuality,
    } = validation.data;

    const workout = await workoutService.postWorkoutAI(
      userId,
      objective,
      trainingTime,
      experienceLevel,
      frequency,
      duration,
      location,
      equipments,
      hasPhysicalLimitations,
      limitationDescription,
      preferredTrainingStyle,
      nutrition,
      sleepQuality
    );

    reply.code(StatusCodes.CREATED).send(workout);
  } catch (error) {
    handleErrorResponse(error, reply);
  }
};

const postLikeWorkout = async (request, reply) => {
  try {
    const schemaParams = z.object({
      idWorkout: z.string({ required_error: "O ID do treino é obrigatório" }),
      idUser: z.string({ required_error: "O ID do usuário é obrigatório" }),
    });

    const validation = schemaParams.safeParse(request.params);

    if (!validation.success) {
      throw validation.error;
    }

    const { idUser, idWorkout } = validation.data;

    const like = await workoutService.postLikeWorkout(idWorkout, idUser);

    reply.send(like);
  } catch (error) {
    handleErrorResponse(error, reply);
  }
};

const getWorkouts = async (request, reply) => {
  try {
    const schemaQuery = z.object({
      userId: z.string().optional(),
      visibility: z.nativeEnum(Visibility).optional(),
    });

    const validation = schemaQuery.safeParse(request.query);

    const { userId, visibility } = validation.data;

    const workouts = await workoutService.getWorkouts(userId, visibility);

    reply.send(workouts);
  } catch (error) {
    handleErrorResponse(error, reply);
  }
};

const deleteExercise = async (request, reply) => {
  try {
    const schemaParams = z.object({
      id: z.string({ required_error: "O ID do exercício é obrigatório" }),
    });

    const validation = schemaParams.safeParse(request.params);

    if (!validation.success) {
      throw validation.error;
    }

    const { id } = validation.data;

    await workoutService.deleteExercise(id);

    reply.code(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    handleErrorResponse(error, reply);
  }
};

const copyWorkout = async (request, reply) => {
  try {
    const schemaParams = z.object({
      id: z.string({ required_error: "O ID do treino é obrigatório" }),
    });

    const schemaBody = z.object({
      userId: z.string({ required_error: "O ID do usuário é obrigatório" }),
    });

    const validationParams = schemaParams.safeParse(request.params);
    const validationBody = schemaBody.safeParse(request.body);

    if (!validationParams.success) {
      throw validationParams.error;
    }

    if (!validationBody.success) {
      throw validationBody.error;
    }

    const { id } = validationParams.data;
    const { userId } = validationBody.data;

    const workout = await workoutService.copyWorkout(id, userId);

    reply.code(StatusCodes.CREATED).send(workout);
  } catch (error) {
    handleErrorResponse(error, reply);
  }
};

const deleteWorkout = async (request, reply) => {
  try {
    const schemaParams = z.object({
      id: z.string({ required_error: "O ID do treino é obrigatório" }),
    });

    const validation = schemaParams.safeParse(request.params);

    if (!validation.success) {
      throw validation.error;
    }

    const { id } = validation.data;

    await workoutService.deleteWorkout(id);

    reply.code(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    handleErrorResponse(error, reply);
  }
};

const getWorkoutSession = async (request, reply) => {
  try {
    const schemaParams = z.object({
      sessionId: z.string({
        required_error: "O ID da sessão de treino é obrigatório",
      }),
    });

    const validation = schemaParams.safeParse(request.params);

    if (!validation.success) {
      throw validation.error;
    }

    const { sessionId } = validation.data;

    const workoutSession = await workoutService.getWorkoutSession(sessionId);

    reply.send(workoutSession);
  } catch (error) {
    handleErrorResponse(error, reply);
  }
};

const postWorkoutSession = async (request, reply) => {
  try {
    const schemaBody = z.object({
      userId: z.string({ required_error: "O ID do usuário é obrigatório" }),
      workoutId: z.string({ required_error: "O ID do treino é obrigatório" }),
    });

    const validation = schemaBody.safeParse(request.body);

    if (!validation.success) {
      throw validation.error;
    }

    const { userId, workoutId } = validation.data;

    const workoutSession = await workoutService.postWorkoutSession(
      userId,
      workoutId
    );

    reply.code(StatusCodes.CREATED).send(workoutSession);
  } catch (error) {
    handleErrorResponse(error, reply);
  }
};

const patchWorkoutSessionExercise = async (request, reply) => {
  try {
    const schemaParams = z.object({
      sessionId: z.string({
        required_error: "O ID da sessão de treino é obrigatório",
      }),
      exerciseId: z.string({
        required_error: "O ID do exercício é obrigatório",
      }),
    });

    const schemaBody = z.object({
      completed: z.boolean({
        required_error: "O campo completed é obrigatório",
      }),
      weight: z.string({ required_error: "O campo weight é obrigatório" }),
      repetitions: z.string({
        required_error: "O campo repetitions é obrigatório",
      }),
      series: z.string({ required_error: "O campo series é obrigatório" }),
    });

    const validationParams = schemaParams.safeParse(request.params);
    const validationBody = schemaBody.safeParse(request.body);

    if (!validationParams.success) {
      throw validationParams.error;
    }

    if (!validationBody.success) {
      throw validationBody.error;
    }

    const { sessionId, exerciseId } = validationParams.data;
    const { completed, weight, repetitions, series } = validationBody.data;

    const workoutSession = await workoutService.patchWorkoutSessionExercise(
      sessionId,
      exerciseId,
      completed,
      weight,
      repetitions,
      series
    );

    reply.send(workoutSession);
  } catch (error) {
    handleErrorResponse(error, reply);
  }
};

const getWorkoutSessionByWorkoutID = async (request, reply) => {
  try {
    const schemaQuery = z.object({
      workoutId: z.string({ required_error: "O ID do treino é obrigatório" }),
    });

    const validation = schemaQuery.safeParse(request.query);

    if (!validation.success) {
      throw validation.error;
    }

    const { workoutId } = validation.data;

    const workoutSession = await workoutService.getWorkoutSessionByWorkoutID(
      workoutId
    );

    reply.send(workoutSession);
  } catch (error) {
    handleErrorResponse(error, reply);
  }
};

const postCompleteWorkoutSession = async (request, reply) => {
  try {
    const schemaParams = z.object({
      sessionId: z.string({
        required_error: "O ID da sessão de treino é obrigatório",
      }),
    });

    const validation = schemaParams.safeParse(request.params);

    if (!validation.success) {
      throw validation.error;
    }

    const { sessionId } = validation.data;

    const workoutSession = await workoutService.postCompleteWorkoutSession(
      sessionId
    );

    reply.send(workoutSession);
  } catch (error) {
    handleErrorResponse(error, reply);
  }
};

export default {
  postWorkout,
  getWorkouts,
  postWorkoutAI,
  postLikeWorkout,
  deleteExercise,
  copyWorkout,
  deleteWorkout,
  postWorkoutSession,
  patchWorkoutSessionExercise,
  getWorkoutSession,
  getWorkoutSessionByWorkoutID,
  postCompleteWorkoutSession,
};
