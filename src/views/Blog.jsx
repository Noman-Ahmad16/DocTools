import React, { useState, useEffect } from 'react';
import { Calendar, Tag, ChevronRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/blog')
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback for demo
        setPosts([
          { id: '1', title: 'Top 10 PDF Productivity Tips', category: 'PDF Guide', date: new Date().toISOString(), content: 'Learn how to master your PDF workflow...', image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800' },
          { id: '2', title: 'How to use OCR to extract text from images', category: 'OCR', date: new Date().toISOString(), content: 'OCR technology has come a long way...', image: 'https://images.unsplash.com/photo-1562564055-71e051d33c19?w=800' }
        ]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>DocTools Blog</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Insights, tutorials, and tips to master your documents.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2.5rem' }}>
        {posts.map(post => (
          <div key={post.id} className="glass-card tool-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
             <img src={post.image} alt={post.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
             <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                   <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Tag size={14}/> {post.category}</span>
                   <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Calendar size={14}/> {new Date(post.date).toLocaleDateString()}</span>
                </div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', lineHeight: '1.4' }}>{post.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', flex: 1 }}>{post.content.substring(0, 120)}...</p>
                <button className="btn btn-secondary" style={{ width: 'fit-content' }}>Read More <ChevronRight size={18}/></button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blog;
