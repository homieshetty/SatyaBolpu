import mongoose, { Model, Schema } from 'mongoose';
import 'dotenv/config';

import { Culture } from '../models/Culture.js';
import { PostGroup } from '../models/PostGroup.js';
import { PostType } from '../models/PostType.js';
import { Tag } from '../models/Tag.js';
import { Location } from '../models/Location.js';
import { User } from '../models/User.js';
import {
  IBlog,
  ICulture,
  IEvent,
  ILocation,
  IPost,
  IPostGroup,
  IPostType,
  ITag,
} from '../types/globals.js';

type envProps = {
  MONGO_URI: string;
};

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect((process.env as envProps).MONGO_URI);
    console.log(`Connected to MongoDb Database: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Unable to connect to MongoDb Database: ${error}`);
    process.exit(1);
  }
};

export const validateExistence = (model: Model<any>) => {
  return {
    validator: async function (
      value: Schema.Types.ObjectId | Schema.Types.ObjectId[],
    ) {
      if (Array.isArray(value)) {
        const count = await model.countDocuments({
          _id: { $in: value },
        });

        return count === value.length;
      } else {
        return !!(await model.exists({ _id: value }));
      }
    },
    message: `${model.modelName} does not exist.`,
  };
};
