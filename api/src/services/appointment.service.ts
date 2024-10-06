
import { Booking, BookingStatus } from "../interfaces/appointment.interface"; // Assuming you have this interface
import prisma from "../utils/init.prisma.util";
import { v4 as uuidv4 } from "uuid";
import { differenceInHours } from "date-fns";
import { getAccessToken, initiatePayment, reversePayment } from "./payment.service"; // Added reversePayment import
import { PaymentStatus } from "../interfaces/payment.interface";

export class AppointmentService {
 // Book an appointment
 async bookAppointment(booking: Booking) {
  try {
    const bookingId = uuidv4();

    // Create a new appointment
    const newAppointment = await prisma.booking.create({
      data: {
        id: bookingId,
        clientId: booking.clientId,
        caregiverId: booking.caregiverId,
        startDate: new Date(booking.startDate),
        endDate: new Date(booking.endDate),
        status: BookingStatus.PENDING,
        reason: booking.reason,
        caregiverServiceId: booking.serviceId,
      },
    });

    // Fetch the client data to check for phone number
    const client = await prisma.user.findUnique({
      where: { id: booking.clientId },
    });

    if (!client || !client.phoneNumber) {
      return {
        error: "Phone number is required to complete the payment. Please update your profile with a valid phone number.",
        userNeedsPhone: true,
      };
    }

    // Fetch the service price
    const service = await prisma.caregiverService.findUnique({
      where: { id: booking.serviceId },
    });

    if (!service || service.price == null) {
      return {
        error: "Service price is not available. Please contact support.",
      };
    }

    const amount = service.price;
    const paymentResponse = await initiatePayment(amount, client.phoneNumber, booking.clientId);
    console.log("Payment response:", paymentResponse);

    // Check payment response and update the booking status if payment is initiated successfully
    if (paymentResponse && paymentResponse.ResponseCode === "0") {
      // Update the booking with the CheckoutRequestID
      await prisma.booking.update({
        where: { id: bookingId },
        data: { 
          status: BookingStatus.PENDING_PAYMENT, 
          transactionId: paymentResponse.CheckoutRequestID 
        },
      });

      return {
        message: "Appointment created and payment initiated successfully. Please complete the payment on your phone.",
        appointment: newAppointment,
        paymentResponse,
      };
    } else {
      // If payment initiation failed, delete the booking
      await prisma.booking.delete({
        where: { id: bookingId },
      });

      return {
        error: "Payment initiation failed. Please try again.",
      };
    }
  } catch (error) {
    console.error("Error booking appointment:", error);
    return { error: "An error occurred while booking the appointment." };
  }
}
  // Fetch all bookings
  async getAllAppointmentBookings() {
    try {
      const bookings = await prisma.booking.findMany({
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
    } catch (error) {
      console.error("Error fetching all bookings:", error);
      return { error: "An error occurred while fetching appointment bookings." };
    }
  }

  // Fetch client bookings
  async getClientAppointmentBookings(userId: string) {
    try {
      const bookings = await prisma.booking.findMany({
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
    } catch (error) {
      console.error("Error fetching client's bookings:", error);
      return { error: "An error occurred while fetching client's bookings." };
    }
  }
  // Cancel appointment
  async cancelBookingAppointment(bookingId: string) {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { CaregiverService: true }
      });

      if (!booking) {
        return {
          error: `Booking with id ${bookingId} not found.`,
        };
      }

      // If the booking is confirmed, check if 24 hours have passed since confirmation
      if (booking.status === BookingStatus.CONFIRMED) {
        const hoursSinceConfirmation = differenceInHours(new Date(), booking.updatedAt);

        if (hoursSinceConfirmation < 24) {
          return {
            error: `Booking with id ${bookingId} cannot be cancelled as it was confirmed less than 24 hours ago.`,
          };
        }
      }

      // Completed bookings cannot be cancelled
      if (booking.status === BookingStatus.COMPLETED) {
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
        const reversalResponse = await reversePayment(transactionId, booking.CaregiverService.price, "Booking cancellation");
        console.log("Reversal response:", reversalResponse);

        // Update the booking status to CANCELLED
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: BookingStatus.CANCELLED },
        });

        // Update the payment status to REFUNDED
        await prisma.payment.updateMany({
          where: { transactionId: transactionId },
          data: { status: PaymentStatus.REFUNDED },
        });

        return {
          message: `Booking with id ${bookingId} has been successfully cancelled and payment reversed.`,
        };
      } catch (reversalError: any) {
        console.error("Error reversing payment:", reversalError);
        
        // If reversal fails, we still cancel the booking but notify the user about the payment reversal issue
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: BookingStatus.CANCELLED },
        });

        return {
          message: `Booking with id ${bookingId} has been cancelled, but there was an issue reversing the payment. Our team will process the refund manually. Error: ${reversalError.message}`,
        };
      }
    } catch (error: any) {
      console.error("Error cancelling booking:", error);
      return { error: "An error occurred while canceling the booking: " + error.message };
    }
  }
 
 // Update this method to handle the new PENDING_PAYMENT status
 async confirmAppointment(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return {
        error: `Booking with id ${bookingId} not found.`,
      };
    }

    if (booking.status !== BookingStatus.PENDING_PAYMENT) {
      return {
        error: `Booking with id ${bookingId} cannot be confirmed as it is currently ${booking.status.toLowerCase()}.`,
      };
    }

    // Update the booking status to CONFIRMED
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CONFIRMED },
    });

    return {
      message: `Booking with id ${bookingId} has been successfully confirmed.`,
    };
  } catch (error) {
    console.error("Error confirming booking:", error);
    return { error: "An error occurred while confirming the booking." };
  }
}

  // Complete appointment
  async completeAppointment(bookingId: string) {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        return {
          error: `Booking with id ${bookingId} not found.`,
        };
      }

      if (booking.status !== BookingStatus.CONFIRMED) {
        return {
          error: `Booking with id ${bookingId} cannot be completed as it is currently ${booking.status.toLowerCase()}.`,
        };
      }

      // Update the booking status to COMPLETED
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.COMPLETED },
      });

      return {
        message: `Booking with id ${bookingId} has been successfully marked as completed.`,
      };
    } catch (error) {
      console.error("Error completing booking:", error);
      return { error: "An error occurred while marking the booking as completed." };
    }
  }
}
