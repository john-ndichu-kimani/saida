"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingStatus = void 0;
// Enum for Booking Status
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["PENDING"] = "PENDING";
    BookingStatus["PENDING_PAYMENT"] = "PENDING_PAYMENT";
    BookingStatus["CONFIRMED"] = "CONFIRMED";
    BookingStatus["CANCELLED"] = "CANCELLED";
    BookingStatus["COMPLETED"] = "COMPLETED";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
