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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentService = void 0;
const appointment_interface_1 = require("../interfaces/appointment.interface"); // Assuming you have this interface
const init_prisma_util_1 = __importDefault(require("../utils/init.prisma.util"));
const uuid_1 = require("uuid");
const date_fns_1 = require("date-fns");
const payment_service_1 = require("./payment.service"); // Added reversePayment import
const payment_interface_1 = require("../interfaces/payment.interface");
class AppointmentService {
    // Book an appointment
    bookAppointment(booking) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bookingId = (0, uuid_1.v4)();
                // Create a new appointment
                const newAppointment = yield init_prisma_util_1.default.booking.create({
                    data: {
                        id: bookingId,
                        clientId: booking.clientId,
                        caregiverId: booking.caregiverId,
                        startDate: new Date(booking.startDate),
                        endDate: new Date(booking.endDate),
                        status: appointment_interface_1.BookingStatus.PENDING,
                        reason: booking.reason,
                        caregiverServiceId: booking.serviceId,
                    },
                });
                // Fetch the client data to check for phone number
                const client = yield init_prisma_util_1.default.user.findUnique({
                    where: { id: booking.clientId },
                });
                if (!client || !client.phoneNumber) {
                    return {
                        error: "Phone number is required to complete the payment. Please update your profile with a valid phone number.",
                        userNeedsPhone: true,
                    };
                }
                // Fetch the service price
                const service = yield init_prisma_util_1.default.caregiverService.findUnique({
                    where: { id: booking.serviceId },
                });
                if (!service || service.price == null) {
                    return {
                        error: "Service price is not available. Please contact support.",
                    };
                }
                const amount = service.price;
                const paymentResponse = yield (0, payment_service_1.initiatePayment)(amount, client.phoneNumber, booking.clientId);
                console.log("Payment response:", paymentResponse);
                // Check payment response and update the booking status if payment is initiated successfully
                if (paymentResponse && paymentResponse.ResponseCode === "0") {
                    // Update the booking with the CheckoutRequestID
                    yield init_prisma_util_1.default.booking.update({
                        where: { id: bookingId },
                        data: {
                            status: appointment_interface_1.BookingStatus.PENDING_PAYMENT,
                            transactionId: paymentResponse.CheckoutRequestID
                        },
                    });
                    return {
                        message: "Appointment created and payment initiated successfully. Please complete the payment on your phone.",
                        appointment: newAppointment,
                        paymentResponse,
                    };
                }
                else {
                    // If payment initiation failed, delete the booking
                    yield init_prisma_util_1.default.booking.delete({
                        where: { id: bookingId },
                    });
                    return {
                        error: "Payment initiation failed. Please try again.",
                    };
                }
            }
            catch (error) {
                console.error("Error booking appointment:", error);
                return { error: "An error occurred while booking the appointment." };
            }
        });
    }
    // Fetch all bookings
    getAllAppointmentBookings() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bookings = yield init_prisma_util_1.default.booking.findMany({
                    include: {
                        client: true,
                        caregiver: true,
                        CaregiverService: true
                    },
                });
                if (!bookings.length) {
                    return {
                        error: "No appointment bookings are available at the moment.",
                    };
                }
                return {
                    bookings,
                };
            }
            catch (error) {
                console.error("Error fetching all bookings:", error);
                return { error: "An error occurred while fetching appointment bookings." };
            }
        });
    }
    // Fetch client bookings
    getClientAppointmentBookings(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bookings = yield init_prisma_util_1.default.booking.findMany({
                    where: { clientId: userId },
                    include: {
                        client: true,
                        caregiver: true,
                        CaregiverService: true
                    },
                });
                if (!bookings.length) {
                    return {
                        error: "No appointment bookings are available for this client.",
                    };
                }
                return {
                    bookings,
                };
            }
            catch (error) {
                console.error("Error fetching client's bookings:", error);
                return { error: "An error occurred while fetching client's bookings." };
            }
        });
    }
    // Cancel appointment
    cancelBookingAppointment(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const booking = yield init_prisma_util_1.default.booking.findUnique({
                    where: { id: bookingId },
                    include: { CaregiverService: true }
                });
                if (!booking) {
                    return {
                        error: `Booking with id ${bookingId} not found.`,
                    };
                }
                // If the booking is confirmed, check if 24 hours have passed since confirmation
                if (booking.status === appointment_interface_1.BookingStatus.CONFIRMED) {
                    const hoursSinceConfirmation = (0, date_fns_1.differenceInHours)(new Date(), booking.updatedAt);
                    if (hoursSinceConfirmation < 24) {
                        return {
                            error: `Booking with id ${bookingId} cannot be cancelled as it was confirmed less than 24 hours ago.`,
                        };
                    }
                }
                // Completed bookings cannot be cancelled
                if (booking.status === appointment_interface_1.BookingStatus.COMPLETED) {
                    return {
                        error: `Booking with id ${bookingId} cannot be cancelled as it is completed.`,
                    };
                }
                if (!booking.CaregiverService || booking.CaregiverService.price == null) {
                    return {
                        error: "Service price is not available. Please contact support.",
                    };
                }
                const transactionId = booking.transactionId;
                if (!transactionId) {
                    return {
                        error: "Transaction ID not found. Cannot reverse payment.",
                    };
                }
                try {
                    // Process payment reversal
                    const reversalResponse = yield (0, payment_service_1.reversePayment)(transactionId, booking.CaregiverService.price, "Booking cancellation");
                    console.log("Reversal response:", reversalResponse);
                    // Update the booking status to CANCELLED
                    yield init_prisma_util_1.default.booking.update({
                        where: { id: bookingId },
                        data: { status: appointment_interface_1.BookingStatus.CANCELLED },
                    });
                    // Update the payment status to REFUNDED
                    yield init_prisma_util_1.default.payment.updateMany({
                        where: { transactionId: transactionId },
                        data: { status: payment_interface_1.PaymentStatus.REFUNDED },
                    });
                    return {
                        message: `Booking with id ${bookingId} has been successfully cancelled and payment reversed.`,
                    };
                }
                catch (reversalError) {
                    console.error("Error reversing payment:", reversalError);
                    // If reversal fails, we still cancel the booking but notify the user about the payment reversal issue
                    yield init_prisma_util_1.default.booking.update({
                        where: { id: bookingId },
                        data: { status: appointment_interface_1.BookingStatus.CANCELLED },
                    });
                    return {
                        message: `Booking with id ${bookingId} has been cancelled, but there was an issue reversing the payment. Our team will process the refund manually. Error: ${reversalError.message}`,
                    };
                }
            }
            catch (error) {
                console.error("Error cancelling booking:", error);
                return { error: "An error occurred while canceling the booking: " + error.message };
            }
        });
    }
    // Update this method to handle the new PENDING_PAYMENT status
    confirmAppointment(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const booking = yield init_prisma_util_1.default.booking.findUnique({
                    where: { id: bookingId },
                });
                if (!booking) {
                    return {
                        error: `Booking with id ${bookingId} not found.`,
                    };
                }
                if (booking.status !== appointment_interface_1.BookingStatus.PENDING_PAYMENT) {
                    return {
                        error: `Booking with id ${bookingId} cannot be confirmed as it is currently ${booking.status.toLowerCase()}.`,
                    };
                }
                // Update the booking status to CONFIRMED
                yield init_prisma_util_1.default.booking.update({
                    where: { id: bookingId },
                    data: { status: appointment_interface_1.BookingStatus.CONFIRMED },
                });
                return {
                    message: `Booking with id ${bookingId} has been successfully confirmed.`,
                };
            }
            catch (error) {
                console.error("Error confirming booking:", error);
                return { error: "An error occurred while confirming the booking." };
            }
        });
    }
    // Complete appointment
    completeAppointment(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const booking = yield init_prisma_util_1.default.booking.findUnique({
                    where: { id: bookingId },
                });
                if (!booking) {
                    return {
                        error: `Booking with id ${bookingId} not found.`,
                    };
                }
                if (booking.status !== appointment_interface_1.BookingStatus.CONFIRMED) {
                    return {
                        error: `Booking with id ${bookingId} cannot be completed as it is currently ${booking.status.toLowerCase()}.`,
                    };
                }
                // Update the booking status to COMPLETED
                yield init_prisma_util_1.default.booking.update({
                    where: { id: bookingId },
                    data: { status: appointment_interface_1.BookingStatus.COMPLETED },
                });
                return {
                    message: `Booking with id ${bookingId} has been successfully marked as completed.`,
                };
            }
            catch (error) {
                console.error("Error completing booking:", error);
                return { error: "An error occurred while marking the booking as completed." };
            }
        });
    }
}
exports.AppointmentService = AppointmentService;
