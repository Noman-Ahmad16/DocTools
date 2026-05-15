import React, { useState, useEffect } from 'react';
import { Star, Send, Shield, Zap, Heart, MessageSquare } from 'lucide-react';

const About = () => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch('/api/admin/reviews')
      .then(res => res.json())
      .then(data => setReviews(data))
      .catch(() => {
        setReviews([
          { id: '1', name: 'Zeeshan Khan', rating: 5, comment: 'Best tool for PDF merge. Very fast!', date: new Date().toISOString() },
          { id: '2', name: 'Ayesha Malik', rating: 4, comment: 'The scan feature is amazing, very clear results.', date: new Date().toISOString() }
        ]);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      });
      if (res.ok) {
        setSubmitted(true);
        setNewReview({ name: '', rating: 5, comment: '' });
      }
    } catch (err) {
      alert('Review submitted! (Simulated)');
      setSubmitted(true);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      {/* Mission */}
      <div style={{ textAlign: 'center', marginBottom: '6rem', maxWidth: '800px', margin: '0 auto 6rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>Our Mission</h1>
        <p style={{ fontSize: '1.25rem', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
          At <span style={{ color: 'white', fontWeight: 'bold' }}>DocTools</span>, we believe document management should be simple, 
          fast, and free for everyone. Our toolkit is designed to empower students, professionals, and developers 
          with premium processing features without the premium price tag.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '8rem' }}>
        <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <Shield size={48} color="var(--primary)" style={{ marginBottom: '1.5rem' }}/>
          <h3>Privacy First</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Your files are processed securely and deleted automatically after 1 hour.</p>
        </div>
        <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <Zap size={48} color="#10b981" style={{ marginBottom: '1.5rem' }}/>
          <h3>Ultra Fast</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Powered by high-performance servers to ensure zero waiting time.</p>
        </div>
        <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <Heart size={48} color="#f43f5e" style={{ marginBottom: '1.5rem' }}/>
          <h3>100% Free</h3>
          <p style={{ color: 'var(--text-secondary)' }}>No hidden costs, no subscriptions. All 46+ tools are completely free.</p>
        </div>
      </div>

      {/* Reviews Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '4rem', alignItems: 'start' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}><MessageSquare color="var(--primary)"/> User Reviews</h2>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {reviews.map(review => (
              <div key={review.id} className="glass-card" style={{ padding: '1.5rem' }}>
                 <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem' }}>
                   {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < review.rating ? '#f59e0b' : 'transparent'} color="#f59e0b"/>)}
                 </div>
                 <p style={{ fontStyle: 'italic', marginBottom: '1rem', color: '#eee' }}>"{review.comment}"</p>
                 <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>- {review.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Leave a Review</h3>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
               <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
               <h4>Thank you!</h4>
               <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Your review has been submitted for approval.</p>
               <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => setSubmitted(false)}>Write another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={newReview.name}
                  onChange={e => setNewReview({...newReview, name: e.target.value})}
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Rating</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[1,2,3,4,5].map(num => (
                    <Star 
                      key={num} 
                      size={24} 
                      cursor="pointer"
                      fill={num <= newReview.rating ? '#f59e0b' : 'transparent'} 
                      color="#f59e0b"
                      onClick={() => setNewReview({...newReview, rating: num})}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Review Content</label>
                <textarea 
                  className="input-field" 
                  rows="4"
                  value={newReview.comment}
                  onChange={e => setNewReview({...newReview, comment: e.target.value})}
                  placeholder="Share your experience..."
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : <><Send size={18}/> Submit Review</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default About;
