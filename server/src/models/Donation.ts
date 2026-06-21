import mongoose, { Schema, Document } from 'mongoose';

export interface IDonation extends Document {
  userId: Schema.Types.ObjectId;
  amount: number;
  paymentId: string;
  orderId: string;
  createdAt: Date;
  updatedAt: Date;
}

const donationSchema = new Schema<IDonation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, 'Amount must be greater than 0'],
    },
    paymentId: {
      type: String,
      required: true,
      unique: true,
    },
    orderId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Donation = mongoose.model<IDonation>('Donation', donationSchema);
