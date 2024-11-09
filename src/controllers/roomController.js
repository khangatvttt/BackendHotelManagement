import Room from '../models/room.schema.js';
import TypeRoom from '../models/typeRoom.schema.js';
import NotFoundError from '../errors/notFoundError.js'
import Booking from '../models/booking.schema.js'
import Joi from 'joi';
// Create a new Room
export const createRoom = async (req, res, next) => {
    try {
        const data = req.body;
        // Check if TypeRoom existsn
        const typeRoom = await TypeRoom.findById(data.typeId);
        if (!typeRoom) {
            throw new NotFoundError(`Typeroom with id ${typeRoom} doesn't exist`)
        }

        const newRoom = new Room(data);
        await newRoom.save()
        res.status(201).json(newRoom);
    } catch (error) {
        next(error);
    }
};

// Get all Rooms
export const getRooms = async (req, res, next) => {
    try {

        const querySchema = Joi.object({
            typeId: Joi.string().optional(),
            status: Joi.boolean().optional(),
            page: Joi.number().integer().min(1).required(),
            size: Joi.number().integer().min(1).required()
          })
      
          const { error } = querySchema.validate(req.query)
          if (error) {
            throw error;
          }

        const {typeId, status, page} = req.query
        let {size} = req.query

        const query = {};
        if (typeId) query.typeId = typeId;
        if (status) query.status = status === 'true';

        if (size > 10) {
            size = 10
          };
      
          const totalDocuments = await Room.countDocuments(query)
          const totalPages = Math.ceil(totalDocuments / size);
          if (page > totalPages) {
            throw new BadRequestError('Excess page limit');
          }
          res.setHeader("X-Total-Count", `${totalPages}`);
      
 
        const rooms = await Room.find(query).limit(size).skip(size * (page-1)).populate({
            path: 'typeId',
            select: 'images typename'
        });
        res.status(200).json(rooms);
    } catch (error) {
        next(error);
    }
};

// Get a single Room by ID
export const getRoomById = async (req, res, next) => {
    try {
        const room = await Room.findById(req.params.id).populate({
            path: 'typeId',
            select: 'images typename'
        });
        if (!room) {
            throw new NotFoundError(`Room with id ${req.params.id} doesn't exist`);
        }
        res.status(200).json(room);
    } catch (error) {
        next(error);
    }
};

// Update a Room by ID
export const updateRoom = async (req, res, next) => {
    try {
        // Check if TypeRoom exists
        const typeRoom = await TypeRoom.findById(req.body.TypeId);
        if (!typeRoom) {
            throw new NotFoundError(`Typeroom with id ${typeRoom} doesn't exist`);
        }

        // Update room directly with req.body
        const updatedRoom = await Room.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedRoom) {
            throw new NotFoundError(`Room with id ${req.params.id} doesn't exist`);
        }
        res.status(200).json(updatedRoom);
    } catch (error) {
        next(error);
    }
};

//Get available and unavailable dates of room type
// export const getRoomTypeAvailability = async (req, res, next) => {
//     const { typeId, startDate, endDate } = req.query;

//     if (!typeId || !startDate || !endDate) {
//         return res.status(400).json({ error: 'Missing required query parameters' });
//     }

//     if (!mongoose.Types.ObjectId.isValid(typeId)) {
//         return res.status(400).json({ error: 'Invalid typeId format' });
//     }

//     try {
//         const rooms = await Room.find({ typeId: new mongoose.Types.ObjectId(typeId) });

//         if (rooms.length === 0) {
//             return res.status(404).json({ availableDates: [], notAvailableDates: [] });
//         }

//         const roomIds = rooms.map(room => room._id);
//         const bookings = await Booking.find({
//             roomIds: { $in: roomIds },
//             $or: [
//                 { checkInTime: { $lt: new Date(endDate), $gte: new Date(startDate) } },
//                 { checkOutTime: { $lte: new Date(endDate), $gt: new Date(startDate) } },
//                 { checkInTime: { $lte: new Date(startDate) }, checkOutTime: { $gte: new Date(endDate) } }
//             ]
//         });

//         const notAvailableDates = new Set();
//         bookings.forEach(booking => {
//             let currentDate = new Date(booking.checkInTime);
//             while (currentDate <= booking.checkOutTime) {
//                 const dateString = currentDate.toISOString().split('T')[0];
//                 notAvailableDates.add(dateString);
//                 currentDate.setDate(currentDate.getDate() + 1);
//             }
//         });

//         const availableDates = [];
//         const start = new Date(startDate);
//         const end = new Date(endDate);

//         const filteredNotAvailableDates = Array.from(notAvailableDates).filter(date => {
//             const currentDate = new Date(date);
//             return currentDate >= start && currentDate <= end;
//         });

//         let currentDate = new Date(startDate);
//         while (currentDate <= end) {
//             const dateString = currentDate.toISOString().split('T')[0];
//             if (!notAvailableDates.has(dateString)) {
//                 availableDates.push(dateString);
//             }
//             currentDate.setDate(currentDate.getDate() + 1);
//         }

//         return res.status(200).json({
//             availableDates,
//             notAvailableDates: filteredNotAvailableDates
//         });
//     } catch (error) {
//         console.error('Error fetching room type availability:', error);
//         next(error);
//     }
// };

// Get rating for top 4 
export const getTopRatedRoom = async (req, res, next) => {
    try {
        const topRatedRooms = await Booking.aggregate([
            {
                $unwind: '$RoomID'
            },
            {
                $group: {
                    _id: '$RoomID',
                    avgRating: { $avg: '$Rating' }
                }
            },
            {
                $sort: { avgRating: -1 }
            },
            {
                $limit: 4
            }
        ]);
        const rooms = await Room.find({
            _id: { $in: topRatedRooms.map(room => mongoose.Types.ObjectId(room._id)) }
        });

        res.status(200).json(rooms);
    } catch (error) {
        next(error);
    }
}

export const getBookedTimeOfRoom = async (req, res, next) => {
    try {
        const roomId = req.params.id;
        const room = await Room.findById(roomId);
        if (!room) {
            throw new NotFoundError(`Room with id ${roomId} doesn't exist`);
        }

        const bookings = await Booking.find({
            roomIds: { $in: [roomId] },
            $or: [{ checkInTime: { $gt: new Date() } }, { checkOutTime: { $gt: new Date() } }],
        })
            .select('checkInTime checkOutTime -_id');

        res.status(200).json(bookings);
    } catch (error) {
        next(error);
    }
};