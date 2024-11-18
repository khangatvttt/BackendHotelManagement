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
            throw new NotFoundError(`Typeroom with id ${data.typeId} doesn't exist`)
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
        size: Joi.number().integer().min(1).required(),
      });
  
      const { error } = querySchema.validate(req.query);
      if (error) {
        throw error;
      }
  
      const { typeId, status, page } = req.query;
      let { size } = req.query;
  
      const query = {};
      if (typeId) query.typeId = typeId;
      if (status !== undefined) query.status = status;
  
      // Ensure `size` does not exceed a limit (e.g., 10) for pagination safety
      size = Math.min(size, 10);
  
      const totalDocuments = await Room.countDocuments(query);
      const totalPages = Math.ceil(totalDocuments / size);
      if (page > totalPages) {
        throw new BadRequestError('Excess page limit');
      }
  
      res.setHeader("X-Total-Count", `${totalPages}`);
  
      const rooms = await Room.find(query)
        .limit(size)
        .skip(size * (page - 1))
        .populate({
          path: 'typeId',
          select: 'images typename',
        });
  
      // Sort rooms by room type name (ascending)
      rooms.sort((a, b) => {
        if (a.typeId.typename < b.typeId.typename) return -1;
        if (a.typeId.typename > b.typeId.typename) return 1;
        return 0;
      });
  
      res.status(200).json({
        metadata: {
          currentPage: parseInt(page),
          sizeEachPage: size,
          totalElements: totalDocuments,
          totalPages: totalPages,
        },
        data: rooms,
      });
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
        const typeRoom = await TypeRoom.findById(req.body.typeId);
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
