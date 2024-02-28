import mongoose, { Schema } from "mongoose";

const appointmentSchema = new mongoose.Schema({
  dogParentName: {
    type: String,
    required: true,
  },
  dogName: {
    type: String,
  },
  profileType: String,
  dogBreed: {
    type: String,
    required: true,
  },
  appointmentDate: {
    type: Date,
  },
  appointmentTime: {
    type: String,
  },
  reason: {
    type: String,
    default: "Regular Checkup",
  },
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

export { Appointment };
