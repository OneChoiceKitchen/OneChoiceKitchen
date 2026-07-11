'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { DEFAULT_BLOGS } from '../../components/GlobalTopContent';
import styles from './page.module.css';

// Utility to generate a slug from a title to match incoming params
const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

export default function BlogPost() {
  const params = useParams();
  const slug = params?.slug as string;
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const localBlogs = localStorage.getItem('saas_blogs');
    const loadedBlogs = localBlogs ? JSON.parse(localBlogs) : DEFAULT_BLOGS;
    
    // Attempt to match the blog by checking if its title slugifies to the param, 
    // or if the hardcoded link matches the slug.
    const foundBlog = loadedBlogs.find((b: any) => {
      const titleSlug = slugify(b.title);
      return titleSlug === slug || b.link === `/blogs/${slug}` || b.link === `/blog/${slug}` || b.id === slug;
    });
    
    setBlog(foundBlog);
    setLoading(false);
  }, [slug]);

  if (loading) return <div className={styles.loading}>Loading article...</div>;

  if (!blog) return (
    <div className={styles.notFound}>
      <h2>Article Not Found</h2>
      <p>The blog post you're looking for doesn't seem to exist.</p>
      <Link href="/" className={styles.backBtn}>Return Home</Link>
    </div>
  );

  return (
    <div className={styles.blogPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/" className={styles.backLink}>← Back to Home</Link>
          <h1 className={styles.title}>{blog.title}</h1>
          <div className={styles.authorMeta}>
            <img src={blog.authorImage} alt={blog.author} className={styles.avatar} />
            <div className={styles.authorDetails}>
              <span className={styles.authorName}>Written by {blog.author}</span>
              <span className={styles.date}>{blog.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        <div className={styles.content}>
          <p className={styles.leadParagraph}>{blog.desc}</p>
          <div className={styles.divider}></div>
          <p className={styles.paragraph}>
            This is a placeholder for the full article content. In a complete production environment, this section would be populated with rich HTML from your Content Management System (CMS), allowing you to include embedded videos, high-resolution food photography, and formatted recipes.
          </p>
          <p className={styles.paragraph}>
            This dynamic page demonstrates the successful routing and architecture required to display a single blog post using SEO-friendly URL slugs (`/blogs/[title-of-the-blog]`). The routing engine correctly extracts the slug from the URL and fetches the corresponding article data seamlessly.
          </p>
          <div className={styles.highlightBox}>
            <strong>Enjoying this content?</strong> Subscribe to our daily tiffin plans to get fresh, hygienic, home-cooked food delivered straight to your door while you read!
          </div>
        </div>
      </div>
    </div>
  );
}
