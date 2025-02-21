import workoutController from "../controllers/workout.controller.js";

const workout = async (fastify) => {
  fastify.post("/workout", workoutController.postWorkout);
  fastify.post("/workout/:idWorkout/user/:idUser/like", workoutController.postLikeWorkout);
  fastify.post("/workout/ai", workoutController.postWorkoutAI);
  fastify.get("/workout", workoutController.getWorkouts);
  fastify.delete("/workout/exercise/:id", workoutController.deleteExercise);
  fastify.post("/workout/:id/copy", workoutController.copyWorkout);
  fastify.delete("/workout/:id", workoutController.deleteWorkout);
  fastify.get("/workout/session/:sessionId", workoutController.getWorkoutSession);
  fastify.post("/workout/session", workoutController.postWorkoutSession);
  fastify.patch("/workout/session/:sessionId/exercises/:exerciseId", workoutController.patchWorkoutSessionExercise);
};

export default workout;
