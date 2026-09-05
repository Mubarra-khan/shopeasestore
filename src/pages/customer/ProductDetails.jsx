import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getProductById } from '../../api/product.api';
import { getProductReviews, getReviewEligibility, createProductReview } from '../../api/review.api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import MegaCategoryMenu from '../../components/MegaCategoryMenu';
import MessagingPanel from '../../components/MessagingPanel';
import { startProductConversation } from '../../api/chat.api';
import { deleteNotification } from '../../api/notification.api';

export default function ProductDetails() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({ averageRating: 0, reviewCount: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [eligibility, setEligibility] = useState({ eligible: false, reason: '' });
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [lensPosition, setLensPosition] = useState(null);
  const [imageRect, setImageRect] = useState(null);
  const [imageRenderRect, setImageRenderRect] = useState(null);
  const [previewWidth, setPreviewWidth] = useState(0);
  const thumbnailRef = useRef(null);
  const mainImageRef = useRef(null);
  const zoomPreviewRef = useRef(null);
  const location = useLocation();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(1);
  const REVIEWS_PER_PAGE = 4;
  const [messagingOpen, setMessagingOpen] = useState(false);
  const [preselectedChatId, setPreselectedChatId] = useState(null);
  const [chatStarting, setChatStarting] = useState(false);
  const [chatError, setChatError] = useState('');
  const [notificationOrderId, setNotificationOrderId] = useState(null);
  const [notificationOrderItemId, setNotificationOrderItemId] = useState(null);
  const [notificationId, setNotificationId] = useState(null);

  useEffect(() => {
    setReviewsPage(1);
  }, [reviews.length, id]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await getProductById(id);
        const item = response?.data?.data || response?.data;
        setProduct(item);
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load product');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  useEffect(() => {
    setSelectedMediaIndex(0);
  }, [product?._id]);

  useEffect(() => {
    if (location.state?.showReviewForm) {
      setShowReviewForm(true);
      setNotificationOrderId(location.state?.orderId || null);
      setNotificationOrderItemId(location.state?.orderItemId || null);
      setNotificationId(location.state?.notificationId || null);
    }
  }, [location.state?.showReviewForm, location.state?.orderId, location.state?.orderItemId, location.state?.notificationId]);

  useLayoutEffect(() => {
    if (zoomPreviewRef.current) {
      setPreviewWidth(zoomPreviewRef.current.getBoundingClientRect().width);
    }
  }, [isZoomed, product]);

  useEffect(() => {
    setIsZoomed(false);
    setLensPosition(null);
    setImageRect(null);
    setImageRenderRect(null);
  }, [selectedMediaIndex]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      setReviewsLoading(true);
      try {
        const response = await getProductReviews(id);
        const data = response?.data?.data || {};
        setReviews(Array.isArray(data.reviews) ? data.reviews : []);
        setReviewSummary({
          averageRating: Number(data.summary?.averageRating || 0),
          reviewCount: Number(data.summary?.reviewCount || 0),
        });
      } catch {
        // reviews are optional
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [id]);

  useEffect(() => {
    const fetchEligibility = async () => {
      if (!id || !user) {
        setEligibility({ eligible: false, reason: '' });
        return;
      }

      setEligibilityLoading(true);
      try {
        const params = {};
        if (notificationOrderId) params.orderId = notificationOrderId;
        if (notificationOrderItemId) params.orderItemId = notificationOrderItemId;
        const response = await getReviewEligibility(id, params);
        const data = response?.data?.data || {};
        setEligibility({
          eligible: Boolean(data.eligible),
          reason: String(data.reason || ''),
        });
      } catch {
        setEligibility({ eligible: false, reason: '' });
      } finally {
        setEligibilityLoading(false);
      }
    };

    fetchEligibility();
  }, [id, user?._id, notificationOrderId, notificationOrderItemId]);

  const totalPages = Math.max(1, Math.ceil(reviews.length / REVIEWS_PER_PAGE));
  const startIndex = (reviewsPage - 1) * REVIEWS_PER_PAGE;
  const paginatedReviews = reviews.slice(startIndex, startIndex + REVIEWS_PER_PAGE);

  const handleAddToCart = async () => {
    if (!product || product.stock <= 0) return;
    const requested = Number(quantity) || 1;

    if (requested > product.stock) {
      setError(`Only ${product.stock} item(s) available in stock.`);
      return;
    }

    setAdding(true);
    const ok = await addItem(product._id, requested);
    setAdding(false);

    if (!ok) {
      setError('Unable to add product to cart');
    } else {
      alert('Item added to cart');
    }
  };

  const handleChatNow = async () => {
    if (!product?.seller?._id) return;

    setChatStarting(true);
    setChatError('');
    try {
      const response = await startProductConversation(product._id, 'Hello, I am interested in this product.');
      const chat = response?.data?.data;
      if (chat?._id) {
        setPreselectedChatId(chat._id);
        setMessagingOpen(true);
      }
    } catch (err) {
      setChatError(err?.response?.data?.message || 'Unable to start conversation');
    } finally {
      setChatStarting(false);
    }
  };

  const handleOpenMessages = () => {
    setPreselectedChatId(null);
    setMessagingOpen(true);
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      setReviewError('Please login to submit a review');
      return;
    }

    setSubmittingReview(true);
    setReviewError('');

    try {
      const payload = {
        rating: Number(reviewRating),
        comment: reviewComment.trim(),
      };
      if (notificationOrderId) payload.orderId = notificationOrderId;
      if (notificationOrderItemId) payload.orderItemId = notificationOrderItemId;

      const response = await createProductReview(id, payload);
      const newReview = response?.data?.data;
      if (newReview) {
        setReviews((current) => [newReview, ...current]);
        setReviewSummary((current) => ({
          averageRating: Number(((current.averageRating * current.reviewCount + Number(reviewRating)) / (current.reviewCount + 1)).toFixed(2)),
          reviewCount: current.reviewCount + 1,
        }));
        setReviewComment('');
        setReviewRating(5);
        if (notificationId) {
          try {
            await deleteNotification(notificationId);
          } catch {
            // ignore cleanup errors
          }
        }
        setNotificationOrderId(null);
        setNotificationOrderItemId(null);
        setNotificationId(null);
        window.dispatchEvent(new Event('notifications:changed'));
      }
    } catch (err) {
      setReviewError(err?.response?.data?.message || 'Unable to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const mediaItems = useMemo(() => {
    if (!product) return [];
    const normalizeProductImage = (url) => {
      if (!url || typeof url !== 'string') return url;
      if (url.startsWith('http://localhost:5000/uploads/')) {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const origin = apiUrl.replace(/\/api\/?$/, '');
        return url.replace('http://localhost:5000', origin);
      }
      return url;
    };
    const items = [];
    if (product.image) {
      items.push({ type: 'image', url: normalizeProductImage(product.image) });
    }
    (product.images || []).forEach((url) => {
      if (url && url !== product.image) {
        items.push({ type: 'image', url: normalizeProductImage(url) });
      }
    });
    (product.productVideos || []).forEach((url) => {
      if (url) {
        items.push({ type: 'video', url: normalizeProductImage(url) });
      }
    });
    return items;
  }, [product]);

  const currentMedia = mediaItems[selectedMediaIndex] || null;
  const isVideo = currentMedia?.type === 'video';

  const LENS_SIZE = 100;
  const ZOOM_LEVEL = 3;
  const ZOOM_PREVIEW_HEIGHT = 400;

  const computeImageRenderRect = (naturalWidth, naturalHeight, containerWidth, containerHeight) => {
    if (!naturalWidth || !naturalHeight || !containerWidth || !containerHeight) return null;
    const imageAspect = naturalWidth / naturalHeight;
    const containerAspect = containerWidth / containerHeight;
    let renderWidth, renderHeight, offsetX, offsetY;
    if (imageAspect > containerAspect) {
      renderWidth = containerWidth;
      renderHeight = containerWidth / imageAspect;
      offsetX = 0;
      offsetY = (containerHeight - renderHeight) / 2;
    } else {
      renderHeight = containerHeight;
      renderWidth = containerHeight * imageAspect;
      offsetX = (containerWidth - renderWidth) / 2;
      offsetY = 0;
    }
    return { width: renderWidth, height: renderHeight, x: offsetX, y: offsetY };
  };

  const handleImageLoad = () => {
    if (!mainImageRef.current || !imageRect) return;
    const { naturalWidth, naturalHeight } = mainImageRef.current;
    if (naturalWidth && naturalHeight) {
      setImageRenderRect(computeImageRenderRect(naturalWidth, naturalHeight, imageRect.width, imageRect.height));
    }
  };

  const handleMouseMove = (e) => {
    if (!isVideo) {
      const rect = e.currentTarget.getBoundingClientRect();
      let x = e.clientX - rect.left;
      let y = e.clientY - rect.top;

      if (imageRenderRect) {
        x = Math.max(imageRenderRect.x, Math.min(x, imageRenderRect.x + imageRenderRect.width));
        y = Math.max(imageRenderRect.y, Math.min(y, imageRenderRect.y + imageRenderRect.height));
      } else {
        const clampedX = Math.max(0, Math.min(x, rect.width));
        const clampedY = Math.max(0, Math.min(y, rect.height));
        x = clampedX;
        y = clampedY;
      }

      const lensX = Math.max(0, Math.min(x - LENS_SIZE / 2, rect.width - LENS_SIZE));
      const lensY = Math.max(0, Math.min(y - LENS_SIZE / 2, rect.height - LENS_SIZE));

      setLensPosition({ x: lensX, y: lensY });
      setZoomPosition({ x, y });
      setImageRect(rect);

      if (mainImageRef.current) {
        const { naturalWidth, naturalHeight } = mainImageRef.current;
        if (naturalWidth && naturalHeight) {
          setImageRenderRect(computeImageRenderRect(naturalWidth, naturalHeight, rect.width, rect.height));
        }
      }
    }
  };

  if (loading) return <p>Loading product...</p>;
  if (error) return <div><p style={{ color: 'crimson' }}>{error}</p><Link to="/products">Back to products</Link></div>;
  if (!product) return <p>Product not found.</p>;

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(<span key={i} style={{ color: i <= rating ? '#f59e0b' : '#d1d5db' }}>★</span>);
    }
    return stars;
  };

  const scrollThumbnails = (direction) => {
    if (thumbnailRef.current) {
      const scrollAmount = 200;
      thumbnailRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const goToPrevious = () => {
    setSelectedMediaIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setSelectedMediaIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
  };

  return (
    <div>
      <MegaCategoryMenu />
      <Link to="/products">← Back to products</Link>
      <div style={{ width: '80%', padding: '0 1.5rem 0 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 0.7fr) minmax(320px, 1.3fr)', gap: '2rem', marginTop: '1.5rem', alignItems: 'start' }}>
        <div>
          <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb', background: '#fff' }}>
            {isVideo ? (
              <video
                src={currentMedia.url}
                controls
                preload="metadata"
                style={{ width: '100%', maxHeight: 260, objectFit: 'contain', display: 'block' }}
              />
            ) : (
              <div
                style={{ position: 'relative', overflow: 'hidden', cursor: 'zoom-in', background: '#fff' }}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => {
                  setIsZoomed(false);
                  setLensPosition(null);
                  setImageRect(null);
                  setImageRenderRect(null);
                }}
                onMouseMove={handleMouseMove}
              >
                <img
                  ref={mainImageRef}
                  src={currentMedia?.url}
                  alt={product.name}
                  onLoad={handleImageLoad}
                  style={{
                    width: '100%',
                    maxHeight: 260,
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
                {!isVideo && isZoomed && lensPosition && (
                  <div
                    style={{
                      position: 'absolute',
                      width: LENS_SIZE,
                      height: LENS_SIZE,
                      border: '1px solid rgba(0,0,0,0.3)',
                      background: 'rgba(255,255,255,0.15)',
                      pointerEvents: 'none',
                      zIndex: 3,
                      left: lensPosition.x,
                      top: lensPosition.y,
                      transition: 'none',
                    }}
                  />
                )}
              </div>
            )}
            {mediaItems.length > 1 && (
              <>
                <button type="button" onClick={goToPrevious} style={{ position: 'absolute', top: '50%', left: 8, transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: '1px solid #e5e7eb', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: '1rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>‹</button>
                <button type="button" onClick={goToNext} style={{ position: 'absolute', top: '50%', right: 8, transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: '1px solid #e5e7eb', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: '1rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>›</button>
              </>
            )}
          </div>

          {mediaItems.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => scrollThumbnails('left')}
                style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >‹</button>
              <div ref={thumbnailRef} style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', flex: 1, padding: '2px', scrollbarWidth: 'thin' }}>
                {mediaItems.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedMediaIndex(index)}
                    onMouseEnter={() => setSelectedMediaIndex(index)}
                    style={{
                      background: 'transparent',
                      border: selectedMediaIndex === index ? '2px solid #f97316' : '1px solid #e5e7eb',
                      borderRadius: 6,
                      padding: 0,
                      cursor: 'pointer',
                      flexShrink: 0,
                      width: 64,
                      height: 64,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {item.type === 'video' ? (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', position: 'relative' }}>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                          <span style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700 }}>▶</span>
                        </div>
                      </div>
                    ) : (
                      <img src={item.url} alt={`${product.name} ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    )}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => scrollThumbnails('right')}
                style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >›</button>
            </div>
          )}
        </div>

        <div>
          <div style={{ minHeight: isZoomed && !isVideo && imageRect ? ZOOM_PREVIEW_HEIGHT : 'auto', marginBottom: '1rem' }}>
            {isZoomed && !isVideo && imageRect ? (
              <div
                ref={zoomPreviewRef}
                style={{
                  width: '100%',
                  height: ZOOM_PREVIEW_HEIGHT,
                  backgroundImage: `url(${currentMedia.url})`,
                  backgroundSize: `${(imageRenderRect?.width || imageRect.width) * ZOOM_LEVEL}px ${(imageRenderRect?.height || imageRect.height) * ZOOM_LEVEL}px`,
                  backgroundPosition: `${(previewWidth / 2) - (zoomPosition.x - (imageRenderRect?.x || 0)) * ZOOM_LEVEL}px ${ZOOM_PREVIEW_HEIGHT / 2 - (zoomPosition.y - (imageRenderRect?.y || 0)) * ZOOM_LEVEL}px`,
                  backgroundRepeat: 'no-repeat',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  overflow: 'hidden',
                }}
              />
            ) : (
              <div>
                <h2 style={{ fontWeight: 600, maxWidth: '70%' }}>{product.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '1.25rem', letterSpacing: 1, color: '#f59e0b', display: 'inline-flex' }}>
                    {renderStars(Math.round(reviewSummary.averageRating))}
                  </div>
                  <span style={{ color: '#38bdf8', fontWeight: 400 }}>
                    {reviewSummary.reviewCount > 0
                      ? `${reviewSummary.averageRating.toFixed(1)} (${reviewSummary.reviewCount} review${reviewSummary.reviewCount === 1 ? '' : 's'})`
                      : 'No rating'}
                  </span>
                </div>
                {product.brand && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.875rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Brand: </span>
                    <span style={{ color: '#38bdf8', fontWeight: 400 }}>{product.brand}</span>
                  </div>
                )}
                {product.color && (
                  <div style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#374151' }}>Color: {product.color}</div>
                )}
              </div>
            )}
          </div>

          {product.originalPrice && product.originalPrice > product.price ? (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap' }}>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#dc2626', margin: 0 }}>$ {Number(product.price).toFixed(2)}</p>
              <p style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: '1rem', margin: 0 }}>$ {Number(product.originalPrice).toFixed(2)}</p>
              <span style={{ background: '#dc2626', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600 }}>
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </span>
            </div>
          ) : (
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>$ {Number(product.price).toFixed(2)}</p>
          )}
          <p style={{ color: product.stock > 0 ? '#16a34a' : '#dc2626' }}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>
          <p style={{ color: '#475569' }}>Sold by: {product.seller?.name || 'Seller'}</p>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', margin: '1.5rem 0' }}>
            <label>
              Quantity
              <input
                type="number"
                min="1"
                max={product.stock || 1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock || 1, Number(e.target.value) || 1)))}
                style={{ width: 90, marginLeft: 8 }}
              />
            </label>
            <button type="button" disabled={product.stock <= 0 || adding} onClick={handleAddToCart}>
              {adding ? 'Adding...' : product.stock > 0 ? 'Add to cart' : 'Out of stock'}
            </button>
          </div>


        </div>
        </div>
        {product?.seller?._id && (
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleChatNow}
              disabled={chatStarting}
              style={{ background: '#111827', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: 8, cursor: chatStarting ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
            >
              {chatStarting ? 'Starting chat...' : 'Chat Now'}
            </button>
            {chatError && <p style={{ color: 'crimson', fontSize: '0.8rem', marginLeft: '0.75rem' }}>{chatError}</p>}
          </div>
        )}
        {product.description && (
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12 }}>
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.1rem', fontWeight: 700 }}>Product Description</h3>
            <div
              style={{
                maxHeight: descriptionExpanded ? 'none' : '20em',
                overflow: 'hidden',
                transition: 'max-height 0.3s ease',
              }}
            >
              <p style={{ margin: 0, lineHeight: 1.7, color: '#374151', whiteSpace: 'pre-wrap' }}>{product.description}</p>
              {(product.descriptionImages || []).length > 0 && (
                <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem', gridTemplateColumns: '1fr' }}>
                  {(product.descriptionImages || []).map((url, index) => {
                    const normalizedUrl = (!url || typeof url !== 'string') ? url : (url.startsWith('http://localhost:5000/uploads/') ? (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '') + url.slice('http://localhost:5000'.length) : url);
                    return <img key={index} src={normalizedUrl} alt={`Description ${index + 1}`} style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 8, border: '1px solid #e5e7eb' }} />;
                  })}
                </div>
              )}
              {(() => {
                const specs = [
                  ['Brand', product.brand],
                  ['Colour', product.color],
                  ['Material', product.material],
                  ['Age', product.age],
                  ['Service', product.service],
                  ['Promotion', product.promotion],
                  ['Delivery from', product.deliveryFrom],
                  ['Warranty type', product.warrantyType],
                  ['Warranty period', product.warrantyPeriod],
                  ['Storage requirement', product.storageRequirement],
                ].filter(([, value]) => value && String(value).trim());

                if (specs.length === 0) return null;

                return (
                  <div style={{ marginTop: '2rem' }}>
                    <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.1rem', fontWeight: 700 }}>Product Specifications</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                      {specs.map(([label, value]) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                          <span style={{ color: '#64748b', fontSize: '0.875rem' }}>{label}</span>
                          <span style={{ color: '#111827', fontSize: '0.875rem', fontWeight: 600, textAlign: 'right' }}>{String(value).trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
            {(product.description.length > 200 || (product.descriptionImages || []).length > 0 || [product.brand, product.color, product.material, product.age, product.service, product.promotion, product.deliveryFrom, product.warrantyType, product.warrantyPeriod, product.storageRequirement].some((value) => value && String(value).trim())) && (
              <button type="button" onClick={() => setDescriptionExpanded((prev) => !prev)} style={{ background: 'transparent', border: 'none', color: '#f97316', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', padding: '0.5rem 0', marginTop: '0.5rem' }}>
                {descriptionExpanded ? 'Show Less' : 'Show More'}
              </button>
            )}
          </div>
        )}
        <div style={{ marginTop: '2rem', padding: '1rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12 }}>
          <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>Customer reviews</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '1.5rem', letterSpacing: 2 }}>{renderStars(Math.round(reviewSummary.averageRating))}</div>
            <div>
              <strong>{reviewSummary.averageRating.toFixed(1)}</strong>
              <span style={{ color: '#64748b', marginLeft: 8 }}>{reviewSummary.reviewCount} review{reviewSummary.reviewCount === 1 ? '' : 's'}</span>
            </div>
          </div>

          {reviewsLoading ? (
            <p style={{ color: '#64748b' }}>Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p style={{ color: '#64748b' }}>No reviews yet. Be the first to review this product.</p>
          ) : (
            <>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {paginatedReviews.map((review) => (
                  <div key={review._id} style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '0.875rem' }}>{review.user?.name || 'Customer'}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#f59e0b', marginBottom: '0.25rem' }}>{renderStars(review.rating)}</div>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155', whiteSpace: 'pre-wrap' }}>{review.comment}</p>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setReviewsPage((p) => Math.max(1, p - 1))}
                    disabled={reviewsPage === 1}
                    style={{ padding: '0.35rem 0.75rem', borderRadius: 6, border: '1px solid #e2e8f0', background: reviewsPage === 1 ? '#f1f5f9' : '#fff', cursor: reviewsPage === 1 ? 'not-allowed' : 'pointer', color: '#111827', fontSize: '0.875rem' }}
                  >
                    &lt;
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setReviewsPage(page)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: 6,
                        border: '1px solid #e2e8f0',
                        background: page === reviewsPage ? '#111827' : '#fff',
                        color: page === reviewsPage ? '#fff' : '#111827',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: page === reviewsPage ? 600 : 400,
                      }}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setReviewsPage((p) => Math.min(totalPages, p + 1))}
                    disabled={reviewsPage === totalPages}
                    style={{ padding: '0.35rem 0.75rem', borderRadius: 6, border: '1px solid #e2e8f0', background: reviewsPage === totalPages ? '#f1f5f9' : '#fff', cursor: reviewsPage === totalPages ? 'not-allowed' : 'pointer', color: '#111827', fontSize: '0.875rem' }}
                  >
                    &gt;
                  </button>
                </div>
              )}
            </>
          )}

          {showReviewForm && (
          <div style={{ marginTop: '1.25rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Write a review</h4>
            {!user ? (
              <p style={{ fontSize: '0.875rem', color: '#64748b' }}><Link to="/login">Login</Link> to write a review.</p>
            ) : eligibilityLoading ? (
              <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Checking review eligibility...</p>
            ) : !eligibility.eligible ? (
              <p style={{ fontSize: '0.875rem', color: '#64748b' }}>{eligibility.reason || 'You can review this product after your order has been delivered.'}</p>
            ) : (
              <form onSubmit={handleReviewSubmit}>
                {reviewError ? <p style={{ color: 'crimson', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{reviewError}</p> : null}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.875rem' }}>Rating</label>
                  <select value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))} style={{ padding: '0.4rem', borderRadius: 6, border: '1px solid #d8e2dc' }}>
                    {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} ★</option>)}
                  </select>
                </div>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  required
                  placeholder="Share your experience with this product"
                  style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #d8e2dc', borderRadius: 8, padding: '0.75rem', font: 'inherit', marginBottom: '0.75rem' }}
                />
                <button type="submit" disabled={submittingReview || !reviewComment.trim()} style={{ background: '#111827', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: 8, cursor: submittingReview ? 'not-allowed' : 'pointer' }}>
                  Submit review
                </button>
              </form>
            )}
          </div>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={handleOpenMessages}
        style={{ position: 'fixed', bottom: 20, right: 20, padding: '0.75rem 1.25rem', borderRadius: 28, background: '#F85606', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, zIndex: 9998, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        aria-label="Messages"
      >
        <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>💬</span>
        <span>Messages</span>
      </button>
      <MessagingPanel open={messagingOpen} onClose={() => setMessagingOpen(false)} product={product} preselectedChatId={preselectedChatId} />
    </div>
  );
}
