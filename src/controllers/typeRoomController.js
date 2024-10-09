import TypeRoom from '../models/typeRoom.schema.js';

// Create a new TypeRoom
export const createTypeRoom = async (req, res, next) => {
    try {
        const newTypeRoom = new TypeRoom(req.body);
        await newTypeRoom.save();
        res.status(201).json(newTypeRoom);
    } catch (error) {
        next(error);
    }
};

// Get all TypeRooms
export const getTypeRooms = async (req, res, next) => {
    try {
        const typeRooms = await TypeRoom.find();
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
        const updatedTypeRoom = await TypeRoom.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true}
        );
        if (!updatedTypeRoom) {
            throw new NotFoundError(`TypeRoom with id ${req.params.id} doesn't exist`);
        }
        res.status(200).json(updatedTypeRoom);
    } catch (error) {
        next(error);
    }
};

// Delete a TypeRoom by ID
export const deleteTypeRoom = async (req, res, next) => {
    try {
        const deletedTypeRoom = await TypeRoom.findByIdAndDelete(req.params.id);
        if (!deletedTypeRoom) {
            throw new NotFoundError(`Typeroom with id ${req.params.id} doesn't exist`)
        }
        res.status(200).json();
    } catch (error) {
        next(error);
    }
};
