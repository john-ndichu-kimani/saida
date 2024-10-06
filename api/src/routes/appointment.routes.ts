import { Router } from "express";
import { AppointmentController } from "../controller/appointment.controller";


const appointmentRouter = Router();
const appointmentController = new AppointmentController();

appointmentRouter.post("/appointments", appointmentController.bookAppointment);

appointmentRouter.get("/appointments", appointmentController.getAllAppointmentBookings);

appointmentRouter.get("/appointments/client/:userId", appointmentController.getClientAppointmentBookings);

appointmentRouter.patch("/appointments/cancel/:bookingId", appointmentController.cancelBookingAppointment);

appointmentRouter.patch("/appointments/confirm/:bookingId", appointmentController.confirmAppointment);

appointmentRouter.patch("/appointments/complete/:bookingId", appointmentController.completeAppointment);

export default appointmentRouter;
