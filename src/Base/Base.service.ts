import { ReturnModelType } from "@typegoose/typegoose";
import { AnyParamConstructor } from "@typegoose/typegoose/lib/types";
import mongoose, { FilterQuery, UpdateQuery } from "mongoose";
 import { ApiError } from "../utils/ApiError";




export class BaseService<T> {
  constructor(
    protected readonly model: ReturnModelType<AnyParamConstructor<T>>
  ) {}


  // find by id
  async findById(id: string, select?: string): Promise<T & { _id: mongoose.Types.ObjectId }> {
    const doc = await this.model.findById(id).select(select ?? "");
    if (!doc) throw new ApiError(404, "Document not found");
    return doc as unknown as T & { _id: mongoose.Types.ObjectId };
  }


  // find one 
  async findOne(
    filter: FilterQuery<T>,
    select?: string
  ): Promise<(T & { _id: mongoose.Types.ObjectId }) | null> {
    return this.model
      .findOne(filter)
      .select(select ?? "") as unknown as Promise<
      (T & { _id: mongoose.Types.ObjectId }) | null
    >;
  }


  //find all
  async findAll(
    filter: FilterQuery<T> = {},
    select?: string
  ): Promise<(T & { _id: mongoose.Types.ObjectId })[]> {
    return this.model
      .find(filter)
      .select(select ?? "") as unknown as Promise<
      (T & { _id: mongoose.Types.ObjectId })[]
    >;
  }



  // crate
  async create(data: Partial<T>): Promise<T & { _id: mongoose.Types.ObjectId }> {
    const doc = await this.model.create(data);
    return doc as unknown as T & { _id: mongoose.Types.ObjectId };
  }


//update by id
  async updateById(
    id: string,
    update: UpdateQuery<T>,
    options = { new: true }
  ): Promise<T & { _id: mongoose.Types.ObjectId }> {
    const doc = await this.model.findByIdAndUpdate(id, update, options);
    if (!doc) throw new ApiError(404, "Document not found");
    return doc as unknown as T & { _id: mongoose.Types.ObjectId };
  }


  //delete by id
  async deleteById(id: string): Promise<void> {
    const result = await this.model.findByIdAndDelete(id);
    if (!result) throw new ApiError(404, "Document not found");
  }


  // cheak exist
  async exists(filter: FilterQuery<T>): Promise<boolean> {
    const doc = await this.model.exists(filter);
    return doc !== null;
  }



  // chaek the match
  protected assertOwnership(
    ownerId: mongoose.Types.ObjectId | string,
    resourceOwnerId: mongoose.Types.ObjectId | string
  ): void {
    const a = String(ownerId);
    const b = String(resourceOwnerId);
    if (a !== b) throw new ApiError(403, "Access denied");
  }
}