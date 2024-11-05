import NotFoundError from '../errors/badRequestError.js';
import BadRequestError from '../errors/badRequestError.js'
import Rating from '../models/rating.schema.js';
import Booking from '../models/booking.schema.js'
import { ROLES } from '../models/roles.js';
import ForbiddenError from '../errors/forbiddenError.js';

export const createRating = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.body.bookingId).populate({
            path: 'roomIds',
            select: 'typeId' 
        });
        checkPermisson(req.user, booking.userId)
        
        if (!booking){
            throw new NotFoundError(`Booking with id ${req.body.bookingId} doesn't exist`)
        }

        const typeRooms = booking.roomIds.map(room=>room.typeId.toString())
        if (!typeRooms.includes(req.body.typeRoomId)){
            throw new BadRequestError(`Booking with id ${req.body.bookingId} doesn't have typeId ${req.body.typeRoomId}`)
        }
        
        const rating = new Rating(req.body);
        await rating.save();
        res.status(201).send(rating);
    } catch (error) {
        // Duplicate error of mongoose
        if (error.code === 11000){
            return next(new BadRequestError('This typeRoom in this booking has been rated'))
        }
        next(error);
    }
};

export const getAllRatings = async (req, res, next) => {
    try {
        const { score, typeRoomId, bookingId } = req.query;

        const query = {};
        if (score) query.score = score;
        if (typeRoomId) query.typeRoomId = typeRoomId;
        if (bookingId) query.bookingId = bookingId;

        const ratings = await Rating.find(query)
            .populate({
                path: 'bookingId',
                select: 'userId'
            });
        res.status(200).json(ratings);
    } catch (error) {
        next(error);
    }
};

// Get a single Rating by ID
export const getRatingById = async (req, res, next) => {
    try {
        const rating = await Rating.findById(req.params.id);
        if (!rating){
            throw new NotFoundError(`Rating with id ${req.params.id} doesn't exist`);
        }
        res.status(200).json(rating);
    } catch (error) {
        next(error)
    }
};

// Update an Rating by ID
export const updateRating = async (req, res, next) => {
    try {
        const { score, feedback } = req.body;

        const rating = await Rating.findById(req.params.id).populate({
            path: 'bookingId'
        })
        if (!rating){
            throw new NotFoundError(`Rating with id ${req.params.id} doesn't exist`);
        }

        checkPermisson(req.user, rating.bookingId.userId);

        if (score){
            rating.score = score;
        }
        if (feedback){
            rating.feedback = feedback;
        }
        const updatedRating = await rating.save();
        res.status(200).send(updatedRating);
    } catch (error) {
        next(error);
    }
};

// Delete an Rating by ID
export const deleteRating = async (req, res, next) => {
    try {
        const rating = await Rating.findById(req.params.id).populate('bookingId')
        if (!rating){
            NotFoundError(`Rating with id ${req.params.id} doesn't exist`);
        }

        checkPermisson(req.user, rating.bookingId.userId);
        await Rating.findByIdAndDelete(req.params.id);
        res.status(200).send()
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
