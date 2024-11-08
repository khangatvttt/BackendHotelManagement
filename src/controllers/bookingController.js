import Booking from '../models/booking.schema.js';
import Room from '../models/room.schema.js'
import TypeRoom from '../models/typeRoom.schema.js'
import OverOccupancyCharge from '../models/overOccupancyCharge.schema.js'
import { User } from '../models/user.schema.js';
import NotFoundError from '../errors/notFoundError.js';
import { ROLES } from '../models/roles.js';
import BadRequestError from '../errors/badRequestError.js'
import Voucher from '../models/voucher.schema.js'
import ForbiddenError from '../errors/forbiddenError.js';
import mongoose from 'mongoose';
import Joi from 'joi';

// Create a new Booking
export const createBooking = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { userId, typeRooms, checkInTime, checkOutTime, paidAmount, numberOfGuests, redeemedPoint, voucherCode, paymentMethod } = req.body;
        checkPermisson(req.user, userId)

        // Check the input
        const shemaBody = Joi.object({
            typeRooms: Joi.array()
                .items(
                    Joi.object({
                        typeId: Joi.string().required(),
                        numberOfRooms: Joi.number().integer().greater(0).required()
                    })
                )
                .required(),
            userId: Joi.string().required(),
            numberOfGuests: Joi.number().integer().required(),
            checkInTime: Joi.date().required(),
            checkOutTime: Joi.date().required(),
            paidAmount: Joi.number().required(),
            redeemedPoint: Joi.number().integer().optional(),
            voucherCode: Joi.string().optional(),
            paymentMethod: Joi.string().required()
        });
        const { error } = shemaBody.validate(req.body);
        if (error) {
            throw error;
        }

        // Check if user exists
        const user = await User.findOne({ role: { $in: [ROLES.CUSTOMER, ROLES.ONSITE_CUSTOMER] }, _id: userId });
        if (!user) {
            throw new NotFoundError(`User with id ${userId} doesn't exist.`);
        }

        // Check user's point
        if (redeemedPoint) {
            if (user.point < redeemedPoint) {
                throw new BadRequestError("This user's points are not enough to fulfill the request.")
            }
        }

        // Check if types contains unique typeId
        const typeIds = typeRooms.map(type => type.typeId);
        const uniqueTypeIds = new Set(typeIds);
        if (uniqueTypeIds.size !== typeIds.length) {
            throw new BadRequestError('Duplicate typeId found in typeRooms.')
        }

        // Check if TypeRooms exist
        const types = await TypeRoom.find({ _id: { $in: typeIds } });
        if (types.length !== typeIds.length) {
            throw new NotFoundError(`One or more TypeRoom IDs provided do not exist`);
        }

        // Check checkInTime and checkOutTime
        const requestedCheckIn = new Date(checkInTime);
        const requestedCheckOut = new Date(checkOutTime);

        if (requestedCheckIn > requestedCheckOut || requestedCheckIn.getTime() < Date.now()) {
            throw new BadRequestError("checkInTime must be before checkOutTime and be a date in future");
        }
        // Two hour after check out for room services
        const adjustedCheckOut = new Date(requestedCheckOut.getTime() + 2 * 60 * 60 * 1000); // 2 hours after check-out

        // Rooms that are booked in selected time
        const conflictBookings = await Booking.find({
            currentStatus: 'Reserved',
            $or: [
                { checkInTime: { $lt: adjustedCheckOut }, checkOutTime: { $gt: requestedCheckIn } }
            ]
        }).select('roomIds');

        let bookedRoomIds = conflictBookings.flatMap(booking => booking.roomIds);
        bookedRoomIds = bookedRoomIds.map(room => room.toString())
        const rooms = []
        //console.log(bookedRoomIds)
        for (const type of types) {
            const roomsOfType = await Room.find({
                typeId: type._id,
                status: true
            }).select('_id');
            const allRoomsThisType = roomsOfType.map(room => room._id);

            // Get number of rooms that needed
            const requestNumber = typeRooms.find(room => room.typeId == type._id).numberOfRooms;

            // Remove all rooms that are booked
            const availableRooms = allRoomsThisType.filter(room => !bookedRoomIds.includes(room.toString()));

            // Check if have enough rooms to fulfill the request
            if (availableRooms.length < requestNumber) {
                throw new BadRequestError(`There isn't enough rooms for typeId ${type._id}. Request: ${requestNumber}, available: ${availableRooms.length}`)
            }

            rooms.push(...availableRooms.slice(0, requestNumber));
        }

        // Calculate the total limit of guests
        const totalGuestsAllowed = types.reduce((total, type) => {
            const numberOfRooms = typeRooms.find(typeInput => typeInput.typeId == type._id).numberOfRooms;
            return total + type.limit * numberOfRooms;
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
        const days = Math.floor(hours / 24);

        const basePrice = types.reduce((total, type) => {
            const numberOfRooms = typeRooms.find(typeInput => typeInput.typeId == type._id).numberOfRooms;
            return total + (type.price.dailyRate * days
                + type.price.hourlyRate * (hours - days * 24)) * numberOfRooms;
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


        const bookingData = { userId, checkInTime, checkOutTime, numberOfGuests, totalAmount, paymentMethod };
        bookingData.paidAmount = paidAmountData;
        bookingData.roomIds = rooms
        const newBooking = new Booking(bookingData);
        await newBooking.save();

        // Deduct user points after redemption
        if (redeemedPoint) {
            user.point = user.point - redeemedPoint;
            await user.save()
        }

        await session.commitTransaction();
        session.endSession()
        res.status(201).json(newBooking);
    } catch (error) {
        await session.abortTransaction();
        session.endSession()
        next(error);
    }
};

// Get all Bookings
export const getBookings = async (req, res, next) => {
    try {
        const querySchema = Joi.object({
            checkInTime: Joi.date().optional(),
            checkOutTime: Joi.date().optional(),
            userId: Joi.string().optional(),
            roomId: Joi.string().optional(),
            currentStatus: Joi.string().optional(),
            page: Joi.number().integer().min(1).required(),
            size: Joi.number().integer().min(1).required()
        })

        const { error } = querySchema.validate(req.query)

        if (error) {
            throw error;
        }

        const { checkInTime, checkOutTime, userId, roomId, currentStatus, page } = req.query;
        let { size } = req.query;

        const query = {};
        if (userId) query.userId = userId;
        if (roomId) query.roomIds = roomId;
        if (currentStatus) query.currentStatus = currentStatus;
        if (checkInTime && checkOutTime) {
            query.checkInTime = { $gte: checkInTime };
            query.checkOutTime = { $lte: checkOutTime };
        }

        if (size > 10) {
            size = 10
        };

        const totalDocuments = await Booking.countDocuments(query)
        const totalPages = Math.ceil(totalDocuments / size);
        if (page > totalPages) {
            throw new BadRequestError('Excess page limit');
        }
        res.setHeader("X-Total-Count", `${totalPages}`);


        const bookings = await Booking.find(query).limit(size).skip(size * (page-1))
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
            .populate({
                path: 'userId',
                select: 'fullName phoneNumber email'
            })
            .populate({
                path: 'roomIds',
                populate: {
                    path: 'typeId',
                    select: 'typename'
                }
            });

        if (!booking) {
            throw new NotFoundError(`Booking with id ${req.params.id} doesn't exist`);
        }
        checkPermisson(req.user, booking.userId._id)


        res.status(200).json(booking);
    } catch (error) {
        next(error);
    }
};





// Update a Booking by ID
export const updateBooking = async (req, res, next) => {
    try {

        const updateBooking = req.body;
        const bookingId = req.params.id;

        // Customer can only update the currentStatus field 
        if (req.user.role == ROLES.CUSTOMER) {
            const booking = await Booking.findById(bookingId);
            if (!booking) {
                throw new NotFoundError(`Booking with id ${bookingId} doesn't exist`);
            }
            booking.currentStatus = req.body.currentStatus;
            await booking.save();
            res.status(200).send();
        }

        // Staff or adminn update
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
