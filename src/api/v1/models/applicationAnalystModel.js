import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId,ref: 'User', required: true,},
    username: {type: String, required: true,},
    email: {type: String, required: true,},
    motivation:{type:String, required: true},
    experience:{type: String, required: true},
    twitterURL:{type: String},
    otherPublicProfileURL: {type: String},
    additionalInfo: {type: String},
    status: {type: String, enum:['pending', 'rejected', 'approved'], default: 'pending'},
},
{
    timestamps: true,
});

applicationSchema.index({ status: 1 });
applicationSchema.index({ userId: 1 });

export const AnalystApplication = mongoose.model('AnalystApplication', applicationSchema);