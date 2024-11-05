import mongoose from 'mongoose';

const shiftSchema = new mongoose.Schema({
    shiftName: {
        type: String,
        unique: true,
        require: true, 
    },
    startTime: {
        type: Number,
        require: true,
        get: minutesToTime,
        set: timeToMinutes
    },
    endTime: {
        type: Number,
        require: true,
        get: minutesToTime,
        set: timeToMinutes,
    }
},  { id: false, toJSON: { getters: true }});


function timeToMinutes(time){
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

function minutesToTime(minutes) {
    const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
    const mins = String(minutes % 60).padStart(2, '0');
    return `${hours}:${mins}`;
};

export default mongoose.model('Shift', shiftSchema);
