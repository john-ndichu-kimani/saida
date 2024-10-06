"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentController = void 0;
const appointment_service_1 = require("../services/appointment.service"); // Adjust the path accordingly
const appointmentService = new appointment_service_1.AppointmentService();
class AppointmentController {
    // Book an appointment
    bookAppointment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const booking = req.body; // Assuming the booking details are sent in the request body
                const result = yield appointmentService.bookAppointment(booking);
                res.status(201).json(result);
            }
            catch (error) {
                res.status(500).json({ error: "An error occurred while booking the appointment." });
            }
        });
    }
    // Get all appointment bookings
    getAllAppointmentBookings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield appointmentService.getAllAppointmentBookings();
                res.status(200).json(result);
            }
            catch (error) {
                res.status(500).json({ error: "An error occurred while fetching all appointment bookings." });
            }
        });
    }
    // Get client's appointment bookings
    getClientAppointmentBookings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId; // Assuming the clientId is passed as a route parameter
                const result = yield appointmentService.getClientAppointmentBookings(userId);
                res.status(200).json(result);
            }
            catch (error) {
                res.status(500).json({ error: "An error occurred while fetching client's appointment bookings." });
            }
        });
    }
    // Cancel appointment
    cancelBookingAppointment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bookingId = req.params.bookingId; // Assuming the bookingId is passed as a route parameter
                const result = yield appointmentService.cancelBookingAppointment(bookingId);
                res.status(200).json(result);
            }
            catch (error) {
                res.status(500).json({ error: "An error occurred while canceling the appointment." });
            }
        });
    }
    // Confirm appointment
    confirmAppointment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bookingId = req.params.bookingId; // Assuming the bookingId is passed as a route parameter
                const result = yield appointmentService.confirmAppointment(bookingId);
                res.status(200).json(result);
            }
            catch (error) {
                res.status(500).json({ error: "An error occurred while confirming the appointment." });
            }
        });
    }
    // Complete appointment
    completeAppointment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bookingId = req.params.bookingId; // Assuming the bookingId is passed as a route parameter
                const result = yield appointmentService.completeAppointment(bookingId);
                res.status(200).json(result);
            }
            catch (error) {
                res.status(500).json({ error: "An error occurred while marking the appointment as completed." });
            }
        });
    }
}
exports.AppointmentController = AppointmentController;
