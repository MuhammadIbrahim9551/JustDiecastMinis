
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import "./ReviewForm.css";

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const MAX_PHOTOS = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function ReviewForm() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();

  const productId = searchParams.get("productId");
  const token = searchParams.get("token");

  const [reviewDetails, setReviewDetails] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchReviewDetails = async () => {
      if (!orderId || !productId || !token) {
        setError("This review link is incomplete or invalid.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/reviews/form/${encodeURIComponent(
            orderId
          )}?productId=${encodeURIComponent(
            productId
          )}&token=${encodeURIComponent(token)}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load the review form."
          );
        }

        setReviewDetails(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviewDetails();
  }, [orderId, productId, token]);

  const handlePhotoChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    setError("");

    if (photos.length + selectedFiles.length > MAX_PHOTOS) {
      setError(`You can upload a maximum of ${MAX_PHOTOS} photos.`);
      event.target.value = "";
      return;
    }

    const validPhotos = [];

    for (const file of selectedFiles) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setError("Only JPG, PNG, and WebP images are allowed.");
        event.target.value = "";
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError("Each image must be smaller than 5 MB.");
        event.target.value = "";
        return;
      }

      validPhotos.push({
        file,
        preview: URL.createObjectURL(file)
      });
    }

    setPhotos((currentPhotos) => [...currentPhotos, ...validPhotos]);

    event.target.value = "";
  };

  const removePhoto = (indexToRemove) => {
    setPhotos((currentPhotos) => {
      const photoToRemove = currentPhotos[indexToRemove];

      if (photoToRemove) {
        URL.revokeObjectURL(photoToRemove.preview);
      }

      return currentPhotos.filter(
        (_, index) => index !== indexToRemove
      );
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (rating < 1 || rating > 5) {
      setError("Please select a rating from 1 to 5 stars.");
      return;
    }

    if (!comment.trim()) {
      setError("Please write a review before submitting.");
      return;
    }

    if (comment.trim().length > 1000) {
      setError("Your review cannot exceed 1000 characters.");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("orderId", orderId);
      formData.append("productId", Number(productId));
      formData.append("token", token);
      formData.append("rating", rating);
      formData.append("comment", comment.trim());

      photos.forEach((photo) => {
        formData.append("photos", photo.file);
      });

      const response = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to submit your review."
        );
      }

      setSuccess(
        data.message ||
          "Your review has been submitted for approval."
      );

      setRating(0);
      setComment("");

      photos.forEach((photo) => {
        URL.revokeObjectURL(photo.preview);
      });

      setPhotos([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p style={styles.message}>
            Loading your review form...
          </p>
        </div>
      </div>
    );
  }

  if (error && !reviewDetails) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>Review Unavailable</h1>

          <p style={styles.error}>{error}</p>

          <p style={styles.secondaryText}>
            This link may have expired or may have already been used.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Share Your Experience</h1>

        <p style={styles.subtitle}>
          Thank you for shopping with Just Diecast Minis!
        </p>

        {reviewDetails && (
          <>
            <div style={styles.productBox}>
              <p style={styles.label}>Product</p>

              <h2 style={styles.productName}>
                {reviewDetails.productName}
              </h2>

              <p style={styles.customerText}>
                Hello, {reviewDetails.customerName}!
              </p>

              <p style={styles.orderText}>
                Order ID: {reviewDetails.orderId}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={styles.section}>
                <label style={styles.label}>
                  Your Rating
                </label>

                <div style={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`review-star ${
                        star <= rating ? "selected" : ""
                      }`}
                      onClick={() => setRating(star)}
                      aria-label={`Rate ${star} out of 5`}
                      aria-pressed={rating === star}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <p style={styles.ratingText}>
                  {rating === 0
                    ? "Select a rating"
                    : `${rating} out of 5 stars`}
                </p>
              </div>

              <div style={styles.section}>
                <label
                  htmlFor="review-comment"
                  style={styles.label}
                >
                  Your Review
                </label>

                <textarea
                  id="review-comment"
                  value={comment}
                  onChange={(event) =>
                    setComment(event.target.value)
                  }
                  placeholder="Tell us what you think about your model..."
                  maxLength={1000}
                  rows={6}
                  style={styles.textarea}
                  required
                />

                <p style={styles.characterCount}>
                  {comment.length}/1000 characters
                </p>
              </div>

              <div style={styles.section}>
                <label
                  htmlFor="review-photos"
                  style={styles.label}
                >
                  Add Photos (Optional)
                </label>

                <p style={styles.photoHelp}>
                  Upload up to 3 photos. JPG, PNG, or WebP.
                  Maximum 5 MB per image.
                </p>

                {photos.length < MAX_PHOTOS && (
                  <input
                    id="review-photos"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handlePhotoChange}
                    style={styles.fileInput}
                  />
                )}

                {photos.length > 0 && (
                  <div style={styles.photoPreviewGrid}>
                    {photos.map((photo, index) => (
                      <div
                        key={`${photo.file.name}-${index}`}
                        style={styles.photoPreview}
                      >
                        <img
                          src={photo.preview}
                          alt={`Review preview ${index + 1}`}
                          style={styles.previewImage}
                        />

                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          style={styles.removePhotoButton}
                          aria-label={`Remove photo ${index + 1}`}
                        >
                          × Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p style={styles.photoCount}>
                  {photos.length}/{MAX_PHOTOS} photos selected
                </p>
              </div>

              {error && (
                <p style={styles.error} role="alert">
                  {error}
                </p>
              )}

              {success && (
                <div style={styles.successBox}>
                  <p style={styles.success} role="status">
                    {success}
                  </p>

                  <p style={styles.secondaryText}>
                    Your review will appear on the website after
                    approval.
                  </p>
                </div>
              )}

              {!success && (
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    ...styles.submitButton,
                    opacity: submitting ? 0.7 : 1,
                    cursor: submitting
                      ? "not-allowed"
                      : "pointer"
                  }}
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit Review"}
                </button>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f7f7f7",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 20px",
    boxSizing: "border-box"
  },

  card: {
    width: "100%",
    maxWidth: "650px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "35px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    boxSizing: "border-box"
  },

  title: {
    margin: "0 0 10px",
    color: "#222222",
    fontSize: "28px",
    fontWeight: "700",
    textAlign: "center"
  },

  subtitle: {
    color: "#666666",
    textAlign: "center",
    marginBottom: "30px"
  },

  productBox: {
    backgroundColor: "#f8f8f8",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "28px"
  },

  productName: {
    margin: "5px 0 15px",
    color: "#222222",
    fontSize: "21px"
  },

  customerText: {
    margin: "5px 0",
    color: "#444444"
  },

  orderText: {
    margin: "5px 0 0",
    color: "#777777",
    fontSize: "14px"
  },

  section: {
    marginBottom: "25px"
  },

  label: {
    display: "block",
    marginBottom: "10px",
    color: "#333333",
    fontWeight: "600",
    fontSize: "15px"
  },

  stars: {
    display: "flex",
    gap: "8px",
    alignItems: "center"
  },

  ratingText: {
    marginTop: "8px",
    color: "#777777",
    fontSize: "14px"
  },

  textarea: {
    width: "100%",
    border: "1px solid #dddddd",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "15px",
    fontFamily: "inherit",
    resize: "vertical",
    boxSizing: "border-box",
    outline: "none"
  },

  characterCount: {
    marginTop: "6px",
    textAlign: "right",
    color: "#888888",
    fontSize: "12px"
  },

  photoHelp: {
    color: "#777777",
    fontSize: "13px",
    lineHeight: "1.5",
    margin: "0 0 12px"
  },

  fileInput: {
    width: "100%",
    border: "1px solid #dddddd",
    borderRadius: "8px",
    padding: "12px",
    boxSizing: "border-box",
    fontSize: "14px",
    cursor: "pointer"
  },

  photoPreviewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginTop: "15px"
  },

  photoPreview: {
    border: "1px solid #dddddd",
    borderRadius: "8px",
    padding: "6px",
    overflow: "hidden"
  },

  previewImage: {
    width: "100%",
    height: "110px",
    objectFit: "cover",
    borderRadius: "5px",
    display: "block"
  },

  removePhotoButton: {
    width: "100%",
    border: "none",
    backgroundColor: "#fff0f2",
    color: "#c41230",
    borderRadius: "4px",
    padding: "6px 2px",
    marginTop: "6px",
    fontSize: "11px",
    cursor: "pointer"
  },

  photoCount: {
    color: "#888888",
    fontSize: "12px",
    marginTop: "8px"
  },

  submitButton: {
    width: "100%",
    border: "none",
    borderRadius: "8px",
    padding: "14px",
    backgroundColor: "#df1532",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600"
  },

  error: {
    color: "#d90429",
    backgroundColor: "#fff0f2",
    borderRadius: "6px",
    padding: "12px",
    fontSize: "14px",
    lineHeight: "1.5"
  },

  successBox: {
    backgroundColor: "#eefaf1",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "10px"
  },

  success: {
    color: "#187333",
    fontWeight: "600",
    margin: "0 0 8px"
  },

  secondaryText: {
    color: "#666666",
    fontSize: "14px",
    lineHeight: "1.5"
  },

  message: {
    textAlign: "center",
    color: "#555555"
  }
};

export default ReviewForm;