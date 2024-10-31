import Room from '../models/room.schema.js';
import TypeRoom from '../models/typeRoom.schema.js';
import Booking from '../models/booking.schema.js';
import NotFoundError from '../errors/notFoundError.js'
import mongoose from 'mongoose';

// Create a new Room
export const createRoom = async (req, res, next) => {
    try {
        // Check if TypeRoom exists
        const typeRoom = await TypeRoom.findById(req.body.TypeId);
        if (!typeRoom) {
            throw new NotFoundError(`Typeroom with id ${typeRoom} doesn't exist`)
        }
        // Create new room
        const newRoom = new Room(req.body);
        await newRoom.save();
        res.status(201).json(newRoom);
    } catch (error) {
        next(error);
    }
};

// Get all Rooms
export const getRooms = async (req, res, next) => {
    try {
        let page = parseInt(req.query.page) || 1;
        if(page<1){
            page=1;
        }
        const limit = 6;
        const skip = (page - 1)*limit;
        const totalRooms = await Room.countDocuments();                           
        const rooms = await Room.find().populate('TypeId').skip(skip).limit(limit);
        res.status(200).json({
            rooms,
            currentPage: page,
            totalPages: Math.ceil(totalRooms / limit),
            totalRooms
        });
    } catch (error) {
        next(error);
    }
};

// Get a single Room by ID
export const getRoomById = async (req, res, next) => {
    try {
        const room = await Room.findById(req.params.id).populate('TypeId');
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

// Delete a Room by ID
export const deleteRoom = async (req, res, next) => {
    try {
        const deletedRoom = await Room.findByIdAndDelete(req.params.id);
        if (!deletedRoom) {
            throw new NotFoundError(`Room with id ${req.params.id} doesn't exist`);
        }
        res.status(200).json();
    } catch (error) {
        next(error);
    }
};

// Get all avaiable rooms
export const getAvailableRooms = async (req, res, next) => {
    try {
        const { checkInTime, checkOutTime, typeName } = req.body;
        let page = parseInt(req.query.page) || 1;
        if(page<1){
            page=1;
        }
        const limit = 6;

        if (!checkInTime || !checkOutTime) {
            return res.status(400).json({ message: "CheckInTime and CheckOutTime are required" });
        }

        const checkInDate = new Date(checkInTime);
        checkInDate.setHours(0, 0, 0, 0);

        const checkOutDate = new Date(checkOutTime);
        checkOutDate.setHours(23, 59, 59, 999);

        let query = {
            _id: {
                $nin: await Booking.distinct('RoomID', {
                    $or: [
                        {
                            CheckInTime: { $lt: checkOutDate },
                            CheckOutTime: { $gt: checkInDate }
                        }
                    ]
                })
            }
        };

        if (typeName) {
            const typeRoom = await TypeRoom.findOne({ Typename: typeName });
            if (!typeRoom) {
                return res.status(404).json({ message: "TypeRoom not found" });
            }
            query.TypeId = typeRoom._id;
        }
        const skip = (page - 1)*limit;

        const availableRooms = await Room.find(query)
                                        .skip(skip)
                                        .limit(limit);
        const totalRooms = await Room.countDocuments(query);                           
        res.status(200).json({
            availableRooms,
            currentPage: page,
            totalPage: Math.ceil(totalRooms / limit),
            totalRooms
        });
    } catch (error) {
        next(error);
    }
};

// Get rating for top 4 
export const getTopRatedRoom = async (req, res, next) =>{
    try {
        const topRatedRooms = await Booking.aggregate([
            {
                $unwind:'$RoomID'
            },
            {
                $group:{
                    _id: '$RoomID',
                    avgRating:{$avg: '$Rating'}
                }
            },
            {
                $sort: {avgRating: -1}
            },
            {
                $limit: 4
            }
        ]);
        const rooms= await Room.find({
            _id: {$in: topRatedRooms.map(room => mongoose.Types.ObjectId(room._id))}
        });

        res.status(200).json(rooms);
    } catch (error) {
        next(error);
    }
}
