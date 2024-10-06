import { Request, Response } from "express";
import { AppointmentService } from "../services/appointment.service"; // Adjust the path accordingly

const appointmentService = new AppointmentService();

export class AppointmentController {
  // Book an appointment
  async bookAppointment(req: Request, res: Response) {
    try {
      const booking = req.body; // Assuming the booking details are sent in the request body
      const result = await appointmentService.bookAppointment(booking);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: "An error occurred while booking the appointment." });
    }
  }

  // Get all appointment bookings
  async getAllAppointmentBookings(req: Request, res: Response) {
    try {
      const result = await appointmentService.getAllAppointmentBookings();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: "An error occurred while fetching all appointment bookings." });
    }
  }

  // Get client's appointment bookings
  async getClientAppointmentBookings(req: Request, res: Response) {
    try {
      const userId = req.params.userId; // Assuming the clientId is passed as a route parameter
      const result = await appointmentService.getClientAppointmentBookings(userId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: "An error occurred while fetching client's appointment bookings." });
    }
  }

  // Cancel appointment
  async cancelBookingAppointment(req: Request, res: Response) {
    try {
      const bookingId = req.params.bookingId; // Assuming the bookingId is passed as a route parameter
      const result = await appointmentService.cancelBookingAppointment(bookingId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: "An error occurred while canceling the appointment." });
    }
  }

  // Confirm appointment
  async confirmAppointment(req: Request, res: Response) {
    try {
      const bookingId = req.params.bookingId; // Assuming the bookingId is passed as a route parameter
      const result = await appointmentService.confirmAppointment(bookingId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: "An error occurred while confirming the appointment." });
    }
  }

  // Complete appointment
  async completeAppointment(req: Request, res: Response) {
    try {
      const bookingId = req.params.bookingId; // Assuming the bookingId is passed as a route parameter
      const result = await appointmentService.completeAppointment(bookingId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: "An error occurred while marking the appointment as completed." });
    }
  }
}
