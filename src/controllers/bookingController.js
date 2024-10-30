import Booking from '../models/booking.schema.js';
import Room from '../models/room.schema.js';
import OverOccupancyCharge from '../models/overOccupancyCharge.schema.js'
import { User } from '../models/user.schema.js';
import NotFoundError from '../errors/notFoundError.js';
import { ROLES } from '../models/roles.js';
import BadRequestError from '../errors/badRequestError.js'
import Voucher from '../models/voucher.schema.js'
import ForbiddenError from '../errors/forbiddenError.js';
import mongoose from 'mongoose';

// Create a new Booking
export const createBooking = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { userId, roomIds, checkInTime, checkOutTime, paidAmount, numberOfGuests, redeemedPoint, voucherCode, paymentMethod } = req.body;
        checkPermisson(req.user, userId)

        // Check the input
        if (!paymentMethod) {
            throw new BadRequestError("Missing paymentMethod field");
        }
        if (!Number.isInteger(numberOfGuests)) {
            throw new BadRequestError("Invalid type for the numberOfGuests field. An integer is required.");
        }
        if (redeemedPoint !== undefined && !Number.isInteger(redeemedPoint)) {
            throw new BadRequestError("Invalid type for redeemedPoint field. An integer is required.");
        }
        if (typeof paidAmount !== 'number') {
            throw new BadRequestError("Invalid type for the paidAmount field. A number is required.");
        }

        // Check if user exists
        const user = await User.findOne({ role: { $in: [ROLES.CUSTOMER, ROLES.ONSITE_CUSTOMER] }, _id: userId });
        if (!user) {
            throw new NotFoundError(`User with id ${userId} doesn't exist.`);
        }

        // Check user's point
        if (user.point < redeemedPoint) {
            throw new BadRequestError("This user's points are not enough to fulfill the request.")
        }

        // Check if roomIds contains unique values
        const uniqueRoomIds = new Set(roomIds);
        if (uniqueRoomIds.size !== roomIds.length) {
            throw new BadRequestError('Duplicate value found in roomIds.')
        }

        // Check if Rooms exist
        const rooms = await Room.find({ _id: { $in: roomIds } }).populate('typeId');
        if (rooms.length !== roomIds.length) {
            throw new NotFoundError(`One or more Room IDs provided do not exist`);
        }

        // Check checkInTime and checkOutTime
        const requestedCheckIn = new Date(checkInTime);
        const requestedCheckOut = new Date(checkOutTime);

        if (requestedCheckIn > requestedCheckOut || requestedCheckIn.getTime() < Date.now()) {
            throw new BadRequestError("Invalid check-in/check-out time.");
        }

        // Two hour after check out for room services
        const adjustedCheckOut = new Date(requestedCheckOut.getTime() + 2 * 60 * 60 * 1000); // 2 hours after check-out

        // Check if any rooms in roomIds are unavailable for the requested time
        const conflictingBookings = await Booking.find({
            roomIds: { $in: roomIds },
            currentStatus: true,
            $or: [
                { checkInTime: { $lt: adjustedCheckOut }, checkOutTime: { $gt: requestedCheckIn } },
            ],
        });

        if (conflictingBookings.length > 0) {
            throw new BadRequestError('One or more rooms requested are unavailable for the selected booking time.')
        }



        // Calculate the total limit of guests
        const totalGuestsAllowed = rooms.reduce((total, room) => {
            return total + (room.typeId ? room.typeId.limit : 0);
        }, 0);

        const excessGuest = numberOfGuests - totalGuestsAllowed
        let extraCharge = 0
        if (excessGuest > 0) {
            const charges = await OverOccupancyCharge.find();
            let charge = charges.find(c => c.excessGuests === excessGuest);
            if (!charge) {
                // If no exact match, find the closest higher charge
                charge = charges
                    .filter(c => c.excessGuests > excessGuest)
                    .sort((a, b) => a.excessGuests - b.excessGuests)[0];

                // Out of max limit allowedS
                if (!charge) {
                    throw new BadRequestError("The number of guests is beyond the permitted excess limit.");
                }
            }
            extraCharge = charge.extraCharge
        }

        //Base price of this bill
        const hours = Math.ceil((requestedCheckOut - requestedCheckIn) / (1000 * 60 * 60));
        const days =  Math.floor(hours/24);
        
        const basePrice = rooms.reduce((total, room) => {
            return total + room.price.dailyRate * days
                         + room.price.hourlyRate * (hours-days*24) ;
        }, 0);

        let voucherUse = null;
        if (voucherCode) {
            //Check voucher
            const voucher = await Voucher.findOne({ code: voucherCode })
            if (!voucher) {
                throw new BadRequestError("Invalid voucher code")
            }
            voucherUse = voucher
            const currentDate = new Date();
            // Check voucher time
            if (currentDate < voucher.startDate || currentDate > voucher.endDate) {
                throw new BadRequestError(`Voucher has expired or isn't active yet. Valid date range is ${voucher.startDate.toISOString()} to ${voucher.endDate.toISOString()}.`);
            }

            // Check voucher requirement
            if (voucher.minSpend > basePrice) {
                throw new BadRequestError(`This booking does not meet the minimum amount required to apply this voucher. Current base price: ${basePrice}, required minimum: ${voucher.minSpend}.`);
            }
            if (voucher.limitUse <= voucher.userUsedVoucher.length) {
                throw new BadRequestError("Voucher has reached its maximum number of uses.");
            }
            if (voucher.userUsedVoucher.includes(userId)) {
                throw new BadRequestError(`User with id ${userId} has already use voucher with code ${voucherCode}.`);
            }

            // If all valid, mark voucher as used for this user
            voucher.userUsedVoucher.push(userId);
            await voucher.save();
        }

        // Actual price of this booking
        const discountAmount = voucherUse ? Math.min(basePrice * (voucherUse.discountPercentage / 100), voucherUse.maxDiscount) : 0;
        const redeemedAmount = redeemedPoint ? redeemedPoint * 1000 : 0;
        const totalAmount = Math.round(basePrice - discountAmount - redeemedAmount + extraCharge);

        // Check the min deposit required (20% of totalAmount)
        if (paidAmount < totalAmount * 0.2) {
            throw new BadRequestError(`The amount paid does not meet the required deposit (20% of total amount). Total is ${totalAmount}, must pay at least ${Math.round(totalAmount * 0.2)} for deposit`);
        }

        // Create new booking
        const paidAmountData = {
            amount: paidAmount,
            latestPaidTime: Date.now()
        }

        const bookingData = { userId, roomIds, checkInTime, checkOutTime, numberOfGuests, totalAmount, paymentMethod };
        bookingData.paidAmount = paidAmountData
        const newBooking = new Booking(bookingData);
        await newBooking.save();



        // Deduct user points after redemption
        user.point = user.point - redeemedPoint;
        user.save()

        await session.commitTransaction();

        res.status(201).json(newBooking);
    } catch (error) {
        await session.abortTransaction();
        next(error);
    }
};

// Get all Bookings
export const getBookings = async (req, res, next) => {
    try {
        const { checkInTime, checkOutTime, userId, roomId, currentStatus } = req.query;

        const query = {};
        if (userId) query.userId = userId;
        if (roomId) query.roomIds = roomId;
        if (currentStatus) query.currentStatus = currentStatus;
        if (checkInTime && checkOutTime) {
            query.checkInTime = { $gte: checkInTime };
            query.checkOutTime = { $lte: checkOutTime };
        }

        const bookings = await Booking.find(query)
            .populate('userId')
            .populate('roomIds');
        res.status(200).json(bookings);
    } catch (error) {
        next(error);
    }
};

// Get a Booking by ID
export const getBookingById = async (req, res, next) => {
    try {

        const booking = await Booking.findById(req.params.id)
            .populate('userId')
            .populate('roomIds');
        checkPermisson(req.user, booking.userId._id)

        if (!booking) {
            throw new NotFoundError(`Booking with id ${req.params.id} doesn't exist`);
        }
        res.status(200).json(booking);
    } catch (error) {
        next(error);
    }
};





// Update a Booking by ID
export const updateBooking = async (req, res, next) => {
    try {

        const updateBooking = req.body
        const bookingId = req.params.id
        if (updateBooking.userId) {
            // Check if user exists
            const user = await User.findOne({ role: { $in: [ROLES.CUSTOMER, ROLES.ONSITE_CUSTOMER] }, _id: updateBooking.userId });
            if (!user) {
                throw new NotFoundError(`User with id ${updateBooking.userId} doesn't exist.`);
            }
        }
        if (updateBooking.roomIds) {
            // Check if Rooms exist
            const rooms = await Room.find({ '_id': { $in: updateBooking.roomIds } });
            if (rooms.length !== updateBooking.roomIds.length) {
                throw new NotFoundError(`One or more Room IDs do not exist`);
            }
        }

        if (updateBooking.checkInTime || updateBooking.checkOutTime) {
            const oldBooking = await Booking.findById(bookingId)
            // Check checkInTime and checkOutTime
            const requestedCheckIn = updateBooking.checkInTime ? new Date(updateBooking.checkInTime) : oldBooking.checkInTime;
            const requestedCheckOut = updateBooking.checkOutTime ? new Date(updateBooking.checkOutTime) : oldBooking.checkOutTime;

            if (requestedCheckIn > requestedCheckOut || requestedCheckIn.getTime() < Date.now()) {
                throw new BadRequestError("Invalid check-in/check-out time.");
            }

            // Two hour after check out for room services
            const adjustedCheckOut = new Date(requestedCheckOut.getTime() + 2 * 60 * 60 * 1000); // 2 hours after check-out

            // Check if any rooms in roomIds are unavailable for the requested time
            const conflictingBookings = await Booking.find({
                roomIds: { $in: updateBooking.roomIds },
                _id: { $ne: bookingId },
                currentStatus: true,
                $or: [
                    { checkInTime: { $lt: adjustedCheckOut }, checkOutTime: { $gt: requestedCheckIn } },
                ],
            });

            if (conflictingBookings.length > 0) {
                throw new BadRequestError('One or more rooms requested are unavailable for the selected booking time.')
            }
        }

        if (updateBooking.paidAmount) {
            updateBooking.paidAmount = {
                amount: updateBooking.paidAmount,
                latestPaidTime: Date.now()
            }
        }

        // Update the booking
        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            updateBooking,
            { new: true, runValidators: true }
        );
        if (!updatedBooking) {
            throw new NotFoundError(`Booking with id ${bookingId} doesn't exist`);
        }
        res.status(200).json(updatedBooking);
    } catch (error) {
        next(error);
    }
};

const checkPermisson = (currentUser, resourceOwnerId) => {
    const role = currentUser.role
    const id = currentUser.id
    // Not a admin nor staff nor resourceOwner
    if (role != ROLES.ADMIN && role != ROLES.STAFF && id != resourceOwnerId) {
        throw new ForbiddenError('You are not allowed to do this action')
    }
}
