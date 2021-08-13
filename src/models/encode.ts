import { Schema, model } from "mongoose";

const encodeSchema = new Schema({
    character: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    }
},{timestamps: true});

export default model('Encode', encodeSchema);