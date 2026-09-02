const express = require("express");
const router = express.Router({ mergeParams: true });
const { authMiddleware } = require("../middleware/auth.middleware");
const {
  getReviews,
  getReviewEligibility,
  createReview,
  updateReview,
  deleteReview,
} = require("../controllers/review.controller");

router.get("/", getReviews);
router.get("/eligibility", authMiddleware, getReviewEligibility);
router.post("/", authMiddleware, createReview);
router.patch("/:reviewId", authMiddleware, updateReview);
router.delete("/:reviewId", authMiddleware, deleteReview);

module.exports = router;
