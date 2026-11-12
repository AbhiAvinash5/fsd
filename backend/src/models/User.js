import mongoose from 'mongoose';
import { getIsMongoConnected } from '../config/db.js';
import { JsonCollection } from './storeFallback.js';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const MongoUser = mongoose.models.User || mongoose.model('User', UserSchema);
const FallbackUser = new JsonCollection('users');

const User = {
  create: async (data) => (getIsMongoConnected() ? MongoUser.create(data) : FallbackUser.create(data)),
  findOne: (query) => (getIsMongoConnected() ? MongoUser.findOne(query) : FallbackUser.findOne(query)),
  findById: (id) => (getIsMongoConnected() ? MongoUser.findById(id) : FallbackUser.findById(id)),
  find: (query) => (getIsMongoConnected() ? MongoUser.find(query) : FallbackUser.find(query)),
  countDocuments: (query) => (getIsMongoConnected() ? MongoUser.countDocuments(query) : FallbackUser.countDocuments(query))
};

export default User;

