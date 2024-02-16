import mongoose from "mongoose";
import bcrypt from "bcrypt";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const petStoreSchema = new mongoose.Schema({
  storeName: {
    type: String,
    required: true,
  },
  ownerName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  houseNo: {
    type: String,
  },
  street: String,
  colony: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: String,
  displayPicture: {
    type: String,
    required: true,
  },
  contactNo: {
    type: Number,
    required: true,
    validate: {
      validator: function (v) {
        // Check if mobileNumber is exactly 10 digits
        return /^\d{10}$/.test(v);
      },
      message: (props) =>
        `${props.value} is not a valid 10-digit mobile number!`,
    },
  },
  productListed: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products",
    },
  ],
});

petStoreSchema.plugin(mongooseAggregatePaginate);

petStoreSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 4);
  return next();
});

petStoreSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export const PetStore = mongoose.model("PetStore", petStoreSchema);
