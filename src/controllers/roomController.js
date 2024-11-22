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
    if (totalDocuments == 0) {
      res.status(200).json({
        "metadata": {
          "currentPage": 0,
          "sizeEachPage": 0,
          "totalElements": 0,
          "totalPages": 0
        },
        "data": [
        ]
      })
      return
    }
    const totalPages = Math.ceil(totalDocuments / size);
    if (page > totalPages) {
      throw new BadRequestError('Excess page limit');
    }

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
    if (req.body.typeId) {
      const typeRoom = await TypeRoom.findById(req.body.typeId);
      if (!typeRoom) {
        throw new NotFoundError(`Typeroom with id ${typeRoom} doesn't exist`);
      }
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
export const getRoomTypeAvailability = async (req, res, next) => {
  const { typeId, startDate, endDate } = req.query;

  if (!typeId || !startDate || !endDate) {
    return res.status(400).json({
      metadata: {
        success: false,
        message: 'Missing required query parameters',
        timestamp: new Date().toISOString(),
      },
      data: null,
    });
  }

  try {
    const typeRoom = await TypeRoom.findOne({ _id: typeId });

    if (!typeRoom) {
      return res.status(404).json({
        metadata: {
          success: false,
          message: 'Room type not found.',
          timestamp: new Date().toISOString(),
        },
        data: null,
      });
    }

    const rooms = await Room.find({ typeId });

    if (!rooms.length) {
      return res.status(200).json({
        metadata: {
          success: true,
          message: 'No rooms available, but all slots are available for the given room type.',
          timestamp: new Date().toISOString(),
        },
        data: {
          availableSlots: [],
          notAvailableSlots: [],
        },
      });
    }

    const roomIds = rooms.map((room) => room._id);

    const bookings = await Booking.find({
      roomIds: { $elemMatch: { $in: roomIds } },
      $or: [
        { checkInTime: { $lt: new Date(endDate), $gte: new Date(startDate) } },
        { checkOutTime: { $lte: new Date(endDate), $gt: new Date(startDate) } },
        {
          checkInTime: { $lte: new Date(startDate) },
          checkOutTime: { $gte: new Date(endDate) },
        },
      ],
    });

    const notAvailableSlotsSet = new Set();

    bookings.forEach((booking) => {
      booking.roomIds.forEach((roomId) => {
        if (roomIds.some((id) => id.equals(roomId))) {
          let currentDateTime = new Date(booking.checkInTime);
          const adjustedCheckOutTime = new Date(booking.checkOutTime);
          adjustedCheckOutTime.setHours(adjustedCheckOutTime.getHours() + 2);

          while (currentDateTime < adjustedCheckOutTime) {
            notAvailableSlotsSet.add(currentDateTime.toISOString());
            currentDateTime.setMinutes(currentDateTime.getMinutes() + 30);
          }
        }
      });
    });


    const notAvailableSlots = Array.from(notAvailableSlotsSet);

    let availableSlots = [];
    let currentDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);

    const MIN_FREE_TIME = 60 * 60 * 1000; 

    while (currentDateTime < endDateTime) {
      const slot = currentDateTime.toISOString();
      if (!notAvailableSlotsSet.has(slot)) {
        availableSlots.push(slot);
      }
      currentDateTime.setMinutes(currentDateTime.getMinutes() + 30);
    }

    const filteredAvailableSlots = [];
    for (let i = 0; i < availableSlots.length; i++) {
      const currentSlot = new Date(availableSlots[i]);
      if (!notAvailableSlotsSet.has(currentSlot.toISOString())) {
        filteredAvailableSlots.push(availableSlots[i]);
      }
    }


    if (availableSlots.length > 0) {
      const lastSlot = new Date(availableSlots[availableSlots.length - 1]);
      const secondLastSlot = new Date(availableSlots[availableSlots.length - 2]);

      if (lastSlot - secondLastSlot >= MIN_FREE_TIME) {
        filteredAvailableSlots.push(availableSlots[availableSlots.length - 1]);
      } else {
        notAvailableSlots.push(availableSlots[availableSlots.length - 1]);
      }
    }

    return res.status(200).json({
      metadata: {
        success: true,
        message: 'Room availability fetched successfully',
        timestamp: new Date().toISOString(),
        totalAvailableSlots: filteredAvailableSlots.length,
        totalNotAvailableSlots: notAvailableSlots.length,
      },
      data: {
        availableSlots: filteredAvailableSlots,
        notAvailableSlots,
      },
    });
  } catch (error) {
    console.error('Error fetching room type availability:', error);
    return res.status(500).json({
      metadata: {
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      data: null,
    });
  }
};




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