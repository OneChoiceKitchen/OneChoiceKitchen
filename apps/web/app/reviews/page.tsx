'use client';
import React, { useState, useEffect } from 'react';
import styles from "../page.module.css";
import PageHero from '../components/PageHero';
import { Star } from 'lucide-react';
import { useToast, Button, Card, CardContent } from '@org/ui-design-system';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetch('/api/reviews/public')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setReviews(data);
        } else {
          setReviews([]);
        }
      })
      .catch(err => console.error('Failed to load reviews', err));
  }, []);

  return (
    <div className={styles.main}>
      <PageHero 
        badgeText="Customer Love"
        title={<>What Our <span className={styles.highlight}>Customers Say</span></>}
        subtitle="Real reviews from real food lovers who trust One Choice Kitchen for their daily cravings and tiffins."
      />
      
      <div className={styles.sectionContainer} style={{ padding: '4rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {reviews.map((rev, i) => (
            <Card key={i}>
              <CardContent>
                <div style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #DC2626)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                      {(rev.userName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: 600 }}>{rev.userName || 'Anonymous User'}</h4>
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} size={16} fill={idx < rev.rating ? "#f59e0b" : "transparent"} color={idx < rev.rating ? "#f59e0b" : "#cbd5e1"} />
                  ))}
                </div>
                <p style={{ color: '#475569', lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>
                  "{rev.comment}"
                </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          {!showForm ? (
            <Button size="lg" onClick={() => setShowForm(true)} variant="primary">
              Write a Review
            </Button>
          ) : (
            <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Submit Your Review</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                try {
                  const res = await fetch('/api/reviews', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      userName: formData.get('name'),
                      rating: Number(formData.get('rating')),
                      comment: formData.get('comment')
                    })
                  });
                  if(res.ok) {
                    toast.success('Review submitted! It will appear once approved.');
                    setShowForm(false);
                  } else {
                    toast.error('Failed to submit review.');
                  }
                } catch (err) {
                  toast.error('Error submitting review.');
                }
              }} style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Name</label>
                  <input type="text" name="name" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Rating (1-5)</label>
                  <select name="rating" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Very Good</option>
                    <option value="3">3 - Average</option>
                    <option value="2">2 - Poor</option>
                    <option value="1">1 - Terrible</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Comment</label>
                  <textarea name="comment" rows={4} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}></textarea>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <Button type="submit" variant="primary" style={{ flex: 1 }}>Submit</Button>
                  <Button type="button" variant="secondary" onClick={() => setShowForm(false)} style={{ flex: 1 }}>Cancel</Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}