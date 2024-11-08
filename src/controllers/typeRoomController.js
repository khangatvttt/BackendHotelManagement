import TypeRoom from '../models/typeRoom.schema.js';
import bucket from '../config/firebaseConfig.js'
import crypto from 'crypto'
import Joi from 'joi';
import Booking from '../models/booking.schema.js';
import Room from '../models/room.schema.js';
import BadRequestError from '../errors/badRequestError.js'
import Rating from '../models/rating.schema.js'

// Create a new TypeRoom
export const createTypeRoom = async (req, res, next) => {
    try {

        const bodySchema = Joi.object({
            description: Joi.string().optional(),
            limit: Joi.number().integer().required(),
            typename: Joi.string().required(),
            price: Joi.object({
                hourlyRate: Joi.number().required(),
                dailyRate: Joi.number().required()
            }).required()
        });

        const { error } = bodySchema.validate(req.body);

        if (error) {
            throw error;
        }

        const data = req.body;

        // Handle upload image
        let uploadedUrls = [];
        if (req.files && req.files.length !== 0) {

            uploadedUrls = await Promise.all(req.files.map(async (file) => {
                const fileName = crypto.randomUUID();
                const firebaseFile = bucket.file(fileName);

                const stream = firebaseFile.createWriteStream({
                    metadata: {
                        contentType: file.mimetype,
                    },
                });

                return new Promise((resolve, reject) => {
                    stream.on('error', (err) => {
                        reject(`File upload error. Error: ${err}`);
                    });

                    stream.on('finish', async () => {
                        await firebaseFile.makePublic();
                        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${firebaseFile.name}`;
                        resolve(publicUrl);
                    });

                    stream.end(file.buffer);
                });
            }));

        }

        // Link images that have pushed to firebase
        data.images = uploadedUrls

        const newTypeRoom = new TypeRoom(data);
        await newTypeRoom.save();
        res.status(201).json(newTypeRoom);
    } catch (error) {
        next(error);
    }
};

// Get all TypeRooms
export const getTypeRooms = async (req, res, next) => {
    try {
        const querySchema = Joi.object({
            checkInTime: Joi.string().isoDate().optional(),
            checkOutTime: Joi.string().isoDate().optional(),
            limit: Joi.number().integer().min(1).optional(),
            page: Joi.number().integer().min(1).required(),
            size: Joi.number().integer().min(1).required()
        }).and('checkInTime', 'checkOutTime');

        const { error } = querySchema.validate(req.query);
        if (error) {
            throw error;
        }

        const query = {};
        if (req.query.limit) {
            query.limit = req.query.limit;
        }

        let bookedRoomIds=[];
        if (req.query.checkInTime && req.query.checkOutTime) {
            const checkInTime = new Date(req.query.checkInTime);
            const checkOutTime = new Date(req.query.checkOutTime);
            // Two hour after check out for room services
            const adjustedCheckOut = new Date(checkOutTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours after check-out

            if (checkInTime > checkOutTime || checkInTime.getTime() < Date.now()) {
                throw new BadRequestError("checkInTime must be before checkOutTime and be a date in future");
            }

            // Rooms that are booked in selected time
            const conflictBookings = await Booking.find({
                currentStatus: 'Reserved',
                $or: [
                    { checkInTime: { $lt: adjustedCheckOut }, checkOutTime: { $gt: checkInTime } }
                ]
            }).select('roomIds');

            bookedRoomIds = conflictBookings.flatMap(booking => booking.roomIds);
            bookedRoomIds = bookedRoomIds.map(room => room.toString())

        }

        let {size} = req.query
        const {page} = req.query

        if (size > 10) {
            size = 10
        };

        const totalDocuments = await TypeRoom.countDocuments(query)
        const totalPages = Math.ceil(totalDocuments / size);
        if (page > totalPages) {
            throw new BadRequestError('Excess page limit');
        }
        res.setHeader("X-Total-Count", `${totalPages}`);

        // Find typeRooms
        const typeRooms = await TypeRoom.find(query).limit(size).skip(size*(page-1)).lean();

        // Caculate how many room available
        for (const type of typeRooms) {
            const roomsOfType = await Room.find({
                typeId: type._id,
                status: true
            }).select('_id');
            const allRoomsThisType = roomsOfType.map(room => room._id);



            // Remove all rooms that are booked
            const availableRooms = allRoomsThisType.filter(room => !bookedRoomIds.includes(room.toString()));
            // Number of rooms that are available for booking
            type.availableRoom = availableRooms.length;

            // Average rating score and total ratings for this type
            const rating = {}
            const result = await Rating.aggregate([
                { $match: { typeRoomId: type._id } },
                {
                    $group: {
                        _id: "$typeRoomId",
                        averageScore: { $avg: "$score" },
                        ratingCount: { $sum: 1 }
                    }
                }
            ]);

            if (result.length > 0) {
                rating.averageScore = Math.round(result[0].averageScore * 10) / 10;
                rating.totalRating = result[0].ratingCount;
            }
            else {
                rating.averageScore = null;
                rating.totalRating = 0;
            }

            type.rating = rating;

        }
        res.status(200).json(typeRooms);
    } catch (error) {
        next(error);
    }
};

// Get a single TypeRoom by ID
export const getTypeRoomById = async (req, res, next) => {
    try {
        const typeRoom = await TypeRoom.findById(req.params.id);
        if (!typeRoom) {
            throw new NotFoundError(`Typeroom with id ${typeRoom} doesn't exist`);
        }
        res.status(200).json(typeRoom);
    } catch (error) {
        next(error);
    }
};

// Update a TypeRoom by ID
export const updateTypeRoom = async (req, res, next) => {
    try {
        const bodySchema = Joi.object({
            description: Joi.string().optional(),
            limit: Joi.number().integer().optional(),
            typename: Joi.string().optional(),
            price: Joi.object({
                hourlyRate: Joi.number().required(),
                dailyRate: Joi.number().required()
            }).optional(),
            imagesToRemove: Joi.array().items(Joi.string().required()).optional()
        });

        const { error } = bodySchema.validate(req.body);

        if (error) {
            throw error;
        }

        // Check typeId
        const findedType = TypeRoom.findById(req.params.id)
        if (!findedType) {
            throw new NotFoundError(`TypeRoom with id ${req.params.id} doesn't exist`);
        }

        // Images are added to current images
        let uploadedUrls = [];
        if (req.files && req.files.length !== 0) {

            uploadedUrls = await Promise.all(req.files.map(async (file) => {
                const fileName = crypto.randomUUID();
                const firebaseFile = bucket.file(fileName);

                const stream = firebaseFile.createWriteStream({
                    metadata: {
                        contentType: file.mimetype,
                    },
                });

                return new Promise((resolve, reject) => {
                    stream.on('error', (err) => {
                        reject(`File upload error. Error: ${err}`);
                    });

                    stream.on('finish', async () => {
                        await firebaseFile.makePublic();
                        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${firebaseFile.name}`;
                        resolve(publicUrl);
                    });

                    stream.end(file.buffer);
                });
            }));

        }

        const addImages = {
            ...req.body,
            $pull: { images: { $in: req.body.imagesToRemove || [] } },
        };
        const firstUpdated = await TypeRoom.findByIdAndUpdate(
            req.params.id,
            addImages,
            { new: true, runValidators: true }
        );

        firstUpdated.images.push(...uploadedUrls);
        const updateTypeRoom = await firstUpdated.save()

        res.status(200).json(updateTypeRoom);
    } catch (error) {
        next(error);
    }
};

