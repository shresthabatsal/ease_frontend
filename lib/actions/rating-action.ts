import {
  getProductRatings,
  createRating,
  updateRating,
  deleteRating,
} from "@/lib/api/rating";

type ActionResult<T = any> = Promise<{
  success: boolean;
  data?: T;
  message?: string;
}>;

export const handleGetProductRatings = async (
  productId: string
): ActionResult => {
  try {
    const data = await getProductRatings(productId);
    return { success: true, data };
  } catch (e: any) {
    return {
      success: false,
      message: e?.response?.data?.message ?? "Failed to load ratings",
    };
  }
};

export const handleCreateRating = async (
  productId: string,
  rating: number,
  review: string
): ActionResult => {
  try {
    const data = await createRating(productId, rating, review);
    return { success: true, data, message: "Review submitted!" };
  } catch (e: any) {
    return {
      success: false,
      message: e?.response?.data?.message ?? "Failed to submit review",
    };
  }
};

export const handleUpdateRating = async (
  ratingId: string,
  rating: number,
  review: string
): ActionResult => {
  try {
    const data = await updateRating(ratingId, rating, review);
    return { success: true, data, message: "Review updated!" };
  } catch (e: any) {
    return {
      success: false,
      message: e?.response?.data?.message ?? "Failed to update review",
    };
  }
};

export const handleDeleteRating = async (ratingId: string): ActionResult => {
  try {
    await deleteRating(ratingId);
    return { success: true, message: "Review deleted" };
  } catch (e: any) {
    return {
      success: false,
      message: e?.response?.data?.message ?? "Failed to delete review",
    };
  }
};
