import React, { useState, useEffect } from 'react';
import { useToast, useConfirm } from '@org/ui-design-system';
import styles from './BlogsAdmin.module.css';

const authHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
  'Content-Type': 'application/json'
});

const DUMMY_BLOGS = [
  { id: 'b1', title: 'Top 5 Healthy Tiffin Recipes for Busy Professionals', slug: 'top-5-healthy-tiffin', category: 'Recipes', author: 'Chef Kumar', content: 'Discover quick, nutritious meals that will keep you energized throughout the workday without spending hours in the kitchen...', featuredImage: '/blogs_image/top-5-healthy-tiffin.png', isActive: true, views: 1240, likes: 345 },
  { id: 'b2', title: 'Why Nutrition Matters in Your Daily Lunch', slug: 'why-nutrition-matters', category: 'Nutrition', author: 'Dr. Sharma', content: 'Nutrition is key to productivity. Learn how balancing your macros at noon can eliminate the dreaded 3 PM slump...', featuredImage: '/blogs_image/why-nutrition-matters.png', isActive: true, views: 890, likes: 120 },
  { id: 'b3', title: 'Our Delivery Fleet Goes 100% Green by 2027', slug: 'green-delivery', category: 'Company News', author: 'Admin', content: 'We are thrilled to announce our commitment to replacing our entire delivery fleet with electric vehicles over the next 4 years...', featuredImage: '/blogs_image/green-delivery.png', isActive: false, views: 45, likes: 12 },
  { id: 'b4', title: 'The Secret Behind Our Famous Butter Chicken', slug: 'secret-butter-chicken', category: 'Recipes', author: 'Chef Raj', content: 'It takes 12 hours to marinate our chicken. Here is a sneak peek into the spices and techniques that make it so rich and creamy...', featuredImage: '/blogs_image/secret-butter-chicken.png', isActive: true, views: 5600, likes: 1240 },
  { id: 'b5', title: 'How to Maximize Your Partner Earnings', slug: 'maximize-partner-earnings', category: 'Business', author: 'Partner Success', content: 'Follow these 3 simple operational tips to double your order volume during peak weekend hours...', featuredImage: '/blogs_image/maximize-partner-earnings.png', isActive: true, views: 3200, likes: 450 },
  { id: 'b6', title: 'Winter Promo: Free Hot Chocolate on Weekends', slug: 'winter-promo', category: 'Offers', author: 'Marketing Team', content: 'Warm up this winter! Use code WINTERHOT on any order above ₹500 on weekends to receive a complimentary rich hot chocolate...', featuredImage: '/blogs_image/winter-promo.png', isActive: true, views: 8900, likes: 2100 },
  { id: 'b7', title: 'The Ultimate Family Feast Guide', slug: 'family-feast-guide', category: 'Lifestyle', author: 'Admin', content: 'Planning a weekend get-together? Our family feast combos take the stress out of hosting. Here is how to order for a crowd...', featuredImage: '/blogs_image/family-feast-guide.png', isActive: true, views: 1100, likes: 89 },
  { id: 'b8', title: 'Midnight Cravings: What to Order at 2 AM', slug: 'midnight-cravings', category: 'Lifestyle', author: 'Late Night Crew', content: 'From spicy noodles to indulgent brownies, here are the most popular items ordered by night owls...', featuredImage: '/blogs_image/midnight-cravings.png', isActive: true, views: 4300, likes: 670 },
  { id: 'b9', title: 'Paneer Tikka: A Vegetarian Grilling Masterclass', slug: 'paneer-tikka', category: 'Recipes', author: 'Chef Kumar', content: 'Grilled to perfection, our paneer tikka is soft inside and charred outside. Learn the basics of tandoori marination...', featuredImage: '/blogs_image/paneer-tikka.png', isActive: true, views: 2100, likes: 340 },
  { id: 'b10', title: 'Corporate Lunches: Making Office Food Great Again', slug: 'corporate-lunches', category: 'Business', author: 'B2B Sales', content: 'We cater to over 50 offices daily. Learn how our customized bulk ordering platform saves time for office managers...', featuredImage: '/blogs_image/corporate-lunches.png', isActive: true, views: 760, likes: 45 }
];

export default function BlogsAdmin() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBlog, setCurrentBlog] = useState<any>(null);
  const toast = useToast();
  const confirmDialog = useConfirm();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      // Mocking API for demo purposes to always showcase the 10 full blogs in UI
      setBlogs(DUMMY_BLOGS);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (blog: any) => {
    setCurrentBlog(blog);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmDialog({ title: 'Delete Blog', message: 'Are you sure you want to delete this blog post?', variant: 'danger' });
    if (ok) {
      // Mock delete
      setBlogs(prev => prev.filter(b => b.id !== id));
      toast.success('Blog deleted');
    }
  };

  const handleCreate = () => {
    setCurrentBlog({
      id: '',
      title: '',
      slug: '',
      category: 'Recipes',
      author: 'Admin',
      content: '',
      featuredImage: '/blogs_image/new-blog.png',
      isActive: true,
      views: 0,
      likes: 0
    });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    // Mock save
    const isNew = !currentBlog.id;
    const savedBlog = { 
      ...currentBlog, 
      id: isNew ? `new_${Date.now()}` : currentBlog.id,
      slug: currentBlog.slug || currentBlog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    };
    
    if (isNew) {
      setBlogs(prev => [savedBlog, ...prev]);
    } else {
      setBlogs(prev => prev.map(b => b.id === currentBlog.id ? savedBlog : b));
    }
    
    toast.success(`Blog ${isNew ? 'created' : 'updated'}`);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.editorContainer}>
          <div className={styles.editorHeader}>
            <h2 className={styles.editorTitle}>{currentBlog.id ? 'Edit Blog Post' : 'Craft New Blog Post'}</h2>
            <button onClick={() => setIsEditing(false)} className={styles.cancelBtn}>Cancel</button>
          </div>
          
          <form onSubmit={handleSave} className={styles.formLayout}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Title</label>
                <input type="text" value={currentBlog.title} onChange={e => setCurrentBlog({...currentBlog, title: e.target.value})} required className={styles.formInput} placeholder="Enter blog title..." />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Slug</label>
                <input type="text" value={currentBlog.slug} onChange={e => setCurrentBlog({...currentBlog, slug: e.target.value})} placeholder="Auto-generated if left empty" className={styles.formInput} />
              </div>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Category</label>
                <select value={currentBlog.category} onChange={e => setCurrentBlog({...currentBlog, category: e.target.value})} className={styles.formSelect}>
                  <option value="Recipes">Recipes</option>
                  <option value="Nutrition">Nutrition</option>
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="Company News">Company News</option>
                  <option value="Business">Business</option>
                  <option value="Offers">Offers</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Author Name</label>
                <input type="text" value={currentBlog.author} onChange={e => setCurrentBlog({...currentBlog, author: e.target.value})} required className={styles.formInput} />
              </div>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Featured Image (Image URL)</label>
                <input type="text" value={currentBlog.featuredImage} onChange={e => setCurrentBlog({...currentBlog, featuredImage: e.target.value})} className={styles.formInput} placeholder="/blogs_image/..." />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" checked={currentBlog.isActive} onChange={e => setCurrentBlog({...currentBlog, isActive: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                  Publish Immediately (Active)
                </label>
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Article Content / Excerpt</label>
              <textarea value={currentBlog.content} onChange={e => setCurrentBlog({...currentBlog, content: e.target.value})} required rows={12} className={styles.formTextarea} style={{ resize: 'vertical' }} placeholder="Write your blog post content here... (Supports Markdown)" />
            </div>
            
            <div>
              <button type="submit" className={styles.saveBtn}>
                {currentBlog.id ? 'Update Blog Post' : 'Publish Blog Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>📝 Manage Blogs</h1>
        <button onClick={handleCreate} className={styles.createBtn}>
          + Create New Blog
        </button>
      </div>

      {loading && blogs.length === 0 ? (
        <div className={styles.emptyState}>Loading blogs...</div>
      ) : (
        <div className={styles.gridContainer}>
          {blogs.map(blog => (
            <div key={blog.id} className={styles.blogCard}>
              <div className={styles.cardImageWrapper}>
                {blog.featuredImage && (blog.featuredImage.startsWith('/') || blog.featuredImage.startsWith('http')) ? (
                  <img 
                    src={blog.featuredImage} 
                    alt={blog.title} 
                    className={styles.cardImage} 
                    onError={(e) => { e.currentTarget.src = '/branding/transparent-logo.png'; e.currentTarget.style.objectFit = 'contain'; e.currentTarget.style.padding = '20px'; }} 
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>{blog.featuredImage || '📝'}</div>
                )}
                <span className={`${styles.cardStatusBadge} ${blog.isActive ? styles.active : styles.draft}`}>
                  {blog.isActive ? 'Active' : 'Draft'}
                </span>
              </div>
              
              <div className={styles.cardContent}>
                <div className={styles.cardCategory}>{blog.category}</div>
                <h3 className={styles.cardTitle} title={blog.title}>{blog.title}</h3>
                <div className={styles.cardAuthor}>By {blog.author}</div>
                <p className={styles.cardExcerpt}>{blog.content}</p>
                
                <div className={styles.cardFooter}>
                  <div className={styles.cardStats}>
                    <span>👀 {blog.views?.toLocaleString() || 0}</span>
                    <span>❤️ {blog.likes?.toLocaleString() || 0}</span>
                  </div>
                  <div className={styles.actionGroup}>
                    <button onClick={() => handleEdit(blog)} className={`${styles.actionBtn} ${styles.edit}`}>Edit</button>
                    <button onClick={() => handleDelete(blog.id)} className={`${styles.actionBtn} ${styles.delete}`}>Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {blogs.length === 0 && (
            <div className={styles.emptyState} style={{ gridColumn: '1 / -1' }}>
              No blogs found. Get writing!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
