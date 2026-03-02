import axios from "./axios";
import { API } from "./endpoints";

export interface IRating {
  _id: string;
  productId: string;
  userId: { _id: string; fullName: string; email: string } | string;
  rating: number;
  review: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRatingsResponse {
  ratings: IRating[];
  averageRating: number;
  totalRatings: number;
}

export const getProductRatings = async (
  productId: string
): Promise<ProductRatingsResponse> => {
  const res = await axios.get(API.PUBLIC.RATINGS.GET_BY_PRODUCT(productId));
  return res.data.data;
};

export const createRating = async (
  productId: string,
  rating: number,
  review: string
): Promise<IRating> => {
  const res = await axios.post(API.PUBLIC.RATINGS.CREATE, {
    productId,
    rating,
    review,
  });
  return res.data.data;
};

export const updateRating = async (
  ratingId: string,
  rating: number,
  review: string
): Promise<IRating> => {
  const res = await axios.put(API.PUBLIC.RATINGS.UPDATE(ratingId), {
    rating,
    review,
  });
  return res.data.data;
};

export const deleteRating = async (ratingId: string): Promise<void> => {
  await axios.delete(API.PUBLIC.RATINGS.DELETE(ratingId));
};
